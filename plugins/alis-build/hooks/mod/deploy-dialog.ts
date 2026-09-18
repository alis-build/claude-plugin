// The deploy confirmation: before a Bash call runs `alis deploy` with
// --confirm-production (the flag the CLI says to pass only after explicit
// user approval), the engine's own question dialog asks the person, naming
// the target, the version and each environment with its production flag.
// Approve lets the call run and counts as the person's confirmation for the
// permission gate, so the native prompt does not ask a second time; Abort
// or a dismissed dialog refuses it. Nothing is asked where nothing draws
// (a -p run), and a production deploy without the flag needs no question:
// the CLI refuses it (exit 3).
//
// Why the engine's dialog and not a pane: in the fullscreen layout every
// pane docks as a tab, focus is only a request the composer may refuse, and
// Esc then interrupts the turn instead of the pane. A confirmation has to be
// modal, and `$.ui.ask` is; its wait is a `$` call, free of the hook budget.
import { workspaceOf } from './alis-command'
import { commandPath } from './cli-gate'
import type { Host } from './host'
import { literalArgv } from './shell'

export const ABORT_REASON = 'Deploy aborted by the person in the alis confirmation dialog.'
export const ASK_OPTIONS = ['Abort', 'Approve'] as const
const LIST_TIMEOUT_MS = 10_000

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
}

/** The question the dialog asks, one sentence the person can answer with a number. */
export function questionOf(prompt: DeployPrompt): string {
  const envs = [
    ...prompt.environments.map(env => `${env.displayName} (${env.id}${env.status ? `, ${env.status}` : ''}${env.production ? ', PRODUCTION' : ''})`),
    ...prompt.unresolved.map(id => `${id} (not in the product's environment list)`),
  ]
  const where = envs.length > 0 ? envs.join(' and ') : 'the environment the CLI picks (none named, none resolved)'
  return `Deploy ${prompt.target} version ${prompt.version} to ${where} with --confirm-production?`
}

/** Calls (by tool_use_id) the person approved in the dialog; the gate reads one once. */
export const approvedCalls = new Set<string>()

/**
 * Runs the call through `next`, first asking the person when it carries
 * --confirm-production. Any other call, a plan, or a session without a
 * surface passes straight through.
 */
export async function confirmDeploy<E extends object, R>(
  host: Host,
  e: E,
  next: (e: E) => Promise<R | { deny: string }>,
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
  const prompt: DeployPrompt = { target: target ?? 'the package of the current directory', version: call.version ?? 'latest build', environments: chosen, unresolved }

  let answer: string
  try {
    answer = await host.ask(questionOf(prompt), { options: ASK_OPTIONS, header: 'Deploy' })
  } catch (error) {
    host.debug(`deploy: the confirmation was dismissed: ${String(error)}`)
    return { deny: ABORT_REASON }
  }
  if (answer !== 'Approve') return { deny: ABORT_REASON }
  if (typeof tool_use_id === 'string') approvedCalls.add(tool_use_id)
  return next(e)
}
