(function () {
  'use strict';

  var PHONE = '905324789813';
  var EMAIL = 'info@marmarayotomat.com.tr';

  // Mobil menü
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('menu');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Menüyü aç');
      }
    });
  }

  var form = document.getElementById('feedback-form');

  // WhatsApp linklerine hazır mesaj ekle
  function waUrl(text) {
    return 'https://wa.me/' + PHONE + (text ? '?text=' + encodeURIComponent(text) : '');
  }
  document.querySelectorAll('.wa-link[data-wa-text]').forEach(function (a) {
    a.href = waUrl(a.getAttribute('data-wa-text'));
  });

  // Harita: istenince yüklenir, istasyona dokununca o istasyonu gösterir
  var map = document.getElementById('map');
  var mapBtn = document.getElementById('map-load');
  var mapLabel = document.getElementById('map-label');
  var mapOpen = document.getElementById('map-open');
  var frame = null;

  function showMap(src) {
    if (!map) {
      return;
    }
    if (!frame) {
      frame = document.createElement('iframe');
      frame.title = 'Marmaray otomat konumları';
      frame.referrerPolicy = 'no-referrer-when-downgrade';
      map.innerHTML = '';
      map.appendChild(frame);
    }
    frame.src = src;
  }

  if (mapBtn && map) {
    mapBtn.addEventListener('click', function () {
      showMap(map.getAttribute('data-src'));
    });
  }

  var stations = document.querySelectorAll('.station');
  stations.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var q = link.getAttribute('data-q');
      stations.forEach(function (s) {
        s.classList.remove('active');
      });
      link.classList.add('active');
      showMap('https://www.google.com/maps?q=' + q + '&output=embed');
      if (mapLabel) {
        mapLabel.textContent = link.textContent + ' istasyonu gösteriliyor.';
      }
      if (mapOpen) {
        mapOpen.href = link.href;
      }
      var station = form && form.elements.istasyon;
      if (station) {
        station.value = link.textContent;
      }
      if (window.matchMedia('(max-width: 960px)').matches) {
        map.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  // İstasyon arama (Türkçe karakterleri sadeleştirerek)
  function plain(text) {
    return text.toLocaleLowerCase('tr')
      .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
      .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c');
  }
  var filter = document.getElementById('station-filter');
  var empty = document.getElementById('station-empty');
  if (filter) {
    filter.addEventListener('input', function () {
      var term = plain(filter.value.trim());
      var shown = 0;
      stations.forEach(function (link) {
        var match = !term || plain(link.textContent).indexOf(term) !== -1;
        link.parentElement.hidden = !match;
        if (match) {
          shown += 1;
        }
      });
      document.querySelectorAll('.stations ul').forEach(function (ul) {
        var visible = ul.querySelector('li:not([hidden])');
        ul.hidden = !visible;
        ul.previousElementSibling.hidden = !visible;
      });
      if (empty) {
        empty.hidden = shown !== 0;
      }
    });
  }

  // Öneri / şikayet formu: WhatsApp ya da e-posta taslağı açar
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var channel = (e.submitter && e.submitter.value) || 'wa';
      var station = form.elements.istasyon.value || 'Belirtilmedi';
      var machine = form.elements.otomat.value.trim();
      var topic = form.elements.konu.value;
      var message = form.elements.mesaj.value.trim();
      var body = 'İstasyon: ' + station +
        (machine ? '\nOtomat no: ' + machine : '') +
        '\nKonu: ' + topic +
        (message ? '\n\n' + message : '');

      if (channel === 'mail') {
        window.location.href = 'mailto:' + EMAIL +
          '?subject=' + encodeURIComponent('Öneri / Şikayet: ' + topic) +
          '&body=' + encodeURIComponent(body);
      } else {
        window.open(waUrl(body), '_blank', 'noopener');
      }
    });
  }

  // QR ile gelindiyse: ?istasyon=Bostancı&otomat=12
  if (form) {
    var params = new URLSearchParams(window.location.search);
    var qStation = params.get('istasyon');
    var qMachine = params.get('otomat');
    var select = form.elements.istasyon;
    var matched = false;
    if (qStation) {
      var wanted = plain(qStation.trim());
      Array.prototype.forEach.call(select.options, function (opt) {
        if (!matched && opt.value && plain(opt.value) === wanted) {
          select.value = opt.value;
          matched = true;
        }
      });
    }
    if (qMachine) {
      form.elements.otomat.value = qMachine.slice(0, 20);
    }
    if (matched || qMachine) {
      document.getElementById('oneri').scrollIntoView();
    }
  }

  var year = document.getElementById('year');
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
})();
