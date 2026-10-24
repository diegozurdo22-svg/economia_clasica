/* =====================================================================
   app.js
   Enrutador de salas (SPA), navegación, plano del museo, audio-guía
   (texto a voz), sonido ambiental y armado de las salas I, III, IV y V.
   La Sala II usa chart-simulator.js y el Laboratorio usa quiz-engine.js.
   ===================================================================== */
(function () {
  "use strict";

  var D = Museo.data;
  var SALAS = D.salas;
  var IDS = SALAS.map(function (s) { return s.id; });
  var CLAVE = "museoMalthus.visitadas";
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------ util */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function leer(k, def) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } }
  function guardar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function salaPorId(id) { for (var i = 0; i < SALAS.length; i++) if (SALAS[i].id === id) return SALAS[i]; return null; }

  var toastTimer = 0;
  function toast(msg) {
    var t = $("#toast");
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 2600);
  }

  /* ------------------------------------------------------------ visitas */
  var visitadas = leer(CLAVE, []);
  if (!Array.isArray(visitadas)) visitadas = [];
  function marcarVisita(id) {
    if (visitadas.indexOf(id) === -1) { visitadas.push(id); guardar(CLAVE, visitadas); }
  }
  function salasTematicasVisitadas() {
    return ["sala-1", "sala-2", "sala-3", "sala-4", "sala-5"].filter(function (id) { return visitadas.indexOf(id) > -1; }).length;
  }

  /* ============================================================ AUDIO-GUÍA */
  var Voz = (function () {
    var ok = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
    var voz = null, activo = null;
    function elegirVoz() {
      if (!ok) return;
      var vs = speechSynthesis.getVoices();
      var pref = ["es-AR", "es-419", "es-US", "es-MX", "es-ES", "es"];
      for (var i = 0; i < pref.length && !voz; i++) {
        for (var j = 0; j < vs.length; j++) if (vs[j].lang && vs[j].lang.replace("_", "-").indexOf(pref[i]) === 0) { voz = vs[j]; break; }
      }
    }
    if (ok) { elegirVoz(); speechSynthesis.onvoiceschanged = elegirVoz; }

    function detener() {
      if (!ok) return;
      speechSynthesis.cancel();
      if (activo) { pintar(activo, false); activo = null; }
    }
    function pintar(btn, sonando) {
      btn.setAttribute("aria-pressed", sonando ? "true" : "false");
      btn.querySelector(".audio-btn__txt").textContent = sonando ? "Detener audio-guía" : "Escuchar audio-guía";
    }
    function reproducir(btn, texto) {
      if (!ok) return;
      if (activo === btn) { detener(); return; }
      detener();
      // Se divide en oraciones: Chrome corta los enunciados largos.
      var partes = texto.match(/[^.!?]+[.!?]*/g) || [texto];
      activo = btn; pintar(btn, true);
      partes.forEach(function (p, i) {
        var u = new SpeechSynthesisUtterance(p.trim());
        u.lang = voz ? voz.lang : "es-AR";
        if (voz) u.voice = voz;
        u.rate = 0.98;
        if (i === partes.length - 1) u.onend = function () { if (activo === btn) { pintar(btn, false); activo = null; } };
        speechSynthesis.speak(u);
      });
    }
    return { ok: ok, reproducir: reproducir, detener: detener };
  })();

  function audioguia(id, texto) {
    return '<div class="audioguia">' +
      '<button type="button" class="audio-btn" data-audio-play="' + id + '" aria-pressed="false"' + (Voz.ok ? "" : " disabled") + '>' +
        '<span class="audio-btn__icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3a3 3 0 00-3 3v6a3 3 0 006 0V6a3 3 0 00-3-3zM5 11a7 7 0 0014 0M12 18v3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg></span>' +
        '<span class="audio-btn__txt">' + (Voz.ok ? "Escuchar audio-guía" : "Audio-guía no disponible en este navegador") + "</span>" +
        '<span class="audio-btn__bars" aria-hidden="true"><i></i><i></i><i></i></span>' +
      "</button>" +
      '<details class="notas"' + (Voz.ok ? "" : " open") + '><summary>Tarjeta de notas</summary><p>' + esc(texto) + "</p></details>" +
    "</div>";
  }

  /* ============================================================ AMBIENTE */
  var Ambiente = (function () {
    var ctx = null, master = null, on = false;
    function crear() {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
      // Rumor de sala: ruido marrón filtrado
      var len = ctx.sampleRate * 4, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0), last = 0;
      for (var i = 0; i < len; i++) { var w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.2; }
      var src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      var lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 520;
      var gN = ctx.createGain(); gN.gain.value = 0.5;
      src.connect(lp); lp.connect(gN); gN.connect(master); src.start();
      // Acorde muy suave (quinta) con respiración lenta
      [110, 164.8, 220].forEach(function (f, k) {
        var o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f;
        var g = ctx.createGain(); g.gain.value = 0.035 / (k + 1);
        var lfo = ctx.createOscillator(); lfo.frequency.value = 0.05 + k * 0.03;
        var lg = ctx.createGain(); lg.gain.value = 0.02 / (k + 1);
        lfo.connect(lg); lg.connect(g.gain);
        o.connect(g); g.connect(master); o.start(); lfo.start();
      });
      return true;
    }
    function alternar() {
      if (!ctx && !crear()) { toast("Este navegador no permite sonido ambiental."); return false; }
      on = !on;
      if (ctx.state === "suspended") ctx.resume();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(on ? 0.22 : 0, ctx.currentTime, 0.6);
      return on;
    }
    return { alternar: alternar };
  })();

  /* ============================================================ PLANTILLAS */
  function muro(sala, ambiente, texto) {
    return '<header class="muro"><div class="wrap muro__inner">' +
      '<div class="muro__id">' +
        '<p class="muro__num">' + esc(sala.numero) + "</p>" +
        '<h2 class="muro__title" id="t-' + sala.id + '">' + esc(sala.titulo) + "</h2>" +
        '<p class="muro__amb"><span>Ambiente</span> ' + esc(ambiente) + "</p>" +
      "</div>" +
      audioguia(sala.id, texto) +
    "</div></header>";
  }
  function salida(id) {
    var i = IDS.indexOf(id), prev = SALAS[i - 1], next = SALAS[i + 1];
    return '<nav class="salida wrap" aria-label="Recorrido">' +
      (prev ? '<a class="salida__link salida__link--prev" href="#' + prev.id + '" data-goto="' + prev.id + '"><span class="eyebrow">Anterior · ' + esc(prev.numero) + "</span><span>" + esc(prev.titulo) + "</span></a>" : "<span></span>") +
      (next ? '<a class="salida__link salida__link--next" href="#' + next.id + '" data-goto="' + next.id + '"><span class="eyebrow">Siguiente · ' + esc(next.numero) + "</span><span>" + esc(next.titulo) + "</span></a>" : "<span></span>") +
    "</nav>";
  }
  function lista(items) { return "<ul>" + items.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>"; }

  /* ------------------------------------------------------------ HALL */
  function armarHall() {
    var i = D.institucion, h = D.hall;
    $('[data-fill="inst"]').textContent = i.universidad + " · " + i.materia;
    $('[data-fill="unidad"]').textContent = i.unidad;
    $('[data-fill="bienvenida"]').textContent = h.bienvenida;
    $('[data-fill="catedra"]').textContent = i.catedra;
    $('[data-fill="ficha"]').innerHTML =
      '<span class="label__name">' + esc(h.ficha.nombre) + "</span>" +
      '<span class="label__line">' + esc(h.ficha.vida) + " · Economista y pastor anglicano</span>" +
      '<span class="label__line"><em>' + esc(h.ficha.obra) + "</em></span>" +
      '<span class="label__cat">' + esc(h.ficha.nota) + "</span>";
    $('[data-audio="hall"]').innerHTML = '<div class="wrap">' + audioguia("hall", h.audio) + "</div>";
  }

  /* ------------------------------------------------------------ SALA I */
  function armarSala1(sec) {
    var s = D.sala1, sala = salaPorId("sala-1");
    sec.innerHTML = muro(sala, s.ambiente, s.audio) +
      '<div class="piso wrap">' +
        '<div class="contexto">' +
          '<figure class="grabado"><img src="assets/industrial-context.png" alt="Grabado en sepia del campo inglés con arados tirados por caballos y molinos hidráulicos con chimeneas al fondo" width="1200" height="670" loading="lazy">' +
          "<figcaption>" + esc(s.contexto.pie) + "</figcaption></figure>" +
          '<div class="placa"><p class="eyebrow">Cédula de sala</p><h3>' + esc(s.contexto.titulo) + "</h3>" + lista(s.contexto.puntos) + "</div>" +
        "</div>" +

        '<blockquote class="cita-muro"><p>' + esc(s.cita.texto) + "</p><cite>" + esc(s.cita.fuente) + "</cite></blockquote>" +

        '<div class="sec-head"><p class="eyebrow">Interactivo</p><h3>Inspeccioná los dos atriles</h3><p>Abrí cada atril para comparar el diagnóstico sobre el origen de la pobreza.</p></div>' +
        '<div class="atriles">' +
          s.atriles.map(function (a) {
            return '<article class="atril" data-atril="' + a.id + '">' +
              '<div class="atril__top"><p class="atril__cat">' + esc(a.cat) + "</p>" +
              "<h4>" + esc(a.titulo) + "</h4>" +
              '<p class="atril__autores">' + esc(a.autores) + "</p>" +
              '<p class="atril__tesis">' + esc(a.tesis) + "</p></div>" +
              '<button type="button" class="atril__btn" aria-expanded="false" aria-controls="det-' + a.id + '"><span>Inspeccionar</span>' +
              '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>' +
              '<div class="atril__det" id="det-' + a.id + '" hidden>' + lista(a.puntos) +
              '<p class="atril__veredicto">' + esc(a.veredicto) + "</p></div>" +
              '<div class="atril__base" aria-hidden="true"></div>' +
            "</article>";
          }).join('<div class="atriles__vs" aria-hidden="true">vs.</div>') +
        "</div>" +
        '<p class="comparador" data-comparador hidden>Los dos atriles miran la misma miseria. Godwin y Condorcet la explican por las instituciones; Malthus, por la naturaleza. Ese desplazamiento organiza todo el resto del museo.</p>' +
        '<aside class="nota-pie"><span class="eyebrow">Dato de archivo</span> ' + esc(s.nota) + "</aside>" +
      "</div>" + salida("sala-1");

    var abiertos = {};
    $$(".atril", sec).forEach(function (art) {
      var btn = $(".atril__btn", art), det = $(".atril__det", art);
      btn.addEventListener("click", function () {
        var abrir = det.hidden;
        det.hidden = !abrir;
        btn.setAttribute("aria-expanded", abrir ? "true" : "false");
        btn.querySelector("span").textContent = abrir ? "Cerrar" : "Inspeccionar";
        art.classList.toggle("is-open", abrir);
        if (abrir) abiertos[art.getAttribute("data-atril")] = true;
        if (abiertos.godwin && abiertos.malthus) $("[data-comparador]", sec).hidden = false;
      });
    });
  }

  /* ------------------------------------------------------------ SALA II */
  var simulador = null;
  function armarSala2(sec) {
    var s = D.sala2, sala = salaPorId("sala-2");
    sec.innerHTML = muro(sala, s.ambiente, s.audio) +
      '<div class="piso wrap">' +
        '<div class="postulados">' +
          s.postulados.map(function (p) {
            return '<article class="placa placa--bronce"><p class="eyebrow">' + esc(p.num) + "</p><h3>" + esc(p.titulo) + "</h3>" +
              '<p class="placa__cita">' + esc(p.cita) + "</p>" + lista(p.puntos) + "</article>";
          }).join("") +
        "</div>" +
        '<p class="conclusion"><span class="eyebrow">Conclusión lógica de ambos postulados</span>' + esc(s.conclusion) + "</p>" +
        '<div class="gabinete">' +
          '<div class="sim" id="simulador"></div>' +
          '<div class="series">' +
            '<article class="serie serie--pob"><p class="eyebrow">' + esc(s.poblacion.titulo) + '</p><p class="serie__num">' + esc(s.poblacion.serie) + "</p><p>" + esc(s.poblacion.texto) + "</p></article>" +
            '<article class="serie serie--ali"><p class="eyebrow">' + esc(s.alimentos.titulo) + '</p><p class="serie__num">' + esc(s.alimentos.serie) + "</p><p>" + esc(s.alimentos.texto) + "</p></article>" +
          "</div>" +
        "</div>" +
      "</div>" + salida("sala-2");
    simulador = Museo.Simulator.mount($("#simulador", sec), s);
  }

  /* ------------------------------------------------------------ SALA III */
  function armarSala3(sec) {
    var s = D.sala3, sala = salaPorId("sala-3");
    function flip(f, i) {
      return '<button type="button" class="flip flip--' + f.lado + '" aria-pressed="false" aria-label="' + esc(f.titulo) + ': dar vuelta la tarjeta">' +
        '<span class="flip__in">' +
          '<span class="flip__face flip__front"><span class="eyebrow">' + esc(f.etiqueta) + '</span><span class="flip__t">' + esc(f.titulo) + '</span><span class="flip__x">' + esc(f.frente) + '</span><span class="flip__hint">Tocá para dar vuelta</span></span>' +
          '<span class="flip__face flip__back"><span class="eyebrow">' + esc(f.titulo) + '</span><span class="flip__x">' + esc(f.dorso) + "</span></span>" +
        "</span></button>";
    }
    var prev = s.frenos.filter(function (f) { return f.lado === "preventivo"; });
    var rep = s.frenos.filter(function (f) { return f.lado === "represivo"; });

    sec.innerHTML = muro(sala, s.ambiente, s.audio) +
      '<div class="piso wrap">' +
        '<p class="intro">' + esc(s.intro) + "</p>" +
        '<div class="frenos">' +
          '<div class="frenos__col"><h3 class="frenos__h"><span>Platillo izquierdo</span>Frenos preventivos <small>bajan la natalidad</small></h3><div class="flips">' + prev.map(flip).join("") + "</div></div>" +
          '<div class="frenos__col"><h3 class="frenos__h"><span>Platillo derecho</span>Frenos represivos <small>elevan la mortalidad</small></h3><div class="flips">' + rep.map(flip).join("") + "</div></div>" +
        "</div>" +

        '<div class="sec-head"><p class="eyebrow">Clasificador</p><h3>Equilibrá la balanza</h3>' +
        "<p>Arrastrá cada situación histórica al platillo correcto. En pantallas táctiles, tocá la tarjeta y después el platillo.</p></div>" +
        '<div class="balanza" data-balanza>' +
          '<svg class="balanza__svg" viewBox="0 0 600 170" aria-hidden="true">' +
            '<path d="M300 40 L300 150 M260 160 L340 160 L320 150 L280 150 Z" class="balanza__pie"/>' +
            '<circle cx="300" cy="36" r="9" class="balanza__eje"/>' +
            '<g class="balanza__brazo" data-brazo>' +
              '<line x1="80" y1="36" x2="520" y2="36" class="balanza__barra"/>' +
              '<g data-plato="izq"><path d="M80 36 L50 96 M80 36 L110 96" class="balanza__hilo"/><path d="M36 96 Q80 124 124 96 Z" class="balanza__plato"/><text x="80" y="140" text-anchor="middle" class="balanza__n" data-n="preventivo">0</text></g>' +
              '<g data-plato="der"><path d="M520 36 L490 96 M520 36 L550 96" class="balanza__hilo"/><path d="M476 96 Q520 124 564 96 Z" class="balanza__plato"/><text x="520" y="140" text-anchor="middle" class="balanza__n" data-n="represivo">0</text></g>' +
            "</g>" +
          "</svg>" +
          '<div class="bandeja" data-bandeja aria-label="Situaciones por clasificar">' +
            s.situaciones.map(function (it) {
              return '<button type="button" class="ficha" draggable="true" data-ficha="' + it.id + '">' + esc(it.texto) + "</button>";
            }).join("") +
          "</div>" +
          '<div class="platillos">' +
            '<div class="platillo" data-zona="preventivo" tabindex="0" role="button" aria-label="Platillo de frenos preventivos"><p class="platillo__h">Frenos preventivos<small>natalidad ↓</small></p><div class="platillo__lista"></div></div>' +
            '<div class="platillo" data-zona="represivo" tabindex="0" role="button" aria-label="Platillo de frenos represivos"><p class="platillo__h">Frenos represivos<small>mortalidad ↑</small></p><div class="platillo__lista"></div></div>' +
          "</div>" +
          '<p class="balanza__fb" data-fb aria-live="polite">Quedan ' + s.situaciones.length + " situaciones por clasificar.</p>" +
          '<button type="button" class="btn btn--ghost btn--sm" data-reset>Reiniciar clasificador</button>' +
        "</div>" +
      "</div>" + salida("sala-3");

    $$(".flip", sec).forEach(function (b) {
      b.addEventListener("click", function () {
        var v = b.getAttribute("aria-pressed") !== "true";
        b.setAttribute("aria-pressed", v ? "true" : "false");
      });
    });
    clasificador(sec, s.situaciones);
  }

  function clasificador(sec, situaciones) {
    var porId = {}; situaciones.forEach(function (s) { porId[s.id] = s; });
    var bal = $("[data-balanza]", sec), fb = $("[data-fb]", sec), brazo = $("[data-brazo]", sec);
    var bandeja = $("[data-bandeja]", sec);
    var seleccion = null, errores = 0, cuenta = { preventivo: 0, represivo: 0 };

    function inclinar() {
      // el platillo con más peso baja (izquierda = preventivos)
      var dif = cuenta.represivo - cuenta.preventivo;
      var ang = Math.max(-14, Math.min(14, dif * 3.5));
      brazo.style.transform = "rotate(" + ang + "deg)";
      $$("[data-plato]", sec).forEach(function (p) {
        p.style.transform = "rotate(" + (-ang) + "deg)";
        p.style.transformOrigin = (p.getAttribute("data-plato") === "izq" ? "80px" : "520px") + " 36px";
      });
      $('[data-n="preventivo"]', sec).textContent = cuenta.preventivo;
      $('[data-n="represivo"]', sec).textContent = cuenta.represivo;
    }
    function seleccionar(btn) {
      if (seleccion) seleccion.classList.remove("is-sel");
      seleccion = btn === seleccion ? null : btn;
      if (seleccion) seleccion.classList.add("is-sel");
      bal.classList.toggle("is-eligiendo", !!seleccion);
    }
    function soltar(fichaId, zona) {
      var btn = $('[data-ficha="' + fichaId + '"]', bandeja);
      if (!btn) return;
      var it = porId[fichaId];
      if (it.freno === zona) {
        cuenta[zona]++;
        btn.remove();
        var item = document.createElement("p");
        item.className = "colocada";
        item.textContent = it.texto;
        $('[data-zona="' + zona + '"] .platillo__lista', sec).appendChild(item);
        fb.className = "balanza__fb is-ok";
        var quedan = $$(".ficha", bandeja).length;
        fb.textContent = "Correcto. " + it.explica + (quedan ? " Quedan " + quedan + "." : "");
        if (!quedan) {
          fb.textContent = "Balanza equilibrada: clasificaste las " + situaciones.length + " situaciones" +
            (errores ? " con " + errores + (errores === 1 ? " error." : " errores.") : " sin errores.");
          bal.classList.add("is-completa");
        }
      } else {
        errores++;
        btn.classList.remove("is-shake"); void btn.offsetWidth; btn.classList.add("is-shake");
        fb.className = "balanza__fb is-bad";
        fb.textContent = "Ese no es el platillo. Pensá si la situación actúa sobre los nacimientos o sobre las muertes.";
      }
      if (seleccion) seleccionar(seleccion);
      inclinar();
    }

    bandeja.addEventListener("click", function (e) {
      var b = e.target.closest(".ficha"); if (b) seleccionar(b);
    });
    bandeja.addEventListener("dragstart", function (e) {
      var b = e.target.closest(".ficha"); if (!b) return;
      e.dataTransfer.setData("text/plain", b.getAttribute("data-ficha"));
      e.dataTransfer.effectAllowed = "move";
      b.classList.add("is-drag");
    });
    bandeja.addEventListener("dragend", function (e) {
      var b = e.target.closest(".ficha"); if (b) b.classList.remove("is-drag");
    });
    $$("[data-zona]", sec).forEach(function (z) {
      var zona = z.getAttribute("data-zona");
      z.addEventListener("dragover", function (e) { e.preventDefault(); z.classList.add("is-over"); });
      z.addEventListener("dragleave", function () { z.classList.remove("is-over"); });
      z.addEventListener("drop", function (e) {
        e.preventDefault(); z.classList.remove("is-over");
        soltar(e.dataTransfer.getData("text/plain"), zona);
      });
      function elegir() {
        if (seleccion) soltar(seleccion.getAttribute("data-ficha"), zona);
        else { fb.className = "balanza__fb"; fb.textContent = "Primero elegí una situación de la bandeja."; }
      }
      z.addEventListener("click", elegir);
      z.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); elegir(); } });
    });
    $("[data-reset]", sec).addEventListener("click", function () { armarSala3(sec); });
    inclinar();
  }

  /* ------------------------------------------------------------ SALA IV */
  function armarSala4(sec) {
    var s = D.sala4, sala = salaPorId("sala-4");
    // Orden del debate: alterna acusación y defensa
    var turnos = [];
    for (var i = 0; i < 3; i++) {
      turnos.push({ lado: "acusacion", a: s.acusacion.argumentos[i], i: i });
      turnos.push({ lado: "defensa", a: s.defensa.argumentos[i], i: i });
    }
    var opcionesVoto = turnos.map(function (t, k) { return { k: k, t: t.a.titulo }; });

    sec.innerHTML = muro(sala, s.ambiente, s.audio) +
      '<div class="piso wrap">' +
        '<p class="causa">' + esc(s.causa) + "</p>" +
        '<p class="intro">' + esc(s.intro) + "</p>" +
        '<div class="tribunal">' +
          '<section class="pedestal pedestal--acusacion" aria-labelledby="ped-a"><header><p class="eyebrow">Pedestal I</p><h3 id="ped-a">' + esc(s.acusacion.titulo) + '</h3><p class="pedestal__quien">' + esc(s.acusacion.quien) + '</p></header><div class="pedestal__args" data-lado="acusacion"></div></section>' +
          '<div class="estrado">' +
            '<p class="estrado__cont" data-cont>Intervención 0 de ' + turnos.length + "</p>" +
            '<button type="button" class="btn btn--primary btn--sm" data-siguiente>Llamar a la primera intervención</button>' +
            '<button type="button" class="estrado__todo" data-todas>Mostrar todas</button>' +
            '<svg class="mazo" viewBox="0 0 64 64" aria-hidden="true"><rect x="10" y="14" width="30" height="14" rx="3" transform="rotate(-30 25 21)" class="mazo__cabeza"/><path d="M30 26 L50 52" class="mazo__mango"/><rect x="8" y="50" width="40" height="6" rx="2" class="mazo__base"/></svg>' +
          "</div>" +
          '<section class="pedestal pedestal--defensa" aria-labelledby="ped-d"><header><p class="eyebrow">Pedestal II</p><h3 id="ped-d">' + esc(s.defensa.titulo) + '</h3><p class="pedestal__quien">' + esc(s.defensa.quien) + '</p></header><div class="pedestal__args" data-lado="defensa"></div></section>' +
        "</div>" +
        '<form class="veredicto" data-veredicto hidden>' +
          '<fieldset><legend>Tu veredicto: ¿qué intervención te resultó más sólida?</legend>' +
          '<div class="veredicto__ops">' + opcionesVoto.map(function (o) {
            return '<label><input type="radio" name="voto" value="' + o.k + '"><span>' + esc(o.t) + "</span></label>";
          }).join("") + "</div></fieldset>" +
          '<button class="btn btn--primary btn--sm" type="submit">Emitir veredicto</button>' +
          '<p class="veredicto__res" data-res hidden></p>' +
        "</form>" +
        '<aside class="nota-pie"><span class="eyebrow">Epílogo, 1834</span> ' + esc(s.epilogo) + "</aside>" +
      "</div>" + salida("sala-4");

    var n = 0, btn = $("[data-siguiente]", sec), cont = $("[data-cont]", sec), todas = $("[data-todas]", sec);
    function revelar() {
      if (n >= turnos.length) return;
      var t = turnos[n];
      var card = document.createElement("article");
      card.className = "argumento argumento--" + t.lado;
      card.innerHTML = '<p class="argumento__n">' + (t.lado === "acusacion" ? "Acusación" : "Réplica") + " " + (t.i + 1) + "</p><h4>" + esc(t.a.titulo) + "</h4><p>" + esc(t.a.texto) + "</p>";
      $('[data-lado="' + t.lado + '"]', sec).appendChild(card);
      n++;
      cont.textContent = "Intervención " + n + " de " + turnos.length;
      if (n < turnos.length) {
        btn.textContent = turnos[n].lado === "acusacion" ? "Llamar a Malthus al estrado" : "Escuchar la réplica";
      } else {
        btn.hidden = true; todas.hidden = true;
        $("[data-veredicto]", sec).hidden = false;
      }
    }
    btn.addEventListener("click", revelar);
    todas.addEventListener("click", function () { while (n < turnos.length) revelar(); });

    var votoPrevio = leer("museoMalthus.veredicto", null);
    $("[data-veredicto]", sec).addEventListener("submit", function (e) {
      e.preventDefault();
      var sel = $('input[name="voto"]:checked', sec), res = $("[data-res]", sec);
      if (!sel) { res.hidden = false; res.textContent = "Elegí una intervención antes de emitir el veredicto."; return; }
      var t = turnos[Number(sel.value)];
      guardar("museoMalthus.veredicto", Number(sel.value));
      res.hidden = false;
      res.textContent = t.lado === "acusacion"
        ? "Fallaste a favor de Malthus («" + t.a.titulo + "»). Para el debate en clase: ¿qué supuesto sobre la oferta de alimentos necesita ese argumento para sostenerse?"
        : "Fallaste a favor de la defensa («" + t.a.titulo + "»). Para el debate en clase: ¿cómo respondería Malthus si la producción de alimentos no pudiera crecer?";
    });
    if (votoPrevio !== null) {
      var r = $('input[name="voto"][value="' + votoPrevio + '"]', sec); if (r) r.checked = true;
    }
  }

  /* ------------------------------------------------------------ SALA V */
  function armarSala5(sec) {
    var s = D.sala5, sala = salaPorId("sala-5");
    sec.innerHTML = muro(sala, s.ambiente, s.audio) +
      '<div class="piso wrap">' +
        '<p class="intro">' + esc(s.intro) + "</p>" +
        '<div class="vitrinas" role="tablist" aria-label="Vitrinas">' +
          s.vitrinas.map(function (v, i) {
            return '<button type="button" class="vitrina" role="tab" id="tab-' + v.id + '" aria-controls="pan-' + v.id + '" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '">' +
              '<span class="vitrina__vidrio" aria-hidden="true"><span class="vitrina__objeto vitrina__objeto--' + v.id + '"></span></span>' +
              '<span class="eyebrow">' + esc(v.cat) + "</span>" +
              '<span class="vitrina__t">' + esc(v.titulo) + "</span>" +
              '<span class="vitrina__f">' + esc(v.fecha) + "</span>" +
            "</button>";
          }).join("") +
        "</div>" +
        s.vitrinas.map(function (v, i) {
          return '<section class="panel" role="tabpanel" id="pan-' + v.id + '" aria-labelledby="tab-' + v.id + '"' + (i === 0 ? "" : " hidden") + ">" +
            '<div class="panel__txt"><p class="panel__res">' + esc(v.resumen) + "</p>" + lista(v.cuerpo) + "</div>" +
            '<figure class="ciclo" aria-label="Mecanismo: ' + esc(v.ciclo.join(", ")) + '"><figcaption class="eyebrow">Mecanismo</figcaption><ol>' +
              v.ciclo.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") +
            "</ol><p class='ciclo__vuelta'>↺ y el ciclo recomienza</p></figure>" +
          "</section>";
        }).join("") +
        '<section class="porque"><h3>' + esc(s.porQue.titulo) + '</h3><div class="porque__grid">' +
          s.porQue.items.map(function (it) { return "<article><h4>" + esc(it.titulo) + "</h4><p>" + esc(it.texto) + "</p></article>"; }).join("") +
        "</div></section>" +
      "</div>" + salida("sala-5");

    var tabs = $$(".vitrina", sec);
    function activar(tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1;
        $("#" + t.getAttribute("aria-controls"), sec).hidden = !on;
      });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { activar(t); });
      t.addEventListener("keydown", function (e) {
        var k = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!k) return;
        e.preventDefault();
        var n = tabs[(i + k + tabs.length) % tabs.length]; activar(n); n.focus();
      });
    });
  }

  /* ------------------------------------------------------------ LAB */
  function armarLab(sec) {
    var s = D.lab, sala = salaPorId("lab");
    sec.innerHTML = muro(sala, "Laboratorio de autoevaluación", s.audio) +
      '<div class="piso wrap piso--lab">' +
        '<p class="intro">' + esc(s.intro) + "</p>" +
        '<div id="quiz"></div>' +
      "</div>" + salida("lab");
    Museo.Quiz.mount($("#quiz", sec), s, {
      salasVisitadas: salasTematicasVisitadas,
      onBoleto: function () { toast("Boleto emitido."); }
    });
  }

  /* ============================================================ NAVEGACIÓN */
  function armarNav() {
    $("#roomnav").innerHTML = SALAS.map(function (s) {
      return '<li><a class="roomnav__link" href="#' + s.id + '" data-goto="' + s.id + '" title="' + esc(s.numero + ": " + s.titulo) + '">' +
        '<span class="tick" aria-hidden="true"></span>' + esc(s.id === "hall" || s.id === "lab" ? s.corto : "Sala " + s.corto) + "</a></li>";
    }).join("");
  }

  function armarPlano() {
    // Recorrido en U: Hall → I → II → III → IV → V → Lab
    var celdas = {
      "sala-3": [20, 20], "sala-4": [210, 20], "sala-5": [400, 20],
      "sala-2": [20, 150], "lab": [400, 150],
      "sala-1": [20, 280], "hall": [210, 280]
    };
    var w = 180, h = 120;
    var svg = '<svg viewBox="0 0 600 420" role="group" aria-label="Plano del museo">' +
      '<rect x="210" y="150" width="180" height="120" class="plano__patio"/>' +
      '<text x="300" y="206" text-anchor="middle" class="plano__patiotxt">Patio</text>' +
      '<text x="300" y="224" text-anchor="middle" class="plano__patiotxt plano__patiotxt--s">de la Ilustración</text>' +
      '<rect x="400" y="280" width="180" height="120" class="plano__patio"/>' +
      '<text x="490" y="346" text-anchor="middle" class="plano__patiotxt">Salida</text>' +
      '<path d="M300 340 L110 340 L110 80 L490 80 L490 210" class="plano__ruta"/>';
    SALAS.forEach(function (s) {
      var c = celdas[s.id]; if (!c) return;
      svg += '<a href="#' + s.id + '" data-goto="' + s.id + '" class="plano__sala" data-plano="' + s.id + '" aria-label="' + esc(s.numero + ": " + s.titulo) + '">' +
        '<rect x="' + c[0] + '" y="' + c[1] + '" width="' + w + '" height="' + h + '" rx="2"/>' +
        '<text x="' + (c[0] + 14) + '" y="' + (c[1] + 28) + '" class="plano__num">' + esc(s.numero) + "</text>" +
        '<foreignObject x="' + (c[0] + 12) + '" y="' + (c[1] + 38) + '" width="' + (w - 24) + '" height="' + (h - 46) + '"><p xmlns="http://www.w3.org/1999/xhtml" class="plano__tit">' + esc(s.titulo) + "</p></foreignObject>" +
        '<circle cx="' + (c[0] + w - 18) + '" cy="' + (c[1] + 22) + '" r="6" class="plano__pin"/>' +
      "</a>";
    });
    svg += "</svg>";
    $("#plano-map").innerHTML = svg;
  }

  var plano = null;
  function abrirPlano() {
    pintarEstado();
    if (plano.showModal) plano.showModal(); else plano.setAttribute("open", "");
  }
  function cerrarPlano() { if (plano.close) plano.close(); else plano.removeAttribute("open"); }

  var actual = null;
  function pintarEstado() {
    $$(".roomnav__link").forEach(function (a) {
      var id = a.getAttribute("data-goto");
      if (id === actual) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
      a.classList.toggle("is-visto", visitadas.indexOf(id) > -1);
    });
    $$("[data-plano]").forEach(function (g) {
      var id = g.getAttribute("data-plano");
      g.classList.toggle("is-visto", visitadas.indexOf(id) > -1);
      g.classList.toggle("is-aqui", id === actual);
    });
    var pct = (IDS.indexOf(actual) / (IDS.length - 1)) * 100;
    $("#progress-bar").style.width = pct + "%";
    var link = $('.roomnav__link[aria-current="page"]');
    if (link && link.scrollIntoView) {
      var nav = $(".roomnav"); var r = link.getBoundingClientRect(), rn = nav.getBoundingClientRect();
      if (r.left < rn.left || r.right > rn.right) nav.scrollLeft += r.left - rn.left - rn.width / 2 + r.width / 2;
    }
  }

  function ir(id, opts) {
    opts = opts || {};
    if (IDS.indexOf(id) === -1) id = "hall";
    if (id === actual) { pintarEstado(); return; }
    Voz.detener();
    if (simulador) simulador.detener();
    var sale = actual ? $("#" + actual) : null, entra = $("#" + id);
    actual = id;
    marcarVisita(id);
    document.title = (id === "hall" ? "" : salaPorId(id).numero + " · ") + "Museo Malthus UNLa";

    function mostrar() {
      if (sale) { sale.hidden = true; sale.classList.remove("is-leaving"); }
      entra.hidden = false;
      entra.classList.remove("is-entering"); void entra.offsetWidth; entra.classList.add("is-entering");
      window.scrollTo({ top: 0, behavior: "auto" });
      if (opts.foco !== false) { var h = $("h1, h2", entra); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); } }
    }
    if (sale && !reduce) { sale.classList.add("is-leaving"); setTimeout(mostrar, 260); }
    else mostrar();

    if (opts.push !== false) { try { history.pushState({ sala: id }, "", "#" + id); } catch (e) {} }
    pintarEstado();
  }

  /* ============================================================ INICIO */
  function iniciar() {
    armarNav();
    armarHall();
    armarSala1($("#sala-1"));
    armarSala2($("#sala-2"));
    armarSala3($("#sala-3"));
    armarSala4($("#sala-4"));
    armarSala5($("#sala-5"));
    armarLab($("#lab"));
    armarPlano();
    plano = $("#plano");

    // Clics de navegación (delegados)
    document.addEventListener("click", function (e) {
      var a = e.target.closest("[data-goto]");
      if (a) {
        e.preventDefault();
        if (plano.open) cerrarPlano();
        ir(a.getAttribute("data-goto"));
        return;
      }
      if (e.target.closest("[data-open-plano]")) { abrirPlano(); return; }
      if (e.target.closest("[data-close-plano]")) { cerrarPlano(); return; }
      var au = e.target.closest("[data-audio-play]");
      if (au) {
        var id = au.getAttribute("data-audio-play");
        var txt = id === "hall" ? D.hall.audio : id === "lab" ? D.lab.audio : D["sala" + id.split("-")[1]].audio;
        Voz.reproducir(au, txt);
      }
    });
    plano.addEventListener("click", function (e) { if (e.target === plano) cerrarPlano(); });
    $("#btn-plano").addEventListener("click", abrirPlano);
    $("#btn-ambiente").addEventListener("click", function () {
      var on = Ambiente.alternar();
      this.setAttribute("aria-pressed", on ? "true" : "false");
      toast(on ? "Sonido ambiental activado." : "Sonido ambiental apagado.");
    });

    window.addEventListener("popstate", function () { ir((location.hash || "#hall").slice(1), { push: false }); });
    window.addEventListener("hashchange", function () { ir((location.hash || "#hall").slice(1), { push: false }); });
    document.addEventListener("keydown", function (e) {
      if (e.target.closest("input, textarea, select, [role=tab]")) return;
      if (plano.open) return;
      var i = IDS.indexOf(actual);
      if (e.altKey && e.key === "ArrowRight" && i < IDS.length - 1) ir(IDS[i + 1]);
      if (e.altKey && e.key === "ArrowLeft" && i > 0) ir(IDS[i - 1]);
    });

    ir((location.hash || "#hall").slice(1), { push: false, foco: false });
  }

  Museo.app = { ir: ir, toast: toast, visitadas: salasTematicasVisitadas };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
