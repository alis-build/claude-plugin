/* @jsxRuntime classic */
/* @jsx h */
// Draws alis operations in Bash rows: a live line under a running
// `operations wait` row (from ops-live.ts's state), and the result row of a
// finished streamed operation as a short summary instead of its NDJSON
// progress lines. The stored result the model reads is untouched. A row
// that is not ours returns null and the caller lets the engine draw it.
import type { RenderElement } from 'claude-code'

import type { Kit } from './alis-render'
import { ACCENT, badge, DANGER, OK } from './brand'
import { summaryLinesOf } from './ops'
import { elapsedOf, type LiveWait } from './ops-live'

/**
 * The engine's own row (a tool call, or the folded group holding it) with
 * the live line beneath it.
 */
export function renderOpsRunning(kit: Kit, rendered: RenderElement, live: LiveWait, now = Date.now()): RenderElement {
  const { Box, Text } = kit
  return (
    <Box flexDirection="column">
      {rendered}
      <Box paddingLeft={2}>
        {badge(kit)}
        <Text dimColor>{` waiting on ${live.operation} · ${elapsedOf(now - live.startedAt)} · `}</Text>
        <Text bold color={live.status.startsWith('failed') ? DANGER : live.status.startsWith('done') ? OK : ACCENT}>
          {live.status}
        </Text>
      </Box>
    </Box>
  )
}

export function renderOpsResult(kit: Kit, output: unknown): RenderElement | null {
  const lines = summaryLinesOf(output)
  if (!lines) return null
  const { Box, Text } = kit
  const [title, ...rest] = lines as [string, ...string[]]
  const failed = title.includes('failed') || title.includes('interrupted')
  return (
    <Box flexDirection="column">
      <Box>
        {badge(kit, failed ? DANGER : ACCENT)}
        <Text bold color={failed ? DANGER : OK}>
          {` ${title.replace(/^alis operation: /, '')}`}
        </Text>
      </Box>
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
