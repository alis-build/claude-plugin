import importlib.util
import io
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT=Path(__file__).resolve().parents[1]
HOOKS=ROOT/"plugins/alis-build/hooks"
sys.path.insert(0,str(HOOKS))
spec=importlib.util.spec_from_file_location("handoff",HOOKS/"handoff.py")
hook=importlib.util.module_from_spec(spec)
spec.loader.exec_module(hook)
spec=importlib.util.spec_from_file_location("cli_hook",HOOKS/"cli-hook.py")
cli=importlib.util.module_from_spec(spec)
spec.loader.exec_module(cli)


class HandoffHookTests(unittest.TestCase):
    def run_hook(self,payload,result,home):
        stdin=io.TextIOWrapper(io.BytesIO(json.dumps(payload).encode()))
        stdout=io.StringIO()
        with patch.object(sys,"stdin",stdin),patch.object(sys,"stdout",stdout),patch.object(hook.Path,"home",return_value=home),patch.object(hook.subprocess,"run",return_value=result) as run:
            hook.main()
        return stdout.getvalue(),run

    def test_old_cli_is_silent_without_claim(self):
        with tempfile.TemporaryDirectory() as d:
            out,run=self.run_hook({"session_id":"abc","hook_event_name":"Stop"},subprocess.CompletedProcess([],1,b""),Path(d))
        self.assertEqual(out,"")
        self.assertEqual(run.call_args.args[0],["alis","workstation","handoff","_hook"])

    def test_existing_claim_fails_closed_when_coordinator_fails(self):
        with tempfile.TemporaryDirectory() as d:
            home=Path(d)
            claim=home/".alis/handoff-sessions/abc.claim"
            claim.parent.mkdir(parents=True)
            claim.write_text("{}")
            out,_=self.run_hook({"session_id":"abc","hook_event_name":"PreToolUse"},subprocess.CompletedProcess([],1,b""),home)
        self.assertFalse(json.loads(out)["continue"])

    def test_valid_hook_response_is_forwarded(self):
        with tempfile.TemporaryDirectory() as d:
            out,_=self.run_hook({"session_id":"abc","hook_event_name":"Stop"},subprocess.CompletedProcess([],0,b'{"continue":false,"stopReason":"handoff"}'),Path(d))
        self.assertEqual(json.loads(out),{"continue":False,"stopReason":"handoff"})

    def test_read_commands_allowed_in_plan_but_execution_and_internal_protocol_are_not(self):
        for command in ["alis workstation handoff targets --json","alis workstation handoff status abc --json"]:
            result=cli.decide({"permission_mode":"plan","tool_name":"Bash","tool_input":{"command":command}})
            self.assertEqual(result["hookSpecificOutput"]["permissionDecision"],"allow")
        for suffix in ["--session abc", "cancel abc", "_agent", "_hook"]:
            result=cli.decide({"permission_mode":"plan","tool_name":"Bash","tool_input":{"command":"alis workstation handoff "+suffix}})
            self.assertEqual(result["hookSpecificOutput"]["permissionDecision"],"deny")

    def test_handoff_does_not_get_blanket_process_execution_allow(self):
        result=cli.decide({"permission_mode":"default","tool_name":"Bash","tool_input":{"command":"alis workstation handoff --session abc --to alis-acme-1234567890"}})
        self.assertNotIn("permissionDecision",result["hookSpecificOutput"])


if __name__=="__main__": unittest.main()
