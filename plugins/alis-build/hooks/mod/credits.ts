// The person's AlisX credits, from `alis credits --json`: what they can draw
// on, what they earned, and what they have used this period. Credits are
// earned by sending a session the build team finds useful (/alis share); the
// team adds them later, so at session start the module looks for earned
// grants it has not seen before and says thank you once for each. What was
// seen is kept between sessions ($.store). A CLI without the command, or an
// account with no credits to read, leaves all of this silent.
import { jsonOf, withIdentity } from './cli'
import type { Host } from './host'

const READ_TIMEOUT_MS = 10_000
/** The $.store key holding the earned grants already announced: grant names. */
export const SEEN_KEY = 'earned-grants'
/** What the share dialog and the session pane say about earning. */
export const EARN_NOTE = 'If it proves useful, the build team adds AlisX credits to your account.'

export type Grant = { name: string; kind: string; credits: number; personal: boolean }
export type Credits = { account: string; available: number; earned: number; used: number; limit: number | null; grants: Grant[] }

const amount = (value: unknown): number => (typeof value === 'number' && Number.isFinite(value) ? value : 0)

/** Reads `alis credits --json`. */
export function creditsOf(json: Record<string, unknown>): Credits | null {
  if (typeof json['account'] !== 'string') return null
  const period = json['period'] && typeof json['period'] === 'object' ? (json['period'] as Record<string, unknown>) : {}
  const grants: Grant[] = []
  for (const item of Array.isArray(json['grants']) ? json['grants'] : []) {
    if (!item || typeof item !== 'object') continue
    const grant = item as Record<string, unknown>
    if (typeof grant['name'] !== 'string') continue
    grants.push({ name: grant['name'], kind: typeof grant['kind'] === 'string' ? grant['kind'] : '', credits: amount(grant['credits']), personal: grant['personal'] === true })
  }
  return {
    account: json['account'],
    available: amount(json['availableCredits']),
    earned: amount(json['earnedCredits']),
    used: amount(period['usedCredits']),
    limit: typeof period['limitCredits'] === 'number' ? period['limitCredits'] : null,
    grants,
  }
}

/** The credits as the CLI reports them, or null when they cannot be read. Never throws. */
export async function readCredits(host: Host): Promise<Credits | null> {
  try {
    const run = await host.run(await withIdentity(host, ['alis', 'credits', '--json']), { timeoutMs: READ_TIMEOUT_MS })
    const json = jsonOf(run.stdout)
    return run.exitCode === 0 && json && !json['error'] ? creditsOf(json) : null
  } catch (error) {
    host.debug(`credits: read failed: ${String(error)}`)
    return null
  }
}

/** An amount without trailing zeros: 10, 2.5, 0.125. */
export function creditsText(credits: number): string {
  return credits.toFixed(3).replace(/\.?0+$/, '')
}

/** "12.5 available (7.5 earned)". */
export function balanceOf(credits: Credits): string {
  return `${creditsText(credits.available)} available${credits.earned > 0 ? ` (${creditsText(credits.earned)} earned)` : ''}`
}

/**
 * Says thank you once for each earned grant made to this person that the
 * module has not seen. The first read on a machine only records what is
 * there: credits earned before the plugin knew of them are not news.
 */
export async function announceEarned(host: Host): Promise<void> {
  try {
    const credits = await readCredits(host)
    if (!credits) return
    const earned = credits.grants.filter(grant => grant.kind === 'earned' && grant.personal)
    const stored = await host.storeGet(SEEN_KEY)
    const seen = Array.isArray(stored) ? new Set(stored.filter((name): name is string => typeof name === 'string')) : null
    const fresh = seen ? earned.filter(grant => !seen.has(grant.name)) : []
    if (seen && fresh.length === 0) return
    await host.storeSet(SEEN_KEY, [...new Set([...(seen ?? []), ...earned.map(grant => grant.name)])])
    for (const grant of fresh) host.toast(`+${creditsText(grant.credits)} AlisX credits: a session you sent was useful to the build team. Thank you.`)
  } catch (error) {
    host.debug(`credits: could not check earned credits: ${String(error)}`)
  }
}

/** `/alis credits`: the balance as `key: value` lines. */
export async function creditsLines(host: Host): Promise<string> {
  const credits = await readCredits(host)
  if (!credits) return 'credits: unavailable\nwhy: the alis CLI could not read credits for your active account (an older CLI has no `alis credits`; run `alis upgrade`)'
  return [
    `credits: ${credits.account}`,
    `available: ${creditsText(credits.available)}`,
    `earned: ${creditsText(credits.earned)}`,
    `used: ${creditsText(credits.used)} this period${credits.limit === null ? '' : ` of ${creditsText(credits.limit)}`}`,
    'earn: /alis share sends this session to the AlisX build team; a session they find useful earns credits',
  ].join('\n')
}
