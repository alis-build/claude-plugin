import { describe, expect, test, tier } from 'claude-code/testing'

import { classicState } from '../hooks/mod/classic'
import { cliGateClassic } from '../hooks/mod/cli-gate-classic'
import { ABORT_REASON, approvedCalls, ASK_OPTIONS, confirmDeploy, deployCallOf, environmentsOf, questionOf } from '../hooks/mod/deploy-dialog'
import { fakeHost, type Run } from './fixtures/fake-host'

tier('user')

const ENVS = JSON.stringify({
  environments: [
    { id: 'dev1', displayName: 'Development', production: false, status: 'ACTIVE', allowedBranches: [] },
    { id: 'prod1', displayName: 'Production', production: true, status: 'ACTIVE', allowedBranches: [] },
  ],
})
const answerEnvs = (run: Run) => (run.argv[1] === 'environment' ? { exitCode: 0, stdout: ENVS, stderr: '' } : { exitCode: 0, stdout: '', stderr: '' })
const envelope = (command: string) => ({ tool: 'Bash', tool_use_id: 't1', command })
const PROD = 'alis deploy acme.sm.hello.v1 -e prod1 --version 1.2.3 --json --confirm-production'

describe('deploy-dialog', () => {
  test('deployCallOf reads target, environments, version and flags', () => {
    expect(deployCallOf(PROD)).toEqual({ target: 'acme.sm.hello.v1', environments: ['prod1'], version: '1.2.3', confirmProduction: true, planOnly: false })
    expect(deployCallOf('alis --cwd /x deploy --environment=dev1 -e prod1,dev1 --plan-only --json')).toEqual({
      target: null, environments: ['dev1', 'prod1', 'dev1'], version: null, confirmProduction: false, planOnly: true,
    })
    expect(deployCallOf('alis release acme.sm.hello.v1 --json')?.target).toBe('acme.sm.hello.v1')
    expect(deployCallOf('alis build acme.sm.hello.v1 --json')).toBe(null)
    expect(deployCallOf('alis deploy x && echo')).toBe(null)
  })

  test('environmentsOf reads the listing and is empty on failure', async () => {
    const host = fakeHost({ answer: answerEnvs })
    expect((await environmentsOf(host, 'acme.sm')).map(e => [e.id, e.production])).toEqual([['dev1', false], ['prod1', true]])
    expect(host.runs[0]?.argv).toEqual(['alis', 'environment', 'list', 'acme.sm', '--json'])
    expect(await environmentsOf(fakeHost({ answer: () => new Error('ENOENT') }), 'acme.sm')).toEqual([])
    expect(await environmentsOf(fakeHost({ answer: () => ({ exitCode: 0, stdout: 'junk', stderr: '' }) }), 'acme.sm')).toEqual([])
  })

  test('questionOf names the target, version and every environment', () => {
    expect(questionOf({ target: 'acme.sm.hello.v1', version: '1.2.3', unresolved: ['ghost'], environments: [{ id: 'prod1', displayName: 'Production', production: true, status: 'ACTIVE' }] })).toBe(
      "Deploy acme.sm.hello.v1 version 1.2.3 to Production (prod1, ACTIVE, PRODUCTION) and ghost (not in the product's environment list) with --confirm-production?",
    )
    expect(questionOf({ target: 'x', version: 'latest build', unresolved: [], environments: [] })).toContain('the environment the CLI picks')
  })

  test('calls without --confirm-production, plans, and surfaceless sessions pass straight through', async () => {
    for (const command of ['alis build acme.sm.hello.v1 --json', 'alis deploy acme.sm.hello.v1 -e prod1 --plan-only --confirm-production', 'alis deploy acme.sm.hello.v1 -e prod1 --json']) {
      const host = fakeHost({ answer: answerEnvs })
      expect(await confirmDeploy(host, envelope(command), async () => ({ result: 'ran' }))).toEqual({ result: 'ran' })
      expect(host.asks).toEqual([])
    }
    const headless = fakeHost({ answer: answerEnvs })
    headless.drawn = null
    expect(await confirmDeploy(headless, envelope(PROD), async () => ({ result: 'ran' }))).toEqual({ result: 'ran' })
    expect(headless.runs).toEqual([])
  })

  test('a confirmed production deploy asks, runs only on Approve, and the gate then allows that call once', async () => {
    const host = fakeHost({ answer: answerEnvs })
    host.askAnswer = 'Approve'
    let ran = 0
    expect(await confirmDeploy(host, envelope(PROD), async () => ({ result: `ran ${++ran}` }))).toEqual({ result: 'ran 1' })
    expect(host.asks).toEqual([{ question: 'Deploy acme.sm.hello.v1 version 1.2.3 to Production (prod1, ACTIVE, PRODUCTION) with --confirm-production?', options: { options: ASK_OPTIONS, header: 'Deploy' } }])
    expect(approvedCalls.has('t1')).toBe(true)

    classicState.permissionMode = 'default'
    const gate = fakeHost()
    const first = await cliGateClassic(gate, { tool: 'Bash', tool_use_id: 't1', command: PROD }, async () => ({}))
    expect(first).toMatchObject({ allow: true, updatedInput: { command: expect.stringContaining('--approve') } })
    expect(approvedCalls.has('t1')).toBe(false)
    const second = await cliGateClassic(gate, { tool: 'Bash', tool_use_id: 't1', command: PROD }, async () => ({}))
    expect(second).toMatchObject({ ask: expect.any(String) })
  })

  test('Abort, a dismissed dialog, or any other answer refuses the call', async () => {
    let ran = 0
    const run = async () => ({ result: `ran ${++ran}` })
    for (const askAnswer of ['Abort', 'something typed under Other', new Error('dismissed')]) {
      const host = fakeHost({ answer: answerEnvs })
      host.askAnswer = askAnswer
      expect(await confirmDeploy(host, envelope(PROD), run)).toEqual({ deny: ABORT_REASON })
    }
    expect(ran).toBe(0)
    expect(approvedCalls.has('t1')).toBe(false)
  })

  test('the target comes from the workspace when the command omits it, and an unresolved environment is named', async () => {
    const host = fakeHost({ answer: answerEnvs })
    host.dir = '/r/alis.build/acme/build/sm/hello/v1'
    await confirmDeploy(host, envelope('alis deploy -e nope --json --confirm-production'), async () => ({ result: 'ran' }))
    expect(host.runs[0]?.argv).toEqual(['alis', 'environment', 'list', 'acme.sm', '--json'])
    expect(host.asks[0]?.question).toBe("Deploy acme.sm.hello.v1 version latest build to nope (not in the product's environment list) with --confirm-production?")
  })
})
