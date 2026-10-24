/* =====================================================================
   quiz-engine.js
   Laboratorio — Prueba de la Cátedra: 4 preguntas de opción múltiple
   con devolución inmediata y emisión del Boleto de Visita / Certificado.
   ===================================================================== */
window.Museo = window.Museo || {};

Museo.Quiz = (function () {
  "use strict";

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fechaLarga(d) {
    return d.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
  }
  function numeroBoleto(nombre, d) {
    var h = 0, s = nombre + d.toISOString().slice(0, 10);
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return "1798-" + String(h % 100000).padStart(5, "0");
  }

  /* Sello circular de la cátedra (SVG), reutilizado en pantalla */
  function selloSVG(id) {
    return '<svg class="sello" viewBox="0 0 160 160" aria-label="Sello de la cátedra Levinton – Zurdo, UNLa" role="img">' +
      '<defs><path id="' + id + '" d="M80 80 m-58 0 a58 58 0 1 1 116 0 a58 58 0 1 1 -116 0"/></defs>' +
      '<circle cx="80" cy="80" r="74" class="sello__ring"/>' +
      '<circle cx="80" cy="80" r="44" class="sello__ring sello__ring--in"/>' +
      '<text class="sello__arc"><textPath href="#' + id + '" startOffset="0">CÁTEDRA LEVINTON – ZURDO · UNLa · ECONOMÍA CLÁSICA ·</textPath></text>' +
      '<text x="80" y="74" text-anchor="middle" class="sello__big">VI</text>' +
      '<text x="80" y="96" text-anchor="middle" class="sello__small">MALTHUS · 1798</text>' +
      "</svg>";
  }

  function mount(root, datos, opciones) {
    opciones = opciones || {};
    var preguntas = datos.preguntas;
    var idx = 0, aciertos = 0, respuestas = [];

    root.innerHTML =
      '<div class="quiz" aria-live="polite">' +
        '<div class="quiz__bar"><span class="eyebrow" data-q="paso"></span>' +
        '<ol class="quiz__dots" aria-hidden="true">' + preguntas.map(function () { return "<li></li>"; }).join("") + "</ol></div>" +
        '<div class="quiz__stage" data-q="stage"></div>' +
      "</div>";
    var stage = root.querySelector('[data-q="stage"]');
    var paso = root.querySelector('[data-q="paso"]');
    var dots = root.querySelectorAll(".quiz__dots li");

    function mostrarPregunta() {
      var q = preguntas[idx];
      paso.textContent = "Pregunta " + (idx + 1) + " de " + preguntas.length;
      dots.forEach(function (d, i) { d.classList.toggle("is-now", i === idx); });
      stage.innerHTML =
        '<fieldset class="quiz__q">' +
          '<legend class="quiz__enunciado">' + esc(q.enunciado) + "</legend>" +
          '<div class="quiz__opts">' +
            q.opciones.map(function (o) {
              return '<button type="button" class="opt" data-opt="' + o.id + '"><span class="opt__key">' + o.id.toUpperCase() + "</span><span>" + esc(o.texto) + "</span></button>";
            }).join("") +
          "</div>" +
        "</fieldset>" +
        '<div class="quiz__fb" data-q="fb" hidden></div>';
      stage.querySelectorAll(".opt").forEach(function (b) {
        b.addEventListener("click", function () { responder(b.getAttribute("data-opt")); });
      });
      var primero = stage.querySelector(".opt");
      if (primero && opciones.enfocar) primero.focus({ preventScroll: true });
    }

    function responder(elegida) {
      var q = preguntas[idx];
      var ok = elegida === q.correcta;
      if (ok) aciertos++;
      respuestas.push({ id: q.id, ok: ok });
      dots[idx].classList.add(ok ? "is-ok" : "is-bad");
      stage.querySelectorAll(".opt").forEach(function (b) {
        var id = b.getAttribute("data-opt");
        b.disabled = true;
        if (id === q.correcta) b.classList.add("is-correct");
        else if (id === elegida) b.classList.add("is-wrong");
      });
      var fb = stage.querySelector('[data-q="fb"]');
      var ultima = idx === preguntas.length - 1;
      fb.className = "quiz__fb " + (ok ? "is-ok" : "is-bad");
      fb.innerHTML =
        "<p class='quiz__verdict'>" + (ok ? "Correcto." : "No es esa. La respuesta es la " + q.correcta.toUpperCase() + ".") + "</p>" +
        "<p>" + esc(q.explicacion) + "</p>" +
        '<button type="button" class="btn btn--primary btn--sm" data-q="next">' + (ultima ? "Ver resultado" : "Siguiente pregunta") + "</button>";
      fb.hidden = false;
      var next = fb.querySelector('[data-q="next"]');
      next.addEventListener("click", function () {
        idx++;
        if (idx < preguntas.length) { mostrarPregunta(); stage.querySelector(".opt").focus({ preventScroll: true }); }
        else resultado();
      });
      next.focus({ preventScroll: true });
    }

    function resultado() {
      paso.textContent = "Resultado";
      dots.forEach(function (d) { d.classList.remove("is-now"); });
      var msg = aciertos === preguntas.length ? "Recorrido impecable."
        : aciertos >= preguntas.length / 2 ? "Buen recorrido. Repasá las salas de las preguntas que fallaste."
        : "Conviene volver a las salas antes de rendir.";
      stage.innerHTML =
        '<div class="quiz__result">' +
          '<p class="quiz__score"><span>' + aciertos + "</span> / " + preguntas.length + "</p>" +
          '<p class="quiz__msg">' + msg + "</p>" +
          '<form class="quiz__form" data-q="form" novalidate>' +
            '<label for="quiz-nombre">Nombre y apellido para el boleto</label>' +
            '<div class="quiz__row">' +
              '<input id="quiz-nombre" name="nombre" type="text" maxlength="60" autocomplete="name" placeholder="Ej.: Juana Manso" required>' +
              '<button class="btn btn--primary" type="submit">Emitir boleto</button>' +
            "</div>" +
            '<p class="quiz__err" data-q="err" hidden>Escribí tu nombre para emitir el boleto.</p>' +
          "</form>" +
          '<button type="button" class="btn btn--ghost btn--sm" data-q="retry">Volver a intentar la prueba</button>' +
        "</div>";
      var form = stage.querySelector('[data-q="form"]');
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var nombre = form.nombre.value.trim().replace(/\s+/g, " ");
        var err = stage.querySelector('[data-q="err"]');
        if (!nombre) { err.hidden = false; form.nombre.focus(); return; }
        err.hidden = true;
        boleto(nombre);
      });
      stage.querySelector('[data-q="retry"]').addEventListener("click", reiniciar);
      form.nombre.focus({ preventScroll: true });
    }

    function reiniciar() {
      idx = 0; aciertos = 0; respuestas = [];
      dots.forEach(function (d) { d.className = ""; });
      mostrarPregunta();
    }

    function boleto(nombre) {
      var hoy = new Date();
      var visitadas = opciones.salasVisitadas ? opciones.salasVisitadas() : 5;
      var num = numeroBoleto(nombre, hoy);
      var info = {
        nombre: nombre, fecha: fechaLarga(hoy), num: num,
        aciertos: aciertos, total: preguntas.length, salas: visitadas
      };
      var esSitio = document.body.getAttribute("data-env") !== "artifact";
      paso.textContent = "Boleto emitido";
      stage.innerHTML =
        '<article class="ticket" aria-label="Boleto de visita">' +
          '<div class="ticket__stub">' +
            '<span class="ticket__adm">Admisión</span>' +
            '<span class="ticket__num">N.º ' + num + "</span>" +
            '<span class="ticket__stubtxt">Válido para una visita · UNLa</span>' +
          "</div>" +
          '<div class="ticket__main">' +
            '<p class="eyebrow">Boleto de visita · Certificado de recorrido</p>' +
            '<h3 class="ticket__title">Museo Virtual: El Principio de la Población</h3>' +
            '<p class="ticket__body">Se certifica que <strong class="ticket__name">' + esc(nombre) + "</strong> recorrió " +
              visitadas + " de 5 salas y completó la Prueba de la Cátedra con " + aciertos + " de " + preguntas.length + " respuestas correctas.</p>" +
            '<dl class="ticket__meta">' +
              "<div><dt>Materia</dt><dd>Economía Clásica · Unidad VI</dd></div>" +
              "<div><dt>Cátedra</dt><dd>Levinton – Zurdo</dd></div>" +
              "<div><dt>Fecha</dt><dd>" + info.fecha + "</dd></div>" +
            "</dl>" +
          "</div>" +
          '<div class="ticket__seal">' + selloSVG("arc-" + num) + "</div>" +
        "</article>" +
        '<div class="ticket__actions">' +
          (esSitio
            ? '<button type="button" class="btn btn--primary btn--sm" data-q="png">Descargar boleto (PNG)</button>'
            : '<p class="ticket__hint">Para guardar el boleto, hacé una captura de pantalla.</p>') +
          '<button type="button" class="btn btn--ghost btn--sm" data-q="retry">Hacer la prueba otra vez</button>' +
        "</div>";
      stage.querySelector('[data-q="retry"]').addEventListener("click", reiniciar);
      var png = stage.querySelector('[data-q="png"]');
      if (png) png.addEventListener("click", function () { descargarPNG(info); });
      if (opciones.onBoleto) opciones.onBoleto(info);
    }

    mostrarPregunta();
  }

  /* ---------- Exportación del boleto a PNG con <canvas> ---------- */
  function descargarPNG(info) {
    var listo = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    listo.then(function () {
      var logo = new Image();
      logo.onload = function () { dibujarYBajar(info, logo); };
      logo.onerror = function () { dibujarYBajar(info, null); };
      logo.src = "assets/unla-logo.png";
    });
  }

  function dibujarYBajar(info, logo) {
    var c = document.createElement("canvas");
    var W = 1600, H = 700;
    c.width = W; c.height = H;
    var g = c.getContext("2d");
    var GRANATE = "#56121E", DORADO = "#D4AF37", HUESO = "#FAF8F5", TINTA = "#1A1A1A";

    g.fillStyle = HUESO; g.fillRect(0, 0, W, H);
    // talón
    g.fillStyle = GRANATE; g.fillRect(0, 0, 330, H);
    g.strokeStyle = DORADO; g.lineWidth = 3; g.strokeRect(18, 18, W - 36, H - 36);
    // perforado
    g.fillStyle = HUESO;
    for (var yy = 40; yy < H - 30; yy += 28) { g.beginPath(); g.arc(330, yy, 6, 0, Math.PI * 2); g.fill(); }

    if (logo) { try { g.drawImage(logo, 85, 70, 160, 156); } catch (e) {} }
    g.fillStyle = HUESO;
    g.font = "500 22px 'IBM Plex Mono', monospace";
    g.textAlign = "center";
    g.fillText("ADMISIÓN", 165, 300);
    g.font = "400 44px 'Libre Caslon Display', serif";
    g.fillText("N.º " + info.num, 165, 360);
    g.font = "400 18px 'IBM Plex Mono', monospace";
    g.fillStyle = "#E7CFC9";
    g.fillText("Válido para una visita", 165, 610);
    g.fillText("UNLa", 165, 638);

    g.textAlign = "left";
    g.fillStyle = "#7E6210";
    g.font = "500 20px 'IBM Plex Mono', monospace";
    g.fillText("BOLETO DE VISITA · CERTIFICADO DE RECORRIDO", 400, 110);
    g.fillStyle = TINTA;
    g.font = "400 54px 'Libre Caslon Display', serif";
    g.fillText("Museo Virtual:", 400, 185);
    g.fillText("El Principio de la Población", 400, 248);

    g.fillStyle = "#5F4D50";
    g.font = "400 26px 'Instrument Sans', sans-serif";
    g.fillText("Se certifica que", 400, 330);
    g.fillStyle = GRANATE;
    g.font = "italic 400 50px 'Libre Caslon Text', serif";
    var nombre = info.nombre;
    while (g.measureText(nombre).width > 860 && nombre.length > 4) nombre = nombre.slice(0, -2);
    if (nombre !== info.nombre) nombre += "…";
    g.fillText(nombre, 400, 395);
    g.fillStyle = TINTA;
    g.font = "400 26px 'Instrument Sans', sans-serif";
    g.fillText("recorrió " + info.salas + " de 5 salas y completó la Prueba de la Cátedra", 400, 448);
    g.fillText("con " + info.aciertos + " de " + info.total + " respuestas correctas.", 400, 484);

    g.strokeStyle = "#DDCEC4"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(400, 540); g.lineTo(1270, 540); g.stroke();
    g.font = "500 17px 'IBM Plex Mono', monospace"; g.fillStyle = "#7E6210";
    g.fillText("MATERIA", 400, 580); g.fillText("CÁTEDRA", 760, 580); g.fillText("FECHA", 1020, 580);
    g.font = "400 22px 'Instrument Sans', sans-serif"; g.fillStyle = TINTA;
    g.fillText("Economía Clásica · Unidad VI", 400, 614);
    g.fillText("Levinton – Zurdo", 760, 614);
    g.fillText(info.fecha, 1020, 614);

    dibujarSello(g, 1420, 330, 130, GRANATE);

    var nombreArchivo = "boleto-museo-malthus-" + info.nombre.toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + ".png";
    try {
      c.toBlob(function (blob) {
        if (!blob) { if (logo) dibujarYBajar(info, null); return; }
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url; a.download = nombreArchivo;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        if (Museo.app && Museo.app.toast) Museo.app.toast("Boleto descargado.");
      }, "image/png");
    } catch (e) {
      // Abierto desde file:// el logo "contamina" el canvas: se reintenta sin logo.
      if (logo) dibujarYBajar(info, null);
    }
  }

  function dibujarSello(g, cx, cy, r, color) {
    g.save();
    g.translate(cx, cy);
    g.rotate(-0.18);
    g.strokeStyle = color; g.fillStyle = color; g.globalAlpha = .88;
    g.lineWidth = 5; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 2; g.beginPath(); g.arc(0, 0, r - 12, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.arc(0, 0, r * .58, 0, Math.PI * 2); g.stroke();
    var txt = "CÁTEDRA LEVINTON – ZURDO · UNLa · ECONOMÍA CLÁSICA · ";
    g.font = "600 19px 'Instrument Sans', sans-serif";
    g.textAlign = "center"; g.textBaseline = "middle";
    var radio = r - 34, total = 0, i;
    for (i = 0; i < txt.length; i++) total += g.measureText(txt[i]).width;
    var escala = (Math.PI * 2 * radio) / total, ang = -Math.PI / 2;
    for (i = 0; i < txt.length; i++) {
      var w = g.measureText(txt[i]).width * escala;
      ang += (w / radio) / 2;
      g.save(); g.rotate(ang); g.translate(0, -radio); g.fillText(txt[i], 0, 0); g.restore();
      ang += (w / radio) / 2;
    }
    g.font = "400 58px 'Libre Caslon Display', serif"; g.fillText("VI", 0, -10);
    g.font = "600 15px 'IBM Plex Mono', monospace"; g.fillText("MALTHUS · 1798", 0, 34);
    g.restore();
  }

  return { mount: mount, sello: selloSVG };
})();
