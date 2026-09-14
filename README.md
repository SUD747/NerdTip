# Glossary Tooltip

A browser extension for Chrome, Edge, Brave, and Firefox. It finds jargon and acronyms on any page, adds a dotted underline, and shows a short definition when you hover over them.

- Highlights only the **first** occurrence of each term on a page, so pages stay readable.
- Skips code blocks, form fields, editable areas, and hidden text.
- Also catches content that loads after the page does (infinite scroll, single-page apps), with rescans throttled.
- The popup turns it on or off per site and picks which glossaries are active.
- The options page lets you add your own terms.

## Setup

Requires Node.js 18+ (only to copy the polyfill and build zips; there is no bundler).

```sh
npm install      # installs webextension-polyfill and copies it to vendor/
npm test         # matcher self-check
npm run build    # dist/chromium/, dist/firefox/ + a zip for each (needs `zip` on PATH)
```

## Load unpacked

The repo root is itself a loadable extension after `npm install`. For Chromium browsers, `dist/chromium` avoids a harmless "Unrecognized manifest key" warning.

### Chrome / Edge / Brave

1. Open `chrome://extensions` (or `edge://extensions`, `brave://extensions`).
2. Turn on **Developer mode**.
3. Click **Load unpacked** and select the repo root or `dist/chromium`.
4. Optional: to run on `file://` pages, open the extension's **Details** and enable **Allow access to file URLs**.

### Firefox (140+)

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…** and select `manifest.json` in the repo root or in `dist/firefox`.
3. If nothing gets highlighted, open `about:addons` → Glossary Tooltip → **Permissions** and allow access to all websites. Firefox treats MV3 host access as something the user can revoke.

Temporary add-ons are removed when Firefox restarts.

After editing source files, click the reload icon on the extensions page and refresh the tab.

## How it works

It's a content-script-only MV3 extension with **no background script**. That avoids the service-worker vs. event-page differences between Chromium and Firefox, so a single `manifest.json` works everywhere. Chromium ignores the `browser_specific_settings.gecko` block Firefox needs. Every API call goes through `browser.*` via [webextension-polyfill](https://github.com/mozilla/webextension-polyfill).

```
manifest.json
glossary/cs-ml-terms.json     { "term": "definition" } data, one file per domain
src/shared/settings.js        glossary domain registry, default settings, storage helpers
src/content/glossary.js       loads + merges active domains and custom terms; Wiktionary fallback stub
src/content/matcher.js        pure regex matching (no DOM, tested under Node)
src/content/scanner.js        TreeWalker scan, wrapping, MutationObserver, unwrap
src/content/tooltip.js        hover tooltip in a shadow root
src/content/content.js        entry point: settings -> glossary -> scanner, re-applies on changes
src/popup/                    per-site toggle + glossary checkboxes
src/options/                  custom term editor
scripts/build.sh              per-target folders and zips
test/matcher.test.js
```

Content scripts are plain scripts that share one scope, listed in dependency order in `manifest.json`. They are not ES modules.

Settings live in `storage.local`: `disabledSites`, `disabledDomains`, and `customTerms`. The popup and options page write to storage, and content scripts re-apply through `storage.onChanged`, so there's no message passing.

### Matching rules

- Lookup is case-insensitive. Terms written with capitals in a glossary (`RAG`, `LoRA`) match only that exact casing or ALL CAPS, so `RAG` doesn't highlight "an old rag". Lowercase terms (`embedding`) match any casing.
- Longer terms win (`machine learning` over `learning`). Simple plurals match (`APIs`, `embeddings`).
- Word boundaries are Unicode-aware and work for terms like `CI/CD`.

## Adding a glossary domain

1. Add `glossary/finance-terms.json` with the `{ "term": "definition" }` structure.
2. Register it in `src/shared/settings.js`:
   ```js
   { id: 'finance', label: 'Finance', file: 'glossary/finance-terms.json' },
   ```

It will show up in the popup, enabled by default.

## Roadmap / TODO

- `fetchDefinitionFallback(term)` in `src/content/glossary.js` is a stub for the Wiktionary REST API. It isn't connected to any UI yet (e.g. looking up a selected word).
- Keyboard access to highlighted terms (focus → tooltip).
- Scanning inside iframes (`all_frames`) and shadow DOM.

## Known limitations

- Wrapping text in `<span>`s changes the page DOM. Rarely, a framework that tracks its own text nodes (React, etc.) might complain when it re-renders a highlighted paragraph. If a site misbehaves, turn the extension off for that site in the popup.
- Text that changes in place (`characterData` mutations) isn't rescanned. Only newly added nodes are.

## License

[MIT](LICENSE)
