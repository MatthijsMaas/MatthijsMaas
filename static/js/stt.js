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
