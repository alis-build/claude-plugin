---
description: Connect the Google Developer Knowledge MCP server (official Google docs search) to Claude Code.
---

Connect the Google Developer Knowledge MCP server — Google's official documentation search
covering cloud.google.com, developer.android.com, Flutter, Firebase, go.dev, web.dev, and
more — to my Claude Code at user scope. Follow these steps in order and stop at the first
one that resolves the request.

1. **Check whether it is already connected.** Look for any MCP server whose endpoint is
   `developerknowledge.googleapis.com` — under any name, at any scope. Check `claude mcp list`
   output, and if that is inconclusive, grep `~/.claude.json` and the project's `.mcp.json`
   for `developerknowledge.googleapis.com`. If a matching server exists, tell me it is already
   connected (name and scope), remind me that `claude mcp login <name>` or `/mcp`
   re-authenticates it if its tools are failing with auth errors, and STOP — do not add a
   duplicate.

2. **Add the server.** Run exactly this command. The OAuth client id and secret below are the
   plugin's shared Google "Desktop app" credentials — per Google's installed-app model the
   secret is not treated as confidential, and Claude Code stores it in the OS keychain, not in
   any config file. Do not echo the secret anywhere else and do not write it into any file.

   ```sh
   MCP_CLIENT_SECRET='__GOOGLE_OAUTH_CLIENT_SECRET__' claude mcp add --transport http --scope user google-developer-knowledge https://developerknowledge.googleapis.com/mcp --client-id '__GOOGLE_OAUTH_CLIENT_ID__' --client-secret
   ```

3. **Sign in.** Run `claude mcp login google-developer-knowledge` and tell me to complete the
   Google sign-in in the browser. Let me know: the OAuth consent screen is currently in
   Testing mode, so my Google account must be registered as a test user by the plugin
   maintainer — if Google shows an "access blocked / app not verified" error, that is why.
   In Testing mode the sign-in also expires after about 7 days; re-running
   `claude mcp login google-developer-knowledge` (or `/mcp`) fixes it.

4. **Confirm.** Run `claude mcp list` and confirm `google-developer-knowledge` appears and is
   authenticated. Remind me to restart the session (or open `/mcp`) before the new tools —
   `search_documents`, `get_documents`, `answer_query` — become available here.
