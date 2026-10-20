# Accessibility in Script Room V3

Target: **WCAG 2.2 level AA**. This is a goal and a test log, not a certification. Read "What was not tested" before you rely on it.

## What V3 does

- **Landmarks and structure.** A skip link ("Skip to the page") is the first Tab stop. One banner, one labelled navigation (the stage rail), one labelled region (the stage strip), one main region, and a complementary region (the script bible) when it is shown. One `h1` (visually hidden on phones, where only the logo shows). Headings do not skip levels.
- **Stage rail.** Seven stages in an ordered list. Each stage is a button; the current one has `aria-current="step"`; "Done", "Started" or "Not started" is written in text, not only shown by colour or an icon.
- **Focus.** After you change stage, focus moves to the new page heading and a polite live region announces "Stage 2 of 7: Characters". Dialogs and sheets move focus in, keep Tab inside, close on Escape and give focus back to the button that opened them. The cards board does not trap focus, so the stage rail stays reachable above it.
- **Visible focus.** A solid 3 px ring with an inner halo on every control, in both light and dark themes.
- **Contrast.** Muted text, accent text, status colours and the avatar initials were darkened or lightened until every text pair the checker could measure reaches 4.5:1 (3:1 for large text). Form fields have a 3:1 border.
- **Target size.** Controls are at least 24 by 24 CSS pixels; 44 by 44 on touch screens.
- **Reduced motion.** With "reduce motion" set in your system, no animation or transition longer than a few milliseconds runs, and view transitions are skipped.
- **Zoom and reflow.** No horizontal scroll at 640 px wide (200% of a 1280 px screen) or at phone width. The stage rail stops being sticky on phones so it does not eat the screen.
- **Text spacing.** With the WCAG 1.4.12 spacing overrides applied, no text is clipped.
- **Right to left.** Arabic switches the whole page to right to left; the rail, strip and Review page use logical properties. Arrow keys in tab lists respect the direction.
- **Names.** Every field, button and dialog the checker reached has an accessible name. Duplicate ids and a duplicate `h1` on the landing screen were fixed.
- **Keyboard for custom controls.** Elements marked `role="button"` answer to Enter and Space. Tab lists answer to arrow keys, Home and End.
- **Forced colours.** The current stage and the stage numbers have outlines in Windows high-contrast mode (written, not tested).
- **Plain language.** Every stage says what it is, what to do in it and when it is done, and there is a short glossary ("Screenplay words") in the stage strip and on the Review page.

## How it was tested

`tests/a11y-lib.js` and `tests/a11y-run.js` are **homemade checks**. The author's sandbox could not download axe-core, so they stand in for it. They cover only what a script can decide:

document language and title; landmarks (one main, a banner, unique navigation names, a skip link); one `h1`; heading order and empty headings; accessible names for buttons, links, fields, tabs and dialogs; images without alt text; broken `aria-` references; duplicate ids; positive `tabindex`; text contrast (computed from the real colours, skipping text over gradients or images, which it counts and reports); contrast of form-field borders; target size; horizontal scroll.

They were run on the landing screen and on all nine internal steps plus the cards board, the shot board sheet, the command palette and the AI sheet, in:

| Setting | Result on the final build |
|---|---|
| English, light, 1400 px | 0 findings |
| English, dark | 0 findings |
| English, 640 px (200% zoom equivalent) | 0 findings |
| English, 390 px (phone) | 0 findings |
| Arabic, light, dark and 390 px | 0 findings |
| German, light and dark | 0 findings |
| Landing screen in English, Arabic and German | 0 findings |

For comparison, the same checker found about 110 low-contrast text instances, 40 form fields with a 1.09:1 border, no skip link, 2 unnamed fields, 18 duplicate ids and 42 undersized targets in V2.

`tests/a11y-kb.js` drives the page with the keyboard only: skip link, focus ring on the first 69 tab stops, focus after stage change, the live region, dialog focus move, trap, Escape and focus return, the command palette, the View menu (Escape closes it and returns focus), arrow keys in tab lists and the cards board. The keyboard test was run in English and Arabic; in Arabic one check (finding the cards board's move buttons) relies on English labels and failed for that reason, not because the buttons are missing. `tests/a11y-more.js` checks Pro mode, phone width, 200% zoom, text spacing and reduced motion. `tests/rv3.js` and `tests/rv3t.js` check the stages, Next/Back order, every Review button and six project types.

`tests/a11y-axe.js` runs the real axe-core. **It was not run by the author.** Install `axe-core` and `playwright`, run it, and treat its report as the better source.

## What was not tested

- **No real screen reader** (NVDA, JAWS, VoiceOver, TalkBack, Narrator) and no voice control. The checks look at names, roles and states in the page, which is necessary but not enough. Reading order, verbosity, how the live region is spoken, and how the script editor reads aloud are unknown.
- **axe-core** was not run (see above).
- **Real devices.** Zoom was emulated with a narrower window, not with browser zoom or text-only zoom. Phone width was emulated, not tried on a phone.
- **Windows high-contrast / forced colours**, colour-blindness simulations and low-vision magnifiers.
- **Arabic and German with assistive technology.** The translations are machine-assisted and have not been reviewed by native speakers.
- **Contrast over gradients or images** is skipped by the checker. The AI and landing cards use soft gradients; they were checked by eye only.
- **Third-party and generated content.** Exported PDFs are not tagged for accessibility.
- **Cognitive load and plain language** were improved but not tested with people.
- **The cards board** offers buttons to move a card as well as dragging, which satisfies "no drag-only controls" in principle. It was not tested with a screen reader.
- Some older components still use a single Tab stop per tab instead of the "roving" pattern; arrow keys work, but a screen-reader user may hear more stops than needed.

If you find a barrier, please report it. Real users find what scripts cannot.
