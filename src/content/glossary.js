// Glossary loading: merges active domain files + custom terms into one lookup map.

const domainCache = new Map(); // domain id -> Promise<{ term: definition }>

function loadDomain(domain) {
  if (!domainCache.has(domain.id)) {
    const request = fetch(browser.runtime.getURL(domain.file))
      .then((res) => res.json())
      .catch((err) => {
        console.warn(`[glossary-tooltip] failed to load ${domain.file}`, err);
        domainCache.delete(domain.id);
        return {};
      });
    domainCache.set(domain.id, request);
  }
  return domainCache.get(domain.id);
}

// Returns Map<lowercase term, { term, definition, source }>.
async function loadGlossary(settings) {
  const active = GLOSSARY_DOMAINS.filter((d) => !settings.disabledDomains.includes(d.id));
  const dicts = await Promise.all(active.map(loadDomain));

  const entries = new Map();
  const add = (dict, source) => {
    for (const [term, definition] of Object.entries(dict)) {
      entries.set(term.toLowerCase(), { term, definition, source });
    }
  };
  active.forEach((domain, i) => add(dicts[i], domain.label));
  add(settings.customTerms, 'Custom'); // added last so custom definitions override built-ins
  return entries;
}

// Lookup for terms missing from every local glossary (e.g. a user text selection).
// Resolves to { term, definition, source } or null. Not wired to any UI yet.
async function fetchDefinitionFallback(term) {
  // TODO: GET https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(term)}
  // Response shape: { en: [{ partOfSpeech, definitions: [{ definition: "<html>" }] }] }.
  // Definitions are HTML — strip tags before display (the tooltip renders textContent only).
  // Wiktionary sends Access-Control-Allow-Origin: *, so this works from a content script.
  return null;
}
