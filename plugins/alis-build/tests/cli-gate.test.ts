import { describe, expect, test, tier } from 'claude-code/testing'

import { commandPath, decide, GUIDANCE } from '../hooks/mod/cli-gate'
import { shlexSplit } from '../hooks/mod/shell'

tier('user')

// The cases of tests/test_behavior.py PermissionTests and the two decide()
// cases of tests/test_handoff.py, one for one.
function decision(command: string, permissionMode = 'auto', sessionId = 'session-a', allowedSubcmds?: string) {
  return decide({
    toolName: 'Bash',
    permissionMode,
    sessionId,
    allowedSubcmds,
    toolInput: { command, timeout: 120000, run_in_background: true },
  })
}

describe('cli-gate', () => {
  test('guarded actions ask in every execution mode', () => {
    for (const mode of ['auto', 'default', 'acceptEdits', 'bypassPermissions', 'dontAsk']) {
      for (const cmd of [
        'alis deploy example.app.api.v1 --confirm-production --json',
        'alis blocks uninstall blocks/example --json',
        'alis --json blocks uninstall blocks/example --yes',
        'alis block --json uninstall blocks/example',
        "alis --cwd '/tmp/work space' --json blocks uninstall blocks/example",
        'alis deploy example.app.api.v1 --approve=true',
      ]) {
        const result = decision(cmd, mode)
        expect(result).toMatchObject({ matched: true, decision: 'ask' })
        if (!result.matched) throw new Error('unreachable')
        const argv = shlexSplit(result.updatedInput?.['command'] as string)
        expect(argv.includes('--confirm-production')).toBe(shlexSplit(cmd).includes('--confirm-production'))
        expect(argv.includes('--approve') || argv.includes('--approve=true') || argv.includes('--yes')).toBe(true)
      }
    }
  })

  test('plan never auto-allows mutations', () => {
    expect(decision('alis build example.app.api.v1 --json', 'plan')).toMatchObject({ decision: 'deny' })
    expect(decision('alis operations describe operations/a --json', 'plan')).toMatchObject({ decision: 'allow' })
  })

  test('unsafe shell shapes are not rewritten or allowed', () => {
    for (const command of [
      'alis build && touch /tmp/sentinel',
      'cd /tmp && alis build',
      'alis build 2>&1 | head',
      'alis ask "$(touch /tmp/sentinel)"',
      'alis build\nwhoami',
      'alis run *',
      'alis build; echo done',
    ]) {
      const result = decision(command)
      expect(result).toEqual({ matched: true, additionalContext: GUIDANCE })
      expect(GUIDANCE).toContain('--cwd')
    }
  })

  test('identity is local to each call and preserves arguments', () => {
    const command = "alis --cwd '/tmp/work space' ask 'literal | text and $value' --json"
    for (const session of ['session-a', 'session-b']) {
      const result = decision(command, 'auto', session)
      expect(result).toMatchObject({ decision: 'allow' })
      if (!result.matched) throw new Error('unreachable')
      const updated = result.updatedInput as Record<string, unknown>
      expect(shlexSplit(updated['command'] as string)).toEqual([...shlexSplit(command), '--session-id', session])
      expect(updated['timeout']).toBe(120000)
      expect(updated['run_in_background']).toBe(true)
    }
  })

  test('allowlist and unknown commands do not grant', () => {
    expect(decision('alis build example.app.api.v1 --json', 'auto', 'a', 'context doctor')).toEqual({ matched: false })
    expect(decision('alis --json blocks uninstall blocks/example --yes', 'auto', 'a', 'context doctor')).toMatchObject({ decision: 'ask' })
    for (const cmd of ['alis run', 'alis specialist send-message --to person@example.test', 'alis future-mutation']) {
      const result = decision(cmd)
      expect(result.matched).toBe(true)
      expect(result).not.toHaveProperty('decision')
    }
  })

  test('lines that are not an alis command are unmatched', () => {
    expect(decision('echo hello')).toEqual({ matched: false })
    expect(decide({ toolName: 'Read', toolInput: { command: 'alis docs' } })).toEqual({ matched: false })
    expect(decide({ toolInput: 'alis docs' })).toEqual({ matched: false })
    expect(decide({ toolInput: { command: 42 } })).toEqual({ matched: false })
  })

  test('an alis line with only flags is matched but undecided', () => {
    expect(decision('alis --json')).toEqual({ matched: true })
    expect(decision('alis --help')).toEqual({ matched: true })
  })

  test('read commands are allowed in plan but execution and the internal protocol are not', () => {
    for (const command of ['alis workstation handoff targets --json', 'alis workstation handoff status abc --json']) {
      expect(decision(command, 'plan')).toMatchObject({ decision: 'allow' })
    }
    for (const suffix of ['--session abc', 'open abc', 'cancel abc', '_agent', '_hook']) {
      expect(decision('alis workstation handoff ' + suffix, 'plan')).toMatchObject({ decision: 'deny' })
    }
  })

  test('handoff does not get a blanket process-execution allow', () => {
    const result = decision('alis workstation handoff --session abc --to alis-acme-1234567890', 'default')
    expect(result.matched).toBe(true)
    expect(result).not.toHaveProperty('decision')
  })

  test('session id is only inserted when valid and absent', () => {
    expect(decision('alis whoami --json', 'auto', 'bad id!')).toEqual({ matched: true, decision: 'allow', reason: expect.any(String) })
    const kept = decision('alis whoami --session-id keep --json')
    expect(kept).not.toHaveProperty('updatedInput')
    const dashed = decision('alis ask -- --session-id looks-like-a-flag')
    if (!dashed.matched) throw new Error('unreachable')
    expect(dashed.updatedInput?.['command']).toBe('alis ask --session-id session-a -- --session-id looks-like-a-flag')
  })

  test('commandPath skips global flags and resolves aliases', () => {
    expect(commandPath(['alis', '--cwd', '/x', '--json', 'env', 'list'])).toEqual(['environment', 'list'])
    expect(commandPath(['alis', '--cwd=/x', 'ops', 'wait', 'op/1'])).toEqual(['operations', 'wait'])
    expect(commandPath(['alis', '--', 'docs'])).toEqual([])
    expect(commandPath(['alis', 'workstation', 'handoff', 'status'], 3)).toEqual(['workstation', 'handoff', 'status'])
  })
})
