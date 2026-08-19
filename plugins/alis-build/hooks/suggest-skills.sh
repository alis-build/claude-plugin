#!/bin/bash
# Per-prompt skill discovery: delegates all decisions (wake-word detection,
# gating, confidence, dedupe, latency budget) to the alis CLI, which reads
# the UserPromptSubmit JSON from stdin and prints hook output or nothing.
# Every failure path is silent — discovery must never break a prompt.
command -v alis >/dev/null 2>&1 || exit 0
payload="$(cat 2>/dev/null)" || exit 0
case "${CLAUDE_PROJECT_DIR:-$PWD}" in
  */alis.build/*) ;;
  *)
    # Outside an alis.build workspace, only explicit addresses matter
    # ("alis, …", "capture this as a skill"). This cheap prefilter skips the
    # CLI call for prompts that cannot contain one; the CLI's strict regexes
    # make the actual decision. ALIS_SUGGEST_ALWAYS=1 disables the prefilter.
    if [ "${ALIS_SUGGEST_ALWAYS:-0}" != "1" ]; then
      printf '%s' "$payload" | grep -qiE 'alis|skill' || exit 0
    fi
    ;;
esac
# No exec: after a successful exec the CLI's own exit code would propagate
# (e.g. an older alis that rejects --hook exits 1), and the || would be dead
# code. This form passes stdout through and swallows every failure.
printf '%s' "$payload" | alis skills suggest --hook 2>/dev/null || true
exit 0
