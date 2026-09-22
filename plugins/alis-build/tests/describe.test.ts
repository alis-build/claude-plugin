import { describe, expect, test, tier } from 'claude-code/testing'

import { BASH_GUIDANCE, describeBash } from '../hooks/mod/describe'
import { fakeHost, type Run } from './fixtures/fake-host'

tier('user')

const which = (found: boolean) => (run: Run) =>
  run.argv[0] === '/usr/bin/which' ? { exitCode: found ? 0 : 1, stdout: found ? '/usr/local/bin/alis\n' : '', stderr: '' } : { exitCode: 0, stdout: '', stderr: '' }

describe('describe', () => {
  test('the Bash description gains the alis rules only where the CLI is on PATH, and only once', async () => {
    const withCli = fakeHost({ answer: which(true) })
    const once = await describeBash(withCli, 'Executes a bash command.')
    expect(once).toBe('Executes a bash command.\n' + BASH_GUIDANCE)
    expect(await describeBash(withCli, once)).toBe(once)
    const withoutCli = fakeHost({ answer: which(false) })
    expect(await describeBash(withoutCli, 'Executes a bash command.')).toBe('Executes a bash command.')
    const broken = fakeHost({ answer: () => new Error('no which') })
    expect(await describeBash(broken, 'Executes a bash command.')).toBe('Executes a bash command.')
  })

  test('the rules are short and name the essentials', () => {
    expect(BASH_GUIDANCE.split('\n').length).toBeLessThanOrEqual(8)
    for (const must of ['one standalone', '--cwd', 'pipe', 'stderr is progress', 'operations wait', 'background-task']) {
      expect(BASH_GUIDANCE).toContain(must)
    }
  })

  test('through the engine, the Bash description is rewritten and another tool is left alone', async ($, on) => {
    on('process.run', () => ({ value: { exitCode: 0, stdout: '/usr/local/bin/alis\n', stderr: '' } }))
    on('tool.describe', ($, e) => ({ description: `engine: ${e.tool}` }))
    const bash = await $.tool.describe({ tool: 'Bash', description: 'engine: Bash', provider: { plugin: 'engine', tier: 'core' } })
    expect(bash.description).toBe('engine: Bash\n' + BASH_GUIDANCE)
    const read = await $.tool.describe({ tool: 'Read', description: 'engine: Read', provider: { plugin: 'engine', tier: 'core' } })
    expect(read.description).toBe('engine: Read')
  })
})
