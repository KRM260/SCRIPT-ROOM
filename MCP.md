# Connect other tools (MCP)

Script Room can talk to MCP servers from the browser. MCP (Model Context Protocol) is a standard way for a program to offer tools, such as "count the scenes in this script" or "format this as a screenplay". This page says exactly what the connector does, what it cannot do, and what was tested.

## How to use it

1. **Review → Other tools → Connect tools.**
2. **Add a server:** a name, the address (`https://…`, or `http://localhost…` for a server on this computer) and, only if the server asks for one, a token.
3. **Add and connect.** The page asks the server which tools it has.
4. Pick a tool. A form is built from the tool's own description of its fields. A text field can be filled from the project.
5. **Send.** A box names the server and lists what is going out. Cancel sends nothing.
6. The answer appears as the server gave it. **Copy** it, or **Open in Import** to bring a script it returned into the project.

Nothing is sent without that button. The AI in Script Room does not call these tools on its own.

## What works

- Servers that speak MCP over **HTTP** ("Streamable HTTP"). The page sends JSON-RPC with `POST` and accepts the answer as plain JSON or as an event stream. It follows the session id and protocol version the server returns, pages through long tool lists, and shows server errors as they are.
- Servers on your own computer at `http://localhost` or `http://127.0.0.1`.
- A bearer token (the page adds `Bearer ` if you leave it out). By default the token is kept in memory only and is gone when you close the tab. Tick **Remember** to store it in this browser as plain text. It is never put in project files, share links or exports.

## What does not work, and why

- **Servers that only run as a program on your computer (stdio).** A web page cannot start programs. Something has to turn the program into an HTTP address first. Several community tools do this; none was tested here.
- **Servers that do not allow web pages to call them (CORS).** The browser blocks the call before the page can read anything. The page says "may not allow web pages to call it (CORS)" and cannot get around it. A server's owner can fix it by sending `Access-Control-Allow-Origin` and exposing the `Mcp-Session-Id` header.
- **Sign-in flows (OAuth).** Only a pasted token is supported.
- Tool results other than text (images, audio) are listed as "not shown here".
- It is a client for the tools only. Prompts and resources are not used.

## What was tested

With a small MCP server written for the purpose (`tests/mock-mcp.js`), in a headless browser, 26 checks passed: the handshake, session id and protocol headers, paged tool lists, a bearer token and a wrong token (real 401 shown), JSON and event-stream answers, a server without CORS, form fields of every kind arriving with the right types, required fields and invalid JSON caught before sending, the confirmation box and Cancel, a tool error shown as the server reported it, a script answer opened in Import, and the token not appearing in saved project data unless asked.

**Not tested: any real third-party MCP server.** Whether a given server works depends on its transport and CORS settings.

## Servers found while researching (not tested)

These came from public listings. Check each one's own page for what it does, its licence and how to run it.

- ScreenWeaver, "screenplay and storyboard in your AI assistant", listed as a remote Streamable HTTP server: <https://github.com/OUTERFRAME-STUDIO/screenweaver-mcp>. Its listing page did not state a licence or the tool list.
- screenplaywriter-mcp, "read, write, and analyze screenplays in Fountain format": <https://github.com/mrfentmen/screenplaywriter-mcp>. Its listing page did not say how it runs. If it is stdio only, it needs an HTTP bridge to work here.

Adding either to Script Room is only the address (and a token if it needs one). Nothing is preconfigured.
