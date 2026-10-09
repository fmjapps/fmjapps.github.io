/* Sipariş sayfası: paket seçimi, alan adı sorgulama, özet ve iyzico ödeme sayfasına geçiş.
   Fiyatların asıl hesabı sunucuda (form.fmjapps.com/siparis) yapılır; buradaki rakamlar yalnızca gösterim içindir. */
(function () {
  'use strict';
  if (window.top !== window.self) { try { window.top.location = window.self.location.href; } catch (e) { document.documentElement.innerHTML = ''; return; } }
  var API = 'https://form.fmjapps.com';
  try { if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && localStorage.getItem('fmj-api')) API = localStorage.getItem('fmj-api'); } catch (e) {}

  var KDV = 0.20;
  var PACKS = {
    web: { name: 'Web Sitesi', price: 3400, domain: true },
    qr: { name: 'QR Menü (1 yıllık kullanım)', price: 1450, domain: false }
  };
  var DRAFT = 'fmj-siparis-taslak';

  var form = document.getElementById('orderForm');
  if (!form) return;
  var alertEl = document.getElementById('orderAlert');
  var domainIn = document.getElementById('alanAdi');
  var yearSel = document.getElementById('yil');
  var domainBtn = document.getElementById('domainBtn');
  var domainRes = document.getElementById('domainRes');
  var payBtn = document.getElementById('payBtn');
  var sumLines = document.getElementById('sumLines');
  var sumHint = document.getElementById('sumHint');

  var domain = null; // son başarılı sorgu: { domain, years, price, renewalPerYear }

  var fmt = function (n) { return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' TL'; };
  var pkgKey = function () { var r = form.querySelector('input[name=paket]:checked'); return r ? r.value : 'web'; };
  var field = function (n) { return form.elements[n]; };

  function showAlert(msg) {
    alertEl.textContent = msg || '';
    alertEl.hidden = !msg;
    if (msg) alertEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ---------- Özet ---------- */
  function render() {
    var key = pkgKey(), p = PACKS[key];
    form.querySelectorAll('[data-for]').forEach(function (el) { el.hidden = el.getAttribute('data-for') !== key; });
    var tip = (form.querySelector('input[name=faturaTip]:checked') || {}).value || 'bireysel';
    form.querySelectorAll('[data-fatura]').forEach(function (el) { el.hidden = el.getAttribute('data-fatura') !== tip; });

    var lines = [{ name: p.name, net: p.price }];
    var ready = true;
    if (p.domain) {
      if (domain && domain.domain === normDomain(domainIn.value) && String(domain.years) === yearSel.value) {
        lines.push({ name: 'Alan adı: ' + domain.domain + ' (' + domain.years + ' yıl)', net: domain.price });
      } else ready = false;
    }
    var net = lines.reduce(function (a, l) { return a + l.net; }, 0);
    var kdv = Math.round(net * KDV * 100) / 100;
    sumLines.innerHTML = '';
    lines.forEach(function (l) {
      var li = document.createElement('li');
      var a = document.createElement('span'); a.textContent = l.name;
      var b = document.createElement('b'); b.textContent = fmt(l.net);
      li.appendChild(a); li.appendChild(b); sumLines.appendChild(li);
    });
    if (!ready) {
      var li = document.createElement('li'); li.className = 'muted';
      li.innerHTML = '<span>Alan adı</span><b>sorgulanmadı</b>';
      sumLines.appendChild(li);
    }
    document.getElementById('sumNet').textContent = fmt(net);
    document.getElementById('sumKdv').textContent = fmt(kdv);
    document.getElementById('sumTotal').textContent = ready ? fmt(net + kdv) : '—';
    sumHint.hidden = ready;
  }

  /* ---------- Alan adı ---------- */
  function normDomain(v) {
    var d = String(v || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
    return /^(?=.{4,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/.test(d) ? d : null;
  }
  var REASONS = {
    extension_not_supported_via_api: 'Bu uzantıyı şu an otomatik kaydedemiyoruz. .com, .net gibi bir uzantı deneyin ya da bize WhatsApp’tan yazın.',
    extension_not_supported: 'Bu uzantıyı şu an otomatik kaydedemiyoruz. .com, .net gibi bir uzantı deneyin ya da bize WhatsApp’tan yazın.',
    domain_unavailable: 'Bu alan adı alınmış. Farklı bir ad ya da uzantı deneyin.',
    premium: 'Bu alan adı “premium” fiyatlı; çok pahalı olduğu için başka bir ad deneyin.',
    unavailable: 'Bu alan adı alınmış. Farklı bir ad ya da uzantı deneyin.'
  };
  function setDomainMsg(cls, text) {
    domainRes.className = 'o-domain-res ' + (cls || '');
    domainRes.textContent = text || '';
  }
  function checkDomain() {
    var d = normDomain(domainIn.value);
    domain = null; render();
    if (!d) { setDomainMsg('bad', 'Alan adını uzantısıyla birlikte yazın, örneğin isletmeniz.com'); domainIn.focus(); return; }
    domainIn.value = d;
    domainBtn.disabled = true;
    setDomainMsg('wait', 'Sorgulanıyor…');
    fetch(API + '/alan-adi', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ domain: d, years: Number(yearSel.value) }) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j.ok) {
          setDomainMsg('bad', j.error === 'rate' ? 'Çok sık sorguladınız; bir dakika sonra tekrar deneyin.' : 'Şu an sorgulanamadı. Biraz sonra tekrar deneyin ya da bize WhatsApp’tan yazın.');
          return;
        }
        if (!j.available) { setDomainMsg('bad', d + ' · ' + (REASONS[j.reason] || REASONS.unavailable)); return; }
        domain = { domain: j.domain, years: j.years, price: j.price, renewalPerYear: j.renewalPerYear };
        var msg = d + ' boşta. ' + j.years + ' yıllık kayıt: ' + fmt(j.price) + ' + KDV.';
        if (j.renewalPerYear) msg += ' Süre bitince yenileme yıllık yaklaşık ' + fmt(j.renewalPerYear) + ' + KDV (o günkü kura göre).';
        setDomainMsg('ok', msg);
        render();
      })
      .catch(function () { setDomainMsg('bad', 'Bağlantı kurulamadı. Biraz sonra tekrar deneyin.'); })
      .then(function () { domainBtn.disabled = false; });
  }
  domainBtn.addEventListener('click', checkDomain);
  domainIn.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); checkDomain(); } });
  domainIn.addEventListener('input', function () { if (domain) { domain = null; setDomainMsg('', ''); render(); } });
  yearSel.addEventListener('change', function () { if (normDomain(domainIn.value)) checkDomain(); else render(); });

  form.addEventListener('change', function (e) {
    if (e.target.name === 'paket' || e.target.name === 'faturaTip') render();
  });

  /* ---------- Taslak: ödeme başarısız olursa bilgiler geri gelir ---------- */
  var KEEP = ['paket', 'isletme', 'sektor', 'alanAdi', 'yil', 'menuAdres', 'aciklama', 'ad', 'soyad', 'email', 'telefon', 'faturaTip', 'unvan', 'vergiDairesi', 'adres', 'ilce', 'il'];
  function collect() {
    var o = {};
    KEEP.concat(['tckn', 'vkn', 'website']).forEach(function (n) {
      var el = field(n);
      if (!el) return;
      o[n] = (el.length !== undefined && el.tagName !== 'SELECT') ? (form.querySelector('input[name=' + n + ']:checked') || {}).value : el.value;
    });
    o.onBilgi = field('onBilgi').checked;
    o.sozlesme = field('sozlesme').checked;
    return o;
  }
  function saveDraft() {
    var o = collect(), keep = {};
    KEEP.forEach(function (n) { keep[n] = o[n]; });
    try { sessionStorage.setItem(DRAFT, JSON.stringify(keep)); } catch (e) {}
  }
  function loadDraft() {
    var o = null;
    try { o = JSON.parse(sessionStorage.getItem(DRAFT) || 'null'); } catch (e) {}
    if (!o) return;
    KEEP.forEach(function (n) {
      var el = field(n);
      if (!el || o[n] == null) return;
      if (el.length !== undefined && el.tagName !== 'SELECT') {
        var r = form.querySelector('input[name=' + n + '][value="' + o[n] + '"]');
        if (r) r.checked = true;
      } else el.value = o[n];
    });
  }

  /* ---------- Gönder ---------- */
  var LABELS = { ad: 'ad', soyad: 'soyad', email: 'e-posta', telefon: 'cep telefonu', tckn: 'T.C. kimlik no', unvan: 'şirket unvanı', vergiDairesi: 'vergi dairesi', vkn: 'vergi no', adres: 'adres', il: 'il', isletme: 'işletme adı', alanAdi: 'alan adı', menuAdres: 'menü adresi', onBilgi: 'ön bilgilendirme onayı', sozlesme: 'sözleşme onayı', paket: 'paket' };
  function markInvalid(names) {
    form.querySelectorAll('.invalid').forEach(function (el) { el.classList.remove('invalid'); });
    names.forEach(function (n) {
      var el = field(n);
      var box = el && (el.closest ? el.closest('.o-field, .o-check') : null);
      if (box) box.classList.add('invalid');
    });
    var first = names.length && field(names[0]);
    if (first && first.focus) first.focus({ preventScroll: true });
  }
  function localCheck(o) {
    var bad = [];
    if (!o.isletme.trim()) bad.push('isletme');
    if (PACKS[o.paket].domain && !(domain && domain.domain === normDomain(o.alanAdi))) bad.push('alanAdi');
    ['ad', 'soyad'].forEach(function (n) { if (!o[n].trim()) bad.push(n); });
    if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(o.email.trim())) bad.push('email');
    if (o.telefon.replace(/\D/g, '').length < 10) bad.push('telefon');
    if (o.faturaTip === 'kurumsal') {
      if (!o.unvan.trim()) bad.push('unvan');
      if (!o.vergiDairesi.trim()) bad.push('vergiDairesi');
      if (!/^\d{10,11}$/.test(o.vkn.trim())) bad.push('vkn');
    } else if (o.tckn.trim() && !/^\d{11}$/.test(o.tckn.trim())) bad.push('tckn');
    if (o.adres.trim().length < 10) bad.push('adres');
    if (!o.il.trim()) bad.push('il');
    if (!o.onBilgi) bad.push('onBilgi');
    if (!o.sozlesme) bad.push('sozlesme');
    return bad;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var o = collect();
    var bad = localCheck(o);
    if (bad.length) {
      markInvalid(bad);
      showAlert(bad.indexOf('alanAdi') >= 0 && bad.length === 1
        ? 'Devam etmek için alan adını sorgulayın.'
        : 'Lütfen işaretli alanları kontrol edin: ' + bad.map(function (n) { return LABELS[n] || n; }).join(', ') + '.');
      return;
    }
    markInvalid([]);
    showAlert('');
    saveDraft();
    payBtn.disabled = true;
    payBtn.classList.add('busy');
    fetch(API + '/siparis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j.ok && j.url && /^https:\/\/([a-z0-9-]+\.)*iyzipay\.com\//.test(j.url)) {
          try { sessionStorage.setItem('fmj-siparis-son', JSON.stringify({ no: j.no, total: j.total, paket: o.paket })); } catch (err) {}
          location.href = j.url;
          return;
        }
        if (j.error === 'invalid' && j.fields) { markInvalid(j.fields); showAlert('Lütfen işaretli alanları kontrol edin.'); }
        else if (j.error === 'domain-taken') { domain = null; render(); setDomainMsg('bad', 'Bu alan adı az önce alınmış görünüyor; başka bir ad deneyin.'); showAlert('Alan adı artık boşta değil; lütfen yeniden sorgulayın.'); }
        else if (j.error === 'rate') showAlert('Çok sık denediniz; bir dakika sonra tekrar deneyin.');
        else showAlert('Ödeme sayfası şu an açılamadı. Biraz sonra tekrar deneyin ya da bize WhatsApp’tan yazın: +90 533 318 15 55');
      })
      .catch(function () { showAlert('Bağlantı kurulamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.'); })
      .then(function () { payBtn.disabled = false; payBtn.classList.remove('busy'); });
  });

  /* ---------- Açılış ---------- */
  loadDraft();
  var q = new URLSearchParams(location.search);
  var pk = q.get('paket');
  if (pk && PACKS[pk]) { var r = form.querySelector('input[name=paket][value="' + pk + '"]'); if (r) r.checked = true; }
  if (q.get('hata')) showAlert('Ödeme tamamlanmadı; kartınızdan para çekilmedi. Bilgileriniz duruyor, tekrar deneyebilirsiniz.');
  render();
  if (pkgKey() === 'web' && normDomain(domainIn.value)) checkDomain();
})();
