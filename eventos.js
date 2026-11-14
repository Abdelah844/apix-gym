// =====================================================
// APIX GYM · EVENTOS (qué pasa al pulsar o escribir)
// Un solo "escuchador" para toda la página: mira el atributo data-act del botón.
// =====================================================

document.addEventListener("click", function (ev) {
  prepararAudio();                       // el navegador solo deja sonar tras un toque
  const b = ev.target.closest("[data-act], [data-tab]");
  if (!b || b.disabled) return;
  // Si el tutorial está abierto y la persona toca otra cosa de la app, el tutorial se da por visto
  // y se quita (si no, se quedaba encima de la pantalla siguiente)
  if (typeof pasoTutorial !== "undefined" && pasoTutorial >= 0 && estado && !b.closest("#tutorial")) {
    pasoTutorial = -1;
    $("tutorial").hidden = true;
    for (const t of document.querySelectorAll("nav.tabs button")) t.classList.remove("tuto-on");
    estado.ajustes.tutorialVisto = true;
    guardar();
  }
  if (b.dataset.tab) { cerrarHoja(); irA(b.dataset.tab); return; }

  const act = b.dataset.act;
  const a = b.dataset.a, bb = b.dataset.b, c = b.dataset.c;
  const accion = ACCIONES[act];
  if (accion) accion(a, bb, c, b);
});

// Cerrar la hoja tocando el fondo oscuro
$("hoja").addEventListener("click", function (ev) { if (ev.target.id === "hoja") cerrarHoja(); });

const ACCIONES = {
  "tocar-apix": function (humor) {
    sonar(humor === "enfadado" ? "enfadado" : (humor === "celebra" || humor === "campeon" ? "record" : "racha"));
  },
  "probar-sonido": function (nombre) { sonar(nombre); },
  "instalar-app": function () {
    if (!avisoInstalar) return;
    avisoInstalar.prompt();
    avisoInstalar.userChoice.then(function () { avisoInstalar = null; hojaAjustes(); });
  },
  // ---------- Bienvenida y registro ----------
  "ir-registro": function () { pintarRegistro(); },
  "volver-bienvenida": function () { pintarBienvenida(); },
  // Invitado: primero se pregunta el nombre (se puede dejar vacío) y luego se entra con los datos de ejemplo
  "usar-demo": function () {
    abrirHoja(cabeceraHoja("Entrar como invitado", "") + '<div class="stack">' +
      '<label class="f">¿Cómo te llamas?<input id="fInvitado" maxlength="30" placeholder="Invitado" autocomplete="given-name"></label>' +
      '<p class="muted small">Verás la app con entrenos de ejemplo para probarla. Puedes cambiar tu nombre cuando quieras en Ajustes → Perfil.</p>' +
      '<button class="btn full" data-act="entrar-invitado">Entrar</button></div>');
  },
  "entrar-invitado": function () {
    const nombre = $("fInvitado") ? $("fInvitado").value.trim() : "";
    crearDemo();
    estado.perfil.nombre = nombre || (typeof tr === "function" ? tr("Invitado") : "Invitado");
    cerrarHoja(); guardar(); tab = "inicio"; pintar();
  },
  "crear-perfil": function () {
    const p = leerPerfil();
    if (!p) return;
    // Sin aceptar la política de privacidad no se crea el perfil
    const acepta = $("fPrivacidad").checked;
    $("fPrivError").textContent = acepta ? "" : "Para continuar, marca la casilla de la política de privacidad.";
    if (!acepta) return;
    estado = estadoVacio(p);
    estado.ajustes.privacidadAceptada = hoy() + " v" + VERSION_PRIVACIDAD;
    estado.bienvenidaApix = hoy();          // Apix se presenta solo el día que creas tu perfil
    estado.rutina = generarRutina({ objetivo: p.objetivo, nivel: p.experiencia, dias: p.dias, duracion: p.duracion,
      tipo: "auto", equipo: p.equipo, prioridad: "", evitar: p.evitar });
    guardar(); tab = "inicio"; pintar();
    mostrarTutorial(0);                     // la primera vez, Apix enseña la app
  },
  "salir-demo": function () { estado = null; borrarAlmacenamiento(); pintarRegistro(); },
  "reintentar-guardado": function () { if (!guardar()) mensaje("No se ha podido guardar", "El almacenamiento del navegador está lleno o bloqueado. Exporta tus datos desde Ajustes para no perderlos."); },

  // ---------- Hojas ----------
  "idioma": function (nuevo) { cambiarIdioma(nuevo); },
  "abrir-privacidad": function () { location.href = "privacidad.html"; },
  "privacidad-vista": function () {
    const antes = estado.ajustes.privacidadAceptada || "";
    estado.ajustes.privacidadAceptada = hoy() + " v" + VERSION_PRIVACIDAD + (antes.indexOf("nube") >= 0 ? " nube" : "");
    guardar(); cerrarHoja(); pintar();
  },
  "cerrar-hoja": function () { cerrarHoja(); confirmar = ""; pintar(); },
  "abrir-ajustes": function () { confirmar = ""; hojaAjustes(); },
  "abrir-generador": function () { confirmar = ""; hojaGenerador(!genOp); },
  "gen-elegir": function (campo, valor) {
    leerOpcionesAvanzadas();
    genOp[campo] = campo === "dias" || campo === "duracion" ? parseInt(valor) : valor;
    if (campo === "dias") genOp.calendario = calendarioPorDefecto(genOp.dias);   // propone días repartidos
    hojaGenerador();
  },
  "gen-dia": function (d) {
    d = parseInt(d);
    const c = genOp.calendario;
    if (c.includes(d)) c.splice(c.indexOf(d), 1); else c.push(d);
    c.sort(); hojaGenerador();
  },
  // ---------- Mi semana: días, horas y aviso ----------
  "abrir-semana": function () { hojaSemana(true); },
  "semana-dia": function (d) {
    d = parseInt(d);
    leerHorasSemana();
    if (semOp.dias.includes(d)) semOp.dias.splice(semOp.dias.indexOf(d), 1); else semOp.dias.push(d);
    hojaSemana();
  },
  "guardar-semana": function () {
    leerHorasSemana();
    if (semOp.dias.length < 1 || semOp.dias.length > 6) { $("semError").textContent = "Elige entre 1 y 6 días. Deja al menos un día de descanso."; return; }
    guardarSemana(semOp.dias, semOp.horas);
    estado.ajustes.notif.recordatorios = semOp.avisar;
    const pedir = semOp.avisar && permisoAvisos() === "default";
    semOp = null;
    guardar(); cerrarHoja(); pintar(); toast("✓ Semana guardada", "ok");
    if (pedir) {
      // Primera vez: el móvil pregunta si dejas que la app te mande avisos
      Notification.requestPermission().then(function (p) {
        if (p === "granted") { toast("✓ Avisos activados", "ok"); sincronizarAvisosPush(); }
        else toast("No se han activado los avisos", "error");
        pintar();
      });
    } else sincronizarAvisosPush();
  },
  "gen-equipo": function (k) {
    leerOpcionesAvanzadas();
    const l = genOp.equipo;
    if (l.includes(k)) l.splice(l.indexOf(k), 1); else l.push(k);
    hojaGenerador();
  },
  "gen-paso": function (dir) {
    leerOpcionesAvanzadas();
    if (parseInt(dir) > 0 && pasoGen === 2 && genOp.calendario.length !== genOp.dias) {
      $("gError").textContent = "Elige exactamente " + genOp.dias + " días (llevas " + genOp.calendario.length + ")."; return;
    }
    pasoGen = Math.max(1, Math.min(3, pasoGen + parseInt(dir)));
    hojaGenerador();
  },
  "abrir-biblioteca": function () { hojaBiblioteca("ver"); },
  "info-ej": function (id) { hojaEjercicio(id); },
  "ver-sesion": function (id) { confirmar = ""; hojaSesion(id); },
  "ver-grupo": function (g) { hojaGrupo(g); },
  "ver-rango-ej": function (id) { hojaRangoEj(id); },
  "como-rangos": function () { hojaComoRangos(); },

  // ---------- Generador y editor de rutina ----------
  "generar": function () {
    leerOpcionesAvanzadas();
    const g = genOp;
    if (g.equipo.length === 0) { $("gError").textContent = "Marca al menos un tipo de material."; return; }
    if (g.calendario.length !== g.dias) { pasoGen = 2; hojaGenerador(); $("gError").textContent = "Elige exactamente " + g.dias + " días."; return; }
    propuesta = generarRutina({ objetivo: g.objetivo, nivel: g.nivel, dias: g.dias, calendario: g.calendario.slice(),
      duracion: g.duracion, tipo: g.tipo, prioridad: g.prioridad, equipo: g.equipo.slice(), evitar: g.evitar.trim() });
    confirmar = ""; hojaPropuesta();
  },
  "usar-propuesta": function () {
    if (estado.rutina && !pideConfirmar("usar-propuesta", hojaPropuesta)) return;
    estado.rutina = propuesta; propuesta = null; genOp = null;
    estado.perfil.diasSemana = estado.rutina.calendario.slice();
    delete estado.ajustes.diasEntreno;               // rutina nueva con sus días: mandan los que acabas de elegir
    guardar(); cerrarHoja(); irA("entrenar");
    toast("✓ Rutina guardada. ¡A entrenar!", "ok");
  },
  "aplicar-sugerencia": function (i) {
    const sug = sugerenciasRutina()[parseInt(i)];
    if (sug && sug.aplicar) { mensajeSugerencia = aplicarSugerencia(sug.aplicar); guardar(); }
    pintar();
  },
  "no-hay": function (id) {
    const i = estado.noDisponibles.indexOf(id);
    if (i >= 0) estado.noDisponibles.splice(i, 1); else estado.noDisponibles.push(id);
    guardar(); hojaEjercicio(id);
  },
  "abrir-gimnasio": function () { hojaMiGimnasio(); },
  "gim-todas": function (v) {
    estado.noDisponibles = v === "1" ? [] : EJERCICIOS.filter(function (e) { return e.equipo === "maquina" || e.equipo === "polea"; }).map(function (e) { return e.id; });
    guardar(); hojaMiGimnasio();
  },
  "pausar-anim": function (x, y, z, boton) {
    animPausada = !animPausada;
    aplicarPausaAnim();
    boton.textContent = animPausada ? "▶ Reproducir" : "❚❚ Pausar";
  },
  "no-puedo": function (id) {
    const i = estado.evitados.indexOf(id);
    if (i >= 0) estado.evitados.splice(i, 1); else estado.evitados.push(id);
    guardar(); hojaEjercicio(id);
  },
  "editar-dia": function (i) { confirmar = ""; hojaEditarDia(parseInt(i)); },
  "anadir-dia": function () {
    estado.rutina.dias.push({ nombre: "Día " + (estado.rutina.dias.length + 1), ejercicios: [] });
    cuadrarCalendario(estado.rutina);
    guardar(); hojaEditarDia(estado.rutina.dias.length - 1);
  },
  "dia-mover": function (i, k, dir) {
    const lista = estado.rutina.dias[i].ejercicios;
    k = parseInt(k); const j = k + parseInt(dir);
    const tmp = lista[k]; lista[k] = lista[j]; lista[j] = tmp;
    cambioEditor = i + "-" + j;
    guardar(); hojaEditarDia(parseInt(i));
  },
  "dia-quitar": function (i, k) {
    const quitado = estado.rutina.dias[i].ejercicios.splice(parseInt(k), 1)[0];
    deshacerEditor = { i: parseInt(i), k: parseInt(k), o: quitado };
    guardar(); hojaEditarDia(parseInt(i));
    toast("Quitado: " + buscarEj(quitado.id).nombre + ". Pulsa «Deshacer» si fue sin querer.");
    const t = $("toast"); t.innerHTML += ' <button data-act="dia-deshacer" style="text-decoration:underline;font-weight:800;color:inherit">Deshacer</button>';
  },
  "dia-deshacer": function () {
    if (!deshacerEditor) return;
    estado.rutina.dias[deshacerEditor.i].ejercicios.splice(deshacerEditor.k, 0, deshacerEditor.o);
    cambioEditor = deshacerEditor.i + "-" + deshacerEditor.k;
    const i = deshacerEditor.i; deshacerEditor = null;
    guardar(); hojaEditarDia(i); toast("✓ Recuperado", "ok");
  },
  "dia-paso": function (i, k, c) {
    const o = estado.rutina.dias[i].ejercicios[k];
    const partes = c.split(":"), campo = partes[0];
    let v = o[campo] + parseInt(partes[1]);
    const limites = { series: [1, 10], repMin: [1, 50], repMax: [1, 50], descanso: [15, 600] }[campo];
    v = Math.max(limites[0], Math.min(limites[1], v));
    o[campo] = v;
    if (o.repMin > o.repMax) { if (campo === "repMin") o.repMax = o.repMin; else o.repMin = o.repMax; }
    cambioEditor = i + "-" + k;
    guardar(); hojaEditarDia(parseInt(i));
  },
  "dia-listo": function () { cerrarHoja(); pintar(); toast("✓ Cambios guardados", "ok"); },
  "dia-sustituir": function (i, k) { hojaBiblioteca("sust-dia:" + i + ":" + k, estado.rutina.dias[i].ejercicios[k].id); },
  "dia-anadir": function (i) { hojaBiblioteca("dia:" + i); },
  "dia-duplicar": function (i) {
    const copia = JSON.parse(JSON.stringify(estado.rutina.dias[i]));
    copia.nombre += " (copia)";
    estado.rutina.dias.splice(parseInt(i) + 1, 0, copia);
    cuadrarCalendario(estado.rutina);
    guardar(); hojaEditarDia(parseInt(i) + 1);
  },
  "dia-eliminar": function (i) {
    if (!pideConfirmar("dia-eliminar", function () { hojaEditarDia(parseInt(i)); })) return;
    estado.rutina.dias.splice(parseInt(i), 1);
    if (estado.rutina.dias.length === 0) estado.rutina = null;
    else cuadrarCalendario(estado.rutina);
    guardar(); cerrarHoja(); pintar();
  },

  // ---------- Biblioteca ----------
  "bib-grupo": function (g) { filtroBib.grupo = g; refrescarBib(); },
  "bib-equipo": function (e) { filtroBib.equipo = e; refrescarBib(); },
  "bib-fav": function () { filtroBib.favoritos = !filtroBib.favoritos; refrescarBib(); },
  "fav": function (id) {
    const i = estado.favoritos.indexOf(id);
    if (i >= 0) estado.favoritos.splice(i, 1); else estado.favoritos.push(id);
    guardar(); hojaEjercicio(id);
  },
  "elegir-ej": function (id) {
    const partes = modoBib.split(":");
    if (partes[0] === "sesion") {
      copiaSesion(); estado.activa.ejercicios.push(ejercicioParaSesion(id));
      estado.activa.actual = estado.activa.ejercicios.length - 1;      // te lleva al ejercicio que acabas de añadir
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(descansoTrasAnadir, 0);
    }
    if (partes[0] === "sust-sesion") {
      copiaSesion();
      const viejo = estado.activa.ejercicios[partes[1]];
      estado.activa.ejercicios[partes[1]] = ejercicioParaSesion(id, viejo.objetivo);
      estado.activa.actual = parseInt(partes[1]);                       // y al que acabas de cambiar
    }
    if (partes[0] === "dia") {
      const e = buscarEj(id);
      const p = parametros(estado.perfil.objetivo, estado.perfil.experiencia, e.compuesto);
      estado.rutina.dias[partes[1]].ejercicios.push({ id: id, series: p.series, repMin: p.repMin, repMax: p.repMax, descanso: p.descanso });
      guardar(); hojaEditarDia(parseInt(partes[1])); return;
    }
    if (partes[0] === "sust-dia") {
      estado.rutina.dias[partes[1]].ejercicios[partes[2]].id = id;
      cambioEditor = partes[1] + "-" + partes[2];
      guardar(); hojaEditarDia(parseInt(partes[1])); toast("✓ Cambiado por " + buscarEj(id).nombre, "ok"); return;
    }
    guardar(); cerrarHoja(); pintar();
  },

  // ---------- Sesión ----------
  "empezar-dia": function (i) {
    if (estado.activa) { irA("entrenar"); return; }
    pilaDeshacer = []; crearSesion(parseInt(i)); guardar(); irA("entrenar");
    if (!estado.ajustes.guiaSeriesVista) setTimeout(function () { mostrarGuia(0); }, 400);
  },
  "empezar-libre": function () { pilaDeshacer = []; crearSesionLibre(); guardar(); irA("entrenar"); hojaBiblioteca("sesion"); },
  "anadir-a-sesion": function () { hojaBiblioteca("sesion"); },
  "marcar": function (ei, si) {
    ei = parseInt(ei); si = parseInt(si);
    const a = estado.activa;
    const e = a.ejercicios[ei];
    const s = e.series[si];
    if (!s.hecha) {
      for (const campo of ["peso", "reps"]) {
        const inp = document.querySelector('input[data-in="' + campo + '"][data-e="' + ei + '"][data-s="' + si + '"]');
        const v = inp ? (campo === "peso" ? pesoDesdeVista(leerNumero(inp.value)) : parseInt(inp.value)) : NaN;
        if (inp && !isNaN(v) && v !== s[campo]) cambiarSerie(e, si, campo, v);
      }
    }
    sesionRecuperada = false;
    if (s.hecha) {                         // desmarcar: vuelve a quedar pendiente
      copiaSesion(); s.hecha = false; s.prVivo = false; e.foco = si; a.actual = ei;
      guardar(); pintarSesion(); return;
    }
    const v = validarSerie(e.id, s.peso, s.reps, e.objetivo);
    if (v.nivel === "error") { s.error = v.msg; pintarSesion(); return; }
    copiaSesion();
    s.hecha = true;
    e.foco = null;
    serieMarcada = ei + "-" + si;
    // ¿Récord en directo?
    const record = serieValida(s) && esRecordEnVivo(ei, si);
    s.prVivo = record;
    const ejercicioAcabado = e.series.every(function (x) { return x.hecha; });
    if (record) {
      sonar("record");
      toast("🏆 ¡Récord personal! " + numero(s.peso) + " kg × " + s.reps, "pr");
      apixDice("celebra", "¡RÉCORD PERSONAL!|" + numero(s.peso) + " kg × " + s.reps + ". Eso antes no lo levantabas.", 3200);
      mensajeEntreno = "¡Eso es! Nuevo récord. Sigue así.";
    } else {
      sonar("serie");
      apixDice(ejercicioAcabado ? "orgulloso" : "contento", ejercicioAcabado ? "¡Ejercicio terminado! ✓|" + buscarEj(e.id).nombre : fraseSerie());
    }
    // Siguiente serie o ejercicio y descanso
    const paso = siguientePaso(ei);
    a.actual = paso.ir;
    guardar(); pintarSesion();
    const tarjeta = $("tarjetaEj"); if (tarjeta && paso.ir !== ei) tarjeta.scrollIntoView({ behavior: "smooth", block: "start" });
    const seg = s.tipo === "drop" ? 0 : (s.tipo === "rp" ? 15 : (e.objetivo.descanso || estado.ajustes.descanso));
    // Se apunta cuándo acabó esta serie y cuánto tocaba descansar, por si luego añades una serie o un ejercicio
    a.ultimaSerie = { hora: Date.now(), seg: seg };
    if (paso.fin) { pararDescanso(); toast("✓ ¡Todas las series hechas! Pulsa Terminar.", "ok"); return; }
    if (!paso.descanso) { pararDescanso(); if (paso.ir !== ei) toast("Superserie: ahora " + buscarEj(a.ejercicios[paso.ir].id).nombre); return; }
    if (seg > 0) empezarDescanso(seg); else pararDescanso();
  },
  "paso": function (ei, si, c) {
    const e = estado.activa.ejercicios[ei];
    const partes = c.split(":"), campo = partes[0], delta = parseFloat(partes[1]);
    copiaSesion();
    const actual = e.series[si][campo];
    let nuevo = campo === "peso" ? Math.max(0, Math.round((actual + delta) * 100) / 100) : Math.max(0, Math.min(50, actual + delta));
    if (campo === "peso" && usaLibras()) {
      const pasoLb = Math.abs(delta) >= 2 ? 5 : 2.5;
      nuevo = Math.max(0, pesoDesdeVista(pesoVista(actual) + (delta > 0 ? pasoLb : -pasoLb)));
    }
    cambiarSerie(e, parseInt(si), campo, nuevo);
    e.foco = parseInt(si);
    guardar(); pintarSesion();
  },
  "rpe": function (ei, si, v) {
    const s = estado.activa.ejercicios[ei].series[si];
    copiaSesion();
    s.rpe = s.rpe === parseFloat(v) ? null : parseFloat(v);    // tocar otra vez lo quita (es opcional)
    estado.activa.ejercicios[ei].foco = parseInt(si);
    guardar(); pintarSesion();
  },
  "foco-serie": function (ei, si) {
    const e = estado.activa.ejercicios[ei];
    if (e.series[si].hecha) { toast("Esta serie ya está hecha. Toca ✓ para desmarcarla y así editarla o borrarla."); return; }
    e.foco = parseInt(si); pintarSesion();
  },
  "ir-ej": function (i) {
    i = parseInt(i);
    if (i < 0 || i >= estado.activa.ejercicios.length) return;
    estado.activa.actual = i; guardar(); pintarSesion();
    window.scrollTo({ top: 0, behavior: "smooth" });
  },
  "drop-set": function (ei) {
    const e = estado.activa.ejercicios[ei];
    if (e.series.some(function (x) { return x.tipo && !x.hecha; })) { toast("Primero completa la serie especial que ya tienes"); return; }
    const hechas = e.series.filter(function (s) { return s.hecha; });
    const base = hechas[hechas.length - 1];
    copiaSesion();
    const paso = pasoPeso(buscarEj(e.id));
    const peso = Math.max(0, Math.round(base.peso * 0.8 / paso) * paso);     // un 20 % menos, redondeado a tus discos
    const pos = e.series.indexOf(base) + 1;
    e.series.splice(pos, 0, { peso: peso, reps: base.reps, rpe: null, hecha: false, tipo: "drop" });
    e.foco = pos; estado.activa.actual = parseInt(ei);
    pararDescanso(); guardar(); pintarSesion();
    toast("Serie descendente: baja a " + numero(peso) + " kg y sigue sin descansar");
  },
  "rest-pause": function (ei) {
    const e = estado.activa.ejercicios[ei];
    if (e.series.some(function (x) { return x.tipo && !x.hecha; })) { toast("Primero completa la serie especial que ya tienes"); return; }
    const hechas = e.series.filter(function (s) { return s.hecha; });
    const base = hechas[hechas.length - 1];
    copiaSesion();
    const pos = e.series.indexOf(base) + 1;
    e.series.splice(pos, 0, { peso: base.peso, reps: Math.max(1, Math.round(base.reps / 3)), rpe: null, hecha: false, tipo: "rp" });
    e.foco = pos; estado.activa.actual = parseInt(ei);
    guardar(); pintarSesion();
    empezarDescanso(15);
    toast("Descanso-pausa: 15 s y haz las que puedas con el mismo peso");
  },
  "superserie": function (ei) {
    const e = estado.activa.ejercicios[ei];
    copiaSesion();
    e.superserie = !e.superserie;
    guardar(); pintarSesion();
    toast(e.superserie ? "Superserie: harás una serie de cada uno y luego descansas" : "Superserie quitada");
  },
  "fijar-descanso": function () {
    const a = estado.activa;
    if (!a) return;
    const ei = ejercicioActual();
    const e = a.ejercicios[ei];
    e.objetivo.descanso = tTotal;
    // También en la rutina, para las próximas veces
    if (a.diaIndex !== null && estado.rutina && estado.rutina.dias[a.diaIndex]) {
      const o = estado.rutina.dias[a.diaIndex].ejercicios.find(function (x) { return x.id === e.id; });
      if (o) o.descanso = tTotal;
    }
    guardar(); pintarTimer();
    toast("✓ Descanso de " + buscarEj(e.id).nombre + ": " + tTotal + " s", "ok");
  },
  "timer-fijo": function (seg) {
    seg = parseInt(seg);
    tFin = Date.now() + seg * 1000; tTotal = seg; tRest = seg;
    if (estado.activa) { estado.activa.descanso = { fin: tFin, total: tTotal }; guardar(); }
    pintarTimer();
  },
  "copiar-anterior": function (ei, si) {
    const e = estado.activa.ejercicios[ei];
    const ultima = ultimaVez(e.id);
    if (!ultima || !ultima.series[si]) return;
    copiaSesion();
    cambiarSerie(e, parseInt(si), "peso", ultima.series[si].peso);
    cambiarSerie(e, parseInt(si), "reps", ultima.series[si].reps);
    guardar(); pintarSesion();
  },
  "confirmar-serie": function (ei, si) {
    copiaSesion();
    estado.activa.ejercicios[ei].series[si].confirmada = true;
    estado.metricas.avisosConfirmados++;
    guardar(); pintarSesion();
  },
  "confirmar-historial": function (sid, id, i) {
    const ses = estado.sesiones.find(function (x) { return x.id === sid; });
    const e = ses.ejercicios.find(function (x) { return x.id === id; });
    e.series[i].confirmada = true;
    recalcularHistorial();
    guardar(); hojaSesion(sid);
  },
  "serie-mas": function (ei) {
    copiaSesion();
    const series = estado.activa.ejercicios[ei].series;
    const normales = series.filter(function (x) { return !x.tipo; });
    const ult = normales[normales.length - 1] || series[series.length - 1];
    series.push({ peso: ult ? ult.peso : 0, reps: ult ? ult.reps : 10, rpe: null, hecha: false });
    estado.activa.actual = parseInt(ei);
    guardar(); pintarSesion(); toast("+1 serie (ahora " + series.length + ")");
    descansoTrasAnadir();
  },
  "borrar-serie": function (ei, si) {
    const e = estado.activa.ejercicios[ei];
    if (e.series.length <= 1) { toast("El ejercicio necesita al menos una serie"); return; }
    copiaSesion();
    e.series.splice(parseInt(si), 1);
    e.foco = null;
    guardar(); pintarSesion(); toast("Serie borrada. Puedes deshacerlo con ↩ arriba.");
  },
  "serie-menos": function (ei) {
    const series = estado.activa.ejercicios[ei].series;
    if (series.length <= 1) return;
    copiaSesion(); series.pop(); guardar(); pintarSesion(); toast("−1 serie (ahora " + series.length + ")");
  },
  "fav-sesion": function (id) {
    const i = estado.favoritos.indexOf(id);
    if (i >= 0) estado.favoritos.splice(i, 1); else estado.favoritos.push(id);
    guardar(); pintarSesion();
    toast(i >= 0 ? "Quitado de favoritos" : "★ Añadido a favoritos", i >= 0 ? "" : "ok");
  },
  "ir-seccion": function (id) { const el = $(id); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); },
  "abrir-famosas": function () { confirmar = ""; hojaFamosas(); },
  "ver-famosa": function (k) {
    const r = rutinaDesdePlantilla(k);
    propuesta = r.rutina; cambiosFamosa = r.cambios; confirmar = "";
    hojaPropuesta();
  },
  "cal-marcar": function (ei, k) {
    const e = estado.activa.ejercicios[ei];
    if (!Array.isArray(e.calHecho)) e.calHecho = [];
    e.calHecho[k] = !e.calHecho[k];
    guardar(); pintarSesion();
    if (e.calHecho[k]) { sonar("serie"); const pendientes = seriesCalentamiento(e.id, (e.series.find(function (x) { return !x.tipo; }) || e.series[0]).peso).length - e.calHecho.filter(Boolean).length; if (!pendientes) apixDice("anima", "¡Calentamiento hecho!|Ahora, a por las series de verdad."); }
  },
  // Abre o pliega el calentamiento de este ejercicio
  "cal-plegar": function (ei) {
    const e = estado.activa.ejercicios[ei];
    const abierto = e.calAbierto === undefined ? sesionesValidas().length < 3 : e.calAbierto;
    e.calAbierto = !abierto; guardar(); pintarSesion();
  },
  "cal-ocultar": function (ei) { estado.activa.ejercicios[ei].sinCalentamiento = true; guardar(); pintarSesion(); },
  "hacer-copia": function () { hacerCopia(); },
  "posponer-copia": function () { estado.ajustes.copiaPospuesta = hoy(); guardar(); pintar(); toast("Vale, te lo recordaré más adelante. También está en Ajustes (⚙)."); },
  "medida-grafica": function (c) { medidaGrafica = c; pintarProgreso(); },
  "guardar-medidas": function () {
    const v = {};
    for (const c of CAMPOS_MEDIDAS) { const t = $("med-" + c[0]).value.trim(); v[c[0]] = t === "" ? null : leerNumero(t); }
    const r = guardarMedidas(v);
    if (!r.ok) { $("errMedidas").textContent = r.msg; return; }
    guardar(); pintarProgreso(); toast("✓ Medidas guardadas", "ok");
  },
  "guia-series": function () { mostrarGuia(0); },
  "guia-siguiente": function () {
    if (pasoGuia >= pasosGuia().length - 1) { estado.ajustes.guiaSeriesVista = true; guardar(); mostrarGuia(-1); toast("¡Listo! Ya sabes registrar tus series 💪", "ok"); return; }
    mostrarGuia(pasoGuia + 1);
  },
  "guia-saltar": function () { estado.ajustes.guiaSeriesVista = true; guardar(); mostrarGuia(-1); },
  "cerrar-apix": function () { $("apixPop").hidden = true; },
  "mover-ej": function (ei, dir) {
    copiaSesion();
    const l = estado.activa.ejercicios; const i = parseInt(ei), j = i + parseInt(dir);
    const tmp = l[i]; l[i] = l[j]; l[j] = tmp;
    estado.activa.actual = j;
    guardar(); pintarSesion();
  },
  "quitar-ej": function (ei) {
    copiaSesion(); estado.activa.ejercicios.splice(parseInt(ei), 1);
    estado.activa.actual = Math.min(parseInt(ei), estado.activa.ejercicios.length - 1);
    guardar(); pintarSesion(); toast("Ejercicio quitado. Puedes deshacerlo arriba.");
  },
  "sustituir-sesion": function (ei) { hojaBiblioteca("sust-sesion:" + ei, estado.activa.ejercicios[ei].id); },
  "aplicar-peso": function (ei, peso) {
    copiaSesion();
    for (const s of estado.activa.ejercicios[ei].series) if (!s.hecha) s.peso = parseFloat(peso);
    estado.metricas.aceptadas++;
    guardar(); pintarSesion(); toast("✓ " + numero(parseFloat(peso)) + " kg en las series pendientes", "ok");
  },
  "deshacer": function () {
    if (pilaDeshacer.length === 0) return;
    estado.activa = JSON.parse(pilaDeshacer.pop());
    guardar(); pintarSesion();
  },
  "terminar": function () {
    if (!estado.activa) return;
    if (!estado.activa.ejercicios.some(function (x) { return x.series.some(function (y) { return y.hecha; }); })) { toast("Completa al menos una serie para poder terminar"); return; }
    hojaTerminar();
  },
  "terminar-si": function () {
    cerrarHoja();
    pararDescanso();
    const semana = lunesDe(hoy());
    const rachaAntes = (sesionesPorSemana()[semana] || 0) >= minimoSemanal();
    revisarLogros();                                 // los que ya tenías de antes no cuentan como nuevos
    const r = terminarSesion();
    r.logros = (r.vacio || r.duplicado) ? [] : revisarLogros();     // logros conseguidos con este entreno
    if (r.logros.length) guardar();
    sincronizarAvisosPush();                         // hoy ya has entrenado: se quita el aviso de hoy
    const rachaAhora = (sesionesPorSemana()[semana] || 0) >= minimoSemanal();
    pilaDeshacer = []; sesionRecuperada = false;
    tab = "inicio"; pintar();
    if (r.vacio) { mensaje("Entreno vacío", "No hay ninguna serie completada, así que no se ha guardado."); return; }
    if (r.duplicado) { abrirHoja(cabeceraHoja("Ya estaba guardado", "") + '<p>Este entreno era idéntico al último que guardaste hoy, así que no se ha duplicado.</p>'); return; }
    sonar(r.ascensos.length ? "rango" : (r.sesion.prs.length ? "record" : "fin"));
    apixDice("celebra", "¡Entreno completado! Hoy has cumplido. 🔥", 3000);
    if (!rachaAntes && rachaAhora) setTimeout(function () { sonar("racha"); }, duracionSonido(r.ascensos.length ? "rango" : "record") * 1000 + 300);
    if (r.sesion.prs.length || r.ascensos.length) celebrar(r);
    else hojaResumen(r);
    compartirConAmigosAlTerminar(r.sesion);
  },
  "cancelar-sesion": function () {
    if (!pideConfirmar("cancelar-sesion", pintarSesion)) return;
    estado.activa = null; pilaDeshacer = []; pararDescanso(); guardar(); pintar();
  },
  "ver-resumen": function () { $("celebra").hidden = true; hojaResumen(window._resumen); },
  "compartir-sesion": function (id, x, y, boton) {
    const s = estado.sesiones.find(function (z) { return z.id === id; });
    if (!s) return;
    if (!s.compartida) {
      const r = publicar("entreno", textoSesion(s));
      if (!r.ok) { toast(r.msg, "error"); return; }
      for (const pr of s.prs) publicar("record", "Nuevo récord en " + buscarEj(pr).nombre);
      s.compartida = true; guardar();
    }
    boton.textContent = "✓ En tu diario"; boton.disabled = true;
    toast("✓ Guardado en tu diario (Social → Mi diario)", "ok");
  },
  "borrar-sesion": function (id) {
    if (!pideConfirmar("borrar-sesion", function () { hojaSesion(id); })) return;
    estado.sesiones = estado.sesiones.filter(function (s) { return s.id !== id; });
    recalcularHistorial();
    guardar(); cerrarHoja(); pintar();
  },

  // ---------- Temporizador ----------
  "timer-menos": function () { ajustarDescanso(-15); },
  "timer-mas": function () { ajustarDescanso(15); },
  "timer-saltar": function () { pararDescanso(); },
  // Descanso en grande o en pequeño: se recuerda para la próxima vez
  "timer-grande": function () {
    estado.ajustes.timerGrande = !estado.ajustes.timerGrande; guardar();
    $("timer").classList.toggle("grande", !!estado.ajustes.timerGrande);
  },

  // ---------- Progreso ----------
  "periodo": function (d) { periodo = parseInt(d); pintarProgreso(); },
  "borrar-foto": function (id) { pedirBorrarFoto(id); },
  "compartir-mes": function () { compartirImagenMes(); },
  "sub-progreso": function (sub) { subProgreso = sub; pintarProgreso(); scrollTo(0, 0); },
  // Ejercicio clave tocado: se enseña su gráfica de 1RM
  "ver-clave": function (id) {
    ejGrafica = id; metrica = "rm"; pintarProgreso();
    const tarjeta = document.getElementById("evolucion");
    if (tarjeta) tarjeta.scrollIntoView({ behavior: "smooth", block: "start" });
  },
  // Músculo tocado en el mapa: se enseñan sus series por semana
  "grupo-progreso": function (g) {
    grupoVolumen = g; pintarProgreso();
    const tarjeta = document.getElementById("series-semana");
    if (tarjeta) tarjeta.scrollIntoView({ behavior: "smooth", block: "start" });
  },
  "metrica": function (m) { metrica = m; pintarProgreso(); },
  "guardar-peso": function () {
    const v = pesoDesdeVista(leerNumero($("nuevoPeso").value));
    if (!(v >= 35 && v <= 250)) { $("errPeso").textContent = "Escribe un peso entre 35 y 250 kg."; return; }
    estado.pesoCorporal = estado.pesoCorporal.filter(function (x) { return x.fecha !== hoy(); });
    estado.pesoCorporal.push({ fecha: hoy(), kg: v });
    estado.perfil.peso = v;
    guardar(); pintarProgreso();
  },

  // ---------- Social ----------
  "ir-amigos": function () { vistaSocial = "amigos"; irA("social"); },
  "ir-retos": function () { vistaSocial = "retos"; irA("social"); },
  // Botón del descanso: pide permiso de notificaciones para oír el final con la app cerrada
  // Abre el correo para contar un problema, con la versión y el móvil ya escritos
  "informar-problema": async function () {
    // La versión es el nombre de la caché del service worker (por ejemplo "apex-gym-2.26.2")
    let version = "?";
    try { const claves = await caches.keys(); version = claves.filter(function (k) { return k.indexOf("apex-gym-") === 0; }).join(", ") || "?"; } catch (e) {}
    const cuerpo = "Cuéntame qué ha pasado:\n\n\n---\nVersión: " + version + "\nMóvil: " + navigator.userAgent;
    location.href = "mailto:" + CORREO_SOPORTE + "?subject=" + encodeURIComponent("Problema en Apix Gym") + "&body=" + encodeURIComponent(cuerpo);
  },
  // Imagen del entreno para redes sociales
  "compartir-imagen": function (id) {
    const s = (id && estado.sesiones.find(function (z) { return z.id === id; })) || estado.sesiones[estado.sesiones.length - 1];
    if (s) compartirImagenEntreno(s);
  },
  // Ajustes fijos de cada máquina
  "editar-ajuste": function (id) { hojaAjusteMaquina(id); },
  "guardar-ajuste": function (id) {
    const texto = $("ajusteTxt").value.trim().slice(0, 80);
    if (!estado.ajustesMaquina) estado.ajustesMaquina = {};
    if (texto) estado.ajustesMaquina[id] = texto; else delete estado.ajustesMaquina[id];
    guardar(); cerrarHoja(); pintar(); toast(texto ? "✓ Ajustes guardados" : "Ajustes borrados", "ok");
  },
  "borrar-ajuste": function (id) {
    if (estado.ajustesMaquina) delete estado.ajustesMaquina[id];
    guardar(); cerrarHoja(); pintar(); toast("Ajustes borrados", "ok");
  },
  // Tutorial de bienvenida
  "tuto-sig": function () { if (pasoTutorial < PASOS_TUTORIAL.length - 1) mostrarTutorial(pasoTutorial + 1); else cerrarTutorial(); },
  "tuto-saltar": function () { cerrarTutorial(); },
  "ver-logros": function () { hojaLogros(); },
  "ver-tutorial": function () { cerrarHoja(); mostrarTutorial(0); },
  "aviso-descanso": function () {
    Notification.requestPermission().then(function (p) {
      $("timerAviso").hidden = true;
      if (p === "granted") { sincronizarAvisosPush(); toast("✓ Te avisaré al acabar el descanso", "ok"); }
      else toast("Sin permiso no puedo avisarte con la app cerrada", "error");
    });
  },
  "activar-avisos": function () {
    if (permisoAvisos() === "no") { mensaje("Avisos", "Este navegador no permite avisos. En iPhone, primero añade la app a la pantalla de inicio."); return; }
    if (permisoAvisos() === "granted") {
      // Prueba por push (llega aunque cierres la app). Si no se puede, aviso normal.
      probarAvisoPush("Apix Gym", "Así te llegarán los recordatorios, aunque la app esté cerrada. 💪").then(function (ok) {
        if (!ok) mostrarAviso("Apix Gym", "Así te llegarán los recordatorios. 💪");
      });
      return;
    }
    Notification.requestPermission().then(function (p) {
      if (p === "granted") { toast("✓ Avisos activados", "ok"); mostrarAviso("Apix Gym", "Avisos activados. Te recordaré tus entrenos. 💪"); sincronizarAvisosPush(); }
      else toast("No se han activado los avisos", "error");
      hojaAjustes();
    });
  },
  "vista-carga": function (v) { vistaCarga = v; pintarProgreso(); },
  "vista-social": function (v) { vistaSocial = v; confirmar = ""; pintarSocial(); },

  // ---------- Social con cuenta en la nube ----------
  "social-recargar": async function () { socialNube.error = ""; socialNube.cargado = false; pintarSocial(); },
  "social-solicitar": async function () {
    const r = await solicitarAmistadNube($("nombreAmigo").value);
    if (!r.ok) { $("amigoError").textContent = r.msg; return; }
    toast(r.msg, "ok"); await cargarSocialNube(); pintarSocial();
  },
  "social-invitar": function () {
    compartirTexto("Añádeme en Apix Gym", "¡Añádeme como amigo en Apix Gym! Mi usuario es @" + estado.perfil.usuario + ". Abre el enlace:", URL_APP + "#u=" + encodeURIComponent(estado.perfil.usuario));
  },
  "social-aceptar": async function (id) {
    const r = await aceptarAmistadNube(id);
    if (!r.ok) { mensaje("No se ha podido aceptar", r.msg); return; }
    toast("✓ Ahora sois amigos", "ok"); await cargarSocialNube(); pintarSocial();
  },
  "social-borrar": async function (id) {
    const r = await borrarAmistadNube(id);
    if (!r.ok) { mensaje("No se ha podido borrar", r.msg); return; }
    await cargarSocialNube(); pintarSocial();
  },
  "social-quitar": async function (id) {
    if (!pideConfirmar("social-quitar" + id, repintarSocial)) return;
    const r = await borrarAmistadNube(id);
    if (!r.ok) { mensaje("No se ha podido quitar", r.msg); return; }
    if (hojaSocial && hojaSocial.id === id) { hojaSocial = null; cerrarHoja(); }
    toast("Amigo quitado", "ok"); await cargarSocialNube(); pintarSocial();
  },
  "social-publicar": async function () {
    const s = estado.sesiones[estado.sesiones.length - 1];
    if (!s) return;
    const r = await publicarNube(s.prs.length ? "record" : "entreno", textoSesion(s), detalleSesion(s));
    if (!r.ok) { mensaje("No se puede publicar", r.msg); return; }
    s.publicadaNube = true; guardar(); toast("✓ Compartido con tus amigos", "ok");
    await cargarSocialNube(); pintarSocial();
  },
  // Reaccionar a una publicación. Si pulsas la reacción que ya tenías, se quita.
  "social-reaccion": async function (id, emoji) {
    const p = postPorId(id);
    if (!p) return;
    const mia = p.reacciones.find(function (x) { return x.u === nube.id; });
    const quitar = mia && mia.r === emoji;
    p.reacciones = p.reacciones.filter(function (x) { return x.u !== nube.id; });
    if (!quitar) p.reacciones.push({ u: nube.id, r: emoji });          // se pinta al momento y luego se guarda
    repintarSocial();
    const r = await reaccionarNube(id, quitar ? "" : emoji);
    if (!r.ok) { toast("No se pudo guardar la reacción"); await cargarSocialNube(); repintarSocial(); }
  },
  "ver-amigo": function (id) { hojaAmigo(id); },
  "ver-post": function (id) { hojaPost(id); },
  "historial-mas": function () { semanasHistorial += 8; pintarProgreso(); },
  "social-borrar-post": async function (id) {
    if (!pideConfirmar("social-borrar-post" + id, repintarSocial)) return;
    const r = await borrarPublicacionNube(id);
    if (!r.ok) { mensaje("No se ha podido borrar", r.msg); return; }
    if (hojaSocial && hojaSocial.id === id) { hojaSocial = null; cerrarHoja(); }
    await cargarSocialNube(); repintarSocial();
  },
  "social-denunciar": function (id) { hojaDenunciaNube(id); },
  "social-enviar-denuncia": async function (id) {
    const marcado = document.querySelector('input[name="motivo"]:checked');
    if (!marcado) { $("denError").textContent = "Elige un motivo."; return; }
    const motivo = MOTIVOS_DENUNCIA[marcado.value] + ($("denDetalle").value.trim() ? ": " + $("denDetalle").value.trim() : "");
    const r = await denunciarNube(id, motivo);
    if (!r.ok) { $("denError").textContent = r.msg; return; }
    socialNube.posts = socialNube.posts.filter(function (x) { return x.id !== id; });    // se oculta para ti
    cerrarHoja(); toast("✓ Denuncia enviada. Gracias.", "ok"); pintarSocial();
  },
  "like": function (id) {
    const p = estado.social.posts.find(function (x) { return x.id === id; });
    const i = p.likes.indexOf(miId());
    if (i >= 0) p.likes.splice(i, 1); else p.likes.push(miId());
    guardar(); pintarSocial();
  },
  "comentar": function (id) {
    const campo = $("com-" + id);
    const r = comentar(id, campo.value);
    if (!r.ok) { campo.value = ""; campo.placeholder = r.msg; campo.focus(); return; }
    guardar(); pintarSocial();
  },
  "borrar-post": function (id) {
    if (!pideConfirmar("borrar-post" + id, pintarSocial)) return;
    estado.social.posts = estado.social.posts.filter(function (x) { return x.id !== id; });
    guardar(); pintarSocial();
  },
  "denunciar": function (id) { hojaDenuncia(id); },
  "enviar-denuncia": function (id) {
    const marcado = document.querySelector('input[name="motivo"]:checked');
    const r = denunciar(id, marcado ? marcado.value : "", $("denDetalle").value);
    if (!r.ok) { $("denError").textContent = r.msg; return; }
    guardar(); cerrarHoja(); pintarSocial();
  },
  "publicar-ultimo": function () {
    const s = estado.sesiones[estado.sesiones.length - 1];
    if (s.compartida) { mensaje("Ya compartido", "Tu último entreno ya está publicado."); return; }
    const r = publicar("entreno", textoSesion(s));
    if (!r.ok) { mensaje("No se puede publicar", r.msg); return; }
    s.compartida = true; guardar();
    postNuevo = estado.social.posts[0].id;
    pintarSocial();
    toast("✓ Guardado en tu diario", "ok");
    setTimeout(function () { postNuevo = ""; }, 2000);
  },
  "compartir-fuera": function (id) {
    const s = (id && estado.sesiones.find(function (z) { return z.id === id; })) || estado.sesiones[estado.sesiones.length - 1];
    if (!s) return;
    const texto = "💪 " + textoSesion(s) + " en Apix Gym" + (rachaSemanas() > 1 ? " · racha de " + rachaSemanas() + " semanas 🔥" : "");
    compartirTexto("Mi entreno", texto, URL_APP);
  },
  "compartir-tarjeta": function () {
    const p = puedeCompartirTarjeta();
    if (!p.ok) { mensaje("No se puede compartir", p.msg); return; }
    compartirTexto("Añádeme en Apix Gym", "¡Añádeme como amigo en Apix Gym! Abre el enlace:", enlaceTarjeta());
  },
  "anadir-amigo-real": function () {
    const r = anadirAmigoReal($("codigoAmigo").value);
    if (!r.ok) { toast(r.msg, "error"); return; }
    guardar(); pintarSocial(); toast("✓ " + r.msg, "ok");
  },
  "quitar-amigo-real": function (uid) {
    if (!pideConfirmar("quitar-amigo-real" + uid, pintarSocial)) return;
    quitarAmigoReal(uid); guardar(); pintarSocial(); toast("Amigo quitado");
  },
  "anadir-amigo": function (u) {
    if (!estado.social.amigos.includes(u) && usuarioDemo(u)) estado.social.amigos.push(u);
    guardar(); const t = $("buscarUsuario").value; pintarSocial(); $("buscarUsuario").value = t; resultadosUsuarios(t);
  },
  "quitar-amigo": function (u) { estado.social.amigos = estado.social.amigos.filter(function (x) { return x !== u; }); guardar(); pintarSocial(); },
  "bloquear": function (u) {
    estado.social.amigos = estado.social.amigos.filter(function (x) { return x !== u; });
    if (!estado.social.bloqueados.includes(u)) estado.social.bloqueados.push(u);
    guardar(); pintarSocial();
  },
  "desbloquear": function (u) { estado.social.bloqueados = estado.social.bloqueados.filter(function (x) { return x !== u; }); guardar(); pintarSocial(); },
  "nuevo-reto": function () { hojaReto(); },
  "crear-reto": function () {
    const tipo = $("rTipo").value, inicio = $("rInicio").value, fin = $("rFin").value;
    const meta = parseFloat($("rMeta").value);
    let error = "";
    if (!inicio || !fin || fin < inicio) error = "La fecha de fin debe ser posterior a la de inicio.";
    else if (!(meta > 0 && meta <= 1000)) error = "La meta debe ser un número mayor que 0.";
    else if (tipo === "mejora" && !$("rEj").value) error = "Necesitas haber registrado algún ejercicio.";
    if (error) { $("rError").textContent = error; return; }
    estado.social.retos.unshift({ id: "r" + Date.now(), tipo: tipo, meta: meta, inicio: inicio, fin: fin, ejercicio: tipo === "mejora" ? $("rEj").value : null });
    guardar(); cerrarHoja(); vistaSocial = "retos"; pintarSocial();
  },
  "borrar-reto": function (id) { estado.social.retos = estado.social.retos.filter(function (r) { return r.id !== id; }); guardar(); pintarSocial(); },

  // ---------- Ajustes ----------
  "tema": function (t) { estado.ajustes.tema = t; guardar(); aplicarTema(); hojaAjustes(); },
  "guardar-ajustes": async function () {
    const p = leerPerfil();
    if (!p) { $("fError").scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    // Con cuenta en la nube, el usuario es único: se comprueba antes de cambiarlo
    if (conectado() && p.usuario !== estado.perfil.usuario) {
      const u = await ponerUsuarioNube(p.usuario);
      if (!u.ok) { $("fError").textContent = u.msg; $("fError").scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    }
    if (p.peso !== estado.perfil.peso) {
      estado.pesoCorporal = estado.pesoCorporal.filter(function (x) { return x.fecha !== hoy(); });
      estado.pesoCorporal.push({ fecha: hoy(), kg: p.peso });
    }
    p.uid = estado.perfil.uid;                       // el identificador nunca cambia
    // Si cambias los «días por semana», los días elegidos en «Mi semana» se recolocan para que coincidan
    p.diasSemana = Array.isArray(estado.perfil.diasSemana) && estado.perfil.diasSemana.length === p.dias ? estado.perfil.diasSemana : calendarioPorDefecto(p.dias);
    if (p.dias !== estado.perfil.dias) estado.ajustes.diasEntreno = p.diasSemana.slice();
    estado.perfil = p;
    const a = estado.ajustes;
    a.descanso = parseInt($("aDescanso").value); a.descansoAislamiento = a.descanso; a.descansoCompuesto = parseInt($("aDescComp").value); a.formula1RM = $("aFormula").value; a.incremento = parseFloat($("aIncremento").value); a.incrementoMancuernas = parseFloat($("aIncMancuernas").value);
    a.unidad = $("aUnidad").value === "lb" ? "lb" : "kg";
    a.privacidad = $("aPrivacidad").value; a.compartir = $("aCompartir").checked; a.mascota = $("aMascota").checked;
    a.copiaDias = parseInt($("aCopiaDias").value); a.sonido = $("aSonido").checked; a.calentamiento = $("aCalentamiento").checked; a.vibracion = $("aVibracion").checked; if ($("aPantalla")) a.pantallaEncendida = $("aPantalla").checked;
    a.notif = { recordatorios: $("nRec").checked, racha: $("nRacha").checked, retos: $("nReto").checked, hora: parseInt($("nHora").value), records: $("nRecords").checked, rangos: $("nRangos").checked, amigos: a.notif.amigos, semanal: $("nSemanal").checked, ultimoAviso: a.notif.ultimoAviso || "" };
    guardar(); pintar();
    sincronizarAvisosPush();                         // la hora o los avisos pueden haber cambiado
    $("aOk").textContent = "Cambios guardados.";
  },
  "exportar": function () { hojaExportar(); },
  "pruebas": function () { pararDescanso(); hojaPruebas(); },
  "abrir-piloto": function () { hojaPiloto(); },
  "informar-problema": function () {
    const t = $("probTexto").value.trim();
    if (t.length < 5) { $("probError").textContent = "Describe el problema en al menos 5 caracteres."; return; }
    estado.metricas.problemas.push({ fecha: new Date().toISOString(), tipo: $("probTipo").value, texto: t.slice(0, 500), pantalla: tab });
    guardar(); hojaPiloto();
  },
  "abrir-importar": function () { confirmar = ""; hojaImportar(); },
  "importar": function () {
    const r = validarImport($("importTxt").value);
    if (!r.ok) { $("importError").textContent = r.msg; return; }
    if (!pideConfirmar("importar", function () { $("hojaContenido").querySelector('[data-act="importar"]').textContent = "Pulsa otra vez para sustituir tus datos"; })) return;
    estado = r.datos; recalcularHistorial(); guardar(); cerrarHoja(); tab = "inicio"; pintar();
    mensaje("Datos importados", "Se han importado " + estado.sesiones.length + " entrenos.");
  },
  "editar-sesion": function (id) { hojaEditarSesion(id); },
  "guardar-edicion": function (id) {
    const s = estado.sesiones.find(function (x) { return x.id === id; });
    // Primero se valida todo con la MISMA regla que al registrar e importar; si algo es imposible, no se cambia nada
    for (let ei = 0; ei < s.ejercicios.length; ei++) {
      for (let si = 0; si < s.ejercicios[ei].series.length; si++) {
        const p = pesoDesdeVista(parseFloat($("ed-p-" + ei + "-" + si).value)), r = Number($("ed-r-" + ei + "-" + si).value);
        const hecha = $("ed-h-" + ei + "-" + si).checked;
        const m = validarValores(p, r, hecha);
        if (m) { $("edError").textContent = buscarEj(s.ejercicios[ei].id).nombre + ", serie " + (si + 1) + ": " + m; return; }
      }
    }
    s.ejercicios.forEach(function (e, ei) {
      e.series.forEach(function (x, si) {
        const p = pesoDesdeVista(parseFloat($("ed-p-" + ei + "-" + si).value)), r = Number($("ed-r-" + ei + "-" + si).value);
        const hecha = $("ed-h-" + ei + "-" + si).checked;
        if (p !== x.peso || r !== x.reps || hecha !== x.hecha) {
          estado.metricas.correcciones++;
          const v = hecha ? validarSerie(e.id, p, r) : { nivel: "ok", msg: "" };
          x.sospechosa = v.nivel === "aviso"; x.aviso = v.msg; x.confirmada = false;
        }
        x.peso = p; x.reps = r; x.hecha = hecha;
      });
    });
    recalcularHistorial(); guardar(); hojaSesion(id);
  },
  "copiar-export": function () {
    const t = $("exportTxt");
    navigator.clipboard.writeText(t.value).then(function () { $("copiaOk").textContent = "Copiado."; })
      .catch(function () { t.select(); $("copiaOk").textContent = "Texto seleccionado: cópialo con Ctrl+C o mantén pulsado."; });
  },
  "cerrar-sesion": async function () {
    // Si hay cuenta en la nube, también se cierra allí. Los datos siguen guardados en este móvil.
    if (conectado()) {
      await salirNube();
      socialNube = { cargado: false, cargando: false, error: "", amigos: [], recibidas: [], enviadas: [], posts: [] };
    }
    cerrarHoja(); pararDescanso(); $("tabs").hidden = true;
    $("app").innerHTML = '<div class="welcome">' + insignia(8, "logo") + '<h1>Sesión cerrada</h1><p class="muted">Tus datos siguen guardados en este dispositivo.</p><button class="btn" data-act="volver-a-entrar">Volver a entrar</button></div>';
  },
  "volver-a-entrar": function () { pintar(); },
  "borrar-todo": async function () {
    if (!pideConfirmar("borrar-todo", hojaAjustes)) return;
    // Si hay cuenta en la nube, se borra primero allí. Si falla, no se borra nada (así se puede reintentar).
    if (conectado()) {
      toast("Borrando tu cuenta de la nube…");
      const r = await borrarCuentaNube();
      if (!r.ok) { mensaje("No se ha podido borrar", r.msg + " No se ha borrado nada."); return; }
    }
    await borrarAvisosPush();
    // Las fotos de progreso también se borran (están aparte, en IndexedDB)
    try { indexedDB.deleteDatabase(FOTOS_BD); } catch (e) { }
    estado = null; borrarAlmacenamiento();
    cerrarHoja(); pararDescanso(); pintar();
  },

  // ---------- Cuenta en la nube ----------
  "abrir-cuenta": function (modo) { hojaCuenta(modo); },
  "cuenta-crear": async function () {
    const email = $("cEmail").value.trim().toLowerCase(), pass = $("cPass").value;
    const usuario = $("cUsuario").value.trim().toLowerCase();
    let fallo = revisarCuenta(email, pass, true);
    if (!fallo && !FORMATO_USUARIO.test(usuario)) fallo = "El usuario debe tener de 3 a 20 letras minúsculas, números, puntos o guiones bajos (sin espacios).";
    if (!fallo && !$("cAcepto").checked) fallo = "Para crear la cuenta, marca la casilla de la política de privacidad.";
    if (fallo) return errorCuenta(fallo);
    ocupado(true, "Comprobando el usuario…");
    const libre = await usuarioLibreNube(usuario);
    if (libre.ok && !libre.libre) { ocupado(false, "Crear cuenta"); return errorCuenta("El usuario «" + usuario + "» ya está cogido. Prueba con otro."); }
    ocupado(true, "Creando cuenta…");
    const r = await crearCuentaNube(email, pass, usuario);
    ocupado(false, "Crear cuenta");
    if (!r.ok) return errorCuenta(r.msg);
    if (estado) { estado.perfil.usuario = usuario; estado.ajustes.privacidadAceptada = hoy() + " v" + VERSION_PRIVACIDAD + " nube"; guardar(); }
    if (r.confirmar) { cuentaEnEspera = { email: email, pass: pass }; hojaConfirmarCorreo(email); return; }
    socialNube = { cargado: false, cargando: false, error: "", amigos: [], recibidas: [], enviadas: [], posts: [] };
    cerrarHoja(); toast("✓ Cuenta creada", "ok");
    await sincronizarYAvisar(true);
  },
  // Después de pulsar el enlace del correo, la persona vuelve a la app y pulsa este botón: entramos con su correo y contraseña
  "cuenta-ya-confirmada": async function () {
    if (!cuentaEnEspera) { hojaCuenta("entrar"); return; }
    ocupado(true, "Entrando…");
    const r = await entrarNube(cuentaEnEspera.email, cuentaEnEspera.pass);
    ocupado(false, "Ya lo he confirmado");
    if (!r.ok) return errorCuenta(r.msg);
    cuentaEnEspera = null;
    cerrarHoja(); toast("✓ Cuenta activada", "ok");
    await sincronizarYAvisar(true);
  },
  "cuenta-reenviar": async function () {
    if (!cuentaEnEspera) return;
    const r = await reenviarNube(cuentaEnEspera.email);
    if (r.ok) toast("✓ Correo enviado otra vez", "ok"); else errorCuenta(r.msg);
  },
  "cuenta-usuario": async function () {
    const usuario = $("cUsuario").value.trim().toLowerCase();
    ocupado(true, "Guardando…");
    const r = await ponerUsuarioNube(usuario);
    ocupado(false, "Guardar usuario");
    if (!r.ok) return errorCuenta(r.msg);
    if (estado) { estado.perfil.usuario = usuario; guardar(); }
    cerrarHoja(); toast("✓ Usuario guardado", "ok");
  },
  "cuenta-entrar": async function () {
    const email = $("cEmail").value.trim().toLowerCase(), pass = $("cPass").value;
    const fallo = revisarCuenta(email, pass, false);
    if (fallo) return errorCuenta(fallo);
    ocupado(true, "Entrando…");
    const r = await entrarNube(email, pass);
    ocupado(false, "Iniciar sesión");
    if (!r.ok) {
      // Si aún no ha confirmado el correo, le explicamos qué hacer
      if (r.msg.indexOf("confirmar tu correo") >= 0) { cuentaEnEspera = { email: email, pass: pass }; hojaConfirmarCorreo(email); return; }
      return errorCuenta(r.msg);
    }
    socialNube = { cargado: false, cargando: false, error: "", amigos: [], recibidas: [], enviadas: [], posts: [] };
    cerrarHoja(); toast("✓ Sesión iniciada", "ok");
    await sincronizarYAvisar(true);
  },
  "cuenta-olvido": async function () {
    const email = $("cEmail").value.trim().toLowerCase();
    if (!correoValido(email)) return errorCuenta("Escribe tu correo electrónico.");
    ocupado(true, "Enviando…");
    const r = await olvidoNube(email);
    ocupado(false, "Enviarme un correo");
    if (!r.ok) return errorCuenta(r.msg);
    mensaje("Revisa tu correo", "Si existe una cuenta con " + email + ", te llegará un email. Pulsa el enlace y elige una contraseña nueva.");
  },
  "cuenta-nueva": async function () {
    const pass = $("cPass").value;
    if (pass.length < 8) return errorCuenta("La contraseña necesita al menos 8 caracteres.");
    ocupado(true, "Guardando…");
    const r = await cambiarContrasenaNube(pass);
    ocupado(false, "Guardar contraseña");
    if (!r.ok) return errorCuenta(r.msg);
    if (!enAppInstalada() && !estado) {
      // Estamos en el navegador (enlace del correo): la sesión no sirve en la app instalada
      await salirNube();
      pantallaVueltaCorreo("✓ Contraseña cambiada", "Ahora abre la app Apix Gym e inicia sesión con tu nueva contraseña. Ya puedes cerrar esta pestaña.");
      return;
    }
    cerrarHoja(); toast("✓ Contraseña cambiada", "ok");
    await sincronizarYAvisar(false);
  },
  "nube-sync": function () { sincronizarYAvisar(true); },
  "nube-salir": async function () {
    await salirNube();
    socialNube = { cargado: false, cargando: false, error: "", amigos: [], recibidas: [], enviadas: [], posts: [] };
    toast("Sesión de la nube cerrada. Tus datos siguen en este móvil.", "ok");
    if (estado) hojaAjustes();
  },
  "nube-usar-nube": function () {
    if (!copiaEnEspera) return;
    const r = usarCopiaNube(copiaEnEspera);
    copiaEnEspera = null; cerrarHoja();
    if (!r.ok) { mensaje("No se ha podido cargar", r.msg); return; }
    tab = "inicio"; pintar(); toast("✓ Datos cargados desde la nube", "ok");
  },
  "nube-usar-movil": async function () {
    copiaEnEspera = null; cerrarHoja();
    toast("Subiendo los datos de este móvil…");
    const r = await subirCopiaNube();
    if (r.ok) toast("✓ Guardado en la nube", "ok"); else mensaje("No se ha podido subir", r.msg);
  }
};

// Al terminar un entreno: si tienes cuenta y «Mostrar mis entrenos» activado, tus amigos lo ven en Actividad
function puedeCompartirSolo() {
  return conectado() && estado.modo !== "demo" && estado.ajustes.compartir !== false && estado.perfil.edad >= 16 && estado.ajustes.privacidad !== "privado";
}
async function compartirConAmigosAlTerminar(s) {
  if (!s || s.publicadaNube || !puedeCompartirSolo()) return false;
  const r = await publicarNube(s.prs.length ? "record" : "entreno", textoSesion(s), detalleSesion(s));
  if (r.ok) { s.publicadaNube = true; guardar(); socialNube.cargado = false; }
  return r.ok;
}
// Si al terminar no había conexión (o la sesión de la nube había caducado), se vuelve a intentar
// después con los entrenos de los últimos 3 días que aún no se han compartido.
let reintentandoCompartir = false;
async function compartirPendientes() {
  if (reintentandoCompartir || !puedeCompartirSolo()) return;
  reintentandoCompartir = true;
  try {
    const desde = sumarDias(hoy(), -3);
    let alguno = false;
    for (const s of estado.sesiones) {
      if (s.fecha >= desde && !s.publicadaNube) { if (await compartirConAmigosAlTerminar(s)) alguno = true; else break; }
    }
    if (alguno) { await cargarSocialNube(); if (tab === "social") pintarSocial(); }
  } finally { reintentandoCompartir = false; }
}

// ---------- Ayudas para la cuenta ----------
let cuentaEnEspera = null;     // correo y contraseña mientras se confirma el correo (solo en memoria, nunca se guardan)
function correoValido(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function revisarCuenta(email, pass, nueva) {
  if (!correoValido(email)) return "Escribe un correo electrónico válido.";
  if (nueva && pass.length < 8) return "La contraseña necesita al menos 8 caracteres.";
  if (!pass) return "Escribe tu contraseña.";
  return "";
}
function errorCuenta(texto) { const e = $("cError"); if (e) e.textContent = texto; }
// Mientras se espera a internet, el botón se desactiva para no pulsarlo dos veces
function ocupado(si, texto) { const b = $("cBoton"); if (b) { b.disabled = si; b.textContent = texto; } }

// Sincroniza y cuenta al usuario lo que ha pasado. manual = true si ha pulsado un botón.
async function sincronizarYAvisar(manual) {
  if (!conectado()) return;
  const r = await sincronizarNube();
  const e = $("nubeEstado"); if (e) e.textContent = textoEstadoNube();
  if (!r.ok) { if (manual) mensaje("Nube", r.msg); return; }
  if (r.hecho === "elegir") { hojaConflictoNube(r.copia); return; }
  if (r.hecho === "bajar") { cerrarHoja(); tab = "inicio"; pintar(); toast("✓ Datos cargados desde la nube", "ok"); if (manual) await comprobarUsuarioNube(); return; }
  if (r.hecho === "nada" && !estado) {
    mensaje("Tu cuenta está vacía", "Todavía no hay datos guardados en esta cuenta. Crea tu perfil y se guardarán solos en la nube.");
    return;
  }
  if (manual) toast("✓ Todo guardado en la nube", "ok");
  if (manual) await comprobarUsuarioNube();
}

// Las cuentas creadas antes de la versión 2.8.1 no tienen nombre de usuario: se pide una vez
async function comprobarUsuarioNube() {
  const u = await leerUsuarioNube();
  if (!u.ok) return;
  if (u.usuario) { if (estado && estado.perfil.usuario !== u.usuario) { estado.perfil.usuario = u.usuario; guardar(); } return; }
  hojaElegirUsuario();
}

// Al volver del enlace del correo (activar cuenta o cambiar contraseña)
async function procesarVueltaCorreo() {
  const v = leerVueltaCorreo(location.hash);
  if (!v) return false;
  try { history.replaceState(null, "", location.pathname + location.search); } catch (e) { }
  if (v.error) { mensaje("Enlace no válido", "El enlace ha caducado o ya se usó. Vuelve a pedirlo. (" + v.error + ")"); return true; }
  // Confirmar la cuenta desde el navegador: el correo ya queda confirmado; se entra desde la app
  if (v.tipo !== "recovery" && !enAppInstalada() && !estado) {
    pantallaVueltaCorreo("✓ Correo confirmado", "Tu cuenta ya está activada. Vuelve a la app Apix Gym y pulsa «Ya lo he confirmado» (o inicia sesión con tu correo y contraseña). Ya puedes cerrar esta pestaña.");
    return true;
  }
  guardarSesionNube({ access_token: v.access_token, refresh_token: v.refresh_token, expires_in: v.expires_in });
  const u = await datosUsuarioNube();
  if (u) { nube.email = u.email; nube.id = u.id; guardarNube(); }
  if (v.tipo === "recovery") { hojaCuenta("nueva", "Escribe tu nueva contraseña."); return true; }
  toast("✓ Cuenta activada", "ok");
  await sincronizarYAvisar(true);
  return true;
}

function refrescarBib() { hojaBiblioteca(modoBib, bibBase); }

// ---------- Cambios en campos de texto y desplegables ----------
document.addEventListener("input", function (ev) {
  const t = ev.target;
  if (t.id === "bibTexto") { filtroBib.texto = t.value; pintarListaBib(); return; }
  if (t.id === "buscarUsuario") { resultadosUsuarios(t.value); return; }
  if (t.dataset.in === "nota") { estado.activa.ejercicios[t.dataset.e].nota = t.value; guardar(); }
  if (t.dataset.in === "nombre-dia") { estado.rutina.dias[t.dataset.e].nombre = t.value.slice(0, 40) || "Día"; guardar(); }
});

document.addEventListener("change", function (ev) {
  if (ev.target.id === "fIdioma") {
    try { sessionStorage.setItem("apex-abrir-registro", "1"); } catch (e) { }
    cambiarIdioma(ev.target.value);
    return;
  }
  const t = ev.target, d = t.dataset;
  // Foto de progreso nueva elegida en el móvil
  if (t.hasAttribute("data-foto-nueva")) { anadirFotoProgreso(t.files && t.files[0]); t.value = ""; return; }
  if (d.in === "peso" || d.in === "reps" || d.in === "rpe") {
    copiaSesion();
    const e = estado.activa.ejercicios[d.e];
    if (d.in === "rpe") e.series[d.s].rpe = t.value ? parseFloat(t.value) : null;
    else cambiarSerie(e, parseInt(d.s), d.in, d.in === "peso" ? pesoDesdeVista(leerNumero(t.value)) : parseInt(t.value));
    guardar();
    // Actualiza solo los números de las series siguientes, sin redibujar la pantalla
    e.series.forEach(function (x, j) {
      for (const campo of ["peso", "reps"]) {
        const inp = document.querySelector('input[data-in="' + campo + '"][data-e="' + d.e + '"][data-s="' + j + '"]');
        if (inp && inp !== t) inp.value = campo === "peso" ? numero(pesoVista(x[campo])) : x[campo];
      }
    });
  }
  if (d.in === "gim") {
    const id = d.e;
    estado.noDisponibles = estado.noDisponibles.filter(function (x) { return x !== id; });
    if (!t.checked) estado.noDisponibles.push(id);
    guardar();
  }
  if (d.in === "molestias" || d.in === "cambio") {
    copiaSesion();
    estado.activa.ejercicios[d.e][d.in] = t.checked;
    guardar(); pintarSesion();
  }
  if (d.in === "dia-campo") {
    const o = estado.rutina.dias[d.e].ejercicios[d.s];
    let v = parseInt(t.value) || 1;
    if (d.k === "series") v = Math.min(10, Math.max(1, v));
    if (d.k === "repMin" || d.k === "repMax") v = Math.min(50, Math.max(1, v));
    if (d.k === "descanso") v = Math.min(600, Math.max(15, v));
    o[d.k] = v;
    if (o.repMin > o.repMax) { if (d.k === "repMin") o.repMax = o.repMin; else o.repMin = o.repMax; }
    guardar(); hojaEditarDia(parseInt(d.e));
  }
  if (d.cambio === "ej-grafica") { ejGrafica = t.value; pintarProgreso(); }
  if (t.id === "importArchivo" && t.files && t.files[0]) {
    const lector = new FileReader();
    lector.onload = function () { $("importTxt").value = lector.result; toast("Archivo cargado. Pulsa «Importar» para restaurar."); };
    lector.readAsText(t.files[0]);
  }
  if (d.cambio === "grupo-volumen") { grupoVolumen = t.value; pintarProgreso(); }
  if (t.id === "gDias") {
    const cal = calendarioPorDefecto(parseInt(t.value));
    for (const c of document.querySelectorAll('input[name="gDia"]')) c.checked = cal.includes(parseInt(c.value));
  }
  if (d.cambio === "lugar") {
    // Al elegir dónde entrenas, marcamos el equipamiento típico
    const eq = { gimnasio: ["barra", "mancuernas", "maquina", "polea", "corporal"], casa: ["mancuernas", "corporal"], calistenia: ["corporal"] }[t.value];
    for (const c of document.querySelectorAll('input[name="equipo"]')) c.checked = eq.includes(c.value);
  }
});

// Cambia el peso o las reps de una serie, valida el dato y actualiza las series siguientes
// que aún no están hechas y tenían el mismo valor (así no hay que escribirlo en cada serie).
function cambiarSerie(e, si, campo, valor) {
  if (isNaN(valor)) valor = 0;
  const viejo = e.series[si][campo];
  e.series[si][campo] = valor;
  for (let j = si + 1; j < e.series.length; j++) {
    const s = e.series[j];
    if (!s.hecha && s[campo] === viejo) s[campo] = valor;
  }
  for (let j = si; j < e.series.length; j++) {
    const s = e.series[j];
    if (s.hecha && j !== si) continue;
    const v = validarSerie(e.id, s.peso, s.reps, e.objetivo);
    s.error = v.nivel === "error" ? v.msg : "";
    s.sospechosa = v.nivel === "aviso";
    if (v.nivel === "aviso" && !s.sospechosa) estado.metricas.avisos++;
    s.aviso = v.msg;
    s.confirmada = false;
  }
}


// Enter o espacio activan las zonas del mapa corporal (accesibilidad con teclado)
document.addEventListener("keydown", function (ev) {
  const t = ev.target;
  if ((ev.key === "Enter" || ev.key === " ") && t.dataset && t.dataset.act && t.tagName !== "BUTTON" && t.tagName !== "INPUT") {
    ev.preventDefault(); t.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }
});

// Enter en las repeticiones marca la serie como hecha
document.addEventListener("keydown", function (ev) {
  const t = ev.target;
  if (ev.key === "Enter" && t.dataset && t.dataset.in === "reps") {
    t.blur();
    const s = estado.activa.ejercicios[t.dataset.e].series[t.dataset.s];
    if (!s.hecha) setTimeout(function () { ACCIONES.marcar(t.dataset.e, t.dataset.s); }, 0);
  }
});

// El cronómetro del entreno se actualiza cada segundo
setInterval(function () {
  const c = $("cronometro");
  if (c && estado && estado.activa) c.textContent = tiempoEntreno();
}, 1000);

// ---------- Pantalla encendida durante el entreno ----------
// Mientras hay un entreno en marcha, se pide al móvil que no apague la pantalla ("wake lock").
// El móvil suelta el permiso solo al salir de la app, así que se vuelve a pedir al volver.
let bloqueoPantalla = null;
function pantallaEncendida() {
  if (!("wakeLock" in navigator)) return;
  const hace = !!(estado && estado.activa && estado.ajustes.pantallaEncendida !== false && document.visibilityState === "visible");
  if (hace && !bloqueoPantalla) {
    bloqueoPantalla = "pidiendo";
    navigator.wakeLock.request("screen").then(function (b) {
      bloqueoPantalla = b;
      b.addEventListener("release", function () { if (bloqueoPantalla === b) bloqueoPantalla = null; });
      pantallaEncendida();                       // por si el entreno ha terminado mientras se pedía
    }).catch(function () { bloqueoPantalla = null; });   // p. ej. batería baja: no pasa nada
  }
  if (!hace && bloqueoPantalla && bloqueoPantalla !== "pidiendo") {
    const b = bloqueoPantalla; bloqueoPantalla = null;
    b.release().catch(function () { });
  }
}
document.addEventListener("visibilitychange", pantallaEncendida);

// ---------- Fotos de tu rutina sin internet ----------
// Con internet, descarga en segundo plano las fotos de los ejercicios de tu rutina.
// El service worker las guarda, y así se ven en el gimnasio aunque no haya cobertura.
let fotosRutinaGuardadas = "";
function guardarFotosRutina() {
  if (!estado || !estado.rutina || !navigator.onLine || !("serviceWorker" in navigator) || !navigator.serviceWorker.controller) return;
  if (navigator.connection && navigator.connection.saveData) return;      // modo "ahorro de datos": no se descarga nada extra
  const ids = [];
  for (const d of estado.rutina.dias || []) for (const e of d.ejercicios || []) if (ids.indexOf(e.id) < 0 && FOTOS[e.id]) ids.push(e.id);
  const firma = ids.join(",");
  if (!ids.length || firma === fotosRutinaGuardadas) return;
  fotosRutinaGuardadas = firma;
  const lista = [];
  for (const id of ids) { lista.push("fotos/" + id + "-inicio.jpg"); lista.push("fotos/" + id + "-final.jpg"); }
  let i = 0;
  (function siguiente() {                       // de una en una, para no frenar la app
    if (i >= lista.length) return;
    fetch(lista[i++]).then(siguiente, siguiente);
  })();
}
setTimeout(guardarFotosRutina, 5000);
// Con entrenos guardados, se pide al navegador que no borre los datos de la app si el móvil se queda sin espacio
setTimeout(function () {
  if (estado && estado.sesiones.length && navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () { });
}, 6000);
window.addEventListener("online", function () { setTimeout(guardarFotosRutina, 3000); });

// ---------- Red de seguridad ----------
// Si algo falla de forma inesperada y la pantalla se queda vacía, se enseña un aviso con un botón
// para recargar. Los entrenos no se tocan: están guardados en el móvil.
function pantallaDeError() {
  const app = $("app");
  if (!app || app.innerHTML.trim() !== "") return;       // solo si no se ha podido pintar nada
  app.innerHTML = '<div class="welcome"><h1>Algo ha fallado</h1>' +
    '<p class="muted">Tus entrenos están a salvo: siguen guardados en este móvil. Recarga la app para continuar.</p>' +
    '<button class="btn" onclick="location.reload()">Recargar</button></div>';
}
window.addEventListener("error", function () { setTimeout(pantallaDeError, 0); });
window.addEventListener("unhandledrejection", function () { setTimeout(pantallaDeError, 0); });

// Si el último guardado falló, el navegador avisa antes de cerrar la página
window.addEventListener("beforeunload", function (ev) {
  if (errorGuardado) { ev.preventDefault(); ev.returnValue = ""; }
});

// ---------- App instalable (PWA) ----------
// Chrome avisa con "beforeinstallprompt" cuando la app se puede instalar. Guardamos ese aviso
// para lanzarlo cuando el usuario pulse el botón "Instalar Apix Gym" de Ajustes.
let avisoInstalar = null;
window.addEventListener("beforeinstallprompt", function (ev) {
  ev.preventDefault();
  avisoInstalar = ev;
});
window.addEventListener("appinstalled", function () { avisoInstalar = null; });

// El service worker (sw.js) solo funciona en una web con https o en localhost, y no dentro de un marco (iframe)
function registrarServiceWorker() {
  const seguro = location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1";
  if (!("serviceWorker" in navigator) || !seguro || window.top !== window.self) return;
  navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then(function (reg) {
    reg.update();                                                     // busca versión nueva al abrir
    document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") reg.update(); });
  }).catch(function () { /* si falla, la app sigue funcionando con internet */ });
  // Cuando la versión nueva toma el control, recarga una vez (si no estás a mitad de escribir algo)
  let recargado = false;
  navigator.serviceWorker.addEventListener("controllerchange", function () {
    if (recargado || !$("hoja").hidden) return;
    recargado = true; location.reload();
  });
}

// Copia de seguridad en un archivo. En el móvil se abre el menú de compartir (Archivos, Drive, correo…);
// si no se puede, se descarga el archivo.
function hacerCopia() {
  const nombre = "apix-gym-copia-" + hoy() + ".json";
  const texto = exportarDatos();
  const marcar = function () { estado.ajustes.ultimaCopia = hoy(); estado.ajustes.copiaPospuesta = ""; guardar(); pintar(); };
  let archivo = null;
  try { archivo = new File([texto], nombre, { type: "application/json" }); } catch (e) { }
  if (archivo && navigator.canShare && navigator.canShare({ files: [archivo] })) {
    navigator.share({ files: [archivo], title: "Copia de Apix Gym" }).then(function () { marcar(); toast("✓ Copia guardada", "ok"); }).catch(function (e) {
      if (e && e.name === "AbortError") return;
      descargarCopia(texto, nombre); marcar();
    });
    return;
  }
  descargarCopia(texto, nombre); marcar();
  toast("✓ Copia descargada: " + nombre, "ok");
}
function descargarCopia(texto, nombre) {
  const url = URL.createObjectURL(new Blob([texto], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url; a.download = nombre; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
}

// Lee un número escrito con coma o con punto ("52,5" o "52.5")
function leerNumero(texto) { return parseFloat(String(texto).replace(",", ".")); }

let deshacerEditor = null;      // último ejercicio quitado de un día (para poder recuperarlo)
// Lee las opciones avanzadas del paso 3 del generador (si están en pantalla)
function leerOpcionesAvanzadas() {
  if (!genOp) return;
  if ($("gTipo")) genOp.tipo = $("gTipo").value;
  if ($("gPrioridad")) genOp.prioridad = $("gPrioridad").value;
  if ($("gEvitar")) genOp.evitar = $("gEvitar").value;
}

// Si la app se abre con un enlace de amigo (…#amigo=código), lo añade
function abrirEnlaceAmigo() {
  if (location.hash.indexOf("#u=") === 0) { abrirInvitacion(decodeURIComponent(location.hash.slice(3))); return; }
  if (location.hash.indexOf("#amigo=") !== 0) return;
  const codigo = location.hash.slice(1);
  try { history.replaceState(null, "", location.pathname + location.search); } catch (e) { }
  if (!estado || !estado.perfil || estado.modo === "demo") {
    mensaje("Enlace de amigo", "Crea tu perfil y vuelve a abrir el enlace (o pega el código en Social → Amigos).");
    return;
  }
  const r = anadirAmigoReal(codigo);
  if (r.ok) { guardar(); tab = "social"; vistaSocial = "amigos"; pintar(); toast("✓ " + r.msg, "ok"); }
  else mensaje("Enlace de amigo", r.msg);
}

// Enlace de invitación (Apix Gym/#u=usuario): envía la solicitud de amistad
async function abrirInvitacion(usuario) {
  try { history.replaceState(null, "", location.pathname + location.search); } catch (e) { }
  if (!estado || !estado.perfil || estado.modo === "demo" || !conectado()) {
    mensaje("Invitación de @" + usuario, "Crea tu perfil y una cuenta en la nube (Ajustes → ☁️ Cuenta). Después, en Social → Amigos, escribe su usuario: @" + usuario);
    return;
  }
  const r = await solicitarAmistadNube(usuario);
  mensaje("Invitación de @" + usuario, r.msg);
  socialNube.cargado = false;
}

// Deslizar a izquierda o derecha durante el entreno cambia de ejercicio
let toqueX = null, toqueY = null;
document.addEventListener("touchstart", function (ev) {
  if (tab !== "entrenar" || !estado || !estado.activa || !$("hoja").hidden) { toqueX = null; return; }
  if (ev.target.closest("input, textarea, select, .chips")) { toqueX = null; return; }
  toqueX = ev.touches[0].clientX; toqueY = ev.touches[0].clientY;
}, { passive: true });
document.addEventListener("touchend", function (ev) {
  if (toqueX === null) return;
  const dx = ev.changedTouches[0].clientX - toqueX, dy = ev.changedTouches[0].clientY - toqueY;
  toqueX = null;
  if (Math.abs(dx) < 70 || Math.abs(dy) > Math.abs(dx) * 0.6) return;     // solo gestos claramente horizontales
  const ei = ejercicioActual();
  ACCIONES["ir-ej"](dx < 0 ? ei + 1 : ei - 1);
}, { passive: true });

// ---------- Arranque ----------
iniciarTraductor();       // idiomas: traduce la pantalla si no es español (traductor.js)
cargar();
if (estado && estado.activa) { sesionRecuperada = true; tab = "entrenar"; }
pintar();
// Si se acaba de cambiar el idioma desde el registro, se vuelve a abrir el registro
try { if (!estado && sessionStorage.getItem("apex-abrir-registro")) { sessionStorage.removeItem("apex-abrir-registro"); pintarRegistro(); } } catch (e) { }
reanudarDescanso();
registrarServiceWorker();
abrirEnlaceAmigo();
if (hayPoliticaNueva() && $("hoja").hidden) hojaPoliticaNueva();
// Cuenta en la nube: al abrir la app, al recuperar internet y al volver a la app
procesarVueltaCorreo().then(function (hecho) { if (!hecho && conectado()) sincronizarYAvisar(false); });
window.addEventListener("online", function () { if (conectado()) { sincronizarYAvisar(false); compartirPendientes(); } });
let ultimaVueltaNube = 0;
document.addEventListener("visibilitychange", function () {
  if (document.visibilityState !== "visible" || !conectado() || Date.now() - ultimaVueltaNube < 60000) return;
  ultimaVueltaNube = Date.now();
  sincronizarYAvisar(false);
  compartirPendientes();
});
// Al abrir la app: comparte los entrenos recientes que no se pudieron compartir al terminar
setTimeout(compartirPendientes, 3000);
// Avisos push: al abrir la app y al volver a ella (como mucho una vez cada 10 minutos)
sincronizarAvisosPush();
let ultimaSyncPush = Date.now();
// Descanso en marcha: al salir de la app se programa el aviso de fin en el servidor; al volver, se cancela
document.addEventListener("visibilitychange", function () {
  const hayDescanso = estado && estado.activa && tFin > Date.now() && !$("timer").hidden;
  if (document.visibilityState === "hidden" && hayDescanso) programarDescansoPush(tFin, textoSiguiente());
  if (document.visibilityState === "visible") cancelarDescansoPush();
});
document.addEventListener("visibilitychange", function () {
  if (document.visibilityState !== "visible" || Date.now() - ultimaSyncPush < 10 * 60 * 1000) return;
  ultimaSyncPush = Date.now();
  sincronizarAvisosPush();
});
comprobarRecordatorios();
setInterval(comprobarRecordatorios, 5 * 60 * 1000);
document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") comprobarRecordatorios(); });

// Comparador de fotos: la línea se mueve mientras deslizas
document.addEventListener("input", function (ev) {
  if (ev.target.hasAttribute && ev.target.hasAttribute("data-comparar")) moverComparador(parseInt(ev.target.value));
});

// Calculadora de discos: se actualiza mientras escribes el peso de la serie actual
document.addEventListener("input", function (ev) {
  const t = ev.target;
  if (!t || !t.dataset || t.dataset.in !== "peso") return;
  const linea = document.querySelector(".discos-linea");
  if (!linea || !t.closest(".ts-fila.foco")) return;
  linea.textContent = textoDiscos(parseFloat(String(t.value).replace(",", ".")));
});

// Si acabas todas las series y luego añades una serie o un ejercicio más, el descanso no había empezado
// (la app pensaba que habías terminado). Aquí se pone en marcha con el tiempo que queda desde tu última serie.
function descansoTrasAnadir() {
  const a = estado.activa;
  if (!a || !a.ultimaSerie || !$("timer").hidden) return;          // ya hay un descanso en marcha
  const quedan = Math.round(a.ultimaSerie.seg - (Date.now() - a.ultimaSerie.hora) / 1000);
  if (quedan >= 5) empezarDescanso(quedan);
}

// «Mi semana»: la pista «+ Hora» se quita en cuanto la casilla tiene una hora
document.addEventListener("input", function (ev) {
  const t = ev.target;
  if (t && t.dataset && t.dataset.horaDia !== undefined && t.parentElement) t.parentElement.classList.toggle("vacia", !t.value);
});
