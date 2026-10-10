// fmjapps.com iletişim formu: gelen mesajı e-posta olarak iletir.
// Cloudflare Email Routing'in "send_email" bağlamasıyla çalışır; alıcı doğrulanmış adres olmalı.
import { EmailMessage } from 'cloudflare:email';
import { handleShop } from './siparis.js';

const ALLOWED_ORIGINS = ['https://fmjapps.com', 'https://www.fmjapps.com', 'http://localhost:5190'];
const FROM = 'form@fmjapps.com';
const SHOWN_TO = 'contact@fmjapps.com';
const MAX_BODY = 12000;
const SUBJECTS = {
  mirus: 'Mirus demo talebi',
  titus: 'Mirus demo talebi', // ürünün eski adı (eski sayfalardan gelen formlar)
  qrmenu: 'QR Menü teklif talebi',
  web: 'Web sitesi teklif talebi',
  business: 'İşletmeye özel çözüm',
  other: 'FMJ Software (diğer)',
  general: 'FMJ Software (genel)',
  kayip: 'Kayıp Eşya Bürosu',
  koleksiyoncu: 'Koleksiyoner',
  prizma: 'Prizma',
  ezber: 'Ezber',
  paydos: 'Paydos'
};

function cors(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors(origin) }
  });
}

// UTF-8 metni base64'e çevirir (başlık ve gövde için)
function b64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function header(str) {
  return '=?UTF-8?B?' + b64(str) + '?=';
}

function clean(v, max) {
  return String(v || '').replace(/\r/g, '').trim().slice(0, max);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });
    const url = new URL(request.url);
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

    // Sipariş, alan adı sorgulama ve ödeme dönüşü (siparis.js)
    if (url.pathname !== '/') {
      if (url.pathname.startsWith('/odeme/') || ALLOWED_ORIGINS.includes(origin)) return handleShop(request, env, url, origin, json, ip);
      return json({ ok: false, error: 'origin' }, 403, origin);
    }

    if (request.method !== 'POST') return json({ ok: false, error: 'method' }, 405, origin);
    if (!ALLOWED_ORIGINS.includes(origin)) return json({ ok: false, error: 'origin' }, 403, origin);

    // Aynı IP'den dakikada en çok 5 mesaj
    if (env.LIMITER) {
      const { success } = await env.LIMITER.limit({ key: ip });
      if (!success) return json({ ok: false, error: 'rate' }, 429, origin);
    }

    // Aşırı büyük gövdeler okunmadan reddedilir
    if (Number(request.headers.get('Content-Length') || 0) > MAX_BODY) return json({ ok: false, error: 'size' }, 413, origin);
    let data;
    try {
      const text = await request.text();
      if (text.length > MAX_BODY) return json({ ok: false, error: 'size' }, 413, origin);
      data = JSON.parse(text);
    } catch {
      return json({ ok: false, error: 'json' }, 400, origin);
    }
    if (!data || typeof data !== 'object') return json({ ok: false, error: 'json' }, 400, origin);

    // Bal küpü alanı: gerçek kullanıcı bunu boş bırakır, bot doldurur
    if (data.website) return json({ ok: true }, 200, origin);

    const name = clean(data.name, 80).replace(/\n/g, ' ');
    const email = clean(data.email, 120).replace(/\n/g, '');
    const message = clean(data.message, 4000);
    const subjectKey = Object.hasOwn(SUBJECTS, data.subject) ? data.subject : 'general';
    const lang = /^[a-z]{2}$/.test(String(data.lang)) ? data.lang : 'tr';

    if (!name || message.length < 2 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(email)) {
      return json({ ok: false, error: 'invalid' }, 400, origin);
    }

    const subjectLabel = SUBJECTS[subjectKey];
    const country = request.cf && request.cf.country ? request.cf.country : '-';
    const body = [
      `Konu: ${subjectLabel}`,
      `Ad: ${name}`,
      `E-posta: ${email}`,
      `Site dili: ${lang}`,
      `Ülke: ${country}`,
      '',
      message,
      '',
      '—',
      `fmjapps.com iletişim formu · IP ${ip}`,
      'Bu e-postayı yanıtladığında cevabın doğrudan gönderene gider.'
    ].join('\n');

    const domain = FROM.split('@')[1];
    const raw = [
      `From: ${header('FMJ Software Form')} <${FROM}>`,
      `To: ${SHOWN_TO}`,
      `Reply-To: ${header(name)} <${email}>`,
      `Subject: ${header(`[${subjectLabel}] ${name}`)}`,
      `Date: ${new Date().toUTCString()}`,
      `Message-ID: <${crypto.randomUUID()}@${domain}>`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      b64(body).replace(/.{76}/g, '$&\r\n')
    ].join('\r\n');

    try {
      await env.MAIL.send(new EmailMessage(FROM, env.DESTINATION, raw));
    } catch (e) {
      console.error('send failed', e && e.message);
      return json({ ok: false, error: 'send' }, 502, origin);
    }
    return json({ ok: true }, 200, origin);
  }
};
