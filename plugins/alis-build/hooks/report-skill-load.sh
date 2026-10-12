#!/bin/bash
# PostToolUse on the Skill tool: tell the Alis registry that a natively
# installed Alis skill was fired, so native use counts alongside registry
# loads in the skill's insights. The CLI maps the fired name through its
# install manifest and ignores everything else (this plugin's own skills
# included), and attributes the load to the session in the payload.
# Every failure path is silent — a telemetry hook must never slow down or
# break a session.
command -v alis >/dev/null 2>&1 || exit 0
payload="$(cat 2>/dev/null)" || exit 0
[ -n "$payload" ] || exit 0
# Function-hooks handshake: the module lists the jobs it serves in
# alis_module; when "report-load" is among them this script has nothing to do.
alis_module_re='"alis_module"[[:space:]]*:[[:space:]]*"([^"]* )?report-load( [^"]*)?"'
[[ $payload =~ $alis_module_re ]] && exit 0
# Swallow every CLI failure (an older alis without report-load exits 1).
printf '%s' "$payload" | alis skills report-load --harness claude --hook >/dev/null 2>&1 || true
exit 0
