---
type: llm
focus: last_message
---
The user explicitly asked whether an Alis Build skill exists for creating a landing zone (a platform concept: an organisation's cloud foundation, not a website landing page).

Pass only if ALL hold:
1. The answer is direct: either it names a real, matching skill by id and offers to load it, or it says plainly that nothing fits and offers to file a request with `alis skills request`.
2. It does NOT present a landing-*page* skill (e.g. `landing-page-playbook`) or any unrelated skill as a match for a landing *zone*.
3. It does not invent a skill id, and does not dump a long list of the whole catalog.
4. It does not deflect with a generic "I can't search skills" or answer as if "landing zone" meant a marketing page.

Fail if any is violated.
