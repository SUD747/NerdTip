// Options page: add/remove custom { term: definition } pairs in storage.local.

const form = document.getElementById('add-form');
const termInput = document.getElementById('term');
const definitionInput = document.getElementById('definition');
const list = document.getElementById('terms');

// Drops any existing key that differs only by case, so "api" replaces "API".
const withoutTerm = (terms, term) =>
  Object.fromEntries(Object.entries(terms).filter(([t]) => t.toLowerCase() !== term.toLowerCase()));

async function render() {
  const { customTerms } = await getSettings();
  const rows = Object.entries(customTerms)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([term, definition]) => {
      const li = document.createElement('li');
      const text = document.createElement('span');
      text.append(Object.assign(document.createElement('strong'), { textContent: term }), ` — ${definition}`);
      const remove = Object.assign(document.createElement('button'), { type: 'button', textContent: 'Remove' });
      remove.addEventListener('click', async () => {
        const settings = await getSettings();
        await browser.storage.local.set({ customTerms: withoutTerm(settings.customTerms, term) });
        render();
      });
      li.append(text, remove);
      return li;
    });
  list.replaceChildren(...rows);
  document.getElementById('empty').hidden = rows.length > 0;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const term = termInput.value.trim();
  const definition = definitionInput.value.trim();
  // A term with no letters or digits (e.g. "--") would match all over every page.
  if (!/[\p{L}\p{N}]/u.test(term)) {
    termInput.setCustomValidity('A term needs at least one letter or digit.');
    termInput.reportValidity();
    return;
  }
  if (!definition) return;
  const { customTerms } = await getSettings();
  await browser.storage.local.set({ customTerms: { ...withoutTerm(customTerms, term), [term]: definition } });
  form.reset();
  render();
});
termInput.addEventListener('input', () => termInput.setCustomValidity(''));

render();
