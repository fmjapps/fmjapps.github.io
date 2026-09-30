/* FMJ Apps — uygulama sayfalarının betiği: tema, dil tercihi ve tam ekran sayfa geçişi */
(function () {
  var root = document.documentElement;
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  // Tema, sayfa çizilmeden önce seçilir (yanıp sönmesin diye)
  var theme = read('fmj-theme');
  if (theme !== 'light' && theme !== 'dark') theme = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  root.setAttribute('data-theme', theme);
  root.classList.add('js');

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('themeBtn');
    if (btn) btn.addEventListener('click', function () {
      theme = theme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', theme);
      store('fmj-theme', theme);
    });

    // Dil değiştirilince tercih kaydedilir, ana sayfa da aynı dilde açılır
    document.querySelectorAll('[data-set-lang]').forEach(function (a) {
      a.addEventListener('click', function () { store('fmj-lang', a.getAttribute('data-set-lang')); });
    });

    // Dil menüsü dışarı tıklanınca ya da Esc ile kapanır
    var menu = document.getElementById('lang');
    if (menu) {
      document.addEventListener('click', function (e) { if (menu.open && !menu.contains(e.target)) menu.open = false; });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary').focus(); } });
    }

    gallery();
    pager();
  });

  /* ---------- Telefonda ekran görüntüleri tek tek gösterilir ---------- */
  function gallery() {
    var track = document.getElementById('gallery'), dotsWrap = document.getElementById('gdots');
    if (!track || !dotsWrap) return;
    var slides = track.querySelectorAll('figure'), dots = [], index = 0, touched = false;
    function go(i) { track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: 'smooth' }); }
    Array.prototype.forEach.call(slides, function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.tabIndex = -1;
      b.addEventListener('click', function () { touched = true; go(i); });
      dotsWrap.appendChild(b);
      dots.push(b);
    });
    function mark() {
      index = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
      dots.forEach(function (d, i) { d.classList.toggle('on', i === index); });
    }
    track.addEventListener('scroll', mark, { passive: true });
    ['touchstart', 'pointerdown', 'wheel'].forEach(function (ev) { track.addEventListener(ev, function () { touched = true; }, { passive: true }); });
    mark();
    // Dokunulana kadar, ekrandayken kendiliğinden ilerler
    setInterval(function () {
      if (touched || document.hidden || track.scrollWidth <= track.clientWidth + 4) return;
      var r = track.getBoundingClientRect();
      if (r.top > innerHeight * .7 || r.bottom < innerHeight * .3) return;
      go((index + 1) % slides.length);
    }, 3200);
  }

  /* ---------- Reels gibi sayfa geçişi (ana sayfadakiyle aynı mantık) ---------- */
  function pager() {
    var nav = document.getElementById('pager');
    // Telefonda bölünen sayfaların her yarısı ayrı bir sayfadır
    var narrow = matchMedia('(max-width: 900px)');
    var pages = [], cur = 0, anim = null, lockUntil = 0;

    function collect() {
      pages = Array.prototype.slice.call(document.querySelectorAll(narrow.matches ? '.page:not(.split), .half' : '.page'));
    }
    function top(el) { return el.getBoundingClientRect().top + window.scrollY; }
    function build() {
      collect();
      nav.innerHTML = '';
      pages.forEach(function (p, i) {
        var b = document.createElement('button');
        var name = p.getAttribute('data-label') || '';
        b.type = 'button';
        b.setAttribute('aria-label', name);
        var s = document.createElement('span');
        s.textContent = name;
        b.appendChild(s);
        b.addEventListener('click', function () { goTo(i); });
        nav.appendChild(b);
      });
      cur = nearest();
      mark();
    }
    function mark() {
      Array.prototype.forEach.call(nav.children, function (b, i) { b.classList.toggle('on', i === cur); });
      var p = pages[cur];
      p.classList.add('in');
      var parent = p.closest('.page');
      if (parent) parent.classList.add('in');
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
      root.style.scrollBehavior = 'auto';
      (function step(now) {
        var k = Math.min(1, (now - t0) / dur);
        var e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        window.scrollTo(0, from + dist * e);
        if (k < 1) anim = requestAnimationFrame(step);
        else { anim = null; lockUntil = performance.now() + 420; root.style.scrollBehavior = ''; }
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
    function busy() { return anim !== null || performance.now() < lockUntil; }
    // Yatay tutulan telefonda (çok alçak ekran) sayfa geçişi kapanır, sayfa normal kayar
    function flat() { return innerHeight < 430; }
    // Sayfa ekrana sığmıyorsa önce kendi içinde kayar
    function nativeFirst(dir) {
      var p = pages[cur], r = p.getBoundingClientRect();
      // Ekrana sığan sayfada iç kaydırma yoktur; taşan sayfanın sonu her zaman görülebilir
      if (p.offsetHeight - innerHeight < 8) return false;
      if (dir > 0 && r.bottom > innerHeight + 2) return true;
      if (dir < 0 && r.top < -2) return true;
      return false;
    }
    function edge(dir) { return (dir > 0 && cur === pages.length - 1) || (dir < 0 && cur === 0); }

    window.addEventListener('scroll', function () { if (!anim) { var n = nearest(); if (n !== cur) { cur = n; mark(); } } }, { passive: true });

    window.addEventListener('wheel', function (e) {
      // Dil menüsü açıkken teker menüyü kaydırır
      if (e.ctrlKey || flat() || (e.target.closest && e.target.closest('.lang-menu'))) return;
      var dir = e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0;
      if (!dir || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (anim) { e.preventDefault(); return; }
      if (nativeFirst(dir) || edge(dir)) return;
      e.preventDefault();
      if (busy() || Math.abs(e.deltaY) < 3) return;
      goTo(cur + dir, dir);
    }, { passive: false });

    var ty = null, tx = 0, mode = null;
    window.addEventListener('touchstart', function (e) {
      if (e.touches.length > 1 || flat() || (e.target.closest && e.target.closest('.lang-menu'))) { ty = null; return; }
      ty = e.touches[0].clientY; tx = e.touches[0].clientX; mode = null;
    }, { passive: true });
    window.addEventListener('touchmove', function (e) {
      if (ty === null) return;
      var dy = ty - e.touches[0].clientY, dx = tx - e.touches[0].clientX;
      if (mode === null) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        var dir = dy > 0 ? 1 : -1;
        // Yana kaydırma (ekran görüntüleri) sayfayı değiştirmez
        mode = Math.abs(dx) > Math.abs(dy) || nativeFirst(dir) || edge(dir) ? 'native' : 'page';
      }
      if (mode === 'page') e.preventDefault();
    }, { passive: false });
    window.addEventListener('touchend', function (e) {
      if (ty === null) return;
      var dy = ty - e.changedTouches[0].clientY;
      if (mode === 'page' && Math.abs(dy) > 28 && !busy()) goTo(cur + (dy > 0 ? 1 : -1), dy > 0 ? 1 : -1);
      ty = null;
    });

    document.addEventListener('keydown', function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey || flat()) return;
      var t = e.target, space = e.key === ' ';
      // Düğme ve soru başlıklarında boşluk tuşu kendi işini yapar
      if (space && t.closest && t.closest('a, button, summary')) return;
      var dir = 0;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || (space && !e.shiftKey)) dir = 1;
      else if (e.key === 'ArrowUp' || e.key === 'PageUp' || (space && e.shiftKey)) dir = -1;
      else if (e.key === 'Home') { e.preventDefault(); goTo(0); return; }
      else if (e.key === 'End') { e.preventDefault(); goTo(pages.length - 1); return; }
      if (!dir || nativeFirst(dir) || edge(dir)) return;
      e.preventDefault();
      if (!busy()) goTo(cur + dir, dir);
    });

    // Sayfa içi bağlantılar (#katil gibi) ilgili sayfaya kayar
    function pageOf(el) {
      while (el && pages.indexOf(el) < 0) el = el.parentElement;
      return el ? pages.indexOf(el) : -1;
    }
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var el = document.getElementById(a.getAttribute('href').slice(1));
      var i = pageOf(el);
      if (i < 0) return;
      e.preventDefault();
      goTo(i);
    });

    // Ekran döndüğünde ya da daraldığında sayfa listesi yeniden kurulur
    var rt = null;
    function rebuild() { clearTimeout(rt); rt = setTimeout(function () { build(); window.scrollTo(0, top(pages[cur])); }, 150); }
    if (narrow.addEventListener) narrow.addEventListener('change', rebuild); else narrow.addListener(rebuild);

    // Adres çubuğu gizlenip görününce ekran boyu değişir: sayfa yeniden üst kenara oturur
    var resnap = null;
    window.addEventListener('resize', function () {
      clearTimeout(resnap);
      resnap = setTimeout(function () {
        if (anim) return;
        var p = pages[cur], y = top(p);
        if (p.offsetHeight - innerHeight < 8 && Math.abs(window.scrollY - y) > 1) window.scrollTo(0, y);
      }, 140);
    });

    build();
    var start = document.getElementById(location.hash.slice(1));
    if (start && pageOf(start) >= 0) window.addEventListener('load', function () {
      setTimeout(function () { cur = pageOf(start); window.scrollTo(0, top(pages[cur])); mark(); }, 0);
    });
  }
})();
