// Local hook observations for `alis doctor`, the same record hooks/health.py
// writes: no command text, transcript or credentials. Best effort, never
// throws; a hook that could not observe still answers.
import type { Host } from './host'
import { PLUGIN_VERSION } from './meta'

let cliPath: Promise<string> | null = null

export async function observe(host: Host, filename: string, fields: Record<string, unknown>): Promise<void> {
  try {
    const home = await host.home()
    if (!home) return
    const root = (await host.pluginRoot()) ?? ''
    // Resolved once per module load, as shutil.which is once per process.
    cliPath ??= host
      .run(['/usr/bin/which', 'alis'], { timeoutMs: 3000 })
      .then(r => (r.exitCode === 0 ? r.stdout.trim() : ''), () => '')
    const record = { root, version: PLUGIN_VERSION, observedAt: new Date().toISOString(), cliPath: await cliPath, ...fields }
    await host.writeFile(`${home}/.alis/${filename}`, JSON.stringify(record))
  } catch (error) {
    host.debug(`health: could not write ${filename}: ${String(error)}`)
  }
}
