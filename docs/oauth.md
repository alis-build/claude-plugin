# OAuth Setup

The Alis Build MCP server uses OAuth/OIDC through:

```text
https://identity.alisx.com
```

## Required Scopes

- `build:read`
- `build:write`
- `ideas:read`
- `ideas:write`

## Redirect URI

Claude Code's fixed callback port uses this redirect URI shape:

```text
http://localhost:7777/callback
```

The plugin MCP configuration includes:

```json
{
  "mcpServers": {
    "alis-build": {
      "type": "http",
      "url": "https://mcp.alis.build/mcp",
      "oauth": {
        "clientId": "cac878c2-ae88-47d4-89dc-3815ff556821",
        "callbackPort": 7777,
        "scopes": "build:read build:write ideas:read ideas:write"
      }
    }
  }
}
```

Register the exact Claude Code redirect URI with Alis Identity:

```text
http://localhost:7777/callback
```

This is different from the Codex plugin's fixed callback URI:

```text
http://localhost:7777/oauth/callback
```

## Login

Start Claude Code, then run:

```text
/mcp
```

Select `alis-build` and complete the browser login flow.

If the browser redirect fails with a connection error after authentication, paste the full callback URL from the browser address bar into Claude Code when prompted.

## Local MCP Test

To test the same server outside the plugin, add it manually with Claude Code:

```sh
claude mcp add-json alis-build-test '{"type":"http","url":"https://mcp.alis.build/mcp","oauth":{"clientId":"cac878c2-ae88-47d4-89dc-3815ff556821","callbackPort":7777,"scopes":"build:read build:write ideas:read ideas:write"}}'
```

Then authenticate through:

```text
/mcp
```

Remove the test server when done:

```sh
claude mcp remove alis-build-test
```

Claude Code stores OAuth tokens separately from this plugin. Do not commit OAuth tokens, client secrets, or local Claude credentials.
