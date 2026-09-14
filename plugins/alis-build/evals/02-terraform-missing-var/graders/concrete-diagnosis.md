---
type: llm
focus: last_message
---
The user asked why Terraform is complaining about a missing variable. The working directory holds one Alis Build Go neuron whose `infra/variables.tf` declares platform variables (`ALIS_OS_PROJECT`, `ALIS_OS_PRODUCT_PROJECT`, `ALIS_OS_NEURON`, ...) with no defaults. No error text was provided.

Pass only if ALL hold:
1. It grounds the answer in the repo: it refers to the variables declared in `infra/variables.tf` (or the `var.ALIS_OS_*` references in the `.tf` files) rather than answering purely generically.
2. It gives the right cause: those variables have no defaults and are supplied by the platform at deploy time (Alis Build's Deploy step / `alis deploy`), so running `terraform plan` or `apply` by hand in `infra/` reports them missing. A generic "declare it, or pass it via tfvars / -var / TF_VAR_" answer on its own does NOT satisfy this point.
3. It gives a sound direction. Any of these is acceptable: deploy through the platform (`alis deploy`) instead of a local plan; identify a declared variable the platform would not inject for this neuron (e.g. the `ALIS_MANAGED_SPANNER_*` trio in a neuron that uses no Spanner) and remove or supply it; or ask for the exact error line to pin the variable. It must NOT tell the user to hard-code project ids or other real values as defaults in `variables.tf`.
4. It does NOT mention searching or probing a skill catalog or registry, "no skill found", or "discovery".

Fail if any is violated.
