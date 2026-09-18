import { describe, expect, test, tier } from 'claude-code/testing'

import { COVERS, isCovered, tagClassic } from '../hooks/mod/tag'

tier('user')

describe('tag', () => {
  test('tagClassic adds alis_module and leaves the event otherwise intact', () => {
    const e = { session_id: 'abc', hook_event_name: 'Stop', nested: { a: 1 } }
    const tagged = tagClassic(e)
    expect(tagged.alis_module).toBe(COVERS.join(' '))
    expect(tagged.session_id).toBe('abc')
    expect(tagged.nested).toBe(e.nested)
    expect('alis_module' in e).toBe(false)
  })

  test('isCovered reads whole tokens only', () => {
    expect(isCovered({ alis_module: 'cli handoff suggest' }, 'handoff')).toBe(true)
    expect(isCovered({ alis_module: 'cli handoff suggest' }, 'hand')).toBe(false)
    expect(isCovered({ alis_module: '' }, 'cli')).toBe(false)
    expect(isCovered({}, 'cli')).toBe(false)
    expect(isCovered('not an object', 'cli')).toBe(false)
  })

  // The classic dispatch itself is core's side effect and has no `$.classic`
  // call, so the shell-side half of the handshake is covered by
  // TagGuardTests in tests/test_behavior.py and the dev-session check in
  // the README, not here.
})
