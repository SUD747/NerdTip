# Contributing to NerdTip

Thanks for helping make NerdTip better! This guide covers setting up the project, how the code is organized, and what we look for in contributions.

- [Ways to contribute](#ways-to-contribute)
- [Development setup](#development-setup)
- [Loading the extension](#loading-the-extension)
- [Project structure](#project-structure)
- [Adding or editing glossary terms](#adding-or-editing-glossary-terms)
- [Adding a new glossary](#adding-a-new-glossary)
- [Code guidelines](#code-guidelines)
- [Testing](#testing)
- [Submitting a pull request](#submitting-a-pull-request)
- [Reporting bugs](#reporting-bugs)
- [Building and releasing](#building-and-releasing)

## Ways to contribute

- **Improve definitions:** fix inaccurate, unclear, or overly long entries.
- **Add terms** to an existing glossary.
- **Add a new glossary** for a subject NerdTip doesn't cover yet.
- **Report bugs**, especially sites where NerdTip breaks layout or highlights the wrong words.
- **Work on the roadmap** (see below).

### Roadmap

Good places to start:

- **Dictionary fallback:** `fetchDefinitionFallback(term)` in `src/content/glossary.js` is a stub for the Wiktionary REST API. It needs implementing and connecting to a UI, such as looking up a selected word. Because it would send the term over the network, `PRIVACY.md` must be updated in the same PR.
- **Keyboard access:** show the tooltip when a highlighted term receives focus.
- **Frames and shadow DOM:** scan inside iframes (`all_frames`) and open shadow roots.
- **In-place text changes:** rescan text that changes without new nodes being added (`characterData` mutations).

## Development setup

Requirements: [Node.js](https://nodejs.org) 18+, and `zip` if you want to build store packages.

```sh
git clone <your-fork-url>
cd NerdTip
npm install   # installs webextension-polyfill and copies it into vendor/
npm test
```

There is no bundler or transpiler. The source files are what the browser runs. `npm install` exists only to copy the one dependency, [webextension-polyfill](https://github.com/mozilla/webextension-polyfill), into `vendor/`.

## Loading the extension

After `npm install`, the repo root is a loadable extension.

### Chrome / Edge / Brave

1. Open `chrome://extensions` (or `edge://extensions`, `brave://extensions`).
2. Turn on **Developer mode**.
3. Click **Load unpacked** and select the repo root.

Chrome shows a harmless "Unrecognized manifest key `browser_specific_settings`" warning when loading from the root. `npm run build` produces `dist/chromium/` without it.

For `file://` pages, open the extension's **Details** and enable **Allow access to file URLs**.

### Firefox (140+)

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…** and select `manifest.json` in the repo root.
3. If nothing is highlighted, open `about:addons` → NerdTip → **Permissions** and allow access to all websites.

Temporary add-ons are removed when Firefox restarts.

### Dev loop

After changing code, reload the extension (the ↻ icon in `chrome://extensions`, or **Reload** in `about:debugging`) and refresh the tab. Pages that were open before a reload don't get the new content script until they're refreshed.

## Project structure

```
manifest.json                 single Manifest V3 file for all browsers
glossary/*-terms.json         glossary data, one file per subject
icons/                        extension icons (icon.svg is the source)
src/shared/settings.js        glossary registry, default settings, storage helpers
src/shared/ui.css             shared styles and theme tokens for popup + options
src/content/glossary.js       loads and merges active glossaries + custom terms
src/content/matcher.js        pure regex matching, no DOM (unit-tested under Node)
src/content/scanner.js        walks the DOM, wraps matches, watches for new content
src/content/tooltip.js        hover tooltip, rendered inside a closed shadow root
src/content/content.js        entry point: settings → glossary → scanner
src/content/content.css       underline style for highlighted terms
src/popup/                    toolbar popup: per-site toggle, glossary switches
src/options/                  custom terms editor
scripts/build.sh              builds per-browser folders and zips into dist/
test/matcher.test.js          matcher + glossary data checks
```

### How it works

- **Content scripts only.** There is no background script or service worker, which avoids the main MV3 difference between Chromium and Firefox. One `manifest.json` serves every browser. Chromium ignores the Firefox-only `browser_specific_settings` block.
- **`browser.*` everywhere.** All extension APIs go through webextension-polyfill, so the same code runs unchanged on Chromium and Firefox. Don't call `chrome.*` directly.
- **Plain scripts, shared scope.** Content scripts aren't ES modules. The files are listed in dependency order under `content_scripts.js` in `manifest.json` and share one global scope. If you add a file, add it there in the right position.
- **Settings flow.** The popup and options page write to `browser.storage.local` (`disabledSites`, `disabledDomains`, `customTerms`). Content scripts listen to `storage.onChanged` and re-apply, so there's no message passing.
- **Scanning.** `scanner.js` collects text nodes with a `TreeWalker`, skipping `script`, `style`, `code`, `pre`, form fields, `contenteditable`, and already-wrapped terms. It wraps matches during idle time in batches. A `MutationObserver` picks up added content, with rescans throttled to once per second. Each term is wrapped only once per page.
- **Matching rules** (`matcher.js`):
  - Lookup is case-insensitive. Terms written with capitals in a glossary (`RAG`, `LoRA`) match only that exact casing or ALL CAPS, so `RAG` doesn't match "rag". Lowercase terms match any casing.
  - Longer terms win (`machine learning` over `learning`).
  - Simple plurals match (`APIs`, `embeddings`).
  - Word boundaries are Unicode-aware and handle terms like `CI/CD` and `401(k)`.

## Adding or editing glossary terms

Glossaries are flat JSON objects in `glossary/`:

```json
{
  "API": "Application Programming Interface: a defined set of requests and responses that lets one piece of software use another.",
  "embedding": "A list of numbers (a vector) representing an item such as a word so that similar items sit close together."
}
```

Guidelines:

- **Keep definitions short.** One or two sentences, ideally under 200 characters. Aim for plain language a curious non-expert understands.
- **Expand acronyms first:** `"Expansion: what it means."`
- **Casing matters.** Write acronyms and proper nouns with capitals (`GPU`, `Kubernetes`) so they only match that casing. Write ordinary terms in lowercase (`inference`) so they match anywhere.
- **Avoid everyday words.** A term like "interest", "bond", or "stroke" would be highlighted on countless unrelated pages. Prefer specific multi-word phrases ("compound interest") or acronyms.
- **No duplicates.** A term may appear only once across *all* glossaries, compared case-insensitively. `npm test` enforces this.
- **Be accurate and neutral.** Definitions should be factual and free of opinion or promotion. Don't copy text from copyrighted sources; write it in your own words.

## Adding a new glossary

1. Create `glossary/<subject>-terms.json` following the guidelines above.
2. Register it in `src/shared/settings.js`:
   ```js
   { id: 'biology', label: 'Biology', file: 'glossary/biology-terms.json' },
   ```
   The `id` is saved in user settings, so never change it once released.
3. Run `npm test`.
4. Add the glossary to the table in `README.md`.

The popup picks it up automatically, turned on by default.

## Code guidelines

- **Plain JavaScript, HTML, and CSS.** No frameworks, bundlers, or transpilers.
- **No new runtime dependencies** without discussion in an issue first.
- **Match the existing style:** 2-space indentation, single quotes, semicolons, small focused functions, comments that explain *why*.
- **Security:** never use `innerHTML` (or similar) with glossary text, custom terms, or page content. Use `textContent`. Custom definitions are user input.
- **Performance:** the content script runs on every page. Avoid layout-forcing work in loops, keep DOM changes batched, and don't add per-node work to the scan unless it's cheap.
- **Styling:** popup and options styles use the theme tokens in `src/shared/ui.css`. Check both light and dark mode. The in-page tooltip is styled inside its shadow root in `tooltip.js`.
- **Privacy:** any change that sends data off the device must update `PRIVACY.md` in the same PR.

## Testing

```sh
npm test                                  # matcher rules + glossary data checks
npx web-ext lint --source-dir dist/firefox   # Mozilla's linter (after npm run build)
```

`npm test` checks matching behavior (longest match, word boundaries, casing, plurals, first-match-only). It also checks that every registered glossary parses and contains no duplicate terms.

Before opening a PR, also test manually in **at least one Chromium browser and Firefox**:

- Terms are highlighted on a few real sites, and the tooltip appears on hover.
- Turning the site off in the popup removes highlights. Turning it back on restores them.
- Glossary switches and custom terms apply without reloading the page.
- There are no errors in the page console or on the extension's error page.

## Submitting a pull request

1. Fork the repo and create a branch: `git checkout -b add-biology-glossary`.
2. Make focused changes. One glossary or one fix per PR is easiest to review.
3. Run `npm test` and the manual checks above.
4. Write a clear commit message in the imperative mood ("Add biology glossary", "Fix tooltip position near screen edge").
5. Open a PR describing what changed, why, and how you tested it. Include screenshots for UI changes.

By contributing, you agree that your contributions are licensed under the project's [MIT License](LICENSE).

## Reporting bugs

Open an issue and include:

- Browser and version (e.g. Chrome 152, Firefox 155)
- NerdTip version (shown in `chrome://extensions` or `about:addons`)
- The URL where it happens, if public
- What you expected and what happened
- Any errors from the page console (F12 → Console)

For wrong or missing definitions, include the term, the glossary, and a suggested fix.

## Building and releasing

```sh
npm run build
```

This produces:

| Output | For |
|---|---|
| `dist/chromium/`, `dist/nerdtip-chromium.zip` | Chrome Web Store (Chrome, Brave), Microsoft Edge Add-ons |
| `dist/firefox/`, `dist/nerdtip-firefox.zip` | Firefox Add-ons (AMO) |

The only difference is that the Chromium build drops `browser_specific_settings`.

Release checklist:

1. Bump `version` in `manifest.json` and `package.json`.
2. `npm test`, `npm run build`, and `npx web-ext lint --source-dir dist/firefox`.
3. Run the manual checks in Chrome and Firefox using the `dist/` folders.
4. Upload the zips to each store.

Permission justifications for store review forms (also in `PRIVACY.md`):

- **Host access (all sites):** needed to find and highlight terms on the pages the user visits. All processing is local.
- **`storage`:** saves per-site on/off settings, enabled glossaries, and custom terms locally.
- **`activeTab`:** lets the popup read the current tab's URL so it can show the site name and toggle NerdTip for that site. Host access from content scripts doesn't expose tab URLs to the popup.

The Firefox add-on ID (`nerdtip@sud747` in `manifest.json`) is permanent once published. Never change it.
