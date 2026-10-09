import { describe, expect, test, tier } from 'claude-code/testing'

import { alisCallOf, operationStateOf, progressEventsOf } from '../hooks/mod/ops'
import { finishedAmong, finishedOf, liveAmong, liveOf, POLL_EVERY, TICK_MS, watchAlisCall } from '../hooks/mod/ops-live'
import { fakeHost } from './fixtures/fake-host'

tier('user')

/** Lets the hook's awaited host calls run to completion (no timers involved). */
async function settle() {
  for (let i = 0; i < 20; i++) await Promise.resolve()
}

const STDERR = [
  '{"elapsed":"0:03","progress":"Fetching sources"}',
  'plain text the CLI printed',
  '{"elapsed":"0:41","progress":"Building image"}',
  '{"elapsed":"1:10","progress":"Deploying revision"}',
].join('\n')

describe('ops', () => {
  test('alisCallOf recognises waits and streamed starts only', () => {
    expect(alisCallOf('alis operations wait operations/abc --json')).toEqual({ kind: 'wait', operation: 'operations/abc' })
    expect(alisCallOf('alis --cwd /x ops wait operations/abc --json --session-id s')).toEqual({ kind: 'wait', operation: 'operations/abc' })
    expect(alisCallOf('alis build acme.sm.hello.v1 --json --deploy -e dev')).toEqual({ kind: 'start', verb: 'build', target: 'acme.sm.hello.v1', async: false })
    expect(alisCallOf('alis deploy acme.sm.hello.v1 --json --async')).toEqual({ kind: 'start', verb: 'deploy', target: 'acme.sm.hello.v1', async: true })
    expect(alisCallOf('alis operations wait')).toBe(null)
    expect(alisCallOf('alis operations describe operations/abc --json')).toBe(null)
    expect(alisCallOf('alis whoami --json')).toBe(null)
    expect(alisCallOf('alis build x && echo')).toBe(null)
    expect(alisCallOf(42)).toBe(null)
  })

  test('progressEventsOf keeps the CLI progress lines and skips the rest', () => {
    expect(progressEventsOf(STDERR)).toEqual([
      { elapsed: '0:03', progress: 'Fetching sources' },
      { elapsed: '0:41', progress: 'Building image' },
      { elapsed: '1:10', progress: 'Deploying revision' },
    ])
    expect(progressEventsOf('{"elapsed":"0:01","warning":"lost connection; operation still running","operation":"operations/x","next":"alis operations wait operations/x --json"}')).toEqual([
      { elapsed: '0:01', warning: 'lost connection; operation still running', operation: 'operations/x', next: 'alis operations wait operations/x --json' },
    ])
    expect(progressEventsOf('{"no":"elapsed"}\n{broken')).toEqual([])
    expect(progressEventsOf(undefined)).toEqual([])
  })

  test('operationStateOf reads the common top-level fields', () => {
    expect(operationStateOf('{"schemaVersion":1,"name":"operations/x","done":true,"status":"done","version":"1.2.3"}')).toEqual({ name: 'operations/x', done: true, status: 'done', version: '1.2.3' })
    expect(operationStateOf('{"done":false,"error":{"message":"boom"}}')).toEqual({ done: false, error: 'boom' })
    expect(operationStateOf('not json')).toBe(null)
    expect(operationStateOf('[1]')).toBe(null)
  })
})

describe('ops-live', () => {
  const envelope = (command: string) => ({ tool: 'Bash', tool_use_id: 'toolu_9', command })

  test('a wait learns its target, follows the verbose stream, and keeps what it saw once the call resolves', async () => {
    const host = fakeHost({
      answer: run =>
        run.argv[2] === 'list' && run.argv[1] === 'operations'
          ? { exitCode: 0, stdout: '{"operations":[{"name":"operations/x","type":"build","target":"acme.sm.hello.v1","startedAt":"2026-10-08T21:22:58Z"}]}', stderr: '' }
          : run.argv[1] === 'environment'
            ? { exitCode: 0, stdout: '{"environments":[{"id":"env1","displayName":"Development","production":false,"status":"ACTIVE"}]}', stderr: '' }
            : { exitCode: 0, stdout: '{"done":false,"status":"building"}', stderr: '' },
    })
    let resolve!: (r: { result: string }) => void
    const pending = new Promise<{ result: string }>(r => (resolve = r))
    const outcome = watchAlisCall(host, envelope('alis operations wait operations/x --json'), () => pending, new AbortController().signal)
    await settle()

    expect(host.runs[0]?.argv).toEqual(['alis', 'operations', 'list', '--json'])
    expect(host.spawns[0]?.argv).toEqual(['alis', 'operations', 'wait', 'operations/x', '--json', '--verbose'])
    expect(liveOf('toolu_9')).toMatchObject({ operation: 'operations/x', target: 'acme.sm.hello.v1', names: { env1: 'Development' } })
    expect(liveAmong([{ tool_use_id: 'other', isRunning: true }, { tool_use_id: 'toolu_9', isRunning: true }])).toBe(liveOf('toolu_9'))
    expect(liveAmong([{ tool_use_id: 'toolu_9', isRunning: false }])).toBe(undefined)
    expect(host.timers).toEqual([expect.objectContaining({ ms: TICK_MS, cancelled: false })])

    // A snapshot split across two writes is read once it is whole.
    const snapshot = JSON.stringify({ version: '2.44.19', done: false, images: [{ path: '.', progress: { startTime: '2026-10-08T21:22:54Z', buildSteps: [
      { name: '[1/3] FROM node', status: 'DONE', cached: true, stepNumber: 1, totalSteps: 3 },
      { name: '[2/3] RUN pnpm install', status: 'RUNNING', stepNumber: 2, totalSteps: 3 },
      { name: '[3/3] RUN pnpm build', status: 'PENDING', stepNumber: 3, totalSteps: 3 },
    ] } }], deployments: [{ name: 'organisations/acme/products/sm/environments/env1/deployments/hello', state: 'PENDING' }] })
    host.spawns[0]?.write('stderr', snapshot.slice(0, 40))
    await settle()
    expect(liveOf('toolu_9')?.view).toBe(undefined)
    host.spawns[0]?.write('stderr', snapshot.slice(40) + '\n')
    await settle()
    const view = liveOf('toolu_9')?.view
    expect(view?.version).toBe('2.44.19')
    expect(view?.stages.map(s => [s.kind, s.name, s.state, s.done, s.total, s.cached])).toEqual([
      ['build', '.', 'running', 1, 3, 1],
      ['deploy', 'Development', 'waiting', 0, 0, 0],
    ])

    // While the stream lasts, the clock redraws but does not describe.
    const runs = host.runs.length
    for (let i = 0; i < POLL_EVERY; i++) host.timers[0]?.fn()
    await settle()
    expect(host.runs).toHaveLength(runs)

    resolve({ result: 'ok' })
    expect(await outcome).toEqual({ result: 'ok' })
    await settle()
    expect(host.timers[0]?.cancelled).toBe(true)
    expect(host.spawns[0]?.returned).toBe(true)
    expect(liveOf('toolu_9')).toBe(undefined)
    expect(finishedOf('toolu_9')?.view?.version).toBe('2.44.19')
  })

  test('a blocking build finds its operation in the listing by target and start time', async () => {
    let listed = '{"operations":[{"name":"operations/old","type":"build","target":"acme.sm.hello.v1","startedAt":"2020-01-01T00:00:00Z"}]}'
    const host = fakeHost({
      answer: run => (run.argv[2] === 'list' ? { exitCode: 0, stdout: listed, stderr: '' } : { exitCode: 1, stdout: '', stderr: '' }),
    })
    void watchAlisCall(host, envelope('alis build acme.sm.hello.v1 --deploy -e dev --json'), () => new Promise(() => {}), new AbortController().signal)
    await settle()
    expect(liveOf('toolu_9')).toMatchObject({ operation: null, target: 'acme.sm.hello.v1', verb: 'build' })
    expect(host.spawns).toHaveLength(0)

    listed = `{"operations":[{"name":"operations/new","type":"build","target":"acme.sm.hello.v1","startedAt":"${new Date().toISOString()}"}]}`
    for (let i = 0; i < POLL_EVERY; i++) host.timers[0]?.fn()
    await settle()
    expect(liveOf('toolu_9')?.operation).toBe('operations/new')
    expect(host.spawns[0]?.argv).toEqual(['alis', 'operations', 'wait', 'operations/new', '--json', '--verbose'])
  })

  test('a background wait outlives its call, polls on the clock, and stops once the operation ends', async () => {
    const host = fakeHost({
      answer: run => (run.argv[2] === 'describe' ? { exitCode: 0, stdout: '{"done":false,"status":"running","version":"2.44.21","images":[{"path":".","progress":{"startTime":"2026-10-09T05:56:00Z"}}]}', stderr: '' } : { exitCode: 1, stdout: '', stderr: '' }),
    })
    host.spawnError = new Error('no child in the background')
    const controller = new AbortController()
    const call = { tool: 'Bash', tool_use_id: 'toolu_bg', command: 'alis operations wait operations/bg --json', run_in_background: true }
    const result = await watchAlisCall(host, call, async () => ({ result: { stdout: '', stderr: '', interrupted: false, backgroundTaskId: 'b1' } }), controller.signal)
    expect(result).toMatchObject({ result: { backgroundTaskId: 'b1' } })
    // The dispatch is over, so its abort no longer ends the row.
    controller.abort()
    expect(liveOf('toolu_bg')).toMatchObject({ background: true, operation: 'operations/bg' })
    expect(liveAmong([{ tool_use_id: 'toolu_bg', isRunning: false }])).toBe(liveOf('toolu_bg'))

    const timer = host.timers.at(-1)!
    for (let i = 0; i < POLL_EVERY; i++) timer.fn()
    await settle()
    expect(liveOf('toolu_bg')?.view?.version).toBe('2.44.21')

    host.answer = () => ({ exitCode: 0, stdout: '{"done":true,"status":"succeeded","version":"2.44.21"}', stderr: '' })
    for (let i = 0; i < POLL_EVERY; i++) timer.fn()
    await settle()
    expect(liveOf('toolu_bg')).toBe(undefined)
    expect(timer.cancelled).toBe(true)
    expect(finishedOf('toolu_bg')).toMatchObject({ background: true, result: { done: true, version: '2.44.21' } })
    expect(finishedAmong([{ tool_use_id: 'other' }, { tool_use_id: 'toolu_bg' }])).toBe(finishedOf('toolu_bg'))
  })

  test('a deploy keeps its --version; async starts and defines are left alone', async () => {
    const host = fakeHost()
    void watchAlisCall(host, envelope('alis deploy acme.sm.hello.v1 --version 1.2.3 -e prod --json'), () => new Promise(() => {}), new AbortController().signal)
    await settle()
    expect(liveOf('toolu_9')).toMatchObject({ verb: 'deploy', version: '1.2.3' })
    const other = { tool: 'Bash', tool_use_id: 'toolu_10', command: 'alis define acme.sm.hello.v1 --json' }
    await watchAlisCall(host, other, async () => ({}), new AbortController().signal)
    expect(liveOf('toolu_10')).toBe(undefined)
  })

  test("the stream's outcome sets the status; a stream that ends early hands back to polling", async () => {
    const host = fakeHost({ answer: () => ({ exitCode: 0, stdout: '{"done":false,"status":"queued"}', stderr: '' }) })
    void watchAlisCall(host, envelope('alis operations wait operations/x --json'), () => new Promise(() => {}), new AbortController().signal)
    await settle()
    host.spawns[0]?.write('stdout', '{"done":true,')
    host.spawns[0]?.write('stdout', '"version":"4.5.6"}')
    host.spawns[0]?.exit(0)
    await settle()
    expect(liveOf('toolu_9')?.status).toBe('done → 4.5.6')

    host.answer = () => ({ exitCode: 0, stdout: '{"done":false,"status":"deploying"}', stderr: '' })
    for (let i = 0; i < POLL_EVERY; i++) host.timers[0]?.fn()
    await settle()
    expect(liveOf('toolu_9')?.status).toBe('deploying')
  })

  test('a child that cannot start is logged and the polling carries on', async () => {
    const host = fakeHost({ answer: () => ({ exitCode: 0, stdout: '{"done":false,"status":"building"}', stderr: '' }) })
    host.spawnError = new Error('ENOENT alis')
    const controller = new AbortController()
    void watchAlisCall(host, envelope('alis operations wait operations/z --json'), () => new Promise(() => {}), controller.signal)
    await settle()
    expect(host.logs.some(l => l.includes('ENOENT alis'))).toBe(true)
    const described = host.runs.length
    for (let i = 0; i < POLL_EVERY; i++) host.timers[0]?.fn()
    await settle()
    expect(host.runs.length).toBe(described + 1)
    controller.abort()
  })

  test('other Bash calls pass straight through with no timer or state', async () => {
    const host = fakeHost()
    const result = await watchAlisCall(host, envelope('alis build x --json --async'), async () => ({ result: 'r' }), new AbortController().signal)
    expect(result).toEqual({ result: 'r' })
    expect(host.timers).toEqual([])
    expect(liveOf('toolu_9')).toBe(undefined)
    await watchAlisCall(host, { tool: 'Bash', command: 'ls' }, async () => ({}), new AbortController().signal)
    expect(host.runs).toEqual([])
  })

  test('an abort stops the polling and forgets the call; a failing describe is logged', async () => {
    const host = fakeHost({ answer: () => new Error('ENOENT') })
    const controller = new AbortController()
    const never = new Promise<never>(() => {})
    void watchAlisCall(host, envelope('alis operations wait operations/y --json'), () => never, controller.signal)
    await settle()
    expect(host.logs.some(l => l.includes('ENOENT'))).toBe(true)
    expect(liveOf('toolu_9')?.status).toBe('running')
    controller.abort()
    expect(host.timers[0]?.cancelled).toBe(true)
    expect(liveOf('toolu_9')).toBe(undefined)
  })
})
