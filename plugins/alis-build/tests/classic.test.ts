import { describe, expect, test, tier } from 'claude-code/testing'

import { classicState, MARKER_DIR, markerPath, passClassic } from '../hooks/mod/classic'
import { COVERS } from '../hooks/mod/tag'
import { fakeHost } from './fixtures/fake-host'

tier('user')

const passthrough = async <E,>(e: E) => e

describe('classic', () => {
  test('a payload event is tagged, its mode remembered, and the marker refreshed', async () => {
    const host = fakeHost()
    const e = { session_id: 'abc', hook_event_name: 'UserPromptSubmit', permission_mode: 'plan', prompt: 'hi' }
    const seen = await passClassic(host, 'classic.UserPromptSubmit', e, passthrough)
    expect(seen).toEqual({ ...e, alis_module: COVERS.join(' ') })
    expect(classicState.permissionMode).toBe('plan')
    expect(host.writes).toEqual([{ path: markerPath('/h', 'abc'), text: COVERS.join(' ') }])
    expect(MARKER_DIR).toBe('.alis/claude-module-sessions')
  })

  test('PreToolUse is passed down untouched and writes no marker', async () => {
    const host = fakeHost()
    const e = { tool: 'Bash', tool_use_id: 't1', command: 'alis whoami --json' }
    expect(await passClassic(host, 'classic.PreToolUse', e, passthrough)).toBe(e)
    expect(host.writes).toEqual([])
  })

  test('session end empties the marker; other events leave it alone', async () => {
    const host = fakeHost()
    await passClassic(host, 'classic.SessionEnd', { session_id: 'abc' }, passthrough)
    expect(host.writes).toEqual([{ path: markerPath('/h', 'abc'), text: '' }])
    await passClassic(host, 'classic.Stop', { session_id: 'abc' }, passthrough)
    await passClassic(host, 'classic.SessionStart', { session_id: '../x' }, passthrough)
    await passClassic(host, 'classic.SessionStart', {}, passthrough)
    expect(host.writes).toHaveLength(1)
  })

  test('a marker that cannot be written is logged and the event still passes', async () => {
    const host = fakeHost({ writeError: new Error('read-only') })
    const e = { session_id: 'abc', hook_event_name: 'SessionStart' }
    expect(await passClassic(host, 'classic.SessionStart', e, passthrough)).toMatchObject({ alis_module: COVERS.join(' ') })
    expect(host.logs.some(l => l.includes('read-only'))).toBe(true)
  })
})
