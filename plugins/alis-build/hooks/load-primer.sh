#!/usr/bin/env bash
# SessionStart hook: inject the Alis Build DBD primer into the session.
#
# Source-aware: fresh sessions (source "startup" / "clear", or a payload with
# no source field) get the full primer (context/dbd-primer.md — mental model,
# skills contract, execution contract). Resume and compact get the compressed
# digest (context/dbd-digest.md) instead — those sessions already carried the
# full primer once, so a short refresher is enough and saves tokens. A missing
# digest falls back to the full primer; a missing primer emits nothing. Either
# way we exit 0 so the session proceeds unmodified (graceful degradation, like
# the sibling hooks). Claude Code sets CLAUDE_PLUGIN_ROOT for plugin hooks.
set -euo pipefail

primer="${CLAUDE_PLUGIN_ROOT:-}/context/dbd-primer.md"
digest="${CLAUDE_PLUGIN_ROOT:-}/context/dbd-digest.md"

payload="$(cat 2>/dev/null || true)"
if printf '%s' "$payload" \
  | grep -qE '"source"[[:space:]]*:[[:space:]]*"(resume|compact)"'; then
  if [ -f "$digest" ]; then
    cat "$digest"
    exit 0
  fi
fi

[ -f "$primer" ] && cat "$primer"
exit 0
