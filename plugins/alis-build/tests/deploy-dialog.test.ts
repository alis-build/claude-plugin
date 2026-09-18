import { describe, expect, test, tier } from 'claude-code/testing'

import { ABORT_REASON, answerDeploy, approvedCalls, confirmDeploy, DEPLOY_PANE_ID, deployCallOf, deployDialog, environmentsOf } from '../hooks/mod/deploy-dialog'
import { classicState } from '../hooks/mod/classic'
import { cliGateClassic } from '../hooks/mod/cli-gate-classic'
import { renderDeployDialog } from '../hooks/mod/deploy-dialog-view'
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

async function settle() {
  for (let i = 0; i < 30; i++) await Promise.resolve()
}

describe('deploy-dialog', () => {
  test('deployCallOf reads target, environments, version and flags', () => {
    expect(deployCallOf('alis deploy acme.sm.hello.v1 -e prod1 --version 1.2.3 --json --confirm-production')).toEqual({
      target: 'acme.sm.hello.v1', environments: ['prod1'], version: '1.2.3', confirmProduction: true, planOnly: false,
    })
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

  test('calls without --confirm-production, plans, and surfaceless sessions pass straight through', async () => {
    for (const command of ['alis build acme.sm.hello.v1 --json', 'alis deploy acme.sm.hello.v1 -e prod1 --plan-only --confirm-production', 'alis deploy acme.sm.hello.v1 -e prod1 --json']) {
      const host = fakeHost({ answer: answerEnvs })
      expect(await confirmDeploy(host, envelope(command), async () => ({ result: 'ran' }), new AbortController().signal)).toEqual({ result: 'ran' })
      expect(host.panes.opened).toEqual([])
    }
    const headless = fakeHost({ answer: answerEnvs })
    headless.drawn = null
    expect(await confirmDeploy(headless, envelope('alis deploy acme.sm.hello.v1 -e prod1 --json --confirm-production'), async () => ({ result: 'ran' }), new AbortController().signal)).toEqual({ result: 'ran' })
    expect(headless.runs).toEqual([])
  })

  test('a confirmed production deploy opens the dialog, runs only on Approve, and the gate then allows that call once', async () => {
    const host = fakeHost({ answer: answerEnvs })
    let ran = 0
    const command = 'alis deploy acme.sm.hello.v1 -e prod1 --version 1.2.3 --json --confirm-production'
    const outcome = confirmDeploy(host, envelope(command), async () => ({ result: `ran ${++ran}` }), new AbortController().signal)
    await settle()
    expect(host.panes.opened).toEqual([{ id: DEPLOY_PANE_ID, title: 'Confirm deploy', focus: true, closeOnEscape: true, holdToasts: true, rows: 11 }])
    expect(deployDialog.pending).toEqual({ target: 'acme.sm.hello.v1', version: '1.2.3', environments: [expect.objectContaining({ id: 'prod1', production: true })], unresolved: [], confirmProduction: true })
    expect(ran).toBe(0)
    answerDeploy('approve')
    expect(await outcome).toEqual({ result: 'ran 1' })
    expect(host.panes.closed).toEqual([DEPLOY_PANE_ID])
    expect(deployDialog.pending).toBe(null)
    expect(host.sleeps).toBeGreaterThan(0)
    expect(approvedCalls.has('t1')).toBe(true)

    classicState.permissionMode = 'default'
    const gate = fakeHost()
    const first = await cliGateClassic(gate, { tool: 'Bash', tool_use_id: 't1', command }, async () => ({}))
    expect(first).toMatchObject({ allow: true, updatedInput: { command: expect.stringContaining('--approve') } })
    expect(approvedCalls.has('t1')).toBe(false)
    const second = await cliGateClassic(gate, { tool: 'Bash', tool_use_id: 't1', command }, async () => ({}))
    expect(second).toMatchObject({ ask: expect.any(String) })
  })

  test('Abort, a --confirm-production flag, an unresolved environment and an abandoned dispatch all refuse', async () => {
    const host = fakeHost({ answer: answerEnvs })
    let ran = 0
    const run = async () => ({ result: `ran ${++ran}` })
    const aborted = confirmDeploy(host, envelope('alis deploy acme.sm.hello.v1 --json --confirm-production'), run, new AbortController().signal)
    await settle()
    expect(deployDialog.pending?.confirmProduction).toBe(true)
    expect(deployDialog.pending?.environments).toEqual([])  // -e absent and two environments: the CLI decides
    answerDeploy('abort')
    expect(await aborted).toEqual({ deny: ABORT_REASON })

    const unresolved = confirmDeploy(host, envelope('alis deploy acme.sm.hello.v1 -e nope --confirm-production'), run, new AbortController().signal)
    await settle()
    expect(deployDialog.pending?.unresolved).toEqual(['nope'])
    answerDeploy('abort')
    expect(await unresolved).toEqual({ deny: ABORT_REASON })

    const controller = new AbortController()
    const abandoned = confirmDeploy(host, envelope('alis deploy acme.sm.hello.v1 -e prod1 --json --confirm-production'), run, controller.signal)
    await settle()
    controller.abort()
    expect(await abandoned).toEqual({ deny: ABORT_REASON })
    expect(ran).toBe(0)
  })

  test('the target comes from the workspace when the command omits it', async () => {
    const host = fakeHost({ answer: answerEnvs })
    host.dir = '/r/alis.build/acme/build/sm/hello/v1'
    const outcome = confirmDeploy(host, envelope('alis deploy -e prod1 --json --confirm-production'), async () => ({ result: 'ran' }), new AbortController().signal)
    await settle()
    expect(deployDialog.pending?.target).toBe('acme.sm.hello.v1')
    expect(host.runs[0]?.argv).toEqual(['alis', 'environment', 'list', 'acme.sm', '--json'])
    answerDeploy('abort')
    await outcome
  })

  test('the dialog draws the target, each environment with its production mark, and Abort first', async ($, on) => {
    const prompt = {
      target: 'acme.sm.hello.v1', version: 'latest build', confirmProduction: false, unresolved: ['ghost'],
      environments: [{ id: 'prod1', displayName: 'Production', production: true, status: 'ACTIVE' }],
    }
    on('ui.render', { component: 'Pane' }, ($, e) => renderDeployDialog($.ui.resolve(e), prompt, { approve: () => undefined, abort: () => undefined }))
    const drawn = JSON.stringify(await $.ui.render({
      surface: 'terminal', component: 'Pane', requestId: 'test-deploy',
      props: { title: 'x', isFocused: true, bodyColumns: 80, placement: 'inline', scroll: { first: 0, rows: 12 } as never, view: {} as never },
    }))
    expect(drawn).toContain('Production deploy')
    expect(drawn).toContain('acme.sm.hello.v1')
    expect(drawn).toContain('PRODUCTION')
    expect(drawn).toContain('ghost (not found')
    expect(drawn.indexOf('"label":"Abort"')).toBeLessThan(drawn.indexOf('"label":"Approve"'))
    expect(drawn).toContain('"autoFocus":true')
  })
})
