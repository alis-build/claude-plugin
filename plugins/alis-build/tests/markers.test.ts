import { describe, expect, test, tier } from 'claude-code/testing'

import { passClassic } from '../hooks/mod/classic'
import { isSessionId, MARKER_DIR, MARKER_MAX_AGE_MS, markerPath, pruneMarkers, writeMarker } from '../hooks/mod/markers'
import { fakeHost } from './fixtures/fake-host'

tier('user')

const DIR = `/h/${MARKER_DIR}`
const NOW = Date.parse('2026-09-18T12:00:00Z')
const file = (name: string) => ({ name, kind: 'file' as const, size: 3 })

async function settle() {
  for (let i = 0; i < 20; i++) await Promise.resolve()
}

describe('markers', () => {
  test('writeMarker writes under HOME and does nothing without one', async () => {
    const host = fakeHost()
    await writeMarker(host, 'abc', 'cli')
    expect(host.writes).toEqual([{ path: markerPath('/h', 'abc'), text: 'cli' }])
    const homeless = fakeHost({ env: {} })
    await writeMarker(homeless, 'abc', 'cli')
    expect(homeless.writes).toEqual([])
    expect(isSessionId('../x')).toBe(false)
    expect(isSessionId('a-b_C9')).toBe(true)
  })

  test('pruneMarkers removes only stale session-shaped files, with one rm', async () => {
    const host = fakeHost()
    host.entries[DIR] = [file('old'), file('fresh'), file('../escape'), { name: 'sub', kind: 'dir', size: 0 }, file('gone')]
    host.stats[`${DIR}/old`] = { kind: 'file', size: 3, mtimeMs: NOW - MARKER_MAX_AGE_MS - 1 }
    host.stats[`${DIR}/fresh`] = { kind: 'file', size: 3, mtimeMs: NOW - 60_000 }
    host.stats[`${DIR}/../escape`] = { kind: 'file', size: 3, mtimeMs: 0 }
    expect(await pruneMarkers(host, NOW)).toEqual([`${DIR}/old`])
    expect(host.runs).toEqual([{ argv: ['/bin/rm', '-f', `${DIR}/old`], init: { timeoutMs: 5000 } }])
  })

  test('pruneMarkers is silent with no directory, nothing stale, or a failing rm', async () => {
    const empty = fakeHost()
    expect(await pruneMarkers(empty, NOW)).toEqual([])
    expect(empty.runs).toEqual([])

    const fresh = fakeHost()
    fresh.entries[DIR] = [file('a')]
    fresh.stats[`${DIR}/a`] = { kind: 'file', size: 1, mtimeMs: NOW }
    expect(await pruneMarkers(fresh, NOW)).toEqual([])
    expect(fresh.runs).toEqual([])

    const failing = fakeHost({ answer: () => new Error('rm exploded') })
    failing.entries[DIR] = [file('a')]
    failing.stats[`${DIR}/a`] = { kind: 'file', size: 1, mtimeMs: 0 }
    expect(await pruneMarkers(failing, NOW)).toEqual([`${DIR}/a`])
    expect(failing.logs.some(l => l.includes('rm exploded'))).toBe(true)
  })

  test('a session start writes its marker and prunes; other events do not prune', async () => {
    const host = fakeHost()
    host.entries[DIR] = [file('stale')]
    host.stats[`${DIR}/stale`] = { kind: 'file', size: 1, mtimeMs: 0 }
    await passClassic(host, 'classic.SessionStart', { session_id: 'abc', hook_event_name: 'SessionStart' }, async e => e)
    await settle()
    expect(host.writes[0]?.path).toBe(markerPath('/h', 'abc'))
    expect(host.runs.map(r => r.argv[0])).toContain('/bin/rm')
    const quiet = fakeHost()
    quiet.entries[DIR] = [file('stale')]
    quiet.stats[`${DIR}/stale`] = { kind: 'file', size: 1, mtimeMs: 0 }
    await passClassic(quiet, 'classic.UserPromptSubmit', { session_id: 'abc', hook_event_name: 'UserPromptSubmit' }, async e => e)
    await settle()
    expect(quiet.runs.map(r => r.argv[0])).not.toContain('/bin/rm')
  })
})
