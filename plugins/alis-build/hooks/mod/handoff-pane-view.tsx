/* @jsxRuntime classic */
/* @jsx h */
// Draws the handoff pane: the target and phase, the one line that matters
// (safe to close, or keep the laptop open), the destination link, errors,
// and the buttons the current phase allows.
import type { RenderElement } from 'claude-code'

import { ACCENT, badge, DANGER, OK, RUNNING } from './brand'
import { type HandoffPaneState, TERMINAL_PHASES } from './handoff-pane'
import type { PaneKit } from './ops-pane-view'

export type HandoffPaneActions = { cancel: () => void; reclaim: () => void; refresh: () => void; close: () => void }

const FAILED = new Set(['failed', 'failed_before_stop', 'cancelled', 'unresponsive', 'interrupted'])

export function renderHandoffPane(kit: PaneKit, pane: HandoffPaneState, actions: HandoffPaneActions): RenderElement {
  const { Box, Text, Button, Link } = kit
  const s = pane.state
  const failed = s ? FAILED.has(s.phase) || Boolean(s.error) : false
  const settled = s ? TERMINAL_PHASES.has(s.phase) : false
  const canCancel = s !== null && !settled && !pane.busy
  const canReclaim = s !== null && (s.safeToClose || s.phase === 'completed' || s.phase === 'waiting_for_input') && s.phase !== 'reclaimed' && !pane.busy
  return (
    <Box flexDirection="column" key="alis-handoff">
      <Box marginBottom={1}>
        {badge(kit, failed ? DANGER : ACCENT)}
        <Text bold>{` handoff${s ? ` → ${s.target}` : ''}`}</Text>
      </Box>
      {s ? (
        <Box flexDirection="column">
          <Box>
            <Text dimColor>{'phase: '}</Text>
            <Text bold color={failed ? DANGER : s.phase === 'reclaimed' || s.phase === 'completed' ? OK : RUNNING}>
              {pane.busy ? `${pane.busy}…` : s.phase.replaceAll('_', ' ')}
            </Text>
          </Box>
          <Box marginTop={1}>
            {s.phase === 'reclaimed' ? (
              <Text bold color={OK}>{`Brought back to this laptop${s.reclaim?.resumedIn ? `: ${s.reclaim.resumedIn}` : ''}`}</Text>
            ) : s.safeToClose ? (
              <Text bold color={OK}>Safe to close the laptop. Your session is on the workstation.</Text>
            ) : settled ? (
              <Text bold color={failed ? DANGER : undefined}>{`Handoff ${s.phase.replaceAll('_', ' ')}.`}</Text>
            ) : (
              <Text bold color={ACCENT}>Keep the laptop open until the workstation acknowledges the handoff.</Text>
            )}
          </Box>
          {s.error ? <Text color={DANGER}>{`error: ${s.error}`}</Text> : null}
          {s.reclaim?.error ? <Text color={DANGER}>{`reclaim stopped at ${s.reclaim.phase ?? '?'}: ${s.reclaim.error}`}</Text> : null}
          {s.url ? (
            <Box>
              <Text dimColor>{'workstation: '}</Text>
              <Link href={s.url} label={s.url} />
            </Box>
          ) : null}
          <Box>
            <Text dimColor>{`id: ${s.id}`}</Text>
          </Box>
        </Box>
      ) : (
        <Text dimColor>Loading…</Text>
      )}
      {pane.error ? <Text color={DANGER}>{`status: ${pane.error}`}</Text> : null}
      <Box marginTop={1}>
        {canCancel ? <Button key="cancel" label="Cancel handoff" dimColor onPress={actions.cancel} /> : null}
        {canCancel ? <Text> </Text> : null}
        {canReclaim ? <Button key="reclaim" label="Reclaim" onPress={actions.reclaim} /> : null}
        {canReclaim ? <Text> </Text> : null}
        <Button key="refresh" label="Refresh" onPress={actions.refresh} />
        <Text> </Text>
        <Button key="close" label="Close" onPress={actions.close} />
      </Box>
    </Box>
  )
}
