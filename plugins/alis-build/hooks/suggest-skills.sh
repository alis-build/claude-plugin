#!/bin/bash
# Per-prompt wake-word routing: "alis, …" and "capture this as a skill" make
# the alis CLI answer with a hook envelope naming the router skill to invoke.
# The CLI's ambient "Possibly relevant Alis skill" notes are dropped: lexical
# matching on whole prompts suggested unrelated skills too often. In plan mode
# the CLI asks the Skill store to rank the request instead and words that
# answer apart ("Skill store match for this request"); that note passes through.
# Every failure path is silent — routing must never break a prompt.
command -v alis >/dev/null 2>&1 || exit 0
payload="$(cat 2>/dev/null)" || exit 0
# Function-hooks handshake: the module lists the jobs it serves in
# alis_module; when "suggest" is among them this script has nothing to do.
alis_module_re='"alis_module"[[:space:]]*:[[:space:]]*"([^"]* )?suggest( [^"]*)?"'
[[ $payload =~ $alis_module_re ]] && exit 0
# Outside plan mode only explicit addresses matter, so this cheap prefilter
# skips the CLI call for prompts that cannot contain one; the CLI's strict
# regexes make the actual decision. A plan-mode prompt always reaches the CLI,
# which is where it asks the Skill store. ALIS_SUGGEST_ALWAYS=1 disables the
# prefilter.
plan_re='"permission_mode"[[:space:]]*:[[:space:]]*"plan"'
if [ "${ALIS_SUGGEST_ALWAYS:-0}" != "1" ] && ! [[ $payload =~ $plan_re ]]; then
  printf '%s' "$payload" | grep -qiE 'alis|skill' || exit 0
fi
# Swallow every CLI failure (an older alis that rejects --hook exits 1).
out="$(printf '%s' "$payload" | alis skills suggest --hook 2>/dev/null)" || exit 0
ambient_re='"additionalContext"[[:space:]]*:[[:space:]]*"Possibly relevant Alis skill'
[[ $out =~ $ambient_re ]] && exit 0
[ -n "$out" ] && printf '%s\n' "$out"
exit 0
