import { describe, expect, test, tier } from 'claude-code/testing'

import { classicState } from '../hooks/mod/classic'
import { suggestSkills } from '../hooks/mod/suggest'
import { fakeHost } from './fixtures/fake-host'

tier('user')

const envelope = (context: string) =>
  JSON.stringify({ hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: context } })
const prompt = (text: string) => ({ text, wait: false, origin: { kind: 'composer' as const } })
const passthrough = async (e: { text: string; context?: readonly string[] }) => ({ text: e.text, context: e.context })

const WAKE_HINT = 'The user addressed alis by name. Invoke the alis:discover skill now.'

describe('suggest', () => {
  test('only wake words reach the CLI, in a workspace or not', async () => {
    for (const dir of ['/plain/project', '/Users/me/alis.build/acme/build/sm/hello/v1']) {
      const host = fakeHost({ answer: () => ({ exitCode: 0, stdout: envelope(WAKE_HINT), stderr: '' }) })
      host.dir = dir
      expect(await suggestSkills(host, prompt('add an endpoint'), passthrough)).toEqual({ text: 'add an endpoint', context: undefined })
      expect(host.runs).toHaveLength(0)
      expect(await suggestSkills(host, prompt('alis, add an endpoint'), passthrough)).toEqual({ text: 'alis, add an endpoint', context: [WAKE_HINT] })
      expect(host.runs).toHaveLength(1)
      host.env['ALIS_SUGGEST_ALWAYS'] = '1'
      await suggestSkills(host, prompt('add an endpoint'), passthrough)
      expect(host.runs).toHaveLength(2)
    }
  })

  test('the CLI gets a classic-shaped payload and a wake hint is attached', async () => {
    classicState.permissionMode = 'plan'
    const host = fakeHost({ answer: () => ({ exitCode: 0, stdout: envelope(WAKE_HINT), stderr: 'progress' }) })
    host.dir = '/Users/me/alis.build/acme/build/sm/hello/v1'
    const result = await suggestSkills(host, { ...prompt('alis, deploy it'), context: ['earlier'] }, passthrough)
    expect(result).toEqual({ text: 'alis, deploy it', context: ['earlier', WAKE_HINT] })
    expect(host.runs[0]?.argv).toEqual(['alis', 'skills', 'suggest', '--hook'])
    expect(host.runs[0]?.init?.timeoutMs).toBe(2000)
    expect(JSON.parse(host.runs[0]?.init?.stdin ?? '')).toEqual({
      hook_event_name: 'UserPromptSubmit',
      session_id: 'session-a',
      cwd: host.dir,
      permission_mode: 'plan',
      prompt: 'alis, deploy it',
    })
  })

  test('an ambient suggestion never reaches the model', async () => {
    // Ticket 0c78cf3e: the desktop app's scratch-workspace reminder (an alis.build
    // path, "the app") scored build-your-first-ios-app on a SendGrid question.
    const notes = [
      'Possibly relevant Alis skill: build-your-first-ios-app — Guide builders through native iPhone and iPad apps.\nLoad with `alis skills load <id>` if relevant; otherwise ignore this note.',
      'Possibly relevant Alis skills:\n  a — A.\n  b — B.\nLoad with `alis skills load <id>` if relevant; otherwise ignore this note.',
    ]
    for (const note of notes) {
      const host = fakeHost({ answer: () => ({ exitCode: 0, stdout: envelope(note), stderr: '' }) })
      host.dir = '/Users/me/alis.build/acme/build/sm/hello/v1'
      const text = 'how are sendgrid templates managed across alis.os?'
      expect(await suggestSkills(host, prompt(text), passthrough)).toEqual({ text, context: undefined })
      expect(host.runs).toHaveLength(1)
      expect(host.toasts).toEqual([])
    }
  })

  test('an empty answer, a failing CLI or a missing CLI leave the prompt untouched', async () => {
    const cases = [
      () => ({ exitCode: 0, stdout: '', stderr: '' }),
      () => ({ exitCode: 1, stdout: envelope('ignored'), stderr: 'old alis' }),
      () => new Error('spawn alis ENOENT'),
      () => ({ exitCode: 0, stdout: 'not json', stderr: '' }),
    ]
    for (const answer of cases) {
      const host = fakeHost({ answer })
      host.dir = '/x/alis.build/acme/build/a/v1'
      expect(await suggestSkills(host, prompt('alis, ship it'), passthrough)).toEqual({ text: 'alis, ship it', context: undefined })
    }
  })
})
