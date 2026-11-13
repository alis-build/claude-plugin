// The alis CLI as the module itself calls it (not through Claude's Bash
// tool, so the permission gate adds nothing): the session and the plugin are
// named on the call, as the gate names them on Claude's.
import type { Host } from './host'
import { clientPluginOf } from './health'

const SESSION_ID = /^[A-Za-z0-9_-]{1,128}$/

/** `argv` with --session-id and --client-plugin, where each is known. */
export async function withIdentity(host: Host, argv: readonly string[]): Promise<string[]> {
  const [sid, plugin] = await Promise.all([host.sessionId().catch(() => ''), clientPluginOf(host).catch(() => undefined)])
  return [...argv, ...(SESSION_ID.test(sid) ? ['--session-id', sid] : []), ...(plugin ? ['--client-plugin', plugin] : [])]
}

/** The one JSON object a `--json` command printed, or undefined. */
export function jsonOf(stdout: string): Record<string, unknown> | undefined {
  const text = stdout.trim()
  if (!text.startsWith('{')) return undefined
  try {
    const raw: unknown = JSON.parse(text)
    return raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : undefined
  } catch {
    return undefined
  }
}

/** The CLI's own words for a failure: its error envelope's message, else the last line it printed. */
export function failureOf(run: { stdout: string; stderr: string; exitCode: number | null }): string {
  const error = jsonOf(run.stdout)?.['error']
  if (error && typeof error === 'object' && typeof (error as { message?: unknown }).message === 'string') return (error as { message: string }).message
  const last = (run.stderr.trim() || run.stdout.trim()).split('\n').at(-1)
  return last ? last.slice(0, 300) : `exit ${run.exitCode}`
}
