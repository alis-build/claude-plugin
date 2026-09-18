// A handoff Claude starts itself: a Bash call running `alis workstation
// handoff …` (the start form) is rewritten to carry --no-progress, so the
// CLI opens no separate window, and once it answers with a handoff id the
// pane opens for it.
import { commandPath } from './cli-gate'
import { handoffStateOf, openHandoffPane } from './handoff-pane'
import type { Host } from './host'
import { literalArgv, shellJoin } from './shell'

const SUBCOMMANDS = new Set(['status', 'cancel', 'open', 'reclaim', 'targets', 'install', '_hook', '_agent'])

/** The argv of a literal `alis workstation handoff` start call, else null. */
export function handoffStartArgv(command: unknown): string[] | null {
  if (typeof command !== 'string') return null
  const argv = literalArgv(command)
  if (!argv) return null
  const words = commandPath(argv, 3)
  if (words[0] !== 'workstation' || words[1] !== 'handoff') return null
  if (words[2] && SUBCOMMANDS.has(words[2])) return null
  return argv
}

export async function watchHandoffCall<E extends object, R>(host: Host, e: E, next: (e: E) => Promise<R>): Promise<R> {
  const { command } = e as { command?: unknown }
  const argv = handoffStartArgv(command)
  if (!argv) return next(e)
  const rewritten = argv.includes('--no-progress') ? e : { ...e, command: shellJoin([...argv, '--no-progress']) }
  const result = await next(rewritten)
  const stdout = (result as { result?: { stdout?: unknown } })?.result?.stdout
  const state = handoffStateOf(stdout)
  if (state) await openHandoffPane(host, state).catch(error => host.debug(`handoff pane: could not open: ${String(error)}`))
  return result
}
