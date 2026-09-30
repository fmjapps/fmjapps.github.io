// FMJ Apps — ana sayfa etkileşimleri
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  function store(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }

  /* ---------- Dil ---------- */
  // Türkçe metin HTML'de; İngilizcesi burada. Türkçeye dönünce ilk hâli geri yüklenir.
  var EN = {
    'skip': 'Skip to content',
    'nav.games': 'Games', 'nav.apps': 'Apps', 'nav.values': 'Principles', 'nav.contact': 'Contact',
    'theme': 'Toggle theme', 'shots': 'Screenshots',
    'hero.eyebrow': 'Simple, reliable mobile apps',
    'hero.title': 'Games that fit a short break, <span class="grad">apps that just work.</span>',
    'hero.lede': "FMJ Apps builds games and apps for everyday life. None of them ask you to sign up, and your settings and progress stay on your phone. A five-minute shift, the daily puzzle or a poem to learn by heart: each one does what you opened it for.",
    'hero.ctaGames': 'See the games', 'hero.ctaApps': 'Apps',
    'stat.games': 'games', 'stat.apps': 'apps', 'stat.account': 'accounts required',
    'games.title': 'Games',
    'games.lede': 'Games built on attention, not luck. Every visitor, every fake, every puzzle has exactly one right answer you can find.',
    'status.test': 'In closed testing · Coming soon to Google Play',
    'privacy': 'Privacy',
    'kayip.name': 'Lost & Found Office', 'kayip.tag': 'Daily deduction game',
    'kayip.desc': "You're behind the counter of the Central Station lost & found, and on top of it sits Pamuk, the office cat. Six visitors come in every day: some really are looking for their suitcase, some are impostors eyeing an item on the notice board. Check the report, ask three questions, make your call.",
    'kayip.f1': 'A new shift every day', 'kayip.f2': 'Same visitors for everyone worldwide', 'kayip.f3': 'Little gifts from Pamuk', 'kayip.f4': 'Plays offline',
    'kayip.join': 'Join the test',
    'kol.name': 'The Collector: Real or Fake', 'kol.short': 'The Collector', 'kol.tag': 'Antique & pawn shop game',
    'kol.desc': "Your grandfather's antique shop is yours now. Customers bring pocket watches, coins and paintings; turn them over, sweep the loupe, open the catalogue. Spot the fakes, haggle, and gather works by eighteen great masters in a single showcase.",
    'kol.f1': 'Loupe, UV lamp, pigment analysis', 'kol.f2': 'Haggle with sellers', 'kol.f3': 'An 18-master collection', 'kol.f4': '8–10 minute shop days',
    'prizma.name': 'Prizma', 'prizma.tag': 'Light and mirror puzzles',
    'prizma.desc': 'Place the mirrors and guide the beam to its targets. The rules look simple, then come prism blocks that split the light, portals that send it out somewhere else and colours that mix like real light. On Hard and Master the beam stays hidden: set your mirrors first, then switch on the light.',
    'prizma.f1': '60 levels, 4 difficulties', 'prizma.f2': 'A daily puzzle, same for everyone', 'prizma.f3': 'Play Games leaderboard and achievements', 'prizma.f4': 'Colour-blind mode',
    'apps.title': 'Apps', 'apps.lede': 'Tools that do one job well and ask for nothing they don’t need.',
    'ezber.name': 'Memorize: Lines, Speech, Poems', 'ezber.short': 'Memorize', 'ezber.tag': 'Hands-free memorization',
    'ezber.desc': 'It reads your script to you, listens when it’s your turn and whispers like a prompter when you get stuck. Stage lines, a school poem or a work presentation: rehearse without touching your phone, even on a walk.',
    'ezber.f1': 'Spoken rehearsal with prompter', 'ezber.f2': 'Import from PDF, Word or a photo', 'ezber.f3': 'No account, no ads', 'ezber.f4': '10 languages',
    'paydos.name': 'Paydos', 'paydos.tag': 'Screen lock for kids',
    'paydos.desc': 'Put a gentle limit on your child’s phone time. Set the time, tick the apps they can open and hand the phone over. When time is up, or a blocked app is opened, the screen locks and only your PIN unlocks it. Your child can always see how much time is left.',
    'paydos.f1': 'Pick the time and the apps', 'paydos.f2': 'PIN-protected full-screen lock', 'paydos.f3': 'No data leaves the phone', 'paydos.f4': 'Completely free, 9 languages',
    'values.title': 'How we build',
    'v1.t': 'No accounts', 'v1.d': 'None of our apps ask you to sign up or hand over an email. Open it and go.',
    'v2.t': 'Your data stays put', 'v2.d': 'Your progress, texts and settings live on your device. Nothing is sent to a server of ours.',
    'v3.t': 'Fair play', 'v3.d': 'You win by paying attention, not by guessing. Daily content is the same for everyone in the world.',
    'v4.t': 'Short and calm', 'v4.d': 'Sessions of a few minutes, calm music, no pointless notifications. Put it down when your break is over.',
    'contact.title': 'Got an idea or found a bug?',
    'contact.lede': 'Feedback goes straight into the next update. Write in and we’ll read it and reply.',
    'contact.mail': 'Send an email', 'contact.copy': 'Copy address', 'contact.copied': 'Address copied',
    'foot.tag': 'Games and apps for Android', 'foot.privacy': 'Privacy policies', 'foot.contact': 'Contact',
    'foot.play': 'Google Play developer page', 'foot.top': 'Back to top ↑'
  };
  var TR = { 'contact.copied': 'Adres kopyalandı' };
  var META = {
    tr: { title: document.title, desc: document.querySelector('meta[name=description]').content },
    en: { title: 'FMJ Apps · Android games and apps', desc: 'FMJ Apps builds simple, reliable mobile games and apps for everyday life: Lost & Found Office, The Collector, Prizma, Memorize and Paydos.' }
  };

  var textEls = document.querySelectorAll('[data-i18n]');
  var htmlEls = document.querySelectorAll('[data-i18n-html]');
  var ariaEls = document.querySelectorAll('[data-i18n-aria]');
  var imgEls = document.querySelectorAll('img[data-en]');
  textEls.forEach(function (el) { el._tr = el.textContent; });
  htmlEls.forEach(function (el) { el._tr = el.innerHTML; });
  ariaEls.forEach(function (el) { el._tr = el.getAttribute('aria-label'); });
  imgEls.forEach(function (el) { el._tr = el.getAttribute('src'); });

  function t(key) { return (root.getAttribute('data-lang') === 'en' ? EN : TR)[key]; }

  function applyLang(lang) {
    var en = lang === 'en';
    root.setAttribute('data-lang', lang);
    root.lang = lang;
    textEls.forEach(function (el) { var k = el.getAttribute('data-i18n'); el.textContent = en && EN[k] ? EN[k] : el._tr; });
    htmlEls.forEach(function (el) { var k = el.getAttribute('data-i18n-html'); el.innerHTML = en && EN[k] ? EN[k] : el._tr; });
    ariaEls.forEach(function (el) { var k = el.getAttribute('data-i18n-aria'); el.setAttribute('aria-label', en && EN[k] ? EN[k] : el._tr); });
    imgEls.forEach(function (el) { el.src = en ? el.getAttribute('data-en') : el._tr; });
    document.title = META[lang].title;
    document.querySelector('meta[name=description]').content = META[lang].desc;
  }
  if (root.getAttribute('data-lang') === 'en') applyLang('en');

  document.getElementById('langBtn').addEventListener('click', function () {
    var next = root.getAttribute('data-lang') === 'en' ? 'tr' : 'en';
    applyLang(next);
    store('fmj-lang', next);
  });

  /* ---------- Tema ---------- */
  var themeMeta = document.querySelector('meta[name=theme-color]');
  function syncThemeMeta() { themeMeta.content = root.getAttribute('data-theme') === 'light' ? '#F6F6FD' : '#0A0A1F'; }
  syncThemeMeta();
  document.getElementById('themeBtn').addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    store('fmj-theme', next);
    syncThemeMeta();
  });

  /* ---------- Menü: kaydırınca arka plan ve etkin bölüm ---------- */
  var nav = document.getElementById('nav');
  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 12); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var navLinks = document.querySelectorAll('.links a');
  if ('IntersectionObserver' in window) {
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['oyunlar', 'uygulamalar', 'ilkeler', 'iletisim'].forEach(function (id) { secObs.observe(document.getElementById(id)); });
  }

  /* ---------- Kaydırınca belirme ---------- */
  var reveals = document.querySelectorAll('.reveal');
  // Aynı kapsayıcıdaki öğeler sırayla gelsin
  reveals.forEach(function (el) {
    var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.classList.contains('reveal'); });
    el.style.setProperty('--d', (sibs.indexOf(el) * 0.08) + 's');
  });
  if ('IntersectionObserver' in window && !reduced) {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); revObs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { revObs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

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
    if (!reduced && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible && !timer) timer = setInterval(tick, 3200);
        if (!visible && timer) { clearInterval(timer); timer = null; }
      }, { threshold: 0.5 }).observe(track);
    }
    track.addEventListener('mouseenter', function () { userTouched = true; });
  });

  /* ---------- Telefonların fareyle eğilmesi ---------- */
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

    // Uygulama kartlarında imleci izleyen ışık
    document.querySelectorAll('.app-card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });

    // Girişteki ikonlar imlece göre hafifçe kayar
    var orbit = document.getElementById('orbit');
    var hero = document.querySelector('.hero');
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      orbit.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      orbit.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    });
    hero.addEventListener('pointerleave', function () {
      orbit.style.setProperty('--px', 0);
      orbit.style.setProperty('--py', 0);
    });
  }

  /* ---------- E-posta kopyalama ---------- */
  var toast = document.getElementById('toast');
  var toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2000);
  }
  document.getElementById('copyMail').addEventListener('click', function () {
    var mail = this.getAttribute('data-mail');
    var done = function () { showToast(t('contact.copied')); };
    if (navigator.clipboard) navigator.clipboard.writeText(mail).then(done, function () { location.href = 'mailto:' + mail; });
    else location.href = 'mailto:' + mail;
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
