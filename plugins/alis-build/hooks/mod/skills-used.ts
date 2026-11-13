// The Skill store skills this session used, and the person's rating of
// each. A skill counts once the engine expands it (`/name`, the Skill tool)
// or Claude loads it with `alis skills load <id>`; only ids in the CLI's own
// catalogue (~/.alis/cache/skills-catalog.json) count, so another plugin's
// skills are left alone. Its row says so, the prompt footer names it for the
// rest of the session (a dim label; the status line is drawn as a warning,
// which a skill in use is not), and once the turn that used it ends a line
// above the prompt asks for a rating (the skill's own row has scrolled into
// the terminal's scrollback by then, where nothing is redrawn): one press sends `alis skills feedback <id> --rating up|down`, the
// press being the consent, and nothing but the rating leaves the machine.
// A rating is asked for once per skill until the skill changes ($.store).
import type { UsedSkill } from '../../types'
import { commandPath } from './cli-gate'
import { failureOf, jsonOf, withIdentity } from './cli'
import type { Host } from './host'
import { literalArgv } from './shell'

export type { UsedSkill }

const CATALOG_TTL_MS = 5 * 60_000
const FEEDBACK_TIMEOUT_MS = 20_000
const SEND_TIMEOUT_MS = 120_000
/** The $.store key holding what was rated: `{ [skill id]: { rating, at } }`. */
export const RATED_KEY = 'skill-ratings'

type CatalogSkill = { id: string; name: string; updated?: string }
type Rated = Record<string, { rating: string; at: string }>

const used = new Map<string, UsedSkill>()
let catalog: { at: number; skills: Map<string, CatalogSkill> } | null = null

/** The skills used so far, oldest first. */
export function usedSkills(): UsedSkill[] {
  return [...used.values()]
}

export function restoreSkills(saved: UsedSkill[] | undefined): void {
  used.clear()
  for (const skill of saved ?? []) if (skill && typeof skill.id === 'string') used.set(skill.id, { ...skill, calls: [...(skill.calls ?? [])] })
}

/** Forgets everything (tests). */
export function resetSkills(): void {
  used.clear()
  catalog = null
}

/** The skill a tool call's row belongs to, if it loaded one. */
export function skillForCall(toolUseId: string | undefined): UsedSkill | undefined {
  if (!toolUseId) return undefined
  for (const skill of used.values()) if (skill.calls.includes(toolUseId)) return skill
  return undefined
}

/** The skill id of a literal `alis skills load <id>` command line; null otherwise. */
export function skillLoadOf(command: unknown): string | null {
  if (typeof command !== 'string') return null
  const argv = literalArgv(command)
  if (!argv) return null
  const words = commandPath(argv, 3)
  return words[0] === 'skills' && words[1] === 'load' && words[2] ? words[2] : null
}

async function catalogOf(host: Host, now: number): Promise<Map<string, CatalogSkill>> {
  if (catalog && now - catalog.at < CATALOG_TTL_MS) return catalog.skills
  const skills = new Map<string, CatalogSkill>()
  try {
    const home = await host.home()
    const raw = home ? (JSON.parse(await host.readFile(`${home}/.alis/cache/skills-catalog.json`)) as { skills?: unknown }) : undefined
    for (const entry of Array.isArray(raw?.skills) ? raw.skills : []) {
      const e = entry as { id?: unknown; displayName?: unknown; updateTime?: unknown }
      if (typeof e.id !== 'string' || !e.id) continue
      skills.set(e.id, { id: e.id, name: typeof e.displayName === 'string' && e.displayName ? e.displayName : e.id, ...(typeof e.updateTime === 'string' ? { updated: e.updateTime } : {}) })
    }
  } catch {
    // No catalogue on this machine: nothing counts as a Skill store skill.
  }
  catalog = { at: now, skills }
  return skills
}

async function ratedOf(host: Host): Promise<Rated> {
  const raw = await host.storeGet(RATED_KEY).catch(() => undefined)
  return raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Rated) : {}
}

/** The prompt footer's label for the skills in use: the latest by name, and how many more. */
export function skillModeOf(skills: readonly UsedSkill[] = usedSkills()): string | undefined {
  const last = skills.at(-1)
  if (!last) return undefined
  return skills.length === 1 ? `skill ${last.name}` : `skill ${last.name} +${skills.length - 1}`
}

/** The skills loaded by the calls of a folded group, each once, in order. */
export function skillsAmong(calls: ReadonlyArray<{ tool_use_id?: string }>): UsedSkill[] {
  const found: UsedSkill[] = []
  for (const call of calls) {
    const skill = skillForCall(call.tool_use_id)
    if (skill && !found.includes(skill)) found.push(skill)
  }
  return found
}

/**
 * Notes that a skill was used, by a tool call when one loaded it. Never
 * throws; a skill the catalogue does not hold is left alone.
 */
export async function noteSkill(host: Host, id: unknown, toolUseId?: string, now = Date.now()): Promise<void> {
  try {
    if (typeof id !== 'string' || !id) return
    const known = (await catalogOf(host, now)).get(id)
    if (!known) return
    let skill = used.get(id)
    if (!skill) {
      const before = (await ratedOf(host))[id]
      // Asked again only once the skill has changed since it was rated.
      const settled = !!before && (!known.updated || before.at >= known.updated)
      skill = { id, name: known.name, at: now, turnDone: false, calls: [], canRate: !settled }
      used.set(id, skill)
    }
    if (toolUseId && !skill.calls.includes(toolUseId)) skill.calls.push(toolUseId)
    host.invalidate()
  } catch (error) {
    host.debug(`skills: could not note ${String(id)}: ${String(error)}`)
  }
}

/** The main turn ended: the skills it used may now be rated. */
export function skillsTurnDone(host: Host): void {
  let changed = false
  for (const skill of used.values()) {
    if (skill.turnDone) continue
    skill.turnDone = true
    changed = true
  }
  if (changed) host.invalidate()
}

/** Sends a thumbs rating. A "didn't help" leaves the prompt ready for the reason. */
export async function rateSkill(host: Host, id: string, rating: 'up' | 'down'): Promise<void> {
  const skill = used.get(id)
  if (!skill || skill.sending) return
  skill.sending = true
  skill.failed = false
  host.invalidate()
  try {
    const run = await host.run(await withIdentity(host, ['alis', 'skills', 'feedback', id, '--rating', rating, '--json']), { timeoutMs: FEEDBACK_TIMEOUT_MS })
    if (run.exitCode !== 0) throw new Error(failureOf(run))
    skill.rating = rating
    const rated = await ratedOf(host)
    await host.storeSet(RATED_KEY, { ...rated, [id]: { rating, at: new Date().toISOString() } }).catch(error => host.debug(`skills: could not remember the rating: ${String(error)}`))
    // The question leaves the band with the answer, so the thanks is a toast.
    host.toast(rating === 'up' ? 'Thanks. Your rating went to the skill\'s owner.' : 'Thanks. Say what went wrong and it reaches the skill\'s owner.')
    if (rating === 'down') await sayMore(host, id)
  } catch (error) {
    skill.failed = true
    host.debug(`skills: rating ${id} failed: ${String(error)}`)
  } finally {
    skill.sending = false
    host.invalidate()
  }
}

/** Leaves `/alis feedback <id> ` in the prompt for the person to finish. */
export async function sayMore(host: Host, id: string): Promise<void> {
  await host.fillPrompt(`/alis feedback ${id} `).catch(error => host.debug(`skills: could not fill the prompt: ${String(error)}`))
}

/** The skill the line above the prompt asks about: the latest whose turn has ended and that is still to be rated. */
export function skillToRate(): UsedSkill | undefined {
  return usedSkills().findLast(skill => skill.turnDone && skill.canRate && (!skill.rating || skill.sending || skill.failed))
}

/** "Not now": the question is not asked again in this session; the next session may ask. */
export function dismissRating(host: Host, id: string): void {
  const skill = used.get(id)
  if (!skill) return
  skill.canRate = false
  host.invalidate()
}

export type SkillActions = { rate: (rating: 'up' | 'down') => void; sayMore: () => void; dismiss: () => void }

export function skillActions(host: Host, id: string): SkillActions {
  return { rate: rating => void rateSkill(host, id, rating), sayMore: () => void sayMore(host, id), dismiss: () => dismissRating(host, id) }
}

const FEEDBACK_USAGE = 'feedback: nothing sent\nusage: /alis feedback <skill id> <what happened>'

/**
 * `/alis feedback [skill] <message>`: the message reaches the skill's
 * owner as a conversation; the person is then asked whether the session
 * goes with it. With one skill in use its id may be left out.
 */
export async function sendSkillFeedback(host: Host, words: readonly string[]): Promise<string> {
  const known = await catalogOf(host, Date.now())
  let id = words[0]
  let message = words.slice(1)
  if (!id || (!used.has(id) && !known.has(id))) {
    if (used.size !== 1 || words.length === 0) return used.size === 0 && words.length > 0 ? `${FEEDBACK_USAGE}\nskill: name the skill, none was used in this session` : FEEDBACK_USAGE
    id = usedSkills()[0]?.id as string
    message = [...words]
  }
  if (message.length === 0) return FEEDBACK_USAGE
  try {
    const run = await host.run(await withIdentity(host, ['alis', 'skills', 'feedback', id, message.join(' '), '--json']), { timeoutMs: FEEDBACK_TIMEOUT_MS })
    if (run.exitCode !== 0) return `feedback: failed\nerror: ${failureOf(run)}`
    const ticket = jsonOf(run.stdout)?.['ticket']
    const lines = ['feedback: sent to the skill\'s owner', `skill: ${id}`]
    if (typeof ticket !== 'string' || !ticket) return lines.join('\n')
    lines.push(`conversation: ${ticket}`)
    lines.push(`session: ${await offerSession(host, ticket)}`)
    return lines.join('\n')
  } catch (error) {
    return `feedback: failed\nerror: ${String(error)}`
  }
}

export const SEND_SESSION = 'Send session'
export const NOT_NOW = 'Not now'

/** Asks whether this session goes with the feedback, and sends it on a yes. */
async function offerSession(host: Host, ticket: string): Promise<string> {
  if ((await host.surface().catch(() => null)) === null) return 'not attached'
  let answer: string
  try {
    answer = await host.ask('Send this session with it, so the skill\'s owner can see what happened? Credentials are masked before it leaves this machine.', { options: [SEND_SESSION, NOT_NOW], header: 'AlisX' })
  } catch {
    return 'not attached'
  }
  if (answer !== SEND_SESSION) return 'not attached'
  try {
    const sid = await host.sessionId()
    const run = await host.run(await withIdentity(host, ['alis', 'specialist', 'send-session', '--ticket', ticket, '--session', sid, '--approve', '--json']), { timeoutMs: SEND_TIMEOUT_MS })
    return run.exitCode === 0 ? 'attached' : `not attached (${failureOf(run)})`
  } catch (error) {
    return `not attached (${String(error)})`
  }
}
