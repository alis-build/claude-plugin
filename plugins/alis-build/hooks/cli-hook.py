#!/usr/bin/env python3
"""Conservative single-command support. Never execute the submitted command."""
import json
import os
import re
import shlex
import sys
from health import observe

GUIDANCE = ("Run one standalone alis command and read its complete JSON result. "
            "Use alis --cwd /absolute/workspace/path instead of cd &&. "
            "Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. "
            "A Claude background-task ID is not an Alis operation ID.")
GLOBALS = {"--cwd", "--session-id"}
BOOLS = {"--json", "--verbose", "--approve", "--confirm-production", "--yes", "--help", "-h"}
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
}
# Structured workflows retain the CLI automation tier and production gates.
# Arbitrary process runners and messaging verbs do not get a blanket allow.
WORKFLOW_TOP = {"define", "build", "deploy", "authorise"}
WORKFLOW_PATHS = {("packages", x) for x in ("install", "upgrade", "add")}
ALIASES = {"env": "environment", "envs": "environment", "environments": "environment", "block": "blocks", "op": "operations", "ops": "operations"}


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


def command_path(argv):
    words = []
    i = 1
    while i < len(argv) and len(words) < 2:
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


def insert_flags(argv, flags):
    split = argv.index("--") if "--" in argv else len(argv)
    return argv[:split] + flags + argv[split:]


def decide(payload):
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
    if not path: return {"hookSpecificOutput": result}
    top = path[0]
    allowed = os.environ.get("ALIS_ALLOWED_SUBCMDS", "").split()
    options = argv[1:argv.index("--")] if "--" in argv else argv[1:]
    flags = {a.split("=", 1)[0] for a in options if a.startswith("-")}
    guarded = bool(flags & {"--confirm-production", "--approve", "--yes"})
    guarded = guarded or (top == "blocks" and "uninstall" in options)
    guarded = guarded or (top == "environment" and any(v in options for v in ("destroy", "unset")))
    read_only = top in READ_TOP or path in READ_PATHS or bool(flags & {"--help", "-h"})
    if payload.get("permission_mode") == "plan" and (guarded or not read_only):
        result.update(permissionDecision="deny", permissionDecisionReason="This Alis action changes state. Finish the plan and obtain execution approval first.")
        return {"hookSpecificOutput": result}
    if guarded:
        result.update(permissionDecision="ask", permissionDecisionReason="Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.")
        # Native confirmation displays this modified command. Execution then
        # satisfies the CLI's non-production confirmation once. Never add the
        # production flag: the CLI must first resolve its exact target/version.
        if not flags & {"--approve", "--yes"}:
            argv = insert_flags(argv, ["--approve"])
    elif allowed and top not in allowed:
        return {}
    elif read_only or top in WORKFLOW_TOP or path in WORKFLOW_PATHS:
        result.update(permissionDecision="allow", permissionDecisionReason="Alis structured CLI workflow; CLI automation and production gates remain in force.")
    else:
        return {"hookSpecificOutput": result}
    # Identity travels with this call, never a shared file, and grants nothing.
    sid = payload.get("session_id", "")
    if isinstance(sid, str) and re.fullmatch(r"[A-Za-z0-9_-]{1,128}", sid) and "--session-id" not in flags:
        argv = insert_flags(argv, ["--session-id", sid])
    updated = dict(tool_input, command=shlex.join(argv))
    if updated != tool_input: result["updatedInput"] = updated
    return {"hookSpecificOutput": result}


def main():
    try:
        payload = json.load(sys.stdin)
        if not isinstance(payload, dict): return
        response = decide(payload)
        if response:
            observe("claude-plugin-health.json", permissionMode=payload.get("permission_mode", "unknown"), approvalSource="native-confirmation-and-cli-tier")
            print(json.dumps(response))
    except (ValueError, TypeError, OSError):
        return


if __name__ == "__main__": main()
