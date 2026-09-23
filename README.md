# Gizlilik Politikaları

Uygulamaların gizlilik politikalarının yayınlandığı depo. GitHub Pages ile
`https://fmjapps.github.io/privacy/` adresinde yayınlanır.

Her uygulama kendi klasöründe:

- `paydos/` → https://fmjapps.github.io/privacy/paydos/
- `prizma/` → https://fmjapps.github.io/privacy/prizma/

Yeni bir uygulama eklerken: yeni bir klasör açıp içine `index.html` koymak ve
kök dizindeki `index.html` listesine bir satır eklemek yeterli.

## Sayfa düzeni

Tüm politika sayfaları aynı şemayı kullanır. Stil tek yerde: kök dizindeki
`policy.css`. Yeni sayfa bunu `<link rel="stylesheet" href="../policy.css">`
ile bağlar, kendi içine CSS yazmaz.

Sayfa sırası: spektrum çizgisi → uygulama adı (eyebrow) → "Gizlilik Politikası"
→ son güncelleme tarihi → giriş paragrafı (`.lede`) → dört özet rozeti
(`.chip-row`) → numaralı maddeler → `English version below` ayracı → aynı
maddelerin İngilizcesi → footer.

Özet rozetleri hep aynı dört başlık: **Hesap verisi**, **Veriler**, **Reklam**,
**Satın alma**.

## Madde şeması

Maddeler her sayfada bu sırayla yer alır; uygulamada karşılığı olmayan madde
atlanır ve numaralar buna göre kayar (yani her sayfa 01'den başlayıp kesintisiz
devam eder).

| # | Madde | English |
|---|---|---|
| 1 | Topladığımız veriler | What we collect |
| 2 | İzinler ve ne için kullanılıyor | Permissions and what they're for |
| 3 | Reklamlar — Google AdMob | Ads — Google AdMob |
| 4 | Uygulama içi satın alma | In-app purchases |
| 5 | Liderlik tablosu — Google Play Games | Leaderboard — Google Play Games |
| 6 | Bildirimler | Notifications |
| 7 | Üçüncü taraflar | Third parties |
| 8 | Çocukların gizliliği | Children's privacy |
| 9 | Verilerin saklanması ve silinmesi | Data retention and deletion |
| 10 | Haklarınız | Your rights |
| 11 | Değişiklikler | Changes |
| 12 | İletişim | Contact |

"İzinler" maddesindeki liste uygulamanın `AndroidManifest.xml` dosyasıyla
birebir olmalı: her satırda iznin teknik adı (`.perm` rozeti) ve yalnızca ne
için kullanıldığı. Manifest'te olmayan bir izin yazılmaz, olan bir izin
atlanmaz.

Politika değiştiğinde sayfanın en üstündeki "son güncelleme" tarihi de
güncellenir (hem TR hem EN bölümünde).
