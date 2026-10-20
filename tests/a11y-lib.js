/* Homemade accessibility checks (axe-core could not be installed in the sandbox).
   Runs inside the page via page.evaluate(A11Y_FN). Returns {rule:[findings]}.
   Covers a SUBSET of WCAG 2.2 AA that is machine-checkable. It is not a certification. */
module.exports.A11Y_FN = function () {
  const out = {};
  const add = (r, el, msg) => { (out[r] = out[r] || []).push((el ? desc(el) : '') + (msg ? ' — ' + msg : '')); };
  function desc(el) {
    let s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    else if (el.className && typeof el.className === 'string') s += '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.');
    const t = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30);
    return s + (t ? ' "' + t + '"' : '');
  }
  const vis = (el) => {
    if (!el.isConnected) return false;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    for (let p = el; p; p = p.parentElement) { if (p.hidden || getComputedStyle(p).display === 'none') return false; if (p.getAttribute && p.getAttribute('aria-hidden') === 'true') return false; }
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  /* topmost dialog / modal only: ignore content hidden behind an open modal */
  const textOf = (el) => (el.innerText || el.textContent || '').trim();
  function name(el) {
    const al = el.getAttribute('aria-label'); if (al && al.trim()) return al.trim();
    const lb = el.getAttribute('aria-labelledby');
    if (lb) { const t = lb.split(/\s+/).map((i) => { const e = document.getElementById(i); return e ? textOf(e) : ''; }).join(' ').trim(); if (t) return t; }
    if (el.id) { const l = document.querySelector('label[for="' + CSS.escape(el.id) + '"]'); if (l && textOf(l)) return textOf(l); }
    const wl = el.closest('label'); if (wl && textOf(wl)) return textOf(wl);
    if (el.tagName === 'IMG' && el.alt) return el.alt;
    const t = textOf(el); if (t) return t;
    const im = el.querySelector('img[alt]'); if (im && im.alt) return im.alt;
    const sv = el.querySelector('svg title'); if (sv && sv.textContent.trim()) return sv.textContent.trim();
    const ti = el.getAttribute('title'); if (ti && ti.trim()) return ti.trim();
    return '';
  }
  /* 1 document */
  if (!document.documentElement.lang) add('html-lang', null, 'missing lang');
  if (!document.title.trim()) add('doc-title', null, 'missing <title>');
  /* 2 landmarks */
  const q = (s) => [...document.querySelectorAll(s)].filter(vis);
  const lm = { main: q('main,[role=main]').length, banner: q('header,[role=banner]').length, nav: q('nav,[role=navigation]').length };
  if (lm.main !== 1) add('landmark-main', null, 'main landmarks visible: ' + lm.main);
  if (!lm.banner) add('landmark-banner', null, 'no banner');
  const navs = q('nav,[role=navigation]'); const nn = navs.map((n) => n.getAttribute('aria-label') || n.getAttribute('aria-labelledby') || '');
  if (navs.length > 1 && nn.some((x) => !x)) add('landmark-unique', null, 'multiple navs without distinct labels');
  if (new Set(nn.filter(Boolean)).size !== nn.filter(Boolean).length) add('landmark-unique', null, 'duplicate nav labels ' + nn.join('|'));
  const h1 = q('h1'); if (h1.length !== 1) add('page-has-one-h1', null, 'h1 count ' + h1.length);
  if (![...document.querySelectorAll('a[href="#stepPanel"],a.skip,[data-skip]')].length) add('skip-link', null, 'no skip link');
  /* 3 headings order */
  let last = 0; q('h1,h2,h3,h4,h5,h6').forEach((h) => { const l = +h.tagName[1]; if (last && l > last + 1) add('heading-order', h, 'jumps h' + last + '→h' + l); last = l; });
  q('h1,h2,h3,h4,h5,h6').forEach((h) => { if (!textOf(h)) add('empty-heading', h); });
  /* 4 names */
  const sel = 'button,a[href],input:not([type=hidden]),select,textarea,summary,[role=button],[role=tab],[role=checkbox],[role=switch],[role=menuitem],[role=option],[role=combobox],[tabindex="0"]';
  q(sel).forEach((el) => { if (!name(el)) add('name-missing', el, el.tagName + ' has no accessible name'); });
  q('input,select,textarea').forEach((el) => { if (el.type === 'hidden') return; if (!name(el) && !el.getAttribute('placeholder')) add('label-missing', el); else if (!el.id && !el.closest('label') && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby')) add('label-weak', el, 'only placeholder/title'); });
  q('img').forEach((el) => { if (el.getAttribute('alt') === null && el.getAttribute('role') !== 'presentation') add('img-alt', el); });
  q('svg').forEach((el) => { if (!el.getAttribute('aria-hidden') && !el.getAttribute('role') && !el.closest('button,a,[role=button]')) add('svg-unlabelled', el); });
  q('[role=tab]').forEach((el) => { if (!el.closest('[role=tablist]')) add('tab-outside-tablist', el); });
  /* 5 ids / refs */
  const ids = {}; document.querySelectorAll('[id]').forEach((e) => { ids[e.id] = (ids[e.id] || 0) + 1; }); Object.keys(ids).forEach((k) => { if (ids[k] > 1) add('duplicate-id', document.getElementById(k), k + " x" + ids[k]); });
  document.querySelectorAll('[aria-controls],[aria-labelledby],[aria-describedby]').forEach((e) => { ['aria-controls', 'aria-labelledby', 'aria-describedby'].forEach((a) => { const v = e.getAttribute(a); if (v && vis(e)) v.split(/\s+/).forEach((i) => { if (i && !document.getElementById(i)) add('aria-ref-broken', e, a + '=' + i); }); }); });
  q('[role=dialog],[role=alertdialog]').forEach((d) => { if (!d.getAttribute('aria-label') && !d.getAttribute('aria-labelledby')) add('dialog-name', d); });
  q('[aria-pressed],[aria-expanded]').forEach((e) => { if (!/^(button|summary)$/i.test(e.tagName) && !e.getAttribute('role')) add('aria-state-on-nonwidget', e); });
  /* 6 tabindex>0 */
  document.querySelectorAll('[tabindex]').forEach((e) => { if (+e.getAttribute('tabindex') > 0) add('tabindex-positive', e); });
  /* 7 contrast */
  function parse(c) { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] }; }
  const blend = (f, b) => ({ r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a), b: f.b * f.a + b.b * (1 - f.a), a: 1 });
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };
  function bgOf(el) {
    const stack = []; let uncertain = false;
    for (let p = el; p; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') { uncertain = true; }
      const c = parse(cs.backgroundColor); if (c && c.a > 0) { stack.push(c); if (c.a === 1) break; }
    }
    let base = { r: 255, g: 255, b: 255, a: 1 };
    const bodyBg = parse(getComputedStyle(document.documentElement).backgroundColor); if (bodyBg && bodyBg.a > 0) base = blend(bodyBg, base);
    for (let i = stack.length - 1; i >= 0; i--) base = blend(stack[i], base);
    return { c: base, uncertain };
  }
  const seen = new Set(); let checked = 0, uncertainN = 0;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const n = walker.currentNode; if (!n.nodeValue.trim()) continue; const el = n.parentElement; if (!el || seen.has(el)) continue; seen.add(el);
    if (!vis(el) || /^(SCRIPT|STYLE)$/.test(el.tagName)) continue;
    const cs = getComputedStyle(el); if (+cs.opacity === 0) continue;
    const fg0 = parse(cs.color); if (!fg0) continue;
    const bg = bgOf(el); if (bg.uncertain) { uncertainN++; continue; }
    let op = 1; for (let p = el; p; p = p.parentElement) op *= +getComputedStyle(p).opacity;
    const fg = blend({ ...fg0, a: fg0.a * op }, bg.c);
    const r = ratio(fg, bg.c); checked++;
    const px = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight) >= 700;
    const large = px >= 24 || (px >= 18.66 && bold); const need = large ? 3 : 4.5;
    const dis = el.closest(':disabled,[aria-disabled=true]');
    if (r < need && !dis) add('color-contrast', el, r.toFixed(2) + ':1 needs ' + need + ' (' + px + 'px)');
  }
  out.__stats = [{ contrastChecked: checked, contrastSkippedGradientBg: uncertainN }];
  /* 8 non-text contrast of form controls borders (1.4.11): check border or bg vs parent bg */
  q('input[type=text],input[type=number],input:not([type]),textarea,select').forEach((el) => {
    const cs = getComputedStyle(el); const bc = parse(cs.borderTopColor); const bw = parseFloat(cs.borderTopWidth);
    const par = bgOf(el.parentElement || document.body).c; const own = parse(cs.backgroundColor);
    let best = 0; if (bc && bw > 0 && bc.a > 0) best = Math.max(best, ratio(blend(bc, par), par));
    if (own && own.a > 0) best = Math.max(best, ratio(blend(own, par), par));
    if (best < 3) add('control-boundary-contrast', el, best.toFixed(2) + ':1 needs 3');
  });
  /* 9 target size 2.5.8 (24px) */
  q('button,[role=button],[role=tab],input[type=checkbox],input[type=radio],select,summary,a[href]').forEach((el) => {
    const r = el.getBoundingClientRect(); if (r.width < 24 || r.height < 24) { if (el.tagName === 'A' && getComputedStyle(el).display === 'inline') return; add('target-size', el, Math.round(r.width) + '×' + Math.round(r.height)); }
  });
  /* 10 reflow */
  const de = document.documentElement; if (de.scrollWidth > de.clientWidth + 1) add('reflow-h-scroll', null, de.scrollWidth + ' > ' + de.clientWidth);
  return out;
};
