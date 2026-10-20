# Tests

These use Playwright and drive the built page (`index.html`) from disk. They never call a real AI or a real server.

```
npm i -D playwright axe-core
npx playwright install chromium
SR_FILE=/full/path/to/index.html node tests/a11y-run.js        # homemade accessibility checks (EN). LANG2=ar|de THEME=dark W=640|390 LANDING=1
SR_FILE=... node tests/a11y-kb.js                              # keyboard-only checks
SR_FILE=... node tests/a11y-more.js                            # Pro mode, phone, zoom, text spacing, reduced motion
SR_FILE=... node tests/rv3.js                                  # stages, Next/Back, Review buttons, board hand-off
SR_FILE=... node tests/rv3t.js                                 # stage names for six project types
SR_FILE=... LANG2=ar node tests/aud.js                         # strings still in English when the UI is Arabic or German
SR_FILE=... node tests/a11y-axe.js                             # real axe-core (not yet run by the author)
```

`a11y-lib.js` is shared by `a11y-run.js`. A hash `#legacy-nav` on the page address shows the old sidebar again, which older tests use.

## Added in V4

```
SR_FILE=... node tests/rev.js        # revisions: lock, scene numbers, Blue/Pink rounds, PDF/HTML/zip/Fountain/FDX, reload, unlock (33 checks; needs qpdf on PATH and jszip, or ONLINE=1)
SR_FILE=... node tests/mcp.js        # MCP client against a mock server on 127.0.0.1 (26 checks). mock-mcp.js is the mock.
SR_FILE=... node tests/tabs.js       # roving tab index in tab lists (8 checks)
SR_FILE=... node tests/a11y-run4.js  # homemade accessibility checks for the V4 sheets (LANG2=ar|de THEME=dark W=390)
```

`pre.js` is the shared launcher. The MCP tests talk only to the mock server, never to a real third-party server. Install `jszip` (`npm i -D jszip`) or set `ONLINE=1` so the zip export can load it.
