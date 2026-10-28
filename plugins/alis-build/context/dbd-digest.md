# Alis Build — DBD refresher

Read referenced conversations before proposing changes:
`alis specialist get tickets/ID --json`. Given only a title, use
`alis specialist tickets --state all --json`, match it, then get the ID. Ask
which conversation if several match, or ask for the ID if none match. `support` is an
alias; `list` lists people. Specialists may use `tickets --inbox --json` for a
staff-inbox reference. Read full results and distinguish access errors from
missing commands; an empty filtered help search proves neither.

Define, Build, Deploy. Protobuf contracts live in the build environment's define repo
(`~/alis.build/<org>/define`); Define pins the contract to a pushed commit and generates
language packages plus platform artifacts (Spanner protobundles, Pub/Sub topics). Go
services live in product build repos (`~/alis.build/<org>/build/<product>`);
Build runs from the latest *pushed* commit — commit and push before building. Deploy
provisions the runtime (Cloud Run plus supporting resources) from the service's Terraform
under `infra/`; validate via the generated playground.

## Execute through the `alis` CLI

`alis define <pkg> --json --install` · `alis build <pkg> --json --deploy -e <env>` ·
`alis deploy <pkg> --json` · `alis packages install|upgrade|add <pkg> --json`. The CLI is
self-documenting: `alis docs` and `alis <cmd> --help` are the source of truth. Under
`--json`, stdout is ONE final JSON object; progress is NDJSON on stderr — never merge
`2>&1` into a JSON parser. Never poll with `sleep` loops: block with
`alis operations wait <op> --json`. Never hand-edit dependency pins (`sed` on go.mod) or
hand-roll package-manager environments — `alis packages` handles the private registries
and credentials for you. The working directory is the context — after `alis service new`,
use `alis --cwd /absolute/buildFolder ...` before continuing. When a conversation
references an Ideate project (`ideas/<id>`), run `alis ideate context <id>` first. Sharing an
HTML page, report or file as a link is `alis artifacts create <folder> --title …
--publish [--password-file <f> | --emails …] --json` (private, versioned, branded;
bundle assets locally), not a Cloud Run deployment — see `alis docs artifacts`.

If a local build cannot download private Alis packages, first run
`alis packages install <pkg> --language go --json` (select the relevant language).
Do not reconstruct registry settings from Dockerfiles or shell history. Install
can tidy manifests and lockfiles and fetches the service's latest definition;
use `--version <version>` when intentionally preserving a specific definition
version. Inspect any remaining error before further recovery; never bypass TLS.

## Skills are native

The `alis:discover` skill routes platform-shaped work to registry skills — quietly and
local-first: probe `alis skills suggest "<outcome>" --json`; load only on a distinctive
match (`distinctive` ≥ 3); no match means no skill and no narration. Generic coding
(Makefiles, ordinary bugs, tests, git) needs no discovery even inside a workspace. A loaded
skill owns execution. After solving something new by hand, the user can say "capture this
as a skill" and `alis:capture` saves it for their team.

Production changes need explicit confirmation: a production deploy exits with code 3 until
re-run with `--confirm-production`, and that flag requires the user's explicit approval —
never invent it; the plugin asks the user before it runs (and before an uninstall,
environment destroy/unset or `--reveal`), in its own dialog in every mode. No extra chat question
is needed first. On `APPROVAL_REQUIRED` (manual tier), re-run with `--approve` only when the
user explicitly asked for that action on that target; when it was only implied, ask in chat
first. When the plugin knows the tier is manual it asks the user itself and adds `--approve`,
so run DBD commands without it. Session modes grant nothing, and a refusal means stop.

Run one standalone Alis command per Bash call: no pipes, output trimming or redirects.
Read help in full too; check the relevant subcommand's `--help` before concluding
that a capability is missing.
Use `environment list <org>.<product> --json` for target IDs and production flags,
without variable values. Check CLI help when using a newly introduced command.
Start long DBD work with `--async`; retain `name` and run `next`. The exception is
`define --install`, which waits (the CLI rejects it with `--async`). Start/wait/describe
use common top-level fields (`schemaVersion: 1`, `done`, `status`, `version`); legacy
start `metadata` is different from typed wait output. Read full JSON and errors. A
deployment's `state` `RUNNING` means up and serving (the state after a successful
deploy), not a deploy in progress; `done: true` with `status: succeeded` is finished.
Claude background-task IDs are separate from Alis operation names; stopping a local
wait never cancels server work. Use logs and build cancellation with a matching
CLI/backend release. Diagnose auth, package DNS and platform failures separately.
Direct DBD commands on a known target need no skill discovery. After a plugin update,
use `/reload-plugins`; `alis doctor --json` reports cache and recent hook observations.

## Ideate artifacts and service releases

Use `alis ideate context <project>` to find a project's artifacts, then
`alis ideate artifacts read <artifact> --project <project>` to read one.
The reader supports `--path`, `--start-line`, `--end-line` and `--version`.
`alis ideate artifacts list` lists metadata; `alis ideate artifacts get` reads
settings. Use `alis interviews` for interviews.

Use `alis deploy` to deploy to a deployment environment. `alis service release`
offers a service to other build environments. The hidden `alis release` still
means deploy; its production checks are unchanged. `ideate output-artifact`,
`ideate output-artifacts`, `ideate sessions` and `ideate session` remain callable
for compatibility. Prefer the current names above; check `--help` on older CLIs.
