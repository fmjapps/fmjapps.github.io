(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var PHONE = '905324789813';
  var EMAIL = 'info@marmarayotomat.com.tr';

  // Dil metinleri: js/i18n/<dil>.js
  var T = window.I18N || {};
  function fmt(str, data) {
    return String(str || '').replace(/\{(\w+)\}/g, function (_, k) {
      return data[k] !== undefined ? data[k] : '';
    });
  }

  // Otomat konum adlarını çevirir (Gebze yönü, Metro girişi 1 ...)
  function loc(name) {
    var L = T.loc;
    if (!L) {
      return name;
    }
    var word = function (x) {
      return L.w[x] || x;
    };
    var out = name
      .replace(/(\S+) yönü/g, function (_, x) {
        return fmt(L.dir, { x: x });
      })
      .replace(/(\S+) girişi/g, function (_, x) {
        return fmt(L.ent, { x: word(x) });
      })
      .replace(/(\S+) çıkışı/g, function (_, x) {
        return fmt(L.exit, { x: word(x) });
      });
    Object.keys(L.w).sort(function (a, b) {
      return b.length - a.length;
    }).forEach(function (k) {
      out = out.split(k).join(L.w[k]);
    });
    return out.charAt(0).toUpperCase() + out.slice(1);
  }

  // Mobil menü
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('menu');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? T.menuClose : T.menuOpen);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', T.menuOpen);
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
      frame.title = T.mapTitle;
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

  // Header'daki Harita butonu: bölüme iner ve haritayı açar
  var navMap = document.querySelector('.nav-map');
  if (navMap && map) {
    navMap.addEventListener('click', function () {
      if (!frame) {
        showMap(map.getAttribute('data-src'));
      }
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
        mapLabel.textContent = fmt(T.showing, { s: link.textContent });
      }
      if (mapOpen) {
        mapOpen.href = link.href;
      }
      var station = form && form.elements.istasyon;
      if (station) {
        station.value = link.textContent;
        station.dispatchEvent(new Event('change', { bubbles: true }));
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

  // Telefon ülke kodları: [ülke, kod, en az hane, en çok hane, örnek]
  // Hane sayısı, baştaki 0 olmadan ulusal numaradır.
  var COUNTRIES = [
    ['TR', '90', 10, 10, '5XX XXX XX XX'],
    ['AE', '971', 8, 9, '50 123 4567'], ['AF', '93', 9, 9, '70 123 4567'],
    ['AL', '355', 9, 9, '67 212 3456'], ['AR', '54', 10, 10, '11 2345 6789'],
    ['AT', '43', 7, 13, '664 123456'], ['AU', '61', 9, 9, '412 345 678'],
    ['AZ', '994', 9, 9, '40 123 45 67'], ['BA', '387', 8, 8, '61 123 456'],
    ['BE', '32', 8, 9, '470 12 34 56'], ['BG', '359', 8, 9, '48 123 456'],
    ['BH', '973', 8, 8, '3600 1234'], ['BR', '55', 10, 11, '11 96123 4567'],
    ['CA', '1', 10, 10, '506 234 5678'], ['CH', '41', 9, 9, '78 123 45 67'],
    ['CN', '86', 11, 11, '131 2345 6789'], ['CY', '357', 8, 8, '96 123456'],
    ['CZ', '420', 9, 9, '601 123 456'], ['DE', '49', 7, 11, '1512 3456789'],
    ['DK', '45', 8, 8, '32 12 34 56'], ['DZ', '213', 9, 9, '551 23 45 67'],
    ['EG', '20', 10, 10, '100 123 4567'], ['ES', '34', 9, 9, '612 34 56 78'],
    ['FI', '358', 6, 10, '41 2345678'], ['FR', '33', 9, 9, '6 12 34 56 78'],
    ['GB', '44', 10, 10, '7400 123456'], ['GE', '995', 9, 9, '555 12 34 56'],
    ['GR', '30', 10, 10, '691 234 5678'], ['HU', '36', 8, 9, '20 123 4567'],
    ['ID', '62', 9, 12, '812 345 678'], ['IE', '353', 7, 9, '85 012 3456'],
    ['IL', '972', 8, 9, '50 234 5678'], ['IN', '91', 10, 10, '81234 56789'],
    ['IQ', '964', 10, 10, '791 234 5678'], ['IR', '98', 10, 10, '912 345 6789'],
    ['IT', '39', 6, 11, '312 345 6789'], ['JO', '962', 8, 9, '7 9012 3456'],
    ['JP', '81', 10, 10, '90 1234 5678'], ['KG', '996', 9, 9, '700 123 456'],
    ['KR', '82', 9, 10, '10 2000 0000'], ['KW', '965', 8, 8, '500 12345'],
    ['KZ', '7', 10, 10, '771 000 9998'], ['LB', '961', 7, 8, '71 123 456'],
    ['LY', '218', 9, 9, '91 234 5678'], ['MA', '212', 9, 9, '650 123456'],
    ['MD', '373', 8, 8, '621 12 345'], ['MK', '389', 8, 8, '72 345 678'],
    ['MX', '52', 10, 10, '222 123 4567'], ['MY', '60', 9, 10, '12 345 6789'],
    ['NG', '234', 8, 10, '802 123 4567'], ['NL', '31', 9, 9, '6 12345678'],
    ['NO', '47', 8, 8, '406 12 345'], ['OM', '968', 8, 8, '9212 3456'],
    ['PK', '92', 10, 10, '301 2345678'], ['PL', '48', 9, 9, '512 345 678'],
    ['PS', '970', 9, 9, '599 123 456'], ['PT', '351', 9, 9, '912 345 678'],
    ['QA', '974', 8, 8, '3312 3456'], ['RO', '40', 9, 9, '712 034 567'],
    ['RS', '381', 8, 9, '60 1234567'], ['RU', '7', 10, 10, '912 345 67 89'],
    ['SA', '966', 9, 9, '51 234 5678'], ['SD', '249', 9, 9, '91 123 1234'],
    ['SE', '46', 7, 9, '70 123 45 67'], ['SY', '963', 9, 9, '944 567 890'],
    ['TM', '993', 8, 8, '66 123456'], ['TN', '216', 8, 8, '20 123 456'],
    ['UA', '380', 9, 9, '50 123 4567'], ['US', '1', 10, 10, '201 555 0123'],
    ['UZ', '998', 9, 9, '91 234 56 78'], ['XK', '383', 8, 8, '43 201 234'],
    ['YE', '967', 9, 9, '712 345 678'], ['ZA', '27', 9, 9, '71 123 4567']
  ];

  // Öneri / şikayet formu: zorunlu alanlar, otomat listesi, taslak mesaj
  var OTOMATLAR = window.OTOMATLAR || [];
  var qrHit = null;
  if (form) {
    var fe = form.elements;
    var otomatField = form.querySelector('.otomat-field');
    var kindBox = form.querySelector('.kind');
    var draftBox = document.getElementById('draft');
    var errBox = document.getElementById('form-error');
    var fromQr = document.getElementById('from-qr');
    var konuGroups = form.querySelectorAll('select[name="konu"] optgroup');

    var fillMachines = function (station, selectedId) {
      var sel = fe.otomat;
      sel.length = 1;
      var list = OTOMATLAR.filter(function (m) {
        return m.s === station;
      });
      list.forEach(function (m) {
        var o = document.createElement('option');
        o.value = m.id;
        o.textContent = loc(m.n);
        sel.appendChild(o);
      });
      otomatField.hidden = list.length === 0;
      sel.value = selectedId || '';
    };

    var kind = function () {
      var r = form.querySelector('input[name="tur"]:checked');
      return r ? r.value : '';
    };

    var syncKind = function () {
      var k = kind();
      konuGroups.forEach(function (g) {
        var on = !k || g.getAttribute('data-kind') === k;
        g.hidden = !on;
        g.disabled = !on;
      });
      var cur = fe.konu.options[fe.konu.selectedIndex];
      if (!cur || cur.parentNode.disabled) {
        var first = form.querySelector('select[name="konu"] optgroup:not([disabled]) option');
        if (first) {
          first.selected = true;
        }
      }
      fe.mesaj.placeholder = k === 'oneri' ? T.phOneri : T.phSikayet;
    };

    var machineText = function () {
      var o = fe.otomat.options[fe.otomat.selectedIndex];
      return o && o.value ? o.textContent + ' (' + T.lbl.no + ': ' + o.value + ')' : '';
    };

    // Ülke kodu seçici: adlar sayfanın dilinde, Türkiye önce
    var ccSel = fe.ulke;
    var ccVal = form.querySelector('.tel-cc-val');
    var byIso = {};
    var names = null;
    try {
      names = new Intl.DisplayNames([T.lang || 'tr'], { type: 'region' });
    } catch (err) {
      names = null;
    }
    var cName = function (iso) {
      try {
        return (names && names.of(iso)) || iso;
      } catch (err) {
        return iso;
      }
    };
    COUNTRIES.forEach(function (c) {
      byIso[c[0]] = { iso: c[0], dial: c[1], min: c[2], max: c[3], ex: c[4], name: cName(c[0]) };
    });
    var ordered = COUNTRIES.slice(1).map(function (c) {
      return byIso[c[0]];
    }).sort(function (a, b) {
      return a.name.localeCompare(b.name, T.lang || 'tr');
    });
    ordered.unshift(byIso.TR);
    ordered.forEach(function (c) {
      var o = document.createElement('option');
      o.value = c.iso;
      o.textContent = c.name + ' (+' + c.dial + ')';
      ccSel.appendChild(o);
    });
    var cc = function () {
      return byIso[ccSel.value] || byIso.TR;
    };
    var syncCc = function () {
      var c = cc();
      ccVal.textContent = c.iso + ' +' + c.dial;
      fe.telefon.placeholder = c.ex;
    };
    ccSel.value = 'TR';
    syncCc();

    // Numara +ülke koduyla yazılır ya da yapıştırılırsa ülke kendiliğinden seçilir
    var detectCc = function () {
      var raw = fe.telefon.value.trim();
      if (raw.charAt(0) !== '+' && raw.indexOf('00') !== 0) {
        return;
      }
      var d = raw.replace(/\D/g, '').replace(/^00/, '');
      var best = null;
      ordered.forEach(function (c) {
        if (d.indexOf(c.dial) === 0 && (!best || c.dial.length > best.dial.length ||
            (c.dial === best.dial && c.iso === ccSel.value))) {
          best = c;
        }
      });
      if (best && d.length > best.dial.length) {
        ccSel.value = best.iso;
        fe.telefon.value = d.slice(best.dial.length);
        syncCc();
      }
    };

    var national = function () {
      var d = fe.telefon.value.replace(/\D/g, '');
      if (cc().iso !== 'IT') {
        d = d.replace(/^0/, '');
      }
      return d;
    };

    var phoneDigits = national;

    var phoneOk = function () {
      var d = national();
      var c = cc();
      return d.length >= c.min && d.length <= c.max;
    };

    var phoneText = function () {
      var d = national();
      if (cc().iso === 'TR' && d.length === 10) {
        d = d.replace(/^(\d{3})(\d{3})(\d{2})(\d{2})$/, '$1 $2 $3 $4');
      }
      return '+' + cc().dial + ' ' + d;
    };

    var buildText = function () {
      var k = kind();
      var lines = [
        T.hello[k] || T.hello.none,
        '',
        T.lbl.kind + ': ' + (T.kind[k] || '-'),
        T.lbl.topic + ': ' + fe.konu.value,
        T.lbl.station + ': ' + (fe.istasyon.value || '-')
      ];
      var mt = machineText();
      if (mt) {
        lines.push(T.lbl.machine + ': ' + mt);
      }
      if (fe.ad.value.trim()) {
        lines.push(T.lbl.name + ': ' + fe.ad.value.trim());
      }
      lines.push(T.lbl.phone + ': ' + (phoneDigits().length > 2 ? phoneText() : '-'));
      var msg = fe.mesaj.value.trim();
      if (msg) {
        lines.push('', msg);
      }
      return lines.join('\n');
    };

    var updateDraft = function () {
      if (draftBox) {
        draftBox.textContent = buildText();
      }
    };

    var check = function () {
      var missing = [];
      var bad = [];
      if (!kind()) {
        missing.push(T.miss.kind);
        bad.push(kindBox.querySelector('input'));
      }
      if (!fe.istasyon.value) {
        missing.push(T.miss.station);
        bad.push(fe.istasyon);
      }
      if (!phoneOk()) {
        missing.push(T.miss.phone);
        bad.push(fe.telefon);
      }
      kindBox.classList.toggle('invalid', !kind());
      fe.istasyon.classList.toggle('invalid', !fe.istasyon.value);
      fe.telefon.classList.toggle('invalid', !phoneOk());
      if (errBox) {
        errBox.hidden = missing.length === 0;
        errBox.textContent = missing.length ? fmt(T.fill, { list: missing.join(', ') }) : '';
      }
      return bad;
    };

    form.addEventListener('change', function (e) {
      if (e.target.name === 'istasyon') {
        fillMachines(fe.istasyon.value);
      }
      if (e.target.name === 'tur') {
        syncKind();
      }
      if (e.target.name === 'ulke') {
        syncCc();
      }
      if (form.classList.contains('tried')) {
        check();
      }
      updateDraft();
    });

    form.addEventListener('input', function (e) {
      if (e.target === fe.telefon) {
        fe.telefon.value = fe.telefon.value.replace(/[^\d\s+()-]/g, '');
        detectCc();
      }
      if (form.classList.contains('tried')) {
        check();
      }
      updateDraft();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.classList.add('tried');
      var bad = check();
      if (bad.length) {
        bad[0].focus();
        return;
      }
      var text = buildText();
      var subject = T.kind[kind()] + ' - ' + fe.istasyon.value.replace(/ \(.*\)$/, '') + ' - ' + fe.konu.value;
      var channel = (e.submitter && e.submitter.value) || 'wa';
      if (channel === 'mail') {
        window.location.href = 'mailto:' + EMAIL +
          '?subject=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent(text);
      } else {
        window.open(waUrl(text), '_blank', 'noopener');
      }
    });

    // QR ile gelindiyse: ?o=22-1 (otomat no). Eski biçim: ?istasyon=Bostancı
    var params = new URLSearchParams(window.location.search);
    var qId = (params.get('o') || '').trim();
    var qStation = (params.get('istasyon') || '').trim();
    var hit = null;
    OTOMATLAR.forEach(function (m) {
      if (m.id === qId) {
        hit = m;
      }
    });
    if (hit) {
      qrHit = hit;
      fe.istasyon.value = hit.s;
      fillMachines(hit.s, hit.id);
      // QR ile gelindiyse istasyon ve otomat değiştirilemez
      fe.istasyon.disabled = true;
      fe.otomat.disabled = true;
      fe.istasyon.parentNode.classList.add('locked');
      otomatField.classList.add('locked');
      if (fromQr) {
        fromQr.hidden = false;
        fromQr.textContent = fmt(T.fromQr, { s: hit.s, n: loc(hit.n) });
      }
    } else if (qStation) {
      var wanted = plain(qStation);
      Array.prototype.forEach.call(fe.istasyon.options, function (opt) {
        if (opt.value && plain(opt.value) === wanted) {
          fe.istasyon.value = opt.value;
          fillMachines(opt.value);
        }
      });
    }
    syncKind();
    updateDraft();
    if (qStation && !hit) {
      document.getElementById('oneri').scrollIntoView();
    }
  }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Menüde bulunduğun bölüm işaretlenir
  var navLinks = document.querySelectorAll('.nav a[href^="#"]');
  if ('IntersectionObserver' in window && navLinks.length) {
    var byId = {};
    navLinks.forEach(function (a) {
      byId[a.getAttribute('href').slice(1)] = a;
    });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = byId[entry.target.id];
        if (link && entry.isIntersecting) {
          navLinks.forEach(function (a) {
            a.classList.remove('current');
          });
          link.classList.add('current');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        spy.observe(el);
      }
    });
  }

  // Hero vitrini: otomatlar sağa sola kayarak değişir
  var machines = Array.prototype.slice.call(document.querySelectorAll('.machine'));
  var stage = document.getElementById('stage');
  var dotsBox = document.getElementById('slide-dots');
  var cap = document.getElementById('stage-cap');
  var current = 0;
  var timer = null;
  function layout() {
    var n = machines.length;
    machines.forEach(function (m, i) {
      var d = (i - current + n) % n;
      m.className = 'machine' + (d === 0 ? ' is-active' : d === 1 ? ' is-next' : d === n - 1 ? ' is-prev' : (d < n / 2 ? ' is-out-right' : ' is-out-left'));
      m.setAttribute('aria-hidden', d === 0 ? 'false' : 'true');
    });
    if (stage) {
      stage.style.setProperty('--glow', machines[current].getAttribute('data-glow'));
    }
    if (cap) {
      cap.textContent = machines[current].querySelector('figcaption').textContent;
    }
    if (dotsBox) {
      Array.prototype.forEach.call(dotsBox.children, function (dot, i) {
        dot.setAttribute('aria-selected', i === current ? 'true' : 'false');
      });
    }
  }
  function go(i) {
    current = (i + machines.length) % machines.length;
    layout();
  }
  function play() {
    if (reduceMotion || machines.length < 2) {
      return;
    }
    clearInterval(timer);
    timer = setInterval(function () {
      go(current + 1);
    }, 4200);
  }
  if (machines.length && dotsBox) {
    machines.forEach(function (m, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', fmt(T.dot, { n: i + 1 }));
      dot.addEventListener('click', function () {
        go(i);
        play();
      });
      dotsBox.appendChild(dot);
      m.addEventListener('click', function () {
        if (m.classList.contains('is-next') || m.classList.contains('is-prev')) {
          go(i);
          play();
        }
      });
    });
    document.getElementById('stage-prev').addEventListener('click', function () {
      go(current - 1);
      play();
    });
    document.getElementById('stage-next').addEventListener('click', function () {
      go(current + 1);
      play();
    });
    var sx = null;
    stage.addEventListener('pointerdown', function (e) {
      sx = e.clientX;
    });
    stage.addEventListener('pointerup', function (e) {
      if (sx === null) {
        return;
      }
      var dx = e.clientX - sx;
      if (Math.abs(dx) > 40) {
        go(current + (dx < 0 ? 1 : -1));
        play();
      }
      sx = null;
    });
    stage.addEventListener('mouseenter', function () {
      clearInterval(timer);
    });
    stage.addEventListener('mouseleave', play);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        clearInterval(timer);
      } else {
        play();
      }
    });
    layout();
    play();
  }

  // Ödeme rehberi: yöntem seçilir, adımlar animasyonla döner
  var guide = document.getElementById('guide');
  if (guide) {
    var gTabs = guide.querySelectorAll('[role="tab"]');
    var gSteps = guide.querySelectorAll('.guide-steps li');
    var gScreen = guide.querySelector('.scr-2');
    var gLabel = { kart: T.scanCard, banka: T.scanCard, qr: T.scanQr, ikart: T.scanCard };
    var gStep = 1;
    var gTimer = null;
    var setStep = function (n) {
      gStep = n;
      guide.setAttribute('data-step', String(n));
      gSteps.forEach(function (li) {
        li.classList.toggle('on', li.getAttribute('data-step') === String(n));
      });
    };
    var restart = function () {
      clearInterval(gTimer);
      gTimer = setInterval(function () {
        setStep(gStep % 3 + 1);
      }, 2800);
    };
    var setMethod = function (m) {
      guide.setAttribute('data-method', m);
      gTabs.forEach(function (t) {
        t.setAttribute('aria-selected', t.getAttribute('data-method') === m ? 'true' : 'false');
      });
      if (gScreen) {
        gScreen.textContent = gLabel[m];
      }
      setStep(1);
      restart();
    };
    gTabs.forEach(function (t) {
      t.addEventListener('click', function () {
        setMethod(t.getAttribute('data-method'));
      });
    });
    gSteps.forEach(function (li) {
      li.addEventListener('click', function () {
        setStep(parseInt(li.getAttribute('data-step'), 10));
        restart();
      });
    });
    setMethod('kart');
  }

  // Sayaçlar
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (reduceMotion || !target) {
      return;
    }
    var start = null;
    function step(t) {
      if (start === null) {
        start = t;
      }
      var p = Math.min((t - start) / 1400, 1);
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) {
        requestAnimationFrame(step);
      }
    }
    el.textContent = '0';
    requestAnimationFrame(step);
  }
  document.querySelectorAll('[data-count]').forEach(countUp);

  // Marmaray hattı: istasyon listesinden çizilir
  var lineEl = document.getElementById('line');
  var stops = [];
  if (lineEl && stations.length) {
    var gapAfter = 13; // Sirkeci ile Üsküdar arası Boğaz
    var units = stations.length - 1 + 2;
    var pos = function (i) {
      return ((i + (i > gapAfter ? 2 : 0)) / units) * 100;
    };
    var sea = document.createElement('div');
    sea.className = 'sea';
    sea.style.left = (pos(gapAfter) + 1) + '%';
    sea.style.width = (pos(gapAfter + 1) - pos(gapAfter) - 2) + '%';
    sea.innerHTML = '<span></span>';
    sea.firstChild.textContent = T.sea;
    lineEl.appendChild(sea);

    stations.forEach(function (link, i) {
      var stop = document.createElement('button');
      stop.type = 'button';
      stop.className = 'stop' + (i === 0 || i === stations.length - 1 ? ' end' : '');
      stop.style.left = pos(i) + '%';
      stop.setAttribute('aria-label', link.textContent);
      var tip = document.createElement('span');
      tip.className = 'tip';
      tip.textContent = link.textContent;
      stop.appendChild(tip);
      if (stop.classList.contains('end')) {
        var label = document.createElement('span');
        label.className = 'label';
        label.textContent = link.textContent;
        stop.appendChild(label);
      }
      stop.addEventListener('click', function () {
        link.click();
      });
      lineEl.appendChild(stop);
      stops.push(stop);
    });

    var train = document.createElement('span');
    train.className = 'train';
    lineEl.appendChild(train);

    stations.forEach(function (link, i) {
      link.addEventListener('click', function () {
        stops.forEach(function (s) {
          s.classList.remove('active');
        });
        stops[i].classList.add('active');
      });
    });
  }

  // Kaydırınca beliren öğeler
  if ('IntersectionObserver' in window && !reduceMotion) {
    var groups = ['.section-head', '.about > *', '.grid > *', '.steps li', '.line-wrap', '.stations-box', '.map-box', '.feedback > *', '.gallery figure', '.contact-grid > *', '.band'];
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealIO.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    groups.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el, i) {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          return;
        }
        el.classList.add('reveal');
        el.style.setProperty('--d', Math.min(i % 4, 3) * 0.08 + 's');
        revealIO.observe(el);
      });
    });
  }

  // Galeri büyütme
  var lb = document.getElementById('lightbox');
  var figures = Array.prototype.slice.call(document.querySelectorAll('.gallery figure'));
  if (lb && figures.length && typeof lb.showModal === 'function') {
    var lbImg = lb.querySelector('img');
    var lbCap = lb.querySelector('figcaption');
    var idx = 0;
    var show = function (i) {
      idx = (i + figures.length) % figures.length;
      var img = figures[idx].querySelector('img');
      var set = (img.getAttribute('srcset') || '').split(',').map(function (x) {
        return x.trim().split(' ')[0];
      }).filter(Boolean);
      lbImg.src = set.length ? set[set.length - 1] : img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = figures[idx].querySelector('figcaption').textContent;
    };
    figures.forEach(function (fig, i) {
      fig.tabIndex = 0;
      fig.setAttribute('role', 'button');
      fig.addEventListener('click', function () {
        show(i);
        lb.showModal();
      });
      fig.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          show(i);
          lb.showModal();
        }
      });
    });
    lb.querySelector('.lb-close').addEventListener('click', function () {
      lb.close();
    });
    lb.querySelector('.lb-prev').addEventListener('click', function () {
      show(idx - 1);
    });
    lb.querySelector('.lb-next').addEventListener('click', function () {
      show(idx + 1);
    });
    lb.addEventListener('click', function (e) {
      if (e.target === lb) {
        lb.close();
      }
    });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        show(idx - 1);
      } else if (e.key === 'ArrowRight') {
        show(idx + 1);
      }
    });
    var touchX = null;
    lb.addEventListener('touchstart', function (e) {
      touchX = e.touches[0].clientX;
    }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (touchX === null) {
        return;
      }
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) {
        show(idx + (dx < 0 ? 1 : -1));
      }
      touchX = null;
    });
  }

  // Dil seçici: sorgu (QR otomat no) ve çapa korunur, dışarı tıklayınca kapanır
  var langBox = document.getElementById('lang');
  if (langBox) {
    langBox.querySelectorAll('a').forEach(function (a) {
      a.href = a.getAttribute('href') + window.location.search + window.location.hash;
    });
    document.addEventListener('click', function (e) {
      if (langBox.open && !langBox.contains(e.target)) {
        langBox.open = false;
      }
    });
  }

  // Türkçe sayfada tarayıcı dili başka bir dilse o dildeki sürüm önerilir
  if (T.offer && langBox) {
    var dismissed = false;
    try {
      dismissed = sessionStorage.getItem('dil-oneri') === '1';
    } catch (err) {
      dismissed = false;
    }
    var wanted = (navigator.languages || [navigator.language || '']).map(function (l) {
      return String(l).slice(0, 2).toLowerCase();
    });
    var pick = null;
    for (var li = 0; li < wanted.length && !pick; li += 1) {
      if (wanted[li] === 'tr') {
        break;
      }
      if (T.offer[wanted[li]]) {
        pick = wanted[li];
      }
    }
    var target = pick && langBox.querySelector('a[hreflang="' + pick + '"]');
    if (target && !dismissed) {
      var bar = document.createElement('div');
      bar.className = 'lang-offer';
      bar.setAttribute('lang', pick);
      bar.dir = pick === 'ar' || pick === 'fa' ? 'rtl' : 'ltr';
      var txt = document.createElement('span');
      txt.textContent = T.offer[pick][0];
      var go = document.createElement('a');
      go.className = 'btn btn-sm';
      go.href = target.href;
      go.textContent = T.offer[pick][1];
      var x = document.createElement('button');
      x.type = 'button';
      x.className = 'lang-offer-x';
      x.setAttribute('aria-label', T.close);
      x.textContent = '×';
      x.addEventListener('click', function () {
        bar.remove();
        try {
          sessionStorage.setItem('dil-oneri', '1');
        } catch (err) {
          return;
        }
      });
      bar.appendChild(txt);
      bar.appendChild(go);
      bar.appendChild(x);
      document.body.appendChild(bar);
    }
  }

  // QR ile gelindiyse karşılama ekranı: kullanım rehberi, sorun bildir, web sitesi
  var sheet = document.getElementById('qr-sheet');
  if (qrHit && sheet && typeof sheet.showModal === 'function') {
    document.getElementById('qr-sheet-place').textContent = qrHit.s;
    document.getElementById('qr-sheet-machine').textContent = fmt(T.qrMachine, { n: loc(qrHit.n), id: '⁦' + qrHit.id + '⁩' });
    if (langBox) {
      var langs = document.createElement('nav');
      langs.className = 'qr-sheet-langs';
      langs.setAttribute('aria-label', langBox.querySelector('summary').getAttribute('aria-label'));
      langBox.querySelectorAll('a').forEach(function (a) {
        var l = a.cloneNode(false);
        l.textContent = a.getAttribute('hreflang').toUpperCase();
        l.title = a.textContent;
        langs.appendChild(l);
      });
      sheet.insertBefore(langs, sheet.firstChild);
    }
    sheet.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-go]');
      if (!btn) {
        return;
      }
      e.preventDefault();
      sheet.close();
      var go = btn.getAttribute('data-go');
      var el = document.getElementById(go === 'oneri' ? 'feedback-form' : go);
      if (el) {
        el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }
      if (go === 'oneri') {
        var first = form.querySelector('input[name="tur"]');
        if (first) {
          first.focus({ preventScroll: true });
        }
      }
    });
    sheet.showModal();
    sheet.scrollTop = 0;
  } else if (qrHit) {
    document.getElementById('oneri').scrollIntoView();
  }

  var year = document.getElementById('year');
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
})();
