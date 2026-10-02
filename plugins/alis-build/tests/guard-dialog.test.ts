import { describe, expect, test, tier } from 'claude-code/testing'

import { approvedCalls } from '../hooks/mod/deploy-dialog'
import { confirmGuarded, guardQuestionOf, isDestructive, REFUSE_REASON } from '../hooks/mod/guard-dialog'
import { fakeHost } from './fixtures/fake-host'

tier('user')

const envelope = (command: string) => ({ tool: 'Bash', tool_use_id: 't9', command })
const ran = async () => ({ result: 'ran' })

describe('guard-dialog', () => {
  test('isDestructive names uninstalls and environment destroys and unsets only', () => {
    expect(isDestructive('alis blocks uninstall acme.x --approve')).toBe(true)
    expect(isDestructive('alis environment destroy acme.sm -e dev')).toBe(true)
    expect(isDestructive('alis environment unset acme.sm KEY -e dev')).toBe(true)
    expect(isDestructive('alis build acme.sm.x.v1 --approve')).toBe(false)
    expect(isDestructive('alis environment list acme.sm --json')).toBe(false)
    expect(isDestructive('alis blocks uninstall $(evil)')).toBe(false)
  })

  test('a plain --approve or --yes runs without a dialog: the explicit request is the approval', async () => {
    const host = fakeHost()
    for (const command of ['alis build acme.sm.x.v1 --json --async --approve', 'alis deploy acme.sm.x.v1 -e dev --approve', 'alis define acme.sm.x.v1 --yes', 'ls', 'alis operations list --json']) {
      expect(await confirmGuarded(host, envelope(command), ran)).toEqual({ result: 'ran' })
    }
    expect(host.asks).toEqual([])
    expect(approvedCalls.has('t9')).toBe(false)
  })

  test('a destructive command or a reveal asks first; Approve runs it once without the native prompt', async () => {
    for (const [command, words] of [
      ['alis blocks uninstall acme.x --approve', 'cannot be undone'],
      ['alis environment destroy acme.sm -e dev', 'cannot be undone'],
      ['alis environment variables acme.sm -e dev --reveal --json', 'secret values'],
    ] as const) {
      const host = fakeHost()
      host.askAnswer = 'Approve'
      expect(await confirmGuarded(host, envelope(command), ran)).toEqual({ result: 'ran' })
      expect(host.asks).toHaveLength(1)
      expect(host.asks[0]?.question).toContain(words)
      expect(host.asks[0]?.question).toContain(command)
      expect(approvedCalls.delete('t9')).toBe(true)
    }
  })

  test('Abort or a dismissed dialog refuses the call, and nothing is approved', async () => {
    for (const answer of ['Abort', new Error('dismissed')]) {
      const host = fakeHost()
      host.askAnswer = answer
      let called = false
      const outcome = await confirmGuarded(host, envelope('alis blocks uninstall acme.x'), async () => {
        called = true
        return { result: 'ran' }
      })
      expect(outcome).toEqual({ deny: REFUSE_REASON })
      expect(called).toBe(false)
      expect(approvedCalls.has('t9')).toBe(false)
    }
  })

  test('where nothing draws the gate keeps its native ask; a production deploy keeps its own question', async () => {
    const headless = fakeHost()
    headless.drawn = null
    expect(await confirmGuarded(headless, envelope('alis blocks uninstall acme.x'), ran)).toEqual({ result: 'ran' })
    expect(headless.asks).toEqual([])

    const host = fakeHost({ answer: () => ({ exitCode: 0, stdout: '{"environments":[]}', stderr: '' }) })
    host.askAnswer = 'Abort'
    await confirmGuarded(host, envelope('alis deploy acme.sm.x.v1 -e prod --json --confirm-production'), ran)
    expect(host.asks[0]?.question).toStartWith('Deploy acme.sm.x.v1')
    expect(guardQuestionOf('x', true)).not.toBe(guardQuestionOf('x', false))
  })
})
