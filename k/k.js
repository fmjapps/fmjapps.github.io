(function () {
  var root = document.documentElement;
  // Intro'ya dokununca atlanır
  var intro = document.getElementById('intro');
  if (intro) intro.addEventListener('click', function () {
    root.classList.add('skip');
    intro.style.display = 'none';
  });
  // Arka plan ışığı imleci / parmağı yavaşça izler
  function izle(x, y) { root.style.setProperty('--px', x + 'px'); root.style.setProperty('--py', y + 'px'); }
  addEventListener('pointermove', function (e) { izle(e.clientX, e.clientY); }, { passive: true });
  addEventListener('touchmove', function (e) { var t = e.touches[0]; if (t) izle(t.clientX, t.clientY); }, { passive: true });

  // Butonlarda ışık parmağı izler; dokununca dalga ve hafif titreşim
  document.querySelectorAll('.btn').forEach(function (b) {
    function konum(e) {
      var r = b.getBoundingClientRect();
      b.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      b.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }
    b.addEventListener('pointermove', konum);
    b.addEventListener('pointerdown', function (e) {
      konum(e);
      b.classList.add('on');
      var r = b.getBoundingClientRect(), d = document.createElement('span');
      d.className = 'dalga';
      d.style.left = (e.clientX - r.left) + 'px';
      d.style.top = (e.clientY - r.top) + 'px';
      b.appendChild(d);
      setTimeout(function () { d.remove(); }, 650);
      if (navigator.vibrate) { try { navigator.vibrate(12); } catch (_) {} }
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (n) {
      b.addEventListener(n, function () { b.classList.remove('on'); });
    });
  });
})();
