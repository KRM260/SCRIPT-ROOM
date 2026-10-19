# Script Room

A guided brief for writing scripts: TV commercials, social reels, films, TV, web series, podcasts, corporate films and more. You fill in the story, cast, scenes and style; the AI you connect drafts the script, the dialogue and the shot list from it.

Script Room is one web page. No account and no build step. Projects stay in your browser; only projects you choose to share are stored on the site (see Write together).

The first screen asks for the interface language: **English, العربية or Deutsch**. You can change it later from the View menu.

## Use any AI

Click **Connect AI** in the toolbar and pick a provider. Your key stays in your browser.

| Provider | Key from | Free? | Route |
|---|---|---|---|
| Gemini (Google) | aistudio.google.com | free plan, daily limits | direct |
| Groq | console.groq.com | free, but only about 6,000 to 12,000 tokens a minute. Script Room waits for the limit; long scripts fit better in Gemini | relay |
| Mistral | console.mistral.ai | **not reliably free**: the Experiment plan must be switched on in Billing and may ask for a card | relay |
| OpenRouter (hundreds of models) | openrouter.ai | leave the Model box empty and Script Room picks a `:free` model (about 50 requests a day; free models can be busy). Other models need credit | direct |
| Ollama (local) | no key | free, unlimited, private | direct to your computer |
| LM Studio (local) | no key | free, unlimited, private | direct to your computer |
| Claude (Anthropic) | console.anthropic.com | paid per use | direct |
| ChatGPT (OpenAI) | platform.openai.com | paid per use | direct |
| DeepSeek | platform.deepseek.com | paid per use, very low prices | relay |
| Any OpenAI-compatible server | your own | depends | direct or relay |

Free cloud plans usually let the provider use your text to improve its models. For private work, use a local model or a paid plan. Limits and prices change, so check each provider's site.

Some providers refuse calls straight from a browser. For those, Script Room sends the request through the site's relay, `functions/api/ai.js`, which forwards it to the provider and stores nothing. You can change the route under **Advanced** in AI settings.

The toolbar always shows which AI is connected and what it is doing: **Not connected**, **Ready** (provider and model), **Working…** while a request runs, or **Error** with the reason (wrong key, quota reached, model missing, provider refused, timed out). Click it to open AI settings.

Image features (fill in from a photo, frame checks) need a model that accepts images, such as Claude, GPT-4.1 or Gemini. Text-only models still do everything else.

### Local models

Local models run on your computer, so nothing leaves it. The browser has to be allowed to talk to them:

- **Ollama**: allow your site, then restart Ollama and pull a model (`ollama pull llama3.1`). Use your site's address, for example `https://script-room.karam-a91.workers.dev`:
  - **Windows**: Start menu, "Edit environment variables for your account", New, name `OLLAMA_ORIGINS`, value your site's address. Quit Ollama from the tray icon and open it again.
  - **Mac**: in Terminal, `launchctl setenv OLLAMA_ORIGINS "https://your-site"`, then quit Ollama from the menu bar and open it again. Repeat after a restart.
  - **Linux**: `sudo systemctl edit ollama.service`, add `[Service]` and `Environment="OLLAMA_ORIGINS=https://your-site"`, then `sudo systemctl daemon-reload && sudo systemctl restart ollama`.
  - In Connect AI, pick Ollama and press **Find my models**. The app shows these steps too, with your site's address filled in.
- **LM Studio**: open the Developer tab, start the server and turn on **Enable CORS**. Pick LM Studio in Connect AI.

Browsers block an https page from calling plain http addresses other than `localhost`, so a model on another machine needs https or must be reached through `localhost`.

## Images

Characters (portrait and turnaround sheet), wardrobe, hair and makeup, locations, props and storyboard frames each have **Upload image**, **Generate with AI** and, where it helps, **Fill in from it**. Generate shows the full prompt first, and you can edit it before anything is made. Pick the image model under **Connect AI → Images**.

| Image model | Cost | Key |
|---|---|---|
| This site: Flux Schnell (Cloudflare Workers AI) | free, about 170 images a day shared by everyone using the site | none |
| Pollinations: Flux | free, slow (one image every 15 s), may carry a small watermark | none |
| Stable Diffusion on your computer (Automatic1111 or Forge) | free, private | none; start it with `--api --cors-allow-origins=<your site>` |
| Google Nano Banana (Gemini image models) | paid per image | Gemini key; uses character photos as references |
| OpenAI GPT Image | paid per image | OpenAI key |
| OpenRouter: ByteDance Seedream, Flux 2 Pro, GPT Image, Nano Banana | paid, needs OpenRouter credit | OpenRouter key |
| fal.ai: Seedream, Flux Pro Ultra, Recraft, Ideogram | paid per image | fal.ai key, sent through the site's relay |

Model names are editable, because providers rename them. Video (Seedance, Kling, Runway, Veo, Sora and others) is not generated inside Script Room: the prompt studio prepares the prompts and you paste them into the video tool.

## Projects and series

**Projects** in the toolbar lists everything you have made. A **TV series** or **web series** is a folder of episodes that share the series bible (premise, world, recurring cast, episode count and length); each episode is its own project. Add, duplicate, open or delete projects and episodes there.

Project types: short film, feature film, TV series, single TV episode, web series, TVC / commercial, social reel (9:16), podcast / audio, corporate / explainer, documentary and music video. The type shows as a pill at the top of every step and sets the realistic length range, the default length, the acts, which steps you need and how the AI writes. The length has a slider and a minutes field that stay in sync; once you set it yourself, changing other things never overwrites it. **Explore an example** loads a finished sample of the type you are making. Changing the type later updates everything that depends on it: length (a length you chose is kept if it fits the new type; otherwise Script Room resets it and tells you), acts, steps, treatment, frame and export template. Switching between TV and web series changes every episode of the series; taking an episode out of a series asks first.

## Hosting

Recommended: the code on **GitHub**, the site on **Cloudflare**. Both are free for this.

1. Create a GitHub repository and upload everything in this folder.
2. In Cloudflare, open Workers & Pages, click Create and import the GitHub repository.
3. Cloudflare reads `wrangler.jsonc` and deploys it as a Worker: `worker.js` serves the app and runs the AI relay at `/api/ai`, share links at `/api/share` and free images at `/api/image`. Leave the build command empty and keep the deploy command as `npx wrangler deploy`.
4. Under the project's Domains tab, switch on the `workers.dev` address, or add your own domain.
5. **Share links and Write together:** in Cloudflare, Storage & Databases → KV → Create a namespace, then put its id in `wrangler.jsonc` under `kv_namespaces` (binding `SHARES`). Without it, everything else works and Share explains that links are off on this site.
6. The free **image model** uses Workers AI through the `"ai": { "binding": "AI" }` line in `wrangler.jsonc`. It needs no setup on a Workers project. Open `/api/image/health` to check it.

If you create a **Pages** project instead, it uses the files in `functions/api/` and ignores `worker.js`. Bind the KV namespace (`SHARES`) and Workers AI (`AI`) in the Pages settings.

To check the relay, open `/api/ai` on your site: it should say "Use POST."

GitHub Pages also hosts the page, but it cannot run the relay, share links or the free image model, so DeepSeek, Mistral, Groq, fal.ai and Write together won't work there. Everything else, including local models, works on any static host.

To try it on your own computer: `npx serve .` (or `python3 -m http.server`) and open the address it prints. With the relay: `npx wrangler dev`.

## Features

- **Guided mode** is one step at a time with tips and examples. **Pro mode** puts every section on one page with a sticky step bar.
- Start screen by project type: TVC / commercial, social reel (9:16), film, TV episode, web series, podcast / audio, corporate / explainer, documentary and music video. Each sets the length, format, acts, export template and which steps you need (a TVC skips Bonds, a podcast skips Shots).
- Eight steps: Story, Cast, Bonds, Scenes, Dialogue, Style, Write, Shots. Each step feeds the next: the AI can suggest a cast from the logline, describe how pairs relate, propose scenes with conversations, and fill in missing conversation setups.
- Built for dialogue-driven stories: a One location setting, a Contained drama structure, and a Dialogue step for each scene
- Cast: pick personality, looks (build, hair, face, clothes, detail), speech style, verbal habits and conflict style from chips, then add a secret
- Bonds: for each pair, what they are to each other, tone, who has the upper hand, history and what is left unsaid
- Conversation setup per scene: topic, kind of conversation, heat, each character's goal, tactics and hidden thing, the turning point and who comes out ahead
- Dialogue Lab: write a scene's dialogue with the AI or by hand, ask for three options for the next lines, rewrite with 8 tools or your own instruction, undo, voice check, preview as script. Dialogue you save is kept when the full script is written.
- Scene presets: INT./EXT., time of day, common locations, ready-made scenarios
- Story structures that fill the scene list: Short film, Three acts, Five acts, Save the Cat, Hero's Journey, Commercial
- Suggest and Improve buttons on the logline, character fields, scene beats, themes and visual notes
- Story check: the AI gives notes on stakes, conflict, structure and character, on the brief or on the draft
- Command palette (Ctrl or Cmd + K) and Ctrl or Cmd + Enter to write
- Output: beat outline or full script on screenplay-style paper, with Fountain export (saves as .fountain.txt, rename to .fountain)
- Script editor: click a character's name (or Alt + 1 to 9) to give them a line; Enter passes the next line to the other character, Tab adds a parenthetical, Enter on an empty line switches to action, typing INT. or EXT. makes a scene heading. Works on scene dialogue and on the full draft.
- Autocorrect for common typos and contractions, a spelling check with Typo.js and the open-source Hunspell English dictionary (dictionary-en), and Polish: house-style checks for camera directions, on-the-nose lines, long blocks, adverb parentheticals and characters saying each other's names
- Studio export: PDF in standard screenplay format (US Letter, Courier 12 pt, 1.5 in left margin, cues at 3.7 in, dialogue at 2.5 in, (MORE) and (CONT'D) across page breaks, no stranded headings), with title page, contact block, draft label, optional scene numbers and bold headings. Also a .zip with Final Draft (.fdx), Fountain and the PDF, and a print-ready HTML page for any language. The PDF writer is built into the page (Courier is a standard PDF font, so nothing is embedded).
- Scene School: six lessons with original annotated example scenes, eight famous film scenes explained in our own words, and Study a film. "Explain my scene" adds numbered teaching notes to your own dialogue.
- Guided tour, daily word goal with streaks, progress ring, animated transitions (all motion respects reduced-motion settings)
- Apple-style interface: frosted toolbar, sidebar with icon tiles, grouped cards, iOS segmented controls, system fonts (SF on Apple devices, Inter and IBM Plex Sans Arabic elsewhere), Light, Dark or Auto theme, hideable script bible
- Interface in English, Arabic or German, with a full right-to-left layout for Arabic. Arabic scripts get Arabic scene headings (داخلي / خارجي) and right-to-left pages. UI text is translated by a built-in dictionary; anything it misses is translated once by the AI and cached in the browser
- Board: index cards you drag (or Alt + arrow) to reorder scenes, and a mind map of the story, scenes, characters and relationships with drag, pan, pinch and wheel zoom, Tidy up and Order scenes by position
- Focus mode for distraction-free writing, and Table read: the browser reads the scene aloud with a different voice for each character
- Shots step: a shot list per scene with presets for shot size, framing, angle, camera height, movement, rig, lens (field-of-view ladder 107° to 8°), focus, light, composition, frame rate, transition and directing mode; ten coverage recipes (shot / reverse shot, walk and talk, slow push, insert, POV and more); the AI can plan a scene's coverage from its dialogue; a schematic storyboard frame for every shot; exports as PDF, CSV, printable HTML and JSON
- Prompt generator: every shot becomes an image prompt and a video prompt. JSON export (see PROMPTS-SCHEMA.md) and a webhook let you plug in your own tools
- Draft history: automatic and manual snapshots, side-by-side compare with line-level changes, restore
- Write together: **Share** makes two private links for the project you have open, an **edit link** (co-writers change the same project) and a **view-only link** (a reading copy people can save as their own). Links are long random codes; the site keeps only a hash of each key, so it cannot rebuild them. Changes sync every few seconds. If two people change the project at once, nobody's work is overwritten: you choose to take theirs, keep yours, or take theirs and keep yours as a copy. **Stop sharing** deletes the online copy and every link stops working. Your own copy always stays in your browser
- Shot board: every shot of the film on one board, grouped by act and scene, with drag to reorder or move a shot to another scene, and a Timeline view sized by duration; click a shot to jump to it
- Prompt studio: a large, readable preview of exactly the text that will be copied, for one shot, a whole scene or the whole film, per platform. Edit a prompt there and your edit is what gets copied; Reset returns to the generated one
- Script bible: one drawer that opens from the toolbar (**Script bible**) and closes with Esc, instead of a panel on every step
- Character arcs: a chart and a table of how things stand for each character in each scene, which the AI can draft
- Install the app: in a self-hosted copy (https or localhost) the page installs on desktop and phone. It then opens in its own window from your dock, start menu or home screen, and it opens and works without internet; AI, images and share links still need a connection. **Install** in the View menu gives the steps for your browser (one click in Chrome and Edge)
- Scene School in Arabic, written by hand; Arabic spelling is checked by the AI, since there is no browser-ready open-source Arabic Hunspell package
- Import writing: upload a book, short story, essay, life story or client brief (.txt, .md, .docx, .epub, .pdf, .rtf) or paste it. the AI reads it in parts, then builds the logline, cast, relationships, scenes and conversation setups, writes each scene's dialogue, plans the shot list and can write the full script. Faithful or Inspired by, any format and length, script in English, Arabic or French. Final Draft (.fdx) and Fountain scripts import directly without AI. Your current project goes to Draft history first
- Import a shot list: paste or upload a shot list in any shape (table, list, notes) and the AI maps each shot to a scene with the camera presets filled in
- Fill in from a photo: on a character, a reference photo fills look chips, age range, distinguishing details, wardrobe and hair and makeup; on a scene, a location photo fills interior or exterior, time of day, the location look and props, and a props photo adds the objects it shows. Analysis covers only what is visible; it does not identify people or guess ethnicity, religion, health or personality. Photos are shrunk in the browser before they are sent
- Wardrobe, hair and makeup per character, and a location look and props list per scene. They feed the brief, the script and the shot prompts, and export as a production breakdown (.csv)
- Treatment type (live action, 2D or 3D animation, stop motion, motion graphics, mixed media, AI photoreal or stylized, puppetry, archive footage, audio only), carried into the brief and every prompt
- Narration-only mode: one voice-over narrator, no speaking characters; also a Narrator quick add
- Script timer: running time estimated from pages, shots or words, per scene and per act, plus a read-through stopwatch with laps
- Acts on the board: cards grouped by act (drag across an act heading to move a scene), act lanes on the map, rename or add acts, Read more on every card
- The draft opens in the editor: click anywhere to edit. Warnings when someone speaks who is not in the scene or not a character yet, with one-click fixes. Action, heading and transition presets in the editor bar
- Character creator: a locked visual identity (face, hair, skin, build, signature wardrobe and palette) that every image and video prompt repeats; optional ethnicity or heritage on each character (set by you only)
- Consistency check: near-duplicate characters, props spelled two ways, a location with several spellings, repeated shots; merge or keep on purpose
- Locations: describe the look with the AI, suggest props, generate a location plate or a props sheet from the description (with your connected AI if it makes images, or copy the prompt)
- Shoot planner: city or map pin, shoot date and camera direction give sunrise, sunset, golden and blue hour, where the sun is, the best window for the scene's time of day and what light to bring when the sun cannot be used
- Copy prompts for Seedance, Kling, Runway, Veo, Sora, Luma, Hailuo, Pika, Midjourney, Flux, GPT Image, Nano Banana or Stable Diffusion: per shot, every shot of a scene, one continuous scene prompt with timed beats, or the whole film
- Project checklist tied to the project type, in the script bible panel
- Share: WhatsApp, Telegram, X, LinkedIn, Facebook, email, the phone share sheet, a poster image for Instagram, a phone-friendly reading copy and the storyboard
- Character count when turning writing into a script (auto, 1 to 10, or narrator only)
- Export centre (toolbar): seven formats, US screenplay (Letter), UK and European screenplay (A4), US multi-camera sitcom, stage play, BBC radio, two-column AV script and an A5 reading copy, on Letter, A4, Legal, B5 or A5; shot list, storyboard, breakdown and project file in one place. Save and Export are always in the toolbar (Ctrl or Cmd + S saves a version)
- Phone layout with a bottom step bar and a Steps and tools menu
- Dialects for dialogue (Lebanese, Egyptian, Gulf, Maghrebi and more; British, American, Irish and more; Québécois, Mexican, Brazilian and others), per script and per character, and Spanish, German, Italian, Portuguese, Turkish and Persian scripts
- Import knows what it was given: the AI classifies books, stories, essays, memoirs, client briefs, treatments, transcripts and scripts, reads a brief's objective, audience, message, mandatories and duration, and rebuilds scripts with broken formatting. A Done button returns to the project
- Shots: frame sketches with correct shot sizes, eyes on the upper third and look room; a 180° floor plan and screen-direction guard; tone and lighting per scene and shot; checks for jump cuts, lens distortion, light that does not fit the time of day, colour and mood jumps; the AI can review the coverage
- Storyboard view with image generation (your connected AI, or copy the prompt into any app), a character consistency check before generating and a visual consistency check afterwards
- Scene School course: 22 lessons with diagrams, common mistakes, quizzes and exercises the AI gives feedback on
- Saves to your browser. Project files can be saved and reopened as JSON.

## Files

- `index.html`: the whole app (HTML, CSS and JavaScript in one file)
- `worker.js`, `wrangler.jsonc`, `.assetsignore`: run the site and the AI relay on Cloudflare Workers
- `functions/api/ai.js`: the AI relay itself (also used directly by Cloudflare Pages)
- `lib/share-core.js`, `functions/api/share/`: share links and Write together (Cloudflare KV)
- `lib/image-core.js`, `functions/api/image/`: the free image model (Cloudflare Workers AI)
- `manifest.webmanifest`, `sw.js`, `icons/`: install on desktop and phone, work offline
- `_headers`: security headers for Cloudflare Pages
- `ai-adapter.example.js`: optional, to plug in your own backend instead of Connect AI
- `PROMPTS-SCHEMA.md`: the shot prompts JSON format
- `PRIVACY.md`, `LICENSE`

## Open-source pieces used

- JSZip 3.10.1 (MIT or GPLv3), loaded from cdnjs for the export package and for reading .docx and .epub
- pdf.js 3.11.174 (Apache 2.0), loaded from cdnjs when a PDF is imported
- Typo.js 1.2.4 (BSD) and dictionary-en 3.2.0 (MIT and BSD, from SCOWL), loaded from jsDelivr on first spelling check
- Fountain, the open screenplay text format
- Fonts from Google Fonts: Bricolage Grotesque, Instrument Sans, Courier Prime, Inter, IBM Plex Sans Arabic (SIL Open Font License)

No film scripts are bundled. Lesson scenes and the example projects (one per project type) are original. Famous-scene notes describe the films without quoting them.

## License

MIT. See `LICENSE`.
