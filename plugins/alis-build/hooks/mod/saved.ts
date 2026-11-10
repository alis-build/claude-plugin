// The module's session state, kept in $.state so a reload of its code (a
// plugin update, /reload-plugins, a save while developing) picks up where
// it was instead of starting blank: which secrets were already reported,
// the two panes, the handoff claim flag and the operations being followed. Module
// variables stay the working copy; mod.ts writes this snapshot after each
// change (Host.save, and Host.invalidate) and reads it back at
// session.start, which the engine fires again after every reload.
//
// $.state lives as long as the session; nothing here outlasts it.
import type { SavedState } from '../../types'
import { handoffStatusShown, restoreHandoffStatus } from './handoff'
import { handoffPane } from './handoff-pane'
import { opsSnapshot, restoreOps } from './ops-live'
import { opsPane } from './ops-pane'
import { restoreSecrets, secretsMemo } from './secrets'

export function snapshot(): SavedState {
  return {
    secrets: secretsMemo(),
    opsPane: { ...opsPane },
    handoffPane: { ...handoffPane },
    handoffStatusShown: handoffStatusShown(),
    ops: opsSnapshot(),
  }
}

/** Puts a snapshot back into the working copy; nothing saved leaves it as loaded. */
export function restore(saved: SavedState | undefined): void {
  if (!saved) return
  restoreSecrets(saved.secrets)
  Object.assign(opsPane, saved.opsPane)
  Object.assign(handoffPane, saved.handoffPane)
  restoreHandoffStatus(saved.handoffStatusShown)
  // Absent in a snapshot an older version of this code saved.
  restoreOps(saved.ops)
}
