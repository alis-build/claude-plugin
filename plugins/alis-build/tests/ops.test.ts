import { describe, expect, test, tier } from 'claude-code/testing'

import { alisCallOf, operationStateOf, progressEventsOf, summaryLinesOf } from '../hooks/mod/ops'
import { elapsedOf, liveAmong, liveOf, POLL_EVERY, TICK_MS, watchAlisCall } from '../hooks/mod/ops-live'
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

  test('summaryLinesOf collapses a finished operation and ignores other Bash output', () => {
    expect(summaryLinesOf({ stdout: '{"name":"operations/x","done":true,"version":"1.2.3"}', stderr: STDERR })).toEqual([
      'alis operation: done → 1.2.3',
      'operation: operations/x',
      'elapsed: 1:10',
      'last progress: Deploying revision',
      'progress lines: 3',
    ])
    expect(summaryLinesOf({ stdout: '', stderr: STDERR, interrupted: true })?.[0]).toBe('alis operation: interrupted')
    expect(summaryLinesOf({ stdout: '{"done":true,"error":"quota"}', stderr: STDERR })?.[0]).toBe('alis operation: failed: quota')
    const detached = summaryLinesOf({ stdout: '', stderr: STDERR + '\n{"elapsed":"1:12","warning":"timeout; operation still running","operation":"operations/x","next":"alis operations wait operations/x --json"}' })
    expect(detached).toEqual([
      'alis operation: detached',
      'operation: operations/x',
      'elapsed: 1:12',
      'last progress: Deploying revision',
      'warning: timeout; operation still running',
      'next: alis operations wait operations/x --json',
      'progress lines: 4',
    ])
    expect(summaryLinesOf({ stdout: 'hello', stderr: '' })).toBe(null)
    expect(summaryLinesOf('text')).toBe(null)
  })

  test('elapsedOf formats minutes and seconds', () => {
    expect(elapsedOf(0)).toBe('0:00')
    expect(elapsedOf(65_000)).toBe('1:05')
    expect(elapsedOf(-5)).toBe('0:00')
  })
})

describe('ops-live', () => {
  const envelope = (command: string) => ({ tool: 'Bash', tool_use_id: 'toolu_9', command })

  test('a wait keeps live state from describe polls, redraws each tick, and forgets the call when it resolves', async () => {
    const host = fakeHost({ answer: () => ({ exitCode: 0, stdout: '{"done":false,"status":"building"}', stderr: '' }) })
    let resolve!: (r: { result: string }) => void
    const pending = new Promise<{ result: string }>(r => (resolve = r))
    const controller = new AbortController()

    const outcome = watchAlisCall(host, envelope('alis operations wait operations/x --json'), () => pending, controller.signal)
    await settle()

    expect(liveOf('toolu_9')).toMatchObject({ operation: 'operations/x', status: 'building' })
    expect(liveAmong([{ tool_use_id: 'other', isRunning: true }, { tool_use_id: 'toolu_9', isRunning: true }])).toBe(liveOf('toolu_9'))
    expect(liveAmong([{ tool_use_id: 'toolu_9', isRunning: false }])).toBe(undefined)
    expect(host.timers).toEqual([expect.objectContaining({ ms: TICK_MS, cancelled: false })])
    expect(host.runs[0]?.argv).toEqual(['alis', 'operations', 'describe', 'operations/x', '--json'])
    expect(host.invalidations).toBe(1)

    host.answer = () => ({ exitCode: 0, stdout: '{"done":true,"version":"1.2.3"}', stderr: '' })
    for (let i = 0; i < POLL_EVERY; i++) host.timers[0]?.fn()
    await settle()
    expect(host.runs).toHaveLength(2)
    expect(liveOf('toolu_9')?.status).toBe('done → 1.2.3')
    expect(host.invalidations).toBe(1 + POLL_EVERY + 1)

    resolve({ result: 'ok' })
    expect(await outcome).toEqual({ result: 'ok' })
    expect(host.timers[0]?.cancelled).toBe(true)
    expect(liveOf('toolu_9')).toBe(undefined)
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
