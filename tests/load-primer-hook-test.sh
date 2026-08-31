#!/bin/bash
# Regression test for the load-primer gate: full primer only inside an
# alis.build workspace, digest for resume/compact and for CLI-only machines
# outside a workspace, nothing when neither workspace nor CLI is present, and
# ALIS_PRIMER=full|digest|off overrides.
set -eu

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
hook="$repo_root/plugins/alis-build/hooks/load-primer.sh"
plugin_root="$repo_root/plugins/alis-build"
test_dir="$(mktemp -d)"
trap 'rm -rf "$test_dir"' EXIT

workspace="$test_dir/alis.build/acme/build/x/v1"
plain="$test_dir/plain"
mkdir -p "$workspace" "$plain" "$test_dir/bin" "$test_dir/emptybin"
printf '#!/bin/sh\nexit 0\n' > "$test_dir/bin/alis"
chmod +x "$test_dir/bin/alis"

primer_header="# Alis Build — Define, Build, Deploy (DBD)"
digest_header="# Alis Build — DBD refresher"

run_hook() { # $1=cwd $2=payload $3=PATH prefix $4=extra env (or "")
  dir="$1" payload="$2" path_prefix="$3" extra="${4:-}"
  env -i HOME="$test_dir" PATH="$path_prefix:/usr/bin:/bin" \
    CLAUDE_PLUGIN_ROOT="$plugin_root" CLAUDE_PROJECT_DIR="$dir" $extra \
    bash "$hook" <<EOF
$payload
EOF
}

expect() { # $1=name $2=want(full|digest|none) $3=output
  name="$1" want="$2" out="$3"
  case "$want" in
    full) echo "$out" | grep -qF "$primer_header" || { echo "FAIL $name: wanted full primer" >&2; exit 1; } ;;
    digest) echo "$out" | grep -qF "$digest_header" || { echo "FAIL $name: wanted digest" >&2; exit 1; } ;;
    none) [ -z "$out" ] || { echo "FAIL $name: wanted no output, got: $(echo "$out" | head -1)" >&2; exit 1; } ;;
  esac
}

expect "workspace startup" full \
  "$(run_hook "$workspace" '{"source":"startup"}' "$test_dir/emptybin")"
expect "workspace resume" digest \
  "$(run_hook "$workspace" '{"source":"resume"}' "$test_dir/emptybin")"
expect "workspace compact" digest \
  "$(run_hook "$workspace" '{"source":"compact"}' "$test_dir/emptybin")"
expect "outside workspace with CLI" digest \
  "$(run_hook "$plain" '{"source":"startup"}' "$test_dir/bin")"
expect "outside workspace without CLI" none \
  "$(run_hook "$plain" '{"source":"startup"}' "$test_dir/emptybin")"
expect "ALIS_PRIMER=off in workspace" none \
  "$(run_hook "$workspace" '{"source":"startup"}' "$test_dir/emptybin" "ALIS_PRIMER=off")"
expect "ALIS_PRIMER=full outside" full \
  "$(run_hook "$plain" '{"source":"startup"}' "$test_dir/emptybin" "ALIS_PRIMER=full")"
expect "ALIS_PRIMER=digest in workspace" digest \
  "$(run_hook "$workspace" '{"source":"startup"}' "$test_dir/emptybin" "ALIS_PRIMER=digest")"

echo "load-primer hook: gating matrix verified"
