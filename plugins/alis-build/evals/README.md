# Eval suite: `alis:discover`

Measures **uplift** (Δ = with-plugin score minus without-plugin score) for the
`discover` skill: does it route platform-shaped asks to the right registry skill,
quietly, and stay out of the way on generic coding.

## Run

From `plugins/alis-build/`:

```sh
claude plugin eval . --ablation with-without --scaffold --judge-model sonnet --allow-tools "Bash(alis skills *)" -j 4 --no-publish
```

- `--scaffold` seeds cases 01-05 with the neuron fixture (see below).
- `--judge-model sonnet`: the judge must be a big model and not the agent model.
- `--allow-tools "Bash(alis skills *)"` grants the discover probe; the runner
  ignores the skill's own `allowed-tools` frontmatter.
- `-j 4` runs four agents at once (~20 min instead of ~65).
- `--no-publish` keeps the HTML report local; drop it to publish to claude.ai.
- `--runs 1` is a ~$6.50 spot-check; the full `runs: 3` suite is ~$19.50 (Sept 2026).

Results land in `evals/results/<timestamp>/` (`aggregate-result.json` and
`report.html`). The headline number is Δ (with-plugin score minus
without-plugin score).

## Fixture

Cases 01-05 run inside a copy of a real Go neuron, seeded by each case's
`fixture.sh` (needs `--scaffold`). It defaults to
`$HOME/alis.build/marvel/build/sm/helloworld/v1`; set `ALIS_EVAL_NEURON_DIR` to
any neuron folder with `go.mod`, `server.go` and `infra/`. Only the copy in the
sandbox is touched, never the source checkout.

## Preconditions

- The `alis` CLI on `PATH`. The sandbox runs with a fresh HOME, so inside a
  case the CLI has an **empty local catalog and no login**. Every fire case
  therefore exercises the quiet no-match path (probe once, say nothing, do the
  work). The load-and-follow path is NOT covered here; the repo's
  `tests/routing-eval.sh` covers routing against a real catalog.
- `~/.docker` must contain no symlinks inside it (the Bash sandbox refuses to
  start otherwise). Docker Desktop puts symlinks in `~/.docker/bin` and
  `~/.docker/cli-plugins`; quit Docker Desktop and move those two folders aside
  for the run, then move them back.
- `Bash(alis skills *)` must be granted explicitly. The runner does not honour
  the skill's own `allowed-tools` frontmatter.

## Cases

| case | shape | expects |
|---|---|---|
| 01-pubsub-invoice | platform task | DBD-shaped plan, no unprompted registry search, no narration |
| 02-terraform-missing-var | troubleshooting question, no hit | probe once, answer, no narration |
| 03-package-wont-resolve | troubleshooting, no hit | routes fix through `alis packages` |
| 04-legacy-proto-migrate | platform task, no hit | per-neuron packages via CLI, no narration |
| 05-wake-tracing | wake word, weak match | no weak-match load, plan or one question |
| 06-ask-for-skill | explicit skill ask | honest answer, offers `alis skills request` |
| 07-neg-unit-test | generic coding | discover must not fire |
| 08-neg-squash-commits | generic git | discover must not fire |

`06-ask-for-skill` may hit the real registry (read-only) via `alis skills search`.
