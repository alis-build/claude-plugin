#!/bin/bash
# Per-prompt skill routing. Every prompt goes to the alis CLI, which answers
# with a hook envelope or nothing: for "alis, …" and "capture this as a skill",
# the router skill to invoke; otherwise a skill the Skill store ranks as a match
# for the request ("Skill store match for this request"), which the CLI asks for
# once the prompt passes its gates (alis 1.187.18 or later; before that, in
# plan mode only). The CLI's "Possibly relevant Alis skill" notes are dropped:
# they come from its local word-overlap matcher, which suggested unrelated
# skills too often.
# Every failure path is silent — routing must never break a prompt.
command -v alis >/dev/null 2>&1 || exit 0
payload="$(cat 2>/dev/null)" || exit 0
# Function-hooks handshake: the module lists the jobs it serves in
# alis_module; when "suggest" is among them this script has nothing to do.
alis_module_re='"alis_module"[[:space:]]*:[[:space:]]*"([^"]* )?suggest( [^"]*)?"'
[[ $payload =~ $alis_module_re ]] && exit 0
# ALIS_SUGGEST_ALWAYS=0 goes back to asking only where it used to: for prompts
# that could hold an explicit address, and in plan mode.
plan_re='"permission_mode"[[:space:]]*:[[:space:]]*"plan"'
if [ "${ALIS_SUGGEST_ALWAYS:-1}" = "0" ] && ! [[ $payload =~ $plan_re ]]; then
  printf '%s' "$payload" | grep -qiE 'alis|skill' || exit 0
fi
# Swallow every CLI failure (an older alis that rejects --hook exits 1).
out="$(printf '%s' "$payload" | alis skills suggest --hook 2>/dev/null)" || exit 0
ambient_re='"additionalContext"[[:space:]]*:[[:space:]]*"Possibly relevant Alis skill'
[[ $out =~ $ambient_re ]] && exit 0
[ -n "$out" ] && printf '%s\n' "$out"
exit 0
