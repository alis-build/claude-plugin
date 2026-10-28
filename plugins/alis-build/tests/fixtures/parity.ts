// Generated from hooks/cli-hook.py decide() by the snippet in tests/parity.test.ts;
// regenerate when the Python gate changes.
export type ParityCase = { command: string; mode: string; allowed: string; tier: string; python: Record<string, unknown> | null }
export const PARITY: readonly ParityCase[] = [
 {
  "command": "alis deploy example.app.api.v1 --confirm-production --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis deploy example.app.api.v1 --confirm-production --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis deploy example.app.api.v1 --confirm-production --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis deploy example.app.api.v1 --confirm-production --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis deploy example.app.api.v1 --confirm-production --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis deploy example.app.api.v1 --confirm-production --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis deploy example.app.api.v1 --confirm-production --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis deploy example.app.api.v1 --confirm-production --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis deploy example.app.api.v1 --confirm-production --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis deploy example.app.api.v1 --confirm-production --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis deploy example.app.api.v1 --confirm-production --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis deploy example.app.api.v1 --confirm-production --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis deploy example.app.api.v1 --confirm-production --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis deploy example.app.api.v1 --confirm-production --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis deploy example.app.api.v1 --confirm-production --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis deploy example.app.api.v1 --confirm-production --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis deploy example.app.api.v1 --confirm-production --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis deploy example.app.api.v1 --confirm-production --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis deploy example.app.api.v1 --confirm-production --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis deploy example.app.api.v1 --confirm-production --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis blocks uninstall blocks/example --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis blocks uninstall blocks/example --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis blocks uninstall blocks/example --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis blocks uninstall blocks/example --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis blocks uninstall blocks/example --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis blocks uninstall blocks/example --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis blocks uninstall blocks/example --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis blocks uninstall blocks/example --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis blocks uninstall blocks/example --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis blocks uninstall blocks/example --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis blocks uninstall blocks/example --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis blocks uninstall blocks/example --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis blocks uninstall blocks/example --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis blocks uninstall blocks/example --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis blocks uninstall blocks/example --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis blocks uninstall blocks/example --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis blocks uninstall blocks/example --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis blocks uninstall blocks/example --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis blocks uninstall blocks/example --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis blocks uninstall blocks/example --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis --json blocks uninstall blocks/example --yes",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis --json blocks uninstall blocks/example --yes --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis --json blocks uninstall blocks/example --yes",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis --json blocks uninstall blocks/example --yes --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis --json blocks uninstall blocks/example --yes",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis --json blocks uninstall blocks/example --yes --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis --json blocks uninstall blocks/example --yes",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis --json blocks uninstall blocks/example --yes --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis --json blocks uninstall blocks/example --yes",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis --json blocks uninstall blocks/example --yes",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis --json blocks uninstall blocks/example --yes",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis --json blocks uninstall blocks/example --yes",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis --json blocks uninstall blocks/example --yes",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis --json blocks uninstall blocks/example --yes --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis --json blocks uninstall blocks/example --yes",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis --json blocks uninstall blocks/example --yes --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis --json blocks uninstall blocks/example --yes",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis --json blocks uninstall blocks/example --yes --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis --json blocks uninstall blocks/example --yes",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis --json blocks uninstall blocks/example --yes --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis block --json uninstall blocks/example",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis block --json uninstall blocks/example --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis block --json uninstall blocks/example",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis block --json uninstall blocks/example --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis block --json uninstall blocks/example",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis block --json uninstall blocks/example --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis block --json uninstall blocks/example",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis block --json uninstall blocks/example --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis block --json uninstall blocks/example",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis block --json uninstall blocks/example",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis block --json uninstall blocks/example",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis block --json uninstall blocks/example",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis block --json uninstall blocks/example",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis block --json uninstall blocks/example --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis block --json uninstall blocks/example",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis block --json uninstall blocks/example --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis block --json uninstall blocks/example",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis block --json uninstall blocks/example --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis block --json uninstall blocks/example",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis block --json uninstall blocks/example --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis --cwd '/tmp/work space' --json blocks uninstall blocks/example",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis --cwd '/tmp/work space' --json blocks uninstall blocks/example --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis --cwd '/tmp/work space' --json blocks uninstall blocks/example",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis --cwd '/tmp/work space' --json blocks uninstall blocks/example --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis --cwd '/tmp/work space' --json blocks uninstall blocks/example",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis --cwd '/tmp/work space' --json blocks uninstall blocks/example --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis --cwd '/tmp/work space' --json blocks uninstall blocks/example",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis --cwd '/tmp/work space' --json blocks uninstall blocks/example --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis --cwd '/tmp/work space' --json blocks uninstall blocks/example",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis --cwd '/tmp/work space' --json blocks uninstall blocks/example",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis --cwd '/tmp/work space' --json blocks uninstall blocks/example",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis --cwd '/tmp/work space' --json blocks uninstall blocks/example",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis --cwd '/tmp/work space' --json blocks uninstall blocks/example",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis --cwd '/tmp/work space' --json blocks uninstall blocks/example --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis --cwd '/tmp/work space' --json blocks uninstall blocks/example",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis --cwd '/tmp/work space' --json blocks uninstall blocks/example --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis --cwd '/tmp/work space' --json blocks uninstall blocks/example",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis --cwd '/tmp/work space' --json blocks uninstall blocks/example --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis --cwd '/tmp/work space' --json blocks uninstall blocks/example",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis --cwd '/tmp/work space' --json blocks uninstall blocks/example --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis deploy example.app.api.v1 --approve=true",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis deploy example.app.api.v1 --approve=true --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis deploy example.app.api.v1 --approve=true",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis deploy example.app.api.v1 --approve=true --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis deploy example.app.api.v1 --approve=true",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis deploy example.app.api.v1 --approve=true --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis deploy example.app.api.v1 --approve=true",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis deploy example.app.api.v1 --approve=true --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis deploy example.app.api.v1 --approve=true",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis deploy example.app.api.v1 --approve=true",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis deploy example.app.api.v1 --approve=true",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis deploy example.app.api.v1 --approve=true",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis deploy example.app.api.v1 --approve=true",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis deploy example.app.api.v1 --approve=true --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis deploy example.app.api.v1 --approve=true",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis deploy example.app.api.v1 --approve=true --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis deploy example.app.api.v1 --approve=true",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis deploy example.app.api.v1 --approve=true --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis deploy example.app.api.v1 --approve=true",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis deploy example.app.api.v1 --approve=true --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis build example.app.api.v1 --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis build example.app.api.v1 --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis build example.app.api.v1 --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Your Alis automation tier is manual, so the CLI needs approval for this action. Confirm this exact Alis action and its target; the plugin adds --approve.",
   "updatedInput": {
    "command": "alis build example.app.api.v1 --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis build example.app.api.v1 --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis build example.app.api.v1 --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis build example.app.api.v1 --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis build example.app.api.v1 --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis build example.app.api.v1 --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis build example.app.api.v1 --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis build example.app.api.v1 --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis build example.app.api.v1 --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis build example.app.api.v1 --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Your Alis automation tier is manual, so the CLI needs approval for this action. Confirm this exact Alis action and its target; the plugin adds --approve.",
   "updatedInput": {
    "command": "alis build example.app.api.v1 --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis build example.app.api.v1 --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis build example.app.api.v1 --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis operations describe operations/a --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis operations describe operations/a --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis operations describe operations/a --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis operations describe operations/a --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis operations describe operations/a --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis operations describe operations/a --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis operations describe operations/a --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis operations describe operations/a --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis operations describe operations/a --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis operations describe operations/a --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis operations describe operations/a --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis operations describe operations/a --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis operations describe operations/a --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis operations describe operations/a --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis operations describe operations/a --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis operations describe operations/a --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis operations describe operations/a --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis operations describe operations/a --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis build && touch /tmp/sentinel",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build && touch /tmp/sentinel",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build && touch /tmp/sentinel",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build && touch /tmp/sentinel",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build && touch /tmp/sentinel",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build && touch /tmp/sentinel",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build && touch /tmp/sentinel",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build && touch /tmp/sentinel",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build && touch /tmp/sentinel",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build && touch /tmp/sentinel",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build && touch /tmp/sentinel",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build && touch /tmp/sentinel",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "cd /tmp && alis build",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "cd /tmp && alis build",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "cd /tmp && alis build",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "cd /tmp && alis build",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "cd /tmp && alis build",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "cd /tmp && alis build",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "cd /tmp && alis build",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "cd /tmp && alis build",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "cd /tmp && alis build",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "cd /tmp && alis build",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "cd /tmp && alis build",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "cd /tmp && alis build",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build 2>&1 | head",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build 2>&1 | head",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build 2>&1 | head",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build 2>&1 | head",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build 2>&1 | head",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build 2>&1 | head",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build 2>&1 | head",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build 2>&1 | head",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build 2>&1 | head",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build 2>&1 | head",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build 2>&1 | head",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build 2>&1 | head",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis ask \"$(touch /tmp/sentinel)\"",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis ask \"$(touch /tmp/sentinel)\"",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis ask \"$(touch /tmp/sentinel)\"",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis ask \"$(touch /tmp/sentinel)\"",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis ask \"$(touch /tmp/sentinel)\"",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis ask \"$(touch /tmp/sentinel)\"",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis ask \"$(touch /tmp/sentinel)\"",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis ask \"$(touch /tmp/sentinel)\"",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis ask \"$(touch /tmp/sentinel)\"",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis ask \"$(touch /tmp/sentinel)\"",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis ask \"$(touch /tmp/sentinel)\"",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis ask \"$(touch /tmp/sentinel)\"",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build\nwhoami",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build\nwhoami",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build\nwhoami",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build\nwhoami",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build\nwhoami",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build\nwhoami",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build\nwhoami",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build\nwhoami",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build\nwhoami",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build\nwhoami",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build\nwhoami",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build\nwhoami",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis run *",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis run *",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis run *",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis run *",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis run *",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis run *",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis run *",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis run *",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis run *",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis run *",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis run *",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis run *",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build; echo done",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build; echo done",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build; echo done",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build; echo done",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build; echo done",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build; echo done",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build; echo done",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build; echo done",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build; echo done",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build; echo done",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build; echo done",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis build; echo done",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "additionalContext": "Run one standalone alis command and read its complete JSON result. Use alis --cwd /absolute/workspace/path instead of cd &&. Keep stderr progress separate; no head/tail, pipes, redirects or sleep loops. A Claude background-task ID is not an Alis operation ID."
  }
 },
 {
  "command": "alis --cwd '/tmp/work space' ask 'literal | text and $value' --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis --cwd '/tmp/work space' ask 'literal | text and $value' --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis --cwd '/tmp/work space' ask 'literal | text and $value' --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis --cwd '/tmp/work space' ask 'literal | text and $value' --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis --cwd '/tmp/work space' ask 'literal | text and $value' --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis --cwd '/tmp/work space' ask 'literal | text and $value' --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis --cwd '/tmp/work space' ask 'literal | text and $value' --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis --cwd '/tmp/work space' ask 'literal | text and $value' --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis --cwd '/tmp/work space' ask 'literal | text and $value' --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis --cwd '/tmp/work space' ask 'literal | text and $value' --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis --cwd '/tmp/work space' ask 'literal | text and $value' --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis --cwd '/tmp/work space' ask 'literal | text and $value' --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis --cwd '/tmp/work space' ask 'literal | text and $value' --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis --cwd '/tmp/work space' ask 'literal | text and $value' --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis --cwd '/tmp/work space' ask 'literal | text and $value' --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis --cwd '/tmp/work space' ask 'literal | text and $value' --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis --cwd '/tmp/work space' ask 'literal | text and $value' --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis --cwd '/tmp/work space' ask 'literal | text and $value' --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis run",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis run",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis run",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis run",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis run",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis run",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis run",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis run",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis run",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis run",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis run",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis run",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis specialist send-message --to person@example.test",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis specialist send-message --to person@example.test",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis specialist send-message --to person@example.test",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis specialist send-message --to person@example.test",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis specialist send-message --to person@example.test",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis specialist send-message --to person@example.test",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis specialist send-message --to person@example.test",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis specialist send-message --to person@example.test",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis specialist send-message --to person@example.test",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis specialist send-message --to person@example.test",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis specialist send-message --to person@example.test",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis specialist send-message --to person@example.test",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis future-mutation",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis future-mutation",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis future-mutation",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis future-mutation",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis future-mutation",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis future-mutation",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis future-mutation",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis future-mutation",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis future-mutation",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis future-mutation",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis future-mutation",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis future-mutation",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis workstation handoff targets --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis workstation handoff targets --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis workstation handoff targets --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis workstation handoff targets --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis workstation handoff targets --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis workstation handoff targets --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis workstation handoff targets --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis workstation handoff targets --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis workstation handoff targets --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis workstation handoff targets --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis workstation handoff targets --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis workstation handoff targets --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis workstation handoff targets --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis workstation handoff targets --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis workstation handoff targets --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis workstation handoff targets --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis workstation handoff targets --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis workstation handoff targets --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis workstation handoff status abc --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis workstation handoff status abc --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis workstation handoff status abc --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis workstation handoff status abc --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis workstation handoff status abc --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis workstation handoff status abc --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis workstation handoff status abc --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis workstation handoff status abc --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis workstation handoff status abc --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis workstation handoff status abc --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis workstation handoff status abc --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis workstation handoff status abc --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis workstation handoff status abc --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis workstation handoff status abc --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis workstation handoff status abc --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis workstation handoff status abc --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis workstation handoff status abc --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis workstation handoff status abc --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis workstation handoff --session abc",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis workstation handoff --session abc",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis workstation handoff --session abc",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis workstation handoff --session abc",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis workstation handoff --session abc",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis workstation handoff --session abc",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis workstation handoff --session abc",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis workstation handoff --session abc",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis workstation handoff --session abc",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis workstation handoff --session abc",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis workstation handoff --session abc",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis workstation handoff --session abc",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis workstation handoff open abc",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis workstation handoff open abc",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis workstation handoff open abc",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis workstation handoff open abc",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis workstation handoff open abc",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis workstation handoff open abc",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis workstation handoff open abc",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis workstation handoff open abc",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis workstation handoff open abc",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis workstation handoff open abc",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis workstation handoff open abc",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis workstation handoff open abc",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis workstation handoff _hook",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis workstation handoff _hook",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis workstation handoff _hook",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis workstation handoff _hook",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis workstation handoff _hook",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis workstation handoff _hook",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis workstation handoff _hook",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis workstation handoff _hook",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis workstation handoff _hook",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis workstation handoff _hook",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis workstation handoff _hook",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis workstation handoff _hook",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis workstation handoff --session abc --to alis-acme-1234567890",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis workstation handoff --session abc --to alis-acme-1234567890",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis workstation handoff --session abc --to alis-acme-1234567890",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis workstation handoff --session abc --to alis-acme-1234567890",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis workstation handoff --session abc --to alis-acme-1234567890",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis workstation handoff --session abc --to alis-acme-1234567890",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis workstation handoff --session abc --to alis-acme-1234567890",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis workstation handoff --session abc --to alis-acme-1234567890",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis workstation handoff --session abc --to alis-acme-1234567890",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis workstation handoff --session abc --to alis-acme-1234567890",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis workstation handoff --session abc --to alis-acme-1234567890",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis workstation handoff --session abc --to alis-acme-1234567890",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis whoami --session-id keep --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force."
  }
 },
 {
  "command": "alis whoami --session-id keep --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force."
  }
 },
 {
  "command": "alis whoami --session-id keep --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis whoami --session-id keep --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis whoami --session-id keep --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force."
  }
 },
 {
  "command": "alis whoami --session-id keep --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force."
  }
 },
 {
  "command": "alis whoami --session-id keep --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis whoami --session-id keep --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis whoami --session-id keep --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force."
  }
 },
 {
  "command": "alis whoami --session-id keep --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force."
  }
 },
 {
  "command": "alis whoami --session-id keep --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis whoami --session-id keep --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ask -- --session-id looks-like-a-flag",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ask --session-id session-a -- --session-id looks-like-a-flag",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ask -- --session-id looks-like-a-flag",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ask --session-id session-a -- --session-id looks-like-a-flag",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ask -- --session-id looks-like-a-flag",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ask -- --session-id looks-like-a-flag",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ask -- --session-id looks-like-a-flag",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ask --session-id session-a -- --session-id looks-like-a-flag",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ask -- --session-id looks-like-a-flag",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ask --session-id session-a -- --session-id looks-like-a-flag",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ask -- --session-id looks-like-a-flag",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ask -- --session-id looks-like-a-flag",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ask -- --session-id looks-like-a-flag",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ask --session-id session-a -- --session-id looks-like-a-flag",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ask -- --session-id looks-like-a-flag",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ask --session-id session-a -- --session-id looks-like-a-flag",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ask -- --session-id looks-like-a-flag",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ask -- --session-id looks-like-a-flag",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis --help",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis CLI help or version output; nothing executes."
  }
 },
 {
  "command": "alis --help",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis CLI help or version output; nothing executes."
  }
 },
 {
  "command": "alis --help",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis CLI help or version output; nothing executes."
  }
 },
 {
  "command": "alis --help",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis CLI help or version output; nothing executes."
  }
 },
 {
  "command": "alis --help",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis CLI help or version output; nothing executes."
  }
 },
 {
  "command": "alis --help",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis CLI help or version output; nothing executes."
  }
 },
 {
  "command": "alis --help",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis CLI help or version output; nothing executes."
  }
 },
 {
  "command": "alis --help",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis CLI help or version output; nothing executes."
  }
 },
 {
  "command": "alis --help",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis CLI help or version output; nothing executes."
  }
 },
 {
  "command": "alis --help",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis CLI help or version output; nothing executes."
  }
 },
 {
  "command": "alis --help",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis CLI help or version output; nothing executes."
  }
 },
 {
  "command": "alis --help",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis CLI help or version output; nothing executes."
  }
 },
 {
  "command": "alis env list --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis env list --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis env list --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis env list --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis env list --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis env list --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis env list --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis env list --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis env list --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis env list --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis env list --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis env list --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis env list --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis env list --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis env list --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis env list --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis env list --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis env list --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis environment destroy dev --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis environment destroy dev --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment destroy dev --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis environment destroy dev --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment destroy dev --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis environment destroy dev --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment destroy dev --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis environment destroy dev --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment destroy dev --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis environment destroy dev --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis environment destroy dev --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis environment destroy dev --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis environment destroy dev --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis environment destroy dev --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment destroy dev --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis environment destroy dev --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment destroy dev --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis environment destroy dev --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment destroy dev --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis environment destroy dev --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ops wait operations/1 --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ops wait operations/1 --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ops wait operations/1 --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ops wait operations/1 --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ops wait operations/1 --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ops wait operations/1 --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ops wait operations/1 --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ops wait operations/1 --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ops wait operations/1 --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ops wait operations/1 --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ops wait operations/1 --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ops wait operations/1 --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ops wait operations/1 --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ops wait operations/1 --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ops wait operations/1 --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ops wait operations/1 --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ops wait operations/1 --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ops wait operations/1 --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis packages install alis.os.cli.v1 --language go --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis packages install alis.os.cli.v1 --language go --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis packages install alis.os.cli.v1 --language go --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Your Alis automation tier is manual, so the CLI needs approval for this action. Confirm this exact Alis action and its target; the plugin adds --approve.",
   "updatedInput": {
    "command": "alis packages install alis.os.cli.v1 --language go --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis packages install alis.os.cli.v1 --language go --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis packages install alis.os.cli.v1 --language go --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis packages install alis.os.cli.v1 --language go --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis packages install alis.os.cli.v1 --language go --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis packages install alis.os.cli.v1 --language go --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis packages install alis.os.cli.v1 --language go --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis packages install alis.os.cli.v1 --language go --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis packages install alis.os.cli.v1 --language go --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis packages install alis.os.cli.v1 --language go --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Your Alis automation tier is manual, so the CLI needs approval for this action. Confirm this exact Alis action and its target; the plugin adds --approve.",
   "updatedInput": {
    "command": "alis packages install alis.os.cli.v1 --language go --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis packages install alis.os.cli.v1 --language go --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis packages install alis.os.cli.v1 --language go --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis packages remove x --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis packages remove x --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis packages remove x --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis packages remove x --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis packages remove x --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis packages remove x --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis packages remove x --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis packages remove x --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis packages remove x --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis packages remove x --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis packages remove x --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis packages remove x --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis docs codeblocks",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis docs codeblocks --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis docs codeblocks",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis docs codeblocks --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis docs codeblocks",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis docs codeblocks",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis docs codeblocks",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis docs codeblocks --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis docs codeblocks",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis docs codeblocks --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis docs codeblocks",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis docs codeblocks",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis docs codeblocks",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis docs codeblocks --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis docs codeblocks",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis docs codeblocks --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis docs codeblocks",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis docs codeblocks",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ask \"a \\\"quoted\\\" word\" --approve=true",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis ask 'a \"quoted\" word' --approve=true --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ask \"a \\\"quoted\\\" word\" --approve=true",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis ask 'a \"quoted\" word' --approve=true --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ask \"a \\\"quoted\\\" word\" --approve=true",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis ask 'a \"quoted\" word' --approve=true --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ask \"a \\\"quoted\\\" word\" --approve=true",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis ask 'a \"quoted\" word' --approve=true --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ask \"a \\\"quoted\\\" word\" --approve=true",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis ask \"a \\\"quoted\\\" word\" --approve=true",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis ask \"a \\\"quoted\\\" word\" --approve=true",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis ask \"a \\\"quoted\\\" word\" --approve=true",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis ask \"a \\\"quoted\\\" word\" --approve=true",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis ask 'a \"quoted\" word' --approve=true --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ask \"a \\\"quoted\\\" word\" --approve=true",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis ask 'a \"quoted\" word' --approve=true --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ask \"a \\\"quoted\\\" word\" --approve=true",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis ask 'a \"quoted\" word' --approve=true --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ask \"a \\\"quoted\\\" word\" --approve=true",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis ask 'a \"quoted\" word' --approve=true --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ask esc\\aped --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ask escaped --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ask esc\\aped --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ask escaped --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ask esc\\aped --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ask esc\\aped --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ask esc\\aped --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ask escaped --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ask esc\\aped --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ask escaped --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ask esc\\aped --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ask esc\\aped --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ask esc\\aped --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ask escaped --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ask esc\\aped --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ask escaped --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ask esc\\aped --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ask esc\\aped --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "echo alis build",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": null
 },
 {
  "command": "echo alis build",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": null
 },
 {
  "command": "echo alis build",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "echo alis build",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "echo alis build",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": null
 },
 {
  "command": "echo alis build",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": null
 },
 {
  "command": "echo alis build",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "echo alis build",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "echo alis build",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": null
 },
 {
  "command": "echo alis build",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": null
 },
 {
  "command": "echo alis build",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "echo alis build",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis skills load id --via dispatcher",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis skills load id --via dispatcher --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis skills load id --via dispatcher",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis skills load id --via dispatcher --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis skills load id --via dispatcher",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis skills load id --via dispatcher",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis skills load id --via dispatcher",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis skills load id --via dispatcher --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis skills load id --via dispatcher",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis skills load id --via dispatcher --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis skills load id --via dispatcher",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis skills load id --via dispatcher",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis skills load id --via dispatcher",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis skills load id --via dispatcher --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis skills load id --via dispatcher",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis skills load id --via dispatcher --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis skills load id --via dispatcher",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis skills load id --via dispatcher",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis define alis.os.cli.v1 --json --install",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis define alis.os.cli.v1 --json --install --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis define alis.os.cli.v1 --json --install",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Your Alis automation tier is manual, so the CLI needs approval for this action. Confirm this exact Alis action and its target; the plugin adds --approve.",
   "updatedInput": {
    "command": "alis define alis.os.cli.v1 --json --install --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis define alis.os.cli.v1 --json --install",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis define alis.os.cli.v1 --json --install",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis define alis.os.cli.v1 --json --install",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis define alis.os.cli.v1 --json --install",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis define alis.os.cli.v1 --json --install",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis define alis.os.cli.v1 --json --install",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis define alis.os.cli.v1 --json --install",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis define alis.os.cli.v1 --json --install --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis define alis.os.cli.v1 --json --install",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Your Alis automation tier is manual, so the CLI needs approval for this action. Confirm this exact Alis action and its target; the plugin adds --approve.",
   "updatedInput": {
    "command": "alis define alis.os.cli.v1 --json --install --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis define alis.os.cli.v1 --json --install",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis define alis.os.cli.v1 --json --install",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis authorise x",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis authorise x --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis authorise x",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Your Alis automation tier is manual, so the CLI needs approval for this action. Confirm this exact Alis action and its target; the plugin adds --approve.",
   "updatedInput": {
    "command": "alis authorise x --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis authorise x",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis authorise x",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis authorise x",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis authorise x",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis authorise x",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis authorise x",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis authorise x",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis authorise x --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis authorise x",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Your Alis automation tier is manual, so the CLI needs approval for this action. Confirm this exact Alis action and its target; the plugin adds --approve.",
   "updatedInput": {
    "command": "alis authorise x --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis authorise x",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis authorise x",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis blocks list --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis blocks list --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis blocks list --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis blocks list --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis blocks list --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis blocks list --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis blocks list --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis blocks list --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis blocks list --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis blocks list --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis blocks list --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis blocks list --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis blocks list --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis blocks list --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis blocks list --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis blocks list --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis blocks list --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis blocks list --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis logs runtime svc --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis logs runtime svc --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis logs runtime svc --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis logs runtime svc --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis logs runtime svc --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis logs runtime svc --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis logs runtime svc --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis logs runtime svc --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis logs runtime svc --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis logs runtime svc --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis logs runtime svc --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis logs runtime svc --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis logs runtime svc --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis logs runtime svc --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis logs runtime svc --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis logs runtime svc --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis logs runtime svc --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis logs runtime svc --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ideate context ideas/1 --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate context ideas/1 --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate context ideas/1 --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate context ideas/1 --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate context ideas/1 --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ideate context ideas/1 --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ideate context ideas/1 --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate context ideas/1 --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate context ideas/1 --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate context ideas/1 --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate context ideas/1 --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ideate context ideas/1 --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ideate context ideas/1 --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate context ideas/1 --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate context ideas/1 --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate context ideas/1 --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate context ideas/1 --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ideate context ideas/1 --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis specialist get tickets/1 --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis specialist get tickets/1 --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis specialist get tickets/1 --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis specialist get tickets/1 --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis specialist get tickets/1 --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis specialist get tickets/1 --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis specialist get tickets/1 --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis specialist get tickets/1 --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis specialist get tickets/1 --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis specialist get tickets/1 --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis specialist get tickets/1 --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis specialist get tickets/1 --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis context view --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis context view --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis context view --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis context view --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis context view --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis context view --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis context view --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis context view --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis context view --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis context view --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis context view --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis context view --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis context view --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis context view --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis context view --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis context view --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis context view --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis context view --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis context view --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis context view --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis context view --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis context view --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis context view --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis context view --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment unset dev KEY --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis environment unset dev KEY --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment unset dev KEY --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis environment unset dev KEY --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment unset dev KEY --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis environment unset dev KEY --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment unset dev KEY --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis environment unset dev KEY --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment unset dev KEY --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis environment unset dev KEY --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis environment unset dev KEY --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis environment unset dev KEY --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis environment unset dev KEY --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis environment unset dev KEY --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment unset dev KEY --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis environment unset dev KEY --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment unset dev KEY --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis environment unset dev KEY --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment unset dev KEY --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis environment unset dev KEY --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis env set dev KEY=1 --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis env set dev KEY=1 --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis env set dev KEY=1 --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis env set dev KEY=1 --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis env set dev KEY=1 --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis env set dev KEY=1 --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis env set dev KEY=1 --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis env set dev KEY=1 --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis env set dev KEY=1 --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis env set dev KEY=1 --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis env set dev KEY=1 --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis env set dev KEY=1 --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ask 'x' --yes --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis ask x --yes --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ask 'x' --yes --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis ask x --yes --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ask 'x' --yes --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis ask x --yes --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ask 'x' --yes --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis ask x --yes --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ask 'x' --yes --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis ask 'x' --yes --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis ask 'x' --yes --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis ask 'x' --yes --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis ask 'x' --yes --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis ask x --yes --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ask 'x' --yes --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis ask x --yes --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ask 'x' --yes --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis ask x --yes --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ask 'x' --yes --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis ask x --yes --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis whoami -h",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis whoami -h --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis whoami -h",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis whoami -h --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis whoami -h",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis whoami -h",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis whoami -h",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis whoami -h --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis whoami -h",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis whoami -h --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis whoami -h",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis whoami -h",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis whoami -h",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis whoami -h --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis whoami -h",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis whoami -h --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis whoami -h",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis whoami -h",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "  alis version --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis version --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "  alis version --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis version --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "  alis version --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "  alis version --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "  alis version --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis version --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "  alis version --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis version --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "  alis version --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "  alis version --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "  alis version --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis version --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "  alis version --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis version --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "  alis version --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "  alis version --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis   docs   --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis docs --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis   docs   --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis docs --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis   docs   --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis   docs   --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis   docs   --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis docs --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis   docs   --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis docs --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis   docs   --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis   docs   --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis   docs   --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis docs --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis   docs   --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis docs --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis   docs   --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis   docs   --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis environment variables alis.os --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment variables alis.os --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment variables alis.os --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment variables alis.os --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment variables alis.os --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment variables alis.os --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment variables alis.os --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment variables alis.os --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment variables alis.os --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis environment variables alis.os --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis environment variables alis.os --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis environment variables alis.os --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis environment variables alis.os --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment variables alis.os --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment variables alis.os --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment variables alis.os --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment variables alis.os --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment variables alis.os --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment variables alis.os --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment variables alis.os --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis env vars alis.os",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis env vars alis.os --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis env vars alis.os",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis env vars alis.os --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis env vars alis.os",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis env vars alis.os --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis env vars alis.os",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis env vars alis.os --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis env vars alis.os",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis env vars alis.os",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis env vars alis.os",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis env vars alis.os",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis env vars alis.os",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis env vars alis.os --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis env vars alis.os",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis env vars alis.os --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis env vars alis.os",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis env vars alis.os --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis env vars alis.os",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis env vars alis.os --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment variables alis.os --reveal -e production --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment variables alis.os --reveal -e production --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment variables alis.os --reveal -e production --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment variables alis.os --reveal -e production --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment variables alis.os --reveal -e production --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment variables alis.os --reveal -e production --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment variables alis.os --reveal -e production --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment variables alis.os --reveal -e production --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment variables alis.os --reveal -e production --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis environment variables alis.os --reveal -e production --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis environment variables alis.os --reveal -e production --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis environment variables alis.os --reveal -e production --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis environment variables alis.os --reveal -e production --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment variables alis.os --reveal -e production --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment variables alis.os --reveal -e production --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment variables alis.os --reveal -e production --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment variables alis.os --reveal -e production --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment variables alis.os --reveal -e production --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment variables alis.os --reveal -e production --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment variables alis.os --reveal -e production --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment refresh alis.os",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment refresh alis.os --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment refresh alis.os",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment refresh alis.os --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment refresh alis.os",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment refresh alis.os --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment refresh alis.os",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment refresh alis.os --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment refresh alis.os",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis environment refresh alis.os",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis environment refresh alis.os",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis environment refresh alis.os",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis environment refresh alis.os",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment refresh alis.os --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment refresh alis.os",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment refresh alis.os --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment refresh alis.os",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment refresh alis.os --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment refresh alis.os",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment refresh alis.os --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment refresh alis.os --output .env",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment refresh alis.os --output .env --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment refresh alis.os --output .env",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment refresh alis.os --output .env --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment refresh alis.os --output .env",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment refresh alis.os --output .env --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment refresh alis.os --output .env",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment refresh alis.os --output .env --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment refresh alis.os --output .env",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis environment refresh alis.os --output .env",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis environment refresh alis.os --output .env",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis environment refresh alis.os --output .env",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis environment refresh alis.os --output .env",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment refresh alis.os --output .env --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment refresh alis.os --output .env",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment refresh alis.os --output .env --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment refresh alis.os --output .env",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment refresh alis.os --output .env --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment refresh alis.os --output .env",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment refresh alis.os --output .env --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment refresh alis.os --reveal",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment refresh alis.os --reveal --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment refresh alis.os --reveal",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment refresh alis.os --reveal --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment refresh alis.os --reveal",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment refresh alis.os --reveal --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment refresh alis.os --reveal",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment refresh alis.os --reveal --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment refresh alis.os --reveal",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis environment refresh alis.os --reveal",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis environment refresh alis.os --reveal",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis environment refresh alis.os --reveal",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis environment refresh alis.os --reveal",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment refresh alis.os --reveal --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment refresh alis.os --reveal",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment refresh alis.os --reveal --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment refresh alis.os --reveal",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment refresh alis.os --reveal --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment refresh alis.os --reveal",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "This Alis command prints or writes secret values, which land in the session transcript. Confirm the exact command and deployment environment.",
   "updatedInput": {
    "command": "alis environment refresh alis.os --reveal --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis operations --reveal describe operations/a --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis operations --reveal describe operations/a --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis operations --reveal describe operations/a --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis operations --reveal describe operations/a --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis operations --reveal describe operations/a --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis operations --reveal describe operations/a --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis operations --reveal describe operations/a --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis operations --reveal describe operations/a --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis operations --reveal describe operations/a --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis operations --reveal describe operations/a --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis operations --reveal describe operations/a --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis operations --reveal describe operations/a --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis operations --reveal describe operations/a --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis operations --reveal describe operations/a --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis operations --reveal describe operations/a --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis operations --reveal describe operations/a --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis operations --reveal describe operations/a --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis operations --reveal describe operations/a --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis define alis.os.cli.v1 --dry-run --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis define alis.os.cli.v1 --dry-run --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis define alis.os.cli.v1 --dry-run --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis define alis.os.cli.v1 --dry-run --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis define alis.os.cli.v1 --dry-run --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis define alis.os.cli.v1 --dry-run --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis define alis.os.cli.v1 --dry-run --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis define alis.os.cli.v1 --dry-run --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis define alis.os.cli.v1 --dry-run --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis define alis.os.cli.v1 --dry-run --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis define alis.os.cli.v1 --dry-run --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis define alis.os.cli.v1 --dry-run --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis define alis.os.cli.v1 --dry-run --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis define alis.os.cli.v1 --dry-run --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis define alis.os.cli.v1 --dry-run --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis define alis.os.cli.v1 --dry-run --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis deploy example.app.api.v1 --version 1.2.3 -e dev --json --async",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis deploy example.app.api.v1 --version 1.2.3 -e dev --json --async --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis deploy example.app.api.v1 --version 1.2.3 -e dev --json --async",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Your Alis automation tier is manual, so the CLI needs approval for this action. Confirm this exact Alis action and its target; the plugin adds --approve.",
   "updatedInput": {
    "command": "alis deploy example.app.api.v1 --version 1.2.3 -e dev --json --async --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis deploy example.app.api.v1 --version 1.2.3 -e dev --json --async",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis deploy example.app.api.v1 --version 1.2.3 -e dev --json --async",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis deploy example.app.api.v1 --version 1.2.3 -e dev --json --async",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis deploy example.app.api.v1 --version 1.2.3 -e dev --json --async",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis deploy example.app.api.v1 --version 1.2.3 -e dev --json --async",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis deploy example.app.api.v1 --version 1.2.3 -e dev --json --async",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis deploy example.app.api.v1 --version 1.2.3 -e dev --json --async",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis deploy example.app.api.v1 --version 1.2.3 -e dev --json --async --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis deploy example.app.api.v1 --version 1.2.3 -e dev --json --async",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Your Alis automation tier is manual, so the CLI needs approval for this action. Confirm this exact Alis action and its target; the plugin adds --approve.",
   "updatedInput": {
    "command": "alis deploy example.app.api.v1 --version 1.2.3 -e dev --json --async --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis deploy example.app.api.v1 --version 1.2.3 -e dev --json --async",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis deploy example.app.api.v1 --version 1.2.3 -e dev --json --async",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis packages upgrade alis.os.cli.v1 --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis packages upgrade alis.os.cli.v1 --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis packages upgrade alis.os.cli.v1 --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Your Alis automation tier is manual, so the CLI needs approval for this action. Confirm this exact Alis action and its target; the plugin adds --approve.",
   "updatedInput": {
    "command": "alis packages upgrade alis.os.cli.v1 --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis packages upgrade alis.os.cli.v1 --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis packages upgrade alis.os.cli.v1 --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis packages upgrade alis.os.cli.v1 --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis packages upgrade alis.os.cli.v1 --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis packages upgrade alis.os.cli.v1 --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis packages upgrade alis.os.cli.v1 --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis packages upgrade alis.os.cli.v1 --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis packages upgrade alis.os.cli.v1 --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis packages upgrade alis.os.cli.v1 --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Your Alis automation tier is manual, so the CLI needs approval for this action. Confirm this exact Alis action and its target; the plugin adds --approve.",
   "updatedInput": {
    "command": "alis packages upgrade alis.os.cli.v1 --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis packages upgrade alis.os.cli.v1 --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis packages upgrade alis.os.cli.v1 --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis packages add alis.os.cli.v1 --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis packages add alis.os.cli.v1 --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis packages add alis.os.cli.v1 --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Your Alis automation tier is manual, so the CLI needs approval for this action. Confirm this exact Alis action and its target; the plugin adds --approve.",
   "updatedInput": {
    "command": "alis packages add alis.os.cli.v1 --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis packages add alis.os.cli.v1 --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis packages add alis.os.cli.v1 --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis packages add alis.os.cli.v1 --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis packages add alis.os.cli.v1 --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis packages add alis.os.cli.v1 --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis packages add alis.os.cli.v1 --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis packages add alis.os.cli.v1 --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis packages add alis.os.cli.v1 --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis packages add alis.os.cli.v1 --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Your Alis automation tier is manual, so the CLI needs approval for this action. Confirm this exact Alis action and its target; the plugin adds --approve.",
   "updatedInput": {
    "command": "alis packages add alis.os.cli.v1 --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis packages add alis.os.cli.v1 --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis packages add alis.os.cli.v1 --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis build example.app.api.v1 --json --approve",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis build example.app.api.v1 --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis build example.app.api.v1 --json --approve",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis build example.app.api.v1 --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis build example.app.api.v1 --json --approve",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis build example.app.api.v1 --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis build example.app.api.v1 --json --approve",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis build example.app.api.v1 --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis build example.app.api.v1 --json --approve",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis build example.app.api.v1 --json --approve",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis build example.app.api.v1 --json --approve",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis build example.app.api.v1 --json --approve",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis build example.app.api.v1 --json --approve",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis build example.app.api.v1 --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis build example.app.api.v1 --json --approve",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis build example.app.api.v1 --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis build example.app.api.v1 --json --approve",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis build example.app.api.v1 --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis build example.app.api.v1 --json --approve",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis build example.app.api.v1 --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis build example.app.api.v1 --json -- extra",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis build example.app.api.v1 --json --session-id session-a -- extra",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis build example.app.api.v1 --json -- extra",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Your Alis automation tier is manual, so the CLI needs approval for this action. Confirm this exact Alis action and its target; the plugin adds --approve.",
   "updatedInput": {
    "command": "alis build example.app.api.v1 --json --approve --session-id session-a -- extra",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis build example.app.api.v1 --json -- extra",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis build example.app.api.v1 --json -- extra",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis build example.app.api.v1 --json -- extra",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis build example.app.api.v1 --json -- extra",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis build example.app.api.v1 --json -- extra",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis build example.app.api.v1 --json -- extra",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis build example.app.api.v1 --json -- extra",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis build example.app.api.v1 --json --session-id session-a -- extra",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis build example.app.api.v1 --json -- extra",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Your Alis automation tier is manual, so the CLI needs approval for this action. Confirm this exact Alis action and its target; the plugin adds --approve.",
   "updatedInput": {
    "command": "alis build example.app.api.v1 --json --approve --session-id session-a -- extra",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis build example.app.api.v1 --json -- extra",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis build example.app.api.v1 --json -- extra",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis environment variables alis.os --help",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis environment variables alis.os --help --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment variables alis.os --help",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis environment variables alis.os --help --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment variables alis.os --help",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis environment variables alis.os --help",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis environment variables alis.os --help",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis environment variables alis.os --help --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment variables alis.os --help",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis environment variables alis.os --help --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment variables alis.os --help",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis environment variables alis.os --help",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis environment variables alis.os --help",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis environment variables alis.os --help --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment variables alis.os --help",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis environment variables alis.os --help --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis environment variables alis.os --help",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis environment variables alis.os --help",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis blocks uninstall blocks/example -h",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis blocks uninstall blocks/example -h --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis blocks uninstall blocks/example -h",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis blocks uninstall blocks/example -h --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis blocks uninstall blocks/example -h",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis blocks uninstall blocks/example -h",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis blocks uninstall blocks/example -h",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis blocks uninstall blocks/example -h --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis blocks uninstall blocks/example -h",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis blocks uninstall blocks/example -h --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis blocks uninstall blocks/example -h",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis blocks uninstall blocks/example -h",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis blocks uninstall blocks/example -h",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis blocks uninstall blocks/example -h --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis blocks uninstall blocks/example -h",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis blocks uninstall blocks/example -h --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis blocks uninstall blocks/example -h",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis blocks uninstall blocks/example -h",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis environment set dev --name --help",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis environment set dev --name --help",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis environment set dev --name --help",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis environment set dev --name --help",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis environment set dev --name --help",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis environment set dev --name --help",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis environment set dev --name --help",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis environment set dev --name --help",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis environment set dev --name --help",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis environment set dev --name --help",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis environment set dev --name --help",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis environment set dev --name --help",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis -v",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis CLI help or version output; nothing executes."
  }
 },
 {
  "command": "alis -v",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis CLI help or version output; nothing executes."
  }
 },
 {
  "command": "alis -v",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis CLI help or version output; nothing executes."
  }
 },
 {
  "command": "alis -v",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis CLI help or version output; nothing executes."
  }
 },
 {
  "command": "alis -v",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis CLI help or version output; nothing executes."
  }
 },
 {
  "command": "alis -v",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis CLI help or version output; nothing executes."
  }
 },
 {
  "command": "alis -v",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis CLI help or version output; nothing executes."
  }
 },
 {
  "command": "alis -v",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis CLI help or version output; nothing executes."
  }
 },
 {
  "command": "alis -v",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis CLI help or version output; nothing executes."
  }
 },
 {
  "command": "alis -v",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis CLI help or version output; nothing executes."
  }
 },
 {
  "command": "alis -v",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis CLI help or version output; nothing executes."
  }
 },
 {
  "command": "alis -v",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis CLI help or version output; nothing executes."
  }
 },
 {
  "command": "alis ideate artifacts read artifact --project project --path README.md --start-line 2 --end-line 8 --version 3 --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate artifacts read artifact --project project --path README.md --start-line 2 --end-line 8 --version 3 --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate artifacts read artifact --project project --path README.md --start-line 2 --end-line 8 --version 3 --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate artifacts read artifact --project project --path README.md --start-line 2 --end-line 8 --version 3 --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate artifacts read artifact --project project --path README.md --start-line 2 --end-line 8 --version 3 --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ideate artifacts read artifact --project project --path README.md --start-line 2 --end-line 8 --version 3 --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ideate artifacts read artifact --project project --path README.md --start-line 2 --end-line 8 --version 3 --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate artifacts read artifact --project project --path README.md --start-line 2 --end-line 8 --version 3 --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate artifacts read artifact --project project --path README.md --start-line 2 --end-line 8 --version 3 --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate artifacts read artifact --project project --path README.md --start-line 2 --end-line 8 --version 3 --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate artifacts read artifact --project project --path README.md --start-line 2 --end-line 8 --version 3 --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ideate artifacts read artifact --project project --path README.md --start-line 2 --end-line 8 --version 3 --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ideate artifacts read artifact --project project --path README.md --start-line 2 --end-line 8 --version 3 --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate artifacts read artifact --project project --path README.md --start-line 2 --end-line 8 --version 3 --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate artifacts read artifact --project project --path README.md --start-line 2 --end-line 8 --version 3 --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate artifacts read artifact --project project --path README.md --start-line 2 --end-line 8 --version 3 --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate artifacts read artifact --project project --path README.md --start-line 2 --end-line 8 --version 3 --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ideate artifacts read artifact --project project --path README.md --start-line 2 --end-line 8 --version 3 --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis --cwd /tmp/work --json ideate artifacts read artifact --project project",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis --cwd /tmp/work --json ideate artifacts read artifact --project project --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis --cwd /tmp/work --json ideate artifacts read artifact --project project",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis --cwd /tmp/work --json ideate artifacts read artifact --project project --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis --cwd /tmp/work --json ideate artifacts read artifact --project project",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis --cwd /tmp/work --json ideate artifacts read artifact --project project",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis --cwd /tmp/work --json ideate artifacts read artifact --project project",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis --cwd /tmp/work --json ideate artifacts read artifact --project project --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis --cwd /tmp/work --json ideate artifacts read artifact --project project",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis --cwd /tmp/work --json ideate artifacts read artifact --project project --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis --cwd /tmp/work --json ideate artifacts read artifact --project project",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis --cwd /tmp/work --json ideate artifacts read artifact --project project",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis --cwd /tmp/work --json ideate artifacts read artifact --project project",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis --cwd /tmp/work --json ideate artifacts read artifact --project project --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis --cwd /tmp/work --json ideate artifacts read artifact --project project",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis --cwd /tmp/work --json ideate artifacts read artifact --project project --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis --cwd /tmp/work --json ideate artifacts read artifact --project project",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis --cwd /tmp/work --json ideate artifacts read artifact --project project",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ideate artifacts list project --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate artifacts list project --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate artifacts list project --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate artifacts list project --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate artifacts list project --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ideate artifacts list project --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ideate artifacts list project --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate artifacts list project --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate artifacts list project --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate artifacts list project --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate artifacts list project --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ideate artifacts list project --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ideate artifacts list project --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate artifacts list project --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate artifacts list project --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate artifacts list project --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate artifacts list project --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ideate artifacts list project --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ideate artifacts get artifact --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate artifacts get artifact --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate artifacts get artifact --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate artifacts get artifact --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate artifacts get artifact --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ideate artifacts get artifact --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ideate artifacts get artifact --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate artifacts get artifact --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate artifacts get artifact --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate artifacts get artifact --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate artifacts get artifact --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ideate artifacts get artifact --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ideate artifacts get artifact --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate artifacts get artifact --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate artifacts get artifact --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate artifacts get artifact --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate artifacts get artifact --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ideate artifacts get artifact --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ideate output-artifact artifact --project project --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate output-artifact artifact --project project --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate output-artifact artifact --project project --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate output-artifact artifact --project project --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate output-artifact artifact --project project --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ideate output-artifact artifact --project project --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ideate output-artifact artifact --project project --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate output-artifact artifact --project project --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate output-artifact artifact --project project --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate output-artifact artifact --project project --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate output-artifact artifact --project project --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ideate output-artifact artifact --project project --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ideate output-artifact artifact --project project --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate output-artifact artifact --project project --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate output-artifact artifact --project project --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate output-artifact artifact --project project --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate output-artifact artifact --project project --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ideate output-artifact artifact --project project --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ideate output-artifacts project --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate output-artifacts project --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate output-artifacts project --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate output-artifacts project --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate output-artifacts project --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ideate output-artifacts project --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ideate output-artifacts project --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate output-artifacts project --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate output-artifacts project --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate output-artifacts project --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate output-artifacts project --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ideate output-artifacts project --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ideate output-artifacts project --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate output-artifacts project --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate output-artifacts project --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate output-artifacts project --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate output-artifacts project --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ideate output-artifacts project --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ideate sessions project --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate sessions project --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate sessions project --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate sessions project --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate sessions project --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ideate sessions project --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ideate sessions project --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate sessions project --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate sessions project --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate sessions project --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate sessions project --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ideate sessions project --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ideate sessions project --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate sessions project --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate sessions project --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate sessions project --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate sessions project --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ideate sessions project --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ideate session session --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate session session --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate session session --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate session session --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate session session --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ideate session session --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ideate session session --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate session session --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate session session --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate session session --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate session session --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ideate session session --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ideate session session --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate session session --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate session session --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "allow",
   "permissionDecisionReason": "Alis structured CLI workflow; CLI automation and production gates remain in force.",
   "updatedInput": {
    "command": "alis ideate session session --json --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis ideate session session --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ideate session session --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ideate artifacts configure artifact --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis ideate artifacts configure artifact --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis ideate artifacts configure artifact --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ideate artifacts configure artifact --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ideate artifacts configure artifact --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis ideate artifacts configure artifact --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis ideate artifacts configure artifact --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis ideate artifacts configure artifact --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis ideate artifacts configure artifact --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis ideate artifacts configure artifact --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis ideate artifacts configure artifact --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ideate artifacts configure artifact --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ideate artifacts regenerate artifact --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis ideate artifacts regenerate artifact --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis ideate artifacts regenerate artifact --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ideate artifacts regenerate artifact --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ideate artifacts regenerate artifact --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis ideate artifacts regenerate artifact --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis ideate artifacts regenerate artifact --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis ideate artifacts regenerate artifact --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis ideate artifacts regenerate artifact --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis ideate artifacts regenerate artifact --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis ideate artifacts regenerate artifact --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ideate artifacts regenerate artifact --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ideate artifacts migrate artifact --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis ideate artifacts migrate artifact --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis ideate artifacts migrate artifact --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ideate artifacts migrate artifact --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ideate artifacts migrate artifact --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis ideate artifacts migrate artifact --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis ideate artifacts migrate artifact --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis ideate artifacts migrate artifact --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis ideate artifacts migrate artifact --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis ideate artifacts migrate artifact --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis ideate artifacts migrate artifact --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ideate artifacts migrate artifact --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ideate artifacts future-mutation artifact --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis ideate artifacts future-mutation artifact --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis ideate artifacts future-mutation artifact --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ideate artifacts future-mutation artifact --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis ideate artifacts future-mutation artifact --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis ideate artifacts future-mutation artifact --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis ideate artifacts future-mutation artifact --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis ideate artifacts future-mutation artifact --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis ideate artifacts future-mutation artifact --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis ideate artifacts future-mutation artifact --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis ideate artifacts future-mutation artifact --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis ideate artifacts future-mutation artifact --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis release example.app.api.v1 --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis release example.app.api.v1 --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis release example.app.api.v1 --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis release example.app.api.v1 --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis release example.app.api.v1 --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis release example.app.api.v1 --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis release example.app.api.v1 --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis release example.app.api.v1 --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis release example.app.api.v1 --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis release example.app.api.v1 --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse"
  }
 },
 {
  "command": "alis release example.app.api.v1 --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": null
 },
 {
  "command": "alis release example.app.api.v1 --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": null
 },
 {
  "command": "alis release example.app.api.v1 --confirm-production --json",
  "mode": "auto",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis release example.app.api.v1 --confirm-production --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis release example.app.api.v1 --confirm-production --json",
  "mode": "auto",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis release example.app.api.v1 --confirm-production --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis release example.app.api.v1 --confirm-production --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis release example.app.api.v1 --confirm-production --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis release example.app.api.v1 --confirm-production --json",
  "mode": "auto",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis release example.app.api.v1 --confirm-production --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis release example.app.api.v1 --confirm-production --json",
  "mode": "plan",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis release example.app.api.v1 --confirm-production --json",
  "mode": "plan",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis release example.app.api.v1 --confirm-production --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis release example.app.api.v1 --confirm-production --json",
  "mode": "plan",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "deny",
   "permissionDecisionReason": "This Alis action changes state. Finish the plan and obtain execution approval first."
  }
 },
 {
  "command": "alis release example.app.api.v1 --confirm-production --json",
  "mode": "default",
  "allowed": "",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis release example.app.api.v1 --confirm-production --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis release example.app.api.v1 --confirm-production --json",
  "mode": "default",
  "allowed": "",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis release example.app.api.v1 --confirm-production --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis release example.app.api.v1 --confirm-production --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis release example.app.api.v1 --confirm-production --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 },
 {
  "command": "alis release example.app.api.v1 --confirm-production --json",
  "mode": "default",
  "allowed": "context doctor",
  "tier": "manual",
  "python": {
   "hookEventName": "PreToolUse",
   "permissionDecision": "ask",
   "permissionDecisionReason": "Confirm this exact Alis action and its target. The plugin never treats a session mode as consent.",
   "updatedInput": {
    "command": "alis release example.app.api.v1 --confirm-production --json --approve --session-id session-a",
    "timeout": 120000
   }
  }
 }
]
