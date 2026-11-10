// Local hook observations for `alis doctor`, the same record hooks/health.py
// writes: no command text, transcript or credentials. Best effort, never
// throws; a hook that could not observe still answers.
import type { Host } from './host'
import { PLUGIN_VERSION } from './meta'

/** Where `alis` is on PATH, or '' when it is not (a few milliseconds, as shutil.which was per hook process). */
export function cliPathOf(host: Host): Promise<string> {
  return host
    .run(['/usr/bin/which', 'alis'], { timeoutMs: 3000 })
    .then(r => (r.exitCode === 0 ? r.stdout.trim() : ''), () => '')
}

/**
 * The CLI accepts `--client-plugin <id>/<version>` from this version and
 * reports it with every command's outcome; older CLIs reject the unknown flag.
 */
export const CLIENT_PLUGIN_SINCE: readonly [number, number, number] = [1, 165, 6]

/**
 * `claude/<plugin version>` for the CLI's --client-plugin flag when the CLI's
 * own detection cache (~/.alis/versions-cache.json, written by the binary that
 * last ran a version check) says the installed CLI accepts it; undefined when
 * the cache is missing, unreadable or names an older CLI. Without the flag the
 * CLI still attributes the plugin from the health record observe() writes.
 */
export async function clientPluginOf(host: Host): Promise<string | undefined> {
  return (await cliSince(host, CLIENT_PLUGIN_SINCE)) ? `claude/${PLUGIN_VERSION}` : undefined
}

/**
 * The CLI accepts `--client-call <tool call id>` from this version, records
 * it beside the operation a command starts, and answers
 * `alis operations list --call <id>`; older CLIs reject the unknown flag.
 */
export const CLIENT_CALL_SINCE: readonly [number, number, number] = [1, 188, 0]

/** Whether the installed CLI takes --client-call (the same cache clientPluginOf reads). */
export function acceptsClientCall(host: Host): Promise<boolean> {
  return cliSince(host, CLIENT_CALL_SINCE)
}

/** Whether the CLI's own detection cache names an installed CLI at or past `since`; false when it cannot be read. */
async function cliSince(host: Host, since: readonly [number, number, number]): Promise<boolean> {
  try {
    const home = await host.home()
    if (!home) return false
    const cache = JSON.parse(await host.readFile(`${home}/.alis/versions-cache.json`)) as { cliVersion?: unknown }
    const installed = parseVersion(cache.cliVersion)
    return !!installed && compareVersions(installed, since) >= 0
  } catch {
    return false
  }
}

/** `1.166.3`, `v1.166.3` or `1.166.3-rc1` as [major, minor, patch]; null otherwise. */
export function parseVersion(text: unknown): [number, number, number] | null {
  if (typeof text !== 'string') return null
  const m = /^v?(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(text)
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null
}

function compareVersions(a: readonly [number, number, number], b: readonly [number, number, number]): number {
  for (let i = 0; i < 3; i += 1) {
    const d = (a[i] as number) - (b[i] as number)
    if (d !== 0) return d
  }
  return 0
}

export async function observe(host: Host, filename: string, fields: Record<string, unknown>): Promise<void> {
  try {
    const home = await host.home()
    if (!home) return
    const root = (await host.pluginRoot()) ?? ''
    const record = { root, version: PLUGIN_VERSION, observedAt: new Date().toISOString(), cliPath: await cliPathOf(host), ...fields }
    await host.writeFile(`${home}/.alis/${filename}`, JSON.stringify(record))
  } catch (error) {
    host.debug(`health: could not write ${filename}: ${String(error)}`)
  }
}
