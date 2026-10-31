/* Sipariş sayfası: paket seçimi, alan adı sorgulama, özet ve iyzico ödeme sayfasına geçiş.
   Fiyatların asıl hesabı sunucuda (form.fmjapps.com/siparis) yapılır; buradaki rakamlar yalnızca gösterim içindir. */
(function () {
  'use strict';
  if (window.top !== window.self) { try { window.top.location = window.self.location.href; } catch (e) { document.documentElement.innerHTML = ''; return; } }
  var API = 'https://form.fmjapps.com';
  try { if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && localStorage.getItem('fmj-api')) API = localStorage.getItem('fmj-api'); } catch (e) {}

// İnsan doğrulaması: form.fmjapps.com/durum "pow" derse kendi iş kanıtımız (aşağıda). Sunucu "pow" demezse doğrulama istenmiyor (null)
  // çalışır; yalnız şüpheli durumda sol altta küçük bir kutu çıkar. Anahtar yoksa ya da yüklenemezse null döner.
  // Kendi iş kanıtı doğrulamamız: form.fmjapps.com/zorluk imzalı bir bulmaca verir, tarayıcı çözer, çözüm formla birlikte gider.
  // Üçüncü tarafa istek gitmez. sha256(salt + sayı) = challenge olan sayıyı 0..maxnumber arasında arar.
  function solvePow(c) {
    var enc = new TextEncoder(), n = 0;
    function hex(buf) { var a = new Uint8Array(buf), h = ''; for (var i = 0; i < a.length; i++) h += (a[i] < 16 ? '0' : '') + a[i].toString(16); return h; }
    function next() {
      if (n > c.maxnumber) return Promise.reject(new Error('pow'));
      var start = n, end = Math.min(n + 512, c.maxnumber + 1), ps = [];
      n = end;
      for (var i = start; i < end; i++) ps.push(crypto.subtle.digest('SHA-256', enc.encode(c.salt + i)));
      return Promise.all(ps).then(function (hs) {
        for (var k = 0; k < hs.length; k++) if (hex(hs[k]) === c.challenge) return start + k;
        return next();
      });
    }
    if (!window.crypto || !crypto.subtle) return Promise.reject(new Error('pow'));
    return next().then(function (num) {
      var json = JSON.stringify({ challenge: c.challenge, salt: c.salt, signature: c.signature, number: num });
      return 'pow1.' + btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    });
  }
  function insanToken(api) {
    return fetch(api + '/durum').then(function (r) { return r.json(); }).then(function (j) {
      if (!j) return null;
      if (j.pow) return fetch(api + '/zorluk').then(function (r) { return r.json(); }).then(solvePow);
      return null;
    }).catch(function () { return null; });
  }

  // Sayfanın dili adresinden gelir (/en/order/ ...); Türkçe metinler burada, diğer diller /i18n/<dil>.json içinde
  var LANG = document.documentElement.lang || 'tr';
  var TR = {
    "ord.y1": "1 yıl",
    "ord.y2": "2 yıl",
    "ord.y3": "3 yıl",
    "ord.y4": "4 yıl",
    "ord.y5": "5 yıl",
    "ordj.pk.web": "Web Sitesi",
    "ordj.pk.qr": "QR Menü (1 yıllık kullanım)",
    "ordj.l3d": "3D model ve AR ({n} ürün × {p} TL)",
    "ordj.lshoot": "Ürün çekimi (İzmir içi)",
    "ordj.ldomain": "Alan adı: {d} ({y})",
    "ordj.sum.ok": "ürün × {p} TL = {t} + KDV",
    "ordj.sum.empty": "ürün × {p} TL + KDV",
    "ordj.sum.bad": "{min} ile {max} arasında bir sayı yazın",
    "ordj.cekimwarn": "Ürün çekimi yalnız İzmir il sınırları içinde yapılıyor. İzmir dışındaysanız fotoğrafları siz çekin; nasıl çekileceğini tarif ederiz.",
    "ordj.cay.dom": "kaydedilen alan adı ücreti",
    "ordj.cay.shoot": "yapılmış ürün çekimi",
    "ordj.cay.3d": "yayına alınmış 3D modeller",
    "ordj.cay.sep": ", ",
    "ordj.cay.wrap": " ({list} hariç)",
    "ordj.m.dom.a": "Alan adı",
    "ordj.m.dom.b": "sorgulanmadı",
    "ordj.m.3d.a": "3D model: ürün sayısı",
    "ordj.m.3d.b": "girilmedi",
    "ordj.r.ext": "Bu uzantıyı şu an otomatik kaydedemiyoruz. .com, .net gibi bir uzantı deneyin ya da bize WhatsApp’tan yazın.",
    "ordj.r.taken": "Bu alan adı alınmış. Farklı bir ad ya da uzantı deneyin.",
    "ordj.r.premium": "Bu alan adı “premium” fiyatlı; çok pahalı olduğu için başka bir ad deneyin.",
    "ordj.d.bad": "Alan adını uzantısıyla birlikte yazın, örneğin isletmeniz.com",
    "ordj.d.wait": "Sorgulanıyor…",
    "ordj.d.rate": "Çok sık sorguladınız; bir dakika sonra tekrar deneyin.",
    "ordj.d.fail": "Şu an sorgulanamadı. Biraz sonra tekrar deneyin ya da bize WhatsApp’tan yazın.",
    "ordj.d.free": "{d} boşta. Kayıt ({y}): {p} + KDV.",
    "ordj.d.renew": " Süre bitince yenileme yıllık yaklaşık {p} + KDV (o günkü kura göre).",
    "ordj.d.conn": "Bağlantı kurulamadı. Biraz sonra tekrar deneyin.",
    "ordj.lb.ad": "ad",
    "ordj.lb.soyad": "soyad",
    "ordj.lb.email": "e-posta",
    "ordj.lb.telefon": "cep telefonu",
    "ordj.lb.tckn": "T.C. kimlik no",
    "ordj.lb.unvan": "şirket unvanı",
    "ordj.lb.vergiDairesi": "vergi dairesi",
    "ordj.lb.vkn": "vergi no",
    "ordj.lb.adres": "adres",
    "ordj.lb.il": "il",
    "ordj.lb.isletme": "işletme adı",
    "ordj.lb.alanAdi": "alan adı",
    "ordj.lb.menuAdres": "menü adresi",
    "ordj.lb.onBilgi": "ön bilgilendirme onayı",
    "ordj.lb.sozlesme": "sözleşme onayı",
    "ordj.lb.alanAdiOnay": "alan adı kaydı onayı",
    "ordj.lb.paket": "paket",
    "ordj.lb.urun3d": "3D ürün sayısı",
    "ordj.lb.cekim": "ürün çekimi (yalnız İzmir içi)",
    "ordj.lb.onay3d": "3D model onayı",
    "ordj.lb.cekimOnay": "ürün çekimi onayı",
    "ordj.closed": "Online ödeme çok yakında açılıyor. Şimdilik siparişinizi WhatsApp’tan (+90 533 318 15 55) ya da contact@fmjapps.com adresinden verebilirsiniz.",
    "ordj.err.dom": "Devam etmek için alan adını sorgulayın.",
    "ordj.err.fields": "Lütfen işaretli alanları kontrol edin: {list}.",
    "ordj.err.fields2": "Lütfen işaretli alanları kontrol edin.",
    "ordj.err.taken1": "Bu alan adı az önce alınmış görünüyor; başka bir ad deneyin.",
    "ordj.err.taken2": "Alan adı artık boşta değil; lütfen yeniden sorgulayın.",
    "ordj.err.bot": "Güvenlik doğrulaması tamamlanamadı. Sayfayı yenileyip tekrar deneyin ya da bize WhatsApp’tan yazın: +90 533 318 15 55",
    "ordj.err.rate": "Çok sık denediniz; bir dakika sonra tekrar deneyin.",
    "ordj.err.pay": "Ödeme sayfası şu an açılamadı. Biraz sonra tekrar deneyin ya da bize WhatsApp’tan yazın: +90 533 318 15 55",
    "ordj.err.conn": "Bağlantı kurulamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.",
    "ordj.err.hata": "Ödeme tamamlanmadı; kartınızdan bir çekim yapıldıysa otomatik olarak iade edilir. Bilgileriniz duruyor, tekrar deneyebilirsiniz."
  };
  var DICT = null;
  function s(key, vars) {
    var v = (LANG !== 'tr' && DICT && DICT[key]) || TR[key] || key;
    return vars ? v.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; }) : v;
  }
  var langReady = LANG === 'tr' ? Promise.resolve() : fetch('/i18n/' + LANG + '.json')
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (j) { DICT = j; })
    .catch(function () {});
  // Para birimi hep TL kalır; yalnız sayı yazımı sayfanın diline uyar (3.700 / 3,700)
  var NUM = LANG === 'tr' ? 'tr-TR' : LANG + '-u-nu-latn';
  var num = function (n, o) { try { return n.toLocaleString(NUM, o); } catch (e) { return n.toLocaleString('tr-TR', o); } };

  var KDV = 0.20;
  var PACKS = {
    web: { k: 'ordj.pk.web', price: 3700, domain: true },
    qr: { k: 'ordj.pk.qr', price: 1450, domain: false }
  };
  // QR Menü'ye 3D model ve artırılmış gerçeklik eki: ürün başına ücret, isteğe bağlı İzmir içi çekim (sunucuyla aynı)
  var EK3D = { perItem: 100, min: 1, max: 200, shoot: 1000 };
  var isIzmir = function (il) { return String(il || '').trim().toLocaleLowerCase('tr').replace(/ı/g, 'i').replace(/[^a-z]/g, '') === 'izmir'; };
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
  var urunIn = document.getElementById('urun3d');
  var urunSum = document.getElementById('urun3dSum');
  var cekimRes = document.getElementById('cekimRes');

  var domain = null; // son başarılı sorgu: { domain, years, price, renewalPerYear }

  var fmt = function (n) { return num(n, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' TL'; };
  var pkgKey = function () { var r = form.querySelector('input[name=paket]:checked'); return r ? r.value : 'web'; };
  var field = function (n) { return form.elements[n]; };
  var radio = function (n, def) { var r = form.querySelector('input[name=' + n + ']:checked'); return r ? r.value : def; };
  var fmtTl = function (n) { return num(n) + ' TL'; };
  // 3D eki durumu: yalnız QR Menü seçiliyken
  function ek3d() {
    if (pkgKey() !== 'qr' || !field('ek3d').checked) return null;
    var n = urunIn.value.trim() === '' ? NaN : Number(urunIn.value);
    return { n: n, ok: Number.isInteger(n) && n >= EK3D.min && n <= EK3D.max, cekim: radio('foto', 'ben') === 'cekim' };
  }

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
    var e3 = ek3d();
    form.querySelectorAll('[data-ek]').forEach(function (el) { el.hidden = !e3; });
    form.querySelectorAll('[data-cekim]').forEach(function (el) { el.hidden = !(e3 && e3.cekim); });
    var cayma = key === 'web' ? [s('ordj.cay.dom')] : [];
    if (e3 && e3.cekim) cayma.push(s('ordj.cay.shoot'));
    if (e3) cayma.push(s('ordj.cay.3d'));
    document.querySelectorAll('[data-cayma]').forEach(function (el) { el.textContent = cayma.length ? s('ordj.cay.wrap', { list: cayma.join(s('ordj.cay.sep')) }) : ''; });

    var lines = [{ name: s(p.k), net: p.price }];
    var ready = true;
    if (e3) {
      urunSum.textContent = e3.ok ? s('ordj.sum.ok', { p: EK3D.perItem, t: fmtTl(e3.n * EK3D.perItem) }) : (urunIn.value.trim() === '' ? s('ordj.sum.empty', { p: EK3D.perItem }) : s('ordj.sum.bad', { min: EK3D.min, max: EK3D.max }));
      if (e3.ok) lines.push({ name: s('ordj.l3d', { n: e3.n, p: EK3D.perItem }), net: e3.n * EK3D.perItem });
      else ready = false;
      if (e3.cekim) lines.push({ name: s('ordj.lshoot'), net: EK3D.shoot });
      var il = field('il').value.trim();
      cekimRes.textContent = e3.cekim && il && !isIzmir(il) ? s('ordj.cekimwarn') : '';
    }
    if (p.domain) {
      if (domain && domain.domain === normDomain(domainIn.value) && String(domain.years) === yearSel.value) {
        lines.push({ name: s('ordj.ldomain', { d: domain.domain, y: s('ord.y' + domain.years) }), net: domain.price });
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
      var ma = document.createElement('span'), mb = document.createElement('b');
      ma.textContent = s(p.domain ? 'ordj.m.dom.a' : 'ordj.m.3d.a'); mb.textContent = s(p.domain ? 'ordj.m.dom.b' : 'ordj.m.3d.b');
      li.appendChild(ma); li.appendChild(mb);
      sumLines.appendChild(li);
    }
    document.getElementById('sumNet').textContent = fmt(net);
    document.getElementById('sumKdv').textContent = fmt(kdv);
    document.getElementById('sumTotal').textContent = ready ? fmt(net + kdv) : '—';
    sumHint.hidden = ready || !p.domain;
  }

  /* ---------- Alan adı ---------- */
  function normDomain(v) {
    var d = String(v || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
    return /^(?=.{4,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/.test(d) ? d : null;
  }
  var REASONS = { extension_not_supported_via_api: 'ordj.r.ext', extension_not_supported: 'ordj.r.ext', domain_unavailable: 'ordj.r.taken', premium: 'ordj.r.premium', unavailable: 'ordj.r.taken' };
  function setDomainMsg(cls, text) {
    domainRes.className = 'o-domain-res ' + (cls || '');
    domainRes.textContent = text || '';
  }
  function checkDomain() {
    var d = normDomain(domainIn.value);
    domain = null; render();
    if (!d) { setDomainMsg('bad', s('ordj.d.bad')); domainIn.focus(); return; }
    domainIn.value = d;
    domainBtn.disabled = true;
    setDomainMsg('wait', s('ordj.d.wait'));
    fetch(API + '/alan-adi', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ domain: d, years: Number(yearSel.value) }) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j.ok) {
          setDomainMsg('bad', j.error === 'rate' ? s('ordj.d.rate') : s('ordj.d.fail'));
          return;
        }
        if (!j.available) { setDomainMsg('bad', d + ' · ' + s(REASONS[j.reason] || REASONS.unavailable)); return; }
        domain = { domain: j.domain, years: j.years, price: j.price, renewalPerYear: j.renewalPerYear };
        var msg = s('ordj.d.free', { d: d, y: s('ord.y' + j.years), p: fmt(j.price) });
        if (j.renewalPerYear) msg += s('ordj.d.renew', { p: fmt(j.renewalPerYear) });
        setDomainMsg('ok', msg);
        render();
      })
      .catch(function () { setDomainMsg('bad', s('ordj.d.conn')); })
      .then(function () { domainBtn.disabled = false; });
  }
  domainBtn.addEventListener('click', checkDomain);
  domainIn.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); checkDomain(); } });
  domainIn.addEventListener('input', function () { if (domain) { domain = null; setDomainMsg('', ''); render(); } });
  yearSel.addEventListener('change', function () { if (normDomain(domainIn.value)) checkDomain(); else render(); });

  form.addEventListener('change', function (e) {
    if (['paket', 'faturaTip', 'ek3d', 'foto', 'il'].indexOf(e.target.name) >= 0) render();
  });
  urunIn.addEventListener('input', render);
  field('il').addEventListener('input', function () { if (ek3d()) render(); });

  /* ---------- Taslak: ödeme başarısız olursa bilgiler geri gelir ---------- */
  var KEEP = ['paket', 'urun3d', 'foto', 'isletme', 'sektor', 'alanAdi', 'yil', 'menuAdres', 'aciklama', 'ad', 'soyad', 'email', 'telefon', 'faturaTip', 'unvan', 'vergiDairesi', 'adres', 'ilce', 'il'];
  function collect() {
    var o = {};
    KEEP.concat(['tckn', 'vkn', 'website']).forEach(function (n) {
      var el = field(n);
      if (!el) return;
      o[n] = (el.length !== undefined && el.tagName !== 'SELECT') ? (form.querySelector('input[name=' + n + ']:checked') || {}).value : el.value;
    });
    o.onBilgi = field('onBilgi').checked;
    o.sozlesme = field('sozlesme').checked;
    // Alan adı kaydı onayı yalnız Web Sitesi paketinde sorulur
    o.alanAdiOnay = PACKS[o.paket] && PACKS[o.paket].domain ? field('alanAdiOnay').checked : false;
    // 3D eki ve onayları yalnız QR Menü + 3D/AR seçiliyken gönderilir
    var e3 = ek3d();
    o.ek = e3 ? '3d' : 'yok';
    o.urun3d = e3 ? e3.n : 0;
    o.cekim = !!(e3 && e3.cekim);
    o.onay3d = !!e3 && field('onay3d').checked;
    o.cekimOnay = o.cekim && field('cekimOnay').checked;
    return o;
  }
  function saveDraft() {
    var o = collect(), keep = {};
    KEEP.forEach(function (n) { keep[n] = o[n]; });
    keep.ek3d = field('ek3d').checked; keep.urun3d = urunIn.value; keep.foto = radio('foto', 'ben');
    try { sessionStorage.setItem(DRAFT, JSON.stringify(keep)); } catch (e) {}
  }
  function loadDraft() {
    var o = null;
    try { o = JSON.parse(sessionStorage.getItem(DRAFT) || 'null'); } catch (e) {}
    if (!o) return;
    if (o.ek3d) field('ek3d').checked = true;
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
  var LABELS = { ad: 'ordj.lb.ad', soyad: 'ordj.lb.soyad', email: 'ordj.lb.email', telefon: 'ordj.lb.telefon', tckn: 'ordj.lb.tckn', unvan: 'ordj.lb.unvan', vergiDairesi: 'ordj.lb.vergiDairesi', vkn: 'ordj.lb.vkn', adres: 'ordj.lb.adres', il: 'ordj.lb.il', isletme: 'ordj.lb.isletme', alanAdi: 'ordj.lb.alanAdi', menuAdres: 'ordj.lb.menuAdres', onBilgi: 'ordj.lb.onBilgi', sozlesme: 'ordj.lb.sozlesme', alanAdiOnay: 'ordj.lb.alanAdiOnay', paket: 'ordj.lb.paket', urun3d: 'ordj.lb.urun3d', cekim: 'ordj.lb.cekim', onay3d: 'ordj.lb.onay3d', cekimOnay: 'ordj.lb.cekimOnay' };
  var ALIAS = { cekim: 'foto' };
  // Radyo grubunda (RadioNodeList) işaretlenecek öğe son seçenektir
  var one = function (el) { return el && el.length !== undefined && el.tagName !== 'SELECT' ? el[el.length - 1] : el; };
  function markInvalid(names) {
    form.querySelectorAll('.invalid').forEach(function (el) { el.classList.remove('invalid'); });
    names.forEach(function (n) {
      var el = one(field(ALIAS[n] || n));
      var box = el && (el.closest ? el.closest('.o-field, .o-check') : null);
      if (box) box.classList.add('invalid');
    });
    var first = names.length && one(field(ALIAS[names[0]] || names[0]));
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
    if (PACKS[o.paket].domain && !o.alanAdiOnay) bad.push('alanAdiOnay');
    if (o.ek === '3d') {
      if (!(Number.isInteger(o.urun3d) && o.urun3d >= EK3D.min && o.urun3d <= EK3D.max)) bad.push('urun3d');
      if (o.cekim && !isIzmir(o.il)) bad.push('cekim');
      if (!o.onay3d) bad.push('onay3d');
      if (o.cekim && !o.cekimOnay) bad.push('cekimOnay');
    }
    return bad;
  }

  // Satış kapalıyken (form.fmjapps.com/durum) ödeme düğmesi pasif kalır; tek anahtar sunucudadır (SATIS_ACIK).
  var satisKapali = false;
    function kapat() { satisKapali = true; payBtn.disabled = true; showAlert(s('ordj.closed')); }
  fetch(API + '/durum').then(function (r) { return r.json(); }).then(function (j) { if (!j || !j.satis) kapat(); }).catch(function () {});

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (satisKapali) { showAlert(s('ordj.closed')); return; }
    var o = collect();
    var bad = localCheck(o);
    if (bad.length) {
      markInvalid(bad);
      showAlert(bad.indexOf('alanAdi') >= 0 && bad.length === 1
        ? s('ordj.err.dom')
        : s('ordj.err.fields', { list: bad.map(function (n) { return LABELS[n] ? s(LABELS[n]) : n; }).join(', ') }));
      return;
    }
    markInvalid([]);
    showAlert('');
    saveDraft();
    payBtn.disabled = true;
    payBtn.classList.add('busy');
    insanToken(API)
      .then(function (tok) { o.ts = tok; return fetch(API + '/siparis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) }); })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j.ok && j.url && /^https:\/\/([a-z0-9-]+\.)*iyzipay\.com([\/?#]|$)/.test(j.url)) {
          try { sessionStorage.setItem('fmj-siparis-son', JSON.stringify({ no: j.no, total: j.total, paket: o.paket })); } catch (err) {}
          location.href = j.url;
          return;
        }
        if (j.error === 'invalid' && j.fields) { markInvalid(j.fields); showAlert(s('ordj.err.fields2')); }
        else if (j.error === 'domain-taken') { domain = null; render(); setDomainMsg('bad', s('ordj.err.taken1')); showAlert(s('ordj.err.taken2')); }
        else if (j.error === 'kapali') kapat();
        else if (j.error === 'bot') showAlert(s('ordj.err.bot'));
        else if (j.error === 'rate') showAlert(s('ordj.err.rate'));
        else showAlert(s('ordj.err.pay'));
      })
      .catch(function () { showAlert(s('ordj.err.conn')); })
      .then(function () { payBtn.disabled = satisKapali; payBtn.classList.remove('busy'); });
  });

  /* ---------- Açılış ---------- */
  var tl = document.getElementById('trLegal');
  if (tl) tl.hidden = LANG === 'tr';
  langReady.then(function () {
  loadDraft();
  var q = new URLSearchParams(location.search);
  var pk = q.get('paket');
  if (pk && PACKS[pk]) { var r = form.querySelector('input[name=paket][value="' + pk + '"]'); if (r) r.checked = true; }
  // Tanıtım sayfasındaki "QR Menü + 3D/AR" düğmesi: /siparis/?paket=qr&ek=3d
  if (pk === 'qr' && q.get('ek') === '3d') field('ek3d').checked = true;
  if (q.get('hata')) showAlert(s('ordj.err.hata'));
  render();
  if (pkgKey() === 'web' && normDomain(domainIn.value)) checkDomain();
  });
})();
