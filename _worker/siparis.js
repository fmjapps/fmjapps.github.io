// fmjapps.com sipariş ve ödeme: alan adı sorgulama (Cloudflare Registrar), sipariş kaydı ve iyzico ödeme formu.
// Yollar (form.fmjapps.com altında):
//   POST /alan-adi       alan adının boş olup olmadığını ve fiyatını döndürür
//   POST /siparis        siparişi kaydeder, iyzico ödeme sayfasının adresini döndürür
//   POST /odeme/sonuc    iyzico ödeme sonrası buraya döner (token), sonuç sayfasına yönlendirir
// Gizli değişkenler (npx wrangler secret put …):
//   IYZI_API_KEY, IYZI_SECRET          iyzico API anahtarları (test ortamı için sandbox anahtarları)
//   CF_REGISTRAR_TOKEN                 Cloudflare Registrar yetkili API anahtarı
// Ayarlar (wrangler.toml → [vars]): CF_ACCOUNT_ID, IYZI_BASE (sandbox ya da canlı adres), REGISTRAR_PATH (registrar ya da registrar-sandbox)
import { EmailMessage } from 'cloudflare:email';

const SITE = 'https://fmjapps.com';
const FROM = 'form@fmjapps.com';
const KDV = 0.20;
const MAX_BODY = 16000;
const MAX_YEARS = 5;

// Satılan paketler. Fiyatlar KDV hariç TL; sitedeki paket kartlarıyla aynı olmalı.
export const PACKAGES = {
  web: { name: 'Web Sitesi', price: 3400, domain: true, category: 'Web sitesi hizmeti' },
  qr: { name: 'QR Menü (1 yıllık kullanım)', price: 1450, domain: false, category: 'Dijital menü hizmeti' }
};

/* ---------- Yardımcılar ---------- */
function b64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}
const mimeHeader = (s) => '=?UTF-8?B?' + b64(s) + '?=';
const clean = (v, max) => String(v == null ? '' : v).replace(/\r/g, '').trim().slice(0, max);
const oneLine = (v, max) => clean(v, max).replace(/\s*\n\s*/g, ' ');
const tl = (n) => Math.round(n * 100) / 100;
const money = (n) => tl(n).toFixed(2);

function hex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
async function hmacHex(key, msg) {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(msg)));
}

async function sendMail(env, subject, body, replyTo) {
  if (!env.MAIL || !env.DESTINATION) return;
  const domain = FROM.split('@')[1];
  const raw = [
    `From: ${mimeHeader('FMJ Software Sipariş')} <${FROM}>`,
    'To: contact@fmjapps.com',
    replyTo ? `Reply-To: <${replyTo}>` : null,
    `Subject: ${mimeHeader(subject)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@${domain}>`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    b64(body).replace(/.{76}/g, '$&\r\n')
  ].filter((l) => l !== null).join('\r\n');
  try {
    await env.MAIL.send(new EmailMessage(FROM, env.DESTINATION, raw));
  } catch (e) {
    console.error('mail', e && e.message);
  }
}

/* ---------- Müşteriye sipariş teyidi ve sözleşme kopyası (Resend) ----------
   Mesafeli Sözleşmeler Yön. m.7/m.8: teyit ve sözleşme kalıcı veri saklayıcısıyla gönderilir.
   Gizli değişken: RESEND_API_KEY (npx wrangler secret put RESEND_API_KEY). Yoksa gönderilmez, iç e-posta hatırlatır. */
const CONTRACTS = [
  ['on-bilgilendirme-formu.html', '/sozlesmeler/on-bilgilendirme/'],
  ['mesafeli-satis-sozlesmesi.html', '/sozlesmeler/mesafeli-satis/'],
  ['teslimat-ve-iade.html', '/sozlesmeler/teslimat-iade/'],
  ['cayma-formu.html', '/sozlesmeler/cayma-formu/']
];

function customerText(o) {
  return [
    `Merhaba ${o.ad} ${o.soyad},`,
    '',
    `${o.no} numaralı siparişiniz için ödemeniz alındı. Teşekkür ederiz.`,
    '',
    ...o.lines.map((l) => `${l.name}: ${money(l.net)} TL + KDV`),
    `KDV (%20): ${money(o.kdv)} TL`,
    `Ödenen toplam (KDV dahil): ${money(o.total)} TL`,
    `Ödeme tarihi: ${new Date(o.paid).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })}`,
    '',
    'Ön bilgilendirme formu, mesafeli satış sözleşmesi ve teslimat-iade şartları, ödeme anındaki halleriyle ve örnek cayma formuyla birlikte bu e-postanın ekindedir; lütfen saklayın.',
    '',
    'Cayma hakkı: Ödemenin tamamlandığı günden itibaren 14 gün içinde gerekçe göstermeden cayabilirsiniz (kaydedilmiş alan adı ücreti hariç). Bunun için bu e-postayı yanıtlamanız ya da +90 533 318 15 55 numarasına WhatsApp\'tan yazmanız yeterlidir.',
    '',
    'En kısa sürede size WhatsApp ya da e-postayla ulaşacağız. e-Arşiv faturanız ayrıca gönderilecektir.',
    '',
    'FMJ Software · Oğulcan Fidan · Menemen VD · VKN 3870844488',
    'İsmet İnönü Mah. 1267 Sk. Refah No: 12 İç Kapı No: 3, Menemen / İzmir',
    'contact@fmjapps.com · +90 533 318 15 55 · https://fmjapps.com'
  ].join('\n');
}

async function sendCustomerMail(env, o) {
  if (!env.RESEND_API_KEY) return false;
  try {
    const attachments = [];
    for (const [filename, path] of CONTRACTS) {
      const r = await fetch(SITE + path);
      if (!r.ok) throw new Error(`sözleşme alınamadı: ${path} ${r.status}`);
      attachments.push({ filename, content: b64(await r.text()) });
    }
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'FMJ Software <siparis@fmjapps.com>',
        to: [o.email],
        bcc: ['contact@fmjapps.com'],
        reply_to: 'contact@fmjapps.com',
        subject: `Siparişiniz alındı: ${o.no} · ${PACKAGES[o.paket].name}`,
        text: customerText(o),
        attachments
      })
    });
    if (!res.ok) throw new Error(`resend ${res.status} ${(await res.text()).slice(0, 200)}`);
    return true;
  } catch (e) {
    console.error('müşteri e-postası', e && e.message);
    return false;
  }
}

/* ---------- Kur: TCMB döviz satış kuru (günde bir kez alınır) ---------- */
async function usdRate() {
  const cache = caches.default;
  const key = new Request('https://cache.fmjapps.internal/tcmb-usd');
  const hit = await cache.match(key);
  if (hit) return Number(await hit.text());
  const xml = await (await fetch('https://www.tcmb.gov.tr/kurlar/today.xml', { cf: { cacheTtl: 3600 } })).text();
  const block = xml.match(/<Currency[^>]*CurrencyCode="USD"[\s\S]*?<\/Currency>/);
  const rate = block && Number((block[0].match(/<ForexSelling>([\d.]+)<\/ForexSelling>/) || [])[1]);
  if (!rate || !(rate > 1)) throw new Error('kur');
  await cache.put(key, new Response(String(rate), { headers: { 'Cache-Control': 'max-age=21600' } }));
  return rate;
}

/* ---------- Alan adı sorgulama: Cloudflare Registrar ---------- */
const DOMAIN_RE = /^(?=.{4,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/;

export function normalizeDomain(v) {
  let d = String(v || '').trim().toLowerCase();
  d = d.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
  return DOMAIN_RE.test(d) ? d : null;
}

// Alan adını sorgular; boşsa yıl sayısına göre TL fiyatını hesaplar (KDV hariç).
// Fiyat: ilk yıl kayıt ücreti + kalan yıllar için yenileme ücreti, TCMB kuruyla TL'ye çevrilip yukarı yuvarlanır.
async function checkDomain(env, domain, years, fresh) {
  if (!env.CF_ACCOUNT_ID || !env.CF_REGISTRAR_TOKEN) return { error: 'config' };
  const cacheKey = new Request(`https://cache.fmjapps.internal/domain/${domain}/${years}`);
  if (!fresh) {
    const hit = await caches.default.match(cacheKey);
    if (hit) return hit.json();
  }
  const r = await lookupDomain(env, domain, years);
  if (!r.error) await caches.default.put(cacheKey, new Response(JSON.stringify(r), { headers: { 'Cache-Control': 'max-age=600' } }));
  return r;
}
async function lookupDomain(env, domain, years) {
  const path = env.REGISTRAR_PATH || 'registrar';
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/${path}/domain-check`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.CF_REGISTRAR_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ domains: [domain] })
  });
  const out = await res.json().catch(() => null);
  const row = out && out.result && (out.result.domains || out.result)[0];
  if (!res.ok || !row) return { error: 'lookup' };
  if (!row.registrable) return { domain, available: false, reason: row.reason || 'unavailable' };
  if (row.tier && row.tier !== 'standard') return { domain, available: false, reason: 'premium' };
  const p = row.pricing || {};
  const reg = Number(p.registration_cost), ren = Number(p.renewal_cost || p.registration_cost);
  if (!(reg > 0) || String(p.currency || 'USD').toUpperCase() !== 'USD') return { error: 'price' };
  const rate = await usdRate();
  const usd = reg + ren * (years - 1);
  return {
    domain, available: true, years,
    usd: Math.round(usd * 100) / 100,
    rate,
    price: Math.ceil(usd * rate),          // TL, KDV hariç
    renewalPerYear: Math.ceil(ren * rate)  // bilgi için: sonraki yenilemelerin bugünkü yaklaşık karşılığı
  };
}

/* ---------- iyzico ---------- */
async function iyzico(env, path, payload) {
  const rnd = String(Date.now()) + Math.random().toString().slice(2, 8);
  const body = JSON.stringify(payload);
  const sig = await hmacHex(env.IYZI_SECRET, rnd + path + body);
  const auth = btoa(`apiKey:${env.IYZI_API_KEY}&randomKey:${rnd}&signature:${sig}`);
  const res = await fetch((env.IYZI_BASE || 'https://sandbox-api.iyzipay.com') + path, {
    method: 'POST',
    headers: { Authorization: 'IYZWSv2 ' + auth, 'x-iyzi-rnd': rnd, 'Content-Type': 'application/json', Accept: 'application/json' },
    body
  });
  return res.json();
}

/* ---------- Doğrulamalar ---------- */
const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;
function tcknOk(v) {
  if (!/^[1-9]\d{10}$/.test(v)) return false;
  const d = v.split('').map(Number);
  const t10 = ((d[0] + d[2] + d[4] + d[6] + d[8]) * 7 - (d[1] + d[3] + d[5] + d[7])) % 10;
  const t11 = d.slice(0, 10).reduce((a, b) => a + b, 0) % 10;
  return ((t10 + 10) % 10) === d[9] && t11 === d[10];
}
function phoneNorm(v) {
  let p = String(v || '').replace(/[^\d+]/g, '');
  if (p.startsWith('00')) p = '+' + p.slice(2);
  if (/^0\d{10}$/.test(p)) p = '+9' + p;
  if (/^5\d{9}$/.test(p)) p = '+90' + p;
  return /^\+\d{10,15}$/.test(p) ? p : null;
}
function orderNo() {
  const d = new Date();
  const ymd = String(d.getUTCFullYear()).slice(2) + String(d.getUTCMonth() + 1).padStart(2, '0') + String(d.getUTCDate()).padStart(2, '0');
  const abc = 'ABCDEFGHJKLMNPRSTUVYZ23456789';
  let r = '';
  for (const b of crypto.getRandomValues(new Uint8Array(5))) r += abc[b % abc.length];
  return `FMJ-${ymd}-${r}`;
}

// Gelen siparişi doğrular; hata varsa alan adlarının listesini döndürür.
function validate(d) {
  const err = [];
  const pkg = PACKAGES[d.paket];
  if (!pkg) err.push('paket');
  const o = {
    paket: d.paket,
    ad: oneLine(d.ad, 60), soyad: oneLine(d.soyad, 60),
    email: oneLine(d.email, 120).toLowerCase(),
    telefon: phoneNorm(d.telefon),
    faturaTip: d.faturaTip === 'kurumsal' ? 'kurumsal' : 'bireysel',
    tckn: oneLine(d.tckn, 11),
    unvan: oneLine(d.unvan, 160), vergiDairesi: oneLine(d.vergiDairesi, 80), vkn: oneLine(d.vkn, 11),
    adres: clean(d.adres, 300), il: oneLine(d.il, 40), ilce: oneLine(d.ilce, 40),
    isletme: oneLine(d.isletme, 120), sektor: oneLine(d.sektor, 80),
    alanAdi: d.alanAdi ? normalizeDomain(d.alanAdi) : null,
    yil: Math.max(1, Math.min(MAX_YEARS, parseInt(d.yil, 10) || 1)),
    menuAdres: oneLine(d.menuAdres, 40).toLowerCase(),
    aciklama: clean(d.aciklama, 2000),
    onBilgi: d.onBilgi === true, sozlesme: d.sozlesme === true,
    alanAdiOnay: d.alanAdiOnay === true
  };
  if (!o.ad) err.push('ad');
  if (!o.soyad) err.push('soyad');
  if (!EMAIL_RE.test(o.email)) err.push('email');
  if (!o.telefon) err.push('telefon');
  if (o.faturaTip === 'bireysel' && o.tckn && !tcknOk(o.tckn)) err.push('tckn');
  if (o.faturaTip === 'kurumsal') {
    if (!o.unvan) err.push('unvan');
    if (!o.vergiDairesi) err.push('vergiDairesi');
    if (!/^\d{10,11}$/.test(o.vkn)) err.push('vkn');
  }
  if (o.adres.length < 10) err.push('adres');
  if (!o.il) err.push('il');
  if (!o.isletme) err.push('isletme');
  if (pkg && pkg.domain && !o.alanAdi) err.push('alanAdi');
  if (o.paket === 'qr' && o.menuAdres && !/^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/.test(o.menuAdres)) err.push('menuAdres');
  if (!o.onBilgi) err.push('onBilgi');
  if (!o.sozlesme) err.push('sozlesme');
  if (pkg && pkg.domain && !o.alanAdiOnay) err.push('alanAdiOnay');
  return { o, err, pkg };
}

/* ---------- İstekler ---------- */
async function readJson(request) {
  if (Number(request.headers.get('Content-Length') || 0) > MAX_BODY) return null;
  const text = await request.text();
  if (text.length > MAX_BODY) return null;
  try { return JSON.parse(text); } catch { return null; }
}

export async function handleShop(request, env, url, origin, json, ip) {
  const path = url.pathname.replace(/\/+$/, '');

  // iyzico ödeme sonrası buraya form ile döner (tarayıcı yönlendirmesi; Origin denetimi yok)
  if (path === '/odeme/sonuc' && request.method === 'POST') return paymentResult(request, env);

  if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405, origin);

  if (path === '/alan-adi') {
    if (env.DOMAIN_LIMITER) {
      const { success } = await env.DOMAIN_LIMITER.limit({ key: ip });
      if (!success) return json({ ok: false, error: 'rate' }, 429, origin);
    }
    const d = await readJson(request);
    const domain = normalizeDomain(d && d.domain);
    if (!domain) return json({ ok: false, error: 'domain' }, 400, origin);
    const years = Math.max(1, Math.min(MAX_YEARS, parseInt(d.years, 10) || 1));
    try {
      const r = await checkDomain(env, domain, years);
      if (r.error) return json({ ok: false, error: r.error }, 502, origin);
      return json({ ok: true, ...r }, 200, origin);
    } catch (e) {
      console.error('domain', e && e.message);
      return json({ ok: false, error: 'lookup' }, 502, origin);
    }
  }

  if (path === '/siparis') {
    if (env.LIMITER) {
      const { success } = await env.LIMITER.limit({ key: ip });
      if (!success) return json({ ok: false, error: 'rate' }, 429, origin);
    }
    if (!env.IYZI_API_KEY || !env.IYZI_SECRET || !env.ORDERS) return json({ ok: false, error: 'config' }, 503, origin);
    const d = await readJson(request);
    if (!d || typeof d !== 'object') return json({ ok: false, error: 'json' }, 400, origin);
    if (d.website) return json({ ok: false, error: 'invalid' }, 400, origin);
    const { o, err, pkg } = validate(d);
    if (err.length) return json({ ok: false, error: 'invalid', fields: err }, 400, origin);

    // Fiyat her zaman sunucuda hesaplanır; alan adı fiyatı o anki sorgudan gelir
    const lines = [{ id: o.paket, name: pkg.name, category: pkg.category, net: pkg.price }];
    let domainInfo = null;
    if (pkg.domain) {
      domainInfo = await checkDomain(env, o.alanAdi, o.yil, true).catch(() => ({ error: 'lookup' }));
      if (domainInfo.error) return json({ ok: false, error: 'domain-lookup' }, 502, origin);
      if (!domainInfo.available) return json({ ok: false, error: 'domain-taken', reason: domainInfo.reason }, 409, origin);
      lines.push({ id: 'alan-adi', name: `Alan adı: ${o.alanAdi} (${o.yil} yıl)`, category: 'Alan adı kaydı', net: domainInfo.price });
    }
    const net = lines.reduce((a, l) => a + l.net, 0);
    const kdv = tl(net * KDV);
    const total = tl(net + kdv);
    const no = orderNo();
    const now = new Date().toISOString();

    // Sepet kalemleri KDV dahil tutarlarla gönderilir; toplamları ödenecek tutara eşittir
    const items = lines.map((l) => ({ id: l.id, name: l.name, category1: l.category, itemType: 'VIRTUAL', price: money(l.net * (1 + KDV)) }));
    const diff = tl(total - items.reduce((a, i) => a + Number(i.price), 0));
    if (diff) items[0].price = money(Number(items[0].price) + diff);

    const contact = `${o.ad} ${o.soyad}`;
    const addr = { contactName: o.faturaTip === 'kurumsal' ? o.unvan : contact, city: o.il, country: 'Turkey', address: `${o.adres}${o.ilce ? ', ' + o.ilce : ''} / ${o.il}` };
    const init = await iyzico(env, '/payment/iyzipos/checkoutform/initialize/auth/ecom', {
      locale: 'tr', conversationId: no, basketId: no, paymentGroup: 'PRODUCT', currency: 'TRY',
      price: money(total), paidPrice: money(total),
      callbackUrl: url.origin + '/odeme/sonuc',
      enabledInstallments: [1],
      buyer: {
        id: no, name: o.ad, surname: o.soyad,
        identityNumber: o.faturaTip === 'bireysel' && o.tckn ? o.tckn : '11111111111',
        email: o.email, gsmNumber: o.telefon,
        registrationAddress: addr.address, city: o.il, country: 'Turkey', ip
      },
      billingAddress: addr,
      basketItems: items
    }).catch((e) => ({ status: 'failure', errorMessage: e && e.message }));
    if (!init || init.status !== 'success' || !init.paymentPageUrl) {
      console.error('iyzico init', init && (init.errorCode + ' ' + init.errorMessage));
      return json({ ok: false, error: 'payment-init' }, 502, origin);
    }

    const order = { no, status: 'bekliyor', created: now, ...o, lines, net, kdv, total, domain: domainInfo, token: init.token, ip };
    await env.ORDERS.put('siparis:' + no, JSON.stringify(order), { expirationTtl: 60 * 60 * 24 * 30 }); // ödenmezse 30 gün sonra silinir
    return json({ ok: true, no, total, url: init.paymentPageUrl }, 200, origin);
  }

  return json({ ok: false, error: 'not-found' }, 404, origin);
}

/* ---------- Ödeme sonucu ---------- */
async function paymentResult(request, env) {
  const back = (q) => Response.redirect(`${SITE}/siparis/${q}`, 303);
  let token = '';
  try { token = String((await request.formData()).get('token') || ''); } catch { /* boş */ }
  if (!token) return back('?hata=odeme');

  const r = await iyzico(env, '/payment/iyzipos/checkoutform/auth/ecom/detail', { locale: 'tr', token }).catch(() => null);
  const no = r && (r.basketId || r.conversationId);
  const raw = no && await env.ORDERS.get('siparis:' + no);
  if (!raw) return back('?hata=odeme');
  const order = JSON.parse(raw);
  if (order.token !== token) return back('?hata=odeme');

  const paid = r.status === 'success' && r.paymentStatus === 'SUCCESS' && String(r.currency || 'TRY') === 'TRY' && Number(r.paidPrice) >= order.total - 0.01;
  if (!paid) {
    if (order.status === 'bekliyor') {
      order.status = 'odenmedi';
      order.failure = r && (r.errorMessage || r.paymentStatus || r.status);
      await env.ORDERS.put('siparis:' + no, JSON.stringify(order), { expirationTtl: 60 * 60 * 24 * 30 });
    }
    return back(`?paket=${encodeURIComponent(order.paket)}&hata=odeme`);
  }

  if (order.status !== 'odendi' && order.status !== 'incelemede') {
    order.status = Number(r.fraudStatus) === 1 ? 'odendi' : 'incelemede';
    order.paid = new Date().toISOString();
    order.paymentId = r.paymentId;
    order.paidPrice = Number(r.paidPrice);
    order.card = [r.cardAssociation, r.cardFamily, r.lastFourDigits && '**** ' + r.lastFourDigits].filter(Boolean).join(' · ');
    order.contractMailed = await sendCustomerMail(env, order);
    await env.ORDERS.put('siparis:' + no, JSON.stringify(order), { expirationTtl: 60 * 60 * 24 * 1096 }); // ödenen sipariş ve sözleşme onayı 3 yıl saklanır (ispat)
    await sendMail(env, `[Yeni sipariş] ${no} · ${PACKAGES[order.paket].name} · ${money(order.total)} TL${order.status === 'incelemede' ? ' (iyzico incelemesinde)' : ''}`, orderText(order), order.email);
  }
  return back(`tamam/?no=${encodeURIComponent(no)}`);
}

function orderText(o) {
  const L = [
    `Sipariş no: ${o.no}`,
    `Durum: ${o.status === 'odendi' ? 'Ödendi' : 'Ödendi, iyzico incelemesinde (sonucu bekleyin)'}`,
    `Tarih: ${o.paid}`,
    `iyzico ödeme no: ${o.paymentId} · ${o.card || ''}`,
    '',
    '— Kalemler (KDV hariç) —',
    ...o.lines.map((l) => `${l.name}: ${money(l.net)} TL`),
    `Ara toplam: ${money(o.net)} TL`,
    `KDV (%20): ${money(o.kdv)} TL`,
    `Ödenen: ${money(o.total)} TL`,
    '',
    '— Müşteri —',
    `${o.ad} ${o.soyad}`,
    `E-posta: ${o.email}`,
    `Telefon: ${o.telefon}`,
    '',
    '— Fatura —',
    o.faturaTip === 'kurumsal'
      ? `Kurumsal: ${o.unvan} · ${o.vergiDairesi} VD · VKN ${o.vkn}`
      : `Bireysel${o.tckn ? ' · T.C. kimlik no *******' + o.tckn.slice(-4) + ' (tamamı sipariş kaydında)' : ''}`,
    `Adres: ${o.adres}${o.ilce ? ', ' + o.ilce : ''} / ${o.il}`,
    '',
    '— Proje —',
    `İşletme: ${o.isletme}${o.sektor ? ' · ' + o.sektor : ''}`
  ];
  if (o.domain) L.push(`Alan adı kaydı onayı (ödemeden hemen sonra kayıt, cayma hakkı biter): ${o.alanAdiOnay ? 'verildi' : 'YOK'}`);
  if (o.domain) L.push(`Alan adı: ${o.alanAdi} · ${o.yil} yıl · Cloudflare ${o.domain.usd} USD (kur ${o.domain.rate}) — KAYDETMEYİ UNUTMA`);
  if (o.menuAdres) L.push(`İstenen menü adresi: ${o.menuAdres}`);
  if (o.aciklama) L.push('', 'Açıklama:', o.aciklama);
  L.push('', o.contractMailed
    ? 'Sipariş teyidi ve sözleşmeler müşteriye otomatik gönderildi (gizli kopyası contact@\'ta).'
    : 'DİKKAT: Sözleşme e-postası müşteriye GİTMEDİ — 24 saat içinde elle gönder.');
  L.push('Yapılacaklar: e-Arşiv faturayı kes, müşteriye WhatsApp\'tan ulaş.');
  return L.join('\n');
}
