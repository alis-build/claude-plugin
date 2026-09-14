"""Routing eval: isolated stdin, actual tool events, and complete case counts."""
import argparse
import json
import shlex
import subprocess
import sys
from pathlib import Path


def read_cases(path):
    cases = []
    for number, line in enumerate(path.read_text().splitlines(), 1):
        if not line or line.startswith("#"): continue
        fields = line.split("\t")
        if len(fields) != 3 or fields[1] not in ("yes", "no") or not fields[0].strip():
            raise ValueError(f"invalid TSV row {number}")
        cases.append(tuple(fields))
    if len(cases) != 30 or len({row[0] for row in cases}) != 30:
        raise ValueError("expected exactly 30 distinct prompts")
    return cases


def score_events(stdout):
    fired = False
    errors = []
    final = None
    seen = set()
    for line in stdout.splitlines():
        if not line.strip(): continue
        try: event = json.loads(line)
        except ValueError:
            errors.append("invalid stream JSON")
            continue
        if not isinstance(event, dict):
            errors.append("invalid stream event")
            continue
        if event.get("type") == "result": final = event
        content = event.get("message", {}).get("content", [])
        if not isinstance(content, list): continue
        for block in content:
            if not isinstance(block, dict): continue
            if block.get("type") == "tool_result" and block.get("is_error"):
                errors.append("tool error or permission denial")
            if block.get("type") != "tool_use" or block.get("id") in seen: continue
            seen.add(block.get("id"))
            name, args = block.get("name"), block.get("input", {})
            if name == "Skill" and args.get("skill") == "alis:discover": fired = True
            if name == "Bash":
                try: argv = shlex.split(args.get("command", ""))
                except ValueError: continue
                # Global options can precede the command, including the
                # per-invocation session attribution added by the hook.
                i = 1
                while i < len(argv):
                    flag = argv[i].split("=", 1)[0]
                    if flag in ("--cwd", "--session-id"):
                        i += 1 if "=" in argv[i] else 2
                    elif flag in ("--json", "--verbose"):
                        i += 1
                    else: break
                # The evaluation fixture requires standalone CLI calls. A
                # quoted textual mention in echo/cat never counts as routing.
                if argv and argv[0] == "alis" and len(argv) > i+1 and argv[i] == "skills" and argv[i+1] in ("suggest", "search", "load"):
                    fired = True
    if final is None: errors.append("missing final result")
    elif final.get("is_error") or final.get("subtype", "success") != "success":
        errors.append("session did not complete successfully")
    return fired, errors


def evaluate(cases, target, executable="claude"):
    results = []
    for prompt, expected, category in cases:
        try:
            completed = subprocess.run(
                [executable, "-p", prompt, "--output-format", "stream-json", "--verbose", "--max-turns", "4"],
                cwd=target, input="", capture_output=True, text=True, timeout=180,
            )
            fired, errors = score_events(completed.stdout)
            if completed.returncode: errors.append(f"claude exited {completed.returncode}")
        except (OSError, subprocess.TimeoutExpired) as error:
            fired, errors = False, [type(error).__name__]
        results.append(dict(prompt=prompt, expected=expected, category=category, fired=fired, errors=errors))
    return results


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--live", action="store_true", help="run Claude; use only a disposable workspace with a stub alis CLI")
    parser.add_argument("target", nargs="?", type=Path)
    parser.add_argument("--results", type=Path, help="write scores only (no transcripts)")
    args = parser.parse_args()
    try: cases = read_cases(Path(__file__).with_name("prompts.tsv"))
    except ValueError as error: parser.error(str(error))
    print(f"prompts.tsv: {len(cases)} rows OK")
    if args.dry_run: return 0
    if not args.live or not args.target or not args.target.is_dir():
        parser.error("live evaluation requires --live and an explicit disposable target directory; otherwise use --dry-run")
    results = evaluate(cases, args.target.resolve())
    yes = [r for r in results if r["expected"] == "yes"]
    wrong_no = [r for r in results if r["expected"] == "no" and r["fired"]]
    errors = [r for r in results if r["errors"]]
    hits = sum(r["fired"] for r in yes)
    for r in results:
        ok = not r["errors"] and r["fired"] == (r["expected"] == "yes")
        print(f"{'PASS' if ok else 'FAIL'}\t{r['category']}\t{r['prompt']}" + ("\t" + "; ".join(r["errors"]) if r["errors"] else ""))
    print(f"Completed cases: {len(results)}/30; yes: {hits}/{len(yes)}; incorrect no: {len(wrong_no)}; errors: {len(errors)}")
    if args.results: args.results.write_text(json.dumps(results, indent=2) + "\n")
    return int(len(results) != 30 or bool(errors) or bool(wrong_no) or hits * 100 < len(yes) * 90)


if __name__ == "__main__": sys.exit(main())
