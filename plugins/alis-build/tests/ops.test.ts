import { describe, expect, test, tier } from 'claude-code/testing'

import { alisCallOf, operationStateOf, progressEventsOf, watchEventsOf } from '../hooks/mod/ops'
import { backgroundOps, endedTextOf, finishedOf, followedElsewhere, forgetOps, liveOf, opsAmong, POLL_EVERY, TICK_MS, watchAlisCall } from '../hooks/mod/ops-live'
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
    // The target after the flags, a flag's value never taken for it, and no target at all.
    expect(alisCallOf('alis build --deploy -e dev acme.sm.hello.v1 --json')).toEqual({ kind: 'start', verb: 'build', target: 'acme.sm.hello.v1', async: false })
    expect(alisCallOf('alis deploy -e dev --version 1.2.3 acme.sm.hello.v1 --client-call toolu_1')).toEqual({ kind: 'start', verb: 'deploy', target: 'acme.sm.hello.v1', async: false, version: '1.2.3' })
    expect(alisCallOf('alis --cwd /x build --environment=dev --json')).toEqual({ kind: 'start', verb: 'build', target: null, async: false })
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
    expect(opsAmong([{ tool_use_id: 'other', isRunning: true }, { tool_use_id: 'toolu_9', isRunning: true }])).toEqual([{ id: 'toolu_9', live: liveOf('toolu_9') }])
    expect(opsAmong([{ tool_use_id: 'toolu_9', isRunning: false }])).toEqual([])
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
    // An older CLI: it refuses --call, and is asked that way once only.
    const host = fakeHost({
      answer: run => (run.argv[2] === 'list' && !run.argv.includes('--call') ? { exitCode: 0, stdout: listed, stderr: '' } : { exitCode: 1, stdout: '', stderr: '' }),
    })
    void watchAlisCall(host, envelope('alis build acme.sm.hello.v1 --deploy -e dev --json'), () => new Promise(() => {}), new AbortController().signal)
    await settle()
    expect(liveOf('toolu_9')).toMatchObject({ operation: null, target: 'acme.sm.hello.v1', verb: 'build' })
    expect(host.spawns).toHaveLength(0)
    expect(host.runs.map(run => run.argv.includes('--call'))).toEqual([true, false])

    listed = `{"operations":[{"name":"operations/new","type":"build","target":"acme.sm.hello.v1","startedAt":"${new Date().toISOString()}"}]}`
    for (let i = 0; i < POLL_EVERY; i++) host.timers[0]?.fn()
    await settle()
    expect(liveOf('toolu_9')?.operation).toBe('operations/new')
    expect(host.spawns[0]?.argv).toEqual(['alis', 'operations', 'wait', 'operations/new', '--json', '--verbose'])
    expect(host.runs.filter(run => run.argv.includes('--call'))).toHaveLength(1)
  })

  test('a blocking start finds the operation its own call started, whatever its target', async () => {
    // Two builds of one target started together: the listing by call names this call's alone.
    const all = `{"operations":[{"name":"operations/theirs","type":"build","target":"acme.sm.hello.v1","startedAt":"${new Date().toISOString()}"}]}`
    const mine = '{"operations":[{"name":"operations/mine","type":"build","target":"acme.sm.hello.v1","startedAt":"2026-10-09T05:56:00Z","call":"toolu_9"}]}'
    const host = fakeHost({
      answer: run => {
        if (run.argv[2] !== 'list') return { exitCode: 1, stdout: '', stderr: '' }
        const call = run.argv.indexOf('--call')
        return { exitCode: 0, stdout: call === -1 ? all : run.argv[call + 1] === 'toolu_9' ? mine : '{"operations":[]}', stderr: '' }
      },
    })
    // No target on the line (the CLI takes the folder's): only the call names the operation.
    void watchAlisCall(host, envelope('alis build --deploy -e dev --json'), () => new Promise(() => {}), new AbortController().signal)
    await settle()
    expect(liveOf('toolu_9')).toMatchObject({ operation: 'operations/mine', target: 'acme.sm.hello.v1' })
    expect(host.runs[0]?.argv).toEqual(['alis', 'operations', 'list', '--call', 'toolu_9', '--json'])
    expect(host.spawns[0]?.argv).toEqual(['alis', 'operations', 'wait', 'operations/mine', '--json', '--verbose'])
  })

  test('with no target and no record of the call, nothing is guessed', async () => {
    const listed = `{"operations":[{"name":"operations/other","type":"build","startedAt":"${new Date().toISOString()}"},{"name":"operations/undated","type":"build","target":"acme.sm.hello.v1","startedAt":"not a time"}]}`
    const host = fakeHost({
      answer: run => (run.argv[2] === 'list' ? { exitCode: 0, stdout: run.argv.includes('--call') ? '{"operations":[]}' : listed, stderr: '' } : { exitCode: 1, stdout: '', stderr: '' }),
    })
    void watchAlisCall(host, envelope('alis build --json'), () => new Promise(() => {}), new AbortController().signal)
    await settle()
    expect(liveOf('toolu_9')).toMatchObject({ operation: null, target: null })
    expect(host.spawns).toHaveLength(0)
  })

  test('an operation with an unreadable start time is never taken for the call\'s', async () => {
    const listed = '{"operations":[{"name":"operations/undated","type":"build","target":"acme.sm.hello.v1","startedAt":"not a time"}]}'
    const host = fakeHost({
      answer: run => (run.argv[2] === 'list' && !run.argv.includes('--call') ? { exitCode: 0, stdout: listed, stderr: '' } : { exitCode: 1, stdout: '', stderr: '' }),
    })
    void watchAlisCall(host, envelope('alis build acme.sm.hello.v1 --json'), () => new Promise(() => {}), new AbortController().signal)
    await settle()
    expect(liveOf('toolu_9')?.operation).toBe(null)
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
    expect(opsAmong([{ tool_use_id: 'toolu_bg', isRunning: false }])).toEqual([{ id: 'toolu_bg', live: liveOf('toolu_bg') }])

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
    // Nobody was waiting on it: its end is announced, once.
    expect(host.notifications).toEqual([{ text: '2.44.21 is built', title: 'Alis' }])
    expect(opsAmong([{ tool_use_id: 'other', isRunning: false }, { tool_use_id: 'toolu_bg', isRunning: false }])).toEqual([{ id: 'toolu_bg', finished: finishedOf('toolu_bg') }])
  })

  test('parallel background waits in one group each keep a row, live or ended', async () => {
    // Two operations at once, as when Claude waits on two builds in one message.
    const done = new Set<string>()
    const host = fakeHost({
      answer: run => {
        const op = run.argv[3] ?? ''
        if (run.argv[2] !== 'describe') return { exitCode: 1, stdout: '', stderr: '' }
        return { exitCode: 0, stdout: done.has(op) ? `{"done":true,"version":"${op === 'operations/a' ? '2.50.9' : '1.6.1'}"}` : '{"done":false,"status":"building"}', stderr: '' }
      },
    })
    host.spawnError = new Error('no child in the background')
    const background = async () => ({ result: { stdout: '', stderr: '', interrupted: false, backgroundTaskId: 'b' } })
    const wait = (id: string, op: string) => watchAlisCall(host, { tool: 'Bash', tool_use_id: id, command: `alis operations wait ${op} --json`, run_in_background: true }, background, new AbortController().signal)
    await wait('toolu_a', 'operations/a')
    await wait('toolu_b', 'operations/b')
    const group = [
      { tool_use_id: 'toolu_a', isRunning: false },
      { tool_use_id: 'toolu_b', isRunning: false },
    ]
    expect(opsAmong(group).map(op => [op.id, op.live?.operation])).toEqual([
      ['toolu_a', 'operations/a'],
      ['toolu_b', 'operations/b'],
    ])

    // The first ends: its outcome stays in the group while the second runs on.
    done.add('operations/a')
    const [timerA, timerB] = host.timers.slice(-2)
    for (let i = 0; i < POLL_EVERY; i++) timerA!.fn()
    await settle()
    expect(opsAmong(group).map(op => [op.id, op.live ? 'live' : op.finished.result?.version])).toEqual([
      ['toolu_a', '2.50.9'],
      ['toolu_b', 'live'],
    ])

    done.add('operations/b')
    for (let i = 0; i < POLL_EVERY; i++) timerB!.fn()
    await settle()
    expect(opsAmong(group).map(op => op.finished?.result?.version)).toEqual(['2.50.9', '1.6.1'])
  })

  test('a deploy keeps its --version; a define is followed, a dry run is not', async () => {
    const host = fakeHost()
    void watchAlisCall(host, envelope('alis deploy acme.sm.hello.v1 --version 1.2.3 -e prod --json'), () => new Promise(() => {}), new AbortController().signal)
    await settle()
    expect(liveOf('toolu_9')).toMatchObject({ verb: 'deploy', version: '1.2.3' })
    const other = { tool: 'Bash', tool_use_id: 'toolu_10', command: 'alis define acme.sm.hello.v1 --json' }
    await watchAlisCall(host, other, async () => ({}), new AbortController().signal)
    expect(liveOf('toolu_10')).toBe(undefined)
    expect(finishedOf('toolu_10')).toMatchObject({ verb: 'define', target: 'acme.sm.hello.v1' })
    const timers = host.timers.length
    await watchAlisCall(host, { tool: 'Bash', tool_use_id: 'toolu_11', command: 'alis define acme.sm.hello.v1 --dry-run --json' }, async () => ({}), new AbortController().signal)
    expect(finishedOf('toolu_11')).toBe(undefined)
    expect(host.timers).toHaveLength(timers)
  })

  test('a CLI with `operations watch` is followed through its events, and a define draws its packages', async () => {
    const host = fakeHost({
      answer: run => (run.argv.includes('--call') ? { exitCode: 0, stdout: '{"operations":[{"name":"operations/def1","type":"define","target":"acme.sm.hello.v1","startedAt":"2026-10-09T05:56:00Z","call":"toolu_def"}]}', stderr: '' } : { exitCode: 1, stdout: '', stderr: '' }),
    })
    host.env['HOME'] = '/home/u'
    host.files['/home/u/.alis/versions-cache.json'] = JSON.stringify({ cliVersion: '1.188.0' })
    void watchAlisCall(host, { tool: 'Bash', tool_use_id: 'toolu_def', command: 'alis define --json' }, () => new Promise(() => {}), new AbortController().signal)
    await settle()
    await settle()
    expect(host.spawns[0]?.argv).toEqual(['alis', 'operations', 'watch', 'operations/def1'])
    const event = (done: boolean, states: string[]) =>
      `${JSON.stringify({ schemaVersion: 1, operation: 'operations/def1', kind: 'define', elapsed: '0:10', done, status: done ? 'succeeded' : 'running', version: '3.1.0', snapshot: { done, version: '3.1.0', artifacts: states.map((state, i) => ({ name: `packages/acme.sm.hello.v1/versions/3.1.0/artifacts/${['golang_artifact_registry', 'ecmascript_npm'][i]}`, state })) } })}\n`
    // An event split across two chunks is read once it is whole.
    const first = event(false, ['GENERATED', 'GENERATING'])
    host.spawns[0]?.write('stdout', first.slice(0, 40))
    await settle()
    expect(liveOf('toolu_def')?.define).toBe(undefined)
    host.spawns[0]?.write('stdout', first.slice(40))
    await settle()
    expect(liveOf('toolu_def')).toMatchObject({ kind: 'define', version: '3.1.0', define: { done: 1, total: 2, generating: 'ecmascript' } })
    host.spawns[0]?.write('stderr', 'noise the CLI printed\n')
    host.spawns[0]?.write('stdout', event(true, ['GENERATED', 'GENERATED']))
    host.spawns[0]?.exit(0)
    await settle()
    expect(liveOf('toolu_def')).toMatchObject({ define: { done: 2, total: 2 }, result: { done: true, version: '3.1.0' } })
    expect(endedTextOf(liveOf('toolu_def')!)).toBe('hello.v1 3.1.0 is defined')
  })

  test('watchEventsOf keeps whole events and skips the rest', () => {
    expect(watchEventsOf('{"operation":"operations/x","kind":"build","done":false,"status":"running","snapshot":{"images":[]}}\nnot json\n{"operation":"operations/x","done":true}\n{"elapsed":"0:01"}')).toEqual([
      { operation: 'operations/x', kind: 'build', done: false, status: 'running', snapshot: { images: [] } },
    ])
    expect(watchEventsOf(undefined)).toEqual([])
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

  test('the call keeps its own ending: the outcome it printed, or an interrupt', async () => {
    const host = fakeHost({ answer: () => ({ exitCode: 1, stdout: '', stderr: '' }) })
    const bash = (stdout: string, interrupted = false) => async () => ({ result: { stdout, stderr: '', interrupted } })
    // Resolves before the watcher's own stream has said how the operation ended.
    await watchAlisCall(host, envelope('alis operations wait operations/x --json'), bash('{"name":"operations/x","done":true,"version":"2.44.19"}'), new AbortController().signal)
    expect(finishedOf('toolu_9')).toMatchObject({ result: { done: true, version: '2.44.19' } })
    expect(finishedOf('toolu_9')?.interrupted).toBe(undefined)

    await watchAlisCall(host, { ...envelope('alis operations wait operations/y --json'), tool_use_id: 'toolu_10' }, bash('', true), new AbortController().signal)
    expect(finishedOf('toolu_10')?.interrupted).toBe(true)

    const controller = new AbortController()
    void watchAlisCall(host, { ...envelope('alis operations wait operations/z --json'), tool_use_id: 'toolu_11' }, () => new Promise(() => {}), controller.signal)
    controller.abort()
    expect(finishedOf('toolu_11')?.interrupted).toBe(true)
  })

  test('an --async start is followed for the band until the operation ends, and announced', async () => {
    const started = '{"schemaVersion":1,"name":"operations/async1","done":false,"status":"running","version":"2.44.30","metadata":{}}'
    const running = '{"done":false,"status":"running","version":"2.44.30","images":[{"path":".","progress":{"startTime":"2026-10-09T05:56:00Z"}}]}'
    const host = fakeHost({
      answer: run => (run.argv[2] === 'describe' ? { exitCode: 0, stdout: running, stderr: '' } : { exitCode: 1, stdout: '', stderr: '' }),
    })
    host.spawnError = new Error('no child')
    const call = { tool: 'Bash', tool_use_id: 'toolu_async', command: 'alis build acme.sm.hello.v1 --deploy -e dev --async --json' }
    let resolve!: (value: unknown) => void
    const pending = watchAlisCall(host, call, () => new Promise(r => (resolve = r)), new AbortController().signal)
    // Until the start returns there is nothing to follow, and no row for the call.
    expect(liveOf('toolu_async')).toBe(undefined)
    expect(host.timers).toHaveLength(0)
    resolve({ result: { stdout: started, stderr: '', interrupted: false } })
    await pending
    await settle()
    expect(liveOf('toolu_async')).toMatchObject({ operation: 'operations/async1', background: true, detached: true, version: '2.44.30' })
    expect(backgroundOps().map(op => op.operation)).toEqual(['operations/async1'])

    // A wait on the same operation draws its own row: the band leaves it to that row.
    void watchAlisCall(host, { tool: 'Bash', tool_use_id: 'toolu_wait', command: 'alis operations wait operations/async1 --json' }, () => new Promise(() => {}), new AbortController().signal)
    expect(backgroundOps()).toEqual([])

    host.answer = run => (run.argv[2] === 'describe' ? { exitCode: 0, stdout: '{"done":true,"status":"failed","error":"quota exceeded"}', stderr: '' } : { exitCode: 1, stdout: '', stderr: '' })
    const timer = host.timers[0]!
    for (let i = 0; i < POLL_EVERY; i++) timer.fn()
    await settle()
    expect(liveOf('toolu_async')).toBe(undefined)
    expect(finishedOf('toolu_async')).toMatchObject({ detached: true, result: { done: true, error: 'quota exceeded' } })
    // The wait is still on it: how it ended is that call's to say, not a notification's.
    expect(host.notifications).toEqual([])
    expect(followedElsewhere(finishedOf('toolu_async'))).toBe(true)
  })

  test('an --async start nothing waits on is announced when it ends, and a group draws it once', async () => {
    forgetOps()
    const started = '{"schemaVersion":1,"name":"operations/async2","done":false,"status":"running","version":"2.44.31","metadata":{}}'
    const host = fakeHost({
      answer: run => (run.argv[2] === 'describe' ? { exitCode: 0, stdout: '{"done":true,"status":"failed","error":"quota exceeded"}', stderr: '' } : { exitCode: 1, stdout: '', stderr: '' }),
    })
    host.spawnError = new Error('no child')
    await watchAlisCall(host, { tool: 'Bash', tool_use_id: 'toolu_start', command: 'alis build acme.sm.hello.v1 --async --json' }, async () => ({ result: { stdout: started, stderr: '', interrupted: false } }), new AbortController().signal)
    await settle()
    // The start and the wait that follows it in one folded group: one row, the wait's.
    void watchAlisCall(host, { tool: 'Bash', tool_use_id: 'toolu_w', command: 'alis operations wait operations/async2 --json' }, () => new Promise(() => {}), new AbortController().signal)
    const group = [{ tool_use_id: 'toolu_start', isRunning: false }, { tool_use_id: 'toolu_w', isRunning: true }]
    expect(opsAmong(group).map(op => op.id)).toEqual(['toolu_w'])

    // With no wait on it, the start is the band's, and its end is announced.
    forgetOps()
    const alone = fakeHost({ answer: host.answer })
    alone.spawnError = new Error('no child')
    await watchAlisCall(alone, { tool: 'Bash', tool_use_id: 'toolu_start', command: 'alis build acme.sm.hello.v1 --async --json' }, async () => ({ result: { stdout: started, stderr: '', interrupted: false } }), new AbortController().signal)
    await settle()
    expect(opsAmong([{ tool_use_id: 'toolu_start', isRunning: false }])).toEqual([])
    expect(backgroundOps().map(op => op.operation)).toEqual(['operations/async2'])
    for (let i = 0; i < POLL_EVERY; i++) alone.timers[0]!.fn()
    await settle()
    expect(alone.notifications).toHaveLength(1)
    expect(alone.notifications[0]?.text).toBe('hello.v1 build failed. quota exceeded')
    // Ended with nothing else on it: its own row says how.
    expect(opsAmong([{ tool_use_id: 'toolu_start', isRunning: false }]).map(op => op.id)).toEqual(['toolu_start'])
  })

  test('an --async start that did not start, or already ended, is not followed', async () => {
    const host = fakeHost()
    const run = (id: string, stdout: string) => watchAlisCall(host, { tool: 'Bash', tool_use_id: id, command: 'alis deploy acme.sm.hello.v1 --async --json' }, async () => ({ result: { stdout, stderr: '', interrupted: false } }), new AbortController().signal)
    await run('toolu_a1', '{"error":{"code":"PRODUCTION_CONFIRMATION_REQUIRED","message":"confirm"}}')
    await run('toolu_a2', '{"name":"operations/x","done":true,"status":"succeeded"}')
    await run('toolu_a3', 'not json')
    expect([liveOf('toolu_a1'), liveOf('toolu_a2'), liveOf('toolu_a3')]).toEqual([undefined, undefined, undefined])
    expect(host.timers).toHaveLength(0)
    expect(host.notifications).toEqual([])
  })

  test('endedTextOf says how a followed operation ended', () => {
    const base = { operation: 'operations/x', target: 'acme.sm.hello.v1', verb: 'deploy', startedAt: 0, status: 'done', names: {} }
    expect(endedTextOf({ ...base, version: '1.2.3', result: { done: true } })).toBe('The deploy finished')
    expect(endedTextOf({ ...base, result: { done: true, error: 'apply failed: quota' } })).toBe('hello.v1 deploy failed. apply failed: quota')
  })

})
