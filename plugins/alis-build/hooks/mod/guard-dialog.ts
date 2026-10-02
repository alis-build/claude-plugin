// The confirmation for the guarded alis commands that are hard to undo or
// print secrets: an uninstall, an environment destroy or unset, a reveal,
// and (deploy-dialog.ts) a production deploy. The permission gate answers
// "ask" for these, but that goes to Claude Code's permission prompt, which
// a session mode such as auto may answer on its own; so the module asks the
// person in the engine's own dialog first, in every mode. Approve stands in
// for that prompt on this call (cli-gate-classic.ts reads approvedCalls);
// Abort or a dismissed dialog refuses it. Where nothing draws (a -p run)
// the gate's native ask is all there is.
//
// A plain --approve or --yes (a build, a define, a non-production deploy
// under a manual automation tier) gets no dialog: the person's explicit
// request for that work is the approval, and the primer tells Claude to ask
// in chat when the request was only implied.
import { classicState } from './classic'
import { commandPath, decide, SECRET_REASON } from './cli-gate'
import { approvedCalls, ASK_OPTIONS, confirmDeploy, deployCallOf } from './deploy-dialog'
import type { Host } from './host'
import { literalArgv } from './shell'

export const REFUSE_REASON = 'The person refused this alis command in the alis confirmation dialog. Do not retry it or work around it; ask them what to do instead.'

/** The question for a guarded command, naming it exactly as it will run. */
export function guardQuestionOf(command: string, secrets: boolean): string {
  return secrets
    ? `Claude wants to run an alis command that prints secret values into the session. Allow it?\n\n${command}`
    : `Claude wants to run an alis command that cannot be undone. Allow it?\n\n${command}`
}

/** Whether a command uninstalls a block or destroys or unsets environment state. */
export function isDestructive(command: string): boolean {
  const argv = literalArgv(command)
  if (!argv) return false
  const separator = argv.indexOf('--')
  const options = argv.slice(1, separator === -1 ? undefined : separator)
  const top = commandPath(argv)[0]
  return (top === 'blocks' && options.includes('uninstall')) || (top === 'environment' && (options.includes('destroy') || options.includes('unset')))
}

/**
 * Runs the call through `next`, first asking the person when the gate
 * would ask for it and it is destructive or reveals secrets. Any other call
 * passes straight through.
 */
export async function confirmGuarded<E extends object, R>(
  host: Host,
  e: E,
  next: (e: E) => Promise<R | { deny: string }>,
): Promise<R | { deny: string }> {
  const { command, tool_use_id } = e as { command?: unknown; tool_use_id?: unknown }
  const deploy = deployCallOf(command)
  if (deploy?.confirmProduction && !deploy.planOnly) return confirmDeploy(host, e, next)
  if (typeof command !== 'string') return next(e)
  const decision = decide({
    toolName: 'Bash',
    toolInput: { command },
    permissionMode: classicState.permissionMode,
    allowedSubcmds: await host.allowedSubcmds(),
  })
  if (!decision.matched || decision.decision !== 'ask') return next(e)
  const secrets = decision.reason === SECRET_REASON
  if (!secrets && !isDestructive(command)) return next(e)
  if (!(await host.surface().catch(() => null))) return next(e)

  let answer: string
  try {
    answer = await host.ask(guardQuestionOf(command, secrets), { options: ASK_OPTIONS, header: 'Alis' })
  } catch (error) {
    host.debug(`guard: the confirmation was dismissed: ${String(error)}`)
    return { deny: REFUSE_REASON }
  }
  if (answer !== 'Approve') return { deny: REFUSE_REASON }
  if (typeof tool_use_id === 'string') approvedCalls.add(tool_use_id)
  return next(e)
}
