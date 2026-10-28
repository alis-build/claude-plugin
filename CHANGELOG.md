# Changelog

What changed in each release of the Alis Build plugin for Claude Code. This
file is generated from release tags and commit messages; do not edit it by
hand.

## [0.37.1](https://github.com/alis-build/claude-plugin/compare/v0.37.0...v0.37.1) (2026-10-28)

### Fixes

#### Align CLI terminology and artifact commands ([5b5f05c](https://github.com/alis-build/claude-plugin/commit/5b5f05c39d191dd053fa3477b9a04799000b5910))

Use build environment, service and conversation consistently in the plugin guidance. Read Ideate artifacts with alis ideate artifacts read; legacy read paths remain available and mutating actions retain their approval requirements.

The new artifact reader accompanies the CLI copy pass proposed for 1.174.2. Older CLIs retain ideate output-artifact.

## [0.37.0](https://github.com/alis-build/claude-plugin/compare/v0.36.0...v0.37.0) (2026-10-28)

### Features

#### Manual automation tier confirms DBD workflows up front ([b80291f](https://github.com/alis-build/claude-plugin/commit/b80291f2eebc70a0fb54d5ac13921a55ad7eedee))

On the manual tier the CLI refused every define, build, deploy, authorise
and package change without --approve (APPROVAL_REQUIRED), so each one ran
twice. The gate now reads the tier the CLI itself enforces (the server tier
cached in ~/.alis/profile-cache.json, tightened by approvals.maxTier in
~/.alis/settings.json) and, on manual, asks before those workflows with
--approve added. With function hooks the plugin's own dialog asks in every
mode; a define --dry-run, help and reads still run without asking, and a
missing cache keeps the old behaviour.

The TS gate also gets the 0.34.1 help fix it missed: help on a guarded verb
and bare alis --help/-v are read-only. The parity fixture now covers the
tier and those help shapes.

The primer no longer recommends define --install with --async, which the
CLI rejects (FLAG_CONFLICT): that call waits.

## [0.36.0](https://github.com/alis-build/claude-plugin/compare/v0.35.0...v0.36.0) (2026-10-22)

### Features

#### Frontend-preview drives the page with Claude's own browser tools ([7eacc28](https://github.com/alis-build/claude-plugin/commit/7eacc28c610f78970ec26356ed1d418b1102e2f9))

The alis CLI no longer launches terminal-browser: `alis preview --json` only
resolves the page's address. The skill now opens that address with Claude in
Chrome or a Playwright MCP, in the person's own browser, and on a workstation
with the shell's Chrome pane. The README follows.

## [0.35.0](https://github.com/alis-build/claude-plugin/compare/v0.34.2...v0.35.0) (2026-10-19)

### Features

#### Route sharing a page by link to alis artifacts ([da0bfe1](https://github.com/alis-build/claude-plugin/commit/da0bfe199d6666224a8f34c0af0257f48ae6a1a1))

A builder with an HTML page to share asked for a Cloud Run skill, and an agent
asked to "share this" found nothing: the primer, digest and discover skill never
mentioned artifacts, and the word collides with the editor's Artifact pane. The
primer and digest now say that sharing a page or file as a link is `alis
artifacts create … --publish [--password-file | --emails]`, not a deployment,
and the discover skill fires on sharing or publishing a page, report, dashboard
or deck as a link.

## [0.34.2](https://github.com/alis-build/claude-plugin/compare/v0.34.1...v0.34.2) (2026-10-14)

### Fixes

#### A RUNNING deployment is live, not a deploy in progress ([977db06](https://github.com/alis-build/claude-plugin/commit/977db06951f5f4bdf71d1ac8c7af76872ad6feec))

The primer and digest now say what a deployment's RUNNING state means: the
deployed service is up and serving, the steady state after a successful
deploy. Agents read "running" as "still deploying" and kept polling deploys
that had succeeded (one watcher ran for 90 minutes). The CLI adds a
`live: true|false` beside the state from 1.168.15; the primer names it so
older and newer CLIs read the same way.

## [0.34.1](https://github.com/alis-build/claude-plugin/compare/v0.34.0...v0.34.1) (2026-10-14)

### Fixes

#### Help on guarded alis verbs and bare alis --help are read-only ([2aa2461](https://github.com/alis-build/claude-plugin/commit/2aa2461f311ef042ffb30d21e0544f720d071709))

The secrets and destructive gates won over the help check, so
`alis environment variables --help` and `alis blocks uninstall x --help`
asked for confirmation, and a bare `alis --help` or `alis -v` had no verb
and got no decision at all. Cobra prints usage and exits before any verb
runs, so a real help request now allows; a help token swallowed as the value
of a value-taking flag does not count. The primer also says never to prefix
alis with VAR=… or env, which the hook does not recognise as an alis call.

## [0.34.0](https://github.com/alis-build/claude-plugin/compare/v0.33.1...v0.34.0) (2026-10-12)

### Features

#### The hook names the plugin to a CLI that accepts --client-plugin ([f5d7eef](https://github.com/alis-build/claude-plugin/commit/f5d7eeff9beffe45c6e01e9e81a6a35e6702cda7))

Every `alis …` Bash call now carries `--client-plugin claude/<plugin version>`
when the installed CLI is 1.165.6 or later, so the CLI's per-command outcome
facts (CommandCompletedEvent) record which plugin version produced the agent's
experience. The gate reads the CLI's own detection cache
(~/.alis/versions-cache.json) to decide; an older or unknown CLI gets no
unknown flag and the CLI keeps attributing the plugin from the health record.
The Python hook and the module's TypeScript port both insert it, after the
session id and before any `--` separator, never twice.

## [0.33.1](https://github.com/alis-build/claude-plugin/compare/v0.33.0...v0.33.1) (2026-10-12)

### Fixes

#### Primer names the share command on platform failures ([819ab27](https://github.com/alis-build/claude-plugin/commit/819ab27e23e4cc5a75c61df5aeecb297b36ca3e6))

The alis CLI (≥1.165.6, GA as 1.166.3) marks platform-side failures with a
share field naming the command that sends the session to Alis Build. The
primer now points the agent at that field. Version bump only beyond 3402c95.

## [0.33.0](https://github.com/alis-build/claude-plugin/compare/v0.32.1...v0.33.0) (2026-10-12)

### Features

#### Report native skill loads to the Alis registry ([a76ace2](https://github.com/alis-build/claude-plugin/commit/a76ace21dc3839c9d12ce088ac1cf39c58b474fb))

A PostToolUse hook on the Skill tool runs `alis skills report-load --hook`,
which maps a natively installed Alis skill back to its registry id and
records the load against the session, so native use counts in the skill's
insights. Silent and fail-open; the plugin's own skills are ignored.

## [0.32.1](https://github.com/alis-build/claude-plugin/compare/v0.32.0...v0.32.1) (2026-10-09)

### Fixes

#### Live row alignment on desktop ([7af2149](https://github.com/alis-build/claude-plugin/commit/7af214901aee72d3c8de68e3efedd61983bcf2c4))

On the desktop the live row broke apart: the bar, a run of rule
characters sized for terminal cells, wrapped onto a second line in the
desktop's font (and took a pale blue where the desktop maps the
`background` key), which made the row two lines tall and floated the
mark down between them; the label could shrink, so "Building 2.45.x"
read "Building…".

- The mark sits on the first line, centred on the label, in a fixed slot;
  the step line keeps the same slot empty, so it sits under the label on
  every surface. The fold has the same structure.
- The label never shrinks; only the dim note and the step line truncate.
- The desktop's bar is a set-width SVG (Claude Code's light-theme running
  cyan, which holds on both grounds), so it cannot wrap. The terminal
  keeps its rule-character bar in theme keys.

## [0.32.0](https://github.com/alis-build/claude-plugin/compare/v0.31.1...v0.32.0) (2026-10-09)

### Features

#### Live operation row ([e719e86](https://github.com/alis-build/claude-plugin/commit/e719e86dd35d283886e60e347101223728abf46a))

A build or deploy Claude runs or waits on now shows one live line under
its Bash call: the Alis mark, what is happening ("Building 2.44.19"), a
bar that takes the line's spare width, and the clock, with one dim line
for the step and what comes next. When the call ends the row folds to
one outcome line ("✓ 2.44.19 is live on Development · 4m 09s · Logs"),
with the first error line under a failure and Follow / Cancel build when
the person stopped watching.

- ops-progress.ts reads an operation's JSON (`--json --verbose`
  snapshots, describe, the pruned result) into stages: one per docker
  image, one per environment, with steps, the step at work and how it
  ended.
- ops-live.ts follows `operations wait --json --verbose`, polls describe
  when the stream stops, finds a blocking build's operation in
  `operations list`, and keeps following a background wait until the
  operation ends (the usual `--async` + background wait pattern drew
  nothing before).
- ops-render.tsx draws the live row and the fold; a background call's
  row draws in its result, a folded group shows its last outcome.
- brand.tsx: the mark is the brand asset itself, never a redraw:
  assets/alis-mark.svg (byte-for-byte design.v1 Brand/alis.svg) as SVG on
  desktop, assets/alis-mark-cell.png (rendered from it) as a one-cell
  picture in Ghostty and kitty, the bold name elsewhere. State colours
  are Claude Code theme keys. The panes take the mark too.

### Fixes

#### Fold an alis call by how it ended, and show the CLI's error ([4242f89](https://github.com/alis-build/claude-plugin/commit/4242f898d85e4bef0f413f91ec985314e953c372))

- ops-live.ts: when the Bash call returns, keep the operation state from
  its own stdout and whether it was interrupted (its flag, or the abort
  signal). A folded "Ran N shell commands" group has no output to read,
  and the watcher can stop before its own stream sees the end.
- ops-render.tsx: fold as "you stopped watching" only on a real
  interrupt; with nothing saying how the call ended, return null and
  let the engine draw the row instead of guessing.
- ops-progress.ts: a call the CLI rejected before any operation existed
  (APPROVAL_REQUIRED, auth, an unpushed commit) folds with the first
  line of the CLI's error under "Deploy failed." / "Build failed."

### Documentation

#### Contributing guide, security policy, and issue and PR templates ([3eb0d1e](https://github.com/alis-build/claude-plugin/commit/3eb0d1e453dc2b6b63fdc96bfb81dd5fd3d14d77))

#### Contributing guide, security policy, and issue and PR templates ([48e6fc7](https://github.com/alis-build/claude-plugin/commit/48e6fc7a134dd957cfd913c129c176521ae0276f))

## [0.31.1](https://github.com/alis-build/claude-plugin/compare/v0.31.0...v0.31.1) (2026-10-07)

### Features

#### Handoff skill handles an unregistered desktop session ([f13e1a3](https://github.com/alis-build/claude-plugin/commit/f13e1a3f197999c272b9858e86f5828266baef49))

On HANDOFF_SESSION_NOT_REGISTERED the skill keeps the chosen workstation and
offers the --detached fallback or a plugin reload, never a rerun; it points
at `alis workstation handoff check` for a side-effect-free readiness report.

## [0.31.0](https://github.com/alis-build/claude-plugin/compare/v0.30.0...v0.31.0) (2026-10-06)

### Features

#### Enhance frontend-preview documentation for workstation shell integration ([5d31044](https://github.com/alis-build/claude-plugin/commit/5d31044b2deaeaadfcdc8467c1f94cc2b89fe86a))

- Updated the description to clarify the use of the Preview pane in workstation shells alongside terminal-browser.
- Added new allowed tool "mcp__playwright" for driving the browser in the Preview pane.
- Expanded the result descriptions to include handling for the workstation shell's Preview pane and its interaction with `playwright` tools.

### Fixes

#### Drop ambient skill suggestions; keep wake-phrase routing ([cc721cf](https://github.com/alis-build/claude-plugin/commit/cc721cff967e4ad5d974af925ec0e7c9a4b0cd69))

Lexical matching on whole prompts suggested unrelated skills too often. In
the Claude desktop app the scratch-workspace reminder (an alis.build path,
"the app") scored build-your-first-ios-app on a SendGrid question.

- the mod and suggest-skills.sh drop the CLI's "Possibly relevant Alis
  skill" note; "alis, …" and "capture this as a skill" still route to
  alis:discover and alis:capture
- the CLI is called only for prompts mentioning alis or skill, in any folder
- the suggestion band, its toast and its saved state are removed

## [0.30.0](https://github.com/alis-build/claude-plugin/compare/v0.29.1...v0.30.0) (2026-10-02)

### Features

#### Claude Code mods GA (2.1.287) ([9fae6e5](https://github.com/alis-build/claude-plugin/commit/9fae6e542a09974127f527678476dcb8db515e27))

- GA fixes: types from the engine-written .claude-plugin/types, ui.open's result
  and the new fixture shapes, quoted hook paths, docs on the server rollout switch
- secret masking: tool results reach the model with [REDACTED:kind] in place of
  each secret-looking value (session.append); a call's arguments and an approved
  --reveal keep the warning
- session state in $.state (contract in types/index.d.ts): a reload keeps
  reported secrets, the suggestion band and open panes
- the live wait line streams the CLI's progress through its own
  alis operations wait ($.process.spawn), falling back to describe polling
- uninstall, environment destroy/unset and --reveal ask in the alis dialog in
  every mode; a plain --approve follows the user's explicit request

## [0.29.1](https://github.com/alis-build/claude-plugin/compare/v0.29.0...v0.29.1) (2026-09-28)

### Fixes

#### Frontend-preview closes a herdr preview with herdr pane close; a closed last tab leaves a blank tab, and ls's pid is the shared daemon ([c77d8da](https://github.com/alis-build/claude-plugin/commit/c77d8dada979979486479565174c7fe365ca7f80))

## [0.29.0](https://github.com/alis-build/claude-plugin/compare/v0.28.0...v0.29.0) (2026-09-22)

### Features

#### The Bash gate asks before alis prints or writes secret values ([d808123](https://github.com/alis-build/claude-plugin/commit/d80812386ec270b162a06384f1ddb7bb7df6c1cd))

alis environment variables|vars and refresh print every value on CLIs
before 1.146.1 and behind --reveal from then on. The gate cannot see the
installed version, so both the bare command and --reveal ask, with a reason
that names the transcript as where the values land. --confirm-production is
never inserted; plan mode denies. environment list stays auto-allowed.

#### A warning when a tool result carries secret-looking values ([d22afe9](https://github.com/alis-build/claude-plugin/commit/d22afe9c2d6d74a43e9f99a67678a3c35aeee65f))

A PostToolUse pass over every tool result, in the module (classic.PostToolUse,
job token 'secrets') and as the shell fallback hooks/warn-secrets.sh. A hit
cannot be unprinted, so the person is told which kinds landed and that they
need rotating, and the model is told not to repeat them; the warning never
carries a value. Masked (••••), [REDACTED:kind] and names-only output stay
silent. The pattern table lives once in secrets.ts and once in
secrets-hook.py, in the same order, with shared test samples.

### Fixes

#### The Python gate skips --reveal like the port, and the primer says variables are names-only ([84f8f87](https://github.com/alis-build/claude-plugin/commit/84f8f87ebcce46b303f55c8b0a114a063a51e5c2))

--reveal was added to the TypeScript BOOLS set only, so
`alis operations --reveal describe …` was allowed by the module and
unanswered by the shell gate. Recorded that case (354 parity answers).
The primer told the model to run environment variables for values; since
CLI 1.146.1 that needs --reveal and a confirmation.

#### The secrets warning reads reveal output and tool inputs, counts once, and warns once ([6b2fd0d](https://github.com/alis-build/claude-plugin/commit/6b2fd0d4922b5e18dafcc39fa2635aac7e035df1))

Review fixes on the PostToolUse warning:
- the rows an alis environment variables|vars|refresh printed once revealed
  (JSON name/value pairs, NAME  value table rows, .env lines) count as
  'revealed', for that command only
- the call's own string arguments are scanned too (a written .env), and the
  Python twin scans list-shaped results like the port
- one value matching two patterns counts once; the assignment pattern only
  fires on UPPER_SNAKE names and skips *_NAME/_ID/_PATH/_URL/_FILE/_REF
- a value already warned about in the session stays quiet (hashes in memory
  for the module, under ~/.alis/claude-secrets-seen/&lt;session> for the shell)
- the module toast drops its 'alis:' prefix; handoff context is merged, not
  overwritten; a 1 MB scan cap; the shell hook greps for a trigger before
  starting Python; aws, google and slack samples; tag-guard cases

### Other

#### Secret guard (Bash gate on environment reveals, PostToolUse secrets warning) ([9411c7f](https://github.com/alis-build/claude-plugin/commit/9411c7f872eaed4ee75b34d0270308df0baef186))

## [0.28.0](https://github.com/alis-build/claude-plugin/compare/v0.27.2...v0.28.0) (2026-09-22)

### Features

#### Function-hooks module skeleton with the classic-hook handshake ([ed19e73](https://github.com/alis-build/claude-plugin/commit/ed19e73e97b2412bd284cb1d7978db25f447bbd7))

hooks/hooks.json names hooks/mod.ts (Claude Code early access, loaded only
where CLAUDE_CODE_ENABLE_FUNCTION_HOOKS is on; ignored by older builds, verified
on 2.1.250). The module tags every classic event with alis_module, the jobs it
serves; each shell hook exits when its own token is listed, so nothing runs
twice and a failing module hook falls back to the shell hook per dispatch.
No job is served by the module yet. Adds tsconfig for /plugin-types output,
TagGuardTests, and release-guard checks for the module path and version.

#### Pure TypeScript port of the alis CLI permission gate ([a330ba5](https://github.com/alis-build/claude-plugin/commit/a330ba558c4b44aab384d110f43bc6e14aa6762e))

hooks/mod/cli-gate.ts is decide() from cli-hook.py with the same tables and
order of checks; shell.ts carries the literal-argv scan plus shlex split and
join; classic-result.ts maps a decision, a printed hook envelope and a chain
result onto the classic PreToolUse shape. Not wired yet. tests/parity.test.ts
checks 312 recorded Python answers against the port.

#### The function-hooks module serves the alis CLI permission gate ([04c7d94](https://github.com/alis-build/claude-plugin/commit/04c7d9481a6829ed405c28fb1d63b62a928e5b91))

classic.PreToolUse receives the tool-call envelope, not the shell payload, so
the gate reads the Bash arguments from it, the permission mode from the last
classic event that carried one, and the session id from the engine. A field
added to that envelope would land inside the tool's arguments, so PreToolUse
is never tagged; the module keeps a per-session marker file instead
(~/.alis/claude-module-sessions/&lt;sid>, refreshed per prompt and tool result,
emptied at session end) which cli-hook.py and handoff.sh trust for an hour.
Every call on $ is spelled in hooks/mod.ts through a Host the hooks take,
as claude plugin validate requires.

#### The function-hooks module relays handoff lifecycle events ([c9a7e05](https://github.com/alis-build/claude-plugin/commit/c9a7e05544cb11d64aea1a1b9f003d3de057bc23))

The nine events handoff.sh covered are relayed to alis workstation handoff
_hook from the module's classic hook, with the same fail-closed answer when
the coordinator is unavailable and a claim exists, and a status line while a
claim is active. On PreToolUse the lifecycle fields come from the engine,
since that event carries only the tool-call envelope. Verified that the CLI's
parent walk still finds the claude process under $.process.run.

#### The function-hooks module serves skill discovery and adds /alis ([26ef94c](https://github.com/alis-build/claude-plugin/commit/26ef94c7de6ca79f78b5696a695079614cb75790))

prompt.submit asks alis skills suggest --hook with the same prefilter as
suggest-skills.sh and attaches its answer as context the model reads beside
the prompt. /alis status reports the CLI, workspace, module coverage and
handoff claim without a model turn; /alis handoff [alias] hands the session
to a workstation. The command's output row is drawn as a column of key:
value lines through ui.render.

#### Live line and summary rows for alis operations in Bash calls ([c3b7fea](https://github.com/alis-build/claude-plugin/commit/c3b7fea27839f59c3c372ee99ae6c63f96db090d))

While alis operations wait &lt;op> --json runs, a tool.call hook polls
alis operations describe every three seconds and keeps a notice under the
row (elapsed, state), cleared when the call resolves or is aborted. A
ui.render hook draws the result row of any streamed operation (define, build,
deploy, operations wait) as a summary of outcome, version, last progress,
warning and next command in place of the NDJSON progress lines; the stored
result is untouched. /alis status labels its time as UTC.

#### The live wait line also shows under a folded tool group holding the running call ([30577e2](https://github.com/alis-build/claude-plugin/commit/30577e2e0cd28f75a55ba0f860c80908d35a3ef5))

#### /alis ops opens an operations pane with Wait and Cancel buttons ([9727195](https://github.com/alis-build/claude-plugin/commit/97271957f6482d6e992a2418aa62be1090c9b854))

The pane lists the machine's running and recent operations from alis
operations list (running ones polled by the CLI), refreshed every five seconds
on the module's clock while open and drawn through ui.render on Pane; ui.close
stops the refresh. Buttons submit prompts for Claude rather than acting alone,
so the gate and the person's confirmation still apply.

#### A deploy confirmation dialog before alis deploy --confirm-production ([dd94de1](https://github.com/alis-build/claude-plugin/commit/dd94de11a23b427680b8f21f56d86b2566ef33a6))

A tool.call hook on Bash opens a focused pane (Abort holds the focus, Esc
aborts) showing the target, the version and each environment from alis
environment list with its production flag, and waits on $.clock.sleep so the
hook's budget is untouched. Approve runs the call and counts as the person's
confirmation for the permission gate on that tool_use_id, so the native
prompt does not ask a second time; Abort refuses the call. No dialog where
nothing draws (-p) or without the flag, which the CLI refuses on its own.

#### The module serves the primer, the service pointer and the skill catalog refresh ([049eea7](https://github.com/alis-build/claude-plugin/commit/049eea764d11b6f683f8d2c18419f31e9676718c))

The classic SessionStart dispatch answers with the same text load-primer.sh
and inject-service-context.sh printed, as additionalContext with the same
gating (workspace, CLI presence, resume/compact digest, ALIS_PRIMER), and
starts alis skills sync off the critical path on startup and clear,
recording its outcome for alis doctor. With the flag on no shell hook runs.

#### A skill suggestion band above the prompt with Load and Dismiss buttons ([d95e3cd](https://github.com/alis-build/claude-plugin/commit/d95e3cdcd20b5565d89b3f29295bae77fd58e802))

The CLI's per-prompt suggestion still reaches the model as context; the
band shows the same skills to the person with a Load button each (numbered
hotkeys once the band is focused) that hands Claude the alis skills load
command as a prompt, and a Dismiss. It clears on the next prompt and yields
to a survey.

#### An inverse alis badge and accent colours on everything the module draws, toasts for new suggestions and handoff claims ([686ac2b](https://github.com/alis-build/claude-plugin/commit/686ac2b79b76a712f1e9e98baf39f53241845981))

The band, the live wait line, the summary row and the running rows of the
operations pane lead with an inverse cyan alis badge; states colour green
(done), red (failed) or cyan (running). A suggestion and a handoff claim
also raise a toast, since the status line and the band are plain text the
engine styles and easy to miss.

#### The operations pane leads with an alis badge header and its running count ([222dfe0](https://github.com/alis-build/claude-plugin/commit/222dfe07240775878e7c362d2b85bd4af5a01c83))

#### A handoff pane with the safe-to-close signal, Cancel and Reclaim ([5190ece](https://github.com/alis-build/claude-plugin/commit/5190ecead08440b01ee7191233b959f3aa4cda97))

Opened by /alis handoff (which now passes --no-progress) and by any alis
workstation handoff start call Claude makes (a tool.call hook adds
--no-progress and reads the handoff id from the answer). Polls status every
two seconds, ten once the workstation has the session, toasts the moment it
is safe to close the laptop, and offers Cancel and Reclaim behind the
engine's confirmation dialog, run with --approve since prompts are blocked
in a claimed session.

#### The alis command rules ride in the Bash tool's description ([738c43c](https://github.com/alis-build/claude-plugin/commit/738c43c6374a03aa0c313dccbcd15dc909ef8db0))

A tool.describe hook appends the rules the gate hands out per call (one
standalone command, --cwd not cd &&, no pipes or head, stderr is progress,
operations wait not sleep loops, task id is not an operation id) to the Bash
description once per session, only where the alis CLI is on PATH, so the
model reads them before composing a command.

### Fixes

#### /alis rows read 'alis status' and 'alis handoff', not 'alis alis: …' ([8fc16ca](https://github.com/alis-build/claude-plugin/commit/8fc16caba02cdb23e56f6378b1760eb85ed78b26))

#### Draw the live wait line on the running tool row, not the permission dialog ([45f59c5](https://github.com/alis-build/claude-plugin/commit/45f59c5762fcca343d8986e76dd1b1e7086af4a3))

$.ui.notice shows a line under an open permission dialog only, so in auto
mode nothing appeared. The wait's state now lives in the module and a
ui.render hook on the running Bash ToolUse row draws it beneath the engine's
own row, redrawn every second through $.ui.invalidate; describe is polled
every third tick.

#### No hotkeys on the operations pane; a docked pane leaves the keyboard to the prompt ([55f6402](https://github.com/alis-build/claude-plugin/commit/55f640261c057ba7a4ac10ce8e4cf17a12479f55))

#### The health record names the plugin root from the engine; stale session markers are pruned ([bfe0c12](https://github.com/alis-build/claude-plugin/commit/bfe0c121916e6eabf6c1d0bde637b871b36f3f58))

$.plugin.root fills the record's root where the engine process has no
CLAUDE_PLUGIN_ROOT. At session start the module lists
~/.alis/claude-module-sessions, stats the session-shaped files and removes
those older than a day with one rm -f on the host, since $.fs cannot delete.

#### The deploy confirmation uses the engine's question dialog, not a pane ([4b8856a](https://github.com/alis-build/claude-plugin/commit/4b8856a9b510119e91b0b3845802c5fc8af79e28))

In the fullscreen layout every pane docks as a tab, focus is only a request
the composer may refuse, and Esc then interrupts the turn. $.ui.ask is a real
modal with numbered options, and its wait is a $ call. The question names the
target, version and each environment with its production flag; Approve
counts once for the permission gate, anything else refuses the call.

#### No doubled 'alis:' on toasts and the status line; a handoff that failed before stopping keeps Cancel to release the claim ([cd72e5f](https://github.com/alis-build/claude-plugin/commit/cd72e5fda5dae183ec5fa4d87ca833a7b37b8817))

#### The handoff pane opens from /alis handoff only; the skill path keeps the CLI popup ([2571662](https://github.com/alis-build/claude-plugin/commit/257166258f507585127e10d09fec79788dce5e31))

### Style

#### Alis brand colours for the badge and states (primary F02222, cyan 006383, green C5E4CE) ([866d169](https://github.com/alis-build/claude-plugin/commit/866d169179f1cc1de8e0c2a3261819b1fe2a98ba))

### Documentation

#### Function hooks (early access) section, development checks, version bump ([2132575](https://github.com/alis-build/claude-plugin/commit/21325757c6a91e383d959a2e6605eb163f403084))

#### Tested range starts at 2.1.211, the version the plugin requires ([c0ffd69](https://github.com/alis-build/claude-plugin/commit/c0ffd6993bcc530515f580876bef39842be88f7c))

## [0.27.2](https://github.com/alis-build/claude-plugin/compare/v0.27.1...v0.27.2) (2026-09-18)

### Fixes

#### Frontend-preview opens inside Claude Code through terminal-browser's plugin tool when present; Ghostty asks to close a quit split ([a39e63d](https://github.com/alis-build/claude-plugin/commit/a39e63d32c02125914ae9c398d4e56cdda03c2f7))

## [0.27.1](https://github.com/alis-build/claude-plugin/compare/v0.27.0...v0.27.1) (2026-09-17)

### Fixes

#### Frontend-preview names the Vite port step of alis preview's address order ([2c73df7](https://github.com/alis-build/claude-plugin/commit/2c73df76de3a111c61816de901a40f26e51dc9f9))

#### Frontend-preview passes on alis preview warnings (herdr older than 0.9.1) ([0b023c3](https://github.com/alis-build/claude-plugin/commit/0b023c322d5d4d5bb4ad8e156abdc4a4cbb1eb17))

#### Frontend-preview acts on snapshot refs within one batch call (refs do not survive between terminal-browser action calls) ([f9286ee](https://github.com/alis-build/claude-plugin/commit/f9286ee44d8844e58fb8cef32563b752a5488996))

#### Frontend-preview falls back to terminal-browser open on a CLI without alis preview ([1a3368d](https://github.com/alis-build/claude-plugin/commit/1a3368d8d0040e37e6e9c3b1fec323120d7e10b4))

#### Frontend-preview closes the preview only when asked, by tab close ([2ae8e99](https://github.com/alis-build/claude-plugin/commit/2ae8e994a322ac9078d34aa79e07bc51bcb79345))

## [0.27.0](https://github.com/alis-build/claude-plugin/compare/v0.26.0...v0.27.0) (2026-09-17)

### Features

#### Frontend-preview skill shows a service's page in terminal-browser ([566a75e](https://github.com/alis-build/claude-plugin/commit/566a75ecb74cbf703bcd9270b7550e2942742362))

The skill opens a service's web frontend beside Claude with `alis preview
--json`, drives it with `terminal-browser action` (snapshot, click, fill,
console, errors, screenshot) and always ends with `action done`. An element
the user sends from the browser (ctrl+g) is treated as the thing to change.
`--ssh alis-<org>-<id>` covers a dev server on a workstation; on a
workstation itself the result is the port's public address. It never
replaces the CLI for logs or operation status.

Needs the CLI release with `alis preview`.

## [0.26.0](https://github.com/alis-build/claude-plugin/compare/v0.25.1...v0.26.0) (2026-09-16)

### Features

#### Handoff hook runs without Python, skill hands off in one command ([1238cb5](https://github.com/alis-build/claude-plugin/commit/1238cb5930ba9ef59107d152fe58c029db8f9495))

- hooks/handoff.sh calls alis workstation handoff _hook directly (bash, ~13 ms
  instead of ~68 ms through python); without a CLI it still fences a claimed
  session, denying tools so Claude's Stop hook records the boundary.
- The handoff skill runs one command and ends its turn in one line; herdr
  users can press prefix+t instead.

## [0.25.1](https://github.com/alis-build/claude-plugin/compare/v0.25.0...v0.25.1) (2026-09-15)

### Fixes

#### Guide agents to read tickets and install packages ([4df4418](https://github.com/alis-build/claude-plugin/commit/4df4418622149484bce1c23b25b591166c5341cf))

Read referenced support tickets before proposing changes, use alis packages install for private package setup, and inspect complete command results. Include the guidance in every shipped primer variant and explain how to recover missing plugin guidance.

## [0.25.0](https://github.com/alis-build/claude-plugin/compare/v0.24.0...v0.25.0) (2026-09-15)

### Features

#### Add herdr continuation capabilities and lifecycle integration ([fa980fb](https://github.com/alis-build/claude-plugin/commit/fa980fb6d857d36432bcd0f1315497933e0cc117))

## [0.24.0](https://github.com/alis-build/claude-plugin/compare/v0.23.0...v0.24.0) (2026-09-14)

### Features

#### Add evaluation suite for `discover` skill and related cases ([3846b99](https://github.com/alis-build/claude-plugin/commit/3846b995ed2f4e3cf1601ca6e425fed3c12b2f57))

- Introduced a new evaluation suite for the `discover` skill, measuring uplift with and without plugins.
- Added multiple evaluation cases, including `01-pubsub-invoice`, `02-terraform-missing-var`, and `03-package-wont-resolve`, each with their own prompts and grading criteria.
- Implemented fixture scripts to set up the necessary environment for each case.
- Enhanced grading criteria to ensure no discovery narration occurs during evaluations.
- Updated README files to include instructions for running evaluations and details about the new cases.

This commit enhances the testing framework for the `discover` skill, ensuring robust evaluation and improved clarity in documentation.

#### Plugin renamed from alis-build to alis ([85a8d24](https://github.com/alis-build/claude-plugin/commit/85a8d242bfeafa0e69aadf88d24073b35bc78ef9))

Commands are now /alis:capture, /alis:discover and /alis:handoff. The plugin
directory keeps its plugins/alis-build path so every existing marketplace
registration (sparse-checked out on that path) keeps updating. Existing
installs of alis-build@alis must be uninstalled before installing alis@alis;
the alis CLI's setup and updates flows run that migration.

## [0.23.0](https://github.com/alis-build/claude-plugin/compare/v0.22.0...v0.23.0) (2026-09-12)

### Features

#### Workstation session handoff ([2cb12b5](https://github.com/alis-build/claude-plugin/commit/2cb12b52d2d74c642f58ccd5bee58cd12b9dacfe))

## [0.22.0](https://github.com/alis-build/claude-plugin/compare/v0.21.3...v0.22.0) (2026-09-12)

### Features

#### Reliable CLI execution and native approvals ([b22f623](https://github.com/alis-build/claude-plugin/commit/b22f623ad219c4b606129840153ed059bf614aab))

Parse standalone literal CLI arguments, preserve Bash options and bind
session identity to each invocation. Use native confirmation for guarded
actions and stop granting approval through a shared Claude mode record.

Bound native asynchronous catalog sync, record local hook health and honor
the full primer override. Teach invocation context, metadata-only target
discovery, operation JSON, logs and cancellation.

Isolate routing-evaluation stdin, score actual tool events and require all
30 cases. Add 11 behavioral tests and strengthen the release checks.

## [0.21.3](https://github.com/alis-build/claude-plugin/compare/v0.21.2...v0.21.3) (2026-09-09)

### Features

#### Capture teaches that code ships as a block, not as skill templates ([65c3af2](https://github.com/alis-build/claude-plugin/commit/65c3af21c77f588f526ccc77d0262df939de3af6))

The capture rubric now says: a buildable foundation (template tree,
Dockerfile, Terraform, server) is not a reference — publish it as a code
block (alis blocks create; skill in .skill/ → block-&lt;id>) and, for a skill
that must carry templates/, point agents at `alis skills apply` instead of
copying files one by one.

## [0.21.2](https://github.com/alis-build/claude-plugin/compare/v0.21.1...v0.21.2) (2026-09-04)

### Features

#### Prime agents that skills learn from feedback (feedback → alis skills improve) ([e3cfff4](https://github.com/alis-build/claude-plugin/commit/e3cfff4751e1062a0252bedcd9b7d9c93f6900cb))

## [0.21.1](https://github.com/alis-build/claude-plugin/compare/v0.21.0...v0.21.1) (2026-09-01)

### Features

#### Prime agents to cd into the new service's build folder ([d4c1e31](https://github.com/alis-build/claude-plugin/commit/d4c1e310671d30fda1bd335d81e24a23b5770139))

The working directory is the context: after `alis service new`, cd into the
buildFolder its result reports. Matches the CLI's new next/agent guidance in
the service-new result.

## [0.21.0](https://github.com/alis-build/claude-plugin/compare/v0.20.0...v0.21.0) (2026-08-31)

### Features

#### Gate the primer, add earned agent bullets, drop connect-google ([312006a](https://github.com/alis-build/claude-plugin/commit/312006a303ebd61d256f262d53bbe74606d3f2fb))

- load-primer.sh: full primer only inside alis.build workspaces, digest when
  the alis CLI is present elsewhere, nothing otherwise (ALIS_PRIMER override)
- primer trimmed ~1400→~950 words; three bullets earned from mined agent
  sessions: one-JSON-object stdout / operations wait not sleep / never
  hand-edit pins
- connect-google command, Google MCP nudge hook and docs removed entirely
- tests/release-guard.sh + CI: tagged releases can never ship placeholders
- hooks.json SessionStart groups consolidated; MCP-nudge jq fix obsolete

## [0.20.0](https://github.com/alis-build/claude-plugin/compare/v0.19.0...v0.20.0) (2026-08-31)

### Features

#### Prime agents to pull Ideate context by reference ([431cc83](https://github.com/alis-build/claude-plugin/commit/431cc8383612a1d00838a0197f114f71ba961d4a))

One bullet in the DBD primer routes any ideas/&lt;id> reference to
`alis ideate context <id>`; the operating detail lives in that command's
own help, keeping the plugin priming lightweight. Also realigns
marketplace.json with plugin.json (v0.19.0 missed the lockstep bump).

## [0.19.0](https://github.com/alis-build/claude-plugin/compare/v0.18.0...v0.19.0) (2026-08-19)

### Features

#### Quiet, local-first skill discovery ([bc1648f](https://github.com/alis-build/claude-plugin/commit/bc1648f6d616a06dfa8fba183b6112989f204f27))

- discover skill: workspace catch-all removed from description and
  when_to_use, explicit non-triggers added (Makefiles, generic bugs, tests,
  git, log reading — workspace presence alone is not a trigger); flow is now
  probe-first (`alis skills suggest --json`, ~40ms, no network) with a
  distinctive-score >= 3 rule, `preview` fit checks, and registry search
  reserved for explicit asks — silent on a miss, at most one probe per task.
- suggest-skills hook: wake phrases ("alis, …", "capture this as a skill")
  now work outside alis.build workspaces via a cheap lexical prefilter; the
  CLI's strict regexes still decide.
- primer (canonical): Skills section rewritten for local-first discovery;
  added the "Diagnose before re-running" block (alis operations / doctor /
  context view / ask / support) and the `.playground` hidden+gitignored rg
  gotcha; trimmed the preamble and two verbose bullets to pay for it.
  Digest updated to match.
- routing eval: "add caching to the search endpoint" flipped to no-fire —
  workspace presence is no longer a trigger.

Pairs with the alis CLI's new `distinctive` score component and ambient
confidence gate.

## [0.18.0](https://github.com/alis-build/claude-plugin/compare/v0.17.2...v0.18.0) (2026-08-14)

### Other

#### Primer reflects retired on-demand entries ([4184b8c](https://github.com/alis-build/claude-plugin/commit/4184b8cf2f18e693c9cdf670bae21f013afba223))

Skills load live from the registry when used; the session-start sync is
catalog-only and the CLI now removes retired sync-managed entries itself.

## [0.17.2](https://github.com/alis-build/claude-plugin/compare/v0.17.1...v0.17.2) (2026-08-12)

### Fixes

#### Keep automatic skill sync catalog-only ([ba6bd39](https://github.com/alis-build/claude-plugin/commit/ba6bd396fb390cd850bfa66c924b6d5db8838b55))

## [0.17.1](https://github.com/alis-build/claude-plugin/compare/v0.17.0...v0.17.1) (2026-08-11)

### Fixes

#### Suggest hook must fail open on older alis CLIs ([12ce2ba](https://github.com/alis-build/claude-plugin/commit/12ce2ba289cfb1c652638f80bc8fba693b620cbf))

exec propagated the CLI's exit code, so an installed alis without
'skills suggest --hook' made the UserPromptSubmit hook exit 1. Run the
CLI without exec and always exit 0 — discovery must never break a prompt.

## [0.17.0](https://github.com/alis-build/claude-plugin/compare/v0.16.0...v0.17.0) (2026-08-11)

### Features

#### Upgraded skills flow. ([47a2d24](https://github.com/alis-build/claude-plugin/commit/47a2d2481000e4d472f9da3316976f571432ac49))

## [0.16.0](https://github.com/alis-build/claude-plugin/compare/v0.15.0...v0.16.0) (2026-08-02)

### Features

#### Prime agents to commit and push before Build in DBD primer ([92c19b0](https://github.com/alis-build/claude-plugin/commit/92c19b06eeb95b1f517c3dae254414e8bc8f61e5))

## [0.15.0](https://github.com/alis-build/claude-plugin/compare/v0.14.0...v0.15.0) (2026-07-29)

### Features

#### Remove the Alis Build MCP; integrations run through the alis CLI ([32270af](https://github.com/alis-build/claude-plugin/commit/32270af6ce6b1784d89e79f8bda9e76f0d62fef4))

## [0.14.0](https://github.com/alis-build/claude-plugin/compare/v0.13.0...v0.14.0) (2026-07-29)

### Features

#### Steer agents to service-level protobuf packages in DBD primer ([80268c4](https://github.com/alis-build/claude-plugin/commit/80268c4c4a7e50bd1b41df5380fe7a84dcf31a28))

Add a Build-section rule to the primer: canonical Go import is
alis.build/&lt;org>/&lt;product>/&lt;service>/&lt;vN>; never copy the legacy
product-level *.services/protobuf/... style from neighboring services,
and offer dbd-migrate-to-neuron-protos when a service still uses it.

## [0.13.0](https://github.com/alis-build/claude-plugin/compare/v0.12.0...v0.13.0) (2026-07-28)

### Features

#### Add approval logic gates. ([5079497](https://github.com/alis-build/claude-plugin/commit/5079497f342c43b35f17211e6294699ff3c8e546))

## [0.12.0](https://github.com/alis-build/claude-plugin/compare/v0.11.0...v0.12.0) (2026-07-25)

### Features

#### Introduce skills command ([f17610c](https://github.com/alis-build/claude-plugin/commit/f17610c8f42aa583b154131762a0f956ea94f799))

## [0.11.0](https://github.com/alis-build/claude-plugin/compare/v0.10.0...v0.11.0) (2026-07-21)

### Features

#### Auth recovery: repair git credentials with 'alis authorise' ([f5a9d20](https://github.com/alis-build/claude-plugin/commit/f5a9d20ff8ecd9fcd9adf57d44197ebd052114c5))

## [0.10.0](https://github.com/alis-build/claude-plugin/compare/v0.9.0...v0.10.0) (2026-07-20)

### Features

#### Steer package management through 'alis packages' ([e79b8e7](https://github.com/alis-build/claude-plugin/commit/e79b8e7da22c51602300b1ae2972bb51999956dc))

Agents were hand-rolling GOPROXY/GONOSUMDB env for go mod tidy against the
private Alis registries and failing. The DBD primer now routes package
management through 'alis packages install|upgrade|add', which refreshes
registry credentials and runs the right package manager automatically.

## [0.9.0](https://github.com/alis-build/claude-plugin/compare/v0.8.0...v0.9.0) (2026-07-18)

### Features

#### Inject session_id into RunDefine/RunBuild/RunDeploy calls ([0c7e240](https://github.com/alis-build/claude-plugin/commit/0c7e240cab1eb43222c594da6e90b40a0b3fdf1b))

Widen the PreToolUse matcher so the session-id injection hook also covers
the Run* tools, letting the server link build-activity to the calling
session via Correlation.context.

#### Google Developer Knowledge MCP via /alis-build:connect-google ([b038dc9](https://github.com/alis-build/claude-plugin/commit/b038dc92b2515c2c3e319e94fffca7dd69c48a55))

Add a one-time setup command that connects Google's official docs-search
MCP server (developerknowledge.googleapis.com) at user scope with the
plugin's shared Desktop-app OAuth client, storing the client secret in
the OS keychain via claude mcp add --client-secret. The server is
deliberately not bundled in .mcp.json: a plugin entry cannot carry the
client secret Google's token endpoint requires, and Claude Code already
dedupes plugin servers by endpoint URL against user config.

- commands/connect-google.md: detect any existing server pointing at the
  endpoint (any name/scope) and skip; otherwise add, sign in, confirm.
  Client id/secret are placeholders for the maintainer to fill in.
- hooks/suggest-google-knowledge.sh (+ hooks.json SessionStart entry):
  cheap config-read nudge when the server is not connected; suppress
  with ALIS_SUPPRESS_GOOGLE_MCP_NUDGE=1.
- dbd-primer: prefer search_documents/get_documents/answer_query over
  web search for Google-tech documentation.
- README: user setup, duplicate behavior, testing-mode caveats, and
  maintainer GCP setup; drop the stale /alis-build:getting-started
  reference.
- Sync marketplace.json version (was stale at 0.7.2).

## [0.8.0](https://github.com/alis-build/claude-plugin/compare/v0.7.2...v0.8.0) (2026-07-09)

### Features

#### Point primer at alis docs, double-key gated CLI flags ([a6de029](https://github.com/alis-build/claude-plugin/commit/a6de0296d67604669eeee6ea796171eabbc45a03))

- Primer execution contract now defers to the CLI's embedded manual
  (alis docs output / exit-codes / safety) instead of restating it, and
  documents the production deploy gate: exit code 3 until re-run with
  --confirm-production, which requires the user's explicit approval.
- allow-alis-cli.sh no longer auto-approves commands containing
  --confirm-production or blocks uninstall --yes, so gated actions also
  surface Claude Code's permission prompt (double-keying).
- Organisation wording: the define repo belongs to the organisation
  (historically 'landing zone'); READMEs updated to match.

## [0.7.2](https://github.com/alis-build/claude-plugin/compare/v0.7.1...v0.7.2) (2026-07-04)

### Other

#### Remove getting-started primer guidance ([d9609e0](https://github.com/alis-build/claude-plugin/commit/d9609e02ee404c01d3e7efbb351d53d098431637))

## [0.7.1](https://github.com/alis-build/claude-plugin/compare/v0.7.0...v0.7.1) (2026-07-02)

### Documentation

#### Discourage proto reflection in dbd primer ([1cd7065](https://github.com/alis-build/claude-plugin/commit/1cd7065ade959bcf6f931c277d6fecffddf1e0e8))

## [0.7.0](https://github.com/alis-build/claude-plugin/compare/v0.6.0...v0.7.0) (2026-06-30)

### Features

#### Inject define⇄build service context at session start ([31b7793](https://github.com/alis-build/claude-plugin/commit/31b7793effbbf7863ac3335444858b1c13a9513e))

Detect ~/alis.build/&lt;org>/build|define service folders at session start and inject the package id plus a pointer to the definitions/implementation counterpart.

## [0.6.0](https://github.com/alis-build/claude-plugin/compare/v0.5.0...v0.6.0) (2026-06-29)

### Features

#### Gate skill discovery on the "alis" wake word ([730646a](https://github.com/alis-build/claude-plugin/commit/730646ad632455b5d632698e1018bdf8c99b7511))

SearchSkills now fires only when the developer addresses alis by name ("alis, ...", "hey alis", "ask alis to ...", or the explicit build-it/fix-it command). Removed the broad auto-fire triggers (add X / change Y / capability questions / bare functional asks) that were routing most prompts through SearchSkills. A bare "build it" with no "alis" runs the DBD Build step and no longer wakes discovery. Direct DBD commands and SpecIt are unchanged.

Bump alis-build to 0.6.0.

## [0.5.0](https://github.com/alis-build/claude-plugin/compare/v0.4.0...v0.5.0) (2026-06-28)

### Features

#### Always-load the DBD primer via SessionStart ([665e7b6](https://github.com/alis-build/claude-plugin/commit/665e7b68073238380f81d217cf6d7b18acb75557))

Replace the regex-gated UserPromptSubmit injection with a SessionStart
hook (load-primer.sh) that loads the primer into every session and
survives /compact. The primer now owns the full operating guide: the
DBD mental model, a route-vs-execute routing contract, and a CLI-first
execution contract (prefer `alis define/build/deploy --json`; MCP Run*
is the no-shell fallback). Delete the vocative-"alis" route hook.

Bump plugin and marketplace versions to 0.5.0 (marketplace was lagging
at 0.3.9).

## [0.4.0](https://github.com/alis-build/claude-plugin/compare/v0.3.9...v0.4.0) (2026-06-27)

### Features

#### Auto-approve the alis CLI via a PreToolUse hook ([d009e7e](https://github.com/alis-build/claude-plugin/commit/d009e7e6be84ad403e8e78c6d9b0503dfc9e05dd))

Ship a PreToolUse hook (matched on Bash) that returns
permissionDecision: "allow" for single, simple `alis <subcommand> ...`
invocations, so Claude Code runs the Alis CLI without a per-call
permission prompt. This is the plugin-native equivalent of a
settings.json allow rule, which is user/project-scoped and cannot be
shipped by a plugin.

## [0.3.9](https://github.com/alis-build/claude-plugin/compare/v0.3.8...v0.3.9) (2026-06-23)

### Features

#### Route capability questions toward a concrete request ([7a1d83f](https://github.com/alis-build/claude-plugin/commit/7a1d83f9113395d2e2ad6643658b1d600670f3da))

Add a bullet to the routing contract for capability questions ("can you
help with tracing?", "are you able to add X?"): briefly confirm it is Alis
Build work, then ask the user to state the specific change so it can be
routed through SearchSkills — rather than diving into the codebase or
giving a generic how-to before the concrete change is named.

## [0.3.8](https://github.com/alis-build/claude-plugin/compare/v0.3.5...v0.3.8) (2026-06-23)

### Fixes

#### Suppress sticky reminder on bare acknowledgements ([53a29a5](https://github.com/alis-build/claude-plugin/commit/53a29a565c82d3813ba14bb7168adf13e6b7a4cd))

After engaging Alis, follow-up turns whose entire text is just a
pleasantry ("thanks", "ok", "perfect, thanks", "yes") no longer emit the
routing reminder — they need no routing context. Implemented as a
blocklist of acknowledgements (matched against the whole prompt, allowing
sequences), so anything beyond a bare ack — including real requests like
"yes, do it" — still gets the reminder and is never missed.

### Performance

#### Terse routing reminder on follow-up turns ([3f414ab](https://github.com/alis-build/claude-plugin/commit/3f414abbb1ce78e2f7f244dbef5f58a7cbfd12fc))

After the engaging "alis" turn (which injects the full DBD primer + full
routing contract), follow-up turns re-emitted the entire ~250-word routing
block every turn. Keep the router live but cut the per-turn footprint to a
~57-word reminder; the full contract is still provided once on the "alis"
turn. ~90% less repeated context (and transcript noise) per follow-up.

### Refactoring

#### Revert to vocative-only injection ([09aa129](https://github.com/alis-build/claude-plugin/commit/09aa1292a56d575eae0a4ac58a2a6f97c8a99719))

Drop the sticky-session machinery (per-session marker, terse/full split,
pleasantry blocklist). Inject the DBD primer + routing contract ONLY when
the user addresses Alis (vocative "alis"); other turns inject nothing.
"alis" is the explicit trigger — say it in any request you want routed.

The one-shot injection now tells the model to keep using SearchSkills for
relevant build/fix work for the rest of the session, so the contract
carries forward through history without per-turn re-injection. Also
broaden the vocative match to trailing forms ("..., alis?", "... alis!"),
so "alis" is recognised anywhere in the prompt.

## [0.3.5](https://github.com/alis-build/claude-plugin/compare/v0.3.4...v0.3.5) (2026-06-23)

### Fixes

#### Make the routing contract sticky after the first "alis" ([1c5b5b8](https://github.com/alis-build/claude-plugin/commit/1c5b5b8d0bed544631b28590a20b4c90a34c2618))

Mirror the Codex/Gemini fix. Once the user addresses Alis, a per-session
marker keeps the routing contract re-injected on every following turn, so
naturally phrased build/fix/help follow-ups still route through
SearchSkills (primer still only on the "alis" turn). Bump 0.3.5.

## [0.3.4](https://github.com/alis-build/claude-plugin/compare/v0.3.3...v0.3.4) (2026-06-23)

### Refactoring

#### Move DBD primer to a vocative-"alis" UserPromptSubmit hook ([589fa89](https://github.com/alis-build/claude-plugin/commit/589fa8970b43f1d4400f73ab01f48c6bb89e00e8))

Stop loading the Define->Build->Deploy primer on every SessionStart (where
it sat in context for the whole session). A new UserPromptSubmit hook
injects the primer plus the routing contract only when the user addresses
Alis ("alis, ..."), keeping context lean. Claude Code already surfaces the
Alis MCP routing instructions, so the routing block is reinforcement with
a hard "do not edit code" directive, and now also covers "spec it" (direct
SpecIt call). Bare "build it" / "fix it" / "spec it" no longer re-trigger.

Remove the now-unused dbd-primer.sh; bump to 0.3.4. Aligns the Claude
plugin with the Codex, Gemini, and Cursor plugins.

## [0.3.3](https://github.com/alis-build/claude-plugin/compare/v0.3.2...v0.3.3) (2026-06-21)

### Fixes

#### Inject session_id for SpecIt tool calls ([66f8375](https://github.com/alis-build/claude-plugin/commit/66f8375a4bcf2f4279ec29f101bf543e39fdaa5a))

Widen the PreToolUse session_id-injection matcher to cover SpecIt in
addition to LoadSkill. Without this, SpecIt calls reach the MCP server
without a session_id and fail with FailedPrecondition (no active
session). Bump version 0.3.2 -> 0.3.3.

## [0.3.2](https://github.com/alis-build/claude-plugin/compare/v0.3.1...v0.3.2) (2026-06-21)

### Other

#### Split DBD primer from tool-call rules; bump 0.3.2 ([e996067](https://github.com/alis-build/claude-plugin/commit/e99606728b78f531a61dd126c1669075cf659d37))

Add a "How this fits with the tools" handoff note and move operational
specifics (commit selection, environment id) to concept level — the exact
tool-call rules live in the MCP server instructions (info.go). Bump version
since 0.3.1 is already released/tagged.

## [0.3.1](https://github.com/alis-build/claude-plugin/compare/v0.3.0...v0.3.1) (2026-06-15)

### Features

#### Add dynamic session context logic ([2102d3e](https://github.com/alis-build/claude-plugin/commit/2102d3e410858cd28a3c8ef8eb569075fce3bf2a))

## [0.3.0](https://github.com/alis-build/claude-plugin/compare/v0.2.0...v0.3.0) (2026-06-15)

### Features

#### Add dynamic context injection logic to optimise token use ([f84ed8d](https://github.com/alis-build/claude-plugin/commit/f84ed8ddf980038e900a34fdd2037cec6af9ecda))

## [0.2.0](https://github.com/alis-build/claude-plugin/compare/v0.1.9...v0.2.0) (2026-06-09)

### Features

#### Introduct 'build it' logic ([ceefe2f](https://github.com/alis-build/claude-plugin/commit/ceefe2f53400e7d1433824dc2ce31f6589c837e8))

## [0.1.9](https://github.com/alis-build/claude-plugin/compare/v0.1.8...v0.1.9) (2026-06-09)

### Other

#### Bump version ([4b8bec3](https://github.com/alis-build/claude-plugin/commit/4b8bec3f42f088a0d7e2578d8e37dca11b3f5db0))

## [0.1.8](https://github.com/alis-build/claude-plugin/compare/v0.1.7...v0.1.8) (2026-06-09)

### Other

#### Improved commands ([4d842a3](https://github.com/alis-build/claude-plugin/commit/4d842a3b793b49faa50ef9924961c40d3d0a8ae3))

## [0.1.7](https://github.com/alis-build/claude-plugin/compare/v0.1.6...v0.1.7) (2026-06-09)

### Features

#### Add alis build commands ([d77aaee](https://github.com/alis-build/claude-plugin/commit/d77aaeecf59663b2c11f1a36d7d736b0237d5185))

## [0.1.6](https://github.com/alis-build/claude-plugin/compare/v0.1.5...v0.1.6) (2026-06-02)

### Other

#### Update marketplace version ([b3dfbdf](https://github.com/alis-build/claude-plugin/commit/b3dfbdf2610fece9ec3bc83b0f0b7d5261b08dbe))

## [0.1.5](https://github.com/alis-build/claude-plugin/compare/v0.1.4...v0.1.5) (2026-06-02)

### Other

#### Setup dedicated oauth client. ([5edd7b5](https://github.com/alis-build/claude-plugin/commit/5edd7b59ebee3d6c66b75bc781ed09da4b200248))

## [0.1.4](https://github.com/alis-build/claude-plugin/compare/v0.1.3...v0.1.4) (2026-06-02)

### Documentation

#### Improved documentation ([e70a505](https://github.com/alis-build/claude-plugin/commit/e70a5053d2d5ca1e5b1995c9b407ce24570bf008))

## [0.1.3](https://github.com/alis-build/claude-plugin/compare/v0.1.2...v0.1.3) (2026-06-02)

### Other

#### Improved naming conventions. ([8f8d9d6](https://github.com/alis-build/claude-plugin/commit/8f8d9d6b07aa5881bdc7eb7e6ebd1c87de462fa2))

## [0.1.2](https://github.com/alis-build/claude-plugin/compare/v0.1.1...v0.1.2) (2026-06-02)

### Documentation

#### Improved docs ([fffe464](https://github.com/alis-build/claude-plugin/commit/fffe464f2e3e38b5e9ccf9be50fc28d025dd0b42))

## [0.1.1](https://github.com/alis-build/claude-plugin/compare/v0.1.0...v0.1.1) (2026-06-02)

### Documentation

#### Improved docs ([22eba2a](https://github.com/alis-build/claude-plugin/commit/22eba2af06efde6877fd863aff1982d43681805d))

## 0.1.0 (2026-06-02)

### Features

#### Initial setup of Alis Build Claude Code plugin ([9322a5f](https://github.com/alis-build/claude-plugin/commit/9322a5fd68a1fcc5507f8ff73ebcf369248a1e2e))

