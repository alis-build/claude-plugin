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
  | { kind: 'start'; verb: string; target: string | null; async: boolean; version?: string }

const STREAMING_VERBS = new Set(['define', 'build', 'deploy'])

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
    const call: AlisCall = { kind: 'start', verb, target: words[1] ?? null, async: argv.includes('--async') }
    const flag = argv.findIndex(word => word === '--version' || word.startsWith('--version='))
    const version = flag === -1 ? undefined : argv[flag]?.includes('=') ? argv[flag]?.slice('--version='.length) : argv[flag + 1]
    if (version) call.version = version
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
}

export function operationStateOf(stdout: unknown): OperationState | null {
  if (typeof stdout !== 'string') return null
  const text = stdout.trim()
  if (!text.startsWith('{')) return null
  try {
    const raw = JSON.parse(text)
    if (!raw || typeof raw !== 'object') return null
    const state: OperationState = {}
    for (const key of ['name', 'status', 'version', 'error'] as const) {
      if (typeof raw[key] === 'string' && raw[key]) state[key] = raw[key]
    }
    if (typeof raw.done === 'boolean') state.done = raw.done
    if (state.error === undefined && raw.error && typeof raw.error === 'object' && typeof raw.error.message === 'string') state.error = raw.error.message
    return state
  } catch {
    return null
  }
}

/** A Bash tool result as the engine records it. */
export type BashOutput = { stdout?: unknown; stderr?: unknown; interrupted?: unknown }
