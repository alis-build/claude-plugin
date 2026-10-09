// The live row under a running alis operation's Bash call. The engine shows
// no output while a tool runs, so the module follows the operation beside
// it: `alis operations wait <op> --json --verbose`, whose stderr carries a
// full progress snapshot on every change, read into an OpView
// (ops-progress.ts). Where that cannot start, or ends before the call does
// (the CLI detached), it polls `alis operations describe <op> --json
// --verbose` on its clock instead. A blocking `alis build` or `alis deploy`
// names no operation, so its operation is found in `alis operations list`
// by target and start time. The render hooks (ops-render.tsx) draw the row
// from this state while the call runs, and the folded result from what it
// held when the call ended.
import { environmentsOf } from './deploy-dialog'
import type { Host } from './host'
import { alisCallOf, operationStateOf, type OperationState, progressEventsOf } from './ops'
import { type OpView, productOf, viewOf } from './ops-progress'

/** How often the row is redrawn (the clock), in milliseconds. */
export const TICK_MS = 1_000
/** Every how many ticks the operation is described, or looked for. */
export const POLL_EVERY = 3
const RUN_TIMEOUT_MS = 5_000
/** A listed operation counts as the call's when it started this close before it. */
const START_SLACK_MS = 15_000
/** Finished calls kept for their folded rows. */
const KEEP_FINISHED = 40

export type LiveWait = {
  /** Null until a blocking start's operation is found. */
  operation: string | null
  /** The package id, e.g. alis.os.console.v2. */
  target: string | null
  verb: string
  /** --version on a deploy. */
  version?: string
  startedAt: number
  endedAt?: number
  status: string
  /** The CLI's latest lean progress line, when it streams those. */
  progress?: string
  view?: OpView
  /** Environment display names by id. */
  names: Record<string, string>
  /** The last snapshot, kept to read again once names arrive. */
  raw?: unknown
  /** The call went to the background: the row follows the operation until it ends. */
  background?: boolean
  /** How the operation ended, once it has. */
  result?: OperationState
}

const live = new Map<string, LiveWait>()
const finished = new Map<string, LiveWait>()
const namesByProduct = new Map<string, Promise<Record<string, string>>>()

/** What a running call waits on, for its row; undefined once it resolved. */
export function liveOf(toolUseId: unknown): LiveWait | undefined {
  return typeof toolUseId === 'string' ? live.get(toolUseId) : undefined
}

/** What an ended call last saw, for its folded row. */
export function finishedOf(toolUseId: unknown): LiveWait | undefined {
  return typeof toolUseId === 'string' ? finished.get(toolUseId) : undefined
}

/** The first live wait among a folded group's calls, for the group's row. */
export function liveAmong(calls: ReadonlyArray<{ tool_use_id?: string; isRunning: boolean }>): LiveWait | undefined {
  for (const call of calls) {
    const wait = liveOf(call.tool_use_id)
    if (wait && (call.isRunning || wait.background)) return wait
  }
  return undefined
}

/** The last ended alis call among a folded group's calls, for the group's folded line. */
export function finishedAmong(calls: ReadonlyArray<{ tool_use_id?: string }>): LiveWait | undefined {
  for (let i = calls.length - 1; i >= 0; i--) {
    const done = finishedOf(calls[i]?.tool_use_id)
    if (done) return done
  }
  return undefined
}

/** A background call runs on after its tool call returns. */
function isBackground(e: unknown, result: unknown): boolean {
  if ((e as { run_in_background?: unknown }).run_in_background === true) return true
  const r = result && typeof result === 'object' ? (result as { result?: unknown }).result : undefined
  return !!r && typeof r === 'object' && typeof (r as { backgroundTaskId?: unknown }).backgroundTaskId === 'string'
}

/** A background watch gives up after this long. */
const BACKGROUND_MAX_MS = 3 * 60 * 60 * 1000

/** Environment display names of a product, read once per session. */
export function namesFor(host: Host, product: string): Promise<Record<string, string>> {
  let names = namesByProduct.get(product)
  if (!names) {
    names = environmentsOf(host, product).then(list => {
      if (list.length === 0) namesByProduct.delete(product)
      return Object.fromEntries(list.map(env => [env.id, env.displayName]))
    })
    namesByProduct.set(product, names)
  }
  return names
}

/** The JSON snapshots in a `--verbose` stderr text (lines that are not lean events). */
export function snapshotsOf(text: string): unknown[] {
  const out: unknown[] = []
  for (const line of text.split('\n')) {
    const t = line.trim()
    if (!t.startsWith('{')) continue
    try {
      const raw = JSON.parse(t)
      if (raw && typeof raw === 'object' && typeof raw.elapsed !== 'string') out.push(raw)
    } catch {
      // Not JSON.
    }
  }
  return out
}

type Envelope = { tool_use_id?: unknown; command?: unknown }
type Listed = { name: string; target: string | null; startedAt: number }

function listedOf(stdout: string): Listed[] {
  try {
    const raw = JSON.parse(stdout)
    const ops: unknown[] = Array.isArray(raw?.operations) ? raw.operations : []
    return ops.flatMap(item => {
      const op = item && typeof item === 'object' ? (item as Record<string, unknown>) : {}
      if (typeof op['name'] !== 'string') return []
      return [{ name: op['name'], target: typeof op['target'] === 'string' ? op['target'] : null, startedAt: typeof op['startedAt'] === 'string' ? Date.parse(op['startedAt']) : Number.NaN }]
    })
  } catch {
    return []
  }
}

/**
 * Runs the call through `next` and, while it runs, keeps its row's live
 * state current when it is an alis operation. Never changes the call or
 * its result.
 */
export function watchAlisCall<E extends object, R>(host: Host, e: E, next: (e: E) => Promise<R>, signal: AbortSignal): Promise<R> {
  const { tool_use_id, command } = e as Envelope
  const call = alisCallOf(command)
  const pending = next(e)
  if (typeof tool_use_id !== 'string' || !call) return pending
  if (call.kind === 'start' && (call.async || call.verb === 'define')) return pending

  const state: LiveWait =
    call.kind === 'wait'
      ? { operation: call.operation, target: null, verb: 'wait', startedAt: Date.now(), status: 'running', names: {} }
      : { operation: null, target: call.target, verb: call.verb, ...(call.version ? { version: call.version } : {}), startedAt: Date.now(), status: 'running', names: {} }
  live.set(tool_use_id, state)
  let inFlight = false
  let listing = false
  let stopped = false
  let ticks = 0
  let streaming = false
  let following = false
  let endStream: (() => void) | null = null

  const read = (raw: unknown) => {
    const view = viewOf(raw, state.names)
    if (!view) return false
    state.raw = raw
    state.view = view
    if (view.version && !state.version) state.version = view.version
    return true
  }
  const learnNames = async () => {
    const product = state.target ? productOf(state.target) : undefined
    if (!product) return
    const names = await namesFor(host, product).catch(() => ({}))
    if (stopped || Object.keys(names).length === 0) return
    state.names = names
    if (state.raw !== undefined) read(state.raw)
    host.invalidate()
  }
  // The CLI's own snapshots, while its stream lasts. Leaving the loop (the
  // call ended, or the stream did) ends the child.
  const follow = async () => {
    if (following || stopped || !state.operation) return
    following = true
    const stream = host.spawn(['alis', 'operations', 'wait', state.operation, '--json', '--verbose'])
    endStream = () => void stream.return(undefined as never).catch(() => undefined)
    let stdout = ''
    let stderr = ''
    try {
      for await (const { stream: pipe, text } of stream) {
        if (stopped) break
        streaming = true
        if (pipe === 'stdout') {
          stdout += text
          continue
        }
        stderr += text
        const cut = stderr.lastIndexOf('\n')
        if (cut === -1) continue
        const whole = stderr.slice(0, cut)
        stderr = stderr.slice(cut + 1)
        let changed = false
        const snapshot = snapshotsOf(whole).at(-1)
        if (snapshot !== undefined && read(snapshot)) changed = true
        const progress = progressEventsOf(whole).findLast(event => event.progress)?.progress
        if (progress && progress !== state.progress) {
          state.progress = progress
          changed = true
        }
        if (changed) host.invalidate()
      }
      const outcome = operationStateOf(stdout)
      if (outcome && !stopped) {
        if (!state.view) {
          try {
            read(JSON.parse(stdout.trim()))
          } catch {
            // The status below is enough.
          }
        }
        settle(outcome)
      }
    } catch (error) {
      host.debug(`ops: following ${state.operation} failed: ${String(error)}`)
    } finally {
      streaming = false
      following = false
      endStream = null
    }
  }
  // A wait names its operation but not its target; a blocking start names
  // its target but not its operation. `operations list` has both.
  const identify = async () => {
    if (listing || stopped) return
    listing = true
    try {
      const run = await host.run(['alis', 'operations', 'list', '--json'], { timeoutMs: RUN_TIMEOUT_MS })
      const listed = run.exitCode === 0 ? listedOf(run.stdout) : []
      if (state.operation) {
        const mine = listed.find(op => op.name === state.operation)
        if (mine?.target) state.target = mine.target
      } else {
        const mine = listed
          .filter(op => op.target === state.target && !(op.startedAt < state.startedAt - START_SLACK_MS))
          .sort((a, b) => b.startedAt - a.startedAt)[0]
        if (mine) state.operation = mine.name
      }
    } catch (error) {
      host.debug(`ops: listing operations failed: ${String(error)}`)
    } finally {
      listing = false
    }
    if (stopped) return
    if (state.target) void learnNames()
    if (state.operation) void follow()
  }
  const poll = async () => {
    if (inFlight || stopped || !state.operation) return
    inFlight = true
    try {
      const run = await host.run(['alis', 'operations', 'describe', state.operation, '--json', '--verbose'], { timeoutMs: RUN_TIMEOUT_MS })
      if (run.exitCode === 0) {
        try {
          read(JSON.parse(run.stdout))
        } catch {
          // Not JSON: the status below still reads what it can.
        }
        const described = operationStateOf(run.stdout)
        if (described?.done || described?.error) settle(described)
        else if (described) state.status = statusOf(described)
      }
    } catch (error) {
      host.debug(`ops: describe ${state.operation} failed: ${String(error)}`)
    } finally {
      inFlight = false
    }
    if (!stopped) host.invalidate()
  }

  // The operation ended: say so, and a background row stops following it.
  function settle(outcome: OperationState) {
    state.result = outcome
    state.status = statusOf(outcome)
    if (state.view) state.view = { ...state.view, done: outcome.done ?? state.view.done, ...(outcome.error ? { error: outcome.error } : {}), ...(outcome.version ? { version: outcome.version } : {}) }
    host.invalidate()
    if (state.background) stop()
  }

  const cancel = host.every(TICK_MS, () => {
    if (stopped) return
    if (state.background && Date.now() - state.startedAt > BACKGROUND_MAX_MS) return stop()
    host.invalidate()
    if (++ticks % POLL_EVERY !== 0) return
    if (!state.operation) void identify()
    else if (!streaming) void poll()
  })
  const stop = () => {
    if (stopped) return
    stopped = true
    cancel()
    endStream?.()
    live.delete(tool_use_id)
    state.endedAt = Date.now()
    finished.set(tool_use_id, state)
    while (finished.size > KEEP_FINISHED) finished.delete(finished.keys().next().value as string)
    host.invalidate()
  }
  signal.addEventListener('abort', stop, { once: true })
  void identify()
  void follow()
  return pending.then(
    result => {
      if (!stopped && isBackground(e, result) && !state.result) {
        // The call's own dispatch is over; the row now lives on the clock.
        signal.removeEventListener('abort', stop)
        state.background = true
        host.invalidate()
      } else stop()
      return result
    },
    error => {
      stop()
      throw error
    },
  )
}

function statusOf(state: OperationState): string {
  return state.error ? `failed: ${state.error}` : state.done ? `done${state.version ? ` → ${state.version}` : ''}` : (state.status ?? 'running')
}
