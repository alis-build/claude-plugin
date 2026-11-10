import { describe, expect, test, tier } from 'claude-code/testing'

import { handoffPane, onHandoffPaneClosed, resumeHandoffPane } from '../hooks/mod/handoff-pane'
import { onOpsPaneClosed, OPS_PANE_ID, opsPane, resumeOpsPane } from '../hooks/mod/ops-pane'
import { finishedOf, forgetOps, liveOf, POLL_EVERY, resumeOps, watchAlisCall } from '../hooks/mod/ops-live'
import { restore, snapshot } from '../hooks/mod/saved'
import { forgetSecrets, maskRow, noteBashCall, secretsAnswer } from '../hooks/mod/secrets'
import { fakeHost } from './fixtures/fake-host'

tier('user')

// A made-up shape, never a real credential.
const TOKEN = 'ghp_FAKEFAKEFAKEFAKEFAKEFAKEFAKEFAKE0000'
const row = (content: string, id = 'toolu_1') => ({ type: 'user' as const, content: [{ type: 'tool_result', tool_use_id: id, content }] })
const write = (content: string) => ({ hook_event_name: 'PostToolUse', tool_name: 'Write', tool_input: { file_path: '/x', content }, tool_response: {} })

function reset(): void {
  forgetSecrets()
  forgetOps()
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

  test('an operation followed when the code reloads is followed again, and an ended one keeps its row', async () => {
    reset()
    const before = fakeHost({ answer: () => ({ exitCode: 1, stdout: '', stderr: '' }) })
    before.spawnError = new Error('no child')
    const settle = async () => {
      for (let i = 0; i < 20; i++) await Promise.resolve()
    }
    // One wait still running, one that ended.
    void watchAlisCall(before, { tool: 'Bash', tool_use_id: 'toolu_run', command: 'alis operations wait operations/run --json' }, () => new Promise(() => {}), new AbortController().signal)
    await watchAlisCall(before, { tool: 'Bash', tool_use_id: 'toolu_done', command: 'alis operations wait operations/done --json' }, async () => ({ result: { stdout: '{"name":"operations/done","done":true,"version":"1.2.3"}', stderr: '', interrupted: false } }), new AbortController().signal)
    await settle()
    const saved = JSON.parse(JSON.stringify(snapshot()))
    expect(saved.ops.live.map((op: { id: string }) => op.id)).toEqual(['toolu_run'])
    expect(saved.ops.finished.map((op: { id: string }) => op.id)).toEqual(['toolu_done'])
    expect(JSON.stringify(saved)).not.toContain('"raw"')

    // The reload: the working copy starts blank, then the snapshot comes back.
    reset()
    restore(saved)
    expect(finishedOf('toolu_done')).toMatchObject({ operation: 'operations/done', result: { done: true, version: '1.2.3' } })
    expect(liveOf('toolu_run')).toBe(undefined)

    const after = fakeHost({ answer: run => (run.argv[2] === 'describe' ? { exitCode: 0, stdout: '{"done":true,"status":"succeeded","version":"1.2.4"}', stderr: '' } : { exitCode: 1, stdout: '', stderr: '' }) })
    after.spawnError = new Error('no child')
    resumeOps(after)
    expect(liveOf('toolu_run')).toMatchObject({ operation: 'operations/run', background: true })
    // Resuming twice follows nothing twice.
    resumeOps(after)
    expect(after.timers).toHaveLength(1)
    for (let i = 0; i < POLL_EVERY; i++) after.timers[0]!.fn()
    await settle()
    expect(liveOf('toolu_run')).toBe(undefined)
    expect(finishedOf('toolu_run')).toMatchObject({ result: { done: true, version: '1.2.4' } })
    expect(after.notifications).toHaveLength(1)
  })

  test('a snapshot from an older version, or one that is not a followed call, restores without ops', () => {
    reset()
    const saved = JSON.parse(JSON.stringify(snapshot()))
    delete saved.ops
    restore(saved)
    restore({ ...saved, ops: { live: [{ id: 'x', wait: { verb: 7 } }, null], finished: 'nope' } } as never)
    resumeOps(fakeHost())
    expect(liveOf('x')).toBe(undefined)
    // One followed too long ago is dropped rather than followed for ever.
    restore({ ...saved, ops: { live: [{ id: 'old', wait: { operation: 'operations/old', target: null, verb: 'wait', startedAt: 0, status: 'running', names: {} } }], finished: [] } })
    const host = fakeHost()
    resumeOps(host)
    expect(liveOf('old')).toBe(undefined)
    expect(host.timers).toHaveLength(0)
  })

})
