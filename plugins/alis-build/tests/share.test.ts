import { describe, expect, test, tier } from 'claude-code/testing'

import { runAlisCommand } from '../hooks/mod/alis-command'
import { operationStateOf } from '../hooks/mod/ops'
import { foldLineOf } from '../hooks/mod/ops-progress'
import { foldOf, foldRow } from '../hooks/mod/ops-render'
import { DEFAULT_NOTE, KEEP, SEND, shareFromRow, shareQuestionOf, shareSession, sizeOf } from '../hooks/mod/share'
import { fakeHost, type Run } from './fixtures/fake-host'

tier('user')

const PREPARED = JSON.stringify({
  dry_run: true,
  body: { sha256: 'abc123' },
  attachment: { title: 'Fix the deploy row', compressed_bytes: 412_300, truncated: true, kept_lines: 2100, total_lines: 9800, redactions: { github: 2, assignment: 1 } },
  send: 'alis specialist send-message --message-file <path> --attach-session --expect-sha256 abc123 --approve --json',
})
const RECEIPT = JSON.stringify({ ticket: 'tickets/t1', url: 'https://console.alis.build/support/t1', created: true })
const cli = (run: Run) => ({ exitCode: 0, stdout: run.argv.includes('--dry-run') ? PREPARED : RECEIPT, stderr: '' })

describe('share', () => {
  test('the dialog says what would leave the machine', () => {
    expect(sizeOf(412_300)).toBe('412 KB')
    expect(sizeOf(3_200_000)).toBe('3.2 MB')
    expect(shareQuestionOf({ title: 'Fix the deploy row', compressedBytes: 412_300, truncated: true, keptLines: 2100, totalLines: 9800, redactions: 3 }, 'note')).toBe(
      'Send this session to the AlisX build team?\n\nFix the deploy row\n412 KB · the last 2,100 of 9,800 lines · 3 credentials masked\nNote: note\n\nIf it proves useful, the build team adds AlisX credits to your account.',
    )
    expect(shareQuestionOf({ compressedBytes: 900, truncated: false, redactions: 0 }, 'n')).toContain('1 KB · the whole transcript · no credentials found')
  })

  test('/alis share prepares, asks, and sends the reviewed message on a yes', async () => {
    const host = fakeHost({ answer: cli })
    host.askAnswer = SEND
    const text = (await runAlisCommand(host, 'share the deploy got stuck')).text
    expect(text).toBe('share: sent to the AlisX build team\nconversation: tickets/t1\nurl: https://console.alis.build/support/t1')
    const base = ['alis', 'specialist', 'send-message', '--message', 'the deploy got stuck', '--attach-session', '--session', 'session-a']
    expect(host.runs.map(r => r.argv)).toEqual([
      [...base, '--dry-run', '--json', '--session-id', 'session-a'],
      [...base, '--expect-sha256', 'abc123', '--approve', '--json', '--session-id', 'session-a'],
    ])
    expect(host.asks[0]?.question).toContain('3 credentials masked')
    expect(host.asks[0]?.options).toEqual({ options: [SEND, KEEP], header: 'AlisX' })
    expect(host.toasts).toEqual(['Session sent to the AlisX build team. Thank you.'])
  })

  test('nothing is sent without a yes, with no one to ask, or when the dry run fails', async () => {
    const declined = fakeHost({ answer: cli })
    declined.askAnswer = KEEP
    expect(await shareSession(declined)).toBe('share: not sent')
    expect(declined.runs).toHaveLength(1)
    expect(declined.runs[0]?.argv).toContain(DEFAULT_NOTE)

    const dismissed = fakeHost({ answer: cli })
    dismissed.askAnswer = new Error('dismissed')
    expect(await shareSession(dismissed)).toBe('share: not sent')
    expect(dismissed.runs).toHaveLength(1)

    const headless = fakeHost({ answer: cli })
    headless.drawn = null
    expect(await shareSession(headless)).toContain('no one to confirm')
    expect(headless.runs).toEqual([])

    const failing = fakeHost({ answer: () => ({ exitCode: 1, stdout: '{"error":{"code":"transcript_unreadable","message":"no transcript for this session"}}', stderr: '' }) })
    failing.askAnswer = SEND
    expect(await shareSession(failing)).toBe('share: not sent\nerror: no transcript for this session')
    expect(failing.asks).toEqual([])
    await shareFromRow(failing)
    expect(failing.toasts).toEqual(['Session not sent: no transcript for this session'])
  })

  test('a platform-side failure offers to send the session from its row', async ($, on) => {
    const envelope = '{"error":{"code":"INTERNAL","message":"the build service is unavailable","share":"alis specialist send-message --attach-session --message-file <path>"}}'
    expect(operationStateOf(envelope)).toMatchObject({ error: 'the build service is unavailable', share: true })
    expect(operationStateOf('{"error":{"code":"BUILD_FAILED","message":"step 3 failed"}}')?.share).toBe(undefined)
    expect(foldLineOf({ outcome: 'failed', share: true }).share).toBe(true)
    expect(foldLineOf({ outcome: 'done', share: true }).share).toBe(undefined)
    const fold = foldOf({ stdout: envelope, stderr: '{"elapsed":"0:04","progress":"starting"}', interrupted: false }, undefined)
    expect(fold).toMatchObject({ tone: 'error', share: true })

    let pressed = 0
    on('ui.render', { component: 'ToolResult' }, ($, e) => foldRow($.ui.resolve(e), e.surface, fold!, { follow: () => {}, cancel: () => {}, share: () => void (pressed += 1) }))
    const drawn = JSON.stringify(await $.ui.render({ surface: 'terminal', component: 'ToolResult', requestId: 't', props: { tool_use_id: 't', tool: 'Bash', output: {}, isErrored: true } }))
    expect(drawn).toContain('"label":"Send session to the build team"')
    expect(pressed).toBe(0)
  })
})
