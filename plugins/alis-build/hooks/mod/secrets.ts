// Secret-looking values in tool calls (secrets-hook.py's job, and more).
//
// A tool result is masked on its way into the conversation (session.append):
// each value becomes [REDACTED:kind], its name kept, so the model never reads
// it, and the person gets a toast. The transcript file still holds the raw
// output in the row's structured tool record (toolUseResult), which the
// engine stores as made and no hook can rewrite. What cannot be masked
// gets the old warning at PostToolUse: a tool call's own arguments (the
// engine puts tool_use blocks back) and what an `alis environment … --reveal`
// printed, which the person asked to see and the Bash gate confirmed. The
// CLI masks its own uploads since 1.146.1; this covers `cat .env`, printenv
// and the like.
//
// The pattern table is the one in hooks/secrets-hook.py, in the same order;
// tests/secrets.test.ts and tests/test_behavior.py share their samples.
import type { SecretsMemo } from '../../types'
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
      // An earlier pattern owns any overlapping span (one value, one count);
      // a match holding a mask marker is masked text, not a value.
      if (keep(m) && !m[0].includes('[REDACTED:') && !spans.some(s => start < s.end && end > s.start)) spans.push({ kind, start, end, value: m[0] })
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
// a .env written then read warns once. Never the values themselves. Masked
// values are kept apart: the model never saw them, so a later exposure of
// the same value still warns.
const seen = new Set<string>()
const maskedSeen = new Set<string>()

// Bash calls whose result is left unmasked (see isEnvCommand), by tool_use_id,
// noted at tool.call and taken when the result row arrives.
const unmasked = new Set<string>()

export type { SecretsMemo }

/** What survives a reload of the module (see saved.ts). */
export function secretsMemo(): SecretsMemo {
  return { seen: [...seen], masked: [...maskedSeen], unmasked: [...unmasked] }
}

export function restoreSecrets(memo: SecretsMemo): void {
  forgetSecrets()
  for (const h of memo.seen) seen.add(h)
  for (const h of memo.masked) maskedSeen.add(h)
  for (const id of memo.unmasked) unmasked.add(id)
}

export function forgetSecrets(): void {
  seen.clear()
  maskedSeen.clear()
  unmasked.clear()
}

/** Notes a Bash call whose result must reach the model as printed. */
export function noteBashCall(e: object): void {
  const p = e as Record<string, unknown>
  if (typeof p['tool_use_id'] === 'string' && isEnvCommand(p['command'])) unmasked.add(p['tool_use_id'])
}

function hashOf(value: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return `${h.toString(16)}:${value.length}`
}

/** Whether a Bash command prints environment values (and so is never masked). */
export function isEnvCommand(command: unknown): boolean {
  return typeof command === 'string' && ENV_COMMAND.test(command)
}

/**
 * The classic PostToolUse answer for one tool call: the values the model saw
 * despite the masking, its arguments and a reveal's output. Empty when those
 * are clean or already warned about.
 */
export async function secretsAnswer(host: Host, e: object): Promise<{ additionalContext?: string[] }> {
  const p = e as Record<string, unknown>
  const input = p['tool_input']
  const revealed = isEnvCommand(typeof input === 'object' && input !== null ? (input as Record<string, unknown>)['command'] : undefined)
  const text = `${revealed ? textOf(p['tool_response']) : ''}\n${inputTextOf(input)}`.slice(0, MAX_SCAN)
  const fresh = spansOf(text, revealed).filter(s => !seen.has(hashOf(s.value)))
  if (fresh.length === 0) return {}
  for (const s of fresh) seen.add(hashOf(s.value))
  const kinds = kindsOf(fresh)
  const tool = typeof p['tool_name'] === 'string' ? p['tool_name'] : 'tool'
  host.toast(toastOf(tool, kinds))
  return { additionalContext: [warningOf(kinds)] }
}

const KEY_END = /-----END [A-Z ]*PRIVATE KEY-----/g

/** A span's replacement: the marker, keeping an assignment's name and a connection string's user. */
function maskOf(s: Span): string {
  const marker = `[REDACTED:${s.kind}]`
  if (s.kind === 'assignment') return `${/^.*?[=:]\s*["']?/.exec(s.value)?.[0] ?? ''}${marker}`
  if (s.kind === 'postgres') return `${/^postgres(?:ql)?:\/\/[^:/\s@]+:/.exec(s.value)?.[0] ?? ''}${marker}@`
  return marker
}

/** `text` with every secret-looking value masked, and the spans masked. */
export function maskText(text: string): { text: string; spans: Span[] } {
  const spans = spansOf(text.slice(0, MAX_SCAN), false).sort((a, b) => a.start - b.start)
  // The pattern finds a private key by its header; the mask takes the key
  // through its footer, or to the end when the text was cut.
  for (const s of spans) {
    if (s.kind !== 'privateKey') continue
    KEY_END.lastIndex = s.end
    const end = KEY_END.exec(text)
    s.end = end ? end.index + end[0].length : text.length
  }
  const kept = spans.filter(s => !spans.some(o => o !== s && o.kind === 'privateKey' && s.start >= o.start && s.end <= o.end))
  let out = ''
  let at = 0
  for (const s of kept) {
    out += text.slice(at, s.start) + maskOf(s)
    at = s.end
  }
  return { text: out + text.slice(at), spans: kept }
}

type Block = { type?: unknown; text?: unknown; content?: unknown; tool_use_id?: unknown }

function maskBlock(block: Block, spans: Span[]): Block {
  const mask = (text: string) => {
    const masked = maskText(text)
    spans.push(...masked.spans)
    return masked.text
  }
  if (block.type === 'text' && typeof block.text === 'string') return { ...block, text: mask(block.text) }
  if (block.type !== 'tool_result') return block
  if (typeof block.tool_use_id === 'string' && unmasked.delete(block.tool_use_id)) return block
  if (typeof block.content === 'string') return { ...block, content: mask(block.content) }
  if (Array.isArray(block.content)) return { ...block, content: block.content.map(b => (typeof b === 'object' && b !== null ? maskBlock(b as Block, spans) : b)) }
  return block
}

/**
 * A tool-result row with its secret-looking values masked, and the kinds of
 * those not masked before (the toast's). `changed` is false when nothing was.
 */
export function maskRow<M extends { content: readonly unknown[] }>(message: M): { message: M; changed: boolean; fresh: SecretKind[] } {
  const spans: Span[] = []
  const content = message.content.map(b => (typeof b === 'object' && b !== null ? maskBlock(b as Block, spans) : b))
  const fresh = spans.filter(s => !maskedSeen.has(hashOf(s.value)))
  for (const s of fresh) maskedSeen.add(hashOf(s.value))
  return { message: spans.length > 0 ? { ...message, content } : message, changed: spans.length > 0, fresh: kindsOf(fresh) }
}

/** What the person sees when a result was masked; never carries a value. */
export function maskedToastOf(tool: string, kinds: SecretKind[]): string {
  return `masked secret-looking values in the last ${tool} result before Claude read them (${list(kinds)}).`
}
