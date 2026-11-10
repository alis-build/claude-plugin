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
import type { SavedOp } from '../../types'
import type { Host } from './host'
import { acceptsClientCall } from './health'
import { alisCallOf, type BashOutput, operationStateOf, type OperationState, progressEventsOf, watchEventsOf } from './ops'
import { defineOf, type DefineView, foldLineOf, isDefine, type OpView, productOf, viewOf } from './ops-progress'

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
  /** A define's packages, in place of `view`. */
  define?: DefineView
  /** define | build | deploy, once the CLI has said it. */
  kind?: string
  /** Environment display names by id. */
  names: Record<string, string>
  /** The last snapshot, kept to read again once names arrive. */
  raw?: unknown
  /** The call went to the background: the row follows the operation until it ends. */
  background?: boolean
  /** An `--async` start: the call returned at once and the operation is followed from the band alone. */
  detached?: boolean
  /** How the operation ended, once it has. */
  result?: OperationState
  /** The call itself was interrupted (Esc), not the operation. */
  interrupted?: boolean
}

const live = new Map<string, LiveWait>()
const finished = new Map<string, LiveWait>()
const namesByProduct = new Map<string, Promise<Record<string, string>>>()

const kept = ([id, { raw: _raw, ...wait }]: [string, LiveWait]): SavedOp => ({ id, wait })

/** A saved call read back, or null when it is not one this code can draw. */
function waitOf(saved: SavedOp | undefined): LiveWait | null {
  const w = saved?.wait
  if (!saved || typeof saved.id !== 'string' || !w || typeof w !== 'object') return null
  if (typeof w['verb'] !== 'string' || typeof w['startedAt'] !== 'number' || typeof w['status'] !== 'string') return null
  if (w['operation'] !== null && typeof w['operation'] !== 'string') return null
  if (w['target'] !== null && typeof w['target'] !== 'string') return null
  const names = w['names'] && typeof w['names'] === 'object' ? (w['names'] as Record<string, string>) : {}
  return { ...(w as unknown as LiveWait), names }
}

/** The followed calls, for a reload of this code to pick up (saved.ts). */
export function opsSnapshot(): { live: SavedOp[]; finished: SavedOp[] } {
  return { live: [...live].map(kept), finished: [...finished].map(kept) }
}

/** Saved calls still running when the code was reloaded, until resumeOps follows them again. */
let resumable: { id: string; wait: LiveWait }[] = []

/** Puts saved calls back: the ended ones for their folded rows, the running ones for resumeOps. */
export function restoreOps(saved: { live?: SavedOp[]; finished?: SavedOp[] } | undefined): void {
  const read = (list: SavedOp[] | undefined) => (Array.isArray(list) ? list : []).flatMap(item => {
    const wait = waitOf(item)
    return wait && !live.has(item.id) && !finished.has(item.id) ? [{ id: item.id, wait }] : []
  })
  for (const { id, wait } of read(saved?.finished)) finished.set(id, wait)
  resumable = read(saved?.live)
}

/**
 * Follows again the operations that were running when this code was
 * reloaded. The hook that held each call is gone with the old code, so the
 * row lives on the clock from here, as a background call's does.
 */
export function resumeOps(host: Host, now = Date.now()): void {
  const pending = resumable
  resumable = []
  for (const { id, wait } of pending) {
    if (live.has(id) || now - wait.startedAt > BACKGROUND_MAX_MS) continue
    const state: LiveWait = { ...wait, background: true }
    live.set(id, state)
    watcherOf(host, id, state).start()
  }
}

/** Forgets every followed call (tests). */
export function forgetOps(): void {
  live.clear()
  finished.clear()
  resumable = []
}

/** What a running call waits on, for its row; undefined once it resolved. */
export function liveOf(toolUseId: unknown): LiveWait | undefined {
  return typeof toolUseId === 'string' ? live.get(toolUseId) : undefined
}

/** What an ended call last saw, for its folded row. */
export function finishedOf(toolUseId: unknown): LiveWait | undefined {
  return typeof toolUseId === 'string' ? finished.get(toolUseId) : undefined
}

/** One alis call of a folded group: still running, or ended. */
export type GroupOp = { id: string; live: LiveWait; finished?: never } | { id: string; finished: LiveWait; live?: never }

/**
 * Every alis call among a folded group's calls, in the group's order, so
 * each gets its own row. Parallel builds fold into one group, and a single
 * row would hide every operation but one.
 */
export function opsAmong(calls: ReadonlyArray<{ tool_use_id?: string; isRunning: boolean }>): GroupOp[] {
  const ops: GroupOp[] = []
  for (const call of calls) {
    const id = call.tool_use_id
    if (typeof id !== 'string') continue
    const wait = live.get(id)
    if (wait && (call.isRunning || wait.background)) {
      ops.push({ id, live: wait })
      continue
    }
    const done = finished.get(id)
    if (done) ops.push({ id, finished: done })
  }
  return ops
}

/**
 * The operations nobody's tool call is waiting on, oldest first: a call sent
 * to the background, or an --async start. One a running call already
 * follows is left to that call's row.
 */
export function backgroundOps(): LiveWait[] {
  const watched = new Set<string>()
  for (const wait of live.values()) if (!wait.background && wait.operation) watched.add(wait.operation)
  const seen = new Set<string>()
  const out: LiveWait[] = []
  for (const wait of live.values()) {
    if (!wait.background) continue
    if (wait.operation) {
      if (watched.has(wait.operation) || seen.has(wait.operation)) continue
      seen.add(wait.operation)
    }
    out.push(wait)
  }
  return out
}

/** How a followed operation ended, in one line (the folded row's words). */
export function endedTextOf(wait: LiveWait): string {
  const failed = !!wait.result?.error || !!wait.view?.error || !!wait.view?.stages.some(stage => stage.state === 'failed') || !!wait.define?.failed
  const fold = foldLineOf({
    ...(wait.view ? { view: wait.view } : {}),
    outcome: failed ? 'failed' : 'done',
    ...(wait.version ? { version: wait.version } : {}),
    verb: wait.kind ?? wait.verb,
    ...(wait.result?.error ? { error: wait.result.error } : {}),
  })
  return fold.sub ? `${fold.text} ${fold.sub}` : fold.text
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
  // A dry run starts no operation.
  if (call.kind === 'start' && call.verb === 'define' && call.dryRun) return pending
  // An --async start returns at once with the operation's name: it is
  // followed from then on, for the band above the prompt.
  const detached = call.kind === 'start' && call.async

  const state: LiveWait =
    call.kind === 'wait'
      ? { operation: call.operation, target: null, verb: 'wait', startedAt: Date.now(), status: 'running', names: {} }
      : { operation: null, target: call.target, verb: call.verb, ...(call.version ? { version: call.version } : {}), startedAt: Date.now(), status: 'running', names: {} }
  if (!detached) live.set(tool_use_id, state)
  const { start, stop, interrupt } = watcherOf(host, tool_use_id, state)
  if (detached) {
    return pending.then(result => {
      const started = operationStateOf(bashOf(result)?.stdout)
      // Not started, or already over: there is nothing to follow.
      if (!started?.name || started.done || started.error) return result
      state.operation = started.name
      if (started.version) state.version = started.version
      state.background = true
      state.detached = true
      live.set(tool_use_id, state)
      start()
      host.invalidate()
      return result
    })
  }
  signal.addEventListener('abort', interrupt, { once: true })
  start()
  return pending.then(
    result => {
      // The call's own ending outranks the watcher's: a folded group has no
      // output of its own to read, and the watcher may not have seen the end.
      const own = bashOf(result)
      const outcome = operationStateOf(own?.stdout)
      if (outcome) state.result = outcome
      if (own?.interrupted === true) state.interrupted = true
      // Still followed (the watcher has not stopped) and sent to the background.
      if (live.get(tool_use_id) === state && isBackground(e, result) && !state.result) {
        // The call's own dispatch is over; the row now lives on the clock.
        signal.removeEventListener('abort', interrupt)
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

/**
 * What follows one call's operation: the CLI's stream while it lasts, a
 * describe on the clock otherwise. `start` begins it, `stop` ends it and
 * keeps what it saw for the folded row.
 */
function watcherOf(host: Host, tool_use_id: string, state: LiveWait): { start: () => void; stop: () => void; interrupt: () => void } {
  let inFlight = false
  let listing = false
  // Whether the CLI answers `operations list --call`: unknown until asked.
  let byCall: boolean | undefined
  let stopped = false
  let ticks = 0
  let streaming = false
  let following = false
  let endStream: (() => void) | null = null

  const read = (raw: unknown) => {
    // A define has no images or deployments: its packages are its progress.
    if ((state.kind ?? (state.verb === 'define' ? 'define' : undefined)) === 'define' || (!state.kind && isDefine(raw))) {
      const define = defineOf(raw)
      if (!define) return false
      state.kind = 'define'
      state.raw = raw
      state.define = define
      if (define.version && !state.version) state.version = define.version
      return true
    }
    const view = viewOf(raw, state.names, state.kind)
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
    // A CLI with `operations watch` streams exactly this: one complete event
    // per change on stdout, failed reads retried. An older one is followed
    // through the wait's --verbose snapshots on stderr.
    const watching = await acceptsClientCall(host).catch(() => false)
    if (stopped || !state.operation) {
      following = false
      return
    }
    const stream = host.spawn(watching ? ['alis', 'operations', 'watch', state.operation] : ['alis', 'operations', 'wait', state.operation, '--json', '--verbose'])
    endStream = () => void stream.return(undefined as never).catch(() => undefined)
    let stdout = ''
    let stderr = ''
    let ended: OperationState | null = null
    try {
      for await (const { stream: pipe, text } of stream) {
        if (stopped) break
        streaming = true
        if (watching) {
          if (pipe !== 'stdout') continue
          stdout += text
          const cut = stdout.lastIndexOf('\n')
          if (cut === -1) continue
          const event = watchEventsOf(stdout.slice(0, cut)).at(-1)
          stdout = stdout.slice(cut + 1)
          if (!event) continue
          if (event.kind) state.kind = event.kind
          read(event.snapshot)
          if (event.done) {
            ended = { name: event.operation, done: true, ...(event.status ? { status: event.status } : {}), ...(event.version ? { version: event.version } : {}), ...(event.error ? { error: event.error } : {}) }
          }
          host.invalidate()
          continue
        }
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
      const outcome = watching ? ended : operationStateOf(stdout)
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
      // The operation this very call started, where the CLI recorded the
      // call (--client-call, cli-gate.ts). An older CLI refuses the flag and
      // a call the gate did not name lists nothing: both fall through.
      if (!state.operation && byCall !== false) {
        const run = await host.run(['alis', 'operations', 'list', '--call', tool_use_id, '--json'], { timeoutMs: RUN_TIMEOUT_MS })
        byCall = run.exitCode === 0
        const mine = byCall ? listedOf(run.stdout)[0] : undefined
        if (mine) {
          state.operation = mine.name
          if (mine.target) state.target = mine.target
        }
      }
      if (!state.operation || !state.target) {
        const run = await host.run(['alis', 'operations', 'list', '--json'], { timeoutMs: RUN_TIMEOUT_MS })
        const listed = run.exitCode === 0 ? listedOf(run.stdout) : []
        if (state.operation) {
          const mine = listed.find(op => op.name === state.operation)
          if (mine?.target) state.target = mine.target
        } else if (state.target) {
          // By target and start time: a guess, and only for a CLI that does
          // not record the call. Without a target there is nothing to match.
          const mine = listed
            .filter(op => op.target === state.target && op.startedAt >= state.startedAt - START_SLACK_MS)
            .sort((a, b) => b.startedAt - a.startedAt)[0]
          if (mine) state.operation = mine.name
        }
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
    if (state.background) {
      // Nobody is waiting on a background operation: say that it ended.
      host.notify(endedTextOf(state), 'Alis')
      stop()
    }
  }

  let cancel = () => {}
  const start = () => {
    cancel = host.every(TICK_MS, () => {
      if (stopped) return
      if (state.background && Date.now() - state.startedAt > BACKGROUND_MAX_MS) return stop()
      host.invalidate()
      if (++ticks % POLL_EVERY !== 0) return
      if (!state.operation) void identify()
      else if (!streaming) void poll()
    })
    void identify()
    void follow()
  }
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
  const interrupt = () => {
    state.interrupted = true
    stop()
  }
  return { start, stop, interrupt }
}

/** The Bash result inside what `tool.call` resolved with. */
function bashOf(result: unknown): BashOutput | undefined {
  const r = result && typeof result === 'object' ? (result as { result?: unknown }).result : undefined
  return r && typeof r === 'object' ? (r as BashOutput) : undefined
}

function statusOf(state: OperationState): string {
  return state.error ? `failed: ${state.error}` : state.done ? `done${state.version ? ` → ${state.version}` : ''}` : (state.status ?? 'running')
}
