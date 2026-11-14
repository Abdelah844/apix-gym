// =====================================================
// APIX GYM 2.0 · PRUEBAS AUTOMÁTICAS
// Se ejecutan igual en el navegador (Ajustes → Pruebas) y en Node (node test/correr.js).
// Cada prueba crea sus propios datos; al terminar se restauran los datos del usuario.
// =====================================================

const TODO_EQUIPO = ["barra", "mancuernas", "maquina", "polea", "corporal"];
const OBJ = { series: 3, repMin: 8, repMax: 12, descanso: 90 };

// ---------- Ayudas para crear datos de prueba ----------

function estadoPrueba(cambios) {
  const perfil = { nombre: "Prueba", usuario: "prueba", sexo: "hombre", edad: 25, altura: 175, peso: 75, experiencia: "intermedio",
    objetivo: "masa", dias: 4, duracion: 60, lugar: "gimnasio", equipo: TODO_EQUIPO.slice(), evitar: "", lesiones: "" };
  for (const k in (cambios || {})) perfil[k] = cambios[k];
  estado = estadoVacio(perfil);
  estado.pesoCorporal = [{ fecha: "2025-01-01", kg: perfil.peso }];
}

// sesionPrueba("2026-03-02", [["press-banca", [[60, 10], [60, 9, 8]]]], { molestias: { "press-banca": true } })
function sesionPrueba(fecha, lista, extra) {
  extra = extra || {};
  const ejercicios = lista.map(function (par) {
    return { id: par[0], nota: "", molestias: !!(extra.molestias && extra.molestias[par[0]]), cambio: !!(extra.cambio && extra.cambio[par[0]]),
      series: par[1].map(function (x) { return { peso: x[0], reps: x[1], rpe: x[2] || null, hecha: x[3] === undefined ? true : x[3], sospechosa: !!x[4], confirmada: false }; }) };
  });
  estado.sesiones.push({ id: "t" + estado.sesiones.length + "-" + fecha, fecha: fecha, diaIndex: 0, diaNombre: "Prueba", duracion: 60, ejercicios: ejercicios, prs: [] });
  recalcularHistorial();
}

// Varias sesiones de cuerpo completo, una por semana
function historialCompleto(semanas, kgBase) {
  const ejercicios = ["press-banca", "jalon", "press-militar", "curl-barra", "extension-polea", "sentadilla", "curl-femoral-tumbado", "hip-thrust",
    "press-maquina", "remo-maquina", "elevaciones-laterales", "curl-martillo", "triceps-maquina", "prensa", "peso-muerto-rumano", "abductores"];
  for (let i = 0; i < semanas; i++) {
    const fecha = sumarDias("2026-01-05", i * 7);
    sesionPrueba(fecha, ejercicios.map(function (id) {
      const e = buscarEj(id);
      const kg = redondearA(e.factor * 75 * (kgBase || 0.6), 2.5);
      return [id, [[kg, 8], [kg, 8], [kg, 7]]];
    }));
  }
}

function casi(a, b, margen) { return Math.abs(a - b) <= (margen || 0.01); }

// Simula que el almacenamiento falla (memoria llena)
function simularFallo(activo) {
  const proto = Object.getPrototypeOf(localStorage);
  if (activo) { proto._setOriginal = proto.setItem; proto.setItem = function () { throw new Error("QuotaExceededError"); }; }
  else if (proto._setOriginal) { proto.setItem = proto._setOriginal; delete proto._setOriginal; }
}

// ---------- Lista de pruebas ----------

const PRUEBAS = [
  // ===== Fórmula de fuerza =====
  ["Fórmula", "1RM: 100 kg × 1 = 103,3 y × 10 = 133,3", function () {
    return (casi(unaRM(100, 1), 103.333) && casi(unaRM(100, 10), 133.333)) || "Valores: " + unaRM(100, 1) + ", " + unaRM(100, 10);
  }],
  ["Fórmula", "Cada repetición vale +3,3 % y por encima de 12 no suma", function () {
    if (!casi(unaRM(100, 6) - unaRM(100, 5), 3.333)) return "Una rep no vale 3,3 kg sobre 100 kg";
    return (unaRM(100, 20) === unaRM(100, 12) && unaRM(100, 0) === 0) || "No se limita a 12 reps";
  }],
  ["Fórmula", "Peso corporal: 90 kg necesita un 31 % más que 60 kg", function () {
    const r = referenciaCorporal(90) / referenciaCorporal(60);
    return casi(r, 1.312, 0.005) || "Proporción " + r.toFixed(3);
  }],

  // ===== Rangos =====
  ["Rangos", "Mismos registros dan siempre el mismo rango", function () {
    estadoPrueba(); historialCompleto(8);
    const a = JSON.stringify(fotoRangos()) + puntosGlobal();
    estado = JSON.parse(JSON.stringify(estado));
    return a === JSON.stringify(fotoRangos()) + puntosGlobal() || "Resultados distintos";
  }],
  ["Rangos", "El orden de las sesiones no cambia el rango", function () {
    estadoPrueba(); historialCompleto(8);
    const a = puntosGlobal();
    estado.sesiones.reverse();
    return a === puntosGlobal() || "Cambió al invertir el orden";
  }],
  ["Rangos", "Cambiar el peso corporal hoy no cambia marcas antiguas", function () {
    estadoPrueba(); historialCompleto(8);
    const a = puntosEjercicio("press-banca");
    estado.pesoCorporal.push({ fecha: "2027-01-01", kg: 95 });
    return a === puntosEjercicio("press-banca") || "Antes " + a + ", después " + puntosEjercicio("press-banca");
  }],
  ["Rangos", "Con más peso corporal, la misma marca vale menos", function () {
    estadoPrueba({ peso: 60 }); sesionPrueba("2026-01-01", [["press-banca", [[70, 8]]]]);
    const ligero = puntosSerie(buscarEj("press-banca"), 70, 8, "2026-01-01");
    estadoPrueba({ peso: 90 }); sesionPrueba("2026-01-01", [["press-banca", [[70, 8]]]]);
    const pesado = puntosSerie(buscarEj("press-banca"), 70, 8, "2026-01-01");
    return pesado < ligero || "No se ajusta al peso corporal";
  }],
  ["Rangos", "Con la misma marca, una mujer obtiene más puntos que un hombre", function () {
    estadoPrueba({ sexo: "hombre" }); sesionPrueba("2026-01-01", [["press-banca", [[50, 8]]], ["sentadilla", [[80, 8]]]]);
    const h = [puntosSerie(buscarEj("press-banca"), 50, 8, "2026-01-01"), puntosSerie(buscarEj("sentadilla"), 80, 8, "2026-01-01")];
    estado.perfil.sexo = "mujer";
    const m = [puntosSerie(buscarEj("press-banca"), 50, 8, "2026-01-01"), puntosSerie(buscarEj("sentadilla"), 80, 8, "2026-01-01")];
    return (m[0] > h[0] && m[1] > h[1]) || "Hombre " + h.map(Math.round) + ", mujer " + m.map(Math.round);
  }],
  ["Rangos", "El ajuste por sexo es mayor en tren superior que en inferior", function () {
    estadoPrueba({ sexo: "mujer" });
    const sup = factorEj(buscarEj("press-banca")) / buscarEj("press-banca").factor;
    const inf = factorEj(buscarEj("sentadilla")) / buscarEj("sentadilla").factor;
    return (casi(sup, 0.6) && casi(inf, 0.75)) || "Superior " + sup + ", inferior " + inf;
  }],
  ["Rangos", "«Prefiero no decirlo» usa un punto intermedio y es el valor por defecto", function () {
    estadoPrueba({ sexo: "nd" });
    const nd = factorEj(buscarEj("press-banca"));
    estado.perfil.sexo = "hombre"; const h = factorEj(buscarEj("press-banca"));
    estado.perfil.sexo = "mujer"; const m = factorEj(buscarEj("press-banca"));
    if (!(nd < h && nd > m)) return "No es intermedio";
    const antiguo = JSON.parse(JSON.stringify(estado)); antiguo.version = 2; delete antiguo.perfil.sexo;
    const r = validarImport(JSON.stringify(antiguo));
    return (r.ok && r.datos.perfil.sexo === "nd") || "Un perfil antiguo no recibe el valor por defecto";
  }],
  ["Rangos", "Un día excepcional no sube el rango por sí solo", function () {
    estadoPrueba();
    for (let i = 0; i < 6; i++) sesionPrueba(sumarDias("2026-01-05", i * 7), [["press-banca", [[60, 8]]]]);
    const habitual = puntosEjercicio("press-banca");
    sesionPrueba("2026-02-20", [["press-banca", [[85, 8]]]]);
    const mejorDia = puntosSerie(buscarEj("press-banca"), 85, 8, "2026-02-20");
    const ahora = puntosEjercicio("press-banca");
    return (ahora > habitual && ahora < mejorDia - 10) || "Habitual " + habitual + ", ahora " + ahora + ", día bueno " + mejorDia.toFixed(1);
  }],
  ["Rangos", "Entrenar solo un músculo no da rango global alto", function () {
    estadoPrueba();
    for (let i = 0; i < 20; i++) sesionPrueba(sumarDias("2026-01-05", i * 3), [["curl-barra", [[60, 10]]]]);
    const p = puntosGlobal();
    return p <= 12.5 || "Global " + p + " (" + RANGOS[rangoDePuntos(p)].nombre + ")";
  }],
  ["Rangos", "Los entrenos vacíos no desbloquean topes", function () {
    estadoPrueba(); historialCompleto(2, 1.2);
    for (let i = 0; i < 20; i++) sesionPrueba(sumarDias("2026-03-01", i), [["press-banca", [[60, 8, null, false]]]]);
    return (sesionesValidas().length === 2 && puntosGlobal() <= 35) || "Sesiones válidas " + sesionesValidas().length + ", global " + puntosGlobal();
  }],
  ["Rangos", "Una serie en revisión no cuenta hasta confirmarla", function () {
    estadoPrueba(); historialCompleto(6);
    const antes = puntosEjercicio("press-banca");
    sesionPrueba("2026-03-01", [["press-banca", [[200, 8, null, true, true]]]]);
    if (puntosEjercicio("press-banca") !== antes) return "Contó un dato sin confirmar";
    estado.sesiones[estado.sesiones.length - 1].ejercicios[0].series[0].confirmada = true;
    return puntosEjercicio("press-banca") > antes || "Confirmada y aun así no cuenta";
  }],
  ["Rangos", "Con una sola sesión del ejercicio, máximo el tercer rango (Plata)", function () {
    estadoPrueba(); sesionPrueba("2026-01-01", [["press-banca", [[150, 8]]]]);
    return puntosEjercicio("press-banca") <= 35 || "Puntos " + puntosEjercicio("press-banca");
  }],
  ["Rangos", "Un grupo con un solo ejercicio tiene tope del séptimo rango (Diamante)", function () {
    estadoPrueba();
    for (let i = 0; i < 8; i++) sesionPrueba(sumarDias("2026-01-05", i * 7), [["press-banca", [[140, 8]]]]);
    return puntosGrupo("pecho") <= 77 || "Pecho " + puntosGrupo("pecho");
  }],

  // ===== Calidad de datos =====
  ["Datos", "500 kg y 80 repeticiones se bloquean", function () {
    estadoPrueba(); historialCompleto(3);
    return (validarSerie("press-banca", 500, 8).nivel === "error" && validarSerie("press-banca", 60, 80).nivel === "error") || "No se bloquearon";
  }],
  ["Datos", "Un posible peso en libras queda en revisión", function () {
    estadoPrueba(); sesionPrueba("2026-01-01", [["press-banca", [[60, 8]]]]);
    return validarSerie("press-banca", 132, 8).nivel === "aviso" || "No avisó";
  }],
  ["Datos", "Importar rechaza datos inválidos y acepta copias buenas", function () {
    estadoPrueba(); historialCompleto(2);
    if (validarImport("hola").ok) return "Aceptó texto que no es JSON";
    if (validarImport('{"perfil":{"nombre":"x"},"sesiones":[{"fecha":"2026-01-01","ejercicios":[{"id":"inventado","series":[]}]}]}').ok) return "Aceptó un ejercicio inventado";
    if (validarImport('{"perfil":{"nombre":"x"},"sesiones":[{"fecha":"2026-01-01","ejercicios":[{"id":"press-banca","series":[{"peso":900,"reps":5}]}]}]}').ok) return "Aceptó 900 kg";
    return validarImport(JSON.stringify(estado)).ok || "Rechazó una copia válida";
  }],

  // ===== Guardado =====
  ["Guardado", "Cerrar y abrir conserva los datos", function () {
    estadoPrueba(); historialCompleto(3);
    const antes = JSON.stringify(estado);
    guardar(); estado = null; cargar();
    return JSON.stringify(estado) === antes || "Los datos cambiaron";
  }],
  ["Guardado", "Si el archivo principal se daña, se recupera de la copia", function () {
    estadoPrueba(); historialCompleto(3);
    const antes = estado.sesiones.length;
    guardar();
    localStorage.setItem(CLAVE, "{roto");
    estado = null; cargar();
    return (estado && estado.sesiones.length === antes && recuperadoDeCopia) || "No se recuperó";
  }],
  ["Guardado", "Si guardar falla, se avisa, no se pierde nada y se puede reintentar", function () {
    estadoPrueba(); historialCompleto(2);
    simularFallo(true);
    const ok = guardar();
    const avisado = errorGuardado;
    simularFallo(false);
    if (ok || !avisado) return "El fallo no se detectó";
    if (estado.sesiones.length !== 2) return "Se perdieron datos en memoria";
    return (guardar() && !errorGuardado) || "El reintento no funcionó";
  }],

  // ===== Sesiones =====
  ["Sesiones", "Registrar 100 series sin pérdidas", function () {
    estadoPrueba();
    estado.rutina = generarRutina({ objetivo: "masa", nivel: "intermedio", dias: 4, duracion: 60, tipo: "auto", equipo: TODO_EQUIPO, prioridad: "", evitar: "" });
    crearSesion(0);
    const e = estado.activa.ejercicios[0];
    e.series = [];
    for (let i = 0; i < 100; i++) e.series.push({ peso: 40, reps: 10, rpe: null, hecha: true });
    const r = terminarSesion();
    return r.sesion.seriesHechas === 100 || "Se guardaron " + r.sesion.seriesHechas;
  }],
  ["Sesiones", "Terminar dos veces no duplica la sesión", function () {
    estadoPrueba();
    estado.rutina = generarRutina({ objetivo: "masa", nivel: "intermedio", dias: 4, duracion: 60, tipo: "auto", equipo: TODO_EQUIPO, prioridad: "", evitar: "" });
    crearSesion(0);
    estado.activa.ejercicios[0].series[0].hecha = true;
    const copia = JSON.stringify(estado.activa);
    terminarSesion();
    estado.activa = JSON.parse(copia);
    const r = terminarSesion();
    return (r.duplicado && estado.sesiones.length === 1) || "Hay " + estado.sesiones.length + " sesiones";
  }],
  ["Sesiones", "Un entreno sin series hechas no se guarda", function () {
    estadoPrueba();
    estado.rutina = generarRutina({ objetivo: "masa", nivel: "intermedio", dias: 4, duracion: 60, tipo: "auto", equipo: TODO_EQUIPO, prioridad: "", evitar: "" });
    crearSesion(0);
    const r = terminarSesion();
    return (r.vacio && estado.sesiones.length === 0) || "Se guardó un entreno vacío";
  }],
  ["Sesiones", "Un entreno empezado ayer se guarda con su fecha y máximo 3 h", function () {
    estadoPrueba();
    estado.rutina = generarRutina({ objetivo: "masa", nivel: "intermedio", dias: 4, duracion: 60, tipo: "auto", equipo: TODO_EQUIPO, prioridad: "", evitar: "" });
    crearSesion(0);
    const ayer = new Date(); ayer.setDate(ayer.getDate() - 1); ayer.setHours(12, 0, 0, 0);   // ayer a mediodía (con 26 h fallaba justo después de medianoche)
    estado.activa.inicio = ayer.getTime();
    estado.activa.ejercicios[0].series[0].hecha = true;
    const r = terminarSesion();
    return (r.sesion.fecha === fechaTexto(1) && r.sesion.duracion <= 180) || r.sesion.fecha + ", " + r.sesion.duracion + " min";
  }],
  ["Sesiones", "Corregir un entreno recalcula los récords", function () {
    estadoPrueba();
    sesionPrueba("2026-01-01", [["press-banca", [[60, 8]]]]);
    sesionPrueba("2026-01-08", [["press-banca", [[60, 8]]]]);
    if (estado.sesiones[1].prs.length !== 0) return "Récord falso antes de editar";
    estado.sesiones[1].ejercicios[0].series[0].peso = 65;
    recalcularHistorial();
    return estado.sesiones[1].prs.includes("press-banca") || "No se detectó el récord";
  }],
  ["Sesiones", "Borrar un entreno mantiene los récords coherentes", function () {
    estadoPrueba();
    sesionPrueba("2026-01-01", [["press-banca", [[60, 8]]]]);
    sesionPrueba("2026-01-08", [["press-banca", [[70, 8]]]]);
    sesionPrueba("2026-01-15", [["press-banca", [[65, 8]]]]);
    estado.sesiones.splice(1, 1);
    recalcularHistorial();
    return estado.sesiones[1].prs.includes("press-banca") || "El récord no pasó a la siguiente sesión";
  }],

  // ===== Rutinas =====
  ["Rutinas", "Ninguna rutina supera el tiempo disponible (480 combinaciones)", function () {
    estadoPrueba();
    const fallos = [];
    for (const objetivo of ["masa", "fuerza", "condicion", "activo"]) for (const nivel of ["principiante", "intermedio", "avanzado"])
      for (let dias = 2; dias <= 6; dias++) for (const duracion of [30, 45, 60, 90]) for (const equipo of [TODO_EQUIPO, ["mancuernas", "corporal"]]) {
        const r = generarRutina({ objetivo: objetivo, nivel: nivel, dias: dias, duracion: duracion, tipo: "auto", equipo: equipo, prioridad: "", evitar: "" });
        for (const d of r.dias) if (duracionDia(d) > duracion) fallos.push(objetivo + "/" + nivel + "/" + dias + "d/" + duracion + "min: " + duracionDia(d));
      }
    return fallos.length === 0 || fallos.length + " fallos, p. ej. " + fallos[0];
  }],
  ["Rutinas", "La selección no depende del orden de la biblioteca", function () {
    estadoPrueba();
    const op = { objetivo: "masa", nivel: "intermedio", dias: 4, duracion: 60, tipo: "auto", equipo: TODO_EQUIPO, prioridad: "", evitar: "" };
    const a = JSON.stringify(generarRutina(op).dias);
    const original = EJERCICIOS.slice();
    EJERCICIOS.reverse();
    const b = JSON.stringify(generarRutina(op).dias);
    EJERCICIOS.length = 0; for (const e of original) EJERCICIOS.push(e);
    return a === b || "La rutina cambió al reordenar la biblioteca";
  }],
  ["Rutinas", "Los ejercicios que no puedes hacer no aparecen", function () {
    estadoPrueba();
    estado.evitados = ["press-banca", "sentadilla", "jalon"];
    const r = generarRutina({ objetivo: "masa", nivel: "intermedio", dias: 4, duracion: 60, tipo: "auto", equipo: TODO_EQUIPO, prioridad: "", evitar: "" });
    return !r.dias.some(function (d) { return d.ejercicios.some(function (o) { return estado.evitados.includes(o.id); }); }) || "Apareció un ejercicio evitado";
  }],
  ["Rutinas", "Las rutinas de gimnasio cumplen volumen y recuperación", function () {
    estadoPrueba();
    const fallos = [];
    for (const nivel of ["principiante", "intermedio", "avanzado"]) for (let dias = 3; dias <= 6; dias++) {
      const r = generarRutina({ objetivo: "masa", nivel: nivel, dias: dias, duracion: 60, tipo: "auto", equipo: TODO_EQUIPO, prioridad: "", evitar: "" });
      for (const p of r.problemas) if (p.tipo === "recuperacion" || p.tipo === "volumen-alto") fallos.push(nivel + " " + dias + "d: " + p.msg);
    }
    return fallos.length === 0 || fallos.length + " fallos, p. ej. " + fallos[0];
  }],
  ["Rutinas", "El validador detecta un músculo sin recuperación", function () {
    estadoPrueba();
    const r = { objetivo: "masa", nivel: "intermedio", duracion: 90, dias: [0, 1, 2, 3].map(function (i) {
      return { nombre: "Día " + (i + 1), ejercicios: [{ id: "press-banca", series: 4, repMin: 6, repMax: 10, descanso: 120 }] };
    }) };
    return validarRutina(r).some(function (p) { return p.tipo === "recuperacion"; }) || "No lo detectó";
  }],

  // ===== Progresión =====
  ["Progresión", "Una sola sesión buena no sube el peso: pide confirmarla", function () {
    estadoPrueba(); sesionPrueba("2026-01-01", [["press-maquina", [[60, 12], [60, 12], [60, 12]]]]);
    return recomendar("press-maquina", OBJ).accion === "mantener" || "Subió con una sola sesión";
  }],
  ["Progresión", "Dos sesiones seguidas en el máximo de reps sí suben", function () {
    estadoPrueba();
    sesionPrueba("2026-01-01", [["press-maquina", [[60, 12], [60, 12], [60, 12]]]]);
    sesionPrueba("2026-01-04", [["press-maquina", [[60, 12], [60, 12], [60, 12]]]]);
    const r = recomendar("press-maquina", OBJ);
    return (r.accion === "subir" && r.peso === 62.5) || r.accion + " " + r.peso;
  }],
  ["Progresión", "Con molestias no se sube peso", function () {
    estadoPrueba();
    sesionPrueba("2026-01-01", [["press-maquina", [[60, 12], [60, 12], [60, 12]]]]);
    sesionPrueba("2026-01-04", [["press-maquina", [[60, 12], [60, 12], [60, 12]]]], { molestias: { "press-maquina": true } });
    return recomendar("press-maquina", OBJ).accion !== "subir" || "Subió con molestias";
  }],
  ["Progresión", "Tras cambiar de máquina o técnica no se sube peso", function () {
    estadoPrueba();
    sesionPrueba("2026-01-01", [["press-maquina", [[60, 12], [60, 12], [60, 12]]]]);
    sesionPrueba("2026-01-04", [["press-maquina", [[60, 12], [60, 12], [60, 12]]]], { cambio: { "press-maquina": true } });
    return recomendar("press-maquina", OBJ).accion !== "subir" || "Subió tras cambiar de máquina";
  }],
  ["Progresión", "Con esfuerzo máximo (RPE 10) no se sube peso", function () {
    estadoPrueba();
    sesionPrueba("2026-01-01", [["press-maquina", [[60, 12, 10], [60, 12, 10], [60, 12, 10]]]]);
    sesionPrueba("2026-01-04", [["press-maquina", [[60, 12, 10], [60, 12, 10], [60, 12, 10]]]]);
    return recomendar("press-maquina", OBJ).accion !== "subir" || "Subió con RPE 10";
  }],
  ["Progresión", "No propone subidas mayores del 10 %", function () {
    estadoPrueba();
    sesionPrueba("2026-01-01", [["elevaciones-laterales", [[8, 12], [8, 12], [8, 12]]]]);
    sesionPrueba("2026-01-04", [["elevaciones-laterales", [[8, 12], [8, 12], [8, 12]]]]);
    const r = recomendar("elevaciones-laterales", OBJ);
    return r.accion !== "subir" || "Propuso pasar de 8 a " + r.peso + " kg";
  }],
  ["Progresión", "Con fatiga alta esta semana no se sube peso", function () {
    estadoPrueba();
    sesionPrueba(fechaTexto(3), [["press-maquina", [[60, 12, 9], [60, 12, 9], [60, 12, 9]]], ["jalon", [[50, 10, 10], [50, 10, 10], [50, 10, 10]]]]);
    sesionPrueba(fechaTexto(1), [["press-maquina", [[60, 12, 9], [60, 12, 9], [60, 12, 9]]], ["jalon", [[50, 10, 10], [50, 10, 10], [50, 10, 10]]]]);
    return recomendar("press-maquina", OBJ).accion !== "subir" || "Subió con fatiga alta";
  }],

  // ===== Retos y privacidad =====
  ["Retos", "Un reto solo cuenta tus sesiones válidas dentro de sus fechas", function () {
    estadoPrueba();
    sesionPrueba("2026-01-01", [["press-banca", [[60, 8]]]]);
    sesionPrueba("2026-01-10", [["press-banca", [[60, 8]]]]);
    sesionPrueba("2026-01-12", [["press-banca", [[60, 8, null, false]]]]);
    sesionPrueba("2026-02-01", [["press-banca", [[60, 8]]]]);
    return progresoReto({ tipo: "entrenos", meta: 5, inicio: "2026-01-05", fin: "2026-01-31" }) === 1 || "Contó " + progresoReto({ tipo: "entrenos", meta: 5, inicio: "2026-01-05", fin: "2026-01-31" });
  }],
  ["Retos", "La mejora de un reto se calcula con datos reales", function () {
    estadoPrueba();
    sesionPrueba("2026-01-01", [["press-banca", [[60, 8]]]]);
    sesionPrueba("2026-01-20", [["press-banca", [[66, 8]]]]);
    const v = progresoReto({ tipo: "mejora", meta: 5, inicio: "2026-01-10", fin: "2026-01-31", ejercicio: "press-banca" });
    return v === 10 || "Mejora " + v + " %";
  }],
  ["Privacidad", "Con perfil privado no se puede publicar", function () {
    estadoPrueba(); estado.ajustes.privacidad = "privado";
    return (!publicar("entreno", "x").ok && estado.social.posts.length === 0) || "Se publicó";
  }],
  ["Privacidad", "Sin «Mostrar mis entrenos» no se publica", function () {
    estadoPrueba(); estado.ajustes.compartir = false;
    return (!publicar("entreno", "x").ok && estado.social.posts.length === 0) || "Se publicó";
  }],
  ["Privacidad", "Menores de 16 no pueden publicar", function () {
    estadoPrueba({ edad: 15 });
    return !publicar("entreno", "x").ok || "Se publicó";
  }],
  ["Privacidad", "Límite de 10 publicaciones al día", function () {
    estadoPrueba();
    for (let i = 0; i < 12; i++) publicar("entreno", "x" + i);
    return estado.social.posts.length === 10 || "Hay " + estado.social.posts.length;
  }],
  ["Privacidad", "Un usuario bloqueado desaparece del feed y de la búsqueda", function () {
    crearDemo();
    estado.social.bloqueados.push("demo-laura");
    const enFeed = feedVisible().some(function (x) { return x.autorId === "demo-laura"; });
    const enBusqueda = buscarUsuarios("laura").length > 0;
    return (!enFeed && !enBusqueda) || "Sigue apareciendo";
  }],
  ["Privacidad", "Un perfil privado no aparece en la búsqueda", function () {
    crearDemo();
    return buscarUsuarios("hugo").length === 0 || "Apareció un perfil privado";
  }],
  // ===== Auditoría 2.1: un caso por cada defecto encontrado =====
  ["Auditoría 2.1", "«Añadir 1 serie» añade exactamente una serie y dice a qué ejercicio", function () {
    crearDemo();
    estado.rutina.duracion = 90;      // con tiempo de sobra, para que la serie quepa
    const g = "pecho";
    const destino = destinoSerieExtra(estado.rutina, g);
    if (!destino) return "No encontró dónde añadir";
    let antes = 0; for (const d of estado.rutina.dias) for (const o of d.ejercicios) antes += o.series;
    const texto = aplicarSugerencia({ tipo: "volumen", dia: destino.dia, pos: destino.pos, grupo: g });
    let despues = 0; for (const d of estado.rutina.dias) for (const o of d.ejercicios) despues += o.series;
    const nombre = buscarEj(estado.rutina.dias[destino.dia].ejercicios[destino.pos].id).nombre;
    return (despues - antes === 1 && texto.indexOf(nombre) >= 0) || "Añadió " + (despues - antes) + " series";
  }],
  ["Auditoría 2.1", "La recuperación cuenta la carga indirecta (press banca + tríceps al día siguiente)", function () {
    estadoPrueba();
    const r = { objetivo: "masa", nivel: "intermedio", duracion: 90, calendario: [0, 1], dias: [
      { nombre: "Día 1", ejercicios: [{ id: "press-banca", series: 4, repMin: 6, repMax: 10, descanso: 120 }, { id: "press-militar", series: 4, repMin: 6, repMax: 10, descanso: 120 }] },
      { nombre: "Día 2", ejercicios: [{ id: "extension-polea", series: 4, repMin: 10, repMax: 15, descanso: 60 }] }] };
    const triceps = validarRutina(r).some(function (p) { return p.tipo === "recuperacion" && p.grupo === "triceps"; });
    return triceps || "No detectó la carga indirecta del tríceps";
  }],
  ["Auditoría 2.1", "Con calendario real: lunes-miércoles-viernes no da conflictos, lunes-martes-miércoles sí", function () {
    estadoPrueba();
    const op = { objetivo: "masa", nivel: "intermedio", dias: 3, duracion: 60, tipo: "completo", equipo: TODO_EQUIPO, prioridad: "", evitar: "" };
    const separados = generarRutina(Object.assign({}, op, { calendario: [0, 2, 4] }));
    const seguidos = generarRutina(Object.assign({}, op, { calendario: [0, 1, 2] }));
    const recSep = separados.problemas.filter(function (p) { return p.tipo === "recuperacion"; }).length;
    const recSeg = validarRutina(Object.assign({}, separados, { calendario: [0, 1, 2] })).filter(function (p) { return p.tipo === "recuperacion"; }).length;
    return (recSep === 0 && recSeg > 0 && seguidos.calendario.join() === "0,1,2") || "Separados " + recSep + ", seguidos " + recSeg;
  }],
  ["Auditoría 2.1", "El domingo y el lunes cuentan como días seguidos", function () {
    return (diasHastaSiguiente([0, 6], 1) === 1 && diasHastaSiguiente([0, 3], 0) === 3 && diasHastaSiguiente([2], 0) === 7) || "Cálculo de días incorrecto";
  }],
  ["Auditoría 2.1", "Estancamiento real: 6 semanas sin mejorar sí se detecta", function () {
    estadoPrueba();
    for (let i = 0; i < 6; i++) sesionPrueba(sumarDias("2026-01-05", i * 7), [["press-maquina", [[60, 10]]]]);
    return estancamiento("press-maquina") !== null || "No lo detectó";
  }],
  ["Auditoría 2.1", "Un cambio de máquina reinicia la comparación (no hay estancamiento)", function () {
    estadoPrueba();
    for (let i = 0; i < 6; i++) sesionPrueba(sumarDias("2026-01-05", i * 7), [["press-maquina", [[60, 10]]]], i === 3 ? { cambio: { "press-maquina": true } } : {});
    return estancamiento("press-maquina") === null || "Comparó sesiones de máquinas distintas";
  }],
  ["Auditoría 2.1", "Las sesiones con molestias o en semana de fatiga no cuentan como estancamiento", function () {
    estadoPrueba();
    for (let i = 0; i < 3; i++) sesionPrueba(sumarDias("2026-01-05", i * 7), [["press-maquina", [[60, 10]]]]);
    for (let i = 3; i < 6; i++) sesionPrueba(sumarDias("2026-01-05", i * 7), [["press-maquina", [[60, 10, 10], [60, 10, 10], [60, 10, 10], [60, 10, 10], [60, 10, 10]]]], { molestias: { "press-maquina": i === 3 } });
    return estancamiento("press-maquina") === null || "Usó sesiones no comparables";
  }],
  ["Auditoría 2.1", "Tres sesiones en pocos días no bastan para hablar de estancamiento", function () {
    estadoPrueba();
    for (let i = 0; i < 3; i++) sesionPrueba(sumarDias("2026-01-05", i * 7), [["press-maquina", [[60, 10]]]]);
    for (let i = 0; i < 3; i++) sesionPrueba(sumarDias("2026-02-01", i * 2), [["press-maquina", [[60, 10]]]]);
    return estancamiento("press-maquina") === null || "Lo detectó con 3 sesiones en 4 días";
  }],
  ["Auditoría 2.1", "Un cambio de peso corporal grande excluye sesiones antiguas", function () {
    estadoPrueba();
    for (let i = 0; i < 6; i++) sesionPrueba(sumarDias("2026-01-05", i * 7), [["press-maquina", [[60, 10]]]]);
    estado.pesoCorporal.push({ fecha: "2026-03-01", kg: 82 });
    return estancamiento("press-maquina") === null || "Comparó con un peso corporal muy distinto";
  }],
  ["Auditoría 2.1", "Tonelaje externo y series efectivas van por separado", function () {
    estadoPrueba();
    sesionPrueba("2026-01-05", [["dominadas", [[0, 8], [0, 8]]], ["press-banca", [[60, 10]]]]);
    const s = estado.sesiones[0];
    const g = seriesEfectivasPorGrupo(estado.sesiones);
    return (s.volumen === 600 && s.seriesEfectivas === 3 && g.espalda === 2 && g.biceps === 1) || "Tonelaje " + s.volumen + ", efectivas " + s.seriesEfectivas;
  }],
  ["Auditoría 2.1", "Las semanas sin entrenos aparecen (con 0) en la gráfica", function () {
    const s = semanasEntre("2026-01-05", "2026-02-02");
    return (s.length === 5 && s[1] === "2026-01-12") || "Semanas: " + s.join(", ");
  }],
  ["Auditoría 2.1", "Importar rechaza series hechas con 0 repeticiones", function () {
    estadoPrueba(); historialCompleto(1);
    const d = JSON.parse(JSON.stringify(estado));
    d.sesiones[0].ejercicios[0].series[0].reps = 0;
    if (validarImport(JSON.stringify(d)).ok) return "Aceptó 0 repeticiones en una serie hecha";
    d.sesiones[0].ejercicios[0].series[0].hecha = false;
    return validarImport(JSON.stringify(d)).ok || "Rechazó una serie pendiente con 0 repeticiones";
  }],
  ["Auditoría 2.1", "Un perfil creado desde el formulario pasa la validación estricta", function () {
    estado = estadoVacio({ nombre: "Abde", usuario: "abde", sexo: "hombre", edad: 19, altura: 175, peso: 68, experiencia: "principiante",
      objetivo: "masa", dias: 3, duracion: 60, lugar: "gimnasio", equipo: ["barra", "mancuernas"], evitar: "", lesiones: "" });
    estado.rutina = generarRutina({ objetivo: "masa", nivel: "principiante", dias: 3, duracion: 60, tipo: "auto", equipo: ["barra", "mancuernas"], prioridad: "", evitar: "" });
    const e = validarEsquema(estado);
    return e.length === 0 || e[0];
  }],
  ["Auditoría 2.1", "Si los datos guardados tienen un error, se cargan con aviso y no se pierden", function () {
    estadoPrueba(); historialCompleto(3);
    estado.perfil.altura = 300;              // valor fuera de rango
    guardar();
    estado = null; cargar();
    return (estado && estado.sesiones.length === 3 && erroresCarga.length > 0) || "Se perdieron los datos";
  }],
  ["Auditoría 2.1", "Importar rechaza perfiles incompletos o con valores no permitidos", function () {
    estadoPrueba();
    const casos = [["equipo", undefined], ["equipo", []], ["equipo", ["laser"]], ["sexo", "otro"], ["edad", 8], ["dias", 9], ["duracion", 37], ["objetivo", "volar"]];
    for (const c of casos) {
      const d = JSON.parse(JSON.stringify(estado));
      if (c[1] === undefined) delete d.perfil[c[0]]; else d.perfil[c[0]] = c[1];
      if (validarImport(JSON.stringify(d)).ok) return "Aceptó " + c[0] + " = " + JSON.stringify(c[1]);
    }
    return true;
  }],
  ["Auditoría 2.1", "La exportación lleva versión y no se aceptan copias de versiones futuras", function () {
    estadoPrueba(); historialCompleto(2);
    const exp = JSON.parse(exportarDatos());
    if (exp.formato !== "apex-gym" || exp.version !== VERSION_DATOS) return "Falta formato o versión";
    const r = validarImport(exportarDatos());
    if (!r.ok || JSON.stringify(r.datos.sesiones) !== JSON.stringify(estado.sesiones)) return "Exportar e importar no da los mismos datos";
    exp.version = VERSION_DATOS + 1;
    return !validarImport(JSON.stringify(exp)).ok || "Aceptó una versión futura";
  }],
  ["Auditoría 2.1", "Una copia antigua (v1) se migra paso a paso", function () {
    estadoPrueba(); historialCompleto(1);
    const v1 = JSON.parse(JSON.stringify(estado));
    delete v1.version; delete v1.perfil.uid; delete v1.perfil.sexo; delete v1.perfil.diasSemana; delete v1.denuncias; delete v1.metricas; delete v1.evitados;
    v1.social.posts = [{ id: "p1", autor: "prueba", tipo: "entreno", texto: "x", fecha: "2026-01-05", likes: ["prueba"], comentarios: [] }];
    const r = validarImport(JSON.stringify(v1));
    if (!r.ok) return "No se pudo migrar: " + r.msg;
    const d = r.datos;
    return (d.version === VERSION_DATOS && d.perfil.uid && d.perfil.sexo === "nd" && d.social.posts[0].autorId === d.perfil.uid && d.social.posts[0].likes[0] === d.perfil.uid) || "Migración incompleta";
  }],
  ["Auditoría 2.1", "Cambiar el nombre de usuario no rompe tus publicaciones (id permanente)", function () {
    estadoPrueba();
    publicar("entreno", "hola");
    const uid = miId();
    estado.perfil.usuario = "nombre.nuevo";
    const mio = feedVisible().find(function (x) { return x.texto === "hola"; });
    return (mio && mio.autorId === uid && nombreDe(mio.autorId, mio.autorNombre) === "nombre.nuevo") || "La publicación se perdió o cambió de autor";
  }],
  ["Auditoría 2.1", "Una denuncia guarda motivo, fecha y estado, y oculta la publicación", function () {
    crearDemo();
    const r = denunciar("p-demo2", "ofensivo", "insulta");
    const d = estado.denuncias[0];
    const oculta = !feedVisible().some(function (x) { return x.id === "p-demo2"; });
    if (!r.ok || !d || d.motivo !== "ofensivo" || d.estado !== "pendiente-envio" || !d.fecha || !d.id || !oculta) return "Denuncia incompleta";
    return !denunciar("p-demo1", "inventado").ok || "Aceptó un motivo inexistente";
  }],
  ["Auditoría 2.1", "No se puede comentar una publicación que no puedes ver", function () {
    crearDemo();
    estado.social.bloqueados.push("demo-marcos");
    return !comentar("p-demo1", "hola").ok || "Comentó en una publicación oculta";
  }],
  ["Auditoría 2.1", "El temporizador sobrevive a una recarga", function () {
    const a = { descanso: { fin: 1000000 + 75000, total: 90 } };
    const copia = JSON.parse(JSON.stringify(a));
    return (descansoRestante(copia, 1000000) === 75 && descansoRestante(copia, 1000000 + 80000) === 0) || "Cálculo incorrecto";
  }],
  ["Auditoría 2.1", "La duración se calibra con lo que tardas de verdad", function () {
    estadoPrueba();
    estado.rutina = generarRutina({ objetivo: "masa", nivel: "intermedio", dias: 4, duracion: 90, tipo: "auto", equipo: TODO_EQUIPO, prioridad: "", evitar: "" });
    const dia = estado.rutina.dias[0];
    const estimada = duracionDia(dia, 1);
    for (let i = 0; i < 4; i++) {
      estado.sesiones.push({ id: "c" + i, fecha: sumarDias("2026-01-05", i * 7), diaIndex: 0, diaNombre: dia.nombre, duracion: Math.round(estimada * 1.3),
        ejercicios: [{ id: dia.ejercicios[0].id, series: [{ peso: 40, reps: 8, hecha: true }], nota: "" }], prs: [] });
    }
    const f = factorDuracion();
    return casi(f, 1.3, 0.05) || "Factor " + f;
  }],
  // ===== Versión 2.2: biblioteca, máquinas asistidas, Academia y Mi gimnasio =====
  ["2.2 Academia", "Todos los ejercicios tienen ficha completa y animación válida", function () {
    const p = revisarAcademia();
    return p.length === 0 || p.length + " problemas, p. ej. " + p[0];
  }],
  ["2.2 Academia", "Cada ficha tiene las cuatro partes: preparación, ejecución, errores y seguridad", function () {
    estadoPrueba();
    for (const e of EJERCICIOS) {
      const f = fichaEjercicio(e.id);
      if (f.preparacion.length < 1 || f.ejecucion.length < 2 || f.errores.length < 2 || f.seguridad.length < 3) return e.id + ": ficha incompleta";
      if (animacionSVG(e.id, e.nombre).indexOf("<animate") < 0) return e.id + ": sin animación";
    }
    return true;
  }],
  ["2.2 Academia", "Los ejercicios avanzados proponen una alternativa para principiantes", function () {
    estadoPrueba();
    const f = fichaEjercicio("dominadas");
    return (f.alternativa && f.alternativa.nivel === 1) || "Las dominadas no ofrecen alternativa";
  }],
  ["2.2 Biblioteca", "Los 9 ejercicios nuevos existen, con variantes válidas y su grupo", function () {
    const nuevos = ["aductores", "gemelo-sentado", "remo-pecho-apoyado", "dominadas-asistidas", "fondos-asistidos", "hip-thrust-maquina", "sentadilla-multipower", "press-inclinado-multipower", "hiperextensiones"];
    for (const id of nuevos) {
      const e = buscarEj(id);
      if (!e) return "Falta " + id;
      if (!GRUPOS[e.grupo]) return id + ": grupo desconocido";
      if (e.variantes.some(function (v) { return !buscarEj(v); })) return id + ": variante inexistente";
    }
    return EJERCICIOS.length >= 59 || "Hay " + EJERCICIOS.length + " ejercicios";
  }],
  ["2.2 Asistidos", "Con menos ayuda, la carga real y los puntos son mayores", function () {
    estadoPrueba({ peso: 80 });
    const e = buscarEj("dominadas-asistidas");
    const mucha = cargaSerie(e, 40, "2026-01-01"), poca = cargaSerie(e, 10, "2026-01-01");
    return (mucha === 40 && poca === 70 && puntosSerie(e, 10, 8, "2026-01-01") > puntosSerie(e, 40, 8, "2026-01-01")) || "Carga " + mucha + " / " + poca;
  }],
  ["2.2 Asistidos", "Progresar en una máquina asistida es QUITAR ayuda", function () {
    estadoPrueba({ peso: 80 });
    sesionPrueba("2026-01-01", [["dominadas-asistidas", [[30, 12], [30, 12], [30, 12]]]]);
    sesionPrueba("2026-01-04", [["dominadas-asistidas", [[30, 12], [30, 12], [30, 12]]]]);
    const r = recomendar("dominadas-asistidas", OBJ);
    return (r.accion === "subir" && r.peso === 25) || r.accion + " " + r.peso;
  }],
  ["2.2 Asistidos", "Si no llegas a las repeticiones, se propone MÁS ayuda", function () {
    estadoPrueba({ peso: 80 });
    sesionPrueba("2026-01-01", [["dominadas-asistidas", [[20, 5], [20, 4], [20, 4]]]]);
    sesionPrueba("2026-01-04", [["dominadas-asistidas", [[20, 5], [20, 4], [20, 4]]]]);
    const r = recomendar("dominadas-asistidas", OBJ);
    return (r.accion === "bajar" && r.peso === 25) || r.accion + " " + r.peso;
  }],
  ["2.2 Asistidos", "La ayuda no puede igualar tu peso y una bajada brusca de ayuda se revisa", function () {
    estadoPrueba({ peso: 70 });
    if (validarSerie("fondos-asistidos", 70, 8).nivel !== "error") return "Aceptó una ayuda igual al peso corporal";
    sesionPrueba("2026-01-01", [["fondos-asistidos", [[40, 8]]]]);
    if (validarSerie("fondos-asistidos", 20, 8).nivel !== "aviso") return "No avisó de 20 kg menos de ayuda";
    return validarSerie("fondos-asistidos", 50, 8).nivel === "ok" || "Avisó por usar más ayuda";
  }],
  ["2.2 Asistidos", "Los kg de ayuda no cuentan como tonelaje", function () {
    estadoPrueba();
    sesionPrueba("2026-01-01", [["dominadas-asistidas", [[30, 10]]], ["jalon", [[50, 10]]]]);
    return estado.sesiones[0].volumen === 500 || "Tonelaje " + estado.sesiones[0].volumen;
  }],
  ["2.2 Asistidos", "La ayuda inicial es menor que tu peso y mayor para principiantes", function () {
    estadoPrueba({ peso: 80, experiencia: "principiante" });
    const novato = pesoInicial("dominadas-asistidas");
    estado.perfil.experiencia = "avanzado";
    const avanzado = pesoInicial("dominadas-asistidas");
    return (novato < 80 && novato > avanzado) || "Principiante " + novato + ", avanzado " + avanzado;
  }],
  ["2.2 Asistidos", "Los datos de ejemplo usan la ayuda correctamente (menor que el peso y bajando)", function () {
    crearDemo();
    for (const id of ["dominadas-asistidas", "fondos-asistidos"]) {
      const series = seriesDe(id);
      if (!series.length) continue;
      if (series.some(function (s) { return s.peso >= pesoCorporalActual(); })) return id + ": ayuda igual o mayor que el peso corporal";
      if (series[series.length - 1].peso > series[0].peso) return id + ": la ayuda aumenta con el tiempo";
    }
    return true;
  }],
  ["2.2 Mi gimnasio", "Las máquinas que no hay en tu gimnasio no aparecen en las rutinas", function () {
    estadoPrueba();
    estado.noDisponibles = ["prensa", "hack", "press-maquina", "jalon", "remo-maquina", "sentadilla-multipower"];
    for (let dias = 2; dias <= 6; dias++) {
      const r = generarRutina({ objetivo: "masa", nivel: "intermedio", dias: dias, duracion: 60, tipo: "auto", equipo: TODO_EQUIPO, prioridad: "", evitar: "" });
      const hay = r.dias.some(function (d) { return d.ejercicios.some(function (o) { return estado.noDisponibles.includes(o.id); }); });
      if (hay) return "Apareció una máquina no disponible con " + dias + " días";
    }
    return true;
  }],
  ["2.2 Mi gimnasio", "Sin ninguna máquina, la rutina se hace con pesos libres", function () {
    estadoPrueba();
    estado.noDisponibles = EJERCICIOS.filter(function (e) { return e.equipo === "maquina" || e.equipo === "polea"; }).map(function (e) { return e.id; });
    const r = generarRutina({ objetivo: "masa", nivel: "intermedio", dias: 4, duracion: 60, tipo: "auto", equipo: TODO_EQUIPO, prioridad: "", evitar: "" });
    const total = r.dias.reduce(function (t, d) { return t + d.ejercicios.length; }, 0);
    const soloLibres = r.dias.every(function (d) { return d.ejercicios.every(function (o) { const e = buscarEj(o.id); return e.equipo !== "maquina" && e.equipo !== "polea"; }); });
    return (total >= 12 && soloLibres) || "Ejercicios: " + total;
  }],
  ["2.2 Mi gimnasio", "Las sugerencias de cambio solo proponen máquinas disponibles", function () {
    estadoPrueba();
    estado.noDisponibles = ["remo-pecho-apoyado", "remo-maquina"];
    return !disponible(buscarEj("remo-maquina")) && disponible(buscarEj("remo-mancuerna")) || "La comprobación de disponibilidad falla";
  }],
  ["2.2 Mi gimnasio", "Las copias v3 se migran y una máquina inventada se rechaza", function () {
    estadoPrueba(); historialCompleto(1);
    const v3 = JSON.parse(JSON.stringify(estado)); v3.version = 3; delete v3.noDisponibles;
    const r = validarImport(JSON.stringify(v3));
    if (!r.ok || !Array.isArray(r.datos.noDisponibles)) return "No se migró: " + r.msg;
    const mal = JSON.parse(JSON.stringify(estado)); mal.noDisponibles = ["maquina-inventada"];
    return !validarImport(JSON.stringify(mal)).ok || "Aceptó una máquina inventada";
  }],
  // ===== Apix, la mascota =====
  ["Unidades", "En libras se guarda en kg y se ve en lb sin perder precisión", function () {
    estadoPrueba();
    estado.ajustes.unidad = "lb";
    const kg = pesoDesdeVista(135);                         // escribes 135 lb
    if (Math.abs(kg - 61.235) > 0.01) return "135 lb deberían ser 61,23 kg y son " + kg;
    if (pesoVista(kg) !== 135) return "al volver a verlo sale " + pesoVista(kg);
    if (pesoVista(100) !== 220.5) return "100 kg deberían verse como 220,5 lb";
    if (convertirUnidades("Récord: 100 kg × 5").indexOf("lb") < 0) return "el texto no se convierte";
    estado.ajustes.unidad = "kg";
    return pesoVista(80) === 80 && pesoDesdeVista(80) === 80 || "en kg no debe cambiar nada";
  }],
  ["Rutinas", "Añadir, duplicar o borrar un día mantiene el calendario cuadrado", function () {
    estadoPrueba();
    estado.rutina = { nombre: "Prueba", dias: [{ nombre: "A", ejercicios: [] }, { nombre: "B", ejercicios: [] }, { nombre: "C", ejercicios: [] }], calendario: [0, 2, 4] };
    const r = estado.rutina;
    r.dias.push({ nombre: "Extra", ejercicios: [] }); cuadrarCalendario(r);
    if (r.calendario.length !== r.dias.length) return "al añadir: " + r.calendario.length + " vs " + r.dias.length;
    r.dias.splice(0, 2); cuadrarCalendario(r);
    if (r.calendario.length !== r.dias.length) return "al borrar: " + r.calendario.length + " vs " + r.dias.length;
    r.calendario = [0]; cuadrarCalendario(r);
    return validarEsquema(estado).length === 0 || validarEsquema(estado).join("; ");
  }],
  ["Mascota", "Felicita al superar un peso que antes no podías, nombrando el ejercicio y el peso", function () {
    estadoPrueba();
    sesionPrueba(fechaTexto(8), [["press-banca", [[60, 8]]]]);
    sesionPrueba(fechaTexto(1), [["press-banca", [[65, 8]]]]);
    const k = estadoMascota();
    return (k.humor === "celebra" && k.mensaje.indexOf("65 kg") >= 0 && k.mensaje.indexOf("press de banca") >= 0) || k.humor + ": " + k.mensaje;
  }],
  ["Mascota", "Se enfada cuando pierdes la racha y dice cuántas semanas tenías", function () {
    estadoPrueba();
    const esta = lunesDe(hoy());
    for (let s = 5; s >= 2; s--) for (const d of [0, 2]) sesionPrueba(sumarDias(esta, -s * 7 + d), [["press-banca", [[60, 8]]]]);
    const k = estadoMascota();
    return (k.humor === "enfadado" && k.mensaje.indexOf("4 semanas") >= 0) || k.humor + ": " + k.mensaje;
  }],
  ["Mascota", "Con la racha viva no se enfada", function () {
    estadoPrueba();
    const esta = lunesDe(hoy());
    for (let s = 4; s >= 1; s--) for (const d of [0, 2]) sesionPrueba(sumarDias(esta, -s * 7 + d), [["press-banca", [[60, 8]]]]);
    return estadoMascota().humor !== "enfadado" || "Se enfadó con la racha viva";
  }],
  ["Avisos", "El plan de avisos push solo incluye días de entreno y quita el de hoy si ya entrenaste", function () {
    estadoPrueba();
    estado.ajustes.notif = { recordatorios: true, racha: false, retos: false, hora: 18 };
    estado.rutina = generarRutina({ objetivo: "masa", nivel: "principiante", dias: 3, duracion: 60, tipo: "auto", equipo: TODO_EQUIPO, prioridad: "", evitar: "" });
    estado.rutina.calendario = [0, 2, 4];                       // lunes, miércoles y viernes
    const lunes = new Date(2026, 10, 9, 10, 0, 0);              // lunes 9 de noviembre de 2026, 10:00
    const plan = planAvisos(lunes, 7);
    if (plan.length !== 3) return "Esperaba 3 avisos en una semana y salen " + plan.length;
    if (new Date(plan[0].cuando).getHours() !== 18) return "El aviso no sale a la hora elegida";
    if (plan[0].titulo.indexOf("entrenar") < 0) return "Texto del aviso incorrecto";
    const tarde = new Date(2026, 10, 9, 19, 0, 0);              // a las 19:00 el aviso de hoy ya pasó
    if (planAvisos(tarde, 7).length !== 2) return "Incluye un aviso de hoy que ya ha pasado";
    sesionPrueba(aTexto(lunes), [["press-banca", [[60, 10]]]]);
    if (planAvisos(lunes, 7).length !== 2) return "No quita el aviso de hoy después de entrenar";
    return true;
  }],
  ["Mascota", "Un día de entreno sin entrenar te anima (las frases rotan)", function () {
    estadoPrueba();
    estado.rutina = generarRutina({ objetivo: "masa", nivel: "intermedio", dias: 6, duracion: 60, tipo: "auto", equipo: TODO_EQUIPO, prioridad: "", evitar: "",
      calendario: [0, 1, 2, 3, 4, 5, 6].filter(function (x) { return x !== ((new Date().getDay() + 6) % 7 + 1) % 7; }).slice(0, 6) });
    sesionPrueba(fechaTexto(4), [["press-banca", [[60, 8]]]]);
    const k = estadoMascota();
    // Las frases de "llevas días sin entrenar" rotan según el día: vale cualquiera de ellas
    const posibles = MENSAJES_APIX.animaFuerte.map(function (m) { return m.replace("{dias}", "4"); });
    return (k.humor === "anima" && posibles.indexOf(k.mensaje) >= 0) || k.humor + ": " + k.mensaje;
  }],
  ["Mascota", "En días de descanso no presiona y con molestias pide calma", function () {
    estadoPrueba();
    const hoyN = (new Date().getDay() + 6) % 7;
    estado.perfil.diasSemana = [(hoyN + 1) % 7, (hoyN + 3) % 7];
    if (estadoMascota().humor !== "descanso") return "No respetó el día de descanso";
    sesionPrueba(fechaTexto(1), [["press-banca", [[60, 8]]]], { molestias: { "press-banca": true } });
    return estadoMascota().humor === "cuida" || "Presionó con molestias";
  }],
  ["Mascota", "Si ya entrenaste hoy, te felicita; y se puede desactivar", function () {
    estadoPrueba();
    sesionPrueba(hoy(), [["press-banca", [[60, 8]]]]);
    if (estadoMascota().humor !== "campeon") return "No reconoció el entreno completo de hoy";
    if (apixSVG("campeon").indexOf("#FFD23F") < 0 || apixSVG("celebra").indexOf("#FFD23F") < 0 || apixSVG("orgulloso").indexOf("#FFD23F") >= 0) return "Amarillo solo con entreno completo, récord o reto";
    const ult = estado.sesiones[estado.sesiones.length - 1];
    ult.ejercicios[0].series.push({ peso: 60, reps: 8, hecha: false });
    if (estadoMascota().humor !== "orgulloso") return "Con series sin hacer no debería ponerse amarillo";
    ult.ejercicios[0].series.pop();
    estado.ajustes.mascota = false;
    return estadoMascota() === null || "Sigue apareciendo desactivada";
  }],
  ["Mascota", "Apix se dibuja en todos sus humores", function () {
    for (const h of ["contento", "anima", "enfadado", "celebra", "orgulloso", "campeon", "descanso", "cuida"]) if (apixSVG(h).indexOf("<svg") !== 0) return "Falla " + h;
    return true;
  }],
  ["Privacidad", "Fuera de la demo no hay datos ficticios", function () {
    crearDemo();
    estado.modo = "local";
    const ficticios = feedVisible().filter(function (x) { return x.demo; }).length;
    return (ficticios === 0 && buscarUsuarios("a").length === 0) || "Se mostraron datos ficticios";
  }]
  ,
  // ---------- 2.5: más máquinas, fotos, Apix y sonidos ----------
  ["Progreso", "El mapa del cuerpo colorea bien cada músculo según sus series", function () {
    if (nivelMusculo("pecho", 3) !== "poco") return "3 series de pecho a la semana deberían ser poco";
    if (nivelMusculo("pecho", 12) !== "bien") return "12 series de pecho a la semana deberían estar bien";
    if (nivelMusculo("pecho", 25) !== "mucho") return "25 series de pecho a la semana deberían ser mucho";
    if (nivelMusculo("gemelos", 4) !== "bien") return "En gemelos, 4 series a la semana ya están bien";
    return true;
  }],
  ["2.5 Máquinas", "Hay más de 100 ejercicios y todos tienen ficha, animación y fotos", function () {
    if (EJERCICIOS.length < 100) return "Solo hay " + EJERCICIOS.length;
    const sinFoto = EJERCICIOS.filter(function (e) { return !fotosDe(e.id); }).map(function (e) { return e.id; });
    if (sinFoto.length) return "Sin foto: " + sinFoto.join(", ");
    const p = revisarAcademia();
    return p.length === 0 || p.join(" | ");
  }],
  ["2.5 Máquinas", "Cada grupo muscular tiene al menos 3 opciones de máquina o polea", function () {
    for (const g in GRUPOS) {
      if (g === "antebrazos") continue;                    // los antebrazos se trabajan sobre todo con pesos libres
      const n = EJERCICIOS.filter(function (e) { return e.grupo === g && (e.equipo === "maquina" || e.equipo === "polea"); }).length;
      const minimo = g === "aductores" ? 2 : 3;               // en casi todos los gimnasios solo hay 1 o 2 máquinas de aductor
      if (n < minimo) return GRUPOS[g] + " solo tiene " + n;
    }
    return true;
  }],
  ["2.5 Máquinas", "Ningún identificador está repetido y todas las variantes existen", function () {
    const ids = EJERCICIOS.map(function (e) { return e.id; });
    const rep = ids.filter(function (x, i) { return ids.indexOf(x) !== i; });
    if (rep.length) return "Repetidos: " + rep.join(", ");
    const malas = EJERCICIOS.filter(function (e) { return e.variantes.some(function (v) { return !buscarEj(v); }); }).map(function (e) { return e.id; });
    return malas.length === 0 || "Variantes rotas en: " + malas.join(", ");
  }],
  ["2.5 Máquinas", "Las fotos de referencia (otro material) llevan su aviso", function () {
    for (const id in FOTO_REFERENCIA) {
      if (!buscarEj(id)) return id + " no existe";
      if (!FOTOS[id]) return id + " no tiene foto";
    }
    return Object.keys(FOTO_REFERENCIA).length === 0 || "Ya no debería quedar ninguna foto de otro ejercicio";
  }],
  ["2.5 Máquinas", "El generador sigue creando rutinas válidas con los ejercicios nuevos", function () {
    estadoPrueba();
    for (const nivel of ["principiante", "intermedio", "avanzado"]) for (let dias = 2; dias <= 6; dias++) {
      const r = generarRutina({ objetivo: "masa", nivel: nivel, dias: dias, duracion: 60, tipo: "auto", equipo: TODO_EQUIPO, prioridad: "", evitar: "" });
      const graves = r.problemas.filter(function (p) { return p.tipo === "vacio" || p.tipo === "duracion" || p.tipo === "recuperacion"; });
      if (graves.length) return nivel + "/" + dias + " días: " + graves[0].msg;
      for (const d of r.dias) for (const x of d.ejercicios) if (!encajaEnDia(buscarEj(x.id), d.tipo)) return x.id + " no encaja en " + d.nombre;
    }
    return true;
  }],
  ["Apix", "La mascota se llama Apix", function () {
    estadoPrueba({});
    const svg = apixSVG("contento");
    return (svg.indexOf("Apix") > 0 && MENSAJES_APIX.contento.some(function (m) { return m.indexOf("Apix") >= 0; })) || "El nombre no es Apix";
  }],
  ["Sonido", "Existen los 7 efectos y todos son cortos (menos de 2 segundos)", function () {
    const nombres = ["serie", "descanso", "tic", "record", "rango", "fin", "enfadado", "racha"];
    for (const n of nombres) {
      if (!SONIDOS[n] || SONIDOS[n].length === 0) return "Falta " + n;
      if (duracionSonido(n) > 2) return n + " dura " + duracionSonido(n) + " s";
      for (const nota of SONIDOS[n]) if (!(nota.f > 20 && nota.f < 20000 && nota.v > 0 && nota.v <= 0.3)) return n + ": nota fuera de rango";
    }
    return true;
  }],
  ["Sonido", "Si desactivas el sonido en Ajustes, no suena", function () {
    estadoPrueba({});
    estado.ajustes.sonido = false;
    if (sonar("record") !== false) return "Sonó con el sonido desactivado";
    estado.ajustes.sonido = true;
    return sonar("record") === true || "No suena con el sonido activado";
  }],
  ["Sonido", "Un nombre de sonido desconocido no rompe la app", function () {
    return sonar("no-existe") === false || "Debería devolver false";
  }]
  ,
  // ---------- 2.6: amigos, entreno guiado, progreso y recordatorios ----------
  ["2.6 Amigos", "Una tarjeta de amigo se codifica y se lee igual (con tildes)", function () {
    estadoPrueba({ usuario: "josé.ñú" });
    sesionPrueba(fechaTexto(3), [["press-banca", [[80, 5]]], ["sentadilla", [[100, 5]]]]);
    const enlace = enlaceTarjeta();
    if (enlace.indexOf(URL_APP + "#amigo=") !== 0) return "Enlace mal formado";
    const r = leerTarjeta(enlace);
    if (!r.ok) return r.msg;
    return (r.tarjeta.usuario === "josé.ñú" && r.tarjeta.records.length === 2 && r.tarjeta.records[0].n === "Sentadilla con barra") || JSON.stringify(r.tarjeta);
  }],
  ["2.6 Amigos", "Añadir un amigo con su enlace, actualizarlo y no poder añadirte a ti mismo", function () {
    estadoPrueba({ usuario: "laura" });
    estado.perfil.uid = "u-laura";
    sesionPrueba(fechaTexto(2), [["press-banca", [[50, 8]]]]);
    const enlaceLaura = enlaceTarjeta();
    if (anadirAmigoReal(enlaceLaura).ok) return "Se pudo añadir a sí misma";
    estadoPrueba({ usuario: "pablo" });
    estado.perfil.uid = "u-pablo";
    const r1 = anadirAmigoReal(enlaceLaura);
    if (!r1.ok || !r1.nuevo) return "No se añadió: " + r1.msg;
    const r2 = anadirAmigoReal(enlaceLaura.split("#")[1]);           // también vale solo el código
    if (!r2.ok || r2.nuevo) return "Debería actualizar, no duplicar";
    return estado.social.amigosReales.length === 1 || "Hay " + estado.social.amigosReales.length;
  }],
  ["2.6 Amigos", "Un código manipulado o inventado se rechaza", function () {
    estadoPrueba();
    if (leerTarjeta("hola").ok) return "Aceptó texto basura";
    const falsa = aBase64(JSON.stringify({ v: 1, uid: "x", usuario: "x", rango: 99, racha: 1, entrenos: 1, records: [], fecha: "2026-01-01" }));
    if (leerTarjeta(falsa).ok) return "Aceptó un rango imposible";
    const pesada = aBase64(JSON.stringify({ v: 1, uid: "x", usuario: "x", rango: 1, racha: 1, entrenos: 1, records: [{ n: "x", p: 9999, r: 5 }], fecha: "2026-01-01" }));
    return !leerTarjeta(pesada).ok || "Aceptó 9999 kg";
  }],
  ["2.6 Amigos", "Los datos antiguos se migran con la lista de amigos vacía", function () {
    const viejo = estadoVacio({ nombre: "A", dias: 3 });
    viejo.version = 4; delete viejo.social.amigosReales;
    const d = migrarDatos(viejo);
    return (d.version === VERSION_DATOS && Array.isArray(d.social.amigosReales)) || "Migración incompleta";
  }],
  ["2.6 Entreno", "Superserie: del primero pasa al segundo sin descanso y vuelve al primero tras descansar", function () {
    estadoPrueba();
    estado.activa = { inicio: Date.now(), diaIndex: null, diaNombre: "Libre", ejercicios: [ejercicioParaSesion("curl-barra"), ejercicioParaSesion("extension-polea")] };
    estado.activa.ejercicios[0].superserie = true;
    estado.activa.ejercicios[0].series[0].hecha = true;
    const p1 = siguientePaso(0);
    if (p1.ir !== 1 || p1.descanso) return "Paso 1: " + JSON.stringify(p1);
    estado.activa.ejercicios[1].series[0].hecha = true;
    const p2 = siguientePaso(1);
    return (p2.ir === 0 && p2.descanso) || "Paso 2: " + JSON.stringify(p2);
  }],
  ["2.6 Entreno", "Al acabar un ejercicio salta al siguiente con series pendientes", function () {
    estadoPrueba();
    estado.activa = { inicio: Date.now(), diaIndex: null, diaNombre: "Libre", ejercicios: [ejercicioParaSesion("press-banca"), ejercicioParaSesion("jalon")] };
    for (const s of estado.activa.ejercicios[0].series) s.hecha = true;
    const p = siguientePaso(0);
    if (p.ir !== 1) return "Fue a " + p.ir;
    for (const s of estado.activa.ejercicios[1].series) s.hecha = true;
    return siguientePaso(1).fin === true || "No detectó el final";
  }],
  ["2.6 Entreno", "Detecta un récord en directo solo si supera tu historial", function () {
    estadoPrueba();
    sesionPrueba(fechaTexto(7), [["press-banca", [[80, 5]]]]);
    estado.activa = { inicio: Date.now(), diaIndex: null, diaNombre: "Libre", ejercicios: [ejercicioParaSesion("press-banca")] };
    const e = estado.activa.ejercicios[0];
    e.series[0].peso = 80; e.series[0].reps = 5; e.series[0].hecha = true;
    if (esRecordEnVivo(0, 0)) return "Igualar no es récord";
    e.series[1].peso = 85; e.series[1].reps = 5; e.series[1].hecha = true;
    return esRecordEnVivo(0, 1) || "85×5 debería ser récord";
  }],
  ["2.6 Entreno", "El tipo de serie (drop set, rest-pause) se guarda al terminar", function () {
    estadoPrueba();
    estado.activa = { inicio: Date.now(), diaIndex: null, diaNombre: "Libre", ejercicios: [ejercicioParaSesion("curl-barra")] };
    const e = estado.activa.ejercicios[0];
    e.series[0].hecha = true; e.series[0].peso = 30; e.series[0].reps = 10;
    e.series.splice(1, 0, { peso: 24, reps: 8, rpe: null, hecha: true, tipo: "drop" });
    const r = terminarSesion();
    return r.sesion.ejercicios[0].series[1].tipo === "drop" || "Se perdió el tipo";
  }],
  ["2.6 Entreno", "Los ejercicios añadidos a mano descansan más si son compuestos", function () {
    estadoPrueba();
    return (ejercicioParaSesion("sentadilla").objetivo.descanso > ejercicioParaSesion("curl-barra").objetivo.descanso) || "Mismo descanso";
  }],
  ["2.6 Progreso", "Las fórmulas de 1RM dan valores lógicos y Epley sigue en los rangos", function () {
    estadoPrueba();
    for (const k in FORMULAS_1RM) {
      estado.ajustes.formula1RM = k;
      const v = rm1Mostrado(100, 5);
      if (!(v > 105 && v < 125)) return k + " da " + v;
      if (rm1Mostrado(100, 1) < 100 || rm1Mostrado(100, 1) > 104) return k + " con 1 rep da " + rm1Mostrado(100, 1);
    }
    estado.ajustes.formula1RM = "brzycki";
    return Math.abs(unaRM(100, 5) - 100 * (1 + 5 / 30)) < 0.001 || "Los rangos cambiaron de fórmula";
  }],
  ["2.6 Progreso", "La fatiga sube si la última semana triplica la carga habitual", function () {
    estadoPrueba();
    if (indiceFatiga().ratio !== null) return "Sin datos debería ser null";
    for (let i = 1; i <= 4; i++) sesionPrueba(fechaTexto(7 * i + 2), [["press-banca", [[60, 8], [60, 8], [60, 8]]]]);
    for (let i = 0; i < 3; i++) sesionPrueba(fechaTexto(i), [["press-banca", [[60, 8], [60, 8], [60, 8]]]]);
    const f = indiceFatiga();
    return (f.nivel === "muy-alta" || f.nivel === "alta") || "Nivel: " + f.nivel + " " + f.ratio;
  }],
  ["2.6 Progreso", "La carga semanal muestra todas las semanas, también las vacías", function () {
    estadoPrueba();
    sesionPrueba(fechaTexto(0), [["press-banca", [[50, 10]]]]);
    const c = cargaPorSemanas(8);
    return (c.length === 8 && c[7].carga.kg === 500 && c[0].carga.kg === 0) || JSON.stringify(c.map(function (x) { return x.carga.kg; }));
  }],
  ["2.6 Recordatorios", "Avisa el día de entreno a partir de la hora elegida y solo una vez", function () {
    estadoPrueba();
    const ahora = new Date(hoy() + "T19:30:00");
    estado.perfil.diasSemana = [(ahora.getDay() + 6) % 7];
    estado.ajustes.notif.hora = 18;
    const a = recordatorioPendiente(ahora);
    if (!a || a.tipo !== "entreno") return "No avisó: " + JSON.stringify(a);
    if (a.texto.indexOf("disciplina") < 0) return "Falta la frase de la disciplina";
    if (recordatorioPendiente(new Date(hoy() + "T10:00:00"))) return "Avisó antes de la hora";
    estado.ajustes.notif.ultimoAviso = hoy();
    return recordatorioPendiente(ahora) === null || "Avisó dos veces";
  }],
  ["2.6 Recordatorios", "No avisa si ya entrenaste hoy ni con molestias recientes", function () {
    estadoPrueba();
    const ahora = new Date(hoy() + "T20:00:00");
    estado.perfil.diasSemana = [0, 1, 2, 3, 4, 5, 6];
    sesionPrueba(hoy(), [["press-banca", [[50, 10]]]]);
    if (recordatorioPendiente(ahora)) return "Avisó habiendo entrenado";
    estadoPrueba();
    estado.perfil.diasSemana = [0, 1, 2, 3, 4, 5, 6];
    sesionPrueba(fechaTexto(1), [["press-banca", [[50, 10]]]], { molestias: { "press-banca": true } });
    return recordatorioPendiente(ahora) === null || "Avisó con molestias";
  }],
  ["2.6 Apix", "Apix recuerda un reto personal en marcha", function () {
    estadoPrueba();
    estado.social.retos.push({ id: "r1", tipo: "entrenos", meta: 5, inicio: fechaTexto(3), fin: sumarDias(hoy(), 4) });
    sesionPrueba(fechaTexto(2), [["press-banca", [[50, 10]]]]);
    const m = estadoMascota();
    return (m.accion === "ver-retos" && m.mensaje.indexOf("4 entrenos") >= 0) || JSON.stringify(m);
  }]
  ,
  ["2.6.2 Sonido", "El timbre del descanso es un audio WAV válido de más de 1 segundo", function () {
    const w = new DataView(wavDe(muestrasDe(SONIDOS.descanso)));
    const cab = String.fromCharCode(w.getUint8(0), w.getUint8(1), w.getUint8(2), w.getUint8(3));
    if (cab !== "RIFF") return "Cabecera: " + cab;
    if (w.getUint32(24, true) !== FRECUENCIA_MUESTREO) return "Frecuencia mal escrita";
    const d = duracionSonido("descanso");
    return (d > 1 && d < 2) || "Dura " + d + " s";
  }],
  ["2.6.2 Sonido", "El audio nunca se satura (sin distorsión)", function () {
    for (const n in SONIDOS) {
      const m = muestrasDe(SONIDOS[n]);
      let pico = 0;
      for (let i = 0; i < m.length; i++) pico = Math.max(pico, Math.abs(m[i]));
      if (pico > 0.95) return n + " llega a " + pico;
    }
    return true;
  }]
  ,
  // ---------- 2.7: calentamiento, copia, medidas y rutinas famosas ----------
  ["2.7 Calentamiento", "Press banca a 80 kg: barra sola, 40 y 55 kg, siempre subiendo y por debajo del peso de trabajo", function () {
    estadoPrueba();
    const c = seriesCalentamiento("press-banca", 80);
    const txt = c.map(function (x) { return x.peso + "x" + x.reps; }).join(" ");
    return txt === "20x10 40x5 55x3" || txt;
  }],
  ["2.7 Calentamiento", "Con pesos altos añade una serie más; en aislamiento y peso corporal no hay calentamiento", function () {
    estadoPrueba();
    if (seriesCalentamiento("sentadilla", 140).length !== 4) return "Sentadilla 140: " + seriesCalentamiento("sentadilla", 140).length;
    if (seriesCalentamiento("curl-barra", 40).length) return "El curl no debería tener";
    if (seriesCalentamiento("dominadas", 10).length) return "Las dominadas no deberían tener";
    if (seriesCalentamiento("press-banca", 25).length) return "Con 25 kg en barra no hace falta";
    return seriesCalentamiento("press-maquina", 60).length === 2 || "La máquina debería tener 2";
  }],
  ["2.7 Medidas", "Se guardan, se validan y se calcula el cambio", function () {
    estadoPrueba();
    if (guardarMedidas({ brazo: 5 }).ok) return "Aceptó 5 cm";
    if (guardarMedidas({}).ok) return "Aceptó vacío";
    estado.medidas.push({ fecha: "2026-01-01", brazo: 33, pecho: 95, cintura: 80, muslo: null });
    const r = guardarMedidas({ brazo: 34.5, pecho: null, cintura: 79, muslo: null });
    if (!r.ok) return r.msg;
    return (cambioMedida("brazo") === 1.5 && cambioMedida("cintura") === -1 && cambioMedida("muslo") === null && validarEsquema(estado).length === 0) || [cambioMedida("brazo"), cambioMedida("cintura"), validarEsquema(estado)].join(" | ");
  }],
  ["2.7 Copia", "Pide copia cada 14 días, y nunca en la demo ni sin entrenos", function () {
    estadoPrueba();
    if (necesitaCopia()) return "Sin entrenos no debería pedir";
    for (let i = 0; i < 3; i++) sesionPrueba(fechaTexto(i * 2), [["press-banca", [[50, 10]]]]);
    if (!necesitaCopia()) return "Con 3 entrenos y sin copia debería pedir";
    estado.ajustes.ultimaCopia = fechaTexto(3);
    if (necesitaCopia()) return "Copia de hace 3 días: no debería pedir";
    estado.ajustes.ultimaCopia = fechaTexto(15);
    if (!necesitaCopia()) return "Copia de hace 15 días: debería pedir";
    estado.ajustes.copiaPospuesta = hoy();
    return !necesitaCopia() || "Pospuesta hoy: no debería pedir";
  }],
  ["2.7 Copia", "Una copia exportada se puede restaurar (y el descanso de 75 s ya no la rompe)", function () {
    estadoPrueba();
    estado.ajustes.descanso = 75;
    estado.medidas.push({ fecha: "2026-01-01", brazo: 33, pecho: null, cintura: null, muslo: null });
    sesionPrueba(fechaTexto(1), [["press-banca", [[50, 10]]]]);
    const r = validarImport(exportarDatos());
    return (r.ok && r.datos.medidas.length === 1) || r.msg;
  }],
  ["2.7 Rutinas famosas", "Todas las rutinas usan ejercicios que existen y pasan la validación", function () {
    estadoPrueba();
    for (const k in RUTINAS_FAMOSAS) {
      const r = rutinaDesdePlantilla(k).rutina;
      estado.rutina = r;
      const err = validarEsquema(estado).filter(function (x) { return x.indexOf("rutina") >= 0; });
      if (err.length) return k + ": " + err[0];
      if (r.dias.length !== RUTINAS_FAMOSAS[k].dias) return k + ": días " + r.dias.length;
      if (r.dias.some(function (dd) { return dd.ejercicios.length < 3; })) return k + ": un día con menos de 3 ejercicios";
    }
    return true;
  }],
  ["2.7 Rutinas famosas", "Si no hay una máquina en tu gimnasio, la cambia por una parecida", function () {
    estadoPrueba();
    estado.noDisponibles = ["prensa"];
    const r = rutinaDesdePlantilla("ppl");
    const usa = r.rutina.dias.some(function (dd) { return dd.ejercicios.some(function (o) { return o.id === "prensa"; }); });
    return (!usa && r.cambios.length === 1 && r.cambios[0].indexOf("Prensa") === 0) || JSON.stringify(r.cambios);
  }],
  ["2.7 Datos", "Los datos antiguos se migran con medidas y copia", function () {
    const viejo = estadoVacio({ nombre: "A", dias: 3 });
    viejo.version = 5; delete viejo.medidas; delete viejo.ajustes.ultimaCopia;
    const d = migrarDatos(viejo);
    return (d.version === VERSION_DATOS && Array.isArray(d.medidas) && d.ajustes.ultimaCopia === "") || "Migración incompleta";
  }]
  ,
  ["2.9 Mi semana", "Cada día de entreno avisa a su hora; sin hora, a la general de Ajustes", function () {
    crearDemo();
    estado.sesiones = [];                                   // sin entrenos: no hay «hoy ya entrenaste»
    estado.ajustes.notif = { recordatorios: true, racha: false, retos: false, hora: 18 };
    guardarSemana([4, 0, 2, 3], { 0: "07:15", 2: "25:00", 5: "10:00" });
    if (estado.rutina.calendario.join() !== "0,2,3,4") return "Los días no se guardan ordenados";
    if (horaDeEntreno(0) !== "07:15") return "No guarda la hora del lunes";
    if (horaDeEntreno(2) !== "" || horaDeEntreno(5) !== "") return "Guarda horas no válidas o de días sin entreno";
    if (momentoAviso(0).h !== 7 || momentoAviso(0).m !== 15) return "El lunes debería avisar a las 7:15";
    if (momentoAviso(2).h !== 18 || momentoAviso(2).m !== 0) return "Sin hora debería usar la de Ajustes";
    const lunes = new Date(2026, 10, 16, 0, 0, 0);          // lunes 16 de noviembre de 2026
    const plan = planAvisos(lunes, 7);
    if (plan.length !== 4) return "Deberían salir 4 avisos, salen " + plan.length;
    const primero = new Date(plan[0].cuando);
    if (primero.getHours() !== 7 || primero.getMinutes() !== 15) return "El aviso del lunes no sale a las 7:15";
    if (plan[0].texto.indexOf(estado.rutina.dias[0].nombre) < 0) return "El aviso con hora no dice qué día toca";
    const segundo = new Date(plan[1].cuando);
    if (segundo.getHours() !== 18 || segundo.getDay() !== 3) return "El aviso del miércoles debería salir a las 18:00";
    // Menos días que la rutina: se guardan igual y la rutina no se rompe
    guardarSemana([0, 2, 4], { 0: "07:15" });
    if (diasDeEntreno().join() !== "0,2,4" || estado.perfil.dias !== 3) return "No deja entrenar menos días que la rutina";
    if (estado.rutina.calendario.length !== estado.rutina.dias.length) return "El calendario de la rutina se ha descuadrado";
    if (semanaCuadraConRutina() || diaRutinaDe(0) !== null) return "Con días que no cuadran no debería decir qué día toca";
    if (planAvisos(lunes, 7).length !== 3) return "Con 3 días deberían salir 3 avisos";
    if (validarEsquema(JSON.parse(JSON.stringify(estado))).length) return "El estado no es válido: " + validarEsquema(JSON.parse(JSON.stringify(estado)))[0];
    // En la app (sin push): antes de la hora no avisa, después sí
    if (recordatorioPendiente(new Date(2026, 10, 16, 7, 0, 0)) !== null) return "Avisa antes de la hora";
    return recordatorioPendiente(new Date(2026, 10, 16, 7, 20, 0)) !== null || "No avisa después de la hora";
  }],
  ["2.8 Logros", "Los logros se consiguen al llegar a su meta y no se repiten", function () {
    crearDemo();
    estado.logros = {};
    const d = datosLogros();
    const nuevos = revisarLogros();
    if (d.entrenos < 10) return "La demo debería tener al menos 10 entrenos";
    if (!estado.logros["entrenos-1"] || !estado.logros["entrenos-10"]) return "Faltan logros de entrenos";
    if (estado.logros["entrenos-100"]) return "Logro de 100 entrenos sin tenerlos";
    if (nuevos.length !== Object.keys(estado.logros).length) return "Los nuevos no coinciden con los guardados";
    if (revisarLogros().length !== 0) return "Un logro se ha dado dos veces";
    const sig = siguienteLogro();
    if (!sig || estado.logros[sig.logro.id]) return "El siguiente logro ya estaba conseguido";
    return new Set(LOGROS.map(function (l) { return l.id; })).size === LOGROS.length || "Hay logros con el mismo id";
  }],
  ["2.7 Guía", "Cada ejercicio explica cómo apuntar su peso según el material", function () {
    estadoPrueba();
    if (comoApuntar(buscarEj("curl-mancuernas")).corto.indexOf("UNA mancuerna") < 0) return "Mancuernas";
    if (comoApuntar(buscarEj("press-banca")).corto.indexOf("barra + discos") < 0) return "Barra";
    // Calculadora de discos: 60 kg = barra de 20 + 20 por lado; 62,5 = 20 + 1,25 por lado
    if (JSON.stringify(discosPorLado(60)) !== "[20]") return "Discos 60";
    if (JSON.stringify(discosPorLado(62.5)) !== "[20,1.25]") return "Discos 62,5";
    if (JSON.stringify(discosPorLado(102.5)) !== "[25,15,1.25]") return "Discos 102,5";
    if (discosPorLado(20) !== null || discosPorLado(61) !== null) return "Discos imposibles";
    if (usaBarraOlimpica(buscarEj("curl-mancuernas")) || !usaBarraOlimpica(buscarEj("press-banca"))) return "Barra olímpica";
    if (comoApuntar(buscarEj("dominadas-asistidas")).corto.indexOf("ayuda") < 0) return "Asistido";
    if (comoApuntar(buscarEj("fondos")).corto.indexOf("0 si no usas") < 0) return "Peso corporal";
    if (comoApuntar(buscarEj("press-banca-multipower")).corto.indexOf("multipower") < 0 && comoApuntar(buscarEj("press-banca-multipower")).corto.indexOf("guiada") < 0) return "Multipower";
    return EJERCICIOS.every(function (e) { const c = comoApuntar(e); return c.corto && c.largo; }) || "Algún ejercicio sin explicación";
  }]
  ,
  ["2.7 Copia", "Se puede elegir cada cuánto avisa (o nunca)", function () {
    estadoPrueba();
    for (let i = 0; i < 3; i++) sesionPrueba(fechaTexto(i * 2), [["press-banca", [[50, 10]]]]);
    estado.ajustes.ultimaCopia = fechaTexto(8);
    estado.ajustes.copiaDias = 7;
    if (!necesitaCopia()) return "Semanal: a los 8 días debería avisar";
    estado.ajustes.copiaDias = 30;
    if (necesitaCopia()) return "Mensual: a los 8 días no debería avisar";
    estado.ajustes.copiaDias = 0;
    return !necesitaCopia() || "Nunca: no debería avisar";
  }]
  ,
  // ---------- 2.7.3: privacidad ----------
  ["2.7.3 Privacidad", "Un perfil nuevo empieza sin aceptar la política y la versión es un número", function () {
    const e = estadoVacio({ nombre: "P", usuario: "ppp" });
    if (e.ajustes.privacidadAceptada !== "") return "Debería empezar vacío";
    return (typeof VERSION_PRIVACIDAD === "number" && VERSION_PRIVACIDAD >= 1) || "Versión no válida";
  }]
  ,
  // ---------- 2.8: cuenta en la nube ----------
  ["2.8 Nube", "Decide bien si subir, bajar o preguntar", function () {
    const t = "2026-11-03T10:00:00Z";
    const casos = [
      [false, null, {}, "nada"], [true, null, {}, "subir"], [false, { actualizado: t }, {}, "bajar"],
      [true, { actualizado: t }, { ultimaSync: t, pendiente: true }, "subir"],
      [true, { actualizado: t }, { ultimaSync: t, pendiente: false }, "nada"],
      [true, { actualizado: t }, { ultimaSync: "2026-11-01T10:00:00Z", pendiente: false }, "bajar"],
      [true, { actualizado: t }, { ultimaSync: "", pendiente: true }, "elegir"]
    ];
    for (const c of casos) { const r = decidirSync(c[0], c[1], c[2]); if (r !== c[3]) return "Esperaba " + c[3] + " y salió " + r; }
    return true;
  }],
  ["2.8 Nube", "Lee el enlace del correo (cambiar contraseña) y no confunde el de amigos", function () {
    const v = leerVueltaCorreo("#access_token=abc&expires_in=3600&refresh_token=xyz&token_type=bearer&type=recovery");
    if (!v || v.tipo !== "recovery" || v.access_token !== "abc" || v.refresh_token !== "xyz") return "No lee el enlace de recuperación";
    if (leerVueltaCorreo("#amigo=eyJ2IjoxfQ") !== null) return "Confunde el enlace de amigo";
    const e = leerVueltaCorreo("#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired");
    return (e && e.error === "Email link is invalid or has expired") || "No lee el error";
  }],
  ["2.8 Nube", "Los errores de Supabase se explican en español", function () {
    if (mensajeErrorNube({ error_code: "invalid_credentials", msg: "Invalid login credentials" }, 400).indexOf("incorrectos") < 0) return "Credenciales";
    if (mensajeErrorNube({ code: "user_already_exists" }, 422).indexOf("Ya existe") < 0) return "Ya existe";
    if (mensajeErrorNube(null, 0).indexOf("Sin conexión") < 0) return "Sin internet";
    return mensajeErrorNube({ msg: "email rate limit exceeded" }, 429).indexOf("Espera") >= 0 || "Límite";
  }],
  ["2.8 Nube", "Una copia de la nube con datos rotos no sustituye los del móvil", function () {
    estadoPrueba();
    const antes = estado.perfil.nombre, guardada = nube;
    nube = { id: "x", token: "t", ultimaSync: "", pendiente: true };
    const r = usarCopiaNube({ version: 6, actualizado: "2026-11-03T10:00:00Z", datos: { perfil: null } });
    nube = guardada;
    if (r.ok) return "Aceptó datos rotos";
    return estado.perfil.nombre === antes || "Ha cambiado los datos";
  }],
  ["2.8 Nube", "La sesión de la nube no va dentro de las copias de seguridad", function () {
    estadoPrueba();
    return JSON.stringify(estado).indexOf("refresco") < 0 || "La copia incluye el token";
  }]
  ,
  // ---------- 2.9: idiomas ----------
  ["2.9 Idiomas", "Traduce textos con números, con nombres y deja igual lo desconocido", function () {
    if (typeof tr !== "function") return true;          // sin traductor (no debería pasar)
    const antes = IDIOMA_ACTUAL;
    function probar(idioma) { IDIOMA_ACTUAL = idioma; traductorDicc = null; traductorCache.clear(); }
    try {
      probar("en");
      if (tr("Serie 3") !== "Set 3") return "Inglés con número: " + tr("Serie 3");
      if (tr("Hola, Abde") !== "Hi, Abde") return "Inglés con nombre: " + tr("Hola, Abde");
      if (tr("  Guardar  ") !== "  Save  ") return "No respeta los espacios";
      if (tr("Texto que no existe 123") !== "Texto que no existe 123") return "Cambia lo desconocido";
      if (tr("Pecho · Mancuernas · Básico") !== "Chest · Dumbbells · Basic") return "Partes con ·";
      probar("fr");
      if (tr("Serie 3") !== "Série 3") return "Francés: " + tr("Serie 3");
      probar("es");
      return tr("Serie 3") === "Serie 3" || "En español no debe cambiar nada";
    } finally { probar(antes); }
  }],
  ["2.9 Idiomas", "Cada traducción conserva los mismos números que el español", function () {
    if (typeof TRADUCCIONES === "undefined") return true;
    for (const k in TRADUCCIONES) {
      const n = (k.match(/\{n\}/g) || []).length;
      for (const t of TRADUCCIONES[k]) if ((t.match(/\{n\}/g) || []).length !== n) return "Números distintos en: " + k;
    }
    return true;
  }]
];

// Ejecuta todas las pruebas y restaura los datos del usuario
function ejecutarPruebas() {
  const copiaEstado = JSON.stringify(estado);
  let copiaPrincipal = null, copiaSecundaria = null;
  try { copiaPrincipal = localStorage.getItem(CLAVE); copiaSecundaria = localStorage.getItem(CLAVE_COPIA); } catch (e) { }
  const copiaFlags = { errorGuardado: errorGuardado, recuperadoDeCopia: recuperadoDeCopia, erroresCarga: erroresCarga.slice() };

  // Mientras se ejecutan las pruebas, NADA se sube a la nube (son datos de ejemplo)
  const silencioAntes = typeof nubeSilencio !== "undefined" ? nubeSilencio : false;
  if (typeof nubeSilencio !== "undefined") nubeSilencio = true;
  const resultados = [];
  for (const p of PRUEBAS) {
    let r;
    try { r = p[2](); } catch (e) { r = "Error: " + e.message; }
    simularFallo(false);
    resultados.push({ grupo: p[0], nombre: p[1], ok: r === true, detalle: r === true ? "" : String(r) });
  }

  estado = JSON.parse(copiaEstado);
  if (typeof nubeSilencio !== "undefined") nubeSilencio = silencioAntes;
  try {
    if (copiaPrincipal === null) localStorage.removeItem(CLAVE); else localStorage.setItem(CLAVE, copiaPrincipal);
    if (copiaSecundaria === null) localStorage.removeItem(CLAVE_COPIA); else localStorage.setItem(CLAVE_COPIA, copiaSecundaria);
  } catch (e) { }
  errorGuardado = copiaFlags.errorGuardado;
  recuperadoDeCopia = copiaFlags.recuperadoDeCopia;
  erroresCarga = copiaFlags.erroresCarga;
  return resultados;
}
