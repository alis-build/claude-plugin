#!/usr/bin/env bash
# Claude owns the asynchronous lifecycle; the child has its own deadline.
set -eu
command -v python3 >/dev/null 2>&1 || exit 0
exec python3 -B "$(dirname "$0")/sync-skills.py"
