import { describe, expect, test, tier } from 'claude-code/testing'

import { decide } from '../hooks/mod/cli-gate'
import { toPreToolUseResult } from '../hooks/mod/classic-result'
import { PARITY } from './fixtures/parity'

tier('user')

// Recorded answers from the Python gate at v0.37.2, also checked by the
// native CLI in internal/pluginhooks/testdata/permission-parity.json. Update
// both corpora and both implementations when changing the permission policy.
describe('parity', () => {
  test('decide() agrees with the Python gate on every recorded case', () => {
    const mismatches: string[] = []
    for (const c of PARITY) {
      const mine = toPreToolUseResult(
        decide({
          toolName: 'Bash',
          permissionMode: c.mode,
          sessionId: 'session-a',
          allowedSubcmds: c.allowed,
          automationTier: c.tier || undefined,
          toolInput: { command: c.command, timeout: 120000 },
        }),
      )
      const theirs = fromPython(c.python)
      if (JSON.stringify(mine) !== JSON.stringify(theirs)) {
        mismatches.push(`${JSON.stringify(c.command)} mode=${c.mode} allowed=${JSON.stringify(c.allowed)} tier=${c.tier}\n  ts: ${JSON.stringify(mine)}\n  py: ${JSON.stringify(theirs)}`)
      }
    }
    expect(mismatches).toEqual([])
    expect(PARITY.length).toBeGreaterThan(800)
  })
})

/** The Python hookSpecificOutput in the shape toPreToolUseResult answers. */
function fromPython(output: Record<string, unknown> | null): Record<string, unknown> {
  if (!output) return {}
  const result: Record<string, unknown> = {}
  const reason = output['permissionDecisionReason']
  switch (output['permissionDecision']) {
    case 'allow': result['allow'] = true; break
    case 'ask': result['ask'] = reason; break
    case 'deny': result['deny'] = reason; break
  }
  if (output['updatedInput']) result['updatedInput'] = output['updatedInput']
  if (output['additionalContext']) result['additionalContext'] = [output['additionalContext']]
  return result
}
