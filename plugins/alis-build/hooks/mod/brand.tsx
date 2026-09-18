/* @jsxRuntime classic */
/* @jsx h */
// One look for everything the module draws: an inverse `alis` badge in the
// accent colour at the head of a line, so a band, a live line or a summary
// row is spotted at a glance. Named terminal colours follow the person's
// theme; keep to them rather than hex.
import type { Elements, RenderElement } from 'claude-code'

export const ACCENT = 'cyan'
export const DANGER = 'red'
export const OK = 'green'

type TextKit = Pick<Elements['terminal'], 'Text'>

/** The ` alis ` badge, inverse in the accent colour. */
export function badge(kit: TextKit, color: string = ACCENT): RenderElement {
  const { Text } = kit
  return (
    <Text bold inverse color={color}>
      {' alis '}
    </Text>
  )
}
