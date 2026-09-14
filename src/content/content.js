// Entry point: reads settings, loads glossaries, starts the scanner, reacts to setting changes.

(() => {
  const site = siteKey(location.href);
  let entries = new Map();
  let stopScanner = null;
  let tooltipReady = false;
  let generation = 0;

  async function apply() {
    const gen = ++generation;
    const settings = await getSettings();
    const next = settings.disabledSites.includes(site) ? new Map() : await loadGlossary(settings);
    if (gen !== generation) return; // a newer settings change won the race

    stopScanner?.();
    stopScanner = null;
    entries = next;
    if (!entries.size) return;

    if (!tooltipReady) {
      createTooltip((key) => entries.get(key));
      tooltipReady = true;
    }
    stopScanner = startScanner(buildMatcher([...entries.values()].map((e) => e.term)));
  }

  browser.storage.onChanged.addListener((_changes, area) => {
    if (area === 'local') apply();
  });
  apply();
})();
