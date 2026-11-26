import { describe, expect, test, tier } from 'claude-code/testing'

import { runAlisCommand } from '../hooks/mod/alis-command'
import { dismissRating, noteSkill, RATED_KEY, rateSkill, resetSkills, restoreSkills, SEND_SESSION, sendSkillFeedback, skillActions, skillForCall, skillLoadOf, skillModeOf, skillsAmong, skillsTurnDone, skillToRate, usedSkills } from '../hooks/mod/skills-used'
import { renderSkillAsk, renderSkillRow, skillSubOf } from '../hooks/mod/skills-used-view'
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

  test('a Skill store skill is noted once, with its calls, and named in the prompt footer', async () => {
    const host = start()
    await noteSkill(host, 'block-audit', 'toolu_1', 1000)
    await noteSkill(host, 'block-audit', 'toolu_2', 2000)
    await noteSkill(host, 'block-audit', 'toolu_2', 3000)
    expect(usedSkills()).toEqual([{ id: 'block-audit', name: 'Block Audit', at: 1000, turnDone: false, calls: ['toolu_1', 'toolu_2'], canRate: true }])
    expect(skillForCall('toolu_2')?.id).toBe('block-audit')
    expect(skillForCall('toolu_9')).toBe(undefined)
    expect(skillModeOf()).toBe('skill Block Audit')
    await noteSkill(host, 'dbd-add-protos', 'toolu_3')
    expect(skillModeOf()).toBe('skill Add Protos +1')
    // The status line is drawn as a warning: a skill in use never goes there.
    expect(host.statuses).toEqual([])
    // A folded group's calls give its skills, each once.
    expect(skillsAmong([{ tool_use_id: 'toolu_1' }, { tool_use_id: 'toolu_2' }, { tool_use_id: 'toolu_3' }, {}]).map(s => s.id)).toEqual(['block-audit', 'dbd-add-protos'])
    resetSkills()
    expect(skillModeOf()).toBe(undefined)
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
    test(`the narrow rating band wraps the four working shortcuts below a long name on the ${surface}`, async ($, on) => {
      const skill = { id: 'block-audit', name: 'Block Audit for a service with a very long display name', at: 0, calls: [], turnDone: true, canRate: true }
      const pressed: string[] = []
      const actions = {
        rate: (rating: 'up' | 'down') => pressed.push(rating),
        sayMore: () => pressed.push('more'),
        dismiss: () => pressed.push('later'),
      }
      on('ui.render', { component: 'AbovePrompt' }, ($, e) => renderSkillAsk($.ui.resolve(e), e.surface, skill, actions))
      const ui = await $.ui.mount({
        plugin: 'test', component: 'AbovePrompt', surface, viewport: { columns: 24, rows: 30 },
        props: { hasSurvey: false, isCollapsed: false, isWorking: false, bodyColumns: 24, maxRows: 8, scroll: { offset: 0, bodyRows: 8 }, view: {} },
      })
      expect(await ui.drawn()).toMatchObject({
        props: { flexDirection: 'column' },
        children: [
          { type: 'Box' },
          { children: [{ props: { flexWrap: 'wrap' }, children: Array(4).fill({ type: 'Button' }) }, { type: 'Text' }] },
        ],
      })
      for (const [action, letter] of [['up', 'y'], ['down', 'n'], ['more', 'm'], ['later', 'x']]) {
        const key = `alis-skill-${action}:${skill.id}`
        expect(await ui.find({ key })).toMatchObject({ type: 'Button', props: { hotkey: letter } })
        await ui.press({ key })
      }
      expect(pressed).toEqual(['up', 'down', 'more', 'later'])
      expect(await ui.find({ type: 'Text', text: surface === 'terminal' ? /Ctrl\+X then Tab/ : /Tab to a rating button/ })).toBeDefined()
      await ui.unmount()
    })

    test(`the row names the skill, and a line above the prompt asks once the turn has ended, on the ${surface}`, async ($, on) => {
      const host = start(() => ok())
      await noteSkill(host, 'block-audit', 'toolu_1')
      on('ui.render', { component: 'ToolResult' }, ($, e) => renderSkillRow($.ui.resolve(e), e.surface, skillForCall('toolu_1')!))
      on('ui.render', { component: 'AbovePrompt' }, ($, e, next) => {
        const asked = skillToRate()
        return asked ? renderSkillAsk($.ui.resolve(e), e.surface, asked, skillActions(host, asked.id)) : next(e)
      })
      const row = async () => JSON.stringify(await $.ui.render({ surface, component: 'ToolResult', requestId: 'toolu_1', props: { tool_use_id: 'toolu_1', tool: 'Skill', output: {}, isErrored: false } }))
      const band = async () => JSON.stringify(await $.ui.render({ surface, component: 'AbovePrompt', props: { hasSurvey: false, isWorking: false, maxRows: 6, bodyColumns: 100, scroll: 0, view: 'main' } } as never))
      expect(await row()).toContain('Skill Block Audit')
      expect(await row()).toContain('from the AlisX Skill store')
      // The row never carries buttons: it is in the scrollback by the time they matter.
      expect(await row()).not.toContain('"label"')
      expect(skillToRate()).toBe(undefined)
      expect(await band()).not.toContain('How was the skill')
      skillsTurnDone(host)
      const asking = await band()
      expect(asking).toContain('How was the skill Block Audit?')
      for (const label of ['Helped', "Didn't help", 'Say more', 'Not now']) expect(asking).toContain(`"label":"${label}"`)
      await rateSkill(host, 'block-audit', 'up')
      expect(skillToRate()).toBe(undefined)
      expect(await band()).not.toContain('How was the skill')
      expect(await row()).toContain('Your rating went to the skill')
    })
  }

  test('"Not now" stops the question for this session without remembering a rating', async () => {
    const host = start()
    await noteSkill(host, 'block-audit')
    skillsTurnDone(host)
    expect(skillToRate()?.id).toBe('block-audit')
    dismissRating(host, 'block-audit')
    expect(skillToRate()).toBe(undefined)
    expect(host.store[RATED_KEY]).toBe(undefined)
    // A failed send keeps asking, so it can be tried again.
    const failing = start(() => new Error('ENOENT'))
    await noteSkill(failing, 'block-audit')
    skillsTurnDone(failing)
    await rateSkill(failing, 'block-audit', 'up')
    expect(skillToRate()?.failed).toBe(true)
  })

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
