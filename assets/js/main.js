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

  // Header state, inner-page hero parallax and the film — one rAF-throttled scroll handler
  var header = document.querySelector('.site-header');
  var hero = null, heroBg = null, heroBox = null; // inner pages no longer have a dark parallax hero
  var film = document.querySelector('.film');
  var filmUpdate = function () {};
  var raf = 0;
  // The header is white text over the dark film / page hero and flips to the light bar once past it.
  // Pages without either use the light bar from the top.
  var update = function () {
    var y = window.scrollY;
    if (header) {
      var dark = film && !film.classList.contains('film--static') ? film : hero;
      header.classList.toggle('scrolled', dark ? y > dark.offsetTop + dark.offsetHeight - 60 : true);
    }
    filmUpdate();
    if (hero && !reduced) {
      var h = hero.offsetHeight;
      if (y < h) {
        if (heroBg) heroBg.style.transform = 'translate3d(0,' + (y * 0.35).toFixed(1) + 'px,0)';
        if (heroBox) {
          heroBox.style.opacity = Math.max(0, 1 - y / (h * 0.8)).toFixed(3);
          heroBox.style.transform = 'translateY(' + (y * 0.2).toFixed(1) + 'px)';
        }
      }
    }
  };
  window.addEventListener('scroll', function () {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(update);
  }, { passive: true });

  // The film: one pinned section; a pre-rendered frame sequence is drawn on a canvas from scroll
  // progress, and the title card / chapter captions switch on the same progress value.
  if (film) {
    var canvas = film.querySelector('.film__canvas');
    var ctx = canvas && canvas.getContext && canvas.getContext('2d');
    var conn = navigator.connection || {};
    if (reduced || !ctx) {
      film.classList.add('film--static');
    } else {
      var sticky = film.querySelector('.film__sticky');
      var poster = film.querySelector('.film__poster');
      var loading = film.querySelector('.film__loading');
      var hint = film.querySelector('.film__hint');
      var HOLD = parseFloat(film.getAttribute('data-hold')) || 0;
      var N = parseInt(film.getAttribute('data-frames'), 10);
      var dpr = window.devicePixelRatio || 1;
      var mem = navigator.deviceMemory || 8;
      var slow = !!conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');
      // Frame tier: xl (native 1080p) for large or high-DPI screens with the memory for it,
      // lg for laptops, sm for phones and data-saver connections.
      var tier = window.innerWidth < 768 || slow ? 'sm' : (window.innerWidth * dpr >= 1600 && mem >= 4 ? 'xl' : 'lg');
      var base = film.getAttribute('data-' + tier) || film.getAttribute('data-lg');
      var stride = mem <= 2 ? 2 : 1; // low-memory phones: every 2nd frame
      var cards = Array.prototype.map.call(film.querySelectorAll('.film__card'), function (el) {
        return { el: el, from: parseFloat(el.getAttribute('data-from')), to: parseFloat(el.getAttribute('data-to')) };
      });
      var frames = new Array(N), inflight = {}, loaded = 0, lastDrawn = -1, wanted = 0;
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
        frames[i] = bmp; loaded++;
        delete inflight[i];
        if (lastDrawn !== wanted) draw(wanted); // a frame nearer the one on screen may have arrived
        if (loading && loaded >= N * 0.15) loading.classList.add('done');
      };
      // Load order: coarse to fine (every 32nd frame, then 16th, 8th ...) so that scrubbing anywhere
      // shows a nearby frame early; the frame under the cursor always jumps the queue.
      var queue = [], seen = {};
      for (var s = 32; s >= 1; s = s >> 1) for (var q = 0; q < N; q += s * stride) if (!seen[q]) { seen[q] = true; queue.push(q); }
      var decode = function (blobOrImg) {
        if (window.createImageBitmap) return createImageBitmap(blobOrImg); // decodes off the main thread
        return new Promise(function (resolve, reject) {
          var img = new Image();
          img.onload = function () { (img.decode ? img.decode() : Promise.resolve()).then(function () { resolve(img); }, function () { resolve(img); }); };
          img.onerror = reject;
          img.src = URL.createObjectURL(blobOrImg);
        });
      };
      var fetchFrame = function (i) {
        inflight[i] = true;
        return fetch(base + 'f-' + pad(i + 1) + '.webp').then(function (r) { return r.blob(); }).then(decode)
          .then(function (bmp) { store(i, bmp); }, function () { delete inflight[i]; });
      };
      var nextIndex = function () {
        if (!frames[wanted] && !inflight[wanted]) return wanted;
        for (var n = 1; n <= 4; n++) { // the frames just ahead in the scroll direction
          var a = wanted + n * stride;
          if (a < N && !frames[a] && !inflight[a]) return a;
        }
        while (queue.length) { var idx = queue.shift(); if (!frames[idx] && !inflight[idx]) return idx; }
        return -1;
      };
      var lane = function () {
        var i = nextIndex();
        if (i < 0) return;
        fetchFrame(i).then(lane);
      };
      // frame 1 is the already-decoded poster <img>; the rest stream in over six lanes
      if (poster && poster.complete && poster.naturalWidth) store(0, poster);
      for (var c = 0; c < 6; c++) lane();

      // Scroll sets the target; a rAF loop eases the shown frame towards it so fast wheel
      // flicks and trackpad jumps play as motion instead of a jump cut.
      // Captions follow the frame that is actually on screen (the eased value), not the raw scroll
      // position, so a fast flick never shows a chapter title over the previous clip.
      var setCards = function (v) {
        cards.forEach(function (card) {
          var on = v >= card.from && v < card.to;
          if (on !== card.el.classList.contains('on')) {
            card.el.classList.toggle('on', on);
            card.el.inert = !on;
          }
        });
      };
      var render = function () {
        var fp = Math.max(0, (shown - HOLD) / (1 - HOLD));
        wanted = Math.round(fp * (N - 1));
        if (stride > 1) wanted -= wanted % stride;
        draw(wanted);
        setCards(shown);
      };
      var tick = function () {
        // the loop always clears its flag when it stops, so the next scroll can restart it
        if (!visible) { animating = false; return; }
        var diff = progress - shown;
        var settled = Math.abs(diff) < 0.0005;
        shown = settled ? progress : shown + diff * 0.22;
        render();
        if (settled) animating = false;
        else requestAnimationFrame(tick);
      };
      filmUpdate = function () {
        var range = film.offsetHeight - sticky.offsetHeight;
        var rect = film.getBoundingClientRect();
        var wasVisible = visible;
        visible = !(rect.bottom <= 0 || rect.top >= window.innerHeight);
        if (!visible) return;
        var p = range > 0 ? Math.min(1, Math.max(0, -rect.top / range)) : 0;
        progress = p;
        // Coming back from outside the film (e.g. Home key, back to top, bfcache restore):
        // jump straight to the frame for this position instead of rewinding the whole take.
        if (!wasVisible || Math.abs(progress - shown) > 0.3) { shown = progress; render(); }
        if (!animating) { animating = true; requestAnimationFrame(tick); }
        film.style.setProperty('--p', p.toFixed(4));
        if (hint) hint.classList.toggle('off', p > 0.04);
      };
      // keyboard users: focusing a chapter link scrolls the film to that chapter
      cards.forEach(function (card) {
        card.el.addEventListener('focusin', function () {
          if (progress >= card.from && progress < card.to) return;
          var range = film.offsetHeight - sticky.offsetHeight;
          window.scrollTo({ top: film.offsetTop + (card.from + 0.01) * range, behavior: 'auto' });
        });
      });
      window.addEventListener('resize', function () { lastDrawn = -1; filmUpdate(); });
    }
  }
  update();
  // returning with the browser's Back button can restore this page from the bfcache mid-scroll
  window.addEventListener('pageshow', function (e) { if (e.persisted) update(); });

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
  if (hero) {
    Array.prototype.forEach.call(hero.querySelectorAll('.reveal'), function (el, i) {
      setTimeout(function () { el.classList.add('in'); }, reduced ? 0 : 150 + i * 180);
    });
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

  // Enquiry form (AJAX with graceful fallback to normal POST)
  var form = document.getElementById('enquiry-form');
  if (form && window.fetch && window.FormData) {
    var msg = form.querySelector('.form-msg');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'X-Requested-With': 'fetch' } })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          msg.className = 'form-msg ' + (res.ok ? 'ok' : 'err');
          msg.textContent = res.message;
          if (res.ok) form.reset();
        })
        .catch(function () {
          msg.className = 'form-msg err';
          msg.textContent = 'Sorry, something went wrong. Please call us or email info@arleenbuilders.com.';
        })
        .then(function () { btn.disabled = false; msg.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
    });
  }

  // Current year
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
