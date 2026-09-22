import importlib.util
import json
import os
from pathlib import Path
import shlex
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
HOOKS = ROOT / "plugins/alis-build/hooks"
sys.path.insert(0, str(HOOKS))
sys.path.insert(0, str(ROOT / "tests"))

def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

hook = load("cli_hook", HOOKS / "cli-hook.py")
sync = load("sync_skills", HOOKS / "sync-skills.py")
secrets = load("secrets_hook", HOOKS / "secrets-hook.py")
import routing_eval


FAKE = {
    "stripe": "sk_live_" + "FAKE" * 5 + "0000",
    "github": "ghp_FAKEFAKEFAKEFAKEFAKEFAKEFAKEFAKE0000",
    "npm": "npm_FAKEFAKEFAKEFAKEFAKEFAKEFAKEFAKE0000",
    "pypi": "pypi-" + "FAKE" * 15,
    "linear": "lin_api_FAKEFAKEFAKEFAKEFAKE0000",
    "sendgrid": "SG." + "FAKE" * 6 + "." + "FAKE" * 11,
    "postgres": "postgres://app:FAKEpassword@db.example.test/app",
    "privateKey": "-----BEGIN RSA PRIVATE KEY-----",
    "assignment": "STRIPE_SECRET_KEY=FAKEFAKEFAKEFAKEFAKEFAKE",
}


class SecretsTests(unittest.TestCase):
    """The samples of tests/secrets.test.ts, one for one; every value is a made-up shape."""

    def run_hook(self, payload, env=None):
        p = subprocess.run(["bash", str(HOOKS / "warn-secrets.sh")], input=json.dumps(payload), capture_output=True, text=True,
                           env=dict(os.environ, PYTHONDONTWRITEBYTECODE="1", **(env or {})), check=True)
        return json.loads(p.stdout) if p.stdout.strip() else {}

    def test_secret_kinds_are_named_once_with_counts(self):
        self.assertEqual(secrets.secret_kinds_of(f"{FAKE['stripe']}\n{FAKE['stripe']}\n{FAKE['postgres']}"),
                         [("stripe", 2), ("postgres", 1)])
        for kind, sample in FAKE.items():
            with self.subTest(kind=kind):
                self.assertEqual([k for k, _ in secrets.secret_kinds_of(f"value: {sample}")], [kind])

    def test_masked_redacted_and_names_only_output_is_clean(self):
        for text in ("", "STRIPE_SECRET_KEY=••••••••", "token [REDACTED:stripe] was here",
                     '{"envs":[{"name":"STRIPE_SECRET_KEY","set":true}],"revealed":false}',
                     "alis environment variables alis.os --reveal", "export PATH=/usr/local/bin:/usr/bin"):
            with self.subTest(text=text):
                self.assertEqual(secrets.secret_kinds_of(text), [])

    def test_a_bash_result_with_secrets_warns_the_person_and_the_model(self):
        out = self.run_hook({"session_id": "abc", "hook_event_name": "PostToolUse", "tool_name": "Bash", "tool_input": {"command": "cat .env"},
                             "tool_response": {"stdout": f"{FAKE['stripe']}\n{FAKE['postgres']}\n", "stderr": ""}})
        context = out["hookSpecificOutput"]["additionalContext"]
        self.assertEqual(out["hookSpecificOutput"]["hookEventName"], "PostToolUse")
        self.assertIn("stripe", context); self.assertIn("rotate", context); self.assertNotIn(FAKE["stripe"], context)
        self.assertIn("secret", out["systemMessage"]); self.assertNotIn(FAKE["stripe"], out["systemMessage"])

    def test_a_read_result_is_scanned_and_a_clean_or_module_served_result_is_silent(self):
        read = {"hook_event_name": "PostToolUse", "tool_name": "Read", "tool_input": {"file_path": "/x/.env"},
                "tool_response": {"type": "text", "file": {"filePath": "/x/.env", "content": FAKE["assignment"]}}}
        self.assertIn("assignment", self.run_hook(read)["hookSpecificOutput"]["additionalContext"])
        self.assertEqual(self.run_hook({"hook_event_name": "PostToolUse", "tool_name": "Bash", "tool_response": {"stdout": "ok\n", "stderr": ""}}), {})
        self.assertEqual(self.run_hook({"hook_event_name": "PostToolUse", "tool_name": "Bash"}), {})
        self.assertEqual(self.run_hook(dict(read, alis_module="cli secrets")), {})


class PermissionTests(unittest.TestCase):
    def decision(self, command, mode="auto", session="session-a"):
        return hook.decide({"tool_name":"Bash", "permission_mode":mode, "session_id":session,
                            "tool_input":{"command":command,"timeout":120000,"run_in_background":True}}).get("hookSpecificOutput", {})

    def test_guarded_actions_ask_in_every_execution_mode(self):
        for mode in ("auto", "default", "acceptEdits", "bypassPermissions", "dontAsk"):
            for cmd in ("alis deploy example.app.api.v1 --confirm-production --json",
                        "alis blocks uninstall blocks/example --json",
                        "alis --json blocks uninstall blocks/example --yes",
                        "alis block --json uninstall blocks/example",
                        "alis --cwd '/tmp/work space' --json blocks uninstall blocks/example",
                        "alis deploy example.app.api.v1 --approve=true"):
                with self.subTest(mode=mode, command=cmd):
                    result = self.decision(cmd, mode)
                    self.assertEqual(result.get("permissionDecision"), "ask")
                    argv = shlex.split(result["updatedInput"]["command"])
                    self.assertEqual("--confirm-production" in argv, "--confirm-production" in shlex.split(cmd))

    def test_secret_printing_environment_commands_ask(self):
        # CLI >= 1.146.1 reveals values only behind --reveal; older CLIs print
        # them from the bare command, so both shapes ask, and the reason says why.
        for cmd in ("alis environment variables alis.os --json",
                    "alis env vars alis.os",
                    "alis environment variables alis.os --reveal -e production --json",
                    "alis environment refresh alis.os",
                    "alis environment refresh alis.os --output .env",
                    "alis environment refresh alis.os --reveal"):
            with self.subTest(command=cmd):
                result = self.decision(cmd)
                self.assertEqual(result.get("permissionDecision"), "ask")
                self.assertIn("secret", result["permissionDecisionReason"])
                argv = shlex.split(result["updatedInput"]["command"])
                self.assertIn("--approve", argv)
                self.assertNotIn("--confirm-production", argv)
        self.assertEqual(self.decision("alis environment variables alis.os --reveal", "plan")["permissionDecision"], "deny")
        self.assertEqual(self.decision("alis environment list alis.os --json")["permissionDecision"], "allow")

    def test_plan_never_auto_allows_mutations(self):
        self.assertEqual(self.decision("alis build example.app.api.v1 --json", "plan")["permissionDecision"], "deny")
        self.assertEqual(self.decision("alis operations describe operations/a --json", "plan")["permissionDecision"], "allow")

    def test_unsafe_shell_shapes_are_not_rewritten_or_allowed(self):
        for command in ("alis build && touch /tmp/sentinel", "cd /tmp && alis build", "alis build 2>&1 | head", "alis ask \"$(touch /tmp/sentinel)\"", "alis build\nwhoami", "alis run *", "alis build; echo done"):
            with self.subTest(command=command):
                result = self.decision(command)
                self.assertNotIn("permissionDecision", result)
                self.assertNotIn("updatedInput", result)
                self.assertIn("--cwd", result["additionalContext"])

    def test_identity_is_local_to_each_call_and_preserves_arguments(self):
        command = "alis --cwd '/tmp/work space' ask 'literal | text and $value' --json"
        for session in ("session-a", "session-b"):
            result = self.decision(command, session=session)
            self.assertEqual(result["permissionDecision"], "allow")
            updated = result["updatedInput"]
            self.assertEqual(shlex.split(updated["command"]), shlex.split(command) + ["--session-id",session])
            self.assertEqual(updated["timeout"], 120000)
            self.assertTrue(updated["run_in_background"])

    def test_allowlist_and_unknown_commands_do_not_grant(self):
        with patch.dict(os.environ, {"ALIS_ALLOWED_SUBCMDS":"context doctor"}):
            self.assertNotIn("permissionDecision", self.decision("alis build example.app.api.v1 --json"))
            self.assertEqual(self.decision("alis --json blocks uninstall blocks/example --yes")["permissionDecision"], "ask")
        for cmd in ("alis run", "alis specialist send-message --to person@example.test", "alis future-mutation"):
            self.assertNotIn("permissionDecision", self.decision(cmd))

    def test_no_shared_grant_or_command_text_written(self):
        with tempfile.TemporaryDirectory() as home:
            env = dict(os.environ, HOME=home, PYTHONDONTWRITEBYTECODE="1")
            command = "alis ask 'private text example' --json"
            p = subprocess.run(["bash", str(HOOKS / "allow-alis-cli.sh")], input=json.dumps({"tool_input":{"command":command}, "permission_mode":"auto","session_id":"a"}), capture_output=True,text=True,env=env,check=True)
            self.assertEqual(json.loads(p.stdout)["hookSpecificOutput"]["permissionDecision"], "allow")
            self.assertFalse(Path(home, ".alis/agent-approval.json").exists())
            health = Path(home, ".alis/claude-plugin-health.json")
            self.assertNotIn("private text", health.read_text())
            self.assertEqual(health.stat().st_mode & 0o777, 0o600)


class RoutingTests(unittest.TestCase):
    def test_quiet_suggest_counts_and_text_mentions_do_not(self):
        final = {"type":"result", "subtype":"success", "result":"quiet response"}
        event = {"type":"assistant", "message":{"content":[{"type":"tool_use", "id":"a", "name":"Bash", "input":{"command":"alis skills suggest 'add an endpoint' --json"}}]}}
        self.assertEqual(routing_eval.score_events(json.dumps(event)+"\n"+json.dumps(final)), (True, []))
        final["result"] = "alis:discover alis skills load"
        self.assertEqual(routing_eval.score_events(json.dumps(final)), (False, []))
        self.assertTrue(routing_eval.score_events(json.dumps(event))[1])

    def test_all_thirty_prompts_have_empty_stdin(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            stub = root / "claude"
            stub.write_text('#!/usr/bin/env python3\nimport json,sys\nfrom pathlib import Path\nwith Path("requests.jsonl").open("a") as f:f.write(json.dumps({"args":sys.argv,"stdin":sys.stdin.read()})+"\\n")\nprint(json.dumps({"type":"result","subtype":"success","result":"quiet"}))\n')
            stub.chmod(0o700)
            cases = routing_eval.read_cases(ROOT / "tests/prompts.tsv")
            results = routing_eval.evaluate(cases, root, str(stub))
            requests = [json.loads(line) for line in (root / "requests.jsonl").read_text().splitlines()]
            self.assertEqual(len(results), 30)
            self.assertEqual(len(requests), 30)
            self.assertEqual(len({r["args"][2] for r in requests}), 30)
            self.assertTrue(all(r["stdin"] == "" for r in requests))
            self.assertTrue(all(not r["errors"] for r in results))

    def test_error_and_denial_are_not_quiet_success(self):
        event = {"type":"user", "message":{"content":[{"type":"tool_result", "is_error":True}]}}
        final = {"type":"result", "subtype":"error_max_turns", "is_error":True}
        self.assertEqual(len(routing_eval.score_events(json.dumps(event)+"\n"+json.dumps(final))[1]), 2)


class LifecycleTests(unittest.TestCase):
    def test_sync_deadline_cleans_up_and_records_only_status(self):
        with tempfile.TemporaryDirectory() as home:
            executable = Path(home, "alis")
            executable.write_text('#!/bin/sh\nsleep 30\n')
            executable.chmod(0o700)
            with patch.dict(os.environ, {"HOME":home,"PATH":home+os.pathsep+os.environ["PATH"]}):
                self.assertEqual(sync.sync(timeout=0.05), "timeout")
            state = json.loads(Path(home, ".alis/claude-skills-sync-health.json").read_text())
            self.assertEqual(state["status"], "timeout")

    def test_explicit_primer_override_on_every_source(self):
        for source in ("startup", "clear", "resume", "compact"):
            for mode in ("full", "digest", "off"):
                env = dict(os.environ, CLAUDE_PLUGIN_ROOT=str(HOOKS.parent), CLAUDE_PROJECT_DIR="/tmp/plain", ALIS_PRIMER=mode)
                p = subprocess.run(["bash",str(HOOKS / "load-primer.sh")], input=json.dumps({"source":source}),text=True,capture_output=True,env=env,check=True)
                expected = "" if mode == "off" else (HOOKS.parent / "context" / ("dbd-primer.md" if mode == "full" else "dbd-digest.md")).read_text()
                self.assertEqual(p.stdout, expected)


class TagGuardTests(unittest.TestCase):
    """Function-hooks handshake: a shell hook steps aside only on its own token."""

    def run_hook(self, script, payload, env=None):
        base = dict(os.environ, CLAUDE_PLUGIN_ROOT=str(HOOKS.parent), PYTHONDONTWRITEBYTECODE="1")
        base.update(env or {})
        p = subprocess.run(["bash", str(HOOKS / script)], input=json.dumps(payload), text=True, capture_output=True, env=base)
        self.assertEqual(p.returncode, 0, p.stderr)
        return p.stdout

    def test_each_hook_exits_silently_on_its_own_token_and_works_on_others(self):
        with tempfile.TemporaryDirectory() as home:
            bindir = Path(home, "bin"); bindir.mkdir()
            fake = bindir / "alis"
            fake.write_text('#!/bin/sh\ncase "$*" in *suggest*) cat >/dev/null; echo \'{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"suggested"}}\' ;; *sync*) touch "$HOME/synced" ;; *) cat >/dev/null; exit 1 ;; esac\n')
            fake.chmod(0o700)
            env = {"HOME": home, "PATH": str(bindir) + os.pathsep + os.environ["PATH"], "ALIS_PRIMER": "digest",
                   "CLAUDE_PROJECT_DIR": home + "/alis.build/acme/build/sm/hello/v1", "ALIS_SUGGEST_ALWAYS": "1"}
            Path(home, ".alis/handoff-sessions").mkdir(parents=True)
            Path(home, ".alis/handoff-sessions/abc.claim").write_text("{}")
            base = {"session_id": "abc", "hook_event_name": "PreToolUse", "permission_mode": "auto", "source": "startup",
                    "prompt": "alis, help", "tool_name": "Bash", "tool_input": {"command": "alis whoami --json"}}
            cases = {  # script -> (token, a check that the untagged run produced its normal output)
                "load-primer.sh": ("primer", lambda out: "Alis" in out),
                "inject-service-context.sh": ("service", lambda out: "acme.sm.hello.v1" in out),
                "suggest-skills.sh": ("suggest", lambda out: "suggested" in out),
                "handoff.sh": ("handoff", lambda out: "deny" in out),
                "allow-alis-cli.sh": ("cli", lambda out: '"allow"' in out),
                "sync-skills.sh": ("sync", lambda out: Path(home, "synced").exists()),
            }
            for script, (token, check) in cases.items():
                with self.subTest(script=script):
                    for tag in ("", "other primer-x", "handoffs"):
                        self.assertEqual(self.run_hook(script, dict(base, alis_module=tag), env), self.run_hook(script, base, env))
                    self.assertTrue(check(self.run_hook(script, base, env)))
                    Path(home, "synced").unlink(missing_ok=True)
                    self.assertEqual(self.run_hook(script, dict(base, alis_module="cli " + token + " suggest"), env), "")
                    self.assertEqual(self.run_hook(script, dict(base, alis_module=token), env), "")
            self.assertFalse(Path(home, "synced").exists())

    def test_pretooluse_hooks_step_aside_on_a_fresh_session_marker_only(self):
        with tempfile.TemporaryDirectory() as home:
            env = {"HOME": home, "PATH": "/usr/bin:/bin"}
            Path(home, ".alis/handoff-sessions").mkdir(parents=True)
            Path(home, ".alis/handoff-sessions/abc.claim").write_text("{}")
            markers = Path(home, ".alis/claude-module-sessions"); markers.mkdir()
            payload = {"session_id": "abc", "hook_event_name": "PreToolUse", "permission_mode": "auto", "tool_name": "Bash",
                       "tool_input": {"command": "alis whoami --json"}}
            gate = lambda: self.run_hook("allow-alis-cli.sh", payload, env)
            handoff = lambda: self.run_hook("handoff.sh", payload, env)
            self.assertIn('"allow"', gate()); self.assertIn("deny", handoff())        # no marker: both answer
            marker = markers / "abc"
            marker.write_text("cli handoff")
            self.assertEqual(gate(), ""); self.assertEqual(handoff(), "")             # fresh marker with both tokens
            marker.write_text("cli")
            self.assertEqual(gate(), ""); self.assertIn("deny", handoff())            # only the gate is served
            marker.write_text("")
            self.assertIn('"allow"', gate())                                          # session ended: empty marker
            marker.write_text("cli handoff")
            os.utime(marker, (0, 0))
            self.assertIn('"allow"', gate()); self.assertIn("deny", handoff())        # stale marker is ignored
            self.assertIn('"allow"', self.run_hook("allow-alis-cli.sh", dict(payload, session_id="../abc"), env))


if __name__ == "__main__": unittest.main()
