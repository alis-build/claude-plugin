#!/usr/bin/env bash
# PreToolUse hook: auto-approve `alis` CLI invocations so Claude Code can run the
# Alis Build command-line tool without a permission prompt on every call.
#
# Why this exists: Claude Code prompts for Bash commands unless they match an
# allow rule in settings.json. Those rules are user/project-scoped and cannot be
# shipped by a plugin. A PreToolUse hook is the plugin-native equivalent: it
# inspects the pending Bash call and returns permissionDecision "allow" for clean
# `alis ...` invocations, so the rule travels with the plugin to everyone who
# installs it.
#
# Safety: we ONLY auto-approve a single, simple `alis <subcommand> ...` command.
# If the command chains or redirects (|, &&, ||, ;, &, >, <, backtick, $(...),
# newline) we emit NOTHING and exit 0, letting Claude Code's normal permission
# flow take over. This prevents `alis define && rm -rf /`-style smuggling from
# riding on the allow. The matcher in hooks.json restricts this hook to Bash.
#
# Scope: by default every `alis` subcommand is auto-approved. To restrict, set
# ALIS_ALLOWED_SUBCMDS to a space-separated allowlist (e.g. "define build
# deploy operations"); any other subcommand then falls through to a prompt.
#
# Reads the hook payload (JSON) on stdin and writes the hook response to stdout.
set -euo pipefail

# Without jq we cannot parse the payload; emit nothing and exit 0 so the call
# proceeds through Claude Code's normal permission flow (graceful degradation).
command -v jq >/dev/null 2>&1 || exit 0

payload="$(cat)"
cmd="$(printf '%s' "$payload" | jq -r '.tool_input.command // empty' 2>/dev/null || true)"
[ -n "$cmd" ] || exit 0

# Reject anything that splits into multiple shell segments or redirects. We keep
# this conservative: a legitimately-quoted metacharacter just means the user
# gets a normal prompt this once, which is safe degradation.
case "$cmd" in
  *'|'* | *'&'* | *';'* | *'<'* | *'>'* | *'`'* | *'$('* | *$'\n'*)
    exit 0
    ;;
esac

# First token must be exactly `alis`; capture the subcommand (second token).
read -r first sub _rest <<EOF
$cmd
EOF
[ "$first" = "alis" ] || exit 0

# Record the harness permission mode for the alis CLI's approval gate: the CLI
# treats a fresh acceptEdits/bypassPermissions record matching this exact
# command as a standing user grant for non-production approvals (production
# deploys always require explicit human approval). Best-effort — every failure
# path falls through so the allow decision below is never affected. Written
# before the double-key carve-outs so the mode is recorded even when this hook
# defers to a normal prompt.
mode="$(printf '%s' "$payload" | jq -r '.permission_mode // "default"' 2>/dev/null || echo default)"
sid="$(printf '%s' "$payload" | jq -r '.session_id // empty' 2>/dev/null || true)"
if mkdir -p "$HOME/.alis" 2>/dev/null && tmp="$(mktemp "$HOME/.alis/.agent-approval.XXXXXX" 2>/dev/null)"; then
  if jq -nc --arg m "$mode" --arg s "$sid" --arg c "$cmd" \
      '{version: 1, harness: "claude-code", permission_mode: $m, session_id: $s, command: $c, written_at: (now | todate)}' \
      >"$tmp" 2>/dev/null; then
    chmod 600 "$tmp" 2>/dev/null || true
    mv -f "$tmp" "$HOME/.alis/agent-approval.json" 2>/dev/null || rm -f "$tmp"
  else
    rm -f "$tmp"
  fi
fi

# Never auto-approve explicit-approval flags: --confirm-production (production
# deploy gate), --approve (the CLI's human pre-approval flag), and
# `blocks uninstall --yes` (destructive, prompt-skipping). Falling through here
# means the human sees Claude Code's permission prompt in addition to having
# approved in chat — deliberate double-keying.
case "$cmd" in
  *'--confirm-production'* | *'--approve'*)
    exit 0
    ;;
esac
if [ "$sub" = "blocks" ] || [ "$sub" = "block" ]; then
  case "$cmd" in
    *uninstall*--yes* | *--yes*uninstall*)
      exit 0
      ;;
  esac
fi

# Optional allowlist of subcommands.
if [ -n "${ALIS_ALLOWED_SUBCMDS:-}" ]; then
  allowed=0
  for s in $ALIS_ALLOWED_SUBCMDS; do
    [ "$s" = "$sub" ] && { allowed=1; break; }
  done
  [ "$allowed" -eq 1 ] || exit 0
fi

# Approve the call. permissionDecisionReason is surfaced in Claude Code for audit.
jq -nc '{
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    permissionDecision: "allow",
    permissionDecisionReason: "Auto-approved alis CLI command (Alis Build plugin)"
  }
}'
