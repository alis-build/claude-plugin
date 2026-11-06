#!/usr/bin/env bash
# Claude owns the asynchronous lifecycle; the child has its own deadline.
set -eu
hook_dir=$(dirname "$0")
exec "$hook_dir/run-python.sh" "$hook_dir/sync-skills.py"
