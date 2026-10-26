/* QR Menü girişi: telefona ya da yanındaki "Arkasını çevir" yazısına tıklayınca telefon yumuşakça döner;
   arkada masa üstünde duran bir QR kartı (deneme menüsü) görünür. */
(function () {
  'use strict';
  var box = document.getElementById('qrShow');
  var tap = document.getElementById('qrTap');
  var back = document.getElementById('qrBack');
  var flip = box && box.querySelector('.qp-flip');
  if (!box || !tap || !back || !flip) return;
  function toggle() {
    var on = !box.classList.contains('flipped');
    box.classList.toggle('flipped', on);
    tap.setAttribute('aria-expanded', String(on));
    back.setAttribute('aria-hidden', String(!on));
  }
  tap.addEventListener('click', toggle);
  flip.addEventListener('click', toggle);
})();
