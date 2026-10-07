# Uygulama sayfalarının paylaşım görsellerini üretir (1200x630): python _pages/og.py
# Gerekli: Pillow. Yazı tipi olarak Windows'taki Segoe UI kullanılır.
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))).replace('\\', '/')
A = ROOT + '/assets/'
BOLD = 'C:/Windows/Fonts/segoeuib.ttf'
REG = 'C:/Windows/Fonts/segoeui.ttf'

# kimlik, vurgu rengi, (ad, alt başlık) tr ve en, öndeki ve arkadaki ekran görüntüsünün numarası
APPS = [
    ('kayip', '#9CC98F', ('Kayıp Eşya Bürosu', 'Günlük çıkarım oyunu'), ('Lost & Found Office', 'Daily deduction game'), (2, 3)),
    ('koleksiyoncu', '#E2B75E', ('Koleksiyoner', 'Antika dükkânı oyunu'), ('The Collector: Real or Fake', 'Antique shop detective game'), (1, 2)),
    ('prizma', '#3EF0C8', ('Prizma', 'Işık ve ayna bulmacası'), ('Prizma', 'Light and mirror puzzle'), (1, 3)),
    ('ezber', '#2FC4A8', ('Ezber', 'Replik, sunum, şiir'), ('Memorize', 'Lines, speech, poems'), (1, 2)),
    ('paydos', '#6E8BFF', ('Paydos', 'Çocuk ekran kilidi'), ('Paydos', 'Screen time lock for kids'), (1, 2)),
]


def rgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def rounded(im, r):
    mask = Image.new('L', im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, im.width - 1, im.height - 1), r, fill=255)
    out = im.convert('RGBA')
    out.putalpha(mask)
    return out


def phone(src, h, angle):
    shot = Image.open(src).convert('RGB')
    w = round(shot.width * h / shot.height)
    shot = rounded(shot.resize((w, h), Image.LANCZOS), 30)
    pad = 9
    body = Image.new('RGBA', (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    ImageDraw.Draw(body).rounded_rectangle((0, 0, body.width - 1, body.height - 1), 38, fill=(28, 32, 52, 255), outline=(70, 76, 110, 255), width=2)
    body.alpha_composite(shot, (pad, pad))
    return body.rotate(angle, resample=Image.BICUBIC, expand=True)


def wrap(draw, text, font, width):
    lines, cur = [], ''
    for word in text.split():
        t = (cur + ' ' + word).strip()
        if draw.textlength(t, font=font) <= width or not cur:
            cur = t
        else:
            lines.append(cur)
            cur = word
    return lines + [cur]


def make(app, lang):
    key, acc, tr, en, shots = app
    name, tag = tr if lang == 'tr' else en
    W, H = 1200, 630
    im = Image.new('RGB', (W, H), '#0A0A1F')
    glow = Image.new('RGB', (W, H), '#0A0A1F')
    g = ImageDraw.Draw(glow)
    g.ellipse((640, -260, 1360, 460), fill=tuple(c // 3 for c in rgb(acc)))
    g.ellipse((-260, 380, 320, 960), fill=(30, 26, 84))
    im = Image.blend(im, glow.filter(ImageFilter.GaussianBlur(130)), .9).convert('RGBA')

    src = lambda n: A + 'shots/%s/%s-%d.webp' % (lang, key, n)
    back = phone(src(shots[1]), 470, -7)
    front = phone(src(shots[0]), 540, 4)
    im.alpha_composite(back, (930, 110))
    im.alpha_composite(front, (700, 60))

    d = ImageDraw.Draw(im)
    icon = rounded(Image.open(A + key + '-icon.webp').convert('RGB').resize((132, 132), Image.LANCZOS), 34)
    im.alpha_composite(icon, (72, 96))
    size = 76
    while True:
        font = ImageFont.truetype(BOLD, size)
        lines = wrap(d, name, font, 590)
        if len(lines) <= 2 or size <= 48:
            break
        size -= 4
    y = 262
    for line in lines:
        d.text((72, y), line, font=font, fill='#EEF2FF')
        y += round(size * 1.12)
    d.text((72, y + 14), tag, font=ImageFont.truetype(REG, 34), fill=acc)
    d.text((72, 540), 'FMJ Software  ·  Android', font=ImageFont.truetype(BOLD, 24), fill='#A2A3CC')
    out = A + 'og-' + key + ('-en' if lang == 'en' else '') + '.jpg'
    im.convert('RGB').save(out, 'JPEG', quality=86, optimize=True, progressive=True)
    return out


for app in APPS:
    for lang in ('tr', 'en'):
        print(os.path.basename(make(app, lang)))
