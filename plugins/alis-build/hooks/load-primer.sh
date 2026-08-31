#!/usr/bin/env bash
# SessionStart hook: inject the Alis Build DBD primer into the session.
#
# Workspace-gated: the full primer (context/dbd-primer.md — mental model,
# skills contract, execution contract) is for sessions doing DBD work, i.e.
# running inside an alis.build workspace (same gate as
# inject-service-context.sh). Outside a workspace, a machine with the alis CLI
# installed still gets the compressed digest (context/dbd-digest.md) so
# wake-word skill routing has minimal context; a machine with neither emits
# nothing — zero tokens for unrelated projects.
#
# Source-aware: resume and compact get the digest even inside a workspace —
# those sessions already carried the full primer once, so a short refresher is
# enough and saves tokens.
#
# ALIS_PRIMER overrides the gate: full | digest | off.
#
# A missing digest falls back to the full primer; a missing primer emits
# nothing. Either way we exit 0 so the session proceeds unmodified (graceful
# degradation, like the sibling hooks). Claude Code sets CLAUDE_PLUGIN_ROOT
# for plugin hooks.
set -euo pipefail

primer="${CLAUDE_PLUGIN_ROOT:-}/context/dbd-primer.md"
digest="${CLAUDE_PLUGIN_ROOT:-}/context/dbd-digest.md"

dir="${CLAUDE_PROJECT_DIR:-$PWD}"
in_workspace=0
case "$dir" in */alis.build/*|*/alis.build) in_workspace=1 ;; esac
has_cli=0
command -v alis >/dev/null 2>&1 && has_cli=1

case "${ALIS_PRIMER:-}" in
  off) exit 0 ;;
  full) in_workspace=1 ;;
  digest) in_workspace=0; has_cli=1 ;;
esac

if [ "$in_workspace" -eq 0 ] && [ "$has_cli" -eq 0 ]; then
  exit 0
fi

payload="$(cat 2>/dev/null || true)"
want=full
if printf '%s' "$payload" \
  | grep -qE '"source"[[:space:]]*:[[:space:]]*"(resume|compact)"'; then
  want=digest
fi
# Outside a workspace the digest is the ceiling.
[ "$in_workspace" -eq 0 ] && want=digest

if [ "$want" = digest ] && [ -f "$digest" ]; then
  cat "$digest"
  exit 0
fi

[ -f "$primer" ] && cat "$primer"
exit 0
