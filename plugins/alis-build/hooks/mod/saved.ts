// The module's session state, kept in $.state so a reload of its code (a
// plugin update, /reload-plugins, a save while developing) picks up where
// it was instead of starting blank: which secrets were already reported,
// the suggestion band, the two panes and the handoff claim flag. Module
// variables stay the working copy; mod.ts writes this snapshot after each
// change (Host.save, and Host.invalidate) and reads it back at
// session.start, which the engine fires again after every reload.
//
// $.state lives as long as the session; nothing here outlasts it.
import type { SavedState } from '../../types'
import { handoffStatusShown, restoreHandoffStatus } from './handoff'
import { handoffPane } from './handoff-pane'
import { opsPane } from './ops-pane'
import { restoreSecrets, secretsMemo } from './secrets'
import { suggestBand } from './suggest-band'

export function snapshot(): SavedState {
  return {
    secrets: secretsMemo(),
    suggestions: suggestBand.items,
    opsPane: { ...opsPane },
    handoffPane: { ...handoffPane },
    handoffStatusShown: handoffStatusShown(),
  }
}

/** Puts a snapshot back into the working copy; nothing saved leaves it as loaded. */
export function restore(saved: SavedState | undefined): void {
  if (!saved) return
  restoreSecrets(saved.secrets)
  suggestBand.items = saved.suggestions
  Object.assign(opsPane, saved.opsPane)
  Object.assign(handoffPane, saved.handoffPane)
  restoreHandoffStatus(saved.handoffStatusShown)
}
