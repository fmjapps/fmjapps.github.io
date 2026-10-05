// Titus: binlerce ışık noktasından oluşan, derinliği olan cinsiyetsiz bir insan yüzü ve omuzlar.
// Biçim Poly Haven "Marble Bust 01" (CC0, Rico Cilliers) modelinden alınır; saç ve yüz hatları yumuşatılır,
// yüzeyden noktalar örneklenir. Noktalar açılışta dağınık hâlden toplanır, fare yaklaşınca dağılıp geri döner,
// tıklanınca göğüsten başa bir ışık dalgası yükselir, sohbet sırasında parlar. Baş fareyi izler, sürüklenince döner.
// WebGL2 yoksa yalnızca arka plan ışığı kalır.
(function () {
  'use strict';
  var host = document.getElementById('titus');
  var cv = document.getElementById('tCanvas');
  if (!host || !cv) return;
  var gl = cv.getContext('webgl2', { antialias: true, premultipliedAlpha: true, alpha: true });
  if (!gl) return;
  var root = document.documentElement;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rtl = root.dir === 'rtl';
  var small = Math.min(innerWidth, innerHeight) < 700;
  var BASE = '/assets/titus/';

  /* ---------- Baş çerçevesi: kafa büstte yaklaşık 15° sola dönüktür ---------- */
  var HC = { x: 0, z: 0.011 }, FC = Math.cos(0.2611), FS = Math.sin(0.2611);
  function toF(x, z) { var qx = x - HC.x, qz = z - HC.z; return [qx * FC + qz * FS, -qx * FS + qz * FC]; }
  function hairline(X, Z) {
    var t = Math.min(1, Math.max(0, (Z + 0.03) / 0.12)); t = t * t * (3 - 2 * t);
    var s = Math.min(1, Math.max(0, (Math.abs(X) - 0.03) / 0.05)); s = s * s * (3 - 2 * s);
    return 0.300 + (0.404 - 0.018 * s - 0.300) * t;
  }

  /* ---------- Matris yardımcıları (sütun öncelikli) ---------- */
  function mul(a, b) {
    var o = new Float32Array(16);
    for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++) {
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
    return o;
  }
  function persp(fov, asp, n, f) {
    var t = 1 / Math.tan(fov / 2), o = new Float32Array(16);
    o[0] = t / asp; o[5] = t; o[10] = (f + n) / (n - f); o[11] = -1; o[14] = 2 * f * n / (n - f);
    return o;
  }
  function trans(x, y, z) { var o = ident(); o[12] = x; o[13] = y; o[14] = z; return o; }
  function ident() { var o = new Float32Array(16); o[0] = o[5] = o[10] = o[15] = 1; return o; }
  function rotY(a) { var o = ident(), c = Math.cos(a), s = Math.sin(a); o[0] = c; o[2] = -s; o[8] = s; o[10] = c; return o; }
  function rotX(a) { var o = ident(), c = Math.cos(a), s = Math.sin(a); o[5] = c; o[6] = s; o[9] = -s; o[10] = c; return o; }
  function rotZ(a) { var o = ident(), c = Math.cos(a), s = Math.sin(a); o[0] = c; o[1] = s; o[4] = -s; o[5] = c; return o; }

  /* ---------- Gölgelendiriciler ---------- */
  var VS_PTS = '#version 300 es\n' +
    'in vec3 aPos; in vec3 aNor; in float aSeed; in float aFace; in float aAO;\n' +
    'uniform mat4 uModel, uView, uProj; uniform vec3 uCam;\n' +
    'uniform float uTime, uAssemble, uPulse, uGlow, uHover, uSize, uAsp; uniform vec3 uPtr;\n' +
    'uniform vec3 cA, cB, cC, cD; uniform float uAlpha, uPass;\n' +
    'out vec4 vCol;\n' +
    'float h(float n){ return fract(sin(n) * 43758.5453); }\n' +
    'void main(){\n' +
    '  vec3 rnd = vec3(h(aSeed * 1.31), h(aSeed * 2.17), h(aSeed * 3.73)) - 0.5;\n' +
    '  float a = clamp(uAssemble * 1.5 - h(aSeed * 5.1) * 0.5, 0.0, 1.0); a = a * a * (3.0 - 2.0 * a);\n' +
    '  vec3 p = aPos + rnd * 0.7 * (1.0 - a);\n' +
    '  p += aNor * 0.0011 * sin(uTime * 1.6 + aSeed * 37.0) * (1.0 + uHover * 1.5);\n' +
    '  float wave = uPulse >= 0.0 ? exp(-pow((aPos.y - mix(0.04, 0.56, uPulse)) / 0.028, 2.0)) : 0.0;\n' +
    '  p += aNor * 0.007 * wave;\n' +
    '  vec4 w = uModel * vec4(p, 1.0);\n' +
    '  vec3 n = normalize(mat3(uModel) * aNor);\n' +
    '  vec4 c = uProj * uView * w;\n' +
    // Fareye yakın noktalar yüzeyden dışarı ve yana savrulur
    '  vec2 d = c.xy / c.w - uPtr.xy; d.x *= uAsp;\n' +
    '  float f = uPtr.z * exp(-dot(d, d) / 0.010);\n' +
    '  w.xyz += (n * 0.035 + rnd * 0.05) * f;\n' +
    '  c = uProj * uView * w;\n' +
    '  gl_Position = c;\n' +
    '  vec3 V = normalize(uCam - w.xyz);\n' +
    '  float facing = dot(n, V);\n' +
    '  float lam = max(dot(n, normalize(vec3(-0.45, 0.6, 0.75))), 0.0);\n' +
    '  float fill = max(dot(n, normalize(vec3(0.8, 0.1, 0.4))), 0.0);\n' +
    '  float rim = pow(1.0 - abs(facing), 2.0);\n' +
    '  float vis = smoothstep(-0.1, 0.25, facing);\n' +
    '  float fade = smoothstep(0.05, 0.16, aPos.y);\n' +
    // Yalnızca yüzde, göz çukuru, burun altı ve ağız kenarında çok hafif gölge
    '  float face = aFace > 0.5 && aFace < 1.5 || aFace > 2.5 ? 1.0 : 0.0;\n' +
    '  float shade = 1.0 - 0.38 * clamp(aAO, 0.0, 1.0) * face;\n' +
    '  float br = (0.06 + 1.05 * pow(lam, 1.4) + 0.22 * fill + 0.45 * rim + 0.25 * face * max(facing, 0.0)) * shade + 0.9 * wave + 0.25 * uGlow + f * 0.8;\n' +
    '  vec3 col = mix(cB, cA, clamp(lam * 0.9 + rim * 0.6, 0.0, 1.0) * shade);\n' +
    '  if (aFace > 4.5) br *= 1.6;\n' +
    '  if (aFace > 5.5) col = mix(col, cC, 0.45);\n' +
    '  if (h(aSeed * 9.7) > 0.975) col = cC;\n' +
    '  col = mix(col, cA, wave);\n' +
    '  float feat = aFace > 2.5 ? 1.0 : 0.0;\n' +
    '  float al = vis * fade * clamp(br, 0.0, 1.6) * mix(0.4, 0.62, face) * a * uAlpha;\n' +
    '  vCol = vec4(col * al, al);\n' +
    '  if (uPass > 0.5) { float k = feat * vis * a * (aFace > 3.5 ? 0.72 : 0.42); vCol = vec4(cD * k, k); }\n' +
    '  gl_PointSize = uSize * (0.65 + 0.7 * h(aSeed * 7.3)) * (1.0 + wave * 0.6 + f * 0.8) / c.w;\n' +
    '}';
  var FS_PTS = '#version 300 es\nprecision mediump float;\n' +
    'in vec4 vCol; out vec4 o;\n' +
    'void main(){ float d = length(gl_PointCoord - 0.5); float k = smoothstep(0.5, 0.05, d); o = vCol * k; }';

  // Hale ve yörünge halkaları
  var VS_LINE = '#version 300 es\n' +
    'in vec3 aPos; uniform mat4 uModel, uView, uProj; uniform float uSize;\n' +
    'void main(){ vec4 c = uProj * uView * uModel * vec4(aPos, 1.0); gl_Position = c; gl_PointSize = uSize / c.w; }';
  var FS_LINE = '#version 300 es\nprecision mediump float;\n' +
    'uniform vec4 uColor; out vec4 o;\n' +
    'void main(){ float d = length(gl_PointCoord - 0.5); o = uColor * smoothstep(0.5, 0.1, d); }';

  var VS_RING = '#version 300 es\n' +
    'in vec3 aPos; in vec3 aNor; uniform mat4 uModel, uView, uProj; out vec3 vN; out vec3 vP;\n' +
    'void main(){ vec4 w = uModel * vec4(aPos, 1.0); vP = w.xyz; vN = mat3(uModel) * aNor; gl_Position = uProj * uView * w; }';
  var FS_RING = '#version 300 es\nprecision mediump float;\n' +
    'in vec3 vN; in vec3 vP; uniform vec3 uCam; uniform vec3 uColor; uniform float uAlpha, uCutY; out vec4 o;\n' +
    'void main(){ vec3 N = normalize(vN), V = normalize(uCam - vP); float f = abs(dot(N, V));\n' +
    '  float k = uAlpha * smoothstep(uCutY - 0.08, uCutY + 0.01, vP.y);\n' +
    '  vec3 c = uColor * (0.6 + 0.5 * f) + vec3(1.0) * pow(f, 12.0) * 0.35; o = vec4(c * k, k); }';

  function shader(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  function program(vs, fs, attrs) {
    var p = gl.createProgram();
    gl.attachShader(p, shader(gl.VERTEX_SHADER, vs)); gl.attachShader(p, shader(gl.FRAGMENT_SHADER, fs));
    attrs.forEach(function (a, i) { gl.bindAttribLocation(p, i, a); });
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    var u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (var i = 0; i < n; i++) { var info = gl.getActiveUniform(p, i); u[info.name] = gl.getUniformLocation(p, info.name); }
    return { p: p, u: u };
  }
  function buffers(list) {
    var vao = gl.createVertexArray(); gl.bindVertexArray(vao);
    list.forEach(function (a, i) {
      var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, a[0], gl.STATIC_DRAW);
      gl.enableVertexAttribArray(i); gl.vertexAttribPointer(i, a[1], gl.FLOAT, false, 0, 0);
    });
    gl.bindVertexArray(null);
    return vao;
  }

  var progPts = program(VS_PTS, FS_PTS, ['aPos', 'aNor', 'aSeed', 'aFace', 'aAO']);
  var progRing = program(VS_RING, FS_RING, ['aPos', 'aNor']);
  var progLine = program(VS_LINE, FS_LINE, ['aPos']);

  /* ---------- Yükleme ---------- */
  var cloud = null, rings = [], head = null, nodeY = 0, ready = false, born = 0, ao = null;

  Promise.all([fetch(BASE + 'bust.gltf').then(function (r) { return r.json(); }), fetch(BASE + 'marble_bust_01.bin').then(function (r) { return r.arrayBuffer(); })])
    .then(function (res) {
      var g = res[0], bin = res[1], prim = g.meshes[0].primitives[0];
      function acc(i, Arr, comps) {
        var a = g.accessors[i], v = g.bufferViews[a.bufferView];
        return new Arr(bin, (v.byteOffset || 0) + (a.byteOffset || 0), a.count * comps);
      }
      var pos = new Float32Array(acc(prim.attributes.POSITION, Float32Array, 3));
      var ia = g.accessors[prim.indices];
      var idx = acc(prim.indices, ia.componentType === 5125 ? Uint32Array : Uint16Array, 1);
      nodeY = (g.nodes && g.nodes[0] && g.nodes[0].translation) ? g.nodes[0].translation[1] : 0;
      var maxY = -1e9;
      for (var i = 1; i < pos.length; i += 3) maxY = Math.max(maxY, pos[i]);
      head = { x: HC.x, y: maxY - 0.075, z: HC.z, top: maxY };
      var nor = soften(pos, idx);
      cloud = sample(pos, nor, idx, small ? 20000 : 42000);
      buildRings();
      ready = true; born = performance.now();
      host.classList.add('t-ready');
    })
    .catch(function (e) { if (window.console) console.warn('titus3d', e); });

  // Saç kütlesi düzleştirilir, yüz hatları yumuşatılır: cinsiyetsiz, sade bir baş biçimi.
  function soften(pos, idx) {
    var nv = pos.length / 3, key = {}, wid = new Int32Array(nv), wp = [], i, k, w;
    for (i = 0; i < nv; i++) {
      k = Math.round(pos[i * 3] * 1e5) + ',' + Math.round(pos[i * 3 + 1] * 1e5) + ',' + Math.round(pos[i * 3 + 2] * 1e5);
      if (key[k] === undefined) { key[k] = wp.length / 3; wp.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]); }
      wid[i] = key[k];
    }
    var nw = wp.length / 3, adj = [];
    for (i = 0; i < nw; i++) adj.push([]);
    for (i = 0; i < idx.length; i += 3) {
      var a = wid[idx[i]], b = wid[idx[i + 1]], c = wid[idx[i + 2]];
      adj[a].push(b, c); adj[b].push(a, c); adj[c].push(a, b);
    }
    var weight = new Float32Array(nw);
    for (w = 0; w < nw; w++) {
      var f = toF(wp[w * 3], wp[w * 3 + 2]), Y = wp[w * 3 + 1];
      if (Y < 0.235) continue;
      var hair = Math.min(1, Math.max(0, (Y - hairline(f[0], f[1]) + 0.01) / 0.02));
      var eye = Math.exp(-Math.pow(Math.hypot((Math.abs(f[0]) - 0.0295) / 0.014, (Y - 0.3555) / 0.008), 2));
      var mouth = Math.exp(-Math.pow(Math.hypot(f[0] / 0.025, (Y - 0.2855) / 0.009), 2));
      weight[w] = hair * 0.95 + (1 - hair) * 0.6 * (1 - Math.max(eye, mouth) * 0.8);
    }
    function pass(lam) {
      var out = wp.slice();
      for (w = 0; w < nw; w++) {
        if (!weight[w]) continue;
        var l = adj[w], sx = 0, sy = 0, sz = 0;
        for (var j = 0; j < l.length; j++) { sx += wp[l[j] * 3]; sy += wp[l[j] * 3 + 1]; sz += wp[l[j] * 3 + 2]; }
        var m = l.length || 1, t = lam * weight[w];
        out[w * 3] += (sx / m - wp[w * 3]) * t; out[w * 3 + 1] += (sy / m - wp[w * 3 + 1]) * t; out[w * 3 + 2] += (sz / m - wp[w * 3 + 2]) * t;
      }
      wp = out;
    }
    for (k = 0; k < 8; k++) { pass(0.5); pass(-0.32); }
    var n = new Float32Array(nw * 3);
    for (i = 0; i < idx.length; i += 3) {
      var A = wid[idx[i]], B = wid[idx[i + 1]], C = wid[idx[i + 2]];
      var ux = wp[B * 3] - wp[A * 3], uy = wp[B * 3 + 1] - wp[A * 3 + 1], uz = wp[B * 3 + 2] - wp[A * 3 + 2];
      var vx = wp[C * 3] - wp[A * 3], vy = wp[C * 3 + 1] - wp[A * 3 + 1], vz = wp[C * 3 + 2] - wp[A * 3 + 2];
      var cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
      [A, B, C].forEach(function (v) { n[v * 3] += cx; n[v * 3 + 1] += cy; n[v * 3 + 2] += cz; });
    }
    // Girinti: komşuların ortalaması normal yönünde öndeyse nokta bir çukurdadır
    var nl = new Float32Array(nw);
    for (w = 0; w < nw; w++) { var L0 = Math.hypot(n[w * 3], n[w * 3 + 1], n[w * 3 + 2]) || 1; nl[w] = L0; }
    var cav = new Float32Array(nw);
    for (w = 0; w < nw; w++) {
      var l = adj[w]; if (!l.length) continue;
      var mx = 0, my = 0, mz = 0, e = 0;
      for (var j = 0; j < l.length; j++) {
        var q = l[j]; mx += wp[q * 3]; my += wp[q * 3 + 1]; mz += wp[q * 3 + 2];
        e += Math.hypot(wp[q * 3] - wp[w * 3], wp[q * 3 + 1] - wp[w * 3 + 1], wp[q * 3 + 2] - wp[w * 3 + 2]);
      }
      var m = l.length; e = e / m || 1;
      var dx = mx / m - wp[w * 3], dy = my / m - wp[w * 3 + 1], dz = mz / m - wp[w * 3 + 2];
      cav[w] = (dx * n[w * 3] + dy * n[w * 3 + 1] + dz * n[w * 3 + 2]) / nl[w] / e;
    }
    // Biraz yayılır ki çukurlar lekeli değil yumuşak görünsün
    for (k = 0; k < 3; k++) {
      var c2 = new Float32Array(nw);
      for (w = 0; w < nw; w++) { var l2 = adj[w], sum = cav[w]; for (j = 0; j < l2.length; j++) sum += cav[l2[j]]; c2[w] = sum / (l2.length + 1); }
      cav = c2;
    }
    ao = new Float32Array(nv);
    var nor = new Float32Array(nv * 3);
    for (i = 0; i < nv; i++) {
      w = wid[i];
      ao[i] = Math.max(0, cav[w] * 3.5);
      var L = Math.hypot(n[w * 3], n[w * 3 + 1], n[w * 3 + 2]) || 1;
      pos[i * 3] = wp[w * 3]; pos[i * 3 + 1] = wp[w * 3 + 1]; pos[i * 3 + 2] = wp[w * 3 + 2];
      nor[i * 3] = n[w * 3] / L; nor[i * 3 + 1] = n[w * 3 + 1] / L; nor[i * 3 + 2] = n[w * 3 + 2] / L;
    }
    return nor;
  }

  // Yüzeyden alanla orantılı nokta örnekleme; yüz bölgesi daha yoğun, kaide dışarıda
  function sample(pos, nor, idx, count) {
    var tri = idx.length / 3, cum = new Float32Array(tri), total = 0, i;
    var rng = (function () { var s = 1234567; return function () { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; })();
    function isFace(x, y, z) { var f = toF(x, z); return y > 0.24 && y < hairline(f[0], f[1]) && f[1] > 0.02 ? 1 : 0; }
    function region(x, y, z) {
      var f = toF(x, z);
      if (y > 0.27 && y > hairline(f[0], f[1]) - 0.004) return 2;
      if (isFace(x, y, z)) {
        var de = Math.hypot((Math.abs(f[0]) - 0.031) / 0.0135, (y - 0.3555) / 0.0048);
        var dm = Math.hypot(f[0] / 0.025, (y - 0.2855) / 0.0058);
        if (de < 1 && f[1] > 0.08) return 4;
        if (dm < 1 && f[1] > 0.1) return 3;
        // Boşluğun kenarı: göz kapağı ve dudak çizgisi
        if (de < 1.4 && f[1] > 0.08) return 5;
        if (dm < 1.35 && f[1] > 0.1) return 6;
        return 1;
      }
      return 0;
    }
    for (i = 0; i < tri; i++) {
      var a = idx[i * 3] * 3, b = idx[i * 3 + 1] * 3, c = idx[i * 3 + 2] * 3;
      var cy = (pos[a + 1] + pos[b + 1] + pos[c + 1]) / 3;
      var ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2];
      var vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
      var ar = 0.5 * Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx);
      if (cy < 0.05) ar = 0;
      else if (isFace((pos[a] + pos[b] + pos[c]) / 3, cy, (pos[a + 2] + pos[b + 2] + pos[c + 2]) / 3)) ar *= 2.4;
      else if (cy < 0.2) ar *= 0.55;
      total += ar; cum[i] = total;
    }
    var P = new Float32Array(count * 3), N = new Float32Array(count * 3), S = new Float32Array(count), F = new Float32Array(count), O = new Float32Array(count);
    var tries = 0;
    for (var k = 0; k < count; k++) {
      var r = rng() * total, lo = 0, hi = tri - 1;
      while (lo < hi) { var mid = (lo + hi) >> 1; if (cum[mid] < r) lo = mid + 1; else hi = mid; }
      var A = idx[lo * 3] * 3, B = idx[lo * 3 + 1] * 3, C = idx[lo * 3 + 2] * 3;
      var r1 = Math.sqrt(rng()), r2 = rng(), wa = 1 - r1, wb = r1 * (1 - r2), wc = r1 * r2;
      for (var j = 0; j < 3; j++) {
        P[k * 3 + j] = pos[A + j] * wa + pos[B + j] * wb + pos[C + j] * wc;
        N[k * 3 + j] = nor[A + j] * wa + nor[B + j] * wb + nor[C + j] * wc;
      }
      O[k] = ao[A / 3] * wa + ao[B / 3] * wb + ao[C / 3] * wc;
      S[k] = rng() * 100;
      F[k] = region(P[k * 3], P[k * 3 + 1], P[k * 3 + 2]);
      if (F[k] > 2.5 && tries++ < count * 4) { k--; continue; }
    }
    return { vao: buffers([[P, 3], [N, 3], [S, 1], [F, 1], [O, 1]]), n: count };
  }

  function norm3(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function cross3(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function tubeRing(radius, r) {
    var path = [], pos = [], nor = [], idx = [], n = 128, sides = 8, i, k;
    for (i = 0; i < n; i++) { var b = i / n * Math.PI * 2; path.push([Math.cos(b) * radius, Math.sin(b) * radius, 0]); }
    for (i = 0; i < n; i++) {
      var p = path[i], q = path[(i + 1) % n], pr = path[(i - 1 + n) % n];
      var t = norm3([q[0] - pr[0], q[1] - pr[1], q[2] - pr[2]]), bb = norm3(cross3(t, [0, 0, 1])), nn = cross3(bb, t);
      for (k = 0; k < sides; k++) {
        var a = k / sides * Math.PI * 2, c = Math.cos(a), si = Math.sin(a);
        var d = [nn[0] * c + bb[0] * si, nn[1] * c + bb[1] * si, nn[2] * c + bb[2] * si];
        pos.push(p[0] + d[0] * r, p[1] + d[1] * r, p[2] + d[2] * r); nor.push(d[0], d[1], d[2]);
      }
    }
    for (i = 0; i < n; i++) for (k = 0; k < sides; k++) {
      var a0 = i * sides + k, a1 = i * sides + (k + 1) % sides, b0 = ((i + 1) % n) * sides + k, b1 = ((i + 1) % n) * sides + (k + 1) % sides;
      idx.push(a0, b0, a1, a1, b0, b1);
    }
    var vao = buffers([[new Float32Array(pos), 3], [new Float32Array(nor), 3]]);
    gl.bindVertexArray(vao);
    var ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
    gl.bindVertexArray(null);
    return { vao: vao, n: idx.length };
  }

  // Başın arkasında önceki modeldeki iki dolu halka, omuz hizasında yavaş dönen nokta yörüngesi
  var halo = [];
  function buildRings() {
    halo.push(tubeRing(0.15, 0.0022), tubeRing(0.168, 0.0011));
    [[0.21, 90]].forEach(function (rr) {
      var p = new Float32Array(rr[1] * 3);
      for (var i = 0; i < rr[1]; i++) { var a = i / rr[1] * Math.PI * 2; p[i * 3] = Math.cos(a) * rr[0]; p[i * 3 + 1] = Math.sin(a) * rr[0]; }
      rings.push({ vao: buffers([[p, 3]]), n: rr[1] });
    });
  }

  /* ---------- Çizim ---------- */
  var W = 0, H = 0, dpr = 1;
  function resize() {
    var r = cv.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1);
    W = Math.max(1, Math.round(r.width * dpr)); H = Math.max(1, Math.round(r.height * dpr));
    cv.width = W; cv.height = H;
    gl.viewport(0, 0, W, H);
  }
  resize();
  window.addEventListener('resize', resize);

  function hex(h) { return [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255]; }
  // Koyu zemin (varsayılan): ışık gibi toplanan açık turkuaz ve pembe noktalar
  var DARK = { a: hex('#F7DCE4'), b: hex('#6FB0B0'), c: hex('#DA7B93'), d: hex('#1A0A0E'), alpha: 1.0, additive: true,
    ring: hex('#F7E6EB'), ring2: hex('#DA7B93'), orbit: hex('#6FB0B0') };
  // Açık zemin: mürekkep gibi koyu yeşil ve turkuaz noktalar
  var LIGHT = { a: hex('#376E6F'), b: hex('#1C3334'), c: hex('#C25A75'), d: hex('#1C3334'), alpha: 1.0, additive: false,
    ring: hex('#376E6F'), ring2: hex('#C25A75'), orbit: hex('#376E6F') };

  var yaw = 0, pitch = 0, nod = 0, glow = 0, time = 0, hover = 0, pulse = -1, ptr = [0, 0, 0];
  function draw() {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (!ready) return;
    var light = root.getAttribute('data-theme') === 'light', pal = light ? LIGHT : DARK;
    var cam = [0, 0.3, 1.36];
    var proj = persp(28 * Math.PI / 180, W / H, 0.05, 10);
    var view = trans(-cam[0], -cam[1], -cam[2]);
    var model = mul(trans(0, nodeY, 0), mul(rotY(yaw), mul(rotX(pitch), trans(-head.x, 0, -head.z * 0.6))));
    if (nod) model = mul(model, mul(trans(head.x, head.y - 0.1, head.z), mul(rotX(nod), trans(-head.x, -(head.y - 0.1), -head.z))));
    var assemble = reduced ? 1 : Math.min(1, (time - born) / 2200);

    gl.disable(gl.DEPTH_TEST); gl.enable(gl.BLEND);
    if (pal.additive) gl.blendFunc(gl.ONE, gl.ONE); else gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // Hale: başın arkasında ters yönlerde dönen iki dolu halka
    gl.useProgram(progRing.p);
    gl.uniformMatrix4fv(progRing.u.uView, false, view);
    gl.uniformMatrix4fv(progRing.u.uProj, false, proj);
    gl.uniform3fv(progRing.u.uCam, cam);
    gl.uniform1f(progRing.u.uCutY, model[1] * head.x + model[5] * (head.y - 0.02) + model[9] * head.z + model[13]);
    halo.forEach(function (m, i) {
      var hm = mul(model, mul(trans(head.x, head.y + 0.012, head.z - 0.11), mul(rotZ(time / (i ? -9000 : 7000)), rotX(0.08))));
      gl.uniformMatrix4fv(progRing.u.uModel, false, hm);
      gl.uniform3fv(progRing.u.uColor, i ? pal.ring2 : pal.ring);
      gl.uniform1f(progRing.u.uAlpha, (i ? 0.6 : 0.85) * assemble * (0.85 + 0.25 * Math.max(hover, glow)));
      gl.bindVertexArray(m.vao); gl.drawElements(gl.TRIANGLES, m.n, gl.UNSIGNED_SHORT, 0);
    });
    // Omuz hizasındaki nokta yörüngesi
    gl.useProgram(progLine.p);
    gl.uniformMatrix4fv(progLine.u.uView, false, view);
    gl.uniformMatrix4fv(progLine.u.uProj, false, proj);
    rings.forEach(function (r) {
      gl.uniformMatrix4fv(progLine.u.uModel, false, mul(model, mul(trans(head.x, 0.2, head.z), mul(rotX(Math.PI / 2 - 0.25), rotZ(time / 6000)))));
      var c = pal.orbit, k = 0.55 * assemble;
      gl.uniform4f(progLine.u.uColor, c[0] * k, c[1] * k, c[2] * k, k);
      gl.uniform1f(progLine.u.uSize, 5 * dpr);
      gl.bindVertexArray(r.vao); gl.drawArrays(gl.POINTS, 0, r.n);
    });

    // Yüz
    gl.useProgram(progPts.p);
    var u = progPts.u;
    gl.uniformMatrix4fv(u.uModel, false, model);
    gl.uniformMatrix4fv(u.uView, false, view);
    gl.uniformMatrix4fv(u.uProj, false, proj);
    gl.uniform3fv(u.uCam, cam);
    gl.uniform1f(u.uTime, time / 1000);
    gl.uniform1f(u.uAssemble, assemble);
    gl.uniform1f(u.uPulse, pulse);
    gl.uniform1f(u.uGlow, glow);
    gl.uniform1f(u.uHover, hover);
    gl.uniform1f(u.uSize, (small ? 3.6 : 2.9) * dpr * Math.min(1.6, H / dpr / 560));
    gl.uniform1f(u.uAsp, W / H);
    gl.uniform3fv(u.uPtr, ptr);
    gl.uniform3fv(u.cA, pal.a); gl.uniform3fv(u.cB, pal.b); gl.uniform3fv(u.cC, pal.c); gl.uniform3fv(u.cD, pal.d);
    gl.uniform1f(u.uAlpha, pal.alpha);
    gl.bindVertexArray(cloud.vao);
    gl.uniform1f(u.uPass, 0); gl.drawArrays(gl.POINTS, 0, cloud.n);
    gl.disable(gl.BLEND);
    gl.bindVertexArray(null);
  }

  /* ---------- Hareket ve etkileşim ---------- */
  var tx = 0, ty = 0, cx = 0, cy = 0, last = -1e9, visible = true, nodT = -1e9, happy = 0, over = 0;
  var drag = null, dragYaw = 0, dragV = 0, lastDrag = -1e9, suppress = 0, px = 0, py = 0, pOn = 0;
  window.addEventListener('pointermove', function (e) {
    var r = host.getBoundingClientRect();
    tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (innerWidth / 2)));
    ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height * 0.35)) / (innerHeight / 2)));
    px = ((e.clientX - r.left) / r.width) * 2 - 1; py = 1 - ((e.clientY - r.top) / r.height) * 2;
    last = performance.now();
    if (drag) {
      var dx = e.clientX - drag.x;
      if (Math.abs(dx) > 6) drag.moved = true;
      if (drag.moved) { var ny = drag.y0 + dx / 140; dragV = ny - dragYaw; dragYaw = ny; lastDrag = last; }
    }
  }, { passive: true });
  host.addEventListener('pointerenter', function () { over = 1; });
  host.addEventListener('pointerleave', function () { over = 0; });
  host.addEventListener('pointerdown', function (e) { if (e.button === 0) drag = { x: e.clientX, y0: dragYaw, moved: false }; });
  window.addEventListener('pointerup', function () { if (drag && drag.moved) suppress = performance.now(); drag = null; });
  // Sürükleme sonrası tıklama, selamlaşma olarak sayılmaz
  host.addEventListener('click', function (e) {
    if (performance.now() - suppress < 250) { e.stopImmediatePropagation(); e.preventDefault(); }
  }, true);
  var hit = document.getElementById('tHit');
  if (hit) hit.style.touchAction = 'pan-y';
  host.addEventListener('titus:nod', function () { nodT = performance.now(); });
  host.addEventListener('titus:happy', function (e) { happy = e.detail ? 1 : 0; });

  function frame(now) {
    if (!visible) return;
    time = now;
    if (now - last > 2500) { tx = reduced ? 0 : Math.sin(now / 2800) * 0.45; ty = reduced ? 0 : Math.sin(now / 3900) * 0.2; }
    cx += (tx - cx) * 0.05; cy += (ty - cy) * 0.05;
    if (!drag) {
      dragYaw += dragV; dragV *= 0.93;
      if (now - lastDrag > 1800) { var home = Math.round(dragYaw / (Math.PI * 2)) * Math.PI * 2; dragYaw += (home - dragYaw) * 0.04; }
    }
    yaw = cx * 0.5 * (rtl ? -1 : 1) + dragYaw;
    pitch = cy * 0.12;
    var nt = (now - nodT) / 800;
    nod = nt >= 0 && nt < 1 ? Math.sin(nt * Math.PI * 2) * 0.09 * (1 - nt) : 0;
    var pt = (now - nodT) / 1300;
    pulse = pt >= 0 && pt < 1 ? pt : -1;
    glow += (happy - glow) * 0.12;
    hover += (over - hover) * 0.08;
    pOn += ((over && !drag && !reduced ? 1 : 0) - pOn) * 0.1;
    ptr[0] = px; ptr[1] = py; ptr[2] = pOn;
    draw();
    requestAnimationFrame(frame);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      var was = visible;
      visible = en[0].isIntersecting;
      if (visible && !was) requestAnimationFrame(frame);
    }).observe(host);
  }
  requestAnimationFrame(frame);
})();
