import { describe, expect, test, tier } from 'claude-code/testing'

import { durationOf, NOT_RECORDED, onSessionPaneClosed, OUTDATED, recordOf, SESSION_PANE_ID, SESSION_REFRESH_MS, sessionActions, sessionPane, toggleSessionPane } from '../hooks/mod/session-pane'
import { factsOf, renderSessionPane } from '../hooks/mod/session-pane-view'
import { fakeHost } from './fixtures/fake-host'

tier('user')

const RECORD = {
  id: 'session-a',
  title: 'Add presence',
  summary: 'Two read commands.',
  outcome: 'completed',
  service: 'alis.os.cli.v1',
  gitBranch: 'master',
  activeSeconds: 5400,
  workTokens: 149839,
  estimatedCostUsd: 70.0875,
  transcriptSaved: true,
  keyChanges: ['alis presence'],
  skillsUsed: ['block-audit'],
  filesModified: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
  tickets: ['tickets/1'],
}

/** Lets a button's un-awaited work finish. */
async function settle() {
  for (let i = 0; i < 20; i += 1) await Promise.resolve()
}

function reset() {
  onSessionPaneClosed()
  Object.assign(sessionPane, { record: null, refreshedAt: null, note: null, error: null, isRefreshing: false })
}

describe('session-pane', () => {
  test('recordOf reads the CLI record and defaults what is missing', () => {
    expect(recordOf(RECORD).title).toBe('Add presence')
    expect(recordOf({ id: 'x', keyChanges: [1, 'kept'], workTokens: 'many' })).toEqual({
      id: 'x', title: '', summary: '', outcome: '', service: '', gitBranch: '', model: '',
      activeSeconds: 0, workTokens: 0, estimatedCostUsd: 0, transcriptSaved: false,
      keyChanges: ['kept'], skillsUsed: [], filesModified: [], tickets: [],
    })
    expect(durationOf(20)).toBe('under a minute')
    expect(durationOf(1800)).toBe('30m')
    expect(durationOf(5400)).toBe('1h 30m')
    expect(factsOf(recordOf(RECORD))).toBe('completed · alis.os.cli.v1 · branch master · 1h 30m active · 149,839 tokens (about $70.09) · transcript saved')
    expect(factsOf(recordOf({ id: 'x' }))).toBe('transcript not saved')
  })

  test('toggling opens the pane, reads this session\'s record, refreshes on the clock, and closing stops it', async () => {
    reset()
    const host = fakeHost({ answer: () => ({ exitCode: 0, stdout: JSON.stringify(RECORD), stderr: '' }) })
    expect(await toggleSessionPane(host)).toBe('session: open\ntitle: Add presence')
    expect(host.panes.opened).toEqual([{ id: SESSION_PANE_ID, title: 'AlisX session', rows: 18 }])
    expect(host.timers).toEqual([expect.objectContaining({ ms: SESSION_REFRESH_MS, cancelled: false })])
    expect(host.runs[0]?.argv.slice(0, 6)).toEqual(['alis', 'context', 'session', '--session', 'session-a', '--json'])
    expect(sessionPane.record?.filesModified.length).toBe(8)
    expect(host.invalidations).toBe(1)

    expect(await toggleSessionPane(host)).toBe('session: closed')
    expect(host.panes.closed).toEqual([SESSION_PANE_ID])
    onSessionPaneClosed()
    expect(host.timers[0]?.cancelled).toBe(true)
  })

  test('a session not recorded yet is a note; an older CLI and a failure are errors', async () => {
    reset()
    let answer = { exitCode: 1, stdout: '{"error":{"code":"session_not_recorded","message":"session x is not recorded yet"}}', stderr: '' }
    const host = fakeHost({ answer: () => answer })
    expect(await toggleSessionPane(host)).toBe(`session: open\nnote: ${NOT_RECORDED}`)
    expect(sessionPane.error).toBeNull()

    // An older CLI prints the group's help and exits 0.
    answer = { exitCode: 0, stdout: 'Where this folder sits\n\nUsage:\n  alis context [command]', stderr: '' }
    sessionActions(host).refresh()
    await settle()
    expect(sessionPane.error).toBe(OUTDATED)
    expect(sessionPane.note).toBeNull()

    answer = { exitCode: 1, stdout: '{"error":{"code":"NETWORK_UNAVAILABLE","message":"can\'t reach alis.build"}}', stderr: '' }
    sessionActions(host).refresh()
    await settle()
    expect(sessionPane.error).toBe("can't reach alis.build")
    reset()
  })

  test('the send button goes through the share dialog and the close button closes', async () => {
    reset()
    const host = fakeHost({ answer: () => ({ exitCode: 1, stdout: '', stderr: 'offline' }) })
    const actions = sessionActions(host)
    actions.share()
    await settle()
    expect(host.runs[0]?.argv).toContain('--dry-run')
    expect(host.toasts.length).toBe(1)
    actions.close()
    expect(host.panes.closed).toEqual([SESSION_PANE_ID])
  })

  test('the pane draws the record, its lists and the buttons', async ($, on) => {
    const state = { isOpen: true, record: recordOf(RECORD), refreshedAt: Date.now(), note: null, error: null, isRefreshing: false }
    const actions = { share: () => {}, refresh: () => {}, close: () => {} }
    on('ui.render', { component: 'Pane' }, ($, e) => renderSessionPane($.ui.resolve(e), state, actions))
    const tree = await $.ui.render({
      surface: 'terminal',
      component: 'Pane',
      requestId: 'test-pane',
      props: { title: 'x', isFocused: true, bodyColumns: 90, placement: 'inline', scroll: { first: 0, rows: 18 } as never, view: {} as never },
    })
    const drawn = JSON.stringify(tree)
    for (const want of ['"⣼⠇"', ' session', 'Add presence', 'Two read commands.', '1h 30m active', 'Key changes', '  alis presence', 'Skills used', 'Files changed', '  f', 'and 2 more', 'Conversations', '"label":"Send to the build team"', '"label":"Refresh"', '"label":"Close"']) {
      expect(drawn).toContain(want)
    }
    expect(drawn).not.toContain('"  g"')
  })
})
