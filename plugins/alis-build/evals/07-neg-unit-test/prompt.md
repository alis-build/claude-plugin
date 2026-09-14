---
max_turns: 8
timeout_seconds: 120
allowed_tools: [Skill, "Bash(alis skills *)"]
runs: 3
---
write a unit test for parseDate

```go
package dates

import (
	"fmt"
	"time"
)

// parseDate accepts YYYY-MM-DD and returns the date at midnight UTC.
func parseDate(s string) (time.Time, error) {
	t, err := time.Parse("2006-01-02", s)
	if err != nil {
		return time.Time{}, fmt.Errorf("parseDate %q: %w", s, err)
	}
	return t.UTC(), nil
}
```
