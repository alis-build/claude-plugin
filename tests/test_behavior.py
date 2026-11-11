import json, os, shlex, subprocess, sys, tempfile, unittest
from pathlib import Path
import routing_eval
from test_native_hooks import NativeHookTests
ROOT=Path(__file__).resolve().parents[1]
HOOKS=ROOT/"plugins/alis-build/hooks"
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

class SuggestHookTests(unittest.TestCase):
    """suggest-skills.sh passes wake-word hints through and drops ambient suggestions."""

    def run_with(self, context, prompt, project="/tmp/plain", mode=None):
        with tempfile.TemporaryDirectory() as home:
            fake = Path(home, "alis")
            out = json.dumps({"hookSpecificOutput": {"hookEventName": "UserPromptSubmit", "additionalContext": context}})
            fake.write_text("#!/bin/sh\ncat >/dev/null; touch \"$HOME/called\"; echo " + shlex.quote(out) + "\n")
            fake.chmod(0o700)
            env = dict(os.environ, HOME=home, PATH=home + os.pathsep + os.environ["PATH"], CLAUDE_PROJECT_DIR=project)
            env.pop("ALIS_SUGGEST_ALWAYS", None)
            p = subprocess.run(["bash", str(HOOKS / "suggest-skills.sh")], input=json.dumps({"prompt": prompt, **({"permission_mode": mode} if mode else {})}), text=True, capture_output=True, env=env)
            self.assertEqual(p.returncode, 0, p.stderr)
            return p.stdout, Path(home, "called").exists()

    def test_wake_hint_passes_through(self):
        out, called = self.run_with("The user addressed alis by name. Invoke the alis:discover skill now.", "alis, add an endpoint")
        self.assertTrue(called)
        self.assertIn("alis:discover", out)

    def test_ambient_suggestion_is_dropped(self):
        # Ticket 0c78cf3e: a scratch-workspace reminder scored an iOS skill on a SendGrid question.
        note = "Possibly relevant Alis skill: build-your-first-ios-app — Guide builders.\nLoad with `alis skills load <id>` if relevant; otherwise ignore this note."
        out, called = self.run_with(note, "how are sendgrid templates managed across alis.os?")
        self.assertTrue(called)
        self.assertEqual(out, "")

    def test_prompt_without_wake_word_skips_the_cli_even_in_a_workspace(self):
        out, called = self.run_with("anything", "add an endpoint", "/x/alis.build/acme/build/sm/hello/v1")
        self.assertFalse(called)
        self.assertEqual(out, "")

    def test_plan_mode_prompt_reaches_the_cli_and_a_skill_store_match_passes_through(self):
        note = "Skill store match for this request — Alis skill: block-forgejocodereviewer — Adds an AI reviewer.\nLoad with `alis skills load <id>` if relevant; otherwise ignore this note."
        out, called = self.run_with(note, "put an AI reviewer on our pull requests", mode="plan")
        self.assertTrue(called)
        self.assertIn("block-forgejocodereviewer", out)

    def test_plan_mode_still_drops_a_local_guess(self):
        note = "Possibly relevant Alis skill: build-your-first-ios-app — Guide builders.\nLoad with `alis skills load <id>` if relevant; otherwise ignore this note."
        out, called = self.run_with(note, "put an AI reviewer on our pull requests", mode="plan")
        self.assertTrue(called)
        self.assertEqual(out, "")

if __name__ == "__main__": unittest.main()
