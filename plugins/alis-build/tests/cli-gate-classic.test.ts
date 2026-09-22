import { describe, expect, test, tier } from 'claude-code/testing'

import { classicState } from '../hooks/mod/classic'
import { cliGateClassic, HEALTH_FILE } from '../hooks/mod/cli-gate-classic'
import { PLUGIN_VERSION } from '../hooks/mod/meta'
import { fakeHost } from './fixtures/fake-host'

tier('user')

/** A classic.PreToolUse event: the Bash arguments plus tool and tool_use_id. */
function envelope(command: string, extra: Record<string, unknown> = {}) {
  return { tool: 'Bash', tool_use_id: 'toolu_1', command, timeout: 120000, ...extra }
}

const which = () => ({ exitCode: 0, stdout: '/usr/local/bin/alis\n', stderr: '' })

describe('cli-gate-classic', () => {
  test('an allowed alis command is rewritten, observed, and merged over the chain beneath', async () => {
    classicState.permissionMode = 'auto'
    const host = fakeHost({ answer: which })
    const seen: unknown[] = []
    const next = async (e: unknown) => {
      seen.push(e)
      return { additionalContext: ['from beneath'] }
    }

    const result = await cliGateClassic(host, envelope("alis ask 'private text example' --json"), next)

    expect(result).toEqual({
      allow: true,
      updatedInput: { command: "alis ask 'private text example' --json --session-id session-a", timeout: 120000 },
      additionalContext: ['from beneath'],
    })
    expect(seen).toHaveLength(1)
    expect(host.writes).toHaveLength(1)
    expect(host.writes[0]?.path).toBe(`/h/.alis/${HEALTH_FILE}`)
    const record = JSON.parse(host.writes[0]?.text ?? '{}')
    expect(record).toMatchObject({
      root: '/p',
      version: PLUGIN_VERSION,
      cliPath: '/usr/local/bin/alis',
      permissionMode: 'auto',
      approvalSource: 'native-confirmation-and-cli-tier',
    })
    expect(typeof record.observedAt).toBe('string')
    expect(host.writes[0]?.text).not.toContain('private text')
    expect(host.runs.map(r => r.argv)).toEqual([['/usr/bin/which', 'alis']])
  })

  test('a command that is not an alis line passes through untouched and unobserved', async () => {
    const host = fakeHost()
    const below = { ask: 'someone else asked' }
    const result = await cliGateClassic(host, envelope('echo hello'), async () => below)
    expect(result).toBe(below)
    expect(host.writes).toEqual([])
  })

  test('plan mode denies a state change and the allowlist reads the environment', async () => {
    const host = fakeHost({ env: { HOME: '/h', ALIS_ALLOWED_SUBCMDS: 'context doctor' } })
    classicState.permissionMode = 'plan'
    expect(await cliGateClassic(host, envelope('alis build x --json'), async () => ({}))).toMatchObject({ deny: expect.any(String) })
    classicState.permissionMode = 'default'
    expect(await cliGateClassic(host, envelope('alis build x --json'), async () => ({}))).toEqual({})
    expect(await cliGateClassic(host, envelope('alis doctor --json'), async () => ({}))).toMatchObject({ allow: true })
  })

  test('a deny from beneath outranks this hook, and a failed observation changes nothing', async () => {
    classicState.permissionMode = 'auto'
    const host = fakeHost({ writeError: new Error('disk full'), answer: () => new Error('no which') })
    const result = await cliGateClassic(host, envelope('alis whoami --json'), async () => ({ deny: 'claimed by handoff' }))
    expect(result).toMatchObject({ deny: 'claimed by handoff' })
    expect(result).not.toHaveProperty('allow')
    expect(host.logs.some(l => l.includes('disk full'))).toBe(true)
  })

  test('without HOME nothing is written; without a known mode the record says so', async () => {
    delete classicState.permissionMode
    const host = fakeHost({ env: {} })
    expect(await cliGateClassic(host, envelope('alis whoami --json'), async () => ({}))).toMatchObject({ allow: true })
    expect(host.writes).toEqual([])
    const observed = fakeHost()
    await cliGateClassic(observed, envelope('alis whoami --json'), async () => ({}))
    expect(JSON.parse(observed.writes[0]?.text ?? '{}')).toMatchObject({ permissionMode: 'unknown' })
  })

  test('the session id is only inserted when the engine has one', async () => {
    classicState.permissionMode = 'auto'
    const host = fakeHost({ session: '' })
    host.sessionId = async () => {
      throw new Error('no session')
    }
    const result = await cliGateClassic(host, envelope('alis whoami --json'), async () => ({}))
    expect(result).toEqual({ allow: true })
  })
})
