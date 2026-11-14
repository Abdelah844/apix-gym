// =====================================================
// APIX GYM 2.0 · LÓGICA (estado, cálculos, rutinas, progresión, rangos, social)
// Aquí no se pinta nada en pantalla: solo datos y cálculos.
// Todo lo de este archivo se puede probar sin navegador (ver pruebas.js).
// =====================================================

const CLAVE = "apexgym-v1";
const CLAVE_COPIA = "apexgym-v1-copia";
let estado = null;
let ultimoGuardado = null;      // hora del último guardado correcto
let errorGuardado = false;      // el último intento de guardar falló
let recuperadoDeCopia = false;  // al abrir, el archivo principal estaba dañado y se usó la copia

// Versión de los factores de dificultad. Son estimaciones: se recalibrarán con datos reales.
const FACTORES_VERSION = "v1 (estimados, pendientes de calibrar con datos reales)";

// ---------- Utilidades de fechas ----------

function fechaTexto(dias) {
  const d = new Date();
  d.setDate(d.getDate() - (dias || 0));
  return aTexto(d);
}
function aTexto(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function hoy() { return fechaTexto(0); }
function diasEntre(a, b) { return Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 86400000); }
function sumarDias(fecha, n) {
  const d = new Date(fecha + "T12:00:00");
  d.setDate(d.getDate() + n);
  return aTexto(d);
}
function lunesDe(fecha) {
  const d = new Date(fecha + "T12:00:00");
  d.setDate(d.getDate() - (d.getDay() + 6) % 7);
  return aTexto(d);
}
// Formato de fechas y números según el idioma (traductor.js). Sin traductor (pruebas en Node), español.
function localeApp() { return (typeof IDIOMA_ACTUAL !== "undefined" && typeof LOCALES_APP !== "undefined" && LOCALES_APP[IDIOMA_ACTUAL]) || "es-ES"; }
function fechaBonita(fecha) {
  return new Date(fecha + "T12:00:00").toLocaleDateString(localeApp(), { day: "numeric", month: "short" });
}

// =====================================================
// GUARDADO FIABLE
// =====================================================
// - Se guarda en dos sitios (principal y copia). Si uno se daña, se usa el otro.
// - Si falla, se avisa, los cambios siguen en memoria y se puede reintentar.

// Versión del formato de datos. Si cambia, se añade un paso en migrarDatos().
const VERSION_DATOS = 6;

function datosValidos(d) {
  return d && typeof d === "object" && d.perfil && typeof d.perfil.nombre === "string" && Array.isArray(d.sesiones);
}

function guardar() {
  let texto;
  try { texto = JSON.stringify(estado); } catch (e) { errorGuardado = true; avisar(); return false; }
  try {
    localStorage.setItem(CLAVE, texto);
    localStorage.setItem(CLAVE_COPIA, texto);
    ultimoGuardado = new Date();
    errorGuardado = false;
    if (typeof nubeCambio === "function") nubeCambio();     // si hay cuenta en la nube, sube la copia (nube.js)
  } catch (e) {
    errorGuardado = true;      // memoria llena o almacenamiento bloqueado: los cambios siguen en memoria
  }
  avisar();
  return !errorGuardado;
}

function avisar() { if (typeof avisoGuardado === "function") avisoGuardado(); }

// Carga los datos. Prioridad: principal válido → copia válida → el que se pueda leer (con aviso).
// Nunca se descartan los datos de un usuario en silencio por no pasar la validación.
let erroresCarga = [];
function cargar() {
  estado = null;
  recuperadoDeCopia = false;
  erroresCarga = [];
  const claves = [CLAVE, CLAVE_COPIA];
  const legibles = [];
  for (let i = 0; i < claves.length; i++) {
    try {
      const t = localStorage.getItem(claves[i]);
      if (!t) continue;
      let d = JSON.parse(t);
      if (!datosValidos(d)) continue;
      d = migrarDatos(d);
      cuadrarCalendario(d.rutina);          // repara rutinas guardadas con el fallo del calendario
      const errores = validarEsquema(d);
      if (errores.length === 0) { estado = d; recuperadoDeCopia = i === 1; return; }
      legibles.push({ datos: d, errores: errores, copia: i === 1 });
    } catch (e) { /* archivo dañado: probamos el siguiente */ }
  }
  if (legibles.length) {
    estado = legibles[0].datos;
    recuperadoDeCopia = legibles[0].copia;
    erroresCarga = legibles[0].errores;
  }
}

function borrarAlmacenamiento() {
  try { localStorage.removeItem(CLAVE); localStorage.removeItem(CLAVE_COPIA); } catch (e) { }
}

// Identificador permanente (no cambia aunque cambie el nombre de usuario)
function nuevoId(prefijo) {
  try { if (typeof crypto !== "undefined" && crypto.randomUUID) return prefijo + crypto.randomUUID(); } catch (e) { }
  return prefijo + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

const NOMBRES_DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

// Días de la semana propuestos según cuántos días entrenas (0 = lunes)
function calendarioPorDefecto(n) {
  return ({ 1: [0], 2: [0, 3], 3: [0, 2, 4], 4: [0, 1, 3, 4], 5: [0, 1, 2, 4, 5], 6: [0, 1, 2, 3, 4, 5], 7: [0, 1, 2, 3, 4, 5, 6] })[n] || [0, 2, 4];
}

// ---------- Unidades: todo se GUARDA en kg; si eliges libras, solo cambia lo que ves y escribes ----------
const KG_A_LB = 2.20462;
function usaLibras() { return !!(typeof estado !== "undefined" && estado && estado.ajustes && estado.ajustes.unidad === "lb"); }
function unidadPeso() { return usaLibras() ? "lb" : "kg"; }
// kg guardados → número que ves (en libras se redondea a media libra)
function pesoVista(kg) { if (!usaLibras() || typeof kg !== "number") return kg; return Math.round(kg * KG_A_LB * 2) / 2; }
// número que escribes → kg que se guardan
function pesoDesdeVista(v) { if (!usaLibras() || typeof v !== "number" || isNaN(v)) return v; return Math.round(v / KG_A_LB * 1000) / 1000; }

// Si cambia el número de días de la rutina (añadir, duplicar o borrar un día),
// el calendario semanal tiene que tener el mismo número de días.
function cuadrarCalendario(r) {
  if (!r || !Array.isArray(r.dias)) return;
  const n = r.dias.length;
  if (Array.isArray(r.calendario) && r.calendario.length === n) return;
  if (n <= 6) r.calendario = calendarioPorDefecto(n);
  else r.calendario = [0, 1, 2, 3, 4, 5, 6].slice(0, n);
}

function metricasVacias() {
  return { propuestas: 0, aceptadas: 0, correcciones: 0, avisos: 0, avisosConfirmados: 0, problemas: [] };
}

// Versión de la política de privacidad (privacidad.html). Si se cambia la política, se sube este número.
const VERSION_PRIVACIDAD = 6;

function estadoVacio(perfil) {
  perfil = perfil || {};
  if (!perfil.uid) perfil.uid = nuevoId("u-");
  if (!Array.isArray(perfil.diasSemana)) perfil.diasSemana = calendarioPorDefecto(perfil.dias || 3);
  return {
    version: VERSION_DATOS,
    modo: "local",
    perfil: perfil,
    ajustes: { ultimaCopia: "", privacidadAceptada: "", tema: "oscuro", descanso: 90, incremento: 2.5, incrementoMancuernas: 2, privacidad: "amigos", compartir: true,
      notif: { recordatorios: true, records: true, rangos: true, amigos: true, semanal: false } },
    rutina: null,
    sesiones: [],
    activa: null,
    pesoCorporal: perfil.peso ? [{ fecha: hoy(), kg: perfil.peso }] : [],
    favoritos: [],
    evitados: [],
    noDisponibles: [],      // máquinas que no hay en tu gimnasio
    ajustesMaquina: {},     // nota fija por ejercicio: "asiento 4, respaldo 2"
    ascensos: [],
    social: { amigos: [], bloqueados: [], posts: [], retos: [], amigosReales: [] },
    denuncias: [],
    medidas: [],
    metricas: metricasVacias()
  };
}

// ---------- Migraciones entre versiones del formato ----------
// Cada paso convierte los datos de una versión a la siguiente. Nunca se salta ninguno.
function migrarDatos(d) {
  const v = d.version || 1;
  if (v < 2) {
    // v1 → v2: ajustes nuevos, lista de evitados
    const base = estadoVacio({ nombre: "", dias: 3 });
    for (const k of ["ajustes", "favoritos", "evitados", "ascensos", "social", "pesoCorporal", "ajustesMaquina"]) if (d[k] === undefined) d[k] = base[k];
    for (const k in base.ajustes) if (d.ajustes[k] === undefined) d.ajustes[k] = base.ajustes[k];
    for (const k in base.social) if (d.social[k] === undefined) d.social[k] = base.social[k];
    if (d.rutina === undefined) d.rutina = null;
    if (d.activa === undefined) d.activa = null;
    if (!d.modo) d.modo = "local";
  }
  if (v < 3) {
    // v2 → v3: identificador permanente, sexo, calendario, autores por id, denuncias y métricas
    if (!d.perfil.uid) d.perfil.uid = nuevoId("u-");
    if (!d.perfil.sexo) d.perfil.sexo = "nd";
    if (!Array.isArray(d.perfil.diasSemana)) d.perfil.diasSemana = calendarioPorDefecto(d.perfil.dias || 3);
    const idDe = function (nombre) {
      if (nombre === d.perfil.usuario || nombre === "yo") return d.perfil.uid;
      const demo = USUARIOS_DEMO.find(function (u) { return u.usuario === nombre; });
      return demo ? demo.uid : "antiguo-" + nombre;
    };
    for (const p of d.social.posts) {
      if (!p.autorId) { p.autorId = idDe(p.autor); p.autorNombre = p.autor; delete p.autor; }
      p.likes = (p.likes || []).map(function (x) { return (x.indexOf("u-") === 0 || x.indexOf("demo-") === 0) ? x : idDe(x); });
      for (const c of p.comentarios || []) if (!c.autorId) { c.autorId = idDe(c.autor); c.autorNombre = c.autor; delete c.autor; }
    }
    d.social.amigos = d.social.amigos.map(function (x) { return x.indexOf("demo-") === 0 ? x : idDe(x); });
    d.social.bloqueados = d.social.bloqueados.map(function (x) { return x.indexOf("demo-") === 0 ? x : idDe(x); });
    d.social.retos = d.social.retos.filter(function (r) { return r.meta; });   // los retos con puntuaciones inventadas se descartan
    if (d.rutina && !Array.isArray(d.rutina.calendario)) d.rutina.calendario = calendarioPorDefecto(d.rutina.dias.length);
    if (!Array.isArray(d.denuncias)) d.denuncias = [];
    if (!d.metricas) d.metricas = metricasVacias();
    if (d.ajustes.incrementoMancuernas === undefined) d.ajustes.incrementoMancuernas = 2;
  }
  if (v < 4) {
    // v3 → v4: lista de máquinas que no hay en tu gimnasio
    if (!Array.isArray(d.noDisponibles)) d.noDisponibles = [];
  }
  if (v < 5) {
    // v4 → v5: amigos reales (añadidos con su tarjeta de amigo)
    if (!Array.isArray(d.social.amigosReales)) d.social.amigosReales = [];
  }
  if (v < 6) {
    // v5 → v6: medidas corporales y fecha de la última copia de seguridad
    if (!Array.isArray(d.medidas)) d.medidas = [];
    if (d.ajustes.ultimaCopia === undefined) d.ajustes.ultimaCopia = "";
  }
  d.version = VERSION_DATOS;
  return d;
}

// ---------- Validación estricta del esquema ----------
// Devuelve una lista de errores (vacía si todo es correcto).
const RPE_VALIDOS = [6, 7, 8, 8.5, 9, 9.5, 10];

function validarEsquema(d) {
  const err = [];
  function comprobar(cond, msg) { if (!cond) err.push(msg); }
  function entero(n, min, max) { return typeof n === "number" && Number.isInteger(n) && n >= min && n <= max; }
  function numero(n, min, max) { return typeof n === "number" && !isNaN(n) && n >= min && n <= max; }
  function fecha(f) { return typeof f === "string" && /^\d{4}-\d{2}-\d{2}$/.test(f); }

  if (!d || typeof d !== "object") return ["Formato no reconocido."];
  const p = d.perfil;
  comprobar(p && typeof p === "object", "Falta el perfil.");
  if (!p) return err;
  comprobar(typeof p.uid === "string" && p.uid.length > 3, "Perfil: falta el identificador.");
  comprobar(typeof p.nombre === "string" && p.nombre.trim().length > 0 && p.nombre.length <= 30, "Perfil: nombre no válido.");
  comprobar(typeof p.usuario === "string" && /^[a-z0-9._]{3,24}$/.test(p.usuario), "Perfil: usuario no válido.");
  comprobar(["hombre", "mujer", "nd"].includes(p.sexo), "Perfil: sexo no válido.");
  comprobar(entero(p.edad, 14, 90), "Perfil: edad fuera de rango (14-90).");
  comprobar(numero(p.altura, 120, 230), "Perfil: altura fuera de rango (120-230 cm).");
  comprobar(numero(p.peso, 35, 250), "Perfil: peso fuera de rango (35-250 kg).");
  comprobar(["principiante", "intermedio", "avanzado"].includes(p.experiencia), "Perfil: experiencia no válida.");
  comprobar(["masa", "fuerza", "condicion", "activo"].includes(p.objetivo), "Perfil: objetivo no válido.");
  comprobar(entero(p.dias, 1, 7), "Perfil: días por semana fuera de rango (1-7).");
  comprobar([30, 45, 60, 90].includes(p.duracion), "Perfil: duración no válida.");
  comprobar(["gimnasio", "casa", "calistenia"].includes(p.lugar), "Perfil: lugar no válido.");
  comprobar(Array.isArray(p.equipo) && p.equipo.length > 0 && p.equipo.every(function (x) { return EQUIPOS[x]; }), "Perfil: equipamiento no válido o vacío.");
  comprobar(Array.isArray(p.diasSemana) && p.diasSemana.every(function (x) { return entero(x, 0, 6); }), "Perfil: calendario no válido.");
  comprobar(typeof p.evitar === "string" && typeof p.lesiones === "string", "Perfil: campos de texto no válidos.");

  const a = d.ajustes;
  comprobar(a && ["oscuro", "claro", "sistema"].includes(a.tema), "Ajustes: tema no válido.");
  if (a) {
    comprobar(entero(a.descanso, 15, 600), "Ajustes: descanso no válido.");
    comprobar([1, 1.25, 2.5, 5].includes(a.incremento) && [1, 2, 2.5].includes(a.incrementoMancuernas), "Ajustes: incrementos no válidos.");
    comprobar(["publico", "amigos", "privado"].includes(a.privacidad) && typeof a.compartir === "boolean", "Ajustes: privacidad no válida.");
  }

  comprobar(Array.isArray(d.sesiones), "Falta el historial de sesiones.");
  for (const s of d.sesiones || []) {
    if (!fecha(s.fecha)) { err.push("Hay una sesión con fecha incorrecta."); break; }
    if (typeof s.id !== "string" || !Array.isArray(s.ejercicios)) { err.push("Hay una sesión mal formada."); break; }
    let mal = "";
    for (const e of s.ejercicios) {
      if (!buscarEj(e.id)) { mal = "Ejercicio desconocido: " + e.id; break; }
      if (!Array.isArray(e.series)) { mal = "Ejercicio sin series en " + s.fecha; break; }
      for (const x of e.series) {
        const m = validarValores(x.peso, x.reps, !!x.hecha);
        if (m) { mal = s.fecha + ": " + m; break; }
        if (x.rpe !== null && x.rpe !== undefined && !RPE_VALIDOS.includes(x.rpe)) { mal = s.fecha + ": RPE no válido."; break; }
      }
      if (mal) break;
    }
    if (mal) { err.push(mal); break; }
  }

  if (d.rutina !== null && d.rutina !== undefined) {
    const r = d.rutina;
    const okRutina = Array.isArray(r.dias) && r.dias.length >= 1 && r.dias.length <= 7 && r.dias.every(function (dia) {
      return typeof dia.nombre === "string" && Array.isArray(dia.ejercicios) && dia.ejercicios.every(function (o) {
        return buscarEj(o.id) && entero(o.series, 1, 10) && entero(o.repMin, 1, 50) && entero(o.repMax, o.repMin, 50) && entero(o.descanso, 15, 600);
      });
    });
    comprobar(okRutina, "La rutina tiene datos no válidos.");
    comprobar(Array.isArray(r.calendario) && r.calendario.length === (r.dias || []).length, "El calendario de la rutina no coincide con sus días.");
  }
  comprobar(Array.isArray(d.pesoCorporal) && d.pesoCorporal.every(function (x) { return fecha(x.fecha) && numero(x.kg, 35, 250); }), "Registro de peso corporal no válido.");
  comprobar(d.social && Array.isArray(d.social.posts) && Array.isArray(d.social.amigos) && Array.isArray(d.social.bloqueados) && Array.isArray(d.social.retos), "Datos sociales no válidos.");
  if (d.social && Array.isArray(d.social.posts)) comprobar(d.social.posts.every(function (x) { return typeof x.autorId === "string"; }), "Hay publicaciones sin autor.");
  comprobar(Array.isArray(d.favoritos) && Array.isArray(d.evitados) && Array.isArray(d.ascensos) && Array.isArray(d.denuncias), "Faltan listas internas.");
  comprobar(d.ajustesMaquina === undefined || (typeof d.ajustesMaquina === "object" && !Array.isArray(d.ajustesMaquina) &&
    Object.keys(d.ajustesMaquina).length <= 300 && Object.keys(d.ajustesMaquina).every(function (k) {
      return k.length <= 60 && typeof d.ajustesMaquina[k] === "string" && d.ajustesMaquina[k].length <= 80; })), "Los ajustes de las máquinas no son válidos.");
  comprobar(Array.isArray(d.noDisponibles) && d.noDisponibles.every(function (id) { return buscarEj(id); }), "La lista de máquinas de tu gimnasio no es válida.");
  comprobar(Array.isArray(d.medidas) && d.medidas.every(function (m) {
    return fecha(m.fecha) && CAMPOS_MEDIDAS.every(function (c) { return m[c[0]] === null || numero(m[c[0]], 10, 250); });
  }), "Las medidas corporales no son válidas.");
  return err;
}

// ---------- Exportar e importar (con versión) ----------
function exportarDatos() {
  return JSON.stringify({ formato: "apex-gym", version: VERSION_DATOS, exportado: new Date().toISOString(), datos: estado }, null, 1);
}

function validarImport(texto) {
  let d;
  try { d = JSON.parse(texto); } catch (e) { return { ok: false, msg: "El texto no es un JSON válido." }; }
  if (d && d.formato === "apex-gym") {
    if (typeof d.version !== "number" || d.version > VERSION_DATOS) return { ok: false, msg: "La copia es de una versión más nueva de la app." };
    d = d.datos;
  }
  if (!datosValidos(d)) return { ok: false, msg: "Faltan el perfil o el historial de sesiones." };
  d = migrarDatos(JSON.parse(JSON.stringify(d)));
  const errores = validarEsquema(d);
  if (errores.length) return { ok: false, msg: errores[0] + (errores.length > 1 ? " (y " + (errores.length - 1) + " problema(s) más)" : "") };
  d.activa = null;
  return { ok: true, datos: d };
}

// ---------- Ejercicios y peso corporal ----------

function buscarEj(id) { return EJERCICIOS.find(function (e) { return e.id === id; }); }

function pesoCorporalActual() {
  const lista = estado.pesoCorporal;
  if (lista.length > 0) {
    let ultimo = lista[0];
    for (const r of lista) if (r.fecha >= ultimo.fecha) ultimo = r;
    return ultimo.kg;
  }
  return estado.perfil.peso || 70;
}

// Peso corporal que tenías en una fecha (el último registro de ese día o anterior)
function pesoEn(fecha) {
  if (!fecha) return pesoCorporalActual();
  const lista = estado.pesoCorporal.slice().sort(function (a, b) { return a.fecha < b.fecha ? -1 : 1; });
  let peso = lista.length ? lista[0].kg : (estado.perfil.peso || 70);
  for (const r of lista) if (r.fecha <= fecha) peso = r.kg;
  return peso;
}

// =====================================================
// FÓRMULAS DE FUERZA
// =====================================================

const REPS_MAX_FORMULA = 12;

// 1RM estimada (Epley): peso × (1 + reps / 30). Cada rep extra = +3,3 %, máximo 12 reps.
function unaRM(peso, reps) {
  if (reps <= 0) return 0;
  return peso * (1 + Math.min(reps, REPS_MAX_FORMULA) / 30);
}

// Otras fórmulas de 1RM, para mostrar en Progreso (el usuario elige en Ajustes).
// Los rangos siempre usan Epley (unaRM) para que todos se midan igual.
const FORMULAS_1RM = {
  epley: { nombre: "Epley (por defecto)", f: function (p, r) { return p * (1 + r / 30); } },
  brzycki: { nombre: "Brzycki", f: function (p, r) { return p * 36 / (37 - r); } },
  lombardi: { nombre: "Lombardi", f: function (p, r) { return p * Math.pow(r, 0.10); } },
  oconner: { nombre: "O'Conner", f: function (p, r) { return p * (1 + r / 40); } },
  media: { nombre: "Media de las cuatro", f: null }
};
function rm1Mostrado(peso, reps) {
  if (reps <= 0) return 0;
  const r = Math.min(reps, REPS_MAX_FORMULA);
  const clave = (estado && estado.ajustes && FORMULAS_1RM[estado.ajustes.formula1RM]) ? estado.ajustes.formula1RM : "epley";
  if (clave === "media") {
    const ks = ["epley", "brzycki", "lombardi", "oconner"];
    return ks.reduce(function (t, k) { return t + FORMULAS_1RM[k].f(peso, r); }, 0) / ks.length;
  }
  return FORMULAS_1RM[clave].f(peso, r);
}

// Carga que mueves de verdad.
//  - Normal: los kg de la barra o la máquina + la parte de tu peso corporal (si el ejercicio la usa).
//  - Asistido: tu peso corporal MENOS la ayuda de la máquina (más ayuda = menos carga).
function cargaSerie(ejercicio, peso, fecha) {
  if (ejercicio.asistido) return Math.max(0, ejercicio.cuerpo * pesoEn(fecha) - peso);
  return peso + ejercicio.cuerpo * pesoEn(fecha);
}

// ---------- Ajuste por sexo ----------
// Con el mismo peso corporal, la fuerza media de las mujeres es menor, sobre todo en el tren superior.
// Por eso el factor de dificultad se multiplica por estos valores (estimados, versión v1):
//   mujer: tren superior × 0,6 · tren inferior × 0,75
//   prefiero no decirlo: punto intermedio entre ambos
const AJUSTE_SEXO = {
  hombre: { superior: 1, inferior: 1 },
  mujer: { superior: 0.6, inferior: 0.75 },
  nd: { superior: 0.8, inferior: 0.875 }
};
const GRUPOS_INFERIORES = ["cuadriceps", "isquios", "gluteos", "gemelos", "aductores"];

function ajusteSexo(e) {
  const a = AJUSTE_SEXO[estado.perfil.sexo] || AJUSTE_SEXO.nd;
  return GRUPOS_INFERIORES.includes(e.grupo) ? a.inferior : a.superior;
}

// Factor de dificultad personalizado: el del ejercicio ajustado a tu sexo
function factorEj(e) { return e.factor * ajusteSexo(e); }

// Referencia corporal alométrica: 75 × (peso / 75) ^ 0,67
function referenciaCorporal(bw) {
  return 75 * Math.pow(bw / 75, 0.67);
}

function serieValida(s) {
  return !!s.hecha && (!s.sospechosa || !!s.confirmada);
}

// Una sesión cuenta solo si tiene al menos una serie válida (un entreno vacío no cuenta para nada)
function sesionValida(s) {
  return s.ejercicios.some(function (e) { return e.series.some(serieValida); });
}

function sesionesValidas(hastaFecha) {
  return estado.sesiones.filter(function (s) { return sesionValida(s) && (!hastaFecha || s.fecha <= hastaFecha); });
}

// ---------- Historial ----------

function seriesDe(id) {
  const lista = [];
  for (const s of estado.sesiones) {
    for (const e of s.ejercicios) {
      if (e.id !== id) continue;
      for (const serie of e.series) {
        if (serieValida(serie)) lista.push({ fecha: s.fecha, peso: serie.peso, reps: serie.reps, rpe: serie.rpe });
      }
    }
  }
  return lista;
}

function mejor1RM(id, hastaFecha) {
  const ejercicio = buscarEj(id);
  let mejor = 0;
  for (const s of seriesDe(id)) {
    if (hastaFecha && s.fecha > hastaFecha) continue;
    const v = unaRM(cargaSerie(ejercicio, s.peso, s.fecha), s.reps);
    if (v > mejor) mejor = v;
  }
  return mejor;
}

function mejorSerie(id) {
  const ejercicio = buscarEj(id);
  let mejor = null, valor = 0;
  for (const s of seriesDe(id)) {
    const v = unaRM(cargaSerie(ejercicio, s.peso, s.fecha), s.reps);
    if (v > valor) { valor = v; mejor = s; }
  }
  return mejor;
}

function sesionesCon(id, hastaFecha) {
  let n = 0;
  for (const s of estado.sesiones) {
    if (hastaFecha && s.fecha > hastaFecha) continue;
    if (s.ejercicios.some(function (e) { return e.id === id && e.series.some(serieValida); })) n++;
  }
  return n;
}

// Última sesión con ese ejercicio: series válidas e indicaciones (molestias, cambio de máquina)
function ultimaVez(id, saltar) {
  let encontradas = 0;
  for (let i = estado.sesiones.length - 1; i >= 0; i--) {
    const s = estado.sesiones[i];
    const e = s.ejercicios.find(function (x) { return x.id === id; });
    if (e && e.series.some(serieValida)) {
      if (encontradas === (saltar || 0)) return { fecha: s.fecha, series: e.series.filter(serieValida), molestias: !!e.molestias, cambio: !!e.cambio };
      encontradas++;
    }
  }
  return null;
}

function ejerciciosHechos() {
  const lista = [];
  for (const s of estado.sesiones) for (const e of s.ejercicios) {
    if (!lista.includes(e.id) && e.series.some(serieValida)) lista.push(e.id);
  }
  return lista;
}

// ---------- Racha (en semanas, solo sesiones válidas) ----------

function minimoSemanal() { return Math.min(2, estado.perfil.dias || 2); }

function sesionesPorSemana() {
  const mapa = {};
  for (const s of sesionesValidas()) {
    const l = lunesDe(s.fecha);
    mapa[l] = (mapa[l] || 0) + 1;
  }
  return mapa;
}

function rachaSemanas() {
  const mapa = sesionesPorSemana();
  let lunes = lunesDe(hoy());
  let racha = (mapa[lunes] || 0) >= minimoSemanal() ? 1 : 0;
  while (true) {
    lunes = sumarDias(lunes, -7);
    if ((mapa[lunes] || 0) >= minimoSemanal()) racha++;
    else break;
  }
  return racha;
}

// =====================================================
// LOGROS
// Medallas que se consiguen entrenando. Cada logro tiene una meta (un número) y una forma de medirla.
// Los conseguidos se guardan en estado.logros con su fecha, y ya no se pierden.
// =====================================================
const LOGROS = [
  { id: "entrenos-1", icono: "🎬", nombre: "Primer paso", texto: "Completa tu primer entreno", tipo: "entrenos", meta: 1 },
  { id: "entrenos-10", icono: "💪", nombre: "Cogiendo ritmo", texto: "Completa 10 entrenos", tipo: "entrenos", meta: 10 },
  { id: "entrenos-25", icono: "🔩", nombre: "De hierro", texto: "Completa 25 entrenos", tipo: "entrenos", meta: 25 },
  { id: "entrenos-50", icono: "⚙️", nombre: "Máquina", texto: "Completa 50 entrenos", tipo: "entrenos", meta: 50 },
  { id: "entrenos-100", icono: "👑", nombre: "Centenario", texto: "Completa 100 entrenos", tipo: "entrenos", meta: 100 },
  { id: "racha-2", icono: "🔥", nombre: "Encendido", texto: "Racha de 2 semanas", tipo: "racha", meta: 2 },
  { id: "racha-4", icono: "📅", nombre: "Un mes sin fallar", texto: "Racha de 4 semanas", tipo: "racha", meta: 4 },
  { id: "racha-12", icono: "🧱", nombre: "Constancia de acero", texto: "Racha de 12 semanas", tipo: "racha", meta: 12 },
  { id: "racha-26", icono: "🏔️", nombre: "Medio año imparable", texto: "Racha de 26 semanas", tipo: "racha", meta: 26 },
  { id: "records-1", icono: "🏆", nombre: "Primer récord", texto: "Bate tu primer récord", tipo: "records", meta: 1 },
  { id: "records-10", icono: "🥇", nombre: "Rompemarcas", texto: "Bate 10 récords", tipo: "records", meta: 10 },
  { id: "records-50", icono: "🚀", nombre: "Sin techo", texto: "Bate 50 récords", tipo: "records", meta: 50 },
  { id: "toneladas-10", icono: "🚗", nombre: "Levantacoches", texto: "Levanta 10 toneladas en total", tipo: "toneladas", meta: 10 },
  { id: "toneladas-100", icono: "🐘", nombre: "Fuerza de elefante", texto: "Levanta 100 toneladas en total", tipo: "toneladas", meta: 100 },
  { id: "toneladas-500", icono: "🐋", nombre: "Ballena azul", texto: "Levanta 500 toneladas en total", tipo: "toneladas", meta: 500 },
  { id: "grupos-12", icono: "🧍", nombre: "Cuerpo completo", texto: "Entrena los 12 grupos musculares", tipo: "grupos", meta: 12 }
];

// Cuánto llevas de cada tipo de logro
function datosLogros() {
  const validas = sesionesValidas();
  let records = 0, kilos = 0;
  const grupos = {};
  for (const s of validas) {
    records += (s.prs || []).length;
    kilos += s.volumen || 0;
    for (const e of s.ejercicios) {
      const ej = buscarEj(e.id);
      if (ej && e.series.some(function (x) { return x.hecha; })) grupos[ej.grupo] = true;
    }
  }
  return { entrenos: validas.length, racha: rachaSemanas(), records: records, toneladas: Math.floor(kilos / 1000), grupos: Object.keys(grupos).length };
}

// Apunta los logros recién conseguidos y devuelve la lista de los nuevos
function revisarLogros() {
  if (!estado) return [];
  if (!estado.logros) estado.logros = {};
  const d = datosLogros();
  const nuevos = [];
  for (const l of LOGROS) {
    if (!estado.logros[l.id] && d[l.tipo] >= l.meta) { estado.logros[l.id] = hoy(); nuevos.push(l); }
  }
  return nuevos;
}

// El logro sin conseguir que tienes más cerca (para animar a ir a por él)
function siguienteLogro() {
  const d = datosLogros();
  let mejor = null;
  for (const l of LOGROS) {
    if (estado.logros && estado.logros[l.id]) continue;
    const parte = Math.min(1, d[l.tipo] / l.meta);
    if (!mejor || parte > mejor.parte) mejor = { logro: l, llevas: d[l.tipo], parte: parte };
  }
  return mejor;
}

// =====================================================
// CONTROL DE CALIDAD DE LOS DATOS
// =====================================================

// Comprobación básica de los valores de una serie. La usan TODOS los caminos:
// registrar en el entreno, corregir un entreno guardado e importar una copia.
// Una serie hecha necesita al menos 1 repetición; una pendiente puede tener 0.
function validarValores(peso, reps, hecha) {
  if (typeof peso !== "number" || isNaN(peso) || peso < 0 || peso > 400) return "El peso debe estar entre 0 y 400 kg.";
  if (typeof reps !== "number" || isNaN(reps) || !Number.isInteger(reps)) return "Las repeticiones deben ser un número entero.";
  if (hecha && (reps < 1 || reps > 50)) return "Una serie hecha debe tener entre 1 y 50 repeticiones.";
  if (!hecha && (reps < 0 || reps > 50)) return "Las repeticiones deben estar entre 0 y 50.";
  return "";
}

// Comprobación completa de una serie que se va a marcar como hecha (valores + datos raros)
function validarSerie(id, peso, reps, objetivo) {
  const e = buscarEj(id);
  const basico = validarValores(peso, reps, true);
  if (basico) return { nivel: "error", msg: basico };
  if (e.asistido) {
    // La ayuda no puede ser igual o mayor que tu peso: el ejercicio no costaría nada
    if (peso >= pesoCorporalActual()) return { nivel: "error", msg: "La ayuda (" + peso + " kg) no puede ser igual o mayor que tu peso corporal." };
    let ayudaMinima = null;
    for (const s of seriesDe(id)) ayudaMinima = ayudaMinima === null ? s.peso : Math.min(ayudaMinima, s.peso);
    if (ayudaMinima !== null && ayudaMinima - peso >= 15) return { nivel: "aviso", msg: "Es " + (ayudaMinima - peso) + " kg menos de ayuda que tu mínimo (" + ayudaMinima + " kg)." };
    return { nivel: "ok", msg: "" };
  }

  let maximo = 0;
  for (const s of seriesDe(id)) maximo = Math.max(maximo, s.peso);

  if (maximo > 0 && peso > 0) {
    const enLibras = maximo * 2.2;
    if (Math.abs(peso - enLibras) / enLibras < 0.06 && peso - maximo >= 10) {
      return { nivel: "aviso", msg: "¿Lo has escrito en libras? " + peso + " lb son " + String(Math.round(peso / 2.2 * 2) / 2).replace(".", ",") + " kg." };
    }
    if (peso > maximo * 1.3 && peso - maximo >= 10) {
      return { nivel: "aviso", msg: "Es un " + Math.round((peso / maximo - 1) * 100) + " % más que tu máximo (" + String(maximo).replace(".", ",") + " kg)." };
    }
  }
  if (maximo === 0 && e.equipo !== "corporal") {
    if (peso > factorEj(e) * pesoCorporalActual() * 1.6) return { nivel: "aviso", msg: "Es un peso muy alto para tu peso corporal en este ejercicio." };
  }
  if (objetivo && reps > objetivo.repMax * 2 && reps > 20) {
    return { nivel: "aviso", msg: "Son muchas más repeticiones de las previstas (" + objetivo.repMax + ")." };
  }
  return { nivel: "ok", msg: "" };
}

// =====================================================
// RANGOS 2.0
// =====================================================
// 1. Puntos de una serie = 75 × 1RM ÷ (factor × referencia corporal del día), máximo 100.
// 2. Rendimiento representativo de un ejercicio = media de tus 3 mejores sesiones
//    dentro de las 12 semanas anteriores a tu último registro (no un único día).
// 3. Tope por fiabilidad: 1 sesión → Plata, 2-3 → Platino, 4-5 → Diamante, 6+ → sin tope.
// 4. Grupo = media ponderada (compuestos ×2). Con un solo ejercicio distinto, máximo Diamante.
// 5. Global = media de los 8 músculos principales; los que no tienen datos cuentan 0.
//    Tope por sesiones válidas: menos de 5 → Plata, menos de 15 → Esmeralda.

const GRUPOS_PRINCIPALES = ["pecho", "espalda", "hombros", "biceps", "triceps", "cuadriceps", "isquios", "gluteos"];
const VENTANA_DIAS = 84;          // 12 semanas
const MEJORES_SESIONES = 3;

function redondear1(n) { return Math.round(n * 10) / 10; }

function rangoDePuntos(p) {
  let i = 0;
  for (let k = 0; k < RANGOS.length; k++) if (p >= RANGOS[k].min) i = k;
  return i;
}

function puntosSerie(e, peso, reps, fecha) {
  const rm = unaRM(cargaSerie(e, peso, fecha), reps);
  return Math.min(100, 75 * rm / (factorEj(e) * referenciaCorporal(pesoEn(fecha))));
}

function topePorSesiones(n) {
  if (n >= 6) return 100;
  if (n >= 4) return 77;
  if (n >= 2) return 57;
  return 35;
}

function sesionesParaDesbloquear(n) {
  if (n < 2) return 2 - n;
  if (n < 4) return 4 - n;
  if (n < 6) return 6 - n;
  return 0;
}

// Mejor puntuación de cada sesión para un ejercicio: [{ fecha, puntos }]
function puntosPorSesion(id, hastaFecha) {
  const e = buscarEj(id);
  const lista = [];
  for (const s of estado.sesiones) {
    if (hastaFecha && s.fecha > hastaFecha) continue;
    let mejor = null;
    for (const x of s.ejercicios) {
      if (x.id !== id) continue;
      for (const serie of x.series) {
        if (!serieValida(serie)) continue;
        const p = puntosSerie(e, serie.peso, serie.reps, s.fecha);
        if (mejor === null || p > mejor) mejor = p;
      }
    }
    if (mejor !== null) lista.push({ fecha: s.fecha, puntos: mejor });
  }
  return lista;
}

// Rendimiento representativo (sin tope): media de las 3 mejores sesiones en la ventana
function rendimientoEjercicio(id, hastaFecha) {
  const lista = puntosPorSesion(id, hastaFecha);
  if (lista.length === 0) return null;
  let ultima = lista[0].fecha;
  for (const x of lista) if (x.fecha > ultima) ultima = x.fecha;
  const desde = sumarDias(ultima, -VENTANA_DIAS);
  const enVentana = lista.filter(function (x) { return x.fecha >= desde; }).map(function (x) { return x.puntos; });
  enVentana.sort(function (a, b) { return b - a; });
  const mejores = enVentana.slice(0, MEJORES_SESIONES);
  return mejores.reduce(function (a, b) { return a + b; }, 0) / mejores.length;
}

function puntosEjercicio(id, hastaFecha) {
  const p = rendimientoEjercicio(id, hastaFecha);
  if (p === null) return null;
  return redondear1(Math.min(p, topePorSesiones(sesionesCon(id, hastaFecha))));
}

function ejerciciosDeGrupo(grupo, hastaFecha) {
  return ejerciciosHechos().filter(function (id) { return buscarEj(id).grupo === grupo && puntosEjercicio(id, hastaFecha) !== null; });
}

function puntosGrupo(grupo, hastaFecha) {
  const ids = ejerciciosDeGrupo(grupo, hastaFecha);
  if (ids.length === 0) return null;
  let suma = 0, pesos = 0;
  for (const id of ids) {
    const w = buscarEj(id).compuesto ? 2 : 1;
    suma += puntosEjercicio(id, hastaFecha) * w; pesos += w;
  }
  let p = suma / pesos;
  if (ids.length < 2) p = Math.min(p, 77);    // con un solo ejercicio, el dato es menos fiable
  return redondear1(p);
}

// Fiabilidad de un grupo según las sesiones válidas que lo incluyen
function fiabilidadGrupo(grupo) {
  let n = 0;
  for (const s of sesionesValidas()) {
    if (s.ejercicios.some(function (e) { return buscarEj(e.id).grupo === grupo && e.series.some(serieValida); })) n++;
  }
  if (n >= 10) return { nivel: "alta", sesiones: n };
  if (n >= 4) return { nivel: "media", sesiones: n };
  return { nivel: "baja", sesiones: n };
}

function coberturaMuscular(hastaFecha) {
  return GRUPOS_PRINCIPALES.filter(function (g) { return puntosGrupo(g, hastaFecha) !== null; }).length;
}

function puntosGlobal(hastaFecha) {
  if (coberturaMuscular(hastaFecha) === 0) return null;
  let suma = 0;
  for (const g of GRUPOS_PRINCIPALES) {
    const p = puntosGrupo(g, hastaFecha);
    suma += p === null ? 0 : p;               // sin datos = 0: el global mide el cuerpo completo
  }
  let total = suma / GRUPOS_PRINCIPALES.length;
  const n = sesionesValidas(hastaFecha).length;  // mismo criterio de sesión en todo el sistema
  if (n < 5) total = Math.min(total, 35);
  else if (n < 15) total = Math.min(total, 67);
  return redondear1(total);
}

function progresoRango(p) {
  const i = rangoDePuntos(p);
  if (i === RANGOS.length - 1) return 100;
  return Math.round((p - RANGOS[i].min) / (RANGOS[i + 1].min - RANGOS[i].min) * 100);
}

function rmParaPuntos(id, puntos) {
  const e = buscarEj(id);
  return puntos / 75 * factorEj(e) * referenciaCorporal(pesoCorporalActual());
}

function pesoParaRM(id, rm, reps) {
  const e = buscarEj(id);
  const carga = rm / (1 + Math.min(reps, REPS_MAX_FORMULA) / 30);
  if (e.asistido) return Math.max(0, e.cuerpo * pesoCorporalActual() - carga);   // ayuda necesaria
  return Math.max(0, carga - e.cuerpo * pesoCorporalActual());
}

// Ascenso más cercano. Como el rendimiento es la media de 3 sesiones,
// se indica el peso que tendrías que repetir en tus próximas sesiones.
function proximoAscenso() {
  let mejor = null;
  for (const id of ejerciciosHechos()) {
    const p = puntosEjercicio(id);
    const i = rangoDePuntos(p);
    if (i >= RANGOS.length - 1) continue;
    const sig = RANGOS[i + 1];
    if (sig.min > topePorSesiones(sesionesCon(id))) continue;
    const falta = (sig.min - p) / Math.max(p, 1);
    if (mejor === null || falta < mejor.falta) {
      const reps = buscarEj(id).reps[0] + 2;
      mejor = { id: id, rango: i + 1, falta: falta, reps: reps, peso: redondearA(pesoParaRM(id, rmParaPuntos(id, sig.min), reps), 0.5) };
    }
  }
  return mejor;
}

function fotoRangos() {
  const foto = { global: null, grupos: {}, ej: {} };
  const g = puntosGlobal();
  if (g !== null) foto.global = rangoDePuntos(g);
  for (const grupo in GRUPOS) {
    const p = puntosGrupo(grupo);
    if (p !== null) foto.grupos[grupo] = rangoDePuntos(p);
  }
  for (const id of ejerciciosHechos()) foto.ej[id] = rangoDePuntos(puntosEjercicio(id));
  return foto;
}

function compararRangos(antes, despues) {
  const lista = [];
  if (despues.global !== null && (antes.global === null || despues.global > antes.global)) {
    lista.push({ tipo: "global", nombre: "Rango global", rango: despues.global });
  }
  for (const g in despues.grupos) {
    if (antes.grupos[g] !== undefined && despues.grupos[g] > antes.grupos[g]) lista.push({ tipo: "grupo", nombre: GRUPOS[g], rango: despues.grupos[g] });
  }
  for (const id in despues.ej) {
    if (antes.ej[id] !== undefined && despues.ej[id] > antes.ej[id]) lista.push({ tipo: "ejercicio", nombre: buscarEj(id).nombre, rango: despues.ej[id] });
  }
  return lista;
}

// =====================================================
// GENERADOR DE RUTINAS 2.0
// =====================================================
// Paso 1: elige ejercicios con una puntuación (no depende del orden de la biblioteca).
// Paso 2: comprueba la rutina COMPLETA (duración, volumen, recuperación).
// Paso 3: repara lo que no cumple y repite; lo que no se pueda arreglar se informa.

const PLANTILLAS = {
  completo: ["cuadriceps", "pecho", "espalda", "isquios", "hombros", "triceps", "biceps", "gluteos"],
  torso: ["pecho", "espalda", "hombros", "biceps", "triceps", "pecho", "espalda", "hombros"],
  pierna: ["cuadriceps", "isquios", "gluteos", "cuadriceps", "gemelos", "abdominales", "isquios"],
  empuje: ["pecho", "hombros", "triceps", "pecho", "hombros", "triceps", "pecho"],
  tiron: ["espalda", "espalda", "biceps", "hombros", "biceps", "espalda", "antebrazos"],
  superior: ["pecho", "espalda", "hombros", "biceps", "triceps", "espalda", "pecho"],
  inferior: ["cuadriceps", "isquios", "gluteos", "gemelos", "abdominales", "cuadriceps", "isquios"]
};

const NOMBRES_DIA = {
  completo: "Cuerpo completo", torso: "Torso", pierna: "Pierna", empuje: "Empuje", tiron: "Tirón",
  superior: "Tren superior", inferior: "Tren inferior"
};

const TIPOS_RUTINA = { auto: "Automático según días", completo: "Cuerpo completo", "torso-pierna": "Torso y pierna", ppl: "Empuje, tirón y pierna", grupos: "Por grupos musculares" };

function tipoReal(tipo, dias) {
  if (tipo !== "auto") return tipo;
  if (dias <= 3) return "completo";
  if (dias === 4) return "torso-pierna";
  return "ppl";
}

function repartoDias(tipo, dias) {
  tipo = tipoReal(tipo, dias);
  const lista = [];
  for (let i = 0; i < dias; i++) {
    if (tipo === "completo") lista.push("completo");
    if (tipo === "torso-pierna") lista.push(i % 2 === 0 ? "torso" : "pierna");
    // Con 5 días: empuje, tirón, pierna, tren superior y tren inferior (dos días de pierna)
    if (tipo === "ppl") lista.push(dias === 5 ? ["empuje", "tiron", "pierna", "superior", "inferior"][i] : ["empuje", "tiron", "pierna"][i % 3]);
    if (tipo === "grupos") lista.push(["empuje", "tiron", "pierna", "superior", "inferior", "completo"][i % 6]);
  }
  return lista;
}

function parametros(objetivo, nivel, compuesto) {
  let series = nivel === "avanzado" ? 4 : 3;
  let reps = [8, 12], descanso = 90;
  if (objetivo === "fuerza") {
    reps = compuesto ? [4, 6] : [6, 10];
    descanso = compuesto ? 180 : 120;
    if (compuesto && nivel !== "principiante") series = 4;
  }
  if (objetivo === "masa") { reps = compuesto ? [6, 10] : [10, 15]; descanso = compuesto ? 120 : 90; }
  if (objetivo === "condicion") { reps = [12, 15]; descanso = 60; }
  if (objetivo === "activo") { reps = [10, 15]; descanso = 75; series = Math.min(series, 3); }
  return { series: series, repMin: reps[0], repMax: reps[1], descanso: descanso };
}

function objetivoVolumen(objetivo, nivel) {
  const base = { principiante: 8, intermedio: 12, avanzado: 16 }[nivel] || 10;
  const factor = { masa: 1, fuerza: 0.8, condicion: 0.6, activo: 0.5 }[objetivo] || 1;
  return Math.round(base * factor);
}

// Duración estimada de un día (minutos):
// 45 s de trabajo por serie + descanso + 1,5 min de cambio entre ejercicios
// + 5 min de calentamiento + 3 min de aproximación por compuesto (máximo 2).
// "factor" corrige la estimación con lo que tardas de verdad (ver factorDuracion).
function duracionDia(dia, factor) {
  let seg = 0, compuestos = 0;
  for (const o of dia.ejercicios) {
    seg += o.series * (45 + o.descanso) + 90;
    if (buscarEj(o.id).compuesto) compuestos++;
  }
  return Math.round((Math.round(seg / 60) + 5 + Math.min(compuestos, 2) * 3) * (factor || 1));
}

// Cuánto tardas realmente comparado con la estimación (mediana de tus sesiones de rutina).
// Necesita 3 sesiones; se limita entre 0,7 y 1,5 para evitar valores absurdos.
function factorDuracion() {
  if (!estado || !estado.rutina) return 1;
  const ratios = [];
  for (const s of sesionesValidas()) {
    if (s.diaIndex === null || s.diaIndex === undefined) continue;
    const dia = estado.rutina.dias[s.diaIndex];
    if (!dia || dia.nombre !== s.diaNombre || dia.ejercicios.length === 0) continue;
    if (s.duracion >= 180) continue;              // entrenos que se quedaron abiertos
    ratios.push(s.duracion / duracionDia(dia, 1));
  }
  if (ratios.length < 3) return 1;
  ratios.sort(function (a, b) { return a - b; });
  const mediana = ratios[Math.floor(ratios.length / 2)];
  return Math.round(Math.min(1.5, Math.max(0.7, mediana)) * 100) / 100;
}

// Carga de un músculo en un día: series directas × 1 + series en las que trabaja como secundario × 0,5
function cargaDia(dia, grupo) {
  let carga = 0;
  for (const o of dia.ejercicios) {
    const e = buscarEj(o.id);
    if (e.grupo === grupo) carga += o.series;
    else if (e.sec.includes(grupo)) carga += o.series * 0.5;
  }
  return carga;
}

// Series semanales por músculo (misma métrica que cargaDia, sumada en la semana)
function volumenSemanal(rutina) {
  const v = {};
  for (const g in GRUPOS) v[g] = 0;
  for (const d of rutina.dias) for (const g in GRUPOS) v[g] += cargaDia(d, g);
  return v;
}

// Días de descanso entre un día de la rutina y el siguiente, según el calendario semanal
function diasHastaSiguiente(calendario, i) {
  const n = calendario.length;
  if (n === 1) return 7;
  const hueco = (calendario[(i + 1) % n] - calendario[i] + 7) % 7;
  return hueco === 0 ? 7 : hueco;
}

// Puntuación de un candidato: es la que decide, no el orden de la lista
function puntuarCandidato(e, ctx) {
  let p = 0;
  if (estado) p += Math.min(sesionesCon(e.id), 6) * 5;        // ejercicios que ya haces
  if (ctx.primeraVez && e.compuesto) p += 25;                 // empezar el grupo con un compuesto
  if (e.compuesto && (e.grupo === "triceps" || e.grupo === "biceps")) p -= 30;   // en brazos, mejor aislamiento: los compuestos (press cerrado, fondos) suman volumen extra a pecho y hombro
  if (!ctx.primeraVez && !e.compuesto) p += 10;               // la segunda vez, mejor aislamiento
  p -= (ctx.usosSemana[e.id] || 0) * 12;                      // variedad entre días
  if (e.nivel === ctx.nivelIdeal) p += 4;
  if (e.equipo !== "corporal") p += 3;                       // con carga externa se progresa en pasos más pequeños
  return p;
}

// Un día de tirón no lleva ejercicios de empuje y al revés (por ejemplo, el hombro del día de tirón es posterior)
function encajaEnDia(e, tipoDia) {
  if (tipoDia === "tiron" && e.patron.indexOf("Empuje") === 0) return false;
  if (tipoDia === "empuje" && e.patron.indexOf("Tirón") === 0) return false;
  // El peso muerto carga mucho pierna y espalda baja: en días de torso se evita para no restar recuperación a la pierna
  if ((tipoDia === "torso" || tipoDia === "superior" || tipoDia === "empuje") && e.patron === "Bisagra de cadera") return false;
  return true;
}

function elegirEjercicio(grupo, op, ctx) {
  const evitar = (op.evitar || "").toLowerCase();
  const nivelMax = op.nivel === "principiante" ? 2 : 3;
  // No se proponen ejercicios que no puedes hacer ni máquinas que no hay en tu gimnasio
  const noPuede = estado ? (estado.evitados || []).concat(estado.noDisponibles || []) : [];
  const candidatos = EJERCICIOS.filter(function (e) {
    return e.grupo === grupo && op.equipo.includes(e.equipo) && !ctx.usadosDia.includes(e.id) && !noPuede.includes(e.id) &&
      e.nivel <= nivelMax && !(evitar && e.nombre.toLowerCase().includes(evitar)) && encajaEnDia(e, ctx.tipoDia);
  });
  if (candidatos.length === 0) return null;
  candidatos.sort(function (a, b) {
    const d = puntuarCandidato(b, ctx) - puntuarCandidato(a, ctx);
    return d !== 0 ? d : (a.id < b.id ? -1 : 1);              // desempate fijo por identificador
  });
  return candidatos[0];
}

function generarRutina(op) {
  const reparto = repartoDias(op.tipo, op.dias);
  const porDia = { 30: 4, 45: 5, 60: 6, 90: 7 }[op.duracion] || 5;
  const usosSemana = {};
  const nivelIdeal = op.nivel === "principiante" ? 1 : 2;

  const dias = reparto.map(function (tipoDia, numDia) {
    let grupos = PLANTILLAS[tipoDia].slice();
    if (op.prioridad && (grupos.includes(op.prioridad) || tipoDia === "completo")) grupos.splice(1, 0, op.prioridad);
    grupos = grupos.slice(0, porDia);
    const usadosDia = [];
    const ejercicios = [];
    grupos.forEach(function (grupo, posicion) {
      const ctx = { primeraVez: !grupos.slice(0, posicion).includes(grupo), usosSemana: usosSemana, usadosDia: usadosDia, nivelIdeal: nivelIdeal, tipoDia: tipoDia };
      const e = elegirEjercicio(grupo, op, ctx);
      if (!e) return;
      usadosDia.push(e.id);
      usosSemana[e.id] = (usosSemana[e.id] || 0) + 1;
      const p = parametros(op.objetivo, op.nivel, e.compuesto);
      ejercicios.push({ id: e.id, series: p.series, repMin: p.repMin, repMax: p.repMax, descanso: p.descanso });
    });
    return { nombre: "Día " + (numDia + 1) + " · " + NOMBRES_DIA[tipoDia], tipo: tipoDia, ejercicios: ejercicios };
  });

  const rutina = { nombre: "Rutina " + TIPOS_RUTINA[tipoReal(op.tipo, op.dias)], dias: dias, creada: hoy(),
    objetivo: op.objetivo, nivel: op.nivel, duracion: op.duracion, diasSemana: op.dias,
    calendario: Array.isArray(op.calendario) && op.calendario.length === op.dias ? op.calendario.slice().sort() : calendarioPorDefecto(op.dias),
    factorDuracion: factorDuracion() };
  repararRutina(rutina, op);
  rutina.problemas = validarRutina(rutina);
  return rutina;
}

// Comprueba la rutina completa. Devuelve una lista de problemas { tipo, grupo, dia, msg }.
// La recuperación usa el calendario semanal real: solo hay conflicto si dos días de entreno
// van seguidos (menos de 48 h) y el mismo músculo tiene carga alta (4 o más, contando secundarios) en ambos.
const CARGA_FUERTE = 4;

function validarRutina(r) {
  const problemas = [];
  const objetivo = objetivoVolumen(r.objetivo, r.nivel);
  const factor = r.factorDuracion || 1;
  r.dias.forEach(function (d, i) {
    if (d.ejercicios.length === 0) problemas.push({ tipo: "vacio", dia: i, msg: d.nombre + " no tiene ejercicios." });
    else if (duracionDia(d, factor) > r.duracion) problemas.push({ tipo: "duracion", dia: i, msg: d.nombre + " dura unos " + duracionDia(d, factor) + " min (tienes " + r.duracion + ")." });
  });
  const v = volumenSemanal(r);
  for (const g of GRUPOS_PRINCIPALES) {
    if (v[g] < objetivo * 0.7) problemas.push({ tipo: "volumen-bajo", grupo: g, msg: GRUPOS[g] + ": " + v[g] + " series/semana, por debajo de lo recomendado (" + objetivo + ")." });
    if (v[g] > objetivo * 1.4) problemas.push({ tipo: "volumen-alto", grupo: g, msg: GRUPOS[g] + ": " + v[g] + " series/semana, demasiado volumen (" + objetivo + ")." });
  }
  const cal = Array.isArray(r.calendario) && r.calendario.length === r.dias.length ? r.calendario : calendarioPorDefecto(r.dias.length);
  for (let i = 0; i < r.dias.length; i++) {
    if (r.dias.length < 2 || diasHastaSiguiente(cal, i) > 1) continue;
    const sig = (i + 1) % r.dias.length;
    const a = r.dias[i], b = r.dias[sig];
    for (const g of GRUPOS_PRINCIPALES) {
      if (cargaDia(a, g) >= CARGA_FUERTE && cargaDia(b, g) >= CARGA_FUERTE) {
        problemas.push({ tipo: "recuperacion", grupo: g, dia: sig, msg: GRUPOS[g] + " tiene carga alta el " + NOMBRES_DIAS_SEMANA[cal[i]].toLowerCase() + " (" + a.nombre + ") y el " + NOMBRES_DIAS_SEMANA[cal[sig]].toLowerCase() + " (" + b.nombre + "), días seguidos." });
      }
    }
  }
  return problemas;
}

// Repara la rutina: en cada vuelta intenta arreglar el primer problema que tenga solución.
// Termina cuando no queda nada que se pueda arreglar (máximo 300 cambios).
function repararRutina(r, op) {
  for (let vuelta = 0; vuelta < 300; vuelta++) {
    const problemas = validarRutina(r);
    let arreglado = false;
    for (const p of problemas) {
      if (arreglarProblema(r, p)) { arreglado = true; break; }
    }
    if (!arreglado) return;
  }
}

// Intenta arreglar un problema. Devuelve true si cambió algo.
function arreglarProblema(r, p) {
  if (p.tipo === "duracion") {
    const d = r.dias[p.dia];
    const accesorio = d.ejercicios.slice().reverse().find(function (o) { return o.series > 2 && !buscarEj(o.id).compuesto; }) ||
                      d.ejercicios.slice().reverse().find(function (o) { return o.series > 2; });
    // Orden de recortes: series de accesorios → descansos largos → quitar el último ejercicio
    const descansoLargo = d.ejercicios.find(function (o) { return !buscarEj(o.id).compuesto && o.descanso > 60; }) ||
                          d.ejercicios.find(function (o) { return o.descanso > 90; });
    if (accesorio) { accesorio.series--; return true; }
    if (descansoLargo) { descansoLargo.descanso -= 15; return true; }
    if (d.ejercicios.length > 2) { d.ejercicios.pop(); return true; }
    return false;
  }
  if (p.tipo === "volumen-alto") {
    let mayor = null;
    for (const d of r.dias) for (const o of d.ejercicios) if (buscarEj(o.id).grupo === p.grupo && o.series > 2 && (!mayor || o.series > mayor.series)) mayor = o;
    if (mayor) { mayor.series--; return true; }
    // Si ya están al mínimo, se quita un ejercicio de aislamiento de ese músculo
    // (el volumen indirecto de los ejercicios compuestos ya lo cubre)
    for (const d of r.dias) {
      if (d.ejercicios.length <= 3) continue;
      const k = d.ejercicios.findIndex(function (o) { const e = buscarEj(o.id); return e.grupo === p.grupo && !e.compuesto; });
      if (k >= 0) { d.ejercicios.splice(k, 1); return true; }
    }
    // Último recurso: si un día repite ese músculo, se quita el segundo ejercicio
    for (const d of r.dias) {
      if (d.ejercicios.length <= 3) continue;
      const del = d.ejercicios.map(function (o, i) { return buscarEj(o.id).grupo === p.grupo ? i : -1; }).filter(function (i) { return i >= 0; });
      if (del.length >= 2) { d.ejercicios.splice(del[del.length - 1], 1); return true; }
    }
    return false;
  }
  if (p.tipo === "volumen-bajo") return anadirVolumen(r, p.grupo);
  if (p.tipo === "recuperacion") {
    const o = r.dias[p.dia].ejercicios.find(function (x) { return buscarEj(x.id).grupo === p.grupo && x.series > 2; });
    if (o) { o.series--; return true; }
    return false;
  }
  return false;
}

function anadirVolumen(r, grupo) {
  for (const d of r.dias) {
    const o = d.ejercicios.find(function (x) { return buscarEj(x.id).grupo === grupo; });
    if (!o || o.series >= 5) continue;
    o.series++;
    if (duracionDia(d, r.factorDuracion || 1) > r.duracion) { o.series--; continue; }
    return true;
  }
  return false;
}

function pesoInicial(id) {
  const e = buscarEj(id);
  if (e.equipo === "corporal") return 0;
  const nivel = estado.perfil.experiencia;
  if (e.asistido) {
    // Ayuda inicial: más para principiantes; siempre menor que tu peso corporal
    const ayuda = nivel === "principiante" ? 0.5 : (nivel === "avanzado" ? 0.2 : 0.35);
    return redondearA(pesoCorporalActual() * ayuda, 5);
  }
  const parte = nivel === "principiante" ? 0.3 : (nivel === "avanzado" ? 0.55 : 0.42);
  return redondearA(factorEj(e) * pesoCorporalActual() * parte, incrementoDe(e));
}

function redondearA(kg, paso) { return Math.max(0, Math.round(kg / paso) * paso); }

function indiceSiguienteDia() {
  if (!estado.rutina || estado.rutina.dias.length === 0) return 0;
  const validas = sesionesValidas();
  const ultima = validas[validas.length - 1];
  if (!ultima || ultima.diaIndex === undefined || ultima.diaIndex === null) return 0;
  return (ultima.diaIndex + 1) % estado.rutina.dias.length;
}

// ---------- Estancamiento con sesiones comparables ----------
// Una sesión solo se compara con otras si se hizo en condiciones parecidas:
//  - desde el último cambio de máquina o técnica (esa sesión es la nueva referencia),
//  - sin molestias,
//  - sin una semana de fatiga alta (RPE medio ≥ 9,3),
//  - con un peso corporal a menos de un 3 % del actual.
function rpeMedioSemana(lunes) {
  const fin = sumarDias(lunes, 6);
  const rpes = [];
  for (const s of estado.sesiones) if (s.fecha >= lunes && s.fecha <= fin) for (const e of s.ejercicios) for (const x of e.series) if (x.hecha && x.rpe) rpes.push(x.rpe);
  if (rpes.length < 5) return null;
  return rpes.reduce(function (a, b) { return a + b; }, 0) / rpes.length;
}

function sesionesComparables(id) {
  const e = buscarEj(id);
  let lista = [];
  for (const s of estado.sesiones) {
    const x = s.ejercicios.find(function (z) { return z.id === id; });
    if (!x) continue;
    const validas = x.series.filter(serieValida);
    if (validas.length === 0) continue;
    if (x.cambio) lista = [];                    // nueva referencia: lo anterior ya no es comparable
    if (x.molestias) continue;
    const fatiga = rpeMedioSemana(lunesDe(s.fecha));
    if (fatiga !== null && fatiga >= 9.3) continue;
    let mejor = 0;
    for (const v of validas) mejor = Math.max(mejor, unaRM(cargaSerie(e, v.peso, s.fecha), v.reps));
    lista.push({ fecha: s.fecha, rm: mejor, bw: pesoEn(s.fecha) });
  }
  const bwActual = pesoCorporalActual();
  return lista.filter(function (z) { return Math.abs(z.bw - bwActual) / bwActual <= 0.03; });
}

// Hay estancamiento si, con al menos 5 sesiones comparables, las 3 últimas (repartidas en 14 días o más)
// no superan en más de un 1 % la mejor marca anterior.
function estancamiento(id) {
  const c = sesionesComparables(id);
  if (c.length < 5) return null;
  const ultimas = c.slice(-3);
  if (diasEntre(ultimas[0].fecha, ultimas[2].fecha) < 14) return null;
  const mejorAntes = Math.max.apply(null, c.slice(0, -3).map(function (z) { return z.rm; }));
  const mejorUltimas = Math.max.apply(null, ultimas.map(function (z) { return z.rm; }));
  if (mejorUltimas > mejorAntes * 1.01) return null;
  return { sesiones: c.length, dias: diasEntre(ultimas[0].fecha, ultimas[2].fecha), mejorAntes: mejorAntes };
}

// ---------- Ajustes recomendados según tu historial ----------

function sugerenciasRutina() {
  const lista = [];
  if (!estado.rutina) return lista;
  const r = estado.rutina;
  const objetivo = objetivoVolumen(r.objetivo || estado.perfil.objetivo, r.nivel || estado.perfil.experiencia);

  const revisados = [];
  r.dias.forEach(function (d, di) {
    d.ejercicios.forEach(function (o, k) {
      if (revisados.includes(o.id)) return;
      revisados.push(o.id);
      const est = estancamiento(o.id);
      if (!est) return;
      const ej = buscarEj(o.id);
      const alternativa = ej.variantes.map(buscarEj).find(function (v) {
        return disponible(v);
      });
      if (!alternativa) return;
      lista.push({ texto: ej.nombre + ": 3 sesiones comparables en " + est.dias + " días sin superar tu mejor marca (" + kgTexto(est.mejorAntes) + " de 1RM).",
        motivo: "Solo se han comparado sesiones sin molestias, sin cambio de máquina, sin semana de fatiga y con un peso corporal parecido. Cambiar a " + alternativa.nombre + " unas semanas suele ayudar.",
        boton: "Cambiar por " + alternativa.nombre, aplicar: { tipo: "sustituir", dia: di, pos: k, id: alternativa.id } });
    });
  });

  const v = volumenSemanal(r);
  for (const g of GRUPOS_PRINCIPALES) {
    if (v[g] >= objetivo * 0.6) continue;
    const destino = destinoSerieExtra(r, g);
    if (!destino) continue;
    const o = r.dias[destino.dia].ejercicios[destino.pos];
    lista.push({ texto: GRUPOS[g] + ": " + v[g] + " series por semana (recomendado unas " + objetivo + ").",
      motivo: "Se añadirá exactamente 1 serie a " + buscarEj(o.id).nombre + " (" + r.dias[destino.dia].nombre + "), que pasará de " + o.series + " a " + (o.series + 1) + " series.",
      boton: "Añadir 1 serie a " + buscarEj(o.id).nombre, aplicar: { tipo: "volumen", dia: destino.dia, pos: destino.pos, grupo: g } });
  }

  const media = rpeMedio(7);
  if (media !== null && media >= 9.3) lista.push({ texto: "Tu esfuerzo medio esta semana es muy alto (RPE " + media.toFixed(1).replace(".", ",") + ").",
    motivo: "Una semana más suave, con menos series y el mismo peso, ayuda a recuperarte. No hace falta llegar al fallo en cada serie.", boton: "", aplicar: null });
  return lista;
}

// ¿Puede el usuario hacer este ejercicio? (equipamiento, «No puedo hacerlo» y máquinas de su gimnasio)
function disponible(e) {
  return estado.perfil.equipo.includes(e.equipo) && !estado.evitados.includes(e.id) && !(estado.noDisponibles || []).includes(e.id);
}

function kgTexto(n) { return String(Math.round(n * 10) / 10).replace(".", ",") + " kg"; }

// Dónde poner una serie extra de un músculo: el ejercicio directo con menos series que quepa en el tiempo
function destinoSerieExtra(r, grupo) {
  let mejor = null;
  r.dias.forEach(function (d, di) {
    d.ejercicios.forEach(function (o, k) {
      if (buscarEj(o.id).grupo !== grupo || o.series >= 5) return;
      o.series++;
      const cabe = duracionDia(d, r.factorDuracion || 1) <= r.duracion;
      o.series--;
      if (cabe && (!mejor || o.series < r.dias[mejor.dia].ejercicios[mejor.pos].series)) mejor = { dia: di, pos: k };
    });
  });
  return mejor;
}

// Aplica una sugerencia. Cambia exactamente lo que anuncia y devuelve una frase con el cambio.
function aplicarSugerencia(a) {
  const r = estado.rutina;
  if (a.tipo === "sustituir") {
    const o = r.dias[a.dia].ejercicios[a.pos];
    const antes = buscarEj(o.id).nombre;
    o.id = a.id;
    return antes + " se ha cambiado por " + buscarEj(a.id).nombre + " en " + r.dias[a.dia].nombre + ".";
  }
  if (a.tipo === "volumen") {
    const o = r.dias[a.dia] && r.dias[a.dia].ejercicios[a.pos];
    if (!o || o.series >= 6) return "";
    o.series++;
    return "Se ha añadido 1 serie a " + buscarEj(o.id).nombre + " (" + r.dias[a.dia].nombre + "): ahora tiene " + o.series + ".";
  }
  return "";
}

// RPE medio de los últimos días (null si hay menos de 5 series con RPE)
function rpeMedio(dias) {
  const desde = fechaTexto(dias - 1);
  const rpes = [];
  for (const s of estado.sesiones) if (s.fecha >= desde) for (const e of s.ejercicios) for (const x of e.series) if (x.hecha && x.rpe) rpes.push(x.rpe);
  if (rpes.length < 5) return null;
  return rpes.reduce(function (a, b) { return a + b; }, 0) / rpes.length;
}

// =====================================================
// PROGRESIÓN 2.0 (doble progresión con controles)
// =====================================================
// Solo propone subir si:
//  - completaste todas las series en el máximo de repeticiones,
//  - y lo confirmaste en dos sesiones seguidas con el mismo peso (o con esfuerzo controlado, RPE ≤ 8),
//  - sin molestias, sin cambio de máquina o técnica, sin fatiga alta,
//  - y la subida no supera el 10 % del peso (si no, primero se suman repeticiones).

function incrementoDe(e) {
  if (e.asistido) return 5;                     // las máquinas de asistencia suelen ir de 5 en 5 kg
  if (e.equipo === "mancuernas") return estado.ajustes.incrementoMancuernas || 2;
  if (e.equipo === "corporal") return 2.5;
  return estado.ajustes.incremento || 2.5;
}

function completaArriba(vez, objetivo) {
  return vez && vez.series.length >= objetivo.series && vez.series.every(function (s) { return s.reps >= objetivo.repMax; });
}

function recomendar(id, objetivo) {
  const e = buscarEj(id);
  const ultima = ultimaVez(id);
  if (!ultima) {
    return { accion: "empezar", peso: pesoInicial(id), motivo: e.equipo === "corporal"
      ? "Primera vez: empieza solo con tu peso corporal y busca buena técnica."
      : "Primera vez: peso orientativo y prudente. Ajústalo si te resulta muy fácil o muy difícil." };
  }
  const pesoUsado = ultima.series[0].peso;

  if (ultima.molestias) return { accion: "mantener", peso: pesoUsado, motivo: "La última vez marcaste molestias. No subas peso; si hoy duele, para y consulta con un profesional." };
  if (ultima.cambio) return { accion: "mantener", peso: pesoUsado, motivo: "Cambiaste de máquina o de técnica: esta sesión sirve de nueva referencia. Mantén el peso." };

  const rpeAlto = ultima.series.some(function (s) { return s.rpe && s.rpe >= 9.5; });
  const fatiga = rpeMedio(7);
  const anteriores = seriesDe(id).filter(function (s) { return s.fecha < ultima.fecha; });
  let caida = false;
  if (anteriores.length > 0) {
    const mejorAntes = Math.max.apply(null, anteriores.map(function (s) { return unaRM(cargaSerie(e, s.peso, s.fecha), s.reps); }));
    const mejorAhora = Math.max.apply(null, ultima.series.map(function (s) { return unaRM(cargaSerie(e, s.peso, ultima.fecha), s.reps); }));
    caida = mejorAhora < mejorAntes * 0.85;
  }
  if (caida) return { accion: "mantener", peso: pesoUsado, motivo: "Tu rendimiento bajó bastante la última vez. Mantén el peso y descansa bien antes de subir." };
  if (rpeAlto) return { accion: "mantener", peso: pesoUsado, motivo: "Marcaste un esfuerzo muy alto. Mejor repetir el peso con técnica limpia." };

  if (completaArriba(ultima, objetivo)) {
    if (fatiga !== null && fatiga >= 9.3) return { accion: "mantener", peso: pesoUsado, motivo: "Llegaste al máximo de reps, pero tu fatiga esta semana es alta. Mantén el peso." };
    const penultima = ultimaVez(id, 1);
    const confirmado = penultima && !penultima.cambio && penultima.series[0].peso === pesoUsado && completaArriba(penultima, objetivo);
    const controlado = ultima.series.every(function (s) { return s.rpe && s.rpe <= 8; });
    if (!confirmado && !controlado) return { accion: "mantener", peso: pesoUsado, motivo: "Llegaste a " + objetivo.repMax + " reps en todas las series. Repítelo una vez más para confirmar antes de subir." };
    const inc = incrementoDe(e);
    if (e.asistido) {
      if (pesoUsado <= 0) return { accion: "mantener", peso: 0, motivo: "Ya lo haces sin ayuda. Pásate a la versión libre o añade repeticiones." };
      const menos = Math.max(0, pesoUsado - inc);
      return { accion: "subir", peso: menos, motivo: "Completaste todas las series en " + objetivo.repMax + " reps. Quita " + String(pesoUsado - menos).replace(".", ",") + " kg de ayuda (de " + String(pesoUsado).replace(".", ",") + " a " + String(menos).replace(".", ",") + " kg)." };
    }
    if (pesoUsado > 0 && inc / pesoUsado > 0.10) {
      return { accion: "mantener", peso: pesoUsado, motivo: "Subir " + String(inc).replace(".", ",") + " kg sería un +" + Math.round(inc / pesoUsado * 100) + " %. Primero suma repeticiones (hasta " + (objetivo.repMax + 3) + ") o usa un incremento menor si tu gimnasio lo tiene." };
    }
    return { accion: "subir", peso: pesoUsado + inc, motivo: "Completaste todas las series en " + objetivo.repMax + " reps " + (confirmado ? "dos sesiones seguidas" : "con esfuerzo controlado") + ". Puedes probar +" + String(inc).replace(".", ",") + " kg y volver a " + objetivo.repMin + " reps." };
  }

  const pocas = ultima.series.filter(function (s) { return s.reps < objetivo.repMin; }).length;
  if (pocas >= 2) {
    const previa = anteriores.filter(function (s) { return s.peso === pesoUsado; });
    if (previa.length > 0 && previa.every(function (s) { return s.reps < objetivo.repMin; })) {
      if (e.asistido) return { accion: "bajar", peso: pesoUsado + incrementoDe(e), motivo: "Dos sesiones seguidas por debajo de " + objetivo.repMin + " reps. Añade " + incrementoDe(e) + " kg de ayuda y vuelve a progresar." };
      return { accion: "bajar", peso: redondearA(pesoUsado * 0.9, incrementoDe(e)), motivo: "Dos sesiones seguidas por debajo de " + objetivo.repMin + " reps. Baja un 10 % y vuelve a progresar." };
    }
    return { accion: "mantener", peso: pesoUsado, motivo: "No llegaste a " + objetivo.repMin + " reps en varias series. Mantén el peso hasta conseguirlo." };
  }
  return { accion: "mantener", peso: pesoUsado, motivo: "Mantén " + String(pesoUsado).replace(".", ",") + " kg e intenta sumar una repetición con buena técnica." };
}

// =====================================================
// SESIÓN ACTIVA
// =====================================================

function crearSesion(diaIndex) {
  const dia = estado.rutina.dias[diaIndex];
  estado.activa = { inicio: Date.now(), diaIndex: diaIndex, diaNombre: dia.nombre,
    ejercicios: dia.ejercicios.map(function (o) { return ejercicioParaSesion(o.id, o); }) };
  for (const o of dia.ejercicios) {
    const a = recomendar(o.id, o).accion;
    if (a === "subir" || a === "bajar") estado.metricas.propuestas++;
  }
}

function crearSesionLibre() {
  estado.activa = { inicio: Date.now(), diaIndex: null, diaNombre: "Entreno libre", ejercicios: [] };
}

// Descanso para ejercicios añadidos a mano: más largo en los compuestos (mueven más músculo)
function descansoPorDefecto(e) {
  const a = estado.ajustes;
  return e.compuesto ? (a.descansoCompuesto || 120) : (a.descansoAislamiento || 75);
}

function ejercicioParaSesion(id, objetivo) {
  const e = buscarEj(id);
  const obj = objetivo || { series: 3, repMin: e.reps[0], repMax: e.reps[1], descanso: descansoPorDefecto(e) };
  const rec = recomendar(id, obj);
  const series = [];
  for (let i = 0; i < obj.series; i++) series.push({ peso: rec.peso, reps: obj.repMax, rpe: null, hecha: false });
  return { id: id, objetivo: { series: obj.series, repMin: obj.repMin, repMax: obj.repMax, descanso: obj.descanso }, series: series, nota: "", molestias: false, cambio: false };
}

// ---------- Cómo apuntar el peso ----------
// Regla corta (para la tabla) y explicación (para la guía) según el material del ejercicio.
function comoApuntar(e) {
  if (e.asistido) return { corto: "Kg = la ayuda de la máquina. Menos ayuda = más difícil.", largo: "Apunta los kilos de AYUDA que marques en la máquina. Cuanta menos ayuda pongas, más fuerte eres: el objetivo es ir bajándola." };
  if (e.equipo === "corporal") return { corto: "Kg = solo el peso extra (0 si no usas).", largo: "Tu peso corporal ya lo cuenta la app. Apunta solo el lastre que añadas (cinturón, disco, mochila). Sin lastre, escribe 0." };
  if (e.equipo === "mancuernas") return { corto: "Kg = el peso de UNA mancuerna.", largo: "Apunta el peso de una sola mancuerna. Si coges dos de 12 kg, escribe 12, no 24." };
  if (e.equipo === "barra") return { corto: "Kg = barra + discos (la barra olímpica pesa 20 kg).", largo: "Apunta el total: la barra más todos los discos. Ejemplo: barra de 20 kg + un disco de 10 a cada lado = 40 kg." };
  if (/multipower/.test(e.id)) return { corto: "Kg = los discos que pongas en la barra guiada.", largo: "En el multipower apunta solo los discos (la barra guiada pesa poco y cambia según la máquina). Así siempre lo medirás igual." };
  if (e.equipo === "polea") return { corto: "Kg = el número de la placa en la columna de peso.", largo: "Apunta el número que marca la placa donde metes el pasador. Cada máquina es distinta: compárate siempre en la misma." };
  return { corto: "Kg = el peso que marca la máquina.", largo: "Apunta el número de la placa o los discos que cargues. Cada máquina es distinta: compárate siempre en la misma." };
}

// ---------- Calculadora de discos ----------
// Para ejercicios con barra olímpica (20 kg): qué discos poner EN CADA LADO para llegar al peso total.
// Devuelve la lista de discos de un lado (de mayor a menor) o null si no hace falta o no sale exacto.
const DISCOS_KG = [25, 20, 15, 10, 5, 2.5, 1.25];
const BARRA_KG = 20;
function discosPorLado(total) {
  if (typeof total !== "number" || !(total > BARRA_KG)) return null;
  let resto = Math.round((total - BARRA_KG) / 2 * 1000) / 1000;      // lo que va en cada lado
  const lista = [];
  for (const d of DISCOS_KG) {
    while (resto >= d - 0.0001) { lista.push(d); resto = Math.round((resto - d) * 1000) / 1000; }
  }
  if (resto > 0.0001 || lista.length > 8) return null;                // no sale con discos normales
  return lista;
}
// ¿Tiene sentido enseñar los discos en este ejercicio? Solo barra olímpica recta y en kg.
function usaBarraOlimpica(e) {
  return !!e && e.equipo === "barra" && !/barra-z|pecho-apoyado/.test(e.id) && !usaLibras();
}
function textoDiscos(total) {
  const l = discosPorLado(total);
  if (!l) return "";
  const titulo = typeof tr === "function" ? tr("Discos por lado:") : "Discos por lado:";
  return "🏋️ " + titulo + " " + l.map(function (d) { return String(d).replace(".", ","); }).join(" + ");
}

// ---------- Series de calentamiento ----------
// Solo en ejercicios compuestos con carga (no en peso corporal ni asistidos). No cuentan para nada.
// Barra: barra sola × 10, 50 % × 5, 70 % × 3 (y 85 % × 1 si el peso es alto). Máquina y mancuernas: 2 series.
function seriesCalentamiento(id, pesoTrabajo) {
  const e = buscarEj(id);
  if (!e || !e.compuesto || e.equipo === "corporal" || e.asistido || !(pesoTrabajo > 0)) return [];
  const paso = pasoPeso(e);
  const red = function (kg) { return Math.round(kg / paso) * paso; };
  let lista;
  if (e.equipo === "barra") {
    if (pesoTrabajo < 30) return [];
    lista = [{ peso: 20, reps: 10 }, { peso: red(pesoTrabajo * 0.5), reps: 5 }, { peso: red(pesoTrabajo * 0.7), reps: 3 }];
    if (pesoTrabajo >= 100) lista.push({ peso: red(pesoTrabajo * 0.85), reps: 1 });
  } else {
    lista = [{ peso: red(pesoTrabajo * 0.5), reps: 8 }, { peso: red(pesoTrabajo * 0.75), reps: 4 }];
  }
  // Quita las que pesan lo mismo que la anterior o igual que la serie de trabajo
  return lista.filter(function (x, i) { return x.peso > 0 && x.peso < pesoTrabajo && (i === 0 || x.peso > lista[i - 1].peso); });
}

// ---------- Medidas corporales ----------
const CAMPOS_MEDIDAS = [["brazo", "Brazo"], ["pecho", "Pecho"], ["cintura", "Cintura"], ["muslo", "Muslo"]];
// Guarda las medidas de hoy (sustituye las de hoy si ya había). Valores en cm; los vacíos se guardan como null.
function guardarMedidas(valores) {
  const m = { fecha: hoy() };
  let alguna = false;
  for (const c of CAMPOS_MEDIDAS) {
    const v = valores[c[0]];
    if (v === null || v === undefined || v === "" || isNaN(v)) { m[c[0]] = null; continue; }
    if (v < 10 || v > 250) return { ok: false, msg: c[1] + ": escribe un valor entre 10 y 250 cm." };
    m[c[0]] = Math.round(v * 10) / 10; alguna = true;
  }
  if (!alguna) return { ok: false, msg: "Escribe al menos una medida." };
  if (!Array.isArray(estado.medidas)) estado.medidas = [];
  estado.medidas = estado.medidas.filter(function (x) { return x.fecha !== m.fecha; });
  estado.medidas.push(m);
  estado.medidas.sort(function (a, b) { return a.fecha < b.fecha ? -1 : 1; });
  return { ok: true };
}
// Cambio de una medida desde la primera vez que la apuntaste
function cambioMedida(campo) {
  const con = (estado.medidas || []).filter(function (m) { return typeof m[campo] === "number"; });
  if (con.length < 2) return null;
  return Math.round((con[con.length - 1][campo] - con[0][campo]) * 10) / 10;
}

// ---------- Copia de seguridad ----------
// Pide hacer copia si hay entrenos y han pasado los días elegidos (14 por defecto) desde la última o desde que lo pospusiste
function necesitaCopia() {
  if (estado.modo === "demo" || sesionesValidas().length === 0) return false;
  if (typeof conectado === "function" && conectado()) return false;      // con cuenta en la nube ya se guarda solo
  const ref = [estado.ajustes.ultimaCopia, estado.ajustes.copiaPospuesta].filter(Boolean).sort().pop();
  const cada = estado.ajustes.copiaDias === undefined ? 14 : estado.ajustes.copiaDias;
  if (cada === 0) return false;                       // el usuario eligió «Nunca»
  if (!ref) return sesionesValidas().length >= 3;
  return diasEntre(ref, hoy()) >= cada;
}

// ---------- Rutinas famosas ----------
// Rutinas clásicas listas para usar. Si una máquina no está en tu gimnasio, se cambia por una variante.
function diaPlantilla(nombre, lista) { return { nombre: nombre, ejercicios: lista.map(function (x) { return { id: x[0], series: x[1], repMin: x[2], repMax: x[3], descanso: x[4] }; }) }; }
const RUTINAS_FAMOSAS = {
  "fuerza-5x5": { nombre: "Fuerza 5×5", nivel: "principiante", objetivo: "fuerza", dias: 3, duracion: 60,
    desc: "Pocos ejercicios básicos con mucho peso. Alternas A y B. Ideal para ganar fuerza desde cero.",
    plantilla: [
      diaPlantilla("Día A", [["sentadilla", 5, 5, 5, 180], ["press-banca", 5, 5, 5, 180], ["remo-barra", 5, 5, 5, 150]]),
      diaPlantilla("Día B", [["sentadilla", 5, 5, 5, 180], ["press-militar", 5, 5, 5, 150], ["peso-muerto", 1, 5, 5, 180]]),
      diaPlantilla("Día A (2)", [["sentadilla", 5, 5, 5, 180], ["press-banca", 5, 5, 5, 180], ["remo-barra", 5, 5, 5, 150]])
    ] },
  "ppl": { nombre: "Empuje, tirón y pierna (PPL)", nivel: "intermedio", objetivo: "masa", dias: 3, duracion: 60,
    desc: "Cada día un tipo de movimiento: empujar, tirar y pierna. Si tienes 6 días, haz la vuelta dos veces.",
    plantilla: [
      diaPlantilla("Empuje", [["press-banca", 4, 6, 10, 150], ["press-inclinado-mancuernas", 3, 8, 12, 120], ["press-militar", 3, 6, 10, 120], ["elevaciones-laterales", 3, 12, 15, 60], ["extension-cuerda", 3, 10, 15, 60]]),
      diaPlantilla("Tirón", [["dominadas", 4, 5, 10, 150], ["remo-barra", 3, 6, 10, 120], ["jalon", 3, 8, 12, 90], ["face-pull", 3, 12, 15, 60], ["curl-barra", 3, 8, 12, 60]]),
      diaPlantilla("Pierna", [["sentadilla", 4, 5, 8, 180], ["peso-muerto-rumano", 3, 8, 10, 150], ["prensa", 3, 10, 12, 120], ["curl-femoral-tumbado", 3, 10, 12, 90], ["gemelos-maquina", 4, 10, 15, 60]])
    ] },
  "torso-pierna": { nombre: "Torso y pierna", nivel: "intermedio", objetivo: "masa", dias: 4, duracion: 60,
    desc: "4 días: dos de torso y dos de pierna. Cada músculo se entrena dos veces por semana.",
    plantilla: [
      diaPlantilla("Torso A", [["press-banca", 4, 6, 8, 150], ["remo-barra", 4, 6, 10, 120], ["press-militar", 3, 8, 10, 120], ["jalon", 3, 10, 12, 90], ["curl-barra", 2, 10, 12, 60], ["extension-polea", 2, 10, 12, 60]]),
      diaPlantilla("Pierna A", [["sentadilla", 4, 5, 8, 180], ["peso-muerto-rumano", 3, 8, 10, 150], ["extension-cuadriceps", 3, 12, 15, 75], ["curl-femoral-sentado", 3, 10, 12, 75], ["gemelos-maquina", 4, 10, 15, 60]]),
      diaPlantilla("Torso B", [["press-inclinado-mancuernas", 4, 8, 12, 120], ["dominadas", 4, 6, 10, 150], ["press-hombro-mancuernas", 3, 8, 12, 90], ["remo-polea", 3, 10, 12, 90], ["curl-martillo", 2, 10, 12, 60], ["press-frances", 2, 10, 12, 60]]),
      diaPlantilla("Pierna B", [["peso-muerto", 3, 3, 5, 180], ["prensa", 4, 10, 12, 120], ["zancadas", 3, 10, 12, 90], ["hip-thrust", 3, 8, 12, 90], ["gemelo-sentado", 3, 12, 20, 60]])
    ] },
  "split-clasico": { nombre: "Split clásico de culturismo", nivel: "avanzado", objetivo: "masa", dias: 6, duracion: 90,
    desc: "Pecho y espalda, hombros y brazos, pierna. Dos vueltas a la semana. Mucho volumen: solo si ya tienes experiencia.",
    plantilla: [
      diaPlantilla("Pecho y espalda", [["press-banca", 4, 6, 10, 150], ["dominadas", 4, 6, 10, 150], ["press-inclinado-mancuernas", 3, 8, 12, 120], ["remo-barra", 3, 8, 10, 120], ["aperturas-polea", 3, 12, 15, 60], ["pullover-polea", 3, 12, 15, 60]]),
      diaPlantilla("Hombros y brazos", [["press-militar", 4, 6, 10, 150], ["elevaciones-laterales", 4, 12, 15, 60], ["pajaros-maquina", 3, 12, 15, 60], ["curl-barra", 3, 8, 12, 75], ["press-frances", 3, 8, 12, 75], ["curl-martillo", 3, 10, 12, 60], ["extension-cuerda", 3, 10, 15, 60]]),
      diaPlantilla("Pierna", [["sentadilla", 4, 6, 10, 180], ["peso-muerto-rumano", 4, 8, 10, 150], ["prensa", 3, 10, 12, 120], ["curl-femoral-tumbado", 3, 10, 12, 75], ["gemelos-maquina", 4, 10, 15, 60]]),
      diaPlantilla("Pecho y espalda (2)", [["press-inclinado-barra", 4, 6, 10, 150], ["remo-pecho-apoyado", 4, 8, 12, 120], ["press-maquina", 3, 8, 12, 90], ["jalon", 3, 10, 12, 90], ["contractora", 3, 12, 15, 60]]),
      diaPlantilla("Hombros y brazos (2)", [["press-arnold", 4, 8, 12, 120], ["elevaciones-polea", 3, 12, 15, 60], ["face-pull", 3, 12, 15, 60], ["curl-predicador", 3, 8, 12, 75], ["extension-cuerda-nuca", 3, 10, 15, 60]]),
      diaPlantilla("Pierna (2)", [["hack", 4, 8, 12, 150], ["hip-thrust", 4, 8, 12, 120], ["extension-cuadriceps", 3, 12, 15, 75], ["curl-femoral-sentado", 3, 10, 12, 75], ["gemelo-sentado", 4, 12, 20, 60]])
    ] },
  "cuerpo-completo": { nombre: "Cuerpo completo para empezar", nivel: "principiante", objetivo: "masa", dias: 3, duracion: 45,
    desc: "Todo el cuerpo en cada sesión, con máquinas fáciles de aprender. Perfecta para tus primeros meses.",
    plantilla: [
      diaPlantilla("Día 1", [["prensa", 3, 10, 12, 120], ["press-maquina", 3, 8, 12, 90], ["jalon", 3, 8, 12, 90], ["curl-femoral-sentado", 2, 10, 12, 75], ["elevaciones-laterales", 2, 12, 15, 60]]),
      diaPlantilla("Día 2", [["sentadilla-goblet", 3, 10, 12, 90], ["press-hombro-maquina", 3, 8, 12, 90], ["remo-maquina", 3, 8, 12, 90], ["hip-thrust-maquina", 2, 10, 12, 75], ["crunch-maquina", 2, 12, 15, 60]]),
      diaPlantilla("Día 3", [["prensa", 3, 10, 12, 120], ["press-inclinado-mancuernas", 3, 8, 12, 90], ["remo-polea", 3, 8, 12, 90], ["extension-cuadriceps", 2, 12, 15, 60], ["curl-polea", 2, 10, 12, 60]])
    ] }
};

// Crea la rutina a partir de una plantilla, cambiando lo que no puedes hacer por una variante disponible
function rutinaDesdePlantilla(clave) {
  const p = RUTINAS_FAMOSAS[clave];
  const noPuede = (estado.evitados || []).concat(estado.noDisponibles || []);
  const equipo = estado.perfil.equipo || [];
  const sirve = function (id) { const e = buscarEj(id); return e && !noPuede.includes(id) && equipo.includes(e.equipo); };
  const cambios = [];
  const dias = p.plantilla.map(function (dia) {
    const ejercicios = [];
    for (const o of dia.ejercicios) {
      let id = o.id;
      if (!sirve(id)) {
        const e = buscarEj(id);
        const alt = (e.variantes || []).find(sirve) || EJERCICIOS.find(function (x) { return x.grupo === e.grupo && x.compuesto === e.compuesto && sirve(x.id); });
        if (!alt) continue;
        cambios.push(e.nombre + " → " + buscarEj(alt.id || alt).nombre);
        id = alt.id || alt;
      }
      if (ejercicios.some(function (x) { return x.id === id; })) continue;
      ejercicios.push({ id: id, series: o.series, repMin: o.repMin, repMax: o.repMax, descanso: o.descanso });
    }
    return { nombre: dia.nombre, tipo: "completo", ejercicios: ejercicios };
  });
  const r = { nombre: p.nombre, dias: dias, creada: hoy(), objetivo: p.objetivo, nivel: p.nivel, duracion: p.duracion, diasSemana: p.dias,
    calendario: calendarioPorDefecto(p.dias), factorDuracion: factorDuracion(), famosa: clave };
  r.problemas = validarRutina(r);
  return { rutina: r, cambios: cambios };
}

// ---------- Flujo del entreno (un ejercicio a la vez) ----------
// Ejercicio en pantalla: el elegido o el primero con series pendientes
function ejercicioActual() {
  const a = estado.activa;
  if (!a.ejercicios.length) return -1;
  if (typeof a.actual === "number" && a.actual >= 0 && a.actual < a.ejercicios.length) return a.actual;
  const i = a.ejercicios.findIndex(function (e) { return e.series.some(function (s) { return !s.hecha; }); });
  return i >= 0 ? i : 0;
}
// Serie en foco dentro del ejercicio: la elegida o la primera pendiente
function serieEnFoco(e) {
  if (typeof e.foco === "number" && e.series[e.foco] && !e.series[e.foco].hecha) return e.foco;
  const i = e.series.findIndex(function (s) { return !s.hecha; });
  return i;
}
// Paso de los botones − / + según el material
function pasoPeso(ej) {
  if (ej.equipo === "mancuernas") return estado.ajustes.incrementoMancuernas || 2;
  return estado.ajustes.incremento || 2.5;
}
// ¿Esta serie supera tu mejor marca? (1RM estimada mayor que la de tu historial y que las de hoy)
function esRecordEnVivo(ei, si) {
  const e = estado.activa.ejercicios[ei];
  const ej = buscarEj(e.id);
  const s = e.series[si];
  const valor = unaRM(cargaSerie(ej, s.peso, hoy()), s.reps);
  const historico = mejor1RM(e.id);
  if (historico <= 0 || valor <= historico) return false;
  for (let j = 0; j < e.series.length; j++) {
    const x = e.series[j];
    if (j !== si && x.hecha && x.prVivo && unaRM(cargaSerie(ej, x.peso, hoy()), x.reps) >= valor) return false;
  }
  return true;
}

// Después de completar una serie: a dónde ir y cuánto descansar
function siguientePaso(ei) {
  const a = estado.activa;
  const e = a.ejercicios[ei];
  const pendiente = function (i) { return i >= 0 && i < a.ejercicios.length && a.ejercicios[i].series.some(function (s) { return !s.hecha; }); };
  // Superserie: del primero se pasa al segundo sin descanso; del segundo se vuelve al primero tras descansar
  if (e.superserie && pendiente(ei + 1)) return { ir: ei + 1, descanso: false };
  if (ei > 0 && a.ejercicios[ei - 1].superserie && pendiente(ei - 1)) return { ir: ei - 1, descanso: true };
  if (pendiente(ei)) return { ir: ei, descanso: true };
  for (let i = 1; i <= a.ejercicios.length; i++) {
    const j = (ei + i) % a.ejercicios.length;
    if (pendiente(j)) return { ir: j, descanso: true };
  }
  return { ir: ei, descanso: false, fin: true };
}

function duracionSesion(a) {
  return Math.min(Math.max(1, Math.round((Date.now() - a.inicio) / 60000)), 180);
}

function sesionAntigua() {
  return estado.activa && Date.now() - estado.activa.inicio > 12 * 3600 * 1000;
}

function hayAlgoValido(a) {
  return a.ejercicios.some(function (e) { return e.series.some(serieValida); });
}

// Termina la sesión. Devuelve el resumen, { duplicado } o { vacio }.
function terminarSesion() {
  const a = estado.activa;
  if (!hayAlgoValido(a) && !a.ejercicios.some(function (e) { return e.series.some(function (s) { return s.hecha; }); })) return { vacio: true };
  const fecha = aTexto(new Date(a.inicio));
  const ejercicios = a.ejercicios.map(function (e) {
    return { id: e.id, series: e.series.map(function (s) { const x = { peso: s.peso, reps: s.reps, rpe: s.rpe, hecha: s.hecha, sospechosa: !!s.sospechosa, confirmada: !!s.confirmada, aviso: s.aviso || "" }; if (s.tipo) x.tipo = s.tipo; return x; }),
      nota: e.nota, molestias: !!e.molestias, cambio: !!e.cambio };
  });

  const ultima = estado.sesiones[estado.sesiones.length - 1];
  if (ultima && ultima.fecha === fecha && ultima.diaNombre === a.diaNombre && JSON.stringify(ultima.ejercicios) === JSON.stringify(ejercicios)) {
    estado.activa = null; guardar();
    return { duplicado: true, sesion: ultima };
  }

  const antes = fotoRangos();
  const sesion = { id: "s" + Date.now(), fecha: fecha, diaIndex: a.diaIndex, diaNombre: a.diaNombre,
    duracion: duracionSesion(a), ejercicios: ejercicios, prs: [] };

  let anterior = null;
  for (let i = estado.sesiones.length - 1; i >= 0; i--) {
    if (estado.sesiones[i].diaNombre === sesion.diaNombre && sesionValida(estado.sesiones[i])) { anterior = estado.sesiones[i]; break; }
  }

  estado.sesiones.push(sesion);
  estado.activa = null;
  recalcularHistorial();
  const guardada = estado.sesiones.find(function (s) { return s.id === sesion.id; });

  const ascensos = compararRangos(antes, fotoRangos());
  for (const asc of ascensos) estado.ascensos.push({ fecha: fecha, nombre: asc.nombre, tipo: asc.tipo, rango: asc.rango });
  guardar();
  return { sesion: guardada, anterior: anterior, ascensos: ascensos };
}

// Recalcula volumen, series y récords en orden de fecha (al terminar, editar o borrar)
function recalcularHistorial() {
  estado.sesiones.sort(function (a, b) { return a.fecha < b.fecha ? -1 : (a.fecha > b.fecha ? 1 : 0); });
  const mejores = {};
  for (const s of estado.sesiones) {
    let volumen = 0, hechas = 0, revision = 0;
    s.prs = [];
    for (const e of s.ejercicios) {
      const ej = buscarEj(e.id);
      let mejorHoy = 0;
      for (const x of e.series) {
        if (!x.hecha) continue;
        if (!ej.asistido) volumen += x.peso * x.reps;   // en asistidos los kg son ayuda, no carga
        hechas++;
        if (serieValida(x)) mejorHoy = Math.max(mejorHoy, unaRM(cargaSerie(ej, x.peso, s.fecha), x.reps));
        else revision++;
      }
      if (mejores[e.id] && mejorHoy > mejores[e.id]) s.prs.push(e.id);
      if (mejorHoy > 0) mejores[e.id] = Math.max(mejores[e.id] || 0, mejorHoy);
    }
    s.volumen = Math.round(volumen);            // tonelaje externo (kg × reps del peso cargado)
    s.seriesHechas = hechas; s.enRevision = revision;
    s.seriesEfectivas = hechas - revision;
  }
}

// =====================================================
// SOCIAL: PRIVACIDAD, DENUNCIAS Y RETOS (local)
// =====================================================
// - Todo se identifica por un id permanente (uid), nunca por el nombre de usuario.
// - Fuera del modo demo, Social es tu diario: solo tus publicaciones.
// - Los usuarios ficticios solo existen en el modo demo y siempre van marcados.
// - Los retos son personales y se calculan solo con tus entrenos registrados.

function miId() { return estado.perfil.uid; }
function miUsuario() { return estado.perfil.usuario || "yo"; }

// Nombre visible de un autor: el tuyo actual, el de un usuario demo o el guardado en la publicación
function nombreDe(uid, guardado) {
  if (uid === miId()) return miUsuario();
  const demo = USUARIOS_DEMO.find(function (u) { return u.uid === uid; });
  return demo ? demo.usuario : (guardado || "usuario");
}

// Política de publicación: la misma que aplicarán las reglas del servidor
function puedePublicar() {
  if (estado.perfil.edad < 16) return { ok: false, msg: "La parte social está desactivada para menores de 16 años." };
  if (estado.ajustes.privacidad === "privado") return { ok: false, msg: "Tu perfil es privado. Cámbialo en Ajustes para compartir." };
  if (!estado.ajustes.compartir) return { ok: false, msg: "Tienes desactivado «Mostrar mis entrenos». Actívalo en Ajustes." };
  const hoyN = estado.social.posts.filter(function (x) { return x.autorId === miId() && x.fecha === hoy(); }).length;
  if (hoyN >= 10) return { ok: false, msg: "Has llegado al límite de 10 publicaciones al día." };
  return { ok: true, msg: "" };
}

function publicar(tipo, texto) {
  const p = puedePublicar();
  if (!p.ok) return p;
  estado.social.posts.unshift({ id: nuevoId("p-"), autorId: miId(), autorNombre: miUsuario(), tipo: tipo, texto: String(texto).slice(0, 300), fecha: hoy(), likes: [], comentarios: [] });
  return p;
}

function comentar(postId, texto) {
  const t = String(texto || "").trim();
  if (!t) return { ok: false, msg: "Escribe un comentario." };
  if (t.length > 200) return { ok: false, msg: "Máximo 200 caracteres." };
  let hoyN = 0;
  for (const x of estado.social.posts) for (const c of x.comentarios) if (c.autorId === miId() && c.fecha === hoy()) hoyN++;
  if (hoyN >= 30) return { ok: false, msg: "Límite de 30 comentarios al día." };
  const post = estado.social.posts.find(function (x) { return x.id === postId; });
  if (!post || !feedVisible().includes(post)) return { ok: false, msg: "No puedes comentar esta publicación." };
  post.comentarios.push({ autorId: miId(), autorNombre: miUsuario(), texto: t, fecha: hoy() });
  return { ok: true, msg: "" };
}

function feedVisible() {
  const yo = miId();
  return estado.social.posts.filter(function (x) {
    if (x.oculto) return false;
    if (x.autorId === yo) return true;
    if (estado.modo !== "demo" || !x.demo) return false;
    return estado.social.amigos.includes(x.autorId) && !estado.social.bloqueados.includes(x.autorId);
  });
}

// =====================================================
// AMIGOS CON TARJETA (funciona sin servidor)
// Cada persona comparte un enlace con un resumen de sus datos (rango, racha y mejores marcas).
// Quien lo abre o pega el código lo añade como amigo. Para actualizarlo, se vuelve a enviar.
// =====================================================
// La dirección de la app sale de donde está abierta (así sigue bien si cambia el nombre del repositorio)
const URL_APP = (typeof location !== "undefined" && /^https:/.test(location.protocol)) ? location.origin + location.pathname.replace(/[^/]*$/, "") : "https://abdelah844.github.io/apix-gym/";
const TABLA_B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

// Texto → base64 "seguro para enlaces" (sin + / =). Primero se pasa a bytes UTF-8 para que funcionen las tildes.
function aBase64(texto) {
  const utf8 = unescape(encodeURIComponent(texto));
  let r = "";
  for (let i = 0; i < utf8.length; i += 3) {
    const a = utf8.charCodeAt(i), b = utf8.charCodeAt(i + 1), c = utf8.charCodeAt(i + 2);
    const n = (a << 16) | ((b || 0) << 8) | (c || 0);
    r += TABLA_B64[(n >> 18) & 63] + TABLA_B64[(n >> 12) & 63];
    if (i + 1 < utf8.length) r += TABLA_B64[(n >> 6) & 63];
    if (i + 2 < utf8.length) r += TABLA_B64[n & 63];
  }
  return r;
}
function deBase64(codigo) {
  let bytes = "", bits = 0, valor = 0;
  for (const ch of codigo) {
    const n = TABLA_B64.indexOf(ch);
    if (n < 0) throw new Error("Carácter no válido");
    valor = (valor << 6) | n; bits += 6;
    if (bits >= 8) { bits -= 8; bytes += String.fromCharCode((valor >> bits) & 255); }
  }
  return decodeURIComponent(escape(bytes));
}

// Tu tarjeta: solo datos que tú decides compartir
function miTarjeta() {
  const pg = puntosGlobal();
  const records = [];
  for (const e of EJERCICIOS) {
    const m = mejorSerie(e.id);
    if (m && !e.asistido && e.equipo !== "corporal") records.push({ n: e.nombre, p: m.peso, r: m.reps, rm: unaRM(m.peso, m.reps) });
  }
  records.sort(function (a, b) { return b.rm - a.rm; });
  return { v: 1, uid: miId(), usuario: miUsuario(), rango: pg === null ? null : rangoDePuntos(pg), racha: rachaSemanas(),
    entrenos: sesionesValidas().length, records: records.slice(0, 3).map(function (x) { return { n: x.n, p: x.p, r: x.r }; }), fecha: hoy() };
}
function enlaceTarjeta() {
  return URL_APP + "#amigo=" + aBase64(JSON.stringify(miTarjeta()));
}
function puedeCompartirTarjeta() {
  if (estado.perfil.edad < 16) return { ok: false, msg: "La parte social está desactivada para menores de 16 años." };
  if (estado.ajustes.privacidad === "privado") return { ok: false, msg: "Tu perfil es privado. Cámbialo en Ajustes para compartir tu tarjeta." };
  return { ok: true, msg: "" };
}

// Lee un enlace o código pegado. Comprueba cada dato porque viene de fuera de la app.
function leerTarjeta(texto) {
  let codigo = String(texto || "").trim();
  const i = codigo.indexOf("amigo=");
  if (i >= 0) codigo = codigo.slice(i + 6);
  codigo = codigo.split(/[\s&#]/)[0];
  if (!codigo) return { ok: false, msg: "Pega el enlace o el código que te ha enviado tu amigo." };
  if (codigo.length > 3000) return { ok: false, msg: "El código es demasiado largo." };
  let t;
  try { t = JSON.parse(deBase64(codigo)); } catch (e) { return { ok: false, msg: "El código no es válido. Pide a tu amigo que te lo vuelva a enviar." }; }
  const texto60 = function (x) { return typeof x === "string" && x.length > 0 && x.length <= 60; };
  if (!t || t.v !== 1 || !texto60(t.uid) || !texto60(t.usuario)) return { ok: false, msg: "El código no es una tarjeta de Apix Gym." };
  if (t.rango !== null && !(Number.isInteger(t.rango) && t.rango >= 0 && t.rango < RANGOS.length)) return { ok: false, msg: "La tarjeta tiene un rango no válido." };
  if (!(Number.isInteger(t.racha) && t.racha >= 0 && t.racha < 1000) || !(Number.isInteger(t.entrenos) && t.entrenos >= 0 && t.entrenos < 100000)) return { ok: false, msg: "La tarjeta tiene datos no válidos." };
  if (!Array.isArray(t.records) || t.records.length > 3 || !t.records.every(function (r) { return r && texto60(r.n) && typeof r.p === "number" && r.p >= 0 && r.p <= 400 && Number.isInteger(r.r) && r.r >= 1 && r.r <= 50; })) return { ok: false, msg: "La tarjeta tiene marcas no válidas." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t.fecha)) return { ok: false, msg: "La tarjeta no tiene fecha válida." };
  return { ok: true, tarjeta: { uid: t.uid, usuario: t.usuario, rango: t.rango, racha: t.racha, entrenos: t.entrenos, records: t.records, fecha: t.fecha } };
}

function anadirAmigoReal(texto) {
  const r = leerTarjeta(texto);
  if (!r.ok) return r;
  const t = r.tarjeta;
  if (t.uid === miId()) return { ok: false, msg: "Esa es tu propia tarjeta. Envíasela a tus amigos para que te añadan." };
  if (!Array.isArray(estado.social.amigosReales)) estado.social.amigosReales = [];
  const lista = estado.social.amigosReales;
  const ya = lista.findIndex(function (a) { return a.uid === t.uid; });
  if (ya >= 0) { lista[ya] = t; return { ok: true, nuevo: false, amigo: t, msg: "Datos de @" + t.usuario + " actualizados." }; }
  if (lista.length >= 100) return { ok: false, msg: "Has llegado al máximo de 100 amigos." };
  lista.push(t);
  return { ok: true, nuevo: true, amigo: t, msg: "@" + t.usuario + " añadido a tus amigos." };
}
function quitarAmigoReal(uid) {
  estado.social.amigosReales = (estado.social.amigosReales || []).filter(function (a) { return a.uid !== uid; });
}

function buscarUsuarios(texto) {
  if (estado.modo !== "demo") return [];
  const t = texto.trim().toLowerCase();
  if (!t) return [];
  return USUARIOS_DEMO.filter(function (u) {
    return u.usuario.includes(t) && !u.privado && !estado.social.bloqueados.includes(u.uid);
  });
}

// Denuncia: se guarda con todos sus datos en una cola para enviarla al servidor de moderación.
// Hasta que haya servidor, la publicación se oculta para ti y la denuncia queda "pendiente de envío".
const MOTIVOS_DENUNCIA = { spam: "Spam o publicidad", ofensivo: "Contenido ofensivo o acoso", falso: "Resultados falsos", otro: "Otro motivo" };

function denunciar(postId, motivo, detalle) {
  if (!MOTIVOS_DENUNCIA[motivo]) return { ok: false, msg: "Elige un motivo." };
  const post = estado.social.posts.find(function (x) { return x.id === postId; });
  if (!post) return { ok: false, msg: "La publicación no existe." };
  if (post.autorId === miId()) return { ok: false, msg: "No puedes denunciar tu propia publicación." };
  estado.denuncias.push({ id: nuevoId("d-"), postId: postId, autorId: post.autorId, denuncianteId: miId(), motivo: motivo,
    detalle: String(detalle || "").slice(0, 300), fecha: new Date().toISOString(), estado: "pendiente-envio" });
  post.oculto = true;
  return { ok: true, msg: "" };
}

const TIPOS_RETO = {
  entrenos: { nombre: "Entrenos en el periodo", unidad: "entrenos" },
  constancia: { nombre: "Semanas constantes", unidad: "semanas" },
  mejora: { nombre: "Mejora en un ejercicio", unidad: "%" },
  record: { nombre: "Récords personales", unidad: "récords" },
  rutina: { nombre: "Días de rutina completados", unidad: "días" }
};

function progresoReto(r) {
  const ses = sesionesValidas().filter(function (s) { return s.fecha >= r.inicio && s.fecha <= r.fin; });
  if (r.tipo === "entrenos") return ses.length;
  if (r.tipo === "record") return ses.reduce(function (t, s) { return t + s.prs.length; }, 0);
  if (r.tipo === "rutina") return ses.filter(function (s) { return s.diaIndex !== undefined && s.diaIndex !== null; }).length;
  if (r.tipo === "constancia") {
    const semanas = {};
    for (const s of ses) semanas[lunesDe(s.fecha)] = (semanas[lunesDe(s.fecha)] || 0) + 1;
    return Object.keys(semanas).filter(function (l) { return semanas[l] >= minimoSemanal(); }).length;
  }
  if (r.tipo === "mejora") {
    const antes = mejor1RM(r.ejercicio, sumarDias(r.inicio, -1));
    let ahora = 0;
    const e = buscarEj(r.ejercicio);
    for (const s of ses) for (const x of s.ejercicios) if (x.id === r.ejercicio) for (const serie of x.series) if (serieValida(serie)) ahora = Math.max(ahora, unaRM(cargaSerie(e, serie.peso, s.fecha), serie.reps));
    if (antes === 0 || ahora === 0) return 0;
    return Math.max(0, Math.round((ahora - antes) / antes * 1000) / 10);
  }
  return 0;
}

// =====================================================
// MÉTRICAS DE VOLUMEN (separadas, nunca una cifra única)
// =====================================================
// - Series efectivas: series hechas y válidas. Es la medida principal del trabajo.
// - Series efectivas por músculo: directas × 1 + secundarias × 0,5.
// - Tonelaje externo: kg × reps solo del peso que cargas (no incluye tu peso corporal).
//   Sirve para comparar el mismo ejercicio consigo mismo, no ejercicios distintos.

// ---------- Carga de entrenamiento y fatiga ----------
// Tonelaje (kg × reps) y series efectivas de las sesiones entre dos fechas (incluidas)
function cargaEntre(desde, hasta) {
  let kg = 0, series = 0, n = 0;
  for (const s of sesionesValidas()) {
    if (s.fecha < desde || s.fecha > hasta) continue;
    kg += s.volumen || 0; series += s.seriesEfectivas || 0; n++;
  }
  return { kg: kg, series: series, sesiones: n };
}
// Últimas N semanas (de lunes a domingo), de la más antigua a la actual
function cargaPorSemanas(n) {
  const lista = [];
  let lunes = lunesDe(hoy());
  for (let i = 0; i < n; i++) { lista.unshift({ desde: lunes, carga: cargaEntre(lunes, sumarDias(lunes, 6)) }); lunes = sumarDias(lunes, -7); }
  return lista;
}
// Últimos N meses naturales
function cargaPorMeses(n) {
  const lista = [];
  const d = new Date(hoy() + "T12:00:00");
  for (let i = 0; i < n; i++) {
    const y = d.getFullYear(), m = d.getMonth() - i;
    const ini = new Date(y, m, 1, 12), fin = new Date(y, m + 1, 0, 12);
    lista.unshift({ desde: aTexto(ini), carga: cargaEntre(aTexto(ini), aTexto(fin)) });
  }
  return lista;
}
// Índice de fatiga: carga de los últimos 7 días comparada con la media semanal de las 4 semanas anteriores.
// Entre 0,8 y 1,3 es la zona normal; por encima, has subido la carga muy deprisa.
function indiceFatiga() {
  const aguda = cargaEntre(fechaTexto(6), hoy()).series;
  const cronica = cargaEntre(fechaTexto(34), fechaTexto(7)).series / 4;
  if (cronica < 3) return { ratio: null, nivel: "pocos", texto: "Necesitas al menos 4-5 semanas de entrenos para calcularla." };
  const ratio = aguda / cronica;
  if (ratio > 1.5) return { ratio: ratio, nivel: "muy-alta", texto: "Has subido mucho la carga de golpe. Plantéate una semana más suave." };
  if (ratio > 1.3) return { ratio: ratio, nivel: "alta", texto: "Carga más alta de lo normal. Duerme bien y sube poco a poco." };
  if (ratio < 0.8) return { ratio: ratio, nivel: "baja", texto: "Esta semana vas por debajo de lo habitual. Si estás descansado, puedes apretar." };
  return { ratio: ratio, nivel: "normal", texto: "Carga estable. Buen equilibrio entre esfuerzo y recuperación." };
}

// ---------- Mi semana: días y horas de entreno ----------
// Los días están en rutina.calendario (0 = lunes … 6 = domingo).
// Las horas son opcionales y se guardan en ajustes.horasEntreno, por día de la semana: { "0": "18:30" }.
// Los días de la semana que entrenas. Pueden ser más o menos que los días de la rutina:
// en ese caso los días de la rutina se van turnando en orden.
function diasDeEntreno() {
  const d = estado.ajustes.diasEntreno;                 // lo elegido en «Mi semana»
  if (Array.isArray(d) && d.length && d.every(function (x) { return Number.isInteger(x) && x >= 0 && x <= 6; })) return d;
  if (estado.rutina && Array.isArray(estado.rutina.calendario)) return estado.rutina.calendario;
  return estado.perfil.diasSemana || [];
}
// ¿Coinciden los días de la semana con los de la rutina? (lunes = Día 1, miércoles = Día 2…)
function semanaCuadraConRutina() {
  return !!estado.rutina && diasDeEntreno().length === estado.rutina.dias.length;
}
function horaDeEntreno(diaSemana) {
  const h = (estado.ajustes.horasEntreno || {})[diaSemana];
  return typeof h === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(h) ? h : "";
}
// A qué hora toca avisar ese día: la hora de entreno si la has puesto; si no, la general de Ajustes
function momentoAviso(diaSemana) {
  const h = horaDeEntreno(diaSemana);
  if (h) return { h: parseInt(h.slice(0, 2)), m: parseInt(h.slice(3, 5)) };
  return { h: (estado.ajustes.notif || {}).hora || 18, m: 0 };
}
// Qué día de la rutina toca ese día de la semana (según el calendario), o null
function diaRutinaDe(diaSemana) {
  if (!semanaCuadraConRutina()) return null;            // si no cuadran, los días se turnan: no se sabe cuál toca
  const i = diasDeEntreno().indexOf(diaSemana);
  return i >= 0 && estado.rutina.dias[i] ? estado.rutina.dias[i] : null;
}
// Guarda los días (ordenados) y las horas elegidas en «Mi semana»
function guardarSemana(dias, horas) {
  const cal = dias.slice().sort(function (a, b) { return a - b; });
  estado.ajustes.diasEntreno = cal.slice();
  estado.perfil.diasSemana = cal.slice();
  estado.perfil.dias = cal.length;                      // tu meta semanal pasa a ser esos días
  if (estado.rutina && cal.length === estado.rutina.dias.length) estado.rutina.calendario = cal.slice();
  const limpias = {};
  for (const d of cal) if (/^([01]\d|2[0-3]):[0-5]\d$/.test(horas[d] || "")) limpias[d] = horas[d];
  estado.ajustes.horasEntreno = limpias;
}

// ---------- Recordatorios ----------
// Decide si toca avisar ahora (máximo 1 aviso al día). Prioridad: racha en peligro → reto → día de entreno.
// paraPlan = true: se usa para calcular los avisos de los próximos días (avisos push)
function recordatorioPendiente(ahora, paraPlan) {
  const n = estado.ajustes.notif || {};
  const hoyF = aTexto(ahora);
  if (!paraPlan && n.ultimoAviso === hoyF) return null;
  const diaSemana = (ahora.getDay() + 6) % 7;                                      // 0 = lunes … 6 = domingo
  const mo = momentoAviso(diaSemana);
  if (!paraPlan && ahora.getHours() * 60 + ahora.getMinutes() < mo.h * 60 + mo.m) return null;
  const validas = sesionesValidas();
  if (validas.some(function (s) { return s.fecha === hoyF; })) return null;          // hoy ya entrenaste
  if (validas.length && estado.sesiones.length && molestiasRecientes()) return null; // con molestias no se presiona
  // Racha en peligro: fin de semana y aún no llegas al mínimo semanal
  if (n.racha !== false && diaSemana >= 5) {
    const estaSemana = (sesionesPorSemana()[lunesDe(hoyF)] || 0);
    const racha = rachaSemanas();
    const faltan = minimoSemanal() - estaSemana;
    const pasada = (sesionesPorSemana()[sumarDias(lunesDe(hoyF), -7)] || 0) >= minimoSemanal();
    if (faltan > 0 && pasada && faltan <= 7 - diaSemana) {
      return { tipo: "racha", titulo: "🔥 Tu racha está en peligro", texto: "Te falta" + (faltan > 1 ? "n " + faltan + " entrenos" : " 1 entreno") + " esta semana para no perder tu racha." };
    }
  }
  // Último día de un reto
  if (n.retos !== false && typeof retoUrgente === "function") {
    const r = retoUrgente();
    if (r && r.fin === hoyF) return { tipo: "reto", titulo: "⏳ Último día de tu reto", texto: "Hoy acaba tu reto «" + TIPOS_RETO[r.tipo].nombre.toLowerCase() + "». ¡A por él!" };
  }
  // Día de entreno según tu calendario
  if (n.recordatorios !== false) {
    const cal = diasDeEntreno();
    if (cal.includes(diaSemana)) {
      // Con hora puesta, Apix te dice qué día de la rutina te toca
      const dr = horaDeEntreno(diaSemana) ? diaRutinaDe(diaSemana) : null;
      return { tipo: "entreno", titulo: "💪 Hoy toca entrenar", texto: dr ? "Es tu hora: te toca " + dr.nombre + ". ¡Vamos!" : "Hay que tener disciplina para el cuerpo que deseas." };
    }
  }
  return null;
}
// Avisos de los próximos días, a la hora elegida en Ajustes. Se suben al servidor para que
// lleguen aunque la app esté cerrada. Se vuelven a calcular cada vez que abres la app o entrenas.
function planAvisos(ahora, dias) {
  const lista = [];
  for (let i = 0; i < dias; i++) {
    const base = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + i, 12, 0, 0);
    const mo = momentoAviso((base.getDay() + 6) % 7);          // cada día, a su hora
    const dia = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + i, mo.h, mo.m, 0);
    if (dia <= ahora) continue;                       // hoy, si la hora ya ha pasado
    const aviso = recordatorioPendiente(dia, true);
    if (aviso) lista.push({ cuando: dia.toISOString(), titulo: aviso.titulo, texto: aviso.texto });
  }
  return lista;
}
function molestiasRecientes() {
  const v = sesionesValidas();
  const u = v[v.length - 1];
  return !!u && diasEntre(u.fecha, hoy()) <= 3 && u.ejercicios.some(function (e) { return e.molestias; });
}

// Series a la semana recomendadas: los músculos pequeños necesitan menos trabajo directo
const MINIMO_SEMANAL = { antebrazos: 3, abdominales: 3, aductores: 3, gemelos: 3 };
function nivelMusculo(g, porSemana) {
  const minimo = MINIMO_SEMANAL[g] || 6;
  if (porSemana < minimo) return "poco";
  if (porSemana > 20) return "mucho";
  return "bien";
}

function seriesEfectivasPorGrupo(sesiones) {
  const v = {};
  for (const g in GRUPOS) v[g] = 0;
  for (const s of sesiones) for (const e of s.ejercicios) {
    const ej = buscarEj(e.id);
    const n = e.series.filter(serieValida).length;
    v[ej.grupo] += n;
    for (const g of ej.sec) v[g] += n * 0.5;
  }
  return v;
}

// Semanas (lunes) entre dos fechas, incluidas las que no tienen entrenos
function semanasEntre(desde, hasta) {
  const lista = [];
  let l = lunesDe(desde);
  const fin = lunesDe(hasta);
  while (l <= fin && lista.length < 520) { lista.push(l); l = sumarDias(l, 7); }
  return lista;
}

// Segundos que quedan de descanso (el fin se guarda con la sesión, así sobrevive a una recarga)
function descansoRestante(activa, ahora) {
  if (!activa || !activa.descanso || !activa.descanso.fin) return 0;
  return Math.max(0, Math.ceil((activa.descanso.fin - (ahora || Date.now())) / 1000));
}

// =====================================================
// DATOS DE DEMOSTRACIÓN (ficticios y marcados)
// =====================================================

function crearDemo() {
  estado = estadoVacio({
    nombre: "Alex", usuario: "alex.demo", sexo: "hombre", edad: 22, altura: 178, peso: 74, experiencia: "intermedio",
    objetivo: "masa", dias: 4, duracion: 60, lugar: "gimnasio",
    equipo: ["barra", "mancuernas", "maquina", "polea", "corporal"], evitar: "", lesiones: ""
  });
  estado.modo = "demo";
  estado.rutina = generarRutina({ objetivo: "masa", nivel: "intermedio", dias: 4, duracion: 60, tipo: "auto",
    equipo: estado.perfil.equipo, prioridad: "", evitar: "" });

  estado.pesoCorporal = [];
  for (let i = 6; i >= 0; i--) estado.pesoCorporal.push({ fecha: fechaTexto(i * 7), kg: Math.round((72.6 + (6 - i) * 0.23) * 10) / 10 });

  const diasSemana = [0, 1, 3, 4];
  const lunesActual = lunesDe(hoy());
  let numSesion = 0, semilla = 7;
  function azar() { semilla = (semilla * 9301 + 49297) % 233280; return semilla / 233280; }

  for (let semana = 6; semana >= 1; semana--) {
    for (const dia of diasSemana) {
      const fecha = sumarDias(lunesActual, -semana * 7 + dia);
      const diaIndex = numSesion % estado.rutina.dias.length;
      const diaRutina = estado.rutina.dias[diaIndex];
      const progreso = 1 + (6 - semana) * 0.03;
      const ejercicios = diaRutina.ejercicios.map(function (o) {
        const e = buscarEj(o.id);
        let base;
        if (e.equipo === "corporal") base = 0;
        // En las asistidas el número es AYUDA: empieza en 30 kg y baja 5 kg cada dos semanas
        else if (e.asistido) base = Math.max(0, 30 - Math.floor((6 - semana) / 2) * 5);
        else base = redondearA(factorEj(e) * 74 * 0.5 * progreso, incrementoDe(e));
        const series = [];
        for (let k = 0; k < o.series; k++) {
          // Progreso realista de ejemplo: cada semana se suma alguna repetición (doble progresión)
          const reps = Math.max(o.repMin, Math.min(o.repMax, o.repMin + Math.floor((6 - semana) * 0.8)) - (k > 1 ? 1 : 0) - (azar() < 0.15 ? 1 : 0));
          series.push({ peso: base, reps: reps, rpe: k === o.series - 1 ? 8.5 : null, hecha: true });
        }
        return { id: o.id, series: series, nota: "", molestias: false, cambio: false };
      });
      estado.sesiones.push({ id: "demo" + numSesion, fecha: fecha, diaIndex: diaIndex, diaNombre: diaRutina.nombre, duracion: 52 + Math.round(azar() * 20), ejercicios: ejercicios, prs: [] });
      numSesion++;
    }
  }
  recalcularHistorial();

  estado.ascensos = [
    { fecha: fechaTexto(30), nombre: "Rango global", tipo: "global", rango: 2 },
    { fecha: fechaTexto(12), nombre: "Pecho", tipo: "grupo", rango: 4 }
  ];

  // Contenido social ficticio: todo lleva demo: true y solo se muestra en modo demo
  estado.social.amigos = ["demo-laura", "demo-marcos", "demo-sara"];
  estado.social.posts = [
    { id: "p-demo1", demo: true, autorId: "demo-marcos", autorNombre: "marcos_lift", tipo: "record", texto: "Nuevo récord en Sentadilla con barra: 120 kg × 5", fecha: fechaTexto(0), likes: ["demo-laura"], comentarios: [{ autorId: "demo-laura", autorNombre: "laura.fit", texto: "¡Bestia!", fecha: fechaTexto(0) }] },
    { id: "p-demo2", demo: true, autorId: "demo-laura", autorNombre: "laura.fit", tipo: "rango", texto: "Ha subido a Oro en Espalda", fecha: fechaTexto(1), likes: [], comentarios: [] },
    { id: "p-demo3", demo: true, autorId: "demo-sara", autorNombre: "sara.trains", tipo: "entreno", texto: "Completó Día 3 · Torso · 18 series efectivas", fecha: fechaTexto(2), likes: [estado.perfil.uid], comentarios: [] }
  ];
  estado.social.retos = [
    { id: "r1", tipo: "entrenos", meta: 16, inicio: sumarDias(lunesActual, -42), fin: sumarDias(lunesActual, 6) }
  ];
}
