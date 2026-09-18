// The alis command rules in the Bash tool's own description, read by the
// model once before it composes any command, where the per-call note from
// the gate (cli-gate.ts GUIDANCE) only arrives after a bad one. Appended
// only where the alis CLI is on PATH, and stable for the session so the
// rendered schema stays cached.
import { cliPathOf } from './health'
import type { Host } from './host'

export const BASH_GUIDANCE = [
  '',
  'Alis Build (alis CLI on this machine): run one standalone `alis …` command per',
  'call and read its complete JSON result (`--json`). Use `alis --cwd /absolute/path …`',
  'instead of `cd … &&`. Never pipe, `head`, `tail`, redirect or `2>&1` an alis',
  'command: stdout is one JSON object, stderr is progress. Do not poll with sleep',
  'loops; block with `alis operations wait <op> --json`. A Claude background-task',
  'id is not an Alis operation id.',
].join('\n')

/** The Bash description with the alis rules appended, or as received without the CLI. */
export async function describeBash(host: Host, description: string): Promise<string> {
  if (description.includes(BASH_GUIDANCE)) return description
  const cli = await cliPathOf(host).catch(() => '')
  return cli ? description + '\n' + BASH_GUIDANCE : description
}
