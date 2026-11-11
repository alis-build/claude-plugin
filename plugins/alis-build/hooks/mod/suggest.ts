// Per-prompt wake-word routing (suggest-skills.sh's job): when the person
// addresses alis ("alis, …") or asks to capture work as a skill, the alis CLI
// answers with a hook envelope naming the router skill to invoke, and this
// hook attaches it as context the model reads beside the prompt. The CLI's
// ambient "Possibly relevant Alis skill" notes are dropped: lexical matching
// on whole prompts suggested unrelated skills too often to be worth showing.
// In plan mode the CLI asks the Skill store to rank the request instead, and
// words that answer apart ("Skill store match for this request"); that note
// is attached like a wake hint.
// Every failure path leaves the prompt untouched: routing must never break a
// prompt.
import type { PromptSubmitInput, PromptSubmitResult } from 'claude-code'

import { classicState } from './classic'
import { parseHookEnvelope } from './classic-result'
import type { Host } from './host'

const CLI_TIMEOUT_MS = 2_000
const WAKE_WORDS = /alis|skill/i
const AMBIENT_NOTE = /^Possibly relevant Alis skills?:/

export async function suggestSkills(
  host: Host,
  e: PromptSubmitInput,
  next: (e: PromptSubmitInput) => Promise<PromptSubmitResult>,
): Promise<PromptSubmitResult> {
  try {
    // Outside plan mode only explicit addresses matter, so this cheap
    // prefilter skips the CLI call for prompts that cannot contain one; the
    // CLI's strict regexes make the actual decision. A plan-mode prompt always
    // reaches the CLI, which is where it asks the Skill store.
    // ALIS_SUGGEST_ALWAYS=1 disables the prefilter.
    const planning = classicState.permissionMode === 'plan'
    if ((await host.suggestAlways()) !== '1' && !planning && !WAKE_WORDS.test(e.text)) return next(e)
    const root = await host.root().catch(() => '')
    const payload = {
      hook_event_name: 'UserPromptSubmit',
      session_id: await host.sessionId().catch(() => ''),
      cwd: await host.cwd().catch(() => root),
      permission_mode: classicState.permissionMode ?? '',
      prompt: e.text,
    }
    const run = await host.run(['alis', 'skills', 'suggest', '--hook'], { stdin: JSON.stringify(payload), timeoutMs: CLI_TIMEOUT_MS })
    if (run.exitCode !== 0) return next(e)
    const text = parseHookEnvelope(run.stdout).additionalContext?.[0]
    if (!text || AMBIENT_NOTE.test(text.trim())) return next(e)
    return next({ ...e, context: [...(e.context ?? []), text] })
  } catch (error) {
    host.debug(`suggest: skipped: ${String(error)}`)
    return next(e)
  }
}
