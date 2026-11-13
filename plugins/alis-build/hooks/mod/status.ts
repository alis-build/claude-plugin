// The plugin's one line in the status area. Claude Code gives a plugin a
// single line, and more than one part of the module has something to say on
// it (a handoff claim, the skill in use), so each sets its own segment here
// and the line is the segments that are set, in a fixed order.
import type { Host } from './host'

const ORDER = ['handoff', 'skill', 'presence', 'credits'] as const
export type StatusSegment = (typeof ORDER)[number]

const segments = new Map<StatusSegment, string>()

/** The line as it stands, or undefined when no segment is set. */
export function statusText(): string | undefined {
  const parts = ORDER.map(key => segments.get(key)).filter((text): text is string => !!text)
  return parts.length > 0 ? parts.join(' · ') : undefined
}

/** Sets or clears (undefined) one segment and shows the line again. */
export function setStatus(host: Host, segment: StatusSegment, text: string | undefined): void {
  if (text) segments.set(segment, text)
  else segments.delete(segment)
  host.status(statusText())
}

/** Forgets every segment (tests). */
export function resetStatus(): void {
  segments.clear()
}
