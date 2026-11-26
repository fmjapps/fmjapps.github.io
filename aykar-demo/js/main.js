(function () {
  'use strict';

  document.documentElement.classList.add('js');

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

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header: kaydırınca küçülür, bulunduğun bölüm menüde işaretlenir
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 12);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

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
      dot.setAttribute('aria-label', (i + 1) + '. otomat');
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
    sea.innerHTML = '<span>BOĞAZ</span>';
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

  var year = document.getElementById('year');
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
})();
