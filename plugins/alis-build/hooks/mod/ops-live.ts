// A live line under a running `alis operations wait <op>` Bash row. The
// engine shows no output while a tool runs, so the module runs its own
// `alis operations wait <op> --json` beside it and shows each progress line
// as the CLI streams it, and the outcome once it prints one. Where that
// cannot start, or ends before the call does (the CLI detached), it polls
// `alis operations describe <op> --json` on its clock instead. The ToolUse
// render hook (ops-render.tsx) draws the line from this state while the row
// runs.
import type { Host } from './host'
import { alisCallOf, operationStateOf, type OperationState, progressEventsOf } from './ops'

/** How often the row is redrawn (the elapsed counter), in milliseconds. */
export const TICK_MS = 1_000
/** Every how many ticks the operation is described. */
export const POLL_EVERY = 3
const DESCRIBE_TIMEOUT_MS = 5_000

export type LiveWait = { operation: string; startedAt: number; status: string; progress?: string }

const live = new Map<string, LiveWait>()

/** What a running call waits on, for its row; undefined once it resolved. */
export function liveOf(toolUseId: unknown): LiveWait | undefined {
  return typeof toolUseId === 'string' ? live.get(toolUseId) : undefined
}

/** The first live wait among a folded group's calls, for the group's row. */
export function liveAmong(calls: ReadonlyArray<{ tool_use_id?: string; isRunning: boolean }>): LiveWait | undefined {
  for (const call of calls) {
    const wait = call.isRunning ? liveOf(call.tool_use_id) : undefined
    if (wait) return wait
  }
  return undefined
}

type Envelope = { tool_use_id?: unknown; command?: unknown }

/**
 * Runs the call through `next` and, while it runs, keeps its row's live
 * state current when it waits on an operation. Never changes the call or
 * its result.
 */
export function watchAlisCall<E extends object, R>(host: Host, e: E, next: (e: E) => Promise<R>, signal: AbortSignal): Promise<R> {
  const { tool_use_id, command } = e as Envelope
  const call = alisCallOf(command)
  const pending = next(e)
  if (call?.kind !== 'wait' || typeof tool_use_id !== 'string') return pending

  const state: LiveWait = { operation: call.operation, startedAt: Date.now(), status: 'running' }
  live.set(tool_use_id, state)
  let inFlight = false
  let stopped = false
  let ticks = 0

  let streaming = false
  let endStream: (() => void) | null = null

  const poll = async () => {
    if (inFlight || stopped) return
    inFlight = true
    try {
      const run = await host.run(['alis', 'operations', 'describe', state.operation, '--json'], { timeoutMs: DESCRIBE_TIMEOUT_MS })
      const described = run.exitCode === 0 ? operationStateOf(run.stdout) : null
      if (described) state.status = statusOf(described)
    } catch (error) {
      host.debug(`ops: describe ${state.operation} failed: ${String(error)}`)
    } finally {
      inFlight = false
    }
    if (!stopped) host.invalidate()
  }
  // The CLI's own progress lines, while its stream lasts. Leaving the loop
  // (the call ended, or the stream did) ends the child.
  const follow = async () => {
    const stream = host.spawn(['alis', 'operations', 'wait', state.operation, '--json'])
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
        const progress = progressEventsOf(stderr.slice(0, cut)).findLast(event => event.progress)?.progress
        stderr = stderr.slice(cut + 1)
        if (progress && progress !== state.progress) {
          state.progress = progress
          host.invalidate()
        }
      }
      const outcome = operationStateOf(stdout)
      if (outcome && !stopped) {
        state.status = statusOf(outcome)
        host.invalidate()
      }
    } catch (error) {
      host.debug(`ops: following ${state.operation} failed: ${String(error)}`)
    } finally {
      streaming = false
      endStream = null
    }
  }

  const cancel = host.every(TICK_MS, () => {
    if (stopped) return
    host.invalidate()
    if (!streaming && ++ticks % POLL_EVERY === 0) void poll()
  })
  const stop = () => {
    if (stopped) return
    stopped = true
    cancel()
    endStream?.()
    live.delete(tool_use_id)
    host.invalidate()
  }
  signal.addEventListener('abort', stop, { once: true })
  void poll()
  void follow()
  return pending.finally(stop)
}

function statusOf(state: OperationState): string {
  return state.error ? `failed: ${state.error}` : state.done ? `done${state.version ? ` → ${state.version}` : ''}` : (state.status ?? 'running')
}

export function elapsedOf(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
