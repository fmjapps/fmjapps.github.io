// FMJ Apps — ana sayfa etkileşimleri
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
    'theme': 'Toggle theme', 'shots': 'Screenshots', 'close': 'Close', 'sc.prev': 'Previous', 'sc.next': 'Next', 'sc.drag': 'Drag to spin',
    'hero.eyebrow': 'Simple, reliable mobile apps',
    'hero.title': 'Simple, reliable <span class="grad">games and apps.</span>',
    'hero.lede': 'Deduction games, a light puzzle, a memorization assistant and a screen lock for kids. All for Android, and none of them ask you to sign up.',
    'hero.ctaGames': 'Games', 'hero.ctaApps': 'Apps',
    'stat.games': 'games', 'stat.apps': 'apps', 'stat.account': 'accounts required',
    'mq.daily': 'Something new every day', 'mq.offline': 'Plays offline', 'mq.langs': '9 languages',
    'games.title': 'Games',
    'games.lede': 'Games built on attention, not luck. Every visitor, every fake, every puzzle has a right answer you can find.',
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
    'v2.t': 'Your data on your phone', 'v2.d': 'Our apps have no servers of their own. Your progress, texts and settings are stored on your phone; in Prizma you can also use Google Play Games cloud saves if you like.',
    'v3.t': 'Fair play', 'v3.d': 'You win by paying attention, not by guessing. In Lost & Found Office and Prizma, each day’s content is the same for everyone in the world.',
    'v4.t': 'Nine languages', 'v4.d': 'Our games and apps come in nine or ten languages, English and Turkish among them, and open in your phone’s language.',
    'contact.title': 'Write to us',
    'contact.lede': 'Got an idea, a bug to report or a question? Write to us here. English or Turkish, both are fine.',
    'contact.mailLabel': 'Email',
    'contact.mail': 'Send an email', 'contact.copy': 'Copy', 'contact.copied': 'Address copied',
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
    'hero.h1': 'FMJ Apps: simple, reliable games and apps',
    'hero.kayip': 'Six visitors come to your station office every day. Check the report, ask three questions, catch the impostor.',
    'hero.kol': 'In the antique shop your grandfather left you, inspect pocket watches, coins and paintings. Spot the fake, haggle.',
    'hero.prizma': 'Place the mirrors and guide the beam to its targets. 60 levels, four difficulties and a new puzzle every day.',
    'hero.ezber': 'It reads your script to you, listens when it’s your turn and whispers like a prompter when you get stuck.',
    'hero.paydos': 'Pick the time and tick the allowed apps. When time is up the screen locks, and only your PIN opens it.',
    'hero.explore': 'Explore', 'hero.foot': 'FMJ Apps · Simple, reliable games and apps', 'hero.down': 'Scroll down ↓',
    'status.soon2': 'In Google Play review',
    'ph.pick': 'Pick a topic first', 'ph.msg': 'Type your message…', 'ph.name': 'Your name', 'ph.mail': 'Your email',
    'chat.hello': 'Hi! What are you writing about?',
    'chat.askMsg': 'Go ahead, we’re listening.',
    'chat.askName': 'Thanks! What name should we use when we reply?',
    'chat.askMail': 'Last one: which email should we reply to?',
    'chat.badMail': 'That email looks incomplete. Could you type it again?',
    'chat.ok': 'Your message reached us. We’ll reply to {email} as soon as we can.',
    'chat.err': 'Something went wrong and the message wasn’t sent. You can try again or write to contact@fmjapps.com.',
    'chat.retry': 'Try again', 'chat.done': 'Message sent', 'chat.again': 'Write a new message',
    'foot.tag': 'Games and apps for Android', 'foot.privacy': 'Privacy policies', 'foot.contact': 'Contact',
    'foot.play': 'Google Play developer page', 'foot.top': 'Back to top ↑'
  };
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
  var phEls = document.querySelectorAll('[data-i18n-ph]');
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
    phEls.forEach(function (el) { var k = el.getAttribute('data-i18n-ph'); if (el.disabled) return; el.setAttribute('placeholder', t(k)); });
    imgEls.forEach(function (el) { el.src = en ? el.getAttribute('data-en') : el._tr; });
    document.title = META[lang].title;
    document.querySelector('meta[name=description]').content = META[lang].desc;
    splitWords();
    if (typeof rebuildShowcase === 'function') rebuildShowcase();
    if (typeof fitNames === 'function') fitNames();
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
      { v: 'general', key: null, label: 'FMJ Apps' },
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
    document.getElementById('langBtn').addEventListener('click', function () { if (stepN === 0) start(); });
    start();
  })();

  document.getElementById('year').textContent = new Date().getFullYear();
})();
