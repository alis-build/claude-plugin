import { describe, expect, test, tier } from 'claude-code/testing'

import { passClassic } from '../hooks/mod/classic'
import { primerContext, serviceContext, syncSkills, SYNC_HEALTH_FILE } from '../hooks/mod/session-context'
import { fakeHost, type FakeHost, type Run } from './fixtures/fake-host'

tier('user')

const PRIMER = '# Alis Build — Define, Build, Deploy (DBD)\nfull text'
const DIGEST = '# Alis Build — DBD refresher\nshort text'
const WS = '/r/alis.build/acme/build/x/v1'
const which = (found: boolean) => (run: Run) =>
  run.argv[0] === '/usr/bin/which' ? { exitCode: found ? 0 : 1, stdout: found ? '/usr/local/bin/alis\n' : '', stderr: '' } : { exitCode: 0, stdout: '', stderr: '' }

function withContext(host: FakeHost, files: Partial<Record<'primer' | 'digest', string>> = { primer: PRIMER, digest: DIGEST }): FakeHost {
  if (files.primer !== undefined) host.files['/p/context/dbd-primer.md'] = files.primer
  if (files.digest !== undefined) host.files['/p/context/dbd-digest.md'] = files.digest
  return host
}

describe('session-context', () => {
  test('the primer gate matches load-primer.sh across workspace, CLI, source and override', async () => {
    // The matrix of tests/load-primer-hook-test.sh: [cwd, cli, source, ALIS_PRIMER] -> full | digest | none.
    const cases: [string, boolean, string, string | undefined, 'full' | 'digest' | 'none'][] = [
      [WS, true, 'startup', undefined, 'full'],
      [WS, false, 'startup', undefined, 'full'],
      [WS, true, 'resume', undefined, 'digest'],
      [WS, true, 'compact', undefined, 'digest'],
      [WS, true, 'clear', undefined, 'full'],
      ['/plain', true, 'startup', undefined, 'digest'],
      ['/plain', false, 'startup', undefined, 'none'],
      ['/plain', false, 'startup', 'full', 'full'],
      [WS, true, 'startup', 'digest', 'digest'],
      [WS, true, 'startup', 'off', 'none'],
      ['/plain', false, 'resume', 'digest', 'digest'],
    ]
    for (const [cwd, cli, source, mode, want] of cases) {
      const host = withContext(fakeHost({ answer: which(cli), env: { HOME: '/h', CLAUDE_PLUGIN_ROOT: '/p', ...(mode ? { ALIS_PRIMER: mode } : {}) } }))
      const got = await primerContext(host, cwd, source)
      const kind = got === null ? 'none' : got.startsWith('# Alis Build — DBD refresher') ? 'digest' : 'full'
      expect([cwd, cli, source, mode, kind]).toEqual([cwd, cli, source, mode, want])
    }
  })

  test('a missing digest falls back to the full primer; a missing primer gives nothing', async () => {
    const digestless = withContext(fakeHost({ answer: which(true) }), { primer: PRIMER })
    expect(await primerContext(digestless, WS, 'resume')).toBe(PRIMER)
    const bare = fakeHost({ answer: which(true) })
    expect(await primerContext(bare, WS, 'startup')).toBe(null)
  })

  test('serviceContext points a build folder at its definitions and a define folder at its build', async () => {
    const host = fakeHost()
    host.entries['/r/alis.build/acme/define/acme/x/v1'] = [{ name: 'x.proto', kind: 'file', size: 1 }, { name: 'y.proto', kind: 'file', size: 1 }, { name: 'README.md', kind: 'file', size: 1 }]
    expect(await serviceContext(host, WS)).toBe(
      [
        'This Claude session is inside an Alis Build service implementation (build) directory.',
        '  Package id:  acme.x.v1',
        '  The protobuf definitions (the API contract — the DBD "Define" step) are available here:',
        '    /r/alis.build/acme/define/acme/x/v1',
        '  Proto files: x.proto, y.proto',
        '',
      ].join('\n'),
    )
    const orphan = fakeHost()
    expect(await serviceContext(orphan, WS)).toContain('Expected definitions at /r/alis.build/acme/define/acme/x/v1 (not found on disk).')

    const define = fakeHost()
    define.entries['/r/alis.build/acme/define/acme/x/v1'] = [{ name: 'x.proto', kind: 'file', size: 1 }]
    define.present.add('/r/alis.build/acme/build/x/v1')
    expect(await serviceContext(define, '/r/alis.build/acme/define/acme/x/v1')).toBe(
      [
        'This Claude session is inside an Alis Build definitions (define) directory — the protobuf API contract.',
        '  Package id:  acme.x.v1',
        '  Proto files: x.proto',
        '  The implementation (the DBD "Build" step) is available here:',
        '    /r/alis.build/acme/build/x/v1',
        '',
      ].join('\n'),
    )
    expect(await serviceContext(fakeHost(), '/r/alis.build/acme/define/acme/x')).toContain('has no corresponding build/ implementation directory yet')
    expect(await serviceContext(fakeHost(), '/plain')).toBe(null)
    expect(await serviceContext(fakeHost(), '/r/alis.build/acme/build')).toBe(null)
  })

  test('syncSkills refreshes the catalog on startup and clear only, and records each outcome', async () => {
    const ok = fakeHost()
    expect(await syncSkills(ok, 'startup')).toBe('success')
    expect(ok.runs[0]?.argv).toEqual(['alis', 'skills', 'sync', '--cache-only', '--harness', 'claude'])
    expect(ok.runs[0]?.init?.timeoutMs).toBe(20000)
    expect(JSON.parse(ok.writes.at(-1)?.text ?? '{}')).toMatchObject({ status: 'success' })
    expect(ok.writes.at(-1)?.path).toBe(`/h/.alis/${SYNC_HEALTH_FILE}`)
    expect(await syncSkills(fakeHost({ answer: () => ({ exitCode: 1, stdout: '', stderr: '' }) }), 'clear')).toBe('failed')
    expect(await syncSkills(fakeHost({ answer: () => new Error('timed out after 20000ms') }), 'startup')).toBe('timeout')
    expect(await syncSkills(fakeHost({ answer: () => new Error('spawn alis ENOENT') }), 'startup')).toBe('cli-missing')
    const resumed = fakeHost()
    expect(await syncSkills(resumed, 'resume')).toBe('skipped')
    expect(resumed.runs).toEqual([])
  })

  test('the classic SessionStart answer carries the primer and the service pointer and starts the sync', async () => {
    const host = withContext(fakeHost({ answer: which(true) }))
    host.entries['/r/alis.build/acme/define/acme/x/v1'] = []
    const result = await passClassic(host, 'classic.SessionStart', { session_id: 'abc', hook_event_name: 'SessionStart', source: 'startup', cwd: WS }, async () => ({ additionalContext: ['beneath'] }))
    expect(result.additionalContext?.[0]).toBe('beneath')
    expect(result.additionalContext?.[1]).toBe(PRIMER)
    expect(result.additionalContext?.[2]).toContain('Package id:  acme.x.v1')
    for (let i = 0; i < 20; i++) await Promise.resolve()
    expect(host.runs.some(r => r.argv[1] === 'skills' && r.argv[2] === 'sync')).toBe(true)
  })
})
