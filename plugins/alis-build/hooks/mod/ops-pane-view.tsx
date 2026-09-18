/* @jsxRuntime classic */
/* @jsx h */
// Draws the operations pane: one line per operation with its buttons, a
// footer with the refresh time. Sized to the pane's body width. No hotkeys:
// a docked pane leaves the keyboard to the prompt, so its buttons are
// clicked (or the pane is toggled with /alis ops).
import type { Elements, RenderElement } from 'claude-code'

import { ACCENT, OK } from './brand'
import { agoOf, type OperationRow, type OpsPaneState, REFRESH_MS } from './ops-pane'

export type PaneKit = Pick<Elements['terminal'], 'Box' | 'Text' | 'Button' | 'Link'>

export type OpsPaneActions = {
  wait: (row: OperationRow) => void
  cancel: (row: OperationRow) => void
  refresh: () => void
  close: () => void
}

export function renderOpsPane(kit: PaneKit, state: OpsPaneState, actions: OpsPaneActions, bodyColumns: number, now = Date.now()): RenderElement {
  const { Box, Text, Button } = kit
  const wide = bodyColumns >= 70
  return (
    <Box flexDirection="column" key="alis-ops">
      {state.rows.length === 0 && !state.error ? (
        <Text dimColor>{state.refreshedAt ? 'No operations recorded on this machine.' : 'Loading…'}</Text>
      ) : null}
      {state.error ? <Text color="red">{`error: ${state.error}`}</Text> : null}
      {state.rows.map(row => (
        <Box key={row.name} flexDirection="column" marginBottom={wide ? 0 : 1}>
          <Box>
            <Text bold={row.running} color={row.running ? OK : undefined}>
              {row.running ? '● ' : '○ '}
            </Text>
            <Text bold={row.running} color={row.running ? ACCENT : undefined}>{`${row.type} ${row.target}`}</Text>
            <Text dimColor>{`  ${row.running ? (row.status ?? 'running') : 'done'} · ${agoOf(row.startedAt, now)}`}</Text>
          </Box>
          <Box paddingLeft={2}>
            <Text dimColor>{shortName(row.name, wide ? 44 : 20)}</Text>
            {row.running ? <Text> </Text> : null}
            {row.running ? <Button key={`wait:${row.name}`} label="Wait" onPress={() => actions.wait(row)} /> : null}
            {row.running ? <Text> </Text> : null}
            {row.running ? <Button key={`cancel:${row.name}`} label="Cancel" dimColor onPress={() => actions.cancel(row)} /> : null}
          </Box>
        </Box>
      ))}
      <Box marginTop={1}>
        <Button key="refresh" label="Refresh" onPress={actions.refresh} />
        <Text> </Text>
        <Button key="close" label="Close" onPress={actions.close} />
        <Text dimColor>
          {`  ${state.isRefreshing ? 'refreshing…' : state.refreshedAt ? `refreshed ${agoOf(new Date(state.refreshedAt).toISOString(), now)}` : ''} · every ${REFRESH_MS / 1000}s`}
        </Text>
      </Box>
    </Box>
  )
}

function shortName(name: string, max: number): string {
  return name.length <= max ? name : `${name.slice(0, max - 1)}…`
}
