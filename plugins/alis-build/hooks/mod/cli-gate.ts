// The permission gate for `alis …` Bash commands: a pure port of decide()
// in hooks/cli-hook.py. Same tables, same order of checks, same answers;
// the adapter in cli-gate-classic.ts is the only place that touches `$`.
import { insertFlagsBeforeSeparator } from './argv'
import { literalArgv, shellJoin } from './shell'

export const GUIDANCE =
  'Run one standalone alis command and read its complete JSON result. ' +
  'Use alis --cwd /absolute/workspace/path instead of cd &&. ' +
  'Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. ' +
  'A Claude background-task ID is not an Alis operation ID.'

const GLOBALS = new Set(['--cwd', '--session-id'])
const BOOLS = new Set(['--json', '--verbose', '--approve', '--confirm-production', '--yes', '--help', '-h'])
const READ_TOP = new Set(['docs', 'doctor', 'whoami', 'version', 'ask'])
const READ_PATHS = new Set(
  [
    ['context', 'view'], ['accounts', 'list'], ['org', 'list'], ['org', 'view'],
    ['product', 'view'], ['environment', 'list'],
    ['operations', 'list'], ['operations', 'describe'], ['operations', 'wait'],
    ['logs', 'build'], ['logs', 'deploy'], ['logs', 'runtime'],
    ['skills', 'suggest'], ['skills', 'search'], ['skills', 'list'], ['skills', 'load'],
    ['blocks', 'list'], ['blocks', 'versions'],
    ['specialist', 'list'], ['specialist', 'read'], ['specialist', 'describe'],
    ['ideate', 'context'], ['ideate', 'specs'], ['ideate', 'spec'],
    ['ideate', 'stream'], ['ideate', 'find'],
  ].map(p => p.join(' ')),
)
// Structured workflows retain the CLI automation tier and production gates.
// Arbitrary process runners and messaging verbs do not get a blanket allow.
const WORKFLOW_TOP = new Set(['define', 'build', 'deploy', 'authorise'])
const WORKFLOW_PATHS = new Set(['packages install', 'packages upgrade', 'packages add'])
const HANDOFF_READ = new Set(['workstation handoff status', 'workstation handoff targets'])
const ALIASES: Record<string, string> = {
  env: 'environment', envs: 'environment', environments: 'environment',
  block: 'blocks', op: 'operations', ops: 'operations',
}
const GUARD_FLAGS = new Set(['--confirm-production', '--approve', '--yes'])
const CONSENT_FLAGS = new Set(['--approve', '--yes'])
const HELP_FLAGS = new Set(['--help', '-h'])
const ALIS_LINE = /(?:^|[;&|\n])\s*alis\s/
const SESSION_ID = /^[A-Za-z0-9_-]{1,128}$/

export const PLAN_DENY = 'This Alis action changes state. Finish the plan and obtain execution approval first.'
export const ASK_REASON = 'Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.'
export const ALLOW_REASON = 'Alis structured CLI workflow; CLI automation and production gates remain in force.'

/** What the classic PreToolUse payload gives decide(), as plain fields. */
export type GateInput = {
  toolName?: unknown
  toolInput?: unknown
  permissionMode?: unknown
  sessionId?: unknown
  /** The ALIS_ALLOWED_SUBCMDS variable, space-separated top-level commands. */
  allowedSubcmds?: string
}

/**
 * decide()'s answer. `matched` is false when the command is not an `alis`
 * line at all (the Python hook prints nothing); otherwise the fields map
 * one to one onto the classic PreToolUse output.
 */
export type GateDecision =
  | { matched: false }
  | {
      matched: true
      decision?: 'allow' | 'ask' | 'deny'
      reason?: string
      updatedInput?: Record<string, unknown>
      additionalContext?: string
    }

/** The first `depth` command words after `alis`, global flags skipped, aliases resolved. */
export function commandPath(argv: readonly string[], depth = 2): string[] {
  const words: string[] = []
  let i = 1
  while (i < argv.length && words.length < depth) {
    const token = argv[i] as string
    if (token === '--') break
    const flag = token.split('=')[0] as string
    if (GLOBALS.has(flag)) {
      i += token.includes('=') ? 1 : 2
      continue
    }
    if (BOOLS.has(flag)) {
      i += 1
      continue
    }
    if (token.startsWith('-')) break
    words.push(token)
    i += 1
  }
  if (words.length > 0) words[0] = ALIASES[words[0] as string] ?? (words[0] as string)
  return words
}

export function decide(input: GateInput): GateDecision {
  const toolInput = input.toolInput ?? {}
  if (!isRecord(toolInput)) return { matched: false }
  const command = toolInput['command'] ?? ''
  if ((input.toolName ?? 'Bash') !== 'Bash' || typeof command !== 'string') return { matched: false }
  if (!ALIS_LINE.test(command)) return { matched: false }

  let argv = literalArgv(command)
  if (!argv) return { matched: true, additionalContext: GUIDANCE }
  const path = commandPath(argv)
  if (path.length === 0) return { matched: true }
  const top = path[0] as string
  const allowed = (input.allowedSubcmds ?? '').split(/\s+/).filter(Boolean)
  const separator = argv.indexOf('--')
  const options = argv.slice(1, separator === -1 ? undefined : separator)
  const flags = new Set(options.filter(a => a.startsWith('-')).map(a => a.split('=')[0] as string))
  const hasAny = (set: Set<string>) => [...flags].some(f => set.has(f))

  let guarded = hasAny(GUARD_FLAGS)
  guarded ||= top === 'blocks' && options.includes('uninstall')
  guarded ||= top === 'environment' && (options.includes('destroy') || options.includes('unset'))
  const handoffRead = HANDOFF_READ.has(commandPath(argv, 3).join(' '))
  const readOnly = READ_TOP.has(top) || READ_PATHS.has(path.join(' ')) || handoffRead || hasAny(HELP_FLAGS)

  const result: GateDecision & { matched: true } = { matched: true }
  if (input.permissionMode === 'plan' && (guarded || !readOnly)) {
    return { ...result, decision: 'deny', reason: PLAN_DENY }
  }
  if (guarded) {
    result.decision = 'ask'
    result.reason = ASK_REASON
    // Native confirmation displays this modified command. Execution then
    // satisfies the CLI's non-production confirmation once. Never add the
    // production flag: the CLI must first resolve its exact target/version.
    if (!hasAny(CONSENT_FLAGS)) argv = insertFlagsBeforeSeparator(argv, ['--approve'])
  } else if (allowed.length > 0 && !allowed.includes(top)) {
    return { matched: false }
  } else if (readOnly || WORKFLOW_TOP.has(top) || WORKFLOW_PATHS.has(path.join(' '))) {
    result.decision = 'allow'
    result.reason = ALLOW_REASON
  } else {
    return result
  }
  // Identity travels with this call, never a shared file, and grants nothing.
  const sid = input.sessionId
  if (typeof sid === 'string' && SESSION_ID.test(sid) && !flags.has('--session-id')) {
    argv = insertFlagsBeforeSeparator(argv, ['--session-id', sid])
  }
  const updated = { ...toolInput, command: shellJoin(argv) }
  if (updated['command'] !== command) result.updatedInput = updated
  return result
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
