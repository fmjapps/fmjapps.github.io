// FMJ Software — uygulamalar vitrini etkileşimleri
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');
  // Hareketi azalt açıksa yalnız büyük hareketler (paralaks, eğilme) kapanır; halka yavaş döner
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // İletişim formunun gönderildiği Cloudflare Worker
  var FORM_URL = 'https://form.fmjapps.com/';

  // Kapalı testteki uygulamalar: Google Grubu ve Play paket adı
  // soon: yayın onayı bekleniyor; 14 gün notu gösterilmez
  var TESTS = {
    kayip: { group: 'kayip-esya-testers', pkg: 'com.oyunatolyesi.kayipesya', acc: '#9CC98F' },
    koleksiyoncu: { group: 'the-collector-testers', pkg: 'com.fmjapps.collector', acc: '#E2B75E' },
    ezber: { group: 'memorize-testers', pkg: 'com.fmjapps.ezberasistani', acc: '#2FC4A8' },
    paydos: { group: 'paydos-test', pkg: 'com.zamankilidi.app', acc: '#6E8BFF', soon: true }
  };

  // Metni HTML'e yazmadan önce zararsız hâle getirir
  function esc(str) { return String(str).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function store(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }
  function load(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }

  /* ---------- Dil ---------- */
  // Türkçe metin HTML'de durur. Diğer diller i18n/<kod>.json dosyalarından, seçilince yüklenir.
  var LANGS = [
    ['tr', 'Türkçe'], ['en', 'English'], ['es', 'Español'], ['pt', 'Português'], ['fr', 'Français'], ['de', 'Deutsch'],
    ['it', 'Italiano'], ['ru', 'Русский'], ['ar', 'العربية'], ['hi', 'हिन्दी'], ['zh', '中文'],
    ['ja', '日本語'], ['ko', '한국어'], ['id', 'Bahasa Indonesia']
  ];
  var RTL = { ar: true };
  // Yalnızca kodda geçen Türkçe metinler (sayfadakiler HTML'den okunur)
  var TR = {
    'ph.pick': 'Önce bir konu seç', 'ph.msg': 'Mesajını yaz…', 'ph.name': 'Adın', 'ph.mail': 'E-posta adresin',
    'chat.hello': 'Merhaba! Ne hakkında yazıyorsun?',
    'chat.askMsg': 'Anlat bakalım, dinliyoruz.',
    'chat.askName': 'Teşekkürler! Sana hangi isimle dönelim?',
    'chat.askMail': 'Son olarak, cevabı hangi e-posta adresine yazalım?',
    'chat.badMail': 'Bu e-posta adresi eksik görünüyor, bir daha yazar mısın?',
    'chat.ok': 'Mesajın bize ulaştı. En kısa sürede {email} adresine dönüş yapacağız.',
    'chat.err': 'Bir sorun çıktı, mesaj gönderilemedi. Tekrar deneyebilir ya da contact@fmjapps.com adresine yazabilirsin.',
    'chat.retry': 'Tekrar dene', 'chat.done': 'Mesajın gönderildi',
    'contact.copied': 'Adres kopyalandı',
    'form.sending': 'Gönderiliyor…',
    'page.home': 'Giriş'
  };
  var DICT = {};
  var curLang = root.getAttribute('data-lang') || 'tr';
  var trMeta = { title: document.title, desc: document.querySelector('meta[name=description]').content };

  var textEls = document.querySelectorAll('[data-i18n]');
  var htmlEls = document.querySelectorAll('[data-i18n-html]');
  var ariaEls = document.querySelectorAll('[data-i18n-aria]');
  var phEls = document.querySelectorAll('[data-i18n-ph]');
  var imgEls = document.querySelectorAll('img[data-en]');
  var pageEls = document.querySelectorAll('a[data-en-href]');
  textEls.forEach(function (el) { el._tr = el.textContent; });
  htmlEls.forEach(function (el) { el._tr = el.innerHTML; });
  ariaEls.forEach(function (el) { el._tr = el.getAttribute('aria-label'); });
  imgEls.forEach(function (el) { el._tr = el.getAttribute('src'); });
  pageEls.forEach(function (el) { el._trHref = el.getAttribute('href'); });

  function t(key) {
    if (curLang === 'tr') return TR[key];
    var d = DICT[curLang] || {};
    return d[key] || (DICT.en && DICT.en[key]) || TR[key];
  }

  // Bölüm başlıkları kelime kelime belirir
  var splitEls = document.querySelectorAll('.sec-head h2:not(.no-split)');
  function splitWords() {
    splitEls.forEach(function (h) {
      var words = h.textContent.trim().split(/\s+/);
      h.innerHTML = words.map(function (w, i) { return '<span class="w" style="--i:' + i + '">' + esc(w) + '</span>'; }).join(' ');
      h.classList.add('split');
    });
  }

  // Sahnedeki uygulama adı kendi sütununa sığacak kadar küçülür
  function fitNames() {
    document.querySelectorAll('.sh-name').forEach(function (h) {
      h.style.fontSize = '';
      var box = h.parentNode.clientWidth;
      if (!box) return;
      var size = parseFloat(getComputedStyle(h).fontSize);
      var longest = 0;
      // En uzun kelime satıra sığmalı
      var probe = document.createElement('span');
      probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;width:max-content;font:inherit;letter-spacing:inherit';
      h.appendChild(probe);
      h.textContent.trim().split(/\s+/).forEach(function (w) { probe.textContent = w; longest = Math.max(longest, probe.offsetWidth); });
      probe.remove();
      if (longest > box) h.style.fontSize = (size * box / longest * 0.98).toFixed(1) + 'px';
    });
  }
  window.addEventListener('resize', fitNames);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitNames);

  var langBtn = document.getElementById('langBtn');
  var langMenu = document.getElementById('langMenu');
  var langCode = document.getElementById('langCode');

  function render(lang) {
    curLang = lang;
    var d = lang === 'tr' ? null : DICT[lang];
    root.setAttribute('data-lang', lang);
    root.lang = lang;
    root.dir = RTL[lang] ? 'rtl' : 'ltr';
    textEls.forEach(function (el) { var k = el.getAttribute('data-i18n'); el.textContent = d && d[k] ? d[k] : el._tr; });
    htmlEls.forEach(function (el) { var k = el.getAttribute('data-i18n-html'); el.innerHTML = d && d[k] ? d[k] : el._tr; });
    ariaEls.forEach(function (el) { var k = el.getAttribute('data-i18n-aria'); el.setAttribute('aria-label', d && d[k] ? d[k] : el._tr); });
    phEls.forEach(function (el) { var k = el.getAttribute('data-i18n-ph'); if (el.disabled) return; el.setAttribute('placeholder', t(k)); });
    // Türkçe dışındaki dillerde İngilizce ekran görüntüleri gösterilir
    imgEls.forEach(function (el) { el.src = d ? el.getAttribute('data-en') : el._tr; });
    // Uygulama sayfaları her dilde var: /en/... adresi seçili dile çevrilir
    pageEls.forEach(function (el) { el.setAttribute('href', d ? el.getAttribute('data-en-href').replace('/en/', '/' + lang + '/') : el._trHref); });
    document.title = d && d['meta.title'] ? d['meta.title'] : trMeta.title;
    document.querySelector('meta[name=description]').content = d && d['meta.desc'] ? d['meta.desc'] : trMeta.desc;
    splitWords();
    splitEls.forEach(function (h) { if (h.getBoundingClientRect().top < innerHeight) h.classList.add('in'); });
    if (typeof rebuildShowcase === 'function') rebuildShowcase();
    fitNames();
    langCode.textContent = lang.toUpperCase();
    Array.prototype.forEach.call(langMenu.children, function (li) {
      var on = li.getAttribute('data-lang') === lang;
      li.classList.toggle('on', on);
      li.setAttribute('aria-selected', on);
    });
    root.classList.remove('i18n-wait');
    document.dispatchEvent(new CustomEvent('fmj:lang', { detail: lang }));
  }

  function setLang(lang, save) {
    if (!LANGS.some(function (l) { return l[0] === lang; })) lang = 'en';
    if (save) {
      // Her dilin kendi adresi var: seçilen dilin sayfası açılır
      store('fmj-lang', lang);
      // Hedef adres sayfanın hreflang bağlantısından okunur
      var alt = document.querySelector('link[rel="alternate"][hreflang="' + lang + '"]');
      if (lang !== curLang && alt) { location.href = alt.getAttribute('href').replace(/^https?:\/\/[^\/]+/, '') + location.hash; return; }
    }
    if (lang === 'tr' || DICT[lang]) { render(lang); return; }
    fetch('/i18n/' + lang + '.json')
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (json) { DICT[lang] = json; render(lang); })
      .catch(function () { root.classList.remove('i18n-wait'); if (lang !== 'en') setLang('en', false); });
  }

  // Dil menüsü
  LANGS.forEach(function (l) {
    var li = document.createElement('li');
    li.setAttribute('role', 'option');
    li.setAttribute('data-lang', l[0]);
    li.setAttribute('lang', l[0]);
    li.tabIndex = 0;
    li.innerHTML = '<span>' + l[1] + '</span><b>' + l[0].toUpperCase() + '</b>';
    li.addEventListener('click', function () { setLang(l[0], true); closeMenu(); langBtn.focus(); });
    li.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); li.click(); }
      if (e.key === 'ArrowDown' && li.nextElementSibling) { e.preventDefault(); e.stopPropagation(); li.nextElementSibling.focus(); }
      if (e.key === 'ArrowUp' && li.previousElementSibling) { e.preventDefault(); e.stopPropagation(); li.previousElementSibling.focus(); }
    });
    langMenu.appendChild(li);
  });
  function closeMenu() { langMenu.hidden = true; langBtn.setAttribute('aria-expanded', 'false'); }
  langBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = langMenu.hidden;
    langMenu.hidden = !open;
    langBtn.setAttribute('aria-expanded', open);
    if (open) { var on = langMenu.querySelector('.on') || langMenu.firstChild; on.focus(); }
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('#lang')) closeMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !langMenu.hidden) { closeMenu(); langBtn.focus(); } });
  // Menü açıkken teker ve dokunma sayfayı değiştirmesin
  langMenu.addEventListener('wheel', function (e) { e.stopPropagation(); }, { passive: true });
  langMenu.addEventListener('touchmove', function (e) { e.stopPropagation(); }, { passive: true });

  setLang(root.getAttribute('data-lang') || 'tr', false);

  /* ---------- Tema ---------- */
  var themeMeta = document.querySelector('meta[name=theme-color]');
  function syncThemeMeta() { themeMeta.content = root.getAttribute('data-theme') === 'light' ? '#F6EEF0' : '#0D0507'; }
  syncThemeMeta();
  document.getElementById('themeBtn').addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    store('fmj-tema', next);
    syncThemeMeta();
  });

  /* ---------- Kaydırma: menü, ilerleme çubuğu, telefonlarda paralaks ---------- */
  var nav = document.getElementById('nav');
  var progress = document.getElementById('progress');
  var parallax = reduced ? [] : Array.prototype.slice.call(document.querySelectorAll('.p-media .phone, .app-media .phone'));
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
      nav.classList.toggle('scrolled', y > 12);
      progress.style.setProperty('--p', h > 0 ? (y / h).toFixed(4) : 0);
      parallax.forEach(function (el) {
        var r = el.parentNode.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        var c = (r.top + r.height / 2 - innerHeight / 2) / innerHeight; // -1..1
        el.style.setProperty('--pl', (c * -40).toFixed(1) + 'px');
      });
    });
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  var navLinks = document.querySelectorAll('.links a');
  if ('IntersectionObserver' in window) {
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    [].forEach(function (id) { secObs.observe(document.getElementById(id)); });
  }

  /* ---------- Kaydırınca belirme ---------- */
  var reveals = document.querySelectorAll('.reveal, .split');
  document.querySelectorAll('.reveal').forEach(function (el) {
    var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.classList.contains('reveal'); });
    el.style.setProperty('--d', (sibs.indexOf(el) * 0.08) + 's');
  });
  if ('IntersectionObserver' in window) {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); revObs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { revObs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Sayaçlar ---------- */
  document.querySelectorAll('.stats dt').forEach(function (dt) {
    var end = parseInt(dt.textContent, 10);
    if (!end) return;
    dt.textContent = '0';
    setTimeout(function () {
      var start = performance.now();
      (function step(now) {
        var k = Math.min(1, (now - start) / 900);
        dt.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      })(start);
    }, 500);
  });

  /* ---------- Vitrin: sürekli dönen 3D halka ---------- */
  var rebuildShowcase = function () {};
  (function () {
    var sc = document.getElementById('showcase');
    if (!sc) return;
    var stage = document.getElementById('scStage');
    var ring = document.getElementById('scRing');
    var dotsWrap = document.getElementById('scDots');
    var caps = sc.querySelectorAll('.sc-cap');
    var word = document.getElementById('scWord');
    var tabs = sc.querySelectorAll('.sc-tab');
    var originals = Array.prototype.slice.call(ring.querySelectorAll('.sc-card'));
    originals.forEach(function (c) { c.remove(); });

    var SLOTS = 6, STEP = 360 / SLOTS, SPEED = 9; // derece/saniye
    var set = 'games', apps = [], cards = [];
    var angle = 0, vel = 0, target = null, hover = false, drag = null, visible = true, front = -1;

    function norm(a) { a = ((a + 180) % 360 + 360) % 360 - 180; return a; }

    function build(newSet, animate) {
      set = newSet;
      sc.setAttribute('data-set', set);
      tabs.forEach(function (tb) {
        var on = tb.getAttribute('data-set') === set;
        tb.classList.toggle('on', on);
        tb.setAttribute('aria-selected', on);
      });
      var fill = function () {
        ring.innerHTML = '';
        apps = originals.filter(function (c) { return c.getAttribute('data-set') === set; });
        cards = [];
        // Halka dolu görünsün diye uygulamalar tekrarlanır (3 → 6, 2 → 6)
        for (var i = 0; i < SLOTS; i++) {
          var src = apps[i % apps.length];
          var c = src.cloneNode(true);
          c._app = i % apps.length;
          c.style.setProperty('--a', (i * STEP) + 'deg');
          ring.appendChild(c);
          cards.push(c);
        }
        dotsWrap.innerHTML = '';
        apps.forEach(function (a, i) {
          var b = document.createElement('button');
          b.type = 'button';
          b.setAttribute('aria-label', String(i + 1));
          b.addEventListener('click', function () { spinTo(i); });
          dotsWrap.appendChild(b);
        });
        angle = 0; vel = 0; target = null; front = -1;
        paint();
      };
      if (animate) {
        ring.classList.add('swap');
        setTimeout(function () { fill(); ring.classList.remove('swap'); }, 330);
      } else fill();
    }
    rebuildShowcase = function () { build(set, false); };

    // Önde en yakın kartı bulup parlaklık, ad kutusu ve renkleri günceller
    function paint() {
      ring.style.transform = 'translateZ(calc(var(--r) * -1)) rotateY(' + angle.toFixed(2) + 'deg)';
      var best = 999, bi = 0;
      cards.forEach(function (c, i) {
        var a = norm(i * STEP + angle);
        var k = Math.cos(a * Math.PI / 180); // 1 önde, -1 arkada
        c.style.setProperty('--lit', (0.28 + 0.72 * Math.max(0, k)).toFixed(3));
        c.style.setProperty('--sat', (0.5 + 0.5 * Math.max(0, k)).toFixed(3));
        if (Math.abs(a) < best) { best = Math.abs(a); bi = i; }
      });
      if (bi !== front) {
        front = bi;
        cards.forEach(function (c, i) { c.classList.toggle('front', i === bi); c.tabIndex = i === bi ? 0 : -1; });
        var app = cards[bi]._app, card = cards[bi];
        var id = card.getAttribute('href').slice(1);
        caps.forEach(function (cp) {
          var on = cp.getAttribute('data-app') === id;
          cp.classList.toggle('on', on);
          if (on && word) {
            var name = cp.querySelector('strong').textContent;
            word.classList.add('fade');
            clearTimeout(word._t);
            word._t = setTimeout(function () {
              // Uzun adlar sahneye sığsın diye yazı boyutu küçülür
              word.textContent = name;
              word.style.fontSize = '';
              var max = stage.clientWidth * 0.96, w = word.scrollWidth;
              if (w > max) word.style.fontSize = (parseFloat(getComputedStyle(word).fontSize) * max / w).toFixed(1) + 'px';
              word.classList.remove('fade');
            }, 250);
          }
        });
        Array.prototype.forEach.call(dotsWrap.children, function (b, i) { b.classList.toggle('on', i === app); });
        var acc = card.style.getPropertyValue('--acc');
        stage.style.setProperty('--acc', acc);
        var heroEl = document.getElementById('hero');
        if (heroEl) heroEl.style.setProperty('--acc', acc);
        sc.style.setProperty('--acc-now', acc);
      }
    }

    // i. uygulamayı en kısa yoldan öne getirir
    function spinTo(appIdx) {
      var bestA = null;
      cards.forEach(function (c, i) {
        if (c._app !== appIdx) return;
        var d = norm(-(i * STEP) - angle);
        if (bestA === null || Math.abs(d) < Math.abs(bestA)) bestA = d;
      });
      target = angle + bestA;
      vel = 0;
    }
    function step(dir) {
      var snapped = Math.round(angle / STEP) * STEP;
      target = snapped - dir * STEP;
      vel = 0;
    }

    var last = performance.now();
    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!drag) {
        if (target !== null) {
          var d = target - angle;
          angle += d * Math.min(1, dt * 7);
          if (Math.abs(d) < 0.05) { angle = target; target = null; }
        } else if (Math.abs(vel) > 0.5) {
          angle += vel * dt;
          vel *= Math.pow(0.04, dt); // savrulma yavaşça söner
        } else if (!hover) {
          angle -= (reduced ? SPEED * 0.6 : SPEED) * dt;
        }
      }
      paint();
      if (visible) requestAnimationFrame(frame);
    }

    // Fareyle ya da parmakla sürükleme
    stage.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      drag = { x: e.clientX, a: angle, t: performance.now(), moved: false, lastX: e.clientX, lastT: performance.now() };
      target = null; vel = 0;
      drag.id = e.pointerId;
    });
    stage.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 4) {
        // Gerçek sürükleme başladıysa imleci yakala; basit tıklama bağlantıya gider
        drag.moved = true;
        stage.setPointerCapture(drag.id);
        stage.classList.add('dragging');
      }
      if (!drag.moved) return;
      angle = drag.a + dx * 0.32;
      var now = performance.now();
      if (now - drag.lastT > 0) vel = (e.clientX - drag.lastX) * 0.32 / ((now - drag.lastT) / 1000);
      drag.lastX = e.clientX; drag.lastT = now;
    });
    function endDrag(e) {
      if (!drag) return;
      var moved = drag.moved;
      drag = null;
      stage.classList.remove('dragging');
      vel = Math.max(-400, Math.min(400, vel));
      if (!moved) vel = 0;
      stage._moved = moved;
    }
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);
    // Sürüklemeden tıklandıysa: öndeki karta basınca bölümüne gider, yandakine basınca öne gelir
    ring.addEventListener('click', function (e) {
      var c = e.target.closest('.sc-card');
      if (!c) return;
      if (stage._moved) { e.preventDefault(); stage._moved = false; return; }
      if (!c.classList.contains('front')) { e.preventDefault(); spinTo(c._app); }
    });
    stage.addEventListener('mouseenter', function () { hover = true; });
    stage.addEventListener('mouseleave', function () { hover = false; });

    tabs.forEach(function (tb) {
      tb.addEventListener('click', function () {
        if (tb.getAttribute('data-set') !== set) build(tb.getAttribute('data-set'), true);
      });
    });
    sc.querySelectorAll('.sc-arrow').forEach(function (b) {
      b.addEventListener('click', function () { step(parseInt(b.getAttribute('data-dir'), 10)); });
    });
    sc.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    });

    build('games', false);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        var was = visible;
        visible = en[0].isIntersecting;
        if (visible && !was) { last = performance.now(); requestAnimationFrame(frame); }
      }).observe(stage);
    }
    requestAnimationFrame(frame);
  })();

  /* ---------- Reels gibi sayfa geçişi ---------- */
  var goToPage = function () {};
  (function () {
    var pages = Array.prototype.slice.call(document.querySelectorAll('.page'));
    if (!pages.length) return;
    var pager = document.getElementById('pager');
    var modal = document.getElementById('joinModal');
    var navLinks = document.querySelectorAll('.links a');
    var cur = 0, anim = null, lockUntil = 0;

    function top(el) { return el.getBoundingClientRect().top + window.scrollY; }
    function label(p) {
      var k = p.getAttribute('data-page');
      if (k === 'hero') return t('page.home');
      var h = p.querySelector('.ap-body h3, .sec-head h2, .contact-head h2');
      return h ? h.textContent.trim().split(':')[0] : k;
    }
    function buildPager() {
      pager.innerHTML = '';
      pages.forEach(function (p, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', label(p));
        b.innerHTML = '<span>' + esc(label(p)) + '</span>';
        var acc = p.style.getPropertyValue('--acc');
        if (acc) b.style.setProperty('--pager-acc', acc);
        b.addEventListener('click', function () { goTo(i); });
        pager.appendChild(b);
      });
      mark();
    }
    function mark() {
      Array.prototype.forEach.call(pager.children, function (b, i) { b.classList.toggle('on', i === cur); });
      pages[cur].classList.add('in');
      var p = pages[cur], g = p.getAttribute('data-group'), id = p.id;
      var target = g === 'games' ? '#oyunlar' : g === 'apps' ? '#uygulamalar' : id ? '#' + id : '';
      navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === target); });
    }
    // Şu an ekranın üstüne en yakın sayfa
    function nearest() {
      var best = 0, bd = Infinity;
      pages.forEach(function (p, i) {
        var r = p.getBoundingClientRect();
        var d = r.top <= 1 && r.bottom > innerHeight * 0.5 ? 0 : Math.abs(r.top);
        if (d < bd) { bd = d; best = i; }
      });
      return best;
    }
    function tween(to) {
      cancelAnimationFrame(anim);
      var from = window.scrollY, dist = to - from, t0 = performance.now(), dur = 720;
      if (Math.abs(dist) < 2) { lockUntil = performance.now() + 300; return; }
      document.documentElement.style.scrollBehavior = 'auto';
      (function step(now) {
        var k = Math.min(1, (now - t0) / dur);
        var e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        window.scrollTo(0, from + dist * e);
        if (k < 1) anim = requestAnimationFrame(step);
        else { anim = null; lockUntil = performance.now() + 420; document.documentElement.style.scrollBehavior = ''; }
      })(t0);
    }
    function goTo(i, dir) {
      i = Math.max(0, Math.min(pages.length - 1, i));
      var p = pages[i];
      // Yukarı dönerken uzun sayfanın altına gelinir
      var y = top(p);
      if (dir < 0 && p.offsetHeight > innerHeight + 4) y = y + p.offsetHeight - innerHeight;
      cur = i;
      mark();
      tween(y);
    }
    goToPage = goTo;
    function busy() { return anim !== null || performance.now() < lockUntil; }
    // Yatay tutulan telefonda (çok alçak ekran) sayfa geçişi kapanır, sayfa normal kayar
    function flat() { return innerHeight < 430; }
    // Sayfa ekrana sığmıyorsa önce kendi içinde kayar
    function nativeFirst(dir) {
      var r = pages[cur].getBoundingClientRect();
      // Ekrana sığan sayfada iç kaydırma yoktur; taşan sayfanın sonu her zaman görülebilir
      if (pages[cur].offsetHeight - innerHeight < 8) return dir > 0 && cur === pages.length - 1;
      if (dir > 0 && r.bottom > innerHeight + 2) return true;
      if (dir < 0 && r.top < -2) return true;
      if (dir > 0 && cur === pages.length - 1) return true; // alttaki bilgi alanı
      return false;
    }
    function scrollableInside(target, dir) {
      var el = target.closest && target.closest('.msgs, .modal-card, textarea');
      if (!el) return false;
      if (dir > 0) return el.scrollTop + el.clientHeight < el.scrollHeight - 1;
      return el.scrollTop > 0;
    }

    window.addEventListener('scroll', function () { if (!anim) { var n = nearest(); if (n !== cur) { cur = n; mark(); } } }, { passive: true });

    window.addEventListener('wheel', function (e) {
      if (e.ctrlKey || !modal.hidden || flat()) return;
      var dir = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0;
      if (!dir || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (scrollableInside(e.target, dir)) return;
      if (anim) { e.preventDefault(); return; }
      if (nativeFirst(dir)) return;
      e.preventDefault();
      if (busy() || Math.abs(e.deltaY) < 3) return;
      goTo(cur + dir, dir);
    }, { passive: false });

    var ty = null, tx = 0, tMode = null;
    window.addEventListener('touchstart', function (e) {
      if (!modal.hidden || e.touches.length > 1 || flat()) { ty = null; return; }
      ty = e.touches[0].clientY; tx = e.touches[0].clientX; tMode = null;
    }, { passive: true });
    window.addEventListener('touchmove', function (e) {
      if (ty === null) return;
      var dy = ty - e.touches[0].clientY, dx = tx - e.touches[0].clientX;
      if (tMode === null) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        var dir = dy > 0 ? 1 : -1;
        // En üstte aşağı çekmek tarayıcıya kalır: sayfa yenilenir
        if (dir < 0 && cur === 0 && window.scrollY <= 0) tMode = 'native';
        else if (Math.abs(dx) > Math.abs(dy) || scrollableInside(e.target, dir) || nativeFirst(dir)) tMode = 'native';
        else tMode = 'page';
      }
      if (tMode === 'page') e.preventDefault();
    }, { passive: false });
    window.addEventListener('touchend', function (e) {
      if (ty === null) return;
      var dy = ty - e.changedTouches[0].clientY;
      if (tMode === 'page' && Math.abs(dy) > 28 && !busy()) goTo(cur + (dy > 0 ? 1 : -1), dy > 0 ? 1 : -1);
      ty = null;
    });

    document.addEventListener('keydown', function (e) {
      if (!modal.hidden || e.altKey || e.ctrlKey || e.metaKey || flat()) return;
      var t = e.target;
      if (t.closest && t.closest('input, textarea, select, [contenteditable], .sc-stage, .screen, .sc-tabs, #lang')) return;
      var dir = 0;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) dir = 1;
      else if (e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) dir = -1;
      else if (e.key === 'Home') { e.preventDefault(); goTo(0); return; }
      else if (e.key === 'End') { e.preventDefault(); goTo(pages.length - 1); return; }
      if (!dir || nativeFirst(dir)) return;
      e.preventDefault();
      if (!busy()) goTo(cur + dir, dir);
    });

    // #kayip, #oyunlar, #iletisim gibi bağlantılar ilgili sayfaya kayar
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented) return;
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href').slice(1);
      var el = id === 'top' ? pages[0] : document.getElementById(id);
      var p = el && el.closest('.page');
      if (!p) return;
      if (a.closest('.sc-card') && !a.classList.contains('front')) return;
      e.preventDefault();
      goTo(pages.indexOf(p));
      try { history.replaceState(null, '', id === 'top' ? location.pathname : '#' + id); } catch (err) {}
    });

    // Adres çubuğu gizlenip görününce ekran boyu değişir: sayfa yeniden üst kenara oturur
    var resnap = null;
    window.addEventListener('resize', function () {
      clearTimeout(resnap);
      resnap = setTimeout(function () {
        var el = document.activeElement;
        if (anim || cur === pages.length - 1 || (el && /^(INPUT|TEXTAREA)$/.test(el.tagName))) return;
        var p = pages[cur], y = top(p);
        if (p.offsetHeight - innerHeight < 8 && Math.abs(window.scrollY - y) > 1) window.scrollTo(0, y);
      }, 140);
    });

    buildPager();
    document.addEventListener('fmj:lang', function () { buildPager(); });
    var start = location.hash.slice(1);
    var el = start && document.getElementById(start);
    if (el && el.closest('.page')) {
      window.addEventListener('load', function () {
        var p = el.closest('.page');
        setTimeout(function () { window.scrollTo(0, top(p)); cur = pages.indexOf(p); mark(); }, 0);
      });
    }
  })();

  /* ---------- Ekran görüntüsü kaydırıcıları ---------- */
  document.querySelectorAll('.shots').forEach(function (track) {
    var slides = track.querySelectorAll('img');
    var dotsWrap = track.closest('.p-media, .app-media').querySelector('.dots');
    var dots = [];
    var index = 0, timer = null, visible = false, userTouched = false;

    slides.forEach(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.tabIndex = -1;
      b.addEventListener('click', function () { userTouched = true; go(i); });
      dotsWrap.appendChild(b);
      dots.push(b);
    });

    function mark(i) {
      index = i;
      dots.forEach(function (d, j) { d.classList.toggle('on', j === i); });
    }
    function go(i) {
      i = (i + slides.length) % slides.length;
      track.scrollTo({ left: i * track.clientWidth, behavior: reduced ? 'auto' : 'smooth' });
      mark(i);
    }
    mark(0);

    var raf = 0;
    track.addEventListener('scroll', function () {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        var i = Math.round(Math.abs(track.scrollLeft) / track.clientWidth);
        if (i !== index) mark(Math.min(i, slides.length - 1));
      });
    }, { passive: true });

    ['pointerdown', 'touchstart', 'wheel'].forEach(function (ev) {
      track.addEventListener(ev, function () { userTouched = true; }, { passive: true });
    });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { userTouched = true; go(index + 1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { userTouched = true; go(index - 1); e.preventDefault(); }
    });

    // Görünürken kendiliğinden ilerler; kullanıcı dokununca durur
    function tick() { if (visible && !userTouched && !document.hidden) go(index + 1); }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible && !timer) timer = setInterval(tick, 3200);
        if (!visible && timer) { clearInterval(timer); timer = null; }
      }, { threshold: 0.5 }).observe(track);
    }
    track.addEventListener('mouseenter', function () { userTouched = true; });
  });

  /* ---------- Fareyle eğilme ve ışık ---------- */
  if (finePointer && !reduced) {
    document.querySelectorAll('[data-tilt]').forEach(function (el) {
      var host = el.parentNode;
      host.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--ry', (x * 10).toFixed(2) + 'deg');
        el.style.setProperty('--rx', (-y * 8).toFixed(2) + 'deg');
      });
      host.addEventListener('pointerleave', function () {
        el.style.setProperty('--ry', '0deg');
        el.style.setProperty('--rx', '0deg');
      });
    });
    document.querySelectorAll('.app-card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- Bildirim ---------- */
  var toast = document.getElementById('toast');
  var toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2000);
  }

  /* ---------- Kapalı teste katılım penceresi ---------- */
  (function () {
    var modal = document.getElementById('joinModal');
    var card = modal.querySelector('.modal-card');
    var steps = modal.querySelectorAll('.step');
    var links = [document.getElementById('jmGroup'), document.getElementById('jmOptin'), document.getElementById('jmPlay')];
    var app = null, lastFocus = null;

    function paint() {
      var done = parseInt(load('fmj-join-' + app) || '0', 10);
      steps.forEach(function (s, i) {
        s.classList.toggle('done', i < done);
        s.classList.toggle('current', i === Math.min(done, 2));
      });
    }
    function open(key, trigger) {
      var cfg = TESTS[key];
      if (!cfg) return;
      app = key;
      lastFocus = trigger || document.activeElement;
      var section = document.getElementById(key);
      document.getElementById('jmTitle').textContent = section.querySelector('h3').textContent;
      document.getElementById('jmIcon').src = section.querySelector('.p-icon').getAttribute('src');
      card.style.setProperty('--acc', cfg.acc);
      links[0].href = 'https://groups.google.com/g/' + cfg.group;
      links[1].href = 'https://play.google.com/apps/testing/' + cfg.pkg;
      links[2].href = 'https://play.google.com/store/apps/details?id=' + cfg.pkg;
      modal.querySelector('.jm-note').hidden = !!cfg.soon;
      paint();
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      modal.querySelector('.step.current .btn').focus();
    }
    function close() {
      modal.hidden = true;
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }
    links.forEach(function (a, i) {
      a.addEventListener('click', function () {
        var done = parseInt(load('fmj-join-' + app) || '0', 10);
        if (i + 1 > done) store('fmj-join-' + app, String(i + 1));
        setTimeout(paint, 250);
      });
    });
    document.querySelectorAll('[data-join]').forEach(function (b) {
      b.addEventListener('click', function () { open(b.getAttribute('data-join'), b); });
    });
    modal.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) {
      if (modal.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        // Odak pencerenin içinde kalsın
        var f = card.querySelectorAll('a[href], button');
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
        else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
      }
    });
  })();

  /* ---------- İletişim: e-posta kopyalama ---------- */
  document.getElementById('copyMail').addEventListener('click', function () {
    var mail = this.getAttribute('data-mail');
    var done = function () { showToast(t('contact.copied')); };
    if (navigator.clipboard) navigator.clipboard.writeText(mail).then(done, function () { location.href = 'mailto:' + mail; });
    else location.href = 'mailto:' + mail;
  });

  /* ---------- İletişim: sohbet gibi ilerleyen form ---------- */
  (function () {
    var msgs = document.getElementById('msgs');
    var form = document.getElementById('composer');
    var input = document.getElementById('chatIn');
    var send = document.getElementById('chatSend');
    var reset = document.getElementById('chatReset');
    var hp = form.querySelector('input[name=website]');
    var SUBJECTS = [
      { v: 'general', key: null, label: 'FMJ Software' },
      { v: 'kayip', key: 'kayip.name' }, { v: 'koleksiyoncu', key: 'kol.short' }, { v: 'prizma', key: 'prizma.name' },
      { v: 'ezber', key: 'ezber.short' }, { v: 'paydos', key: 'paydos.name' }
    ];
    // Adımlar: 0 konu, 1 mesaj, 2 ad, 3 e-posta, 4 gönderiliyor/bitti
    var stepN = 0, data = {};

    function label(sub) {
      if (!sub.key) return sub.label;
      var el = document.querySelector('[data-i18n="' + sub.key + '"]');
      return el ? el.textContent : sub.v;
    }
    function bubble(text, who) {
      var d = document.createElement('div');
      d.className = 'bub ' + who;
      d.textContent = text;
      msgs.appendChild(d);
      msgs.scrollTop = msgs.scrollHeight;
      return d;
    }
    function typing(then) {
      var d = document.createElement('div');
      d.className = 'bub them typing';
      d.innerHTML = '<i></i><i></i><i></i>';
      msgs.appendChild(d);
      setTimeout(function () { d.remove(); then(); }, reduced ? 50 : 650);
    }
    function ask(key, ph, enable) {
      typing(function () {
        bubble(t(key), 'them');
        input.setAttribute('placeholder', t(ph));
        input.disabled = send.disabled = !enable;
        if (enable) input.focus({ preventScroll: true });
      });
    }
    function chooseSubject(sub) {
      var ch = msgs.querySelector('.choices');
      if (ch) ch.remove();
      data.subject = sub.v;
      data.subjectLabel = label(sub);
      bubble(data.subjectLabel, 'me');
      stepN = 1;
      ask('chat.askMsg', 'ph.msg', true);
    }
    function start(preset) {
      msgs.innerHTML = '';
      data = {};
      stepN = 0;
      reset.hidden = true;
      input.value = '';
      input.disabled = send.disabled = true;
      input.setAttribute('placeholder', t('ph.pick'));
      bubble(t('chat.hello'), 'them');
      var ch = document.createElement('div');
      ch.className = 'choices';
      SUBJECTS.forEach(function (sub) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = label(sub);
        b.addEventListener('click', function () { chooseSubject(sub); });
        ch.appendChild(b);
      });
      msgs.appendChild(ch);
      if (preset) {
        var sub = SUBJECTS.filter(function (x) { return x.v === preset; })[0];
        if (sub) chooseSubject(sub);
      }
    }
    function autosize() { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 160) + 'px'; }
    input.addEventListener('input', autosize);
    // Enter gönderir, Shift+Enter yeni satır açar
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); }
    });

    function submitAll() {
      stepN = 4;
      input.disabled = send.disabled = true;
      input.setAttribute('placeholder', t('form.sending'));
      var wait = bubble(t('form.sending'), 'them');
      wait.classList.add('muted');
      var payload = {
        name: data.name, email: data.email, message: data.message,
        subject: data.subject, subjectLabel: data.subjectLabel,
        website: hp.value, lang: root.getAttribute('data-lang')
      };
      fetch(FORM_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function () {
          wait.remove();
          bubble(t('chat.ok').replace('{email}', data.email), 'them').classList.add('ok');
          input.setAttribute('placeholder', t('chat.done'));
          reset.hidden = false;
        })
        .catch(function () {
          wait.remove();
          var b = bubble(t('chat.err'), 'them');
          b.classList.add('err');
          var retry = document.createElement('button');
          retry.type = 'button';
          retry.className = 'retry';
          retry.textContent = t('chat.retry');
          retry.addEventListener('click', function () { retry.remove(); submitAll(); });
          b.appendChild(retry);
          reset.hidden = false;
        });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (!v || stepN < 1 || stepN > 3) return;
      input.value = '';
      autosize();
      if (stepN === 1) {
        if (v.length < 2) return;
        data.message = v;
        bubble(v, 'me');
        stepN = 2;
        ask('chat.askName', 'ph.name', true);
      } else if (stepN === 2) {
        data.name = v.slice(0, 80);
        bubble(data.name, 'me');
        stepN = 3;
        ask('chat.askMail', 'ph.mail', true);
      } else if (stepN === 3) {
        bubble(v, 'me');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { ask('chat.badMail', 'ph.mail', true); return; }
        data.email = v;
        submitAll();
      }
    });
    reset.addEventListener('click', function () { start(); });

    // Uygulama kartlarındaki "Geri bildirim yaz" sohbeti o konuyla başlatır
    document.querySelectorAll('[data-subject]').forEach(function (a) {
      a.addEventListener('click', function () { start(a.getAttribute('data-subject')); });
    });

    // Dil değişince henüz başlanmamış sohbet yeni dilde yeniden kurulur
    document.addEventListener('fmj:lang', function () { if (stepN === 0) start(); });
    start();
  })();

  document.getElementById('year').textContent = new Date().getFullYear();
})();
