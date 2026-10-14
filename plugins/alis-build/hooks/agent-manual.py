#!/usr/bin/env python3
"""The manual for a specialist subagent: the alis CLI in its own words, read on this machine.

A port of alis.os.agent.v2's agent/internal/manual (manual.go). At SubagentStart, for
the member named by agent_type, it prints `alis docs <topic>` for the member's topics and
`alis <group> [<sub>] --help` for its command families, trims them as the agent does, and
writes them to ~/.alis/claude-agent-manual/<cli version>/<member>.md. Claude Code caps a
hook's additionalContext at 10,000 characters, so what rides the hook is a cover sheet:
where the manual is, and the member's topics and commands one line each. The agent reads
the file before its first alis command. Nothing here runs the agent's own commands."""
import json
import os
import re
import subprocess
import sys
import tempfile
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from health import observe

# team.go's Sections, for the members this plugin ships: the docs topics and the
# command families each one is told. tests/release-guard.sh keeps this in step with
# agents/*.md and the SubagentStart matcher in hooks.json.
SECTIONS = {
    "ideate": (("output", "exit-codes", "context", "ideate", "ask"),
               ("ideate", "accounts", "ask")),
    "platform": (("output", "exit-codes", "safety", "context", "workstations"),
                 ("org", "product", "service", "environment", "accounts", "clone", "workstation", "context", "whoami")),
    "dbd": (("output", "exit-codes", "safety", "context", "dbd"),
            ("define", "build", "deploy", "operations", "logs", "packages", "service", "environment", "product")),
    "support": (("output", "exit-codes", "specialist", "ask", "setup"),
                ("specialist", "doctor", "ask", "setup", "whoami")),
}
MEMBER = re.compile(r"^(?:[a-z][a-z0-9-]*:)?(" + "|".join(SECTIONS) + r")$")
MAX_DEPTH = 2          # a group and its subcommands; a depth-2 page names its own children
READERS = 6            # manual.go's readers
PAGE_TIMEOUT = 15      # seconds per alis invocation (measured: 0.05 s)
CACHE_TTL = 86400      # a day: the CLI's docs change only with its version, but cheaply rebuilt
COVER_BUDGET = 9000    # under Claude Code's 10,000-character cap on additionalContext
CACHE_DIR = ".alis/claude-agent-manual"
SUBCOMMAND = re.compile(r"^  ([a-z][a-z0-9-]*)\s+(\S.*)$")  # Cobra pads the longest name with one space
TOPIC_LINE = re.compile(r"^([a-z][a-z0-9-]*)\s+(\S.*)$")


def served_by_module(payload, token):
    """Whether the plugin's function-hooks module serves this job (see hooks/mod/tag.ts)."""
    return token in str(payload.get("alis_module", "")).split()


def member_of(agent_type):
    """The team member an agent_type names: `alis:dbd` or `dbd`, else None."""
    match = MEMBER.match(agent_type) if isinstance(agent_type, str) else None
    return match.group(1) if match else None


def cli_version():
    """The installed CLI's version from its own cache, else from `alis version`, else None."""
    try:
        text = json.loads((Path.home() / ".alis/versions-cache.json").read_text()).get("cliVersion")
        if isinstance(text, str) and re.fullmatch(r"v?\d+\.\d+\.\d+(?:[-+].*)?", text): return text.lstrip("v")
    except (OSError, ValueError, TypeError, AttributeError):
        pass
    text, err = run_page(("version", "--json"))
    if err: return None
    try:
        version = json.loads(text).get("version")
    except (ValueError, TypeError, AttributeError):
        return None
    return version.lstrip("v") if isinstance(version, str) and re.fullmatch(r"v?\d+\.\d+\.\d+(?:[-+].*)?", version) else None


def run_page(argv):
    """One alis invocation: (text, error). stdout, or stderr when stdout is blank, as manual.go reads it."""
    env = dict(os.environ, ALIS_NO_TELEMETRY="1")
    try:
        done = subprocess.run(["alis", *argv], stdin=subprocess.DEVNULL, capture_output=True, text=True, env=env, timeout=PAGE_TIMEOUT)
    except subprocess.TimeoutExpired:
        return "", "timed out after %ds" % PAGE_TIMEOUT
    except FileNotFoundError:
        raise  # no alis on this machine: the hook has nothing to say
    except (OSError, ValueError) as error:
        return "", str(error)
    text = done.stdout if done.stdout.strip() else done.stderr
    if done.returncode != 0:
        return "", "exit %d: %s" % (done.returncode, done.stderr.strip() or done.stdout.strip())
    return text, ""


def trim_help(text):
    """Drop the Global Flags block and the `Use "alis …" for more information` line."""
    lines = []
    skipping = False
    for line in text.splitlines():
        if line.startswith("Global Flags:"):
            skipping = True
            continue
        if skipping:
            if line.strip() == "": skipping = False
            continue
        if line.startswith('Use "alis') and "for more information" in line: continue
        lines.append(line)
    return "\n".join(lines).strip() + "\n"


def parse_subcommands(text):
    """(name, blurb) for every line of the help's Available Commands block, sorted; help and completion skipped."""
    found = {}
    inside = False
    for line in text.splitlines():
        if line.startswith("Available Commands:"):
            inside = True
            continue
        if inside:
            if line.strip() == "": inside = False; continue
            match = SUBCOMMAND.match(line)
            if match and match.group(1) not in ("help", "completion"): found[match.group(1)] = match.group(2).strip()
    return sorted(found.items())


def parse_topics(text):
    """(topic, blurb) from `alis docs --list`."""
    found = {}
    for line in text.splitlines():
        match = TOPIC_LINE.match(line)
        if match: found[match.group(1)] = match.group(2).strip()
    return found


def read_all(argvs):
    """Every page at once, READERS at a time: {argv: (text, err)}."""
    with ThreadPoolExecutor(max_workers=READERS) as pool:
        return dict(zip(argvs, pool.map(run_page, argvs)))


def read_section(topics, commands):
    """The member's pages as manual.go's tree reads them: topics, each group, then each group's
    subcommands (MAX_DEPTH levels). Returns (pages, blurbs): pages = {argv: (text, err)} in manual
    order; blurbs = {argv: one line} for the cover sheet."""
    first = [("docs", "--list"), ("--help",)] + [("docs", t) for t in topics] + [(g, "--help") for g in commands]
    pages = read_all(first)
    blurbs = {}
    top = parse_subcommands(pages[("--help",)][0])
    for name, blurb in top: blurbs[(name,)] = blurb
    families = {g: [(g,)] for g in commands}
    frontier = [(g,) for g in commands]
    depth = 1
    while depth < MAX_DEPTH and frontier:
        wanted = []
        for path in frontier:
            text, err = pages.get(path + ("--help",), ("", "missing"))
            for name, blurb in parse_subcommands(text) if not err else []:
                child = path + (name,)
                blurbs[child] = blurb
                families[path[0]].append(child)
                wanted.append(child)
        if wanted: pages.update(read_all([c + ("--help",) for c in wanted]))
        frontier = wanted
        depth += 1
    ordered = {}
    for t in topics: ordered[("docs", t)] = pages[("docs", t)]
    for g in commands:
        for path in families[g]: ordered[path + ("--help",)] = pages[path + ("--help",)]
    topic_blurbs = parse_topics(pages[("docs", "--list")][0])
    return ordered, blurbs, topic_blurbs


def manual_text(version, pages):
    """The manual as v2's manual.go lays it out: (text, {argv: the line its section starts on})."""
    out = ["# The alis CLI, in its own words", "",
           "What follows was printed by the alis CLI (%s) on this machine when this agent started: the manual for your "
           "part of the platform, and the help of every command that is yours. It is the version you will run. "
           "Trust it over anything you remember about the CLI." % (version or "version unknown"), ""]
    starts = {}
    for argv, (text, err) in pages.items():
        starts[argv] = len(out) + 1
        out.append("## alis " + " ".join(argv))
        out.append("")
        if err:
            out.append("(could not be read: %s. Run it yourself.)" % err)
        else:
            out.extend((text.strip() if argv[0] == "docs" else trim_help(text).strip()).splitlines())
        out.append("")
    return "\n".join(out), starts


def cover_sheet(member, version, path, text, starts, topics, commands, pages, blurbs, topic_blurbs):
    """What rides the hook: where the manual is, and the member's topics and commands one line each,
    with the line each one's section starts on, so a Read with an offset lands on it."""
    failed = [argv for argv, (_, err) in pages.items() if err]
    lines = ["# The alis CLI, in its own words", "",
             "The manual for your part of the platform - `alis docs` for your topics and the help of every command "
             "that is yours - was printed by the alis CLI (%s) on this machine when you started. It is the version you "
             "will run: trust it over anything you remember about the CLI. It is at" % (version or "version unknown"), "",
             "    %s   (%d KB, %d lines)" % (path, max(1, len(text.encode()) // 1024), text.count("\n") + 1), "",
             "Read it with the Read tool before your first alis command: the whole file, or from the line a section "
             "starts on (its offset) for one topic or command. Never through Bash (`cat`, `grep`, `sed`): Bash is for "
             "one `alis` command per call, with `--json`.", "",
             "## Your topics (each a section of the manual, by line)"]
    def at(argv):
        return " (line %d)" % starts[argv] if argv in starts else ""
    for t in topics:
        blurb = topic_blurbs.get(t, "")
        lines.append("- `alis docs %s`%s%s" % (t, " - " + blurb if blurb else "", at(("docs", t))))
    lines += ["", "## Your commands (the full help of each is in the manual, by line)"]
    for argv in pages:
        if argv[0] == "docs": continue
        path_words = argv[:-1]
        blurb = blurbs.get(path_words, "")
        lines.append("- `alis %s`%s%s" % (" ".join(path_words), " - " + blurb if blurb else "", at(argv)))
    if failed:
        lines += ["", "## Could not be read on this machine (run these yourself)"]
        for argv in failed: lines.append("- `alis %s`: %s" % (" ".join(argv), pages[argv][1]))
    cover = "\n".join(lines) + "\n"
    if len(cover) > COVER_BUDGET:
        cut = cover[:COVER_BUDGET].rsplit("\n", 1)[0]
        cover = cut + "\n- … (the rest is in the manual)\n"
    return cover


def write_atomic(path, text):
    path.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    fd, temp = tempfile.mkstemp(prefix=".%s-" % path.name, dir=path.parent)
    try:
        with os.fdopen(fd, "w") as out: out.write(text)
        os.replace(temp, path)
    finally:
        if os.path.exists(temp): os.unlink(temp)


def build(member):
    """The member's cover sheet: from the cache when it is fresh, else read from the CLI and cached.
    Returns (cover, status, stats)."""
    topics, commands = SECTIONS[member]
    version = cli_version()
    directory = Path.home() / CACHE_DIR / (version or "unversioned")
    manual_path = directory / (member + ".md")
    cover_path = directory / (member + ".cover.md")
    if version:
        try:
            if manual_path.is_file() and time.time() - cover_path.stat().st_mtime < CACHE_TTL:
                return cover_path.read_text(), "cached", {"cliVersion": version}
        except OSError:
            pass
    pages, blurbs, topic_blurbs = read_section(topics, commands)
    text, starts = manual_text(version, pages)
    failed = sum(1 for _, err in pages.values() if err)
    write_atomic(manual_path, text)
    cover = cover_sheet(member, version, manual_path, text, starts, topics, commands, pages, blurbs, topic_blurbs)
    # A cover sheet is cached only for a whole manual, so a page that failed is read again next time.
    if version and not failed: write_atomic(cover_path, cover)
    return cover, ("partial" if failed else "built"), {"cliVersion": version or "", "pages": len(pages), "failed": failed, "bytes": len(text.encode())}


def main():
    try:
        payload = json.load(sys.stdin)
        if not isinstance(payload, dict): return
        if payload.get("hook_event_name") != "SubagentStart": return
        member = member_of(payload.get("agent_type"))
        if not member: return
        if os.environ.get("ALIS_AGENT_MANUAL", "").lower() == "off": return
        if served_by_module(payload, "manual"): return
        try:
            cover, status, stats = build(member)
        except FileNotFoundError:
            observe("claude-agent-manual-health.json", member=member, status="cli-missing")
            return
        observe("claude-agent-manual-health.json", member=member, status=status, **stats)
        print(json.dumps({"hookSpecificOutput": {"hookEventName": "SubagentStart", "additionalContext": cover}}))
    except (ValueError, TypeError, OSError, subprocess.SubprocessError):
        return


if __name__ == "__main__": main()
