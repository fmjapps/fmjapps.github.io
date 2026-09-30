// Uygulama sayfalarını üretir: node _pages/build.cjs
// Çıktı: /<adres>/index.html (Türkçe), /en/<adres>/index.html (İngilizce), sitemap.xml
// Ayrıca ana sayfadaki yapılandırılmış veriyi uygulama sayfalarının adresleriyle günceller.
const fs = require('fs');
const path = require('path');
const { UI, APPS } = require('./content.cjs');

const ROOT = path.join(__dirname, '..');
const BASE = 'https://fmjapps.com';
const HOME_LANGS = ['tr', 'en', 'es', 'pt', 'fr', 'de', 'ru', 'ar', 'hi', 'bn', 'zh', 'id'];
const LANGS = ['tr', 'en'];
const PRIVACY = [['kayip', '/privacy/kayip/'], ['koleksiyoncu', '/privacy/collector/'], ['prizma', '/privacy/prizma/'], ['ezber', '/privacy/ezber/'], ['paydos', '/privacy/paydos/']];

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const urlOf = (app, lang) => (lang === 'tr' ? '/' : '/en/') + app[lang].slug + '/';
const homeOf = (lang, hash) => (lang === 'tr' ? '/' : '/?lang=en') + (hash ? '#' + hash : '');
const shot = (s, lang) => '/assets/' + s[0] + (lang === 'en' && s[1] ? '-en' : '') + '.webp';

const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'";

function page(app, lang) {
  const t = UI[lang], c = app[lang], other = lang === 'tr' ? 'en' : 'tr';
  const url = BASE + urlOf(app, lang);
  const group = app.kind === 'game' ? t.games : t.apps;
  const groupHash = app.kind === 'game' ? 'oyunlar' : 'uygulamalar';
  const og = BASE + '/assets/og-' + app.id + (lang === 'en' ? '-en' : '') + '.jpg';
  const isTest = app.status === 'test';
  const half = Math.ceil(c.feats.length / 2);

  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MobileApplication', '@id': url + '#app', name: c.name, description: c.desc, url,
        operatingSystem: 'Android', applicationCategory: app.category, inLanguage: lang,
        image: BASE + '/assets/' + app.id + '-icon.webp',
        screenshot: app.shots.map(s => BASE + shot(s, lang)),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        author: { '@type': 'Organization', name: 'FMJ Apps', url: BASE + '/' }
      },
      {
        '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'FMJ Apps', item: BASE + '/' },
          { '@type': 'ListItem', position: 2, name: c.short, item: url }
        ]
      },
      { '@type': 'FAQPage', mainEntity: c.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
    ]
  };

  const join = isTest ? `
    <div class="join reveal">
      <h2>${esc(t.joinTitle)}</h2>
      <p class="join-lede">${esc(t.joinLede)}</p>
      <ol class="jsteps">
        <li><b>01</b><strong>${esc(t.s1t)}</strong><p>${esc(t.s1d)}</p><a class="btn small tint" href="https://groups.google.com/g/${app.test.group}" target="_blank" rel="noopener">${esc(t.s1b)}</a></li>
        <li><b>02</b><strong>${esc(t.s2t)}</strong><p>${esc(t.s2d)}</p><a class="btn small tint" href="https://play.google.com/apps/testing/${app.test.pkg}" target="_blank" rel="noopener">${esc(t.s2b)}</a></li>
        <li><b>03</b><strong>${esc(t.s3t)}</strong><p>${esc(t.s3d)}</p><a class="btn small tint" href="https://play.google.com/store/apps/details?id=${app.test.pkg}" target="_blank" rel="noopener">${esc(t.s3b)}</a></li>
      </ol>
      <p class="join-note">${esc(t.joinNote)}</p>
    </div>` : `
    <div class="join reveal">
      <h2>${esc(t.soonTitle)}</h2>
      <p class="join-lede">${esc(t.soonLede.replace('{name}', c.short))}</p>
      <div class="cta"><a class="btn small tint" href="${homeOf(lang, 'iletisim')}">${esc(t.feedback)}</a></div>
    </div>`;

  const others = APPS.filter(a => a !== app).map(a => `
        <li><a href="${urlOf(a, lang)}" style="--acc:${a.acc}"><img src="/assets/${a.id}-icon.webp" alt="" width="256" height="256" loading="lazy"><span><strong>${esc(a[lang].short)}</strong><small>${esc(a[lang].tag)}</small></span></a></li>`).join('');

  return `<!doctype html>
<html lang="${lang}" data-theme="dark">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(c.title)}</title>
<meta name="description" content="${esc(c.desc)}">
<meta name="theme-color" content="#0A0A1F">
<meta property="og:type" content="website">
<meta property="og:site_name" content="FMJ Apps">
<meta property="og:title" content="${esc(c.name)}">
<meta property="og:description" content="${esc(c.desc)}">
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${url}">
<meta property="og:locale" content="${lang === 'tr' ? 'tr_TR' : 'en_US'}">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${url}">
<link rel="alternate" hreflang="tr" href="${BASE + urlOf(app, 'tr')}">
<link rel="alternate" hreflang="en" href="${BASE + urlOf(app, 'en')}">
<link rel="alternate" hreflang="x-default" href="${BASE + urlOf(app, 'en')}">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
<link rel="icon" href="/assets/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/app.css">
<script src="/app.js"></script>
</head>
<body style="--acc:${app.acc}${app.acc2 ? ';--acc-2:' + app.acc2 : ''}">
<a class="skip" href="#icerik">${esc(t.skip)}</a>

<header class="nav">
  <div class="nav-in">
    <a class="brand" href="${homeOf(lang)}" aria-label="FMJ Apps · ${esc(t.home)}">
      <img src="/assets/logo-mark.png" alt="" width="128" height="128">
      <span class="brand-text"><span class="brand-name">FMJ Apps</span><span class="brand-tag">${esc(t.tagline)}</span></span>
    </a>
    <nav class="links" aria-label="FMJ Apps">
      <a href="${homeOf(lang, 'oyunlar')}">${esc(t.games)}</a>
      <a href="${homeOf(lang, 'uygulamalar')}">${esc(t.apps)}</a>
      <a href="${homeOf(lang, 'iletisim')}">${esc(t.contact)}</a>
    </nav>
    <div class="tools">
      <div class="seg" role="group" aria-label="${esc(t.langLabel)}">
        ${LANGS.map(l => l === lang ? `<span aria-current="true">${l.toUpperCase()}</span>` : `<a href="${urlOf(app, l)}" hreflang="${l}" lang="${l}" data-set-lang="${l}">${l.toUpperCase()}</a>`).join('')}
      </div>
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
        <li><a href="${homeOf(lang)}">FMJ Apps</a></li>
        <li><a href="${homeOf(lang, groupHash)}">${esc(group)}</a></li>
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
          <p class="status${isTest ? '' : ' soon'}"><i></i>${esc(isTest ? t.statusTest : t.statusSoon)}</p>
          <div class="cta">
            ${isTest ? `<a class="btn solid" href="#katil">${esc(t.join)}</a>` : ''}
            <a class="btn ${isTest ? 'ghost' : 'solid'}" href="${homeOf(lang, 'iletisim')}">${esc(t.feedback)}</a>
          </div>
        </div>
        <div class="hero-media" aria-hidden="true">
          <div class="phone back"><img src="${shot(app.shots[1], lang)}" alt="" width="540" height="1200"></div>
          <div class="phone front"><img src="${shot(app.shots[0], lang)}" alt="" width="540" height="1200"></div>
        </div>
      </div>
    </div>
    <a class="more-hint" href="#goruntuler">${esc(t.scroll)}</a>
  </section>

  <section class="page alt shots-page" id="goruntuler" style="--n:${app.shots.length}" data-label="${esc(t.shots)}">
    <div class="wrap"><header class="sec-head reveal"><h2>${esc(t.shots)}</h2></header></div>
    <div class="gallery reveal" id="gallery" tabindex="0" role="group" aria-label="${esc(t.shots)}">${app.shots.map((s, i) => `
      <figure><div class="phone"><img src="${shot(s, lang)}" alt="${esc(c.name + ': ' + c.alts[i])}" width="540" height="1200"></div><figcaption>${esc(c.alts[i])}</figcaption></figure>`).join('')}
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

  <section class="page alt" id="katil" data-label="${esc(isTest ? t.joinTitle : t.soonTitle)}">
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
      <div class="foot-brand"><strong>FMJ Apps</strong><span>${esc(t.footTag)}</span></div>
      <div class="foot-col">
        <span class="foot-h">${esc(t.footPrivacy)}</span>
        ${PRIVACY.map(([id, href]) => `<a href="${href}">${esc(APPS.find(a => a.id === id)[lang].short)}</a>`).join('\n        ')}
      </div>
      <div class="foot-col">
        <span class="foot-h">${esc(t.footContact)}</span>
        <a href="mailto:contact@fmjapps.com">contact@fmjapps.com</a>
        <a href="https://play.google.com/store/apps/dev?id=7218143537890503046" target="_blank" rel="noopener">${esc(t.footPlay)}</a>
      </div>
    </div>
    <div class="wrap"><p class="foot-bottom">© 2026 FMJ Apps · ${esc(t.android)}</p></div>
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

// Ana sayfadaki yapılandırılmış veri uygulama sayfalarını gösterir
const homeFile = path.join(ROOT, 'index.html');
let home = fs.readFileSync(homeFile, 'utf8');
home = home.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/, (m, json) => {
  const ld = JSON.parse(json);
  ld['@graph'].forEach(node => {
    if (node['@type'] !== 'MobileApplication') return;
    const app = APPS.find(a => node.image.endsWith('/' + a.id + '-icon.webp'));
    if (app) node.url = BASE + urlOf(app, 'tr');
  });
  return '<script type="application/ld+json">' + JSON.stringify(ld) + '</script>';
});
fs.writeFileSync(homeFile, home);

// Site haritası
const today = new Date().toISOString().slice(0, 10);
const homeUrl = l => BASE + '/?lang=' + l;
const homeAlts = HOME_LANGS.map(l => `    <xhtml:link rel="alternate" hreflang="${l}" href="${homeUrl(l)}"/>`).join('\n') +
  `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/"/>`;
const entry = (loc, alts, prio) => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n${alts ? alts + '\n' : ''}    <priority>${prio}</priority>\n  </url>`;
const appAlts = app => LANGS.map(l => `    <xhtml:link rel="alternate" hreflang="${l}" href="${BASE + urlOf(app, l)}"/>`).join('\n') +
  `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE + urlOf(app, 'en')}"/>`;
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entry(BASE + '/', homeAlts, '1.0')}
${HOME_LANGS.map(l => entry(homeUrl(l), homeAlts, l === 'tr' || l === 'en' ? '0.9' : '0.7')).join('\n')}
${APPS.map(app => LANGS.map(l => entry(BASE + urlOf(app, l), appAlts(app), '0.8')).join('\n')).join('\n')}
${['', 'kayip/', 'collector/', 'prizma/', 'ezber/', 'paydos/'].map(p => entry(BASE + '/privacy/' + p, '', '0.3')).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);
console.log(count + ' sayfa, site haritasında ' + (sitemap.match(/<loc>/g) || []).length + ' adres');
