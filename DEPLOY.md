# Put V4 online

This folder is the whole site. The files are ready; publishing needs your accounts, so this is a checklist for you. (The author of this build could not push to GitHub or Cloudflare from the build environment.)

## 1. GitHub

In the folder, in a terminal:

```
git init   # only if it is not a repository yet
git add .
git commit -m "Script Room V4: lock and revisions, MCP connector, accessibility"
git remote add origin https://github.com/KRM260/SCRIPT-ROOM.git   # skip if already set
git push -u origin main
```

If the repository already has V3 on `main`, a normal push adds V4 on top. To keep V3 reachable, tag it first: `git tag v3 && git push --tags`.

## 2. Cloudflare

If the Worker is connected to the GitHub repository, pushing deploys it. Otherwise: `npx wrangler deploy` in this folder, signed in to your Cloudflare account. `wrangler.jsonc` keeps your KV namespace id and the Workers AI binding.

The service worker version in `sw.js` is `scriptroom-public-v4-1`, so browsers that have V3 cached pick up V4 on their next visit (the app page is fetched network first).

## 3. Check the live site (about five minutes)

- Open the site, load the example, go to **Review → Lock and revisions**, lock, start a revision, change a line, **Export → Download PDF**: the changed page is blue with stars.
- **Review → Connect tools**: add a server you control and connect.
- `/api/ai` should answer "Use POST." Share links and the free image model are unchanged from V3; try one of each.

## 4. Run the real axe-core audit

`tests/a11y-axe.js` was written but could not be run in the build environment (no network). On your computer:

```
npm i -D playwright axe-core
npx playwright install chromium
SR_FILE=/full/path/to/index.html node tests/a11y-axe.js
```

Send me the report and I will fix what it finds. Then try the page with a screen reader (NVDA on Windows is free) for a few minutes: the stage rail, a dialog, the Export tabs and the script editor are the places most worth hearing.
