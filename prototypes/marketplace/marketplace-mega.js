/* "Fashion & apparel" department menu in the header: click to open a panel of other product verticals.
   The tiles are display only (they don't link anywhere). Closes on Escape, outside click or the scrim. */
(function () {
  const btn = document.querySelector('.mp-dept');
  const header = document.querySelector('.mp-header');
  if (!btn || !header) return;

  const icons = {
    fashion: '<path d="M9 4l-5 3 2 4 2-1v10h8V10l2 1 2-4-5-3c-.5 1.500-1.700 2.200-3 2.200S9.500 5.500 9 4z"/>',
    jewelry: '<path d="M7 4h10l3 5-8 11L4 9z"/><path d="M4 9h16M10 4L8 9l4 11 4-11-2-5"/>',
    sport: '<circle cx="12" cy="12" r="8"/><path d="M4.500 8.500c3 .5 5.500 3 6 7M19.500 8.500c-3 .5-5.500 3-6 7M12 4v16"/>',
    home: '<path d="M4 11l8-7 8 7M6 10v9h12v-9M10 19v-5h4v5"/>',
    pets: '<circle cx="7" cy="10" r="1.800"/><circle cx="17" cy="10" r="1.800"/><circle cx="10" cy="6" r="1.800"/><circle cx="14" cy="6" r="1.800"/><path d="M12 12c-3 0-5 2.500-5 4.500 0 1.500 1.500 2 3 1.500 1-.3 1.500-.5 2-.5s1 .2 2 .5c1.500.5 3 0 3-1.500 0-2-2-4.500-5-4.500z"/>',
    vape: '<rect x="9.500" y="9" width="5" height="12" rx="1.500"/><path d="M10.500 9V6.500h3V9M12 3.500c-1 1-1 2 0 3"/>'
  };
  // [label, icon, tile background] (same order as the department list)
  const verticals = [
    ['Fashion & apparel', 'fashion', '#f1d9d4', ['fashion.webp', '66% 30%']],
    ['Jewelry',           'jewelry', '#e9e1cf', ['jewelry.webp', '58% 50%']],
    ['Sports & outdoor',  'sport',   '#d7e3ea', ['sports-outdoor.webp', '42% 50%']],
    ['Home & garden',     'home',    '#dfe6d3', ['home-garden.webp', '50% 55%']],
    ['Pets',              'pets',    '#e0dbea', ['pets.webp', '60% 72%']],
    ['Smoke & vape',      'vape',    '#dcdcdc', ['smoke-vape.webp', '42% 40%']]
  ];

  const panel = document.createElement('div');
  panel.className = 'mp-mega'; panel.id = 'mp-mega'; panel.hidden = true;
  panel.setAttribute('role', 'region'); panel.setAttribute('aria-label', 'Product verticals');
  panel.innerHTML = '<ul class="mp-mega__list">' + verticals.map(([name, ic, bg, photo]) =>
    '<li class="mp-mega__item"><span class="mp-mega__img" style="background:' + bg + '">' +
    (photo ? '<img src="images/verticals/' + photo[0] + '" alt="" style="object-position:' + photo[1] + '" />'
           : '<svg viewBox="0 0 24 24" aria-hidden="true">' + icons[ic] + '</svg>') + '</span>' +
    '<span class="mp-mega__name">' + name.replace('&', '&amp;') + '</span></li>').join('') + '</ul>';
  header.appendChild(panel);

  const scrim = document.createElement('div');
  scrim.className = 'mp-mega__scrim'; scrim.hidden = true;
  (header.parentElement || document.body).appendChild(scrim);

  btn.setAttribute('aria-haspopup', 'true'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'mp-mega');
  const isOpen = () => !panel.hidden;
  function open() { panel.hidden = false; scrim.hidden = false; btn.setAttribute('aria-expanded', 'true'); btn.classList.add('is-open'); }
  function close(refocus) { panel.hidden = true; scrim.hidden = true; btn.setAttribute('aria-expanded', 'false'); btn.classList.remove('is-open'); if (refocus) btn.focus(); }

  btn.addEventListener('click', (e) => { e.stopPropagation(); isOpen() ? close(false) : open(); });
  scrim.addEventListener('click', () => close(false));
  document.addEventListener('mousedown', (e) => { if (isOpen() && !panel.contains(e.target) && !btn.contains(e.target)) close(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen()) close(true); });
})();

/* Marketplace nav items: clicking keeps the hover look on the item but never navigates. */
(function () {
  const nav = document.querySelector('.mp-subnav'); if (!nav) return;
  nav.addEventListener('click', (e) => {
    const a = e.target.closest('a'); if (!a) return;
    e.preventDefault();
    nav.querySelectorAll('a.is-picked').forEach((x) => x.classList.remove('is-picked'));
    a.classList.add('is-picked');
  });
  document.addEventListener('mousedown', (e) => { if (!nav.contains(e.target)) nav.querySelectorAll('a.is-picked').forEach((x) => x.classList.remove('is-picked')); });
})();
