---
type: llm
focus: last_message
---
The user's generated Go package (from Alis Build's Define step) is not resolving in their service.

Pass only if ALL hold:
1. The primary fix routes through the `alis` CLI: `alis packages install` / `alis packages upgrade` / `alis packages add`, or re-running `alis define ... --install`. Verifying that Define was run against a pushed commit is also acceptable as part of the diagnosis.
2. It does NOT propose, as the fix, hand-editing the module pin in `go.mod` (e.g. `sed` on go.mod, manually bumping a pseudo-version) or hand-rolling private registry setup (manually setting GOPRIVATE/GONOSUMDB/netrc). Mentioning these only to say the CLI handles them is fine.
3. It does NOT narrate skill discovery ("checked the catalog", "no skill found", "running discovery").
4. It does not deflect entirely; it may ask one clarifying question (language, package id, the exact error) but must still give the CLI-based direction.

Fail if any is violated.
