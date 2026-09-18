// Wires the pure gate onto classic.PreToolUse for Bash. That event's `e` is
// the tool-call envelope (the Bash arguments plus `tool` and `tool_use_id`),
// and its result shape is decide()'s one to one, so the port sits here
// rather than on tool.call/tool.check. The permission mode is not on the
// envelope: it comes from what the other classic events reported last
// (classicState), and the session id from the engine.
import type { PreToolUseResult } from 'claude-code'

import { decide } from './cli-gate'
import { classicState } from './classic'
import { mergeClassic, toPreToolUseResult } from './classic-result'
import { approvedCalls } from './deploy-dialog'
import { observe } from './health'
import type { Host } from './host'

export const HEALTH_FILE = 'claude-plugin-health.json'

export async function cliGateClassic<E extends object>(
  host: Host,
  e: E,
  next: (e: E) => Promise<PreToolUseResult>,
): Promise<PreToolUseResult> {
  const { tool, tool_use_id, ...toolInput } = e as Record<string, unknown>
  const permissionMode = classicState.permissionMode
  const decision = decide({
    toolName: tool,
    toolInput,
    permissionMode,
    sessionId: await host.sessionId().catch(() => undefined),
    allowedSubcmds: await host.allowedSubcmds(),
  })
  // The person already confirmed this exact call in the deploy dialog: that
  // stands in for the native prompt, once. The --approve rewrite still lands.
  if (decision.matched && decision.decision === 'ask' && typeof tool_use_id === 'string' && approvedCalls.delete(tool_use_id)) {
    decision.decision = 'allow'
    decision.reason = 'Confirmed by the person in the alis deploy dialog.'
  }
  if (decision.matched) {
    await observe(host, HEALTH_FILE, {
      permissionMode: permissionMode ?? 'unknown',
      approvalSource: 'native-confirmation-and-cli-tier',
    })
  }
  const below = await next(e)
  return decision.matched ? mergeClassic(below, toPreToolUseResult(decision)) : below
}
