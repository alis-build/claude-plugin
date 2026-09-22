// Per-prompt skill discovery (suggest-skills.sh's job): the alis CLI makes
// every decision (wake words, gating, scoring, latency budget) and answers
// with a hook envelope or nothing; this hook only asks it and attaches what
// it said as context the model reads beside the prompt. Every failure path
// leaves the prompt untouched: discovery must never break a prompt.
import type { PromptSubmitInput, PromptSubmitResult } from 'claude-code'

import { classicState } from './classic'
import { parseHookEnvelope } from './classic-result'
import type { Host } from './host'
import { dismissSuggestions, showSuggestions, suggestionsOf } from './suggest-band'

const CLI_TIMEOUT_MS = 2_000
const WAKE_WORDS = /alis|skill/i

export async function suggestSkills(
  host: Host,
  e: PromptSubmitInput,
  next: (e: PromptSubmitInput) => Promise<PromptSubmitResult>,
): Promise<PromptSubmitResult> {
  try {
    // A new prompt clears the band; the answer below may fill it again.
    if (dismissSuggestions()) host.invalidate()
    const root = await host.root().catch(() => '')
    if (!root.includes('/alis.build/')) {
      // Outside an alis.build workspace only explicit addresses matter
      // ("alis, …", "capture this as a skill"). This cheap prefilter skips the
      // CLI call for prompts that cannot contain one; the CLI's strict regexes
      // make the actual decision. ALIS_SUGGEST_ALWAYS=1 disables the prefilter.
      if ((await host.suggestAlways()) !== '1' && !WAKE_WORDS.test(e.text)) return next(e)
    }
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
    if (!text) return next(e)
    const items = suggestionsOf(text)
    if (showSuggestions(items)) {
      host.invalidate()
      if (items.length > 0) host.toast(`skill suggested: ${items.map(i => i.id).join(', ')} (band above the prompt)`)
    }
    return next({ ...e, context: [...(e.context ?? []), text] })
  } catch (error) {
    host.debug(`suggest: skipped: ${String(error)}`)
    return next(e)
  }
}
