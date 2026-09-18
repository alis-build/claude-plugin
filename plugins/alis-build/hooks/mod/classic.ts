// The module's outermost classic hook: passes every classic event down
// tagged (see tag.ts), keeps the per-session marker the PreToolUse shell
// hooks read, and remembers the permission mode.
//
// PreToolUse is the one classic event whose `e` is the tool-call envelope
// (the tool's own arguments, `tool` and `tool_use_id`), not the payload the
// shell hooks read; a field added to it lands inside the shell payload's
// `tool_input`, that is inside the tool's arguments. So that event is never
// tagged, and the shell hooks on it learn that the module is live from a
// marker file named by session id instead: written at session start and
// refreshed at each prompt and tool result, emptied at session end, and
// trusted by the shell side for an hour.
import type { Host } from './host'
import { COVERS, tagClassic } from './tag'

export const MARKER_DIR = '.alis/claude-module-sessions'
const SESSION_ID = /^[A-Za-z0-9_-]{1,128}$/
const MARKER_EVENTS = new Set(['classic.SessionStart', 'classic.UserPromptSubmit', 'classic.PostToolUse', 'classic.SessionEnd'])

/** What the classic events told us since the module loaded. */
export const classicState: { permissionMode?: string } = {}

export function markerPath(home: string, sessionId: string): string {
  return `${home}/${MARKER_DIR}/${sessionId}`
}

export async function passClassic<E extends object, R>(
  host: Host,
  event: string,
  e: E,
  next: (e: E) => Promise<R>,
): Promise<R> {
  const p = e as Record<string, unknown>
  if (typeof p['permission_mode'] === 'string') classicState.permissionMode = p['permission_mode']
  const sid = p['session_id']
  if (MARKER_EVENTS.has(event) && typeof sid === 'string' && SESSION_ID.test(sid)) {
    try {
      const home = await host.home()
      if (home) await host.writeFile(markerPath(home, sid), event === 'classic.SessionEnd' ? '' : COVERS.join(' '))
    } catch (error) {
      host.debug(`classic: could not write the session marker: ${String(error)}`)
    }
  }
  return next(event === 'classic.PreToolUse' ? e : tagClassic(e))
}
