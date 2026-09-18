import { describe, expect, test, tier } from 'claude-code/testing'

tier('user')

const STDERR = '{"elapsed":"0:03","progress":"Fetching sources"}\n{"elapsed":"1:10","progress":"Deploying revision"}'

describe('ops-render', () => {
  test('a Bash result that streamed an alis operation is drawn as a summary', async $ => {
    const tree = await $.ui.render({
      surface: 'terminal',
      component: 'ToolResult',
      requestId: 't1',
      props: { tool_use_id: 't1', tool: 'Bash', output: { stdout: '{"name":"operations/x","done":true,"version":"1.2.3"}', stderr: STDERR, interrupted: false }, isErrored: false },
    })
    const drawn = JSON.stringify(tree)
    expect(drawn).toContain('alis operation: done → 1.2.3')
    expect(drawn).toContain('Deploying revision')
    expect(drawn).not.toContain('Fetching sources')
  })

  test('an ordinary Bash result is left to the engine', async ($, on) => {
    let reached = 0
    on('ui.render', () => {
      reached += 1
      return { type: 'Text', props: {}, children: ['engine'] } as never
    })
    await $.ui.render({
      surface: 'terminal',
      component: 'ToolResult',
      requestId: 't2',
      props: { tool_use_id: 't2', tool: 'Bash', output: { stdout: 'hello', stderr: '', interrupted: false }, isErrored: false },
    })
    expect(reached).toBe(1)
  })
})
