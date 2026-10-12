"""Local hook observations only: no command text, transcript, or credentials."""
import datetime
import json
import os
import shutil
import tempfile
from pathlib import Path


def plugin_version():
    """This plugin's version from its manifest; raises when unreadable."""
    root = Path(__file__).resolve().parent.parent
    return json.loads((root / ".claude-plugin/plugin.json").read_text())["version"]


def observe(filename, **fields):
    root = Path(__file__).resolve().parent.parent
    try:
        version = plugin_version()
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
