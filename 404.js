/* 404 sayfası: dili adresin ilk bölümünden (/en/, /de/...) bulur; kökte ya da bilinmeyen adreste
   tarayıcının dilini, o da sitede yoksa Türkçeyi kullanır. Metinleri ve bağlantıları o dile çevirir.
   CSP satır içi betiğe izin vermediği için ayrı dosyadadır. */
(function () {
  'use strict';
  var d = document.documentElement;

  var T = {
    tr: { title: 'Sayfa bulunamadı', err: 'Hata 404', h1a: 'Sayfa ', h1b: 'bulunamadı.', lede: 'Aradığınız sayfa taşınmış, silinmiş ya da adres yanlış yazılmış olabilir. Aşağıdaki bağlantılardan devam edebilirsiniz.', home: 'Ana sayfa', qr: 'QR Menü', web: 'Web Sitesi', contact: 'İletişim', tagline: 'Güvenilir çözümler, verimli sonuçlar', skip: 'İçeriğe geç', sections: 'Bölümler' },
    en: { title: 'Page not found', err: 'Error 404', h1a: 'Page ', h1b: 'not found.', lede: 'The page you are looking for may have been moved or deleted, or the address may be mistyped. You can continue with the links below.', home: 'Home', qr: 'QR Menu', web: 'Website', contact: 'Contact', tagline: 'Reliable solutions, efficient results', skip: 'Skip to content', sections: 'Sections' },
    es: { title: 'Página no encontrada', err: 'Error 404', h1a: 'Página ', h1b: 'no encontrada.', lede: 'Es posible que la página que busca se haya movido o eliminado, o que la dirección esté mal escrita. Puede continuar con los enlaces de abajo.', home: 'Inicio', qr: 'QR Menu', web: 'Sitio web', contact: 'Contacto', tagline: 'Soluciones fiables, resultados eficientes', skip: 'Ir al contenido', sections: 'Secciones' },
    pt: { title: 'Página não encontrada', err: 'Erro 404', h1a: 'Página ', h1b: 'não encontrada.', lede: 'A página que você procura pode ter sido movida ou excluída, ou o endereço pode estar incorreto. Continue pelos links abaixo.', home: 'Início', qr: 'QR Menu', web: 'Site', contact: 'Contato', tagline: 'Soluções confiáveis, resultados eficientes', skip: 'Pular para o conteúdo', sections: 'Seções' },
    fr: { title: 'Page introuvable', err: 'Erreur 404', h1a: 'Page ', h1b: 'introuvable.', lede: 'La page que vous cherchez a peut-être été déplacée ou supprimée, ou l’adresse est mal saisie. Vous pouvez continuer avec les liens ci-dessous.', home: 'Accueil', qr: 'QR Menu', web: 'Site web', contact: 'Contact', tagline: 'Des solutions fiables, des résultats efficaces', skip: 'Aller au contenu', sections: 'Sections' },
    de: { title: 'Seite nicht gefunden', err: 'Fehler 404', h1a: 'Seite ', h1b: 'nicht gefunden.', lede: 'Die gesuchte Seite wurde möglicherweise verschoben oder gelöscht, oder die Adresse ist falsch geschrieben. Über die Links unten geht es weiter.', home: 'Startseite', qr: 'QR Menu', web: 'Website', contact: 'Kontakt', tagline: 'Zuverlässige Lösungen, effiziente Ergebnisse', skip: 'Zum Inhalt springen', sections: 'Bereiche' },
    it: { title: 'Pagina non trovata', err: 'Errore 404', h1a: 'Pagina ', h1b: 'non trovata.', lede: 'La pagina che cerchi potrebbe essere stata spostata o eliminata, oppure l’indirizzo è stato digitato in modo errato. Puoi continuare con i link qui sotto.', home: 'Home', qr: 'QR Menu', web: 'Sito web', contact: 'Contatti', tagline: 'Soluzioni affidabili, risultati efficienti', skip: 'Vai al contenuto', sections: 'Sezioni' },
    ru: { title: 'Страница не найдена', err: 'Ошибка 404', h1a: 'Страница ', h1b: 'не найдена.', lede: 'Возможно, страница была перемещена или удалена, либо в адресе допущена ошибка. Воспользуйтесь ссылками ниже.', home: 'Главная', qr: 'QR Menu', web: 'Сайт', contact: 'Контакты', tagline: 'Надёжные решения, эффективные результаты', skip: 'Перейти к содержимому', sections: 'Разделы' },
    ar: { title: 'الصفحة غير موجودة', err: 'خطأ 404', h1a: 'الصفحة ', h1b: 'غير موجودة.', lede: 'ربما نُقلت الصفحة التي تبحث عنها أو حُذفت، أو أن العنوان مكتوب بشكل خاطئ. يمكنك المتابعة من الروابط أدناه.', home: 'الرئيسية', qr: 'QR Menu', web: 'موقع إلكتروني', contact: 'تواصل', tagline: 'حلول موثوقة، ونتائج فعّالة', skip: 'انتقل إلى المحتوى', sections: 'الأقسام' },
    hi: { title: 'पेज नहीं मिला', err: 'त्रुटि 404', h1a: 'पेज ', h1b: 'नहीं मिला।', lede: 'आप जिस पेज को ढूँढ रहे हैं, वह हटाया या कहीं और ले जाया गया हो सकता है, या पता गलत लिखा गया है। नीचे दिए गए लिंक से आगे बढ़ें।', home: 'होम', qr: 'QR Menu', web: 'वेबसाइट', contact: 'संपर्क', tagline: 'भरोसेमंद समाधान, असरदार नतीजे', skip: 'सीधे कॉन्टेंट पर जाएँ', sections: 'अनुभाग' },
    zh: { title: '页面未找到', err: '错误 404', h1a: '页面', h1b: '未找到。', lede: '您要找的页面可能已被移动或删除，或者地址输入有误。您可以通过下方链接继续浏览。', home: '首页', qr: 'QR Menu', web: '网站', contact: '联系', tagline: '可靠的方案，高效的成果', skip: '跳到正文', sections: '栏目' },
    ja: { title: 'ページが見つかりません', err: 'エラー 404', h1a: 'ページが', h1b: '見つかりません。', lede: 'お探しのページは移動または削除されたか、アドレスが間違っている可能性があります。下のリンクからお進みください。', home: 'ホーム', qr: 'QR Menu', web: 'ウェブサイト', contact: 'お問い合わせ', tagline: '信頼できるソリューション、確かな成果', skip: '本文へスキップ', sections: 'セクション' },
    ko: { title: '페이지를 찾을 수 없습니다', err: '오류 404', h1a: '페이지를 ', h1b: '찾을 수 없습니다.', lede: '찾으시는 페이지가 이동되었거나 삭제되었거나, 주소가 잘못 입력되었을 수 있습니다. 아래 링크를 이용해 주세요.', home: '홈', qr: 'QR Menu', web: '웹사이트', contact: '문의', tagline: '믿을 수 있는 솔루션, 확실한 성과', skip: '본문으로 건너뛰기', sections: '섹션' },
    id: { title: 'Halaman tidak ditemukan', err: 'Kesalahan 404', h1a: 'Halaman ', h1b: 'tidak ditemukan.', lede: 'Halaman yang Anda cari mungkin telah dipindahkan atau dihapus, atau alamatnya salah ketik. Silakan lanjutkan melalui tautan di bawah.', home: 'Beranda', qr: 'QR Menu', web: 'Situs Web', contact: 'Kontak', tagline: 'Solusi tepercaya, hasil yang efisien', skip: 'Langsung ke konten', sections: 'Bagian' }
  };

  // Her dilin gerçekten var olan sayfaları; listede olmayan sayfa o dilin ana sayfasına düşer.
  var PAGES = { mirus: 'mirus/', qr: 'qr-menu/', web: 'website/' };
  var HAS = {
    tr: { mirus: true, qr: true, web: true }
  };
  ['en', 'es', 'pt', 'fr', 'de', 'it', 'ru', 'ar', 'hi', 'zh', 'ja', 'ko', 'id'].forEach(function (l) { HAS[l] = { mirus: true, qr: true, web: true }; });

  function pick() {
    var seg = (location.pathname.split('/')[1] || '').toLowerCase();
    if (T[seg]) return seg;
    var c = String(navigator.language || '').slice(0, 2).toLowerCase();
    return T[c] ? c : 'tr';
  }

  var lang = pick(), t = T[lang];
  var base = lang === 'tr' ? '/' : '/' + lang + '/';
  function href(k) {
    if (k === 'home') return base;
    if (k === 'contact') return base + '#iletisim';
    if (k === 'web' && lang === 'tr') return '/web-sitesi/'; // Türkçe adresi farklı
    return HAS[lang][k] ? base + PAGES[k] : base;
  }

  d.lang = lang;
  if (lang === 'ar') d.dir = 'rtl'; else d.removeAttribute('dir');
  document.title = t.title + ' · FMJ Software';
  if (lang !== 'tr') d.className += ' i18n-wait';

  function apply() {
    var i, el, list = document.querySelectorAll('[data-k]');
    for (i = 0; i < list.length; i++) { el = list[i]; if (t[el.getAttribute('data-k')]) el.textContent = t[el.getAttribute('data-k')]; }
    list = document.querySelectorAll('[data-ka]');
    for (i = 0; i < list.length; i++) { el = list[i]; if (t[el.getAttribute('data-ka')]) el.setAttribute('aria-label', t[el.getAttribute('data-ka')]); }
    list = document.querySelectorAll('[data-href]');
    for (i = 0; i < list.length; i++) { el = list[i]; el.setAttribute('href', href(el.getAttribute('data-href'))); }
    var y = document.getElementById('year');
    if (y) y.textContent = String(new Date().getFullYear());
    d.className = d.className.replace(/\s*i18n-wait/g, '');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
})();
