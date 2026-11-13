// Sending this session to the AlisX build team (`/alis share [note]`, and
// the button under a platform-side failure). The CLI does the work:
// `alis specialist send-message --attach-session` finds the transcript,
// masks credentials, packages it and opens a conversation. The module runs
// it as a dry run first and shows the person exactly what would leave the
// machine (size, lines kept, credentials masked) in the engine's own
// dialog; only their answer sends it, bound to the reviewed message by its
// digest.
import { failureOf, jsonOf, withIdentity } from './cli'
import type { Host } from './host'

export const SEND = 'Send session'
export const KEEP = 'Not now'
export const DEFAULT_NOTE = 'Sharing this Claude Code session with the build team to help improve the platform.'

const DRY_RUN_TIMEOUT_MS = 60_000
const SEND_TIMEOUT_MS = 180_000

type Attachment = { title?: string; compressedBytes: number; truncated: boolean; keptLines?: number; totalLines?: number; redactions: number }

/** A size as people read it: `412 KB`, `3.2 MB`. */
export function sizeOf(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1000))} KB`
}

function attachmentOf(raw: unknown): Attachment | null {
  if (!raw || typeof raw !== 'object') return null
  const a = raw as Record<string, unknown>
  const count = (v: unknown) => (typeof v === 'number' ? v : 0)
  const redactions = a['redactions'] && typeof a['redactions'] === 'object' ? Object.values(a['redactions'] as Record<string, unknown>).reduce<number>((sum, n) => sum + count(n), 0) : 0
  return {
    ...(typeof a['title'] === 'string' && a['title'] ? { title: a['title'] } : {}),
    compressedBytes: count(a['compressed_bytes']),
    truncated: a['truncated'] === true,
    ...(count(a['kept_lines']) ? { keptLines: count(a['kept_lines']) } : {}),
    ...(count(a['total_lines']) ? { totalLines: count(a['total_lines']) } : {}),
    redactions,
  }
}

/** What the dialog says would leave the machine. */
export function shareQuestionOf(attachment: Attachment, note: string): string {
  const lines = attachment.truncated && attachment.keptLines && attachment.totalLines ? `the last ${attachment.keptLines.toLocaleString('en')} of ${attachment.totalLines.toLocaleString('en')} lines` : 'the whole transcript'
  const masked = attachment.redactions === 0 ? 'no credentials found' : `${attachment.redactions} credential${attachment.redactions === 1 ? '' : 's'} masked`
  return [
    'Send this session to the AlisX build team?',
    '',
    ...(attachment.title ? [attachment.title] : []),
    `${sizeOf(attachment.compressedBytes)} · ${lines} · ${masked}`,
    `Note: ${note}`,
  ].join('\n')
}

/**
 * Prepares, confirms and sends. Returns `key: value` lines for /alis; never
 * throws. Nothing is sent without the person's answer.
 */
export async function shareSession(host: Host, note?: string): Promise<string> {
  try {
    if ((await host.surface().catch(() => null)) === null) return 'share: not sent\nreason: there is no one to confirm it here'
    const sid = await host.sessionId().catch(() => '')
    if (!sid) return 'share: not sent\nreason: this session has no id'
    const message = note?.trim() || DEFAULT_NOTE
    const base = ['alis', 'specialist', 'send-message', '--message', message, '--attach-session', '--session', sid]
    const dry = await host.run(await withIdentity(host, [...base, '--dry-run', '--json']), { timeoutMs: DRY_RUN_TIMEOUT_MS })
    const prepared = jsonOf(dry.stdout)
    const attachment = attachmentOf(prepared?.['attachment'])
    const digest = (prepared?.['body'] as { sha256?: unknown } | undefined)?.sha256
    if (dry.exitCode !== 0 || !attachment || typeof digest !== 'string') return `share: not sent\nerror: ${dry.exitCode !== 0 ? failureOf(dry) : 'the CLI did not prepare the session'}`

    let answer: string
    try {
      answer = await host.ask(shareQuestionOf(attachment, message), { options: [SEND, KEEP], header: 'AlisX' })
    } catch {
      return 'share: not sent'
    }
    if (answer !== SEND) return 'share: not sent'

    const sent = await host.run(await withIdentity(host, [...base, '--expect-sha256', digest, '--approve', '--json']), { timeoutMs: SEND_TIMEOUT_MS })
    const receipt = jsonOf(sent.stdout)
    if (sent.exitCode !== 0 || typeof receipt?.['ticket'] !== 'string') return `share: not sent\nerror: ${failureOf(sent)}`
    host.toast('Session sent to the AlisX build team. Thank you.')
    return ['share: sent to the AlisX build team', `conversation: ${receipt['ticket']}`, ...(typeof receipt['url'] === 'string' && receipt['url'] ? [`url: ${receipt['url']}`] : [])].join('\n')
  } catch (error) {
    return `share: not sent\nerror: ${String(error)}`
  }
}

/** The button's press: the same flow, its outcome on the notification bar when nothing was sent. */
export async function shareFromRow(host: Host): Promise<void> {
  const text = await shareSession(host)
  const error = /^(?:error|reason): (.*)$/m.exec(text)?.[1]
  if (error) host.toast(`Session not sent: ${error}`)
}
