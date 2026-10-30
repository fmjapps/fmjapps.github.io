# fmjapps.com'a yeni bir ürün sayfası ekleme talimatı

Bu doküman, Ekim 2026'da siteye **Mirus** ürünü eklenirken yapılan değişiklikleri ve mantığını anlatır.
Yeni bir ürün eklerken aynı yol izlenmelidir. Mirus'un eklendiği commitler: `2aa003d` (kurumsal site + Mirus),
`d90263a` (satır sonları LF), `4729561` (Mirus gizlilik politikası, demo adresi `mirus.fmjapps.com`).

Aşağıda `<urun>` yeni ürünün adres adıdır (küçük harf, Türkçe karaktersiz, ör. `nova`).

---

## 0. Kurallar (sahibinden, değişmez)

- Önce yerelde göster. **Commit atma ve pushlama; sahibi "pushla" deyince yap.**
- Commit yazarı: `ogulcanfidan <86320865+ogulcanfidan@users.noreply.github.com>`. Commit mesajlarında ve kod yorumlarında
  yapay zekâ izi ya da adı olmasın. `Co-Authored-By` satırı ekleme.
- `app-ads.txt` ve `CNAME` asla silinmez. Repo adı (`fmjapps.github.io`) değişmez.
- Masaüstünde yeni klasör açma.
- Yalnızca gerçekten var olan özellikleri yaz; uydurma iddia, sahte müşteri yorumu, olmayan sertifika yazma.
  Ürün henüz yoksa "yakında" de.
- İletişim adresi her yerde `contact@fmjapps.com`. Kişisel e-posta hiçbir yere yazılmaz.
- Satır içi `<script>` eklemekten kaçın. Gerekirse yalnızca sayfanın mevcut tek satır içi betiği değişir; CSP özeti build ile yeniden hesaplanır.
- Uygulama klasörleri (salt okunur, ASLA değiştirme): `Desktop\kayip-esya-burosu`, `ekspertiz`, `prizma-web`, `ezber-asistani`, `zamankilidi`.
- Gizlilik politikalarının mevcut adresleri (`privacy/<uygulama>/`) değişmez.
- Sahibi "dur" derse hemen dur ve işin ne durumda kaldığını söyle.
- Büyük bir işe başlamadan önce planı 3-5 maddede özetle.
- Metin ya da `index.html` değiştikten sonra **`node _pages/build.cjs`** çalıştırılır.
- Fiyat yazılmaz; "kullandığınız kadar ödeyin" gibi genel ifade kullanılır, rakam görüşmede söylenir.

## 1. Sitenin yapısı (kısa)

- Statik GitHub Pages sitesi. Sunucu tarafı yok; HTML dosyaları repoda hazır durur.
- **İki tür sayfa var:**
  1. **Mobil uygulama sayfaları** (Prizma, Ezber…): `_pages/content.cjs` içindeki `APPS` listesinden ve `_pages/lang/<dil>.json`
     çevirilerinden **tamamen üretilir**. Elle HTML yazılmaz.
  2. **Kurumsal şablon sayfalar:** ana sayfa (`index.html`), uygulamalar vitrini (`uygulamalar/index.html`) ve **Mirus**
     (`mirus/index.html`). Bunların **Türkçe kaynağı elle yazılır**. Diğer 13 dil, build sırasında bu kaynaktaki `data-i18n`
     anahtarlarının `i18n/<dil>.json` çevirileriyle doldurulmasıyla üretilir.
- Diller (`HOME_LANGS`): `tr en es pt fr de it ru ar hi zh ja ko id`. Arapça sağdan sola (`RTL`).
  Türkçe adres `/urun/`, diğerleri `/<dil>/urun/`.
- Çeviri eksikse İngilizceye düşer. İngilizcesi de yoksa Türkçe kaynak metin kalır.
- Varsayılan tema koyu; tema tercihi tarayıcıda `fmj-tema` anahtarında tutulur.
  Renkler `site.css` başındaki ve sonundaki `:root` blokları ile `[data-theme]` bloklarında, değişken olarak tanımlı.

## 2. Mirus için ne yapıldı ve neden

| Değişiklik | Nerede | Mantık |
|---|---|---|
| Ürün sayfası | `mirus/index.html` (Türkçe kaynak) | Bölümler: giriş (hero), nasıl çalışır (`#nasil`), yetenekler (`#yetenekler`), kontrol (`#kontrol`), fiyat (`#fiyat`, rakamsız), güvenlik (`#guvenlik`), SSS (`#sss`), iletişim (`#iletisim`). Her metin bir `data-i18n="mirus.*"` anahtarı taşır. |
| Şablon kaydı | `_pages/build.cjs` → `TEMPLATES` dizisi | `{ id: 'mirus', out: l => l === 'tr' ? '/mirus/' : '/' + l + '/mirus/', meta: 'mirus.meta', og: l => '/assets/og-mirus-' + l + '.jpg' }`. Build bu sayede 13 dili üretir, `hreflang` bağlantılarını, kanonik adresi ve site haritasını kendisi yazar. |
| Çeviriler | `i18n/<dil>.json` (13 dosya) | `mirus.*` anahtarları. `mirus.meta.title` ve `mirus.meta.desc` zorunlu: sayfa başlığı, açıklama ve paylaşım metni bunlardan gelir. |
| Paylaşım görselleri | `_pages/og_site.py` → `assets/og-mirus-<dil>.jpg` | Alt yazı `mirus.hero.kick` anahtarından alınır. `python _pages/og_site.py` ile üretilir. |
| Yapılandırılmış veri | Kaynak sayfadaki `application/ld+json` | `@type: Service` düğümü. Build açıklamayı her dilde `mirus.meta.desc` ile değiştirir. |
| Ana sayfadan bağlantılar | `index.html`: üst menü, giriş butonu ("Mirus'u tanıyın"), fiyat kartı, alt bilgi "Çözümler" | Her bağlantıda `href="/mirus/"` ve **`data-en-href="/en/mirus/"`** var. Build, diğer dillerde `/en/` kısmını o dille değiştirir. Bu öznitelik olmazsa çevrilmiş sayfalar Türkçe sayfaya gider. |
| İletişim formu konusu | Butonlarda `data-subject="mirus"` + `_worker/worker.js` → `SUBJECTS` | Form hangi üründen açıldıysa e-postanın konusu ona göre gelir. Worker değişikliği ayrıca `npx wrangler deploy` ister (sahibinin onayıyla). Bilinmeyen konu `general`'a düşer, form bozulmaz. |
| Canlı demo | `site.js` → `DEMO_API = 'https://mirus.fmjapps.com/api/site'` | Ana sayfadaki sektör demosu Mirus sunucusuyla konuşur. Demo şifrelidir (kilit + "Şifre isteyin"). |
| CSP | `index.html` ve `mirus/index.html` başındaki `Content-Security-Policy` | `connect-src` içine `https://mirus.fmjapps.com` eklendi; yoksa tarayıcı demo isteğini engeller. `script-src` içindeki `sha256-…` özeti build tarafından kaynak sayfanın satır içi betiğinden yeniden hesaplanır. |
| 3B figür | `mirus3d.js` (yalnızca ana sayfada yüklenir) | Mirus'a özel ışık noktalarından yüz figürü. **Yeni ürün için kullanılmamalı**; o ürünün kendi görseli olmalı. |
| Gizlilik politikası | `privacy/mirus/index.html`, `privacy/index.html` listesi, `privacy/README.md` | Meta (WhatsApp/Instagram) uygulama yayını bunu istiyor. `privacy/README.md` şemasına uyar; Android izin maddesi yok. Veri silme talimatı `#veri-silme` (EN: `#data-deletion`). Sadece koddaki gerçek davranış yazıldı. |
| Site haritası | `_pages/build.cjs` | Şablon sayfalar `TEMPLATES`'ten otomatik girer. Gizlilik sayfaları ise sitemap satırındaki elle yazılmış listede (`['', 'kayip/', …, 'mirus/']`). |
| Uygulamalar taşındı | `/uygulamalar/` (EN: `/en/apps/`) | Ana sayfa artık FMJ Apps kurumsal sayfası; oyun ve uygulamalar vitrini bu adrese taşındı. |

## 3. Yeni ürün eklemek: adım adım

1. **Plan:** Ürünün adres adını (`<urun>`), sayfa bölümlerini ve ana sayfada nerede tanıtılacağını 3-5 maddede sahibine özetle.
2. **Türkçe kaynak sayfa:** `mirus/index.html`'i `<urun>/index.html` olarak kopyala ve içeriği değiştir.
   - Tüm görünür metinler `data-i18n="<urun>.…"` (düz metin), `data-i18n-html` (içinde etiket olan metin),
     `data-i18n-aria` (aria-label) ve `data-i18n-ph` (placeholder) anahtarlarıyla işaretlenmeli.
   - `<title>`, `description`, `og:*`, `canonical` Türkçe değerlerle kalabilir; build diğer dillerde değiştirir.
   - `og:image` → `https://fmjapps.com/assets/og-<urun>-tr.jpg`.
   - JSON-LD'yi ürüne göre düzenle (`Service` ya da `SoftwareApplication`).
   - Mirus'a özel olanları çıkar: demo bölümü, `mirus3d.js`, `connect-src` içindeki Mirus adresi (ürünün kendi API'si yoksa).
   - **Bilinen hata:** `mirus/index.html` kaynağında `hreflang` bağlantı bloğu iki kez yazılmış (build yalnızca ilk bloğu yeniler). Kopyalarken tek blok bırak; istersen Mirus kaynağındaki fazla bloğu da sil.
3. **Şablonu kaydet:** `_pages/build.cjs` → `TEMPLATES` dizisine bir satır ekle:
   `{ id: '<urun>', out: l => l === 'tr' ? '/<urun>/' : '/' + l + '/<urun>/', meta: '<urun>.meta', og: l => '/assets/og-<urun>-' + l + '.jpg' }`
   Build'deki `Service` açıklaması `mirus.meta.desc`'e bağlı yazılmış; yeni ürünün yapılandırılmış verisi için `homePage()`
   fonksiyonundaki ilgili satırı ürüne göre genişlet.
4. **Çeviriler:** `i18n/<dil>.json` dosyalarının 13'üne de `<urun>.*` anahtarlarını ekle. En az `<urun>.meta.title` ve
   `<urun>.meta.desc` her dilde olmalı. Arapça metinler sağdan sola düzende de kontrol edilmeli.
5. **Paylaşım görselleri:** `_pages/og_site.py`'ye Mirus'taki desenle ürün bloğu ekle, `python _pages/og_site.py` çalıştır
   → `assets/og-<urun>-<dil>.jpg` (14 dosya).
6. **Bağlantılar:**
   - Ana sayfa (`index.html`): üst menü, ürün tanıtım kartı, alt bilgi "Çözümler".
   - Her bağlantı `href="/<urun>/"` ve `data-en-href="/en/<urun>/"` ile yazılır.
   - Ürünün kendi sayfasının alt bilgisinden de diğer ürünlere bağlantı ver.
7. **İletişim formu:** Ürün sayfasındaki "Demo isteyin / Bize yazın" butonlarına `data-subject="<urun>"` ekle.
   `_worker/worker.js` → `SUBJECTS` içine `<urun>: '<Ürün> talebi'` ekle. Worker yayını (`npx wrangler deploy`) ayrı bir
   adımdır ve sahibinin onayını ister.
8. **Ürünün canlı bir servisi varsa** (demo, API):
   - Adresi `site.js`'de sabit olarak tut.
   - Kaynak sayfaların (`index.html`, `<urun>/index.html`) CSP `connect-src`'una o adresi ekle.
   - Servis tarafında CORS izinli kaynaklarına `https://fmjapps.com`, `https://www.fmjapps.com` ve yerel test için `http://localhost:5190` eklenmeli.
9. **Ürün kişisel veri işliyorsa gizlilik politikası:** `privacy/<urun>/index.html`, `privacy/README.md`'deki şemayla
   (TR + EN, aynı madde sırası, `policy.css`). `privacy/index.html` listesine satır ekle. Build'deki sitemap listesine
   `'<urun>/'` ekle. Yalnızca ürünün gerçekte yaptığını yaz.
10. **Build ve kontrol:**
    - `node _pages/build.cjs` çalıştır. Çıktıda sayfa sayısı ve site haritası adres sayısı yazar.
    - **Satır sonları LF olmalı.** Windows'ta CRLF yazılırsa CSP özeti tarayıcının gördüğü dosyayla tutmaz ve sayfanın betiği çalışmaz (Mirus'ta bu yaşandı, `d90263a` ile düzeltildi). Değişen dosyalarda `\r\n` olmadığını kontrol et.
    - Yerelde göster: `python -m http.server 5190 --bind 127.0.0.1` (repo kökünde) → `http://localhost:5190/<urun>/`.
      Tarayıcı konsolunda CSP hatası olmamalı. Birkaç dili ve Arapçayı (sağdan sola) aç. Açık ve koyu temayı kontrol et.
    - Sahibine göster. **"pushla" demeden commit ve push yok.**
11. **Yayın sonrası:** `https://fmjapps.com/<urun>/` ve bir yabancı dil sayfası açılıyor mu, konsolda hata var mı, `sitemap.xml`'de var mı kontrol et.

## 4. Dikkat edilecekler

- Kurumsal şablon sayfaların Türkçe kaynağını build de günceller (`hreflang` bloğu ve CSP özeti). Build'den sonra kaynakta
  beklenmeyen fark görürsen sebebi budur; geri alma.
- Mobil uygulama sayfaları (`_pages/content.cjs`) ile kurumsal ürün sayfaları farklı sistemdir. Mobil uygulama ekleniyorsa
  `APPS` listesi ve `_pages/lang` kullanılır; web ürünü/hizmet ekleniyorsa bu dokümandaki şablon yolu kullanılır.
- Ürün görseli, renkleri ve adı ana sayfadaki genel paletle uyumlu olmalı; mevcut renk değişkenlerini kullan, yeni sabit renk yazma.
