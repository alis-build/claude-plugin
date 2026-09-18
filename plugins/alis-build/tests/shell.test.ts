import { describe, expect, test, tier } from 'claude-code/testing'

import { literalArgv, shellJoin, shellQuote, shlexSplit } from '../hooks/mod/shell'

tier('user')

describe('shell', () => {
  test('shlexSplit matches Python shlex.split on the shapes the gate admits', () => {
    expect(shlexSplit("alis --cwd '/tmp/work space' ask 'literal | text and $value' --json")).toEqual([
      'alis', '--cwd', '/tmp/work space', 'ask', 'literal | text and $value', '--json',
    ])
    expect(shlexSplit('alis ask "a \\"quoted\\" word" --approve=true')).toEqual(['alis', 'ask', 'a "quoted" word', '--approve=true'])
    expect(shlexSplit('alis ask "keep \\x here"')).toEqual(['alis', 'ask', 'keep \\x here'])
    expect(shlexSplit('alis ask esc\\aped')).toEqual(['alis', 'ask', 'escaped'])
    expect(shlexSplit("alis ask a'b c'd")).toEqual(['alis', 'ask', 'ab cd'])
    expect(shlexSplit('  alis\t""  ')).toEqual(['alis', ''])
    expect(() => shlexSplit("alis ask 'open")).toThrow()
  })

  test('shellQuote and shellJoin match Python shlex.quote and shlex.join', () => {
    expect(shellQuote('')).toBe("''")
    expect(shellQuote('safe_word-1.2/3:4,5@6%7+8=9')).toBe('safe_word-1.2/3:4,5@6%7+8=9')
    expect(shellQuote('has space')).toBe("'has space'")
    expect(shellQuote("it's")).toBe("'it'\"'\"'s'")
    expect(shellJoin(['alis', '--cwd', '/tmp/work space', 'ask', 'literal | text and $value', '--json'])).toBe(
      "alis --cwd '/tmp/work space' ask 'literal | text and $value' --json",
    )
  })

  test('literalArgv rejects every unsafe shell shape', () => {
    for (const command of [
      'alis build && touch /tmp/sentinel',
      'cd /tmp && alis build',
      'alis build 2>&1 | head',
      'alis ask "$(touch /tmp/sentinel)"',
      'alis build\nwhoami',
      'alis run *',
      'alis build; echo done',
      "alis ask 'unterminated",
      'alis ask trailing\\',
      'alis ask `date`',
      'echo alis build',
    ]) {
      expect(literalArgv(command)).toBe(null)
    }
  })

  test('literalArgv admits quoted operators and escapes', () => {
    expect(literalArgv("alis ask 'a | b; c' --json")).toEqual(['alis', 'ask', 'a | b; c', '--json'])
    expect(literalArgv('alis ask "a | b"')).toEqual(['alis', 'ask', 'a | b'])
    expect(literalArgv('alis ask a\\;b')).toEqual(['alis', 'ask', 'a;b'])
  })
})
