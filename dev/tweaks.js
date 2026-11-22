/* Dev-only style tweak panel + type style guide.
   Loaded by script.js only on a local server (localhost / 127.0.0.1 / file://), never on the live site.
   Toggle: the "Tweaks" button bottom-left, or the ` (backtick) key.
   Tweaks are live overrides injected after style.css and kept in localStorage, so they follow you across pages.
   "Copy for prompt" gives a before → after list (plus equivalent CSS) to paste into a prompt that updates style.css. */
(() => {
  'use strict';
  if (window.__portfolioTweaks) return;
  window.__portfolioTweaks = true;

  const KEY = 'portfolio-tweaks-v1';
  const UI_KEY = 'portfolio-tweaks-ui-v1';
  const PANEL_W = 380;

  /* ---------------- Definitions (mirror style.css) ---------------- */
  const c = (min, vw, max) => ({ min, vw, max });
  const px = v => ({ px: v });

  // The type hierarchy. sel = the style.css selectors that use this style; defaults match style.css.
  // after: a variant whose rule has the same specificity as its parent and must be re-emitted after it.
  const TYPE = [
    { cat: 'Headings', id: 'display', tok: ['--size-display', '--text-display', '--track-display'], name: 'Display', role: 'Statement: homepage hero name', sel: ['.hero h1'], fam: 'display', w: 800, size: c(56, 7.75, 106), lh: 1, ls: -0.045, sample: 'Designing for clarity' },
    { cat: 'Headings', id: 'display-s', tok: ['--size-display-s', '--text-display-s', '--track-display'], name: 'Display S', role: 'Statement: footer CTA', sel: ['.footer-cta h2'], fam: 'display', w: 800, size: c(44, 6, 88), lh: 1, ls: -0.045, sample: "Let's talk about what you're building." },
    { cat: 'Headings', id: 'lede', tok: ['--size-lede', '--text-lede', '--track-lede'], name: 'Lede', role: 'Statement under the homepage hero name', sel: ['.hero-lede'], fam: 'body', w: 600, size: c(26, 3, 40), lh: 1.3, ls: -0.015, color: '--fg-primary', sample: 'I design complex commerce products where merchants, money, and operations meet.' },
    { cat: 'Headings', id: 'h1', tok: ['--size-h1', '--text-h1', '--track-display'], name: 'H1', role: 'Case study page title', sel: ['.case-intro h1'], fam: 'display', w: 800, size: c(48, 7.2, 96), lh: 1, ls: -0.045, sample: 'Wholesale marketplace' },
    { cat: 'Headings', id: 'h2', tok: ['--size-h2', '--text-h2', '--track-h2'], name: 'H2', role: 'Homepage section titles', sel: ['h2.section-title'], fam: 'display', w: 800, size: c(32, 4.22, 54), lh: 1, ls: -0.04, sample: 'Selected work' },
    { cat: 'Headings', id: 'h3', tok: ['--size-h3', '--text-h3', '--track-h3'], name: 'H3', role: 'Chapter headings, overview statement, case card titles, about intro', sel: ['.h-display', '.case-title', '.about-copy .lead', '.overview__copy .big'], fam: 'display', w: 800, size: c(28, 2.73, 39), lh: 1.08, ls: -0.03, sample: 'Making checkout feel instant' },
    { cat: 'Headings', id: 'h4', tok: ['--size-h4', '--text-h4', '--track-h4'], name: 'H4', role: 'Sub-headings, results heading, solution section titles, next case card', sel: ['.h-sub'], fam: 'display', w: 800, size: c(22, 2.07, 29), lh: 1.15, ls: -0.02, sample: 'Start from the job to be done' },
    { cat: 'Headings', id: 'h5', tok: ['--size-h5', '--text-h5', '--track-h4'], name: 'H5', role: '"How I work" titles, insight titles, hotspot note titles', sel: ['.principle-title', '.kis .h-sub', '.hs__note strong'], fam: 'display', w: 800, size: c(18, 1.53, 20), lh: 1.25, ls: -0.02, sample: 'Buyers trust what they can compare' },
    { cat: 'Numbers', id: 'number-l', tok: ['--size-number-l', '--text-number-l', '--track-number'], name: 'Number L', role: 'Key result numbers (capped at 33% of card width in results cards)', sel: ['.big-n'], fam: 'display', w: 800, size: c(48, 7.2, 96), lh: 0.95, ls: -0.045, sample: '42%' },
    { cat: 'Numbers', id: 'number-m', tok: ['--size-number-m', '--text-number-m'], name: 'Number M', role: 'Stat beside a figure (3.8%)', sel: ['.stats--row .stat .big-n'], fam: 'display', w: 800, size: c(32, 4.22, 54), lh: 0.95, ls: -0.045, sample: '67%' },
    { cat: 'Callout', id: 'callout', tok: ['--size-callout', '--text-callout', '--track-h4'], name: 'Callout', role: 'Pull quote', sel: ['.quote blockquote'], fam: 'display', w: 800, size: c(22, 2.54, 34), lh: 1.2, ls: -0.02, sample: '“We stopped chasing invoices.”' },
    { cat: 'Body', id: 'body-l', tok: ['--size-body-l', '--leading-body-l', '--text-body-l'], name: 'Body L', role: 'Case study intro paragraph', sel: ['.case-intro .lead'], fam: 'body', w: 400, size: c(20, 2.4, 30), lh: 1.45, ls: null, color: '--fg-primary', sample: 'A marketplace that brought brands and retailers into one buying flow.' },
    { cat: 'Body', id: 'body-l-bold', tok: ['--size-body-l', '--leading-body-l', '--text-body-l-bold'], name: 'Body L Bold', role: 'Bold key result in the case study intro (and <strong> in Body L)', sel: ['.case-intro .lead strong'], fam: 'body', w: 600, size: c(20, 2.4, 30), lh: 1.45, ls: null, color: '--fg-primary', sample: 'grew payment volume 5× to $17.5M' },
    { cat: 'Body', id: 'body-m', tok: ['--size-body-m', '--leading-body-m', '--text-body-m'], name: 'Body M', role: 'Default body: cards, about, overview, chapter intros, facts, notes, captions', sel: ['.body-text', '.case p', '.about-copy p:not(.lead)', '.principle-desc', '.overview__copy p:not(.big)', '.ch__head p', '.facts dd', '.hs__note', '.fig figcaption', '.hs__cap'], fam: 'body', w: 400, size: px(16), lh: 1.6, ls: null, color: '--fg-primary', sample: 'Default body copy for cards, principles and supporting detail.' },
    { cat: 'Body', id: 'body-m-bold', tok: ['--size-body-m', '--leading-body-m', '--text-body-m-bold', '--weight-bold'], name: 'Body M Bold', role: 'Fact labels, quote author, nav links, footer pills (and <strong>)', sel: ['.facts dt', '.quote figcaption span:first-child', '.nav-link', '.pill'], fam: 'body', w: 600, size: px(16), lh: 1.6, ls: null, sample: 'Role' },
    { cat: 'Body', id: 'body-s', tok: ['--size-body-s', '--leading-body-s', '--text-body-s'], name: 'Body S', role: 'Footnotes under facts and captions', sel: ['.facts dd .fact-note', '.hs__cap-note'], fam: 'body', w: 400, size: px(14), lh: 1.55, ls: null, color: '--fg-muted', sample: 'Measured over the first 90 days after launch.' },
    { cat: 'Body', id: 'body-s-bold', tok: ['--size-body-s', '--leading-body-s', '--text-body-s-bold'], name: 'Body S Bold', role: 'Not used yet: small labels', sel: [], fam: 'body', w: 600, size: px(14), lh: 1.55, ls: null, sample: 'Small label' },
    { cat: 'UI', id: 'logo', tok: ['--text-logo', '--track-logo'], name: 'Logo', role: 'Brand wordmark (andrew.design)', sel: ['.logo'], fam: 'display', w: 800, size: c(22, 2.07, 29), lh: 1.15, ls: -0.02, sample: 'andrew.design' },
    { cat: 'UI', id: 'button', tok: ['--text-button'], name: 'Button', role: 'Primary buttons', sel: ['.btn'], fam: 'body', w: 600, size: px(18), lh: 1.25, ls: null, sample: 'View case study' },
    { cat: 'UI', id: 'mono', tok: ['--text-mono', '--track-mono'], name: 'Mono label', role: 'Eyebrows, chips, tags, prototype tabs, zoom % (uppercase)', sel: ['.mono', '.proto__tab', '.proto__full', '.lb-zoom .lb-pct'], fam: 'mono', w: 500, size: px(14), lh: null, ls: 0.05, upper: true, sample: 'Case study 01' },
    { cat: 'UI', id: 'hand', name: 'Handwritten', role: 'Prototype hint annotation', sel: ['.proto__hint span'], fam: "'Gochi Hand', cursive", w: 400, size: c(20, 2, 26), lh: 1, ls: null, sample: 'try clicking around!' },
  ];

  const COLOR_GROUPS = [
    ['Palette (feeds the tokens below)', ['--ink', '--slate', '--mist', '--white', '--lime', '--blue']],
    ['Foreground', ['--fg-primary', '--fg-secondary', '--fg-muted', '--fg-inverse', '--fg-inverse-muted']],
    ['Background', ['--bg-page', '--bg-grid', '--bg-surface', '--bg-inverse', '--bg-inverse-hover', '--bg-accent', '--bg-accent-hover', '--bg-accent-subtle']],
    ['Border', ['--border-primary', '--border-line', '--border-grid', '--border-inverse', '--border-inverse-subtle']],
  ];
  COLOR_GROUPS.push(['Interaction', ['--focus', '--hotspot']]);
  const FG_TOKENS = COLOR_GROUPS[1][1];
  const FONT_TOKENS = [['--font-display', 'Display font'], ['--font-body', 'Body font'], ['--font-mono', 'Mono font']];
  const FONT_CHOICES = ["'Archivo', sans-serif", "'IBM Plex Sans', sans-serif", "'IBM Plex Mono', monospace", "'Lato', sans-serif", "'Gochi Hand', cursive", 'system-ui, sans-serif', 'Georgia, serif'];
  const FAM_LABEL = { display: 'Display (--font-display)', body: 'Body (--font-body)', mono: 'Mono (--font-mono)' };

  // Shape + spacing knobs. token: a :root custom property; css: a custom rule builder; otherwise sel + prop in px.
  const CONTROLS = [
    { tab: 'shape', group: 'Corner radius', id: '--radius-control', token: true, label: 'Controls: buttons, pills, icon buttons, arrows, zoom bar', max: 40 },
    { tab: 'shape', group: 'Corner radius', id: 'r-chip', label: 'Chips', sel: ['.chip'], prop: 'border-radius', def: 8, max: 40 },
    { tab: 'shape', group: 'Corner radius', id: 'r-img', label: 'Images (zoomable)', sel: ['.zoomable', '.side-img::before'], prop: 'border-radius', def: 16, max: 48 },
    { tab: 'shape', group: 'Corner radius', id: 'r-shot', label: 'Hotspot screenshots', sel: ['.hs__shot', '.hs__shot img', '.hs__shot .zoomable', '.hs__clip'], prop: 'border-radius', def: 12, max: 48 },
    { tab: 'shape', group: 'Corner radius', id: '--radius-card', token: true, label: 'Cards: homepage case cards, results cards, next case card, hotspot notes', max: 64 },
    { tab: 'shape', group: 'Corner radius', id: 'r-frame', label: 'Figure frames', sel: ['.fig__frame', '.hs__frame'], prop: 'border-radius', def: 24, max: 64 },
    { tab: 'shape', group: 'Borders & shadow', id: 'b-btn', label: 'Button / pill stroke', sel: ['.btn', '.pill', '.pager__btn'], prop: 'border-width', def: 2, max: 8, step: 0.5 },
    { tab: 'shape', group: 'Borders & shadow', id: 'b-chip', label: 'Chip stroke', sel: ['.chip'], prop: 'border-width', def: 1.5, max: 8, step: 0.5 },
    { tab: 'shape', group: 'Borders & shadow', id: '--shadow-offset', token: true, label: 'Control shadow offset (hover = offset − 2)', max: 16 },
    { tab: 'spacing', group: 'Layout tokens', id: '--gutter', token: true, label: 'Page gutter' },
    { tab: 'spacing', group: 'Layout tokens', id: '--section-space', token: true, label: 'Section spacing' },
    { tab: 'spacing', group: 'Layout tokens', id: '--content-max', token: true, label: 'Content max width', max: 2000 },
    { tab: 'spacing', group: 'Components', id: 'sp-btn-h', label: 'Button min height', sel: ['.btn'], prop: 'min-height', def: 56, max: 96 },
    { tab: 'spacing', group: 'Components', id: 'sp-btn-x', label: 'Button side padding', note: '.btn padding-left/right', def: 24, max: 64,
      css: v => `html .btn { padding-left: ${v}px; padding-right: ${v}px; }` },
    { tab: 'spacing', group: 'Components', id: 'sp-pill-h', label: 'Pill height', sel: ['.pill'], prop: 'height', def: 44, max: 80 },
    { tab: 'spacing', group: 'Components', id: 'sp-chips', label: 'Chip gap', sel: ['.chips'], prop: 'gap', def: 8, max: 40 },
  ];

  /* ---------------- Helpers ---------------- */
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const r2 = n => Math.round(n * 100) / 100;
  const r3 = n => Math.round(n * 1000) / 1000;
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const clone = v => (v && typeof v === 'object' ? { ...v } : v);
  const fmtSize = s => (s.px != null ? `${s.px}px` : `clamp(${s.min}px, ${s.vw}vw, ${s.max}px)`);
  const sizeAt = (s, w) => (s.px != null ? s.px : Math.min(Math.max(s.min, (s.vw * w) / 100), s.max));
  const parseSize = str => {
    const m = /^clamp\(\s*([\d.]+)px\s*,\s*([\d.]+)vw\s*,\s*([\d.]+)px\s*\)$/.exec(str);
    if (m) return c(+m[1], +m[2], +m[3]);
    const p = /^([\d.]+)px$/.exec(str);
    return p ? px(+p[1]) : null;
  };
  const famCss = f => (FAM_LABEL[f] ? `var(--font-${f})` : f);
  const famName = f => {
    const v = FAM_LABEL[f] ? state.tok[`--font-${f}`] ?? rootDef[`--font-${f}`] : f;
    return (v || '').split(',')[0].replace(/['"]/g, '').trim();
  };

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const toHex = color => {
    try {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = '#000';
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      return '#' + [r, g, b].map(n => n.toString(16).padStart(2, '0')).join('');
    } catch (e) { return '#000000'; }
  };

  const load = (k, fb) => { try { return JSON.parse(localStorage.getItem(k)) || fb; } catch (e) { return fb; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } };

  /* ---------------- State ---------------- */
  // Read token defaults before any override is applied.
  const rootStyle = getComputedStyle(document.documentElement);
  const rootDef = {};
  [...COLOR_GROUPS.flatMap(g => g[1]), ...FONT_TOKENS.map(t => t[0]), ...CONTROLS.filter(x => x.token).map(x => x.id)]
    .forEach(t => { rootDef[t] = rootStyle.getPropertyValue(t).trim(); });

  // Only overrides are stored: tok = token strings, type = {id: {field: value}}, ctl = {id: value}.
  const state = Object.assign({ tok: {}, type: {}, ctl: {} }, load(KEY, {}));
  const ui = Object.assign({ open: false, tab: 'type', guide: false }, load(UI_KEY, {}));
  const expanded = new Set();
  const guideText = {};

  const typeDef = e => ({ fam: e.fam, w: e.w, size: e.size, lh: e.lh ?? null, ls: e.ls ?? null, color: e.color ?? null });
  const typeCur = e => Object.assign(typeDef(e), state.type[e.id] || {});
  const typeChanged = e => { const d = typeDef(e), v = typeCur(e); return Object.keys(d).filter(k => !same(d[k], v[k])); };
  const ctlDef = x => (x.token ? parseSize(rootDef[x.id]) : x.def);
  const ctlCur = x => (x.id in state.ctl ? state.ctl[x.id] : ctlDef(x));
  const ctlChanged = x => x.id in state.ctl && !same(state.ctl[x.id], ctlDef(x));
  const tokCur = t => state.tok[t] ?? rootDef[t];
  const tokChanged = t => t in state.tok && state.tok[t] !== rootDef[t];

  function setType(id, field, value) {
    const e = TYPE.find(t => t.id === id);
    const o = state.type[id] || (state.type[id] = {});
    if (same(typeDef(e)[field], value)) delete o[field]; else o[field] = value;
    if (!Object.keys(o).length) delete state.type[id];
    commit();
  }
  function setCtl(id, value) {
    const x = CONTROLS.find(k => k.id === id);
    if (same(ctlDef(x), value)) delete state.ctl[id]; else state.ctl[id] = value;
    commit();
  }
  function setTok(t, value) {
    if (value === rootDef[t]) delete state.tok[t]; else state.tok[t] = value;
    commit();
  }
  const changeCount = () =>
    Object.keys(state.tok).filter(tokChanged).length +
    TYPE.reduce((n, e) => n + typeChanged(e).length, 0) +
    CONTROLS.filter(ctlChanged).length;

  /* ---------------- CSS output ---------------- */
  function typeDecls(e, fields) {
    const v = typeCur(e);
    return fields.map(f => {
      switch (f) {
        case 'fam': return `font-family: ${famCss(v.fam)}`;
        case 'w': return `font-weight: ${v.w}`;
        case 'size': return `font-size: ${fmtSize(v.size)}`;
        case 'lh': return `line-height: ${v.lh ?? 'normal'}`;
        case 'ls': return `letter-spacing: ${v.ls == null ? 'normal' : v.ls + 'em'}`;
        case 'color': return `color: ${v.color ? `var(${v.color})` : 'inherit'}`;
      }
    });
  }
  // "html " adds one type selector of specificity, so overrides beat the base rule but not the
  // more specific contextual rules (.cards .big-n etc.), keeping the cascade the same as style.css.
  const rule = (sel, decls) => `${sel.map(s => 'html ' + s).join(',\n')} {\n  ${decls.join(';\n  ')};\n}`;

  function buildCSS() {
    const out = [];
    const root = [];
    Object.keys(state.tok).filter(tokChanged).forEach(t => root.push(`${t}: ${state.tok[t]}`));
    CONTROLS.filter(x => x.token && ctlChanged(x)).forEach(x => root.push(`${x.id}: ${fmtSize(ctlCur(x))}`));
    if (root.length) out.push(`:root {\n  ${root.join(';\n  ')};\n}`);
    TYPE.filter(e => !e.after && e.sel.length).forEach(e => { const f = typeChanged(e); if (f.length) out.push(rule(e.sel, typeDecls(e, f))); });
    TYPE.filter(e => e.after).forEach(e => {
      const parent = TYPE.find(p => p.id === e.after);
      const f = [...new Set([...typeChanged(parent), ...typeChanged(e)])];
      if (f.length) out.push(rule(e.sel, typeDecls(e, f)));
    });
    CONTROLS.filter(x => !x.token && ctlChanged(x)).forEach(x => {
      const v = ctlCur(x);
      out.push(x.css ? x.css(v) : rule(x.sel, [`${x.prop}: ${v}px`]));
    });
    return out.join('\n\n');
  }

  const fmtField = (f, v) => {
    switch (f) {
      case 'fam': return famCss(v);
      case 'size': return fmtSize(v);
      case 'lh': return v ?? 'normal';
      case 'ls': return v == null ? 'normal' : v + 'em';
      case 'color': return v ? `var(${v})` : 'inherit';
      default: return String(v);
    }
  };
  const FIELD_PROP = { fam: 'font-family', w: 'font-weight', size: 'font-size', lh: 'line-height', ls: 'letter-spacing', color: 'color' };

  function buildPrompt() {
    if (!changeCount()) return 'No tweaks yet. Change something in the panel first.';
    const L = ['Update style.css with these design tweaks from my dev tweak panel. Edit the existing tokens and rules in place (don\'t append override rules), keep the clamp() pattern where a value uses one, and keep any related rules (hover states, mobile media queries, contextual variants) consistent.', 'Type styles are driven by the type-scale tokens in :root (Display + Display S + Lede, H1–H5, Number L/M, 1 callout, 6 body styles: --size-*, --text-*, --leading-*, --track-*): change the listed token rather than the rule. Some tokens are shared by several styles; if only this style should change, give it its own token or value instead.', ''];
    const toks = Object.keys(state.tok).filter(tokChanged);
    const lay = CONTROLS.filter(x => x.token && ctlChanged(x));
    if (toks.length || lay.length) {
      L.push('## Tokens (:root)');
      toks.forEach(t => L.push(`- ${t}: ${rootDef[t]} → ${state.tok[t]}`));
      lay.forEach(x => L.push(`- ${x.id} (${x.label}): ${fmtSize(ctlDef(x))} → ${fmtSize(ctlCur(x))}`));
      L.push('');
    }
    const types = TYPE.filter(e => typeChanged(e).length);
    if (types.length) {
      L.push('## Type styles');
      types.forEach(e => {
        L.push(`- ${e.name} (${e.role}): ${e.sel.join(', ')}${e.tok ? ` · tokens: ${e.tok.join(', ')}` : ''}`);
        const d = typeDef(e), v = typeCur(e);
        typeChanged(e).forEach(f => L.push(`  - ${FIELD_PROP[f]}: ${fmtField(f, d[f])} → ${fmtField(f, v[f])}`));
      });
      L.push('');
    }
    const ctls = CONTROLS.filter(x => !x.token && ctlChanged(x));
    if (ctls.length) {
      L.push('## Shape & spacing');
      ctls.forEach(x => L.push(`- ${x.label} (${x.sel ? `${x.sel.join(', ')} ${x.prop}` : x.note}): ${ctlDef(x)}px → ${ctlCur(x)}px`));
      L.push('');
    }
    L.push('Equivalent override CSS, for reference:', '```css', buildCSS(), '```');
    return L.join('\n');
  }

  function buildScale() {
    const L = ['Portfolio type scale (current values)', '', '| Style | Role | Font | Weight | Size | Line height | Tracking | Color | Selectors |', '|---|---|---|---|---|---|---|---|---|'];
    TYPE.forEach(e => {
      const v = typeCur(e);
      L.push(`| ${e.name} | ${e.role} | ${famName(v.fam)} | ${v.w} | ${fmtSize(v.size)} | ${v.lh ?? 'normal'} | ${v.ls == null ? 'normal' : v.ls + 'em'} | ${v.color || 'inherit'} | ${e.sel.join(', ')} |`);
    });
    return L.join('\n');
  }

  /* ---------------- Apply ---------------- */
  const styleEl = document.createElement('style');
  styleEl.id = 'tweak-overrides';
  document.head.appendChild(styleEl);
  const apply = () => { styleEl.textContent = buildCSS(); };

  function commit() {
    save(KEY, state);
    apply();
    refresh();
  }

  /* ---------------- UI ---------------- */
  const host = document.createElement('div');
  host.id = 'tweaks-host';
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `<style>${PANEL_CSS()}</style>
    <button class="fab" data-act="toggle-panel" title="Toggle tweaks ( \` )">Tweaks <b class="count"></b></button>
    <div class="guide" hidden></div>
    <aside class="panel" hidden>
      <header>
        <strong>Style tweaks</strong><span class="dev">dev only</span>
        <button class="icon" data-act="toggle-panel" title="Close ( \` )">✕</button>
      </header>
      <nav class="tabs">
        ${[['type', 'Type'], ['color', 'Color'], ['shape', 'Shape'], ['spacing', 'Spacing'], ['export', 'Copy']].map(([k, l]) => `<button data-tab="${k}">${l}</button>`).join('')}
      </nav>
      <div class="body"></div>
      <footer>
        <span class="changes"></span>
        <button class="ghost" data-act="reset-all">Reset all</button>
        <button class="primary" data-act="copy-prompt">Copy for prompt</button>
      </footer>
    </aside>
    <div class="toast" hidden></div>`;
  const $ = s => shadow.querySelector(s);
  const $$ = s => [...shadow.querySelectorAll(s)];
  const panel = $('.panel'), body = $('.body'), guide = $('.guide');

  /* ----- control markup ----- */
  const numField = (attrs, value, opts = {}) =>
    `<input type="number" ${attrs} value="${value ?? ''}" step="${opts.step ?? 1}" ${opts.min != null ? `min="${opts.min}"` : ''} ${opts.ph ? `placeholder="${opts.ph}"` : ''}>`;
  const range = (attrs, value, min, max, step) =>
    `<input type="range" ${attrs} min="${min}" max="${max}" step="${step}" value="${value ?? min}">`;

  function sizeControls(attr, s, maxRange = 160) {
    const big = s.px != null ? s.px : s.max;
    const fields = s.px != null
      ? `<span class="trio">${numField(`${attr}="size.px"`, s.px, { step: 0.5, min: 0 })}<em>px</em></span>`
      : `<span class="trio">${numField(`${attr}="size.min"`, s.min, { step: 1, min: 0 })}<em>min</em>${numField(`${attr}="size.vw"`, s.vw, { step: 0.1, min: 0 })}<em>vw</em>${numField(`${attr}="size.max"`, s.max, { step: 1, min: 0 })}<em>max</em></span>`;
    return `${range(`${attr}="size.scale"`, big, 0, maxRange, 1)}${fields}`;
  }

  function typeItem(e) {
    const v = typeCur(e);
    const famOpts = [...Object.keys(FAM_LABEL).map(k => [k, FAM_LABEL[k]]), ...FONT_CHOICES.map(f => [f, f.split(',')[0].replace(/'/g, '')])];
    if (!famOpts.some(o => o[0] === v.fam)) famOpts.push([v.fam, v.fam]);
    const open = expanded.has(e.id);
    return `<div class="item" data-type="${e.id}">
      <button class="item-head" data-act="expand"><i class="dot"></i><span class="nm">${esc(e.name)}</span><span class="sum">${esc(typeSummary(e))}</span><span class="chev">${open ? '▾' : '▸'}</span></button>
      <div class="item-body" ${open ? '' : 'hidden'}>
        <div class="row"><label>Font</label><select data-f="fam">${famOpts.map(([val, l]) => `<option value="${esc(val)}" ${val === v.fam ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></div>
        <div class="row"><label>Weight</label><select data-f="w">${[300, 400, 500, 600, 700, 800, 900].map(w => `<option ${w === v.w ? 'selected' : ''}>${w}</option>`).join('')}</select></div>
        <div class="row"><label>Size</label><div class="stack">${sizeControls('data-f', v.size)}<span class="hint" data-now></span></div></div>
        <div class="row"><label>Line height</label>${range('data-f="lh"', v.lh ?? 1.2, 0.8, 2.2, 0.01)}${numField('data-f="lh"', v.lh, { step: 0.01, ph: 'normal' })}</div>
        <div class="row"><label>Tracking</label>${range('data-f="ls"', v.ls ?? 0, -0.08, 0.2, 0.005)}${numField('data-f="ls"', v.ls, { step: 0.005, ph: 'normal' })}<em>em</em></div>
        <div class="row"><label>Color</label><select data-f="color"><option value="">inherit</option>${FG_TOKENS.map(t => `<option ${t === v.color ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
        <div class="sels">${esc(e.sel.join(', '))}${e.tok ? `<br>${esc(e.tok.join(' · '))}` : ''}</div>
        <div class="item-actions"><button class="ghost sm" data-act="reset-type">Reset ${esc(e.name)}</button></div>
      </div>
    </div>`;
  }
  const typeSummary = e => { const v = typeCur(e); return `${v.w} · ${fmtSize(v.size).replace('clamp', '')}`; };

  function ctlItem(x) {
    const v = ctlCur(x);
    const desc = x.token ? x.id : x.sel ? `${x.sel.join(', ')} · ${x.prop}` : x.note;
    const inner = v && typeof v === 'object'
      ? `<div class="stack">${sizeControls('data-c', v, x.max || 200)}</div>`
      : `${range('data-c="v"', v, 0, x.max || 40, x.step || 1)}${numField('data-c="v"', v, { step: x.step || 1, min: 0 })}<em>px</em>`;
    return `<div class="item flat" data-ctl="${x.id}">
      <div class="row top"><label><i class="dot"></i>${esc(x.label)}</label><button class="ghost sm" data-act="reset-ctl" title="Reset">↺</button></div>
      <div class="row">${inner}</div>
      <div class="sels">${esc(desc)}</div>
    </div>`;
  }

  function colorRow(t) {
    const v = tokCur(t);
    return `<div class="crow" data-tok="${t}">
      <input type="color" value="${toHex(v)}"><code><i class="dot"></i>${t}</code>
      <input type="text" value="${esc(v)}" spellcheck="false">
      <button class="ghost sm" data-act="reset-tok" title="Reset to ${esc(rootDef[t])}">↺</button>
    </div>`;
  }

  function renderBody() {
    $$('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === ui.tab));
    let h = '';
    if (ui.tab === 'type') {
      h += `<div class="intro"><button class="primary wide" data-act="toggle-guide">${ui.guide ? 'Hide' : 'Open'} type style guide</button></div>`;
      h += `<h4>Font tokens</h4>`;
      h += FONT_TOKENS.map(([t, l]) => {
        const v = tokCur(t);
        const opts = FONT_CHOICES.includes(v) ? FONT_CHOICES : [v, ...FONT_CHOICES];
        return `<div class="crow font" data-tok="${t}"><code><i class="dot"></i>${l}</code><select>${opts.map(f => `<option value="${esc(f)}" ${f === v ? 'selected' : ''}>${esc(f)}</option>`).join('')}</select><button class="ghost sm" data-act="reset-tok">↺</button></div>`;
      }).join('');
      ['Headings', 'Numbers', 'Callout', 'Body', 'UI'].forEach(cat => {
        h += `<h4>${cat}</h4>` + TYPE.filter(e => e.cat === cat).map(typeItem).join('');
      });
    } else if (ui.tab === 'color') {
      h += COLOR_GROUPS.map(([g, toks]) => `<h4>${g}</h4>${toks.map(colorRow).join('')}`).join('');
    } else if (ui.tab === 'shape' || ui.tab === 'spacing') {
      const list = CONTROLS.filter(x => x.tab === ui.tab);
      [...new Set(list.map(x => x.group))].forEach(g => {
        h += `<h4>${g}</h4>` + list.filter(x => x.group === g).map(ctlItem).join('');
      });
    } else {
      h += `<p class="hint">Paste this into a prompt to have style.css updated. Only changed values are included.</p>
        <textarea class="out" readonly></textarea>
        <div class="btns"><button class="primary" data-act="copy-prompt">Copy for prompt</button><button class="ghost" data-act="copy-css">Copy CSS only</button><button class="ghost" data-act="copy-scale">Copy type scale</button></div>`;
    }
    body.innerHTML = h;
    refresh();
  }

  function refresh() {
    const n = changeCount();
    $('.count').textContent = n ? n : '';
    $('.changes').textContent = n ? `${n} change${n === 1 ? '' : 's'}` : 'No changes';
    $$('[data-type]').forEach(el => {
      const e = TYPE.find(t => t.id === el.dataset.type);
      el.classList.toggle('dirty', typeChanged(e).length > 0);
      el.querySelector('.sum').textContent = typeSummary(e);
      const now = el.querySelector('[data-now]');
      if (now) now.textContent = `≈ ${r2(sizeAt(typeCur(e).size, innerWidth))}px at this ${innerWidth}px viewport`;
    });
    $$('[data-ctl]').forEach(el => el.classList.toggle('dirty', ctlChanged(CONTROLS.find(x => x.id === el.dataset.ctl))));
    $$('[data-tok]').forEach(el => el.classList.toggle('dirty', tokChanged(el.dataset.tok)));
    const out = $('.out');
    if (out) out.value = buildPrompt();
    if (ui.guide) renderGuide();
  }

  /* ----- style guide ----- */
  const WIDTHS = [375, 768, 1280, 1440];
  function renderGuide() {
    guide.style.right = ui.open ? PANEL_W + 'px' : '0';
    const rows = ['Headings', 'Numbers', 'Callout', 'Body', 'UI'].map(cat => `<h3>${cat}</h3>` + TYPE.filter(e => e.cat === cat).map(e => {
      const v = typeCur(e);
      const style = [
        `font-family:${famCss(v.fam)}`, `font-weight:${v.w}`, `font-size:${fmtSize(v.size)}`,
        `line-height:${v.lh ?? 'normal'}`, `letter-spacing:${v.ls == null ? 'normal' : v.ls + 'em'}`,
        `color:${v.color ? `var(${v.color})` : 'var(--fg-primary)'}`, e.upper ? 'text-transform:uppercase' : '',
      ].filter(Boolean).join(';');
      const sizes = WIDTHS.map(w => `<span>${w}: <b>${r2(sizeAt(v.size, w))}</b></span>`).join('');
      return `<div class="g-row ${typeChanged(e).length ? 'dirty' : ''}" data-gid="${e.id}">
        <div class="g-meta">
          <button class="g-name" data-act="edit-type" title="Edit in panel"><i class="dot"></i>${esc(e.name)}</button>
          <div class="g-role">${esc(e.role)}</div>
          <div class="g-spec">${esc(famName(v.fam))} ${v.w}<br>${esc(fmtSize(v.size))} / ${v.lh ?? 'normal'}<br>tracking ${v.ls == null ? 'normal' : v.ls + 'em'} · ${esc(v.color || 'inherit')}</div>
          <div class="g-sizes">${sizes}</div>
          <code class="g-sel">${esc(e.sel.join(', '))}</code>
          ${e.tok ? `<code class="g-sel g-tok">${esc(e.tok.join(' · '))}</code>` : ''}
        </div>
        <div class="g-sample" contenteditable="plaintext-only" spellcheck="false" style="${esc(style)}">${esc(guideText[e.id] ?? e.sample)}</div>
      </div>`;
    }).join('')).join('');
    guide.innerHTML = `<div class="g-head">
        <div><strong>Type hierarchy</strong><span class="hint"> · ${TYPE.length} styles · live, includes your tweaks · sizes shown in px at ${WIDTHS.join(' / ')} viewports · click a sample to edit its text</span></div>
        <div class="btns"><button class="ghost" data-act="copy-scale">Copy type scale</button><button class="icon" data-act="toggle-guide" title="Close (Esc)">✕</button></div>
      </div>
      <div class="g-list">${rows}</div>`;
  }

  /* ----- open / close ----- */
  function sync() {
    panel.hidden = !ui.open;
    guide.hidden = !ui.guide;
    $('.fab').hidden = ui.open;
    save(UI_KEY, ui);
    if (ui.open) renderBody();
    if (ui.guide) { renderGuide(); document.documentElement.style.overflow = 'hidden'; }
    else document.documentElement.style.overflow = '';
  }

  const toast = msg => {
    const t = $('.toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast.t); toast.t = setTimeout(() => { t.hidden = true; }, 1800);
  };
  async function copy(text, label) {
    try { await navigator.clipboard.writeText(text); }
    catch (e) {
      const ta = document.createElement('textarea'); ta.value = text; shadow.appendChild(ta); ta.select();
      document.execCommand('copy'); ta.remove();
    }
    toast(`${label} copied`);
  }

  /* ----- events ----- */
  shadow.addEventListener('click', ev => {
    const tab = ev.target.closest('[data-tab]');
    if (tab) { ui.tab = tab.dataset.tab; save(UI_KEY, ui); renderBody(); body.scrollTop = 0; return; }
    const btn = ev.target.closest('[data-act]');
    if (!btn) return;
    const act = btn.dataset.act;
    const typeEl = btn.closest('[data-type]'), ctlEl = btn.closest('[data-ctl]'), tokEl = btn.closest('[data-tok]');
    if (act === 'toggle-panel') { ui.open = !ui.open; sync(); }
    else if (act === 'toggle-guide') { ui.guide = !ui.guide; sync(); }
    else if (act === 'expand') {
      const id = typeEl.dataset.type;
      expanded.has(id) ? expanded.delete(id) : expanded.add(id);
      typeEl.outerHTML = typeItem(TYPE.find(t => t.id === id)); refresh();
    }
    else if (act === 'edit-type') {
      const id = btn.closest('[data-gid]').dataset.gid;
      ui.open = true; ui.tab = 'type'; expanded.add(id); sync();
      const el = shadow.querySelector(`[data-type="${id}"]`);
      if (el) { el.scrollIntoView({ block: 'start' }); el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 900); }
    }
    else if (act === 'reset-type') { delete state.type[typeEl.dataset.type]; commit(); renderBody(); }
    else if (act === 'reset-ctl') { delete state.ctl[ctlEl.dataset.ctl]; commit(); renderBody(); }
    else if (act === 'reset-tok') { delete state.tok[tokEl.dataset.tok]; commit(); renderBody(); }
    else if (act === 'reset-all') {
      if (!changeCount() || confirm('Reset all tweaks back to style.css?')) { state.tok = {}; state.type = {}; state.ctl = {}; commit(); renderBody(); }
    }
    else if (act === 'copy-prompt') copy(buildPrompt(), 'Prompt');
    else if (act === 'copy-css') copy(buildCSS() || '/* no changes */', 'CSS');
    else if (act === 'copy-scale') copy(buildScale(), 'Type scale');
  });

  const num = v => (v === '' ? null : parseFloat(v));

  // Applies a size sub-field (min / vw / max / px / scale) to a size object.
  function nextSize(s, key, val) {
    const n = { ...s };
    if (val == null || isNaN(val)) return null;
    if (key === 'scale') {
      if (n.px != null) n.px = val;
      else { const k = n.max ? val / n.max : 1; n.min = Math.round(n.min * k); n.vw = r2(n.vw * k); n.max = val; }
    } else n[key] = key === 'vw' ? r2(val) : val;
    return n;
  }
  function syncSizeInputs(scope, attr, s) {
    scope.querySelectorAll(`[${attr}^="size."]`).forEach(i => {
      const k = i.getAttribute(attr).slice(5);
      if (document.activeElement === host && shadow.activeElement === i) return;
      i.value = k === 'scale' ? (s.px != null ? s.px : s.max) : s[k];
    });
  }

  shadow.addEventListener('input', ev => {
    const t = ev.target;
    const typeEl = t.closest('[data-type]'), ctlEl = t.closest('[data-ctl]'), tokEl = t.closest('[data-tok]');
    if (t.classList.contains('g-sample')) { guideText[t.closest('[data-gid]').dataset.gid] = t.textContent; return; }
    if (typeEl && t.dataset.f) {
      const id = typeEl.dataset.type, f = t.dataset.f, e = TYPE.find(x => x.id === id);
      if (f.startsWith('size.')) {
        const s = nextSize(typeCur(e).size, f.slice(5), num(t.value));
        if (!s) return;
        setType(id, 'size', s); syncSizeInputs(typeEl, 'data-f', s);
      } else if (f === 'fam' || f === 'color') setType(id, f, t.value || null);
      else if (f === 'w') setType(id, f, +t.value);
      else {
        const v = num(t.value);
        setType(id, f, v == null || isNaN(v) ? null : r3(v));
        typeEl.querySelectorAll(`[data-f="${f}"]`).forEach(i => { if (i !== t) i.value = v ?? (i.type === 'range' ? i.min : ''); });
      }
    } else if (ctlEl && t.dataset.c) {
      const x = CONTROLS.find(k => k.id === ctlEl.dataset.ctl), key = t.dataset.c, v = num(t.value);
      if (v == null || isNaN(v)) return;
      if (key.startsWith('size.')) {
        const s = nextSize(ctlCur(x), key.slice(5), v);
        setCtl(x.id, s); syncSizeInputs(ctlEl, 'data-c', s);
      } else {
        setCtl(x.id, v);
        ctlEl.querySelectorAll('[data-c="v"]').forEach(i => { if (i !== t) i.value = v; });
      }
    } else if (tokEl) {
      const tok = tokEl.dataset.tok;
      if (t.type === 'color') { setTok(tok, t.value); tokEl.querySelector('input[type=text]').value = t.value; }
      else if (t.tagName === 'SELECT') setTok(tok, t.value);
      else if (t.type === 'text' && CSS.supports('color', t.value)) { setTok(tok, t.value.trim()); tokEl.querySelector('input[type=color]').value = toHex(t.value); }
    }
  });
  shadow.addEventListener('change', ev => { if (ev.target.tagName === 'SELECT') ev.target.dispatchEvent(new Event('input', { bubbles: true })); });

  addEventListener('keydown', ev => {
    const path = ev.composedPath();
    const typing = path.some(n => n.tagName === 'INPUT' || n.tagName === 'TEXTAREA' || n.tagName === 'SELECT' || n.isContentEditable);
    if (ev.key === '`' && !typing && !ev.metaKey && !ev.ctrlKey) { ev.preventDefault(); ui.open = !ui.open; sync(); }
    else if (ev.key === 'Escape' && ui.guide) { ui.guide = false; sync(); }
  });
  addEventListener('resize', () => { if (ui.open || ui.guide) refresh(); });

  apply();
  document.body.appendChild(host);
  if (new URLSearchParams(location.search).has('styleguide')) ui.guide = true;
  sync();

  /* ---------------- Panel styles (inside the shadow root, isolated from style.css) ---------------- */
  function PANEL_CSS() {
    return `
    :host { all: initial; }
    * { box-sizing: border-box; }
    [hidden] { display: none !important; }
    button, input, select, textarea { font: inherit; color: inherit; }
    .panel, .fab, .guide, .toast { font: 13px/1.4 system-ui, -apple-system, 'Segoe UI', sans-serif; color: #1d2330; }
    .fab { position: fixed; left: 16px; bottom: 16px; z-index: 2147483600; display: flex; align-items: center; gap: 6px;
      padding: 8px 14px; border: 0; border-radius: 999px; background: #1d2330; color: #fff; font-weight: 600; cursor: pointer;
      box-shadow: 0 6px 20px rgba(0,0,0,.25); }
    .fab .count:not(:empty) { background: #d4ff3a; color: #1d2330; border-radius: 999px; padding: 0 7px; font-size: 11px; }
    .panel { position: fixed; top: 0; right: 0; bottom: 0; width: ${PANEL_W}px; max-width: 100vw; z-index: 2147483600; display: flex; flex-direction: column;
      background: #fff; border-left: 1px solid #dfe3ea; box-shadow: -10px 0 30px rgba(15,20,30,.12); }
    header { display: flex; align-items: center; gap: 8px; padding: 12px 14px; border-bottom: 1px solid #eceff4; }
    header strong { font-size: 14px; }
    .dev { font-size: 10px; text-transform: uppercase; letter-spacing: .06em; background: #f2ffc2; padding: 2px 6px; border-radius: 4px; }
    .icon { margin-left: auto; border: 0; background: none; cursor: pointer; font-size: 14px; padding: 4px 8px; border-radius: 6px; }
    .icon:hover { background: #f1f3f7; }
    .tabs { display: flex; gap: 2px; padding: 8px 10px 0; border-bottom: 1px solid #eceff4; }
    .tabs button { flex: 1; border: 0; background: none; padding: 8px 4px; cursor: pointer; border-bottom: 2px solid transparent; color: #5b6472; font-weight: 500; }
    .tabs button.on { color: #1d2330; border-bottom-color: #1d2330; font-weight: 600; }
    .body { flex: 1; overflow: auto; padding: 4px 14px 24px; overscroll-behavior: contain; }
    h4 { margin: 18px 0 8px; font-size: 11px; text-transform: uppercase; letter-spacing: .07em; color: #8a93a3; }
    .intro { margin-top: 12px; }
    footer { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-top: 1px solid #eceff4; background: #fafbfc; }
    .changes { margin-right: auto; color: #5b6472; font-size: 12px; }
    .primary, .ghost { border-radius: 7px; padding: 7px 12px; cursor: pointer; font-weight: 600; }
    .primary { background: #1d2330; color: #fff; border: 1px solid #1d2330; }
    .primary:hover { background: #2e3646; }
    .ghost { background: #fff; border: 1px solid #d6dbe3; }
    .ghost:hover { background: #f4f6f9; }
    .sm { padding: 3px 8px; font-size: 12px; font-weight: 500; }
    .wide { width: 100%; }
    .item { border: 1px solid #e6e9ef; border-radius: 9px; margin-bottom: 6px; background: #fff; transition: box-shadow .3s; }
    .item.flash { box-shadow: 0 0 0 3px #d4ff3a; }
    .item-head { all: unset; box-sizing: border-box; width: 100%; display: flex; align-items: center; gap: 8px; padding: 9px 10px; cursor: pointer; }
    .item-head:hover { background: #f7f8fa; border-radius: 9px; }
    .nm { font-weight: 600; }
    .sum { margin-left: auto; color: #8a93a3; font: 11px ui-monospace, Menlo, monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 170px; }
    .chev { color: #8a93a3; width: 10px; }
    .item-body { padding: 4px 10px 10px; border-top: 1px solid #f0f2f5; }
    .item.flat { padding: 8px 10px; }
    .row { display: flex; align-items: center; gap: 8px; margin: 7px 0; }
    .row.top { margin: 0 0 2px; justify-content: space-between; }
    .row > label { width: 76px; flex: none; color: #5b6472; font-size: 12px; display: flex; align-items: center; gap: 6px; }
    .row.top > label { width: auto; color: #1d2330; font-weight: 600; font-size: 13px; }
    .stack { flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
    .trio { display: flex; align-items: center; gap: 4px; }
    .trio input { width: 54px; }
    em { font-style: normal; color: #8a93a3; font-size: 11px; }
    input[type=range] { flex: 1; min-width: 0; accent-color: #1d2330; }
    input[type=number], input[type=text], select { border: 1px solid #d6dbe3; border-radius: 6px; padding: 4px 6px; background: #fff; min-width: 0; }
    input[type=number] { width: 64px; }
    select { flex: 1; }
    .hint { color: #8a93a3; font-size: 11px; }
    .sels { margin-top: 6px; color: #8a93a3; font: 11px/1.45 ui-monospace, Menlo, monospace; word-break: break-word; }
    .item-actions { margin-top: 8px; text-align: right; }
    .dot { width: 7px; height: 7px; border-radius: 50%; flex: none; background: transparent; display: inline-block; }
    .dirty .dot, .dirty > .row .dot, .dirty code .dot { background: #e8590c; }
    .crow { display: flex; align-items: center; gap: 8px; padding: 5px 0; border-bottom: 1px solid #f2f4f7; }
    .crow input[type=color] { width: 34px; height: 26px; padding: 0; border: 1px solid #d6dbe3; border-radius: 6px; background: none; cursor: pointer; flex: none; }
    .crow code { flex: 1; font: 11.5px ui-monospace, Menlo, monospace; display: flex; align-items: center; gap: 6px; min-width: 0; }
    .crow input[type=text] { width: 120px; font: 11.5px ui-monospace, Menlo, monospace; }
    .crow.font code { flex: none; width: 110px; font-family: inherit; font-size: 12px; }
    .out { width: 100%; height: calc(100vh - 290px); min-height: 200px; resize: vertical; border: 1px solid #d6dbe3; border-radius: 8px; padding: 10px; font: 11.5px/1.5 ui-monospace, Menlo, monospace; background: #fafbfc; }
    .btns { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; align-items: center; }
    .toast { position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%); z-index: 2147483647; background: #1d2330; color: #fff; padding: 8px 14px; border-radius: 8px; font-weight: 600; box-shadow: 0 8px 24px rgba(0,0,0,.25); }
    .guide { position: fixed; top: 0; left: 0; bottom: 0; right: 0; z-index: 2147483500; background: var(--bg-page, #fcfdfe); overflow: auto; }
    .g-head { position: sticky; top: 0; z-index: 1; display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 14px 28px; background: rgba(255,255,255,.92); backdrop-filter: blur(8px); border-bottom: 1px solid #e6e9ef; }
    .g-head strong { font-size: 15px; }
    .g-head .btns { margin: 0; flex: none; }
    .g-head .icon { margin-left: 0; }
    .g-list { padding: 8px 28px 80px; }
    .g-list h3 { margin: 36px 0 4px; font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: #8a93a3; }
    .g-row { display: grid; grid-template-columns: 240px 1fr; gap: 28px; align-items: start; padding: 22px 0; border-top: 1px solid #eceff4; }
    .g-name { all: unset; cursor: pointer; font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 6px; }
    .g-name:hover { text-decoration: underline; }
    .g-role { color: #5b6472; margin: 2px 0 8px; }
    .g-spec { font: 11.5px/1.55 ui-monospace, Menlo, monospace; color: #1d2330; }
    .g-sizes { display: flex; flex-wrap: wrap; gap: 4px 10px; margin: 8px 0; font: 11px ui-monospace, Menlo, monospace; color: #8a93a3; }
    .g-sizes b { color: #1d2330; font-weight: 600; }
    .g-sel.g-tok { margin-top: 4px; color: #5b6472; }
    .g-sel { display: block; font: 10.5px/1.45 ui-monospace, Menlo, monospace; color: #8a93a3; word-break: break-word; }
    .g-sample { min-width: 0; overflow-wrap: break-word; outline: none; border-radius: 4px; }
    .g-sample:focus { box-shadow: 0 0 0 2px #d4ff3a; }
    @media (max-width: 760px) { .g-row { grid-template-columns: 1fr; gap: 10px; } .g-list, .g-head { padding-left: 16px; padding-right: 16px; } }
    `;
  }
})();
