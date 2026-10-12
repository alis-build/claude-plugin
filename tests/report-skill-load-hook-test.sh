#!/bin/bash
# Regression test: the PostToolUse Skill hook forwards the payload to
# `alis skills report-load --hook` and is silent whatever happens.
set -eu

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
hook="$repo_root/plugins/alis-build/hooks/report-skill-load.sh"
test_dir="$(mktemp -d)"
trap 'rm -rf "$test_dir"' EXIT

mkdir -p "$test_dir/bin"
cat > "$test_dir/bin/alis" <<'EOF2'
#!/bin/sh
printf '%s\n' "$*" >> "$ALIS_TEST_LOG"
cat >> "$ALIS_TEST_LOG.stdin"
[ -z "${ALIS_TEST_FAIL:-}" ] || { echo "boom" >&2; exit 1; }
EOF2
chmod +x "$test_dir/bin/alis"

payload='{"session_id":"s1","tool_name":"Skill","tool_input":{"skill":"getting-started"}}'

out="$(printf '%s' "$payload" | PATH="$test_dir/bin:$PATH" ALIS_TEST_LOG="$test_dir/calls" "$hook")"
[ -z "$out" ] || { echo "hook printed: $out" >&2; exit 1; }
grep -q '^skills report-load --harness claude --hook$' "$test_dir/calls" || { echo "unexpected call:"; cat "$test_dir/calls"; exit 1; }
grep -q 'getting-started' "$test_dir/calls.stdin" || { echo "payload not forwarded" >&2; exit 1; }

# A failing CLI is swallowed.
out="$(printf '%s' "$payload" | PATH="$test_dir/bin:$PATH" ALIS_TEST_LOG="$test_dir/calls2" ALIS_TEST_FAIL=1 "$hook" 2>&1)"
[ -z "$out" ] || { echo "failing CLI leaked: $out" >&2; exit 1; }

# The function-hooks module serving the job means the script stays quiet.
printf '%s' '{"alis_module":"suggest report-load","tool_name":"Skill","tool_input":{"skill":"x"}}' | PATH="$test_dir/bin:$PATH" ALIS_TEST_LOG="$test_dir/calls3" "$hook"
[ ! -f "$test_dir/calls3" ] || { echo "module handshake ignored" >&2; exit 1; }

# No alis on PATH: exit 0, nothing printed.
out="$(printf '%s' "$payload" | PATH="$test_dir/empty" "$hook" 2>&1)"
[ -z "$out" ] || { echo "missing CLI leaked: $out" >&2; exit 1; }
echo "report-skill-load hook test passed"
