// Per-prompt skill routing (suggest-skills.sh's job). Every prompt goes to the
// alis CLI, which answers with a hook envelope or nothing, and this hook
// attaches the answer as context the model reads beside the prompt:
//   - when the person addresses alis ("alis, …") or asks to capture work as a
//     skill, the router skill to invoke;
//   - otherwise, a skill the Skill store ranks as a match for the request
//     ("Skill store match for this request"), which the CLI asks for once the
//     prompt passes its gates (alis 1.187.18 or later; before that, in plan
//     mode only).
// The CLI's "Possibly relevant Alis skill" notes are dropped: they come from
// its local word-overlap matcher, which suggested unrelated skills too often
// to be worth showing.
// Every failure path leaves the prompt untouched: routing must never break a
// prompt.
import type { PromptSubmitInput, PromptSubmitResult } from 'claude-code'

import { classicState } from './classic'
import { parseHookEnvelope } from './classic-result'
import type { Host } from './host'

const CLI_TIMEOUT_MS = 2_000
// In plan mode the Skill store puts its best-ranked skills to a judge instead
// of its score bar (alis 1.195.13 or later asks it to): about 1.3 s at the
// median, up to about 3.5 s, on top of the CLI's own start. A planning prompt
// can spare that; every other prompt keeps the 2 s.
const PLAN_CLI_TIMEOUT_MS = 6_000
const WAKE_WORDS = /alis|skill/i
const AMBIENT_NOTE = /^Possibly relevant Alis skills?:/

export async function suggestSkills(
  host: Host,
  e: PromptSubmitInput,
  next: (e: PromptSubmitInput) => Promise<PromptSubmitResult>,
): Promise<PromptSubmitResult> {
  try {
    // ALIS_SUGGEST_ALWAYS=0 goes back to asking only where it used to: for
    // prompts that could hold an explicit address, and in plan mode.
    const planning = classicState.permissionMode === 'plan'
    if ((await host.suggestAlways()) === '0' && !planning && !WAKE_WORDS.test(e.text)) return next(e)
    const root = await host.root().catch(() => '')
    const timeoutMs = planning ? PLAN_CLI_TIMEOUT_MS : CLI_TIMEOUT_MS
    const payload = {
      hook_event_name: 'UserPromptSubmit',
      session_id: await host.sessionId().catch(() => ''),
      cwd: await host.cwd().catch(() => root),
      permission_mode: classicState.permissionMode ?? '',
      prompt: e.text,
      // The CLI waits for the judge only when told the hook has the time; an
      // older CLI ignores the field and keeps its short budget.
      alis_hook_timeout_ms: timeoutMs,
    }
    const run = await host.run(['alis', 'skills', 'suggest', '--hook'], { stdin: JSON.stringify(payload), timeoutMs })
    if (run.exitCode !== 0) return next(e)
    const text = parseHookEnvelope(run.stdout).additionalContext?.[0]
    if (!text || AMBIENT_NOTE.test(text.trim())) return next(e)
    return next({ ...e, context: [...(e.context ?? []), text] })
  } catch (error) {
    host.debug(`suggest: skipped: ${String(error)}`)
    return next(e)
  }
}
