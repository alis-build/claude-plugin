// What a running or finished alis operation looks like to the person, read
// from the operation's JSON: a `--json --verbose` progress snapshot (the
// full GetBuildOperationResponse or GetDeployOperationResponse), a
// `describe --json --verbose`, or the pruned result on stdout. One stage per
// docker image built and one per environment deployed, each with its steps,
// the step running now and how it ended. ops-render.tsx draws the stages as
// the live row and the folded result.

export type StageState = 'waiting' | 'running' | 'done' | 'failed'

export type Stage = {
  kind: 'build' | 'deploy'
  /** The image path ('.' for the neuron root) or the environment's display name. */
  name: string
  state: StageState
  /** Steps finished, of all steps known: docker steps for a build, actions for a deploy. */
  done: number
  total: number
  /** Docker steps served from the cache (a build only). */
  cached: number
  /** What the stage is doing now, in words. */
  current?: string
  /** The raw docker step or terraform resource behind `current`. */
  detail?: string
  /** The 1-based place of the failed step among the stage's steps. */
  failedAt?: number
  /** The first line of the failure. */
  error?: string
  /** A warning the stage survives (a throttled Spanner update). */
  warning?: string
  /** Resources the deploy creates, updates, replaces or deletes. */
  changes?: number
  startMs?: number
  endMs?: number
  logsUri?: string
}

export type OpView = {
  /** 'build' when the response describes a build (chained deploys included). */
  kind: 'build' | 'deploy'
  name?: string
  version?: string
  done: boolean
  error?: string
  stages: Stage[]
  logsUri?: string
  buildLogsUri?: string
}

type Json = Record<string, unknown>

const obj = (v: unknown): Json | undefined => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Json) : undefined)
const arr = (v: unknown): Json[] => (Array.isArray(v) ? v.map(obj).filter((x): x is Json => !!x) : [])
const str = (v: unknown): string | undefined => (typeof v === 'string' && v ? v : undefined)
const num = (v: unknown): number => (typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v)) ? Number(v) : 0)
const time = (v: unknown): number | undefined => {
  const s = str(v)
  if (!s) return undefined
  const t = Date.parse(s)
  return Number.isNaN(t) ? undefined : t
}

/** Collapses whitespace and cuts a line to `max` characters. */
export function compact(value: string, max = 160): string {
  const one = value.split(/\s+/).filter(Boolean).join(' ')
  return one.length <= max ? one : `${one.slice(0, max - 1)}…`
}

/** The environment id of a deployment name (`…/environments/<id>/deployments/…`). */
export function environmentIdOf(name: string): string {
  const parts = name.split('/')
  const at = parts.indexOf('environments')
  return at !== -1 && parts[at + 1] ? (parts[at + 1] as string) : name
}

/** `org.product` of a deployment name or a package id, for `alis environment list`. */
export function productOf(nameOrPackage: string): string | undefined {
  const parts = nameOrPackage.split('/')
  const org = parts.indexOf('organisations')
  const product = parts.indexOf('products')
  if (org !== -1 && product !== -1 && parts[org + 1] && parts[product + 1]) return `${parts[org + 1]}.${parts[product + 1]}`
  const dots = nameOrPackage.split('.')
  return dots.length >= 3 && !nameOrPackage.includes('/') ? `${dots[0]}.${dots[1]}` : undefined
}

/** The service as people say it: `alis.os.console.v2` → `console.v2`. */
export function serviceOf(packageId: string | undefined | null): string | undefined {
  if (!packageId) return undefined
  const dots = packageId.split('.')
  return dots.length > 2 ? dots.slice(2).join('.') : packageId
}

const RESOURCE_WORDS: Array<[RegExp, string]> = [
  [/^google_cloud_run_(v2_)?service_iam_/, 'access policy'],
  [/^google_cloud_run_(v2_)?service$/, 'Cloud Run service'],
  [/^google_cloud_run_(v2_)?job$/, 'Cloud Run job'],
  [/^google_pubsub_topic$/, 'Pub/Sub topic'],
  [/^google_pubsub_subscription$/, 'Pub/Sub subscription'],
  [/^google_spanner_database$/, 'Spanner database'],
  [/^google_spanner_database_ddl$/, 'Spanner schema'],
  [/^google_storage_bucket$/, 'storage bucket'],
  [/^google_bigquery_dataset$/, 'BigQuery dataset'],
  [/^google_bigquery_table$/, 'BigQuery table'],
  [/^google_compute_backend_service$/, 'backend service'],
  [/^google_compute_region_network_endpoint_group$/, 'network endpoint group'],
  [/^google_service_account$/, 'service account'],
  [/^google_secret_manager_secret/, 'secret'],
  [/^google_cloud_scheduler_job$/, 'scheduler job'],
  [/^google_cloud_tasks_queue$/, 'task queue'],
  [/_iam_(member|binding|policy)$/, 'access policy'],
]

/** A terraform resource type in words: `google_cloud_run_v2_service` → `Cloud Run service`. */
export function resourceWords(address: string): string {
  const type = address.split('.')[0] ?? address
  for (const [pattern, words] of RESOURCE_WORDS) if (pattern.test(type)) return words
  return type.replace(/^google_/, '').replaceAll('_', ' ')
}

const ACTION_VERBS: Record<string, string> = { create: 'Creating', update: 'Updating', replace: 'Replacing', delete: 'Deleting', read: 'Reading', import: 'Importing' }
const CHANGING = new Set(['create', 'update', 'replace', 'delete'])

/** A deploy action marker in words: `terraform apply` → `Applying changes`. */
export function actionWords(label: string): string {
  const l = label.toLowerCase()
  if (l.startsWith('protos') && l.includes('spanner')) return 'Updating the Spanner schema'
  if (l.startsWith('protos') && l.includes('pub')) return 'Updating Pub/Sub topics'
  if (l.startsWith('terraform init')) return 'Preparing Terraform'
  if (l.startsWith('terraform plan') || l.startsWith('terraform show')) return 'Planning changes'
  if (l.startsWith('terraform apply')) return 'Applying changes'
  if (l.startsWith('unzip')) return 'Preparing'
  return label
}

function stateOf(progress: Json | undefined, running: boolean): StageState {
  if (!progress) return 'waiting'
  // `failed` means nothing until the group has ended.
  if (str(progress['endTime'])) return progress['failed'] === true ? 'failed' : 'done'
  if (running || str(progress['startTime'])) return 'running'
  return 'waiting'
}

function failureLine(progress: Json | undefined): string | undefined {
  const failure = obj(progress?.['failure'])
  const lines = Array.isArray(failure?.['errorLines']) ? (failure['errorLines'] as unknown[]).map(str).filter((x): x is string => !!x) : []
  const first = lines.find(line => /error|err_|denied|failed|cannot|not found/i.test(line)) ?? lines[0]
  if (first) return compact(first, 300)
  for (const d of arr(progress?.['diagnostics'])) if (str(d['severity'])?.toLowerCase() === 'error' && str(d['summary'])) return compact(str(d['summary']) as string, 300)
  const action = str(failure?.['actionLabel'])
  return action ? `${action} failed` : undefined
}

function warningOf(progress: Json | undefined): string | undefined {
  for (const sync of arr(progress?.['protoSyncs'])) {
    if (sync['throttled'] === true && str(sync['status']) !== 'DONE') return 'Spanner is throttling the update. It carries on by itself.'
  }
  for (const d of arr(progress?.['diagnostics'])) if (str(d['severity'])?.toLowerCase() === 'warning' && str(d['summary'])) return compact(str(d['summary']) as string, 200)
  return undefined
}

function buildStage(image: Json): Stage {
  const progress = obj(image['progress'])
  const all = arr(progress?.['buildSteps'])
  const steps = all.filter(s => s['internal'] !== true && num(s['stepNumber']) > 0)
  const running = steps.findLast(s => str(s['status']) === 'RUNNING') ?? all.findLast(s => str(s['status']) === 'RUNNING' && s['internal'] !== true)
  const failed = steps.findIndex(s => str(s['status']) === 'FAILED')
  const stage: Stage = {
    kind: 'build',
    name: str(image['path']) ?? '.',
    state: stateOf(progress, !!running),
    done: steps.filter(s => str(s['status']) === 'DONE').length,
    total: steps.length,
    cached: steps.filter(s => s['cached'] === true).length,
    startMs: time(progress?.['startTime']),
    endMs: time(progress?.['endTime']),
  }
  if (running) {
    const name = compact(str(running['name']) ?? '', 120)
    const total = num(running['totalBytes'])
    stage.detail = name
    stage.current = total > 0 ? `${/push|export/i.test(name) ? 'Pushing the image' : 'Downloading'} · ${(num(running['currentBytes']) / 1e6).toFixed(1)} of ${(total / 1e6).toFixed(1)} MB` : undefined
  }
  if (failed !== -1) {
    stage.failedAt = failed + 1
    stage.detail = compact(str(steps[failed]?.['name']) ?? '', 120)
  }
  if (stage.state === 'failed') stage.error = compact(str(steps[failed]?.['error']) ?? '', 300) || failureLine(progress)
  stage.warning = warningOf(progress)
  return stage
}

function deployStage(deployment: Json, names: Record<string, string>): Stage {
  const progress = obj(deployment['progress'])
  const steps = arr(progress?.['steps'])
  const running = steps.find(s => str(s['status']) === 'RUNNING')
  const id = environmentIdOf(str(deployment['name']) ?? '')
  const summary = obj(progress?.['changeSummary'])
  const stage: Stage = {
    kind: 'deploy',
    name: names[id] ?? id,
    state: stateOf(progress, !!running),
    done: steps.filter(s => str(s['status']) === 'DONE').length,
    total: steps.length,
    cached: 0,
    startMs: time(progress?.['startTime']),
    endMs: time(progress?.['endTime']),
    logsUri: str(deployment['logsUri']),
  }
  if (summary) stage.changes = num(summary['add']) + num(summary['change']) + num(summary['remove'])
  const applying = arr(progress?.['resources']).find(r => str(r['status']) === 'APPLYING' && CHANGING.has(str(r['action']) ?? ''))
  if (applying) {
    const action = str(applying['action']) as string
    stage.current = `${ACTION_VERBS[action] ?? action} the ${resourceWords(str(applying['address']) ?? '')}`
    stage.detail = str(applying['address'])
  } else if (running) {
    const label = str(running['label']) ?? ''
    const sync = arr(progress?.['protoSyncs']).find(s => str(s['status']) === 'RUNNING')
    const percent = sync ? num(sync['percent']) : 0
    stage.current = actionWords(label) + (percent > 0 && percent < 100 ? ` · ${percent}%` : '')
    stage.detail = label
  }
  const failedAt = steps.findIndex(s => str(s['status']) === 'FAILED')
  if (failedAt !== -1) stage.failedAt = failedAt + 1
  const error = obj(deployment['error'])
  if (stage.state === 'failed' || str(error?.['message'])) {
    stage.state = 'failed'
    stage.error = failureLine(progress) ?? (str(error?.['message']) ? compact(str(error?.['message']) as string, 300) : undefined)
  }
  stage.warning = warningOf(progress)
  return stage
}

/**
 * The person's view of an operation's JSON, or null when the value is not
 * one. `names` maps environment ids to display names (`alis environment list`).
 */
export function viewOf(raw: unknown, names: Record<string, string> = {}): OpView | null {
  const o = obj(raw)
  if (!o) return null
  const isBuild = 'images' in o || 'buildLogsUri' in o || 'version' in o
  if (!isBuild && !('deployments' in o) && !('deployProgress' in o)) return null
  const stages = [...arr(o['images']).map(buildStage), ...arr(o['deployments']).map(d => deployStage(d, names))]
  const view: OpView = { kind: isBuild ? 'build' : 'deploy', done: o['done'] === true, stages }
  const name = str(o['name'])
  if (name) view.name = name
  const version = str(o['version'])
  if (version) view.version = version
  const error = str(o['error']) ?? str(obj(o['error'])?.['message'])
  if (error) view.error = error
  const logs = str(o['logsUri'])
  if (logs) view.logsUri = logs
  const buildLogs = str(o['buildLogsUri'])
  if (buildLogs) view.buildLogsUri = buildLogs
  return view
}

/** Fills what a later, sparser view (a pruned result) lacks from an earlier, fuller one. */
export function mergeView(later: OpView, earlier: OpView | undefined): OpView {
  if (!earlier) return later
  const stages = later.stages.length > 0 ? later.stages : earlier.stages
  const merged = stages.map(stage => {
    const before = earlier.stages.find(s => s.kind === stage.kind && s.name === stage.name)
    if (!before) return stage
    // A finished response drops the docker steps: keep the counts seen while
    // it ran rather than its zeros.
    const out: Record<string, unknown> = { ...before }
    for (const [key, value] of Object.entries(stage)) {
      if (value === undefined) continue
      if (value === 0 && typeof (before as Record<string, unknown>)[key] === 'number') continue
      out[key] = value
    }
    const next = out as Stage
    if (next.state === 'done' && next.total) next.done = next.total
    return next
  })
  return { ...earlier, ...later, version: later.version ?? earlier.version, stages: merged }
}

/** A duration as people read it: `58s`, `2m 41s`, `1h 04m`. */
export function durationOf(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
  if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`
  return `${s}s`
}

/** `1:17` from milliseconds, for the running clock. */
export function clockOf(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = String(total % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`
}

/** `4:09` (the CLI's elapsed) → milliseconds; undefined when unreadable. */
export function elapsedMs(elapsed: string | undefined): number | undefined {
  if (!elapsed) return undefined
  const parts = elapsed.split(':').map(Number)
  if (parts.some(Number.isNaN)) return undefined
  return parts.reduce((acc, p) => acc * 60 + p, 0) * 1000
}

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? ''
  return `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`
}

/** The live row while an operation runs. */
export type LiveLine = {
  label: string
  /** Dim words after the label, on the first line (no bar then). */
  note?: string
  /** 0 to 1, or null for no bar. */
  fill: number | null
  sub?: string
  subTone?: 'dim' | 'warning'
  clock: string
  /** For the hover card. */
  detail?: { title: string; step?: string; operation?: string }
}

export function liveLineOf(view: OpView | undefined, opts: { service?: string; operation?: string; startedAt: number; now: number; verb?: string }): LiveLine {
  const stages = view?.stages ?? []
  const start = Math.min(opts.startedAt, ...stages.map(s => s.startMs ?? Number.POSITIVE_INFINITY))
  const clock = clockOf(opts.now - start)
  const subject = view?.version ?? opts.service ?? ''
  const active = stages.find(s => s.state === 'running') ?? stages.find(s => s.state === 'failed') ?? stages.find(s => s.state === 'waiting')
  const isBuild = (view?.kind ?? (opts.verb === 'deploy' ? 'deploy' : 'build')) === 'build'
  if (!active || (active.state === 'waiting' && !stages.some(s => s.state !== 'waiting'))) {
    return { label: isBuild ? 'Starting the build' : 'Starting the deploy', note: isBuild ? 'waiting for a build machine' : 'waiting for the environment', fill: null, clock }
  }
  const builds = stages.filter(s => s.kind === 'build')
  const deploysWaiting = stages.filter(s => s.kind === 'deploy' && s.state === 'waiting').map(s => s.name)
  const prefix = active.kind === 'build' && builds.length > 1 ? `${active.name === '.' ? 'root' : active.name} · ` : ''
  const warning = active.warning
  if (active.kind === 'build') {
    const step = active.total ? `Step ${Math.min(active.total, active.done + (active.state === 'running' ? 1 : 0))} of ${active.total}` : 'Preparing the build'
    const next = deploysWaiting.length ? ` · deploys to ${joinNames(deploysWaiting)} next` : ''
    return {
      label: `Building ${subject}`.trim(),
      fill: active.total ? active.done / active.total : null,
      sub: warning ?? prefix + (active.current ? `${step} · ${active.current}` : step) + next,
      subTone: warning ? 'warning' : 'dim',
      clock,
      detail: { title: `Build · step ${Math.min(active.total, active.done + 1)} of ${active.total}${active.cached ? `, ${active.cached} from cache` : ''}`, step: active.detail, operation: opts.operation },
    }
  }
  const built = builds.find(s => s.state === 'done' && s.startMs !== undefined && s.endMs !== undefined)
  const doing = active.current ?? (active.total ? `Step ${Math.min(active.total, active.done + 1)} of ${active.total}` : 'Starting')
  return {
    label: `Deploying to ${active.name}`,
    fill: active.total ? (active.done + (active.state === 'running' ? 0.5 : 0)) / active.total : null,
    sub: warning ?? doing + (built ? ` · built in ${durationOf((built.endMs as number) - (built.startMs as number))}` : ''),
    subTone: warning ? 'warning' : 'dim',
    clock,
    detail: { title: `Deploy to ${active.name} · step ${Math.min(active.total, active.done + 1)} of ${active.total}`, step: active.detail, operation: opts.operation },
  }
}

/** The folded row once the call has ended. */
export type FoldLine = {
  tone: 'ok' | 'error' | 'neutral'
  text: string
  note?: string
  time?: string
  sub?: string
  logsUri?: string
  /** Offer to follow (and cancel) the operation that keeps running. */
  follow?: boolean
  cancel?: boolean
}

export function foldLineOf(input: {
  view?: OpView
  outcome: 'done' | 'failed' | 'interrupted' | 'detached' | 'running'
  elapsedMs?: number
  version?: string
  verb?: string
  waitedFor?: string
}): FoldLine {
  const view = input.view
  const stages = view?.stages ?? []
  const version = view?.version ?? input.version
  const time = input.elapsedMs !== undefined ? durationOf(input.elapsedMs) : undefined
  const deploys = stages.filter(s => s.kind === 'deploy')
  const isBuild = (view?.kind ?? (input.verb === 'deploy' ? 'deploy' : 'build')) === 'build'
  const building = stages.some(s => s.kind === 'build' && s.state !== 'done')
  const still = building || (isBuild && deploys.length === 0) ? 'Still building on Alis' : 'Still deploying on Alis'
  if (input.outcome === 'interrupted') {
    return { tone: 'neutral', text: still, note: 'you stopped watching, not the build', follow: true, cancel: building }
  }
  if (input.outcome === 'detached') {
    return { tone: 'neutral', text: still, note: `Claude stopped waiting${time ? ` after ${time}` : ''}`, follow: true }
  }
  if (input.outcome === 'running') {
    const what = input.verb === 'define' ? 'Define' : isBuild ? 'Build' : 'Deploy'
    return { tone: 'neutral', text: `${what}${version ? ` ${version}` : ''} started on Alis` }
  }
  if (input.outcome === 'failed') {
    const failed = stages.find(s => s.state === 'failed')
    if (failed?.kind === 'build' || (!failed && isBuild && !deploys.some(d => d.state !== 'waiting'))) {
      const at = failed?.failedAt ? ` at step ${failed.failedAt}` : ''
      return { tone: 'error', text: `Build failed${at}.${deploys.length ? ' Nothing was deployed.' : ''}`, time, sub: failed?.error ?? (view?.error ? compact(view.error.split('\n')[0] ?? '', 300) : undefined), logsUri: view?.buildLogsUri ?? view?.logsUri }
    }
    const where = failed?.name ?? joinNames(deploys.map(d => d.name))
    return { tone: 'error', text: `Deploy${where ? ` to ${where}` : ''} failed.`, time, sub: failed?.error ?? (view?.error ? compact(view.error.split('\n')[0] ?? '', 300) : undefined), logsUri: failed?.logsUri ?? view?.logsUri }
  }
  const envs = deploys.map(d => d.name)
  const subject = version ?? (isBuild ? 'The build' : 'The deploy')
  if (envs.length) return { tone: 'ok', text: `${subject} is live on ${joinNames(envs)}`, time, logsUri: view?.logsUri }
  if (isBuild) return { tone: 'ok', text: version ? `${version} is built` : 'The build finished', time, logsUri: view?.buildLogsUri ?? view?.logsUri }
  return { tone: 'ok', text: 'The deploy finished', time, logsUri: view?.logsUri }
}
