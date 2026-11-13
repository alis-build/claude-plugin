// The session pane (`/alis session`): what AlisX holds about this session,
// from `alis context session --json`, which is the record the Console's
// session page shows. Read when the pane opens and every minute while it is
// open (the platform rewrites the title, summary and lists as the session
// goes). Its one outward button sends the session through /alis share's own
// confirmation.
import type { SessionPaneState, SessionRecord } from '../../types'
import { failureOf, jsonOf, withIdentity } from './cli'
import type { Host } from './host'
import { shareSession } from './share'

export const SESSION_PANE_ID = 'alis-session'
export const SESSION_PANE_TITLE = 'AlisX session'
export const SESSION_REFRESH_MS = 60_000
const READ_TIMEOUT_MS = 15_000

export const NOT_RECORDED = 'AlisX has not recorded this session yet. It appears a few minutes in.'
export const OUTDATED = 'This needs a newer alis CLI. Run `alis upgrade`, then open the pane again.'

export type { SessionPaneState, SessionRecord }

export const sessionPane: SessionPaneState = { isOpen: false, record: null, refreshedAt: null, note: null, error: null, isRefreshing: false }

let cancelTimer: (() => void) | null = null

/** Opens the pane, or closes it when it is open. */
export async function toggleSessionPane(host: Host): Promise<string> {
  if (sessionPane.isOpen) {
    await host.closePane(SESSION_PANE_ID)
    return 'session: closed'
  }
  await openSessionPane(host)
  if (sessionPane.error) return `session: open\nerror: ${sessionPane.error}`
  if (sessionPane.note) return `session: open\nnote: ${sessionPane.note}`
  return `session: open\ntitle: ${sessionPane.record?.title || '(no title yet)'}`
}

async function openSessionPane(host: Host): Promise<void> {
  sessionPane.isOpen = true
  sessionPane.error = null
  await host.openPane({ id: SESSION_PANE_ID, title: SESSION_PANE_TITLE, rows: 18 })
  cancelTimer?.()
  cancelTimer = host.every(SESSION_REFRESH_MS, () => void refreshSession(host))
  await refreshSession(host)
}

/** After a reload: a pane the saved state calls open is opened again. */
export async function resumeSessionPane(host: Host): Promise<void> {
  sessionPane.isRefreshing = false
  if (sessionPane.isOpen) await openSessionPane(host)
}

/** The person or the engine closed the pane: stop refreshing. */
export function onSessionPaneClosed(): void {
  sessionPane.isOpen = false
  cancelTimer?.()
  cancelTimer = null
}

/** One read of the record. A failure is shown in the pane and keeps what was last read. */
export async function refreshSession(host: Host): Promise<void> {
  if (sessionPane.isRefreshing || !sessionPane.isOpen) return
  sessionPane.isRefreshing = true
  try {
    const sid = await host.sessionId()
    const run = await host.run(await withIdentity(host, ['alis', 'context', 'session', '--session', sid, '--json']), { timeoutMs: READ_TIMEOUT_MS })
    const json = jsonOf(run.stdout)
    const error = json?.['error'] as { code?: unknown } | undefined
    sessionPane.note = null
    sessionPane.error = null
    if (error?.code === 'session_not_recorded') sessionPane.note = NOT_RECORDED
    // An older CLI answers an unknown subcommand with its help text.
    else if (!json) sessionPane.error = run.exitCode === 0 || /unknown command/i.test(`${run.stdout}\n${run.stderr}`) ? OUTDATED : failureOf(run)
    else if (error || run.exitCode !== 0) sessionPane.error = failureOf(run)
    else sessionPane.record = recordOf(json)
    sessionPane.refreshedAt = Date.now()
  } catch (error) {
    sessionPane.error = String(error)
    host.debug(`session pane: read failed: ${String(error)}`)
  } finally {
    sessionPane.isRefreshing = false
    if (sessionPane.isOpen) host.invalidate()
  }
}

const text = (value: unknown): string => (typeof value === 'string' ? value : '')
const count = (value: unknown): number => (typeof value === 'number' && Number.isFinite(value) ? value : 0)
const list = (value: unknown): string[] => (Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [])

/** Reads `alis context session --json`. */
export function recordOf(json: Record<string, unknown>): SessionRecord {
  return {
    id: text(json['id']),
    title: text(json['title']),
    summary: text(json['summary']),
    outcome: text(json['outcome']),
    service: text(json['service']),
    gitBranch: text(json['gitBranch']),
    model: text(json['model']),
    activeSeconds: count(json['activeSeconds']),
    workTokens: count(json['workTokens']),
    estimatedCostUsd: count(json['estimatedCostUsd']),
    transcriptSaved: json['transcriptSaved'] === true,
    keyChanges: list(json['keyChanges']),
    skillsUsed: list(json['skillsUsed']),
    filesModified: list(json['filesModified']),
    tickets: list(json['tickets']),
  }
}

/** "30m", "1h 30m", or "under a minute". */
export function durationOf(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  if (minutes < 1) return 'under a minute'
  return minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

/** What the pane's buttons do. */
export function sessionActions(host: Host) {
  return {
    share: () => void shareSession(host).then(said => host.toast(said.split('\n')[0] ?? said)),
    refresh: () => void refreshSession(host),
    close: () => void host.closePane(SESSION_PANE_ID),
  }
}
