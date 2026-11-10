/* Portfolio scripts: home page + case study pages (ported from the Claude Design mockups).
   One file. Shared helpers come first (scroll reveal, pointer glow, copy email); the page-specific
   code below only starts when that page's elements exist. No dependencies. */
(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================= Shared ================= */

  /* Fade/slide elements in once they scroll into view (adds .in; styles live in style.css) */
  function revealOnScroll(els, opts) {
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('in')); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, Object.assign({ threshold: 0.12, rootMargin: '0px 0px -6% 0px' }, opts));
    els.forEach(el => io.observe(el));
    // safety net so nothing already on screen stays hidden if the observer never fires
    setTimeout(() => els.forEach(el => { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in'); }), 1500);
  }

  /* Rainbow grid glow that follows the pointer inside `area` (CSS reveals it on :hover) */
  function trackGlow(area, glow) {
    if (!area || !glow) return;
    area.addEventListener('pointermove', e => {
      const r = area.getBoundingClientRect();
      glow.style.setProperty('--gx', Math.round(e.clientX - r.left) + 'px');
      glow.style.setProperty('--gy', Math.round(e.clientY - r.top) + 'px');
    });
  }

  /* Copy-email button in the footer (identical on every page) */
  function initCopyEmail() {
    const btn = $('#copy-email');
    if (!btn) return;
    const email = btn.dataset.email || 'andrewy_99@hotmail.com';
    let timer;
    btn.addEventListener('click', e => {
      try { navigator.clipboard.writeText(email).catch(() => {}); } catch (err) {}
      btn.textContent = 'Copied ✓';
      clearTimeout(timer);
      timer = setTimeout(() => { btn.textContent = 'Copy email'; }, 1800);
      if (!reduceMotion) heartEyeBurst(btn, e);
    });
  }

  /* Heart-eye emoji eruption from the cursor, volcano style */
  function heartEyeBurst(btn, ev) {
    const r = btn.getBoundingClientRect();
    const fromPointer = ev && (ev.clientX || ev.clientY);
    const cx = fromPointer ? ev.clientX : r.left + r.width / 2;
    const cy = fromPointer ? ev.clientY : r.top + r.height / 2;
    const layer = document.createElement('div');
    layer.setAttribute('aria-hidden', 'true');
    layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:200;overflow:hidden';
    document.body.appendChild(layer);
    const N = 32, G = 1500; /* gravity px/s^2 */
    let done = 0;
    for (let i = 0; i < N; i++) {
      const el = document.createElement('span');
      el.textContent = '😍';
      const size = 20 + Math.random() * 26;
      el.style.cssText = 'position:absolute;left:' + cx + 'px;top:' + cy + 'px;line-height:1;will-change:transform,opacity;font-size:' + size + 'px';
      layer.appendChild(el);
      /* narrow upward cone (about ±38° from vertical), varied speed */
      const a = (Math.random() - 0.5) * 1.3;
      const v = 650 + Math.random() * 650;
      const vx = Math.sin(a) * v, vy = -Math.cos(a) * v;
      const dur = 1100 + Math.random() * 700, T = dur / 1000;
      const rot = (Math.random() - 0.5) * 720;
      const frames = [];
      for (let k = 0; k <= 12; k++) {
        const f = k / 12, t = f * T;
        const x = vx * t, y = vy * t + 0.5 * G * t * t;
        frames.push({
          transform: 'translate(calc(-50% + ' + x.toFixed(1) + 'px),calc(-50% + ' + y.toFixed(1) + 'px)) scale(' + (0.3 + 0.8 * Math.min(1, f * 5)).toFixed(2) + ') rotate(' + (rot * f).toFixed(0) + 'deg)',
          opacity: f < 0.7 ? 1 : 1 - (f - 0.7) / 0.3,
          offset: f
        });
      }
      const anim = el.animate(frames, { duration: dur, easing: 'linear', fill: 'forwards', delay: Math.random() * 120 });
      anim.onfinish = () => { if (++done === N) layer.remove(); };
    }
  }

  /* ================= Home page ================= */
  function initHome() {
  const G = 32; // grid cell size
  const hero = document.getElementById('hero');
  const cv = document.getElementById('hero-canvas');
  if (!hero || !cv) return;

  /* ---------- Hero grid ---------- */
  const st = {
    W: 0, H: 0, dpr: 1,
    m: null,                       // pointer position (local to hero)
    c: { x: 0, y: 0, a: 0 },       // eased cursor + spotlight alpha
    rip: [], last: null, vis: true, sound: false, off: null
  };

  function resize() {
    const r = hero.getBoundingClientRect();
    st.dpr = Math.min(2, window.devicePixelRatio || 1);
    st.W = r.width; st.H = r.height;
    cv.width = Math.round(r.width * st.dpr);
    cv.height = Math.round(r.height * st.dpr);
    st.off = document.createElement('canvas');
    st.off.width = cv.width; st.off.height = cv.height;
  }

  const cols = () => Math.max(2, Math.ceil((st.W || 1280) / G));
  const hueAt = x => (Math.floor(x / G) / (cols() - 1)) * 290;
  function noteAt(x) {
    const SC = [0, 2, 4, 7, 9];
    const step = Math.min(14, Math.floor((Math.floor(x / G) / cols()) * 15));
    return 261.63 * Math.pow(2, (SC[step % 5] + 12 * Math.floor(step / 5)) / 12);
  }
  const local = e => { const r = hero.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };

  function draw(t) {
    if (!st.W) return;
    const { W, H, dpr, m, c } = st, ctx = cv.getContext('2d');
    if (m) { c.x += (m.x - c.x) * 0.2; c.y += (m.y - c.y) * 0.2; c.a += (1 - c.a) * 0.08; }
    else c.a += (0 - c.a) * 0.05;

    if (m && (!st.last || Math.hypot(m.x - st.last.x, m.y - st.last.y) > 45)) {
      st.rip.push({ x: m.x, y: m.y, b: t, a: 1, h: hueAt(m.x) });
      st.last = { x: m.x, y: m.y };
    }
    if (audio.humOn && performance.now() - (st.lastMv || 0) > 270) hum(false);
    if (!m) st.last = null;
    st.rip = st.rip.filter(r => t - r.b < 1.6);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#F7F9FC'; ctx.fillRect(0, 0, W, H);

    const path = new Path2D();
    for (let x = 0.5; x <= W; x += G) { path.moveTo(x, 0); path.lineTo(x, H); }
    for (let y = 0.5; y <= H; y += G) { path.moveTo(0, y); path.lineTo(W, y); }
    ctx.strokeStyle = 'oklch(0.95 0.0135 245)'; ctx.lineWidth = 1; ctx.stroke(path);

    if (st.rip.length || m) {
      const cx0 = m ? Math.floor(m.x / G) * G : -1, cy0 = m ? Math.floor(m.y / G) * G : -1;
      for (let gy = 0; gy < H; gy += G) for (let gx = 0; gx < W; gx += G) {
        const cx = gx + G / 2, cy = gy + G / 2; let v = 0, hue = 0;
        for (const r of st.rip) {
          const age = t - r.b, rad = age * 320, d = Math.hypot(cx - r.x, cy - r.y), dd = Math.abs(d - rad);
          if (dd < 32) { const vv = (1 - dd / 32) * (1 - age / 1.6) * r.a; if (vv > v) { v = vv; hue = (r.h + d * 0.85) % 360; } }
        }
        if (gx === cx0 && gy === cy0) { v = Math.max(v, 0.9); hue = hueAt(gx + 1); }
        if (v > 0.03) { ctx.fillStyle = `hsla(${hue.toFixed(0)}, 78%, 72%, ${(v * 0.55).toFixed(3)})`; ctx.fillRect(gx + 1.5, gy + 1.5, G - 2, G - 2); }
      }
    }

    if (c.a > 0.01 && st.off) {
      const oc = st.off.getContext('2d');
      oc.globalCompositeOperation = 'source-over'; oc.setTransform(1, 0, 0, 1, 0, 0);
      oc.clearRect(0, 0, st.off.width, st.off.height); oc.setTransform(dpr, 0, 0, dpr, 0, 0);
      const g = oc.createRadialGradient(c.x, c.y, 0, c.x, c.y, 150), h0 = hueAt(c.x);
      for (let i = 0; i <= 5; i++) g.addColorStop(i / 5, `hsl(${((h0 + i * 60) % 360).toFixed(0)}, 72%, 66%)`);
      oc.strokeStyle = g; oc.lineWidth = 1.8; oc.stroke(path);
      oc.globalCompositeOperation = 'destination-in';
      const rg = oc.createRadialGradient(c.x, c.y, 0, c.x, c.y, 150);
      rg.addColorStop(0, 'rgba(0,0,0,1)'); rg.addColorStop(0.4, 'rgba(0,0,0,0.45)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
      oc.fillStyle = rg; oc.fillRect(0, 0, W, H);
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = c.a * 0.9; ctx.drawImage(st.off, 0, 0); ctx.globalAlpha = 1;
    }
  }

  /* ---------- Sound (off by default; toggled from the nav) ---------- */
  const audio = { ac: null, humOn: false };

  function initAudio() {
    if (audio.ac) { if (audio.ac.state === 'suspended') audio.ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    const ac = audio.ac = new AC();
    const len = Math.floor(ac.sampleRate * 3.2), ir = ac.createBuffer(2, len, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    const verb = ac.createConvolver(); verb.buffer = ir;
    const wet = ac.createGain(); wet.gain.value = 0.85;
    const dry = ac.createGain(); dry.gain.value = 0.25;
    audio.master = ac.createGain(); audio.master.gain.value = 0.9;
    audio.master.connect(dry); audio.master.connect(verb); verb.connect(wet); dry.connect(ac.destination); wet.connect(ac.destination);

    audio.padF = ac.createBiquadFilter(); audio.padF.type = 'lowpass'; audio.padF.frequency.value = 900; audio.padF.Q.value = 0.4;
    audio.padG = ac.createGain(); audio.padG.gain.value = 0;
    audio.padF.connect(audio.padG); audio.padG.connect(audio.master);
    [261.63, 392.0, 493.88, 587.33, 659.25].forEach((fr, i) => [0, 1].forEach(k => {
      const o = ac.createOscillator(); o.type = k ? 'triangle' : 'sine'; o.frequency.value = fr; o.detune.value = k ? 7 : -5;
      const g = ac.createGain(); g.gain.value = (k ? 0.05 : 0.09) / (1 + i * 0.25);
      const l = ac.createOscillator(); l.frequency.value = 0.07 + i * 0.031 + k * 0.02;
      const lg = ac.createGain(); lg.gain.value = g.gain.value * 0.6; l.connect(lg); lg.connect(g.gain); l.start();
      o.connect(g); g.connect(audio.padF); o.start();
    }));
  }

  function hum(on) {
    const ac = audio.ac; if (!ac || !audio.padG) return;
    const t = ac.currentTime, live = on && st.sound;
    if (live === audio.humOn && !live) return;
    audio.humOn = live;
    audio.padG.gain.setTargetAtTime(live ? 0.14 : 0, t, live ? 0.35 : 0.68);
    if (live && st.m) audio.padF.frequency.setTargetAtTime(500 + (st.m.x / (st.W || 1)) * 2200, t, 0.5);
  }

  const pan = x => Math.max(-0.8, Math.min(0.8, (x / (st.W || 1280)) * 1.6 - 0.8));

  function swish(x) {
    const ac = audio.ac; if (!ac || !st.sound) return;
    const now = performance.now(); if (now - (audio.lastSwish || 0) < 120) return; audio.lastSwish = now;
    const t = ac.currentTime, f0 = noteAt(x) * 2;
    const o = ac.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(f0 * 1.9, t); o.frequency.exponentialRampToValueAtTime(f0, t + 0.07);
    const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
    o.connect(g);
    if (ac.createStereoPanner) { const p = ac.createStereoPanner(); p.pan.value = pan(x); g.connect(p); p.connect(audio.master); } else g.connect(audio.master);
    o.start(t); o.stop(t + 0.35);
  }

  function swell(x) {
    const ac = audio.ac; if (!ac || !st.sound) return;
    const t = ac.currentTime, base = noteAt(x) * 2;
    [1, 1.5, 2].forEach((m, i) => {
      const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = base * m;
      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05 / (i + 1), t + 0.35); g.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
      o.connect(g); g.connect(audio.master); o.start(t); o.stop(t + 3.3);
    });
  }

  /* ---------- Hero events ---------- */
  hero.addEventListener('pointermove', e => {
    const p = local(e), now = performance.now();
    st.lastMv = now; st.m = p;
    if (st.sound) {
      hum(true);
      const col = Math.floor(p.x / G);
      if (col !== st.lastCol && now - (st.lastSwell || 0) > 220) { st.lastCol = col; st.lastSwell = now; swell(p.x); }
    }
  });
  hero.addEventListener('pointerleave', () => { st.m = null; st.lastCol = null; hum(false); });
  hero.addEventListener('pointerdown', e => {
    if (e.target.closest('a, button, .nav-links, .menu-backdrop')) return;
    const p = local(e);
    st.rip.push({ ...p, b: performance.now() / 1000, a: 1.4, h: hueAt(p.x) });
    if (st.sound) { initAudio(); audio.lastSwish = 0; swish(p.x); }
  });

  const soundBtn = document.getElementById('sound-toggle');
  const soundLabel = document.getElementById('sound-label');
  const soundWave = document.getElementById('sound-wave');
  soundBtn.addEventListener('click', () => {
    st.sound = !st.sound;
    if (st.sound) initAudio();
    else { hum(false); if (audio.ac) setTimeout(() => audio.ac && !st.sound && audio.ac.suspend(), 600); }
    const label = st.sound ? 'Turn grid sound off' : 'Turn grid sound on';
    soundBtn.classList.toggle('is-on', st.sound);
    soundBtn.setAttribute('aria-label', label); soundBtn.title = label;
    soundLabel.textContent = st.sound ? 'Sound on' : 'Sound off';
    soundWave.setAttribute('d', st.sound ? 'M16.5 8.5 a5 5 0 0 1 0 7 M19 6 a8.5 8.5 0 0 1 0 12' : 'M17 9 L22 15 M22 9 L17 15');
  });

  /* ---------- Mobile menu (slides in from the right) ---------- */
  const menuBtn = document.getElementById('menu-btn');
  const menuClose = document.getElementById('menu-close');
  const menuPanel = document.getElementById('nav-links');
  const menuBackdrop = document.getElementById('menu-backdrop');
  const mobileMq = window.matchMedia('(max-width: 720px)');

  function setMenu(open) {
    menuPanel.classList.toggle('is-open', open);
    menuBackdrop.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    (open ? menuClose : menuBtn).focus({ preventScroll: true });
  }
  menuBtn.addEventListener('click', () => setMenu(true));
  menuClose.addEventListener('click', () => setMenu(false));
  menuBackdrop.addEventListener('click', () => setMenu(false));
  menuPanel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menuPanel.classList.contains('is-open')) setMenu(false); });
  mobileMq.addEventListener('change', () => {
    if (!mobileMq.matches && menuPanel.classList.contains('is-open')) setMenu(false);
  });

  /* ---------- Animation loop ---------- */
  new ResizeObserver(resize).observe(hero);
  new IntersectionObserver(es => { st.vis = es[0].isIntersecting; }).observe(hero);
  resize();
  if (reduceMotion) {
    draw(0);
  } else {
    const loop = ts => { requestAnimationFrame(loop); if (st.vis) draw(ts / 1000); };
    requestAnimationFrame(loop);
  }

    /* Rainbow grid glow on each case image + scroll reveals */
    $$('.case-media').forEach(media => trackGlow(media, $('.case-glow', media)));
    revealOnScroll($$('.reveal'));
  }

  /* ================= Case study pages ================= */
  function initCase() {
    /* Pin the opening content by its bottom edge so the prototype section scrolls over it */
    (function () {
      const under = $('#under');
      if (!under) return;
      const fit = () => { under.style.top = Math.min(0, window.innerHeight - under.offsetHeight) + 'px'; };
      fit();
      window.addEventListener('resize', fit);
      window.addEventListener('load', fit);
      if ('ResizeObserver' in window) new ResizeObserver(fit).observe(under);
    })();

    /* Floating close (X) + back-to-top controls */
    (function () {
      const closeEl = $('#case-close'), topEl = $('#case-top'), pagerEl = $('#case-pager');
      if (!closeEl || !topEl) return;
      let last = window.scrollY, idle = null;
      const stage = $('.proto__stage');
      let hovering = false, focused = false;
      const overlaps = () => {
        if (!stage) return false;
        const r = stage.getBoundingClientRect();
        return r.top < 96 && r.bottom > 0;       /* prototype is behind the top controls */
      };
      const blocked = () => hovering || focused || overlaps();
      const away = (el, on) => {
        if (el === closeEl) {
          const v = on || blocked();               /* never show the X / arrows over the prototype */
          el.classList.toggle('is-away', v);
          if (pagerEl) pagerEl.classList.toggle('is-away', v);
        } else el.classList.toggle('is-away', on);
      };
      const settle = () => { away(closeEl, false); };
      away(closeEl, false);
      if (stage) {
        stage.addEventListener('pointerenter', () => { hovering = true; away(closeEl, true); });
        stage.addEventListener('pointerleave', () => { hovering = false; clearTimeout(idle); idle = setTimeout(settle, 450); });
        /* clicks inside the iframe do not bubble, but the window loses focus to it */
        window.addEventListener('blur', () => {
          setTimeout(() => {
            focused = !!document.activeElement && document.activeElement.tagName === 'IFRAME' && stage.contains(document.activeElement);
            if (focused) away(closeEl, true);
          }, 0);
        });
        window.addEventListener('focus', () => {
          focused = false;
          clearTimeout(idle); idle = setTimeout(settle, 450);
        });
      }
      $('.x-btn', topEl).addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
      window.addEventListener('scroll', () => {
        const y = window.scrollY, dy = y - last;
        last = y;
        clearTimeout(idle);
        if (y < 40) { away(closeEl, false); away(topEl, true); return; }
        if (dy > 2) {            /* scrolling down: wipe away quickly */
          away(closeEl, true); away(topEl, true);
        } else if (dy < -2) {    /* scrolling up: always show both */
          away(closeEl, false); away(topEl, false);
        }
        /* whenever scrolling goes quiet (incl. tiny momentum tail events), bring the X and arrows back */
        idle = setTimeout(settle, 450);
      }, { passive: true });
    })();

    /* Rainbow grid glow on every gridded panel (same effect as the homepage cards) */
    $$('.grid-bg').forEach(panel => {
      const g = document.createElement('div');
      g.className = 'grid-glow';
      g.setAttribute('aria-hidden', 'true');
      panel.insertBefore(g, panel.firstChild);
      trackGlow(panel, g);
    });

    /* Header grid glow */
    const head = $('.case-head');
    if (head) trackGlow(head, $('.glow', head));

    /* Scroll reveal: fade in anything below the fold, and draw the highlighter marks */
    if (!reduceMotion && 'IntersectionObserver' in window) {
      const vh = window.innerHeight;
      const items = [];
      /* reveal each block on its own (text block, big image figure) rather than a whole chapter at once */
      const blocks = [];
      $$('main section').forEach(sec => [...sec.children].forEach(el => {
        if (el.classList.contains('ch')) blocks.push(...el.children); else blocks.push(el);
      }));
      blocks.forEach(el => { if (el.getBoundingClientRect().top > vh * 0.9) items.push(el); });
      items.forEach(el => el.classList.add('reveal'));
      const marks = $$('.mark').filter(m => m.getBoundingClientRect().top > vh * 0.85);
      marks.forEach(m => m.classList.add('pre'));
      revealOnScroll(items, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
      revealOnScroll(marks, { threshold: 1, rootMargin: '0px 0px -30% 0px' });
    }

    /* ---------- Scroll lock (modals) ---------- */
    let locked = false, savedY = 0;
    function lockScroll(on) {
      if (on === locked) return;
      locked = on;
      const b = document.body;
      if (on) {
        savedY = scrollY;
        b.style.top = -savedY + 'px';
        b.classList.add('locked');
      } else {
        b.classList.remove('locked');
        b.style.top = '';
        scrollTo(0, savedY);
      }
    }

    /* ---------- Image lightbox ---------- */
    const lb = $('#lightbox');
    if (lb) {
      const stage = $('.lb-stage', lb), img = $('.lb-img', lb), pct = $('.lb-pct', lb);
      let v = { z: 1, x: 0, y: 0 }, drag = null, opener = null;
      const apply = anim => {
        img.style.transition = anim ? 'transform .25s cubic-bezier(.3,.7,.2,1)' : 'none';
        img.style.transform = `translate(${v.x}px, ${v.y}px) scale(${v.z})`;
        pct.textContent = Math.round(v.z * 100) + '%';
        stage.style.cursor = drag && drag.moved ? 'grabbing' : v.z > 1 ? 'grab' : 'zoom-in';
      };
      const clamp = (z, x, y) => {
        if (z <= 1) return { z: Math.max(1, z), x: 0, y: 0 };
        const mx = stage.clientWidth * (z - 1) / 2, my = stage.clientHeight * (z - 1) / 2;
        return { z, x: Math.max(-mx, Math.min(mx, x)), y: Math.max(-my, Math.min(my, y)) };
      };
      const zoomTo = (z2, px, py, anim) => {
        z2 = Math.max(1, Math.min(5, z2));
        const r = stage.getBoundingClientRect();
        const cx = px == null ? 0 : px - r.left - r.width / 2, cy = py == null ? 0 : py - r.top - r.height / 2;
        v = clamp(z2, cx - (cx - v.x) * (z2 / v.z), cy - (cy - v.y) * (z2 / v.z));
        apply(anim);
      };
      const close = () => {
        lb.hidden = true;
        removeEventListener('keydown', onKey);
        lockScroll(false);
        if (opener) opener.focus();
      };
      const onKey = e => { if (e.key === 'Escape') close(); };
      window.openLightbox = (src, alt, from) => {
        opener = from || null;
        img.style.backgroundImage = `url("${src}")`;
        img.setAttribute('aria-label', alt || '');
        v = { z: 1, x: 0, y: 0 };
        lb.hidden = false;
        apply(false);
        addEventListener('keydown', onKey);
        lockScroll(true);
        $('.x-btn', lb).focus();
      };
      lb.addEventListener('click', close);
      $('.x-btn', lb).addEventListener('click', e => { e.stopPropagation(); close(); });
      $('.lb-zoom', lb).addEventListener('click', e => e.stopPropagation());
      $('.lb-in', lb).addEventListener('click', () => zoomTo(v.z * 1.5, null, null, true));
      $('.lb-out', lb).addEventListener('click', () => zoomTo(v.z / 1.5, null, null, true));
      $('.lb-pct', lb).addEventListener('click', () => zoomTo(1, null, null, true));
      stage.addEventListener('click', e => e.stopPropagation());
      stage.addEventListener('wheel', e => {
        e.preventDefault();
        zoomTo(v.z * Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0025)), e.clientX, e.clientY, false);
      }, { passive: false });
      stage.addEventListener('pointerdown', e => {
        drag = { sx: e.clientX, sy: e.clientY, x: v.x, y: v.y, moved: false };
        stage.setPointerCapture(e.pointerId);
      });
      stage.addEventListener('pointermove', e => {
        if (!drag) return;
        const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
        if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
        if (drag.moved && v.z > 1) { v = clamp(v.z, drag.x + dx, drag.y + dy); apply(false); }
      });
      const up = e => {
        const d = drag; drag = null;
        if (d && !d.moved && e.type === 'pointerup') {
          if (v.z > 1) zoomTo(1, null, null, true); else zoomTo(2.5, e.clientX, e.clientY, true);
        } else apply(false);
      };
      stage.addEventListener('pointerup', up);
      stage.addEventListener('pointercancel', up);

      $$('[data-zoom-src]').forEach(el => el.addEventListener('click', () =>
        window.openLightbox(el.dataset.zoomSrc, el.dataset.zoomAlt, el)));
    }

    /* ---------- Prototype viewer ---------- */
    const proto = $('.proto');
    if (proto) {
      const W = 1440, H = 900;
      const view = $('.laptop__view', proto), frame = $('iframe', view);
      const tabs = $$('.proto__tab', proto);
      let scale = 0.6;
      const fit = () => {
        scale = Math.min(1, view.parentElement.clientWidth * 0.956 / W);
        const w = view.clientWidth;
        scale = Math.min(1, w / W);
        view.style.height = Math.round(H * scale) + 'px';
        frame.style.transform = `scale(${scale})`;
      };
      new ResizeObserver(fit).observe(view);
      fit();

      let current = tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0];
      const select = tab => {
        current = tab;
        tabs.forEach(t => t.setAttribute('aria-selected', String(t === tab)));
        frame.src = tab.dataset.src;
        frame.title = tab.textContent.trim() + ' prototype';
      };
      tabs.forEach(t => t.addEventListener('click', () => select(t)));
      frame.src = current.dataset.src;

      // Full-screen modal
      const modal = $('#proto-modal');
      const mView = $('.modal__view', modal), mFrame = $('iframe', modal), mLabel = $('.modal__label', modal);
      const mSize = () => {
        const sc = Math.min((innerWidth - 48) / W, (innerHeight - 48 - 56) / H, 1);
        mView.style.width = Math.round(W * sc) + 'px';
        mView.style.height = Math.round(H * sc) + 'px';
        mFrame.style.transform = `scale(${sc})`;
      };
      const onKey = e => { if (e.key === 'Escape') closeModal(); };
      const closeModal = () => {
        modal.hidden = true;
        removeEventListener('keydown', onKey);
        removeEventListener('resize', mSize);
        mFrame.src = 'about:blank';
        lockScroll(false);
        $('.proto__full', proto).focus();
      };
      $('.proto__full', proto).addEventListener('click', () => {
        mFrame.src = current.dataset.src;
        mLabel.textContent = current.textContent.trim();
        modal.hidden = false;
        mSize();
        addEventListener('keydown', onKey);
        addEventListener('resize', mSize);
        lockScroll(true);
        $('.x-btn', modal).focus();
      });
      modal.addEventListener('click', closeModal);
      $('.modal__box', modal).addEventListener('click', e => e.stopPropagation());
      $('.x-btn', modal).addEventListener('click', closeModal);
    }
  }

  /* ================= Start ================= */
  if (document.getElementById('hero')) initHome();
  if (document.body.classList.contains('case-page')) initCase();
  initCopyEmail();
})();
