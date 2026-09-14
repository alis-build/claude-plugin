---
type: llm
focus: last_message
---
The user asked to migrate "this service" off legacy product-level proto imports. The working directory holds one Go neuron: `go.mod` (module `marvel.sm.helloworld.v1`) requires `internal.sm.marvel.build/protobuf`, and `helloworld.go` imports `internal.sm.marvel.build/protobuf/marvel/sm/helloworld/v1`. That is the legacy product-level package. The agent has no Write/Edit tools, so the deliverable is a precise plan.

Pass only if ALL hold:
1. It identifies the concrete legacy import: names `internal.sm.marvel.build/protobuf` (in `go.mod` and/or `helloworld.go`) as what has to go.
2. It states the target correctly: the per-neuron generated package for this neuron (an `alis.build/...` Go module for `marvel.sm.helloworld.v1`), with the import path and the `pb` alias updated in `helloworld.go`.
3. Package plumbing goes through the `alis` CLI: `alis packages upgrade` / `add` / `install` (or Define with `--install`) as the way to bring in the new module and drop the old requirement. It does NOT propose `sed`/hand-editing `go.mod` pins as the mechanism, and does not tell the user to `go get` the private module by hand.
4. It does NOT narrate skill discovery: no "no skill found", "checked the catalog", "registry search", "not logged in".

Fail if any is violated.
