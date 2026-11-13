// The alis plugin's state contract: what its module keeps in $.state, so a
// reload of its code picks up where it was (hooks/mod/saved.ts). The engine
// reads this file on its own, so it imports nothing; the modules take these
// shapes from here.

/** One row of the operations pane (`alis operations list`). */
export type OperationRow = {
  name: string
  type: string
  target: string
  startedAt: string
  status: string | null
  next: string | null
  running: boolean
}

export type OpsPaneState = {
  isOpen: boolean
  rows: OperationRow[]
  refreshedAt: number | null
  error: string | null
  isRefreshing: boolean
}

/** One handoff as `alis workstation handoff … --json` reports it. */
export type HandoffState = {
  id: string
  target: string
  phase: string
  safeToClose: boolean
  error: string | null
  url: string | null
  reclaim: { phase?: string; error?: string; resumedIn?: string } | null
  next: string | null
}

export type HandoffPaneState = {
  isOpen: boolean
  state: HandoffState | null
  refreshedAt: number | null
  error: string | null
  busy: string | null
}

/** Hashes of reported values (never the values), and Bash calls left unmasked. */
export type SecretsMemo = { seen: string[]; masked: string[]; unmasked: string[] }

/**
 * One followed alis call: its tool call's id, and what its row draws from
 * (hooks/mod/ops-live.ts LiveWait, less the raw snapshot). Plain JSON here;
 * the module checks the fields it needs when it reads one back.
 */
export type SavedOp = { id: string; wait: { [field: string]: unknown } }

/** A Skill store skill this session used, and where its rating stands (hooks/mod/skills-used.ts). */
export type UsedSkill = {
  id: string
  /** Its display name in the catalogue. */
  name: string
  at: number
  /** The turn that used it has ended, so it may be rated. */
  turnDone: boolean
  /** The tool calls that loaded it; their rows are its row. */
  calls: string[]
  /** False once it was rated and has not changed since. */
  canRate: boolean
  rating?: 'up' | 'down'
  sending?: boolean
  failed?: boolean
}

export type SavedState = {
  secrets: SecretsMemo
  opsPane: OpsPaneState
  handoffPane: HandoffPaneState
  handoffStatusShown: boolean
  /** The calls being followed and the last ones that ended; absent in a snapshot an older version saved. */
  ops?: { live: SavedOp[]; finished: SavedOp[] }
  /** The Skill store skills used so far; absent in a snapshot an older version saved. */
  skills?: UsedSkill[]
}

declare module 'claude-code' {
  interface PluginState {
    alis: { session: SavedState }
  }
}
