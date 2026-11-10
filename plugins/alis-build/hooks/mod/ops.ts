// Alis operations as the CLI shows them under --json: progress as NDJSON
// lines on stderr ({ elapsed, progress?, warning?, operation?, next? }, one
// per appended progress line), the result as one JSON object on stdout.
// This file reads both shapes; ops-progress.ts reads the snapshots, and
// ops-live.ts and ops-render.tsx draw them.
import { commandPath } from './cli-gate'
import { literalArgv } from './shell'

/** One stderr progress line of a streamed alis operation. */
export type ProgressEvent = {
  elapsed: string
  progress?: string
  warning?: string
  operation?: string
  next?: string
}

/** What an `alis …` Bash command is about, when it streams an operation. */
export type AlisCall =
  | { kind: 'wait'; operation: string }
  | { kind: 'start'; verb: string; target: string | null; async: boolean; version?: string; dryRun?: boolean }

const STREAMING_VERBS = new Set(['define', 'build', 'deploy'])

/**
 * The flags of `define`, `build` and `deploy` (and the global ones) that take
 * a value, so the word after one is never read as the target. Every other
 * flag of theirs is a boolean.
 */
const VALUE_FLAGS = new Set([
  '--cwd', '--session-id', '--client-plugin', '--client-call',
  '-e', '--environment', '--version', '--commit', '--branch', '--build-path', '--retag-path',
  '--definition-version', '--install-language', '--poll-interval', '--timeout',
])

/** The words of a command that are not flags or a flag's value, the verb first. */
function positionalsOf(argv: readonly string[]): string[] {
  const words: string[] = []
  for (let i = 1; i < argv.length; i++) {
    const token = argv[i] as string
    if (token === '--') break
    if (!token.startsWith('-')) words.push(token)
    else if (!token.includes('=') && VALUE_FLAGS.has(token)) i++
  }
  return words
}

/** Reads a literal `alis …` command line; null when it streams no operation. */
export function alisCallOf(command: unknown): AlisCall | null {
  if (typeof command !== 'string') return null
  const argv = literalArgv(command)
  if (!argv) return null
  // commandPath skips global flags and their values, so the words after the
  // verb are positionals (`operations wait <op>`, `build <target>`).
  const words = commandPath(argv, 3)
  if (words[0] === 'operations' && words[1] === 'wait') {
    const operation = words[2]
    return operation ? { kind: 'wait', operation } : null
  }
  const verb = words[0]
  if (verb && STREAMING_VERBS.has(verb)) {
    // The target may follow the flags (`alis deploy -e dev <target>`), where
    // commandPath stops reading; with no target the CLI takes the folder's.
    const call: AlisCall = { kind: 'start', verb, target: positionalsOf(argv)[1] ?? null, async: argv.includes('--async') }
    const flag = argv.findIndex(word => word === '--version' || word.startsWith('--version='))
    const version = flag === -1 ? undefined : argv[flag]?.includes('=') ? argv[flag]?.slice('--version='.length) : argv[flag + 1]
    if (version) call.version = version
    if (argv.includes('--dry-run')) call.dryRun = true
    return call
  }
  return null
}

/** The progress events in a stderr text, in order; other lines are skipped. */
export function progressEventsOf(stderr: unknown): ProgressEvent[] {
  if (typeof stderr !== 'string') return []
  const events: ProgressEvent[] = []
  for (const line of stderr.split('\n')) {
    const text = line.trim()
    if (!text.startsWith('{')) continue
    try {
      const raw = JSON.parse(text)
      if (raw && typeof raw === 'object' && typeof raw.elapsed === 'string') {
        const event: ProgressEvent = { elapsed: raw.elapsed }
        for (const key of ['progress', 'warning', 'operation', 'next'] as const) {
          if (typeof raw[key] === 'string' && raw[key]) event[key] = raw[key]
        }
        events.push(event)
      }
    } catch {
      // Not a progress line.
    }
  }
  return events
}

/** The common top-level fields of an operation's JSON (start, wait, describe). */
export type OperationState = {
  name?: string
  done?: boolean
  status?: string
  version?: string
  error?: string
  /** define | build | deploy | setup | block, from a CLI that says it. */
  kind?: string
}

export function operationStateOf(stdout: unknown): OperationState | null {
  if (typeof stdout !== 'string') return null
  const text = stdout.trim()
  if (!text.startsWith('{')) return null
  try {
    const raw = JSON.parse(text)
    if (!raw || typeof raw !== 'object') return null
    const state: OperationState = {}
    for (const key of ['name', 'status', 'version', 'error', 'kind'] as const) {
      if (typeof raw[key] === 'string' && raw[key]) state[key] = raw[key]
    }
    if (typeof raw.done === 'boolean') state.done = raw.done
    if (state.error === undefined && raw.error && typeof raw.error === 'object' && typeof raw.error.message === 'string') state.error = raw.error.message
    return state
  } catch {
    return null
  }
}

/**
 * One line of `alis operations watch <op>`: the operation as it stands, each
 * time it changes. `snapshot` is its full response (the shape ops-progress.ts
 * reads), with sensitive Terraform outputs already blanked by the CLI.
 */
export type WatchEvent = {
  operation: string
  /** define | build | deploy | setup | block, when the CLI knows it. */
  kind?: string
  done: boolean
  status?: string
  version?: string
  error?: string
  snapshot: unknown
}

/** The watch events in a stdout text, in order; lines that are not one are skipped. */
export function watchEventsOf(stdout: unknown): WatchEvent[] {
  if (typeof stdout !== 'string') return []
  const events: WatchEvent[] = []
  for (const line of stdout.split('\n')) {
    const text = line.trim()
    if (!text.startsWith('{')) continue
    try {
      const raw = JSON.parse(text)
      if (!raw || typeof raw !== 'object' || typeof raw.operation !== 'string' || typeof raw.done !== 'boolean' || !raw.snapshot || typeof raw.snapshot !== 'object') continue
      const event: WatchEvent = { operation: raw.operation, done: raw.done, snapshot: raw.snapshot }
      for (const key of ['kind', 'status', 'version', 'error'] as const) {
        if (typeof raw[key] === 'string' && raw[key]) event[key] = raw[key]
      }
      events.push(event)
    } catch {
      // Not JSON: a partial line, or something else the CLI printed.
    }
  }
  return events
}

/** A Bash tool result as the engine records it. */
export type BashOutput = { stdout?: unknown; stderr?: unknown; interrupted?: unknown }
