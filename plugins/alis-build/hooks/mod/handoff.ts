// The lifecycle relay for workstation handoff (handoff.sh's job). The alis
// CLI owns the session registry and the transfer worker: its `_hook` records
// every lifecycle event and answers when a handoff claims the session, so
// the call must keep happening per event. This file keeps it in-process and
// adds a status line while a claim is active.
import type { PreToolUseResult } from 'claude-code'

import { type ClassicAnswer, parseHookEnvelope } from './classic-result'
import type { Host } from './host'

export const HANDOFF_EVENTS = new Set([
  'SessionStart', 'UserPromptSubmit', 'PreToolUse', 'PostToolUse',
  'PermissionRequest', 'Notification', 'Stop', 'StopFailure', 'SessionEnd',
])

export const REASON =
  'This session has a handoff claim, but its coordinator is unavailable. Check alis workstation handoff status before continuing locally.'

const SESSION_ID = /^[A-Za-z0-9_-]{1,128}$/
const CLI_TIMEOUT_MS = 10_000

/** Whether the status line currently shows a claim, so it is cleared once. */
let statusShown = false

export type HandoffAnswer = ClassicAnswer & Partial<PreToolUseResult>

/**
 * Relays one lifecycle event to the CLI and returns what it answered, or
 * the fail-closed answer when the coordinator is unavailable and the
 * session has a handoff claim. Never throws.
 */
export async function handoffHook(host: Host, eventName: string, e: object): Promise<HandoffAnswer> {
  const payload = await payloadFor(host, eventName, e)
  const sid = payload['session_id']
  const validSid = typeof sid === 'string' && SESSION_ID.test(sid) ? sid : null

  let cliOk = false
  let answer: HandoffAnswer = {}
  try {
    const run = await host.run(['alis', 'workstation', 'handoff', '_hook'], { stdin: JSON.stringify(payload), timeoutMs: CLI_TIMEOUT_MS })
    if (run.exitCode === 0) {
      cliOk = true
      answer = parseHookEnvelope(run.stdout)
    }
  } catch (error) {
    host.debug(`handoff: alis workstation handoff _hook did not run: ${String(error)}`)
  }

  const claimed = validSid ? await isClaimed(host, validSid) : false
  if (!cliOk && claimed) {
    if (eventName === 'PreToolUse') answer = { deny: REASON }
    else if (eventName === 'UserPromptSubmit' || eventName === 'Stop') answer = { preventContinuation: true, stopReason: REASON }
  }
  showStatus(host, claimed, cliOk)
  return answer
}

/**
 * The payload the CLI reads: the classic payload as received, except on
 * PreToolUse, whose event is the tool-call envelope, where the lifecycle
 * fields are supplied from the engine (the registry keeps the rest).
 */
async function payloadFor(host: Host, eventName: string, e: object): Promise<Record<string, unknown>> {
  if (eventName !== 'PreToolUse') return { ...(e as Record<string, unknown>) }
  const [session_id, cwd] = await Promise.all([host.sessionId().catch(() => ''), host.cwd().catch(() => '')])
  return { session_id, hook_event_name: 'PreToolUse', cwd }
}

async function isClaimed(host: Host, sid: string): Promise<boolean> {
  try {
    const home = await host.home()
    return home ? await host.exists(`${home}/.alis/handoff-sessions/${sid}.claim`) : false
  } catch {
    return false
  }
}

function showStatus(host: Host, claimed: boolean, cliOk: boolean): void {
  if (claimed) {
    if (!statusShown) host.toast('a handoff has claimed this session')
    host.status(cliOk ? 'handoff: session claimed' : 'handoff: session claimed, coordinator unavailable')
    statusShown = true
  } else if (statusShown) {
    host.status(undefined)
    statusShown = false
  }
}
