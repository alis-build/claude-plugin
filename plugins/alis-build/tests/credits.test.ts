import { describe, expect, test, tier } from 'claude-code/testing'

import { runAlisCommand } from '../hooks/mod/alis-command'
import { announceEarned, balanceOf, creditsOf, creditsText, readCredits, SEEN_KEY } from '../hooks/mod/credits'
import { fakeHost } from './fixtures/fake-host'

tier('user')

const grant = (id: string, kind = 'earned', personal = true, credits = 10) => ({ name: `accounts/acme/creditGrants/${id}`, kind, credits, remainingCredits: credits, personal })
const answerOf = (grants: ReturnType<typeof grant>[], extra: Record<string, unknown> = {}) => () => ({
  exitCode: 0,
  stdout: JSON.stringify({ account: 'accounts/acme', availableCredits: 12.5, earnedCredits: 7.5, period: { usedCredits: 29.5, limitCredits: 50 }, grants, ...extra }),
  stderr: '',
})

describe('credits', () => {
  test('creditsOf reads the CLI balance and tolerates junk', () => {
    const credits = creditsOf(JSON.parse(answerOf([grant('session-reward-t1')])().stdout))
    expect(credits).toEqual({ account: 'accounts/acme', available: 12.5, earned: 7.5, used: 29.5, limit: 50, grants: [{ name: 'accounts/acme/creditGrants/session-reward-t1', kind: 'earned', credits: 10, personal: true }] })
    expect(balanceOf(credits!)).toBe('12.5 available (7.5 earned)')
    expect(creditsOf({ account: 'accounts/acme', grants: [5, {}, { name: 1 }] })).toEqual({ account: 'accounts/acme', available: 0, earned: 0, used: 0, limit: null, grants: [] })
    expect(creditsOf({ version: '1.0.0' })).toBeNull()
    expect([creditsText(10), creditsText(2.5), creditsText(0.125), creditsText(0)]).toEqual(['10', '2.5', '0.125', '0'])
  })

  test('a CLI that cannot read credits answers nothing, and never throws', async () => {
    expect(await readCredits(fakeHost({ answer: () => ({ exitCode: 1, stdout: '{"error":{"code":"credits_unavailable","message":"no"}}', stderr: '' }) }))).toBeNull()
    expect(await readCredits(fakeHost({ answer: () => ({ exitCode: 1, stdout: '', stderr: 'unknown command "credits"' }) }))).toBeNull()
    expect(await readCredits(fakeHost({ answer: () => new Error('ENOENT') }))).toBeNull()
  })

  test('the first read records what is there; a later earned grant is thanked once', async () => {
    let grants = [grant('session-reward-old'), grant('welcome', 'promotional', false)]
    const host = fakeHost({ answer: run => answerOf(grants)() })
    await announceEarned(host)
    expect(host.runs[0]?.argv.slice(0, 3)).toEqual(['alis', 'credits', '--json'])
    expect(host.toasts).toEqual([])
    expect(host.store[SEEN_KEY]).toEqual(['accounts/acme/creditGrants/session-reward-old'])

    grants = [grant('session-reward-new', 'earned', true, 20), ...grants, grant('team', 'earned', false)]
    await announceEarned(host)
    expect(host.toasts).toEqual(['+20 AlisX credits: a session you sent was useful to the build team. Thank you.'])
    expect(host.store[SEEN_KEY]).toEqual(['accounts/acme/creditGrants/session-reward-old', 'accounts/acme/creditGrants/session-reward-new'])

    await announceEarned(host)
    expect(host.toasts.length).toBe(1)
  })

  test('unreadable credits leave what was seen alone', async () => {
    const host = fakeHost({ answer: () => ({ exitCode: 1, stdout: '', stderr: 'offline' }) })
    host.store[SEEN_KEY] = ['a']
    await announceEarned(host)
    expect(host.store[SEEN_KEY]).toEqual(['a'])
    expect(host.toasts).toEqual([])
  })

  test('/alis credits prints the balance, and /alis status carries it', async () => {
    const host = fakeHost({ answer: run => (run.argv[1] === 'credits' ? answerOf([grant('session-reward-t1')])() : { exitCode: 0, stdout: '{"version":"1.190.14"}', stderr: '' }) })
    expect((await runAlisCommand(host, 'credits')).text).toBe(
      ['credits: accounts/acme', 'available: 12.5', 'earned: 7.5', 'used: 29.5 this period of 50', 'earn: /alis share sends this session to the AlisX build team; a session they find useful earns credits'].join('\n'),
    )
    expect((await runAlisCommand(host, 'status')).text).toContain('credits: 12.5 available (7.5 earned)')
    const without = fakeHost({ answer: () => ({ exitCode: 1, stdout: '', stderr: 'unknown command' }) })
    expect((await runAlisCommand(without, 'credits')).text).toContain('credits: unavailable')
  })
})
