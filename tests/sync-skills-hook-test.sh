#!/bin/bash
# Regression test: SessionStart may refresh catalog metadata but must never
# implicitly install or prune native Claude skills, including with older CLIs.
set -eu

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
hook="$repo_root/plugins/alis-build/hooks/sync-skills.sh"
test_dir="$(mktemp -d)"
trap 'rm -rf "$test_dir"' EXIT

mkdir -p "$test_dir/bin"
cat > "$test_dir/bin/alis" <<'EOF'
#!/bin/sh
printf '%s\n' "$*" >> "$ALIS_TEST_LOG"
EOF
chmod +x "$test_dir/bin/alis"

run_hook() {
  payload="$1"
  PATH="$test_dir/bin:$PATH" ALIS_TEST_LOG="$test_dir/calls" "$hook" <<EOF
$payload
EOF
}

wait_for_calls() {
  want="$1"
  attempts=0
  calls=0
  [ ! -f "$test_dir/calls" ] || calls="$(wc -l < "$test_dir/calls")"
  while [ "$calls" -lt "$want" ]; do
    attempts=$((attempts + 1))
    [ "$attempts" -lt 500 ] || { echo "timed out waiting for alis call" >&2; exit 1; }
    sleep 0.01
    [ ! -f "$test_dir/calls" ] || calls="$(wc -l < "$test_dir/calls")"
  done
}

run_hook '{"source":"startup"}'
wait_for_calls 1

actual="$(sed -n '1p' "$test_dir/calls")"
expected="skills sync --cache-only --harness claude"
[ "$actual" = "$expected" ] || {
  echo "startup call = '$actual'; want '$expected'" >&2
  exit 1
}

run_hook '{"source":"resume"}'
calls="$(wc -l < "$test_dir/calls")"
[ "$calls" -eq 1 ] || {
  echo "resume unexpectedly invoked alis ($calls total calls)" >&2
  exit 1
}

echo "sync-skills hook: catalog-only startup call verified"
