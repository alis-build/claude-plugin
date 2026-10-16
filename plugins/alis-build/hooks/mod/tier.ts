// The CLI's effective automation tier, the same answer hooks/cli-hook.py's
// automation_tier() gives. On the manual tier the CLI refuses every mutating
// command without --approve (APPROVAL_REQUIRED). It decides from the server
// tier cached in ~/.alis/profile-cache.json, tightened by approvals.maxTier in
// ~/.alis/settings.json (approval.EffectiveTier), so the gate reads the same
// two files and can confirm a workflow up front instead of letting it bounce.
import type { Host } from './host'

export const TIERS = ['manual', 'balanced', 'autonomous'] as const

/** The stricter of the cached server tier and the local cap; undefined when neither file names one. */
export async function automationTierOf(host: Host): Promise<string | undefined> {
  const home = await host.home().catch(() => undefined)
  if (!home) return undefined
  const known = [
    await tierIn(host, `${home}/.alis/profile-cache.json`, ['automationTier']),
    await tierIn(host, `${home}/.alis/settings.json`, ['approvals', 'maxTier']),
  ].filter((t): t is (typeof TIERS)[number] => t !== undefined)
  return known.length > 0 ? TIERS[Math.min(...known.map(t => TIERS.indexOf(t)))] : undefined
}

async function tierIn(host: Host, path: string, keys: readonly string[]): Promise<(typeof TIERS)[number] | undefined> {
  try {
    let value: unknown = JSON.parse(await host.readFile(path))
    for (const key of keys) value = typeof value === 'object' && value !== null ? (value as Record<string, unknown>)[key] : undefined
    const tier = typeof value === 'string' ? value.trim().toLowerCase() : ''
    return (TIERS as readonly string[]).includes(tier) ? (tier as (typeof TIERS)[number]) : undefined
  } catch {
    return undefined
  }
}
