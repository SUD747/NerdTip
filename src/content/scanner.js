// DOM scanning: finds text nodes, wraps glossary matches, watches for new content.

const TERM_CLASS = 'nerdtip-term';
const SKIP_SELECTOR = `script, style, noscript, template, textarea, input, select, option,
  code, pre, kbd, samp, svg, math, iframe, .${TERM_CLASS}`;
const RESCAN_THROTTLE_MS = 1000;

const nextIdle = () =>
  new Promise((resolve) =>
    window.requestIdleCallback
      ? requestIdleCallback(resolve, { timeout: 500 })
      : setTimeout(() => resolve({ timeRemaining: () => 10 }), 16)
  );

const isSkipped = (el) => el.matches(SKIP_SELECTOR) || el.isContentEditable;

function collectTextNodes(root) {
  if (root.nodeType === Node.TEXT_NODE) root = root.parentNode;
  if (!(root instanceof Element) || !root.isConnected) return [];
  if (root.closest(SKIP_SELECTOR) || root.isContentEditable) return [];

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        return isSkipped(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_SKIP; // REJECT prunes the subtree
      }
      return node.nodeValue.trim().length > 1 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    },
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}

function wrapMatches(textNode, matcher, seen) {
  if (!textNode.isConnected) return;
  const matches = matcher.find(textNode.nodeValue, seen);
  if (!matches.length) return;
  // Hidden text doesn't use up a term's one highlight. Checked only on hits since it touches layout.
  if (textNode.parentElement.checkVisibility?.() === false) return;

  // Right to left, so earlier match offsets stay valid as the node is split.
  for (const { index, length, key } of matches.reverse()) {
    const termNode = textNode.splitText(index);
    termNode.splitText(length);
    const span = document.createElement('span');
    span.className = TERM_CLASS;
    span.dataset.nerdtipKey = key;
    termNode.replaceWith(span);
    span.append(termNode);
    seen.add(key);
  }
}

function unwrapAll() {
  for (const span of document.querySelectorAll(`span.${TERM_CLASS}`)) {
    span.replaceWith(...span.childNodes);
  }
}

// Scans the page now and on later DOM additions. Returns stop(), which also removes all highlights.
function startScanner(matcher) {
  const seen = new Set(); // lowercase keys already wrapped: first match per term per page
  let stopped = false;
  let pending = [];
  let timer = null;

  const done = () => stopped || seen.size >= matcher.size;

  async function scan(roots) {
    const nodes = roots.flatMap(collectTextNodes);
    let i = 0;
    while (i < nodes.length && !done()) {
      const deadline = await nextIdle();
      if (stopped) return;
      do {
        wrapMatches(nodes[i++], matcher, seen);
      } while (i < nodes.length && deadline.timeRemaining() > 2);
      observer.takeRecords(); // drop the mutations we just caused
    }
    if (done()) observer.disconnect(); // every term is highlighted, nothing left to watch for
  }

  const observer = new MutationObserver((records) => {
    for (const record of records) pending.push(...record.addedNodes);
    timer ??= setTimeout(() => {
      timer = null;
      const roots = pending;
      pending = [];
      scan(roots);
    }, RESCAN_THROTTLE_MS);
  });

  observer.observe(document.body ?? document.documentElement, { childList: true, subtree: true });
  scan([document.body ?? document.documentElement]);

  return function stop() {
    stopped = true;
    observer.disconnect();
    clearTimeout(timer);
    unwrapAll();
  };
}
