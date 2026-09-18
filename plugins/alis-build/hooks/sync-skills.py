#!/usr/bin/env python3
import json
import os
import signal
import subprocess
import sys
from health import observe


def sync(timeout=20):
    child = None
    outcome = "failed"
    try:
        child = subprocess.Popen(["alis", "skills", "sync", "--cache-only", "--harness", "claude"], stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
        outcome = "success" if child.wait(timeout=timeout) == 0 else "failed"
    except subprocess.TimeoutExpired:
        outcome = "timeout"
    except FileNotFoundError:
        outcome = "cli-missing"
    finally:
        if child is not None and child.poll() is None:
            os.killpg(child.pid, signal.SIGKILL)
            child.wait()
        observe("claude-skills-sync-health.json", status=outcome)
    return outcome


def main():
    try:
        payload = json.load(sys.stdin)
        if not isinstance(payload, dict) or payload.get("source", "startup") not in ("startup", "clear"): return
        if "sync" in str(payload.get("alis_module", "")).split(): return  # served by the function-hooks module
        signal.signal(signal.SIGTERM, lambda *_: sys.exit(0))
        sync()
    except (ValueError, TypeError, OSError):
        pass


if __name__ == "__main__": main()
