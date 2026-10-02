# Ana sayfanın paylaşım görsellerini her dil için üretir (1200x630): python _pages/og_home.py
# Zemin og-home-base.png (sloganı olmayan kart), slogan i18n/<dil>.json → hero.tagline.
# Yazıyı tarayıcı çizer: Arapça ve Hintçe gibi yazılar ancak böyle doğru birleşir.
# Gerekli: Pillow ve Chrome (ya da Edge).
import os, json, shutil, subprocess, tempfile, html
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))).replace('\\', '/')
BASE = ROOT + '/_pages/og-home-base.png'
LANGS = ['tr', 'en', 'es', 'pt', 'fr', 'de', 'it', 'ru', 'ar', 'hi', 'zh', 'ja', 'ko', 'id']
TR_TAGLINE = 'Sade, güvenilir oyunlar ve uygulamalar'
BROWSERS = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe']
# Büyük-küçük harfi ve harf aralığı olmayan yazılar
PLAIN = {'ar', 'hi', 'zh', 'ja', 'ko'}

PAGE = '''<!doctype html><html lang="{lang}"{dir}><meta charset="utf-8"><style>
html, body {{ margin: 0; width: 1200px; height: 630px; overflow: hidden; }}
body {{ background: url("{base}") no-repeat; }}
p {{ position: absolute; inset-inline: 0; top: 352px; margin: 0; text-align: center;
  font: 500 {size}px/30px Arial, "Helvetica Neue", "Segoe UI", "Nirmala UI", "Yu Gothic UI", "Malgun Gothic", "Microsoft YaHei", sans-serif;
  color: #DCDAF8; letter-spacing: {ls}; text-transform: {tt}; }}
</style><p>{text}</p></html>'''


def tagline(lang):
    if lang == 'tr':
        return TR_TAGLINE
    with open(ROOT + '/i18n/' + lang + '.json', encoding='utf-8') as f:
        return json.load(f)['hero.tagline']


def main():
    browser = next(b for b in BROWSERS if os.path.exists(b))
    tmp = tempfile.mkdtemp()
    try:
        for lang in LANGS:
            plain = lang in PLAIN
            page = PAGE.format(lang=lang, dir=' dir="rtl"' if lang == 'ar' else '', base='file:///' + BASE,
                               size=19 if plain else 17, ls='0' if plain else '2.4px', tt='none' if plain else 'uppercase',
                               text=html.escape(tagline(lang)))
            src = os.path.join(tmp, lang + '.html')
            png = os.path.join(tmp, lang + '.png')
            with open(src, 'w', encoding='utf-8') as f:
                f.write(page)
            subprocess.run([browser, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
                            '--user-data-dir=' + os.path.join(tmp, 'profile'), '--window-size=1200,630',
                            '--screenshot=' + png, 'file:///' + src.replace('\\', '/')], check=True, capture_output=True, timeout=60)
            im = Image.open(png).convert('RGB').crop((0, 0, 1200, 630))
            out = ROOT + '/assets/og-home-' + lang + '.jpg'
            im.save(out, 'JPEG', quality=88, optimize=True, progressive=True)
            print(os.path.basename(out))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == '__main__':
    main()
