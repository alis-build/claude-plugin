import { describe, expect, test, tier } from 'claude-code/testing'

import { passClassic } from '../hooks/mod/classic'
import { HANDOFF_EVENTS, handoffHook, REASON } from '../hooks/mod/handoff'
import { fakeHost } from './fixtures/fake-host'

tier('user')

const CLAIM = '/h/.alis/handoff-sessions/abc.claim'
const oldCli = () => ({ exitCode: 1, stdout: '', stderr: '' })
const noCli = () => new Error('spawn alis ENOENT')

// The cases of tests/test_handoff.py HandoffHookTests, one for one, plus
// the PreToolUse payload the module has to supply itself.
describe('handoff', () => {
  test('the payload is piped to the CLI untagged and an old CLI is silent without a claim', async () => {
    const host = fakeHost({ answer: oldCli })
    const payload = { session_id: 'abc', hook_event_name: 'PostToolUse', tool_input: { command: 'echo "x"' } }
    expect(await handoffHook(host, 'PostToolUse', payload)).toEqual({})
    expect(host.runs).toHaveLength(1)
    expect(host.runs[0]?.argv).toEqual(['alis', 'workstation', 'handoff', '_hook'])
    expect(JSON.parse(host.runs[0]?.init?.stdin ?? '')).toEqual(payload)
    expect(host.runs[0]?.init?.timeoutMs).toBe(10000)
    expect(host.statuses).toEqual([])
  })

  test('an existing claim denies the tool when the coordinator fails', async () => {
    const host = fakeHost({ answer: oldCli, present: [CLAIM] })
    host.session = 'abc'
    const answer = await handoffHook(host, 'PreToolUse', { tool: 'Bash', tool_use_id: 't', command: 'ls' })
    expect(answer).toEqual({ deny: REASON })
    expect(JSON.parse(host.runs[0]?.init?.stdin ?? '')).toEqual({ session_id: 'abc', hook_event_name: 'PreToolUse', cwd: '/w' })
    expect(host.statuses).toEqual(['handoff: session claimed, coordinator unavailable'])
  })

  test('an existing claim fails closed without a CLI, per event', async () => {
    const host = fakeHost({ answer: noCli, present: [CLAIM] })
    for (const event of ['Stop', 'UserPromptSubmit']) {
      expect(await handoffHook(host, event, { session_id: 'abc', hook_event_name: event })).toEqual({ preventContinuation: true, stopReason: REASON })
    }
    expect(await handoffHook(host, 'PostToolUse', { session_id: 'abc', hook_event_name: 'PostToolUse' })).toEqual({})
    expect(await handoffHook(host, 'Stop', { session_id: 'other', hook_event_name: 'Stop' })).toEqual({})
    expect(host.logs.some(l => l.includes('ENOENT'))).toBe(true)
  })

  test('an invalid session id never reads a claim', async () => {
    const host = fakeHost({ answer: noCli, present: ['/h/.alis/handoff-sessions/../x.claim'] })
    host.exists = async () => {
      throw new Error('must not be called')
    }
    expect(await handoffHook(host, 'Stop', { session_id: '../x', hook_event_name: 'Stop' })).toEqual({})
    expect(await handoffHook(host, 'Stop', 'not json' as unknown as object)).toEqual({})
  })

  test('a valid hook response is forwarded', async () => {
    const host = fakeHost({ answer: () => ({ exitCode: 0, stdout: '{"continue":false,"stopReason":"handoff"}\n', stderr: 'progress' }) })
    expect(await handoffHook(host, 'Stop', { session_id: 'abc', hook_event_name: 'Stop' })).toEqual({ preventContinuation: true, stopReason: 'handoff' })
  })

  test('the status line follows the claim and clears once it is gone', async () => {
    const host = fakeHost({ present: [CLAIM] })
    await handoffHook(host, 'UserPromptSubmit', { session_id: 'abc', hook_event_name: 'UserPromptSubmit' })
    expect(host.statuses).toEqual(['handoff: session claimed'])
    expect(host.toasts).toEqual(['a handoff has claimed this session'])
    host.present.clear()
    await handoffHook(host, 'PostToolUse', { session_id: 'abc', hook_event_name: 'PostToolUse' })
    await handoffHook(host, 'PostToolUse', { session_id: 'abc', hook_event_name: 'PostToolUse' })
    expect(host.statuses).toEqual(['handoff: session claimed', undefined])
  })

  test('passClassic relays the nine lifecycle events and merges the answer over the chain beneath', async () => {
    const host = fakeHost({ answer: noCli, present: [CLAIM] })
    const below = { additionalContext: ['beneath'] }
    const result = await passClassic(host, 'classic.Stop', { session_id: 'abc', hook_event_name: 'Stop' }, async () => below)
    expect(result).toEqual({ additionalContext: ['beneath'], preventContinuation: true, stopReason: REASON })
    expect(host.runs).toHaveLength(1)
    await passClassic(host, 'classic.MessageDisplay', { session_id: 'abc', hook_event_name: 'MessageDisplay' }, async () => ({}))
    expect(host.runs).toHaveLength(1)
    expect([...HANDOFF_EVENTS]).toHaveLength(9)
  })
})
