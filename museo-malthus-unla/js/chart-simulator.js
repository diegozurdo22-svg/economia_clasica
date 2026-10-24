/* =====================================================================
   chart-simulator.js
   Sala II — Simulador interactivo: progresión geométrica (población)
   vs. progresión aritmética (alimentos), de 0 a 150 años en pasos de 25.
   SVG propio, sin librerías: funciona offline y desde file://
   ===================================================================== */
window.Museo = window.Museo || {};

Museo.Simulator = (function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var PASO = 25, MAX_ANIO = 150, Y_MAX = 64;
  var UMBRAL_BRECHA = 50;                       // año en que se activa la alarma
  // Geometría: se elige al montar según el ancho de pantalla (ver mount)
  var W, H, M, PW, PH;
  function geometria() {
    var chico = window.innerWidth < 600;
    W = chico ? 400 : 680; H = chico ? 330 : 360;
    M = chico ? { l: 34, r: 96, t: 18, b: 40 } : { l: 46, r: 104, t: 18, b: 42 };
    PW = W - M.l - M.r; PH = H - M.t - M.b;
  }

  function poblacion(t) { return Math.pow(2, t / PASO); }
  function alimentos(t) { return 1 + t / PASO; }
  function x(t) { return M.l + (t / MAX_ANIO) * PW; }
  function y(v) { return M.t + PH - (v / Y_MAX) * PH; }
  function fmt(n) {
    return n.toLocaleString("es-AR", { maximumFractionDigits: n < 10 && n % 1 ? 2 : 0 });
  }
  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function pathDe(fn, hasta) {
    var d = "", paso = 1;
    for (var t = 0; t <= hasta + 1e-6; t += paso) {
      d += (t === 0 ? "M" : "L") + x(t).toFixed(1) + " " + y(fn(t)).toFixed(1);
    }
    if (hasta % paso) d += "L" + x(hasta).toFixed(1) + " " + y(fn(hasta)).toFixed(1);
    return d;
  }

  function mount(root, datos) {
    geometria();
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var pasos = []; for (var a = 0; a <= MAX_ANIO; a += PASO) pasos.push(a);

    root.innerHTML =
      '<div class="sim__head">' +
        '<div><p class="eyebrow">Instrumento n.º 2 · Simulador</p>' +
        '<h3 class="sim__title">Población frente a subsistencias</h3></div>' +
        '<ul class="sim__legend" aria-label="Series del gráfico">' +
          '<li><svg width="34" height="12" aria-hidden="true"><line x1="1" y1="6" x2="33" y2="6" class="ln ln--pob"/><circle cx="17" cy="6" r="4" class="mk mk--pob"/></svg>Población (×2 cada 25 años)</li>' +
          '<li><svg width="34" height="12" aria-hidden="true"><line x1="1" y1="6" x2="33" y2="6" class="ln ln--ali"/><rect x="13" y="2" width="8" height="8" class="mk mk--ali"/></svg>Alimentos (+1 cada 25 años)</li>' +
        '</ul>' +
      '</div>' +
      '<dl class="sim__readout">' +
        '<div><dt>Año</dt><dd data-r="anio">0</dd></div>' +
        '<div><dt>Población</dt><dd data-r="pob">1</dd></div>' +
        '<div><dt>Alimentos</dt><dd data-r="ali">1</dd></div>' +
        '<div><dt>Personas por ración</dt><dd data-r="rel">1</dd></div>' +
      '</dl>' +
      '<div class="sim__chart">' +
        '<svg class="sim__svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-labelledby="sim-desc"><desc id="sim-desc">Gráfico de líneas: la población crece de 1 a 64 y los alimentos de 1 a 7 entre el año 0 y el 150.</desc></svg>' +
        '<div class="sim__tip" hidden></div>' +
      '</div>' +
      '<div class="sim__alarm" role="status" aria-live="polite" hidden>' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l10 18H2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 10v5M12 18v.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
        '<div><strong>Zona de Brecha Malthusiana</strong><span data-r="alarma"></span></div>' +
      '</div>' +
      '<div class="sim__control">' +
        '<label for="sim-anio">Desplazá el tiempo</label>' +
        '<div class="sim__slider">' +
          '<input type="range" id="sim-anio" min="0" max="' + MAX_ANIO + '" step="' + PASO + '" value="0" aria-valuetext="Año 0">' +
          '<div class="sim__ticks" aria-hidden="true">' + pasos.map(function (p) { return "<span>" + p + "</span>"; }).join("") + '</div>' +
        '</div>' +
        '<button class="btn btn--ghost btn--sm" type="button" data-play>' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5l12 7-12 7z" fill="currentColor"/></svg><span>Reproducir</span></button>' +
      '</div>' +
      '<div class="sim__tablewrap">' +
        '<table class="sim__table"><caption>Tabla de las series (unidades relativas, base = 1)</caption>' +
        '<thead><tr><th scope="col">Año</th>' + pasos.map(function (p) { return '<th scope="col" data-col="' + p + '">' + p + "</th>"; }).join("") + "</tr></thead>" +
        "<tbody>" +
          '<tr><th scope="row">Población</th>' + pasos.map(function (p) { return '<td data-col="' + p + '">' + fmt(poblacion(p)) + "</td>"; }).join("") + "</tr>" +
          '<tr><th scope="row">Alimentos</th>' + pasos.map(function (p) { return '<td data-col="' + p + '">' + fmt(alimentos(p)) + "</td>"; }).join("") + "</tr>" +
          '<tr><th scope="row">Relación</th>' + pasos.map(function (p) { return '<td data-col="' + p + '">' + fmt(poblacion(p)) + ":" + fmt(alimentos(p)) + "</td>"; }).join("") + "</tr>" +
        "</tbody></table>" +
        '<p class="sim__nota">' + datos.remate + "</p>" +
      "</div>";

    var svg = root.querySelector("svg.sim__svg");
    var input = root.querySelector("#sim-anio");
    var alarm = root.querySelector(".sim__alarm");
    var tip = root.querySelector(".sim__tip");
    var btnPlay = root.querySelector("[data-play]");
    var R = {};
    root.querySelectorAll("[data-r]").forEach(function (n) { R[n.getAttribute("data-r")] = n; });

    /* ---------- estructura fija del gráfico ---------- */
    var gGrid = el("g", { "class": "grid" }, svg);
    [0, 16, 32, 48, 64].forEach(function (v) {
      el("line", { x1: M.l, x2: M.l + PW, y1: y(v), y2: y(v) }, gGrid);
      var t = el("text", { x: M.l - 10, y: y(v) + 4, "text-anchor": "end", "class": "axis" }, gGrid);
      t.textContent = v;
    });
    pasos.forEach(function (p) {
      var t = el("text", { x: x(p), y: H - M.b + 22, "text-anchor": "middle", "class": "axis" }, gGrid);
      t.textContent = p;
    });
    var tx = el("text", { x: M.l + PW, y: H - 4, "text-anchor": "end", "class": "axis axis--title" }, gGrid);
    tx.textContent = "años";
    var umbralX = x(UMBRAL_BRECHA);
    var gUmbral = el("g", { "class": "umbral" }, svg);
    el("line", { x1: umbralX, x2: umbralX, y1: M.t, y2: M.t + PH }, gUmbral);
    var tu = el("text", { x: umbralX + 6, y: M.t + 12, "class": "umbral__txt" }, gUmbral);
    tu.textContent = "umbral: año 50";

    // proyecciones completas (fantasma)
    el("path", { d: pathDe(poblacion, MAX_ANIO), "class": "ghost" }, svg);
    el("path", { d: pathDe(alimentos, MAX_ANIO), "class": "ghost" }, svg);

    var gap = el("path", { "class": "gap" }, svg);
    var gapTxt = el("text", { "class": "gap__txt", "text-anchor": "middle" }, svg);
    gapTxt.textContent = "Brecha";
    var lnAli = el("path", { "class": "ln ln--ali" }, svg);
    var lnPob = el("path", { "class": "ln ln--pob" }, svg);
    var gMk = el("g", {}, svg);
    var lbPob = el("text", { "class": "endlab endlab--pob" }, svg);
    var lbAli = el("text", { "class": "endlab endlab--ali" }, svg);
    var cross = el("line", { "class": "cross", y1: M.t, y2: M.t + PH }, svg);
    cross.style.display = "none";
    var hit = el("rect", { x: M.l, y: M.t, width: PW, height: PH, "class": "hit" }, svg);

    /* ---------- dibujo para un año t (continuo) ---------- */
    function dibujar(t) {
      lnPob.setAttribute("d", pathDe(poblacion, t));
      lnAli.setAttribute("d", pathDe(alimentos, t));

      // área de brecha entre ambas curvas
      var d = pathDe(poblacion, t);
      for (var s = t; s >= 0; s -= 1) d += "L" + x(s).toFixed(1) + " " + y(alimentos(s)).toFixed(1);
      gap.setAttribute("d", d + "Z");
      var mid = t * 0.88;
      gapTxt.setAttribute("x", x(mid));
      gapTxt.setAttribute("y", (y(poblacion(mid)) + y(alimentos(mid))) / 2 + 4);
      gapTxt.style.opacity = t >= 125 ? 1 : 0;

      // marcadores en los pasos alcanzados
      gMk.innerHTML = "";
      pasos.forEach(function (p) {
        if (p > t + 1e-6) return;
        el("rect", { x: x(p) - 4, y: y(alimentos(p)) - 4, width: 8, height: 8, "class": "mk mk--ali" }, gMk);
        el("circle", { cx: x(p), cy: y(poblacion(p)), r: 4.5, "class": "mk mk--pob" }, gMk);
      });

      // rótulos finales (se separan si las curvas están juntas)
      var yp = y(poblacion(t)), ya = y(alimentos(t));
      if (ya - yp < 30) { var c = (yp + ya) / 2; yp = c - 15; ya = c + 15; }
      lbPob.setAttribute("x", x(t) + 10); lbPob.setAttribute("y", yp + 4);
      lbAli.setAttribute("x", x(t) + 10); lbAli.setAttribute("y", ya + 4);
      lbPob.textContent = "Población " + fmt(Math.round(poblacion(t) * 100) / 100);
      lbAli.textContent = "Alimentos " + fmt(Math.round(alimentos(t) * 100) / 100);
    }

    /* ---------- estado discreto (slider) ---------- */
    function actualizar(anio) {
      var p = poblacion(anio), a = alimentos(anio);
      R.anio.textContent = anio;
      R.pob.textContent = fmt(p);
      R.ali.textContent = fmt(a);
      R.rel.textContent = fmt(Math.round((p / a) * 100) / 100);
      input.setAttribute("aria-valuetext", "Año " + anio + ": población " + fmt(p) + ", alimentos " + fmt(a));
      root.querySelectorAll("[data-col]").forEach(function (c) {
        c.classList.toggle("is-now", Number(c.getAttribute("data-col")) === anio);
        c.classList.toggle("is-future", Number(c.getAttribute("data-col")) > anio);
      });
      var enBrecha = anio >= UMBRAL_BRECHA;
      root.classList.toggle("is-alarm", enBrecha);
      alarm.hidden = !enBrecha;
      if (enBrecha) {
        R.alarma.textContent = " Año " + anio + ": hay " + fmt(p) + " personas para " + fmt(a) +
          " raciones. Los frenos represivos entran en acción.";
      }
    }

    var actual = 0, raf = 0;
    function irA(anio) {
      cancelAnimationFrame(raf);
      var desde = actual, dur = reduce ? 0 : 520, t0 = performance.now();
      actualizar(anio);
      function frame(now) {
        var k = dur ? Math.min(1, (now - t0) / dur) : 1;
        var e = 1 - Math.pow(1 - k, 3);
        actual = desde + (anio - desde) * e;
        dibujar(actual);
        if (k < 1) raf = requestAnimationFrame(frame);
        else actual = anio;
      }
      raf = requestAnimationFrame(frame);
    }

    input.addEventListener("input", function () { detener(); irA(Number(input.value)); });

    /* ---------- reproducción automática ---------- */
    var timer = 0;
    function detener() {
      clearInterval(timer); timer = 0;
      btnPlay.querySelector("span").textContent = "Reproducir";
    }
    btnPlay.addEventListener("click", function () {
      if (timer) { detener(); return; }
      if (Number(input.value) >= MAX_ANIO) { input.value = 0; irA(0); }
      btnPlay.querySelector("span").textContent = "Pausar";
      timer = setInterval(function () {
        var v = Number(input.value) + PASO;
        if (v > MAX_ANIO) { detener(); return; }
        input.value = v; irA(v);
      }, 1000);
    });

    /* ---------- capa de lectura (hover / toque) ---------- */
    function leer(ev) {
      var r = svg.getBoundingClientRect();
      var px = ((ev.clientX - r.left) / r.width) * W;
      var anio = Math.round(((px - M.l) / PW) * MAX_ANIO / PASO) * PASO;
      anio = Math.max(0, Math.min(MAX_ANIO, anio));
      cross.setAttribute("x1", x(anio)); cross.setAttribute("x2", x(anio));
      cross.style.display = "";
      var proy = anio > Number(input.value);
      tip.innerHTML = "<strong>Año " + anio + (proy ? " · proyección" : "") + "</strong>" +
        "<span><i class='sw sw--pob'></i>Población " + fmt(poblacion(anio)) + "</span>" +
        "<span><i class='sw sw--ali'></i>Alimentos " + fmt(alimentos(anio)) + "</span>";
      tip.hidden = false;
      var left = (x(anio) / W) * r.width;
      tip.style.left = Math.min(Math.max(left, 70), r.width - 70) + "px";
    }
    hit.addEventListener("pointermove", leer);
    hit.addEventListener("pointerdown", leer);
    hit.addEventListener("pointerleave", function () { tip.hidden = true; cross.style.display = "none"; });

    actualizar(0); dibujar(0);
    return { detener: detener };
  }

  return { mount: mount };
})();
