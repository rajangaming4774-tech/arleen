// Arleen Builders — site interactions (no dependencies)
(function () {
  'use strict';

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Keep Tab inside an open overlay — without this the focus ring walks off behind it.
  var FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';
  var trapFocus = function (box) {
    return function (e) {
      if (e.key !== 'Tab') return;
      var items = Array.prototype.filter.call(box.querySelectorAll(FOCUSABLE), function (el) { return el.offsetParent !== null; });
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
  };

  // Full-screen menu
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('menu');
  if (toggle && menu) {
    var setMenu = function (open) {
      menu.classList.toggle('open', open);
      menu.setAttribute('aria-hidden', !open);
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
    menu.addEventListener('keydown', trapFocus(menu));
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) setMenu(false);
    });
    menu.querySelectorAll('a[href^="#"], a[href="' + location.pathname + '"]').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
  }

  // The header is the paper bar on every page, except over the home film, where it is a transparent
  // bar with white text until the film has scrolled away.
  var header = document.querySelector('.site-header');
  var over = document.querySelector('.hero--film');
  if (header && over) {
    var headerRaf = 0;
    var headerUpdate = function () {
      var edge = over.classList.contains('hero--static') ? over.offsetHeight - 64 : over.offsetHeight - window.innerHeight + 8;
      header.classList.toggle('scrolled', window.scrollY > edge);
    };
    window.addEventListener('scroll', function () { cancelAnimationFrame(headerRaf); headerRaf = requestAnimationFrame(headerUpdate); }, { passive: true });
    window.addEventListener('resize', headerUpdate);
    window.addEventListener('pageshow', function (e) { if (e.persisted) headerUpdate(); });
    setTimeout(headerUpdate, 0); // after the film block below may have added hero--static
  } else if (header) {
    header.classList.add('scrolled');
  }

  // Home hero film: the card pins while a pre-rendered frame sequence is drawn on its canvas
  // from scroll progress. Frames stream in coarse-to-fine so any scroll position shows a nearby
  // frame early; the drawn frame eases towards the scroll position so flicks play as motion.
  var film = document.querySelector('.hero--film');
  if (film) {
    var canvas = film.querySelector('.hero__canvas');
    var ctx = canvas && canvas.getContext && canvas.getContext('2d');
    var conn = navigator.connection || {};
    if (reduced || !ctx) {
      film.classList.add('hero--static');
    } else {
      var sticky = film.querySelector('.hero__sticky');
      var poster = film.querySelector('.hero__img');
      var hint = film.querySelector('.hero__hint');
      var N = parseInt(film.getAttribute('data-frames'), 10);
      var slow = !!conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');
      var base = film.getAttribute(window.innerWidth < 768 || slow ? 'data-sm' : 'data-lg');
      var stride = (navigator.deviceMemory || 8) <= 2 ? 2 : 1; // low-memory phones: every 2nd frame
      var frames = new Array(N), inflight = {}, lastDrawn = -1, wanted = 0;
      var pad = function (n) { return ('00' + n).slice(-3); };
      var progress = 0, shown = 0, animating = false, visible = true;

      var draw = function (i) {
        var j = i, k = i; // the requested frame, or the nearest one that has loaded
        while (j >= 0 || k < N) {
          if (j >= 0 && frames[j]) { i = j; break; }
          if (k < N && frames[k]) { i = k; break; }
          j--; k++;
        }
        if (!frames[i] || i === lastDrawn) return;
        ctx.drawImage(frames[i], 0, 0, canvas.width, canvas.height);
        lastDrawn = i;
        canvas.classList.add('ready');
      };
      var store = function (i, bmp) {
        frames[i] = bmp;
        delete inflight[i];
        if (lastDrawn !== wanted) draw(wanted);
      };
      var queue = [], seen = {};
      for (var s = 16; s >= 1; s = s >> 1) for (var q = 0; q < N; q += s * stride) if (!seen[q]) { seen[q] = true; queue.push(q); }
      var decode = function (blob) {
        if (window.createImageBitmap) return createImageBitmap(blob);
        return new Promise(function (resolve, reject) {
          var im = new Image();
          im.onload = function () { resolve(im); };
          im.onerror = reject;
          im.src = URL.createObjectURL(blob);
        });
      };
      var fetchFrame = function (i) {
        inflight[i] = true;
        return fetch(base + 'f-' + pad(i + 1) + '.webp').then(function (r) { return r.blob(); }).then(decode)
          .then(function (bmp) { store(i, bmp); }, function () { delete inflight[i]; });
      };
      var nextIndex = function () {
        if (!frames[wanted] && !inflight[wanted]) return wanted;
        for (var n = 1; n <= 4; n++) { var a = wanted + n * stride; if (a < N && !frames[a] && !inflight[a]) return a; }
        while (queue.length) { var idx = queue.shift(); if (!frames[idx] && !inflight[idx]) return idx; }
        return -1;
      };
      var lane = function () { var i = nextIndex(); if (i >= 0) fetchFrame(i).then(lane); };
      if (poster && poster.complete && poster.naturalWidth) store(0, poster);
      for (var c = 0; c < 4; c++) lane();

      var render = function () {
        wanted = Math.round(shown * (N - 1));
        if (stride > 1) wanted -= wanted % stride;
        draw(wanted);
      };
      var tick = function () {
        if (!visible) { animating = false; return; }
        var diff = progress - shown;
        var settled = Math.abs(diff) < 0.0005;
        shown = settled ? progress : shown + diff * 0.22;
        render();
        if (settled) animating = false; else requestAnimationFrame(tick);
      };
      var filmUpdate = function () {
        var range = film.offsetHeight - sticky.offsetHeight;
        var rect = film.getBoundingClientRect();
        var wasVisible = visible;
        visible = !(rect.bottom <= 0 || rect.top >= window.innerHeight);
        if (!visible) return;
        progress = range > 0 ? Math.min(1, Math.max(0, -rect.top / range)) : 0;
        // coming back from outside the film (Home key, bfcache restore): jump, don't rewind
        if (!wasVisible || Math.abs(progress - shown) > 0.3) { shown = progress; render(); }
        if (!animating) { animating = true; requestAnimationFrame(tick); }
        if (hint) hint.classList.toggle('off', progress > 0.04);
      };
      var raf = 0;
      window.addEventListener('scroll', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(filmUpdate); }, { passive: true });
      window.addEventListener('resize', function () { lastDrawn = -1; filmUpdate(); });
      window.addEventListener('pageshow', function (e) { if (e.persisted) filmUpdate(); });
      filmUpdate();
    }
  }

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
    lb.addEventListener('keydown', trapFocus(lb));
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
