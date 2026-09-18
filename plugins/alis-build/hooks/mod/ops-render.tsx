/* @jsxRuntime classic */
/* @jsx h */
// Draws the result row of a Bash call that streamed an alis operation as a
// short summary instead of its NDJSON progress lines. The stored result the
// model reads is untouched. Returns null when the row is not ours.
import type { RenderElement } from 'claude-code'

import type { Kit } from './alis-render'
import { summaryLinesOf } from './ops'

export function renderOpsResult(kit: Kit, output: unknown): RenderElement | null {
  const lines = summaryLinesOf(output)
  if (!lines) return null
  const { Box, Text } = kit
  const [title, ...rest] = lines as [string, ...string[]]
  const failed = title.includes('failed') || title.includes('interrupted')
  return (
    <Box flexDirection="column">
      <Text bold color={failed ? 'red' : undefined}>
        {title}
      </Text>
      {rest.map((line, i) => {
        const at = line.indexOf(': ')
        return (
          <Box key={String(i)}>
            <Text dimColor>{`${line.slice(0, at)}: `}</Text>
            <Text>{line.slice(at + 2)}</Text>
          </Box>
        )
      })}
    </Box>
  )
}
