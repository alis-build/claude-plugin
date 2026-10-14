#!/bin/bash
# Copies a small real Go neuron into the sandbox cwd. Runs as you, before the agent starts.
# HOME is the sandbox home here, so resolve the real one from the user database.
# Override ALIS_EVAL_NEURON_DIR to point at any neuron folder with go.mod, server.go and infra/.
set -e
REAL_HOME=$(eval echo "~$(id -un)")
SRC="${ALIS_EVAL_NEURON_DIR:-$REAL_HOME/alis.build/marvel/build/sm/helloworld/v1}"
[ -d "$SRC" ] || { echo "fixture: $SRC not found (set ALIS_EVAL_NEURON_DIR)" >&2; exit 1; }
cp -R "$SRC"/. .
rm -rf .git .alis
