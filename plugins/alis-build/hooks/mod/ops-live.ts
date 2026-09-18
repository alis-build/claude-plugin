// A live line under a running `alis operations wait <op>` Bash row. The
// engine shows no output while a tool runs, so the module polls
// `alis operations describe <op> --json` on its own clock and keeps the
// row's notice current; the line goes away when the call resolves (the
// result row then draws the summary, see ops-render.tsx).
import type { Host } from './host'
import { alisCallOf, operationStateOf } from './ops'

export const POLL_MS = 3_000
const DESCRIBE_TIMEOUT_MS = 5_000

type Envelope = { tool_use_id?: unknown; command?: unknown }

/**
 * Runs the call through `next` and, while it runs, keeps a status line under
 * its row when it waits on an operation. Never changes the call or its result.
 */
export function watchAlisCall<E extends object, R>(host: Host, e: E, next: (e: E) => Promise<R>, signal: AbortSignal): Promise<R> {
  const { tool_use_id, command } = e as Envelope
  const call = alisCallOf(command)
  const pending = next(e)
  if (call?.kind !== 'wait' || typeof tool_use_id !== 'string') return pending

  const operation = call.operation
  const startedAt = Date.now()
  let inFlight = false
  let stopped = false
  let lastStatus = 'running'

  const show = () => host.notice(tool_use_id, `alis: waiting on ${operation} · ${elapsedOf(Date.now() - startedAt)} · ${lastStatus}`)
  const poll = async () => {
    if (inFlight || stopped) return
    inFlight = true
    try {
      const run = await host.run(['alis', 'operations', 'describe', operation, '--json'], { timeoutMs: DESCRIBE_TIMEOUT_MS })
      const state = run.exitCode === 0 ? operationStateOf(run.stdout) : null
      if (state) lastStatus = state.error ? `failed: ${state.error}` : state.done ? `done${state.version ? ` → ${state.version}` : ''}` : (state.status ?? 'running')
    } catch (error) {
      host.debug(`ops: describe ${operation} failed: ${String(error)}`)
    } finally {
      inFlight = false
    }
    if (!stopped) show()
  }
  const cancel = host.every(POLL_MS, () => void poll())
  const stop = () => {
    if (stopped) return
    stopped = true
    cancel()
    host.notice(tool_use_id, undefined)
  }
  signal.addEventListener('abort', stop, { once: true })
  show()
  void poll()
  return pending.finally(stop)
}

export function elapsedOf(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
