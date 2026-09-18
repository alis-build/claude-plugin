import type { AskOptions, FsEntry, FsStat, PaneOpenArgs, ProcessRunInit, ProcessRunResult, RenderSurface } from 'claude-code'

import type { Host } from '../../hooks/mod/host'

export type Run = { argv: readonly string[]; init?: ProcessRunInit }
export type Written = { path: string; text: string }

/** A Host answering from memory and recording what the hooks did to it. */
export type FakeHost = Host & {
  env: Record<string, string>
  session: string
  dir: string
  /** What `surface` answers. */
  drawn: RenderSurface | null
  /** What `ask` answers, or throws when given an Error. */
  askAnswer: string | Error
  asks: { question: string; options: AskOptions }[]
  /** Paths `exists` answers true for. */
  present: Set<string>
  /** What `list` answers per directory. */
  entries: Record<string, FsEntry[]>
  /** What `stat` answers per path; a missing path rejects. */
  stats: Record<string, FsStat>
  /** What `readFile` answers per path; a missing path rejects. */
  files: Record<string, string>
  statuses: (string | undefined)[]
  invalidations: number
  panes: { opened: PaneOpenArgs[]; closed: string[] }
  prompts: string[]
  /** Timers `every` registered, with their cancel state; call `fn` to tick. */
  timers: { ms: number; fn: () => void; cancelled: boolean }[]
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
    drawn: 'terminal',
    askAnswer: 'Abort',
    asks: [],
    present: new Set(overrides.present ?? []),
    entries: {},
    stats: {},
    files: {},
    statuses: [],
    invalidations: 0,
    panes: { opened: [], closed: [] },
    prompts: [],
    timers: [],
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
    root: async () => host.dir,
    surface: async () => host.drawn,
    ask: async (question, options) => {
      host.asks.push({ question, options })
      if (host.askAnswer instanceof Error) throw host.askAnswer
      return host.askAnswer
    },
    suggestAlways: async () => host.env['ALIS_SUGGEST_ALWAYS'],
    primerMode: async () => host.env['ALIS_PRIMER'],
    readFile: async path => {
      const text = host.files[path]
      if (text === undefined) throw new Error(`ENOENT ${path}`)
      return text
    },
    exists: async path => host.present.has(path) || path in host.entries || path in host.files,
    list: async path => {
      if (!(path in host.entries)) throw new Error(`ENOENT ${path}`)
      return host.entries[path] ?? []
    },
    stat: async path => {
      const stat = host.stats[path]
      if (!stat) throw new Error(`ENOENT ${path}`)
      return stat
    },
    status: text => {
      host.statuses.push(text)
    },
    invalidate: () => {
      host.invalidations += 1
    },
    openPane: async pane => {
      host.panes.opened.push(pane)
    },
    closePane: async id => {
      host.panes.closed.push(id)
    },
    submitPrompt: async text => {
      host.prompts.push(text)
    },
    every: (ms, fn) => {
      const timer = { ms, fn, cancelled: false }
      host.timers.push(timer)
      return () => {
        timer.cancelled = true
      }
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
