import { describe, expect, test, tier } from 'claude-code/testing'

import { agoOf, onOpsPaneClosed, OPS_PANE_ID, opsActions, opsPane, REFRESH_MS, rowsOf, toggleOpsPane } from '../hooks/mod/ops-pane'
import { renderOpsPane } from '../hooks/mod/ops-pane-view'
import { fakeHost, type Run } from './fixtures/fake-host'

tier('user')

const LIST = JSON.stringify({
  operations: [
    { name: 'operations/a', type: 'build', target: 'acme.sm.hello.v1', startedAt: '2026-09-18T08:00:00Z', next: 'alis operations wait operations/a --json' },
    { name: 'operations/b', type: 'deploy', target: 'acme.sm.hello.v1', startedAt: '2026-09-18T07:00:00Z', next: 'alis operations wait operations/b --json' },
  ],
})
const ACTIVE = JSON.stringify({
  operations: [{ name: 'operations/a', type: 'build', target: 'acme.sm.hello.v1', startedAt: '2026-09-18T08:00:00Z', status: 'running', next: 'alis operations wait operations/a --json' }],
})
const answerLists = (run: Run) => ({ exitCode: 0, stdout: run.argv.includes('--active') ? ACTIVE : LIST, stderr: '' })

describe('ops-pane', () => {
  test('rowsOf reads the CLI listing and tolerates junk', () => {
    expect(rowsOf(LIST).map(r => [r.name, r.type, r.status, r.running])).toEqual([
      ['operations/a', 'build', null, false],
      ['operations/b', 'deploy', null, false],
    ])
    expect(rowsOf(ACTIVE)[0]?.status).toBe('running')
    expect(rowsOf('nope')).toEqual([])
    expect(rowsOf('{"operations":[{"type":"x"},5]}')).toEqual([])
  })

  test('toggling opens the pane, starts the refresh, merges running over recent, and closing stops it', async () => {
    onOpsPaneClosed()
    const host = fakeHost({ answer: answerLists })
    expect(await toggleOpsPane(host)).toBe(`ops: open (1 running, refreshes every ${REFRESH_MS / 1000}s)`)
    expect(host.panes.opened).toEqual([{ id: OPS_PANE_ID, title: 'Alis operations', rows: 14 }])
    expect(host.timers).toEqual([expect.objectContaining({ ms: REFRESH_MS, cancelled: false })])
    expect(host.runs.map(r => r.argv.join(' '))).toEqual([
      'alis operations list --active --limit 8 --json',
      'alis operations list --limit 8 --json',
    ])
    expect(opsPane.rows.map(r => [r.name, r.running, r.status])).toEqual([
      ['operations/a', true, 'running'],
      ['operations/b', false, null],
    ])
    expect(host.invalidations).toBe(1)

    expect(await toggleOpsPane(host)).toBe('ops: closed')
    expect(host.panes.closed).toEqual([OPS_PANE_ID])
    onOpsPaneClosed()
    expect(host.timers[0]?.cancelled).toBe(true)
    expect(opsPane.isOpen).toBe(false)
  })

  test('a failing listing is shown as an error and the pane stays open', async () => {
    onOpsPaneClosed()
    const host = fakeHost({ answer: () => ({ exitCode: 1, stdout: '', stderr: 'not signed in\nrun alis login' }) })
    await toggleOpsPane(host)
    expect(opsPane.error).toBe('Error: run alis login')
    expect(opsPane.isOpen).toBe(true)
    onOpsPaneClosed()
  })

  test('the buttons submit prompts for Claude rather than acting alone', async () => {
    const host = fakeHost()
    const actions = opsActions(host)
    const row = rowsOf(ACTIVE)[0]!
    actions.wait(row)
    actions.cancel(row)
    expect(host.prompts).toEqual([
      'Wait for operations/a to finish with: alis operations wait operations/a --json',
      'Cancel operations/a (build of acme.sm.hello.v1) with: alis operations cancel operations/a --json',
    ])
    actions.close()
    expect(host.panes.closed).toEqual([OPS_PANE_ID])
  })

  test('agoOf renders relative time', () => {
    const now = Date.parse('2026-09-18T09:00:00Z')
    expect(agoOf('2026-09-18T08:59:30Z', now)).toBe('30s ago')
    expect(agoOf('2026-09-18T08:00:00Z', now)).toBe('1h ago')
    expect(agoOf('2026-09-16T08:00:00Z', now)).toBe('2d ago')
    expect(agoOf('garbage', now)).toBe('garbage')
  })

  test('the pane draws one line per operation with buttons on the running ones', async ($, on) => {
    const state = { isOpen: true, rows: [{ ...rowsOf(ACTIVE)[0]!, running: true }, rowsOf(LIST)[1]!], refreshedAt: Date.now(), error: null, isRefreshing: false }
    const pressed: string[] = []
    const actions = { wait: () => pressed.push('wait'), cancel: () => pressed.push('cancel'), refresh: () => pressed.push('refresh'), close: () => pressed.push('close') }
    on('ui.render', { component: 'Pane' }, ($, e) => renderOpsPane($.ui.resolve(e), state, actions, 90))
    const tree = await $.ui.render({
      surface: 'terminal',
      component: 'Pane',
      requestId: 'test-pane',
      props: { title: 'x', isFocused: true, bodyColumns: 90, placement: 'inline', scroll: { first: 0, rows: 14 } as never, view: {} as never },
    })
    const drawn = JSON.stringify(tree)
    expect(drawn).toContain('build acme.sm.hello.v1')
    expect(drawn).toContain('deploy acme.sm.hello.v1')
    expect(drawn).toContain('"label":"Wait"')
    expect((drawn.match(/"label":"Cancel"/g) ?? []).length).toBe(1)
    expect(drawn).toContain('"hotkey":"r"')
  })
})
