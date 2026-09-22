#!/usr/bin/env python3
"""A warning when a tool result carries secret-looking values.

The result is already in the transcript by the time PostToolUse fires, so
nothing here redacts: the person hears which kinds landed and that they need
rotating, and the model is told not to repeat them. The pattern table is the
one in hooks/mod/secrets.ts, in the same order."""
import json
import re
import sys

PATTERNS = [
    ("stripe", re.compile(r"\bsk_(?:live|test)_[A-Za-z0-9]{16,}")),
    ("github", re.compile(r"\b(?:gh[oprsu]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{22,})")),
    ("npm", re.compile(r"\bnpm_[A-Za-z0-9]{30,}")),
    ("pypi", re.compile(r"\bpypi-[A-Za-z0-9_-]{50,}")),
    ("linear", re.compile(r"\blin_api_[A-Za-z0-9]{20,}")),
    ("sendgrid", re.compile(r"\bSG\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}")),
    ("postgres", re.compile(r"\bpostgres(?:ql)?://[^:/\s@]+:[^@\s]+@")),
    ("aws", re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
    ("google", re.compile(r"\bAIza[0-9A-Za-z_-]{35}\b")),
    ("slack", re.compile(r"\bxox[abpr]-[0-9A-Za-z-]{10,}")),
    ("privateKey", re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----")),
    # NAME=value lines and "name": "value" pairs whose name says secret. A
    # masked value (••••), a [REDACTED:kind] marker and a names-only listing
    # ({"name": "X_SECRET", "set": true}) have no such value after the name.
    ("assignment", re.compile(r"\b[A-Z0-9_]*(?:SECRET|TOKEN|PASSWORD|PASSWD|API_?KEY|CLIENT_SECRET)[A-Z0-9_]*[\"']?\s*[=:]\s*[\"']?[A-Za-z0-9_\-./+=]{16,}", re.IGNORECASE)),
]


def secret_kinds_of(text):
    """The kinds of secret-looking values in text, in table order, as (kind, count)."""
    kinds = []
    for kind, pattern in PATTERNS:
        count = len(pattern.findall(text))
        if count: kinds.append((kind, count))
    return kinds


def text_of(response):
    """The text a tool result put in the transcript: Bash streams, a Read's content, else the whole JSON."""
    if isinstance(response, str): return response
    if not isinstance(response, dict): return ""
    if isinstance(response.get("stdout"), str) or isinstance(response.get("stderr"), str):
        return f"{response.get('stdout') or ''}\n{response.get('stderr') or ''}"
    content = (response.get("file") or {}).get("content") if isinstance(response.get("file"), dict) else None
    if isinstance(content, str): return content
    return json.dumps(response)


def listed(kinds):
    return ", ".join(f"{kind} ×{count}" if count > 1 else kind for kind, count in kinds)


def warning_of(kinds):
    total = sum(count for _, count in kinds)
    return (f"alis: this tool result holds {total} value{'' if total == 1 else 's'} that look like secrets ({listed(kinds)}). "
            "They are now in the session transcript. Do not repeat, quote, summarise or store them; refer to each by its name only. "
            "Tell the person these credentials need to be rotated.")


def toast_of(tool, kinds):
    return f"alis: secret-looking values in the last {tool} result ({listed(kinds)}). They are in the transcript now; rotate them."


def answer(payload):
    kinds = secret_kinds_of(text_of(payload.get("tool_response")))
    if not kinds: return {}
    tool = payload.get("tool_name") if isinstance(payload.get("tool_name"), str) else "tool"
    return {"systemMessage": toast_of(tool, kinds),
            "hookSpecificOutput": {"hookEventName": "PostToolUse", "additionalContext": warning_of(kinds)}}


def main():
    try:
        payload = json.load(sys.stdin)
        if not isinstance(payload, dict): return
        # Function-hooks handshake: the module serves this job when it says so.
        if "secrets" in str(payload.get("alis_module", "")).split(): return
        response = answer(payload)
        if response: print(json.dumps(response))
    except (ValueError, TypeError, OSError):
        return


if __name__ == "__main__": main()
