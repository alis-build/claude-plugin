import { describe, expect, test, tier } from 'claude-code/testing'

import { actionWords, durationOf, environmentIdOf, liveLineOf, productOf, resourceWords, serviceOf, viewOf } from '../hooks/mod/ops-progress'
import { BUILD_DEPLOY_DONE } from './fixtures/operation-build-deploy-done'

tier('user')

const DEV = 'organisations/acme/products/sm/environments/env1/deployments/hello'

describe('ops-progress', () => {
  test('a real finished build and deploy reads as two finished stages', () => {
    const view = viewOf(BUILD_DEPLOY_DONE, { '1y2ozvryhc9kk': 'Development' })
    expect(view).toMatchObject({ kind: 'build', version: '2.44.19', done: true })
    expect(view?.stages.map(s => [s.kind, s.name, s.state, s.done, s.total, s.changes])).toEqual([
      ['build', '.', 'done', 0, 0, undefined],
      ['deploy', 'Development', 'done', 6, 6, 1],
    ])
    expect(view?.stages[0]?.endMs! - view?.stages[0]?.startMs!).toBe(195_953)
  })

  test('names and words', () => {
    expect(environmentIdOf(DEV)).toBe('env1')
    expect(productOf(DEV)).toBe('acme.sm')
    expect(productOf('alis.os.console.v2')).toBe('alis.os')
    expect(serviceOf('alis.os.console.v2')).toBe('console.v2')
    expect(resourceWords('google_cloud_run_v2_service.console')).toBe('Cloud Run service')
    expect(resourceWords('google_cloud_run_service_iam_member.iam-auth-invoker')).toBe('access policy')
    expect(resourceWords('google_widget_thing.x')).toBe('widget thing')
    expect(actionWords('protos → Spanner')).toBe('Updating the Spanner schema')
    expect(actionWords('terraform apply')).toBe('Applying changes')
    expect(durationOf(58_000)).toBe('58s')
    expect(durationOf(161_000)).toBe('2m 41s')
    expect(durationOf(3_840_000)).toBe('1h 04m')
  })

  test('the live line names the stage at work, its step and what comes next', () => {
    const at = (raw: unknown) => liveLineOf(viewOf(raw, { env1: 'Development' }) ?? undefined, { service: 'console.v2', operation: 'operations/x', startedAt: 0, now: 77_000 })

    expect(at({ version: '2.44.19', images: [], deployments: [{ name: DEV }] })).toMatchObject({ label: 'Starting the build', note: 'waiting for a build machine', fill: null, clock: '1:17' })

    const building = at({ version: '2.44.19', images: [{ path: '.', progress: { startTime: '1970-01-01T00:00:00Z', buildSteps: [
      { name: '[internal] load', status: 'DONE', internal: true },
      { name: '[1/4] FROM node', status: 'DONE', cached: true, stepNumber: 1 },
      { name: '[2/4] COPY .', status: 'DONE', stepNumber: 2 },
      { name: '[3/4] RUN pnpm run build', status: 'RUNNING', stepNumber: 3 },
      { name: '[4/4] RUN prune', status: 'PENDING', stepNumber: 4 },
    ] } }], deployments: [{ name: DEV }] })
    expect(building).toMatchObject({ label: 'Building 2.44.19', fill: 0.5, sub: 'Step 3 of 4 · deploys to Development next', subTone: 'dim' })
    expect(building.detail).toEqual({ title: 'Build · step 3 of 4, 1 from cache', step: '[3/4] RUN pnpm run build', operation: 'operations/x' })

    const deploying = at({ version: '2.44.19', images: [{ path: '.', progress: { startTime: '1970-01-01T00:00:00Z', endTime: '1970-01-01T00:02:41Z' } }], deployments: [{ name: DEV, progress: {
      startTime: '1970-01-01T00:02:45Z',
      steps: [{ label: 'terraform plan', status: 'DONE' }, { label: 'terraform apply', status: 'RUNNING' }],
      resources: [{ address: 'google_cloud_run_v2_service.console', action: 'update', status: 'APPLYING' }],
    } }] })
    expect(deploying).toMatchObject({ label: 'Deploying to Development', fill: 0.75, sub: 'Updating the Cloud Run service · built in 2m 41s' })

    const throttled = at({ deployments: [{ name: DEV, progress: { startTime: '1970-01-01T00:00:00Z', steps: [{ label: 'protos → Spanner', status: 'RUNNING' }], protoSyncs: [{ target: 'spanner', status: 'RUNNING', percent: 40, throttled: true }] } }] })
    expect(throttled).toMatchObject({ label: 'Deploying to Development', sub: 'Spanner is throttling the update. It carries on by itself.', subTone: 'warning' })
  })

  test('anything that is not an operation reads as nothing', () => {
    expect(viewOf('text')).toBe(null)
    expect(viewOf({ hello: 1 })).toBe(null)
    expect(viewOf([1])).toBe(null)
  })
})
