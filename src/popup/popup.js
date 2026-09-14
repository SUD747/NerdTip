// Popup: per-site on/off and glossary domain selection. Content scripts pick up
// changes through storage.onChanged, so no messaging is needed.

const toggleInList = (list, value, include) =>
  include ? [...new Set([...list, value])] : list.filter((v) => v !== value);

(async () => {
  const settings = await getSettings();
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

  // activeTab exposes the tab URL while the popup is open.
  const url = tab?.url ?? '';
  const siteToggle = document.getElementById('site-enabled');
  if (/^(https?|file):/.test(url)) {
    const site = siteKey(url);
    document.getElementById('site').textContent = site;
    siteToggle.checked = !settings.disabledSites.includes(site);
    siteToggle.addEventListener('change', async () => {
      const { disabledSites } = await getSettings();
      await browser.storage.local.set({
        disabledSites: toggleInList(disabledSites, site, !siteToggle.checked),
      });
    });
  } else {
    siteToggle.closest('label').hidden = true;
    document.getElementById('unsupported').hidden = false;
  }

  const container = document.getElementById('domains');
  for (const domain of GLOSSARY_DOMAINS) {
    const label = document.createElement('label');
    const box = Object.assign(document.createElement('input'), {
      type: 'checkbox',
      checked: !settings.disabledDomains.includes(domain.id),
    });
    box.addEventListener('change', async () => {
      const { disabledDomains } = await getSettings();
      await browser.storage.local.set({
        disabledDomains: toggleInList(disabledDomains, domain.id, !box.checked),
      });
    });
    label.append(box, domain.label);
    container.append(label);
  }

  document.getElementById('open-options').addEventListener('click', () => {
    browser.runtime.openOptionsPage();
    window.close();
  });
})();
