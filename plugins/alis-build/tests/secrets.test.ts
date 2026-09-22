import { describe, expect, test, tier } from 'claude-code/testing'

import { passClassic } from '../hooks/mod/classic'
import { secretKindsOf, secretsAnswer, warningOf } from '../hooks/mod/secrets'
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
  privateKey: '-----BEGIN RSA PRIVATE KEY-----',
  assignment: 'STRIPE_SECRET_KEY=FAKEFAKEFAKEFAKEFAKEFAKE',
}

describe('secrets', () => {
  test('secretKindsOf names each kind once with its count', () => {
    expect(secretKindsOf(`${FAKE.stripe}\n${FAKE.stripe}\n${FAKE.postgres}`)).toEqual([
      { kind: 'stripe', count: 2 },
      { kind: 'postgres', count: 1 },
    ])
    for (const [kind, sample] of Object.entries(FAKE)) {
      expect(secretKindsOf(`value: ${sample}`).map(k => k.kind)).toEqual([kind])
    }
  })

  test('masked, redacted and names-only output is clean', () => {
    for (const text of [
      '',
      'STRIPE_SECRET_KEY=••••••••',
      'token [REDACTED:stripe] was here',
      '{"envs":[{"name":"STRIPE_SECRET_KEY","set":true}],"revealed":false}',
      'alis environment variables alis.os --reveal',
      'export PATH=/usr/local/bin:/usr/bin',
    ]) {
      expect(secretKindsOf(text)).toEqual([])
    }
  })

  test('a Bash result with secrets warns the person and the model', async () => {
    const host = fakeHost()
    const e = { session_id: 'abc', hook_event_name: 'PostToolUse', tool_name: 'Bash', tool_input: { command: 'cat .env' }, tool_response: { stdout: `${FAKE.stripe}\n${FAKE.postgres}\n`, stderr: '' } }
    const answer = await secretsAnswer(host, e)
    expect(answer).toEqual({ additionalContext: [warningOf([{ kind: 'stripe', count: 1 }, { kind: 'postgres', count: 1 }])] })
    expect(answer.additionalContext?.[0]).toContain('stripe')
    expect(answer.additionalContext?.[0]).toContain('rotate')
    expect(host.toasts).toHaveLength(1)
    expect(host.toasts[0]).toContain('secret')
    expect(host.toasts[0]).not.toContain(FAKE.stripe)
  })

  test('a Read result is scanned too; a clean result is silent', async () => {
    const host = fakeHost()
    const read = { hook_event_name: 'PostToolUse', tool_name: 'Read', tool_input: { file_path: '/x/.env' }, tool_response: { type: 'text', file: { filePath: '/x/.env', content: FAKE.assignment } } }
    expect((await secretsAnswer(host, read)).additionalContext?.[0]).toContain('assignment')
    expect(await secretsAnswer(host, { hook_event_name: 'PostToolUse', tool_name: 'Bash', tool_response: { stdout: 'ok\n', stderr: '' } })).toEqual({})
    expect(await secretsAnswer(host, { hook_event_name: 'PostToolUse', tool_name: 'Bash' })).toEqual({})
    expect(host.toasts).toHaveLength(1)
  })

  test('the classic PostToolUse pass carries the warning as additionalContext', async () => {
    const host = fakeHost({ answer: () => ({ exitCode: 1, stdout: '', stderr: '' }) })
    const e = { session_id: 'abc', hook_event_name: 'PostToolUse', tool_name: 'Bash', tool_input: { command: 'cat .env' }, tool_response: { stdout: FAKE.github, stderr: '' } }
    const answer = await passClassic(host, 'classic.PostToolUse', e, async () => ({}))
    expect(answer).toEqual({ additionalContext: [warningOf([{ kind: 'github', count: 1 }])] })
  })
})
