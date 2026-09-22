// A warning when a tool call carries secret-looking values (secrets-hook.py's
// job). The call is already in the transcript by the time PostToolUse fires,
// so nothing here redacts: the person hears which kinds landed and that they
// need rotating, and the model is told not to repeat them. The CLI masks its
// own uploads since 1.146.1; this covers `cat .env`, printenv and the like,
// and the values an `alis environment … --reveal` printed on request.
//
// The pattern table is the one in hooks/secrets-hook.py, in the same order;
// tests/secrets.test.ts and tests/test_behavior.py share their samples.
import type { Host } from './host'

export type SecretKind = { kind: string; count: number }

/** Characters scanned per tool call; a Bash result is cut long before this. */
export const MAX_SCAN = 1_000_000

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
  // NAME=value lines and "NAME": "value" pairs whose UPPER_SNAKE name says
  // secret. A masked value (••••), a [REDACTED:kind] marker and a names-only
  // listing ({"name": "X_SECRET", "set": true}) have no value after the name;
  // lowercase and camelCase names are code, and *_NAME/_ID/_PATH/_URL/_FILE/
  // _REF name a secret rather than hold one.
  ['assignment', /\b([A-Z0-9_]*(?:SECRET|TOKEN|PASSWORD|PASSWD|API_?KEY)[A-Z0-9_]*)["']?\s*[=:]\s*["']?[A-Za-z0-9_\-./+=]{16,}/g],
]
const REFERENCE_NAME = /_(?:NAME|ID|PATH|URL|FILE|REF)$/

// What `alis environment variables|vars|refresh` prints once values are
// revealed: JSON name/value pairs, `NAME   value` table rows, and .env lines.
// Only read for that command: any other output has these shapes innocently.
const ENV_COMMAND = /^\s*alis\s+(?:--\S+(?:\s+[^-\s]\S*)?\s+)*(?:environment|environments|envs?)\s+(?:variables|vars|refresh)\b/
const REVEALED: readonly RegExp[] = [
  /"name"\s*:\s*"[^"]+"\s*,\s*"value"\s*:\s*"[^"]+"/g,
  /^[ \t]*[A-Z][A-Z0-9_]*[ \t]{2,}(?!•|\(empty\)|VALUE\b)\S.*$/gm,
  /^[ \t]*(?:export[ \t]+)?[A-Z][A-Z0-9_]*=\S.*$/gm,
]

type Span = { kind: string; start: number; end: number; value: string }

function spansOf(text: string, revealed: boolean): Span[] {
  const spans: Span[] = []
  const add = (kind: string, pattern: RegExp, keep: (m: RegExpMatchArray) => boolean = () => true) => {
    for (const m of text.matchAll(pattern)) {
      const start = m.index ?? 0
      const end = start + m[0].length
      // An earlier pattern owns any overlapping span (one value, one count).
      if (keep(m) && !spans.some(s => start < s.end && end > s.start)) spans.push({ kind, start, end, value: m[0] })
    }
  }
  if (revealed) for (const pattern of REVEALED) add('revealed', pattern)
  for (const [kind, pattern] of PATTERNS) {
    add(kind, pattern, m => kind !== 'assignment' || !REFERENCE_NAME.test(m[1] ?? ''))
  }
  return spans
}

function kindsOf(spans: Span[]): SecretKind[] {
  const order = ['revealed', ...PATTERNS.map(([kind]) => kind)]
  const counts = new Map<string, number>()
  for (const s of spans) counts.set(s.kind, (counts.get(s.kind) ?? 0) + 1)
  return order.filter(kind => counts.has(kind)).map(kind => ({ kind, count: counts.get(kind) as number }))
}

/** The kinds of secret-looking values in `text`, in table order, with how many of each. */
export function secretKindsOf(text: string, revealed = false): SecretKind[] {
  return kindsOf(spansOf(text.slice(0, MAX_SCAN), revealed))
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

/** The text a tool call put in the transcript on its way in: every string argument (a command, a file's content). */
export function inputTextOf(input: unknown): string {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return ''
  return Object.values(input as Record<string, unknown>).filter((v): v is string => typeof v === 'string').join('\n')
}

const list = (kinds: SecretKind[]) => kinds.map(k => (k.count > 1 ? `${k.kind} ×${k.count}` : k.kind)).join(', ')

/** What the model is told; never carries a value. */
export function warningOf(kinds: SecretKind[]): string {
  const total = kinds.reduce((n, k) => n + k.count, 0)
  return (
    `alis: this tool call holds ${total} value${total === 1 ? '' : 's'} that look like secrets (${list(kinds)}). ` +
    'They are now in the session transcript. Do not repeat, quote, summarise or store them; refer to each by its name only. ' +
    'Tell the person these credentials need to be rotated.'
  )
}

/** What the person sees; never carries a value. The engine adds the plugin's name. */
export function toastOf(tool: string, kinds: SecretKind[]): string {
  return `secret-looking values in the last ${tool} call (${list(kinds)}). They are in the transcript now; rotate them.`
}

// Values already warned about this session, as hashes: a file read twice or
// a .env written then read warns once. Never the values themselves.
const seen = new Set<string>()

export function forgetSecrets(): void {
  seen.clear()
}

function hashOf(value: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return `${h.toString(16)}:${value.length}`
}

/** The classic PostToolUse answer for one tool call; empty when it is clean or already warned about. */
export async function secretsAnswer(host: Host, e: object): Promise<{ additionalContext?: string[] }> {
  const p = e as Record<string, unknown>
  const input = p['tool_input']
  const command = typeof input === 'object' && input !== null ? (input as Record<string, unknown>)['command'] : undefined
  const revealed = typeof command === 'string' && ENV_COMMAND.test(command)
  const text = `${textOf(p['tool_response'])}\n${inputTextOf(input)}`.slice(0, MAX_SCAN)
  const fresh = spansOf(text, revealed).filter(s => !seen.has(hashOf(s.value)))
  if (fresh.length === 0) return {}
  for (const s of fresh) seen.add(hashOf(s.value))
  const kinds = kindsOf(fresh)
  const tool = typeof p['tool_name'] === 'string' ? p['tool_name'] : 'tool'
  host.toast(toastOf(tool, kinds))
  return { additionalContext: [warningOf(kinds)] }
}
