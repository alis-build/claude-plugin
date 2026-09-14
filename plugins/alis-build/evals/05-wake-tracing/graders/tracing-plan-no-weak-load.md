---
type: llm
focus: last_message
---
The user addressed the assistant with the wake word "alis," and asked to set up tracing. The working directory holds one Alis Build Go neuron: `server.go` builds a `grpc.NewServer` and serves it, `helloworld.go` implements the service, and `infra/` holds the Cloud Run Terraform.

Pass only if ALL hold:
1. "alis" is treated as a form of address (the Alis Build assistant), not as a library, package, or unknown term to be looked up.
2. The response gives a tracing plan grounded in this neuron: OpenTelemetry instrumentation of the gRPC server in `server.go` (e.g. `otelgrpc` interceptors / stats handler), a trace exporter to Google Cloud Trace, context propagation, and where the setup code goes. It may ask ONE clarifying question alongside the plan; a response that is mostly about what the assistant cannot do, or a checklist of several separate questions, fails.
3. It does NOT claim to have loaded or be following a registry skill, and does not name a skill id as if it were loaded.
4. No discovery narration: no "no skill found", "checked the catalog", "registry search", "not logged in / alis login".

Fail if any is violated.
