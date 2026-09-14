// Tooltip rendering. Lives in a shadow root so page CSS can't restyle it.

const TOOLTIP_CSS = `
  .tip {
    all: initial;
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 2147483647;
    max-width: 320px;
    padding: 8px 10px;
    border-radius: 6px;
    background: #1f2330;
    color: #f2f3f7;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    font: 13px/1.45 system-ui, -apple-system, "Segoe UI", sans-serif;
    pointer-events: none;
  }
  .tip[hidden] { display: none; }
  .term { display: block; font-weight: 600; margin-bottom: 2px; }
  .source { display: block; margin-top: 4px; font-size: 11px; color: #9aa0b4; }
`;

// lookup(key) -> { term, definition, source } | undefined
function createTooltip(lookup) {
  const host = document.createElement('glossary-tooltip-host');
  const shadow = host.attachShadow({ mode: 'closed' });
  const style = document.createElement('style');
  style.textContent = TOOLTIP_CSS;
  const tip = document.createElement('div');
  tip.className = 'tip';
  tip.setAttribute('role', 'tooltip');
  tip.hidden = true;
  const termEl = Object.assign(document.createElement('span'), { className: 'term' });
  const defEl = document.createElement('span');
  const sourceEl = Object.assign(document.createElement('span'), { className: 'source' });
  tip.append(termEl, defEl, sourceEl);
  shadow.append(style, tip);

  function position(x, y) {
    const gap = 14;
    const margin = 4;
    let left = x + gap;
    let top = y + gap;
    if (left + tip.offsetWidth > innerWidth - margin) left = Math.max(margin, x - gap - tip.offsetWidth);
    if (top + tip.offsetHeight > innerHeight - margin) top = Math.max(margin, y - gap - tip.offsetHeight);
    tip.style.transform = `translate(${left}px, ${top}px)`;
  }

  function show(entry, x, y) {
    if (!host.isConnected) document.documentElement.append(host); // pages sometimes replace <body>
    termEl.textContent = entry.term; // textContent only: custom definitions are user input
    defEl.textContent = entry.definition;
    sourceEl.textContent = entry.source;
    tip.hidden = false;
    position(x, y);
  }

  const hide = () => (tip.hidden = true);
  const termAt = (target) => target?.closest?.(`.${TERM_CLASS}`);

  document.addEventListener('mouseover', (e) => {
    const span = termAt(e.target);
    const entry = span && lookup(span.dataset.glossaryKey);
    if (entry) show(entry, e.clientX, e.clientY);
  });
  document.addEventListener('mousemove', (e) => {
    if (!tip.hidden) position(e.clientX, e.clientY);
  });
  document.addEventListener('mouseout', (e) => {
    const span = termAt(e.target);
    if (span && !span.contains(e.relatedTarget)) hide();
  });
  addEventListener('scroll', hide, { capture: true, passive: true });
}
