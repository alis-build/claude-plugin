import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[1]
HOOKS=ROOT/"plugins/alis-build/hooks"
sys.path.insert(0,str(HOOKS))
spec=importlib.util.spec_from_file_location("cli_hook",HOOKS/"cli-hook.py")
cli=importlib.util.module_from_spec(spec)
spec.loader.exec_module(cli)


REASON="This session has a handoff claim, but its coordinator is unavailable. Check alis workstation handoff status before continuing locally."


class HandoffHookTests(unittest.TestCase):
    def run_hook(self,payload,home,alis=None):
        """Run handoff.sh with an optional fake alis script body on PATH."""
        bindir=Path(home)/"bin"
        bindir.mkdir(exist_ok=True)
        if alis is not None:
            fake=bindir/"alis"
            fake.write_text("#!/bin/sh\n"+alis)
            fake.chmod(0o755)
        env={"HOME":str(home),"PATH":str(bindir)+":/usr/bin:/bin","CLAUDE_PLUGIN_ROOT":str(ROOT/"plugins/alis-build")}
        result=subprocess.run(["bash",str(HOOKS/"handoff.sh")],input=json.dumps(payload).encode(),stdout=subprocess.PIPE,stderr=subprocess.PIPE,env=env,timeout=10)
        self.assertEqual(result.returncode,0)
        return result.stdout.decode()

    def claim(self,home,sid="abc"):
        claim=Path(home)/".alis/handoff-sessions"/(sid+".claim")
        claim.parent.mkdir(parents=True,exist_ok=True)
        claim.write_text("{}")

    def test_old_cli_is_silent_without_claim(self):
        with tempfile.TemporaryDirectory() as d:
            argv=Path(d)/"argv"
            out=self.run_hook({"session_id":"abc","hook_event_name":"Stop"},d,'echo "$@" > "%s"; cat >/dev/null; exit 1\n'%argv)
            self.assertEqual(argv.read_text().strip(),"workstation handoff _hook")
        self.assertEqual(out,"")

    def test_payload_is_piped_to_cli(self):
        with tempfile.TemporaryDirectory() as d:
            seen=Path(d)/"stdin"
            payload={"session_id":"abc","hook_event_name":"PostToolUse","tool_input":{"command":"echo \"x\""}}
            self.run_hook(payload,d,'cat > "%s"\n'%seen)
            self.assertEqual(json.loads(seen.read_text()),payload)

    def test_existing_claim_denies_tool_when_coordinator_fails(self):
        with tempfile.TemporaryDirectory() as d:
            self.claim(d)
            out=self.run_hook({"session_id":"abc","hook_event_name":"PreToolUse"},d,"exit 1\n")
        self.assertEqual(json.loads(out),{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":REASON}})

    def test_existing_claim_fails_closed_without_cli(self):
        with tempfile.TemporaryDirectory() as d:
            self.claim(d)
            for event in ["Stop","UserPromptSubmit"]:
                out=self.run_hook({"session_id":"abc","hook_event_name":event},d)
                self.assertEqual(json.loads(out),{"continue":False,"stopReason":REASON})
            self.assertEqual(self.run_hook({"session_id":"abc","hook_event_name":"PostToolUse"},d),"")
            self.assertEqual(self.run_hook({"session_id":"other","hook_event_name":"Stop"},d),"")

    def test_invalid_session_id_never_reads_claim(self):
        with tempfile.TemporaryDirectory() as d:
            (Path(d)/".alis/handoff-sessions").mkdir(parents=True)
            (Path(d)/".alis/x.claim").write_text("{}")
            self.assertEqual(self.run_hook({"session_id":"../x","hook_event_name":"Stop"},d),"")
            self.assertEqual(self.run_hook("not json",d),"")

    def test_valid_hook_response_is_forwarded(self):
        with tempfile.TemporaryDirectory() as d:
            out=self.run_hook({"session_id":"abc","hook_event_name":"Stop"},d,"cat >/dev/null; echo '{\"continue\":false,\"stopReason\":\"handoff\"}'\n")
        self.assertEqual(json.loads(out),{"continue":False,"stopReason":"handoff"})

    def test_read_commands_allowed_in_plan_but_execution_and_internal_protocol_are_not(self):
        for command in ["alis workstation handoff targets --json","alis workstation handoff status abc --json"]:
            result=cli.decide({"permission_mode":"plan","tool_name":"Bash","tool_input":{"command":command}})
            self.assertEqual(result["hookSpecificOutput"]["permissionDecision"],"allow")
        for suffix in ["--session abc", "open abc", "cancel abc", "_agent", "_hook"]:
            result=cli.decide({"permission_mode":"plan","tool_name":"Bash","tool_input":{"command":"alis workstation handoff "+suffix}})
            self.assertEqual(result["hookSpecificOutput"]["permissionDecision"],"deny")

    def test_handoff_does_not_get_blanket_process_execution_allow(self):
        result=cli.decide({"permission_mode":"default","tool_name":"Bash","tool_input":{"command":"alis workstation handoff --session abc --to alis-acme-1234567890"}})
        self.assertNotIn("permissionDecision",result["hookSpecificOutput"])


if __name__=="__main__": unittest.main()
