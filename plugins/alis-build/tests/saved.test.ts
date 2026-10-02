import { describe, expect, test, tier } from 'claude-code/testing'

import { handoffPane, onHandoffPaneClosed, resumeHandoffPane } from '../hooks/mod/handoff-pane'
import { onOpsPaneClosed, OPS_PANE_ID, opsPane, resumeOpsPane } from '../hooks/mod/ops-pane'
import { restore, snapshot } from '../hooks/mod/saved'
import { forgetSecrets, maskRow, noteBashCall, secretsAnswer } from '../hooks/mod/secrets'
import { suggestBand } from '../hooks/mod/suggest-band'
import { fakeHost } from './fixtures/fake-host'

tier('user')

// A made-up shape, never a real credential.
const TOKEN = 'ghp_FAKEFAKEFAKEFAKEFAKEFAKEFAKEFAKE0000'
const row = (content: string, id = 'toolu_1') => ({ type: 'user' as const, content: [{ type: 'tool_result', tool_use_id: id, content }] })
const write = (content: string) => ({ hook_event_name: 'PostToolUse', tool_name: 'Write', tool_input: { file_path: '/x', content }, tool_response: {} })

function reset(): void {
  forgetSecrets()
  suggestBand.items = []
  onOpsPaneClosed()
  Object.assign(opsPane, { rows: [], refreshedAt: null, error: null, isRefreshing: false })
  onHandoffPaneClosed()
  Object.assign(handoffPane, { state: null, refreshedAt: null, error: null, busy: null })
}

describe('saved', () => {
  test('a snapshot is JSON data that a restore puts back', async () => {
    reset()
    await secretsAnswer(fakeHost(), write(TOKEN))
    maskRow(row(TOKEN))
    noteBashCall({ command: 'alis environment variables x --reveal', tool_use_id: 'toolu_r' })
    suggestBand.items = [{ id: 'alis.define', description: 'Define' }]
    const saved = JSON.parse(JSON.stringify(snapshot()))
    expect(JSON.stringify(saved)).not.toContain(TOKEN)

    reset()
    restore(saved)
    expect(snapshot()).toEqual(saved)
    // What was reported before the reload is not reported again.
    expect(await secretsAnswer(fakeHost(), write(TOKEN))).toEqual({})
    expect(maskRow(row(TOKEN)).fresh).toEqual([])
    expect(maskRow(row(TOKEN, 'toolu_r')).changed).toBe(false)
  })

  test('nothing saved leaves the module as loaded', () => {
    reset()
    const before = snapshot()
    restore(undefined)
    expect(snapshot()).toEqual(before)
  })

  test('a pane saved open opens again after a reload, and a closed one stays closed', async () => {
    reset()
    const host = fakeHost({ answer: () => ({ exitCode: 0, stdout: '{"operations":[]}', stderr: '' }) })
    await resumeOpsPane(host)
    await resumeHandoffPane(host)
    expect(host.panes.opened).toEqual([])

    // A reload drops the pane mid-refresh with the old code, unheard.
    restore({ ...snapshot(), opsPane: { ...opsPane, isOpen: true, isRefreshing: true } })
    await resumeOpsPane(host)
    expect(host.panes.opened.map(p => p.id)).toEqual([OPS_PANE_ID])
    expect(host.timers.filter(t => !t.cancelled)).toHaveLength(1)
    expect(host.runs.length).toBeGreaterThan(0)
    expect(opsPane.isRefreshing).toBe(false)

    const handoff = { id: 'a'.repeat(32), target: 'ws', phase: 'running', safeToClose: false, error: null, url: null, reclaim: null, next: null }
    restore({ ...snapshot(), handoffPane: { isOpen: true, state: handoff, refreshedAt: 1, error: null, busy: 'cancel' } })
    await resumeHandoffPane(host)
    expect(host.panes.opened.map(p => p.id)).toEqual([OPS_PANE_ID, 'alis-handoff'])
    expect(handoffPane.busy).toBeNull()
    reset()
  })
})
