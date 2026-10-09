// Uygulama sayfalarını ve sitenin ana sayfalarının dil kopyalarını üretir: node _pages/build.cjs
// Çıktı: /<adres>/index.html (Türkçe), /<dil>/<adres>/index.html (diğer diller),
// kurumsal ana sayfa, uygulamalar sayfası ve Titus sayfasının diğer dillerdeki hâli
// (metni i18n/<dil>.json dosyasından), sitemap.xml
// Türkçe ve İngilizce metin content.cjs içinde; diğer diller lang/<dil>.json dosyalarından okunur.
// Ayrıca ana sayfadaki yapılandırılmış veriyi uygulama sayfalarının adresleriyle günceller.
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const { UI, APPS } = require('./content.cjs');

const ROOT = path.join(__dirname, '..');
const BASE = 'https://fmjapps.com';
const HOME_LANGS = ['tr', 'en', 'es', 'pt', 'fr', 'de', 'it', 'ru', 'ar', 'hi', 'zh', 'ja', 'ko', 'id'];
const NAMES = { tr: 'Türkçe', en: 'English', es: 'Español', pt: 'Português', fr: 'Français', de: 'Deutsch', it: 'Italiano', ru: 'Русский', ar: 'العربية', hi: 'हिन्दी', zh: '中文', ja: '日本語', ko: '한국어', id: 'Bahasa Indonesia' };
const LOCALE = { tr: 'tr_TR', en: 'en_US', es: 'es_ES', pt: 'pt_BR', fr: 'fr_FR', de: 'de_DE', it: 'it_IT', ru: 'ru_RU', ar: 'ar_AR', hi: 'hi_IN', zh: 'zh_CN', ja: 'ja_JP', ko: 'ko_KR', id: 'id_ID' };
const RTL = { ar: true };

// İngilizce metin çevirilerin kaynağıdır; her derlemede lang/en.json olarak yazılır
const LANG_DIR = path.join(__dirname, 'lang');
fs.writeFileSync(path.join(LANG_DIR, 'en.json'), JSON.stringify({ ui: UI.en, apps: Object.fromEntries(APPS.map(a => [a.id, a.en])) }, null, 1) + '\n');
// Çevirisi olan diller eklenir; adresler ve uygulama adları İngilizcedekiyle aynıdır
// Metinler app.text[dil] altında tutulur ("id" hem alan adı hem Endonezcenin kodu olduğu için ayrı durur)
APPS.forEach(a => { a.text = { tr: a.tr, en: a.en }; });
const LANGS = HOME_LANGS.filter(l => {
  if (l === 'tr' || l === 'en') return true;
  const f = path.join(LANG_DIR, l + '.json');
  if (!fs.existsSync(f)) return false;
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  UI[l] = Object.assign({}, UI.en, d.ui); // eksik çeviri İngilizceye düşer
  APPS.forEach(a => { a.text[l] = Object.assign({}, d.apps[a.id], { slug: a.en.slug, name: a.en.name, short: a.en.short }); });
  return true;
});
const PRIVACY = [['kayip', '/privacy/kayip/'], ['koleksiyoncu', '/privacy/collector/'], ['prizma', '/privacy/prizma/'], ['ezber', '/privacy/ezber/'], ['paydos', '/privacy/paydos/']];

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const urlOf = (app, lang) => (lang === 'tr' ? '/' : '/' + lang + '/') + app.text[lang].slug + '/';
const homePath = lang => lang === 'tr' ? '/' : '/' + lang + '/';
const homeOf = (lang, hash) => homePath(lang) + (hash ? '#' + hash : '');
// Oyun ve uygulama vitrini: Türkçesi /uygulamalar/, diğer diller /<dil>/apps/
const appsPath = lang => lang === 'tr' ? '/uygulamalar/' : '/' + lang + '/apps/';
const appsOf = (lang, hash) => appsPath(lang) + (hash ? '#' + hash : '');
// Hakkımızda ve künye: Türkçesi /hakkimizda/, diğer diller /<dil>/about/
const aboutPath = lang => lang === 'tr' ? '/hakkimizda/' : '/' + lang + '/about/';
// Her dilin kendi ekran görüntüleri var (assets/shots/<dil>/<uygulama>-<n>.webp, uygulamaların mağaza görsellerinden)
// app.shots: [mağaza görselinin numarası, açıklama yazısının sırası]
const shot = (app, s, lang) => '/assets/shots/' + lang + '/' + app.id + '-' + s[0] + '.webp';

const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'";

function page(app, lang) {
  const t = UI[lang], c = app.text[lang];
  const url = BASE + urlOf(app, lang);
  const group = app.kind === 'game' ? t.games : t.apps;
  const groupHash = app.kind === 'game' ? 'oyunlar' : 'uygulamalar';
  const og = BASE + '/assets/og-' + app.id + (lang !== 'tr' ? '-en' : '') + '.jpg';
  const isTest = app.status === 'test';
  const isLive = app.status === 'live';
  const playUrl = 'https://play.google.com/store/apps/details?id=' + (app.test && app.test.pkg);
  // Onay bekleyen uygulamada da test bağlantısı varsa katılım bölümü gösterilir; yayındakinde gösterilmez
  const canJoin = !!app.test && !isLive;
  const half = Math.ceil(c.feats.length / 2);

  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MobileApplication', '@id': url + '#app', name: c.name, description: c.desc, url,
        operatingSystem: 'Android', applicationCategory: app.category, inLanguage: lang,
        image: BASE + '/assets/' + app.id + '-icon.webp',
        screenshot: app.shots.map(s => BASE + shot(app, s, lang)),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        author: { '@type': 'Organization', name: 'FMJ Software', url: BASE + '/' }
      },
      {
        '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'FMJ Software', item: BASE + homePath(lang) },
          { '@type': 'ListItem', position: 2, name: group, item: BASE + appsPath(lang) },
          { '@type': 'ListItem', position: 3, name: c.short, item: url }
        ]
      },
      { '@type': 'FAQPage', mainEntity: c.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
    ]
  };

  const join = isLive ? `
    <div class="join reveal">
      <h2>${esc(t.liveTitle)}</h2>
      <p class="join-lede">${esc(t.liveLede.replace('{name}', c.short))}</p>
      <div class="cta"><a class="btn small tint" href="${playUrl}" target="_blank" rel="noopener">${esc(t.download)}</a></div>
    </div>` : canJoin ? `
    <div class="join reveal">
      <h2>${esc(t.joinTitle)}</h2>
      <p class="join-lede">${esc(t.joinLede)}</p>
      <ol class="jsteps">
        <li><b>01</b><strong>${esc(t.s1t)}</strong><p>${esc(t.s1d)}</p><a class="btn small tint" href="https://groups.google.com/g/${app.test.group}" target="_blank" rel="noopener">${esc(t.s1b)}</a></li>
        <li><b>02</b><strong>${esc(t.s2t)}</strong><p>${esc(t.s2d)}</p><a class="btn small tint" href="https://play.google.com/apps/testing/${app.test.pkg}" target="_blank" rel="noopener">${esc(t.s2b)}</a></li>
        <li><b>03</b><strong>${esc(t.s3t)}</strong><p>${esc(t.s3d)}</p><a class="btn small tint" href="https://play.google.com/store/apps/details?id=${app.test.pkg}" target="_blank" rel="noopener">${esc(t.s3b)}</a></li>
      </ol>
${isTest ? `      <p class="join-note">${esc(t.joinNote)}</p>
` : ''}    </div>` : `
    <div class="join reveal">
      <h2>${esc(t.soonTitle)}</h2>
      <p class="join-lede">${esc(t.soonLede.replace('{name}', c.short))}</p>
      <div class="cta"><a class="btn small tint" href="${appsOf(lang, 'iletisim')}">${esc(t.feedback)}</a></div>
    </div>`;

  const others = APPS.filter(a => a !== app).map(a => `
        <li><a href="${urlOf(a, lang)}" style="--acc:${a.acc}"><img src="/assets/${a.id}-icon.webp" alt="" width="256" height="256" loading="lazy"><span><strong>${esc(a.text[lang].short)}</strong><small>${esc(a.text[lang].tag)}</small></span></a></li>`).join('');

  return `<!doctype html>
<html lang="${lang}"${RTL[lang] ? ' dir="rtl"' : ''} data-theme="light">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(c.title)}</title>
<meta name="description" content="${esc(c.desc)}">
<meta name="theme-color" content="#1C3334">
<meta property="og:type" content="website">
<meta property="og:site_name" content="FMJ Software">
<meta property="og:title" content="${esc(c.name)}">
<meta property="og:description" content="${esc(c.desc)}">
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${url}">
<meta property="og:locale" content="${LOCALE[lang]}">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${url}">
${LANGS.map(l => `<link rel="alternate" hreflang="${l}" href="${BASE + urlOf(app, l)}">`).join('\n')}
<link rel="alternate" hreflang="x-default" href="${BASE + urlOf(app, 'en')}">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/assets/brand/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/assets/favicon-96.png" type="image/png" sizes="96x96">
<link rel="icon" href="/assets/favicon-32.png" type="image/png" sizes="32x32">
<link rel="icon" href="/assets/favicon-16.png" type="image/png" sizes="16x16">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="stylesheet" href="/fonts/fonts.css">
<link rel="stylesheet" href="/app.css">
<script src="/app.js"></script>
</head>
<body style="--acc:${app.acc}${app.acc2 ? ';--acc-2:' + app.acc2 : ''}">
<a class="skip" href="#icerik">${esc(t.skip)}</a>

<header class="nav">
  <div class="nav-in">
    <a class="brand" href="${homeOf(lang)}" aria-label="FMJ Software">
      <img class="logo on-light" src="/assets/brand/logo.svg" alt="" width="196" height="36"><img class="logo on-dark" src="/assets/brand/logo-koyu-zemin.svg" alt="" width="196" height="36"><span class="brand-tag">${esc(t.slogan)}</span>
    </a>
    <nav class="links" aria-label="FMJ Software">
      <a class="home-link" href="${homeOf(lang)}"><b aria-hidden="true">←</b> ${esc(t.home)}</a>
      <a href="${appsOf(lang, 'oyunlar')}">${esc(t.games)}</a>
      <a href="${appsOf(lang, 'uygulamalar')}">${esc(t.apps)}</a>
      <a href="${aboutPath(lang)}">${esc(t.about)}</a>
      <a class="cta-link" href="${appsOf(lang, 'iletisim')}">${esc(t.contact)}</a>
    </nav>
    <div class="tools">
      <a class="home-mini" href="${homeOf(lang)}"><b aria-hidden="true">←</b> ${esc(t.home)}</a>
      <details class="lang" id="lang">
        <summary class="chip-btn" aria-label="${esc(t.langLabel)}"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.4 3.6 5.2 3.6 8.5s-1.2 6.1-3.6 8.5c-2.4-2.4-3.6-5.2-3.6-8.5s1.2-6.1 3.6-8.5Z"/></svg><span>${lang.toUpperCase()}</span></summary>
        <ul class="lang-menu">${LANGS.map(l => `
          <li><a href="${urlOf(app, l)}" hreflang="${l}" lang="${l}" data-set-lang="${l}"${l === lang ? ' class="on" aria-current="true"' : ''}><span>${NAMES[l]}</span><b>${l.toUpperCase()}</b></a></li>`).join('')}
        </ul>
      </details>
      <button class="icon-btn" id="themeBtn" type="button" aria-label="${esc(t.theme)}">
        <svg class="sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M4.7 4.7l1.6 1.6M17.7 17.7l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.7 19.3l1.6-1.6M17.7 6.3l1.6-1.6"/></svg>
        <svg class="moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/></svg>
      </button>
    </div>
  </div>
</header>

<main id="icerik">
  <section class="page hero" data-label="${esc(c.short)}">
    <div class="wrap">
      <nav aria-label="Breadcrumb"><ol class="crumbs">
        <li><a href="${homeOf(lang)}">FMJ Software</a></li>
        <li><a href="${appsOf(lang, groupHash)}">${esc(group)}</a></li>
        <li aria-current="page">${esc(c.short)}</li>
      </ol></nav>
      <div class="hero-grid">
        <div class="hero-copy">
          <div class="id">
            <img src="/assets/${app.id}-icon.webp" alt="" width="256" height="256">
            <div>
              <p class="kind">${esc((app.kind === 'game' ? t.game : t.app).toLocaleUpperCase(lang))} · ANDROID</p>
              <h1>${esc(c.name)}</h1>
              <p class="tagline">${esc(c.tag)}</p>
            </div>
          </div>
          <p class="lede">${esc(c.lede)}</p>
          <ul class="chips">${c.chips.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
          <p class="status${isLive ? ' live' : isTest ? '' : ' soon'}"><i></i>${esc(isLive ? t.statusLive : isTest ? t.statusTest : t.statusSoon)}</p>
          <div class="cta">
            ${isLive ? `<a class="btn solid" href="${playUrl}" target="_blank" rel="noopener">${esc(t.download)}</a>` : ''}
            ${canJoin ? `<a class="btn solid" href="#katil">${esc(t.join)}</a>` : ''}
            <a class="btn ${isTest || isLive ? 'ghost' : 'solid'}" href="${appsOf(lang, 'iletisim')}">${esc(t.feedback)}</a>
          </div>
        </div>
        <div class="hero-media" aria-hidden="true">
          <div class="phone back"><img src="${shot(app, app.shots[1], lang)}" alt="" width="540" height="1200"></div>
          <div class="phone front"><img src="${shot(app, app.shots[0], lang)}" alt="" width="540" height="1200"></div>
        </div>
      </div>
    </div>
    <a class="more-hint" href="#goruntuler">${esc(t.scroll)}</a>
  </section>

  <section class="page alt shots-page" id="goruntuler" style="--n:${app.shots.length}" data-label="${esc(t.shots)}">
    <div class="wrap"><header class="sec-head reveal"><h2>${esc(t.shots)}</h2></header></div>
    <div class="gallery reveal" id="gallery" tabindex="0" role="group" aria-label="${esc(t.shots)}">${app.shots.map(s => `
      <figure><div class="phone"><img src="${shot(app, s, lang)}" alt="${esc(c.name + ': ' + c.alts[s[1]])}" width="540" height="1200"></div><figcaption>${esc(c.alts[s[1]])}</figcaption></figure>`).join('')}
    </div>
    <div class="gdots" id="gdots" aria-hidden="true"></div>
  </section>

  <section class="page" data-label="${esc(c.howTitle)}">
    <div class="wrap">
      <header class="sec-head reveal"><h2>${esc(c.howTitle)}</h2></header>
      <ol class="steps reveal">${c.how.map(([h, p]) => `
        <li><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join('')}
      </ol>
    </div>
  </section>

  <section class="page alt split" data-label="${esc(t.features)}">
    <div class="split-in stack">${[0, 1].map(n => `
      <div class="half" data-label="${esc(t.features)} · ${n + 1}/2"><div class="wrap">
        ${n === 0 ? `<header class="sec-head reveal"><h2>${esc(t.features)}</h2><span class="m-only">1 / 2</span></header>` : `<div class="sec-head reveal m-only" aria-hidden="true"><p class="h2">${esc(t.features)}</p><span>2 / 2</span></div>`}
        <ul class="feats reveal">${c.feats.slice(n * half, n * half + half).map(([h, p]) => `
          <li><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join('')}
        </ul>
      </div></div>`).join('')}
    </div>
  </section>

  <section class="page split" data-label="${esc(t.info)}">
    <div class="split-in two">
      <div class="half" data-label="${esc(t.info)}"><div class="wrap reveal">
        <header class="sec-head"><h2>${esc(t.info)}</h2></header>
        <dl class="info">${c.info.map(([k, v]) => `
          <div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
        </dl>
        <p class="under"><a class="link" href="${app.privacy}">${esc(t.privacy)}</a></p>
      </div></div>
      <div class="half" data-label="${esc(t.faq)}"><div class="wrap faq reveal">
        <header class="sec-head"><h2>${esc(t.faq)}</h2></header>${c.faq.map(([q, a], i) => `
        <details name="faq"${i === 0 ? ' open' : ''}><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}
      </div></div>
    </div>
  </section>

  <section class="page alt" id="katil" data-label="${esc(isLive ? t.liveTitle : canJoin ? t.joinTitle : t.soonTitle)}">
    <div class="wrap">${join}
    </div>
  </section>
</main>

<div class="page last" data-label="${esc(t.others)}">
  <section class="others-sec">
    <div class="wrap">
      <header class="sec-head reveal"><h2>${esc(t.others)}</h2></header>
      <ul class="others reveal">${others}
      </ul>
    </div>
  </section>
  <footer class="foot">
    <div class="wrap foot-in">
      <div class="foot-brand"><span class="foot-logo"><img class="logo on-light" src="/assets/brand/logo.svg" alt="" width="164" height="30"><img class="logo on-dark" src="/assets/brand/logo-koyu-zemin.svg" alt="" width="164" height="30"></span><span>${esc(t.slogan)}</span></div>
      <div class="foot-col">
        <span class="foot-h">${esc(t.footPrivacy)}</span>
        ${PRIVACY.map(([id, href]) => `<a href="${href}">${esc(APPS.find(a => a.id === id).text[lang].short)}</a>`).join('\n        ')}
      </div>
      <div class="foot-col">
        <span class="foot-h">${esc(t.footContact)}</span>
        <a href="mailto:contact@fmjapps.com">contact@fmjapps.com</a>
        <a href="tel:+905333181555">+90 533 318 15 55</a>
        <a href="https://wa.me/905333181555" target="_blank" rel="noopener">WhatsApp</a>
        <a href="https://play.google.com/store/apps/dev?id=7218143537890503046" target="_blank" rel="noopener">${esc(t.footPlay)}</a>
        <nav class="foot-social" aria-label="Instagram, TikTok, YouTube, Facebook, Google Play"><a href="https://www.instagram.com/fmjsoftware" target="_blank" rel="noopener me" aria-label="Instagram" title="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".9" fill="currentColor" stroke="none"/></svg></a><a href="https://www.tiktok.com/@21.3gram" target="_blank" rel="noopener me" aria-label="TikTok" title="TikTok"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 3c.4 2.3 1.9 3.8 4.2 4v3.2a7.6 7.6 0 0 1-4.1-1.2v6.3A6 6 0 1 1 10.8 9.4v3.3a2.8 2.8 0 1 0 2.6 2.8V3Z"/></svg></a><a href="https://www.youtube.com/@fmjsoftware" target="_blank" rel="noopener me" aria-label="YouTube" title="YouTube"><svg viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2 27 27 0 0 0 2 12a27 27 0 0 0 .4 4.8 2.6 2.6 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8A27 27 0 0 0 22 12a27 27 0 0 0-.4-4.8ZM10 15V9l5.2 3Z"/></svg></a><a href="https://www.facebook.com/profile.php?id=61594978658646" target="_blank" rel="noopener me" aria-label="Facebook" title="Facebook"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.5V21Z"/></svg></a><a href="https://play.google.com/store/apps/dev?id=7218143537890503046" target="_blank" rel="noopener me" aria-label="Google Play" title="Google Play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.6 2.8 13.9 12l-9.3 9.2A1.3 1.3 0 0 1 4 20V4c0-.5.2-1 .6-1.2Zm10.4 10.3 2.3 2.3-10.6 6 8.3-8.3Zm0-2.2L6.7 2.6l10.6 6-2.3 2.3Zm3.7 3.6-2.6-2.5 2.6-2.5 2.7 1.5c.9.5.9 1.6 0 2.1Z"/></svg></a></nav>
      </div>
      <div class="foot-col">
        <span class="foot-h">${esc(t.company)}</span>
        <a href="${aboutPath(lang)}">${esc(t.about)}</a>
        <a href="${aboutPath(lang)}#kunye">${esc(t.kunye)}</a>
        <a href="/privacy/">${esc(t.footPrivacy)}</a>
      </div>
    </div>
    <div class="wrap"><p class="foot-bottom">© 2026 FMJ Software · ${esc(t.android)}</p></div>
    <div class="wrap"><p class="foot-legal">Oğulcan Fidan – FMJ Software · ${esc(t.vd)} 3870844488 · İzmir, Türkiye · <a href="mailto:contact@fmjapps.com">contact@fmjapps.com</a> · <a href="tel:+905333181555">+90 533 318 15 55</a> · <a href="${aboutPath(lang)}">${esc(t.about)}</a></p></div>
  </footer>
</div>

<nav class="pager" id="pager" aria-label="${esc(t.pages)}"></nav>
</body>
</html>
`;
}

// Sayfalar
let count = 0;
for (const app of APPS) for (const lang of LANGS) {
  const dir = path.join(ROOT, urlOf(app, lang));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), page(app, lang));
  count++;
}

// Sitenin ana sayfaları: Türkçe kaynak dosya kendi adresinde durur (index.html, uygulamalar/index.html,
// titus/index.html); diğer diller bundan üretilir. meta: başlık ve açıklamanın çeviri anahtarı öneki.
const TEMPLATES = [
  { id: 'home', out: homePath, meta: 'co.meta', og: l => '/assets/og-site-' + l + '.jpg' },
  { id: 'apps', out: appsPath, meta: 'meta', og: l => '/assets/og-apps-' + l + '.jpg' },
  { id: 'titus', out: l => l === 'tr' ? '/titus/' : '/' + l + '/titus/', meta: 'titus.meta', og: l => '/assets/og-titus-' + l + '.jpg' },
  { id: 'about', out: aboutPath, meta: 'about.meta', og: l => '/assets/og-site-' + l + '.jpg' },
  { id: 'qrmenu', out: l => l === 'tr' ? '/qr-menu/' : '/' + l + '/qr-menu/', meta: 'qr.meta', og: l => '/assets/og-qrmenu-' + l + '.jpg' },
  { id: 'web', out: l => l === 'tr' ? '/web-sitesi/' : '/' + l + '/website/', meta: 'web.meta', og: l => '/assets/og-web-' + l + '.jpg' }
];
const HOME_DICT = {};
const HOME_LANGS_OK = HOME_LANGS.filter(l => l === 'tr' || fs.existsSync(path.join(ROOT, 'i18n', l + '.json')));
HOME_LANGS_OK.forEach(l => { if (l !== 'tr') HOME_DICT[l] = JSON.parse(fs.readFileSync(path.join(ROOT, 'i18n', l + '.json'), 'utf8')); });
const ldOf = (html, fn) => html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/, (m, json) => {
  const ld = JSON.parse(json);
  fn(ld);
  return '<script type="application/ld+json">' + JSON.stringify(ld) + '</script>';
});
const appOfNode = node => APPS.find(a => node.image && node.image.endsWith('/' + a.id + '-icon.webp'));
const srcOf = tpl => path.join(ROOT, tpl.out('tr'), 'index.html');
// Türkçe kaynak: yapılandırılmış veri uygulama sayfalarını, dil bağlantıları her dilin kendi adresini gösterir;
// satır içi betik değiştiyse CSP'deki özeti yeniden hesaplanır.
function prepareSource(tpl) {
  let h = fs.readFileSync(srcOf(tpl), 'utf8');
  h = ldOf(h, ld => (ld['@graph'] || []).forEach(node => {
    if (node['@type'] !== 'MobileApplication') return;
    const app = appOfNode(node);
    if (app) node.url = BASE + urlOf(app, 'tr');
  }));
  const alts = HOME_LANGS_OK.map(l => `<link rel="alternate" hreflang="${l}" href="${BASE + tpl.out(l)}">`).join('\n') +
    `\n<link rel="alternate" hreflang="x-default" href="${BASE + tpl.out('tr')}">`;
  // Eski derlemelerden kalan tekrar blokları da silinir, tek blok kalır
  let first = true;
  h = h.replace(/(<link rel="alternate" hreflang="[a-z-]+" href="[^"]+">\r?\n?)+\r?\n?/g, () => { const r = first ? alts + '\n' : ''; first = false; return r; });
  h = h.replace(/'sha256-[^']+'/, () => {
    const inline = h.match(/<script>([\s\S]*?)<\/script>/)[1];
    return "'sha256-" + crypto.createHash('sha256').update(inline, 'utf8').digest('base64') + "'";
  });
  fs.writeFileSync(srcOf(tpl), h);
  return h;
}

// Açılış etiketiyle eşleşen kapanış etiketini bulur (aynı adlı iç içe etiketler sayılır)
function closeOf(html, tag, from) {
  const re = new RegExp('<(/?)' + tag + '\\b[^>]*>', 'gi');
  re.lastIndex = from;
  let depth = 1, m;
  while ((m = re.exec(html))) {
    depth += m[1] ? -1 : 1;
    if (!depth) return m.index;
  }
  throw new Error('kapanmayan etiket: ' + tag);
}
// data-i18n (düz metin) ve data-i18n-html (HTML) taşıyan etiketlerin içi çeviriyle değişir
function fillText(html, attr, val) {
  const re = new RegExp('<(\\w+)\\b[^>]*\\s' + attr + '="([^"]+)"[^>]*>', 'g');
  const hits = [];
  let m;
  while ((m = re.exec(html))) hits.push({ tag: m[1], key: m[2], start: m.index + m[0].length });
  for (let i = hits.length - 1; i >= 0; i--) {
    const h = hits[i], v = val(h.key);
    if (v == null) continue;
    const end = closeOf(html, h.tag, h.start);
    html = html.slice(0, h.start) + v + html.slice(end);
  }
  return html;
}
// Bir öznitelikteki anahtara göre aynı etiketteki başka bir özniteliği değiştirir
function fillAttr(html, keyAttr, target, val) {
  return html.replace(new RegExp('<\\w+\\b[^>]*\\s' + keyAttr + '="([^"]+)"[^>]*>', 'g'), (tag, key) => {
    const v = val(key);
    if (v == null) return tag;
    const re = new RegExp('(\\s' + target + '=")[^"]*(")');
    return re.test(tag) ? tag.replace(re, (m0, a, b) => a + esc(v) + b) : tag;
  });
}
function homePage(tpl, src, lang) {
  const d = HOME_DICT[lang], en = HOME_DICT.en || {};
  const tx = k => d[k] != null ? d[k] : en[k];
  const url = BASE + tpl.out(lang);
  let h = src;
  h = h.replace('<html lang="tr"', `<html lang="${lang}"${RTL[lang] ? ' dir="rtl"' : ''}`);
  h = h.replace(/<title>[^<]*<\/title>/, () => `<title>${esc(tx(tpl.meta + '.title'))}</title>`);
  h = h.replace(/(<meta name="description" content=")[^"]*(")/, (m, a, b) => a + esc(tx(tpl.meta + '.desc')) + b);
  h = h.replace(/(<meta property="og:description" content=")[^"]*(")/, (m, a, b) => a + esc(tx(tpl.meta + '.desc')) + b);
  if (tpl.id === 'home') h = h.replace(/(<meta property="og:title" content=")[^"]*(")/, (m, a, b) => a + esc(tx(tpl.meta + '.title')) + b);
  h = h.replace(/(<meta property="og:url" content=")[^"]*(")/, (m, a, b) => a + url + b);
  h = h.replace(/(<link rel="canonical" href=")[^"]*(")/, (m, a, b) => a + url + b);
  h = ldOf(h, ld => (ld['@graph'] || []).forEach(node => {
    if (node['@type'] === 'Organization' && tx('co.meta.desc')) node.description = tx('co.meta.desc');
    // Hizmet açıklaması o sayfanın meta açıklamasıdır (Titus, QR Menü, Web Sitesi)
    if (node['@type'] === 'Service' && tx(tpl.meta + '.desc')) node.description = tx(tpl.meta + '.desc');
    const app = node['@type'] === 'MobileApplication' && appOfNode(node);
    if (app) {
      const own = app.text[lang] ? lang : 'en', t = app.text[own];
      node.name = t.name; node.description = t.desc; node.url = BASE + urlOf(app, own);
    }
  }));
  h = h.replace('<h3 id="jmTitle">Kayıp Eşya Bürosu</h3>', () => '<h3 id="jmTitle">' + esc(tx('kayip.name')) + '</h3>');
  h = fillText(h, 'data-i18n-html', k => tx(k));
  h = fillText(h, 'data-i18n', k => tx(k) == null ? null : esc(tx(k)));
  h = fillAttr(h, 'data-i18n-aria', 'aria-label', k => tx(k));
  h = fillAttr(h, 'data-i18n-ph', 'placeholder', k => tx(k));
  // Ekran görüntüleri o dilin klasöründen, uygulama bağlantıları o dildeki sayfalardan
  h = h.split('/assets/shots/tr/').join('/assets/shots/' + lang + '/');
  // Paylaşım görseli de o dilde (python _pages/og_home.py üretir)
  h = h.split(tpl.og('tr')).join(tpl.og(lang));
  h = h.replace(/<a\b[^>]*\sdata-en-href="([^"]+)"[^>]*>/g, (tag, href) => tag.replace(/(\shref=")[^"]*(")/, (m, a, b) => a + href.replace('/en/', '/' + lang + '/') + b));
  return h;
}
let homeCount = 0;
for (const tpl of TEMPLATES) {
  const src = prepareSource(tpl);
  for (const lang of HOME_LANGS_OK) {
    if (lang === 'tr') continue;
    const dir = path.join(ROOT, tpl.out(lang));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), homePage(tpl, src, lang));
    homeCount++;
  }
}

// Site haritası
const today = new Date().toISOString().slice(0, 10);
const tplAlts = tpl => HOME_LANGS_OK.map(l => `    <xhtml:link rel="alternate" hreflang="${l}" href="${BASE + tpl.out(l)}"/>`).join('\n') +
  `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE + tpl.out('tr')}"/>`;
const entry = (loc, alts, prio) => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n${alts ? alts + '\n' : ''}    <priority>${prio}</priority>\n  </url>`;
const appAlts = app => LANGS.map(l => `    <xhtml:link rel="alternate" hreflang="${l}" href="${BASE + urlOf(app, l)}"/>`).join('\n') +
  `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE + urlOf(app, 'en')}"/>`;
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${TEMPLATES.map((tpl, i) => HOME_LANGS_OK.map(l => entry(BASE + tpl.out(l), tplAlts(tpl), ((l === 'tr' ? 1 : l === 'en' ? 0.9 : 0.7) - (i ? 0.1 : 0)).toFixed(1))).join('\n')).join('\n')}
${APPS.map(app => LANGS.map(l => entry(BASE + urlOf(app, l), appAlts(app), '0.8')).join('\n')).join('\n')}
${['', 'kayip/', 'collector/', 'prizma/', 'ezber/', 'paydos/', 'titus/', 'site/'].map(p => entry(BASE + '/privacy/' + p, '', '0.3')).join('\n')}
${['mesafeli-satis/', 'on-bilgilendirme/', 'teslimat-iade/'].map(p => entry(BASE + '/sozlesmeler/' + p, '', '0.3')).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);
console.log(count + ' uygulama sayfası, ' + homeCount + ' sayfa kopyası, site haritasında ' + (sitemap.match(/<loc>/g) || []).length + ' adres');
