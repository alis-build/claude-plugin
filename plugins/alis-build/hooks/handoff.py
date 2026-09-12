#!/usr/bin/env python3
"""Forward lifecycle metadata, never copy a transcript in a Claude hook."""
import json
import os
from pathlib import Path
import re
import subprocess
import sys


def main():
    raw = sys.stdin.buffer.read(1024 * 1024)
    payload = json.loads(raw)
    sid = payload.get("session_id", "")
    if not isinstance(sid, str) or not re.fullmatch(r"[A-Za-z0-9_-]{1,128}", sid):
        return
    try:
        result = subprocess.run(["alis", "workstation", "handoff", "_hook"], input=raw,
                                stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, timeout=8)
        if result.returncode == 0:
            if result.stdout.strip():
                # Validate before exposing the CLI response as hook output.
                print(json.dumps(json.loads(result.stdout)))
            return
    except (OSError, subprocess.TimeoutExpired, ValueError):
        pass
    claim = Path.home() / ".alis" / "handoff-sessions" / (sid + ".claim")
    if claim.exists() and payload.get("hook_event_name") in ("PreToolUse", "UserPromptSubmit", "Stop"):
        print(json.dumps({"continue": False, "stopReason": "This session has a handoff claim, but its coordinator is unavailable. Check alis workstation handoff status before continuing locally."}))


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError):
        pass
