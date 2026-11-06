#!/usr/bin/env bash
# Permission decisions and per-invocation attribution; no shared approval grant.
set -eu
hook_dir=$(dirname "$0")
exec "$hook_dir/run-python.sh" "$hook_dir/cli-hook.py"
