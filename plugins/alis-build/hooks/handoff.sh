#!/usr/bin/env bash
# Local lifecycle adapter. The CLI owns session state and the transfer worker.
# Older CLIs gracefully skip registration; active handoff claims fail closed.
# Runs on every tool call, so stay in bash (3.2-compatible): no python or jq.

payload=$(cat 2>/dev/null)

# Function-hooks handshake: the module lists the jobs it serves in
# alis_module; when "handoff" is among them this script has nothing to do.
alis_module_re='"alis_module"[[:space:]]*:[[:space:]]*"([^"]* )?handoff( [^"]*)?"'
[[ $payload =~ $alis_module_re ]] && exit 0

if command -v alis >/dev/null 2>&1; then
  if out=$(printf '%s' "$payload" | alis workstation handoff _hook 2>/dev/null); then
    [ -n "$out" ] && printf '%s\n' "$out"
    exit 0
  fi
fi

# Coordinator unavailable: fail closed only for sessions with a handoff claim.
flat=$(printf '%s' "$payload" | tr '\n\r' '  ')
field() {
  printf '%s' "$flat" | sed -n "s/.*\"$1\"[[:space:]]*:[[:space:]]*\"\([^\"]*\)\".*/\1/p"
}
sid=$(field session_id)
sid_re='^[A-Za-z0-9_-]{1,128}$'
[[ $sid =~ $sid_re ]] || exit 0
[ -e "$HOME/.alis/handoff-sessions/$sid.claim" ] || exit 0

reason="This session has a handoff claim, but its coordinator is unavailable. Check alis workstation handoff status before continuing locally."
case "$(field hook_event_name)" in
  PreToolUse)
    printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"%s"}}\n' "$reason" ;;
  UserPromptSubmit|Stop)
    printf '{"continue":false,"stopReason":"%s"}\n' "$reason" ;;
esac
exit 0
