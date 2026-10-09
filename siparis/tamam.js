/* Sipariş sonuç sayfası: sipariş numarasını gösterir, taslağı temizler */
(function () {
  'use strict';
  var no = new URLSearchParams(location.search).get('no') || '';
  var el = document.getElementById('doneNo');
  if (el && /^FMJ-\d{6}-[A-Z0-9]{5}$/.test(no)) el.textContent = no;
  try { sessionStorage.removeItem('fmj-siparis-taslak'); } catch (e) {}
})();
