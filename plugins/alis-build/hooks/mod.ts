// The alis plugin's function-hooks module (Claude Code early access, loaded
// only where CLAUDE_CODE_ENABLE_FUNCTION_HOOKS is on). The classic shell
// hooks in this folder stay the fallback; hooks/mod/tag.ts explains how the
// two sides avoid running one job twice.
import type { Register } from 'claude-code'

import { tagClassic } from './mod/tag'

export const register: Register = on => {
  // Outermost: every classic event passes down tagged. Never answer without
  // next here, since one classic dispatch carries every other plugin's hooks.
  on('classic.*', ($, e, next) => next(tagClassic(e)))
}
