import { describe, expect, test, tier } from 'claude-code/testing'

import { decide } from '../hooks/mod/cli-gate'
import { cliGateClassic } from '../hooks/mod/cli-gate-classic'
import { CLIENT_CALL_SINCE, CLIENT_PLUGIN_SINCE, clientPluginOf, parseVersion } from '../hooks/mod/health'
import { PLUGIN_VERSION } from '../hooks/mod/meta'
import { fakeHost } from './fixtures/fake-host'

tier('user')

const CACHE = '/h/.alis/versions-cache.json'
const plugin = `claude/${PLUGIN_VERSION}`

describe('client plugin', () => {
  test('the plugin names itself only to a CLI that accepts the flag', async () => {
    const host = fakeHost()
    expect(await clientPluginOf(host)).toBeUndefined()
    for (const [cliVersion, expected] of [
      ['1.166.3', plugin], ['v1.165.6', plugin], ['1.165.6-rc1', plugin],
      ['1.165.5', undefined], ['1.164.9', undefined], ['dev', undefined], [7, undefined],
    ] as const) {
      host.files[CACHE] = JSON.stringify({ cliVersion, components: [] })
      expect(await clientPluginOf(host)).toBe(expected)
    }
    host.files[CACHE] = '{not json'
    expect(await clientPluginOf(host)).toBeUndefined()
    expect(CLIENT_PLUGIN_SINCE).toEqual([1, 165, 6])
    expect(parseVersion('1.2.3+build')).toEqual([1, 2, 3])
    expect(parseVersion('1.2')).toBeNull()
  })

  test('decide() adds the flag after the session id, before any separator, never twice', () => {
    const input = (command: string, clientPlugin?: string) => decide({ toolName: 'Bash', permissionMode: 'auto', sessionId: 'session-a', toolInput: { command }, clientPlugin })
    const command = (d: ReturnType<typeof decide>) => (d.matched && d.updatedInput ? d.updatedInput['command'] : undefined)
    expect(command(input('alis define example.app.api.v1 --json'))).toBe('alis define example.app.api.v1 --json --session-id session-a')
    expect(command(input('alis define example.app.api.v1 --json', plugin))).toBe(`alis define example.app.api.v1 --json --session-id session-a --client-plugin ${plugin}`)
    expect(command(input("alis ask -- 'what now'", plugin))).toBe(`alis ask --session-id session-a --client-plugin ${plugin} -- 'what now'`)
    expect(command(input('alis whoami --session-id session-a --client-plugin other/1.0', plugin))).toBeUndefined()
    const guarded = input('alis blocks uninstall blocks/example --json', plugin)
    expect(guarded.matched && guarded.decision).toBe('ask')
    expect(command(guarded)).toBe(`alis blocks uninstall blocks/example --json --approve --session-id session-a --client-plugin ${plugin}`)
  })

  test('the classic adapter reads the cache through the host', async () => {
    const host = fakeHost()
    host.files[CACHE] = JSON.stringify({ cliVersion: '1.166.3' })
    const e = { tool: 'Bash', tool_use_id: 't1', command: 'alis whoami --json' }
    const result = await cliGateClassic(host, e, async () => ({}))
    expect((result as { updatedInput?: { command?: string } }).updatedInput?.command).toBe(`alis whoami --json --session-id session-a --client-plugin ${plugin}`)
  })

  test('a command that starts an operation names its call, once the CLI takes the flag', async () => {
    const input = (command: string, clientCall?: string) => decide({ toolName: 'Bash', permissionMode: 'auto', sessionId: 'session-a', toolInput: { command }, clientCall })
    const command = (d: ReturnType<typeof decide>) => (d.matched && d.updatedInput ? d.updatedInput['command'] : undefined)
    expect(command(input('alis deploy -e dev example.app.api.v1 --json', 'toolu_1'))).toBe('alis deploy -e dev example.app.api.v1 --json --session-id session-a --client-call toolu_1')
    expect(command(input("alis build example.app.api.v1 -- 'x'", 'toolu_1'))).toBe("alis build example.app.api.v1 --session-id session-a --client-call toolu_1 -- x")
    // No id, an id that is not one shell word, a command that starts nothing, and a call already named.
    expect(command(input('alis build example.app.api.v1'))).toBe('alis build example.app.api.v1 --session-id session-a')
    expect(command(input('alis build example.app.api.v1', 'x; rm -rf /'))).toBe('alis build example.app.api.v1 --session-id session-a')
    expect(command(input('alis operations list --json', 'toolu_1'))).toBe('alis operations list --json --session-id session-a')
    expect(command(input('alis build example.app.api.v1 --client-call toolu_0', 'toolu_1'))).toBe('alis build example.app.api.v1 --client-call toolu_0 --session-id session-a')

    // The adapter passes the call's id only for a CLI that accepts it.
    const e = { tool: 'Bash', tool_use_id: 'toolu_7', command: 'alis build example.app.api.v1 --json' }
    const run = async (cliVersion: string) => {
      const host = fakeHost()
      host.files[CACHE] = JSON.stringify({ cliVersion })
      return ((await cliGateClassic(host, e, async () => ({}))) as { updatedInput?: { command?: string } }).updatedInput?.command
    }
    expect(await run('1.187.5')).toBe(`alis build example.app.api.v1 --json --session-id session-a --client-plugin ${plugin}`)
    expect(await run(CLIENT_CALL_SINCE.join('.'))).toBe(`alis build example.app.api.v1 --json --session-id session-a --client-plugin ${plugin} --client-call toolu_7`)
  })
})
