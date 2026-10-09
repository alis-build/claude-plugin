# Security policy

## Reporting a vulnerability

**Please don't open a public issue for a security problem.** Report it
privately through GitHub instead:
[report a vulnerability](https://github.com/alis-build/claude-plugin/security/advisories/new).

Include what you found, the steps to reproduce it, and the plugin, Claude Code
and `alis` CLI versions you used. Leave out real secrets: a made-up value that
shows the problem is enough.

We'll acknowledge the report, keep you updated while we work on a fix, and
credit you in the advisory unless you'd rather not be named.

## Supported versions

Only the latest release of the plugin gets security fixes. Update with:

```sh
claude plugin marketplace update alis
```

## What counts

This repository is the Claude Code plugin. In scope:

- A way past the permission gate: a guarded `alis` action (`--confirm-production`,
  `--approve`, block uninstall, environment destroy or unset, `--reveal`) that
  runs without the confirmation it should get
- A secret that reaches the model, a toast or a warning when the plugin should
  have masked or withheld it
- A handoff claim, session marker or hook that another process can forge or
  abuse
- Anything the plugin ships that runs code or reads files it shouldn't

Out of scope here: the `alis` CLI, the Alis Build platform and Claude Code
itself. Report problems in those to their owners. A value you knowingly printed
with an approved `--reveal` is expected to reach Claude, as the README explains.
