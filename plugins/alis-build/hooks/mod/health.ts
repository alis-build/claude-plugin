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
