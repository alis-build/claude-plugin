#!/usr/bin/env bash
# Native sync lifecycle and cache-only behavior are tested in the CLI module.
set -eu
repo_root="$(cd "$(dirname "$0")/.." && pwd)"
python3 -B "$repo_root/tests/test_native_hooks.py" NativeHookTests.test_optional_hooks_forward_payload_and_native_response
