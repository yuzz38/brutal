/* БрутAL барбершоп — main.js · © 2026 Полунин Лев */
(function () {
  'use strict';

  /* === НАСТРОЙКИ =========================================================
     PHONE   — номер для заявок и звонков.
     MAX_URL — ссылка на чат в MAX. Вставьте персональную ссылку владельца
               (MAX → профиль → «Поделиться» → https://max.ru/u/...).
               Пока стоит общая ссылка: текст заявки копируется в буфер,
               открывается MAX, клиент вставляет его в чат с номером.      */
  var PHONE = '+79041424699';
  var PHONE_HUMAN = '8-904-14-24-699';
  var MAX_URL = 'https://max.ru/';
  /* ====================================================================== */

  var doc = document.documentElement;
  doc.classList.add('js');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* год */
  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* шапка + мобильная панель */
  var hdr = $('.hdr'), mbar = $('.mbar'), contacts = $('#contacts');
  function onScroll() {
    var s = window.pageYOffset || doc.scrollTop;
    if (hdr) hdr.classList.toggle('is-solid', s > 20);
    if (mbar && contacts) {
      var r = contacts.getBoundingClientRect();
      mbar.classList.toggle('is-hidden', r.top < window.innerHeight * 0.6 && r.bottom > 0);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* бургер */
  var burger = $('#burger'), nav = $('#nav');
  function closeMenu() {
    if (!nav) return;
    nav.classList.remove('is-open'); hdr.classList.remove('menu');
    document.body.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
  }
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open); hdr.classList.toggle('menu', open);
      document.body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', closeMenu); });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) closeMenu(); });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeMenu(); closeLb(); }
  });

  /* клетки услуг — тап на сенсорных экранах */
  $$('.el').forEach(function (el) {
    el.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      var was = el.classList.contains('is-open');
      $$('.el.is-open').forEach(function (x) { x.classList.remove('is-open'); });
      if (!was) el.classList.add('is-open');
    });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
    });
  });

  /* табы прайса */
  var tabs = $$('.tab');
  function selectTab(t) {
    tabs.forEach(function (x) {
      var on = x === t;
      x.classList.toggle('is-active', on);
      x.setAttribute('aria-selected', String(on));
      x.tabIndex = on ? 0 : -1;
      var p = document.getElementById(x.getAttribute('aria-controls'));
      if (p) { p.hidden = !on; p.classList.toggle('is-active', on); }
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t); });
    t.addEventListener('keydown', function (e) {
      var n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!n) return;
      var nt = tabs[(i + n + tabs.length) % tabs.length];
      selectTab(nt); nt.focus();
    });
  });

  /* слайдер отзывов (scroll-snap + стрелки + точки + свайп нативно) */
  var slider = $('#slider'), prev = $('#slPrev'), next = $('#slNext'), dotsBox = $('#dots');
  if (slider) {
    var cards = $$('.rv', slider), dots = [];
    function step() { return cards[0] ? cards[0].getBoundingClientRect().width + 16 : slider.clientWidth; }
    function perView() { return Math.max(1, Math.round(slider.clientWidth / step())); }
    function pages() { return Math.max(1, cards.length - perView() + 1); }
    function buildDots() {
      dotsBox.innerHTML = ''; dots = [];
      for (var i = 0; i < pages(); i++) {
        var b = document.createElement('button');
        b.type = 'button'; b.tabIndex = -1;
        (function (k) { b.addEventListener('click', function () { go(k); }); })(i);
        dotsBox.appendChild(b); dots.push(b);
      }
      update();
    }
    function cur() { return Math.round(slider.scrollLeft / step()); }
    function go(i) {
      i = Math.max(0, Math.min(pages() - 1, i));
      var left = i * step();
      if ('scrollBehavior' in doc.style) slider.scrollTo({ left: left, behavior: 'smooth' });
      else slider.scrollLeft = left;
    }
    function update() {
      var c = cur();
      dots.forEach(function (d, i) { d.classList.toggle('is-on', i === c); });
      if (prev) prev.disabled = c <= 0;
      if (next) next.disabled = c >= pages() - 1;
    }
    var raf;
    slider.addEventListener('scroll', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
    if (prev) prev.addEventListener('click', function () { go(cur() - 1); });
    if (next) next.addEventListener('click', function () { go(cur() + 1); });
    slider.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(cur() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur() - 1); }
    });
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(buildDots, 150); });
    buildDots();
  }

  /* лайтбокс */
  var lb = $('#lb'), lbImg = $('#lbImg'), lastFocus;
  function closeLb() {
    if (!lb || lb.hidden) return;
    lb.hidden = true; document.body.classList.remove('menu-open');
    if (lastFocus) lastFocus.focus();
  }
  $$('.work').forEach(function (w) {
    w.addEventListener('click', function () {
      lastFocus = w;
      var img = $('img', w);
      lbImg.src = w.getAttribute('data-full');
      lbImg.alt = img ? img.alt : '';
      lb.hidden = false; document.body.classList.add('menu-open');
      $('.lb__x', lb).focus();
    });
  });
  if (lb) lb.addEventListener('click', function (e) { if (e.target !== lbImg) closeLb(); });

  /* тост */
  var toast = $('#toast'), tt;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg; toast.hidden = false;
    clearTimeout(tt); tt = setTimeout(function () { toast.hidden = true; }, 6500);
  }

  /* копирование в буфер с запасным вариантом для старых iOS/Android */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }
  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px';
    document.body.appendChild(ta);
    var range = document.createRange(); range.selectNodeContents(ta);
    var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
    ta.setSelectionRange(0, text.length);
    var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    return ok;
  }

  /* сертификат */
  var form = $('#giftForm');
  if (form) {
    var gTo = $('#gTo'), gFrom = $('#gFrom'), gPhone = $('#gPhone'), gOther = $('#gOther'),
        gOtherWrap = $('#gOtherWrap'), gErr = $('#gErr'), gSms = $('#gSms'), cert = $('#cert');
    var cN = $('#cN'), cS = $('#cS'), cName = $('#cName'), cFrom = $('#cFrom'), cSum = $('#cSum');

    function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽'; }
    function sum() {
      var r = $('input[name=sum]:checked', form);
      if (!r) return 0;
      if (r.value === 'other') return parseInt(gOther.value, 10) || 0;
      return parseInt(r.value, 10);
    }
    function symbol(name) {
      var s = (name || '').trim().replace(/[^A-Za-zА-Яа-яЁё]/g, '');
      if (!s) return '?';
      return s.charAt(0).toUpperCase() + (s.charAt(1) || '').toLowerCase();
    }
    function message() {
      return 'Здравствуйте! Хочу заказать подарочный сертификат в барбершоп «БрутAL».\n' +
        'Кому: ' + gTo.value.trim() + '\n' +
        'Номинал: ' + (sum() ? fmt(sum()).replace(/ /g, ' ') : 'обсудим') + '\n' +
        (gFrom.value.trim() ? 'От кого: ' + gFrom.value.trim() + '\n' : '') +
        'Мой телефон: ' + gPhone.value.trim();
    }
    function render() {
      var n = sum();
      cN.textContent = n || '—';
      cS.textContent = symbol(gTo.value);
      cName.textContent = gTo.value.trim() || 'Имя получателя';
      cFrom.textContent = gFrom.value.trim() || '—';
      cSum.textContent = n ? fmt(n) : '—';
      var sep = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent) ? '&' : '?';
      gSms.href = 'sms:' + PHONE + sep + 'body=' + encodeURIComponent(message());
    }
    var lastSym = '';
    form.addEventListener('input', function () {
      render();
      if (cS.textContent !== lastSym) {
        lastSym = cS.textContent;
        cert.classList.remove('is-pop'); void cert.offsetWidth; cert.classList.add('is-pop');
      }
    });
    $$('input[name=sum]', form).forEach(function (r) {
      r.addEventListener('change', function () {
        gOtherWrap.hidden = r.value !== 'other' || !r.checked;
        if (r.value === 'other' && r.checked) gOther.focus();
        render();
      });
    });

    function validate() {
      var phoneDigits = gPhone.value.replace(/\D/g, '');
      if (!gTo.value.trim()) return 'Введите имя получателя сертификата';
      if (phoneDigits.length < 10) return 'Укажите телефон — мы перезвоним для оформления';
      if (sum() && sum() < 300) return 'Минимальный номинал — 300 ₽';
      return '';
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var err = validate();
      gErr.hidden = !err; gErr.textContent = err;
      if (err) return;
      var text = message();
      var win = window.open(MAX_URL, '_blank');
      if (win) { try { win.opener = null; } catch (x) {} }
      copyText(text).then(function (ok) {
        showToast(ok
          ? 'Текст заявки скопирован. Вставьте его в чат MAX с номером ' + PHONE_HUMAN + '.'
          : 'Отправьте в MAX на ' + PHONE_HUMAN + ': ' + text.replace(/\n/g, ' · '));
      });
      if (!win) window.location.href = MAX_URL;
    });
    gSms.addEventListener('click', function (e) {
      var err = validate();
      if (err) { e.preventDefault(); gErr.hidden = false; gErr.textContent = err; }
    });
    render();
  }

  /* появление блоков */
  var targets = $$('.sec__head, .table, .reaction li, .story__body, .panel, .tabs, .team, .quote__in, .work, .gift > *, .rv, .faq, .contacts__grid > *');
  if ('IntersectionObserver' in window) {
    targets.forEach(function (t) { t.classList.add('rv-in'); });
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('is-in'); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    targets.forEach(function (t) { io.observe(t); });
  }
})();
