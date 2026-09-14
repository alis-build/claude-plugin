---
type: llm
focus: last_message
---
The user asked for a Pub/Sub topic that fires when an invoice is created, on the Alis Build platform. The working directory holds one Go neuron (module `marvel.sm.helloworld.v1`, with `server.go`, `go.mod` and `infra/`). It has no invoice resource.

Pass only if ALL of these hold:
1. The plan is Alis Build shaped: the event is declared on the protobuf contract in the org's define repo and the topic is produced by Define (`alis define ... --install`) as a platform artifact, and the consuming side is a neuron-side Pub/Sub event handler (Cloud Run push endpoint, Terraform under `infra/`). Naming a `<neuron-id>-events` service, `/HandleEvent`, or `infra/events.tf` is a plus, not required.
2. It does NOT propose raw `gcloud pubsub topics create` / generic Terraform for a standalone topic plus a hand-written subscriber as the primary plan, and does not ask "which cloud / which message broker".
3. It notices the current neuron is `helloworld` and has no invoice resource, and either asks one targeted question (which neuron owns invoices / where the invoice contract lives in the define repo) or plans the handler for this neuron explicitly. Either is fine if framed by the plan in 1.
4. It does NOT narrate skill discovery or its failures: no "no skill found", "probed the catalog", "registry search failed", "not logged in / run alis login". If a skill was loaded it is mentioned in at most one short clause.

Fail if any of 1-4 is violated.
