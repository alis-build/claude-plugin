# Alis Build — DBD refresher

Define, Build, Deploy. Protobuf contracts live in the org's define repo
(`~/alis.build/<org>/define`); Define pins the contract to a pushed commit and generates
language packages plus platform artifacts (Spanner protobundles, Pub/Sub topics). Go
services (neurons) live in product build repos (`~/alis.build/<org>/build/<product>`);
Build runs from the latest *pushed* commit — commit and push before building. Deploy
provisions the runtime (Cloud Run plus supporting resources) from the neuron's Terraform
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
references an Ideate project (`ideas/<id>`), run `alis ideate context <id>` first.

## Skills are native

The `alis:discover` skill routes platform-shaped work to registry skills — quietly and
local-first: probe `alis skills suggest "<outcome>" --json`; load only on a distinctive
match (`distinctive` ≥ 3); no match means no skill and no narration. Generic coding
(Makefiles, ordinary bugs, tests, git) needs no discovery even inside a workspace. A loaded
skill owns execution. After solving something new by hand, the user can say "capture this
as a skill" and `alis:capture` saves it for their team.

Production changes need explicit confirmation: a production deploy exits with code 3 until
re-run with `--confirm-production`, and that flag requires the user's explicit approval —
never invent it. Present the CLI's exact pinned retry through native permission
confirmation; no extra chat question is needed first. Session modes grant nothing.

Run one standalone Alis command per Bash call: no pipes, output trimming or redirects.
Use `environment list <org>.<product> --json` for target IDs and production flags,
without variable values. Check CLI help when using a newly introduced command.
Start long DBD work with `--async`; retain `name` and run `next`. Start/wait/describe
use common top-level fields (`schemaVersion: 1`, `done`, `status`, `version`); legacy
start `metadata` is different from typed wait output. Read full JSON and errors.
Claude background-task IDs are separate from Alis operation names; stopping a local
wait never cancels server work. Use logs and build cancellation with a matching
CLI/backend release. Diagnose auth, package DNS and platform failures separately.
Direct DBD commands on a known target need no skill discovery. After a plugin update,
use `/reload-plugins`; `alis doctor --json` reports cache and recent hook observations.
