// The operations pane (`/alis ops`): the org's running and recent
// operations from `alis operations list`, refreshed on the module's clock
// while the pane is open, with a Wait and a Cancel button per running one.
// The buttons submit prompts rather than act on their own, so the
// permission gate and the person's confirmation stay in charge.
import type { Host } from './host'

export const OPS_PANE_ID = 'alis-ops'
export const OPS_PANE_TITLE = 'Alis operations'
export const REFRESH_MS = 5_000
const LIST_LIMIT = 8
const LIST_TIMEOUT_MS = 15_000

export type OperationRow = {
  name: string
  type: string
  target: string
  startedAt: string
  status: string | null
  next: string | null
  running: boolean
}

export type OpsPaneState = {
  isOpen: boolean
  rows: OperationRow[]
  refreshedAt: number | null
  error: string | null
  isRefreshing: boolean
}

export const opsPane: OpsPaneState = { isOpen: false, rows: [], refreshedAt: null, error: null, isRefreshing: false }

let cancelTimer: (() => void) | null = null

/** Opens the pane, or closes it when it is open. */
export async function toggleOpsPane(host: Host): Promise<string> {
  if (opsPane.isOpen) {
    await host.closePane(OPS_PANE_ID)
    return 'ops: closed'
  }
  opsPane.isOpen = true
  opsPane.error = null
  await host.openPane({ id: OPS_PANE_ID, title: OPS_PANE_TITLE, rows: 14 })
  cancelTimer?.()
  cancelTimer = host.every(REFRESH_MS, () => void refreshOps(host))
  await refreshOps(host)
  return `ops: open (${opsPane.rows.filter(r => r.running).length} running, refreshes every ${REFRESH_MS / 1000}s)`
}

/** The person or the engine closed the pane: stop refreshing. */
export function onOpsPaneClosed(): void {
  opsPane.isOpen = false
  cancelTimer?.()
  cancelTimer = null
}

/** One refresh: the running operations (polled by the CLI) and the recent ones. */
export async function refreshOps(host: Host): Promise<void> {
  if (opsPane.isRefreshing || !opsPane.isOpen) return
  opsPane.isRefreshing = true
  try {
    const [active, recent] = await Promise.all([
      listOperations(host, ['--active']),
      listOperations(host, []),
    ])
    const running = new Map(active.map(r => [r.name, { ...r, running: true }]))
    const rows = [...running.values()]
    for (const r of recent) if (!running.has(r.name)) rows.push({ ...r, running: false })
    opsPane.rows = rows.slice(0, LIST_LIMIT)
    opsPane.refreshedAt = Date.now()
    opsPane.error = null
  } catch (error) {
    opsPane.error = String(error)
    host.debug(`ops pane: refresh failed: ${String(error)}`)
  } finally {
    opsPane.isRefreshing = false
    if (opsPane.isOpen) host.invalidate()
  }
}

async function listOperations(host: Host, flags: string[]): Promise<OperationRow[]> {
  const run = await host.run(['alis', 'operations', 'list', ...flags, '--limit', String(LIST_LIMIT), '--json'], { timeoutMs: LIST_TIMEOUT_MS })
  if (run.exitCode !== 0) throw new Error(run.stderr.trim().split('\n').at(-1) || `alis operations list exited ${run.exitCode}`)
  return rowsOf(run.stdout)
}

/** Reads `alis operations list --json` output. */
export function rowsOf(stdout: string): OperationRow[] {
  let raw: unknown
  try {
    raw = JSON.parse(stdout)
  } catch {
    return []
  }
  const list = raw && typeof raw === 'object' ? (raw as { operations?: unknown }).operations : null
  if (!Array.isArray(list)) return []
  const rows: OperationRow[] = []
  for (const item of list) {
    if (!item || typeof item !== 'object') continue
    const op = item as Record<string, unknown>
    if (typeof op['name'] !== 'string') continue
    rows.push({
      name: op['name'],
      type: typeof op['type'] === 'string' ? op['type'] : '?',
      target: typeof op['target'] === 'string' ? op['target'] : '',
      startedAt: typeof op['startedAt'] === 'string' ? op['startedAt'] : '',
      status: typeof op['status'] === 'string' ? op['status'] : null,
      next: typeof op['next'] === 'string' ? op['next'] : null,
      running: false,
    })
  }
  return rows
}

/** What the pane's buttons do: each submits a prompt for Claude to act on. */
export function opsActions(host: Host) {
  return {
    wait: (row: OperationRow) => host.submitPrompt(`Wait for ${row.name} to finish with: ${row.next ?? `alis operations wait ${row.name} --json`}`),
    cancel: (row: OperationRow) => host.submitPrompt(`Cancel ${row.name} (${row.type} of ${row.target}) with: alis operations cancel ${row.name} --json`),
    refresh: () => void refreshOps(host),
    close: () => void host.closePane(OPS_PANE_ID),
  }
}

/** "3m ago" from an ISO timestamp, or the raw text when it does not parse. */
export function agoOf(startedAt: string, now = Date.now()): string {
  const at = Date.parse(startedAt)
  if (Number.isNaN(at)) return startedAt || '?'
  const s = Math.max(0, Math.floor((now - at) / 1000))
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86_400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86_400)}d ago`
}
