// Teammates with a live coding session in this product, from `alis presence
// --json`, read at session start and every two minutes while the session is
// inside an alis.build folder. Light on purpose: the prompt footer names who
// is in the same service ("Ruan here"), one toast says so when someone
// arrives after the first read, and `/alis who` prints the product's roster.
// A CLI without the command ends the reads for the session, unremarked.
import { workspaceOf } from './alis-command'
import { jsonOf, withIdentity } from './cli'
import type { Host } from './host'

export const PRESENCE_MS = 120_000
const READ_TIMEOUT_MS = 10_000

export type Person = { user: string; name: string; status: 'active' | 'idle'; title: string; service: string; current: boolean }

type Presence = {
  product: string | null
  people: Person[]
  /** Whether a read has succeeded; arrivals are announced only after one. */
  read: boolean
  /** The installed CLI has no `alis presence`. */
  unavailable: boolean
}

const presence: Presence = { product: null, people: [], read: false, unavailable: false }
let cancelTimer: (() => void) | null = null
let reading = false

/** Forgets everything and stops reading (tests, and a reload). */
export function resetPresence(): void {
  cancelTimer?.()
  cancelTimer = null
  reading = false
  Object.assign(presence, { product: null, people: [], read: false, unavailable: false })
}

/** Everyone else with a live session in the product, this folder's service first. */
export function peopleHere(): Person[] {
  return presence.people
}

/** Starts the reads when the session is inside an alis.build folder. */
export async function startPresence(host: Host): Promise<void> {
  resetPresence()
  const cwd = await host.cwd().catch(() => '')
  if (!workspaceOf(cwd)) return
  cancelTimer = host.every(PRESENCE_MS, () => void refreshPresence(host))
  await refreshPresence(host)
}

/** One read. Never throws; a failure keeps what was last read. */
export async function refreshPresence(host: Host): Promise<void> {
  if (reading || presence.unavailable) return
  reading = true
  try {
    const run = await host.run(await withIdentity(host, ['alis', 'presence', '--json']), { timeoutMs: READ_TIMEOUT_MS })
    const json = jsonOf(run.stdout)
    if (run.exitCode !== 0 || !json || json['error']) {
      if (!json && /unknown command/i.test(`${run.stdout}\n${run.stderr}`)) {
        presence.unavailable = true
        cancelTimer?.()
        cancelTimer = null
      }
      host.debug(`presence: read failed (exit ${run.exitCode})`)
      return
    }
    const before = new Set(presence.people.filter(p => p.current).map(p => p.user))
    const label = presenceModeOf()
    const people = peopleOf(json)
    const arrived = presence.read ? people.filter(p => p.current && !before.has(p.user)) : []
    presence.product = productOf(json)
    presence.people = people
    presence.read = true
    for (const person of arrived) host.toast(`${person.name} is also working in ${shortService(person.service, presence.product)}`)
    if (presenceModeOf() !== label) host.invalidate()
  } catch (error) {
    host.debug(`presence: read failed: ${String(error)}`)
  } finally {
    reading = false
  }
}

function productOf(json: Record<string, unknown>): string | null {
  const { organisation, product } = json
  return typeof organisation === 'string' && typeof product === 'string' ? `${organisation}.${product}` : null
}

/** Reads `alis presence --json`: one Person per teammate per service. */
export function peopleOf(json: Record<string, unknown>): Person[] {
  const services = Array.isArray(json['services']) ? json['services'] : []
  const people: Person[] = []
  for (const item of services) {
    if (!item || typeof item !== 'object') continue
    const service = item as { service?: unknown; current?: unknown; people?: unknown }
    if (typeof service.service !== 'string' || !Array.isArray(service.people)) continue
    for (const entry of service.people) {
      if (!entry || typeof entry !== 'object') continue
      const person = entry as { user?: unknown; name?: unknown; status?: unknown; sessionTitle?: unknown }
      if (typeof person.user !== 'string') continue
      people.push({
        user: person.user,
        name: typeof person.name === 'string' && person.name ? person.name : 'A teammate',
        status: person.status === 'active' ? 'active' : 'idle',
        title: typeof person.sessionTitle === 'string' ? person.sessionTitle : '',
        service: service.service,
        current: service.current === true,
      })
    }
  }
  return people
}

/** `alis.os.cli.v1` as `cli.v1` within product `alis.os`. */
export function shortService(service: string, product: string | null): string {
  return product && service.startsWith(`${product}.`) ? service.slice(product.length + 1) : service
}

/** The prompt footer's label: who is in this folder's service, or undefined. */
export function presenceModeOf(people: readonly Person[] = presence.people): string | undefined {
  const here = people.filter(p => p.current)
  const first = here[0]
  if (!first) return undefined
  const given = first.name.split(/\s+/)[0] ?? first.name
  return here.length === 1 ? `${given} here` : `${given} +${here.length - 1} here`
}

/** `/alis who`: reads again and prints the roster as `key: value` lines. */
export async function whoText(host: Host): Promise<string> {
  if (!workspaceOf(await host.cwd().catch(() => ''))) return 'who: unavailable\nwhy: this session is not inside an alis.build folder'
  await refreshPresence(host)
  if (presence.unavailable) return 'who: unavailable\nwhy: the installed alis CLI has no `alis presence` yet; run `alis upgrade`'
  if (!presence.read) return 'who: unavailable\nwhy: presence could not be read just now'
  const product = presence.product
  if (presence.people.length === 0) return `who: ${product ?? 'this product'}\nteam: nobody else has a live session`
  return [
    `who: ${product ?? 'this product'}`,
    ...presence.people.map(p => `${p.name}: ${p.status} in ${shortService(p.service, product)}${p.current ? ' (this folder)' : ''}${p.title ? ` · ${p.title}` : ''}`),
  ].join('\n')
}
