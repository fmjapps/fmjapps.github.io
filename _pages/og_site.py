# Kurumsal ana sayfanın ve Titus sayfasının paylaşım görsellerini her dil için üretir (1200x630):
#   python _pages/og_site.py
# Çıktı: assets/og-site-<dil>.jpg ve assets/og-titus-<dil>.jpg
# Alt yazılar i18n/<dil>.json → co.tagline ve titus.hero.kick ("Titus · " öneki atılır); Türkçesi aşağıda.
# Yazıyı tarayıcı çizer: Arapça ve Hintçe gibi yazılar ancak böyle doğru birleşir.
# Gerekli: Pillow ve Chrome (ya da Edge).
import os, json, shutil, subprocess, tempfile, html
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))).replace('\\', '/')
LANGS = ['tr', 'en', 'es', 'pt', 'fr', 'de', 'it', 'ru', 'ar', 'hi', 'zh', 'ja', 'ko', 'id']
TR = {'co.tagline': 'Güvenilir çözümler, verimli sonuçlar', 'titus.hero.kick': 'Titus · İşletmeler için yapay zekâ müşteri asistanı'}
BROWSERS = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe']
FONT = 'Arial, "Helvetica Neue", "Segoe UI", "Nirmala UI", "Yu Gothic UI", "Malgun Gothic", "Microsoft YaHei", sans-serif'

PAGE = '''<!doctype html><html lang="{lang}"{dir}><meta charset="utf-8"><style>
html, body {{ margin: 0; width: 1200px; height: 630px; overflow: hidden; }}
body {{ position: relative; font-family: {font}; color: #FFFFFF;
  background: radial-gradient(700px 420px at 85% 0%, rgba(218, 123, 147, .30), transparent 70%),
              radial-gradient(520px 360px at 0% 100%, rgba(55, 110, 111, .35), transparent 70%), #0D0507; }}
body::before {{ content: ''; position: absolute; inset: 0;
  background-image: none;
  background-size: 56px 56px; -webkit-mask-image: radial-gradient(ellipse 75% 75% at 50% 40%, #000 30%, transparent 80%); }}
.box {{ position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; padding: 0 96px; }}
.row {{ display: flex; align-items: center; gap: 28px; }}
.logo {{ width: 112px; height: 112px; border-radius: 30px; box-shadow: 0 24px 60px -20px #376E6F; }}
.tile {{ width: 112px; height: 112px; border-radius: 30px; display: grid; place-items: center; font: 700 60px {font}; color: #fff;
  background: linear-gradient(135deg, #DA7B93, #376E6F); box-shadow: 0 24px 60px -20px #376E6F; }}
h1 {{ margin: 0; font-size: 92px; line-height: 1; letter-spacing: -2px; font-weight: 700; }}
p {{ margin: 34px 0 0; font-size: 38px; line-height: 1.3; color: #E2CDD3; max-width: 1000px; }}
p.cap {{ text-transform: capitalize; }}
.by {{ position: absolute; bottom: 52px; inset-inline-start: 96px; display: flex; align-items: center; gap: 14px; font-size: 24px; font-weight: 700; color: #F0B3C3; }}
.by img {{ width: 40px; height: 40px; border-radius: 11px; }}
.url {{ position: absolute; bottom: 58px; inset-inline-end: 96px; font-size: 22px; color: #AE9199; }}
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
    logo = 'file:///' + ROOT + '/assets/logo-mark.png'
    tmp = tempfile.mkdtemp()
    try:
        for lang in LANGS:
            t = texts(lang)
            rtl = ' dir="rtl"' if lang == 'ar' else ''
            site = PAGE.format(lang=lang, dir=rtl, font=FONT,
                               body='<div class="row"><img class="logo" src="%s"><h1>FMJ Software</h1></div><p class="cap">%s</p>' % (logo, html.escape(t['co.tagline'])),
                               foot='<span class="url" dir="ltr">fmjapps.com</span>')
            render(browser, tmp, 'site', lang, site)
            titus = PAGE.format(lang=lang, dir=rtl, font=FONT,
                                body='<div class="row"><span class="tile">T</span><h1>Titus</h1></div><p>%s</p>' % html.escape(t['titus.hero.kick'].split('·', 1)[-1].strip()),
                                foot='<span class="by" dir="ltr"><img src="%s">FMJ Software</span><span class="url" dir="ltr">fmjapps.com/titus</span>' % logo)
            render(browser, tmp, 'titus', lang, titus)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == '__main__':
    main()
