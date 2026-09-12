"""Local hook observations only: no command text, transcript, or credentials."""
import datetime
import json
import os
import shutil
import tempfile
from pathlib import Path


def observe(filename, **fields):
    root = Path(__file__).resolve().parent.parent
    try:
        version = json.loads((root / ".claude-plugin/plugin.json").read_text())["version"]
        directory = Path.home() / ".alis"
        directory.mkdir(mode=0o700, parents=True, exist_ok=True)
        record = dict(root=str(root), version=version, observedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(), cliPath=shutil.which("alis") or "", **fields)
        fd, temp = tempfile.mkstemp(prefix=".claude-health-", dir=directory)
        try:
            with os.fdopen(fd, "w") as out: json.dump(record, out)
            os.replace(temp, directory / filename)
        finally:
            if os.path.exists(temp): os.unlink(temp)
    except (OSError, ValueError, KeyError):
        pass
