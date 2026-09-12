#!/usr/bin/env bash
# Local lifecycle adapter. The CLI owns session state and the transfer worker.
# Older CLIs gracefully skip registration; active handoff claims fail closed.
exec python3 "${CLAUDE_PLUGIN_ROOT}/hooks/handoff.py"
