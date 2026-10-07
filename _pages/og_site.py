# Kurumsal ana sayfanın, Titus, QR Menü ve Web Sitesi sayfalarının paylaşım görsellerini her dil için üretir (1200x630):
#   python _pages/og_site.py
# Çıktı: assets/og-site-<dil>.jpg, assets/og-titus-<dil>.jpg, assets/og-qrmenu-<dil>.jpg ve assets/og-web-<dil>.jpg
# Alt yazılar i18n/<dil>.json → co.tagline, titus.hero.kick, qr.hero.kick ve web.hero.kick ("… · " öneki atılır); Türkçesi aşağıda.
# Yazıyı tarayıcı çizer: Arapça ve Hintçe gibi yazılar ancak böyle doğru birleşir.
# Gerekli: Pillow ve Chrome (ya da Edge).
import os, json, shutil, subprocess, tempfile, html
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))).replace('\\', '/')
LANGS = ['tr', 'en', 'es', 'pt', 'fr', 'de', 'it', 'ru', 'ar', 'hi', 'zh', 'ja', 'ko', 'id']
TR = {'co.tagline': 'Güvenilir çözümler, verimli sonuçlar', 'titus.hero.kick': 'Titus · İşletmeler için yapay zekâ müşteri asistanı',
      'qr.hero.kick': 'QR Menü · Kafe ve restoranlar için dijital menü', 'qr.name': 'QR Menü',
      'web.hero.kick': 'Web Sitesi · İşletmeler ve kişiler için tanıtım sitesi', 'web.name': 'Web Sitesi',
      'hero.tagline': 'Sade, güvenilir oyunlar ve uygulamalar'}
# QR Menü kutucuğundaki simge
QR_ICON = '<svg viewBox="0 0 24 24" width="60" height="60" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h6v6H4ZM14 4h6v6h-6ZM4 14h6v6H4Z"/><path d="M14 14h2v2h-2ZM18 18h2v2h-2ZM14 18h2M18 14h2"/></svg>'
# Web Sitesi kutucuğundaki simge
WEB_ICON = '<svg viewBox="0 0 24 24" width="60" height="60" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="15" rx="2"/><path d="M3 9h18M6.5 6.8h.01M9 6.8h.01"/></svg>'
BROWSERS = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe']
FONT = 'Arial, "Helvetica Neue", "Segoe UI", "Nirmala UI", "Yu Gothic UI", "Malgun Gothic", "Microsoft YaHei", sans-serif'

PAGE = '''<!doctype html><html lang="{lang}"{dir}><meta charset="utf-8"><style>
html, body {{ margin: 0; width: 1200px; height: 630px; overflow: hidden; }}
body {{ position: relative; font-family: {font}; color: #FFFFFF;
  background: radial-gradient(circle at 82% 20%, rgba(255, 79, 46, .35), transparent 40%),
              radial-gradient(circle at 55% 105%, rgba(143, 211, 180, .18), transparent 40%),
              linear-gradient(120deg, #1C3334 0%, #244A4B 55%, #376E6F 100%); }}
body::before {{ content: ''; position: absolute; inset: 0;
  background-image: none;
  background-size: 56px 56px; -webkit-mask-image: radial-gradient(ellipse 75% 75% at 50% 40%, #000 30%, transparent 80%); }}
.box {{ position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; padding: 0 96px; }}
.row {{ display: flex; align-items: center; gap: 28px; }}
.wordmark {{ display: block; height: 112px; width: auto; align-self: flex-start; }}
.tile {{ width: 112px; height: 112px; border-radius: 30px; display: grid; place-items: center; font: 700 60px {font}; color: #fff;
  background: linear-gradient(135deg, #FF4F2E, #376E6F); box-shadow: 0 24px 60px -20px #376E6F; }}
h1 {{ margin: 0; font-size: 92px; line-height: 1; letter-spacing: -2px; font-weight: 700; }}
p {{ margin: 34px 0 0; font-size: 38px; line-height: 1.3; color: #FF4F2E; max-width: 1000px; }}
p.cap {{ text-transform: capitalize; }}
.by {{ position: absolute; bottom: 52px; inset-inline-start: 96px; display: flex; align-items: center; gap: 14px; font-size: 24px; font-weight: 700; color: #FF4F2E; }}
.by img {{ width: 40px; height: 40px; border-radius: 11px; }}
.url {{ position: absolute; bottom: 58px; inset-inline-end: 96px; font-size: 22px; color: #E6EEF0; }}
</style>
<div class="box">{body}</div>{foot}</html>'''


def texts(lang):
    if lang == 'tr':
        return TR
    with open(ROOT + '/i18n/' + lang + '.json', encoding='utf-8') as f:
        d = json.load(f)
    return {k: d.get(k, TR[k]) for k in TR}


def render(browser, tmp, name, lang, page):
    src = os.path.join(tmp, name + '-' + lang + '.html')
    png = os.path.join(tmp, name + '-' + lang + '.png')
    with open(src, 'w', encoding='utf-8') as f:
        f.write(page)
    subprocess.run([browser, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
                    '--user-data-dir=' + os.path.join(tmp, 'profile'), '--window-size=1200,630',
                    '--screenshot=' + png, 'file:///' + src.replace('\\', '/')], check=True, capture_output=True, timeout=60)
    out = ROOT + '/assets/og-' + name + '-' + lang + '.jpg'
    Image.open(png).convert('RGB').crop((0, 0, 1200, 630)).save(out, 'JPEG', quality=88, optimize=True, progressive=True)
    print(os.path.basename(out))


def main():
    browser = next(b for b in BROWSERS if os.path.exists(b))
    # Kare ikon (alt köşe) ve koyu zemin için krem harfli yazılı logo
    logo = 'file:///' + ROOT + '/assets/brand/favicon.svg'
    wordmark = 'file:///' + ROOT + '/assets/brand/logo-koyu-zemin.svg'
    tmp = tempfile.mkdtemp()
    try:
        for lang in LANGS:
            t = texts(lang)
            rtl = ' dir="rtl"' if lang == 'ar' else ''
            site = PAGE.format(lang=lang, dir=rtl, font=FONT,
                               body='<img class="wordmark" src="%s" alt="FMJ Software"><p class="cap">%s</p>' % (wordmark, html.escape(t['co.tagline'])),
                               foot='<span class="url" dir="ltr">fmjapps.com</span>')
            render(browser, tmp, 'site', lang, site)
            # Oyun ve uygulamalar vitrini: aynı logo, altında vitrinin sloganı
            apps = PAGE.format(lang=lang, dir=rtl, font=FONT,
                               body='<img class="wordmark" src="%s" alt="FMJ Software"><p class="cap" style="text-transform:none">%s</p>' % (wordmark, html.escape(t['hero.tagline'])),
                               foot='<span class="url" dir="ltr">%s</span>' % ('fmjapps.com/uygulamalar' if lang == 'tr' else 'fmjapps.com/' + lang + '/apps'))
            render(browser, tmp, 'apps', lang, apps)
            titus = PAGE.format(lang=lang, dir=rtl, font=FONT,
                                body='<div class="row"><span class="tile">T</span><h1>Titus</h1></div><p>%s</p>' % html.escape(t['titus.hero.kick'].split('·', 1)[-1].strip()),
                                foot='<span class="by" dir="ltr"><img src="%s">FMJ Software</span><span class="url" dir="ltr">fmjapps.com/titus</span>' % logo)
            render(browser, tmp, 'titus', lang, titus)
            qr = PAGE.format(lang=lang, dir=rtl, font=FONT,
                             body='<div class="row"><span class="tile">%s</span><h1>%s</h1></div><p>%s</p>' % (QR_ICON, html.escape(t['qr.name']), html.escape(t['qr.hero.kick'].split('·', 1)[-1].strip())),
                             foot='<span class="by" dir="ltr"><img src="%s">FMJ Software</span><span class="url" dir="ltr">fmjapps.com/qr-menu</span>' % logo)
            render(browser, tmp, 'qrmenu', lang, qr)
            web = PAGE.format(lang=lang, dir=rtl, font=FONT,
                              body='<div class="row"><span class="tile">%s</span><h1>%s</h1></div><p>%s</p>' % (WEB_ICON, html.escape(t['web.name']), html.escape(t['web.hero.kick'].split('·', 1)[-1].strip())),
                              foot='<span class="by" dir="ltr"><img src="%s">FMJ Software</span><span class="url" dir="ltr">%s</span>' % (logo, 'fmjapps.com/web-sitesi' if lang == 'tr' else 'fmjapps.com/' + lang + '/website'))
            render(browser, tmp, 'web', lang, web)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == '__main__':
    main()
