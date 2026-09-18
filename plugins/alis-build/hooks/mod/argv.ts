/** Inserts `flags` before a `--` separator, or at the end when there is none. */
export function insertFlagsBeforeSeparator(argv: readonly string[], flags: readonly string[]): string[] {
  const split = argv.indexOf('--')
  const at = split === -1 ? argv.length : split
  return [...argv.slice(0, at), ...flags, ...argv.slice(at)]
}
