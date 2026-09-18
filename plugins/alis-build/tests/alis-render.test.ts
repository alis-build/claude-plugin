import { describe, expect, test, tier } from 'claude-code/testing'

tier('user')

// Through the engine: the module's ui.render hook on the CommandOutput row
// of /alis draws a Box tree; a row it cannot parse is left to the engine.
describe('alis-render', () => {
  test('the /alis output row is drawn as a column of key: value lines', async $ => {
    const tree = await $.ui.render({
      surface: 'terminal',
      component: 'CommandOutput',
      requestId: 'm1',
      props: { command: 'alis', args: 'status', text: 'alis: status\ncli: v1\nhandoff: no claim', isErrored: false },
    })
    expect(JSON.stringify(tree)).toContain('handoff: ')
    expect(JSON.stringify(tree)).toContain('no claim')
    expect(JSON.stringify(tree)).toContain('"bold":true')
  })

  test('another command\'s row is not ours to draw', async ($, on) => {
    let reached = 0
    on('ui.render', ($, e) => {
      reached += 1
      return { type: 'Text', props: {}, children: ['engine'] } as never
    })
    await $.ui.render({
      surface: 'terminal',
      component: 'CommandOutput',
      requestId: 'm2',
      props: { command: 'cost', args: '', text: 'plain text', isErrored: false },
    })
    await $.ui.render({
      surface: 'terminal',
      component: 'CommandOutput',
      requestId: 'm3',
      props: { command: 'alis', args: '', text: 'not a key value row', isErrored: false },
    })
    expect(reached).toBe(2)
  })
})
