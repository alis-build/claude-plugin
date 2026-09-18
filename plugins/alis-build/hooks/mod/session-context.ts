// What the session learns at start (load-primer.sh, inject-service-context.sh)
// and the catalog refresh that runs beside it (sync-skills.py), served from
// the module: the classic SessionStart dispatch answers with the same text
// the shell hooks printed, as additionalContext, so the engine keeps its
// re-injection after compaction.
import { workspaceOf } from './alis-command'
import { cliPathOf, observe } from './health'
import type { Host } from './host'

export const SYNC_HEALTH_FILE = 'claude-skills-sync-health.json'
const SYNC_TIMEOUT_MS = 20_000

type PrimerMode = 'full' | 'digest' | 'off' | undefined

/**
 * The DBD primer for this session, or null: the full primer inside an
 * alis.build workspace, the digest on resume/compact and on a machine with
 * the CLI but outside a workspace, nothing otherwise; ALIS_PRIMER overrides.
 */
export async function primerContext(host: Host, cwd: string, source: string): Promise<string | null> {
  const override = (await host.primerMode()) as PrimerMode
  if (override === 'off') return null
  let inWorkspace = cwd.includes('/alis.build/') || cwd.endsWith('/alis.build')
  let hasCli = (await cliPathOf(host)) !== ''
  if (override === 'full') inWorkspace = true
  if (override === 'digest') {
    inWorkspace = false
    hasCli = true
  }
  if (!inWorkspace && !hasCli) return null
  let want: 'full' | 'digest' = source === 'resume' || source === 'compact' ? 'digest' : 'full'
  if (!inWorkspace) want = 'digest'
  if (override === 'full' || override === 'digest') want = override
  const root = await host.pluginRoot()
  if (!root) return null
  const read = (name: string) => host.readFile(`${root}/context/${name}`).catch(() => null)
  if (want === 'digest') {
    const digest = await read('dbd-digest.md')
    if (digest !== null) return digest
  }
  return read('dbd-primer.md')
}

/**
 * The pointer to a service's counterpart half when the session opens inside
 * an alis.build service folder: definitions from the build side, the
 * implementation from the define side, plus the package id. Null elsewhere.
 */
export async function serviceContext(host: Host, cwd: string): Promise<string | null> {
  const ws = workspaceOf(cwd)
  if (!ws) return null
  const defineDir = `${ws.root}/${ws.org}/define/${ws.org}/${ws.relpath}`
  const buildDir = `${ws.root}/${ws.org}/build/${ws.relpath}`
  const lines: string[] = []
  if (ws.side === 'build') {
    lines.push('This Claude session is inside an Alis Build service implementation (build) directory.')
    if (ws.pkg) lines.push(`  Package id:  ${ws.pkg}`)
    if (await host.exists(defineDir)) {
      lines.push('  The protobuf definitions (the API contract — the DBD "Define" step) are available here:', `    ${defineDir}`)
      const protos = await protosOf(host, defineDir)
      if (protos) lines.push(protos)
    } else {
      lines.push(`  Expected definitions at ${defineDir} (not found on disk).`)
    }
  } else {
    lines.push('This Claude session is inside an Alis Build definitions (define) directory — the protobuf API contract.')
    if (ws.pkg) lines.push(`  Package id:  ${ws.pkg}`)
    const protos = await protosOf(host, cwd)
    if (protos) lines.push(protos)
    if (await host.exists(buildDir)) {
      lines.push('  The implementation (the DBD "Build" step) is available here:', `    ${buildDir}`)
    } else {
      lines.push('  This contract has no corresponding build/ implementation directory yet.')
    }
  }
  return lines.join('\n') + '\n'
}

async function protosOf(host: Host, dir: string): Promise<string | null> {
  try {
    const names = (await host.list(dir)).filter(e => e.kind === 'file' && e.name.endsWith('.proto')).map(e => e.name)
    return names.length > 0 ? `  Proto files: ${names.join(', ')}` : null
  } catch {
    return null
  }
}

/**
 * Refreshes the local skill catalog on a fresh session (startup or clear),
 * off the session's critical path, and records the outcome for alis doctor.
 */
export async function syncSkills(host: Host, source: string): Promise<'success' | 'failed' | 'timeout' | 'cli-missing' | 'skipped'> {
  if (source !== 'startup' && source !== 'clear') return 'skipped'
  let status: 'success' | 'failed' | 'timeout' | 'cli-missing'
  try {
    const run = await host.run(['alis', 'skills', 'sync', '--cache-only', '--harness', 'claude'], { timeoutMs: SYNC_TIMEOUT_MS })
    status = run.exitCode === 0 ? 'success' : 'failed'
  } catch (error) {
    const text = String(error)
    status = /time/i.test(text) ? 'timeout' : /ENOENT|not found|no such/i.test(text) ? 'cli-missing' : 'failed'
  }
  await observe(host, SYNC_HEALTH_FILE, { status })
  return status
}
