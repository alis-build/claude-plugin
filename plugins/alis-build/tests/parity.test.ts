import { describe, expect, test, tier } from 'claude-code/testing'

import { decide } from '../hooks/mod/cli-gate'
import { toPreToolUseResult } from '../hooks/mod/classic-result'
import { PARITY } from './fixtures/parity'

tier('user')

// tests/fixtures/parity.ts holds what hooks/cli-hook.py decide() answered for
// each command × permission mode × ALIS_ALLOWED_SUBCMDS; the port must agree
// on every case. Regenerate it with (from the repo root):
//
//   python3 - <<'PY'
//   import importlib.util, json, os, sys; from pathlib import Path
//   HOOKS = Path("plugins/alis-build/hooks").resolve(); sys.path.insert(0, str(HOOKS))
//   spec = importlib.util.spec_from_file_location("cli_hook", HOOKS / "cli-hook.py")
//   m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
//   ... (same command list, modes auto/plan/default, allowed ""/"context doctor")
//   PY
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
          toolInput: { command: c.command, timeout: 120000 },
        }),
      )
      const theirs = fromPython(c.python)
      if (JSON.stringify(mine) !== JSON.stringify(theirs)) {
        mismatches.push(`${JSON.stringify(c.command)} mode=${c.mode} allowed=${JSON.stringify(c.allowed)}\n  ts: ${JSON.stringify(mine)}\n  py: ${JSON.stringify(theirs)}`)
      }
    }
    expect(mismatches).toEqual([])
    expect(PARITY.length).toBeGreaterThan(300)
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
