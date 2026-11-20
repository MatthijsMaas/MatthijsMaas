// The Shorn Tech Tree page: mail link, filters, fold-outs. No dependencies.
(function () {
  var each = function (sel, fn) { Array.prototype.forEach.call(document.querySelectorAll(sel), fn); };

  // The address is not in the page as a mailto link; it is assembled on click.
  each('a.stt-mail', function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.href = 'mailto:' + a.dataset.u + '@' + a.dataset.d + '?subject=' + encodeURIComponent('Shorn Tech Tree (public draft)');
    });
  });

  var cases = Array.prototype.slice.call(document.querySelectorAll('.stt-case'));
  if (!cases.length) return;
  var state = { cat: '', group: '', by: '', q: '', cause: '' };
  var q = document.getElementById('stt-q');
  var group = document.getElementById('stt-group');
  var by = document.getElementById('stt-by');
  var count = document.getElementById('stt-count');
  var cause = document.getElementById('stt-cause');
  var total = cases.length;

  // Search covers title, label and description, not the sources and authorship line.
  cases.forEach(function (c) {
    var s = c.querySelector('summary'), body = c.querySelector('.stt-body'), text = s ? s.textContent : '';
    if (body) {
      var copy = body.cloneNode(true), meta = copy.querySelector('.stt-meta');
      if (meta) meta.parentNode.removeChild(meta);
      text += ' ' + copy.textContent;
    }
    c._text = text.toLowerCase();
  });

  var onApply = [];   // functions to run after each filter change (the corner navigation's counts)
  function apply() {
    var shown = 0;
    cases.forEach(function (c) {
      var ok = (!state.cat || c.dataset.cat === state.cat) &&
               (!state.group || c.dataset.group === state.group) &&
               (!state.by || c.dataset.by === state.by) &&
               (!state.cause || c.dataset.cause === state.cause) &&
               (!state.q || c._text.indexOf(state.q) !== -1);
      c.classList.toggle('stt-hidden', !ok);
      if (ok) shown++;
    });
    each('h3.stt-dom', function (h) {
      var el = h.nextElementSibling, any = false;
      while (el && el.classList.contains('stt-case')) { if (!el.classList.contains('stt-hidden')) any = true; el = el.nextElementSibling; }
      h.classList.toggle('stt-hidden', !any);
    });
    each('section.stt-cat', function (s) {
      s.classList.toggle('stt-hidden', !s.querySelector('.stt-case:not(.stt-hidden)'));
    });
    each('.stt-matrix tr[data-cat]', function (r) { r.classList.toggle('on', r.dataset.cat === state.cat); });
    each('.stt-matrix button.stt-row', function (b) { b.classList.toggle('on', b.dataset.cat === state.cat); });
    each('.stt-matrix button.stt-col', function (b) { b.classList.toggle('on', b.dataset.group === state.group); });
    each('.stt-matrix td.cell', function (td) { td.classList.toggle('on', !!state.group && td.dataset.group === state.group); });
    if (group) group.value = state.group;
    count.textContent = shown === total ? total + ' cases' : 'Showing ' + shown + ' of ' + total + ' cases';
    onApply.forEach(function (f) { f(); });
  }

  function showCategory(cat) {
    var s = cat && document.getElementById('cat-' + cat);
    if (s) s.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  each('.stt-matrix button.stt-row', function (b) {
    b.addEventListener('click', function () {
      state.cat = state.cat === b.dataset.cat ? '' : b.dataset.cat;
      apply();
      showCategory(state.cat);
    });
  });
  each('.stt-matrix button.stt-col', function (b) {
    b.addEventListener('click', function () { state.group = state.group === b.dataset.group ? '' : b.dataset.group; apply(); });
  });
  each('.stt-matrix td.cell.has', function (td) {
    function pick() {
      var cat = td.parentNode.dataset.cat, g = td.dataset.group;
      var same = state.cat === cat && state.group === g;
      state.cat = same ? '' : cat;
      state.group = same ? '' : g;
      apply();
      showCategory(state.cat);
    }
    td.addEventListener('click', pick);
    td.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
  });
  if (q) q.addEventListener('input', function () { state.q = q.value.trim().toLowerCase(); apply(); });
  if (group) group.addEventListener('change', function () { state.group = group.value; apply(); });
  if (by) by.addEventListener('change', function () { state.by = by.value; apply(); });
  if (cause) cause.addEventListener('change', function () { state.cause = cause.value; apply(); });
  var clear = document.getElementById('stt-clear');
  if (clear) clear.addEventListener('click', function () { state = { cat: '', group: '', by: '', q: '', cause: '' }; if (q) q.value = ''; if (by) by.value = ''; if (cause) cause.value = ''; apply(); });
  var expand = document.getElementById('stt-expand');
  if (expand) expand.addEventListener('click', function () {
    var open = expand.textContent === 'Open all';
    each('.stt-case:not(.stt-hidden) details', function (d) { d.open = open; });
    expand.textContent = open ? 'Close all' : 'Open all';
  });
  var review = document.getElementById('stt-review');
  if (review) review.addEventListener('click', function () {
    var on = document.body.classList.toggle('stt-review');
    review.setAttribute('aria-pressed', on ? 'true' : 'false');
    review.textContent = on ? 'Hide review status' : 'Show review status';
  });

  // Corner navigation: Top, previous/next category, and the current category, which opens a list of all categories.
  // It appears once the intro is out of view. Categories emptied by the filters are greyed out and skipped.
  var dock = document.getElementById('stt-dock');
  if (dock) (function () {
    var panel = document.getElementById('stt-dock-panel');
    var toggle = dock.querySelector('.stt-dock-cur'), curName = dock.querySelector('.stt-dock-curname');
    var prev = dock.querySelector('.stt-dock-prev'), next = dock.querySelector('.stt-dock-next');
    var top = dock.querySelector('.stt-dock-top'), title = document.getElementById('stt-top');
    var intro = document.querySelector('.stt-intro');
    var sections = Array.prototype.slice.call(document.querySelectorAll('section.stt-cat'));
    var links = {};
    each('#stt-dock-panel a[data-cat]', function (a) { links[a.dataset.cat] = a; });
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var cur = -1, ticking = false;
    // After a jump the target counts as the current category until the reader scrolls away from it. Short
    // (filtered) categories near the end of the page cannot reach the top of the window, so position alone misleads.
    var pinned = null, pinnedAt = 0, hold = reduce ? 0 : 1500;   // hold: time a smooth scroll may take
    dock.hidden = false;

    function visible() { return sections.filter(function (s) { return !s.classList.contains('stt-hidden'); }); }
    function go(s, focus) {
      if (!s) return;
      pinned = s; pinnedAt = Date.now();
      s.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      window.setTimeout(onScroll, hold + 100);   // re-check once the scroll has had time to finish
      if (focus) { s.setAttribute('tabindex', '-1'); s.focus({ preventScroll: true }); }
      if (history.replaceState) history.replaceState(null, '', '#' + s.id);
    }
    function setOpen(open) {
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    function update() {
      ticking = false;
      var on = !intro || intro.getBoundingClientRect().bottom < 0;
      dock.classList.toggle('on', on);
      if (!on && !panel.hidden) setOpen(false);
      var vh = window.innerHeight, vis = visible(), line = vh * 0.3, idx = -1;
      for (var i = 0; i < vis.length; i++) { if (vis[i].getBoundingClientRect().top <= line) idx = i; else break; }
      var atBottom = window.scrollY + vh >= document.documentElement.scrollHeight - 4;
      if (atBottom) {   // at the end of the page, the last category on screen is the current one
        for (var j = vis.length - 1; j > idx; j--) { if (vis[j].getBoundingClientRect().top < vh * 0.85) { idx = j; break; } }
      }
      if (pinned) {
        var pi = vis.indexOf(pinned), r = pinned.getBoundingClientRect();
        var holds = pi >= 0 && (Date.now() - pinnedAt < hold || (r.top > -vh * 0.3 && r.top <= line) || (atBottom && r.top < vh));
        if (holds) idx = pi; else pinned = null;
      }
      cur = idx;
      var s = vis[idx], a = s && links[s.dataset.cat], name = a ? a.querySelector('.t').textContent : 'Categories';
      curName.textContent = name;
      toggle.setAttribute('aria-label', a ? 'Categories (current: ' + name + ')' : 'Categories');
      Object.keys(links).forEach(function (k) {
        if (a && links[k] === a) links[k].setAttribute('aria-current', 'location'); else links[k].removeAttribute('aria-current');
      });
      prev.disabled = idx <= 0;
      next.disabled = idx >= vis.length - 1;
    }
    function onScroll() { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    prev.addEventListener('click', function () { go(visible()[cur - 1]); });
    next.addEventListener('click', function () { go(visible()[cur + 1]); });
    top.addEventListener('click', function (e) {
      e.preventDefault();
      setOpen(false);
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      if (title) title.focus({ preventScroll: true });
      if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
    });
    toggle.addEventListener('click', function () { setOpen(panel.hidden); });
    Object.keys(links).forEach(function (k) {
      links[k].addEventListener('click', function (e) {
        e.preventDefault();
        setOpen(false);
        go(document.getElementById('cat-' + k), true);
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) { setOpen(false); toggle.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (!panel.hidden && !dock.contains(e.target)) setOpen(false);
    });
    onApply.push(function () {
      sections.forEach(function (s) {
        var a = links[s.dataset.cat];
        if (!a) return;
        var n = s.querySelectorAll('.stt-case:not(.stt-hidden)').length;
        a.querySelector('.n').textContent = n;
        a.classList.toggle('none', !n);
        if (n) { a.removeAttribute('tabindex'); a.removeAttribute('aria-disabled'); }
        else { a.setAttribute('tabindex', '-1'); a.setAttribute('aria-disabled', 'true'); }
      });
      onScroll();
    });
    update();
  })();

  function openFromHash() {
    var id = (location.hash || '').slice(1);
    if (!/^stt-\d{4}$/.test(id)) return;
    var c = document.getElementById(id);
    if (!c) return;
    var d = c.querySelector('details');
    if (d) d.open = true;
    c.scrollIntoView({ block: 'center' });
  }
  window.addEventListener('hashchange', openFromHash);
  apply();
  openFromHash();
})();
