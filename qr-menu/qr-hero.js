/* QR Menü girişi: telefona ya da sağ üstteki "Canlı hâlini görmek için tıkla" etiketine tıklayınca telefon döner;
   arkada deneme menüsünün QR kodu durur. Dönmeden önce telefon ara ara hafifçe yana dönüp geri gelir (çevrilebildiği belli olsun). */
(function () {
  'use strict';
  var box = document.getElementById('qrShow');
  var tap = document.getElementById('qrTap');
  var back = document.getElementById('qrBack');
  var flip = box && box.querySelector('.qp-flip');
  if (!box || !tap || !back || !flip) return;
  function toggle() {
    var on = !box.classList.contains('flipped');
    box.classList.add('used');
    box.classList.toggle('flipped', on);
    tap.setAttribute('aria-expanded', String(on));
    back.setAttribute('aria-hidden', String(!on));
  }
  tap.addEventListener('click', toggle);
  flip.addEventListener('click', toggle);
})();
