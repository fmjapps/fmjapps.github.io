// Uygulama sayfalarının içeriği. Her uygulamanın Türkçe ve İngilizce metni burada durur;
// sayfalar `node _pages/build.cjs` ile bu dosyadan üretilir.
// Metinlerdeki her bilgi mağaza sayfasına, gizlilik politikasına ya da uygulamanın kendisine dayanır.

const UI = {
  tr: {
    home: 'Ana sayfa', games: 'Oyunlar', apps: 'Uygulamalar', contact: 'İletişim',
    tagline: 'Sade, güvenilir oyunlar ve uygulamalar',
    theme: 'Temayı değiştir', langLabel: 'Dil', skip: 'İçeriğe geç',
    statusTest: 'Kapalı testte', statusSoon: 'Onay aşamasında · Çok yakında Google Play\'de', statusLive: 'Google Play\'de',
    download: 'Google Play\'den indir', liveTitle: 'Google Play\'de', liveLede: '{name} Google Play\'de yayında. Hemen indirip deneyebilirsin.',
    backSw: 'FMJ Software çözümlerine dön',
    join: 'Teste katıl', feedback: 'Geri bildirim yaz', privacy: 'Gizlilik politikası',
    shots: 'Ekran görüntüleri', features: 'Öne çıkanlar', info: 'Künye', faq: 'Sık sorulanlar',
    joinTitle: 'Kapalı teste katıl',
    joinLede: 'Üç adımda test kullanıcısı olursun. Her adımda Play Store\'da kullandığın Google hesabıyla giriş yapmış olman yeterli.',
    s1t: 'Test grubuna katıl', s1d: 'Açılan Google Grubu sayfasında "Gruba katıl"a bas.', s1b: 'Gruba git',
    s2t: 'Test kullanıcısı ol', s2d: 'Açılan Play sayfasında "Test kullanıcısı ol"a bas. Gruba yeni katıldıysan sayfanın hazır olması birkaç dakika sürebilir.', s2b: 'Test kullanıcısı ol',
    s3t: 'Google Play\'den indir', s3d: 'Uygulama artık Play Store\'da sana görünüyor. Yükle ve dene.', s3b: 'Play\'de aç',
    joinNote: 'Bir uygulamanın yayına çıkabilmesi için test kullanıcılarının onu en az 14 gün yüklü tutması gerekiyor. Bu süre boyunca silmezsen bize çok yardımcı olursun.',
    soonTitle: 'Çok yakında Google Play\'de',
    soonLede: '{name}, Google Play\'in yayın onayını bekliyor. Onay çıkınca indirme bağlantısı bu sayfada olacak. O zamana kadar aklına takılan her şeyi bize yazabilirsin.',
    others: 'FMJ Apps\'ten diğerleri', all: 'Hepsini gör',
    footTag: 'Android oyunları ve uygulamaları', footPrivacy: 'Gizlilik politikaları', footContact: 'İletişim',
    footPlay: 'Google Play geliştirici sayfası',
    android: 'Şimdilik yalnızca Android\'de, Google Play üzerinden. iOS sürümü yok.',
    game: 'Oyun', app: 'Uygulama', scroll: 'Aşağı kaydır', pages: 'Sayfalar',
    vd: 'Menemen VD', about: 'Hakkımızda', company: 'Şirket', kunye: 'Künye',
    slogan: 'Güvenilir çözümler, verimli sonuçlar',
    home: 'Ana sayfa'
  },
  en: {
    home: 'Home', games: 'Games', apps: 'Apps', contact: 'Contact',
    tagline: 'Simple, trustworthy games and apps',
    theme: 'Switch theme', langLabel: 'Language', skip: 'Skip to content',
    statusTest: 'In closed testing', statusSoon: 'In review · Coming soon to Google Play', statusLive: 'On Google Play',
    download: 'Get it on Google Play', liveTitle: 'Now on Google Play', liveLede: '{name} is live on Google Play. Download it and give it a try.',
    backSw: 'Back to FMJ Software solutions',
    join: 'Join the test', feedback: 'Send feedback', privacy: 'Privacy policy',
    shots: 'Screenshots', features: 'Highlights', info: 'At a glance', faq: 'Questions and answers',
    joinTitle: 'Join the closed test',
    joinLede: 'Three steps and you\'re a tester. Just stay signed in with the Google account you use on the Play Store.',
    s1t: 'Join the tester group', s1d: 'On the Google Group page that opens, tap "Join group".', s1b: 'Open the group',
    s2t: 'Become a tester', s2d: 'On the Play page that opens, tap "Become a tester". If you\'ve only just joined the group, the page may need a few minutes.', s2b: 'Become a tester',
    s3t: 'Download from Google Play', s3d: 'The app is now visible to you on the Play Store. Install it and give it a try.', s3b: 'Open in Play',
    joinNote: 'Before an app can go public, testers need to keep it installed for at least 14 days. If you keep it that long, you help us a lot.',
    soonTitle: 'Coming soon to Google Play',
    soonLede: '{name} is waiting for Google Play\'s release approval. The download link will appear on this page as soon as it is approved. Until then, write to us about anything.',
    others: 'More from FMJ Apps', all: 'See all',
    footTag: 'Games and apps for Android', footPrivacy: 'Privacy policies', footContact: 'Contact',
    footPlay: 'Google Play developer page',
    android: 'Android only for now, on Google Play. No iOS version.',
    game: 'Game', app: 'App', scroll: 'Scroll down', pages: 'Pages',
    vd: 'Menemen Tax Office', about: 'About us', company: 'Company', kunye: 'Imprint',
    slogan: 'Reliable solutions, efficient results',
    home: 'Home'
  }
};

const APPS = [
  /* ------------------------------------------------------------------ */
  {
    id: 'kayip', kind: 'game', acc: '#9CC98F', acc2: '#E9D9B4', status: 'test',
    privacy: '/privacy/kayip/', test: { group: 'kayip-esya-testers', pkg: 'com.oyunatolyesi.kayipesya' },
    shots: [[2, 0], [3, 1], [6, 2]],
    category: 'GameApplication',
    tr: {
      slug: 'kayip-esya-burosu', name: 'Kayıp Eşya Bürosu', short: 'Kayıp Eşya Bürosu', tag: 'Günlük çıkarım oyunu',
      title: 'Kayıp Eşya Bürosu · Günlük çıkarım oyunu (Android)',
      desc: 'Gardaki kayıp eşya bürosunda her gün altı ziyaretçi: eşyayı sahibine ver, sahtekârı yakala. Herkese aynı mesai, internetsiz oynanır.',
      lede: 'Merkez Gar\'ın kayıp eşya bürosunda tezgâhın arkasındasın, tezgâhın üstünde de ofisin kedisi Pamuk. Her gün kapıdan altı ziyaretçi girer: kimi gerçekten valizini arıyor, kimi panoda gördüğü eşyaya göz koymuş bir sahtekâr, kimi de dürüst ama eşyası henüz gelmemiş. Kimin kim olduğunu bulmak sana kalmış.',
      chips: ['Android', 'Ücretsiz', 'İnternetsiz oynanır', '9 dil'],
      howTitle: 'Nasıl oynanır?',
      how: [
        ['Dinle', 'Ziyaretçi eşyasını anlatır. Rafa bak, tutanağı aç: bulunduğu saat, ayırt edici işareti, içindekiler.'],
        ['Sor', 'Her ziyaretçiye en fazla üç soru sorabilirsin. İçinde ne vardı? Kimliğinizi görebilir miyim? Tam olarak ne zaman kaybettiniz?'],
        ['Karşılaştır', 'Sahtekârlar panodaki bilgileri bilir ama çantanın içinde ne olduğunu bilemez. Tek bir çelişki yeter.'],
        ['Karar ver', 'Teslim et, reddet ya da "burada değil" de. Doğru karar puan kazandırır, tahminle oynayan puan kaybeder.']
      ],
      alts: ['Ziyaretçiyle soru cevap ekranı', 'Raftaki eşyanın tutanağı', 'Süslenmiş ofis ve Pamuk'],
      feats: [
        ['Her gün yeni bir mesai', 'Pazartesi sakin başlar, Pazar büro tıklım tıklım olur. Bir mesai beş dakika sürer.'],
        ['Herkese aynı ziyaretçiler', 'Dünyadaki herkes aynı gün aynı ziyaretçileri karşılar. Sonucunu paylaş, kim daha dikkatli görelim.'],
        ['Tek bir doğru cevap', 'Her mesai kurallarla üretilir ve her ziyaretçinin tek bir doğru cevabı vardır. Şansa değil, dikkatine güven.'],
        ['Pamuk ve hediyeleri', 'Pamuk\'u sev, miyavlasın, mırlasın. Her mesaiden sonra garın bir köşesinden sana küçük bir hediye getirir.'],
        ['Kendi ofisin', 'Teşekkür notlarıyla ofisini süsle: saksı çiçeği, eski radyo, gar feneri, oyuncak tren ve daha fazlası.'],
        ['Hep bir hedef', 'Stajyerden Büro Müdürlüğüne beş rütbe, her gün yenilenen görevler, 20\'den fazla başarım, günlük seri ve seri kalkanı.'],
        ['30 günlük arşiv', 'Kaçırdığın günlerin mesaisini arşivden oynayabilirsin.'],
        ['Sakin bir köşe', 'Sakin müzik, sıcak bir ofis ve kısa oturumlar.']
      ],
      info: [
        ['Tür', 'Bulmaca · günlük çıkarım oyunu'],
        ['Platform', 'Android (Google Play)'],
        ['Fiyat', 'Ücretsiz. İsteğe bağlı mesai kartı paketleri var.'],
        ['Reklam', 'Yalnızca kendi isteğinle izlediğin ödüllü reklam. Araya giren reklam ya da banner yok.'],
        ['İnternet', 'Gerekmez'],
        ['Hesap', 'Gerekmez. İlerlemen telefonunda durur.'],
        ['Sıralama', 'Google Play Games ile, isteğe bağlı'],
        ['Diller', 'Türkçe, İngilizce, İspanyolca, Fransızca, Portekizce, Arapça, Hintçe, Bengalce, Çince']
      ],
      faq: [
        ['Kayıp Eşya Bürosu ücretsiz mi?', 'Evet, indirmesi ve oynaması ücretsiz. Günün mesaisi her gün herkese açık. Arşivdeki eski mesailer mesai kartıyla oynanır; her gün bedava kart gelir, daha fazlasını ödüllü reklam izleyerek ya da dükkândan alabilirsin.'],
        ['Oyunda reklam var mı?', 'Yalnızca sen istediğinde izlediğin ödüllü reklam var. Oyunun arasına giren reklam ya da ekranda duran banner yok.'],
        ['İnternet olmadan oynanır mı?', 'Evet. Mesai internet olmadan da oynanır.'],
        ['Satın alma sıralamada öne geçirir mi?', 'Hayır. Sıralama puanı yalnızca günün mesaisinden gelir; arşiv mesaileri ve satın almalar puana eklenmez.'],
        ['Yeni mesai ne zaman geliyor?', 'Mesai dünyanın her yerinde aynı anda, UTC gece yarısında yenilenir. Türkiye saatiyle 03.00.'],
        ['iOS sürümü var mı?', 'Şimdilik yok. Oyun yalnızca Android\'de, Google Play üzerinden yayınlanıyor.']
      ]
    },
    en: {
      slug: 'lost-and-found-office', name: 'Lost & Found Office', short: 'Lost & Found Office', tag: 'Daily deduction game',
      title: 'Lost & Found Office · A daily deduction game for Android',
      desc: 'Six visitors a day at a station lost and found: return items to their owners and catch the impostors. Same shift for everyone, plays offline.',
      lede: 'You\'re behind the counter of the Central Station lost and found office, and on top of it sits Pamuk, the office cat. Six visitors come through the door every day. Some really are looking for their suitcase, some are impostors who spotted an item on the notice board, and some are honest but their item simply hasn\'t turned up yet. Working out who\'s who is up to you.',
      chips: ['Android', 'Free', 'Plays offline', '9 languages'],
      howTitle: 'How to play',
      how: [
        ['Listen', 'Each visitor describes their item. Check the shelf and open the report: when it was found, its distinguishing mark, what\'s inside.'],
        ['Ask', 'You can ask each visitor up to three questions. What was inside? May I see your ID? When exactly did you lose it?'],
        ['Compare', 'Impostors know what\'s on the board, but they can\'t know what\'s inside the bag. One contradiction is enough.'],
        ['Decide', 'Hand it over, refuse, or say it isn\'t here. A right call earns points; guessing costs them.']
      ],
      alts: ['Questioning a visitor', 'The report for an item on the shelf', 'A decorated office with Pamuk the cat'],
      feats: [
        ['A new shift every day', 'Monday starts quiet; by Sunday the office is packed. A shift takes about five minutes.'],
        ['Same visitors for everyone', 'Everyone in the world meets the same visitors on the same day. Share your result and see who\'s sharper.'],
        ['Exactly one right answer', 'Every shift is generated by rules and every visitor has exactly one right answer. Trust your eye, not luck.'],
        ['Pamuk and her gifts', 'Pet Pamuk and she\'ll meow and purr. After every shift she brings you a little treasure from some corner of the station.'],
        ['An office of your own', 'Decorate your office with thank-you notes: a potted plant, an old radio, a station lamp, a toy train and more.'],
        ['Always something to chase', 'Five ranks from Intern to Office Director, fresh daily quests, 20+ achievements, and a daily streak with a streak shield.'],
        ['A 30-day archive', 'Missed a day? Play its shift from the archive.'],
        ['A calm corner', 'Calm music, a cosy office and short sessions.']
      ],
      info: [
        ['Genre', 'Puzzle · daily deduction game'],
        ['Platform', 'Android (Google Play)'],
        ['Price', 'Free. Optional shift card packs.'],
        ['Ads', 'Only rewarded ads you choose to watch. No interstitials, no banners.'],
        ['Internet', 'Not required'],
        ['Account', 'Not required. Your progress stays on your phone.'],
        ['Leaderboards', 'Through Google Play Games, optional'],
        ['Languages', 'English, Turkish, Spanish, French, Portuguese, Arabic, Hindi, Bengali, Chinese']
      ],
      faq: [
        ['Is Lost & Found Office free?', 'Yes, it\'s free to download and play. The daily shift is open to everyone every day. Older shifts in the archive are played with shift cards: you get free cards daily and can earn more by watching a rewarded ad or from the shop.'],
        ['Are there ads?', 'Only rewarded ads that you choose to watch. Nothing interrupts the game and there is no banner on screen.'],
        ['Does it work offline?', 'Yes. A shift plays without an internet connection.'],
        ['Do purchases help on the leaderboard?', 'No. The leaderboard score comes only from the daily shift; archive shifts and purchases add nothing to it.'],
        ['When does the new shift arrive?', 'The shift renews at the same moment everywhere: midnight UTC.'],
        ['Is there an iOS version?', 'Not for now. The game is available on Android only, through Google Play.']
      ]
    }
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'koleksiyoncu', kind: 'game', acc: '#E2B75E', acc2: '#8A5A2B', status: 'test',
    privacy: '/privacy/collector/', test: { group: 'the-collector-testers', pkg: 'com.fmjapps.collector' },
    shots: [[1, 0], [2, 1], [3, 2], [5, 3]],
    category: 'GameApplication',
    tr: {
      slug: 'koleksiyoner', name: 'Koleksiyoner', short: 'Koleksiyoner', tag: 'Antika dükkânı oyunu',
      title: 'Koleksiyoner · Antika dükkânı ve sahte avı oyunu (Android)',
      desc: 'Dedenden kalan antika dükkânında saatleri, sikkeleri ve tabloları incele, sahteyi yakala, pazarlık et ve on sekiz ustanın koleksiyonunu tamamla.',
      lede: 'Dedenin eski antika dükkânı artık senin. Çekmecede deri kaplı bir defter var ve ilk sayfasında dedenin yarım kalan hayali yazıyor: on sekiz büyük ustanın birer gerçek eserini tek bir vitrinde toplamak. Ama piyasa sahtelerle dolu.',
      chips: ['Android', 'Ücretsiz', 'İnternetsiz oynanır', '9 dil'],
      howTitle: 'Nasıl oynanır?',
      how: [
        ['İncele', 'Müşteriler cep saati, sikke ve tablo getirir. Eşyayı çevir; kadranına, arka kapağına, mekanizmasına bak. Büyüteci parmağınla gezdir.'],
        ['Kataloğa bak', 'Hangi usta hangi yıllarda çalıştı, hangi damgayı kullandı, hangi boya hangi yıldan önce yoktu? Kataloğu okuyan sahteciyi yakalar.'],
        ['Pazarlık et', 'Açgözlü, çaresiz ya da ne sattığını bilmeyen satıcılar… Doğru teklifi ver, gerçek bir hazineyi ucuza kap.'],
        ['Sat ya da sakla', 'Gerçek eserleri müzayedede sat ya da vitrine koy. Vitrin her gün ziyaretçi geliri getirir.']
      ],
      alts: ['Cep saatinin kadranı inceleniyor', 'Arka kapak büyüteç altında', 'Ustaların kataloğu', 'Dükkânın ana ekranı', 'Açılış hikâyesi'],
      feats: [
        ['Gerçekten incelersin', 'Seri numarası, damga ve yıl gibi küçük ayrıntılar gerçeği ele verir.'],
        ['Katalog senin kural kitabın', 'Her sahte, katalogdaki bir kuralı çiğner. Hangisini çiğnediğini bulmak sana kalır.'],
        ['Aletlerini topla', 'Terazi, kumpas, mihenk taşı, UV lamba ve pigment analizi. Her alet yeni bir sahtecilik türünü ortaya çıkarır.'],
        ['Saat işliyor', 'Aletler dükkân saatinden zaman yer. Akşam 18.00\'de kepenkler iner.'],
        ['On sekiz eserlik vitrin', 'On sekiz eserin hepsini topla ve dedenin hayalini gerçekleştir.'],
        ['Hep bir hedef', 'Çıraktan Efsane Eksper\'e beş rütbe, her rütbede yeni ustalar. Her gün yenilenen görevler ve 20\'den fazla başarım.'],
        ['Şans değil, dikkat', 'Her eşya kurallarla üretilir ve her sahte, elindeki aletlerle yakalanabilir.'],
        ['Kısa oturumlar', 'Bir dükkân günü 8–10 dakika sürer. Sakin müzik, sıcak bir atmosfer ve her gün yeni müşteriler.']
      ],
      info: [
        ['Tür', 'Bulmaca · antika ve rehin dükkânı oyunu'],
        ['Google Play\'deki adı', 'Koleksiyoncu: Antika Dedektifi'],
        ['Platform', 'Android (Google Play)'],
        ['Fiyat', 'Ücretsiz. İsteğe bağlı reklamsız paket ve anahtar paketleri var.'],
        ['Reklam', 'Yalnızca ekstra dükkân anahtarı için kendi isteğinle izlediğin ödüllü reklam. Geçiş reklamı ya da banner yok.'],
        ['İnternet', 'Gerekmez'],
        ['Hesap', 'Gerekmez. İlerlemen telefonunda durur.'],
        ['Sıralama ve başarımlar', 'Google Play Games ile'],
        ['Diller', 'Türkçe, İngilizce, İspanyolca, Fransızca, Portekizce, Arapça, Hintçe, Bengalce, Çince']
      ],
      faq: [
        ['Koleksiyoner ücretsiz mi?', 'Evet, indirmesi ve oynaması ücretsiz. İsteğe bağlı satın almalar var: kalıcı reklamsız paket ve tek kullanımlık anahtar paketleri.'],
        ['Oyunda reklam var mı?', 'Yalnızca ekstra dükkân anahtarı almak için izlemeyi seçtiğin ödüllü reklam var. Bunun dışında geçiş reklamı ya da banner yok. Reklamsız paketi alanlar anahtarı reklam izlemeden alır.'],
        ['Google Play\'de hangi adla geçiyor?', 'Mağazadaki adı "Koleksiyoncu: Antika Dedektifi". İngilizce adı "The Collector: Real or Fake".'],
        ['İnternet olmadan oynanır mı?', 'Evet, oyunun kendisi internetsiz oynanır.'],
        ['Sahteyi bulmak şansa mı kalıyor?', 'Hayır. Her eşya kurallarla üretilir ve her sahte, elindeki aletlerle yakalanabilir.'],
        ['iOS sürümü var mı?', 'Şimdilik yok. Oyun yalnızca Android\'de, Google Play üzerinden yayınlanıyor.']
      ]
    },
    en: {
      slug: 'the-collector', name: 'The Collector: Real or Fake', short: 'The Collector', tag: 'Antique shop detective game',
      title: 'The Collector: Real or Fake · Antique shop detective game for Android',
      desc: 'Run your grandfather\'s antique shop: inspect watches, coins and paintings, spot the fakes, haggle, and complete a collection of eighteen masters.',
      lede: 'Your grandfather\'s old antique shop is yours now. In a drawer lies a leather-bound notebook, and on its first page is his unfinished dream: to gather one genuine work by eighteen great masters in a single showcase. But the market is full of fakes.',
      chips: ['Android', 'Free', 'Plays offline', '9 languages'],
      howTitle: 'How to play',
      how: [
        ['Inspect', 'Customers bring pocket watches, coins and paintings. Turn each item over: check the dial, the case back, the movement. Slide the loupe with your finger.'],
        ['Check the catalogue', 'Which maker worked in which years? Which hallmark did they use? Which pigment didn\'t exist yet? Read the catalogue and you\'ll catch the forger.'],
        ['Haggle', 'Greedy, desperate, or clueless sellers… Make the right offer and snap up a real treasure for pennies.'],
        ['Sell or keep', 'Sell genuine pieces at auction or keep them in your showcase, where they earn visitor income every day.']
      ],
      alts: ['Inspecting the dial of a pocket watch', 'The case back under the loupe', 'The catalogue of makers', 'The shop\'s home screen', 'The opening story'],
      feats: [
        ['Really inspect', 'Tiny details like serial numbers, hallmarks and dates give the truth away.'],
        ['The catalogue is your rulebook', 'Every fake breaks a rule in the catalogue. Finding which one is up to you.'],
        ['Build your toolkit', 'Scale, caliper, touchstone, UV lamp and pigment test. Each tool exposes a new kind of forgery.'],
        ['The clock is ticking', 'Every tool costs shop time. At 6 pm the shutters come down.'],
        ['A showcase of eighteen', 'Gather all eighteen works and fulfil your grandfather\'s dream.'],
        ['Always something to chase', 'Five ranks from Apprentice to Legendary Appraiser, with new makers at every rank. Fresh daily tasks and 20+ achievements.'],
        ['Your eye, not luck', 'Every item is generated from rules, and every fake can be caught with the tools you have.'],
        ['Short sessions', 'A shop day takes 8–10 minutes. Calm music, a warm atmosphere and new customers every day.']
      ],
      info: [
        ['Genre', 'Puzzle · antique and pawn shop game'],
        ['Platform', 'Android (Google Play)'],
        ['Price', 'Free. Optional ad-free pack and key packs.'],
        ['Ads', 'Only rewarded ads you choose to watch for an extra shop key. No interstitials, no banners.'],
        ['Internet', 'Not required'],
        ['Account', 'Not required. Your progress stays on your phone.'],
        ['Leaderboard and achievements', 'Through Google Play Games'],
        ['Languages', 'English, Turkish, Spanish, French, Portuguese, Arabic, Hindi, Bengali, Chinese']
      ],
      faq: [
        ['Is The Collector free?', 'Yes, it\'s free to download and play. There are optional purchases: a permanent ad-free pack and single-use key packs.'],
        ['Are there ads?', 'Only rewarded ads that you choose to watch for an extra shop key. There are no interstitials and no banners. With the ad-free pack you get the key without watching an ad.'],
        ['Does it work offline?', 'Yes, the game itself plays offline.'],
        ['Is spotting a fake down to luck?', 'No. Every item is generated from rules, and every fake can be caught with the tools you have.'],
        ['Is there an iOS version?', 'Not for now. The game is available on Android only, through Google Play.']
      ]
    }
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'prizma', kind: 'game', acc: '#3EF0C8', acc2: '#7B6CFF', status: 'live',
    privacy: '/privacy/prizma/', test: { group: 'prizma-test', pkg: 'com.fmjapps.prizma' },
    shots: [[1, 0], [3, 1], [2, 2], [4, 3], [6, 4], [7, 5]],
    category: 'GameApplication',
    tr: {
      slug: 'prizma', name: 'Prizma', short: 'Prizma', tag: 'Işık ve ayna bulmacası',
      title: 'Prizma · Işık ve ayna bulmaca oyunu (Android)',
      desc: 'Aynaları yerleştir, ışını hedeflere ulaştır. 60 bölüm, herkese aynı günlük bulmaca ve her seferinde yeni üretilen sonsuz bulmacalar.',
      lede: 'Prizma, ışın ve aynalarla çözülen bir bulmaca oyunu. Her bölümde ışık kaynaklarını, yerleştirdiğin aynalarla doğru hedeflere yönlendirirsin. İlerledikçe ışını ikiye bölen prizma blokları ve ışını başka bir noktaya taşıyan portallar devreye girer.',
      chips: ['Android', 'Ücretsiz', '60 bölüm', '9 dil'],
      howTitle: 'Nasıl oynanır?',
      how: [
        ['Aynayı yerleştir', 'Her ayna ışını 90 derece döndürür. Doğru kareye koy, ışın yolunu bulsun.'],
        ['Işını böl, taşı', 'Prizma bloğu ışını ikiye böler, tek ışınla iki hedefi birden beslersin. Portallar ışını başka bir noktaya taşır.'],
        ['Hedefleri yak', 'Bütün hedeflere ışın ulaşınca bölüm çözülür. Beyaz hedef varsa bütün kaynakların ışığı orada birleşmeli.'],
        ['Takılırsan', 'Geri al ile son hamleni geri çevir ya da ipucu iste: sıradaki aynayı senin yerine yerleştirir.']
      ],
      alts: ['Aynalarla hedefe taşınan ışın', 'Işını bölen prizma bloğu', 'Portallı bir bölüm', 'Usta seviyesinde bir bulmaca', '60 bölümlük liste', 'Ana menü'],
      feats: [
        ['60 bölüm', 'Tek aynadan prizma ve portallara, kademeli olarak zorlaşan bölümler. Her bölümde ayna sayın sınırlı.'],
        ['Günlük bulmaca', 'Her gün herkese aynı bulmaca. Üst üste çözdükçe serin uzar.'],
        ['Sonsuz bulmaca', 'Kolay, Orta, Zor ve Usta seviyelerinde her seferinde yeniden üretilen bulmacalar.'],
        ['Kör mod', 'Zor ve Usta\'da yolu önce kurar, ışını sonra çalıştırırsın.'],
        ['Sıralama ve başarımlar', 'Google Play Games ile puanını diğer oyuncularla karşılaştır.'],
        ['Renk körlüğü modu', 'Renkleri ayırt etmek zor geliyorsa ayarlardan açabilirsin.'],
        ['Senin ayarın', 'Müzik, ses efektleri ve titreşim ayrı ayrı açılıp kapanır.'],
        ['Karanlık, neon bir dünya', 'Koyu zemin üstünde parlayan ışınlar; müzik ve sesler oyunun içinde üretilir.']
      ],
      info: [
        ['Tür', 'Bulmaca'],
        ['Platform', 'Android (Google Play)'],
        ['Fiyat', 'Ücretsiz. Bulmaca hakkı sınırını kaldıran tek seferlik bir satın alma var.'],
        ['Reklam', 'Oyun ekranında bir banner ve kendi isteğinle izlediğin ödüllü reklamlar (ek bulmaca hakkı ya da ipucu için).'],
        ['Hesap', 'Gerekmez. İlerlemen telefonunda durur.'],
        ['Sıralama', 'Google Play Games ile, isteğe bağlı'],
        ['Diller', 'Türkçe, İngilizce, İspanyolca, Fransızca, Portekizce, Rusça, Arapça, Hintçe, Çince']
      ],
      faq: [
        ['Prizma ücretsiz mi?', 'Evet, indirmesi ve oynaması ücretsiz. Günlük bir bulmaca hakkı sınırı var; ödüllü reklam izleyerek ek hak alabilir ya da tek seferlik satın almayla sınırı tamamen kaldırabilirsin.'],
        ['Oyunda reklam var mı?', 'Oyun ekranında bir banner var. Ödüllü reklamlar ise yalnızca sen istediğinde, ek bulmaca hakkı ya da ipucu karşılığında açılır.'],
        ['Hesap açmam gerekiyor mu?', 'Hayır. Sıralamaya girmek istersen Google Play Games\'e giriş yapman yeterli; giriş yapmadan da oyunun tamamı oynanır.'],
        ['Nereden indirebilirim?', 'Prizma Google Play\'de yayında. Bu sayfadaki bağlantıdan ücretsiz indirebilirsin.'],
        ['iOS sürümü var mı?', 'Şimdilik yok. Oyun yalnızca Android\'de, Google Play üzerinden yayında.']
      ]
    },
    en: {
      slug: 'prizma', name: 'Prizma', short: 'Prizma', tag: 'Light and mirror puzzle',
      title: 'Prizma · A light and mirror puzzle game for Android',
      desc: 'Place mirrors and guide the beam to its targets. 60 levels, a daily puzzle shared by everyone, and endless freshly generated puzzles.',
      lede: 'Prizma is a puzzle game solved with beams of light and mirrors. In every level you steer the light sources to the right targets with the mirrors you place. Further in, prism blocks split the beam in two and portals carry it to another spot.',
      chips: ['Android', 'Free', '60 levels', '9 languages'],
      howTitle: 'How to play',
      how: [
        ['Place a mirror', 'Each mirror turns the beam 90 degrees. Put it on the right square and the beam finds its way.'],
        ['Split it, carry it', 'A prism block splits the beam in two, so one beam can feed two targets. Portals carry the beam somewhere else.'],
        ['Light the targets', 'The level is solved when the beam reaches every target. If there is a white target, light from all sources has to meet there.'],
        ['If you get stuck', 'Undo your last move, or ask for a hint: it places the next mirror for you.']
      ],
      alts: ['A beam guided to its target by mirrors', 'A prism block splitting the beam', 'A level with portals', 'A Master level puzzle', 'The list of 60 levels', 'Main menu'],
      feats: [
        ['60 levels', 'From a single mirror to prisms and portals, getting harder step by step. Each level limits how many mirrors you get.'],
        ['Daily puzzle', 'The same puzzle for everyone, every day. Keep solving and your streak grows.'],
        ['Endless puzzles', 'Freshly generated puzzles on Easy, Medium, Hard and Master.'],
        ['Blind mode', 'On Hard and Master you set up the path first, then fire the beam.'],
        ['Leaderboard and achievements', 'Compare your score with other players through Google Play Games.'],
        ['Colour-blind mode', 'If the colours are hard to tell apart, switch it on in settings.'],
        ['Your settings', 'Music, sound effects and vibration each have their own switch.'],
        ['A dark, neon world', 'Glowing beams on a dark board; the music and sounds are generated inside the game.']
      ],
      info: [
        ['Genre', 'Puzzle'],
        ['Platform', 'Android (Google Play)'],
        ['Price', 'Free. A one-time purchase removes the puzzle credit limit.'],
        ['Ads', 'A banner on the game screen, plus rewarded ads you choose to watch (for extra puzzle credits or a hint).'],
        ['Account', 'Not required. Your progress stays on your phone.'],
        ['Leaderboard', 'Through Google Play Games, optional'],
        ['Languages', 'English, Turkish, Spanish, French, Portuguese, Russian, Arabic, Hindi, Chinese']
      ],
      faq: [
        ['Is Prizma free?', 'Yes, it\'s free to download and play. There is a daily limit on puzzle credits; you can earn more by watching a rewarded ad, or remove the limit for good with a one-time purchase.'],
        ['Are there ads?', 'There is a banner on the game screen. Rewarded ads open only when you choose, in exchange for extra puzzle credits or a hint.'],
        ['Do I need an account?', 'No. If you want to appear on the leaderboard, signing in to Google Play Games is enough; the whole game is playable without it.'],
        ['Where can I download it?', 'Prizma is live on Google Play. You can download it for free from the link on this page.'],
        ['Is there an iOS version?', 'Not for now. The game is available on Android only, through Google Play.']
      ]
    }
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'ezber', kind: 'app', acc: '#2FC4A8', status: 'test',
    privacy: '/privacy/ezber/', test: { group: 'memorize-testers', pkg: 'com.fmjapps.ezberasistani' },
    shots: [[1, 0], [2, 1], [3, 2]],
    category: 'EducationalApplication',
    tr: {
      slug: 'ezber', name: 'Ezber: Replik, Sunum, Şiir', short: 'Ezber', tag: 'Eller serbest ezber asistanı',
      title: 'Ezber · Replik, şiir ve sunum ezberleme uygulaması (Android)',
      desc: 'Metnini sana okur, sıra sana gelince dinler, takıldığında suflörlük yapar. Replik, şiir ve sunumları telefona dokunmadan ezberle.',
      lede: 'Tiyatro repliği, 23 Nisan şiiri, okul gösterisi, konuşma ya da sunum… Ezber metnini sana okur, sıra sana gelince dinler ve takıldığında suflör gibi yardım eder. Telefona dokunmadan, yürürken ya da yolculukta çalışabilirsin.',
      chips: ['Android', 'Hesap yok', 'Reklam yok', '10 dil'],
      howTitle: 'Nasıl çalışır?',
      how: [
        ['Metnini ekle', 'Yapıştır ya da TXT, PDF, Word dosyasından veya fotoğraftan aktar. Karakterler ve replikler kendiliğinden ayrılır.'],
        ['Karakterini seç', 'Hangi karakter olduğunu seç; diğer karakterler farklı seslerle okunur.'],
        ['Provaya başla', 'Sıra sana gelince uygulama dinler; repliğini söyleyip susunca devam eder.'],
        ['Takılırsan', 'Suflör önce ilk kelimeleri fısıldar, gerekirse repliğin tamamını okur.']
      ],
      alts: ['Prova ekranı: replikler sırayla okunuyor', 'Karakter ve ses seçimi', 'Prova modları'],
      feats: [
        ['Eller serbest prova', 'Telefona dokunmadan çalışırsın: uygulama okur, dinler, sen susunca devam eder.'],
        ['Her kaynaktan metin', 'TXT, PDF, Word ya da fotoğraf. Emin olunamayan satırlar işaretlenir, tek dokunuşla düzeltilir.'],
        ['Şiir için üst üste ekleme', 'Önce 1. dize, sonra 1–2, sonra 1–3… Şiir parça parça yerine oturur.'],
        ['Kademeli silme', 'Her hatasız turda daha fazla kelime gizlenir.'],
        ['Zorlandığın satırlar', 'Takıldığın satırları hatırlar, istersen yalnızca onları çalıştırır.'],
        ['Sunum provası', 'Süre sayacı, hedef süre ve konuşma hızı (kelime/dakika). Anahtar kelime ipuçlarıyla metne bağlı kalmadan akışı ezberlersin.'],
        ['Metinlerin sende kalır', 'Metinlerin telefonunda durur. Provada sesin kaydedilmez; telefonda anlık işlenir ve hiçbir yere gönderilmez.'],
        ['10 dil', 'Türkçe, İngilizce, Almanca, Fransızca, İspanyolca, Portekizce, Rusça, İtalyanca, Arapça ve Endonezce.']
      ],
      info: [
        ['Tür', 'Eğitim · ezber ve prova'],
        ['Google Play\'deki adı', 'Ezber: Replik, Sunum, Şiir'],
        ['Platform', 'Android (Google Play)'],
        ['Fiyat', 'Ücretsiz. İsteğe bağlı Pro aboneliği Google Play üzerinden alınır.'],
        ['Reklam', 'Yok'],
        ['Hesap', 'Gerekmez'],
        ['Mikrofon', 'Yalnızca sıra sana geldiğinde açılır. Ses telefonda işlenir, kaydedilmez ve gönderilmez.'],
        ['Diller', 'Türkçe, İngilizce, Almanca, Fransızca, İspanyolca, Portekizce, Rusça, İtalyanca, Arapça, Endonezce']
      ],
      faq: [
        ['Ezber nelerde işe yarar?', 'Tiyatro replikleri, şiirler, okul gösterileri, konuşmalar ve sunumlar için. Her biri için ayrı çalışma yolu var: karakterli prova, üst üste ekleme, kademeli silme ve süre tutan sunum provası.'],
        ['Sesim kaydediliyor mu?', 'Provada hayır. Mikrofon yalnızca sıra sana geldiğinde açılır; ses telefonda anlık işlenir, bir dosyaya yazılmaz ve hiçbir yere gönderilmez. Replikleri kendi sesinle kaydetmek istersen bunu ayrıca, "Sesle kaydet" özelliğiyle sen başlatırsın; o kayıtlar da yalnızca telefonunda durur.'],
        ['Metinlerim bir yere gönderiliyor mu?', 'Hayır. Metinlerin, ayarların ve çalışma geçmişin yalnızca telefonunda saklanır.'],
        ['Reklam var mı?', 'Hayır. Uygulamada reklam yok, hesap açman da gerekmiyor.'],
        ['Hangi dosyalardan metin alabilirim?', 'TXT, PDF ve Word dosyalarından ya da bir fotoğraftan. İstersen metni doğrudan yapıştırabilirsin.'],
        ['iOS sürümü var mı?', 'Şimdilik yok. Uygulama yalnızca Android\'de, Google Play üzerinden yayınlanıyor.']
      ]
    },
    en: {
      slug: 'memorize', name: 'Memorize: Lines, Speech, Poems', short: 'Memorize', tag: 'Hands-free memorization',
      title: 'Memorize · Learn lines, poems and speeches hands-free (Android)',
      desc: 'It reads your text to you, listens when it\'s your turn and prompts you when you get stuck. Learn lines, poems and presentations without touching your phone.',
      lede: 'Play lines, a poem for school, a speech or a presentation… Memorize reads your text to you, listens when it\'s your turn and prompts you like a stage prompter when you get stuck. Practise without touching your phone, while walking or commuting.',
      chips: ['Android', 'No account', 'No ads', '10 languages'],
      howTitle: 'How it works',
      how: [
        ['Add your text', 'Paste it, or import it from TXT, PDF, Word or a photo. Characters and lines are split automatically.'],
        ['Choose your character', 'Pick who you are; the other characters are read in different voices.'],
        ['Start rehearsing', 'When it\'s your turn the app listens; say your line and it carries on when you stop.'],
        ['If you get stuck', 'The prompter whispers the first words, then the whole line if needed.']
      ],
      alts: ['Rehearsal screen with lines read in turn', 'Choosing characters and voices', 'Rehearsal modes'],
      feats: [
        ['Hands-free rehearsal', 'No need to touch your phone: the app reads, listens, and carries on when you stop speaking.'],
        ['Text from anywhere', 'TXT, PDF, Word or a photo. Unclear lines are flagged and fixed with one tap.'],
        ['Build up a poem', 'Line 1, then 1–2, then 1–3… The poem settles in piece by piece.'],
        ['Progressive hiding', 'More words disappear after every perfect round.'],
        ['The lines you struggle with', 'It remembers where you stumble and lets you practise just those lines.'],
        ['Presentation practice', 'Timer, target time and speaking pace (words per minute). Key-word hints help you learn the flow instead of reading word by word.'],
        ['Your texts stay with you', 'Your texts stay on your phone. Your voice is not recorded during rehearsal; it is processed on the phone and never sent anywhere.'],
        ['10 languages', 'English, Turkish, German, French, Spanish, Portuguese, Russian, Italian, Arabic and Indonesian.']
      ],
      info: [
        ['Category', 'Education · memorization and rehearsal'],
        ['Platform', 'Android (Google Play)'],
        ['Price', 'Free. An optional Pro subscription is available through Google Play.'],
        ['Ads', 'None'],
        ['Account', 'Not required'],
        ['Microphone', 'On only when it\'s your turn. Audio is processed on the phone, never recorded or sent.'],
        ['Languages', 'English, Turkish, German, French, Spanish, Portuguese, Russian, Italian, Arabic, Indonesian']
      ],
      faq: [
        ['What is Memorize good for?', 'Play lines, poems, school performances, speeches and presentations. Each has its own way of practising: rehearsal with characters, build-up, progressive hiding, and timed presentation practice.'],
        ['Is my voice recorded?', 'Not during rehearsal. The microphone is on only when it\'s your turn; audio is processed on the phone in real time, not written to a file and not sent anywhere. If you want to record lines in your own voice, you start that yourself with "Record voices", and those recordings also stay only on your phone.'],
        ['Are my texts sent anywhere?', 'No. Your texts, settings and practice history are stored only on your phone.'],
        ['Are there ads?', 'No. The app has no ads and needs no account.'],
        ['Which files can I import?', 'TXT, PDF and Word files, or a photo. You can also simply paste your text.'],
        ['Is there an iOS version?', 'Not for now. The app is available on Android only, through Google Play.']
      ]
    }
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'paydos', kind: 'app', acc: '#6E8BFF', status: 'soon',
    privacy: '/privacy/paydos/', test: { group: 'paydos-test', pkg: 'com.zamankilidi.app' },
    shots: [[1, 1], [2, 2], [4, 3], [5, 4]],
    category: 'UtilitiesApplication',
    tr: {
      slug: 'paydos', name: 'Paydos', short: 'Paydos', tag: 'Çocuk ekran kilidi',
      title: 'Paydos · Çocuklar için ekran süresi kilidi (Android)',
      desc: 'Süreyi ve izin verdiğin uygulamaları seç, telefonu çocuğuna ver. Süre dolunca ekran kilitlenir ve yalnızca senin PIN\'inle açılır.',
      lede: 'Paydos, telefonu çocuğuna belirli bir süreliğine ve yalnızca senin seçtiğin uygulamalarla vermeni sağlar. Süre dolduğunda ya da çocuk izin verilmeyen bir uygulamayı açmaya çalıştığında tam ekran bir kilit devreye girer ve yalnızca senin belirlediğin PIN ile kapanır.',
      chips: ['Android', 'Tamamen ücretsiz', 'Hesap yok', '9 dil'],
      howTitle: 'Nasıl çalışır?',
      how: [
        ['Süreyi seç', '15 dakika, 30 dakika, 1 saat ya da kendi belirlediğin bir süre.'],
        ['Uygulamaları işaretle', 'Bu süre boyunca hangi uygulamalara izin verdiğini seç. Her seferinde farklı uygulamalara izin verebilirsin.'],
        ['Telefonu ver', 'Çocuğun kalan süreyi ve açabileceği uygulamaları görür.'],
        ['Süre dolunca', 'Tam ekran kilit gelir. Geri tuşuyla ya da uygulamayı kapatıp açarak atlatılamaz; yalnızca senin PIN\'inle kapanır.']
      ],
      alts: ['Süre ve PIN ayarları', 'İzin verilen uygulamalar listesi', 'Kilit ekranı ve izinli uygulamalar', 'Süre dolduğunda kilit ekranı', 'Erişilebilirlik izni açıklaması'],
      feats: [
        ['Tek ekranda kurulum', 'Süreyi seç, uygulamaları işaretle, kilidi başlat.'],
        ['Yalnızca izin verdiklerin', 'Çocuk izin verilmeyen bir uygulamayı açmaya çalıştığında kilit ekranı gelir.'],
        ['Kolay bulunan liste', 'Uygulama listesini son kullanılana, en çok kullanılana ya da alfabeye göre sıralayabilirsin.'],
        ['PIN\'i unutursan', 'Kurtarma sorusu var. Ayrıca telefonu yeniden başlatmak kilidi her zaman kaldırır; telefon kilitli kalmaz.'],
        ['Hiçbir şey telefondan çıkmaz', 'Süre, uygulama listesi ve PIN yalnızca telefonunda saklanır. PIN düz metin olarak tutulmaz.'],
        ['Ne gördüğü belli', 'Paydos yalnızca o an açık olan uygulamanın adını görür. Ekrandaki yazıları, fotoğrafları ya da girdiğin bilgileri okumaz.'],
        ['Hesap yok', 'Kayıt olmak, e-posta vermek ya da giriş yapmak gerekmez.'],
        ['9 dil', 'Türkçe, İngilizce, İspanyolca, Fransızca, Rusça, Portekizce, Endonezce, Hintçe ve Arapça.']
      ],
      info: [
        ['Tür', 'Araç · ebeveyn denetimi'],
        ['Google Play\'deki adı', 'Paydos - Çocuk Ekran Kilidi'],
        ['Platform', 'Android (Google Play)'],
        ['Fiyat', 'Tamamen ücretsiz. Uygulama içi satın alma yok.'],
        ['Reklam', 'Var, yalnızca ebeveyne: kurulum ekranında, PIN girerken ve kilit kaldırıldığında. Çocuğun gördüğü "süre doldu" ekranında reklam gösterilmez.'],
        ['Hesap', 'Gerekmez'],
        ['Veriler', 'Süre, uygulama listesi ve PIN yalnızca telefonda'],
        ['Diller', 'Türkçe, İngilizce, İspanyolca, Fransızca, Rusça, Portekizce, Endonezce, Hintçe, Arapça']
      ],
      faq: [
        ['Paydos ücretsiz mi?', 'Evet, tamamen ücretsiz; uygulama içi satın alma yok. Uygulamada yalnızca ebeveyne gösterilen reklamlar var.'],
        ['Çocuğum reklam görür mü?', 'Çocuğun süre dolduğunda gördüğü ekranda reklam gösterilmez. Reklamlar ebeveynin kilidi kurduğu ekranda, PIN girilirken ve kilit kaldırıldığında çıkar.'],
        ['PIN\'imi unutursam ne olur?', 'Kurarken belirlediğin kurtarma sorusunu yanıtlayabilirsin. O da olmazsa telefonu yeniden başlatman yeter: yeniden başlatma kilidi her zaman kaldırır.'],
        ['Paydos neden Erişilebilirlik izni istiyor?', 'Süre işlerken hangi uygulamanın açık olduğunu görebilmek için. Yalnızca açık olan uygulamanın adına bakar; ekran içeriğini okumaz, kaydetmez, hiçbir yere göndermez.'],
        ['Çocuğumla ilgili veri toplanıyor mu?', 'Hayır. Paydos çocuktan da ebeveynden de kişisel veri toplamaz, hesap oluşturmaz. Ayarların yalnızca telefonunda durur.'],
        ['Ne zaman yayınlanacak?', 'Paydos, Google Play\'in yayın onayını bekliyor. Onay çıkınca indirme bağlantısı bu sayfada olacak.']
      ]
    },
    en: {
      slug: 'paydos', name: 'Paydos', short: 'Paydos', tag: 'Screen time lock for kids',
      title: 'Paydos · A screen time lock for kids (Android)',
      desc: 'Pick the time and the apps you allow, then hand over the phone. When time is up the screen locks and only your PIN opens it.',
      lede: 'Paydos lets you lend your phone to your child for a set time, with only the apps you choose. When the time is up, or your child tries to open an app that isn\'t allowed, a full-screen lock appears and only the PIN you set can close it.',
      chips: ['Android', 'Completely free', 'No account', '9 languages'],
      howTitle: 'How it works',
      how: [
        ['Pick the time', '15 minutes, 30 minutes, 1 hour, or a time of your own.'],
        ['Tick the apps', 'Choose which apps are allowed during that time. You can allow different apps every time.'],
        ['Hand over the phone', 'Your child can see the time left and the apps they may open.'],
        ['When time is up', 'A full-screen lock appears. It can\'t be dodged with the back button or by reopening the app; only your PIN closes it.']
      ],
      alts: ['Time and PIN settings', 'The list of allowed apps', 'Lock screen with the allowed apps', 'Lock screen when time is up', 'Explanation of the accessibility permission'],
      feats: [
        ['Set up on one screen', 'Pick the time, tick the apps, start the lock.'],
        ['Only what you allow', 'If your child tries to open an app that isn\'t allowed, the lock screen appears.'],
        ['An easy list', 'Sort the app list by recently used, most used, or alphabetically.'],
        ['If you forget the PIN', 'There is a recovery question. And restarting the phone always removes the lock, so the phone never stays locked.'],
        ['Nothing leaves the phone', 'The time, the app list and the PIN are stored only on your phone. The PIN is never kept as plain text.'],
        ['Clear about what it sees', 'Paydos sees only the name of the app that is open. It doesn\'t read text, photos or anything you type.'],
        ['No account', 'No sign-up, no email, no login.'],
        ['9 languages', 'English, Turkish, Spanish, French, Russian, Portuguese, Indonesian, Hindi and Arabic.']
      ],
      info: [
        ['Category', 'Tools · parental control'],
        ['Platform', 'Android (Google Play)'],
        ['Price', 'Completely free. No in-app purchases.'],
        ['Ads', 'Yes, shown only to the parent: on the setup screen, when entering the PIN and after unlocking. The "time is up" screen your child sees has no ads.'],
        ['Account', 'Not required'],
        ['Data', 'The time, app list and PIN stay on the phone'],
        ['Languages', 'English, Turkish, Spanish, French, Russian, Portuguese, Indonesian, Hindi, Arabic']
      ],
      faq: [
        ['Is Paydos free?', 'Yes, completely free, with no in-app purchases. The app shows ads, but only to the parent.'],
        ['Will my child see ads?', 'The screen your child sees when time is up has no ads. Ads appear on the screen where the parent sets up the lock, when the PIN is being entered and after the lock is removed.'],
        ['What if I forget my PIN?', 'You can answer the recovery question you chose during setup. If that fails too, just restart the phone: a restart always removes the lock.'],
        ['Why does Paydos ask for the accessibility permission?', 'To see which app is open while the timer is running. It looks only at the name of the open app; it never reads, stores or sends what is on screen.'],
        ['Is any data collected about my child?', 'No. Paydos collects no personal data from the child or the parent and creates no account. Your settings stay on your phone.'],
        ['When will it be released?', 'Paydos is waiting for Google Play\'s release approval. The download link will appear on this page once it is approved.']
      ]
    }
  }
];

module.exports = { UI, APPS };
