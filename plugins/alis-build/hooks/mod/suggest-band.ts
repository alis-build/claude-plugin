// The skill suggestion band above the prompt: what the CLI suggested for the
// last prompt, with a Load button per skill. The model still gets the same
// note as context (suggest.ts); the band lets the person decide too, and a
// press hands Claude the load command as a prompt.
export type Suggestion = { id: string; description: string }

const HEADER = /^Possibly relevant Alis skills?:\s*(.*)$/
const ITEM = /^\s*([a-z0-9][a-z0-9._-]*)\s+—\s+(.*)$/

/** The skills named in the CLI's hook note, in order; [] when it names none. */
export function suggestionsOf(note: string): Suggestion[] {
  const lines = note.split('\n')
  const start = lines.findIndex(line => HEADER.test(line))
  if (start === -1) return []
  const items: Suggestion[] = []
  const inline = lines[start]?.match(HEADER)?.[1]?.trim()
  const candidates = inline ? [inline, ...lines.slice(start + 1)] : lines.slice(start + 1)
  for (const line of candidates) {
    if (/^Load with/.test(line.trim())) break
    const m = line.match(ITEM)
    if (m) items.push({ id: m[1] as string, description: (m[2] as string).trim() })
  }
  return items
}

/** What the band shows now: the suggestions for the last prompt, or nothing. */
export const suggestBand: { items: Suggestion[] } = { items: [] }

export function showSuggestions(items: Suggestion[]): boolean {
  const changed = items.length > 0 || suggestBand.items.length > 0
  suggestBand.items = items
  return changed
}

export function dismissSuggestions(): boolean {
  return showSuggestions([])
}

/** The prompt a Load press hands Claude. */
export function loadPromptOf(id: string): string {
  return `Load the Alis skill ${id} with \`alis skills load ${id} --via dispatcher\` and follow it for the current task.`
}
