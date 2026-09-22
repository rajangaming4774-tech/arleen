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

  // Header state and inner-page hero parallax — one rAF-throttled scroll handler
  var header = document.querySelector('.site-header');
  var hero = document.querySelector('.page-hero');
  var heroBg = hero && hero.querySelector('.page-hero__bg');
  var heroBox = hero && hero.querySelector('.container');
  var raf = 0;
  // The header is white text over a dark page hero and flips to the light bar once past it.
  // Pages without a dark hero (the home page) use the light bar from the top.
  var update = function () {
    var y = window.scrollY;
    if (header) header.classList.toggle('scrolled', hero ? y > hero.offsetTop + hero.offsetHeight - 60 : true);
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
  update();
  // returning with the browser's Back button can restore this page from the bfcache mid-scroll
  window.addEventListener('pageshow', function (e) { if (e.persisted) update(); });

  // Home hero: the framed photo slowly cross-fades through a few real projects
  var heroImgs = document.querySelectorAll('.hero__frame img');
  var heroCap = document.querySelector('.hero__caption');
  if (heroImgs.length > 1 && !reduced) {
    var hi = 0;
    setInterval(function () {
      if (document.hidden) return;
      heroImgs[hi].classList.remove('is-on');
      hi = (hi + 1) % heroImgs.length;
      heroImgs[hi].classList.add('is-on');
      if (heroCap) heroCap.textContent = heroImgs[hi].getAttribute('data-caption') || '';
    }, 5500);
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
    items.forEach(function (el) { if (!el.closest('.page-hero')) io.observe(el); });
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
