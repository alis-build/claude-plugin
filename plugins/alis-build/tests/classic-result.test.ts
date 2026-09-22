import { describe, expect, test, tier } from 'claude-code/testing'

import { mergeClassic, parseHookEnvelope, toPreToolUseResult } from '../hooks/mod/classic-result'

tier('user')

describe('classic-result', () => {
  test('toPreToolUseResult maps each decision onto the classic result shape', () => {
    expect(toPreToolUseResult({ matched: false })).toEqual({})
    expect(toPreToolUseResult({ matched: true })).toEqual({})
    expect(toPreToolUseResult({ matched: true, additionalContext: 'g' })).toEqual({ additionalContext: ['g'] })
    expect(toPreToolUseResult({ matched: true, decision: 'allow', reason: 'r', updatedInput: { command: 'x' } })).toEqual({
      allow: true,
      updatedInput: { command: 'x' },
    })
    expect(toPreToolUseResult({ matched: true, decision: 'ask', reason: 'why' })).toEqual({ ask: 'why' })
    expect(toPreToolUseResult({ matched: true, decision: 'deny', reason: 'no' })).toEqual({ deny: 'no' })
  })

  test('parseHookEnvelope reads what the alis CLI prints as a command hook', () => {
    expect(parseHookEnvelope('')).toEqual({})
    expect(parseHookEnvelope('  \n')).toEqual({})
    expect(parseHookEnvelope('not json')).toEqual({})
    expect(parseHookEnvelope('[1]')).toEqual({})
    expect(parseHookEnvelope('{"continue":false,"stopReason":"handoff"}')).toEqual({ preventContinuation: true, stopReason: 'handoff' })
    expect(
      parseHookEnvelope('{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"claimed"}}'),
    ).toEqual({ deny: 'claimed' })
    expect(parseHookEnvelope('{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"a skill"}}')).toEqual({
      additionalContext: ['a skill'],
    })
    expect(parseHookEnvelope('{"decision":"block","reason":"stop"}')).toEqual({ block: 'stop' })
    expect(parseHookEnvelope('{"hookSpecificOutput":{"permissionDecision":"maybe","extra":1},"systemMessage":"x"}')).toEqual({})
  })

  test('mergeClassic lets a stricter verdict win and concatenates contexts', () => {
    expect(mergeClassic({ allow: true }, { ask: 'sure?' })).toEqual({ ask: 'sure?' })
    expect(mergeClassic({ deny: 'no' }, { allow: true })).toEqual({ deny: 'no' })
    expect(mergeClassic({ ask: 'a' }, { deny: 'b' })).toEqual({ deny: 'b' })
    expect(mergeClassic({ additionalContext: ['below'] }, { additionalContext: ['mine'] })).toEqual({ additionalContext: ['below', 'mine'] })
    expect(mergeClassic({ updatedInput: { command: 'old' } }, { updatedInput: { command: 'new' } })).toEqual({ updatedInput: { command: 'new' } })
    expect(mergeClassic({}, { preventContinuation: true, stopReason: 's' })).toEqual({ preventContinuation: true, stopReason: 's' })
    expect(mergeClassic({ preventContinuation: true, stopReason: 'below' }, {})).toEqual({ preventContinuation: true, stopReason: 'below' })
    expect(mergeClassic({ allow: true, additionalContext: ['k'] }, {})).toEqual({ allow: true, additionalContext: ['k'] })
  })
})
