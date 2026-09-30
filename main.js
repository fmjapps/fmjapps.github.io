// FMJ Apps — ana sayfa etkileşimleri
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  // İletişim formunun gönderildiği Cloudflare Worker
  var FORM_URL = 'https://form.fmjapps.com/';

  // Kapalı testteki uygulamalar: Google Grubu ve Play paket adı
  var TESTS = {
    kayip: { group: 'kayip-esya-testers', pkg: 'com.oyunatolyesi.kayipesya', acc: '#9CC98F' },
    koleksiyoncu: { group: 'the-collector-testers', pkg: 'com.fmjapps.collector', acc: '#E2B75E' },
    ezber: { group: 'memorize-testers', pkg: 'com.fmjapps.ezberasistani', acc: '#2FC4A8' }
  };

  function store(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }
  function load(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }

  /* ---------- Dil ---------- */
  // Türkçe metin HTML'de; İngilizcesi burada. Türkçeye dönünce ilk hâli geri yüklenir.
  var EN = {
    'skip': 'Skip to content',
    'nav.games': 'Games', 'nav.apps': 'Apps', 'nav.values': 'Principles', 'nav.contact': 'Contact',
    'theme': 'Toggle theme', 'shots': 'Screenshots', 'close': 'Close', 'sc.prev': 'Previous', 'sc.next': 'Next',
    'hero.eyebrow': 'Simple, reliable mobile apps',
    'hero.title': 'Games that fit a short break, <span class="grad">apps that just work.</span>',
    'hero.lede': "FMJ Apps builds games and apps for everyday life. None of them ask you to sign up, and your settings and progress stay on your phone. A five-minute shift, the daily puzzle or a poem to learn by heart: each one does what you opened it for.",
    'hero.ctaGames': 'See the games', 'hero.ctaApps': 'Apps',
    'stat.games': 'games', 'stat.apps': 'apps', 'stat.account': 'accounts required',
    'mq.daily': 'Something new every day', 'mq.offline': 'Plays offline', 'mq.langs': '9 languages',
    'games.title': 'Games',
    'games.lede': 'Games built on attention, not luck. Every visitor, every fake, every puzzle has exactly one right answer you can find.',
    'status.test': 'In closed testing',
    'status.soon': 'In review · Coming soon to Google Play',
    'join.btn': 'Join the test', 'feedback': 'Send feedback',
    'privacy': 'Privacy',
    'kayip.name': 'Lost & Found Office', 'kayip.tag': 'Daily deduction game',
    'kayip.desc': "You're behind the counter of the Central Station lost & found, and on top of it sits Pamuk, the office cat. Six visitors come in every day: some really are looking for their suitcase, some are impostors eyeing an item on the notice board. Check the report, ask three questions, make your call.",
    'kayip.f1': 'A new shift every day', 'kayip.f2': 'Same visitors for everyone worldwide', 'kayip.f3': 'Little gifts from Pamuk', 'kayip.f4': 'Plays offline',
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
    'contact.title': 'Get in touch',
    'contact.lede': 'Got an idea, a bug to report or a question? Fill in the form or email us directly. Turkish or English, both are fine.',
    'contact.mailLabel': 'Email',
    'contact.mail': 'Send an email', 'contact.copy': 'Copy address', 'contact.copied': 'Address copied',
    'contact.testT': 'Want to become a tester?',
    'contact.testD': 'Lost & Found Office, The Collector and Memorize are in closed testing. Join in three steps and try them before launch.',
    'form.name': 'Your name', 'form.email': 'Your email', 'form.subject': 'What is it about?', 'form.message': 'Your message', 'form.send': 'Send',
    'form.sending': 'Sending…',
    'form.ok': 'Thanks! Your message has reached us. We’ll get back to you soon.',
    'form.err': 'The message couldn’t be sent. Please try again, or write to contact@fmjapps.com.',
    'form.check': 'Please fill in your name, a valid email and your message.',
    'join.eyebrow': 'Join the closed test',
    'join.lede': 'You can become a tester in three steps. For each one, you just need to be signed in with the Google account you use on the Play Store.',
    'join.s1t': 'Join the test group', 'join.s1d': 'On the Google Group page that opens, tap “Join group”.', 'join.s1b': 'Go to the group',
    'join.s2t': 'Become a tester', 'join.s2d': 'On the Play page that opens, tap “Become a tester”. If you’ve only just joined the group, the page may take a few minutes to be ready.', 'join.s2b': 'Become a tester',
    'join.s3t': 'Download from Google Play', 'join.s3d': 'The app now shows up for you on the Play Store. Install it and give it a try.', 'join.s3b': 'Open in Play',
    'join.note': 'For an app to launch, testers need to keep it installed for at least 14 days. Keeping it on your phone for that long really helps us.',
    'foot.tag': 'Games and apps for Android', 'foot.privacy': 'Privacy policies', 'foot.contact': 'Contact',
    'foot.play': 'Google Play developer page', 'foot.top': 'Back to top ↑'
  };
  var TR = {
    'contact.copied': 'Adres kopyalandı',
    'form.sending': 'Gönderiliyor…',
    'form.ok': 'Teşekkürler! Mesajın bize ulaştı, en kısa sürede dönüş yapacağız.',
    'form.err': 'Mesaj gönderilemedi. Lütfen tekrar dene ya da contact@fmjapps.com adresine yaz.',
    'form.check': 'Lütfen adını, geçerli bir e-posta adresini ve mesajını yaz.'
  };
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

  // Bölüm başlıkları kelime kelime belirir
  var splitEls = document.querySelectorAll('.sec-head h2:not(.no-split)');
  function splitWords() {
    splitEls.forEach(function (h) {
      if (h.closest('.games')) return; // degrade yazılı başlık bölünmez
      var words = h.textContent.trim().split(/\s+/);
      h.innerHTML = words.map(function (w, i) { return '<span class="w" style="--i:' + i + '">' + w + '</span>'; }).join(' ');
      h.classList.add('split');
    });
  }

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
    splitWords();
  }
  applyLang(root.getAttribute('data-lang') === 'en' ? 'en' : 'tr');

  document.getElementById('langBtn').addEventListener('click', function () {
    var next = root.getAttribute('data-lang') === 'en' ? 'tr' : 'en';
    applyLang(next);
    store('fmj-lang', next);
    splitEls.forEach(function (h) { h.classList.add('in'); });
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
    ['oyunlar', 'uygulamalar', 'ilkeler', 'iletisim'].forEach(function (id) { secObs.observe(document.getElementById(id)); });
  }

  /* ---------- Kaydırınca belirme ---------- */
  var reveals = document.querySelectorAll('.reveal, .split');
  document.querySelectorAll('.reveal').forEach(function (el) {
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

  /* ---------- Sayaçlar ---------- */
  document.querySelectorAll('.stats dt').forEach(function (dt) {
    var end = parseInt(dt.textContent, 10);
    if (reduced || !end) return;
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

  /* ---------- Vitrin: oyunlar / uygulamalar ---------- */
  (function () {
    var sc = document.getElementById('showcase');
    if (!sc) return;
    var stage = document.getElementById('scStage');
    var dotsWrap = document.getElementById('scDots');
    var tabs = sc.querySelectorAll('.sc-tab');
    var all = Array.prototype.slice.call(stage.querySelectorAll('.sc-card'));
    var set = 'games', list = [], idx = 0, timer = null, paused = false;

    function render() {
      var n = list.length;
      all.forEach(function (c) { c.classList.remove('p0', 'pl', 'pr'); c.tabIndex = -1; });
      list.forEach(function (c, i) {
        var d = (i - idx + n) % n;
        if (d === 0) { c.classList.add('p0'); c.tabIndex = 0; }
        else if (d === 1) c.classList.add('pr');
        else if (d === n - 1) c.classList.add('pl');
      });
      var acc = list[idx].style.getPropertyValue('--acc');
      stage.style.setProperty('--acc', acc);
      sc.style.setProperty('--acc-now', acc);
      Array.prototype.forEach.call(dotsWrap.children, function (b, i) { b.classList.toggle('on', i === idx); });
    }
    function build(newSet, first) {
      set = newSet;
      sc.setAttribute('data-set', set);
      tabs.forEach(function (tb) {
        var on = tb.getAttribute('data-set') === set;
        tb.classList.toggle('on', on);
        tb.setAttribute('aria-selected', on);
      });
      var old = list;
      list = all.filter(function (c) { return c.getAttribute('data-set') === set; });
      idx = 0;
      dotsWrap.innerHTML = '';
      list.forEach(function (_, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', String(i + 1));
        b.addEventListener('click', function () { go(i, true); });
        dotsWrap.appendChild(b);
      });
      if (first || reduced) { all.forEach(function (c) { c.classList.remove('out'); }); render(); return; }
      old.forEach(function (c) { c.classList.remove('p0', 'pl', 'pr'); c.classList.add('out'); });
      setTimeout(function () { old.forEach(function (c) { c.classList.remove('out'); }); render(); }, 260);
    }
    function go(i, user) {
      idx = (i + list.length) % list.length;
      render();
      if (user) restart();
    }
    function restart() {
      clearInterval(timer);
      if (!reduced) timer = setInterval(function () { if (!paused && !document.hidden) go(idx + 1); }, 3800);
    }

    tabs.forEach(function (tb) {
      tb.addEventListener('click', function () {
        if (tb.getAttribute('data-set') !== set) { build(tb.getAttribute('data-set')); restart(); }
      });
    });
    sc.querySelectorAll('.sc-arrow').forEach(function (b) {
      b.addEventListener('click', function () { go(idx + parseInt(b.getAttribute('data-dir'), 10), true); });
    });
    // Yandaki karta tıklayınca öne gelir; öndekine tıklayınca bölümüne gider
    all.forEach(function (c) {
      c.addEventListener('click', function (e) {
        if (!c.classList.contains('p0')) { e.preventDefault(); go(list.indexOf(c), true); }
      });
    });
    // Parmakla kaydırma
    var sx = null;
    stage.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1), true);
      sx = null;
    });
    sc.addEventListener('mouseenter', function () { paused = true; });
    sc.addEventListener('mouseleave', function () { paused = false; });
    sc.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') go(idx + 1, true);
      if (e.key === 'ArrowLeft') go(idx - 1, true);
    });

    build('games', true);
    restart();
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
    if (!reduced && 'IntersectionObserver' in window) {
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

  /* ---------- İletişim: e-posta ve form ---------- */
  document.getElementById('copyMail').addEventListener('click', function () {
    var mail = this.getAttribute('data-mail');
    var done = function () { showToast(t('contact.copied')); };
    if (navigator.clipboard) navigator.clipboard.writeText(mail).then(done, function () { location.href = 'mailto:' + mail; });
    else location.href = 'mailto:' + mail;
  });

  (function () {
    var form = document.getElementById('cform');
    var status = document.getElementById('fStatus');
    var msg = form.elements.message;
    var count = document.getElementById('msgCount');

    msg.addEventListener('input', function () { count.textContent = msg.value.length + ' / 4000'; });

    // Uygulama kartındaki "Geri bildirim yaz" konuyu seçip forma götürür
    document.querySelectorAll('[data-subject]').forEach(function (a) {
      a.addEventListener('click', function () {
        var r = form.querySelector('input[name=subject][value="' + a.getAttribute('data-subject') + '"]');
        if (r) r.checked = true;
        setTimeout(function () { (form.elements.name.value ? msg : form.elements.name).focus({ preventScroll: true }); }, 600);
      });
    });

    function setStatus(text, cls) {
      status.className = 'f-status' + (cls ? ' ' + cls : '');
      status.textContent = text;
    }
    function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var text = msg.value.trim();
      var bad = [];
      if (!name) bad.push(form.elements.name);
      if (!validEmail(email)) bad.push(form.elements.email);
      if (text.length < 2) bad.push(msg);
      form.querySelectorAll('.field').forEach(function (f) { f.classList.remove('bad'); });
      if (bad.length) {
        bad.forEach(function (el) { el.closest('.field').classList.add('bad'); });
        bad[0].focus();
        setStatus(t('form.check'), 'err');
        return;
      }
      var subject = form.querySelector('input[name=subject]:checked');
      var payload = {
        name: name, email: email, message: text,
        subject: subject ? subject.value : 'general',
        subjectLabel: subject ? subject.parentNode.textContent.trim() : 'FMJ Apps',
        website: form.elements.website.value,
        lang: root.getAttribute('data-lang')
      };
      form.classList.add('sending');
      setStatus(t('form.sending'));
      fetch(FORM_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function () {
          form.classList.remove('sending');
          form.classList.add('sent');
          setStatus(t('form.ok'), 'ok');
          msg.value = '';
          count.textContent = '0 / 4000';
          setTimeout(function () { form.classList.remove('sent'); }, 900);
        })
        .catch(function () {
          form.classList.remove('sending');
          setStatus(t('form.err'), 'err');
        });
    });
  })();

  document.getElementById('year').textContent = new Date().getFullYear();
})();
