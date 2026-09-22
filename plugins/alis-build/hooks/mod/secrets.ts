// A warning when a tool result carries secret-looking values (secrets-hook.py's
// job). The result is already in the transcript by the time PostToolUse fires,
// so nothing here redacts: the person hears which kinds landed and that they
// need rotating, and the model is told not to repeat them. The CLI masks its
// own uploads since 1.146.1; this covers `cat .env`, printenv and the like.
//
// The pattern table is the one in hooks/secrets-hook.py, in the same order;
// tests/secrets.test.ts and tests/test_behavior.py share their samples.
import type { Host } from './host'

export type SecretKind = { kind: string; count: number }

const PATTERNS: readonly [string, RegExp][] = [
  ['stripe', /\bsk_(?:live|test)_[A-Za-z0-9]{16,}/g],
  ['github', /\b(?:gh[oprsu]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{22,})/g],
  ['npm', /\bnpm_[A-Za-z0-9]{30,}/g],
  ['pypi', /\bpypi-[A-Za-z0-9_-]{50,}/g],
  ['linear', /\blin_api_[A-Za-z0-9]{20,}/g],
  ['sendgrid', /\bSG\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}/g],
  ['postgres', /\bpostgres(?:ql)?:\/\/[^:/\s@]+:[^@\s]+@/g],
  ['aws', /\bAKIA[0-9A-Z]{16}\b/g],
  ['google', /\bAIza[0-9A-Za-z_-]{35}\b/g],
  ['slack', /\bxox[abpr]-[0-9A-Za-z-]{10,}/g],
  ['privateKey', /-----BEGIN [A-Z ]*PRIVATE KEY-----/g],
  // NAME=value lines and "name": "value" pairs whose name says secret. A
  // masked value (••••), a [REDACTED:kind] marker and a names-only listing
  // ({"name": "X_SECRET", "set": true}) have no such value after the name.
  ['assignment', /\b[A-Z0-9_]*(?:SECRET|TOKEN|PASSWORD|PASSWD|API_?KEY|CLIENT_SECRET)[A-Z0-9_]*["']?\s*[=:]\s*["']?[A-Za-z0-9_\-./+=]{16,}/gi],
]

/** The kinds of secret-looking values in `text`, in table order, with how many of each. */
export function secretKindsOf(text: string): SecretKind[] {
  const kinds: SecretKind[] = []
  for (const [kind, pattern] of PATTERNS) {
    const count = (text.match(pattern) ?? []).length
    if (count > 0) kinds.push({ kind, count })
  }
  return kinds
}

/** The text a tool result put in the transcript: Bash streams, a Read's content, else the whole JSON. */
export function textOf(response: unknown): string {
  if (typeof response === 'string') return response
  if (typeof response !== 'object' || response === null) return ''
  const r = response as Record<string, unknown>
  if (typeof r['stdout'] === 'string' || typeof r['stderr'] === 'string') {
    return `${typeof r['stdout'] === 'string' ? r['stdout'] : ''}\n${typeof r['stderr'] === 'string' ? r['stderr'] : ''}`
  }
  const file = r['file']
  if (typeof file === 'object' && file !== null && typeof (file as Record<string, unknown>)['content'] === 'string') {
    return (file as Record<string, unknown>)['content'] as string
  }
  return JSON.stringify(response)
}

const list = (kinds: SecretKind[]) => kinds.map(k => (k.count > 1 ? `${k.kind} ×${k.count}` : k.kind)).join(', ')

/** What the model is told; never carries a value. */
export function warningOf(kinds: SecretKind[]): string {
  const total = kinds.reduce((n, k) => n + k.count, 0)
  return (
    `alis: this tool result holds ${total} value${total === 1 ? '' : 's'} that look like secrets (${list(kinds)}). ` +
    'They are now in the session transcript. Do not repeat, quote, summarise or store them; refer to each by its name only. ' +
    'Tell the person these credentials need to be rotated.'
  )
}

/** What the person sees; never carries a value. */
export function toastOf(tool: string, kinds: SecretKind[]): string {
  return `alis: secret-looking values in the last ${tool} result (${list(kinds)}). They are in the transcript now; rotate them.`
}

/** The classic PostToolUse answer for one tool result; empty when it is clean. */
export async function secretsAnswer(host: Host, e: object): Promise<{ additionalContext?: string[] }> {
  const p = e as Record<string, unknown>
  const kinds = secretKindsOf(textOf(p['tool_response']))
  if (kinds.length === 0) return {}
  const tool = typeof p['tool_name'] === 'string' ? p['tool_name'] : 'tool'
  host.toast(toastOf(tool, kinds))
  return { additionalContext: [warningOf(kinds)] }
}
