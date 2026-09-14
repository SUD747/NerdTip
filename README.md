<p align="center">
  <img src="icons/icon-128.png" width="96" height="96" alt="NerdTip logo">
</p>

<h1 align="center">NerdTip</h1>

<p align="center"><strong>Hover over jargon, get a plain-English definition.</strong></p>

<p align="center">
  Chrome · Edge · Brave · Firefox
</p>

---

Ever read an article packed with terms like **RAG**, **EBITDA**, **metastasis**, or **habeas corpus** and had to open a new tab to look them up? NerdTip underlines jargon on any web page. Hover over it and a short definition appears right where you're reading.

## Features

- **Works on any website.** News, docs, research papers, forums.
- **Hover to learn.** A clean tooltip with a one or two sentence definition appears next to your cursor.
- **Stays out of the way.** Only the first mention of each term is underlined. Code blocks, text boxes, and hidden text are left alone.
- **Keeps up with dynamic pages.** Content that loads as you scroll gets highlighted too.
- **Turn it off per site.** One click in the toolbar popup.
- **Choose your glossaries.** Turn on only the subjects you care about.
- **Add your own terms.** Teach NerdTip your team's acronyms or your field's vocabulary.
- **Private by design.** Everything happens in your browser. No accounts, no tracking, no network requests.
- **Light and dark mode.** Follows your system theme.

## Built-in glossaries

| Glossary | Terms | Examples |
|---|---:|---|
| 💻 CS / ML / AI | 143 | API, Docker, race condition, transformer, RAG, quantization |
| 📈 Finance & Economics | 67 | ETF, P/E ratio, 401(k), yield curve, stablecoin |
| 🩺 Medicine & Health | 63 | MRI, HbA1c, metastasis, SSRI, CRISPR |
| ⚖️ Law | 51 | habeas corpus, force majeure, NDA, GDPR |
| 🔭 Astronomy | 73 | light-year, exoplanet, redshift, dark matter, Lagrange point |

## Install

Store listings are coming soon:

- **Chrome & Brave:** Chrome Web Store *(coming soon)*
- **Edge:** Microsoft Edge Add-ons *(coming soon)*
- **Firefox:** Firefox Add-ons *(coming soon, requires Firefox 140+)*

Until then, you can install NerdTip from source. See [Loading the extension](CONTRIBUTING.md#loading-the-extension).

## How to use

1. **Browse normally.** Jargon on the page gets a subtle dotted underline.
2. **Hover over an underlined word** to see its definition and which glossary it came from.
3. **Click the NerdTip icon** in your toolbar to:
   - turn NerdTip off for the current site
   - choose which glossaries are active
4. **Add custom terms** from the popup via **Manage custom terms**. Your definitions take priority over the built-in ones.

## FAQ

**Nothing is highlighted on a page.**
Reload the tab. Pages that were already open when you installed NerdTip need a refresh. Also check that the site isn't turned off in the popup.

**It doesn't work on some pages.**
Browsers don't let extensions run on internal pages such as `chrome://` or `about:` pages, the new-tab page, or extension stores.

**Firefox: nothing gets highlighted anywhere.**
Open `about:addons` → NerdTip → **Permissions** and allow access to all websites.

**A site looks or behaves oddly with NerdTip on.**
Turn NerdTip off for that site from the popup, and please [report it](CONTRIBUTING.md#reporting-bugs) so it can be fixed.

**A common word is being highlighted by mistake.**
Please report it. Glossaries deliberately avoid everyday words, so false matches are bugs.

## Privacy

NerdTip doesn't collect or send any data. Page text is checked locally against glossaries bundled in the extension. Your settings and custom terms stay in your browser. Read the full [privacy policy](PRIVACY.md).

## Contributing

Want to add a glossary, fix a definition, or improve the code? Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
