(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Image fallback (broken URLs never leave an empty box) ---------- */
  var FALLBACK = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><rect width="800" height="600" fill="#e4d8c3"/>' +
    '<rect y="380" width="800" height="220" fill="#d3c2a5"/><rect x="250" y="250" width="300" height="40" rx="6" fill="#8a5a36"/>' +
    '<rect x="270" y="290" width="22" height="130" fill="#6b4426"/><rect x="508" y="290" width="22" height="130" fill="#6b4426"/></svg>'
  );
  document.addEventListener('error', function (e) {
    var t = e.target;
    if (t && t.tagName === 'IMG' && t.src !== FALLBACK && !t.dataset.failed) {
      t.dataset.failed = '1';
      t.src = FALLBACK;
    }
  }, true);

  /* ---------- Hero background image rotation ---------- */
  var heroSlides = $$('.hero-slide');
  if (heroSlides.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var heroIndex = 0;
    window.setInterval(function () {
      heroSlides[heroIndex].classList.remove('is-active');
      heroIndex = (heroIndex + 1) % heroSlides.length;
      heroSlides[heroIndex].classList.add('is-active');
    }, 5200);
  }

  /* ---------- Footer year ---------- */
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Sticky header: compact on scroll, back-to-top ---------- */
  var header = $('#site-header');
  var toTop = $('#to-top');
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-compact', y > 40);
    header.classList.toggle('shadow-md', y > 40);
    header.classList.toggle('bg-warm/95', y > 40);
    toTop.classList.toggle('hidden', y < 700);
    toTop.classList.toggle('flex', y >= 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* ---------- Mobile menu ---------- */
  var menuBtn = $('#menu-btn');
  var panel = $('#mobile-panel');
  var iconOpen = $('#icon-open');
  var iconClose = $('#icon-close');
  function setMenu(open) {
    panel.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    iconOpen.classList.toggle('hidden', open);
    iconClose.classList.toggle('hidden', !open);
  }
  menuBtn.addEventListener('click', function () { setMenu(!panel.classList.contains('is-open')); });
  $$('.mobile-link').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  window.addEventListener('resize', function () { if (window.innerWidth >= 1280) setMenu(false); });

  /* ---------- Active nav link while scrolling ---------- */
  var sections = ['home', 'about', 'services', 'works', 'featured', 'products', 'contact']
    .map(function (id) { return document.getElementById(id); }).filter(Boolean);
  if ('IntersectionObserver' in window) {
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var hash = '#' + en.target.id;
        $$('.nav-link').forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === hash); });
        $$('.mobile-link').forEach(function (a) {
          var on = a.getAttribute('href') === hash;
          a.classList.toggle('text-accent', on);
          a.classList.toggle('font-semibold', on);
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { navIO.observe(s); });
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var revIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); revIO.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { revIO.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Modal helpers ---------- */
  var lastFocus = null;
  function openModal(modal) {
    lastFocus = document.activeElement;
    modal.classList.add('is-open');
    document.body.classList.add('no-scroll');
    var btn = $('[data-close]', modal);
    if (btn) btn.focus();
  }
  function closeModal(modal) {
    modal.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $$('.modal').forEach(function (m) {
    m.addEventListener('click', function (e) {
      if (e.target === m || e.target.closest('[data-close]')) closeModal(m);
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      $$('.modal.is-open').forEach(closeModal);
      setMenu(false);
    }
  });

  /* ---------- Works filter ---------- */
  var filterBtns = $$('.filter-btn');
  var items = $$('.work-item');
  var activeCls = ['bg-charcoal', 'text-white', 'border-charcoal'];
  var idleCls = ['border-sand', 'text-ink'];
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.dataset.filter;
      filterBtns.forEach(function (b) {
        var on = b === btn;
        b.setAttribute('aria-pressed', String(on));
        activeCls.forEach(function (c) { b.classList.toggle(c, on); });
        idleCls.forEach(function (c) { b.classList.toggle(c, !on); });
      });
      items.forEach(function (it) {
        var show = f === 'all' || it.dataset.category === f;
        if (show) {
          it.classList.remove('is-hidden');
          it.classList.add('is-entering');
          requestAnimationFrame(function () { requestAnimationFrame(function () { it.classList.remove('is-entering'); }); });
        } else {
          it.classList.add('is-hidden');
        }
      });
    });
  });

  /* ---------- Project detail modal (Our Works + Featured Projects) ---------- */
  var pm = $('#project-modal');
  $$('.project-card').forEach(function (card) {
    card.addEventListener('click', function () {
      var d = card.dataset;
      var img = $('#pm-img');
      img.dataset.failed = '';
      img.src = d.image;
      img.alt = d.title;
      $('#pm-cat').textContent = d.category;
      $('#pm-title').textContent = d.title;
      $('#pm-text').textContent = d.text;
      var loc = $('#pm-loc');
      loc.textContent = d.location || '';
      loc.classList.toggle('hidden', !d.location);
      openModal(pm);
    });
  });

  /* ---------- Gallery lightbox ---------- */
  var lb = $('#lightbox');
  var gItems = $$('.gallery-item');
  var gIndex = 0;
  function showImage(i) {
    gIndex = (i + gItems.length) % gItems.length;
    var el = gItems[gIndex];
    var img = $('#lb-img');
    img.dataset.failed = '';
    img.src = el.dataset.full;
    img.alt = el.dataset.alt;
    $('#lb-cap').textContent = el.dataset.alt;
  }
  gItems.forEach(function (el, i) {
    el.addEventListener('click', function () { showImage(i); openModal(lb); });
  });
  $('#lb-prev').addEventListener('click', function () { showImage(gIndex - 1); });
  $('#lb-next').addEventListener('click', function () { showImage(gIndex + 1); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'ArrowRight') showImage(gIndex + 1);
    if (e.key === 'ArrowLeft') showImage(gIndex - 1);
  });

  /* ---------- Quote form: validation + optional submission ---------- */
  var form = $('#quote-form');
  var statusEl = $('#form-status');
  var submitBtn = $('#submit-btn');

  function setError(input, msg) {
    var p = input.parentElement.querySelector('.field-error');
    input.classList.toggle('has-error', !!msg);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (p) { p.textContent = msg || ''; p.classList.toggle('hidden', !msg); }
  }
  function validate() {
    var f = form.elements;
    var ok = true;
    var rules = [
      [f.name, function (v) { return v.trim() ? '' : 'Please enter your name.'; }],
      [f.email, function (v) { return /^\S+@\S+\.\S+$/.test(v) ? '' : 'Please enter a valid email address.'; }],
      [f.phone, function (v) { return /^[+\d][\d\s()-]{6,}$/.test(v.trim()) ? '' : 'Please enter a valid phone number.'; }],
      [f.type, function (v) { return v ? '' : 'Please choose a project type.'; }],
      [f.message, function (v) { return v.trim().length >= 10 ? '' : 'Please describe your requirements (at least 10 characters).'; }]
    ];
    rules.forEach(function (r) {
      var msg = r[1](r[0].value);
      setError(r[0], msg);
      if (msg) ok = false;
    });
    return ok;
  }
  function showStatus(kind, text) {
    var styles = {
      sent: ['bg-accent/10', 'text-accent-dark'],
      demo: ['bg-beige', 'text-charcoal'],
      error: ['bg-red-50', 'text-red-800']
    };
    Object.keys(styles).forEach(function (k) {
      styles[k].forEach(function (c) { statusEl.classList.remove(c); });
    });
    styles[kind].forEach(function (c) { statusEl.classList.add(c); });
    statusEl.textContent = text;
    statusEl.classList.remove('hidden');
  }

  $$('input, select, textarea', form).forEach(function (el) {
    el.addEventListener('input', function () { if (el.classList.contains('has-error')) setError(el, ''); });
  });

  function buildWhatsAppText(d) {
    var lines = [
      'New inquiry from Stellar Woodworks website',
      '',
      'Name: ' + d.name,
      d.company ? 'Company: ' + d.company : '',
      'Email: ' + d.email,
      'Phone: ' + d.phone,
      'Project type: ' + d.type,
      d.budget ? 'Budget: ' + d.budget : '',
      '',
      'Requirements: ' + d.message
    ];
    return lines.filter(function (l, i) { return l !== '' || i === 1 || i === 8; }).join('\n');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    statusEl.classList.add('hidden');
    if (!validate()) {
      var bad = $('.has-error', form);
      if (bad) bad.focus();
      return;
    }
    var data = {};
    Array.prototype.forEach.call(form.elements, function (el) { if (el.name) data[el.name] = el.value.trim(); });

    var waNumber = (form.dataset.whatsapp || '').replace(/\D/g, '');
    var endpoint = form.dataset.emailEndpoint;
    var mailTo = form.dataset.emailTo || 'nikitazaware77@gmail.com';

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    /* 1) Email: sent in the background through the email service endpoint. */
    var emailPromise = Promise.resolve(false);
    if (endpoint) {
      var payload = {
        _subject: 'New website inquiry from ' + data.name,
        _template: 'table',
        _captcha: 'false',
        Name: data.name,
        Company: data.company || '-',
        Email: data.email,
        Phone: data.phone,
        'Project type': data.type,
        Budget: data.budget || '-',
        Requirements: data.message
      };
      emailPromise = fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (res) { return res.ok; }).catch(function () { return false; });
    }

    /* 2) WhatsApp: opened straight from the click so browsers do not block it. */
    var opened = false;
    if (waNumber) {
      var waUrl = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(buildWhatsAppText(data));
      var w = window.open(waUrl, '_blank');
      if (w) { try { w.opener = null; } catch (err) { /* ignore */ } opened = true; }
      else { window.location.href = waUrl; opened = true; }
    }

    emailPromise.then(function (emailOk) {
      var text = '';
      if (opened && emailOk) text = 'Thank you! WhatsApp has opened with your inquiry (press Send there) and a copy has been emailed to us.';
      else if (opened) text = 'WhatsApp has opened with your inquiry. Please press Send there to complete it.';
      else if (emailOk) text = 'Thank you! Your inquiry has been emailed to us and we will be in touch soon.';
      if (text) {
        showStatus('sent', text);
        form.reset();
      } else {
        showStatus('error', 'Sorry, we could not send your inquiry right now. Please call 9764699483 or email ' + mailTo + '.');
      }
      if (opened && endpoint && !emailOk) {
        var a = document.createElement('a');
        a.href = 'mailto:' + mailTo + '?subject=' + encodeURIComponent('Website inquiry from ' + data.name) + '&body=' + encodeURIComponent(buildWhatsAppText(data));
        a.className = 'ml-1 font-medium underline';
        a.textContent = 'Send by email instead';
        statusEl.appendChild(document.createTextNode(' '));
        statusEl.appendChild(a);
      }
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Inquiry';
    });
  });
})();
