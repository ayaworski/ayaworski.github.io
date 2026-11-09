/* Search empty state: clicking the header search shows "Recent searches" (9) and "Trending searches" directly below it.
   Typing 1-2 letters shows a spinner in the field; from the 3rd letter on, auto-suggestions (categories and brands, not products) appear.
   Shared by marketplace.html and marketplace-category.html (needs MP_CAT from marketplace-categories.js). */
(function () {
  const form = document.getElementById('search');
  const input = document.getElementById('q');
  if (!form || !input) return;

  const KEY = 'mp-recent-searches', MAX = 9;
  const LANDING = (window.MP_CAT && MP_CAT.landingAll) || [];   // every landing page name (popular + trending)
  const DEFAULTS = ((window.MP_CAT && MP_CAT.landing) || []).slice(0, MAX);   // starting recents: landing pages (curated collections)
  const clock = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.2"/><path d="M8 4.6V8l2.3 1.5"/></svg>';
  const isLanding = (term) => LANDING.some((n) => n.toLowerCase() === String(term).toLowerCase());
  // landing pages open their page; anything else is a normal search
  const go = (term) => { location.href = 'marketplace-category.html?' + (isLanding(term) ? 'category=' : 'q=') + encodeURIComponent(term); };
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

  /* ---- recent searches: whatever the person searched, padded with defaults, always exactly 9 ---- */
  function getRecents() {
    let saved = [];
    try { saved = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { /* storage unavailable */ }
    const out = [];
    saved.concat(DEFAULTS).forEach((t) => {
      if (t && out.length < MAX && !out.some((x) => x.toLowerCase() === String(t).toLowerCase())) out.push(String(t));
    });
    return out;
  }
  function record(term) {
    term = (term || '').trim(); if (!term) return;
    const next = [term].concat(getRecents().filter((t) => t.toLowerCase() !== term.toLowerCase())).slice(0, MAX);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch (e) { /* ignore */ }
  }
  form.addEventListener('submit', () => record(input.value));   // runs before each page's own submit handler

  /* ---- trending searches: label + a small thumbnail from the catalogue ---- */
  function thumbs() {
    const all = (window.MP_CAT && MP_CAT.everything) || [];
    const find = (re, pred) => all.find((p) => re.test(p.name) && (!pred || pred(p)));
    const img = (p) => (p && p.colors && p.colors[0] && p.colors[0].img) || '';
    const jewelry = (window.MP_PRODUCTS && MP_PRODUCTS.jewelry) || [];
    return [
      ['Winter warmers', img(find(/\bhat\b|beanie|cap\b/i))],
      ['Holiday gift guide', img(jewelry[0] || find(/necklace|ring|earring/i))],
      ['Rainy-day jackets', img(find(/parka|trench|puffer|liner|jacket/i, (p) => !/hat/i.test(p.name)))],
      ['Canadian makers', 'images/brand-1.webp'],
      ['Layering basics', img(find(/henley|rib mock|mockneck|long.sleeve/i))],
      ['Weekend travel edit', img(find(/tote|backpack|jogger|hoodie/i))],
    ];
  }

  /* ---- panel ---- */
  form.classList.add('mp-search--host');
  const panel = document.createElement('div');
  panel.className = 'mp-suggest'; panel.id = 'search-suggest'; panel.hidden = true;
  panel.setAttribute('role', 'region'); panel.setAttribute('aria-label', 'Search suggestions');
  form.appendChild(panel);
  input.setAttribute('aria-controls', 'search-suggest'); input.setAttribute('aria-expanded', 'false');

  function render() {
    const recents = getRecents(), trending = thumbs();
    panel.innerHTML =
      '<section><h3>Recent searches</h3><div class="mp-suggest__chips">' +
      recents.map((t) => '<button type="button" class="mp-suggest__chip" data-q="' + esc(t) + '">' + clock + '<span>' + esc(t) + '</span></button>').join('') +
      '</div></section>' +
      '<section><h3>Trending searches</h3><div class="mp-suggest__chips">' +
      trending.map(([t, src]) => '<button type="button" class="mp-suggest__chip mp-suggest__chip--img" data-q="' + esc(t) + '">' +
        (src ? '<img src="' + esc(src) + '" alt="" />' : '') + '<span>' + esc(t) + '</span></button>').join('') +
      '</div></section>';
  }
  /* ---- spinner on the right of the field while suggestions are being worked out ---- */
  const spin = document.createElement('span');
  spin.className = 'mp-search__spin'; spin.setAttribute('aria-hidden', 'true');
  form.appendChild(spin);
  const setBusy = (on) => { form.classList.toggle('is-loading', on); form.setAttribute('aria-busy', on ? 'true' : 'false'); };

  /* ---- auto-suggestions (3+ letters): product names, categories, brands ---- */
  const MIN_CHARS = 3, THINK_MS = 350;
  const CATEGORIES = ["Women's tops", "Women's bottoms", "Women's footwear", "Women's accessories", "Women's jewelry", "Women's outerwear", "Women's apparel", "Women's handbags",
    "Men's apparel", "Men's accessories", "Men's bags", "Kids' apparel", "Kids' shoes & accessories", 'Dresses', 'New arrivals', 'Top sellers'].concat(LANDING);
  const searchIc = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="5"/><path d="M11 11l3.5 3.5"/></svg>';
  const tagIc = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 2h6l6 6-6 6-6-6z"/><circle cx="5.500" cy="5.500" r=".8"/></svg>';
  const slugify = (n) => n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const hl = (label, term) => {
    const i = label.toLowerCase().indexOf(term.toLowerCase());
    return i < 0 ? esc(label) : esc(label.slice(0, i)) + '<b>' + esc(label.slice(i, i + term.length)) + '</b>' + esc(label.slice(i + term.length));
  };
  const rank = (label, t) => { const l = label.toLowerCase(); return l.startsWith(t) ? 0 : l.includes(' ' + t) ? 1 : 2; };
  function suggestions(term) {
    const t = term.toLowerCase();
    const pick = (list, n) => list.filter((x) => x.toLowerCase().includes(t)).sort((a, b) => rank(a, t) - rank(b, t) || a.localeCompare(b)).slice(0, n);
    const names = Array.from(new Set(((window.MP_CAT && MP_CAT.everything) || []).map((p) => String(p.name).split(' in ')[0])));
    const brands = ((window.MP_BRANDS && MP_BRANDS.all) || []).map((b) => b[0]);
    return { products: pick(names, 5), categories: pick(Array.from(new Set(CATEGORIES)), 4), brands: pick(brands, 4) };
  }
  const row = (kind, label, term, icon, data) =>
    '<button type="button" class="mp-suggest__row" role="option" data-kind="' + kind + '" data-q="' + esc(data) + '"><span class="mp-suggest__ic">' + icon + '</span><span class="mp-suggest__label">' + hl(label, term) + '</span></button>';
  function renderResults(term) {
    const r = suggestions(term);
    const sec = (title, rows) => rows ? '<section><h3>' + title + '</h3><div class="mp-suggest__list" role="listbox">' + rows + '</div></section>' : '';
    const html =
      sec('Categories', r.categories.map((n) => row('category', n, term, tagIc, n)).join('')) +
      sec('Brands', r.brands.map((n) => row('brand', n, term, '<img src="images/logos/' + slugify(n) + '.svg?v=2" alt="" />', slugify(n))).join(''));
    panel.innerHTML = html || '<section><div class="mp-suggest__list" role="listbox">' + row('search', 'Search for “' + term + '”', '', searchIc, term) + '</div></section>';
    panel.classList.add('mp-suggest--results');
    activeRow = -1;
  }

  const isOpen = () => !panel.hidden;
  let timer = 0, activeRow = -1;
  const rows = () => [...panel.querySelectorAll('.mp-suggest__row')];
  function show() { panel.hidden = false; form.classList.add('is-active'); input.setAttribute('aria-expanded', 'true'); }
  function open() {
    const v = input.value.trim();
    if (v.length >= MIN_CHARS) { renderResults(v); show(); return; }
    if (v) return;                                // 1-2 letters: nothing yet
    render(); panel.classList.remove('mp-suggest--results'); show();   // empty state
  }
  function close() {
    clearTimeout(timer); setBusy(false);
    panel.hidden = true; form.classList.remove('is-active'); input.setAttribute('aria-expanded', 'false');
  }

  input.addEventListener('focus', open);
  input.addEventListener('click', () => { if (!isOpen()) open(); });
  input.addEventListener('input', () => {
    clearTimeout(timer);
    const v = input.value.trim();
    if (!v) { setBusy(false); open(); return; }
    if (v.length < MIN_CHARS) {                   // 1-2 letters: spinner only, no suggestions yet
      panel.hidden = true; form.classList.remove('is-active'); input.setAttribute('aria-expanded', 'false');
      setBusy(true); return;
    }
    setBusy(false);                               // 3rd letter on: suggestions appear
    renderResults(v); show();
  });
  // Clicking out of the field closes the panel and clears whatever was typed (the term is not kept)
  input.addEventListener('blur', () => setTimeout(() => {
    if (panel.contains(document.activeElement) || document.activeElement === input) return;
    close();
    if (input.value) { input.value = ''; form.classList.remove('has-value'); }
  }, 120));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { close(); input.blur(); return; }
    const list = isOpen() ? rows() : [];
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && list.length) {
      e.preventDefault();
      activeRow = e.key === 'ArrowDown' ? Math.min(list.length - 1, activeRow + 1) : Math.max(0, activeRow - 1);
      list.forEach((r, i) => r.classList.toggle('is-active', i === activeRow));
      list[activeRow].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter' && activeRow >= 0 && list[activeRow]) { e.preventDefault(); list[activeRow].click(); }
  });
  // keep focus in the field while pressing inside the panel, so the click still lands
  panel.addEventListener('mousedown', (e) => e.preventDefault());
  panel.addEventListener('click', (e) => {
    const r = e.target.closest('.mp-suggest__row');
    if (r) {
      const kind = r.dataset.kind, q = r.dataset.q;
      if (kind === 'brand') { location.href = 'marketplace-brand.html?brand=marlow-finch'; return; }   // prototype: every brand opens Marlow & Finch
      if (kind !== 'product') record(q);   // picking a product (it opens directly) is not kept in Recent searches
      if (kind === 'category') { location.href = 'marketplace-category.html?category=' + encodeURIComponent(q); return; }
      location.href = 'marketplace-category.html?q=' + encodeURIComponent(q) + (kind === 'product' ? '&open=' + encodeURIComponent(q) : ''); return;   // a product opens its detail dialog
    }
    const b = e.target.closest('.mp-suggest__chip'); if (!b) return;
    const term = b.dataset.q; record(term); go(term);
  });
  document.addEventListener('mousedown', (e) => { if (isOpen() && !form.contains(e.target)) close(); });
})();
