import { describe, expect, test, tier } from 'claude-code/testing'

import { COMMAND_SPEC, runAlisCommand, workspaceOf } from '../hooks/mod/alis-command'
import { PLUGIN_VERSION } from '../hooks/mod/meta'
import { COVERS } from '../hooks/mod/tag'
import { fakeHost, type Run } from './fixtures/fake-host'

tier('user')

const version = (run: Run) =>
  run.argv[1] === 'version' ? { exitCode: 0, stdout: '{"version":"1.144.8"}\n', stderr: '' } : { exitCode: 0, stdout: '', stderr: '' }

describe('alis-command', () => {
  test('the command is named alis with a hint', () => {
    expect(COMMAND_SPEC).toEqual({ name: 'alis', description: expect.any(String), argumentHint: 'status | handoff [alias]' })
  })

  test('status reports the CLI, workspace, module coverage and handoff claim', async () => {
    const host = fakeHost({ answer: version, present: ['/h/.alis/handoff-sessions/session-a.claim'] })
    host.dir = '/Users/me/alis.build/acme/define/acme/sm/hello/v1'
    const lines = (await runAlisCommand(host, 'status')).text.split('\n')
    expect(lines[0]).toMatch(/^status: \d{4}-\d\d-\d\d \d\d:\d\d UTC$/)
    expect(lines.slice(1)).toEqual([
      'cli: v1.144.8',
      'workspace: acme define sm/hello/v1 (acme.sm.hello.v1)',
      `plugin: v${PLUGIN_VERSION}, function hooks serving ${COVERS.join(', ')}`,
      'handoff: this session is claimed',
    ])
    const bare = fakeHost({ answer: () => new Error('ENOENT') })
    bare.dir = '/plain'
    expect((await runAlisCommand(bare, '')).text).toContain('cli: not found on PATH')
    expect((await runAlisCommand(bare, '')).text).toContain('workspace: none')
    expect((await runAlisCommand(bare, '')).text).toContain('handoff: no claim')
  })

  test('handoff runs the CLI for this session, with an alias when given', async () => {
    const host = fakeHost({ answer: () => ({ exitCode: 0, stdout: '{"message":"Handing off to alis-acme-1"}', stderr: '' }) })
    expect((await runAlisCommand(host, 'handoff')).text).toBe('handoff: started\nresult: Handing off to alis-acme-1')
    expect(host.runs[0]?.argv).toEqual(['alis', 'workstation', 'handoff', '--session', 'session-a', '--json'])
    await runAlisCommand(host, 'handoff  alis-acme-2')
    expect(host.runs[1]?.argv).toEqual(['alis', 'workstation', 'handoff', '--session', 'session-a', '--json', '--to', 'alis-acme-2'])
    expect(host.runs[1]?.init?.timeoutMs).toBe(60000)
    const failing = fakeHost({ answer: () => ({ exitCode: 2, stdout: '', stderr: 'choose --to from enrolled workstation aliases: a, b' }) })
    expect((await runAlisCommand(failing, 'handoff')).text).toBe('handoff: failed\nerror: choose --to from enrolled workstation aliases: a, b')
    const missing = fakeHost({ answer: () => new Error('spawn alis ENOENT') })
    expect((await runAlisCommand(missing, 'handoff')).text).toContain('error: Error: spawn alis ENOENT')
  })

  test('anything else prints usage', async () => {
    expect((await runAlisCommand(fakeHost(), 'frobnicate')).text).toContain('usage: status')
  })

  test('workspaceOf follows the alis.build layout', () => {
    expect(workspaceOf('/r/alis.build/acme/build/sm/hello/v1/internal')).toEqual({ org: 'acme', side: 'build', relpath: 'sm/hello/v1', pkg: 'acme.sm.hello.v1' })
    expect(workspaceOf('/r/alis.build/acme/define/acme/sm/hello')).toEqual({ org: 'acme', side: 'define', relpath: 'sm/hello', pkg: null })
    expect(workspaceOf('/r/alis.build/acme/define/google/api')).toBe(null)
    expect(workspaceOf('/r/alis.build/acme/build')).toBe(null)
    expect(workspaceOf('/r/alis.build/acme/other/x')).toBe(null)
    expect(workspaceOf('/r/elsewhere')).toBe(null)
  })
})
