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
exec alis skills suggest --hook 2>/dev/null || exit 0
