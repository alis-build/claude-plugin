/* @jsxRuntime classic */
/* @jsx h */
// Draws the session pane: the title and summary the platform wrote, one line
// of facts, then the lists (key changes, skills, files, conversations) and
// the buttons. No hotkeys: a docked pane leaves the keyboard to the prompt.
import type { RenderElement, RenderSurface } from 'claude-code'

import { badge, DANGER } from './brand'
import { EARN_NOTE } from './credits'
import { agoOf } from './ops-pane'
import type { PaneKit } from './ops-pane-view'
import { durationOf, type SessionPaneState, type SessionRecord } from './session-pane'

export type SessionPaneActions = { share: () => void; refresh: () => void; close: () => void }

const FILES_SHOWN = 6

/** The one line of facts: outcome, service, time, tokens, transcript. */
export function factsOf(record: SessionRecord): string {
  return [
    record.outcome,
    record.service,
    record.gitBranch ? `branch ${record.gitBranch}` : '',
    record.activeSeconds > 0 ? `${durationOf(record.activeSeconds)} active` : '',
    record.workTokens > 0 ? `${record.workTokens.toLocaleString('en-US')} tokens${record.estimatedCostUsd > 0 ? ` (about $${record.estimatedCostUsd.toFixed(2)})` : ''}` : '',
    record.transcriptSaved ? 'transcript saved' : 'transcript not saved',
  ]
    .filter(Boolean)
    .join(' · ')
}

export function renderSessionPane(kit: PaneKit, state: SessionPaneState, actions: SessionPaneActions, now = Date.now(), surface: RenderSurface = 'terminal'): RenderElement {
  const { Box, Text, Button } = kit
  const record = state.record
  const section = (label: string, items: string[], more = 0) =>
    items.length === 0 ? null : (
      <Box key={label} flexDirection="column" marginTop={1}>
        <Text dimColor>{label}</Text>
        {items.map((item, i) => (
          <Text key={String(i)}>{`  ${item}`}</Text>
        ))}
        {more > 0 ? <Text dimColor>{`  and ${more} more`}</Text> : null}
      </Box>
    )
  return (
    <Box flexDirection="column" key="alis-session">
      <Box marginBottom={1}>
        {badge(kit, surface)}
        <Text bold>{' session'}</Text>
        <Text dimColor>{'  what AlisX holds about it'}</Text>
      </Box>
      {state.error ? <Text color={DANGER}>{`error: ${state.error}`}</Text> : null}
      {state.note ? <Text dimColor>{state.note}</Text> : null}
      {!record && !state.error && !state.note ? <Text dimColor>Loading…</Text> : null}
      {record ? (
        <Box flexDirection="column">
          <Text bold>{record.title || '(no title yet)'}</Text>
          {record.summary ? <Text>{record.summary}</Text> : null}
          <Box marginTop={1}>
            <Text dimColor>{factsOf(record)}</Text>
          </Box>
          {section('Key changes', record.keyChanges)}
          {section('Skills used', record.skillsUsed)}
          {section('Files changed', record.filesModified.slice(0, FILES_SHOWN), Math.max(0, record.filesModified.length - FILES_SHOWN))}
          {section('Conversations', record.tickets)}
        </Box>
      ) : null}
      <Box marginTop={1}>
        <Button key="share" label="Send to the build team" onPress={actions.share} />
        <Text> </Text>
        <Button key="refresh" label="Refresh" onPress={actions.refresh} />
        <Text> </Text>
        <Button key="close" label="Close" onPress={actions.close} />
        <Text dimColor>{`  ${state.isRefreshing ? 'refreshing…' : state.refreshedAt ? `read ${agoOf(new Date(state.refreshedAt).toISOString(), now)}` : ''}`}</Text>
      </Box>
      <Text dimColor>{`Sending this session: ${EARN_NOTE.charAt(0).toLowerCase()}${EARN_NOTE.slice(1)}`}</Text>
    </Box>
  )
}
