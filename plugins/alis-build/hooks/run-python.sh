#!/usr/bin/env bash
# Windows App Execution Aliases pass command -v but cannot run Python.
# Probe the interpreter without consuming the hook payload or showing alias
# errors. Once selected, preserve the script's output and exit status.
set -eu

probe='import sys; sys.exit(sys.version_info < (3, 9))'
for candidate in python3 python; do
  if command -v "$candidate" >/dev/null 2>&1 \
    && "$candidate" -c "$probe" </dev/null >/dev/null 2>&1; then
    exec "$candidate" -B "$@"
  fi
done

# The Windows launcher may be the only working Python command on PATH.
if command -v py >/dev/null 2>&1 \
  && py -3 -c "$probe" </dev/null >/dev/null 2>&1; then
  exec py -3 -B "$@"
fi

# Optional hooks are silent without a usable runtime. In particular, emitting
# no permission decision leaves Claude's normal permission checks in place.
exit 0
