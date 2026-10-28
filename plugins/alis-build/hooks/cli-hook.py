#!/usr/bin/env python3
"""Conservative single-command support. Never execute the submitted command."""
import json
import os
import re
import shlex
import sys
import time
from pathlib import Path
from health import observe, plugin_version

GUIDANCE = ("Run one standalone alis command and read its complete JSON result. "
            "Use alis --cwd /absolute/workspace/path instead of cd &&. "
            "Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. "
            "A Claude background-task ID is not an Alis operation ID.")
GLOBALS = {"--cwd", "--session-id", "--client-plugin"}
# The CLI accepts --client-plugin <id>/<version> from 1.165.6 and reports it with
# every command's outcome; older CLIs reject the unknown flag. The hook adds it
# only when the CLI's own detection cache (written by the binary that last ran
# a version check) says the installed one is new enough. Without the flag the
# CLI still attributes the plugin from ~/.alis/claude-plugin-health.json.
CLIENT_PLUGIN_SINCE = (1, 165, 6)
BOOLS = {"--json", "--verbose", "--approve", "--confirm-production", "--yes", "--reveal", "--help", "-h"}
READ_TOP = {"docs", "doctor", "whoami", "version", "ask"}
READ_PATHS = {
    ("context", "view"), ("accounts", "list"), ("org", "list"), ("org", "view"),
    ("product", "view"), ("environment", "list"),
    ("operations", "list"), ("operations", "describe"), ("operations", "wait"),
    ("logs", "build"), ("logs", "deploy"), ("logs", "runtime"),
    ("skills", "suggest"), ("skills", "search"), ("skills", "list"), ("skills", "load"),
    ("blocks", "list"), ("blocks", "versions"),
    ("specialist", "list"), ("specialist", "read"), ("specialist", "describe"),
    ("ideate", "context"), ("ideate", "specs"), ("ideate", "spec"),
    ("ideate", "stream"), ("ideate", "find"),
    ("ideate", "output-artifact"), ("ideate", "output-artifacts"),
    ("ideate", "session"), ("ideate", "sessions"),
}
READ_NESTED = {("ideate", "artifacts", verb) for verb in ("read", "list", "get")}
# Structured workflows retain the CLI automation tier and production gates.
# Arbitrary process runners and messaging verbs do not get a blanket allow.
WORKFLOW_TOP = {"define", "build", "deploy", "authorise"}
WORKFLOW_PATHS = {("packages", x) for x in ("install", "upgrade", "add")}
# On the manual automation tier the CLI refuses every mutating command without
# --approve (APPROVAL_REQUIRED). It decides from its effective tier: the server
# tier cached in ~/.alis/profile-cache.json, tightened by approvals.maxTier in
# ~/.alis/settings.json (approval.EffectiveTier). The gate reads the same two
# files, so it can confirm a workflow up front instead of letting it bounce.
TIERS = ("manual", "balanced", "autonomous")
MANUAL_REASON = ("Your Alis automation tier is manual, so the CLI needs approval for this action. "
                 "Confirm this exact Alis action and its target; the plugin adds --approve.")
ALIASES = {"env": "environment", "envs": "environment", "environments": "environment", "block": "blocks", "op": "operations", "ops": "operations"}


def served_by_module(payload, token):
    """Whether the plugin's function-hooks module serves this job (see hooks/mod/classic.ts).

    Most classic events carry the module's tag; PreToolUse cannot, so the
    module keeps a per-session marker file the shell side trusts for an hour."""
    if token in str(payload.get("alis_module", "")).split(): return True
    sid = payload.get("session_id", "")
    if not isinstance(sid, str) or not re.fullmatch(r"[A-Za-z0-9_-]{1,128}", sid): return False
    marker = Path.home() / ".alis/claude-module-sessions" / sid
    try:
        return time.time() - marker.stat().st_mtime < 3600 and token in marker.read_text().split()
    except (OSError, ValueError):
        return False


def literal_argv(command):
    quote = None
    escaped = False
    for char in command:
        if char in "\r\n": return None
        if escaped:
            escaped = False
            continue
        if quote == "'":
            if char == "'": quote = None
            continue
        if char == "\\":
            escaped = True
            continue
        if char in "$`": return None
        if quote == '"':
            if char == '"': quote = None
            continue
        if char in "'\"": quote = char
        elif char in "|&;<>()*?[]{}#~": return None
    if quote or escaped: return None
    try:
        argv = shlex.split(command)
    except ValueError:
        return None
    return argv if argv and argv[0] == "alis" else None


def command_path(argv, depth=2):
    words = []
    i = 1
    while i < len(argv) and len(words) < depth:
        token = argv[i]
        if token == "--": break
        flag = token.split("=", 1)[0]
        if flag in GLOBALS:
            i += 1 if "=" in token else 2
            continue
        if flag in BOOLS:
            i += 1
            continue
        if token.startswith("-"): break
        words.append(token)
        i += 1
    if words: words[0] = ALIASES.get(words[0], words[0])
    return tuple(words)


def installed_cli_version():
    """The installed CLI's version as a tuple from ~/.alis/versions-cache.json, or None."""
    try:
        text = json.loads((Path.home() / ".alis/versions-cache.json").read_text()).get("cliVersion")
        match = re.fullmatch(r"v?(\d+)\.(\d+)\.(\d+)(?:[-+].*)?", text) if isinstance(text, str) else None
        return tuple(int(part) for part in match.groups()) if match else None
    except (OSError, ValueError, TypeError, AttributeError):
        return None


def client_plugin():
    """The --client-plugin value when the installed CLI accepts the flag, else None."""
    version = installed_cli_version()
    if version is None or version < CLIENT_PLUGIN_SINCE: return None
    try:
        return "claude/" + plugin_version()
    except (OSError, ValueError, KeyError, TypeError):
        return None


def automation_tier():
    """The CLI's effective automation tier, or None when neither file names one."""
    def read(name, *keys):
        try:
            value = json.loads((Path.home() / ".alis" / name).read_text())
            for key in keys: value = value.get(key)
            value = value.strip().lower()
            return value if value in TIERS else None
        except (OSError, ValueError, TypeError, AttributeError):
            return None
    known = [t for t in (read("profile-cache.json", "automationTier"), read("settings.json", "approvals", "maxTier")) if t]
    return min(known, key=TIERS.index) if known else None


def insert_flags(argv, flags):
    split = argv.index("--") if "--" in argv else len(argv)
    return argv[:split] + flags + argv[split:]


def decide(payload, tier=None):
    tool_input = payload.get("tool_input") or {}
    if not isinstance(tool_input, dict): return {}
    command = tool_input.get("command", "")
    if payload.get("tool_name", "Bash") != "Bash" or not isinstance(command, str): return {}
    if not re.search(r"(?:^|[;&|\n])\s*alis\s", command): return {}
    result = {"hookEventName": "PreToolUse"}
    argv = literal_argv(command)
    if not argv:
        result["additionalContext"] = GUIDANCE
        return {"hookSpecificOutput": result}
    path = command_path(argv)
    if not path:
        # Bare `alis --help` / `alis -v`: no verb, nothing executes.
        if argv[1:] and all(a.startswith("-") for a in argv[1:]) and set(argv[1:]) & {"--help", "-h", "--version", "-v"}:
            result.update(permissionDecision="allow", permissionDecisionReason="Alis CLI help or version output; nothing executes.")
        return {"hookSpecificOutput": result}
    top = path[0]
    allowed = os.environ.get("ALIS_ALLOWED_SUBCMDS", "").split()
    options = argv[1:argv.index("--")] if "--" in argv else argv[1:]
    flags = {a.split("=", 1)[0] for a in options if a.startswith("-")}
    guarded = bool(flags & {"--confirm-production", "--approve", "--yes"})
    guarded = guarded or (top == "blocks" and "uninstall" in options)
    guarded = guarded or (top == "environment" and any(v in options for v in ("destroy", "unset")))
    # `variables|vars` and `refresh` print secret values on CLIs before 1.146.1
    # and behind --reveal from then on; the gate cannot see the version, so the
    # bare command asks too.
    secrets = top == "environment" and ("--reveal" in flags or any(v in options for v in ("variables", "vars", "refresh")))
    guarded = guarded or secrets
    # Help never executes: cobra prints usage and exits before any verb runs, so
    # `alis environment variables --help` and `alis blocks uninstall x --help` are
    # read-only. A help token swallowed as the value of a preceding value-taking
    # flag (`--name --help`) is not a help request.
    help_requested = any(
        tok in ("--help", "-h") and not (i > 0 and options[i - 1].startswith("-")
                                          and "=" not in options[i - 1]
                                          and options[i - 1] not in BOOLS)
        for i, tok in enumerate(options))
    if help_requested: guarded = secrets = False
    handoff_read = command_path(argv, 3) in {("workstation", "handoff", "status"), ("workstation", "handoff", "targets")}
    read_only = top in READ_TOP or path in READ_PATHS or command_path(argv, 3) in READ_NESTED or handoff_read or help_requested
    if payload.get("permission_mode") == "plan" and (guarded or not read_only):
        result.update(permissionDecision="deny", permissionDecisionReason="This Alis action changes state. Finish the plan and obtain execution approval first.")
        return {"hookSpecificOutput": result}
    if guarded:
        reason = ("This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment."
                  if secrets else "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.")
        result.update(permissionDecision="ask", permissionDecisionReason=reason)
        # Native confirmation displays this modified command. Execution then
        # satisfies the CLI's non-production confirmation once. Never add the
        # production flag: the CLI must first resolve its exact target/version.
        if not flags & {"--approve", "--yes"}:
            argv = insert_flags(argv, ["--approve"])
    elif allowed and top not in allowed:
        return {}
    elif read_only:
        result.update(permissionDecision="allow", permissionDecisionReason="Alis structured CLI workflow; CLI automation and production gates remain in force.")
    elif top in WORKFLOW_TOP or path in WORKFLOW_PATHS:
        # A define --dry-run creates nothing, so the CLI does not gate it.
        if tier == "manual" and not (top == "define" and "--dry-run" in flags):
            result.update(permissionDecision="ask", permissionDecisionReason=MANUAL_REASON)
            argv = insert_flags(argv, ["--approve"])
        else:
            result.update(permissionDecision="allow", permissionDecisionReason="Alis structured CLI workflow; CLI automation and production gates remain in force.")
    else:
        return {"hookSpecificOutput": result}
    # Identity travels with this call, never a shared file, and grants nothing.
    sid = payload.get("session_id", "")
    if isinstance(sid, str) and re.fullmatch(r"[A-Za-z0-9_-]{1,128}", sid) and "--session-id" not in flags:
        argv = insert_flags(argv, ["--session-id", sid])
    plugin = client_plugin() if "--client-plugin" not in flags else None
    if plugin:
        argv = insert_flags(argv, ["--client-plugin", plugin])
    updated = dict(tool_input, command=shlex.join(argv))
    if updated != tool_input: result["updatedInput"] = updated
    return {"hookSpecificOutput": result}


def main():
    try:
        payload = json.load(sys.stdin)
        if not isinstance(payload, dict): return
        if served_by_module(payload, "cli"): return
        response = decide(payload, automation_tier())
        if response:
            observe("claude-plugin-health.json", permissionMode=payload.get("permission_mode", "unknown"), approvalSource="native-confirmation-and-cli-tier")
            print(json.dumps(response))
    except (ValueError, TypeError, OSError):
        return


if __name__ == "__main__": main()
