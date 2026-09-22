#!/usr/bin/env bash
# Warns when a tool result carries secret-looking values; never redacts.
set -eu
command -v python3 >/dev/null 2>&1 || exit 0
exec python3 -B "$(dirname "$0")/secrets-hook.py"
