import { describe, expect, test, tier } from 'claude-code/testing'

import { resetStatus, setStatus, statusText } from '../hooks/mod/status'
import { fakeHost } from './fixtures/fake-host'

tier('user')

describe('status', () => {
  test('the line is the segments that are set, in a fixed order, and clears with the last one', () => {
    resetStatus()
    const host = fakeHost()
    setStatus(host, 'skill', 'skill: Block Audit')
    setStatus(host, 'handoff', 'handoff: session claimed')
    setStatus(host, 'handoff', undefined)
    setStatus(host, 'skill', undefined)
    expect(host.statuses).toEqual(['skill: Block Audit', 'handoff: session claimed · skill: Block Audit', 'skill: Block Audit', undefined])
    expect(statusText()).toBe(undefined)
  })
})
