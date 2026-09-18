// The handoff pane: one handoff's progress inside Claude Code instead of the
// CLI's separate progress window. Opened when a handoff starts (from
// /alis handoff, or from a Bash call the module rewrote with --no-progress),
// polled from `alis workstation handoff status <id> --json`, with Cancel
// and Reclaim buttons that confirm first and then run the CLI directly
// (prompts are blocked in a claimed session).
import type { Host } from './host'

export const HANDOFF_PANE_ID = 'alis-handoff'
export const POLL_MS = 2_000
export const POLL_SETTLED_MS = 10_000
const STATUS_TIMEOUT_MS = 15_000
const ACTION_TIMEOUT_MS = 60_000
const HANDOFF_ID = /^[a-f0-9]{32}$/

export type HandoffState = {
  id: string
  target: string
  phase: string
  safeToClose: boolean
  error: string | null
  url: string | null
  reclaim: { phase?: string; error?: string; resumedIn?: string } | null
  next: string | null
}

export type HandoffPaneState = {
  isOpen: boolean
  state: HandoffState | null
  refreshedAt: number | null
  error: string | null
  busy: string | null
}

export const handoffPane: HandoffPaneState = { isOpen: false, state: null, refreshedAt: null, error: null, busy: null }

let cancelTimer: (() => void) | null = null
let lastSafe = false

/** Reads a start, status, cancel or reclaim answer. Null when it names no handoff. */
export function handoffStateOf(stdout: unknown): HandoffState | null {
  if (typeof stdout !== 'string') return null
  const text = stdout.trim()
  if (!text.startsWith('{')) return null
  let raw: Record<string, unknown>
  try {
    raw = JSON.parse(text)
  } catch {
    return null
  }
  if (!raw || typeof raw !== 'object' || typeof raw['id'] !== 'string') return null
  const destination = raw['destination'] && typeof raw['destination'] === 'object' ? (raw['destination'] as Record<string, unknown>) : {}
  const reclaimRaw = raw['reclaim'] && typeof raw['reclaim'] === 'object' ? (raw['reclaim'] as Record<string, unknown>) : null
  const str = (v: unknown) => (typeof v === 'string' && v ? v : null)
  return {
    id: raw['id'],
    target: str(raw['target']) ?? '?',
    phase: str(raw['phase']) ?? 'unknown',
    safeToClose: raw['safe_to_close'] === true,
    error: str(raw['error']),
    url: str(destination['url']),
    reclaim: reclaimRaw ? { phase: str(reclaimRaw['phase']) ?? undefined, error: str(reclaimRaw['error']) ?? undefined, resumedIn: str(reclaimRaw['resumed_in']) ?? undefined } : null,
    next: str(raw['next']),
  }
}

export const TERMINAL_PHASES = new Set(['completed', 'cancelled', 'failed', 'failed_before_stop', 'reclaimed'])

/** Opens the pane for a handoff and starts polling its status. */
export async function openHandoffPane(host: Host, seed: HandoffState): Promise<void> {
  if (!HANDOFF_ID.test(seed.id)) return
  handoffPane.state = seed
  handoffPane.error = null
  handoffPane.busy = null
  handoffPane.refreshedAt = Date.now()
  lastSafe = seed.safeToClose
  if (!handoffPane.isOpen) {
    handoffPane.isOpen = true
    await host.openPane({ id: HANDOFF_PANE_ID, title: 'Alis handoff', rows: 12 })
  }
  schedule(host, seed.safeToClose ? POLL_SETTLED_MS : POLL_MS)
  host.invalidate()
  void refreshHandoff(host)
}

function schedule(host: Host, ms: number): void {
  cancelTimer?.()
  cancelTimer = host.every(ms, () => void refreshHandoff(host))
}

/** The person or the engine closed the pane: stop polling. */
export function onHandoffPaneClosed(): void {
  handoffPane.isOpen = false
  cancelTimer?.()
  cancelTimer = null
}

/** One status poll; slows down once the workstation has the session. */
export async function refreshHandoff(host: Host): Promise<void> {
  const id = handoffPane.state?.id
  if (!id || !handoffPane.isOpen || handoffPane.busy) return
  try {
    const run = await host.run(['alis', 'workstation', 'handoff', 'status', id, '--json'], { timeoutMs: STATUS_TIMEOUT_MS })
    const state = handoffStateOf(run.stdout)
    if (run.exitCode !== 0 || !state) throw new Error(run.stderr.trim().split('\n').at(-1) || run.stdout.trim().split('\n').at(-1) || `status exited ${run.exitCode}`)
    handoffPane.state = state
    handoffPane.error = null
    if (state.safeToClose && !lastSafe) host.toast(`alis: safe to close the laptop, the session is on ${state.target}`)
    if (state.error && !lastSafe) host.toast(`alis: handoff problem, ${state.error}`)
    lastSafe = state.safeToClose
    if (state.safeToClose || TERMINAL_PHASES.has(state.phase)) schedule(host, POLL_SETTLED_MS)
  } catch (error) {
    handoffPane.error = String(error)
    host.debug(`handoff pane: status failed: ${String(error)}`)
  } finally {
    handoffPane.refreshedAt = Date.now()
    if (handoffPane.isOpen) host.invalidate()
  }
}

/** What the pane's buttons do. Cancel and Reclaim confirm in the engine's dialog first. */
export function handoffActions(host: Host) {
  const act = async (verb: 'cancel' | 'reclaim', question: string, confirm: string) => {
    const state = handoffPane.state
    if (!state || handoffPane.busy) return
    let answer: string
    try {
      answer = await host.ask(question, { options: ['Keep it', confirm], header: 'Handoff' })
    } catch {
      return
    }
    if (answer !== confirm) return
    handoffPane.busy = verb
    host.invalidate()
    try {
      const run = await host.run(['alis', 'workstation', 'handoff', verb, state.id, '--json', '--approve'], { timeoutMs: ACTION_TIMEOUT_MS })
      const next = handoffStateOf(run.stdout)
      if (next) handoffPane.state = next
      handoffPane.error = run.exitCode === 0 ? null : run.stderr.trim().split('\n').at(-1) || `${verb} exited ${run.exitCode}`
      host.toast(run.exitCode === 0 ? `alis: handoff ${verb === 'cancel' ? 'cancelled' : 'reclaimed'}` : `alis: ${verb} failed`)
    } catch (error) {
      handoffPane.error = String(error)
    } finally {
      handoffPane.busy = null
      host.invalidate()
    }
  }
  return {
    cancel: () => void act('cancel', `Cancel the handoff to ${handoffPane.state?.target ?? 'the workstation'}? The session stays here.`, 'Cancel handoff'),
    reclaim: () => void act('reclaim', `Bring the session back from ${handoffPane.state?.target ?? 'the workstation'} to this laptop?`, 'Reclaim'),
    refresh: () => void refreshHandoff(host),
    close: () => void host.closePane(HANDOFF_PANE_ID),
  }
}
