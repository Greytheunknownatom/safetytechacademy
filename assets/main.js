(function () {
  'use strict';
  var cfg = window.STA_CONFIG || { formMode: 'netlify', popupDelayMs: 30000 };
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---- header: scroll shadow + mobile menu ---- */
  var header = $('.site-header');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 8); }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  var toggle = $('.nav-toggle'), nav = $('#primary-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); }
    });
  }

  /* ---- scroll reveal ---- */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rev = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    rev.forEach(function (el) { io.observe(el); });
  } else { rev.forEach(function (el) { el.classList.add('in'); }); }

  /* ---- modals ---- */
  var lastFocus = null;
  function openModal(id, opts) {
    var m = document.getElementById(id); if (!m) return;
    lastFocus = document.activeElement;
    if (opts) {
      if (opts.title) { var t = $('[data-m-title]', m); if (t) t.textContent = opts.title; }
      if (opts.sub) { var s = $('[data-m-sub]', m); if (s) s.textContent = opts.sub; }
      if (opts.cta) { var b = $('[data-m-cta]', m); if (b) b.firstChild.nodeValue = opts.cta; }
      if (opts.formName) { var fn = $('input[name="form-name"]', m); if (fn) fn.value = opts.formName; }
    }
    m.classList.add('open'); document.body.style.overflow = 'hidden';
    var first = $('.field input', m); if (first) setTimeout(function () { first.focus(); }, 50);
  }
  function closeModal(m) {
    m.classList.remove('open'); document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $$('[data-open-modal]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      openModal(el.getAttribute('data-open-modal'), {
        title: el.getAttribute('data-title'), sub: el.getAttribute('data-sub'),
        cta: el.getAttribute('data-cta'), formName: el.getAttribute('data-form-name')
      });
    });
  });
  $$('.modal').forEach(function (m) {
    m.addEventListener('click', function (e) { if (e.target === m || e.target.closest('[data-close]')) closeModal(m); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && m.classList.contains('open')) closeModal(m); });
  });

  /* timed lead-magnet popup (PRD: 30s after arrival, once per session; skipped on the contact + resources pages) */
  var popup = document.getElementById('popup-modal');
  if (popup && !document.body.hasAttribute('data-no-popup')) {
    var seen = false; try { seen = sessionStorage.getItem('sta_popup') === '1'; } catch (e) {}
    if (!seen) {
      setTimeout(function () {
        if (document.querySelector('.modal.open')) return;
        try { sessionStorage.setItem('sta_popup', '1'); } catch (e) {}
        openModal('popup-modal');
      }, cfg.popupDelayMs || 30000);
    }
  }

  /* ---- forms ---- */
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function validate(form) {
    var ok = true, firstBad = null;
    $$('.field', form).forEach(function (f) {
      var inp = $('input,select,textarea', f); if (!inp || inp.type === 'hidden') return;
      var v = (inp.value || '').trim(), bad = false, m = $('.msg', f);
      if (inp.required && !v) { bad = true; if (m) m.textContent = 'This field is required.'; }
      else if (inp.type === 'email' && v && !EMAIL.test(v)) { bad = true; if (m) m.textContent = 'Please enter a valid email address.'; }
      f.classList.toggle('err', bad);
      inp.setAttribute('aria-invalid', bad ? 'true' : 'false');
      if (bad) { ok = false; if (!firstBad) firstBad = inp; }
    });
    if (firstBad) firstBad.focus();
    return ok;
  }
  function send(form) {
    if (cfg.formMode === 'demo') return new Promise(function (r) { setTimeout(function () { r(true); }, 700); });
    var body = new URLSearchParams(new FormData(form)).toString();
    return fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
      .then(function (r) { return r.ok; }).catch(function () { return false; });
  }
  $$('form[data-form]').forEach(function (form) {
    form.setAttribute('novalidate', '');
    $$('input,select,textarea', form).forEach(function (i) {
      i.addEventListener('input', function () { var f = i.closest('.field'); if (f) f.classList.remove('err'); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var hp = $('.hp input', form); if (hp && hp.value) return; // bot
      form.classList.remove('failed');
      if (!validate(form)) return;
      var btn = $('button[type=submit]', form), label = btn.innerHTML;
      btn.disabled = true; btn.textContent = 'Sending…';
      send(form).then(function (ok) {
        btn.disabled = false; btn.innerHTML = label;
        if (!ok) { form.classList.add('failed'); return; }
        var nm = $('input[name="first_name"],input[name="name"]', form);
        var slot = $('[data-name]', form); if (slot && nm) slot.textContent = nm.value.trim().split(' ')[0];
        var em = $('[data-email]', form), ei = $('input[type=email]', form); if (em && ei) em.textContent = ei.value.trim();
        form.classList.add('done');
        var s = $('.success', form); if (s) { s.setAttribute('tabindex', '-1'); s.focus(); }
      });
    });
  });

  /* ---- contact page: preselect inquiry type from ?type= ---- */
  var sel = $('select[name="inquiry_type"]');
  if (sel) {
    var t = new URLSearchParams(location.search).get('type');
    if (t) { $$('option', sel).forEach(function (o) { if (o.value.toLowerCase() === t.toLowerCase()) sel.value = o.value; }); }
  }

  var y = $('[data-year]'); if (y) y.textContent = new Date().getFullYear();
})();
