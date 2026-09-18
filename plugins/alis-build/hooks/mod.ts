// The alis plugin's function-hooks module (Claude Code early access, loaded
// only where CLAUDE_CODE_ENABLE_FUNCTION_HOOKS is on). The classic shell
// hooks in this folder stay the fallback; hooks/mod/tag.ts and
// hooks/mod/classic.ts explain how the two sides avoid running one job twice.
//
// Every call on `$` is spelled in this file (see hooks/mod/host.ts for why);
// the hooks themselves live under hooks/mod/ and take a Host.
import type { EngineInterface, Register } from 'claude-code'

import { COMMAND_SPEC, runAlisCommand } from './mod/alis-command'
import { renderAlisOutput } from './mod/alis-render'
import { watchAlisCall } from './mod/ops-live'
import { renderOpsResult } from './mod/ops-render'
import { passClassic } from './mod/classic'
import { cliGateClassic } from './mod/cli-gate-classic'
import type { Host } from './mod/host'
import { suggestSkills } from './mod/suggest'

type HostNouns = Pick<EngineInterface, 'env' | 'fs' | 'process' | 'ui' | 'session' | 'clock'>

export function hostOf($: HostNouns): Host {
  return {
    home: () => $.env.get('HOME'),
    pluginRoot: () => $.env.get('CLAUDE_PLUGIN_ROOT'),
    allowedSubcmds: () => $.env.get('ALIS_ALLOWED_SUBCMDS'),
    suggestAlways: () => $.env.get('ALIS_SUGGEST_ALWAYS'),
    sessionId: () => $.session.id(),
    cwd: () => $.session.cwd(),
    root: () => $.session.root(),
    exists: path => $.fs.exists(path),
    status: text => $.ui.status(text),
    notice: (toolUseId, text) => $.ui.notice(toolUseId, text),
    every: (ms, fn) => $.clock.every(ms, fn).cancel,
    writeFile: (path, text) => $.fs.write(path, text),
    run: (argv, init) => $.process.run(argv, init),
    debug: text => $.ui.log(text, { to: 'debug' }),
  }
}

export const register: Register = on => {
  // Outermost: every classic event passes down tagged or marked, and the
  // handoff lifecycle is relayed. Never answer without next here, since one
  // classic dispatch carries every other plugin's hooks; a failure passes
  // the event down untouched.
  on('classic.*', ($, e, next) => passClassic(hostOf($), next.event, e, next)).catch(($, e, next) => next(e))

  // The permission gate for `alis …` commands (cli-hook.py's job). A failure
  // answers with the chain beneath; the gate's own throw is logged by the
  // engine.
  on('classic.PreToolUse', { tool: 'Bash' }, ($, e, next) => cliGateClassic(hostOf($), e, next)).catch(($, e, next) => next(e))

  // Per-prompt skill discovery (suggest-skills.sh's job).
  on('prompt.submit', ($, e, next) => suggestSkills(hostOf($), e, next)).catch(($, e, next) => next(e))

  // /alis: registered once the session is ready, so it is listed by turn one.
  on('session.start', async ($, e, next) => {
    await $.command.register(COMMAND_SPEC).catch(error => $.ui.log(`alis: could not register /alis: ${String(error)}`, { to: 'debug' }))
    return next(e)
  }).catch(($, e, next) => next(e))
  on('command.run', { command: 'alis' }, ($, e) => runAlisCommand(hostOf($), e.args))

  // Alis operations in Bash rows: a live line while `alis operations wait`
  // runs, and a summary in place of the NDJSON progress once it is done.
  on('tool.call', { tool: 'Bash' }, ($, e, next) => watchAlisCall(hostOf($), e, next, next.signal)).catch(($, e, next) => next(e))
  on('ui.render', { component: 'ToolResult', props: { tool: 'Bash' } }, ($, e, next) => renderOpsResult($.ui.resolve(e), e.props.output) ?? next(e))
  on('ui.render', { component: 'CommandOutput', props: { command: 'alis' } }, ($, e, next) => renderAlisOutput($.ui.resolve(e), e.props.text) ?? next(e))
}
