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
  var state = { cat: '', group: '', by: '', q: '', cause: '', fresh: false };
  var q = document.getElementById('stt-q');
  var qs = Array.prototype.slice.call(document.querySelectorAll('input.stt-q'));   // above the figure and above the list: one search
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

  // 'Who wrote it' list, with the review filter in the same list (27 Nov)
  function byOk(c) {
    if (!state.by) return true;
    if (state.by === 'rev') return !!c.dataset.rev;
    if (state.by === 'norev') return !c.dataset.rev;
    return c.dataset.by === state.by;
  }

  // New since your last visit (27 Nov). The browser keeps, in its own storage and nowhere else, which edition of the
  // list the reader saw in their previous session (a session ends after 6 hours away). A case added or revised in a
  // later edition gets a dot: filled if added, a ring if revised. On a first visit, the last 14 days count instead.
  // Nothing at or before the launch (20 Nov 2026) is marked: the export leaves those stamps empty.
  var edition = (document.querySelector('article.stt') || {}).dataset ? document.querySelector('article.stt').dataset.edition : '';
  var since = '', sinceVisit = false;
  (function () {
    var now = Date.now(), v = null;
    try { v = JSON.parse(localStorage.getItem('stt-visits') || 'null'); } catch (e) { v = null; }
    if (!v || !v.t) v = { prev: '', cur: edition, t: now };
    else if (now - v.t > 6 * 3600 * 1000) v = { prev: v.cur || '', cur: edition, t: now };
    else v.cur = edition;
    try { localStorage.setItem('stt-visits', JSON.stringify(v)); } catch (e) {}
    if (v.prev) { since = v.prev; sinceVisit = true; }
    else since = new Date(now - 14 * 86400 * 1000).toISOString().slice(0, 16) + 'Z';
  })();
  var nFresh = 0;
  function day(stamp) { var d = new Date(stamp.slice(0, 10) + 'T12:00:00Z'); return d.getUTCDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()]; }
  cases.forEach(function (c) {
    var a = c.dataset.added || '', ch = c.dataset.changed || '', dot = c.querySelector('summary .stt-newdot');
    var kind = a && a > since ? 'added' : (ch && ch > since ? 'revised' : '');
    c._fresh = !!kind;
    if (!dot) return;
    dot.hidden = !kind;
    if (!kind) return;
    nFresh++;
    dot.classList.toggle('rev', kind === 'revised');
    var lbl = (kind === 'added' ? 'Added ' + day(a) : 'Revised ' + day(ch)) + (sinceVisit ? ', since your last visit' : '');
    dot.setAttribute('aria-label', lbl); dot.title = lbl;
  });
  var newline = document.getElementById('stt-newline');
  if (newline && (nFresh || sinceVisit)) {
    var nt = newline.querySelector('.stt-newtext'), nb = newline.querySelector('.stt-newonly');
    var when = sinceVisit ? 'since your last visit (' + day(since) + ')' : 'in the last 14 days';
    nt.textContent = nFresh ? nFresh + (nFresh === 1 ? ' case' : ' cases') + ' added or revised ' + when + '.' : 'Nothing added or revised ' + when + '.';
    if (!nFresh) { nb.hidden = true; newline.querySelector('.stt-newdot').hidden = true; }
    newline.hidden = false;
    nb.addEventListener('click', function () { state.fresh = !state.fresh; apply(); });
  }
  function syncFresh() {
    var nb = newline && newline.querySelector('.stt-newonly');
    if (!nb) return;
    nb.setAttribute('aria-pressed', state.fresh ? 'true' : 'false');
    nb.textContent = state.fresh ? 'Show all cases' : 'Show only these';
  }

  // The figure follows the search and the 'who wrote it' and review filters (not the row and column picks, which it
  // shows itself): each dot is resized to the matching cases, on the same scale as the full figure, and empty rows fade.
  var cellN = {}, maxN = 0;
  cases.forEach(function (c) { var k = c.dataset.cat + '|' + c.dataset.group; cellN[k] = (cellN[k] || 0) + 1; });
  Object.keys(cellN).forEach(function (k) { if (cellN[k] > maxN) maxN = cellN[k]; });
  function dotSize(n) { return n ? Math.round(5 + 12 * Math.sqrt(n / maxN)) : 0; }
  var note = document.getElementById('stt-q-note');
  function shapeMatrix() {
    var on = !!(state.q || state.by || state.cause || state.fresh), n = {}, all = 0;
    cases.forEach(function (c) {
      if (byOk(c) && (!state.cause || c.dataset.cause === state.cause) && (!state.fresh || c._fresh) &&
          (!state.q || c._text.indexOf(state.q) !== -1)) {
        var k = c.dataset.cat + '|' + c.dataset.group; n[k] = (n[k] || 0) + 1; all++;
      }
    });
    each('.stt-matrix tr[data-cat]', function (r) {
      var tot = 0, num = r.querySelector('td.num');
      Array.prototype.forEach.call(r.querySelectorAll('td.cell'), function (td) {
        var k = r.dataset.cat + '|' + td.dataset.group, m = on ? (n[k] || 0) : (cellN[k] || 0), dot = td.querySelector('.dot');
        tot += m;
        if (dot) { var d = dotSize(m); dot.style.width = dot.style.height = d + 'px'; }
        td.classList.toggle('zero', on && !m && !!dot);
      });
      if (num) {
        if (num.dataset.n === undefined) num.dataset.n = num.textContent;
        num.textContent = on ? tot : num.dataset.n;
        num.classList.toggle('q', on);
      }
      r.classList.toggle('zero', on && !tot && !!num && num.dataset.n !== '0');
    });
    if (note) {
      note.hidden = !state.q;
      if (state.q) note.innerHTML = all ? all + (all === 1 ? ' case matches' : ' cases match') + ' · <a href="#stt-controls">show the list</a>' : 'No case matches';
    }
  }

  var onApply = [];   // functions to run after each filter change (the corner navigation's counts)
  function apply() {
    var shown = 0;
    cases.forEach(function (c) {
      var ok = (!state.cat || c.dataset.cat === state.cat) &&
               (!state.group || c.dataset.group === state.group) &&
               byOk(c) && (!state.fresh || c._fresh) &&
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
    shapeMatrix();
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
  qs.forEach(function (box) {
    box.addEventListener('input', function () {
      qs.forEach(function (other) { if (other !== box) other.value = box.value; });
      state.q = box.value.trim().toLowerCase();
      apply();
    });
  });
  if (group) group.addEventListener('change', function () { state.group = group.value; apply(); });
  if (by) by.addEventListener('change', function () { state.by = by.value; apply(); });
  if (cause) cause.addEventListener('change', function () { state.cause = cause.value; apply(); });
  var clear = document.getElementById('stt-clear');
  if (clear) clear.addEventListener('click', function () { state = { cat: '', group: '', by: '', q: '', cause: '' }; qs.forEach(function (box) { box.value = ''; }); if (by) by.value = ''; if (cause) cause.value = ''; apply(); });
  // Open all / Close all: the button above the list and the one in the corner bar share one state. They act on the
  // entries the filters show, and the label follows what is open, including entries opened or closed by hand.
  var foldBtns = Array.prototype.slice.call(document.querySelectorAll('.stt-fold-all'));
  function shownDetails() { return Array.prototype.slice.call(document.querySelectorAll('.stt-case:not(.stt-hidden) details')); }
  function allOpen(s) { return s.length > 0 && s.every(function (d) { return d.open; }); }
  function syncFold() {
    var label = allOpen(shownDetails()) ? 'Close all' : 'Open all';
    foldBtns.forEach(function (b) { if (b.textContent !== label) b.textContent = label; });
  }
  var foldPending = false;
  function syncFoldSoon() {
    if (foldPending) return;
    foldPending = true;
    window.requestAnimationFrame(function () { foldPending = false; syncFold(); });
  }
  foldBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var s = shownDetails(), open = !allOpen(s);
      // keep the entry at the top of the screen where it is (Safari does not anchor the scroll position itself)
      var anchor = null, before = 0;
      for (var i = 0; i < s.length; i++) {
        var r = s[i].getBoundingClientRect();
        if (r.bottom > 0) { anchor = s[i]; before = r.top; break; }
      }
      s.forEach(function (d) { d.open = open; });
      if (anchor && b.closest('.stt-dock')) window.scrollBy(0, anchor.getBoundingClientRect().top - before);
      syncFold();
    });
  });
  document.addEventListener('toggle', syncFoldSoon, true);
  onApply.push(syncFold);
  onApply.push(syncFresh);
  // The changelog is folded; links to it (the 'Changelog' link in the margin, or #changelog in the address) open it
  var changelog = document.querySelector('#changelog details');
  function openChangelog() { if (changelog && location.hash === '#changelog') changelog.open = true; }
  window.addEventListener('hashchange', openChangelog);
  openChangelog();
  each('a[href="#changelog"]', function (a) { a.addEventListener('click', function () { if (changelog) changelog.open = true; }); });
  // Printing (or saving as PDF from the browser) shows every entry the filters show, then restores the page.
  var openedForPrint = [];
  window.addEventListener('beforeprint', function () {
    openedForPrint = shownDetails().filter(function (d) { return !d.open; });
    openedForPrint.forEach(function (d) { d.open = true; });
  });
  window.addEventListener('afterprint', function () {
    openedForPrint.forEach(function (d) { d.open = false; });
    openedForPrint = [];
  });
  var review = document.getElementById('stt-review');
  if (review) review.addEventListener('click', function () {
    var on = document.body.classList.toggle('stt-review');
    review.setAttribute('aria-pressed', on ? 'true' : 'false');
    review.textContent = on ? 'Hide review status' : 'Show review status';
  });

  // Corner navigation: Top, previous/next category, and the current category, which opens a list of all categories.
  // It appears once the intro is out of view. Categories emptied by the filters are greyed out and skipped.
  // Light/dark switch in the corner bar: presses the site's own header button (baseof.html), which stores the choice
  each('.stt-dock-theme', function (b) {
    var site = document.getElementById('theme-toggle');
    function lbl() {
      var dark = document.documentElement.getAttribute('data-theme') === 'dark' ||
        (!document.documentElement.getAttribute('data-theme') && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      b.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      b.title = dark ? 'Light mode' : 'Dark mode';
    }
    if (!site) { b.hidden = true; return; }
    b.addEventListener('click', function () { site.click(); lbl(); });
    lbl();
  });
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
