import { describe, expect, test, tier } from 'claude-code/testing'

import { resetStatus, setStatus, statusText } from '../hooks/mod/status'
import { fakeHost } from './fixtures/fake-host'

tier('user')

describe('status', () => {
  test('the line is the segments that are set, in a fixed order, and clears with the last one', () => {
    resetStatus()
    const host = fakeHost()
    setStatus(host, 'presence', 'Ruan in console.v2')
    setStatus(host, 'handoff', 'handoff: session claimed')
    setStatus(host, 'handoff', undefined)
    setStatus(host, 'presence', undefined)
    expect(host.statuses).toEqual(['Ruan in console.v2', 'handoff: session claimed · Ruan in console.v2', 'Ruan in console.v2', undefined])
    expect(statusText()).toBe(undefined)
  })
})
