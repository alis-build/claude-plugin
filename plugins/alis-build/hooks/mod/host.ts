// What the module's hooks need from the world, as plain functions. `$` is
// never handed across an import: `claude plugin validate` follows `$` only
// within the file a hook receives it in, and `$.env.get` takes literal
// names, so hooks/mod.ts spells every `$.noun.call` once in hostOf() and
// the files under hooks/mod/ take this interface. Tests pass a fake.
import type { AskOptions, FsEntry, FsStat, PaneOpenArgs, ProcessRunInit, ProcessRunResult, RenderSurface } from 'claude-code'

export type Host = {
  /** $HOME, or undefined when unset. */
  home: () => Promise<string | undefined>
  /** The plugin's directory (the one holding plugin.json), absolute. */
  pluginRoot: () => Promise<string | undefined>
  /** ALIS_ALLOWED_SUBCMDS, or undefined. */
  allowedSubcmds: () => Promise<string | undefined>
  /** The session's id, the transcript file's name. */
  sessionId: () => Promise<string>
  /** The directory the session runs in, absolute. */
  cwd: () => Promise<string>
  /** The session's project root, absolute. */
  root: () => Promise<string>
  /** Where the session draws, or null where nothing draws (a -p run). */
  surface: () => Promise<RenderSurface | null>
  /** Asks the person in the engine's own dialog; resolves to the label chosen, rejects when dismissed or with no one to ask. */
  ask: (question: string, options: AskOptions) => Promise<string>
  /** ALIS_SUGGEST_ALWAYS, or undefined. */
  suggestAlways: () => Promise<string | undefined>
  /** ALIS_PRIMER (full | digest | off), or undefined. */
  primerMode: () => Promise<string | undefined>
  /** Reads a text file; rejects when missing. */
  readFile: (path: string) => Promise<string>
  /** Whether a path exists; never rejects. */
  exists: (path: string) => Promise<boolean>
  /** A directory's entries by name; rejects when missing. */
  list: (path: string) => Promise<readonly FsEntry[]>
  /** A path's kind, size and mtime; rejects when missing. */
  stat: (path: string) => Promise<FsStat>
  /** Sets or clears (undefined) this plugin's line in the status area. */
  status: (text: string | undefined) => void
  /** Shows a line on the notification bar for a few seconds. */
  toast: (text: string) => void
  /** Asks the engine to draw this plugin's render hooks again. */
  invalidate: () => void
  /** Opens (or retitles) one of this plugin's panes. */
  openPane: (pane: PaneOpenArgs) => Promise<void>
  /** Closes one of this plugin's panes; an id that is not open is left alone. */
  closePane: (id: string) => Promise<void>
  /** Hands the session a prompt, run once it is idle. */
  submitPrompt: (text: string) => Promise<unknown>
  /** Runs `fn` every `ms` until the returned function is called. */
  every: (ms: number, fn: () => void) => () => void
  /** Writes a text file, creating directories as needed. */
  writeFile: (path: string, text: string) => Promise<void>
  /** Runs a host command by argv; rejects on timeout or a missing binary. */
  run: (argv: readonly string[], init?: ProcessRunInit) => Promise<ProcessRunResult>
  /** A line for the debug log, led by the plugin's name. */
  debug: (text: string) => void
}
