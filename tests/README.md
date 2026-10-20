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
