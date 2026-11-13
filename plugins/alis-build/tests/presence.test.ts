import { describe, expect, test, tier } from 'claude-code/testing'

import { peopleHere, peopleOf, PRESENCE_MS, presenceModeOf, refreshPresence, resetPresence, shortService, startPresence, whoText } from '../hooks/mod/presence'
import { fakeHost } from './fixtures/fake-host'

tier('user')

const person = (user: string, name: string, status = 'active', sessionTitle = '') => ({ user, name, status, sessionTitle })
const roster = (...services: { service: string; current?: boolean; people: ReturnType<typeof person>[] }[]) =>
  JSON.stringify({ organisation: 'alis', product: 'os', services })

const INSIDE = '/h/alis.build/alis/build/os/cli/v1'

describe('presence', () => {
  test('peopleOf reads the roster and tolerates junk', () => {
    const json = JSON.parse(roster({ service: 'alis.os.cli.v1', current: true, people: [person('users/a', 'Alice Adams', 'active', 'Catch-up')] }, { service: 'alis.os.agent.v3', people: [person('users/b', '', 'idle')] }))
    expect(peopleOf(json)).toEqual([
      { user: 'users/a', name: 'Alice Adams', status: 'active', title: 'Catch-up', service: 'alis.os.cli.v1', current: true },
      { user: 'users/b', name: 'A teammate', status: 'idle', title: '', service: 'alis.os.agent.v3', current: false },
    ])
    expect(peopleOf({ services: [5, { service: 'x' }, { service: 'x', people: [null, {}] }] })).toEqual([])
    expect(shortService('alis.os.cli.v1', 'alis.os')).toBe('cli.v1')
    expect(shortService('other.thing.v1', 'alis.os')).toBe('other.thing.v1')
  })

  test('the footer label names who is in this folder\'s service only', () => {
    const here = (name: string) => ({ user: name, name, status: 'active' as const, title: '', service: 's', current: true })
    expect(presenceModeOf([])).toBeUndefined()
    expect(presenceModeOf([{ ...here('Bob Brown'), current: false }])).toBeUndefined()
    expect(presenceModeOf([here('Alice Adams')])).toBe('Alice here')
    expect(presenceModeOf([here('Alice Adams'), here('Bob Brown'), here('Cy')])).toBe('Alice +2 here')
  })

  test('outside an alis.build folder nothing is read', async () => {
    const host = fakeHost()
    await startPresence(host)
    expect(host.timers).toEqual([])
    expect(host.runs).toEqual([])
    expect(await whoText(host)).toContain('not inside an alis.build folder')
  })

  test('the first read is silent; a later arrival in this service is one toast and a redraw', async () => {
    let out = roster({ service: 'alis.os.cli.v1', current: true, people: [person('users/a', 'Alice Adams')] })
    const host = fakeHost({ answer: () => ({ exitCode: 0, stdout: out, stderr: '' }) })
    host.dir = INSIDE
    await startPresence(host)
    await refreshPresence(host)
    expect(host.timers).toEqual([expect.objectContaining({ ms: PRESENCE_MS, cancelled: false })])
    expect(host.runs[0]?.argv.slice(0, 3)).toEqual(['alis', 'presence', '--json'])
    expect(host.runs[0]?.argv).toContain('--session-id')
    expect(peopleHere().map(p => p.name)).toEqual(['Alice Adams'])
    expect(host.toasts).toEqual([])
    expect(host.invalidations).toBe(1)

    out = roster({ service: 'alis.os.cli.v1', current: true, people: [person('users/a', 'Alice Adams'), person('users/b', 'Bob Brown')] }, { service: 'alis.os.agent.v3', people: [person('users/c', 'Cy')] })
    await refreshPresence(host)
    expect(host.toasts).toEqual(['Bob Brown is also working in cli.v1'])
    expect(host.invalidations).toBe(2)

    // Nothing changed: no toast, no redraw.
    await refreshPresence(host)
    expect(host.toasts.length).toBe(1)
    expect(host.invalidations).toBe(2)

    expect(await whoText(host)).toBe(['who: alis.os', 'Alice Adams: active in cli.v1 (this folder)', 'Bob Brown: active in cli.v1 (this folder)', 'Cy: active in agent.v3'].join('\n'))
    resetPresence()
    expect(host.timers[0]?.cancelled).toBe(true)
  })

  test('a CLI without the command ends the reads; another failure keeps the last roster', async () => {
    let answer = { exitCode: 1, stdout: '{"error":{"code":"NETWORK_UNAVAILABLE","message":"offline"}}', stderr: '' }
    const host = fakeHost({ answer: () => answer })
    host.dir = INSIDE
    await startPresence(host)
    await refreshPresence(host)
    expect(host.timers[0]?.cancelled).toBe(false)
    expect(await whoText(host)).toContain('could not be read')

    answer = { exitCode: 1, stdout: '', stderr: 'Error: unknown command "presence" for "alis"' }
    await refreshPresence(host)
    expect(host.timers[0]?.cancelled).toBe(true)
    const runs = host.runs.length
    await refreshPresence(host)
    expect(host.runs.length).toBe(runs)
    expect(await whoText(host)).toContain('alis upgrade')
    expect(host.toasts).toEqual([])
    resetPresence()
  })

  test('nobody else reads as an empty team', async () => {
    const host = fakeHost({ answer: () => ({ exitCode: 0, stdout: roster(), stderr: '' }) })
    host.dir = INSIDE
    expect(await whoText(host)).toBe('who: alis.os\nteam: nobody else has a live session')
    resetPresence()
  })
})
