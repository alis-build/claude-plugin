// A port of the shell-string handling in hooks/cli-hook.py: the same
// conservative scan that admits only a literal `alis …` command line, the
// subset of Python's shlex.split that scan leaves possible, and shlex.join's
// quoting, byte for byte, since the joined command is what the person sees
// in the permission dialog.

/**
 * Splits a literal `alis …` command line into argv, or returns null when
 * the line carries any shell construct (operators, expansions, globs,
 * newlines, an unterminated quote) or does not start with `alis`.
 */
export function literalArgv(command: string): string[] | null {
  let quote: "'" | '"' | null = null
  let escaped = false
  for (const char of command) {
    if (char === '\r' || char === '\n') return null
    if (escaped) {
      escaped = false
      continue
    }
    if (quote === "'") {
      if (char === "'") quote = null
      continue
    }
    if (char === '\\') {
      escaped = true
      continue
    }
    if (char === '$' || char === '`') return null
    if (quote === '"') {
      if (char === '"') quote = null
      continue
    }
    if (char === "'" || char === '"') quote = char
    else if ('|&;<>()*?[]{}#~'.includes(char)) return null
  }
  if (quote || escaped) return null
  let argv: string[]
  try {
    argv = shlexSplit(command)
  } catch {
    return null
  }
  return argv.length > 0 && argv[0] === 'alis' ? argv : null
}

/**
 * Python's shlex.split in POSIX mode, for the lines literalArgv admits:
 * whitespace separates words, single quotes are literal, inside double
 * quotes a backslash escapes only `"` and `\`, and elsewhere a backslash
 * escapes the next character. Throws on an unterminated quote or escape.
 */
export function shlexSplit(line: string): string[] {
  const words: string[] = []
  let word: string | null = null
  let quote: "'" | '"' | null = null
  let escaped = false
  for (const char of line) {
    if (escaped) {
      // Inside double quotes shlex keeps the backslash before any other char.
      if (quote === '"' && char !== '"' && char !== '\\') word = (word ?? '') + '\\'
      word = (word ?? '') + char
      escaped = false
      continue
    }
    if (quote === "'") {
      if (char === "'") quote = null
      else word = (word ?? '') + char
      continue
    }
    if (char === '\\') {
      escaped = true
      continue
    }
    if (quote === '"') {
      if (char === '"') quote = null
      else word = (word ?? '') + char
      continue
    }
    if (char === "'" || char === '"') {
      quote = char
      word = word ?? ''
      continue
    }
    if (' \t\r\n'.includes(char)) {
      if (word !== null) words.push(word)
      word = null
      continue
    }
    word = (word ?? '') + char
  }
  if (quote || escaped) throw new Error('No closing quotation')
  if (word !== null) words.push(word)
  return words
}

const SAFE_WORD = /^[A-Za-z0-9_@%+=:,./-]+$/

/** Python's shlex.quote. */
export function shellQuote(word: string): string {
  if (word === '') return "''"
  if (SAFE_WORD.test(word)) return word
  return "'" + word.replaceAll("'", "'\"'\"'") + "'"
}

/** Python's shlex.join. */
export function shellJoin(argv: readonly string[]): string {
  return argv.map(shellQuote).join(' ')
}
