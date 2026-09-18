import { describe, expect, test, tier } from 'claude-code/testing'

import { classicState } from '../hooks/mod/classic'
import { suggestSkills } from '../hooks/mod/suggest'
import { suggestBand } from '../hooks/mod/suggest-band'
import { fakeHost } from './fixtures/fake-host'

tier('user')

const envelope = (context: string) =>
  JSON.stringify({ hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: context } })
const prompt = (text: string) => ({ text, wait: false, origin: { kind: 'composer' as const } })
const passthrough = async (e: { text: string; context?: readonly string[] }) => ({ text: e.text, context: e.context })

describe('suggest', () => {
  test('outside a workspace only wake words reach the CLI', async () => {
    const host = fakeHost({ answer: () => ({ exitCode: 0, stdout: envelope('a skill'), stderr: '' }) })
    host.dir = '/plain/project'
    expect(await suggestSkills(host, prompt('add an endpoint'), passthrough)).toEqual({ text: 'add an endpoint', context: undefined })
    expect(host.runs).toHaveLength(0)
    expect(await suggestSkills(host, prompt('alis, add an endpoint'), passthrough)).toEqual({ text: 'alis, add an endpoint', context: ['a skill'] })
    expect(host.runs).toHaveLength(1)
    host.env['ALIS_SUGGEST_ALWAYS'] = '1'
    await suggestSkills(host, prompt('add an endpoint'), passthrough)
    expect(host.runs).toHaveLength(2)
  })

  test('inside a workspace the CLI gets a classic-shaped payload and its context is attached', async () => {
    classicState.permissionMode = 'plan'
    const host = fakeHost({ answer: () => ({ exitCode: 0, stdout: envelope('Possibly relevant skill: x'), stderr: 'progress' }) })
    host.dir = '/Users/me/alis.build/acme/build/sm/hello/v1'
    const result = await suggestSkills(host, { ...prompt('deploy it'), context: ['earlier'] }, passthrough)
    expect(result).toEqual({ text: 'deploy it', context: ['earlier', 'Possibly relevant skill: x'] })
    expect(suggestBand.items).toEqual([])  // the note above is not in the CLI's exact shape
    expect(host.runs[0]?.argv).toEqual(['alis', 'skills', 'suggest', '--hook'])
    expect(host.runs[0]?.init?.timeoutMs).toBe(2000)
    expect(JSON.parse(host.runs[0]?.init?.stdin ?? '')).toEqual({
      hook_event_name: 'UserPromptSubmit',
      session_id: 'session-a',
      cwd: host.dir,
      permission_mode: 'plan',
      prompt: 'deploy it',
    })
  })

  test('an empty answer, a failing CLI or a missing CLI leave the prompt untouched', async () => {
    const cases = [
      () => ({ exitCode: 0, stdout: '', stderr: '' }),
      () => ({ exitCode: 1, stdout: envelope('ignored'), stderr: 'old alis' }),
      () => new Error('spawn alis ENOENT'),
      () => ({ exitCode: 0, stdout: 'not json', stderr: '' }),
    ]
    for (const answer of cases) {
      const host = fakeHost({ answer })
      host.dir = '/x/alis.build/acme/build/a/v1'
      expect(await suggestSkills(host, prompt('ship it'), passthrough)).toEqual({ text: 'ship it', context: undefined })
    }
  })
})
