#!/usr/bin/env bash
# Permission decisions and per-invocation attribution; no shared approval grant.
set -eu
command -v python3 >/dev/null 2>&1 || exit 0
exec python3 -B "$(dirname "$0")/cli-hook.py"
