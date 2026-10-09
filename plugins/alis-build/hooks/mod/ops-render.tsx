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

/** One line of heavy rules (terminal): done cells in the running key, the rest on the track. */
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

/**
 * The desktop's bar: a thin rounded track as SVG at a set width, so it never
 * wraps the way a run of rule characters does in the desktop's own font, and
 * its cyan does not hang on how the desktop maps a theme key. The cyan is
 * Claude Code's light-theme running colour, which holds on both grounds.
 */
export const BAR_FILL = '#009999'
const BAR_TRACK = '#8a8a8a'
const BAR_PX_MIN = 96
const BAR_PX_MAX = 320
/** CSS pixels the desktop gives a cell, conservatively, for the bar's width. */
const DESKTOP_CELL_PX = 6

export function barSvg(fill: number, width: number): string {
  const w = Math.round(width)
  const on = Math.max(0, Math.min(w, Math.round(w * fill)))
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="6" viewBox="0 0 ${w} 6">` +
    `<rect x="0" y="2" width="${w}" height="2" rx="1" fill="${BAR_TRACK}" fill-opacity="0.35"/>` +
    (on > 0 ? `<rect x="0" y="1.5" width="${on}" height="3" rx="1.5" fill="${BAR_FILL}"/>` : '') +
    '</svg>'
  )
}

/** The bar's width: what the line has left after the mark, label and clock (in cells). */
export function barCells(columns: number, surface: RenderSurface, label: string, clock: string): number {
  const spare = columns - INDENT - slotCells(surface) - label.length - 4 - clock.length - 2
  const cells = Math.min(BAR_MAX, spare)
  return cells < BAR_MIN ? 0 : cells
}

/** The mark's slot, mark and gap: the step line keeps the same slot empty, so it sits under the label. */
function slotCells(surface: RenderSurface): number {
  return surface === 'terminal' ? markCells(surface) + 1 : 3
}

/** The progress bar for the surface, or null when there is no room or no measure. */
function progress(kit: Kit, surface: RenderSurface, fill: number | null, cells: number): RenderElement | null {
  if (fill === null || cells <= 0) return null
  const { Box, Svg } = kit
  if (surface !== 'terminal' && Svg) {
    const width = Math.max(BAR_PX_MIN, Math.min(BAR_PX_MAX, cells * DESKTOP_CELL_PX))
    return (
      <Box marginLeft={2} marginRight={2} flexShrink={0}>
        <Svg source={barSvg(fill, width)} alt={`${Math.round(fill * 100)}% done`} width={width} height={6} />
      </Box>
    )
  }
  return (
    <Box marginLeft={2} marginRight={2} flexShrink={0}>
      {bar(kit, fill, cells)}
    </Box>
  )
}

/** A line under the first: an empty slot where the mark is, then the text. */
function under(kit: Kit, surface: RenderSurface, text: string, color: string): RenderElement {
  const { Box, Text } = kit
  return (
    <Box flexDirection="row">
      <Box width={slotCells(surface)} flexShrink={0} />
      <Box flexShrink={1}>
        <Text color={color} wrap="truncate-end">
          {text}
        </Text>
      </Box>
    </Box>
  )
}

/** The live row's own tree: the mark, label, bar and clock on one line; the step under the label. */
export function liveRow(kit: Kit, surface: RenderSurface, line: LiveLine, columns: number): RenderElement {
  const { Box, Text } = kit
  const cells = line.fill === null ? 0 : barCells(columns, surface, line.label, line.clock)
  const detail = surface === 'desktop' ? line.detail : undefined
  return (
    <Box key="alis-live" flexDirection="column">
      <Box flexDirection="row" alignItems="center">
        <Box width={slotCells(surface)} flexShrink={0}>
          {mark(kit, surface)}
        </Box>
        <Box flexShrink={0}>
          <Text>{line.label}</Text>
        </Box>
        {line.note ? (
          <Box flexShrink={1}>
            <Text color={KEY.quiet} wrap="truncate-end">{` · ${line.note}`}</Text>
          </Box>
        ) : null}
        {progress(kit, surface, line.fill, cells)}
        <Box flexGrow={1} />
        <Box flexShrink={0}>
          <Text color={KEY.quiet}>{line.clock}</Text>
        </Box>
      </Box>
      {line.sub ? under(kit, surface, line.sub, line.subTone === 'warning' ? KEY.warning : KEY.quiet) : null}
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
    <Box key="alis-fold" flexDirection="column">
      <Box flexDirection="row" alignItems="center">
        <Box width={slotCells(surface)} flexShrink={0}>
          {mark(kit, surface)}
        </Box>
        <Box flexShrink={0}>
          {sign}
          <Text>{fold.text}</Text>
        </Box>
        {fold.note ? (
          <Box flexShrink={1}>
            <Text color={KEY.quiet} wrap="truncate-end">{` · ${fold.note}`}</Text>
          </Box>
        ) : null}
        <Box flexGrow={1} />
        {fold.time ? (
          <Box flexShrink={0} marginLeft={2}>
            <Text color={KEY.quiet}>{fold.time}</Text>
          </Box>
        ) : null}
        {fold.logsUri ? (
          <Box flexShrink={0} marginLeft={2}>
            <Link href={fold.logsUri}>Logs</Link>
          </Box>
        ) : null}
      </Box>
      {fold.sub ? under(kit, surface, fold.sub, KEY.quiet) : null}
      {actions && (fold.follow || fold.cancel) ? (
        <Box flexDirection="row">
          <Box width={slotCells(surface)} flexShrink={0} />
          <Box flexDirection="row" gap={1}>
            {fold.follow ? <Button key="alis-follow" label="Follow" variant="primary" onPress={actions.follow} /> : null}
            {fold.cancel ? <Button key="alis-cancel" label="Cancel build" onPress={actions.cancel} /> : null}
          </Box>
        </Box>
      ) : null}
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
  const interrupted = bash?.interrupted === true || last?.interrupted === true
  // Nothing says how the call ended: leave its row to the engine rather than guess.
  if (!interrupted && !state && !view?.done && events.length === 0) return null
  const failed = !!state?.error || !!view?.error || !!view?.stages.some(s => s.state === 'failed')
  const outcome = interrupted ? 'interrupted' : failed ? 'failed' : warning ? 'detached' : state?.done === false ? 'running' : 'done'
  const elapsed = elapsedMs(events.at(-1)?.elapsed) ?? spanOf(view) ?? (last?.endedAt !== undefined ? last.endedAt - last.startedAt : undefined)
  return foldLineOf({ view, outcome, elapsedMs: elapsed, version: last?.version ?? state?.version, verb: last?.verb, ...(state?.error ? { error: state.error } : {}) })
}

export function renderOpsResult(kit: Kit, output: unknown, last?: LiveWait, surface: RenderSurface = 'terminal', actions?: FoldActions, names?: Record<string, string>): RenderElement | null {
  const fold = foldOf(output, last, names)
  return fold ? foldRow(kit, surface, fold, actions) : null
}
