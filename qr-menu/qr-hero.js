/* QR Menü girişi: telefon kendiliğinden döner; önde menü (4 sn), arkada deneme menüsünün QR kodu (6 sn).
   Fare telefonun üstündeyken (QR okutulurken) ya da sekme görünmezken dönüş durur. */
(function () {
  'use strict';
  var box = document.getElementById('qrShow');
  var back = document.getElementById('qrBack');
  if (!box || !back) return;
  var hold = false, timer = null;
  function next() {
    var on = !box.classList.contains('flipped');
    timer = setTimeout(function () {
      if (hold || document.hidden) { next(); return; }
      box.classList.toggle('flipped', on);
      back.setAttribute('aria-hidden', String(!on));
      next();
    }, on ? 4000 : 6000);
  }
  box.addEventListener('mouseenter', function () { hold = true; });
  box.addEventListener('mouseleave', function () { hold = false; });
  next();
})();
