#!/usr/bin/env bash
# SessionStart hook: inject the Alis Build DBD primer into the session context,
# but only for sessions working inside an Alis Build workspace (~/alis.build/...).
# Whatever this script prints to stdout is added to Claude's context.
set -euo pipefail

# Claude Code sets CLAUDE_PROJECT_DIR for hooks; fall back to the current directory.
project_dir="${CLAUDE_PROJECT_DIR:-$PWD}"

case "$project_dir" in
  */alis.build | */alis.build/*)
    cat "${CLAUDE_PLUGIN_ROOT}/context/dbd-primer.md"
    ;;
  *)
    # Not an Alis Build workspace: inject nothing.
    :
    ;;
esac
