"""Exercise hook entry points with Windows-style Python aliases on PATH."""
import json
import os
from pathlib import Path
import shlex
import shutil
import subprocess
import sys
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[1]
HOOKS = ROOT / "plugins/alis-build/hooks"
CASES = {
    "allow-alis-cli.sh": (
        "cli-hook.py",
        {"tool_name": "Bash", "tool_input": {"command": "alis whoami"}},
    ),
    "warn-secrets.sh": (
        "secrets-hook.py",
        {"hook_event_name": "PostToolUse", "tool_name": "Read",
         "tool_response": {"content": "https://example.test"}},
    ),
    "sync-skills.sh": ("sync-skills.py", {"source": "resume"}),
}


class PythonRuntimeTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix="alis python ")
        self.addCleanup(self.tmp.cleanup)
        self.home = Path(self.tmp.name)
        self.bin = self.home / "bin"
        self.bin.mkdir()
        # No host Python can accidentally satisfy a missing candidate.
        for name in ("bash", "cat", "dirname", "grep"):
            (self.bin / name).symlink_to(shutil.which(name))
        self.hooks = self.home / "plugin with spaces" / "hooks"
        shutil.copytree(HOOKS, self.hooks, ignore=shutil.ignore_patterns("__pycache__"))
        self.log = self.home / "python-calls"
        self.env = dict(os.environ, HOME=str(self.home), PATH=str(self.bin),
                        ALIS_TEST_LOG=str(self.log), PYTHONDONTWRITEBYTECODE="1")

    def candidate(self, name, kind="working"):
        body = '#!/bin/bash\nprintf "%s\\n" "$0 $*" >> "$ALIS_TEST_LOG"\n'
        if name == "py":
            body += '[ "$1" = "-3" ] || exit 99\nshift\n'
        if kind == "alias":
            body += 'echo "Python was not found; install from the Microsoft Store" >&2\nexit 9009\n'
        elif kind == "old":
            body += ('exec ' + shlex.quote(sys.executable) +
                     ' -c \'import sys; sys.version_info = (3, 8); exec(sys.argv[1])\' "$2"\n')
        else:
            body += 'exec ' + shlex.quote(sys.executable) + ' "$@"\n'
        path = self.bin / name
        path.write_text(body)
        path.chmod(0o755)

    def run_hook(self, name, payload, *args):
        return subprocess.run([str(self.bin / "bash"), str(self.hooks / name), *args],
                              input=json.dumps(payload), capture_output=True, text=True,
                              env=self.env, timeout=10)

    def assert_hooks_work(self, selected):
        for name, (script, payload) in CASES.items():
            with self.subTest(hook=name):
                self.log.write_text("")
                result = self.run_hook(name, payload)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(result.stderr, "")
                executions = [line for line in self.log.read_text().splitlines() if " -B " in line]
                self.assertEqual(len(executions), 1)
                self.assertTrue(executions[0].startswith(str(self.bin / selected) + " "))
                self.assertIn(str(self.hooks / script), executions[0])
                if name == "allow-alis-cli.sh":
                    self.assertEqual(json.loads(result.stdout)["hookSpecificOutput"]["permissionDecision"], "allow")

    def test_windows_alias_falls_back_to_python_for_all_hooks(self):
        self.candidate("python3", "alias")
        self.candidate("python")
        self.assert_hooks_work("python")

    def test_windows_launcher_fallback_for_all_hooks(self):
        self.candidate("python3", "alias")
        self.candidate("python", "alias")
        self.candidate("py")
        self.assert_hooks_work("py")

    def test_working_python3_is_preferred(self):
        self.candidate("python3")
        self.candidate("python")
        self.candidate("py")
        self.assert_hooks_work("python3")
        self.assertNotIn(str(self.bin / "python") + " ", self.log.read_text())
        self.assertNotIn(str(self.bin / "py") + " ", self.log.read_text())

    def test_unsupported_python_version_falls_back(self):
        self.candidate("python3", "old")
        self.candidate("python")
        self.assert_hooks_work("python")

    def test_only_aliases_exit_silently_without_permission_override(self):
        for name in ("python3", "python", "py"):
            self.candidate(name, "alias")
        for name, (_, payload) in CASES.items():
            with self.subTest(hook=name):
                result = self.run_hook(name, payload)
                self.assertEqual((result.returncode, result.stdout, result.stderr), (0, "", ""))

    def test_missing_python_exits_silently(self):
        for name, (_, payload) in CASES.items():
            with self.subTest(hook=name):
                result = self.run_hook(name, payload)
                self.assertEqual((result.returncode, result.stdout, result.stderr), (0, "", ""))

    def test_probe_preserves_stdin_and_script_arguments(self):
        self.candidate("python3", "alias")
        self.candidate("python")
        script = self.home / "echo payload.py"
        script.write_text("import json, sys\nprint(json.dumps([sys.argv[1:], json.load(sys.stdin)]))\n")
        payload = {"session_id": "s-1", "text": "spaces and ünicode"}
        result = self.run_hook("run-python.sh", payload, str(script), "argument with spaces", "--literal")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stderr, "")
        self.assertEqual(json.loads(result.stdout), [["argument with spaces", "--literal"], payload])

    def test_script_errors_are_not_mistaken_for_missing_python(self):
        self.candidate("python3")
        script = self.home / "failed script.py"
        script.write_text("import sys\nprint('hook failed', file=sys.stderr)\nsys.exit(7)\n")
        result = self.run_hook("run-python.sh", {}, str(script))
        self.assertEqual((result.returncode, result.stdout, result.stderr), (7, "", "hook failed\n"))


if __name__ == "__main__":
    unittest.main()
