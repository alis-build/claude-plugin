// The alis plugin's function-hooks module (Claude Code early access, loaded
// only where CLAUDE_CODE_ENABLE_FUNCTION_HOOKS is on). The classic shell
// hooks in this folder stay the fallback; hooks/mod/tag.ts and
// hooks/mod/classic.ts explain how the two sides avoid running one job twice.
//
// Every call on `$` is spelled in this file (see hooks/mod/host.ts for why);
// the hooks themselves live under hooks/mod/ and take a Host.
import type { EngineInterface, Register } from 'claude-code'

import { passClassic } from './mod/classic'
import { cliGateClassic } from './mod/cli-gate-classic'
import type { Host } from './mod/host'

type HostNouns = Pick<EngineInterface, 'env' | 'fs' | 'process' | 'ui' | 'session'>

export function hostOf($: HostNouns): Host {
  return {
    home: () => $.env.get('HOME'),
    pluginRoot: () => $.env.get('CLAUDE_PLUGIN_ROOT'),
    allowedSubcmds: () => $.env.get('ALIS_ALLOWED_SUBCMDS'),
    sessionId: () => $.session.id(),
    cwd: () => $.session.cwd(),
    exists: path => $.fs.exists(path),
    status: text => $.ui.status(text),
    writeFile: (path, text) => $.fs.write(path, text),
    run: (argv, init) => $.process.run(argv, init),
    debug: text => $.ui.log(text, { to: 'debug' }),
  }
}

export const register: Register = on => {
  // Outermost: every classic event passes down tagged or marked. Never answer
  // without next here, since one classic dispatch carries every other
  // plugin's hooks; a failure passes the event down untouched.
  on('classic.*', ($, e, next) => passClassic(hostOf($), next.event, e, next)).catch(($, e, next) => next(e))

  // The permission gate for `alis …` commands (cli-hook.py's job). A failure
  // answers with the chain beneath; the gate's own throw is logged by the
  // engine.
  on('classic.PreToolUse', { tool: 'Bash' }, ($, e, next) => cliGateClassic(hostOf($), e, next)).catch(($, e, next) => next(e))
}
