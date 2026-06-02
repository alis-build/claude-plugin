# Publishing

Repository:

```text
https://github.com/alis-build/claude-plugin
```

## Preflight

Validate JSON:

```sh
python3 -m json.tool plugins/alis-build/.claude-plugin/plugin.json
python3 -m json.tool plugins/alis-build/.mcp.json
python3 -m json.tool .claude-plugin/marketplace.json
```

Validate with Claude Code:

```sh
claude plugin validate .
claude plugin validate ./plugins/alis-build
```

Confirm the OAuth redirect URI is registered for the Alis Build OAuth client:

```text
http://localhost:7777/callback
```

Confirm MCP login from a clean Claude Code profile:

```text
/mcp
```

## Marketplace

This repository includes a marketplace file:

```text
.claude-plugin/marketplace.json
```

The marketplace entry references the plugin package inside this marketplace repo:

```json
{
  "source": "./plugins/alis-build"
}
```

Users can add the marketplace with:

```sh
claude plugin marketplace add alis-build/claude-plugin --sparse .claude-plugin plugins/alis-build
```

Then install the Alis Build plugin:

```sh
claude plugin install alis-build@alis
```

## Release

1. Validate JSON.
2. Validate the marketplace and plugin with Claude Code.
3. Verify OAuth login through `/mcp`.
4. Bump `version` in both `.claude-plugin/marketplace.json` and `plugins/alis-build/.claude-plugin/plugin.json`.
5. Tag the release:

   ```sh
   git tag v0.1.0
   ```

6. Push `main` and the tag.
7. Re-run marketplace install from a clean Claude Code profile.

Claude Code uses the plugin version as part of update detection. If `plugin.json` contains `version`, pushing new commits without bumping that field does not update existing installs.
