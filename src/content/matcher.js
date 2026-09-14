// Pure text matching — no DOM, so `npm test` can run it under Node.

const WORD_CHAR = '[\\p{L}\\p{N}_]';

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Lookup is case-insensitive, but terms written with capitals in the glossary ("RAG", "LoRA")
// only match that exact casing or ALL CAPS, so "RAG" doesn't light up every "rag" on a page.
// ponytail: casing heuristic, add a per-term "caseSensitive" flag if it misfires.
const caseMatches = (term, text) =>
  term === term.toLowerCase() || text === term || text === term.toUpperCase();

function buildMatcher(terms) {
  const byKey = new Map(terms.map((t) => [t.toLowerCase(), t]));
  // Longest first, so "machine learning" wins over "learning".
  const alternation = [...byKey.values()]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join('|');
  // Custom boundaries instead of \b so terms like "C++" or "CI/CD" work; optional plural suffix.
  const re = new RegExp(`(?<!${WORD_CHAR})(${alternation})(?:es|s)?(?!${WORD_CHAR})`, 'giu');

  return {
    size: byKey.size,
    // Non-overlapping matches in `text` for terms not in `seen`, each term at most once.
    find(text, seen) {
      const found = [];
      const local = new Set();
      for (const m of text.matchAll(re)) {
        const key = m[1].toLowerCase();
        if (seen.has(key) || local.has(key) || !caseMatches(byKey.get(key), m[1])) continue;
        local.add(key);
        found.push({ index: m.index, length: m[0].length, key });
      }
      return found;
    },
  };
}

if (typeof module !== 'undefined') module.exports = { buildMatcher };
