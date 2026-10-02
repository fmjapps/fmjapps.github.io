# Her dilin ekran görüntülerini uygulamaların kendi klasörlerinden alır: python _pages/shots.py
# Çıktı: assets/shots/<dil>/<uygulama>-<n>.webp (540x1200). Uygulama klasörleri yalnızca okunur.
# Kayıp Eşya Bürosu'nda ham ekran görüntüleri var; diğerlerinde mağaza görselindeki telefonun ekranı kesilir.
# Hangi görselin hangi açıklamayla kullanılacağı content.cjs → shots alanında yazar.
import os, re, glob, subprocess
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))).replace('\\', '/')
D = os.path.dirname(ROOT) + '/'
OUT = ROOT + '/assets/shots/'
SW, SH = 540, 1200
LANGS = ['tr', 'en', 'es', 'pt', 'fr', 'de', 'it', 'ru', 'ar', 'hi', 'zh', 'ja', 'ko', 'id']
PLAY = {'tr': 'tr-TR', 'en': 'en-US', 'es': 'es-419', 'pt': 'pt-BR', 'fr': 'fr-FR', 'de': 'de-DE', 'it': 'it-IT', 'ru': 'ru-RU',
        'ar': 'ar', 'hi': 'hi-IN', 'zh': 'zh-CN', 'ja': 'ja-JP', 'ko': 'ko-KR', 'id': 'id'}
# uygulama: (dildeki görsel dosyaları, 1080x1920 mağaza görselinde ekranın kutusu; ham görüntüde None)
APPS = {
    'kayip': (lambda l: sorted(glob.glob(D + 'kayip-esya-burosu/store/screenshots/%s/0[0-9]-*.png' % l)), None),
    'koleksiyoncu': (lambda l: sorted(glob.glob(D + 'ekspertiz/assets/store/%s/[0-9].png' % l)), (191, 307, 889, 1847)),
    'prizma': (lambda l: sorted(glob.glob(D + 'prizma-web/_gecici_store_out/ekran_goruntuleri/%s/prizma_%s_[0-9]_*.png' % (PLAY[l], PLAY[l]))), (170, 274, 910, 1877)),
    'ezber': (lambda l: sorted(glob.glob(D + 'ezber-asistani/store/shots/%s/%s-[0-9].png' % (PLAY[l], PLAY[l]))), (163, 260, 917, 1860)),
    'paydos': (lambda l: sorted(glob.glob(D + 'zamankilidi/play-store-assets/%s/paydos-%s-[0-9]-*.png' % (PLAY[l], PLAY[l]))), (172, 307, 908, 1920)),
}


def used():
    # content.cjs'te kullanılan görsel numaraları
    out = subprocess.run(['node', '-e', "const {APPS}=require('./_pages/content.cjs');console.log(JSON.stringify(Object.fromEntries(APPS.map(a=>[a.id,a.shots.map(s=>s[0])]))))"],
                         cwd=ROOT, capture_output=True, text=True, check=True).stdout
    import json
    return json.loads(out)


def fit(im):
    # 540x1200'ü doldurur; oran tutmazsa kenarlardan eşit, alttan kırpar
    s = max(SW / im.width, SH / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    x = (im.width - SW) // 2
    return im.crop((x, 0, x + SW, SH))


def main():
    need = used()
    count = 0
    for app, (files, box) in APPS.items():
        for l in LANGS:
            fs = files(l)
            os.makedirs(OUT + l, exist_ok=True)
            for n in need[app]:
                if n > len(fs):
                    raise SystemExit('eksik görsel: %s %s %d' % (app, l, n))
                im = Image.open(fs[n - 1]).convert('RGB')
                if box:
                    if im.size != (1080, 1920):
                        raise SystemExit('beklenmeyen boyut: ' + fs[n - 1])
                    im = im.crop(box)
                fit(im).save(OUT + '%s/%s-%d.webp' % (l, app, n), 'WEBP', quality=82, method=6)
                count += 1
    print(count, 'görsel')


if __name__ == '__main__':
    main()
