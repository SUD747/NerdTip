// Shared by the content script, popup, and options page (loaded as a plain script, not a module).

// Every glossary domain the extension ships. To add one: drop a { "term": "definition" }
// JSON file in glossary/ and add an entry here — the popup and loader pick it up automatically.
const GLOSSARY_DOMAINS = [
  { id: 'cs-ml', label: 'CS / ML / AI', file: 'glossary/cs-ml-terms.json' },
  { id: 'finance', label: 'Finance & Economics', file: 'glossary/finance-terms.json' },
  { id: 'medical', label: 'Medicine & Health', file: 'glossary/medical-terms.json' },
  { id: 'legal', label: 'Law', file: 'glossary/legal-terms.json' },
  { id: 'astronomy', label: 'Astronomy', file: 'glossary/astronomy-terms.json' },
];

if (typeof module !== 'undefined') module.exports = { GLOSSARY_DOMAINS };

// Stored as "disabled" lists so newly added domains are on by default.
const DEFAULT_SETTINGS = {
  disabledSites: [],   // site keys (hostnames) where the extension is off
  disabledDomains: [], // GLOSSARY_DOMAINS ids the user unchecked
  customTerms: {},     // { term: definition } added on the options page
};

function getSettings() {
  return browser.storage.local.get(DEFAULT_SETTINGS);
}

function siteKey(url) {
  const { hostname, protocol } = new URL(url);
  return hostname || protocol; // file:// pages have no hostname
}
