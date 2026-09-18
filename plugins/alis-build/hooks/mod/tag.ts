// The handshake between this module and the plugin's classic shell hooks.
//
// The module tags every classic event it passes down with `alis_module`, a
// space-separated list of the jobs it now serves. The field reaches each
// shell hook on stdin, and a hook whose token is listed exits at once, so a
// job runs exactly once whether or not function hooks are enabled. A hook
// that throws adds no tag for that dispatch, and the shell hook answers.

/** Tokens the module serves this round; a shell hook guards on its own. */
export const COVERS: readonly string[] = ['cli', 'handoff']

export const TAG_FIELD = 'alis_module'

/** Returns `e` with the tag field set; never mutates the event. */
export function tagClassic<E extends object>(e: E): E & { alis_module: string } {
  return { ...e, [TAG_FIELD]: COVERS.join(' ') }
}

/** Whether a payload's tag lists `token`, as the shell guards read it. */
export function isCovered(payload: unknown, token: string): boolean {
  if (typeof payload !== 'object' || payload === null) return false
  const tag = (payload as Record<string, unknown>)[TAG_FIELD]
  return typeof tag === 'string' && tag.split(' ').includes(token)
}
