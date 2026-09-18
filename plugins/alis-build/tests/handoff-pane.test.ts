import { describe, expect, test, tier } from 'claude-code/testing'

import { runAlisCommand } from '../hooks/mod/alis-command'
import { HANDOFF_PANE_ID, handoffActions, handoffPane, handoffStateOf, onHandoffPaneClosed, openHandoffPane, POLL_MS, POLL_SETTLED_MS, refreshHandoff } from '../hooks/mod/handoff-pane'
import { renderHandoffPane } from '../hooks/mod/handoff-pane-view'
import { fakeHost, type Run } from './fixtures/fake-host'

tier('user')

const ID = 'a'.repeat(32)
const started = { id: ID, session: 's', target: 'alis-acme-1', phase: 'waiting', destination: {}, safe_to_close: false, next: `alis workstation handoff status ${ID} --json` }
const running = { ...started, phase: 'running', destination: { state: 'running', accepted: true, url: 'https://ws.example/x' }, safe_to_close: true }
const statusAnswers = (state: object) => (run: Run) => (run.argv[3] === 'status' ? { exitCode: 0, stdout: JSON.stringify(state), stderr: '' } : { exitCode: 0, stdout: JSON.stringify(started), stderr: '' })

async function settle() {
  for (let i = 0; i < 30; i++) await Promise.resolve()
}

describe('handoff-pane', () => {
  test('handoffStateOf reads a start or status answer', () => {
    expect(handoffStateOf(JSON.stringify(running))).toEqual({ id: ID, target: 'alis-acme-1', phase: 'running', safeToClose: true, error: null, url: 'https://ws.example/x', reclaim: null, next: `alis workstation handoff status ${ID} --json` })
    expect(handoffStateOf(JSON.stringify({ ...started, phase: 'reclaimed', reclaim: { phase: 'done', resumed_in: 'pane 3' } }))?.reclaim).toEqual({ phase: 'done', error: undefined, resumedIn: 'pane 3' })
    expect(handoffStateOf('{"phase":"waiting"}')).toBe(null)
    expect(handoffStateOf('nope')).toBe(null)
  })

  test('opening the pane polls status, slows down once safe to close, and toasts the moment', async () => {
    onHandoffPaneClosed()
    const host = fakeHost({ answer: statusAnswers(started) })
    await openHandoffPane(host, handoffStateOf(JSON.stringify(started))!)
    await settle()
    expect(host.panes.opened).toEqual([{ id: HANDOFF_PANE_ID, title: 'Alis handoff', rows: 12 }])
    expect(host.timers.at(-1)).toEqual(expect.objectContaining({ ms: POLL_MS, cancelled: false }))
    expect(host.runs.at(-1)?.argv).toEqual(['alis', 'workstation', 'handoff', 'status', ID, '--json'])
    expect(handoffPane.state?.phase).toBe('waiting')
    expect(host.toasts).toEqual([])

    host.answer = statusAnswers(running)
    await refreshHandoff(host)
    expect(handoffPane.state?.safeToClose).toBe(true)
    expect(host.toasts).toEqual(['safe to close the laptop, the session is on alis-acme-1'])
    expect(host.timers.at(-1)).toEqual(expect.objectContaining({ ms: POLL_SETTLED_MS, cancelled: false }))
    expect(host.timers.filter(t => !t.cancelled)).toHaveLength(1)
    onHandoffPaneClosed()
    expect(host.timers.every(t => t.cancelled)).toBe(true)
  })

  test('a failing status is shown and the pane stays open', async () => {
    onHandoffPaneClosed()
    const host = fakeHost({ answer: (run: Run) => (run.argv[3] === 'status' ? { exitCode: 1, stdout: '', stderr: 'handoff not found on this machine' } : { exitCode: 0, stdout: '', stderr: '' }) })
    await openHandoffPane(host, handoffStateOf(JSON.stringify(started))!)
    await settle()
    expect(handoffPane.error).toBe('Error: handoff not found on this machine')
    expect(handoffPane.isOpen).toBe(true)
    onHandoffPaneClosed()
  })

  test('Cancel and Reclaim confirm first and run the CLI with --approve', async () => {
    onHandoffPaneClosed()
    const host = fakeHost({ answer: statusAnswers(running) })
    await openHandoffPane(host, handoffStateOf(JSON.stringify(running))!)
    await settle()
    const actions = handoffActions(host)
    host.askAnswer = 'Keep it'
    actions.reclaim()
    await settle()
    expect(host.runs.some(r => r.argv[3] === 'reclaim')).toBe(false)
    host.askAnswer = 'Reclaim'
    host.answer = (run: Run) => (run.argv[3] === 'reclaim' ? { exitCode: 0, stdout: JSON.stringify({ ...running, phase: 'reclaimed', reclaim: { resumed_in: 'here' } }), stderr: '' } : statusAnswers(running)(run))
    actions.reclaim()
    await settle()
    expect(host.runs.at(-1)?.argv).toEqual(['alis', 'workstation', 'handoff', 'reclaim', ID, '--json', '--approve'])
    expect(host.asks.at(-1)).toEqual({ question: 'Bring the session back from alis-acme-1 to this laptop?', options: { options: ['Keep it', 'Reclaim'], header: 'Handoff' } })
    expect(handoffPane.state?.phase).toBe('reclaimed')
    expect(host.toasts.at(-1)).toBe('handoff reclaimed')
    host.askAnswer = 'Cancel handoff'
    host.answer = (run: Run) => (run.argv[3] === 'cancel' ? { exitCode: 0, stdout: JSON.stringify({ ...started, phase: 'cancelled' }), stderr: '' } : statusAnswers(running)(run))
    actions.cancel()
    await settle()
    expect(host.runs.at(-1)?.argv).toEqual(['alis', 'workstation', 'handoff', 'cancel', ID, '--json', '--approve'])
    expect(handoffPane.state?.phase).toBe('cancelled')
    onHandoffPaneClosed()
  })

  test('/alis handoff passes --no-progress and opens the pane', async () => {
    onHandoffPaneClosed()
    const host = fakeHost({ answer: () => ({ exitCode: 0, stdout: JSON.stringify(started), stderr: '' }) })
    const text = (await runAlisCommand(host, 'handoff')).text
    expect(text).toContain('handoff: started')
    expect(text).toContain('target: alis-acme-1')
    expect(host.panes.opened.map(p => p.id)).toEqual([HANDOFF_PANE_ID])
    onHandoffPaneClosed()
  })

  test('the pane draws the safe-to-close line, the link and the buttons the phase allows', async ($, on) => {
    const pane = { isOpen: true, state: handoffStateOf(JSON.stringify(running))!, refreshedAt: Date.now(), error: null, busy: null }
    const failedPane = { ...pane, state: { ...pane.state, phase: 'failed_before_stop', safeToClose: false, error: 'source and destination need matching claude versions' } }
    const actions = { cancel: () => undefined, reclaim: () => undefined, refresh: () => undefined, close: () => undefined }
    // Every hook beneath the plugins is registered before the first call on $.
    on('ui.render', { component: 'Pane', requestId: 'test-handoff' }, ($, e) => renderHandoffPane($.ui.resolve(e), pane, actions))
    on('ui.render', { component: 'Pane', requestId: 'test-failed' }, ($, e) => renderHandoffPane($.ui.resolve(e), failedPane, actions))
    const drawn = JSON.stringify(await $.ui.render({
      surface: 'terminal', component: 'Pane', requestId: 'test-handoff',
      props: { title: 'x', isFocused: true, bodyColumns: 80, placement: 'inline', scroll: { first: 0, rows: 12 } as never, view: {} as never },
    }))
    expect(drawn).toContain('Safe to close the laptop')
    expect(drawn).toContain('https://ws.example/x')
    expect(drawn).toContain('"label":"Reclaim"')
    expect(drawn).toContain('"label":"Cancel handoff"')
    expect(drawn).toContain(' alis ')

    const failedDrawn = JSON.stringify(await $.ui.render({
      surface: 'terminal', component: 'Pane', requestId: 'test-failed',
      props: { title: 'x', isFocused: true, bodyColumns: 80, placement: 'inline', scroll: { first: 0, rows: 12 } as never, view: {} as never },
    }))
    expect(failedDrawn).toContain('"label":"Cancel handoff"')
    expect(failedDrawn).not.toContain('"label":"Reclaim"')
    expect(failedDrawn).toContain('still claimed on this laptop')
  })
})
