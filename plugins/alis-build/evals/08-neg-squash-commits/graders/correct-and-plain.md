---
type: llm
focus: last_message
---
The user asked to squash the last three commits into one. No repository is present, so the assistant cannot run it; a correct instruction is the deliverable.

Pass only if ALL hold:
1. It gives a correct method: `git rebase -i HEAD~3` (marking the later two as `squash`/`fixup`), or the non-interactive `git reset --soft HEAD~3 && git commit`. Either alone is enough.
2. It warns that this rewrites history, i.e. it cautions about commits that are already pushed or shared. Mentioning `--force-with-lease` is a plus, not required.
3. It does not claim to have performed the squash.
4. The response contains NO mention of Alis Build, skills, skill discovery, catalogs, or registries.

Fail if any is violated.
