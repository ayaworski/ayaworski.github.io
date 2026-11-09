/* Styled dropdown for the "Sort by:" control.
   The native <select> stays in the DOM (hidden) as the source of truth, so existing code that reads select.value
   or listens for "change" keeps working; this only replaces the popup the browser draws with our own menu. */
(function () {
  const chevron = '<svg class="mp-sort__chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5L6 8l3.5-3.5"/></svg>';
  const check = '<svg class="mp-sort__check" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7"/></svg>';

  document.querySelectorAll('.mp-sort select').forEach(enhance);

  function enhance(sel) {
    const old = sel.closest('.mp-sort');
    if (!old || old.dataset.enhanced) return;
    // a <label> would forward clicks to the hidden select, so use a div (same class, so same styles)
    const box = document.createElement('div');
    box.className = old.className; box.dataset.enhanced = '1';
    while (old.firstChild) box.appendChild(old.firstChild);
    old.replaceWith(box);

    sel.setAttribute('aria-hidden', 'true'); sel.tabIndex = -1;
    const labelText = (box.querySelector('span') || {}).textContent || 'Sort by';

    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'mp-sort__btn';
    btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false');
    const menu = document.createElement('ul');
    menu.className = 'mp-sort__menu'; menu.setAttribute('role', 'listbox'); menu.hidden = true;
    menu.id = (sel.id || 'sort') + '-menu'; btn.setAttribute('aria-controls', menu.id);
    box.appendChild(btn); box.appendChild(menu);

    menu.innerHTML = [...sel.options].map((o) =>
      '<li role="option" tabindex="-1" data-value="' + o.value + '"><span>' + o.textContent + '</span>' + check + '</li>').join('');
    const items = () => [...menu.querySelectorAll('li')];

    function sync() {
      const cur = sel.selectedOptions[0];
      btn.innerHTML = '<span class="mp-sort__value">' + (cur ? cur.textContent : '') + '</span>' + chevron;
      btn.setAttribute('aria-label', labelText.replace(/:$/, '') + ': ' + (cur ? cur.textContent : ''));
      items().forEach((li) => li.setAttribute('aria-selected', String(li.dataset.value === sel.value)));
    }
    const isOpen = () => !menu.hidden;
    function open() {
      menu.hidden = false; box.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true');
      const cur = items().find((li) => li.dataset.value === sel.value) || items()[0]; cur.focus();
    }
    function close(refocus) {
      menu.hidden = true; box.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false');
      if (refocus) btn.focus();
    }
    function choose(li) {
      if (sel.value !== li.dataset.value) { sel.value = li.dataset.value; sel.dispatchEvent(new Event('change', { bubbles: true })); }
      sync(); close(true);
    }

    btn.addEventListener('click', () => (isOpen() ? close(false) : open()));
    btn.addEventListener('keydown', (e) => {
      if (['ArrowDown', 'ArrowUp'].includes(e.key)) { e.preventDefault(); open(); }
    });
    menu.addEventListener('click', (e) => { const li = e.target.closest('li'); if (li) choose(li); });
    menu.addEventListener('keydown', (e) => {
      const list = items(), i = list.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); list[Math.min(list.length - 1, i + 1)].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); list[Math.max(0, i - 1)].focus(); }
      else if (e.key === 'Home') { e.preventDefault(); list[0].focus(); }
      else if (e.key === 'End') { e.preventDefault(); list[list.length - 1].focus(); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (i >= 0) choose(list[i]); }
      else if (e.key === 'Escape') { e.preventDefault(); close(true); }
      else if (e.key === 'Tab') close(false);
    });
    document.addEventListener('mousedown', (e) => { if (isOpen() && !box.contains(e.target)) close(false); });
    sel.addEventListener('change', sync);   // keeps the label right if the value is changed elsewhere
    sync();
  }
})();
