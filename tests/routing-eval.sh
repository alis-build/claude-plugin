#!/bin/bash
# Routing eval for the alis-build:discover skill.
#
# For each prompt in prompts.tsv, runs a one-shot Claude Code session inside a
# target directory and checks whether skill discovery fired (evidence: the
# output mentions "alis-build:discover", "alis skills search", or
# "alis skills load"), then compares against the row's expectation.
#
# Usage:
#   tests/routing-eval.sh [--dry-run] [target-dir]
#
#   target-dir   directory in which to run `claude -p` (default: $PWD).
#                Use an alis.build workspace to exercise workspace-gated rows.
#   --dry-run    validate prompts.tsv only; run no sessions.
#
# Exit status: non-zero if the tsv is invalid, if any "no" row fired
# (precision failure), or if fewer than 90% of "yes" rows fired (recall
# failure). Dependencies: bash, grep, awk, and (for live runs) claude.
set -u

script_dir="$(cd "$(dirname "$0")" && pwd)"
tsv="$script_dir/prompts.tsv"

dry_run=0
target_dir="$PWD"
for arg in "$@"; do
  case "$arg" in
    --dry-run) dry_run=1 ;;
    -h|--help) grep '^#' "$0" | grep -v '^#!' | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) target_dir="$arg" ;;
  esac
done

[ -f "$tsv" ] || { echo "ERROR: missing $tsv" >&2; exit 1; }

# --- Validate the tsv -------------------------------------------------------
errors=0
lineno=0
rows=0
while IFS= read -r line || [ -n "$line" ]; do
  lineno=$((lineno + 1))
  case "$line" in ''|'#'*) continue ;; esac
  fields=$(printf '%s\n' "$line" | awk -F'\t' '{print NF}')
  if [ "$fields" -ne 3 ]; then
    echo "ERROR: line $lineno: expected 3 tab-separated fields, got $fields" >&2
    errors=$((errors + 1)); continue
  fi
  expect=$(printf '%s\n' "$line" | awk -F'\t' '{print $2}')
  case "$expect" in
    yes|no) rows=$((rows + 1)) ;;
    *) echo "ERROR: line $lineno: expect_fire must be yes|no, got '$expect'" >&2
       errors=$((errors + 1)) ;;
  esac
done < "$tsv"

if [ "$errors" -gt 0 ]; then
  echo "prompts.tsv: $errors error(s)" >&2
  exit 1
fi
echo "prompts.tsv: $rows rows OK"
[ "$dry_run" -eq 1 ] && exit 0

# --- Live run ---------------------------------------------------------------
command -v claude >/dev/null 2>&1 || { echo "ERROR: claude CLI not found" >&2; exit 1; }
[ -d "$target_dir" ] || { echo "ERROR: target dir not found: $target_dir" >&2; exit 1; }

echo "Running eval in: $target_dir"
printf '%-6s %-4s %-6s %-10s %s\n' "RESULT" "EXP" "FIRED" "CATEGORY" "PROMPT"

yes_total=0; yes_fired=0; no_total=0; no_fired=0; fails=0
while IFS= read -r line || [ -n "$line" ]; do
  case "$line" in ''|'#'*) continue ;; esac
  prompt=$(printf '%s\n' "$line" | awk -F'\t' '{print $1}')
  expect=$(printf '%s\n' "$line" | awk -F'\t' '{print $2}')
  category=$(printf '%s\n' "$line" | awk -F'\t' '{print $3}')

  out=$(cd "$target_dir" && \
    claude -p "$prompt" --output-format json --max-turns 4 2>&1)

  fired=no
  if printf '%s\n' "$out" | grep -qE 'alis-build:discover|alis skills search|alis skills load'; then
    fired=yes
  fi

  if [ "$fired" = "$expect" ]; then result=PASS; else result=FAIL; fails=$((fails + 1)); fi
  if [ "$expect" = "yes" ]; then
    yes_total=$((yes_total + 1)); [ "$fired" = "yes" ] && yes_fired=$((yes_fired + 1))
  else
    no_total=$((no_total + 1)); [ "$fired" = "yes" ] && no_fired=$((no_fired + 1))
  fi
  printf '%-6s %-4s %-6s %-10s %s\n' "$result" "$expect" "$fired" "$category" "$prompt"
done < "$tsv"

# --- Summary ----------------------------------------------------------------
# Precision here = of the rows that fired, how many were supposed to
# (true positives / all fired); recall = fired "yes" rows / all "yes" rows.
echo
awk -v yt="$yes_total" -v yf="$yes_fired" -v nt="$no_total" -v nf="$no_fired" 'BEGIN {
  fired_all = yf + nf
  precision = (fired_all > 0) ? 100 * yf / fired_all : 100
  recall = (yt > 0) ? 100 * yf / yt : 100
  printf "yes rows fired: %d/%d (recall %.1f%%)\n", yf, yt, recall
  printf "no rows fired:  %d/%d (precision %.1f%%)\n", nf, nt, precision
}'

status=0
if [ "$no_fired" -gt 0 ]; then
  echo "FAIL: $no_fired 'no' row(s) fired (precision failure)"
  status=1
fi
recall_ok=$(awk -v yt="$yes_total" -v yf="$yes_fired" \
  'BEGIN { print (yt == 0 || yf * 100 >= yt * 90) ? 1 : 0 }')
if [ "$recall_ok" -ne 1 ]; then
  echo "FAIL: fewer than 90% of 'yes' rows fired (recall failure)"
  status=1
fi
[ "$status" -eq 0 ] && echo "OK: routing eval passed ($fails row-level mismatch(es) within thresholds)"
exit "$status"
