/* Mirus sohbet balonunu sitenin temasına uydurur: renkler açık/koyu temaya göre, telefonda sohbet tam ekran.
   Balon kendi stilini gölge DOM'da tutar; buraya yalnızca üzerine yazan küçük bir stil eklenir. */
(function () {
  'use strict';
  var CSS =
    ':host{--tw-btn:#FF4F2E;--tw-head:#244A4B;--tw-head-ink:#F6F1E9;--tw-accent:#244A4B;--tw-bg:#F6F1E9;--tw-surface:#FFFFFF;--tw-text:#111111;--tw-dim:#666666;--tw-line:#ECE6DC;--tw-line2:#DCD5CA}' +
    ':host(.dark){--tw-head:#244A4B;--tw-accent:#376E6F;--tw-bg:#161A1A;--tw-surface:#1E2323;--tw-text:#F6F1E9;--tw-dim:#A3AAA9;--tw-line:#2A3030;--tw-line2:#343B3B}' +
    '*{font-family:"Inter",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif!important}' +
    '.btn{background:var(--tw-btn)!important;box-shadow:0 12px 30px -8px rgba(255,79,46,.55)!important}' +
    '.panel{background:var(--tw-surface)!important;color:var(--tw-text)!important;border:1px solid var(--tw-line)}' +
    '.head{background:var(--tw-head)!important;color:var(--tw-head-ink)!important}' +
    '.head b{font-family:"Sora","Inter",sans-serif!important}' +
    '.head button{color:var(--tw-head-ink)!important}' +
    '.msgs{background:var(--tw-bg)!important}' +
    '.m.in{background:var(--tw-accent)!important;color:#F6F1E9!important}' +
    '.m.out{background:var(--tw-surface)!important;border-color:var(--tw-line)!important;color:var(--tw-text)!important}' +
    '.m .pv{color:var(--tw-text)!important;border-color:var(--tw-line2)!important}' +
    '.m.note,.typing{color:var(--tw-dim)!important}' +
    'form,.foot{background:var(--tw-surface)!important;border-color:var(--tw-line)!important}' +
    '.foot{color:var(--tw-dim)!important}' +
    'textarea{background:var(--tw-bg)!important;color:var(--tw-text)!important;border-color:var(--tw-line2)!important}' +
    'textarea:focus{border-color:var(--tw-accent)!important}' +
    'form button{background:var(--tw-btn)!important}' +
    /* Telefonda: balon biraz küçük, sohbet üst çubuğun altından balonun üstüne kadar tam genişlik */
    '@media (max-width:560px){' +
      '.btn{width:54px!important;height:54px!important}' +
      '.btn svg{width:25px!important;height:25px!important}' +
      '.panel:not(.inline){position:fixed!important;left:10px!important;right:10px!important;top:82px!important;bottom:84px!important;width:auto!important;height:auto!important;border-radius:16px!important}' +
      'textarea{font-size:16px!important}' +
    '}';

  function isDark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }

  function dress(host) {
    var root = host.shadowRoot;
    if (!root || root.getElementById('fmj-tema')) return;
    var st = document.createElement('style');
    st.id = 'fmj-tema';
    st.textContent = CSS;
    root.appendChild(st);
    var sync = function () { host.classList.toggle('dark', isDark()); };
    sync();
    new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    // Telefonda balon sayfanın kenarına biraz daha yakın dursun
    var place = function () { var m = window.innerWidth <= 560; host.style.right = m ? '14px' : '18px'; host.style.bottom = m ? '14px' : '18px'; };
    place();
    window.addEventListener('resize', place);
  }

  function find() {
    var kids = document.body ? document.body.children : [];
    for (var i = 0; i < kids.length; i++) {
      var r = kids[i].shadowRoot;
      if (r && r.querySelector('.btn') && r.querySelector('.panel')) { dress(kids[i]); return true; }
    }
    return false;
  }

  // Balon betiği eşzamansız yüklenir; gövdeye eklenince yakala
  if (find()) return;
  var mo = new MutationObserver(function () { if (find()) mo.disconnect(); });
  var start = function () { mo.observe(document.body, { childList: true }); setTimeout(function () { mo.disconnect(); }, 20000); };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
