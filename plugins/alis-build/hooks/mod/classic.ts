// The module's outermost classic hook: passes every classic event down
// tagged (see tag.ts), keeps the per-session marker the PreToolUse shell
// hooks read, remembers the permission mode, and relays the lifecycle
// events handoff needs (see handoff.ts).
//
// PreToolUse is the one classic event whose `e` is the tool-call envelope
// (the tool's own arguments, `tool` and `tool_use_id`), not the payload the
// shell hooks read; a field added to it lands inside the shell payload's
// `tool_input`, that is inside the tool's arguments. So that event is never
// tagged, and the shell hooks on it learn that the module is live from a
// marker file named by session id instead: written at session start and
// refreshed at each prompt and tool result, emptied at session end, and
// trusted by the shell side for an hour.
import { mergeClassic } from './classic-result'
import { HANDOFF_EVENTS, handoffHook } from './handoff'
import type { Host } from './host'
import { isSessionId, pruneMarkers, writeMarker } from './markers'
import { secretsAnswer } from './secrets'
import { primerContext, serviceContext, syncSkills } from './session-context'
import { COVERS, tagClassic } from './tag'

export { MARKER_DIR, markerPath } from './markers'

const MARKER_EVENTS = new Set(['classic.SessionStart', 'classic.UserPromptSubmit', 'classic.PostToolUse', 'classic.SessionEnd'])

/** What the classic events told us since the module loaded. */
export const classicState: { permissionMode?: string } = {}

export async function passClassic<E extends object, R extends object>(
  host: Host,
  event: string,
  e: E,
  next: (e: E) => Promise<R>,
): Promise<R> {
  const p = e as Record<string, unknown>
  if (typeof p['permission_mode'] === 'string') classicState.permissionMode = p['permission_mode']
  const sid = p['session_id']
  if (MARKER_EVENTS.has(event) && isSessionId(sid)) {
    try {
      await writeMarker(host, sid, event === 'classic.SessionEnd' ? '' : COVERS.join(' '))
    } catch (error) {
      host.debug(`classic: could not write the session marker: ${String(error)}`)
    }
    // Once per session, drop markers no session could still be using.
    if (event === 'classic.SessionStart') void pruneMarkers(host)
  }
  const eventName = event.startsWith('classic.') ? event.slice('classic.'.length) : event
  let mine: Record<string, unknown> = COVERS.includes('handoff') && HANDOFF_EVENTS.has(eventName) ? await handoffHook(host, eventName, e) : {}
  if (eventName === 'SessionStart') mine = { ...mine, ...(await sessionStartAnswer(host, p)) }
  if (eventName === 'PostToolUse' && COVERS.includes('secrets')) mine = { ...mine, ...(await secretsAnswer(host, e)) }
  const below = await next(event === 'classic.PreToolUse' ? e : tagClassic(e))
  return Object.keys(mine).length === 0 ? below : mergeClassic(below, mine)
}

/** The primer and service pointer as additionalContext; the catalog sync runs off the critical path. */
async function sessionStartAnswer(host: Host, p: Record<string, unknown>): Promise<{ additionalContext?: string[] }> {
  const cwd = typeof p['cwd'] === 'string' ? p['cwd'] : await host.cwd().catch(() => '')
  const source = typeof p['source'] === 'string' ? p['source'] : 'startup'
  if (COVERS.includes('sync')) void syncSkills(host, source).catch(error => host.debug(`sync: ${String(error)}`))
  const blocks: string[] = []
  if (COVERS.includes('primer')) {
    const primer = await primerContext(host, cwd, source).catch(error => (host.debug(`primer: ${String(error)}`), null))
    if (primer) blocks.push(primer)
  }
  if (COVERS.includes('service')) {
    const service = await serviceContext(host, cwd).catch(error => (host.debug(`service: ${String(error)}`), null))
    if (service) blocks.push(service)
  }
  return blocks.length > 0 ? { additionalContext: blocks } : {}
}
