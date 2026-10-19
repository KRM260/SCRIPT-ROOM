# Script Room

A guided brief for writing scripts: TV commercials, social reels, films, TV, web series, podcasts, corporate films and more. You fill in the story, cast, scenes and style; the AI you connect drafts the script, the dialogue and the shot list from it.

Script Room is one web page. No account, no build step, no server database. Projects stay in your browser.

## Use any AI

Click **Connect AI** in the toolbar and pick a provider. Your key stays in your browser.

| Provider | Key from | Route |
|---|---|---|
| Claude (Anthropic) | console.anthropic.com | direct |
| ChatGPT (OpenAI) | platform.openai.com | direct |
| Gemini (Google) | aistudio.google.com | direct |
| DeepSeek | platform.deepseek.com | relay |
| Mistral | console.mistral.ai | relay |
| Groq | console.groq.com | relay |
| OpenRouter (hundreds of models) | openrouter.ai | direct |
| Ollama (local) | no key | direct to your computer |
| LM Studio (local) | no key | direct to your computer |
| Any OpenAI-compatible server | your own | direct or relay |

Some providers refuse calls straight from a browser. For those, Script Room sends the request through the site's relay, `functions/api/ai.js`, which forwards it to the provider and stores nothing. You can change the route under **Advanced** in AI settings.

Image features (fill in from a photo, frame checks) need a model that accepts images, such as Claude, GPT-4.1 or Gemini. Text-only models still do everything else.

### Local models

Local models run on your computer, so nothing leaves it. The browser has to be allowed to talk to them:

- **Ollama**: start it with your site allowed, for example `OLLAMA_ORIGINS="https://your-site.pages.dev" ollama serve` (or `OLLAMA_ORIGINS="*"` on your own machine). Then pull a model, `ollama pull llama3.1`, and pick Ollama in Connect AI.
- **LM Studio**: open the Developer tab, start the server and turn on **Enable CORS**. Pick LM Studio in Connect AI.

Browsers block an https page from calling plain http addresses other than `localhost`, so a model on another machine needs https or must be reached through `localhost`.

## Hosting

Recommended: the code on **GitHub**, the site on **Cloudflare**. Both are free for this.

1. Create a GitHub repository and upload everything in this folder.
2. In Cloudflare, open Workers & Pages, click Create and import the GitHub repository.
3. Cloudflare reads `wrangler.jsonc` and deploys it as a Worker: `worker.js` serves the app and runs the AI relay at `/api/ai`. Leave the build command empty and keep the deploy command as `npx wrangler deploy`.
4. Under the project's Domains tab, switch on the `workers.dev` address, or add your own domain.

If you create a **Pages** project instead, it uses `functions/api/ai.js` for the relay and ignores `worker.js`. Both work.

To check the relay, open `/api/ai` on your site: it should say "Use POST."

GitHub Pages also hosts the page, but it cannot run the relay, so DeepSeek, Mistral and Groq won't work there. Everything else, including local models, works on any static host.

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
- Interface in English or Arabic, with a full right-to-left layout. Arabic scripts get Arabic scene headings (داخلي / خارجي) and right-to-left pages. UI text is translated by a built-in dictionary; anything it misses is translated once by the AI and cached in the browser
- Board: index cards you drag (or Alt + arrow) to reorder scenes, and a mind map of the story, scenes, characters and relationships with drag, pan, pinch and wheel zoom, Tidy up and Order scenes by position
- Focus mode for distraction-free writing, and Table read: the browser reads the scene aloud with a different voice for each character
- Shots step: a shot list per scene with presets for shot size, framing, angle, camera height, movement, rig, lens (field-of-view ladder 107° to 8°), focus, light, composition, frame rate, transition and directing mode; ten coverage recipes (shot / reverse shot, walk and talk, slow push, insert, POV and more); the AI can plan a scene's coverage from its dialogue; a schematic storyboard frame for every shot; exports as PDF, CSV, printable HTML and JSON
- Prompt generator: every shot becomes an image prompt and a video prompt. JSON export (see PROMPTS-SCHEMA.md) and a webhook let you plug in your own tools
- Draft history: automatic and manual snapshots, side-by-side compare with line-level changes, restore
- Write together (when opened on claude.ai): share a project with a private code; scenes, the brief and the draft sync live, people on the page show in the toolbar and on the steps they are working on, and margin comments are shared. On your own copy, margin comments are saved with the project
- Character arcs: a chart and a table of how things stand for each character in each scene, which the AI can draft
- Installable app: in a self-hosted copy (https or localhost) the page installs on desktop and phone and works offline (manifest.webmanifest, sw.js, icons/)
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

No film scripts are bundled. Lesson scenes and the example project (The Last Tram) are original. Famous-scene notes describe the films without quoting them.

## License

MIT. See `LICENSE`.
