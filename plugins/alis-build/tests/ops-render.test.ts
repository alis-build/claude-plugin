import { describe, expect, test, tier } from 'claude-code/testing'

import { renderOpsRunning } from '../hooks/mod/ops-render'

tier('user')

const STDERR = '{"elapsed":"0:03","progress":"Fetching sources"}\n{"elapsed":"1:10","progress":"Deploying revision"}'

describe('ops-render', () => {
  test('a running wait row gets the live line under the engine\'s own row', async ($, on) => {
    const e = {
      surface: 'terminal' as const,
      component: 'ToolUse' as const,
      requestId: 'live1',
      props: { tool_use_id: 'live1', tool: 'Bash', input: { command: 'alis operations wait operations/z --json' }, isRunning: true, isErrored: false, isInterrupted: false },
    }
    const engineRow = { type: 'Text', props: {}, children: ['engine row'] } as never
    // The plugin holds no live state for this row in the test host, so its hook
    // passes the event down to this one, whose `$` resolves the real elements.
    let reached = 0
    on('ui.render', { component: 'ToolUse' }, ($, e) => {
      reached += 1
      return renderOpsRunning($.ui.resolve(e), engineRow, { operation: 'operations/z', startedAt: 1000, status: 'building' }, 66_000)
    })
    const drawn = JSON.stringify(await $.ui.render(e))
    expect(reached).toBe(1)
    expect(drawn).toContain('engine row')
    expect(drawn).toContain('alis: waiting on operations/z · 1:05 · ')
    expect(drawn).toContain('building')
  })

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
