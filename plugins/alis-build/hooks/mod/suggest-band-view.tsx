/* @jsxRuntime classic */
/* @jsx h */
// Draws the suggestion band: one line per suggested skill with its Load
// button and description, and a Dismiss button. Hotkeys arm once the band
// has the focus (a click, or ctrl+x tab).
import type { RenderElement } from 'claude-code'

import { badge } from './brand'
import type { PaneKit } from './ops-pane-view'
import type { Suggestion } from './suggest-band'

export type SuggestBandActions = { load: (id: string) => void; dismiss: () => void }

export function renderSuggestBand(kit: PaneKit, items: Suggestion[], actions: SuggestBandActions, bodyColumns: number): RenderElement {
  const { Box, Text, Button } = kit
  const room = Math.max(20, bodyColumns - 30)
  return (
    <Box flexDirection="column" key="alis-suggest">
      <Box>
        {badge(kit)}
        <Text bold>{` possibly relevant skill${items.length > 1 ? 's' : ''}  `}</Text>
        <Button key="dismiss" label="Dismiss" hotkey="x" dimColor onPress={actions.dismiss} />
      </Box>
      {items.map((item, i) => (
        <Box key={item.id}>
          <Button key={`load:${item.id}`} label={`Load ${item.id}`} hotkey={String(i + 1)} onPress={() => actions.load(item.id)} />
          <Text dimColor wrap="truncate-end">{`  ${item.description.slice(0, room)}`}</Text>
        </Box>
      ))}
    </Box>
  )
}
