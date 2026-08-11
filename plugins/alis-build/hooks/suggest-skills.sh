#!/bin/bash
# Per-prompt skill discovery: delegates all logic (wake-word detection,
# gating, dedupe, latency budget) to the alis CLI, which reads the
# UserPromptSubmit JSON from stdin and prints hook output or nothing.
# Every failure path is silent — discovery must never break a prompt.
command -v alis >/dev/null 2>&1 || exit 0
case "${CLAUDE_PROJECT_DIR:-$PWD}" in
  */alis.build/*) ;;
  *) [ "${ALIS_SUGGEST_ALWAYS:-0}" = "1" ] || exit 0 ;;
esac
# No exec: after a successful exec the CLI's own exit code would propagate
# (e.g. an older alis that rejects --hook exits 1), and the || would be dead
# code. This form passes stdout through and swallows every failure.
alis skills suggest --hook 2>/dev/null || true
exit 0
