/* @jsxRuntime classic */
/* @jsx h */
// Draws alis operations in Bash rows (design: the live row). While the call
// runs, one line under the engine's own row: the mark, what is happening
// ("Building 2.44.19"), a bar that takes the width the line has spare, and
// the clock; under it one dim line with the step and what comes next. The
// Docker step and the operation are in a card on hover (desktop). Once the
// call ends, its result folds to one line: the outcome, the time and the
// logs, with the first error line under a failure. The stored result the
// model reads is untouched. A row that is not ours returns null and the
// caller lets the engine draw it.
import type { Elements, RenderElement, RenderSurface } from 'claude-code'

import { KEY, mark, type MarkKit, markCells } from './brand'
import { type LiveWait, snapshotsOf } from './ops-live'
import { type BashOutput, operationStateOf, progressEventsOf } from './ops'
import { elapsedMs, foldLineOf, type FoldLine, type LiveLine, liveLineOf, mergeView, type OpView, serviceOf, viewOf } from './ops-progress'

export type Kit = Pick<Elements['terminal'], 'Box' | 'Text' | 'Button' | 'Link'> & Pick<MarkKit, 'Svg' | 'Image'>

/** The bar's cells: never under this (or it is left out), never over that. */
const BAR_MIN = 8
const BAR_MAX = 64
/** The live row's indent under the engine's own row. */
const INDENT = 2

/** One line of heavy rules: done cells in the running key, the rest on the track. */
function bar(kit: Kit, fill: number, cells: number): RenderElement {
  const { Text } = kit
  const on = Math.max(0, Math.min(cells, Math.round(cells * fill)))
  return (
    <Text>
      <Text color={KEY.running}>{'━'.repeat(on)}</Text>
      <Text color={KEY.track}>{'━'.repeat(cells - on)}</Text>
    </Text>
  )
}

/** The bar's width: what the line has left after the mark, label and clock. */
export function barCells(columns: number, surface: RenderSurface, label: string, clock: string): number {
  const spare = columns - INDENT - markCells(surface) - 1 - label.length - 4 - clock.length - 2
  const cells = Math.min(BAR_MAX, spare)
  return cells < BAR_MIN ? 0 : cells
}

/** The live row's own tree: the mark, then a column of the two lines. */
export function liveRow(kit: Kit, surface: RenderSurface, line: LiveLine, columns: number): RenderElement {
  const { Box, Text } = kit
  const cells = line.fill === null ? 0 : barCells(columns, surface, line.label, line.clock)
  const detail = surface === 'desktop' ? line.detail : undefined
  return (
    <Box key="alis-live" flexDirection="row">
      <Box marginRight={1}>{mark(kit, surface)}</Box>
      <Box flexDirection="column" flexGrow={1} flexShrink={1}>
        <Box flexDirection="row">
          <Text wrap="truncate-end">{line.label}</Text>
          {line.note ? <Text color={KEY.quiet} wrap="truncate-end">{` · ${line.note}`}</Text> : null}
          {cells > 0 && line.fill !== null ? (
            <Box marginLeft={2} marginRight={2}>
              {bar(kit, line.fill, cells)}
            </Box>
          ) : null}
          <Box flexGrow={1} />
          <Text color={KEY.quiet}>{line.clock}</Text>
        </Box>
        {line.sub ? (
          <Text color={line.subTone === 'warning' ? KEY.warning : KEY.quiet} wrap="truncate-end">
            {line.sub}
          </Text>
        ) : null}
      </Box>
      {detail ? (
        <Box position="absolute" top={-4} left={3} display="none" hover={{ display: 'flex' }} flexDirection="column" borderStyle="round" borderColor={KEY.track} paddingX={1}>
          <Text>{detail.title}</Text>
          {detail.step ? <Text color={KEY.quiet}>{detail.step}</Text> : null}
          {detail.operation ? <Text color={KEY.quiet}>{detail.operation}</Text> : null}
        </Box>
      ) : null}
    </Box>
  )
}

/** The live line for a call, from what its watcher holds. */
export function lineOf(live: LiveWait, now: number): LiveLine {
  const line = liveLineOf(live.view, { service: serviceOf(live.target), operation: live.operation ?? undefined, startedAt: live.startedAt, now, verb: live.verb })
  // A CLI that streams only lean lines: its latest line stands in for the note.
  if (!live.view && live.progress && line.note) line.note = live.progress
  return line
}

/**
 * The engine's own row (a tool call, or the folded group holding it) with
 * the live row beneath it.
 */
export function renderOpsRunning(kit: Kit, rendered: RenderElement, live: LiveWait, now = Date.now(), surface: RenderSurface = 'terminal', columns = 80): RenderElement {
  const { Box } = kit
  return (
    <Box flexDirection="column">
      {rendered}
      <Box paddingLeft={INDENT}>{liveRow(kit, surface, lineOf(live, now), columns)}</Box>
    </Box>
  )
}

/** The live row alone, where the engine draws a background call's result. */
export function renderLiveRow(kit: Kit, live: LiveWait, now = Date.now(), surface: RenderSurface = 'terminal', columns = 80): RenderElement {
  return liveRow(kit, surface, lineOf(live, now), columns)
}

/** The engine's own row with one of ours beneath it. */
export function withRowBelow(kit: Kit, rendered: RenderElement, row: RenderElement): RenderElement {
  const { Box } = kit
  return (
    <Box flexDirection="column">
      {rendered}
      <Box paddingLeft={INDENT}>{row}</Box>
    </Box>
  )
}

export type FoldActions = { follow: () => void; cancel: () => void }

/** The folded row's tree. */
export function foldRow(kit: Kit, surface: RenderSurface, fold: FoldLine, actions?: FoldActions): RenderElement {
  const { Box, Text, Button, Link } = kit
  const sign = fold.tone === 'ok' ? <Text color={KEY.done}>{'✓ '}</Text> : fold.tone === 'error' ? <Text color={KEY.failed}>{'✕ '}</Text> : null
  return (
    <Box key="alis-fold" flexDirection="row">
      <Box marginRight={1}>{mark(kit, surface)}</Box>
      <Box flexDirection="column" flexGrow={1} flexShrink={1}>
        <Box flexDirection="row">
          {sign}
          <Text wrap="truncate-end">{fold.text}</Text>
          {fold.note ? <Text color={KEY.quiet} wrap="truncate-end">{` · ${fold.note}`}</Text> : null}
          <Box flexGrow={1} />
          {fold.time ? <Text color={KEY.quiet}>{fold.time}</Text> : null}
          {fold.logsUri ? (
            <Box marginLeft={2}>
              <Link href={fold.logsUri}>Logs</Link>
            </Box>
          ) : null}
        </Box>
        {fold.sub ? (
          <Text color={KEY.quiet} wrap="truncate-end">
            {fold.sub}
          </Text>
        ) : null}
        {actions && (fold.follow || fold.cancel) ? (
          <Box flexDirection="row" gap={1}>
            {fold.follow ? <Button key="alis-follow" label="Follow" variant="primary" onPress={actions.follow} /> : null}
            {fold.cancel ? <Button key="alis-cancel" label="Cancel build" onPress={actions.cancel} /> : null}
          </Box>
        ) : null}
      </Box>
    </Box>
  )
}

function parsed(text: string): unknown {
  const t = text.trim()
  if (!t.startsWith('{')) return undefined
  try {
    return JSON.parse(t)
  } catch {
    return undefined
  }
}

/** How long the operation's stages ran, start of the first to end of the last. */
function spanOf(view: OpView | undefined): number | undefined {
  const starts = view?.stages.map(s => s.startMs).filter((t): t is number => t !== undefined) ?? []
  const ends = view?.stages.map(s => s.endMs).filter((t): t is number => t !== undefined) ?? []
  return starts.length && ends.length ? Math.max(...ends) - Math.min(...starts) : undefined
}

/** An `--async` start: the operation is named and running, and Claude follows it next. */
function startedOf(result: unknown): FoldLine | null {
  const o = result && typeof result === 'object' ? (result as Record<string, unknown>) : undefined
  if (!o || o['done'] !== false || !('metadata' in o) || typeof o['name'] !== 'string' || !o['name'].startsWith('operations/')) return null
  const meta = o['metadata'] && typeof o['metadata'] === 'object' ? (o['metadata'] as Record<string, unknown>) : {}
  const type = typeof meta['@type'] === 'string' ? meta['@type'] : ''
  const verb = /Deploy/.test(type) && !/Build/.test(type) ? 'deploy' : /Define/.test(type) ? 'define' : 'build'
  const version = typeof o['version'] === 'string' ? o['version'] : undefined
  return foldLineOf({ outcome: 'running', verb, version })
}

/**
 * The folded line for a finished Bash call, from its output and what the
 * live row last saw; null when the call streamed no alis operation.
 */
export function foldOf(output: unknown, last: LiveWait | undefined, names: Record<string, string> = {}): FoldLine | null {
  const bash = output && typeof output === 'object' ? (output as BashOutput) : undefined
  const stderr = typeof bash?.stderr === 'string' ? bash.stderr : ''
  const stdout = typeof bash?.stdout === 'string' ? bash.stdout : ''
  const events = progressEventsOf(stderr)
  const streamed = snapshotsOf(stderr).at(-1)
  const result = parsed(stdout)
  if (events.length === 0 && streamed === undefined && !last) return startedOf(result)
  const state = operationStateOf(stdout) ?? last?.result ?? null
  const all = { ...last?.names, ...names }
  const finalView = result !== undefined ? (viewOf(result, all) ?? undefined) : undefined
  const seen: OpView | undefined = last?.view ?? (streamed !== undefined ? (viewOf(streamed, all) ?? undefined) : undefined)
  const view = finalView ? mergeView(finalView, seen) : seen
  const warning = [...events].reverse().find(e => e.warning)
  const interrupted = bash?.interrupted === true || (!state && !!last && !last.view?.done && events.length === 0)
  const failed = !!state?.error || !!view?.error || !!view?.stages.some(s => s.state === 'failed')
  const outcome = interrupted ? 'interrupted' : failed ? 'failed' : warning ? 'detached' : state?.done === false ? 'running' : 'done'
  const elapsed = elapsedMs(events.at(-1)?.elapsed) ?? spanOf(view) ?? (last?.endedAt !== undefined ? last.endedAt - last.startedAt : undefined)
  return foldLineOf({ view, outcome, elapsedMs: elapsed, version: last?.version ?? state?.version, verb: last?.verb })
}

export function renderOpsResult(kit: Kit, output: unknown, last?: LiveWait, surface: RenderSurface = 'terminal', actions?: FoldActions, names?: Record<string, string>): RenderElement | null {
  const fold = foldOf(output, last, names)
  return fold ? foldRow(kit, surface, fold, actions) : null
}
