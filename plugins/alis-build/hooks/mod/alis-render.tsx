/* @jsxRuntime classic */
/* @jsx h */
// Draws /alis's `key: value` lines as a column with dim keys. Anything that
// is not such a line means the text is not ours to draw: return null and the
// caller lets the engine draw its own row.
import type { Elements, RenderElement } from 'claude-code'

export type Kit = Pick<Elements['terminal'], 'Box' | 'Text'>

export function renderAlisOutput(kit: Kit, text: string): RenderElement | null {
  const { Box, Text } = kit
  const lines = text.split('\n')
  const rows = lines.map(line => {
    const at = line.indexOf(': ')
    return at === -1 ? null : { key: line.slice(0, at), value: line.slice(at + 2) }
  })
  if (rows.length === 0 || rows.some(row => row === null)) return null
  const [title, ...rest] = rows as { key: string; value: string }[]
  return (
    <Box flexDirection="column">
      <Box>
        <Text bold>{title!.key}</Text>
        <Text dimColor>{` ${title!.value}`}</Text>
      </Box>
      {rest.map((row, i) => (
        <Box key={String(i)}>
          <Text dimColor>{`${row.key}: `}</Text>
          <Text>{row.value}</Text>
        </Box>
      ))}
    </Box>
  )
}
