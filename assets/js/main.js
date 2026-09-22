// Arleen Builders — site interactions (no dependencies)
(function () {
  'use strict';

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Full-screen menu
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('menu');
  if (toggle && menu) {
    var setMenu = function (open) {
      menu.classList.toggle('open', open);
      document.body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', open);
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) {
        var first = menu.querySelector('a');
        if (first) first.focus();
      } else {
        toggle.focus();
      }
    };
    toggle.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) setMenu(false);
    });
    menu.querySelectorAll('a[href^="#"], a[href="' + location.pathname + '"]').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
  }

  // The header is the paper bar on every page — set once, nothing to recompute on scroll.
  var header = document.querySelector('.site-header');
  if (header) header.classList.add('scrolled');

  // Reveal on scroll — a short stagger for children of grid-like containers
  document.querySelectorAll('.grid, .work, .clients, .faq, .footer-grid, .rows, .contact-band').forEach(function (group) {
    var i = 0;
    Array.prototype.forEach.call(group.children, function (child) {
      if (child.classList.contains('reveal')) child.style.setProperty('--d', Math.min(i++ * 90, 330) + 'ms');
    });
  });
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }
  // Lightbox: each project button carries {title, place, images:[{src, alt}]}
  var lb = document.getElementById('lightbox');
  if (lb) {
    var img = lb.querySelector('img');
    var cap = lb.querySelector('figcaption');
    var set = null, idx = 0, lastFocus = null;
    var preload = function (k) {
      var n = set.images[(k + set.images.length) % set.images.length];
      if (n) { var pre = new Image(); pre.src = n.src; }
    };
    var show = function () {
      var it = set.images[idx];
      img.src = it.src;
      img.alt = it.alt;
      cap.textContent = set.title + ' — ' + set.place + (set.images.length > 1 ? ' · ' + (idx + 1) + ' of ' + set.images.length : '');
      preload(idx + 1); preload(idx - 1);
    };
    var open = function (gallery) {
      set = gallery; idx = 0; lastFocus = document.activeElement;
      show(); lb.classList.add('open'); document.body.style.overflow = 'hidden';
      lb.querySelector('.lb-close').focus();
    };
    var close = function () {
      lb.classList.remove('open'); document.body.style.overflow = ''; img.src = '';
      lastFocus && lastFocus.focus();
    };
    var step = function (d) { idx = (idx + d + set.images.length) % set.images.length; show(); };
    document.querySelectorAll('[data-gallery]').forEach(function (el) {
      el.addEventListener('click', function () { open(JSON.parse(el.getAttribute('data-gallery'))); });
    });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', function () { step(-1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { step(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
    // swipe between photos on touch screens
    var tx = null;
    lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (tx === null) return;
      var dx = e.changedTouches[0].clientX - tx;
      tx = null;
      if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
    });
  }

  // Enquiry form. Submits by fetch when it can, and falls back to a normal POST — which comes
  // back as ?sent=1|0, so that path shows a message too instead of an identical-looking page.
  var form = document.getElementById('enquiry-form');
  if (form) {
    var msg = form.querySelector('.form-msg');
    var fallback = form.getAttribute('data-fallback') || 'Sorry, something went wrong. Please call us.';
    var say = function (ok, text) {
      msg.className = 'form-msg ' + (ok ? 'ok' : 'err');
      msg.textContent = text;
      msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    var sent = /[?&]sent=([01])/.exec(location.search);
    if (sent) {
      say(sent[1] === '1', sent[1] === '1' ? form.getAttribute('data-thanks') : fallback);
      if (history.replaceState) history.replaceState(null, '', location.pathname);
    }
    if (window.fetch && window.FormData) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var btn = form.querySelector('button[type="submit"]');
        var label = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Sending…';
        fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'X-Requested-With': 'fetch' } })
          .then(function (r) { return r.json(); })
          .then(function (res) {
            say(res.ok, res.message);
            if (res.ok) form.reset();
            else if (res.field) { // the server names the field it rejected
              var bad = form.querySelector('[name="' + res.field + '"]');
              if (bad) { bad.setAttribute('aria-invalid', 'true'); bad.focus(); }
            }
          })
          .catch(function () { say(false, fallback); })
          .then(function () { btn.disabled = false; btn.textContent = label; });
      });
      form.addEventListener('input', function (e) { e.target.removeAttribute('aria-invalid'); });
    }
  }

  // Current year
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
