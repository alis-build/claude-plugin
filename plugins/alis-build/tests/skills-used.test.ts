import { describe, expect, test, tier } from 'claude-code/testing'

import { runAlisCommand } from '../hooks/mod/alis-command'
import { noteSkill, RATED_KEY, rateSkill, resetSkills, restoreSkills, SEND_SESSION, sendSkillFeedback, skillActions, skillForCall, skillLoadOf, skillStatusOf, skillsTurnDone, usedSkills } from '../hooks/mod/skills-used'
import { renderSkillRow, skillSubOf } from '../hooks/mod/skills-used-view'
import { resetStatus } from '../hooks/mod/status'
import { fakeHost, type FakeHost, type Run } from './fixtures/fake-host'

tier('user')

const CATALOG = JSON.stringify({
  fetchedAt: '2026-11-13T00:00:00Z',
  skills: [
    { id: 'block-audit', displayName: 'Block Audit', updateTime: '2026-11-01T00:00:00Z' },
    { id: 'dbd-add-protos', displayName: 'Add Protos' },
  ],
})

function start(answer?: (run: Run) => { exitCode: number; stdout: string; stderr: string } | Error): FakeHost {
  resetSkills()
  resetStatus()
  const host = fakeHost(answer ? { answer } : {})
  host.files['/h/.alis/cache/skills-catalog.json'] = CATALOG
  return host
}

const ok = (stdout = '{}') => ({ exitCode: 0, stdout, stderr: '' })

describe('skills-used', () => {
  test('skillLoadOf reads a literal alis skills load, whatever flags it carries', () => {
    expect(skillLoadOf('alis skills load block-audit --via dispatcher')).toBe('block-audit')
    expect(skillLoadOf('alis --json skills load block-audit')).toBe('block-audit')
    expect(skillLoadOf('alis skills suggest "deploy" --json')).toBe(null)
    expect(skillLoadOf('alis skills load')).toBe(null)
    expect(skillLoadOf('echo alis skills load block-audit')).toBe(null)
    expect(skillLoadOf(undefined)).toBe(null)
  })

  test('a Skill store skill is noted once, with its calls, and named on the status line', async () => {
    const host = start()
    await noteSkill(host, 'block-audit', 'toolu_1', 1000)
    await noteSkill(host, 'block-audit', 'toolu_2', 2000)
    await noteSkill(host, 'block-audit', 'toolu_2', 3000)
    expect(usedSkills()).toEqual([{ id: 'block-audit', name: 'Block Audit', at: 1000, turnDone: false, calls: ['toolu_1', 'toolu_2'], canRate: true }])
    expect(skillForCall('toolu_2')?.id).toBe('block-audit')
    expect(skillForCall('toolu_9')).toBe(undefined)
    expect(host.statuses.at(-1)).toBe('skill: Block Audit')
    await noteSkill(host, 'dbd-add-protos')
    expect(host.statuses.at(-1)).toBe('skills: Add Protos +1')
    expect(skillStatusOf([])).toBe(undefined)
  })

  test('a skill the catalogue does not hold, or no catalogue at all, is left alone', async () => {
    const host = start()
    await noteSkill(host, 'alis:discover', 'toolu_1')
    await noteSkill(host, 'commit', 'toolu_2')
    await noteSkill(host, undefined)
    expect(usedSkills()).toEqual([])
    expect(host.statuses).toEqual([])
    const bare = start()
    delete bare.files['/h/.alis/cache/skills-catalog.json']
    await noteSkill(bare, 'block-audit')
    expect(usedSkills()).toEqual([])
  })

  test('a rating is one CLI call for this session, remembered between sessions', async () => {
    const host = start(() => ok('{"rating":"up"}'))
    await noteSkill(host, 'block-audit', 'toolu_1')
    skillsTurnDone(host)
    await rateSkill(host, 'block-audit', 'up')
    expect(host.runs.at(-1)?.argv).toEqual(['alis', 'skills', 'feedback', 'block-audit', '--rating', 'up', '--json', '--session-id', 'session-a'])
    expect(usedSkills()[0]).toMatchObject({ rating: 'up', sending: false, failed: false })
    expect((host.store[RATED_KEY] as Record<string, { rating: string }>)['block-audit']?.rating).toBe('up')
    expect(host.fills).toEqual([])

    // The next session does not ask again, until the skill changes.
    const store = host.store
    const later = start()
    later.store = store
    await noteSkill(later, 'block-audit')
    expect(usedSkills()[0]?.canRate).toBe(false)
    const changed = start()
    changed.store = { [RATED_KEY]: { 'block-audit': { rating: 'up', at: '2026-10-01T00:00:00Z' } } }
    await noteSkill(changed, 'block-audit')
    expect(usedSkills()[0]?.canRate).toBe(true)
  })

  test('"didn\'t help" leaves the prompt ready for the reason; a failing CLI keeps the buttons', async () => {
    const host = start(() => ok())
    await noteSkill(host, 'block-audit')
    await rateSkill(host, 'block-audit', 'down')
    expect(host.fills).toEqual(['/alis feedback block-audit '])
    expect(skillSubOf(usedSkills()[0]!)).toContain('/alis feedback block-audit')

    const failing = start(() => new Error('ENOENT'))
    await noteSkill(failing, 'block-audit')
    skillsTurnDone(failing)
    await rateSkill(failing, 'block-audit', 'up')
    expect(usedSkills()[0]).toMatchObject({ failed: true, sending: false })
    expect(usedSkills()[0]?.rating).toBe(undefined)
    expect(failing.store[RATED_KEY]).toBe(undefined)
  })

  test('/alis feedback sends the message and attaches the session only on a yes', async () => {
    const answer = (run: Run) => (run.argv[2] === 'feedback' ? ok('{"ticket":"tickets/abc"}') : ok('{"ticket":"tickets/abc"}'))
    const host = start(answer)
    await noteSkill(host, 'block-audit')
    host.askAnswer = SEND_SESSION
    // With one skill in use its id may be left out.
    const text = (await runAlisCommand(host, 'feedback the audit step looped twice')).text
    expect(text).toBe('feedback: sent to the skill\'s owner\nskill: block-audit\nconversation: tickets/abc\nsession: attached')
    expect(host.runs.map(r => r.argv.slice(0, 5))).toEqual([
      ['alis', 'skills', 'feedback', 'block-audit', 'the audit step looped twice'],
      ['alis', 'specialist', 'send-session', '--ticket', 'tickets/abc'],
    ])
    expect(host.runs[1]?.argv).toContain('--approve')
    expect(host.asks[0]?.options).toEqual({ options: ['Send session', 'Not now'], header: 'AlisX' })

    const declined = start(answer)
    await noteSkill(declined, 'block-audit')
    declined.askAnswer = 'Not now'
    expect(await sendSkillFeedback(declined, ['block-audit', 'too', 'slow'])).toContain('session: not attached')
    expect(declined.runs).toHaveLength(1)

    const none = start()
    expect(await sendSkillFeedback(none, ['it', 'looped'])).toContain('nothing sent')
    expect(await sendSkillFeedback(none, ['block-audit'])).toContain('usage:')
    expect(none.runs).toEqual([])
  })

  for (const surface of ['terminal', 'desktop'] as const) {
    test(`the row names the skill and offers a rating once the turn has ended, on the ${surface}`, async ($, on) => {
      const host = start(() => ok())
      await noteSkill(host, 'block-audit', 'toolu_1')
      on('ui.render', { component: 'ToolResult' }, ($, e) => renderSkillRow($.ui.resolve(e), e.surface, skillForCall('toolu_1')!, skillActions(host, 'block-audit')))
      const draw = async () => JSON.stringify(await $.ui.render({ surface, component: 'ToolResult', requestId: 'toolu_1', props: { tool_use_id: 'toolu_1', tool: 'Skill', output: {}, isErrored: false } }))
      const running = await draw()
      expect(running).toContain('Skill Block Audit')
      expect(running).toContain('from the AlisX Skill store')
      expect(running).not.toContain('"label":"Helped"')
      skillsTurnDone(host)
      const done = await draw()
      expect(done).toContain('"label":"Helped"')
      expect(done).toContain('"label":"Didn\'t help"')
      expect(done).toContain('"label":"Say more"')
      await rateSkill(host, 'block-audit', 'up')
      const rated = await draw()
      expect(rated).not.toContain('"label":"Helped"')
      expect(rated).toContain('Your rating went to the skill')
    })
  }

  test('a reload keeps the skills and drops a send in flight', async () => {
    const host = start()
    await noteSkill(host, 'block-audit', 'toolu_1')
    const saved = usedSkills().map(skill => ({ ...skill, sending: false }))
    resetSkills()
    restoreSkills(saved)
    expect(skillForCall('toolu_1')?.name).toBe('Block Audit')
    restoreSkills(undefined)
    expect(usedSkills()).toEqual([])
  })
})
