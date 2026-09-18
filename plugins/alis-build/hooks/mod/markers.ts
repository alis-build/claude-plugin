// The per-session marker files the PreToolUse shell hooks read (see
// classic.ts): where they live, how one is written, and how stale ones are
// pruned. `$.fs` cannot delete, so pruning runs one `rm -f` on the host over
// names that passed the session-id check, inside the marker directory only.
import type { Host } from './host'

export const MARKER_DIR = '.alis/claude-module-sessions'
/** Markers older than this are pruned at session start. */
export const MARKER_MAX_AGE_MS = 24 * 60 * 60 * 1000
const PRUNE_LIMIT = 500
const SESSION_ID = /^[A-Za-z0-9_-]{1,128}$/

export function markerPath(home: string, sessionId: string): string {
  return `${home}/${MARKER_DIR}/${sessionId}`
}

export function isSessionId(value: unknown): value is string {
  return typeof value === 'string' && SESSION_ID.test(value)
}

/** Writes the marker for `sessionId` with the tokens the module serves (empty text ends it). */
export async function writeMarker(host: Host, sessionId: string, text: string): Promise<void> {
  const home = await host.home()
  if (home) await host.writeFile(markerPath(home, sessionId), text)
}

/**
 * Removes markers older than MARKER_MAX_AGE_MS. Best effort: a directory
 * that does not exist yet, an unreadable entry or a failed rm change nothing
 * beyond a debug line. Returns the paths it asked rm to remove.
 */
export async function pruneMarkers(host: Host, now = Date.now()): Promise<string[]> {
  const home = await host.home()
  if (!home) return []
  const dir = `${home}/${MARKER_DIR}`
  let entries
  try {
    if (!(await host.exists(dir))) return []
    entries = await host.list(dir)
  } catch (error) {
    host.debug(`markers: could not list ${dir}: ${String(error)}`)
    return []
  }
  const stale: string[] = []
  for (const entry of entries) {
    if (entry.kind !== 'file' || !isSessionId(entry.name)) continue
    const path = `${dir}/${entry.name}`
    try {
      const stat = await host.stat(path)
      if (now - stat.mtimeMs > MARKER_MAX_AGE_MS) stale.push(path)
    } catch {
      // Gone since the listing, or unreadable: leave it.
    }
    if (stale.length >= PRUNE_LIMIT) break
  }
  if (stale.length === 0) return []
  try {
    const run = await host.run(['/bin/rm', '-f', ...stale], { timeoutMs: 5_000 })
    if (run.exitCode !== 0) host.debug(`markers: rm exited ${run.exitCode}: ${run.stderr.trim()}`)
  } catch (error) {
    host.debug(`markers: could not prune: ${String(error)}`)
  }
  return stale
}
