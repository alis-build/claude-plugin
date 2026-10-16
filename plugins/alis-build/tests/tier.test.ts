import { describe, expect, test, tier } from 'claude-code/testing'

import { classicState } from '../hooks/mod/classic'
import { ALLOW_REASON, ASK_REASON, decide, MANUAL_REASON } from '../hooks/mod/cli-gate'
import { cliGateClassic } from '../hooks/mod/cli-gate-classic'
import { approvedCalls } from '../hooks/mod/deploy-dialog'
import { confirmGuarded } from '../hooks/mod/guard-dialog'
import { automationTierOf } from '../hooks/mod/tier'
import { fakeHost } from './fixtures/fake-host'

tier('user')

const PROFILE = '/h/.alis/profile-cache.json'
const SETTINGS = '/h/.alis/settings.json'
const WORKFLOWS = [
  'alis define acme.sm.x.v1 --json --install',
  'alis build acme.sm.x.v1 --json --async',
  'alis deploy acme.sm.x.v1 --version 1.2.3 -e dev --json --async',
  'alis authorise acme.sm --json',
  'alis packages install acme.sm.x.v1 --json',
  'alis packages upgrade acme.sm.x.v1 --json',
  'alis packages add acme.sm.x.v1 --json',
]

function gate(command: string, automationTier?: string, permissionMode = 'auto', allowedSubcmds?: string) {
  return decide({ toolName: 'Bash', permissionMode, allowedSubcmds, automationTier, toolInput: { command } })
}

describe('automation tier', () => {
  test('the tier is the stricter of the cached server tier and the local cap, as the CLI reads them', async () => {
    const host = fakeHost()
    expect(await automationTierOf(host)).toBeUndefined()
    host.files[PROFILE] = JSON.stringify({ automationTier: 'manual', fetchedAt: '2026-09-24T15:35:50Z' })
    expect(await automationTierOf(host)).toBe('manual')
    host.files[PROFILE] = JSON.stringify({ automationTier: ' Balanced ' })
    expect(await automationTierOf(host)).toBe('balanced')
    host.files[SETTINGS] = JSON.stringify({ approvals: { maxTier: 'manual' } })
    expect(await automationTierOf(host)).toBe('manual')
    host.files[SETTINGS] = JSON.stringify({ approvals: { maxTier: 'autonomous' } })
    expect(await automationTierOf(host)).toBe('balanced')
    host.files[PROFILE] = '{not json'
    expect(await automationTierOf(host)).toBe('autonomous')
    host.files[SETTINGS] = JSON.stringify({ approvals: 'manual' })
    expect(await automationTierOf(host)).toBeUndefined()
  })

  test('on the manual tier every structured workflow asks with --approve added', () => {
    for (const command of WORKFLOWS) {
      const result = gate(command, 'manual')
      expect(result).toMatchObject({ matched: true, decision: 'ask', reason: MANUAL_REASON })
      if (!result.matched) throw new Error('unreachable')
      expect(result.updatedInput?.['command']).toBe(`${command} --approve`)
    }
    expect(gate('alis build acme.sm.x.v1 -- extra', 'manual')).toMatchObject({ updatedInput: { command: 'alis build acme.sm.x.v1 --approve -- extra' } })
  })

  test('other tiers, an unknown tier, reads, help and a define --dry-run keep the plain allow', () => {
    for (const automationTier of [undefined, 'balanced', 'autonomous']) {
      for (const command of WORKFLOWS) expect(gate(command, automationTier)).toMatchObject({ decision: 'allow', reason: ALLOW_REASON })
    }
    for (const command of ['alis define acme.sm.x.v1 --dry-run --json', 'alis build --help', 'alis operations list --json', 'alis whoami --json']) {
      expect(gate(command, 'manual')).toMatchObject({ decision: 'allow', reason: ALLOW_REASON })
    }
  })

  test('the tier never loosens plan mode, a guarded command or the allowlist', () => {
    expect(gate('alis build acme.sm.x.v1 --json', 'manual', 'plan')).toMatchObject({ decision: 'deny' })
    expect(gate('alis build acme.sm.x.v1 --json --approve', 'manual')).toMatchObject({ decision: 'ask', reason: ASK_REASON })
    expect(gate('alis build acme.sm.x.v1 --json', 'manual', 'auto', 'context doctor')).toEqual({ matched: false })
  })

  test('the module asks the person in its own dialog, and Approve stands in for the native prompt once', async () => {
    const host = fakeHost()
    host.files[PROFILE] = JSON.stringify({ automationTier: 'manual' })
    host.askAnswer = 'Approve'
    const envelope = { tool: 'Bash', tool_use_id: 'tier-1', command: 'alis build acme.sm.x.v1 --json' }
    expect(await confirmGuarded(host, envelope, async () => ({ result: 'ran' }))).toEqual({ result: 'ran' })
    expect(host.asks).toHaveLength(1)
    expect(host.asks[0]?.question).toContain('manual')
    expect(host.asks[0]?.question).toContain('alis build acme.sm.x.v1 --json')
    expect(approvedCalls.has('tier-1')).toBe(true)

    classicState.permissionMode = 'auto'
    const result = await cliGateClassic(host, envelope, async () => ({}))
    expect(result).toMatchObject({ allow: true })
    expect((result as { updatedInput?: { command?: string } }).updatedInput?.command).toContain('--approve')
    expect(approvedCalls.has('tier-1')).toBe(false)
  })

  test('without the cache nothing is asked; Abort refuses the call', async () => {
    const bare = fakeHost()
    expect(await confirmGuarded(bare, { tool: 'Bash', tool_use_id: 'tier-2', command: 'alis build acme.sm.x.v1' }, async () => ({ result: 'ran' }))).toEqual({ result: 'ran' })
    expect(bare.asks).toEqual([])

    const host = fakeHost()
    host.files[PROFILE] = JSON.stringify({ automationTier: 'manual' })
    host.askAnswer = 'Abort'
    const outcome = await confirmGuarded(host, { tool: 'Bash', tool_use_id: 'tier-3', command: 'alis deploy acme.sm.x.v1 -e dev' }, async () => ({ result: 'ran' }))
    expect(outcome).toMatchObject({ deny: expect.any(String) })
    expect(approvedCalls.has('tier-3')).toBe(false)
  })
})
