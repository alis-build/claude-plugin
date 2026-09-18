// The /alis slash command: `status` answers without a model turn, `handoff`
// hands the session to a workstation. Output is `key: value` lines, which
// alis-render.tsx draws as a column; the same text reaches the model.
import type { CommandSpec } from 'claude-code'

import type { Host } from './host'
import { PLUGIN_VERSION } from './meta'
import { COVERS } from './tag'

export const COMMAND_SPEC: CommandSpec = {
  name: 'alis',
  description: 'Alis Build: status, or hand this session to a workstation',
  argumentHint: 'status | handoff [alias]',
}

const USAGE = ['usage: status | handoff [alias]', 'status: CLI, workspace, module and handoff state', 'handoff [alias]: continue this session on an enrolled workstation'].join('\n')

export async function runAlisCommand(host: Host, args: string): Promise<{ text: string }> {
  const [verb, ...rest] = args.trim().split(/\s+/).filter(Boolean)
  switch (verb ?? 'status') {
    case 'status':
      return { text: await status(host) }
    case 'handoff':
      return { text: await handoff(host, rest[0]) }
    default:
      return { text: USAGE }
  }
}

async function status(host: Host): Promise<string> {
  const [version, cwd, sid, home] = await Promise.all([
    host.run(['alis', 'version', '--json'], { timeoutMs: 5_000 }).then(
      r => (r.exitCode === 0 ? String(JSON.parse(r.stdout)?.version ?? '?') : null),
      () => null,
    ),
    host.cwd().catch(() => ''),
    host.sessionId().catch(() => ''),
    host.home(),
  ])
  const workspace = workspaceOf(cwd)
  const claimed = home && sid ? await host.exists(`${home}/.alis/handoff-sessions/${sid}.claim`).catch(() => false) : false
  return [
    'status: ' + new Date().toISOString().slice(0, 16).replace('T', ' '),
    `cli: ${version ? `v${version}` : 'not found on PATH'}`,
    `workspace: ${workspace ? `${workspace.org} ${workspace.side} ${workspace.relpath}${workspace.pkg ? ` (${workspace.pkg})` : ''}` : 'none (not inside alis.build)'}`,
    `plugin: v${PLUGIN_VERSION}, function hooks serving ${COVERS.join(', ')}`,
    `handoff: ${claimed ? 'this session is claimed' : 'no claim'}`,
  ].join('\n')
}

async function handoff(host: Host, alias: string | undefined): Promise<string> {
  const sid = await host.sessionId().catch(() => '')
  if (!sid) return 'handoff: error\nerror: this session has no id to hand off'
  const argv = ['alis', 'workstation', 'handoff', '--session', sid, '--json', ...(alias ? ['--to', alias] : [])]
  try {
    const run = await host.run(argv, { timeoutMs: 60_000 })
    const said = summarize(run.stdout) ?? summarize(run.stderr) ?? (run.exitCode === 0 ? 'started' : `exit ${run.exitCode}`)
    return `handoff: ${run.exitCode === 0 ? 'started' : 'failed'}\n${run.exitCode === 0 ? 'result' : 'error'}: ${said}`
  } catch (error) {
    return `handoff: failed\nerror: ${String(error)}`
  }
}

/** One line from what the CLI printed: a JSON message, error or status, else its last line. */
function summarize(text: string): string | undefined {
  const trimmed = text.trim()
  if (!trimmed) return undefined
  try {
    const json = JSON.parse(trimmed)
    if (json && typeof json === 'object') {
      for (const key of ['message', 'error', 'status', 'name']) {
        const value = (json as Record<string, unknown>)[key]
        if (typeof value === 'string' && value) return value
      }
    }
  } catch {
    // Not JSON: the CLI's own text.
  }
  return trimmed.split('\n').at(-1)?.slice(0, 300)
}

export type Workspace = { org: string; side: 'build' | 'define'; relpath: string; pkg: string | null }

/**
 * The workspace a directory is in, by the alis.build layout
 * (inject-service-context.sh): build = <root>/alis.build/<org>/build/<path…>,
 * define = <root>/alis.build/<org>/define/<org>/<path…>, package id
 * <org>.<path with / as .> up to the version segment.
 */
export function workspaceOf(dir: string): Workspace | null {
  const at = dir.indexOf('/alis.build/')
  if (at === -1) return null
  const parts = dir.slice(at + '/alis.build/'.length).split('/').filter(Boolean)
  const [org, side] = parts
  if (!org || (side !== 'build' && side !== 'define')) return null
  let segs = parts.slice(2)
  if (side === 'define') {
    if (segs[0] !== org) return null
    segs = segs.slice(1)
  }
  const svc: string[] = []
  let versioned = false
  for (const s of segs) {
    svc.push(s)
    if (/^v[0-9]+$/.test(s)) {
      versioned = true
      break
    }
  }
  if (svc.length === 0) return null
  return { org, side, relpath: svc.join('/'), pkg: versioned ? [org, ...svc].join('.') : null }
}
