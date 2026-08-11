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
self-documenting: `alis docs` and `alis <cmd> --help` are the source of truth. Never
hand-roll package-manager environments — `alis packages` handles the private registries
and credentials for you.

## Skills are native

The `alis-build:discover` skill finds and loads registry skills from the user's own words —
no wake word; a loaded skill owns execution. After solving something new by hand, the user
can say "capture this as a skill" and `alis-build:capture` saves it for their team.

Production changes need explicit confirmation: a production deploy exits with code 3 until
re-run with `--confirm-production`, and that flag requires the user's explicit approval —
never add it yourself.
