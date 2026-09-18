// Bridges between the three shapes a classic hook's answer takes: the gate's
// GateDecision, the JSON envelope the alis CLI prints as a command hook
// (`hookSpecificOutput`, `continue`, …), and the ClassicResult a function
// hook returns. Strict on purpose: a field of the wrong shape fails the
// whole hook, so anything unrecognised is dropped, never passed through.
import type { PreToolUseResult } from 'claude-code'

import type { GateDecision } from './cli-gate'

/** The subset of ClassicResult the CLI's envelopes can express. */
export type ClassicAnswer = {
  block?: string
  preventContinuation?: true
  stopReason?: string
  additionalContext?: string[]
}

export function toPreToolUseResult(decision: GateDecision): PreToolUseResult {
  if (!decision.matched) return {}
  const result: PreToolUseResult =
    decision.decision === 'allow' ? { allow: true }
    : decision.decision === 'ask' ? { ask: decision.reason ?? '' }
    : decision.decision === 'deny' ? { deny: decision.reason ?? '' }
    : {}
  if (decision.updatedInput) result.updatedInput = decision.updatedInput
  if (decision.additionalContext) result.additionalContext = [decision.additionalContext]
  return result
}

/**
 * Parses what a classic command hook printed. Empty or unparsable text is
 * an empty answer, as the engine treats a hook that printed nothing.
 */
export function parseHookEnvelope(stdout: string): ClassicAnswer & Partial<PreToolUseResult> {
  const text = stdout.trim()
  if (text === '') return {}
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return {}
  }
  if (!isRecord(raw)) return {}
  const answer: ClassicAnswer & Partial<PreToolUseResult> = {}
  if (raw['continue'] === false) {
    answer.preventContinuation = true
    if (typeof raw['stopReason'] === 'string') answer.stopReason = raw['stopReason']
  }
  if (raw['decision'] === 'block' && typeof raw['reason'] === 'string') answer.block = raw['reason']
  const specific = raw['hookSpecificOutput']
  if (isRecord(specific)) {
    const reason = typeof specific['permissionDecisionReason'] === 'string' ? specific['permissionDecisionReason'] : ''
    switch (specific['permissionDecision']) {
      case 'allow': answer.allow = true; break
      case 'ask': answer.ask = reason; break
      case 'deny': answer.deny = reason; break
    }
    if (typeof specific['additionalContext'] === 'string') answer.additionalContext = [specific['additionalContext']]
    if (isRecord(specific['updatedInput'])) answer.updatedInput = specific['updatedInput']
  }
  return answer
}

/**
 * Folds this hook's answer over what the chain beneath returned: a deny
 * beats an ask beats an allow, this hook's updatedInput wins, contexts
 * concatenate, and a stop from either side stands.
 */
export function mergeClassic<T extends ClassicAnswer & Partial<PreToolUseResult>>(below: T, mine: ClassicAnswer & Partial<PreToolUseResult>): T {
  const merged: ClassicAnswer & Partial<PreToolUseResult> = { ...below }
  const rank = (a: Partial<PreToolUseResult>) => (a.deny !== undefined ? 3 : a.ask !== undefined ? 2 : a.allow ? 1 : 0)
  if (rank(mine) >= rank(below) && rank(mine) > 0) {
    delete merged.allow; delete merged.ask; delete merged.deny
    if (mine.deny !== undefined) merged.deny = mine.deny
    else if (mine.ask !== undefined) merged.ask = mine.ask
    else merged.allow = true
  }
  if (mine.updatedInput) merged.updatedInput = mine.updatedInput
  if (mine.additionalContext?.length) merged.additionalContext = [...(below.additionalContext ?? []), ...mine.additionalContext]
  if (mine.block !== undefined) merged.block = mine.block
  if (mine.preventContinuation) {
    merged.preventContinuation = true
    if (mine.stopReason !== undefined) merged.stopReason = mine.stopReason
  }
  return merged as T
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
