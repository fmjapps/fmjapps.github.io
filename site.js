// FMJ Software — kurumsal ana sayfa ve Mirus sayfasının etkileşimleri
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // İletişim formunun gönderildiği Cloudflare Worker
  var FORM_URL = 'https://form.fmjapps.com/';
  // Mirus sunucusundaki site demosu (şifre gerekiyorsa sunucu söyler)
  var DEMO_API = 'https://mirus.fmjapps.com/api/site';

  function esc(str) { return String(str).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function store(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }
  function sget(key) { try { return sessionStorage.getItem(key); } catch (e) { return null; } }
  function sset(key, val) { try { if (val === null) sessionStorage.removeItem(key); else sessionStorage.setItem(key, val); } catch (e) {} }
  function stripOrigin(href) { return href.replace(/^https?:\/\/[^\/]+/, ''); }

  // Eski bağlantılar (fmjapps.com/#kayip gibi) uygulamalar sayfasına gider
  var OLD = ['oyunlar', 'uygulamalar', 'ilkeler', 'kayip', 'koleksiyoncu', 'prizma', 'ezber', 'paydos'];
  var appsLink = document.querySelector('.side-link');
  if (appsLink && OLD.indexOf(location.hash.slice(1)) > -1) {
    location.replace(appsLink.getAttribute('href') + location.hash);
    return;
  }

  /* ---------- Dil ---------- */
  var LANGS = [
    ['tr', 'Türkçe'], ['en', 'English'], ['es', 'Español'], ['pt', 'Português'], ['fr', 'Français'], ['de', 'Deutsch'],
    ['it', 'Italiano'], ['ru', 'Русский'], ['ar', 'العربية'], ['hi', 'हिन्दी'], ['zh', '中文'],
    ['ja', '日本語'], ['ko', '한국어'], ['id', 'Bahasa Indonesia']
  ];
  var curLang = root.lang || 'tr';
  // Yalnızca kodda geçen Türkçe metinler (sayfadakiler HTML'de)
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
    'co.sub.mirus': 'Mirus için demo istiyorum',
    'co.sub.qrmenu': 'QR Menü için teklif istiyorum',
    'co.sub.web': 'Web sitesi için teklif istiyorum',
    'co.sub.business': 'İşletmem için bir çözüm',
    'co.sub.other': 'Başka bir konu',
    'co.chat.webMsg': 'Site kimin için, ne iş yapıyorsunuz? Aklınızda bir alan adı varsa onu da yazın; teklifimizi iletelim.',
    'co.chat.qrMsg': 'İşletmenizin adını ve türünü (kafe, restoran…) yazar mısınız? Menünüz elinizde fotoğraf, PDF ya da liste olarak varsa onu da belirtin; teklifimizi iletelim.',
    'co.chat.mirusMsg': 'İşletmenizin adını, sektörünüzü ve günde yaklaşık kaç mesaj aldığınızı yazar mısınız? Size uygun bir demo planlayalım.',
    'demo.greet': 'Merhaba! Ben Mirus, {name} adına mesajlarınızı cevaplıyorum. Size nasıl yardımcı olabilirim?',
    'demo.handoff': 'Mirus bu konuşmayı ekibe aktardı. Gerçek kullanımda işletmenin ekibi konuşmaya buradan devam eder.',
    'demo.restart': 'Yeni konuşma başlat',
    'demo.sample': 'örnek işletme',
    'demo.shield': 'Adil Kullanım Kalkanı devrede: bu mesaj için cevap üretilmedi ve ücretlendirilmez.',
    'demo.err': 'Bir sorun çıktı, mesaj gönderilemedi. Biraz sonra tekrar deneyin.',
    'demo.limit': 'Demo için mesaj sınırına ulaşıldı. Biraz sonra tekrar deneyin.',
    'demo.offline': 'Demo şu an kullanılamıyor. Biraz sonra tekrar deneyin.',
    'demo.s1': 'Çalışma saatleriniz nedir?',
    'demo.s2': 'Bir insanla görüşmek istiyorum',
    'demo.klinik.foreign': 'How much is a hair transplant package?',
    'co.lock.bad': 'Şifre hatalı.',
    'co.lock.rate': 'Çok fazla deneme. 15 dakika sonra tekrar deneyin.',
    'pages': 'Sayfalar'
  };
  var DICT = null;
  function t(key) {
    if (curLang === 'tr' || !DICT) return TR[key];
    return DICT[key] || TR[key];
  }
  var langReady = curLang === 'tr' ? Promise.resolve() : fetch('/i18n/' + curLang + '.json')
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (json) { DICT = json; })
    .catch(function () {});

  var langBtn = document.getElementById('langBtn');
  var langMenu = document.getElementById('langMenu');
  if (langBtn && langMenu) {
    document.getElementById('langCode').textContent = curLang.toUpperCase();
    LANGS.forEach(function (l) {
      var li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.setAttribute('lang', l[0]);
      li.tabIndex = 0;
      li.innerHTML = '<span>' + l[1] + '</span><b>' + l[0].toUpperCase() + '</b>';
      if (l[0] === curLang) { li.className = 'on'; li.setAttribute('aria-selected', 'true'); }
      li.addEventListener('click', function () {
        store('fmj-lang', l[0]);
        var alt = document.querySelector('link[rel="alternate"][hreflang="' + l[0] + '"]');
        if (l[0] !== curLang && alt) location.href = stripOrigin(alt.getAttribute('href')) + location.hash;
        else closeMenu();
      });
      li.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); li.click(); }
        if (e.key === 'ArrowDown' && li.nextElementSibling) { e.preventDefault(); e.stopPropagation(); li.nextElementSibling.focus(); }
        if (e.key === 'ArrowUp' && li.previousElementSibling) { e.preventDefault(); e.stopPropagation(); li.previousElementSibling.focus(); }
      });
      langMenu.appendChild(li);
    });
    var closeMenu = function () { langMenu.hidden = true; langBtn.setAttribute('aria-expanded', 'false'); };
    langBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = langMenu.hidden;
      langMenu.hidden = !open;
      langBtn.setAttribute('aria-expanded', open);
      if (open) (langMenu.querySelector('.on') || langMenu.firstChild).focus();
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('#lang')) closeMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !langMenu.hidden) { closeMenu(); langBtn.focus(); } });
    langMenu.addEventListener('wheel', function (e) { e.stopPropagation(); }, { passive: true });
    langMenu.addEventListener('touchmove', function (e) { e.stopPropagation(); }, { passive: true });
  }
  root.classList.remove('i18n-wait');

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

  /* ---------- Menü ve ilerleme çubuğu ---------- */
  var nav = document.getElementById('nav');
  var progress = document.getElementById('progress');
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
      nav.classList.toggle('scrolled', y > 12);
      if (progress) progress.style.setProperty('--p', h > 0 ? (y / h).toFixed(4) : 0);
    });
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  var menuBtn = document.getElementById('menuBtn');
  var mobileMenu = document.getElementById('mobileMenu');
  if (menuBtn && mobileMenu) {
    // Telefon menüsü üst menüdeki bağlantılardan kurulur
    document.querySelectorAll('.links a').forEach(function (a) { mobileMenu.appendChild(a.cloneNode(true)); });
    var setMenu = function (open) { mobileMenu.hidden = !open; menuBtn.setAttribute('aria-expanded', open); };
    menuBtn.addEventListener('click', function (e) { e.stopPropagation(); setMenu(mobileMenu.hidden); });
    mobileMenu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('click', function (e) { if (!e.target.closest('#mobileMenu')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  // Üst menü sığmıyorsa (uzun dillerde, dar ekranda) bağlantılar menü düğmesine geçer
  var navBar = document.getElementById('nav'), navLinks = navBar && navBar.querySelector('.links');
  if (navBar && navLinks && menuBtn) {
    var fitNav = function () {
      navBar.classList.remove('tight');
      if (getComputedStyle(navLinks).display === 'none') return;
      if (navLinks.scrollWidth > navLinks.clientWidth + 1) navBar.classList.add('tight');
    };
    fitNav();
    window.addEventListener('resize', fitNav);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitNav);
  }

  /* ---------- Menüde açılır alt menü (Mirus) ---------- */
  document.querySelectorAll('.nav-drop').forEach(function (drop) {
    var btn = drop.querySelector('.drop-btn');
    var set = function (open) { drop.classList.toggle('open', open); btn.setAttribute('aria-expanded', open); };
    btn.addEventListener('click', function (e) { e.stopPropagation(); set(!drop.classList.contains('open')); });
    drop.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    document.addEventListener('click', function (e) { if (!drop.contains(e.target)) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { set(false); } });
  });

  /* ---------- Kaydırınca belirme ---------- */
  document.querySelectorAll('.reveal').forEach(function (el) {
    var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.classList.contains('reveal'); });
    el.style.setProperty('--d', (sibs.indexOf(el) * 0.08) + 's');
  });
  document.querySelectorAll('.msg.anim').forEach(function (m) {
    var list = Array.prototype.filter.call(m.parentNode.children, function (c) { return c.classList.contains('anim'); });
    m.style.setProperty('--md', (0.25 + list.indexOf(m) * 0.7) + 's');
  });
  var watched = document.querySelectorAll('.reveal, [data-play]');
  if ('IntersectionObserver' in window && !reduced) {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add(e.target.hasAttribute('data-play') ? 'in-view' : 'in');
        revObs.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    watched.forEach(function (el) { revObs.observe(el); });
  } else {
    watched.forEach(function (el) { el.classList.add('in', 'in-view'); });
  }

  /* ---------- Reels gibi sayfa geçişi (uygulamalar sayfasındakiyle aynı) ---------- */
  var goToPage = null;
  (function () {
    if (!document.body.classList.contains('paged')) return;
    var pages = Array.prototype.slice.call(document.querySelectorAll('.page'));
    if (!pages.length) return;
    var pager = document.getElementById('pager');
    var navLinks = document.querySelectorAll('.links a[href^="#"]');
    var cur = 0, anim = null, lockUntil = 0;

    function top(el) { return el.getBoundingClientRect().top + window.scrollY; }
    function label(p) {
      if (p.id) { var a = document.querySelector('.links a[href="#' + p.id + '"]'); if (a) return a.textContent.trim(); }
      var e = p.querySelector('.eyebrow');
      return e ? e.textContent.trim().split('·')[0].trim() : 'Mirus';
    }
    function buildPager() {
      if (!pager) return;
      pager.innerHTML = '';
      pages.forEach(function (p, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', label(p));
        b.innerHTML = '<span>' + esc(label(p)) + '</span>';
        b.addEventListener('click', function () { goTo(i); });
        pager.appendChild(b);
      });
      mark();
    }
    function mark() {
      if (pager) Array.prototype.forEach.call(pager.children, function (b, i) { b.classList.toggle('on', i === cur); });
      var id = pages[cur].id;
      navLinks.forEach(function (a) { a.classList.toggle('active', !!id && a.getAttribute('href') === '#' + id); });
    }
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
      var from = window.scrollY, dist = to - from, t0 = performance.now(), dur = 650;
      if (Math.abs(dist) < 2) { lockUntil = performance.now() + 300; return; }
      root.style.scrollBehavior = 'auto';
      (function step(now) {
        var k = Math.min(1, (now - t0) / dur);
        var e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        window.scrollTo(0, from + dist * e);
        if (k < 1) anim = requestAnimationFrame(step);
        else { anim = null; lockUntil = performance.now() + 180; root.style.scrollBehavior = ''; }
      })(t0);
    }
    function goTo(i, dir) {
      i = Math.max(0, Math.min(pages.length - 1, i));
      var p = pages[i], y = top(p);
      if (dir < 0 && p.offsetHeight > innerHeight + 4) y = y + p.offsetHeight - innerHeight;
      cur = i;
      mark();
      tween(y);
    }
    goToPage = function (el) { var p = el.closest('.page'); if (p) goTo(pages.indexOf(p)); };
    function busy() { return anim !== null || performance.now() < lockUntil; }
    // Yatay tutulan telefonda (çok alçak ekran) sayfa geçişi kapanır, sayfa normal kayar
    // Yazı alanına yazılırken (telefonda klavye açıkken) sayfa geçişi kapanır, sayfa normal kayar;
    // görünen alan çok alçaksa (yatay telefon, açık klavye) da öyle
    function typing() { var a = document.activeElement; return !!a && (a.tagName === 'TEXTAREA' || a.tagName === 'INPUT' || a.isContentEditable); }
    function flat() { var h = window.visualViewport ? visualViewport.height : innerHeight; return h < 430 || typing(); }
    // Sayfa ekrana sığmıyorsa önce kendi içinde kayar
    function nativeFirst(dir) {
      var r = pages[cur].getBoundingClientRect();
      if (pages[cur].offsetHeight - innerHeight < 8) return dir > 0 && cur === pages.length - 1;
      if (dir > 0 && r.bottom > innerHeight + 2) return true;
      if (dir < 0 && r.top < -2) return true;
      if (dir > 0 && cur === pages.length - 1) return true; // alttaki bilgi alanı
      return false;
    }
    function scrollableInside(target, dir) {
      var el = target.closest && target.closest('.msgs, .demo-msgs, textarea, .lang-menu, .mobile-menu');
      if (!el) return false;
      if (dir > 0) return el.scrollTop + el.clientHeight < el.scrollHeight - 1;
      return el.scrollTop > 0;
    }
    function menuOpen() { return mobileMenu && !mobileMenu.hidden; }

    window.addEventListener('scroll', function () { if (!anim) { var n = nearest(); if (n !== cur) { cur = n; mark(); } } }, { passive: true });

    // Bir kaydırma hareketi tek sayfa geçirir: tekerlek/touchpad'in süren ataleti bitmeden
    // (260 ms sessizlik) yeni geçiş başlamaz; böylece yanlışlıkla iki sayfa atlanmaz.
    var wheelHold = false, holdTimer = null, lastAbs = 0, lastAt = 0;
    function holdRelease() {
      clearTimeout(holdTimer);
      holdTimer = setTimeout(function () { if (anim) holdRelease(); else wheelHold = false; }, 200);
    }
    // Geçişten sonra gelen tekerlek olaylarından hangisi yeni bir hareket: fare tekerleğinin her tıkı
    // (aynı büyük adım) ya da atalet sönerken birden büyüyen kaydırma (yeni parmak hareketi)
    function freshIntent(e, abs, gap) {
      if (anim || performance.now() < lockUntil) return false;
      if (e.deltaMode !== 0) return true;
      if (abs >= 50 && Math.abs(abs - lastAbs) < 1 && gap > 25) return true;
      // Küçük dalgalanmalar sayılmaz: belirgin biçimde büyüyen kaydırma yeni bir harekettir
      return abs > 15 && abs > lastAbs * 2 && abs - lastAbs > 10;
    }
    window.addEventListener('wheel', function (e) {
      // Sohbet balonunun içinden gelen olaylara (gölge DOM) karışılmaz
      if (e.ctrlKey || flat() || menuOpen() || (e.target && e.target.shadowRoot)) return;
      var dir = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0;
      if (!dir || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (scrollableInside(e.target, dir)) return;
      var abs = Math.abs(e.deltaY), now = performance.now(), gap = now - lastAt;
      if (gap > 300) lastAbs = 0;
      // Olaylar arasında belirgin bir duraklama varsa önceki hareket bitmiştir (atalet ~16 ms arayla akar)
      if (gap > 100 && !anim) wheelHold = false;
      var fresh = wheelHold && freshIntent(e, abs, gap);
      lastAbs = abs; lastAt = now;
      if (wheelHold && !fresh) { e.preventDefault(); holdRelease(); return; }
      if (anim) { e.preventDefault(); return; }
      if (nativeFirst(dir)) return;
      e.preventDefault();
      if (busy() || Math.abs(e.deltaY) < 3) return;
      wheelHold = true;
      holdRelease();
      goTo(cur + dir, dir);
    }, { passive: false });

    var ty = null, tx = 0, tMode = null;
    window.addEventListener('touchstart', function (e) {
      if (e.touches.length > 1 || flat() || menuOpen() || (e.target && e.target.shadowRoot)) { ty = null; return; }
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
      if (e.altKey || e.ctrlKey || e.metaKey || flat() || (e.target && e.target.shadowRoot)) return;
      var tg = e.target;
      if (tg.closest && tg.closest('input, textarea, select, [contenteditable], .sec-track, #lang, .demo-sectors')) return;
      var dir = 0;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) dir = 1;
      else if (e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) dir = -1;
      else if (e.key === 'Home') { e.preventDefault(); goTo(0); return; }
      else if (e.key === 'End') { e.preventDefault(); goTo(pages.length - 1); return; }
      if (!dir || nativeFirst(dir)) return;
      e.preventDefault();
      if (!busy()) goTo(cur + dir, dir);
    });

    // #demo, #iletisim gibi bağlantılar ilgili sayfaya kayar
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented) return;
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href').slice(1);
      var el = id === 'top' ? pages[0] : document.getElementById(id);
      var p = el && el.closest('.page');
      if (!p) return;
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
    var start = location.hash.slice(1);
    var el = start && document.getElementById(start);
    if (el && el.closest('.page')) {
      window.addEventListener('load', function () {
        var p = el.closest('.page');
        setTimeout(function () { window.scrollTo(0, top(p)); cur = pages.indexOf(p); mark(); }, 0);
      });
    }
  })();
  function showSection(id) {
    var el = document.getElementById(id);
    if (!el) return;
    if (goToPage) goToPage(el); else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }

  /* ---------- Mirus: selamlar; heykeli mirus3d.js çizer ---------- */
  (function () {
    var t = document.getElementById('mirus');
    if (!t) return;
    var say = document.getElementById('tSay');
    var GREET = [
      ['tr', 'Merhaba! Size nasıl yardımcı olabilirim?'], ['en', 'Hello! How can I help you?'],
      ['ar', 'مرحباً! كيف يمكنني مساعدتك؟'], ['de', 'Hallo! Wie kann ich Ihnen helfen?'],
      ['ru', 'Здравствуйте! Чем могу помочь?'], ['es', '¡Hola! ¿En qué puedo ayudarle?'],
      ['fr', 'Bonjour ! Comment puis-je vous aider ?'], ['ja', 'こんにちは！ご用件をどうぞ。']
    ];
    // Önce sayfanın dilinde selam verir
    var gi = Math.max(0, GREET.map(function (g) { return g[0]; }).indexOf(curLang));
    if (gi === 0 && curLang !== 'tr') gi = 1;
    function show() { say.textContent = GREET[gi][1]; say.lang = GREET[gi][0]; say.dir = GREET[gi][0] === 'ar' ? 'rtl' : 'ltr'; }
    show();
    function next() {
      say.classList.add('swap');
      setTimeout(function () { gi = (gi + 1) % GREET.length; show(); say.classList.remove('swap'); }, 280);
    }
    var cycle = setInterval(next, 3800);
    var happyTimer;
    function setHappy(on) { t.dispatchEvent(new CustomEvent('mirus:happy', { detail: on })); }
    var hit = document.getElementById('tHit');
    hit.addEventListener('click', function () {
      clearInterval(cycle);
      next();
      cycle = setInterval(next, 3800);
      t.dispatchEvent(new CustomEvent('mirus:nod'));
      setHappy(true);
      clearTimeout(happyTimer);
      happyTimer = setTimeout(function () { setHappy(false); }, 1600);
    });
    hit.addEventListener('pointerenter', function () { setHappy(true); });
    hit.addEventListener('pointerleave', function () { clearTimeout(happyTimer); happyTimer = setTimeout(function () { setHappy(false); }, 300); });
  })();

  /* ---------- Bildirim ---------- */
  var toast = document.getElementById('toast');
  var toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2000);
  }

  var copyMail = document.getElementById('copyMail');
  if (copyMail) copyMail.addEventListener('click', function () {
    var mail = this.getAttribute('data-mail');
    var done = function () { showToast(t('contact.copied')); };
    if (navigator.clipboard) navigator.clipboard.writeText(mail).then(done, function () { location.href = 'mailto:' + mail; });
    else location.href = 'mailto:' + mail;
  });

  /* ---------- Sektör vitrini ---------- */
  (function () {
    var track = document.getElementById('secTrack');
    if (!track) return;
    var cards = Array.prototype.slice.call(track.children);
    var dots = document.getElementById('secDots');
    cards.forEach(function () { dots.appendChild(document.createElement('i')); });
    var rtl = root.dir === 'rtl';
    function step() { return cards[0].getBoundingClientRect().width + 18; }
    function index() { return Math.round(Math.abs(track.scrollLeft) / step()); }
    function paint() {
      var i = Math.min(index(), cards.length - 1);
      Array.prototype.forEach.call(dots.children, function (d, j) { d.classList.toggle('on', j === i); });
    }
    track.addEventListener('scroll', function () { requestAnimationFrame(paint); }, { passive: true });
    document.querySelectorAll('.sec-arrow').forEach(function (b) {
      b.addEventListener('click', function () {
        var d = parseInt(b.getAttribute('data-dir'), 10) * (rtl ? -1 : 1);
        track.scrollBy({ left: d * step(), behavior: reduced ? 'auto' : 'smooth' });
      });
    });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        track.scrollBy({ left: (e.key === 'ArrowRight' ? 1 : -1) * step(), behavior: reduced ? 'auto' : 'smooth' });
      }
    });
    paint();
  })();

  /* ---------- Canlı demo ---------- */
  var selectDemoSector = null;
  (function () {
    var box = document.getElementById('demoBox');
    if (!box) return;
    var chips = document.getElementById('demoSectors');
    var msgs = document.getElementById('demoMsgs');
    var sugg = document.getElementById('demoSugg');
    var note = document.getElementById('demoNote');
    var form = document.getElementById('demoForm');
    var input = document.getElementById('demoIn');
    var send = document.getElementById('demoSend');
    var nameEl = document.getElementById('demoName');
    var lock = document.getElementById('demoLock');
    var lockForm = document.getElementById('lockForm');
    var lockIn = document.getElementById('lockIn');
    var lockErr = document.getElementById('lockErr');
    var shortNames = {};
    document.querySelectorAll('#sectorShort li').forEach(function (li) { shortNames[li.getAttribute('data-k')] = li.textContent.trim(); });

    var sectors = [], current = null, busy = false, locked = false;
    var code = sget('mirus-demo-code') || '';
    var logs = {}; // sektör → ekrandaki mesajlar
    var tokens = {};
    try { tokens = JSON.parse(sget('mirus-demo-tokens') || '{}'); } catch (e) {}
    function saveTokens() { sset('mirus-demo-tokens', JSON.stringify(tokens)); }

    // İşletme adındaki "(örnek)" etiketi sayfanın dilinde yazılır
    function bareName(s) { return s.name.replace(/\s*\(.*\)\s*$/, ''); }
    function sectorName(s) { return bareName(s) + ' · ' + t('demo.sample'); }
    function add(kind, text, extra) {
      var d = document.createElement('div');
      d.className = 'msg ' + kind + (extra ? ' ' + extra : '');
      d.textContent = text;
      msgs.appendChild(d);
      msgs.scrollTop = msgs.scrollHeight;
      return d;
    }
    function record(kind, text, extra) {
      (logs[current.key] = logs[current.key] || []).push([kind, text, extra || '']);
      return add(kind, text, extra);
    }
    function typing() {
      var d = document.createElement('div');
      d.className = 'bub them typing';
      d.innerHTML = '<i></i><i></i><i></i>';
      msgs.appendChild(d);
      msgs.scrollTop = msgs.scrollHeight;
      return d;
    }
    function restartNote() {
      var n = record('sys', t('demo.handoff'));
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = t('demo.restart');
      b.addEventListener('click', restart);
      n.appendChild(b);
    }
    function render() {
      msgs.innerHTML = '';
      if (!current) return;
      nameEl.textContent = sectorName(current);
      add('out', t('demo.greet').replace('{name}', bareName(current)));
      (logs[current.key] || []).forEach(function (m) {
        var d = add(m[0], m[1], m[2]);
        if (m[0] === 'sys' && m[1] === t('demo.handoff')) {
          var b = document.createElement('button');
          b.type = 'button';
          b.textContent = t('demo.restart');
          b.addEventListener('click', restart);
          d.appendChild(b);
        }
      });
      // Öneriler: sektör kartındaki örnek soru + iki genel soru.
      // Klinikte ikinci öneri yurt dışından yazan hasta örneğidir: Türkçe soruya fiyat verilmez, yabancı dildeki soruya verilir.
      sugg.innerHTML = '';
      var q = document.querySelector('.sec-card[data-sector="' + current.key + '"] .sc-q span');
      var klinik = current.key === 'klinik';
      if (note) note.hidden = !klinik;
      var list = klinik ? [q && q.textContent.trim(), t('demo.klinik.foreign')] : [q && q.textContent.trim(), t('demo.s1'), t('demo.s2')];
      list.filter(function (x, i) { return x && list.indexOf(x) === i; }).forEach(function (text) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = text;
        b.addEventListener('click', function () { submit(text); });
        sugg.appendChild(b);
      });
    }
    function select(key, focus) {
      var s = sectors.filter(function (x) { return x.key === key; })[0];
      if (!s) return;
      current = s;
      Array.prototype.forEach.call(chips.children, function (b) {
        var on = b.getAttribute('data-k') === key;
        b.classList.toggle('on', on);
        b.setAttribute('aria-selected', on);
        // Yalnızca düğme şeridi yatayda kayar; sayfa yerinden oynamaz
        if (on) chips.scrollTo({ left: b.offsetLeft - (chips.clientWidth - b.offsetWidth) / 2, behavior: reduced ? 'auto' : 'smooth' });
      });
      render();
      if (focus && !locked) input.focus({ preventScroll: true });
    }
    selectDemoSector = function (key) { if (sectors.length) select(key, true); else pendingKey = key; };
    var pendingKey = null;
    function restart() {
      if (!current) return;
      delete tokens[current.key];
      saveTokens();
      logs[current.key] = [];
      render();
    }
    // quiet: sayfa açılışında şifre kutusuna kendiliğinden odaklanılmaz (telefonda klavye açılmasın, sayfa geçişi bozulmasın)
    function setLocked(on, quiet) {
      locked = on;
      lock.hidden = !on;
      input.disabled = send.disabled = on;
      if (on && !quiet) setTimeout(function () { lockIn.focus({ preventScroll: true }); }, 50);
    }

    function submit(text) {
      text = String(text || '').trim();
      if (!text || busy || !current || locked) return;
      busy = true;
      send.disabled = true;
      record('in', text);
      var s = current;
      var dots = typing();
      fetch(DEMO_API + '/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sector: s.key, token: tokens[s.key] || null, text: text, code: code })
      })
        .then(function (r) { return r.json().then(function (j) { return { status: r.status, body: j }; }); })
        .then(function (res) {
          dots.remove();
          var j = res.body || {};
          if (res.status === 401 || res.status === 429 && j.locked) {
            code = ''; sset('mirus-demo-code', null);
            logs[s.key].pop();
            render();
            setLocked(true);
            lockErr.textContent = res.status === 429 ? t('co.lock.rate') : '';
            return;
          }
          if (j.token) { tokens[s.key] = j.token; saveTokens(); }
          if (res.status === 429) { record('sys', t('demo.limit'), 'warn'); return; }
          if (res.status >= 400) { record('sys', t('demo.err'), 'warn'); return; }
          (j.replies || []).forEach(function (r) { if (current === s) record('out', r); else (logs[s.key] = logs[s.key] || []).push(['out', r, '']); });
          if (j.shield && !(j.replies || []).length) record('sys', t('demo.shield'));
          if (j.mode === 'human') restartNote();
        })
        .catch(function () { dots.remove(); record('sys', t('demo.err'), 'warn'); })
        .then(function () { busy = false; send.disabled = locked; });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value;
      input.value = '';
      input.style.height = 'auto';
      submit(v);
    });
    input.addEventListener('input', function () { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 120) + 'px'; });
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });
    document.getElementById('demoReset').addEventListener('click', restart);

    lockForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var c = lockIn.value.trim();
      if (!c) return;
      lockErr.textContent = '';
      fetch(DEMO_API + '/unlock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: c }) })
        .then(function (r) {
          if (r.ok) { code = c; sset('mirus-demo-code', c); lockIn.value = ''; setLocked(false); input.focus({ preventScroll: true }); return; }
          lockErr.textContent = r.status === 429 ? t('co.lock.rate') : t('co.lock.bad');
        })
        .catch(function () { lockErr.textContent = t('demo.offline'); });
    });

    // Sektör kartlarındaki "Bu sektörle deneyin"
    document.querySelectorAll('[data-try]').forEach(function (b) {
      b.addEventListener('click', function () {
        selectDemoSector(b.getAttribute('data-try'));
        showSection('demo');
      });
    });

    Promise.all([langReady, fetch(DEMO_API + '/demo').then(function (r) { return r.json(); })])
      .then(function (res) {
        var data = res[1];
        sectors = data.sectors || [];
        chips.innerHTML = '';
        sectors.forEach(function (s) {
          var b = document.createElement('button');
          b.type = 'button';
          b.setAttribute('role', 'tab');
          b.setAttribute('data-k', s.key);
          b.textContent = shortNames[s.key] || s.name;
          b.addEventListener('click', function () { select(s.key, true); });
          chips.appendChild(b);
        });
        select(pendingKey || (sectors[0] && sectors[0].key), false);
        setLocked(data.locked && !code, true);
      })
      .catch(function () {
        add('sys', t('demo.offline'), 'warn');
        input.disabled = send.disabled = true;
      });
  })();

  /* ---------- İletişim: sohbet gibi ilerleyen form ---------- */
  (function () {
    var msgs = document.getElementById('msgs');
    if (!msgs) return;
    var form = document.getElementById('composer');
    var input = document.getElementById('chatIn');
    var send = document.getElementById('chatSend');
    var reset = document.getElementById('chatReset');
    var hp = form.querySelector('input[name=website]');
    // Konu anahtarları iletişim formu sunucusundaki listeyle aynıdır
    var SUBJECTS = [
      { v: 'mirus', key: 'co.sub.mirus', ask: 'co.chat.mirusMsg' },
      { v: 'qrmenu', key: 'co.sub.qrmenu', ask: 'co.chat.qrMsg' },
      { v: 'web', key: 'co.sub.web', ask: 'co.chat.webMsg' },
      { v: 'business', key: 'co.sub.business' },
      { v: 'other', key: 'co.sub.other' }
    ];
    var stepN = 0, data = {};

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
      msgs.scrollTop = msgs.scrollHeight;
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
      data.subjectLabel = t(sub.key);
      bubble(data.subjectLabel, 'me');
      stepN = 1;
      ask(sub.ask || 'chat.askMsg', 'ph.msg', true);
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
        b.textContent = t(sub.key);
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
        website: hp.value, lang: curLang
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

    // "Demo isteyin" gibi bağlantılar sohbeti o konuyla başlatır
    document.querySelectorAll('[data-subject]').forEach(function (a) {
      a.addEventListener('click', function () { start(a.getAttribute('data-subject')); });
    });
    langReady.then(function () { if (stepN === 0) start(); });
  })();

  /* ---------- Telefonda klavye: sohbet penceresi görünen alana sığar ---------- */
  (function () {
    var vv = window.visualViewport;
    if (!vv) return;
    var timer = null;
    function fit() {
      var a = document.activeElement;
      var box = a && (a.id === 'demoIn' || a.id === 'chatIn') && a.closest('.demo-win, .chat');
      // Klavye, görünen alanı belirgin biçimde küçültmüşse açık sayılır
      var open = !!box && innerWidth <= 960 && vv.height < innerHeight - 120;
      root.classList.toggle('kb', open);
      if (!open) return;
      root.style.setProperty('--kb-h', Math.round(vv.height) + 'px');
      clearTimeout(timer);
      timer = setTimeout(function () {
        // Pencerenin alt kenarı klavyenin hemen üstüne gelir
        var r = box.getBoundingClientRect();
        var gap = r.bottom - (vv.offsetTop + vv.height) + 8;
        if (Math.abs(gap) > 4) window.scrollBy(0, gap);
      }, 60);
    }
    vv.addEventListener('resize', fit);
    document.addEventListener('focusin', function () { setTimeout(fit, 350); });
    document.addEventListener('focusout', function () { setTimeout(fit, 50); });
  })();

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
