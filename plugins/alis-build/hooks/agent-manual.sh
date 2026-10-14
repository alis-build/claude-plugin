#!/usr/bin/env bash
# A specialist subagent's manual: the alis CLI in its own words, read on this machine.
set -eu
command -v python3 >/dev/null 2>&1 || exit 0
exec python3 -B "$(dirname "$0")/agent-manual.py"
