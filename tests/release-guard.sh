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
            # Quoted so a plugin root with a space stays one word.
            command = hook["command"]
            prefix = '"${CLAUDE_PLUGIN_ROOT}/'
            if not (command.startswith(prefix) and command.endswith('"')):
                raise SystemExit("FAIL: hook is not a quoted plugin-relative path")
            path = root / command[len(prefix):-1]
            if not path.is_file() or not os.access(path, os.X_OK):
                raise SystemExit(f"FAIL: missing/non-executable hook: {path.name}")
for path in (root / "hooks").glob("*.py"):
    ast.parse(path.read_text(), filename=str(path))

# 3b. Agents: every agents/*.md is a plugin subagent whose frontmatter names it after
#     its file, has a description, and whose body starts with the one shared block (the
#     text before "# Your part") byte for byte; no v2 template placeholder ({{owner}},
#     {{lock}}, …) may ship. The manual hook's SECTIONS and the SubagentStart matcher in
#     hooks.json must name exactly these agents.
import importlib.util, re
agents = sorted((root / "agents").glob("*.md"))
if not agents:
    raise SystemExit("FAIL: no agents under plugins/alis-build/agents")
shared = None
for path in agents:
    text = path.read_text()
    if "{{" in text:
        raise SystemExit(f"FAIL: {path.name} carries a template placeholder")
    parts = text.split("---\n", 2)
    if len(parts) < 3 or parts[0] != "":
        raise SystemExit(f"FAIL: {path.name} has no frontmatter")
    front = dict(line.split(":", 1) for line in parts[1].splitlines() if re.match(r"^[a-z][A-Za-z]*:", line))
    front = {k: v.strip() for k, v in front.items()}
    if front.get("name") != path.stem:
        raise SystemExit(f"FAIL: {path.name} frontmatter name is {front.get('name')!r}, not {path.stem!r}")
    if "description" not in front:
        raise SystemExit(f"FAIL: {path.name} has no description")
    body = parts[2]
    if "\n# Your part" not in body:
        raise SystemExit(f"FAIL: {path.name} has no '# Your part' heading")
    head = body.split("\n# Your part", 1)[0]
    if shared is None: shared = head
    elif head != shared:
        raise SystemExit(f"FAIL: {path.name}'s shared block differs from {agents[0].name}'s")
names = {p.stem for p in agents}
spec = importlib.util.spec_from_file_location("agent_manual", root / "hooks/agent-manual.py")
sys.path.insert(0, str(root / "hooks"))
manual = importlib.util.module_from_spec(spec); spec.loader.exec_module(manual)
if set(manual.SECTIONS) != names:
    raise SystemExit(f"FAIL: agent-manual.py SECTIONS {sorted(manual.SECTIONS)} != agents {sorted(names)}")
matchers = [entry.get("matcher", "") for entry in config["hooks"].get("SubagentStart", [])]
listed = set()
for m in matchers:
    found = re.fullmatch(r"\^alis:\(([a-z|]+)\)\$", m)
    if found: listed |= set(found.group(1).split("|"))
if listed != names:
    raise SystemExit(f"FAIL: SubagentStart matcher names {sorted(listed)}, agents are {sorted(names)}")
PY

# 4. Function hooks: every module hooks.json names must exist,
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
