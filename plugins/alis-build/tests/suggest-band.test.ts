import { describe, expect, test, tier } from 'claude-code/testing'

import { suggestSkills } from '../hooks/mod/suggest'
import { dismissSuggestions, loadPromptOf, showSuggestions, suggestBand, suggestionsOf } from '../hooks/mod/suggest-band'
import { renderSuggestBand } from '../hooks/mod/suggest-band-view'
import { fakeHost } from './fixtures/fake-host'

tier('user')

const ONE = 'Possibly relevant Alis skill: build-your-first-ios-app — Guide builders through native iPhone and iPad apps.\nLoad with `alis skills load <id>` if relevant; otherwise ignore this note.'
const TWO = 'Possibly relevant Alis skills:\n  pubsub-handler — Add a Pub/Sub event handler to a neuron.\n  spanner-schema — Design a Spanner schema.\nLoad with `alis skills load <id>` if relevant; otherwise ignore this note.'
const envelope = (context: string) => JSON.stringify({ hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: context } })
const prompt = (text: string) => ({ text, wait: false, origin: { kind: 'composer' as const } })
const passthrough = async (e: { text: string; context?: readonly string[] }) => ({ text: e.text, context: e.context })

describe('suggest-band', () => {
  test('suggestionsOf reads one or several skills from the CLI note', () => {
    expect(suggestionsOf(ONE)).toEqual([{ id: 'build-your-first-ios-app', description: 'Guide builders through native iPhone and iPad apps.' }])
    expect(suggestionsOf(TWO)).toEqual([
      { id: 'pubsub-handler', description: 'Add a Pub/Sub event handler to a neuron.' },
      { id: 'spanner-schema', description: 'Design a Spanner schema.' },
    ])
    expect(suggestionsOf('Nothing to see')).toEqual([])
    expect(suggestionsOf('Possibly relevant Alis skill: — no id')).toEqual([])
    expect(loadPromptOf('x-y')).toBe('Load the Alis skill x-y with `alis skills load x-y --via dispatcher` and follow it for the current task.')
  })

  test('a suggestion fills the band and asks for a redraw; the next prompt clears it', async () => {
    dismissSuggestions()
    const host = fakeHost({ answer: () => ({ exitCode: 0, stdout: envelope(ONE), stderr: '' }) })
    host.dir = '/x/alis.build/acme/build/a/v1'
    await suggestSkills(host, prompt('make an iphone app'), passthrough)
    expect(suggestBand.items.map(i => i.id)).toEqual(['build-your-first-ios-app'])
    expect(host.invalidations).toBe(1)
    expect(host.toasts).toEqual(['skill suggested: build-your-first-ios-app (band above the prompt)'])
    host.answer = () => ({ exitCode: 0, stdout: '', stderr: '' })
    await suggestSkills(host, prompt('thanks'), passthrough)
    expect(suggestBand.items).toEqual([])
    expect(host.invalidations).toBe(2)
    await suggestSkills(host, prompt('and again'), passthrough)
    expect(host.invalidations).toBe(2)
  })

  test('showSuggestions reports whether anything changed', () => {
    dismissSuggestions()
    expect(showSuggestions([])).toBe(false)
    expect(showSuggestions([{ id: 'a', description: 'd' }])).toBe(true)
    expect(dismissSuggestions()).toBe(true)
    expect(dismissSuggestions()).toBe(false)
  })

  test('the band draws a Load button per skill with numbered hotkeys and a Dismiss', async ($, on) => {
    const pressed: string[] = []
    const items = suggestionsOf(TWO)
    on('ui.render', { component: 'AbovePrompt' }, ($, e) => renderSuggestBand($.ui.resolve(e), items, { load: id => pressed.push(id), dismiss: () => pressed.push('dismiss') }, e.props.bodyColumns))
    const drawn = JSON.stringify(await $.ui.render({
      surface: 'terminal', component: 'AbovePrompt', requestId: 'band',
      props: { hasSurvey: false, isWorking: false, maxRows: 6, bodyColumns: 100, scroll: { first: 0, bodyRows: 5 } as never, view: {} as never },
    }))
    expect(drawn).toContain('"label":"Load pubsub-handler"')
    expect(drawn).toContain('"label":"Load spanner-schema"')
    expect(drawn).toContain('"hotkey":"1"')
    expect(drawn).toContain('"hotkey":"2"')
    expect(drawn).toContain('"label":"Dismiss"')
    expect(drawn).toContain('Design a Spanner schema.')
  })
})
