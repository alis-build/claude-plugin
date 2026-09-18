// The deploy confirmation dialog: before a Bash call runs `alis deploy` with
// --confirm-production (the flag the CLI says to pass only after explicit
// user approval), a focused pane shows the target, version and each
// environment with its production flag, and waits for Approve or Abort.
// Approve lets the call run and counts as the person's confirmation for the
// permission gate, so the native prompt does not ask a second time; Abort
// refuses it. Runs only where there is a surface to draw on. A production
// deploy without the flag needs no dialog: the CLI refuses it (exit 3).
import { workspaceOf } from './alis-command'
import { commandPath } from './cli-gate'
import type { Host } from './host'
import { literalArgv } from './shell'

export const DEPLOY_PANE_ID = 'alis-deploy'
export const ABORT_REASON = 'Deploy aborted by the person in the alis confirmation dialog.'
const LIST_TIMEOUT_MS = 10_000
const WAIT_TICK_MS = 200

export type DeployCall = {
  target: string | null
  environments: string[]
  version: string | null
  confirmProduction: boolean
  planOnly: boolean
}

/** Reads a literal `alis deploy …` command line; null for anything else. */
export function deployCallOf(command: unknown): DeployCall | null {
  if (typeof command !== 'string') return null
  const argv = literalArgv(command)
  if (!argv) return null
  const words = commandPath(argv, 2)
  if (words[0] !== 'deploy' && words[0] !== 'release') return null
  const call: DeployCall = { target: null, environments: [], version: null, confirmProduction: false, planOnly: false }
  const positional: string[] = []
  for (let i = 1; i < argv.length; i++) {
    const token = argv[i] as string
    if (token === '--') break
    const [flag, inline] = token.includes('=') ? [token.slice(0, token.indexOf('=')), token.slice(token.indexOf('=') + 1)] : [token, undefined]
    const value = () => inline ?? argv[++i]
    switch (flag) {
      case '-e': case '--environment': {
        const v = value()
        if (v) call.environments.push(...v.split(',').map(s => s.trim()).filter(Boolean))
        break
      }
      case '--version': call.version = value() ?? null; break
      case '--confirm-production': call.confirmProduction = true; break
      case '--plan-only': call.planOnly = true; break
      case '--cwd': case '--session-id': case '--timeout': case '--poll-interval': value(); break
      default:
        if (!token.startsWith('-')) positional.push(token)
    }
  }
  call.target = positional[1] ?? null
  return call
}

export type EnvironmentInfo = { id: string; displayName: string; production: boolean; status: string }

/** `alis environment list <org.product> --json`, or [] when it cannot be read. */
export async function environmentsOf(host: Host, product: string): Promise<EnvironmentInfo[]> {
  try {
    const run = await host.run(['alis', 'environment', 'list', product, '--json'], { timeoutMs: LIST_TIMEOUT_MS })
    if (run.exitCode !== 0) return []
    const raw = JSON.parse(run.stdout)
    const list = raw && typeof raw === 'object' ? (raw as { environments?: unknown }).environments : null
    if (!Array.isArray(list)) return []
    return list.flatMap(item => {
      if (!item || typeof item !== 'object') return []
      const env = item as Record<string, unknown>
      if (typeof env['id'] !== 'string') return []
      return [{
        id: env['id'],
        displayName: typeof env['displayName'] === 'string' ? env['displayName'] : env['id'],
        production: env['production'] === true,
        status: typeof env['status'] === 'string' ? env['status'] : '',
      }]
    })
  } catch (error) {
    host.debug(`deploy: could not list environments of ${product}: ${String(error)}`)
    return []
  }
}

export type DeployPrompt = {
  target: string
  version: string
  environments: EnvironmentInfo[]
  unresolved: string[]
  confirmProduction: boolean
}

export type DeployAnswer = 'approve' | 'abort'

/** The dialog's state: what it asks about while open, and the answer once given. */
export const deployDialog: { pending: DeployPrompt | null; answer: DeployAnswer | null } = { pending: null, answer: null }

/** Calls (by tool_use_id) the person approved in the dialog; the gate reads one once. */
export const approvedCalls = new Set<string>()

/** Read through a call so control flow does not narrow the shared field. */
function currentAnswer(): DeployAnswer | null {
  return deployDialog.answer
}

export function answerDeploy(answer: DeployAnswer): void {
  if (deployDialog.pending && !deployDialog.answer) deployDialog.answer = answer
}

/**
 * Runs the call through `next`, first asking the person when it carries
 * --confirm-production. Any other call, a plan, or a session without a
 * surface passes straight through.
 */
export async function confirmDeploy<E extends object, R>(
  host: Host,
  e: E,
  next: (e: E) => Promise<R | { deny: string }>,
  signal: AbortSignal,
): Promise<R | { deny: string }> {
  const { command, tool_use_id } = e as { command?: unknown; tool_use_id?: unknown }
  const call = deployCallOf(command)
  if (!call || call.planOnly || !call.confirmProduction) return next(e)
  if (!(await host.surface().catch(() => null))) return next(e)

  const target = call.target ?? workspaceOf(await host.cwd().catch(() => ''))?.pkg ?? null
  const product = target?.split('.').slice(0, 2).join('.') ?? null
  const known = product && product.includes('.') ? await environmentsOf(host, product) : []
  const chosen = call.environments.length > 0 ? known.filter(env => call.environments.includes(env.id)) : known.length === 1 ? known : []
  const unresolved = call.environments.filter(id => !known.some(env => env.id === id))

  if (deployDialog.pending) return { deny: 'Another alis deploy confirmation is still open; answer it first.' }
  deployDialog.pending = { target: target ?? '(package of the current directory)', version: call.version ?? 'latest build', environments: chosen, unresolved, confirmProduction: call.confirmProduction }
  deployDialog.answer = null
  try {
    await host.openPane({ id: DEPLOY_PANE_ID, title: 'Confirm deploy', focus: true, closeOnEscape: true, holdToasts: true, rows: 10 + chosen.length + unresolved.length })
    while (!deployDialog.answer) {
      try {
        await host.sleep(WAIT_TICK_MS, signal)
      } catch {
        deployDialog.answer = 'abort'
      }
    }
  } catch (error) {
    host.debug(`deploy: dialog could not open: ${String(error)}`)
    deployDialog.answer = deployDialog.answer ?? 'abort'
  }
  const answer = currentAnswer()
  deployDialog.pending = null
  deployDialog.answer = null
  await host.closePane(DEPLOY_PANE_ID).catch(() => undefined)
  if (answer !== 'approve') return { deny: ABORT_REASON }
  if (typeof tool_use_id === 'string') approvedCalls.add(tool_use_id)
  return next(e)
}
