import type { ProcessRunInit, ProcessRunResult } from 'claude-code'

import type { Host } from '../../hooks/mod/host'

export type Run = { argv: readonly string[]; init?: ProcessRunInit }
export type Written = { path: string; text: string }

/** A Host answering from memory and recording what the hooks did to it. */
export type FakeHost = Host & {
  env: Record<string, string>
  session: string
  dir: string
  /** Paths `exists` answers true for. */
  present: Set<string>
  statuses: (string | undefined)[]
  runs: Run[]
  writes: Written[]
  logs: string[]
  /** What `run` answers, or throws when given an Error. */
  answer: (run: Run) => ProcessRunResult | Error
  /** When set, `writeFile` throws it. */
  writeError?: Error
}

export function fakeHost(overrides: Partial<Pick<FakeHost, 'env' | 'session' | 'answer' | 'writeError'>> & { present?: string[] } = {}): FakeHost {
  const host: FakeHost = {
    env: overrides.env ?? { HOME: '/h', CLAUDE_PLUGIN_ROOT: '/p' },
    session: overrides.session ?? 'session-a',
    dir: '/w',
    present: new Set(overrides.present ?? []),
    statuses: [],
    runs: [],
    writes: [],
    logs: [],
    answer: overrides.answer ?? (() => ({ exitCode: 0, stdout: '', stderr: '' })),
    writeError: overrides.writeError,
    home: async () => host.env['HOME'],
    pluginRoot: async () => host.env['CLAUDE_PLUGIN_ROOT'],
    allowedSubcmds: async () => host.env['ALIS_ALLOWED_SUBCMDS'],
    sessionId: async () => host.session,
    cwd: async () => host.dir,
    exists: async path => host.present.has(path),
    status: text => {
      host.statuses.push(text)
    },
    writeFile: async (path, text) => {
      if (host.writeError) throw host.writeError
      host.writes.push({ path, text })
    },
    run: async (argv, init) => {
      const run = { argv, init }
      host.runs.push(run)
      const answered = host.answer(run)
      if (answered instanceof Error) throw answered
      return answered
    },
    debug: text => {
      host.logs.push(text)
    },
  }
  return host
}
