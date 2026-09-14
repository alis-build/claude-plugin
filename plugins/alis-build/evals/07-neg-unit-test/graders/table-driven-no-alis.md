---
type: llm
focus: last_message
---
The user pasted a small Go function `parseDate(s string) (time.Time, error)` and asked for a unit test. The agent has no Write tool, so the test is delivered in the message.

Pass only if ALL hold:
1. The response contains a Go test file for package `dates` (or `dates_test` with a note) using the standard `testing` package, with at least one function named `TestParseDate` or a close variant (`TestParseDate_Valid`, `TestParseDateErrors`, ...).
2. It exercises at least one valid `YYYY-MM-DD` input, asserting the parsed date and that the result is in UTC, and at least one invalid input that must return an error.
3. It calls `parseDate` with the given signature (a string in, `time.Time` and `error` out) and does not rename it or change its contract.
4. The response contains NO mention of Alis Build, skills, skill discovery, catalogs, or registries. It is a plain coding answer.

Do not fail the response for style, for the number of cases, or for anything you cannot verify from the text. Fail only if one of 1-4 is clearly violated.
