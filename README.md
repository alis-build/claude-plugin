# Alis Build Claude Code Plugin

<p align="center">
  <img src="plugins/alis-build/assets/logo.svg" alt="Alis Build logo" width="128" height="128">
</p>

<p align="center">
  <strong>Connect Claude Code to Alis Build through MCP.</strong>
</p>

Connect Claude Code to Alis Build so Claude can inspect landing zones, products, neurons, builds, deploys, and related workspace context through the Alis Build MCP server.

This first release is MCP-only. It does not bundle skills, agents, hooks, commands, LSP servers, monitors, or UI.

## What You Get

- A preconfigured Claude Code MCP server for `https://mcp.alis.build/mcp`
- OAuth/OIDC authentication through `https://identity.alisx.com`
- Alis Build tools exposed inside Claude Code after login
- Read and write access controlled by Alis Build OAuth scopes and Claude Code MCP approvals

## Before You Start

You need:

- Claude Code installed and authenticated
- Network access to `https://mcp.alis.build`
- Network access to `https://identity.alisx.com`
- An Alis Build account with access to the landing zones and products you want to use
- OAuth access for the scopes below:

```text
build:read
build:write
ideas:read
ideas:write
```

## Install

Add this repository as a Claude Code plugin marketplace:

```sh
claude plugin marketplace add alis-build/claude-plugin --sparse .claude-plugin plugins/alis-build
```

Install the plugin:

```sh
claude plugin install alis-build@alis
```

Reload plugins in any running Claude Code session:

```text
/reload-plugins
```

## Sign In

In Claude Code, run:

```text
/mcp
```

Select the `alis-build` MCP server and complete the OAuth login flow in your browser.

Expected result:

- `alis-build` is listed as a plugin-provided MCP server.
- Login opens a browser for `https://identity.alisx.com`.
- OAuth consent includes `build:read`, `build:write`, `ideas:read`, and `ideas:write`.

## OAuth Callback Setup

Claude Code uses a local callback URL during MCP OAuth login. This plugin pins the callback port to `7777`, so the Alis Identity OAuth client should allow:

```text
http://localhost:7777/callback
```

This callback path is Claude-specific. The Codex plugin uses a different fixed callback path:

```text
http://localhost:7777/oauth/callback
```

If Alis Identity supports loopback redirect wildcards, allow both Claude Code's native callback shape and localhost variants:

```text
http://127.0.0.1:*/callback
http://localhost:*/callback
```

See [docs/oauth.md](docs/oauth.md) for more detail.

## Use It

After login, ask Claude Code to use Alis Build. For example:

```text
List the landing zones I can access.
```

```text
Show recent builds for product os in landing zone alis.
```

```text
Review the latest deploy logs for this neuron and suggest the next action.
```

## Local Development

Validate JSON files:

```sh
python3 -m json.tool plugins/alis-build/.claude-plugin/plugin.json
python3 -m json.tool plugins/alis-build/.mcp.json
python3 -m json.tool .claude-plugin/marketplace.json
```

Validate the marketplace and plugin with Claude Code:

```sh
claude plugin validate .
claude plugin validate ./plugins/alis-build
```

Install from a local checkout:

```sh
claude plugin marketplace add /path/to/claude-plugin
claude plugin install alis-build@alis
```

Test without installing:

```sh
claude --plugin-dir ./plugins/alis-build
```

## Repository Layout

```text
.
├── .claude-plugin
│   └── marketplace.json
├── LICENSE
├── README.md
├── docs
│   ├── oauth.md
│   └── publishing.md
└── plugins
    └── alis-build
        ├── .claude-plugin
        │   └── plugin.json
        ├── .mcp.json
        └── assets
            └── logo.svg
```

## Publishing

See [docs/publishing.md](docs/publishing.md) for release steps.

## Security Notes

The plugin includes a public OAuth client ID because Alis Build does not support dynamic client registration. Do not commit OAuth client secrets, user tokens, or local Claude credentials to this repository.

The plugin does not filter or exclude MCP tools. Access is controlled by OAuth scopes, Alis Build permissions, and Claude Code MCP approval prompts.
