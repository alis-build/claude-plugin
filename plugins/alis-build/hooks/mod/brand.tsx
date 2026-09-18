/* @jsxRuntime classic */
/* @jsx h */
// One look for everything the module draws: an inverse `alis` badge in the
// brand's primary colour at the head of a line, so a band, a live line or a
// summary row is spotted at a glance. The Alis Exchange brand colours:
// Primary F02222, Petrol 27323A, Cyan 006383, Green C5E4CE, L.Grey F0F0F0.
import type { Elements, RenderElement } from 'claude-code'

/** Primary: the badge, and anything that must be seen. */
export const ACCENT = '#F02222'
/** Brand cyan: a running state. */
export const RUNNING = '#006383'
/** Brand green: a finished state. */
export const OK = '#C5E4CE'
/** Failed or interrupted: the terminal's own red, distinct from the badge. */
export const DANGER = 'red'

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
