import { describe, expect, test, tier } from 'claude-code/testing'

import { passClassic } from '../hooks/mod/classic'
import { forgetSecrets, maskedToastOf, maskRow, maskText, MAX_SCAN, noteBashCall, secretKindsOf, secretsAnswer, warningOf } from '../hooks/mod/secrets'
import { fakeHost } from './fixtures/fake-host'

tier('user')

// The samples of tests/test_behavior.py SecretsTests, one for one. Every
// value here is a made-up shape, never a real credential.
const FAKE = {
  stripe: 'sk_live_' + 'FAKE'.repeat(5) + '0000',
  github: 'ghp_FAKEFAKEFAKEFAKEFAKEFAKEFAKEFAKE0000',
  npm: 'npm_FAKEFAKEFAKEFAKEFAKEFAKEFAKEFAKE0000',
  pypi: 'pypi-' + 'FAKE'.repeat(15),
  linear: 'lin_api_FAKEFAKEFAKEFAKEFAKE0000',
  sendgrid: 'SG.' + 'FAKE'.repeat(6) + '.' + 'FAKE'.repeat(11),
  postgres: 'postgres://app:FAKEpassword@db.example.test/app',
  aws: 'AKIAFAKEFAKEFAKEFAKE',
  google: 'AIza' + 'FAKE'.repeat(8) + 'FAK',
  slack: 'xoxb-FAKE-FAKE-FAKE-FAKE',
  privateKey: '-----BEGIN RSA PRIVATE KEY-----',
  assignment: 'STRIPE_SECRET_KEY=FAKEFAKEFAKEFAKEFAKEFAKE',
}
const REVEAL_COMMAND = 'alis environment variables alis.os --reveal --json'
const bash = (command: string, stdout: string, extra: object = {}) => ({
  session_id: 'abc', hook_event_name: 'PostToolUse', tool_name: 'Bash', tool_input: { command }, tool_response: { stdout, stderr: '' }, ...extra,
})
const write = (content: string) => ({ hook_event_name: 'PostToolUse', tool_name: 'Write', tool_input: { file_path: '/x/.env', content }, tool_response: { type: 'create', filePath: '/x/.env' } })
const resultRow = (content: unknown, id = 'toolu_1') => ({ type: 'user' as const, role: 'user' as const, content: [{ type: 'tool_result', tool_use_id: id, content, is_error: false }] })

describe('secrets', () => {
  test('secretKindsOf names each kind once with its count, in table order', () => {
    expect(secretKindsOf(`${FAKE.stripe}\n${FAKE.stripe}\n${FAKE.postgres}`)).toEqual([
      { kind: 'stripe', count: 2 },
      { kind: 'postgres', count: 1 },
    ])
    for (const [kind, sample] of Object.entries(FAKE)) {
      expect(secretKindsOf(`value: ${sample}`).map(k => k.kind)).toEqual([kind])
    }
  })

  test('one value matching two patterns counts once', () => {
    expect(secretKindsOf(`STRIPE_SECRET_KEY=${FAKE.stripe}`)).toEqual([{ kind: 'stripe', count: 1 }])
  })

  test('masked, redacted, names-only and secret-reference output is clean', () => {
    for (const text of [
      '',
      'STRIPE_SECRET_KEY=••••••••',
      'token [REDACTED:stripe] was here',
      '{"envs":[{"name":"STRIPE_SECRET_KEY","set":true}],"revealed":false}',
      'alis environment variables alis.os --reveal',
      'export PATH=/usr/local/bin:/usr/bin',
      '{"secretName": "projects/123456/secrets/db-password/versions/1"}',
      'password_secret_name = "projects/acme/secrets/db-password"',
      'The access_token: abcdefghijklmnopqrst is described in the docs',
      'DB_PASSWORD_SECRET_NAME=projects/acme/secrets/db-password',
    ]) {
      expect(secretKindsOf(text)).toEqual([])
    }
  })

  test('text past the scan cap is not read', () => {
    expect(secretKindsOf('x'.repeat(MAX_SCAN) + FAKE.stripe)).toEqual([])
    expect(secretKindsOf(FAKE.stripe + 'x'.repeat(MAX_SCAN))).toEqual([{ kind: 'stripe', count: 1 }])
  })

  test('an alis environment reveal counts every revealed row, masked rows never', async () => {
    forgetSecrets()
    const host = fakeHost()
    const json = '{"environments":[{"environmentId":"production","envs":[{"name":"DB_PASSWORD","value":"FAKE-long-value-abcdefghij"}]}],"revealed":true}'
    expect(await secretsAnswer(host, bash(REVEAL_COMMAND, json))).toEqual({ additionalContext: [warningOf([{ kind: 'revealed', count: 1 }])] })
    const table = 'NAME          VALUE\nDB_PASSWORD   FAKE-long-value-klmnopqrst\nAPI_URL       https://api.example.test\n'
    expect(await secretsAnswer(host, bash('alis env vars alis.os --reveal -e production', table))).toEqual({ additionalContext: [warningOf([{ kind: 'revealed', count: 2 }])] })
    expect(await secretsAnswer(host, bash('alis environment refresh alis.os --reveal', 'DB_PASSWORD=FAKE-long-value-uvwxyz\n'))).toEqual({ additionalContext: [warningOf([{ kind: 'revealed', count: 1 }])] })
    for (const masked of ['DB_PASSWORD   ••••••••\nEMPTY_ONE     (empty)\n', '{"environments":[{"envs":[{"name":"DB_PASSWORD","set":true}]}],"revealed":false}']) {
      expect(await secretsAnswer(host, bash('alis environment variables alis.os --json', masked))).toEqual({})
    }
    // The same rows from any other command are ordinary text.
    expect(await secretsAnswer(host, bash('cat table.txt', table))).toEqual({})
    expect(host.toasts).toHaveLength(3)
  })

  test("a tool's arguments warn the person and the model, without the values", async () => {
    forgetSecrets()
    const host = fakeHost()
    const answer = await secretsAnswer(host, write(`${FAKE.stripe}\n${FAKE.postgres}\n`))
    expect(answer).toEqual({ additionalContext: [warningOf([{ kind: 'stripe', count: 1 }, { kind: 'postgres', count: 1 }])] })
    expect(answer.additionalContext?.[0]).toContain('rotate')
    expect(answer.additionalContext?.[0]).not.toContain(FAKE.stripe)
    expect(host.toasts).toHaveLength(1)
    expect(host.toasts[0]).toContain('secret')
    expect(host.toasts[0]).not.toContain(FAKE.stripe)
    // The engine prefixes the plugin's name on toasts.
    expect(host.toasts[0]).not.toMatch(/^alis:/)
  })

  test("a result that is masked on its way in does not warn; a command's own secrets still do", async () => {
    forgetSecrets()
    const host = fakeHost()
    expect(await secretsAnswer(host, bash('cat .env', `${FAKE.stripe}\n${FAKE.postgres}\n`))).toEqual({})
    const read = { hook_event_name: 'PostToolUse', tool_name: 'Read', tool_input: { file_path: '/x/.env' }, tool_response: { type: 'text', file: { filePath: '/x/.env', content: FAKE.assignment } } }
    expect(await secretsAnswer(host, read)).toEqual({})
    expect(await secretsAnswer(host, { hook_event_name: 'PostToolUse', tool_name: 'mcp__x__y', tool_input: {}, tool_response: [{ type: 'text', text: FAKE.npm }] })).toEqual({})
    expect((await secretsAnswer(host, bash(`curl -H 'Authorization: ${FAKE.github}' x`, 'ok\n'))).additionalContext?.[0]).toContain('github')
    expect(await secretsAnswer(host, bash('echo ok', 'ok\n'))).toEqual({})
    expect(await secretsAnswer(host, { hook_event_name: 'PostToolUse', tool_name: 'Bash' })).toEqual({})
    expect(host.toasts).toHaveLength(1)
  })

  test('maskText replaces each value, keeping names, users and the text around it', () => {
    for (const [kind, sample] of Object.entries(FAKE)) {
      const masked = maskText(`value: ${sample} end`)
      expect(masked.text).toContain(`[REDACTED:${kind}]`)
      // A private key with no footer is masked to the end (see below).
      if (kind !== 'privateKey') expect(masked.text).toEndWith(' end')
      expect(masked.spans.map(s => s.kind)).toEqual([kind])
      expect(secretKindsOf(masked.text)).toEqual([])
    }
    expect(maskText(FAKE.assignment).text).toBe('STRIPE_SECRET_KEY=[REDACTED:assignment]')
    expect(maskText(`"GITHUB_TOKEN": "${'x'.repeat(20)}"`).text).toBe('"GITHUB_TOKEN": "[REDACTED:assignment]"')
    expect(maskText(FAKE.postgres).text).toBe('postgres://app:[REDACTED:postgres]@db.example.test/app')
    expect(maskText('nothing here').text).toBe('nothing here')
  })

  test('a private key is masked through its footer, or to the end when cut', () => {
    const body = 'MIIFAKEFAKE\nFAKEFAKEFAKE\n'
    const whole = `before\n${FAKE.privateKey}\n${body}-----END RSA PRIVATE KEY-----\nafter`
    expect(maskText(whole).text).toBe('before\n[REDACTED:privateKey]\nafter')
    expect(maskText(`before\n${FAKE.privateKey}\n${body}`).text).toBe('before\n[REDACTED:privateKey]')
  })

  test('maskRow masks string and block results, toasts each value once, and leaves a clean row alone', () => {
    forgetSecrets()
    const clean = resultRow('ok')
    expect(maskRow(clean)).toEqual({ message: clean, changed: false, fresh: [] })
    const first = maskRow(resultRow(`token ${FAKE.github}`))
    expect(first.changed).toBe(true)
    expect(JSON.stringify(first.message)).not.toContain(FAKE.github)
    expect(first.message.content[0]).toEqual({ type: 'tool_result', tool_use_id: 'toolu_1', content: 'token [REDACTED:github]', is_error: false })
    expect(first.fresh).toEqual([{ kind: 'github', count: 1 }])
    const blocks = maskRow(resultRow([{ type: 'text', text: FAKE.github }, { type: 'image', source: { data: 'x' } }]))
    expect(blocks.message.content[0]).toEqual({ type: 'tool_result', tool_use_id: 'toolu_1', content: [{ type: 'text', text: '[REDACTED:github]' }, { type: 'image', source: { data: 'x' } }], is_error: false })
    // Masked again, but already toasted.
    expect(blocks.fresh).toEqual([])
    expect(maskedToastOf('Bash', first.fresh)).not.toContain(FAKE.github)
  })

  test("an environment command's result is left as printed, once, and still warns", async () => {
    forgetSecrets()
    const revealed = 'DB_PASSWORD=FAKE-long-value-uvwxyz\nSTRIPE=' + FAKE.stripe
    noteBashCall({ command: 'alis environment refresh alis.os --reveal', tool_use_id: 'toolu_r', tool: 'Bash' })
    noteBashCall({ command: 'cat .env', tool_use_id: 'toolu_c', tool: 'Bash' })
    expect(maskRow(resultRow(revealed, 'toolu_r')).changed).toBe(false)
    expect(maskRow(resultRow(revealed, 'toolu_c')).changed).toBe(true)
    // The id is spent: a row reusing it is masked.
    expect(maskRow(resultRow(revealed, 'toolu_r')).changed).toBe(true)
    expect(await secretsAnswer(fakeHost(), bash('alis environment refresh alis.os --reveal', revealed))).not.toEqual({})
  })

  test('through the engine, a tool result row reaches the bottom masked', async ($, on) => {
    forgetSecrets()
    const toasts: string[] = []
    // The kit (2.1.287) skips a test answer to session.append that does not
    // call next, and nothing lies beneath; so read the row as it arrives.
    let reached: { message?: unknown; uuid?: string } = {}
    on('session.append', ($, e, next) => {
      reached = e
      return next(e)
    })
    on('ui.toast', ($, e) => {
      toasts.push(JSON.stringify(e))
      return { value: undefined }
    })
    await $.session.append({ message: resultRow(`key ${FAKE.npm}`), door: 'tool-result', origin: { kind: 'tool', tool: 'Bash' }, uuid: 'row-1' }).catch(() => undefined)
    expect(reached.uuid).toBe('row-1')
    expect(JSON.stringify(reached.message)).not.toContain(FAKE.npm)
    expect(JSON.stringify(reached.message)).toContain('[REDACTED:npm]')
    expect(toasts).toHaveLength(1)
    expect(toasts[0]).toContain('npm')
    expect(toasts[0]).not.toContain(FAKE.npm)
  })

  test('a value already warned about is not warned about again', async () => {
    forgetSecrets()
    const host = fakeHost()
    expect(await secretsAnswer(host, write(FAKE.stripe))).not.toEqual({})
    expect(await secretsAnswer(host, write(FAKE.stripe))).toEqual({})
    expect(await secretsAnswer(host, write(`${FAKE.stripe}\n${FAKE.linear}`))).toEqual({ additionalContext: [warningOf([{ kind: 'linear', count: 1 }])] })
    expect(host.toasts).toHaveLength(2)
  })

  test('the classic PostToolUse pass adds the warning to the handoff context', async () => {
    forgetSecrets()
    const handoff = '{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"from handoff"}}'
    const host = fakeHost({ answer: () => ({ exitCode: 0, stdout: handoff, stderr: '' }) })
    const answer = await passClassic(host, 'classic.PostToolUse', write(FAKE.github), async () => ({}))
    expect(answer).toEqual({ additionalContext: ['from handoff', warningOf([{ kind: 'github', count: 1 }])] })
  })
})
