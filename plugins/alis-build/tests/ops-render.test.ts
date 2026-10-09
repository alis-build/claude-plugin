import { describe, expect, test, tier } from 'claude-code/testing'

import { graphicsFrom, MARK_SVG, setMarkFile } from '../hooks/mod/brand'
import type { LiveWait } from '../hooks/mod/ops-live'
import { barCells, foldOf, renderOpsResult, renderOpsRunning } from '../hooks/mod/ops-render'

tier('user')

const LEAN = '{"elapsed":"0:03","progress":"Fetching sources"}\n{"elapsed":"4:09","progress":"Deploying revision"}'
const DEV = 'organisations/acme/products/sm/environments/env1/deployments/hello'

const building = (): LiveWait => ({
  operation: 'operations/040fff29',
  target: 'acme.sm.console.v2',
  verb: 'wait',
  startedAt: 1_000,
  status: 'running',
  names: { env1: 'Development' },
  view: {
    kind: 'build',
    version: '2.44.19',
    done: false,
    stages: [
      { kind: 'build', name: '.', state: 'running', done: 14, total: 18, cached: 3, detail: '[node-builder 7/7] RUN pnpm run build', startMs: 1_000 },
      { kind: 'deploy', name: 'Development', state: 'waiting', done: 0, total: 0, cached: 0 },
    ],
  },
})

const toolUse = (surface: 'terminal' | 'desktop') => ({
  surface,
  component: 'ToolUse' as const,
  requestId: 'live1',
  props: { tool_use_id: 'live1', tool: 'Bash', input: { command: 'alis operations wait operations/040fff29 --json' }, isRunning: true, isErrored: false, isInterrupted: false },
})

describe('ops-render', () => {
  for (const surface of ['terminal', 'desktop'] as const) {
    test(`the live row draws under the engine's own row on the ${surface}`, async ($, on) => {
      const engineRow = { type: 'Text', props: {}, children: ['engine row'] } as never
      on('ui.render', { component: 'ToolUse' }, ($, e) => renderOpsRunning($.ui.resolve(e), engineRow, building(), 78_000, e.surface, 100))
      const drawn = JSON.stringify(await $.ui.render(toolUse(surface)))
      expect(drawn).toContain('engine row')
      expect(drawn).toContain('Building 2.44.19')
      expect(drawn).toContain('1:17')
      expect(drawn).toContain('Step 15 of 18 · deploys to Development next')
      // The mark has a fixed slot, and the step line keeps it empty, so the step sits under the label.
      expect(drawn.match(/"width":(3|5),"flexShrink":0/g)?.length).toBe(2)
      expect(drawn).toContain('"alignItems":"center"')
      if (surface === 'terminal') {
        expect(drawn).toContain('━')
        expect(drawn).toContain('"color":"background"')
        expect(drawn).toContain('"Alis"')
        expect(drawn).not.toContain('Svg')
        expect(drawn).not.toContain('operations/040fff29')
      } else {
        expect(drawn).toContain('"type":"Svg"')
        // The bar is a set-width SVG: it cannot wrap in the desktop's font.
        expect(drawn).not.toContain('━')
        expect(drawn).toContain('#009999')
        expect(drawn).toContain('"alt":"78% done"')
        expect(drawn).toContain('viewBox=\\"0 0 53 91\\"')
        // The hover card holds the docker step and the operation.
        expect(drawn).toContain('[node-builder 7/7] RUN pnpm run build')
        expect(drawn).toContain('operations/040fff29')
      }
    })
  }

  test('Ghostty and kitty get the mark as a one-cell picture; tmux and other terminals the name', async ($, on) => {
    expect(graphicsFrom({ termProgram: 'ghostty', term: 'xterm-ghostty' })).toBe(true)
    expect(graphicsFrom({ term: 'xterm-kitty', kittyWindow: '1' })).toBe(true)
    expect(graphicsFrom({ termProgram: 'ghostty', tmux: '/tmp/tmux-501/default,1,0' })).toBe(false)
    expect(graphicsFrom({ termProgram: 'Apple_Terminal' })).toBe(false)
    // The asset's own markup: eleven filled paths in Alis red.
    expect(MARK_SVG.match(/<path /g)).toHaveLength(11)
    expect(MARK_SVG).toContain('viewBox="0 0 53 91"')

    setMarkFile('/p/assets/alis-mark-cell.png')
    try {
      const engineRow = { type: 'Text', props: {}, children: ['engine row'] } as never
      on('ui.render', { component: 'ToolUse' }, ($, e) => renderOpsRunning($.ui.resolve(e), engineRow, building(), 78_000, e.surface, 100))
      const drawn = JSON.stringify(await $.ui.render(toolUse('terminal')))
      expect(drawn).toContain('"type":"Image"')
      expect(drawn).toContain('"file":"/p/assets/alis-mark-cell.png"')
      expect(drawn).toContain('"columns":1')
      expect(drawn).not.toContain('"Alis"')
      expect(drawn).toContain('Building 2.44.19')
    } finally {
      setMarkFile(null)
    }
  })

  test('the bar takes the spare width and is left out when there is none', () => {
    expect(barCells(100, 'terminal', 'Building 2.44.19', '1:17')).toBe(64)
    expect(barCells(60, 'terminal', 'Building 2.44.19', '1:17')).toBe(27)
    expect(barCells(36, 'terminal', 'Building 2.44.19', '1:17')).toBe(0)
  })

  test('a finished build and deploy folds to its outcome, time and logs', async $ => {
    const tree = await $.ui.render({
      surface: 'terminal',
      component: 'ToolResult',
      requestId: 't1',
      props: {
        tool_use_id: 't1',
        tool: 'Bash',
        output: { stdout: JSON.stringify({ name: 'operations/x', done: true, status: 'succeeded', version: '2.44.19', logsUri: 'https://deploy.example/x', deployments: [{ name: DEV, state: 'RUNNING', progress: { changeSummary: { change: 1 } } }] }), stderr: LEAN, interrupted: false },
        isErrored: false,
      },
    })
    const drawn = JSON.stringify(tree)
    expect(drawn).toContain('2.44.19 is live on')
    expect(drawn).toContain('4m 09s')
    expect(drawn).toContain('https://deploy.example/x')
    expect(drawn).toContain('"color":"success"')
    expect(drawn).not.toContain('Fetching sources')
  })

  test('the fold reads each ending', () => {
    const last = { ...building(), endedAt: 113_000 }
    expect(foldOf({ stdout: '', stderr: '', interrupted: true }, last)).toMatchObject({ tone: 'neutral', text: 'Still building on Alis', note: 'you stopped watching, not the build', follow: true, cancel: true })
    expect(foldOf({ stdout: '', stderr: `${LEAN}\n{"elapsed":"10:00","warning":"timed out; operation still running","operation":"operations/x"}` }, last)).toMatchObject({ tone: 'neutral', note: 'Claude stopped waiting after 10m 00s', follow: true })
    const failedBuild = {
      done: true,
      error: 'build failed',
      buildLogsUri: 'https://build.example/x',
      images: [{ path: '.', progress: { failed: true, endTime: '2026-10-08T21:25:00Z', buildSteps: [
        { name: '[1/2] FROM node', status: 'DONE', stepNumber: 1 },
        { name: '[2/2] RUN pnpm install --frozen-lockfile', status: 'FAILED', stepNumber: 2, error: 'ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile"' },
      ] } }],
      deployments: [{ name: DEV, state: 'PENDING' }],
    }
    expect(foldOf({ stdout: JSON.stringify(failedBuild), stderr: LEAN }, undefined, { env1: 'Development' })).toMatchObject({
      tone: 'error',
      text: 'Build failed at step 2. Nothing was deployed.',
      sub: 'ERR_PNPM_OUTDATED_LOCKFILE Cannot install with "frozen-lockfile"',
      logsUri: 'https://build.example/x',
      time: '4m 09s',
    })
    const failedDeploy = { done: true, error: 'deploy failed', version: '2.44.19', deployments: [{ name: DEV, logsUri: 'https://deploy.example/y', progress: { failed: true, endTime: '2026-10-08T21:27:00Z', failure: { actionLabel: 'terraform apply', errorLines: ["Error 403: Permission 'run.services.update' denied"] } } }] }
    expect(foldOf({ stdout: JSON.stringify(failedDeploy), stderr: LEAN }, undefined, { env1: 'Development' })).toMatchObject({ tone: 'error', text: 'Deploy to Development failed.', sub: "Error 403: Permission 'run.services.update' denied", logsUri: 'https://deploy.example/y' })
    expect(foldOf({ stdout: '{"name":"operations/x","done":true,"version":"1.2.3"}', stderr: LEAN }, undefined)).toMatchObject({ tone: 'ok', text: '1.2.3 is built' })
  })

  test("the real pruned result of the screenshot's build folds to one line", () => {
    // `alis operations describe operations/040fff29-… --json`, 8 Oct 2026.
    const result = {
      buildLogsUri: 'https://build.alis.alis.dev/executions/a968e5d1-f9c7-4b1c-a698-835b152a998c',
      deployments: [{ logsUri: 'https://deploy.alis.alis.dev/executions/dc7b2964-2e5a-48fb-b210-7b4e66f4f569', name: 'organisations/alis/products/os/environments/1y2ozvryhc9kk/deployments/console-v2', progress: { changeSummary: { change: 1, operation: 'apply' } }, state: 'RUNNING' }],
      done: true,
      images: [{ path: '.' }],
      logsUri: 'https://deploy.alis.alis.dev/executions/dc7b2964-2e5a-48fb-b210-7b4e66f4f569',
      name: 'operations/040fff29-951b-437d-bccc-2bd650c4f8b1',
      notes: 'Deploying infrastructure to 1 environment',
      schemaVersion: 1,
      status: 'succeeded',
      version: '2.44.19',
    }
    expect(foldOf({ stdout: JSON.stringify(result), stderr: '{"elapsed":"4:09","progress":"Deploying infrastructure to 1 environment"}' }, undefined, { '1y2ozvryhc9kk': 'Development' })).toEqual({
      tone: 'ok',
      text: '2.44.19 is live on Development',
      time: '4m 09s',
      logsUri: 'https://deploy.alis.alis.dev/executions/dc7b2964-2e5a-48fb-b210-7b4e66f4f569',
    })
  })

  test('an async start folds to one line, and a background call ends on its outcome', () => {
    const started = { done: false, logsUri: 'https://build.example/x', metadata: { '@type': 'type.googleapis.com/alis.os.dbd.v1.RunBuildMetadata', version: '2.44.21' }, name: 'operations/133500a8', schemaVersion: 1, status: 'running', version: '2.44.21' }
    expect(foldOf({ stdout: JSON.stringify(started), stderr: '' }, undefined)).toEqual({ tone: 'neutral', text: 'Build 2.44.21 started on Alis' })
    // A describe of a running operation is not a start.
    expect(foldOf({ stdout: '{"done":false,"name":"operations/x","status":"running"}', stderr: '' }, undefined)).toBe(null)

    const ended = { ...building(), background: true, endedAt: 300_000, result: { done: true, version: '2.44.21' } }
    ended.view = { ...ended.view!, version: '2.44.21', done: true, stages: [
      { kind: 'build', name: '.', state: 'done', done: 18, total: 18, cached: 3, startMs: 0, endMs: 161_000 },
      { kind: 'deploy', name: 'Development', state: 'done', done: 6, total: 6, cached: 0, startMs: 165_000, endMs: 249_000 },
    ] }
    expect(foldOf({ stdout: '', stderr: '', interrupted: false, backgroundTaskId: 'b1' } as never, ended)).toMatchObject({ tone: 'ok', text: '2.44.21 is live on Development', time: '4m 09s' })
  })

  test('a finished fold keeps the names and counts the running row saw', () => {
    const last = { ...building(), endedAt: 300_000 }
    last.view!.stages[0] = { ...last.view!.stages[0]!, state: 'done', done: 18, endMs: 162_000 }
    const pruned = { done: true, status: 'succeeded', version: '2.44.19', images: [{ path: '.' }], deployments: [{ name: DEV, progress: { endTime: '2026-10-08T21:27:00Z' } }] }
    expect(foldOf({ stdout: JSON.stringify(pruned), stderr: LEAN }, last)).toMatchObject({ tone: 'ok', text: '2.44.19 is live on Development' })
  })

  for (const surface of ['terminal', 'desktop'] as const) {
    test(`a stopped watch offers Follow and Cancel on the ${surface}`, async ($, on) => {
      on('ui.render', { component: 'ToolResult' }, ($, e) =>
        renderOpsResult($.ui.resolve(e), { stdout: '', stderr: '', interrupted: true }, building(), e.surface, { follow: () => undefined, cancel: () => undefined }) ?? ({ type: 'Text', props: {}, children: ['engine'] } as never),
      )
      const drawn = JSON.stringify(await $.ui.render({ surface, component: 'ToolResult', requestId: 't3', props: { tool_use_id: 't3', tool: 'Bash', output: { stdout: '', stderr: '', interrupted: true }, isErrored: false } }))
      expect(drawn).toContain('Still building on Alis')
      expect(drawn).toContain('"label":"Follow"')
      expect(drawn).toContain('"label":"Cancel build"')
    })
  }

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

  test('a CLI error before any operation folds with its message', () => {
    // The CLI rejected the deploy, so the watcher never saw an operation.
    const last: LiveWait = { operation: null, target: 'acme.sm.hello.v1', verb: 'deploy', startedAt: 1_000, endedAt: 2_000, status: 'running', names: {} }
    const stdout = JSON.stringify({ error: { code: 'APPROVAL_REQUIRED', message: 'deploy to production needs approval\nre-run with --approve' } })
    expect(foldOf({ stdout, stderr: '', interrupted: false }, last)).toMatchObject({ tone: 'error', text: 'Deploy failed.', sub: 'deploy to production needs approval' })
  })

  test('a folded group goes by how the call ended, not by what the watcher last saw', () => {
    // A call that resolved before the watcher's own stream said how the operation ended.
    const midStream = { ...building(), endedAt: 200_000 }
    expect(foldOf(undefined, midStream)).toBe(null)
    expect(foldOf(undefined, { ...midStream, interrupted: true })).toMatchObject({ text: 'Still building on Alis', note: 'you stopped watching, not the build', cancel: true })
    expect(foldOf(undefined, { ...midStream, result: { name: 'operations/040fff29', done: true, version: '2.44.19' } })).toMatchObject({ tone: 'ok' })
  })
})
