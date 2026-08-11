#!/bin/bash
# SessionStart hook: refresh the harness's synced per-skill router entries via
# the alis CLI, detached in the background. Runs only on fresh sessions
# (source: startup or clear; a payload with no source field also counts, for
# backwards compatibility) — resume/compact already have their entries. Emits
# NOTHING to stdout and never blocks; every failure path is silent.
payload="$(cat 2>/dev/null || true)"
if printf '%s' "$payload" | grep -q '"source"'; then
  printf '%s' "$payload" \
    | grep -qE '"source"[[:space:]]*:[[:space:]]*"(startup|clear)"' || exit 0
fi
command -v alis >/dev/null 2>&1 || exit 0
(alis skills sync --harness claude >/dev/null 2>&1 &)
exit 0
