#!/bin/bash
# Release guard: invariants that must hold before a version of the plugin is
# published. Run by CI on every push and pull request; tag builds run with
# RELEASE_GUARD_STRICT=1 so a release can never ship what a branch merely
# warns about.
set -eu

repo="$(cd "$(dirname "$0")/.." && pwd)"
fail=0

# 1. No unsubstituted release placeholders may ship (v0.19.0 was published
#    with literal __…__ markers in a command, breaking it for every user).
if grep -rn '__[A-Z_]*__' "$repo/plugins" >/dev/null 2>&1; then
  if [ -n "${RELEASE_GUARD_STRICT:-}" ]; then
    echo "FAIL: unsubstituted placeholder present in shipped plugin content:" >&2
    grep -rn '__[A-Z_]*__' "$repo/plugins" >&2
    fail=1
  else
    echo "WARN: placeholder present in plugins/ — a tagged release will fail this guard" >&2
  fi
fi

# 2. plugin.json and marketplace.json versions must agree — the marketplace
#    entry is what installers resolve.
pv="$(jq -r .version "$repo/plugins/alis-build/.claude-plugin/plugin.json")"
mv_="$(jq -r '.plugins[0].version' "$repo/.claude-plugin/marketplace.json")"
if [ "$pv" != "$mv_" ]; then
  echo "FAIL: version skew plugin.json=$pv marketplace.json=$mv_" >&2
  fail=1
fi

# 3. Hook scripts must parse and hooks.json must be valid JSON.
for f in "$repo"/plugins/alis-build/hooks/*.sh; do
  bash -n "$f" || { echo "FAIL: $f does not parse" >&2; fail=1; }
done
jq -e . "$repo/plugins/alis-build/hooks/hooks.json" >/dev/null || {
  echo "FAIL: hooks.json is not valid JSON" >&2
  fail=1
}

# Validate every registered hook and Python helper, not only shell syntax.
python3 - "$repo" <<'PY' || fail=1
import ast, json, os, sys
from pathlib import Path
root = Path(sys.argv[1]) / "plugins/alis-build"
config = json.loads((root / "hooks/hooks.json").read_text())
for entries in config["hooks"].values():
    for entry in entries:
        for hook in entry["hooks"]:
            command = hook["command"]
            prefix = "${CLAUDE_PLUGIN_ROOT}/"
            if not command.startswith(prefix):
                raise SystemExit("FAIL: hook is not plugin-relative")
            path = root / command[len(prefix):]
            if not path.is_file() or not os.access(path, os.X_OK):
                raise SystemExit(f"FAIL: missing/non-executable hook: {path.name}")
for path in (root / "hooks").glob("*.py"):
    ast.parse(path.read_text(), filename=str(path))
PY

# 4. Function hooks (early access): every module hooks.json names must exist,
#    and the version the module reports must match plugin.json.
for m in $(jq -r '.modules[]? // empty' "$repo/plugins/alis-build/hooks/hooks.json"); do
  [ -f "$repo/plugins/alis-build/hooks/$m" ] || { echo "FAIL: hooks module missing: $m" >&2; fail=1; }
done
mv2="$(sed -n "s/^export const PLUGIN_VERSION = '\([^']*\)'.*/\1/p" "$repo/plugins/alis-build/hooks/mod/meta.ts")"
if [ "$pv" != "$mv2" ]; then
  echo "FAIL: version skew plugin.json=$pv hooks/mod/meta.ts=$mv2" >&2
  fail=1
fi

if [ "$fail" -eq 0 ]; then
  echo "release guard: OK (version $pv)"
fi
exit "$fail"
