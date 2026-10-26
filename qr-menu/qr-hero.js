/* QR Menü girişi: "Canlısını görün" düğmesi telefonu çevirir; arkada deneme menüsünün QR kodu durur. */
(function () {
  'use strict';
  var box = document.getElementById('qrShow');
  var btn = document.getElementById('qrLive');
  var back = document.getElementById('qrBack');
  if (!box || !btn || !back) return;
  var link = back.querySelector('a');
  btn.addEventListener('click', function () {
    var on = !box.classList.contains('flipped');
    box.classList.toggle('flipped', on);
    btn.setAttribute('aria-expanded', String(on));
    back.setAttribute('aria-hidden', String(!on));
    if (link) link.tabIndex = on ? 0 : -1;
  });
})();
