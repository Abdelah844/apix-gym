// =====================================================
// APIX GYM · PANTALLAS (todo lo que se pinta y los botones)
// =====================================================

// ---------- Variables de la interfaz ----------
let tab = "inicio";
let pilaDeshacer = [];          // copias de la sesión para poder deshacer
let filtroBib = { texto: "", grupo: "", equipo: "", favoritos: false };
let modoBib = "ver";            // "ver" o a dónde va el ejercicio elegido
let periodo = 28;               // días del periodo en Progreso (0 = todo)
let ejGrafica = "";
let metrica = "rm";
let grupoVolumen = "";
let vistaCarga = "semana";
const MESES_CORTOS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
let vistaSocial = "feed";
let postNuevo = "";            // publicación recién creada (se resalta un momento)
let confirmar = "";             // botón que espera un segundo toque
let propuesta = null;           // rutina generada que aún no se ha aceptado
let sesionRecuperada = false;
let cambioEditor = "";
let cambiosFamosa = [];        // ejercicios cambiados al adaptar una rutina famosa
let subProgreso = "resumen";       // pestaña de Progreso: resumen, cuerpo o historial
let medidaGrafica = "brazo";          // ejercicio recién cambiado en el editor de día (se resalta)
let mensajeSugerencia = "";       // frase con el último cambio aplicado a la rutina    // se abrió la app con un entreno a medias

// ---------- Ayudas ----------
function $(id) { return document.getElementById(id); }

// Evita que un texto escrito por el usuario se convierta en HTML
function esc(t) {
  return String(t === undefined || t === null ? "" : t).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

// Texto de los botones −/+ del peso (en libras: 5 lb o 2,5 lb)
function textoPaso(paso) { return usaLibras() ? numero(Math.abs(paso) >= 2 ? 5 : 2.5) + " lb" : numero(paso) + " kg"; }
function kg(n) { return (Math.round(n * 10) / 10).toLocaleString(localeApp()) + " kg"; }
function miles(n) { return Math.round(n).toLocaleString(localeApp()); }

const I = {
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5 9-10"/></svg>',
  cerrar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  arriba: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 15l6-6 6 6"/></svg>',
  abajo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 9l6 6 6-6"/></svg>',
  cambiar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8h13l-3-3M20 16H7l3 3"/></svg>',
  borrar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>',
  buscar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
  estrella: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>',
  estrellaLlena: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>',
  deshacer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/></svg>',
  rayo: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>'
};

// ---------- Insignia de rango (diseño propio de Apix Gym) ----------
// Gema hexagonal con relieve. Cuanto más alto el rango, más adornos:
//   Hierro, Bronce, Plata → 1, 2 o 3 galones
//   Oro, Platino, Esmeralda → estrella y 1, 2 o 3 puntos
//   Diamante, Titán → gema central y alas · Apex → gema, alas, corona y brillo
let contadorInsignia = 0;
function insignia(i, tam) {
  const vacio = i === null || i === undefined;
  let s = '<svg class="badge ' + (tam || "") + '" viewBox="-22 -16 144 140" role="img" aria-label="' + (vacio ? "Sin rango" : "Rango " + RANGOS[i].nombre) + '">';
  const hex = "50,4 94,29 94,83 50,108 6,83 6,29";
  if (vacio) return s + '<polygon points="' + hex + '" fill="var(--surface2)" stroke="var(--surface3)" stroke-width="4" stroke-dasharray="8 6"/>' +
    '<text x="50" y="66" text-anchor="middle" font-size="30" font-weight="700" fill="var(--muted)">–</text></svg>';

  const r = RANGOS[i];
  const id = "ins" + (++contadorInsignia);
  s += '<defs><linearGradient id="' + id + 'c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + r.claro + '"/><stop offset=".55" stop-color="' + r.color + '"/><stop offset="1" stop-color="' + r.oscuro + '"/></linearGradient>' +
    '<linearGradient id="' + id + 'a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + r.color + '"/><stop offset="1" stop-color="' + r.oscuro + '"/></linearGradient></defs>';

  // Brillo de fondo (Apex)
  if (i === 8) s += '<circle cx="50" cy="58" r="60" fill="' + r.color + '" opacity=".18"/>';
  // Alas (Diamante, Titán y Apex)
  if (i >= 6) {
    const ala = function (lado) {
      let t = "";
      for (let k = 0; k < 3; k++) {
        const y = 40 + k * 16, largo = 30 - k * 6;
        const x0 = lado < 0 ? 12 : 88, x1 = x0 + lado * largo;
        t += '<path d="M' + x0 + ',' + y + ' Q' + (x0 + lado * largo * 0.6) + ',' + (y - 10) + ' ' + x1 + ',' + (y - 6) + ' Q' + (x0 + lado * largo * 0.5) + ',' + (y + 6) + ' ' + x0 + ',' + (y + 10) + 'Z" fill="url(#' + id + 'a)" stroke="' + r.oscuro + '" stroke-width="1.5"/>';
      }
      return t;
    };
    s += ala(-1) + ala(1);
  }
  // Pinchos laterales (Titán y Apex)
  if (i >= 7) s += '<polygon points="50,-8 58,6 42,6" fill="url(#' + id + 'a)"/><polygon points="50,120 58,106 42,106" fill="url(#' + id + 'a)"/>';

  // Cuerpo de la gema con facetas
  s += '<polygon points="' + hex + '" fill="url(#' + id + 'c)" stroke="' + r.oscuro + '" stroke-width="3.5"/>' +
    '<polygon points="50,18 82,36 82,76 50,94 18,76 18,36" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>' +
    '<path d="M50,4 L50,18 M94,29 L82,36 M94,83 L82,76 M50,108 L50,94 M6,83 L18,76 M6,29 L18,36" stroke="#fff" stroke-opacity=".25" stroke-width="2"/>' +
    '<polygon points="50,4 94,29 50,40 6,29" fill="#fff" opacity=".18"/>';

  // Emblema central
  const blanco = 'fill="#fff" stroke="' + r.oscuro + '" stroke-width="2.5" stroke-linejoin="round"';
  if (i <= 2) {
    const n = i + 1, alto = n * 14;
    for (let k = 0; k < n; k++) {
      const y = 56 + alto / 2 - k * 14 - 7;
      s += '<polyline points="30,' + (y + 11) + ' 50,' + y + ' 70,' + (y + 11) + '" fill="none" stroke="' + r.oscuro + '" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<polyline points="30,' + (y + 11) + ' 50,' + y + ' 70,' + (y + 11) + '" fill="none" stroke="#fff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>';
    }
  } else if (i <= 5) {
    // Estrella de 5 puntas
    let p = "";
    for (let k = 0; k < 10; k++) {
      const ang = -Math.PI / 2 + k * Math.PI / 5, rad = k % 2 === 0 ? 24 : 10;
      p += (50 + Math.cos(ang) * rad).toFixed(1) + "," + (52 + Math.sin(ang) * rad).toFixed(1) + " ";
    }
    s += '<polygon points="' + p + '" ' + blanco + '/>';
    const n = i - 2;
    for (let k = 0; k < n; k++) s += '<circle cx="' + (50 + (k - (n - 1) / 2) * 12) + '" cy="86" r="4" ' + blanco + '/>';
  } else {
    // Gema central facetada
    s += '<polygon points="50,30 70,48 50,82 30,48" ' + blanco + '/>' +
      '<path d="M30,48 L70,48 M50,30 L42,48 L50,82 L58,48 Z" fill="none" stroke="' + r.oscuro + '" stroke-opacity=".55" stroke-width="1.5"/>';
  }
  // Corona (Apex)
  if (i === 8) s += '<path d="M30,2 L36,-8 L43,0 L50,-12 L57,0 L64,-8 L70,2 Z" fill="#FFD25A" stroke="#9A6A00" stroke-width="2" stroke-linejoin="round"/>';
  return s + '</svg>';
}

function nombreRango(i) { return i === null || i === undefined ? "Sin rango" : RANGOS[i].nombre; }

// ---------- Gráficas ----------
// Número del eje: si la gráfica abarca poco (menos de 3 unidades), con un decimal para que no se repitan
function numeroEje(v, rango) {
  if (rango < 3) return (Math.round(v * 10) / 10).toLocaleString(localeApp());
  return Math.round(v).toLocaleString(localeApp());
}

// tendencia (opcional): otra lista de valores que se dibuja como línea discontinua
let contadorGrafica = 0;
// marcarRecords: pinta en dorado cada punto que supera a todos los anteriores
function graficaLinea(etiquetas, valores, unidad, tendencia, marcarRecords) {
  if (valores.length < 2) return '<p class="muted">Necesitas al menos 2 registros para ver la gráfica.</p>';
  const W = 340, H = 170, mx = 36, mt = 14, mb = 26;
  const todos = tendencia ? valores.concat(tendencia) : valores;
  let min = Math.min.apply(null, todos), max = Math.max.apply(null, todos);
  if (max === min) { max += 1; min -= 1; }
  const pad = (max - min) * 0.1; max += pad; min -= pad;
  function x(i) { return mx + i * (W - mx - 10) / (valores.length - 1); }
  function y(v) { return mt + (max - v) * (H - mt - mb) / (max - min); }
  let pts = "";
  valores.forEach(function (v, i) { pts += x(i).toFixed(1) + "," + y(v).toFixed(1) + " "; });
  let s = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Gráfica de ' + valores.length + ' registros, de ' + (Math.round(valores[0] * 10) / 10) + ' a ' + (Math.round(valores[valores.length - 1] * 10) / 10) + ' ' + unidad + '">';
  for (let k = 0; k <= 2; k++) {
    const v = min + (max - min) * k / 2;
    s += '<line x1="' + mx + '" x2="' + (W - 10) + '" y1="' + y(v) + '" y2="' + y(v) + '" stroke="var(--line)"/>' +
      '<text x="' + (mx - 6) + '" y="' + (y(v) + 4) + '" text-anchor="end" font-size="10" fill="var(--muted)">' + numeroEje(v, max - min) + '</text>';
  }
  const idG = "graf" + (++contadorGrafica);
  s += '<defs><linearGradient id="' + idG + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".42"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>' +
    '<polygon class="graf-area" points="' + x(0) + ',' + (H - mb) + ' ' + pts + x(valores.length - 1) + ',' + (H - mb) + '" fill="url(#' + idG + ')"/>' +
    '<polyline class="graf-linea" pathLength="1" points="' + pts + '" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>';
  if (tendencia) {
    let ptsT = "";
    tendencia.forEach(function (v, i) { ptsT += x(i).toFixed(1) + "," + y(v).toFixed(1) + " "; });
    s += '<polyline points="' + ptsT + '" fill="none" stroke="var(--good)" stroke-width="2" stroke-dasharray="5 4" stroke-linejoin="round"/>';
  }
  let maximo = -Infinity;
  valores.forEach(function (v, i) {
    const ult = i === valores.length - 1;
    const record = !!marcarRecords && i > 0 && v > maximo;
    if (v > maximo) maximo = v;
    if (record) s += '<circle cx="' + x(i) + '" cy="' + y(v) + '" r="8" fill="var(--oro)" fill-opacity=".25"/>';
    s += '<circle cx="' + x(i) + '" cy="' + y(v) + '" r="' + (ult || record ? 5 : 3) + '" fill="' + (record ? "var(--oro)" : (ult ? "var(--pr)" : "var(--accent)")) + '"><title>' + etiquetas[i] + ': ' + (Math.round(v * 10) / 10) + ' ' + unidad + '</title></circle>';
  });
  s += '<text x="' + mx + '" y="' + (H - 6) + '" font-size="10" fill="var(--muted)">' + etiquetas[0] + '</text>' +
    '<text x="' + (W - 10) + '" y="' + (H - 6) + '" font-size="10" text-anchor="end" fill="var(--muted)">' + etiquetas[etiquetas.length - 1] + '</text>' +
    '<text x="' + (W - 10) + '" y="' + (y(valores[valores.length - 1]) - 10) + '" font-size="11" font-weight="700" text-anchor="end" fill="var(--fg)">' + (Math.round(valores[valores.length - 1] * 10) / 10).toLocaleString(localeApp()) + ' ' + unidad + '</text>';
  return s + '</svg>';
}

function graficaBarras(etiquetas, valores, unidad) {
  if (valores.length === 0 || Math.max.apply(null, valores) === 0) return '<p class="muted">Todavía no hay datos en este periodo.</p>';
  const W = 340, H = 160, mb = 24, mt = 18;
  const max = Math.max.apply(null, valores);
  const ancho = (W - 10) / valores.length;
  let s = '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Gráfica de barras de ' + valores.length + ' semanas, máximo ' + miles(max) + ' ' + unidad + '"><line x1="0" x2="' + W + '" y1="' + (H - mb) + '" y2="' + (H - mb) + '" stroke="var(--line)"/>';
  valores.forEach(function (v, i) {
    const h = v / max * (H - mb - mt);
    const bx = 5 + i * ancho + ancho * 0.18;
    const ult = i === valores.length - 1;
    s += '<rect x="' + bx + '" y="' + (H - mb - h) + '" width="' + (ancho * 0.64) + '" height="' + h + '" rx="3" fill="var(--accent)" fill-opacity="' + (ult ? 1 : 0.55) + '"><title>' + etiquetas[i] + ': ' + miles(v) + ' ' + unidad + '</title></rect>';
    if (valores.length <= 12) s += '<text x="' + (bx + ancho * 0.32) + '" y="' + (H - 8) + '" font-size="9" text-anchor="middle" fill="var(--muted)">' + etiquetas[i] + '</text>';
  });
  s += '<text x="' + W + '" y="11" font-size="10" text-anchor="end" fill="var(--muted)">máx. ' + miles(max) + ' ' + unidad + '</text>';
  return s + '</svg>';
}

// =====================================================
// BIENVENIDA Y CONFIGURACIÓN INICIAL
// =====================================================

function pintarBienvenida() {
  $("tabs").hidden = true;
  const VENTAJAS = [
    ["📋", "Rutina hecha para ti", "Según tus días, tu tiempo y lo que hay en tu gimnasio. La cambias cuando quieras."],
    ["📈", "Sabes cuándo subir peso", "Te dice cuándo toca subir, mantener o bajar, con tus series reales."],
    ["🏆", "Rangos por músculo", "De Hierro a Apex: ves qué músculos van bien y cuáles flojean."],
    ["🎓", "Aprende la técnica", "Cada ejercicio con fotos, animación y los errores típicos."]
  ];
  let v = "";
  for (const x of VENTAJAS) v += '<div class="ventaja"><span class="ventaja-ico" aria-hidden="true">' + x[0] + '</span><div><h3>' + x[1] + '</h3><p class="muted small">' + x[2] + '</p></div></div>';
  $("app").innerHTML =
    '<div class="welcome">' +
      insignia(8, "logo") +
      '<div><h1>Apix Gym</h1><p class="muted" style="font-size:1rem;margin-top:6px">Registra tus entrenos, sigue tu progreso y sube de rango con datos reales.</p></div>' +
      '<div class="ventajas">' + v + '</div>' +
      '<button class="btn" data-act="ir-registro">Crear mi perfil</button>' +
      '<button class="btn-sec full" data-act="abrir-cuenta" data-a="entrar">☁️ Ya tengo cuenta: iniciar sesión</button>' +
      '<button class="btn-txt" data-act="usar-demo">Entrar como invitado</button>' +
      '<a class="muted small" href="privacidad.html">Privacidad y condiciones de uso</a>' +
      selectorIdioma() +
    '</div>';
}

// Botones para elegir idioma (los nombres van en su propio idioma, sin traducir)
function selectorIdioma() {
  let h = '<div class="chips idiomas" data-no-traducir role="group" aria-label="Idioma / Language">';
  for (const k in IDIOMAS) h += '<button class="chip' + (k === IDIOMA_ACTUAL ? " on" : "") + '" data-act="idioma" data-a="' + k + '" lang="' + k + '">' + IDIOMAS[k] + '</button>';
  return h + '</div>';
}

function opciones(lista, actual) {
  let h = "";
  for (const par of lista) h += '<option value="' + par[0] + '"' + (String(par[0]) === String(actual) ? " selected" : "") + '>' + par[1] + '</option>';
  return h;
}

const OP_EXPERIENCIA = [["principiante", "Principiante (menos de 1 año)"], ["intermedio", "Intermedio (1-3 años)"], ["avanzado", "Avanzado (más de 3 años)"]];
const OP_OBJETIVO = [["masa", "Ganar masa muscular"], ["fuerza", "Mejorar la fuerza"], ["condicion", "Mejorar la condición física"], ["activo", "Mantenerse activo"]];
const OP_SEXO = [["", "Elige una opción"], ["hombre", "Hombre"], ["mujer", "Mujer"], ["nd", "Prefiero no decirlo"]];
const OP_LUGAR = [["gimnasio", "Gimnasio"], ["casa", "Casa"], ["calistenia", "Calistenia"]];
const OP_DIAS = [[1, "1 día"], [2, "2 días"], [3, "3 días"], [4, "4 días"], [5, "5 días"], [6, "6 días"]];
const OP_DURACION = [[30, "30 min"], [45, "45 min"], [60, "60 min"], [90, "90 min"]];

// Formulario de perfil (sirve para el registro y para Ajustes)
function formPerfil(p) {
  let eq = "";
  for (const k in EQUIPOS) eq += '<label class="check"><input type="checkbox" name="equipo" value="' + k + '"' + (p.equipo.includes(k) ? " checked" : "") + '>' + EQUIPOS[k] + '</label>';
  return '' +
    '<div class="grid2">' +
      '<label class="f">Nombre<input id="fNombre" value="' + esc(p.nombre) + '" maxlength="30" autocomplete="given-name"></label>' +
      '<label class="f">Usuario<input id="fUsuario" value="' + esc(p.usuario) + '" maxlength="24" placeholder="tu.usuario"></label>' +
    '</div>' +
    '<label class="f">Sexo<select id="fSexo">' + opciones(OP_SEXO, p.sexo || "") + '</select></label>' +
    '<p class="muted small" style="margin-top:-6px">Solo se usa para ajustar los rangos de fuerza. Nunca se muestra a otros usuarios.</p>' +
    '<div class="grid3">' +
      '<label class="f">Edad<input id="fEdad" type="number" inputmode="numeric" value="' + esc(p.edad) + '"></label>' +
      '<label class="f">Altura (cm)<input id="fAltura" type="number" inputmode="numeric" placeholder="Ej.: 175" value="' + esc(p.altura) + '"></label>' +
      '<label class="f">Peso (kg)<input id="fPeso" type="number" inputmode="decimal" step="0.1" value="' + esc(p.peso) + '"></label>' +
    '</div>' +
    '<label class="f">Experiencia<select id="fExperiencia">' + opciones(OP_EXPERIENCIA, p.experiencia) + '</select></label>' +
    '<label class="f">Objetivo principal<select id="fObjetivo">' + opciones(OP_OBJETIVO, p.objetivo) + '</select></label>' +
    '<div class="grid2">' +
      '<label class="f">Días por semana<select id="fDias">' + opciones(OP_DIAS, p.dias) + '</select></label>' +
      '<label class="f">Duración<select id="fDuracion">' + opciones(OP_DURACION, p.duracion) + '</select></label>' +
    '</div>' +
    '<label class="f">Dónde entrenas<select id="fLugar" data-cambio="lugar">' + opciones(OP_LUGAR, p.lugar) + '</select></label>' +
    '<div class="stack tight"><span class="label">Equipamiento disponible</span><div class="grid2" id="fEquipo">' + eq + '</div></div>' +
    '<label class="f">Ejercicios que prefieres evitar (opcional)<input id="fEvitar" value="' + esc(p.evitar) + '" placeholder="Ej.: sentadilla"></label>' +
    '<label class="f">Lesiones o limitaciones (opcional)<textarea id="fLesiones" placeholder="Solo como recordatorio para ti">' + esc(p.lesiones) + '</textarea></label>' +
    '<p class="muted small">La app no hace diagnósticos. Si tienes dolor o una lesión, consulta con un profesional sanitario.</p>' +
    '<p class="err" id="fError"></p>';
}

// Lee y valida el formulario. Devuelve el perfil o null si hay errores.
function leerPerfil() {
  const equipo = [];
  for (const c of document.querySelectorAll('input[name="equipo"]:checked')) equipo.push(c.value);
  const p = {
    nombre: $("fNombre").value.trim(),
    usuario: $("fUsuario").value.trim().toLowerCase().replace(/[^a-z0-9._]/g, ""),
    sexo: $("fSexo").value,
    edad: parseInt($("fEdad").value), altura: parseInt($("fAltura").value), peso: parseFloat($("fPeso").value),
    experiencia: $("fExperiencia").value, objetivo: $("fObjetivo").value,
    dias: parseInt($("fDias").value), duracion: parseInt($("fDuracion").value), lugar: $("fLugar").value,
    equipo: equipo, evitar: $("fEvitar").value.trim(), lesiones: $("fLesiones").value.trim()
  };
  // Cada comprobación dice qué casilla está mal, para llevar a la persona hasta ella
  let error = "", campo = "";
  if (!p.nombre) { error = "Escribe tu nombre."; campo = "fNombre"; }
  else if (!p.usuario || p.usuario.length < 3) { error = "El usuario necesita al menos 3 letras o números."; campo = "fUsuario"; }
  else if (p.usuario.length > 20) { error = "El usuario puede tener como máximo 20 caracteres."; campo = "fUsuario"; }
  else if (!p.sexo) { error = "Elige una opción en Sexo (puedes elegir «Prefiero no decirlo»)."; campo = "fSexo"; }
  else if (!(p.edad >= 14 && p.edad <= 90)) { error = "La edad debe estar entre 14 y 90 años."; campo = "fEdad"; }
  else if (!(p.altura >= 120 && p.altura <= 230)) { error = "Escribe la altura en centímetros y sin comas (por ejemplo, 175)."; campo = "fAltura"; }
  else if (!(p.peso >= 35 && p.peso <= 250)) { error = "El peso debe estar entre 35 y 250 kg."; campo = "fPeso"; }
  else if (p.equipo.length === 0) { error = "Marca al menos un tipo de equipamiento."; campo = "fEquipo"; }
  for (const mal of document.querySelectorAll(".campo-mal")) mal.classList.remove("campo-mal");
  if (campo && $(campo)) {
    $(campo).classList.add("campo-mal");
    $(campo).scrollIntoView({ block: "center", behavior: "smooth" });
    if ($(campo).focus && campo !== "fEquipo") $(campo).focus({ preventScroll: true });
  }
  $("fError").textContent = error;
  return error ? null : p;
}

function pintarRegistro() {
  $("tabs").hidden = true;
  const vacio = { nombre: "", usuario: "", sexo: "", edad: "", altura: "", peso: "", experiencia: "principiante", objetivo: "masa",
    dias: 3, duracion: 60, lugar: "gimnasio", equipo: ["barra", "mancuernas", "maquina", "polea", "corporal"], evitar: "", lesiones: "" };
  $("app").innerHTML = '<div class="stack" style="padding-top:8px">' +
    '<div><p class="label">Paso 1 de 1</p><h1>Tu perfil</h1><p class="muted" style="margin-top:6px">Con estos datos creamos tu primera rutina. Puedes cambiarlos cuando quieras.</p></div>' +
    '<div class="card stack tight"><label class="f">🌐 Idioma · Language · Langue<select id="fIdioma" data-no-traducir>' +
      Object.keys(IDIOMAS).map(function (k) { return '<option value="' + k + '"' + (k === IDIOMA_ACTUAL ? " selected" : "") + '>' + IDIOMAS[k] + '</option>'; }).join("") +
      '</select></label><p class="muted small">Puedes cambiarlo cuando quieras en Ajustes.</p></div>' +
    '<div class="card stack">' + formPerfil(vacio) + '</div>' +
    '<label class="check priv-ok"><input type="checkbox" id="fPrivacidad"><span>He leído y acepto la <a href="privacidad.html" target="_blank" rel="noopener">política de privacidad y las condiciones</a>. Tengo 14 años o más.</span></label>' +
    '<p class="err" id="fPrivError"></p>' +
    '<button class="btn" data-act="crear-perfil">Crear perfil y rutina</button>' +
    '<button class="btn-txt" data-act="volver-bienvenida">Volver</button></div>';
}

// =====================================================
// PANTALLA: INICIO
// =====================================================

function pintarInicio() {
  const p = estado.perfil;
  const semana = sesionesPorSemana()[lunesDe(hoy())] || 0;
  const pg = puntosGlobal();
  const rg = pg === null ? null : rangoDePuntos(pg);
  const ultima = estado.sesiones[estado.sesiones.length - 1];

  let h = '<div class="head"><div class="grow"><p class="label">' + new Date().toLocaleDateString(localeApp(), { weekday: "long", day: "numeric", month: "long" }) + '</p>' +
    '<h1>Hola, ' + esc(p.nombre) + '</h1></div>' +
    '<button class="avatar" data-act="abrir-ajustes" aria-label="Perfil y ajustes">' + esc(p.nombre[0] || "?").toUpperCase() + '<span class="engranaje" aria-hidden="true">⚙</span></button></div>';

  if (erroresCarga.length) h += '<div class="card" style="margin-bottom:14px;border-color:var(--warn)"><p class="small"><b>Tus datos tienen algún valor incorrecto</b> (' + esc(erroresCarga[0]) + '). Se han cargado igualmente. Revisa tu perfil en Ajustes y exporta una copia.</p></div>';
  if (recuperadoDeCopia) h += '<div class="card" style="margin-bottom:14px;border-color:var(--warn)"><p class="small"><b>Se recuperaron tus datos de la copia de seguridad</b> porque el archivo principal estaba dañado.</p></div>';
  if (estado.modo === "demo") h += '<div class="row between" style="margin-bottom:14px"><span class="demo-tag">Datos de ejemplo</span><button class="btn-txt small" data-act="salir-demo">Crear mi perfil</button></div>';

  h += '<div class="stack">';

  // Aviso: sin cuenta, los entrenos solo están en este móvil (cada 14 días)
  if (necesitaCopia()) {
    const n = sesionesValidas().length;
    h += '<div class="card copia-aviso stack tight"><div class="row" style="gap:10px"><span style="font-size:1.6rem">☁️</span><div class="grow"><h3>' + (n === 1 ? "Tu entreno solo está en este móvil" : "Tus " + n + " entrenos solo están en este móvil") + '</h3>' +
      '<p class="muted small">Si pierdes el móvil o se borran los datos del navegador, se pierden. Crea una cuenta gratis y se guardan solos en la nube.</p></div></div>' +
      '<button class="btn" data-act="abrir-cuenta" data-a="crear">Crear cuenta gratis</button>' +
      '<div class="grid2"><button class="btn-sec" data-act="posponer-copia">Ahora no</button><button class="btn-sec" data-act="hacer-copia">💾 Solo una copia</button></div></div>';
  }

  // Apix, la mascota
  const apix = estadoMascota();
  if (apix) {
    h += '<div class="apix-card apix-tono-' + apix.humor + '"><button class="apix-boton" data-act="tocar-apix" data-a="' + apix.humor + '" aria-label="Tocar a Apix">' + apixSVG(apix.humor) + '</button>' +
      '<div class="bocadillo"><p class="label">Apix</p><p>' + esc(apix.mensaje) + '</p>' +
      (apix.accion === "ver-retos" ? '<button class="btn-txt small" data-act="ir-retos">Ver mi reto →</button>' : (apix.accion === "nuevo-reto" ? '<button class="btn-txt small" data-act="nuevo-reto">Crear un reto →</button>' : "")) +
      ((apix.humor === "anima" || apix.humor === "enfadado") && estado.rutina && !estado.activa ? '<button class="btn-txt small" data-act="empezar-dia" data-a="' + indiceSiguienteDia() + '">Vamos a entrenar →</button>' : "") +
      '</div></div>';
  }

  // Entreno en curso o entreno de hoy
  if (estado.activa) {
    h += '<div class="card hero stack tight"><p class="label" style="color:var(--accent)">Entreno en curso</p><h2>' + esc(estado.activa.diaNombre) + '</h2>' +
      '<button class="btn" data-tab="entrenar">Continuar entreno</button></div>';
  } else if (!estado.rutina) {
    h += '<div class="card hero stack tight"><p class="label" style="color:var(--accent)">Sin rutina</p><h2>Crea tu rutina</h2><p class="muted">Te proponemos una según tu objetivo, días y equipamiento.</p>' +
      '<button class="btn" data-act="abrir-generador">Crear rutina</button></div>';
  } else {
    const idx = indiceSiguienteDia();
    const dia = estado.rutina.dias[idx];
    const cal = diasDeEntreno();
    const hoyN = (new Date().getDay() + 6) % 7;
    const descanso = cal.length > 0 && !cal.includes(hoyN);
    let proximo = "";
    if (descanso) { for (let k = 1; k <= 7; k++) { const d = (hoyN + k) % 7; if (cal.includes(d)) { proximo = NOMBRES_DIAS_SEMANA[d].toLowerCase(); break; } } }
    h += '<div class="card hero stack tight"><div class="row between"><p class="label" style="color:var(--accent)">' + (descanso ? "Hoy toca descanso · próximo: " + proximo : "Entreno de hoy") + '</p><span class="muted small">' + dia.ejercicios.length + ' ejercicios</span></div>' +
      '<h2>' + esc(dia.nombre) + '</h2>' + fotosDelDia(dia) +
      '<button class="' + (descanso ? "btn-sec full" : "btn") + '" data-act="empezar-dia" data-a="' + idx + '">' + (descanso ? "Entrenar igualmente" : "Empezar entrenamiento") + '</button></div>';

    // Siguiente paso recomendado (primer ejercicio del día)
    if (dia.ejercicios.length > 0) {
      const o = dia.ejercicios[0];
      const rec = recomendar(o.id, o);
      h += '<div class="card row" style="align-items:flex-start"><span style="color:var(--accent);width:22px;flex:none;margin-top:2px">' + I.rayo + '</span>' +
        '<div class="grow stack tight"><p class="label">Siguiente paso · ' + esc(buscarEj(o.id).nombre) + '</p><p>' + esc(rec.motivo) + '</p></div></div>';
    }
  }

  // Racha y rango
  let semanaHtml = "";
  const hoyNum = (new Date().getDay() + 6) % 7;
  const fechas = estado.sesiones.map(function (s) { return s.fecha; });
  // Iniciales de los días según el idioma (lunes primero)
  const iniciales = { es: "LMXJVSD", en: "MTWTFSS", fr: "LMMJVSD", ary: "ثثرخجسح" }[typeof IDIOMA_ACTUAL !== "undefined" ? IDIOMA_ACTUAL : "es"] || "LMXJVSD";
  iniciales.split("").forEach(function (l, i) {
    const f = fechaTexto(hoyNum - i);
    const on = fechas.includes(f);
    semanaHtml += '<div>' + l + '<i class="' + (on ? "on" : "") + (i === hoyNum ? " today" : "") + '">' + (on ? '<span style="color:var(--on-accent)">' + I.check + '</span>' : "") + '</i></div>';
  });
  // Una sola tarjeta: racha, anillo de la semana, días y rango global
  h += '<div class="card stack tight"><div class="row between"><div><p class="label">Racha de constancia</p>' +
    '<div class="row" style="gap:6px;align-items:baseline"><span class="big-num num" style="color:var(--fire)">' + rachaSemanas() + '</span><span class="muted">semanas</span></div>' +
    '<p class="muted small">Una semana cuenta si entrenas al menos ' + minimoSemanal() + ' días.</p></div>' +
    anilloSemana(semana, p.dias) + '</div>' +
    '<div class="week">' + semanaHtml + '</div>' +
    '<button class="row rango-fila" data-tab="rangos" style="text-align:left">' + insignia(rg, "") +
    '<div class="grow stack tight"><div class="row between"><p class="label">Rango global</p><span class="muted small">' +
      (pg === null ? "" : (rg < RANGOS.length - 1 ? progresoRango(pg) + "% hacia " + RANGOS[rg + 1].nombre : "Rango máximo")) + '</span></div><h3>' + nombreRango(rg) + '</h3>' +
    (pg === null ? '<p class="muted small">Completa un entreno para conseguir rango.</p>' : '<div class="bar"><i style="width:' + progresoRango(pg) + '%"></i></div>') + '</div></button></div>';

  // Próximo ascenso: el objetivo más cercano para subir de rango
  const prox = proximoAscenso();
  if (prox) {
    h += '<button class="card row" data-act="ver-rango-ej" data-a="' + prox.id + '" style="text-align:left">' + insignia(prox.rango, "sm") +
      '<div class="grow stack tight"><p class="label" style="color:' + RANGOS[prox.rango].color + '">Próximo ascenso · ' + RANGOS[prox.rango].nombre + '</p>' +
      '<p><b>' + esc(buscarEj(prox.id).nombre) + '</b>: ' + (prox.peso > 0 ? kg(prox.peso) + ' × ' + prox.reps : prox.reps + ' reps') + '</p>' +
      '<p class="muted small">Te falta un ' + Math.max(1, Math.round(prox.falta * 100)) + ' % de fuerza en este ejercicio.</p></div></button>';
  }

  // Logros: cuántos llevas y cuál es el siguiente
  h += logrosInicioHtml();

  // Datos rápidos
  const pesoC = estado.pesoCorporal.length ? estado.pesoCorporal[estado.pesoCorporal.length - 1].kg : null;
  const hace4 = puntosGlobal(fechaTexto(28));
  let fuerza = "—";
  if (pg !== null && hace4 !== null) { const d = pg - hace4; fuerza = (d >= 0 ? "+" : "") + d.toFixed(1); }
  h += '<div class="grid3">' +
    '<div class="card"><p class="label">Peso</p><div class="big-num num">' + (pesoC ? numero(pesoVista(pesoC)) : "—") + '</div><p class="muted small">' + unidadPeso() + '</p></div>' +
    '<div class="card"><p class="label">Fuerza</p><div class="big-num num">' + fuerza + '</div><p class="muted small">pts · 4 sem</p></div>' +
    '<div class="card"><p class="label">Entrenos</p><div class="big-num num">' + estado.sesiones.length + '</div><p class="muted small">en total</p></div>' +
  '</div>';

  // Último entreno y récords recientes, en una sola tarjeta
  const prs = [];
  for (let i = estado.sesiones.length - 1; i >= 0 && prs.length < 3; i--) {
    for (const id of estado.sesiones[i].prs) if (prs.length < 3) prs.push({ id: id, fecha: estado.sesiones[i].fecha, s: estado.sesiones[i] });
  }
  if (ultima) {
    h += '<div class="card stack tight"><button class="stack tight" data-act="ver-sesion" data-a="' + ultima.id + '" style="text-align:left;width:100%;padding:0"><div class="row between"><p class="label">Último entreno</p><span class="muted small">' + fechaBonita(ultima.fecha) + '</span></div>' +
      '<h3>' + esc(ultima.diaNombre) + '</h3><p class="muted num">' + ultima.duracion + ' min · ' + ultima.seriesEfectivas + ' series efectivas' +
      (ultima.prs.length ? ' · <span style="color:var(--pr);font-weight:700">' + ultima.prs.length + ' récord' + (ultima.prs.length > 1 ? "s" : "") + '</span>' : "") + '</p></button>';
    if (prs.length) {
      h += '<div class="row between" style="border-top:1px solid var(--line);padding-top:10px"><p class="label">Récords recientes</p><button class="btn-txt small" data-tab="progreso">Ver progreso</button></div><div class="list">';
      for (const r of prs) {
        const e = r.s.ejercicios.find(function (x) { return x.id === r.id; });
        const mejor = e.series.filter(function (x) { return x.hecha; }).sort(function (a, b) { return unaRM(b.peso, b.reps) - unaRM(a.peso, a.reps); })[0];
        h += '<div class="item" style="padding:7px 0"><div class="grow"><span class="name small">' + esc(buscarEj(r.id).nombre) + '</span><span class="muted small num">' + numero(pesoVista(mejor.peso)) + ' ' + unidadPeso() + ' × ' + mejor.reps + ' · ' + fechaBonita(r.fecha) + '</span></div><span class="pill pr">Récord</span></div>';
      }
      h += '</div>';
    }
    h += '</div>';
  }

  // Amigos: los tuyos (con su tarjeta) y, en la demo, su actividad
  const reales = (estado.social.amigosReales || []).slice().sort(function (x, y) { return y.racha - x.racha; }).slice(0, 3);
  const posts = feedVisible().filter(function (x) { return x.autorId !== miId(); }).slice(0, 2);
  h += '<div class="card"><div class="row between"><h3>Amigos</h3><button class="btn-txt small" data-act="ir-amigos">' + (reales.length ? "Ver todos" : "Invitar") + '</button></div>';
  if (reales.length) {
    h += '<div class="list">' + reales.map(function (a) {
      return '<div class="item">' + insignia(a.rango, "sm") + '<div class="grow"><span class="name small">@' + esc(a.usuario) + '</span><span class="muted small">' + nombreRango(a.rango) + ' · racha ' + a.racha + ' sem</span></div></div>';
    }).join("") + '</div>';
  }
  if (posts.length === 0 && !reales.length) h += '<p class="muted small" style="padding-top:6px">Invita a tus amigos y compara rango y racha.</p>';
  else if (posts.length) {
    h += '<div class="list">';
    for (const x of posts) h += '<div class="item"><div class="avatar" style="width:32px;height:32px;font-size:.85rem">' + esc(nombreDe(x.autorId, x.autorNombre)[0]).toUpperCase() + '</div><div class="grow"><span class="name small">@' + esc(nombreDe(x.autorId, x.autorNombre)) + '</span><span class="muted small">' + esc(x.texto) + '</span></div></div>';
    h += '</div>';
  }
  h += '</div></div>';
  $("app").innerHTML = h;
}

// =====================================================
// PANTALLA: ENTRENAR
// =====================================================

function pintarEntrenar() {
  if (estado.activa) { pintarSesion(); return; }
  let h = '<div class="head"><div><p class="label">Tu plan</p><h1>Entrenar</h1></div>' +
    '<button class="avatar" data-act="abrir-ajustes" aria-label="Perfil y ajustes">' + esc(estado.perfil.nombre[0] || "?").toUpperCase() + '<span class="engranaje" aria-hidden="true">⚙</span></button></div><div class="stack">';

  // Sin rutina: arriba las tarjetas grandes para crear una.
  // Con rutina: primero tu rutina (lo que usas cada día) y las herramientas debajo, más pequeñas.
  if (!estado.rutina) {
    h += '<div class="grid2 acciones-entreno"><button class="accion-grande" data-act="abrir-generador"><span class="ico">✨</span><b>' + (estado.rutina ? "Nueva rutina" : "Generar rutina") + '</b><span class="muted small">En 3 pasos, a tu medida</span></button>' +
      '<button class="accion-grande" data-act="empezar-libre"><span class="ico">⚡</span><b>Entreno libre</b><span class="muted small">Eliges sobre la marcha</span></button></div>' +
      '<button class="accion-grande fila" data-act="abrir-famosas"><span class="ico">🏆</span><span><b>Rutinas famosas</b><span class="muted small" style="display:block">5×5, PPL, torso-pierna… listas para usar</span></span></button>' +
      '<div class="grid2"><button class="btn-sec small" data-act="abrir-biblioteca">Ejercicios</button><button class="btn-sec small" data-act="abrir-gimnasio">Mi gimnasio</button></div>';
  }

  if (!estado.rutina) {
    h += '<div class="card stack tight" style="text-align:center;padding:24px 16px"><h2>Aún no tienes rutina</h2><p class="muted">Créala en 3 pasos o entrena libre.</p><button class="btn" data-act="abrir-generador">Crear mi rutina</button></div>';
  } else {
    const sig = indiceSiguienteDia();
    const sug = sugerenciasRutina();
    if (sug.length) {
      h += '<div class="card stack tight"><p class="label" style="color:var(--accent)">Ajustes recomendados</p><p class="muted small">Basados en tu historial. Tú decides si aplicarlos.</p>';
      sug.forEach(function (x, i) {
        h += '<div class="stack tight" style="padding:10px 0;border-top:1px solid var(--line)"><p><b>' + esc(x.texto) + '</b></p><p class="muted small">' + esc(x.motivo) + '</p>' +
          (x.aplicar ? '<button class="btn-sec" data-act="aplicar-sugerencia" data-a="' + i + '">' + esc(x.boton) + '</button>' : "") + '</div>';
      });
      h += '</div>';
    }
    if (mensajeSugerencia) { h += '<div class="card" style="border-color:var(--good)"><p class="small"><b>Cambio aplicado:</b> ' + esc(mensajeSugerencia) + '</p></div>'; mensajeSugerencia = ""; }
    const fd = factorDuracion();
    h += '<div class="row between"><h2>' + esc(estado.rutina.nombre) + '</h2><span class="muted small">' + estado.rutina.dias.length + ' días</span></div>';
    h += miSemanaHtml();
    estado.rutina.dias.forEach(function (d, i) {
      const reales = sesionesValidas().filter(function (s) { return s.diaIndex === i && s.diaNombre === d.nombre; });
      const media = reales.length ? Math.round(reales.reduce(function (t, s) { return t + s.duracion; }, 0) / reales.length) : 0;
      // El día de la semana solo se pone si tus días cuadran con los de la rutina; si no, se van turnando
      const diaSemana = semanaCuadraConRutina() && diasDeEntreno()[i] !== undefined ? NOMBRES_DIAS_SEMANA[diasDeEntreno()[i]] + " · " : "";
      const etiqueta = diaSemana + '~' + duracionDia(d, fd) + ' min' + (media ? ' (real: ' + media + ')' : "");
      let lista = '<div class="list">';
      for (const o of d.ejercicios) {
        lista += '<div class="item" style="padding:7px 0"><span class="grow small">' + esc(buscarEj(o.id).nombre) + '</span><span class="muted small num">' + o.series + ' × ' + o.repMin + '-' + o.repMax + '</span></div>';
      }
      if (d.ejercicios.length === 0) lista += '<p class="muted small">Sin ejercicios. Pulsa Editar para añadir.</p>';
      lista += '</div>';
      const botones = '<div class="grid2"><button class="btn-sec" data-act="editar-dia" data-a="' + i + '">Editar</button><button class="btn' + (i === sig ? "" : "-sec") + '" data-act="empezar-dia" data-a="' + i + '"' + (d.ejercicios.length ? "" : " disabled") + '>Empezar</button></div>';
      if (i === sig) {
        // El día que toca: abierto y destacado
        h += '<div class="card stack tight hero"><div class="row between"><div><p class="label">' + etiqueta + '</p><h3>' + esc(d.nombre) + '</h3></div><span class="pill up">Siguiente</span></div>' + lista + botones + '</div>';
      } else {
        // Los demás días: plegados (se abren al tocarlos) para llegar antes al que toca
        h += '<details class="card dia-plegado"><summary><div class="grow"><p class="label">' + etiqueta + '</p><h3>' + esc(d.nombre) + '</h3></div><span class="muted small">' + d.ejercicios.length + ' ejercicios</span><span class="flecha" aria-hidden="true">▾</span></summary><div class="stack tight" style="margin-top:10px">' + lista + botones + '</div></details>';
      }
    });
    h += '<button class="btn-txt" data-act="anadir-dia">+ Añadir día</button>';
    // Herramientas: debajo de la rutina
    h += '<p class="label" style="margin-top:6px">Más opciones</p>' +
      '<div class="grid2"><button class="btn-sec small" data-act="empezar-libre">⚡ Entreno libre</button><button class="btn-sec small" data-act="abrir-generador">✨ Nueva rutina</button></div>' +
      '<div class="grid2"><button class="btn-sec small" data-act="abrir-famosas">🏆 Rutinas famosas</button><button class="btn-sec small" data-act="abrir-biblioteca">Ejercicios</button></div>' +
      '<button class="btn-sec small full" data-act="abrir-gimnasio">Mi gimnasio</button>';
  }
  $("app").innerHTML = h + '</div>';
}

// ---------- Sesión en curso ----------
// Un ejercicio a la vez: arriba el progreso y los ejercicios para saltar, en el centro la serie actual en grande.
let serieMarcada = "";          // "ei-si" de la última serie completada (para su animación)
let mensajeEntreno = "";        // frase corta de Apix durante el entreno

function numero(n) { return String(n).replace(".", ","); }
const ETIQUETA_TIPO = { drop: "↓", rp: "⏸" };

// Tiempo desde que empezó el entreno: 12:34 (o 1:05:20 si pasa de una hora)
// ---------- Guía: cómo registrar tus series ----------
// Se muestra la primera vez que entrenas (y siempre que pulses «¿Cómo se apunta?»).
// Cada paso resalta una parte de la pantalla y explica para qué sirve.
let pasoGuia = -1;
function pasosGuia() {
  const a = estado.activa;
  const ej = buscarEj(a.ejercicios[ejercicioActual()].id);
  return [
    { sel: ".tabla-series", titulo: "Tu tabla de series", texto: "Cada fila es una serie. Apuntas lo que haces de verdad, serie a serie." },
    { sel: ".ts-fila.foco input[data-in='peso']", titulo: "Kg: el peso", texto: comoApuntar(ej).largo },
    { sel: ".ts-fila.foco input[data-in='reps']", titulo: "Reps: las repeticiones", texto: "Escribe las que has hecho bien, con buena técnica. Si te salen menos de las planeadas, apunta las reales: así la app te propone el peso justo." },
    { sel: ".ts-fila.foco .previa", titulo: "Previa: la última vez", texto: "Lo que hiciste en esta serie el último día. Tócalo para copiarlo y después intenta superarlo." },
    { sel: ".ajuste-rapido", titulo: "Ajuste rápido", texto: "Botones grandes para subir o bajar el peso y las reps sin escribir (útil con las manos sudadas)." },
    { sel: ".ts-fila.foco .tick", titulo: "✓ Completar la serie", texto: "Púlsalo al acabar la serie. Se guarda, empieza el descanso y la app pasa sola a la siguiente." },
    { sel: ".anadir-serie", titulo: "¿Haces una serie más?", texto: "Añádela aquí. Al terminar todo el entreno, pulsa «Terminar» arriba." }
  ];
}
function mostrarGuia(paso) {
  document.querySelectorAll(".guia-resalta").forEach(function (x) { x.classList.remove("guia-resalta"); });
  const pasos = pasosGuia();
  if (paso < 0 || paso >= pasos.length) { $("guia").hidden = true; pasoGuia = -1; return; }
  pasoGuia = paso;
  const p = pasos[paso];
  const el = document.querySelector(p.sel);
  if (el) { el.classList.add("guia-resalta"); el.scrollIntoView({ behavior: "smooth", block: "center" }); }
  $("guia").innerHTML = '<div class="guia-caja"><p class="label">Cómo registrar · ' + (paso + 1) + ' de ' + pasos.length + '</p><h3>' + p.titulo + '</h3><p class="small">' + esc(p.texto) + '</p>' +
    '<div class="row between" style="margin-top:10px"><button class="btn-txt small" data-act="guia-saltar">Saltar guía</button>' +
    '<button class="btn auto" data-act="guia-siguiente">' + (paso === pasos.length - 1 ? "¡Entendido!" : "Siguiente →") + '</button></div></div>';
  $("guia").hidden = false;
}

// Fotos pequeñas de los ejercicios del día (si alguno no tiene foto, sale su número)
function fotosDelDia(dia) {
  if (!dia.ejercicios.length) return '<p class="muted small">Sin ejercicios. Añádelos en Entrenar.</p>';
  let h = '<div class="fotos-dia">';
  dia.ejercicios.forEach(function (o, i) {
    const f = fotosDe(o.id);
    const nombre = esc(buscarEj(o.id).nombre);
    h += '<button class="foto-dia" data-act="info-ej" data-a="' + o.id + '" aria-label="' + nombre + '">' +
      (f ? '<img src="' + f[0] + '" alt="" loading="lazy" decoding="async">' : '<span class="num">' + (i + 1) + '</span>') + '</button>';
  });
  const primero = buscarEj(dia.ejercicios[0].id).nombre;
  return h + '</div><p class="muted small">' + esc(primero) + (dia.ejercicios.length > 1 ? ' <span data-no-traducir>+ ' + (dia.ejercicios.length - 1) + '</span>' : "") + '</p>';
}

// ---------- Mi semana (Entrenar) ----------
// Tarjeta con los 7 días: los de entreno resaltados, con su hora si la tiene
function miSemanaHtml() {
  const cal = diasDeEntreno();
  const hoyN = (new Date().getDay() + 6) % 7;
  const avisa = (estado.ajustes.notif || {}).recordatorios !== false && permisoAvisos() === "granted";
  let h = '<button class="card mi-semana" data-act="abrir-semana" style="text-align:left"><div class="row between"><p class="label">📅 Mi semana' + (avisa ? ' · 🔔' : '') + '</p><span class="btn-txt small">Cambiar</span></div><div class="semana-dias">';
  const iniciales = { es: "LMXJVSD", en: "MTWTFSS", fr: "LMMJVSD", ary: "ثثرخجسح" }[typeof IDIOMA_ACTUAL !== "undefined" ? IDIOMA_ACTUAL : "es"] || "LMXJVSD";
  NOMBRES_DIAS_SEMANA.forEach(function (n, i) {
    const toca = cal.includes(i);
    h += '<div class="semana-dia' + (toca ? " toca" : "") + (i === hoyN ? " hoy" : "") + '"><span class="letra" data-no-traducir>' + iniciales[i] + '</span>' +
      '<span class="hora num" data-no-traducir>' + (toca ? (horaDeEntreno(i) || "·") : "") + '</span></div>';
  });
  return h + '</div></button>';
}

// Ventana para elegir días, hora (opcional) y aviso de Apix (opcional)
let semOp = null;
function hojaSemana(nueva) {
  if (nueva || !semOp) {
    semOp = { dias: diasDeEntreno().slice(), horas: Object.assign({}, estado.ajustes.horasEntreno || {}),
      avisar: (estado.ajustes.notif || {}).recordatorios !== false && permisoAvisos() === "granted" };
  }
  const n = estado.rutina.dias.length;
  const orden = semOp.dias.slice().sort(function (a, b) { return a - b; });
  let h = cabeceraHoja("Mis días de entreno", "Mi semana") + '<div class="stack">' +
    '<div class="card stack tight"><h3>¿Qué días entrenas?</h3><div class="chips">' +
    NOMBRES_DIAS_SEMANA.map(function (nom, i) {
      return '<button class="chip' + (semOp.dias.includes(i) ? " on" : "") + '" data-act="semana-dia" data-a="' + i + '">' + nom.slice(0, 2) + '</button>';
    }).join("") + '</div><p class="muted small">' + (semOp.dias.length === 1 ? "1 día elegido." : semOp.dias.length + " días elegidos.") +
      (semOp.dias.length && semOp.dias.length !== n ? ' Tu rutina tiene ' + n + ' días: se irán turnando en orden.' : '') + '</p></div>';
  if (orden.length) {
    h += '<div class="card stack tight"><h3>¿A qué hora? <span class="muted small">(opcional)</span></h3>';
    orden.forEach(function (d, k) {
      const dr = estado.rutina.dias[k];
      h += '<label class="semana-fila"><span class="grow"><b>' + NOMBRES_DIAS_SEMANA[d] + '</b>' + (dr && semOp.dias.length === n ? '<span class="muted small" style="display:block">' + esc(dr.nombre) + '</span>' : "") + '</span>' +
        '<span class="hora-caja' + (semOp.horas[d] ? "" : " vacia") + '"><span class="hora-pista" aria-hidden="true">+ Hora</span>' +
        '<input type="time" data-hora-dia="' + d + '" value="' + (semOp.horas[d] || "") + '" aria-label="Hora"></span></label>';
    });
    h += '<p class="muted small">Déjala vacía si no tienes hora fija.</p></div>';
  }
  h += '<div class="card stack tight"><label class="check"><input type="checkbox" id="semAvisar"' + (semOp.avisar ? " checked" : "") + '>🔔 Que Apix me avise a esa hora</label>' +
    '<p class="muted small">' + (permisoAvisos() === "no" ? "Este navegador no permite avisos. En iPhone, primero añade la app a la pantalla de inicio."
      : permisoAvisos() === "denied" ? "Has bloqueado los avisos. Actívalos en los ajustes del navegador."
      : "Te llega un aviso los días de entreno, aunque la app esté cerrada. Sin hora puesta, se usa la de Ajustes. Si ese día ya has entrenado, no te avisa.") + '</p></div>' +
    '<p class="err" id="semError"></p><button class="btn" data-act="guardar-semana">Guardar</button></div>';
  abrirHoja(h);
}
// Antes de volver a pintar la ventana, se recogen las horas ya escritas
function leerHorasSemana() {
  for (const inp of document.querySelectorAll("input[data-hora-dia]")) semOp.horas[inp.dataset.horaDia] = inp.value;
  if ($("semAvisar")) semOp.avisar = $("semAvisar").checked;
}

// Anillo de la semana: un círculo que se rellena con cada entreno (verde al cumplir la meta)
function anilloSemana(hechos, meta) {
  const r = 30, largo = 2 * Math.PI * r;
  const parte = meta > 0 ? Math.min(1, hechos / meta) : 0;
  const cumplida = parte >= 1;
  return '<div class="anillo-semana' + (cumplida ? " cumplida" : "") + '" role="img" aria-label="Esta semana: ' + hechos + ' de ' + meta + '">' +
    '<svg viewBox="0 0 72 72" aria-hidden="true"><circle class="fondo" cx="36" cy="36" r="' + r + '"/>' +
    (parte <= 0 ? "" : '<circle class="avance" cx="36" cy="36" r="' + r + '" stroke-dasharray="' + (largo * parte).toFixed(1) + ' ' + largo.toFixed(1) + '" transform="rotate(-90 36 36)"/>') + '</svg>' +
    '<div class="anillo-num"><span class="num"><b>' + hechos + '</b><span class="muted">/' + meta + '</span></span><span class="label">' + (cumplida ? "✓" : "Semana") + '</span></div></div>';
}

// ---------- Logros ----------
// Tarjeta pequeña de Inicio: cuántos llevas y el siguiente más cercano
function logrosInicioHtml() {
  revisarLogros();                       // quien ya entrenaba antes de existir los logros los recibe sin aviso
  const hechos = LOGROS.filter(function (l) { return estado.logros[l.id]; }).length;
  const sig = siguienteLogro();
  let h = '<button class="card logros-inicio" data-act="ver-logros" style="text-align:left"><span class="logro-ico" aria-hidden="true">' + (sig ? sig.logro.icono : "🏅") + '</span>' +
    '<div class="grow stack tight"><div class="row between"><p class="label">Logros</p><span class="muted small num">' + hechos + ' / ' + LOGROS.length + '</span></div>';
  if (sig) {
    h += '<p class="small"><b>' + sig.logro.texto + '</b></p>' +
      '<div class="barra-logro"><i style="width:' + Math.round(sig.parte * 100) + '%"></i></div>' +
      '<p class="muted small num">' + Math.min(sig.llevas, sig.logro.meta) + ' / ' + sig.logro.meta + '</p>';
  } else h += '<p class="small"><b>¡Los tienes todos!</b></p>';
  return h + '</div></button>';
}

// Ventana con todos los logros: conseguidos (con su fecha) y pendientes (con lo que falta)
function hojaLogros() {
  revisarLogros();
  const d = datosLogros();
  const hechos = LOGROS.filter(function (l) { return estado.logros[l.id]; }).length;
  let h = cabeceraHoja("Logros", hechos + " / " + LOGROS.length) + '<div class="logros-lista">';
  for (const l of LOGROS) {
    const fecha = estado.logros[l.id];
    h += '<div class="logro' + (fecha ? " hecho" : "") + '"><span class="logro-ico" aria-hidden="true">' + (fecha ? l.icono : "🔒") + '</span>' +
      '<div class="grow"><h3>' + l.nombre + '</h3><p class="muted small">' + l.texto + '</p>' +
      (fecha ? '<p class="small" style="color:var(--good)">✓ ' + fechaBonita(fecha) + '</p>'
             : '<div class="barra-logro"><i style="width:' + Math.round(Math.min(1, d[l.tipo] / l.meta) * 100) + '%"></i></div><p class="muted small num">' + Math.min(d[l.tipo], l.meta) + ' / ' + l.meta + '</p>') +
      '</div></div>';
  }
  abrirHoja(h + '</div>');
}

// Ventana de confirmación antes de terminar (para no terminar sin querer)
function hojaTerminar() {
  const a = estado.activa;
  let hechas = 0, total = 0;
  for (const e of a.ejercicios) for (const x of e.series) { total++; if (x.hecha) hechas++; }
  const faltan = total - hechas;
  abrirHoja(cabeceraHoja("¿Terminar el entreno?", esc(a.diaNombre)) + '<div class="stack">' +
    '<p>Llevas <b>' + hechas + ' de ' + total + ' series</b> en <b>' + tiempoEntreno() + '</b>.</p>' +
    (faltan ? '<p class="small" style="color:var(--warn)">Te quedan ' + faltan + ' serie' + (faltan > 1 ? "s" : "") + ' sin hacer. No se guardarán.</p>' : '<p class="small" style="color:var(--good)">✓ Has completado todas las series.</p>') +
    '<button class="btn" data-act="terminar-si">Sí, terminar</button>' +
    '<button class="btn-sec full" data-act="cerrar-hoja">Seguir entrenando</button></div>');
}

function tiempoEntreno() {
  const seg = Math.max(0, Math.floor((Date.now() - estado.activa.inicio) / 1000));
  const h = Math.floor(seg / 3600), m = Math.floor(seg % 3600 / 60), s = seg % 60;
  const dos = function (n) { return String(n).padStart(2, "0"); };
  return h ? h + ":" + dos(m) + ":" + dos(s) : m + ":" + dos(s);
}

function pintarSesion() {
  const a = estado.activa;
  const minutos = Math.round((Date.now() - a.inicio) / 60000);
  let hechas = 0, total = 0;
  for (const e of a.ejercicios) for (const s of e.series) { total++; if (s.hecha) hechas++; }
  const ei = ejercicioActual();
  const hora = ultimoGuardado ? ultimoGuardado.toLocaleTimeString(localeApp(), { hour: "2-digit", minute: "2-digit" }) : "";

  let h = (sesionAntigua() ? '<div class="card stack tight" style="margin-bottom:12px;border-color:var(--warn)"><p class="small"><b>Empezó hace más de 12 horas.</b> Termínalo o descártalo.</p></div>' : "") +
    (sesionRecuperada && !sesionAntigua() ? '<div class="card" style="margin-bottom:12px;border-color:var(--good)"><p class="small"><b>Entreno recuperado.</b> Seguía guardado.</p></div>' : "") +
    '<div class="head"><div class="grow"><p class="label">Entreno en curso' + (hora ? ' · <span style="color:var(--good)">guardado ' + hora + '</span>' : "") + '</p><h1 style="font-size:1.4rem">' + esc(a.diaNombre) + '</h1></div>' +
    '<button class="icon-btn" data-act="deshacer" aria-label="Deshacer"' + (pilaDeshacer.length ? "" : " disabled") + '>' + I.deshacer + '</button>' +
    '<button class="btn auto btn-terminar" data-act="terminar"' + (hechas ? "" : " disabled") + '>Terminar</button></div>';

  // Progreso del entreno y salto rápido entre ejercicios
  const pct = total ? Math.round(hechas / total * 100) : 0;
  h += '<div class="progreso-entreno"><div class="row between"><span class="cronometro" aria-label="Tiempo de entreno">⏱ <b id="cronometro" class="num">' + tiempoEntreno() + '</b></span>' +
    '<span class="small"><b>' + hechas + ' de ' + total + ' series</b> <span class="muted">· ' + pct + ' %</span></span></div>' +
    '<div class="bar"><i style="width:' + pct + '%"></i></div>' +
    '<div class="chips saltos">' + a.ejercicios.map(function (e, i) {
      const n = e.series.filter(function (s) { return s.hecha; }).length;
      const lleno = n === e.series.length && n > 0;
      return '<button class="chip chip-ej' + (i === ei ? " on" : "") + (lleno ? " hecho" : "") + '" data-act="ir-ej" data-a="' + i + '">' + (lleno ? "✓ " : (i + 1) + ". ") + esc(tr(buscarEj(e.id).nombre)) + (e.superserie ? " ⇄" : "") + '</button>';
    }).join("") + '</div></div>';

  if (estado.perfil.lesiones) h += '<p class="muted small" style="margin:0 0 10px">Recuerda: ' + esc(estado.perfil.lesiones) + '. Para si notas dolor.</p>';

  if (ei < 0) {
    h += '<div class="card stack tight" style="text-align:center;padding:26px 16px"><h3>Entreno vacío</h3><p class="muted">Añade el primer ejercicio.</p></div>';
  } else {
    h += tarjetaEjercicio(ei);
  }

  h += '<button class="btn-sec full" data-act="anadir-a-sesion" style="padding:14px;margin-top:12px">+ Añadir ejercicio</button>' +
    '<button class="btn-txt btn-danger" data-act="cancelar-sesion" style="margin-top:6px">' + (confirmar === "cancelar-sesion" ? "Pulsa otra vez para descartar" : "Descartar entreno") + '</button>';
  $("app").innerHTML = h;
  serieMarcada = "";
  centrarChipActual();
}

// Mueve la fila de ejercicios de arriba para que se vea el ejercicio en el que estás
function centrarChipActual() {
  const fila = document.querySelector(".chips.saltos");
  const actual = fila ? fila.querySelector(".chip-ej.on") : null;
  if (!actual) return;
  const desde = actual.getBoundingClientRect().left - fila.getBoundingClientRect().left;
  fila.scrollLeft += desde - (fila.clientWidth - actual.offsetWidth) / 2;
}

function tarjetaEjercicio(ei) {
  const a = estado.activa;
  const e = a.ejercicios[ei];
  const ej = buscarEj(e.id);
  const rec = recomendar(e.id, e.objetivo);
  const pr = puntosEjercicio(e.id);
  const record = mejorSerie(e.id);
  const etiqueta = { subir: ["up", "Subir"], mantener: ["keep", "Mantener"], bajar: ["down", "Bajar"], empezar: ["keep", "Empezar"] }[rec.accion];
  const fotosEj = fotosDe(e.id);
  const si = serieEnFoco(e);
  const hechasEj = e.series.filter(function (s) { return s.hecha; }).length;

  let h = '<div class="card ejercicio-foco" id="tarjetaEj">' +
    '<div class="ex-head">' + (fotosEj ? '<button class="foto-mini" data-act="info-ej" data-a="' + e.id + '" aria-label="Ver técnica"><img src="' + fotosEj[0] + '" alt="" decoding="async"></button>' : insignia(pr === null ? null : rangoDePuntos(pr), "sm")) +
    '<div class="grow"><p class="label">Ejercicio ' + (ei + 1) + ' de ' + a.ejercicios.length + (e.superserie ? ' · superserie con el siguiente' : (ei > 0 && a.ejercicios[ei - 1].superserie ? ' · superserie con el anterior' : "")) + '</p><h3>' + esc(ej.nombre) + '</h3>' +
    '<p class="muted small num">' + e.objetivo.series + ' × ' + e.objetivo.repMin + '-' + e.objetivo.repMax + ' · descanso ' + e.objetivo.descanso + ' s</p>' +
    lineaAjusteMaquina(e.id) +
    (BANCO[e.id] ? '<p class="small banco-linea">🪑 <span>' + BANCO[e.id][0] + '</span></p>' : "") +
    (AGARRE[e.id] ? '<p class="small banco-linea">✋ <span>' + TIPOS_AGARRE[AGARRE[e.id]].nombre + '</span></p>' : "") +
    (record ? '<p class="small" style="color:var(--pr);font-weight:700">Récord: ' + numero(record.peso) + ' kg × ' + record.reps + '</p>' : "") + '</div>' +
    '<div class="stack tight" style="gap:6px"><button class="icon-btn sm fav' + (estado.favoritos.includes(e.id) ? " on" : "") + '" data-act="fav-sesion" data-a="' + e.id + '" aria-label="' + (estado.favoritos.includes(e.id) ? "Quitar de favoritos" : "Añadir a favoritos") + '">' + (estado.favoritos.includes(e.id) ? "★" : "☆") + '</button>' +
    '<button class="icon-btn sm" data-act="info-ej" data-a="' + e.id + '" aria-label="Cómo se hace">' + I.info + '</button></div></div>';

  // Sugerencia de progresión (corta)
  h += '<div class="rec"><span class="pill ' + etiqueta[0] + '">' + etiqueta[1] + '</span><div class="grow"><p>' + esc(rec.motivo) + '</p>' +
    (rec.accion !== "mantener" && ej.equipo !== "corporal" ? '<button class="btn-txt small" data-act="aplicar-peso" data-a="' + ei + '" data-b="' + rec.peso + '">Usar ' + numero(rec.peso) + ' kg</button>' : "") + '</div></div>';

  // Apix con una frase corta, solo en momentos clave
  const frase = mensajeEntreno || fraseApixEntreno(ei, si);
  if (frase && estado.ajustes.mascota !== false) h += '<div class="apix-entreno">' + apixSVG(mensajeEntreno.indexOf("récord") >= 0 ? "celebra" : "anima", "xs") + '<p class="small"><b>Apix:</b> ' + esc(frase) + '</p></div>';
  mensajeEntreno = "";

  // Series de calentamiento (no cuentan). Solo antes de empezar las series de trabajo.
  if (estado.ajustes.calentamiento !== false && !e.sinCalentamiento && hechasEj === 0) {
    const pesoTrabajo = (e.series.find(function (x) { return !x.tipo; }) || e.series[0]).peso;
    const cal = seriesCalentamiento(e.id, pesoTrabajo);
    if (cal.length) {
      const hechos = e.calHecho || [];
      const textoCal = function (c, k) { return (ej.equipo === "barra" && c.peso === 20 && k === 0 ? "Barra sola" : numero(c.peso) + " kg") + ' × ' + c.reps; };
      // Las primeras veces sale abierto; después, plegado en una línea para llegar antes a las series
      const abierto = e.calAbierto === undefined ? sesionesValidas().length < 3 : e.calAbierto;
      if (abierto) {
        h += '<div class="calentamiento"><div class="row between"><button class="label cal-titulo" data-act="cal-plegar" data-a="' + ei + '">🔥 Calentamiento · no cuenta</button><button class="btn-txt small" data-act="cal-ocultar" data-a="' + ei + '">Ocultar</button></div><div class="cal-filas">' +
          cal.map(function (c, k) {
            return '<button class="cal-fila' + (hechos[k] ? " hecha" : "") + '" data-act="cal-marcar" data-a="' + ei + '" data-b="' + k + '"><span class="cal-check">' + (hechos[k] ? "✓" : "") + '</span><span class="num">' + textoCal(c, k) + '</span></button>';
          }).join("") + '</div><p class="muted small">Prepara músculos y articulaciones. Peso ligero y sin llegar al fallo.</p></div>';
      } else {
        h += '<button class="calentamiento plegado" data-act="cal-plegar" data-a="' + ei + '"><span>🔥</span><span class="grow small num">' +
          cal.map(function (c, k) { return '<span>' + textoCal(c, k) + '</span>'; }).join(" · ") + '</span><span aria-hidden="true">▾</span></button>';
      }
    }
  }

  // Tabla de series: cada fila se edita directamente y se completa con ✓
  const ultima = ultimaVez(e.id);
  const paso = pasoPeso(ej);
  h += (ej.asistido ? '<p class="small" style="color:var(--warn);margin-top:10px">Los kg son ayuda: cuantos menos, más difícil.</p>' : "") +
    (sesionesValidas().length < 3 ? '<div class="ayuda-registro"><span>ⓘ ' + comoApuntar(ej).corto + '</span><button class="btn-txt small" data-act="guia-series">¿Cómo se apunta?</button></div>' : "") +
    '<div class="tabla-series series-lista" role="table" aria-label="Series de ' + esc(ej.nombre) + '">' +
    '<div class="ts-cab" role="row"><span>Serie</span><span>Previa</span><span>' + (ej.asistido ? "Ayuda" : "Kg") + '</span><span>Reps</span><span></span></div>';
  e.series.forEach(function (x, j) {
    const previa = ultima && ultima.series[j] ? numero(ultima.series[j].peso) + "×" + ultima.series[j].reps : "—";
    const clase = (x.hecha ? " done" : "") + (j === si ? " foco" : "") + (serieMarcada === ei + "-" + j ? " recien" : "");
    h += '<div class="serie-fila ts-fila' + clase + '" role="row">' +
      '<button class="n" data-act="foco-serie" data-a="' + ei + '" data-b="' + j + '" aria-label="Serie ' + (j + 1) + '">' + (ETIQUETA_TIPO[x.tipo] || (j + 1)) + '</button>' +
      (previa === "—" ? '<span class="previa num">—</span>' : '<button class="previa num" data-act="copiar-anterior" data-a="' + ei + '" data-b="' + j + '" title="Copiar la marca anterior">' + previa + '</button>') +
      '<input type="text" inputmode="decimal" autocomplete="off" value="' + numero(pesoVista(x.peso)) + '" data-in="peso" data-e="' + ei + '" data-s="' + j + '" aria-label="Kilos serie ' + (j + 1) + '"' + (x.hecha ? " readonly" : "") + '>' +
      '<input type="number" inputmode="numeric" min="0" value="' + x.reps + '" data-in="reps" data-e="' + ei + '" data-s="' + j + '" aria-label="Repeticiones serie ' + (j + 1) + '"' + (x.hecha ? " readonly" : "") + '>' +
      '<button class="tick" data-act="marcar" data-a="' + ei + '" data-b="' + j + '" aria-label="' + (x.hecha ? "Desmarcar" : "Completar") + ' serie ' + (j + 1) + '">' + I.check + '</button></div>';
    // Debajo de la serie actual: ajuste rápido con botones grandes
    if (j === si) {
      h += '<div class="ajuste-rapido">' +
        '<button data-act="paso" data-a="' + ei + '" data-b="' + j + '" data-c="peso:-' + paso + '">−' + textoPaso(paso) + '</button>' +
        '<button data-act="paso" data-a="' + ei + '" data-b="' + j + '" data-c="peso:' + paso + '">+' + textoPaso(paso) + '</button>' +
        '<button data-act="paso" data-a="' + ei + '" data-b="' + j + '" data-c="reps:-1">−1 rep</button>' +
        '<button data-act="paso" data-a="' + ei + '" data-b="' + j + '" data-c="reps:1">+1 rep</button></div>' +
        (usaBarraOlimpica(ej) ? '<p class="muted small ts-nota discos-linea" data-no-traducir>' + esc(textoDiscos(x.peso)) + '</p>' : '') +
        (e.series.length > 1 ? '<button class="btn-txt small btn-danger borrar-serie" data-act="borrar-serie" data-a="' + ei + '" data-b="' + j + '">🗑 Borrar serie ' + (j + 1) + '</button>' : '');
      if (x.tipo) h += '<p class="muted small ts-nota">' + (x.tipo === "drop" ? "Serie descendente: menos peso y sin descanso." : "Descanso-pausa: 15 s y las reps que puedas.") + '</p>';
    }
    if (x.error) h += '<p class="err small ts-nota">' + esc(x.error) + '</p>';
    else if (x.sospechosa && !x.confirmada) h += '<div class="row small ts-nota" style="color:var(--warn)"><span class="grow">⚠ ' + esc(x.aviso) + '</span><button class="btn-txt small" data-act="confirmar-serie" data-a="' + ei + '" data-b="' + j + '">Es correcto</button></div>';
  });
  h += '</div>';
  h += '<button class="btn-sec full anadir-serie" data-act="serie-mas" data-a="' + ei + '">+ Añadir serie</button>';
  if (si < 0) h += '<div class="panel-serie hecho"><p><b>✓ Ejercicio completado</b></p>' +
      (ei < a.ejercicios.length - 1 ? '<button class="btn" data-act="ir-ej" data-a="' + (ei + 1) + '">Siguiente ejercicio →</button>' : '<button class="btn" data-act="terminar">Terminar entreno</button>') + '</div>';
  const especialPendiente = e.series.some(function (x) { return x.tipo && !x.hecha; });
  if (hechasEj > 0 && !especialPendiente) {
    h += '<div class="tools series-botones"><button class="btn-sec small" data-act="drop-set" data-a="' + ei + '">+ Serie descendente</button>' +
      '<button class="btn-sec small" data-act="rest-pause" data-a="' + ei + '">+ Descanso-pausa</button></div>' +
      '<p class="muted small ayuda-tipos"><b>Descendente:</b> bajas el peso y sigues sin descansar. <b>Descanso-pausa:</b> 15 s de pausa y más reps con el mismo peso.</p>';
  }

  // Historial rápido del ejercicio
  const historial = [];
  for (let k = 0; k < 3; k++) { const u = ultimaVez(e.id, k); if (u) historial.push(u); }
  if (historial.length) {
    h += '<div class="historial-rapido"><p class="label">Últimas veces</p>' + historial.map(function (u) {
      return '<p class="small num"><span class="muted">' + fechaBonita(u.fecha) + '</span> ' + u.series.map(function (x) { return numero(x.peso) + '×' + x.reps; }).join(" · ") + '</p>';
    }).join("") + '</div>';
  }

  // Anterior / Siguiente
  h += '<div class="grid2 nav-ej"><button class="btn-sec" data-act="ir-ej" data-a="' + (ei - 1) + '"' + (ei > 0 ? "" : " disabled") + '>← Anterior</button>' +
    '<button class="btn-sec" data-act="ir-ej" data-a="' + (ei + 1) + '"' + (ei < a.ejercicios.length - 1 ? "" : " disabled") + '>Siguiente →</button></div>';

  // Más opciones
  h += '<details class="mas-opciones"><summary>Más opciones</summary><div class="tools">' +
    '<button class="btn-sec small" data-act="guia-series">¿Cómo se apunta?</button>' +
    '<button class="btn-sec small" data-act="serie-menos" data-a="' + ei + '"' + (e.series.length > 1 ? "" : " disabled") + '>− Quitar última serie</button>' +
    (ei < a.ejercicios.length - 1 ? '<button class="btn-sec small" data-act="superserie" data-a="' + ei + '">' + (e.superserie ? "Quitar superserie" : "Superserie con el siguiente") + '</button>' : "") +
    '<button class="icon-btn sm" data-act="mover-ej" data-a="' + ei + '" data-b="-1" aria-label="Mover antes"' + (ei > 0 ? "" : " disabled") + '>' + I.arriba + '</button>' +
    '<button class="icon-btn sm" data-act="mover-ej" data-a="' + ei + '" data-b="1" aria-label="Mover después"' + (ei < a.ejercicios.length - 1 ? "" : " disabled") + '>' + I.abajo + '</button>' +
    '<button class="icon-btn sm" data-act="sustituir-sesion" data-a="' + ei + '" aria-label="Sustituir">' + I.cambiar + '</button>' +
    '<button class="icon-btn sm btn-danger" data-act="quitar-ej" data-a="' + ei + '" aria-label="Quitar">' + I.borrar + '</button></div>' +
    '<div class="tools"><label class="check small" style="padding:7px 10px"><input type="checkbox" data-in="molestias" data-e="' + ei + '"' + (e.molestias ? " checked" : "") + '>Molestias</label>' +
    '<label class="check small" style="padding:7px 10px"><input type="checkbox" data-in="cambio" data-e="' + ei + '"' + (e.cambio ? " checked" : "") + '>Otra máquina o técnica</label></div>' +
    '<textarea data-in="nota" data-e="' + ei + '" placeholder="Notas (opcional)" style="margin-top:10px;min-height:42px">' + esc(e.nota) + '</textarea></details>';
  return h + '</div>';
}

// Frases cortas de Apix en momentos clave del entreno (no en cada serie)
function fraseApixEntreno(ei, si) {
  const a = estado.activa;
  const e = a.ejercicios[ei];
  if (si < 0) return "";
  const pendientesEj = e.series.filter(function (s) { return !s.hecha; }).length;
  const quedanOtros = a.ejercicios.some(function (x, i) { return i !== ei && x.series.some(function (s) { return !s.hecha; }); });
  if (pendientesEj === 1 && !quedanOtros) return "¡Última serie del entreno! Dalo todo.";
  if (pendientesEj === 1 && e.series.length > 1) return "¡Vamos con esa última serie!";
  if (!quedanOtros && si === 0 && a.ejercicios.length > 1) return "Último ejercicio. ¡Termina fuerte!";
  return "";
}

// Texto "Siguiente: …" que se muestra durante el descanso
function textoSiguiente() {
  const a = estado.activa;
  if (!a) return "";
  const ei = ejercicioActual();
  if (ei < 0) return "";
  const e = a.ejercicios[ei];
  const si = serieEnFoco(e);
  if (si < 0) return "¡Entreno completado! Pulsa Terminar.";
  const s = e.series[si];
  return buscarEj(e.id).nombre + " · " + (s.tipo === "drop" ? "serie descendente" : (s.tipo === "rp" ? "descanso-pausa" : "serie " + (si + 1))) + " · " + numero(s.peso) + " kg × " + s.reps;
}

// Guarda una copia de la sesión antes de cambiarla (para Deshacer)
function copiaSesion() {
  pilaDeshacer.push(JSON.stringify(estado.activa));
  if (pilaDeshacer.length > 20) pilaDeshacer.shift();
}

// =====================================================
// PANTALLA: RANGOS
// =====================================================

function pintarRangos() {
  const pg = puntosGlobal();
  const rg = pg === null ? null : rangoDePuntos(pg);
  let h = '<div class="head"><div><p class="label">Clasificación</p><h1>Rangos</h1></div><button class="btn-txt small" data-act="como-rangos">¿Cómo funciona?</button></div><div class="stack">';

  // Global
  h += '<div class="card hero stack" style="align-items:center;text-align:center">' +
    '<div class="insignia-brillo"' + (rg === null ? "" : ' style="--c:' + RANGOS[rg].color + '"') + '>' + insignia(rg, "lg") + '</div>' +
    '<div><p class="label">Rango global</p><h1>' + nombreRango(rg) + '</h1>' + (pg !== null ? '<p class="muted num">' + pg.toFixed(1) + ' puntos</p>' : "") + '</div>';
  if (pg !== null) {
    h += '<div style="width:100%" class="stack tight"><div class="bar"><i style="width:' + progresoRango(pg) + '%"></i></div>' +
      '<div class="row between small"><span>' + nombreRango(rg) + '</span><span class="muted">' + (rg < 8 ? progresoRango(pg) + "% · " + RANGOS[rg + 1].nombre : "Máximo") + '</span></div></div>';
    const cob = coberturaMuscular();
    h += '<div style="width:100%;text-align:left" class="stack tight"><div class="row between small"><span>Cobertura muscular</span><b class="num">' + cob + ' de ' + GRUPOS_PRINCIPALES.length + '</b></div><div class="bar fire"><i style="width:' + (cob / GRUPOS_PRINCIPALES.length * 100) + '%"></i></div></div>';
    h += '<p class="muted" style="text-align:left;width:100%">' + esc(consejoGlobal(pg)) + '</p>';
    const hace4 = puntosGlobal(fechaTexto(28));
    if (hace4 !== null) {
      const d = pg - hace4;
      h += '<p class="small" style="width:100%;text-align:left">Hace 4 semanas: <b class="num">' + hace4.toFixed(1) + '</b> pts · ' +
        '<span style="color:' + (d >= 0 ? "var(--good)" : "var(--danger)") + ';font-weight:700">' + (d >= 0 ? "+" : "") + d.toFixed(1) + '</span></p>';
    }
  } else h += '<p class="muted">Completa tu primer entreno para obtener rango.</p>';
  h += '</div>';

  // Ranking por grupo muscular: ordenado de mejor a peor y bien visible
  const datosG = [];
  for (const g in GRUPOS) datosG.push({ g: g, p: puntosGrupo(g) });
  const ordenados = datosG.slice().sort(function (a, b) { return (b.p === null ? -1 : b.p) - (a.p === null ? -1 : a.p); });
  h += '<div class="card"><div class="row between"><h3>Tu ranking por músculo</h3><span class="muted small">Toca para ver detalle</span></div><div class="list">';
  ordenados.forEach(function (d, pos) {
    const ri = d.p === null ? null : rangoDePuntos(d.p);
    h += '<button class="item ranking-fila" data-act="ver-grupo" data-a="' + d.g + '"><span class="pos num">' + (d.p === null ? "–" : pos + 1) + '</span>' + insignia(ri, "sm") +
      '<div class="grow stack tight" style="gap:4px"><div class="row between"><span class="name">' + GRUPOS[d.g] + '</span><span class="small" style="color:' + (ri === null ? "var(--muted)" : RANGOS[ri].color) + ';font-weight:800">' + nombreRango(ri) + (d.p === null ? "" : ' · <span class="num">' + d.p.toFixed(0) + '</span>') + '</span></div>' +
      (d.p === null ? '<span class="muted small">Sin datos todavía</span>'
        : '<div class="bar"><i style="width:' + (ri < RANGOS.length - 1 ? progresoRango(d.p) : 100) + '%;background:' + RANGOS[ri].color + '"></i></div>' +
          '<span class="muted small">' + (ri < RANGOS.length - 1 ? 'Te faltan ' + Math.max(1, Math.ceil(RANGOS[ri + 1].min - d.p)) + ' pts para ' + RANGOS[ri + 1].nombre : "Rango máximo") + '</span>') + '</div></button>';
  });
  h += '</div><p class="muted small">Los grupos marcados en el mapa y los 8 principales cuentan para tu rango global.</p></div>';

  // Escala de los 9 rangos: el tuyo resaltado, los que aún no tienes atenuados
  h += '<div class="card stack"><div class="row between"><h3>Los 9 rangos</h3><span class="muted small">De principiante a élite</span></div><div class="escala">';
  RANGOS.forEach(function (r, i) {
    const clase = rg === i ? "actual" : (rg !== null && i < rg ? "logrado" : "bloqueado");
    h += '<div class="escalon ' + clase + '">' + insignia(i, "md") + '<b style="color:' + r.color + '">' + r.nombre + '</b><span class="muted small num">' + r.min + ' pts</span>' + (rg === i ? '<span class="pill up">Tú</span>' : "") + '</div>';
  });
  h += '</div></div>';

  // Mapa corporal
  h += '<div class="card stack"><div class="row between"><h3>Mapa corporal</h3><span class="muted small">Toca un músculo</span></div>' + mapaCorporal() +
    '<div class="row wrap" style="gap:6px;justify-content:center">';
  RANGOS.forEach(function (r, i) { h += '<span class="row small" style="gap:4px"><i style="width:10px;height:10px;border-radius:3px;background:' + r.color + ';display:inline-block"></i>' + r.nombre + '</span>'; });
  h += '</div></div>';

  // Mejores y a mejorar
  const conDatos = ejerciciosHechos().map(function (id) { return { id: id, p: puntosEjercicio(id) }; }).sort(function (a, b) { return b.p - a.p; });
  if (conDatos.length) {
    h += '<div class="grid2"><div class="card stack tight"><p class="label" style="color:var(--good)">Tus mejores</p>';
    for (const d of conDatos.slice(0, 3)) h += '<p class="small"><b>' + esc(buscarEj(d.id).nombre) + '</b><br><span class="muted">' + nombreRango(rangoDePuntos(d.p)) + '</span></p>';
    h += '</div><div class="card stack tight"><p class="label" style="color:var(--warn)">A mejorar</p>';
    const sinDatos = datosG.filter(function (d) { return d.p === null; }).map(function (d) { return GRUPOS[d.g]; });
    for (const d of conDatos.slice(-2).reverse()) h += '<p class="small"><b>' + esc(buscarEj(d.id).nombre) + '</b><br><span class="muted">' + nombreRango(rangoDePuntos(d.p)) + '</span></p>';
    if (sinDatos.length) h += '<p class="small"><b>Sin datos</b><br><span class="muted">' + sinDatos.slice(0, 4).join(", ") + '</span></p>';
    h += '</div></div>';

    // Por ejercicio
    h += '<div class="card"><h3>Por ejercicio</h3><div class="list">';
    for (const d of conDatos) {
      const ri = rangoDePuntos(d.p);
      h += '<button class="item" data-act="ver-rango-ej" data-a="' + d.id + '">' + insignia(ri, "sm") + '<div class="grow stack tight" style="gap:4px"><div class="row between"><span class="name">' + esc(buscarEj(d.id).nombre) + '</span><span class="muted small">' + RANGOS[ri].nombre + '</span></div><div class="bar"><i style="width:' + progresoRango(d.p) + '%"></i></div></div></button>';
    }
    h += '</div></div>';
  }

  // Historial de ascensos
  h += '<div class="card"><h3>Historial de ascensos</h3><div class="list">';
  if (estado.ascensos.length === 0) h += '<p class="muted" style="padding-top:8px">Cuando subas de rango aparecerá aquí.</p>';
  for (const a of estado.ascensos.slice().reverse().slice(0, 12)) {
    h += '<div class="item">' + insignia(a.rango, "sm") + '<div class="grow"><span class="name small">' + esc(a.nombre) + ' → ' + RANGOS[a.rango].nombre + '</span><span class="muted small">' + fechaBonita(a.fecha) + '</span></div></div>';
  }
  $("app").innerHTML = h + '</div></div></div>';
}

function consejoGlobal(pg) {
  const n = sesionesValidas().length;
  if (n < 5 && pg >= 35) return "Tu rango global está limitado a " + RANGOS[rangoDePuntos(35)].nombre + " hasta completar 5 entrenos válidos (llevas " + n + ").";
  if (n < 15 && pg >= 67) return "Tu rango global está limitado a " + RANGOS[rangoDePuntos(67)].nombre + " hasta completar 15 entrenos válidos (llevas " + n + ").";
  const sinDatos = GRUPOS_PRINCIPALES.filter(function (g) { return puntosGrupo(g) === null; });
  if (sinDatos.length) return "Te faltan datos de " + sinDatos.map(function (g) { return GRUPOS[g]; }).join(", ") + ". Cada músculo sin datos cuenta 0 en el global.";
  const grupos = GRUPOS_PRINCIPALES.map(function (g) { return { g: g, p: puntosGrupo(g) }; }).sort(function (a, b) { return a.p - b.p; });
  return "Para subir, mejora tus músculos más flojos: " + grupos.slice(0, 2).map(function (x) { return GRUPOS[x.g]; }).join(" y ") + ".";
}

function colorGrupo(g) {
  const p = puntosGrupo(g);
  return p === null ? "var(--surface3)" : RANGOS[rangoDePuntos(p)].color;
}

// Mapa corporal sencillo (vista frontal y trasera)
// colorDe: función que da el color de cada músculo (por defecto, el de su rango)
// accion: lo que pasa al tocar un músculo (por defecto, abre su ficha de rango)
function mapaCorporal(colorDe, accion) {
  const color = colorDe || colorGrupo;
  const act = accion || "ver-grupo";
  function z(g, forma) { return '<g class="zona" data-act="' + act + '" data-a="' + g + '" role="button" tabindex="0" aria-label="' + GRUPOS[g] + '"><title>' + GRUPOS[g] + '</title>' + forma.replace(/FILL/g, color(g)) + '</g>'; }
  const base = 'fill="var(--surface2)" stroke="var(--line)"';
  let s = '<svg class="mapa" viewBox="0 0 240 230">';
  // Silueta frontal (x=60) y trasera (x=180)
  for (const cx of [60, 180]) {
    s += '<circle cx="' + cx + '" cy="20" r="13" ' + base + '/>' +
      '<rect x="' + (cx - 26) + '" y="38" width="52" height="78" rx="18" ' + base + '/>' +
      '<rect x="' + (cx - 40) + '" y="42" width="13" height="72" rx="6" ' + base + '/>' +
      '<rect x="' + (cx + 27) + '" y="42" width="13" height="72" rx="6" ' + base + '/>' +
      '<rect x="' + (cx - 22) + '" y="114" width="20" height="104" rx="9" ' + base + '/>' +
      '<rect x="' + (cx + 2) + '" y="114" width="20" height="104" rx="9" ' + base + '/>';
  }
  const op = 'fill="FILL" fill-opacity=".85"';
  // Frontal
  s += z("hombros", '<ellipse cx="38" cy="46" rx="11" ry="9" ' + op + '/><ellipse cx="82" cy="46" rx="11" ry="9" ' + op + '/>');
  s += z("pecho", '<rect x="40" y="46" width="40" height="22" rx="9" ' + op + '/>');
  s += z("biceps", '<rect x="21" y="58" width="12" height="24" rx="6" ' + op + '/><rect x="87" y="58" width="12" height="24" rx="6" ' + op + '/>');
  s += z("antebrazos", '<rect x="21" y="86" width="12" height="26" rx="6" ' + op + '/><rect x="87" y="86" width="12" height="26" rx="6" ' + op + '/>');
  s += z("abdominales", '<rect x="47" y="72" width="26" height="38" rx="8" ' + op + '/>');
  s += z("cuadriceps", '<rect x="40" y="122" width="17" height="48" rx="8" ' + op + '/><rect x="63" y="122" width="17" height="48" rx="8" ' + op + '/>');
  s += z("gemelos", '<rect x="42" y="178" width="13" height="34" rx="6" ' + op + '/><rect x="65" y="178" width="13" height="34" rx="6" ' + op + '/><rect x="162" y="176" width="14" height="36" rx="6" ' + op + '/><rect x="184" y="176" width="14" height="36" rx="6" ' + op + '/>');
  // Trasera
  s += z("espalda", '<rect x="158" y="44" width="44" height="50" rx="12" ' + op + '/>');
  s += z("triceps", '<rect x="141" y="56" width="12" height="28" rx="6" ' + op + '/><rect x="207" y="56" width="12" height="28" rx="6" ' + op + '/>');
  s += z("gluteos", '<rect x="158" y="100" width="44" height="26" rx="12" ' + op + '/>');
  s += z("isquios", '<rect x="160" y="130" width="17" height="42" rx="8" ' + op + '/><rect x="183" y="130" width="17" height="42" rx="8" ' + op + '/>');
  s += '<text x="60" y="229" text-anchor="middle" font-size="9" fill="var(--muted)">FRENTE</text><text x="180" y="229" text-anchor="middle" font-size="9" fill="var(--muted)">ESPALDA</text>';
  return s + '</svg>';
}

// =====================================================
// PANTALLA: PROGRESO
// =====================================================

function enPeriodo(fecha, dias, desplazar) {
  if (dias === 0) return !desplazar;
  const desde = fechaTexto(dias * (desplazar ? 2 : 1) - 1);
  const hasta = desplazar ? fechaTexto(dias) : hoy();
  return fecha >= desde && (desplazar ? fecha < hasta : fecha <= hasta);
}

// ---------- Progreso: ayudas para el resumen, los ejercicios clave y el mapa ----------

// Mejor 1RM estimada de cada día en el periodo (en la unidad que ve el usuario), de más antiguo a más nuevo
function mejoresPorDia(id) {
  const ej = buscarEj(id);
  const porDia = {};
  for (const s of seriesDe(id)) {
    if (!enPeriodo(s.fecha, periodo)) continue;
    const v = pesoVista(rm1Mostrado(cargaSerie(ej, s.peso, s.fecha), s.reps));
    if (porDia[s.fecha] === undefined || v > porDia[s.fecha]) porDia[s.fecha] = v;
  }
  return Object.keys(porDia).sort().map(function (f) { return porDia[f]; });
}

// Los ejercicios que más has hecho en el periodo (como mucho 4), con su marca y cuánto ha cambiado
function ejerciciosClave() {
  const lista = [];
  for (const id of ejerciciosHechos()) {
    const valores = mejoresPorDia(id);
    if (valores.length === 0) continue;
    const ultimo = valores[valores.length - 1];
    lista.push({ id: id, veces: valores.length, valores: valores, ultimo: ultimo, cambio: ultimo - valores[0] });
  }
  lista.sort(function (a, b) { return b.veces - a.veces; });
  return lista.slice(0, 4);
}

// Mini gráfica de una línea (para las tarjetas de ejercicios clave)
function miniGrafica(valores) {
  if (valores.length < 2) return '<svg class="mini-graf" viewBox="0 0 80 28"></svg>';
  const min = Math.min.apply(null, valores), max = Math.max.apply(null, valores);
  const rango = max - min || 1;
  let puntos = "";
  valores.forEach(function (v, i) {
    const x = 2 + i * 76 / (valores.length - 1);
    const y = 25 - (v - min) * 22 / rango;
    puntos += x.toFixed(1) + "," + y.toFixed(1) + " ";
  });
  return '<svg class="mini-graf" viewBox="0 0 80 28" aria-hidden="true"><polyline points="' + puntos + '" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/></svg>';
}

// Cuántas semanas abarca el periodo (para sacar la media semanal)
function semanasDelPeriodo(ses) {
  const todas = sesionesValidas();
  if (!todas.length) return 1;
  let desde = todas[0].fecha;                                  // tu primer entreno
  if (periodo && fechaTexto(periodo - 1) > desde) desde = fechaTexto(periodo - 1);
  return Math.max(1, (diasEntre(desde, hoy()) + 1) / 7);
}

const COLOR_NIVEL = { poco: "var(--danger)", bien: "var(--good)", mucho: "var(--accent)" };

// Tarjeta de arriba: Apix te dice en 3 frases cómo vas
function resumenApixHtml(ses, prev, clave, olvidados) {
  const frases = [];
  let humor = "contento";
  if (ses.length === 0) {
    frases.push(periodo ? "Aún no hay entrenos en este periodo. ¡A por el primero!" : "Aún no hay entrenos. ¡A por el primero!");
    humor = "descanso";
  } else {
    const veces = ses.length === 1 ? "1 vez" : ses.length + " veces";
    frases.push(periodo ? "Has entrenado " + veces + " en las últimas " + (periodo / 7) + " semanas." : "Has entrenado " + veces + " en total.");
    if (periodo) {
      const d = ses.length - prev.length;
      if (prev.length === 0) humor = "celebra";              // antes no había entrenos: no se compara
      else if (d > 0) { frases.push("Son " + d + " más que en las " + (periodo / 7) + " semanas anteriores."); humor = "celebra"; }
      else if (d < 0) { frases.push("Son " + (-d) + " menos que en las " + (periodo / 7) + " semanas anteriores."); humor = "anima"; }
      else frases.push("Igual que en las " + (periodo / 7) + " semanas anteriores.");
    }
    // El ejercicio que más ha mejorado
    let mejor = null;
    for (const c of clave) if (c.veces >= 2 && c.cambio > 0 && (!mejor || c.cambio > mejor.cambio)) mejor = c;
    if (mejor) frases.push("Tu mejor avance: +" + (Math.round(mejor.cambio * 10) / 10).toLocaleString(localeApp()) + " " + unidadPeso() + " en " + buscarEj(mejor.id).nombre + ".");
  }
  let h = '<div class="card resumen-apix">' + apixSVG(humor, "s") + '<div class="stack" style="gap:6px"><p class="label">Resumen de Apix</p>' +
    '<p class="resumen-texto">' + frases.map(function (f) { return '<span>' + esc(f) + '</span>'; }).join(" ") + '</p>';
  if (ses.length && olvidados.length) {
    const mas = olvidados.length - 3;
    h += '<p class="small muted">Ojo, casi no entrenas: ' + olvidados.slice(0, 3).map(function (g) { return '<b class="olvidado">' + GRUPOS[g] + '</b>'; }).join(", ") +
      (mas > 0 ? ' <span>y ' + mas + ' más</span>' : "") + '</p>';
  }
  const mes = mesParaCompartir();
  const hayEntrenosMes = sesionesValidas().some(function (s) { return s.fecha.slice(0, 7) === mes; });
  if (hayEntrenosMes) h += '<button class="btn-sec compartir-mes" data-act="compartir-mes">📸 Compartir mi mes de ' + nombreMes(mes) + '</button>';
  return h + '</div></div>';
}

// Tarjeta "Tus ejercicios clave": los que más haces, con su marca y cuánto has subido
function ejerciciosClaveHtml(clave) {
  if (!clave.length) return "";
  let h = '<div class="card stack"><h3>Tus ejercicios clave</h3><p class="muted small">Tu mejor marca estimada (1RM) y cuánto ha cambiado en este periodo. Toca uno para ver su gráfica.</p>';
  for (const c of clave) {
    let cambio;
    if (c.veces < 2) cambio = '<span class="muted">1 entreno</span>';
    else if (Math.abs(c.cambio) < 0.05) cambio = '<span class="muted">Sin cambios</span>';
    else cambio = '<span class="' + (c.cambio > 0 ? "sube" : "baja") + '">' + (c.cambio > 0 ? "+" : "−") + (Math.round(Math.abs(c.cambio) * 10) / 10).toLocaleString(localeApp()) + ' ' + unidadPeso() + '</span>';
    h += '<button class="clave" data-act="ver-clave" data-a="' + c.id + '">' +
      '<span class="clave-nombre"><b>' + esc(buscarEj(c.id).nombre) + '</b></span>' +
      miniGrafica(c.valores) +
      '<span class="clave-num num"><b>' + (Math.round(c.ultimo * 10) / 10).toLocaleString(localeApp()) + ' ' + unidadPeso() + '</b>' + cambio + '</span></button>';
  }
  return h + '</div>';
}

// Mapa del cuerpo: cada músculo coloreado según las series que le das a la semana
function mapaProgresoHtml(cuenta, semanas, olvidados) {
  let hayDatos = false;
  for (const g in cuenta) if (cuenta[g] > 0) hayDatos = true;
  // Sin entrenos en el periodo, el muñeco sale gris (no en rojo, que desanima)
  if (!hayDatos) {
    return '<div class="card stack"><h3>Mapa del cuerpo</h3>' + mapaCorporal(function () { return "var(--surface3)"; }, "grupo-progreso") +
      '<p class="muted small">Cuando entrenes, cada músculo se pintará de un color según lo que lo trabajas.</p></div>';
  }
  function colorDe(g) { return COLOR_NIVEL[nivelMusculo(g, cuenta[g] / semanas)]; }
  let h = '<div class="card stack"><h3>Mapa del cuerpo</h3>' +
    '<p class="muted small">Series efectivas a la semana de cada músculo (media del periodo). Toca un músculo para ver sus semanas.</p>' +
    mapaCorporal(colorDe, "grupo-progreso") +
    '<div class="row wrap leyenda"><span><i style="background:var(--danger)"></i>Poco</span><span><i style="background:var(--good)"></i>Bien</span><span><i style="background:var(--accent)"></i>Mucho</span></div>' +
    '<p class="muted small">Para ganar músculo, lo normal es dar a cada músculo entre 6 y 20 series a la semana (menos en abdomen, antebrazos, gemelos y aductores).</p>' +
    '<details><summary class="small">Ver los números</summary>';
  let max = 1;
  for (const g in cuenta) max = Math.max(max, cuenta[g] / semanas);
  for (const g in GRUPOS) {
    const v = Math.round(cuenta[g] / semanas * 10) / 10;
    h += '<div class="musculo"><span>' + GRUPOS[g] + '</span><div class="bar"><i style="width:' + (v / max * 100) + '%;background:' + colorDe(g) + '"></i></div><span class="num muted" style="text-align:right">' + v.toLocaleString(localeApp()) + '</span></div>';
  }
  return h + '<p class="muted small">Directas cuentan 1 y como músculo secundario 0,5.</p></details></div>';
}

// ---------- 6) Calendario de constancia: las últimas 12 semanas, un cuadrado por día ----------
function calendarioConstanciaHtml() {
  const entrenados = {};
  for (const s of sesionesValidas()) entrenados[s.fecha] = true;
  const inicio = sumarDias(lunesDe(hoy()), -77);           // lunes de hace 11 semanas
  let h = '<div class="card stack"><h3>Tu constancia</h3><div class="calendario">';
  // Inicial de cada día de la semana en el idioma de la app (L, M, X... o M, T, W...)
  const letras = [];
  for (let i = 0; i < 7; i++) letras.push(new Date(sumarDias(inicio, i) + "T12:00:00").toLocaleDateString(localeApp(), { weekday: "narrow" }));
  let dias = 0;
  for (let fila = 0; fila < 7; fila++) {
    h += '<span class="cal-letra">' + letras[fila] + '</span>';
    for (let semana = 0; semana < 12; semana++) {
      const f = sumarDias(inicio, semana * 7 + fila);
      let clase = "cal-dia";
      if (f > hoy()) clase += " futuro";
      else if (entrenados[f]) { clase += " hecho"; dias++; }
      if (f === hoy()) clase += " hoy";
      h += '<span class="' + clase + '" title="' + fechaBonita(f) + '"></span>';
    }
  }
  const texto = dias === 0 ? "Cada día que entrenes se pintará aquí." : dias + " días entrenados en las últimas 12 semanas. ¡No rompas la cadena!";
  return h + '</div><p class="muted small">' + texto + '</p></div>';
}

// ---------- 7) Peso total levantado, comparado con cosas reales ----------
const EQUIVALENCIAS = [
  [150000, "ballena azul", "ballenas azules", "🐋"],
  [5000, "elefante", "elefantes", "🐘"],
  [1200, "coche", "coches", "🚗"],
  [450, "oso polar", "osos polares", "🐻‍❄️"],
  [40, "perro grande", "perros grandes", "🐕"]
];
function equivalenciaPeso(kgTotal) {
  for (const e of EQUIVALENCIAS) {
    const n = Math.floor(kgTotal / e[0]);
    if (n >= 1) return "Lo mismo que levantar " + (n === 1 ? "1 " + e[1] : n + " " + e[2]) + " " + e[3];
  }
  return "";
}
function pesoTotalHtml(ses) {
  let total = 0;
  for (const s of ses) total += s.volumen || 0;
  if (total <= 0) return "";
  const eq = equivalenciaPeso(total);
  return '<div class="card peso-total"><p class="label">Peso total levantado</p><div class="big-num num">' + miles(pesoVista(total)) + ' ' + unidadPeso() + '</div>' +
    (eq ? '<p>' + eq + '</p>' : "") + '</div>';
}

// ---------- 8) Peso corporal: tendencia y consejo según tu objetivo ----------
// Media de cada valor con los anteriores (hasta "n"), para suavizar los altibajos del día a día
function mediaMovil(valores, n) {
  return valores.map(function (v, i) {
    const trozo = valores.slice(Math.max(0, i - n + 1), i + 1);
    let suma = 0;
    for (const x of trozo) suma += x;
    return suma / trozo.length;
  });
}

// Cuántos kg al mes cambia tu peso (recta que mejor se ajusta a los pesos de los últimos 60 días)
function cambioPesoMensual() {
  const lista = estado.pesoCorporal.filter(function (x) { return x.fecha >= fechaTexto(60); });
  if (lista.length < 3) return null;
  if (diasEntre(lista[0].fecha, lista[lista.length - 1].fecha) < 14) return null;
  const xs = lista.map(function (x) { return diasEntre(lista[0].fecha, x.fecha); });
  const ys = lista.map(function (x) { return x.kg; });
  let mx = 0, my = 0;
  for (let i = 0; i < xs.length; i++) { mx += xs[i]; my += ys[i]; }
  mx /= xs.length; my /= ys.length;
  let arriba = 0, abajo = 0;
  for (let i = 0; i < xs.length; i++) { arriba += (xs[i] - mx) * (ys[i] - my); abajo += (xs[i] - mx) * (xs[i] - mx); }
  return abajo === 0 ? 0 : arriba / abajo * 30;          // kg por día × 30 días
}

function consejoPesoHtml() {
  const c = cambioPesoMensual();
  if (c === null) return '<p class="muted small">Pésate al menos 3 veces en 2 semanas (mejor por la mañana) para ver hacia dónde va tu peso.</p>';
  const obj = estado.perfil.objetivo;
  const cifra = (c > 0 ? "+" : "") + (Math.round(pesoVista(c) * 10) / 10).toLocaleString(localeApp()) + " " + unidadPeso();
  let texto, color = "var(--good)";
  if (obj === "masa") {
    if (c < 0.25) { texto = "Para ganar masa te conviene subir un poco. Come algo más cada día."; color = "var(--warn)"; }
    else if (c > 1.2) { texto = "Subes muy rápido: parte puede ser grasa. Come un poco menos."; color = "var(--warn)"; }
    else texto = "Vas bien: para ganar masa lo ideal es subir entre 0,25 y 1 kg al mes.";
  } else if (obj === "fuerza") {
    if (c < -0.75) { texto = "Estás bajando de peso y eso puede frenar tu fuerza. Come un poco más."; color = "var(--warn)"; }
    else texto = "Vas bien: para ganar fuerza basta con mantener tu peso o subir poco a poco.";
  } else {
    if (Math.abs(c) > 1.5) { texto = "Tu peso cambia bastante rápido. Si no lo buscas, revisa cuánto comes."; color = "var(--warn)"; }
    else texto = "Tu peso está estable. ¡Sigue así!";
  }
  return '<div class="fatiga" style="border-color:' + color + '"><p class="label" style="color:' + color + '">Ritmo: ' + cifra + ' al mes</p><p class="small">' + texto + '</p></div>';
}

// ---------- 9) Resumen del mes para compartir ----------
// Los primeros 5 días de un mes se comparte el mes anterior (el que acaba de terminar)
function mesParaCompartir() {
  const d = new Date();
  if (d.getDate() <= 5) d.setMonth(d.getMonth() - 1);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
}
function nombreMes(mes) {
  return new Date(mes + "-15T12:00:00").toLocaleDateString(localeApp(), { month: "long" });
}
// Datos del mes: entrenos, series, peso total, récords y el ejercicio que más ha mejorado
function datosDelMes(mes) {
  const ses = sesionesValidas().filter(function (s) { return s.fecha.slice(0, 7) === mes; });
  const d = { mes: mes, entrenos: ses.length, series: 0, volumen: 0, prs: 0, mejor: null };
  for (const s of ses) { d.series += s.seriesEfectivas; d.volumen += s.volumen || 0; d.prs += s.prs.length; }
  for (const id of ejerciciosHechos()) {
    const ej = buscarEj(id);
    const porDia = {};
    for (const x of seriesDe(id)) {
      if (x.fecha.slice(0, 7) !== mes) continue;
      const v = rm1Mostrado(cargaSerie(ej, x.peso, x.fecha), x.reps);
      if (porDia[x.fecha] === undefined || v > porDia[x.fecha]) porDia[x.fecha] = v;
    }
    const fechas = Object.keys(porDia).sort();
    if (fechas.length < 2) continue;
    const sube = porDia[fechas[fechas.length - 1]] - porDia[fechas[0]];
    if (sube > 0 && (!d.mejor || sube > d.mejor.sube)) d.mejor = { id: id, sube: sube };
  }
  return d;
}

function pintarProgreso() {
  const ses = sesionesValidas().filter(function (s) { return enPeriodo(s.fecha, periodo); });
  const prev = sesionesValidas().filter(function (s) { return enPeriodo(s.fecha, periodo, true); });
  let efectivas = 0, efectivasPrev = 0, dur = 0, prs = 0;
  for (const s of ses) { efectivas += s.seriesEfectivas; dur += s.duracion; prs += s.prs.length; }
  for (const s of prev) efectivasPrev += s.seriesEfectivas;
  let prsPrev = 0;
  for (const s of prev) prsPrev += s.prs.length;
  function delta(a, b) {
    if (periodo === 0 || b === 0) return "";
    const d = Math.round((a - b) / b * 100);
    return '<span class="small" style="color:' + (d >= 0 ? "var(--good)" : "var(--danger)") + ';font-weight:700"> ' + (d >= 0 ? "+" : "") + d + '%</span>';
  }

  let h = '<div class="head"><div><p class="label">Estadísticas</p><h1>Progreso</h1></div></div><div class="stack">' +
    '<div class="seg pestanas">' + [["resumen", "Resumen"], ["cuerpo", "Cuerpo"], ["historial", "Historial"]].map(function (o) { return '<button data-act="sub-progreso" data-a="' + o[0] + '" class="' + (subProgreso === o[0] ? "on" : "") + '">' + o[1] + '</button>'; }).join("") + '</div>';

  // ----- Pestaña Historial: solo la lista de entrenos -----
  if (subProgreso === "historial") {
    $("app").innerHTML = h + historialSemanasHtml() + '</div>';
    return;
  }

  h += '<div class="seg mini">' + [[28, "4 semanas"], [84, "12 semanas"], [0, "Todo"]].map(function (o) { return '<button data-act="periodo" data-a="' + o[0] + '" class="' + (periodo === o[0] ? "on" : "") + '">' + o[1] + '</button>'; }).join("") + '</div>';

  // ----- Pestaña Cuerpo: peso y medidas -----
  if (subProgreso === "cuerpo") {
    $("app").innerHTML = h + htmlPesoCorporal() + htmlFotosProgreso() + htmlMedidas() + '</div>';
    pintarFotos();
    return;
  }

  // ----- Pestaña Resumen -----
  const clave = ejerciciosClave();
  const cuenta = seriesEfectivasPorGrupo(ses);
  const semanas = semanasDelPeriodo(ses);
  const olvidados = Object.keys(GRUPOS)
    .filter(function (g) { return nivelMusculo(g, cuenta[g] / semanas) === "poco"; })
    .sort(function (a, b) { return cuenta[a] / (MINIMO_SEMANAL[a] || 6) - cuenta[b] / (MINIMO_SEMANAL[b] || 6); });
  h += resumenApixHtml(ses, prev, clave, olvidados) +
    '<div class="grid2 cifras">' +
      '<div class="card"><p class="label">Entrenos</p><div class="big-num num">' + ses.length + delta(ses.length, prev.length) + '</div></div>' +
      '<div class="card"><p class="label">Series efectivas</p><div class="big-num num">' + efectivas + delta(efectivas, efectivasPrev) + '</div><p class="muted small">hechas y válidas</p></div>' +
      '<div class="card"><p class="label">Duración media</p><div class="big-num num">' + (ses.length ? Math.round(dur / ses.length) : 0) + '</div><p class="muted small">minutos reales</p></div>' +
      '<div class="card"><p class="label">Récords</p><div class="big-num num" style="color:var(--pr)">' + prs + delta(prs, prsPrev) + '</div><p class="muted small">racha: ' + rachaSemanas() + ' sem</p></div>' +
    '</div>' +
    (periodo && prev.length ? '<p class="muted small">Los % comparan con las ' + (periodo / 7) + ' semanas anteriores.</p>' : "");

  h += pesoTotalHtml(ses);
  h += calendarioConstanciaHtml();
  h += ejerciciosClaveHtml(clave);

  // Carga semanal o mensual y fatiga
  const serie = vistaCarga === "mes" ? cargaPorMeses(6) : cargaPorSemanas(8);
  const fat = indiceFatiga();
  const colorFat = { "muy-alta": "var(--danger)", alta: "var(--warn)", normal: "var(--good)", baja: "var(--muted)", pocos: "var(--muted)" }[fat.nivel];
  h += '<div class="card stack"><div class="row between"><h3>Carga de entrenamiento</h3><div class="seg mini">' + [["semana", "Semanal"], ["mes", "Mensual"]].map(function (o) { return '<button data-act="vista-carga" data-a="' + o[0] + '" class="' + (vistaCarga === o[0] ? "on" : "") + '">' + o[1] + '</button>'; }).join("") + '</div></div>' +
    graficaBarras(serie.map(function (x, i) { if (i === serie.length - 1) return "Ahora"; return vistaCarga === "mes" ? MESES_CORTOS[parseInt(x.desde.slice(5, 7)) - 1] : fechaBonita(x.desde); }), serie.map(function (x) { return Math.round(pesoVista(x.carga.kg)); }), unidadPeso()) +
    '<div class="fatiga" style="border-color:' + colorFat + '"><p class="label" style="color:' + colorFat + '">Fatiga · ' + { "muy-alta": "muy alta", alta: "alta", normal: "normal", baja: "baja", pocos: "sin datos" }[fat.nivel] + (fat.ratio ? ' (' + fat.ratio.toFixed(2).replace(".", ",") + ')' : "") + '</p><p class="small">' + fat.texto + '</p></div>' +
    '<p class="muted small">Tonelaje = kg × reps. La fatiga compara tus series de los últimos 7 días con tu media de las 4 semanas anteriores.</p></div>';

  // Evolución de un ejercicio (aquí sí tiene sentido el peso: se compara el ejercicio consigo mismo)
  const hechos = ejerciciosHechos();
  if (hechos.length) {
    if (!hechos.includes(ejGrafica)) ejGrafica = hechos[0];
    const ej = buscarEj(ejGrafica);
    const porDia = {};
    for (const s of seriesDe(ejGrafica)) {
      if (!enPeriodo(s.fecha, periodo)) continue;
      let v;
      if (metrica === "rm") v = rm1Mostrado(cargaSerie(ej, s.peso, s.fecha), s.reps);
      else if (metrica === "peso") v = s.peso;
      else if (metrica === "reps") v = s.reps;
      else v = s.peso * s.reps;
      if (metrica === "tonelaje") porDia[s.fecha] = (porDia[s.fecha] || 0) + v;
      else if (porDia[s.fecha] === undefined || v > porDia[s.fecha]) porDia[s.fecha] = v;
    }
    const fechas = Object.keys(porDia).sort();
    const unidades = { rm: unidadPeso(), peso: unidadPeso(), reps: "reps", tonelaje: unidadPeso() };
    h += '<div class="card stack" id="evolucion"><h3>Evolución por ejercicio</h3>' +
      '<select data-cambio="ej-grafica" aria-label="Ejercicio">' + hechos.map(function (id) { return '<option value="' + id + '"' + (id === ejGrafica ? " selected" : "") + '>' + esc(buscarEj(id).nombre) + '</option>'; }).join("") + '</select>' +
      '<div class="seg">' + [["rm", "1RM"], ["peso", "Peso máx."], ["reps", "Reps máx."], ["tonelaje", "Tonelaje"]].map(function (o) { return '<button data-act="metrica" data-a="' + o[0] + '" class="' + (metrica === o[0] ? "on" : "") + '">' + o[1] + '</button>'; }).join("") + '</div>' +
      graficaLinea(fechas.map(fechaBonita), fechas.map(function (f) { return metrica === "reps" ? porDia[f] : pesoVista(porDia[f]); }), unidades[metrica], null, true) +
      '<p class="muted small"><span class="punto-oro"></span> Récord: ese día superaste todo lo anterior.</p>' +
      (metrica === "rm" ? '<p class="muted small">1RM estimada con ' + FORMULAS_1RM[estado.ajustes.formula1RM || "epley"].nombre.replace(" (por defecto)", "") + '. Cámbiala en Ajustes.</p>' : "") +
      (metrica === "tonelaje" ? '<p class="muted small">Tonelaje externo de este ejercicio (kg × reps). ' + (ej.equipo === "corporal" ? "En este ejercicio no incluye tu peso corporal, así que puede ser 0." : "") + '</p>' : "") + '</div>';
  }

  // Series efectivas por semana (todas las semanas, también las que no entrenaste)
  const desde = ses.length ? ses[0].fecha : hoy();
  const lunes = semanasEntre(periodo ? fechaTexto(periodo - 1) : desde, hoy());
  const porSemana = {};
  for (const l of lunes) porSemana[l] = 0;
  for (const s of ses) {
    const l = lunesDe(s.fecha);
    if (porSemana[l] === undefined) continue;
    const g = seriesEfectivasPorGrupo([s]);
    if (grupoVolumen) porSemana[l] += g[grupoVolumen];
    else porSemana[l] += s.seriesEfectivas;
  }
  h += mapaProgresoHtml(cuenta, semanas, olvidados);
  h += '<div class="card stack" id="series-semana"><h3>Series efectivas por semana</h3><select data-cambio="grupo-volumen" aria-label="Grupo muscular"><option value="">Todo el cuerpo</option>' +
    Object.keys(GRUPOS).map(function (g) { return '<option value="' + g + '"' + (g === grupoVolumen ? " selected" : "") + '>' + GRUPOS[g] + '</option>'; }).join("") + '</select>' +
    graficaBarras(lunes.map(function (l) { return l === lunesDe(hoy()) ? "Ahora" : fechaBonita(l); }), lunes.map(function (l) { return porSemana[l]; }), "series") +
    '<p class="muted small">' + (grupoVolumen ? "Directas cuentan 1 y secundarias 0,5. " : "") + '«Ahora» es la semana en curso: aún no ha terminado.</p></div>';

  $("app").innerHTML = h + '</div>';
}

// Tarjeta de peso corporal (pestaña Cuerpo)
function htmlPesoCorporal() {
  let h = '';
  const pc = estado.pesoCorporal.filter(function (x) { return enPeriodo(x.fecha, periodo); });
  const valoresPeso = pc.map(function (x) { return pesoVista(x.kg); });
  const tendencia = pc.length >= 3 ? mediaMovil(valoresPeso, 5) : null;
  h += '<div class="card stack"><h3>Peso corporal</h3>' + graficaLinea(pc.map(function (x) { return fechaBonita(x.fecha); }), valoresPeso, unidadPeso(), tendencia) +
    (tendencia ? '<p class="muted small"><span style="color:var(--good)">- - -</span> Tendencia: la media de tus últimos pesos. El peso sube y baja cada día; la tendencia dice la verdad.</p>' : "") +
    consejoPesoHtml() +
    '<div class="row"><input id="nuevoPeso" type="text" inputmode="decimal" autocomplete="off" placeholder="Peso de hoy (' + unidadPeso() + ')" aria-label="Peso de hoy"><button class="btn auto" data-act="guardar-peso">Guardar</button></div><p class="err" id="errPeso"></p></div>';

  return h;
}

// Tarjeta de medidas corporales (pestaña Cuerpo)
function htmlMedidas() {
  let h = '';
  const meds = (estado.medidas || []).filter(function (m) { return enPeriodo(m.fecha, periodo) && typeof m[medidaGrafica] === "number"; });
  const ultimaMed = (estado.medidas || [])[(estado.medidas || []).length - 1] || {};
  h += '<div class="card stack"><h3>Medidas corporales</h3>' +
    '<div class="seg">' + CAMPOS_MEDIDAS.map(function (c) { return '<button data-act="medida-grafica" data-a="' + c[0] + '" class="' + (medidaGrafica === c[0] ? "on" : "") + '">' + c[1] + '</button>'; }).join("") + '</div>' +
    (meds.length ? graficaLinea(meds.map(function (m) { return fechaBonita(m.fecha); }), meds.map(function (m) { return m[medidaGrafica]; }), "cm") : '<p class="muted small">Apunta tus medidas una vez al mes para ver cómo crecen.</p>') +
    '<div class="row wrap cambios-medidas">' + CAMPOS_MEDIDAS.map(function (c) {
      const d = cambioMedida(c[0]);
      return d === null ? "" : '<span class="pill ' + (d > 0 ? "up" : (d < 0 ? "down" : "keep")) + '">' + c[1] + ' ' + (d > 0 ? "+" : "") + String(d).replace(".", ",") + ' cm</span>';
    }).join("") + '</div>' +
    '<div class="grid2 medidas-form">' + CAMPOS_MEDIDAS.map(function (c) {
      return '<label class="f small">' + c[1] + ' (cm)<input id="med-' + c[0] + '" type="text" inputmode="decimal" autocomplete="off" placeholder="' + (ultimaMed[c[0]] ? String(ultimaMed[c[0]]).replace(".", ",") : "—") + '"></label>';
    }).join("") + '</div>' +
    '<button class="btn" data-act="guardar-medidas">Guardar medidas de hoy</button><p class="err" id="errMedidas"></p>' +
    '<p class="muted small">Mide siempre igual: por la mañana, sin bombear, brazo y muslo en su parte más ancha y cintura a la altura del ombligo.</p></div>';

  return h;
}

// Historial de entrenos agrupado por semanas (de lunes a domingo), con los totales de cada semana
let semanasHistorial = 8;
function historialSemanasHtml() {
  let h = '<div class="card"><h3>Mis entrenos</h3>';
  if (estado.sesiones.length === 0) return h + '<p class="muted" style="padding-top:8px">Tus entrenos completados aparecerán aquí.</p></div>';
  // 1) Agrupar: la clave de cada grupo es el lunes de esa semana
  const grupos = {};
  for (const s of estado.sesiones) {
    const lunes = lunesDe(s.fecha);
    if (!grupos[lunes]) grupos[lunes] = [];
    grupos[lunes].push(s);
  }
  const semanas = Object.keys(grupos).sort().reverse();       // la más reciente primero
  const estaSemana = lunesDe(hoy());
  // 2) Pintar cada semana
  for (const lunes of semanas.slice(0, semanasHistorial)) {
    const lista = grupos[lunes].slice().reverse();
    let series = 0, kg = 0, prs = 0;
    for (const s of lista) { series += s.seriesEfectivas; kg += s.volumen; prs += s.prs.length; }
    const titulo = lunes === estaSemana ? "Esta semana" : (lunes === sumarDias(estaSemana, -7) ? "Semana pasada" : "Semana del " + fechaBonita(lunes));
    h += '<div class="semana"><div class="row between semana-cab"><span class="name small">' + titulo + '</span><span class="muted small num">' +
      lista.length + (lista.length === 1 ? ' entreno · ' : ' entrenos · ') + series + ' series · ' + miles(kg) + ' kg' + (prs ? ' · 🏆 ' + prs : "") + '</span></div><div class="list">';
    for (const s of lista) {
      h += '<button class="item" data-act="ver-sesion" data-a="' + s.id + '"><div class="grow"><span class="name">' + esc(s.diaNombre) + '</span><span class="muted small num">' + fechaBonita(s.fecha) + ' · ' + s.duracion + ' min · ' + s.seriesEfectivas + ' series efectivas</span></div>' +
        (s.prs.length ? '<span class="pill pr">' + s.prs.length + ' PR</span>' : "") + '</button>';
    }
    h += '</div></div>';
  }
  if (semanas.length > semanasHistorial) h += '<button class="btn-sec full" data-act="historial-mas">Ver semanas anteriores (' + (semanas.length - semanasHistorial) + ' más)</button>';
  return h + '</div>';
}

// =====================================================
// PANTALLA: SOCIAL
// =====================================================
// Fuera del modo demo no hay otros usuarios (no hay servidor): Social es tu diario y tus retos.
// En modo demo, el contenido ficticio va siempre marcado como "Demo".

function usuarioDemo(uid) { return USUARIOS_DEMO.find(function (x) { return x.uid === uid; }); }

function pintarSocial() {
  if (estado.perfil.edad < 16) {
    $("app").innerHTML = '<div class="head"><div><p class="label">Comunidad</p><h1>Social</h1></div></div><div class="card stack tight"><h3>No disponible</h3><p class="muted">La parte social está desactivada para menores de 16 años para proteger tu privacidad. El resto de la app funciona igual.</p></div>';
    return;
  }
  const demo = estado.modo === "demo";
  const vistas = [["feed", "Actividad"], ["amigos", "Amigos"], ["retos", "Retos"]];
  let h = '<div class="head"><div><p class="label">Comunidad</p><h1>Social</h1></div>' + (demo ? '<span class="demo-tag">Demo</span>' : "") + '</div><div class="stack">' +
    (demo ? '<p class="muted small">Los demás usuarios de la demo son ficticios.</p>' : "") +
    '<div class="seg">' + vistas.map(function (o) { return '<button data-act="vista-social" data-a="' + o[0] + '" class="' + (vistaSocial === o[0] ? "on" : "") + '">' + o[1] + '</button>'; }).join("") + '</div>';
  if (vistaSocial === "retos") h += retosHtml();
  else if (demo) h += vistaSocial === "feed" ? feedHtml() : amigosHtml();
  else if (!conectado()) h += socialSinCuentaHtml();
  else h += vistaSocial === "feed" ? actividadNubeHtml() : amigosNubeHtml();
  $("app").innerHTML = h + '</div>';
  // Con cuenta, se leen los amigos y la actividad de la nube (y se vuelve a pintar al llegar)
  if (!demo && conectado() && vistaSocial !== "retos" && !socialNube.cargado && !socialNube.cargando && !socialNube.error) {
    cargarSocialNube().then(function () { if (tab === "social") pintarSocial(); });
  }
}

// ---------- Social con cuenta en la nube ----------
function socialSinCuentaHtml() {
  return '<div class="card stack tight"><h3>☁️ Crea tu cuenta para tener amigos</h3>' +
    '<p class="small">Con una cuenta gratis puedes añadir a tus amigos por su nombre de usuario, ver su rango, su racha y sus entrenos, y competir en un ranking.</p>' +
    '<button class="btn full" data-act="abrir-cuenta" data-a="crear">Crear cuenta</button>' +
    '<button class="btn-sec full" data-act="abrir-cuenta" data-a="entrar">Ya tengo cuenta: iniciar sesión</button></div>';
}

function estadoCargaSocial() {
  if (socialNube.error) {
    // Sin sesión no sirve reintentar: mejor un botón para volver a entrar
    const boton = conectado() ? '<button class="btn-sec" data-act="social-recargar">Reintentar</button>' : '<button class="btn" data-act="abrir-cuenta" data-a="entrar">Iniciar sesión</button>';
    return '<div class="card stack tight"><p class="err small">' + esc(socialNube.error) + '</p>' + boton + '</div>';
  }
  if (!socialNube.cargado) return '<div class="card"><p class="muted">Cargando…</p></div>';
  return "";
}

function amigosNubeHtml() {
  const carga = estadoCargaSocial();
  let h = '<div class="card stack tight"><h3>Añadir amigo</h3><div class="row"><input id="nombreAmigo" placeholder="Su nombre de usuario" autocapitalize="off" maxlength="21" aria-label="Nombre de usuario de tu amigo"><button class="btn-sec" data-act="social-solicitar">Enviar</button></div>' +
    '<p class="err small" id="amigoError"></p>' +
    '<p class="muted small">Tu usuario es <b>@' + esc(estado.perfil.usuario) + '</b>. Pásaselo a tus amigos o envíales tu enlace:</p>' +
    '<button class="btn-sec full" data-act="social-invitar">Invitar a un amigo</button></div>';
  if (carga) return h + carga;
  if (socialNube.recibidas.length) {
    h += '<div class="card"><h3>Solicitudes recibidas (' + socialNube.recibidas.length + ')</h3><div class="list">';
    for (const s of socialNube.recibidas) h += '<div class="item">' + insignia(s.perfil ? s.perfil.rango : null, "sm") + '<div class="grow"><span class="name">@' + esc(s.usuario || "?") + '</span><span class="muted small">Quiere ser tu amigo</span></div>' +
      '<button class="btn-sec small" data-act="social-aceptar" data-a="' + esc(s.id) + '">Aceptar</button><button class="btn-txt small" data-act="social-borrar" data-a="' + esc(s.id) + '">Rechazar</button></div>';
    h += '</div></div>';
  }
  const ranking = rankingAmigos();
  if (ranking.length >= 3) h += podioHtml(ranking);
  h += '<div class="card"><h3>Ranking de amigos</h3>' + (ranking.length > 1 ? '<p class="muted small">Toca a un amigo para ver su perfil y sus entrenos.</p>' : "") + '<div class="list">';
  if (ranking.length <= 1) h += '<p class="muted" style="padding-top:8px">Aún no tienes amigos. Añade a alguien por su usuario para competir en el ranking.</p>';
  ranking.forEach(function (a, i) {
    h += '<div class="item' + (a.yo ? '' : ' tocable') + '" style="align-items:flex-start"' + (a.yo ? '' : ' data-act="ver-amigo" data-a="' + esc(a.id) + '"') + '><span class="num" style="width:22px;font-weight:700">' + (i < 3 && ranking.length > 1 ? ["🥇", "🥈", "🥉"][i] : i + 1) + '</span>' + insignia(a.rango, "sm") + '<div class="grow bloque">' + (a.yo ? '<span class="name">@' + esc(a.usuario || "?") + ' (tú)</span>' : '<button class="link-nombre name" data-act="ver-amigo" data-a="' + esc(a.id) + '">@' + esc(a.usuario || "?") + ' ›</button>') +
      '<span class="muted small">' + nombreRango(a.rango) + ' · racha ' + a.racha + ' sem · ' + a.entrenos + ' entrenos</span>' +
      (a.marcas.length ? '<span class="small">' + a.marcas.map(function (r) { return esc(r.n) + ' ' + String(r.p).replace(".", ",") + '×' + r.r; }).join(" · ") + '</span>' : "") + '</div>' +
      (a.yo ? "" : '<button class="btn-txt small btn-danger" data-act="social-quitar" data-a="' + esc(a.id) + '">' + (confirmar === "social-quitar" + a.id ? "¿Seguro?" : "Quitar") + '</button>') + '</div>';
  });
  h += '</div></div>';
  if (socialNube.enviadas.length) {
    h += '<div class="card"><h3>Solicitudes enviadas</h3><div class="list">';
    for (const s of socialNube.enviadas) h += '<div class="item"><div class="grow"><span class="name">@' + esc(s.usuario || "…") + '</span><span class="muted small">Esperando a que acepte</span></div><button class="btn-txt small" data-act="social-borrar" data-a="' + esc(s.id) + '">Cancelar</button></div>';
    h += '</div></div>';
  }
  if (estado.ajustes.privacidad === "privado") h += '<p class="muted small">Tu perfil es privado: nadie puede encontrarte ni ver tus datos. Cámbialo en Ajustes.</p>';
  return h;
}

// Podio: los tres primeros del ranking (el 1.º en el centro y más alto)
function podioHtml(ranking) {
  let h = '<div class="card podio">';
  for (const pos of [1, 0, 2]) {
    const a = ranking[pos];
    h += '<div class="podio-puesto p' + (pos + 1) + (a.yo ? '' : ' tocable') + '"' + (a.yo ? '' : ' data-act="ver-amigo" data-a="' + esc(a.id) + '"') + '>' +
      (pos === 0 ? '<span class="corona" aria-hidden="true">👑</span>' : "") + avatarColor(a.usuario, "grande") +
      '<span class="name small podio-nombre">' + (a.yo ? "Tú" : '@' + esc(a.usuario || "?")) + '</span>' +
      '<span class="muted small">' + nombreRango(a.rango) + '</span>' +
      '<div class="escalon-podio"><b class="num">' + (pos + 1) + '</b></div></div>';
  }
  return h + '</div>';
}

function actividadNubeHtml() {
  const ultima = estado.sesiones[estado.sesiones.length - 1];
  let h = '<div class="card stack tight"><h3>Tu último entreno</h3>';
  if (!ultima) h += '<p class="muted small">Cuando termines un entreno, tus amigos lo verán aquí.</p>';
  else {
    h += '<p class="small">' + esc(textoSesion(ultima)) + '</p><div class="grid2">' +
      (ultima.publicadaNube ? '<button class="btn-sec" disabled>✓ Compartido</button>' : '<button class="btn-sec" data-act="social-publicar"' + (estado.ajustes.compartir === false ? " disabled" : "") + '>Compartir con mis amigos</button>') +
      '<button class="btn" data-act="compartir-fuera">Enviar fuera…</button></div>';
    if (estado.ajustes.compartir === false) h += '<p class="muted small">Tienes desactivado «Mostrar mis entrenos». Actívalo en Ajustes.</p>';
  }
  h += '</div>';
  const carga = estadoCargaSocial();
  if (carga) return h + carga;
  // En Actividad solo salen TUS entrenos. Los de cada amigo están en su perfil (pestaña Amigos).
  const posts = socialNube.posts.filter(function (x) { return x.mio; });
  h += '<div class="card"><h3>Mi actividad</h3><div>';
  if (posts.length === 0) h += '<p class="muted">Aún no has compartido entrenos. Se comparten solos al terminar si tienes activado «Mostrar mis entrenos» en Ajustes.</p>';
  for (const x of posts) h += postNubeHtml(x);
  return h + '</div></div><button class="btn-txt" data-act="social-recargar">Actualizar</button>';
}

// Cada usuario tiene siempre el mismo color (sale de las letras de su nombre)
function colorUsuario(nombre) {
  let n = 0;
  for (const c of String(nombre || "?")) n = (n * 31 + c.charCodeAt(0)) % 360;
  return "hsl(" + n + " 62% 52%)";
}
function avatarColor(nombre, extra) {
  return '<span class="avatar de-color' + (extra ? " " + extra : "") + '" style="background:' + colorUsuario(nombre) + '">' + esc((nombre || "?")[0]).toUpperCase() + '</span>';
}

// Una publicación de la nube: autor, resumen del entreno y reacciones
function postNubeHtml(x) {
  let h = '<div class="post"><div class="row">' +
    '<button class="avatar de-color" style="background:' + colorUsuario(x.autor) + '" ' + (x.mio ? "" : 'data-act="ver-amigo" data-a="' + esc(x.autorId) + '" aria-label="Ver perfil"') + '>' + esc((x.autor || "?")[0]).toUpperCase() + '</button>' +
    '<div class="grow">' + (x.mio ? '<span class="name small">@' + esc(x.autor) + ' (tú)</span>' : '<button class="link-nombre name small" data-act="ver-amigo" data-a="' + esc(x.autorId) + '">@' + esc(x.autor) + '</button>') +
    '<span class="muted small">' + fechaBonita(x.fecha) + '</span></div>' +
    '<span class="pill ' + (x.tipo === "record" ? "pr" : (x.tipo === "rango" ? "up" : "keep")) + '">' + { record: "Récord", rango: "Rango", entreno: "Entreno" }[x.tipo] + '</span></div>';
  const d = x.detalle;
  if (d && d.e) {
    h += '<p class="post-titulo"><b>' + esc(d.n) + '</b></p><div class="post-datos"><span>⏱ ' + d.d + ' min</span><span>🏋️ ' + d.e.length + ' ejercicios</span><span class="num">' + miles(d.v) + ' kg</span>' +
      (d.p && d.p.length ? '<span class="con-record">🏆 ' + d.p.length + ' récord(s)</span>' : "") + '</div>' +
      '<p class="small">' + esc(d.e.slice(0, 3).map(function (e) { const ej = buscarEj(e.i); return (ej ? ej.nombre : e.i); }).join(" · ")) + (d.e.length > 3 ? " …" : "") + '</p>' +
      '<button class="btn-sec small" data-act="ver-post" data-a="' + esc(x.id) + '">Ver entreno completo</button>';
  } else h += '<p>' + esc(x.texto) + '</p>';
  h += '<div class="acts reacciones">' + REACCIONES.map(function (r) {
    const n = x.reacciones.filter(function (y) { return y.r === r; }).length;
    const mia = x.reacciones.some(function (y) { return y.u === nube.id && y.r === r; });
    return '<button class="reaccion' + (mia ? " on" : "") + '" data-act="social-reaccion" data-a="' + esc(x.id) + '" data-b="' + r + '" aria-label="Reaccionar ' + r + '"><span class="emoji">' + r + '</span>' + (n ? '<span class="num">' + n + '</span>' : "") + '</button>';
  }).join("") +
    (x.mio ? '<button data-act="social-borrar-post" data-a="' + esc(x.id) + '">' + (confirmar === "social-borrar-post" + x.id ? "Pulsa otra vez" : "Eliminar") + '</button>'
           : '<button data-act="social-denunciar" data-a="' + esc(x.id) + '">Denunciar</button>') + '</div></div>';
  return h;
}

// ---------- Perfil de un amigo y detalle de un entreno ----------
let hojaSocial = null;           // qué hoja social está abierta: { tipo: "amigo"|"post", id }
const postsAmigo = {};           // publicaciones de cada amigo ya cargadas

function postPorId(id) {
  let p = socialNube.posts.find(function (x) { return x.id === id; });
  if (p) return p;
  for (const k in postsAmigo) { p = (postsAmigo[k] || []).find(function (x) { return x.id === id; }); if (p) return p; }
  return null;
}
// Vuelve a pintar Social y la hoja abierta (por ejemplo tras reaccionar)
function repintarSocial() {
  if (tab === "social") pintarSocial();
  if (hojaSocial && !$("hoja").hidden) { if (hojaSocial.tipo === "amigo") hojaAmigo(hojaSocial.id, true); else hojaPost(hojaSocial.id, true); }
}

function hojaAmigo(id, mantener) {
  const a = socialNube.amigos.find(function (x) { return x.id === id; });
  if (!a) return;
  hojaSocial = { tipo: "amigo", id: id };
  const p = a.perfil || {};
  let h = cabeceraHoja('@' + esc(a.usuario || "?"), "Perfil de tu amigo") + '<div class="stack">' +
    '<div class="card row" style="gap:14px">' + insignia(p.rango, "md") + '<div class="grow"><p class="name">' + nombreRango(p.rango) + '</p>' +
    '<p class="muted small">🔥 Racha de ' + (p.racha || 0) + (p.racha === 1 ? ' semana · ' : ' semanas · ') + (p.entrenos || 0) + (p.entrenos === 1 ? ' entreno' : ' entrenos') + '</p></div></div>';
  const marcas = p.marcas || [];
  if (marcas.length) h += '<div class="card"><h3>Sus mejores marcas</h3><div class="list">' + marcas.map(function (r) {
    return '<div class="item"><div class="grow"><span class="name small">' + esc(r.n) + '</span></div><span class="num">' + String(r.p).replace(".", ",") + ' kg × ' + r.r + '</span></div>';
  }).join("") + '</div></div>';
  h += '<div class="card"><h3>Actividad</h3><div>';
  const lista = postsAmigo[id];
  if (lista === undefined) h += '<p class="muted">Cargando…</p>';
  else if (lista === null) h += '<p class="err small">No se han podido cargar. Prueba otra vez más tarde.</p>';
  else if (!lista.length) h += '<p class="muted">Todavía no ha compartido ningún entreno.</p>';
  else for (const x of lista) h += postNubeHtml(x);
  h += '</div></div>' +
    '<button class="btn-txt small btn-danger" data-act="social-quitar" data-a="' + esc(id) + '">' + (confirmar === "social-quitar" + id ? "¿Seguro?" : "Quitar de amigos") + '</button></div>';
  if (mantener) { const c = $("hojaContenido"), y = c.scrollTop; c.innerHTML = h; c.scrollTop = y; } else abrirHoja(h);
  if (lista === undefined) cargarPostsDe(id).then(function (r) {
    postsAmigo[id] = r;
    if (hojaSocial && hojaSocial.tipo === "amigo" && hojaSocial.id === id && !$("hoja").hidden) hojaAmigo(id, true);
  });
}

// Mejor serie (por 1RM estimado) de una lista [[kg, reps], ...]
function mejorDeLista(series) {
  let mejor = null, valor = -1;
  for (const x of series) { const v = unaRM(x[0], x[1]); if (v > valor) { valor = v; mejor = x; } }
  return mejor;
}

function hojaPost(id, mantener) {
  const x = postPorId(id);
  if (!x || !x.detalle) return;
  hojaSocial = { tipo: "post", id: id };
  const d = x.detalle;
  let h = cabeceraHoja(esc(d.n), (x.mio ? "Tu entreno" : "@" + esc(x.autor)) + " · " + fechaBonita(x.fecha)) + '<div class="stack"><div class="grid3">' +
    '<div class="card"><p class="label">Duración</p><div class="big-num num">' + d.d + '</div><p class="muted small">min</p></div>' +
    '<div class="card"><p class="label">Ejercicios</p><div class="big-num num">' + d.e.length + '</div></div>' +
    '<div class="card"><p class="label">Tonelaje</p><div class="big-num num">' + miles(pesoVista(d.v)) + '</div><p class="muted small">' + unidadPeso() + '</p></div></div>';
  for (const e of d.e) {
    const ej = buscarEj(e.i);
    h += '<div class="card stack tight"><div class="row between"><h3>' + esc(ej ? ej.nombre : e.i) + '</h3>' + ((d.p || []).indexOf(e.i) >= 0 ? '<span class="pill pr">Récord</span>' : "") + '</div>';
    e.s.forEach(function (y, i) { h += '<div class="row between small"><span>Serie ' + (i + 1) + '</span><span class="num">' + String(y[0]).replace(".", ",") + ' kg × ' + y[1] + '</span></div>'; });
    // Comparar su mejor serie con la tuya en ese ejercicio
    if (!x.mio && ej) {
      const suya = mejorDeLista(e.s);
      const tuya = mejorSerie(e.i);
      if (!tuya) h += '<p class="muted small comparar">Tú aún no has hecho este ejercicio.</p>';
      else if (suya) {
        const a = unaRM(suya[0], suya[1]), b = unaRM(tuya.peso, tuya.reps);
        const dif = a > 0 ? Math.round((b - a) / a * 100) : 0;
        h += '<p class="small comparar"><span class="muted">Su mejor serie hoy: ' + String(suya[0]).replace(".", ",") + ' × ' + suya[1] + ' · Tu mejor serie: ' + String(tuya.peso).replace(".", ",") + ' × ' + tuya.reps + '</span><br>' +
          (Math.abs(dif) < 3 ? '<b>🤝 Estáis muy igualados</b>' : (dif > 0 ? '<b style="color:var(--good)">💪 Tú vas un ' + dif + ' % por delante</b>' : '<b style="color:var(--warn)">🎯 Te saca un ' + (-dif) + ' %: ¡a por él!</b>')) + '</p>';
      }
    }
    h += '</div>';
  }
  if (!x.mio) h += '<p class="muted small">La comparación usa la fuerza estimada (1RM) de la mejor serie: así se pueden comparar series con distintas repeticiones.</p>';
  h += '</div>';
  if (mantener) { const c = $("hojaContenido"), y = c.scrollTop; c.innerHTML = h; c.scrollTop = y; } else abrirHoja(h);
}

function feedHtml() {
  const yo = miId();
  const posts = feedVisible();
  const permiso = puedePublicar();
  const ultima = estado.sesiones[estado.sesiones.length - 1];
  let h = '<div class="card stack tight"><h3>Tu último entreno</h3>';
  if (!ultima) h += '<p class="muted small">Cuando termines un entreno podrás guardarlo aquí y enviarlo a tus amigos.</p>';
  else {
    h += '<p class="small">' + esc(textoSesion(ultima)) + '</p><div class="grid2">' +
      (ultima.compartida ? '<button class="btn-sec" disabled>✓ En tu diario</button>' : '<button class="btn-sec" data-act="publicar-ultimo"' + (permiso.ok ? "" : " disabled") + '>Guardar en mi diario</button>') +
      '<button class="btn" data-act="compartir-fuera">Enviar a amigos</button></div>' +
      '<p class="muted small">«Enviar» abre WhatsApp, Instagram u otra app de tu móvil.</p>';
    if (!permiso.ok) h += '<p class="muted small">' + esc(permiso.msg) + '</p>';
  }
  h += '</div>';
  h += '<div class="card"><div>';
  if (posts.length === 0) h += '<p class="muted">Todavía no hay publicaciones.</p>';
  for (const x of posts) {
    const mio = x.autorId === yo;
    const autor = nombreDe(x.autorId, x.autorNombre);
    const gusta = x.likes.includes(yo);
    h += '<div class="post' + (x.id === postNuevo ? " nuevo" : "") + '"><div class="row">' + avatarColor(autor) +
      '<div class="grow"><span class="name small">@' + esc(autor) + (mio ? " (tú)" : "") + '</span><span class="muted small">' + fechaBonita(x.fecha) + (x.demo ? " · ficticio" : "") + '</span></div>' +
      '<span class="pill ' + (x.tipo === "record" ? "pr" : (x.tipo === "rango" ? "up" : "keep")) + '">' + { record: "Récord", rango: "Rango", entreno: "Entreno" }[x.tipo] + '</span></div>' +
      '<p>' + esc(x.texto) + '</p>' +
      '<div class="acts"><button class="reaccion' + (gusta ? " on" : "") + '" data-act="like" data-a="' + x.id + '"><span class="emoji">' + (gusta ? "♥" : "♡") + '</span><span class="num">' + x.likes.length + '</span></button>' +
      '<span>' + x.comentarios.length + ' comentarios</span>' +
      (mio ? '<button data-act="borrar-post" data-a="' + x.id + '">' + (confirmar === "borrar-post" + x.id ? "Pulsa otra vez" : "Eliminar") + '</button>'
           : '<button data-act="denunciar" data-a="' + x.id + '">Denunciar</button>') + '</div>';
    for (const c of x.comentarios) h += '<p class="comment"><b>@' + esc(nombreDe(c.autorId, c.autorNombre)) + '</b> ' + esc(c.texto) + '</p>';
    h += '<div class="row"><input placeholder="Escribe un comentario" id="com-' + x.id + '" maxlength="200" aria-label="Comentario"><button class="btn-sec" data-act="comentar" data-a="' + x.id + '">Enviar</button></div></div>';
  }
  return h + '</div></div>';
}

function amigosHtml() {
  const t = miTarjeta();
  const permiso = puedeCompartirTarjeta();
  let h = '<div class="card stack tight"><h3>Tu tarjeta de amigo</h3><div class="item" style="padding:4px 0">' + insignia(t.rango, "sm") +
    '<div class="grow"><span class="name">@' + esc(t.usuario) + '</span><span class="muted small">' + nombreRango(t.rango) + ' · racha ' + t.racha + ' sem · ' + t.entrenos + ' entrenos</span></div></div>' +
    '<button class="btn" data-act="compartir-tarjeta"' + (permiso.ok ? "" : " disabled") + '>Invitar a un amigo</button>' +
    '<p class="muted small">' + (permiso.ok ? "Le llega un enlace con tu rango, racha y 3 mejores marcas. Vuelve a enviarlo cuando mejores." : esc(permiso.msg)) + '</p></div>';
  h += '<div class="card stack tight"><h3>Añadir amigo</h3><div class="row"><input id="codigoAmigo" placeholder="Pega su enlace o código" aria-label="Enlace o código de tu amigo"><button class="btn-sec" data-act="anadir-amigo-real">Añadir</button></div>' +
    '<p class="muted small">Si abres su enlace en este móvil, se añade solo.</p></div>';
  const reales = estado.social.amigosReales || [];
  h += '<div class="card"><h3>Tus amigos' + (reales.length ? ' (' + reales.length + ')' : "") + '</h3><div class="list">';
  if (reales.length === 0) h += '<p class="muted" style="padding-top:8px">Aún no has añadido a nadie.</p>';
  for (const a of reales.slice().sort(function (x, y) { return (y.rango === null ? -1 : y.rango) - (x.rango === null ? -1 : x.rango); })) {
    h += '<div class="item" style="align-items:flex-start">' + insignia(a.rango, "sm") + '<div class="grow bloque"><span class="name">@' + esc(a.usuario) + '</span>' +
      '<span class="muted small">' + nombreRango(a.rango) + ' · racha ' + a.racha + ' sem · ' + a.entrenos + ' entrenos</span>' +
      (a.records.length ? '<span class="small">' + a.records.map(function (r) { return esc(r.n) + ' ' + String(r.p).replace(".", ",") + '×' + r.r; }).join(" · ") + '</span>' : "") +
      '<span class="muted small">Actualizado ' + fechaBonita(a.fecha) + '</span></div>' +
      '<button class="btn-txt small btn-danger" data-act="quitar-amigo-real" data-a="' + esc(a.uid) + '">' + (confirmar === "quitar-amigo-real" + a.uid ? "¿Seguro?" : "Quitar") + '</button></div>';
  }
  h += '</div></div>';
  if (estado.modo === "demo") h += amigosDemoHtml();
  return h;
}

function amigosDemoHtml() {
  let h = '<div class="card stack tight"><h3>Buscar usuarios (demo)</h3><div class="search">' + I.buscar + '<input id="buscarUsuario" placeholder="Nombre de usuario" aria-label="Buscar usuario"></div><div class="list" id="resultadosUsuarios"></div>' +
    '<p class="muted small">Los perfiles privados y los bloqueados no aparecen.</p></div>';
  h += '<div class="card"><h3>Amigos de la demo</h3><div class="list">';
  if (estado.social.amigos.length === 0) h += '<p class="muted" style="padding-top:8px">Todavía no has añadido ninguno.</p>';
  for (const u of estado.social.amigos) {
    const d = usuarioDemo(u);
    h += '<div class="item">' + insignia(d ? d.rango : null, "sm") + '<div class="grow"><span class="name">@' + esc(d ? d.usuario : u) + '</span><span class="muted small">Ficticio</span></div>' +
      '<button class="btn-txt small btn-danger" data-act="quitar-amigo" data-a="' + u + '">Eliminar</button><button class="btn-txt small" data-act="bloquear" data-a="' + u + '" style="color:var(--muted)">Bloquear</button></div>';
  }
  h += '</div></div>';
  if (estado.social.bloqueados.length) {
    h += '<div class="card"><h3>Bloqueados</h3><div class="list">';
    for (const u of estado.social.bloqueados) h += '<div class="item"><span class="grow">@' + esc(usuarioDemo(u) ? usuarioDemo(u).usuario : u) + '</span><button class="btn-txt small" data-act="desbloquear" data-a="' + u + '">Desbloquear</button></div>';
    h += '</div></div>';
  }
  return h;
}

function resultadosUsuarios(texto) {
  const cont = $("resultadosUsuarios");
  if (!cont) return;
  if (!texto.trim()) { cont.innerHTML = ""; return; }
  const lista = buscarUsuarios(texto);
  if (lista.length === 0) { cont.innerHTML = '<p class="muted small" style="padding-top:8px">No hay usuarios con ese nombre.</p>'; return; }
  cont.innerHTML = lista.map(function (u) {
    const ya = estado.social.amigos.includes(u.uid);
    return '<div class="item">' + insignia(u.rango, "sm") + '<span class="grow name">@' + esc(u.usuario) + '</span>' +
      (ya ? '<span class="muted small">Amigos</span>' : '<button class="btn-sec small" data-act="anadir-amigo" data-a="' + u.uid + '">Añadir</button>') + '</div>';
  }).join("");
}

// Retos personales: meta propia y progreso calculado solo con tus entrenos registrados
function retosHtml() {
  let h = '<button class="btn full" data-act="nuevo-reto">Crear reto personal</button>' +
    '<p class="muted small">Los retos entre amigos necesitan cuentas reales en servidor, para que cada resultado venga de entrenos verificables. Hasta entonces, compites contigo.</p>';
  if (estado.social.retos.length === 0) h += '<div class="card"><p class="muted">No tienes retos activos.</p></div>';
  for (const r of estado.social.retos) {
    if (!TIPOS_RETO[r.tipo] || !r.meta) continue;    // retos antiguos con datos inventados se ignoran
    const valor = progresoReto(r);
    const pct = Math.min(100, Math.round(valor / r.meta * 100));
    const terminado = r.fin < hoy();
    const conseguido = valor >= r.meta;
    const estadoTxt = conseguido ? "Conseguido" : (terminado ? "No conseguido" : "En curso");
    h += '<div class="card stack tight"><div class="row between"><h3>' + esc(TIPOS_RETO[r.tipo].nombre) + '</h3><span class="pill ' + (conseguido ? "up" : (terminado ? "down" : "keep")) + '">' + estadoTxt + '</span></div>' +
      '<p class="muted small">' + fechaBonita(r.inicio) + ' – ' + fechaBonita(r.fin) + (r.ejercicio ? " · " + esc(buscarEj(r.ejercicio).nombre) : "") + '</p>' +
      '<div class="row between"><span class="big-num num">' + String(valor).replace(".", ",") + '</span><span class="muted">meta: ' + r.meta + ' ' + TIPOS_RETO[r.tipo].unidad + '</span></div>' +
      '<div class="bar"><i style="width:' + pct + '%"></i></div>' +
      '<p class="muted small">Calculado con tus sesiones válidas. Nunca a costa de entrenar con dolor o mala técnica.</p>' +
      '<button class="btn-txt small btn-danger" data-act="borrar-reto" data-a="' + r.id + '">Eliminar reto</button></div>';
  }
  return h;
}

// =====================================================
// HOJAS (ventanas que suben desde abajo)
// =====================================================

function abrirHoja(html) { $("hojaContenido").innerHTML = html; $("hoja").hidden = false; $("hojaContenido").scrollTop = 0; }
function cerrarHoja() { $("hoja").hidden = true; $("hojaContenido").innerHTML = ""; }
function cabeceraHoja(titulo, sub) {
  return '<div class="row between" style="margin-bottom:14px"><div class="grow">' + (sub ? '<p class="label">' + sub + '</p>' : "") + '<h2>' + titulo + '</h2></div><button class="icon-btn" data-act="cerrar-hoja" aria-label="Cerrar">' + I.cerrar + '</button></div>';
}

// ---------- Generador de rutinas ----------
// Generador guiado en 3 pasos. Las respuestas se guardan en "genOp" al pasar de un paso a otro.
let pasoGen = 1;
let genOp = null;
const OBJETIVO_INFO = { masa: ["💪", "Ganar músculo"], fuerza: ["🏋️", "Más fuerza"], condicion: ["🔥", "Condición física"], activo: ["🙂", "Mantenerme activo"] };

function hojaGenerador(reiniciar) {
  const p = estado.perfil;
  if (reiniciar || !genOp) {
    genOp = { objetivo: p.objetivo, nivel: p.experiencia, dias: Math.max(2, p.dias), duracion: p.duracion,
      calendario: (p.diasSemana && p.diasSemana.length === Math.max(2, p.dias)) ? p.diasSemana.slice() : calendarioPorDefecto(Math.max(2, p.dias)),
      equipo: p.equipo.slice(), tipo: "auto", prioridad: "", evitar: p.evitar || "" };
    pasoGen = 1;
  }
  const g = genOp;
  let h = cabeceraHoja("Generar rutina", "Paso " + pasoGen + " de 3") +
    '<div class="pasos-gen">' + [1, 2, 3].map(function (n) { return '<i class="' + (n <= pasoGen ? "on" : "") + '"></i>'; }).join("") + '</div><div class="stack">';
  if (pasoGen === 1) {
    h += '<h3>¿Qué quieres conseguir?</h3><div class="grid2 opciones-grandes">' + OP_OBJETIVO.map(function (o) {
      return '<button class="opcion' + (g.objetivo === o[0] ? " on" : "") + '" data-act="gen-elegir" data-a="objetivo" data-b="' + o[0] + '"><span class="ico">' + OBJETIVO_INFO[o[0]][0] + '</span><b>' + OBJETIVO_INFO[o[0]][1] + '</b></button>';
    }).join("") + '</div>' +
      '<h3>¿Cuánta experiencia tienes?</h3><div class="stack tight">' + OP_EXPERIENCIA.map(function (o) {
      return '<button class="opcion fila' + (g.nivel === o[0] ? " on" : "") + '" data-act="gen-elegir" data-a="nivel" data-b="' + o[0] + '">' + o[1] + '</button>';
    }).join("") + '</div>';
  }
  if (pasoGen === 2) {
    h += '<h3>¿Cuántos días a la semana?</h3><div class="chips grandes">' + [2, 3, 4, 5, 6].map(function (n) {
      return '<button class="chip' + (g.dias === n ? " on" : "") + '" data-act="gen-elegir" data-a="dias" data-b="' + n + '">' + n + '</button>';
    }).join("") + '</div>' +
      '<h3>¿Qué días?</h3><div class="chips grandes dias-semana">' + NOMBRES_DIAS_SEMANA.map(function (n, i) {
      return '<button class="chip' + (g.calendario.includes(i) ? " on" : "") + '" data-act="gen-dia" data-a="' + i + '">' + n.slice(0, 2) + '</button>';
    }).join("") + '</div><p class="muted small">' + (g.calendario.length === g.dias ? "✓ " + g.dias + " días elegidos." : "Elige " + g.dias + " días (llevas " + g.calendario.length + ").") + '</p>' +
      '<h3>¿Cuánto tiempo por sesión?</h3><div class="chips grandes">' + OP_DURACION.map(function (o) {
      return '<button class="chip' + (g.duracion === o[0] ? " on" : "") + '" data-act="gen-elegir" data-a="duracion" data-b="' + o[0] + '">' + o[1] + '</button>';
    }).join("") + '</div>';
  }
  if (pasoGen === 3) {
    let eq = "";
    for (const k in EQUIPOS) eq += '<button class="opcion fila' + (g.equipo.includes(k) ? " on" : "") + '" data-act="gen-equipo" data-a="' + k + '">' + (g.equipo.includes(k) ? "✓ " : "") + EQUIPOS[k] + '</button>';
    h += '<h3>¿Qué material tienes?</h3><div class="grid2">' + eq + '</div>' +
      '<details class="mas-opciones"><summary>Opciones avanzadas (opcional)</summary><div class="stack tight" style="margin-top:8px">' +
      '<label class="f">Distribución<select id="gTipo">' + opciones(Object.keys(TIPOS_RUTINA).map(function (k) { return [k, TIPOS_RUTINA[k]]; }), g.tipo) + '</select></label>' +
      '<label class="f">Músculo prioritario<select id="gPrioridad"><option value="">Ninguno</option>' + Object.keys(GRUPOS).map(function (k) { return '<option value="' + k + '"' + (g.prioridad === k ? " selected" : "") + '>' + GRUPOS[k] + '</option>'; }).join("") + '</select></label>' +
      '<label class="f">Evitar ejercicios que contengan<input id="gEvitar" value="' + esc(g.evitar) + '"></label></div></details>' +
      (estado.evitados.length || estado.noDisponibles.length ? '<p class="muted small">Se excluyen ' + (estado.evitados.length + estado.noDisponibles.length) + ' ejercicio(s) que no puedes hacer o no hay en tu gimnasio. <button class="btn-txt small" data-act="abrir-gimnasio">Mi gimnasio</button></p>' : "");
  }
  h += '<p class="err" id="gError"></p><div class="grid2">' +
    (pasoGen > 1 ? '<button class="btn-sec" data-act="gen-paso" data-a="-1">← Atrás</button>' : '<button class="btn-sec" data-act="cerrar-hoja">Cancelar</button>') +
    (pasoGen < 3 ? '<button class="btn" data-act="gen-paso" data-a="1">Siguiente →</button>' : '<button class="btn" data-act="generar">Ver mi rutina</button>') + '</div>' +
    '<p class="muted small">Se crea con reglas de entrenamiento (sin IA). Luego puedes editarla.</p></div>';
  abrirHoja(h);
}

function hojaPropuesta() {
  const r = propuesta;
  const obj = objetivoVolumen(r.objetivo, r.nivel);
  const v = volumenSemanal(r);
  const prob = validarRutina(r);
  let h = cabeceraHoja("Tu nueva rutina", esc(r.nombre)) + '<div class="stack">' +
    (r.famosa && cambiosFamosa.length ? '<div class="card" style="border-color:var(--warn)"><p class="small"><b>Adaptada a tu gimnasio:</b> ' + cambiosFamosa.map(esc).join(" · ") + '</p></div>' : "") +
    '<div class="card resumen-rutina ' + (prob.length ? "aviso" : "ok") + '"><p class="big-num">' + (prob.length ? "⚠ Casi lista" : "✓ Lista para usar") + '</p>' +
    '<p class="small">' + r.dias.length + ' días · ' + r.dias.reduce(function (t, d) { return t + d.ejercicios.length; }, 0) + ' ejercicios · ~' + Math.round(r.dias.reduce(function (t, d) { return t + duracionDia(d, r.factorDuracion); }, 0) / r.dias.length) + ' min por día</p>' +
    (prob.length ? '<p class="muted small">' + prob.length + ' detalle(s) a revisar abajo. Puedes usarla igual y ajustarla después.</p>' : '<p class="muted small">Pasa todas las comprobaciones de volumen, tiempo y recuperación.</p>') + '</div>';
  r.dias.forEach(function (d) {
    const di = r.dias.indexOf(d);
    h += '<div class="card stack tight"><div class="row between"><div><p class="label">' + NOMBRES_DIAS_SEMANA[r.calendario[di]] + '</p><h3>' + esc(d.nombre) + '</h3></div><span class="muted small num">~' + duracionDia(d, r.factorDuracion) + ' min</span></div>';
    for (const o of d.ejercicios) h += '<div class="row between small"><span>' + esc(buscarEj(o.id).nombre) + (sesionesCon(o.id) ? ' <span class="muted">· lo haces</span>' : "") + '</span><span class="muted num">' + o.series + ' × ' + o.repMin + '-' + o.repMax + '</span></div>';
    h += '</div>';
  });
  const pr = validarRutina(r);
  const tipos = [["duracion", "Duración dentro de tu tiempo"], ["volumen-bajo", "Volumen suficiente por músculo"], ["volumen-alto", "Sin exceso de volumen"], ["recuperacion", "Recuperación entre días"]];
  h += '<div class="card stack tight"><h3>Comprobaciones de la rutina completa</h3>';
  for (const t of tipos) {
    const fallos = pr.filter(function (x) { return x.tipo === t[0]; });
    h += '<div class="row small"><span style="width:20px;color:' + (fallos.length ? "var(--warn)" : "var(--good)") + '">' + (fallos.length ? "⚠" : "✓") + '</span><span class="grow">' + t[1] + '</span></div>';
    for (const x of fallos) h += '<p class="muted small" style="padding-left:30px">' + esc(x.msg) + '</p>';
  }
  h += '<p class="muted small">La recuperación se comprueba con tu calendario: ' + r.calendario.map(function (x) { return NOMBRES_DIAS_SEMANA[x].toLowerCase(); }).join(", ") + '. Cuentan también los músculos que trabajan como secundarios.</p>';
  if (r.factorDuracion !== 1) h += '<p class="muted small">Duraciones ajustadas a lo que tardas de verdad (× ' + String(r.factorDuracion).replace(".", ",") + ').</p>';
  h += '</div>';
  h += '<div class="card"><h3 style="margin-bottom:6px">Series por semana</h3><p class="muted small" style="margin-bottom:6px">Recomendado para tu objetivo y nivel: unas ' + obj + ' por músculo.</p>';
  for (const g of GRUPOS_PRINCIPALES) {
    const pct = Math.min(100, v[g] / obj * 100);
    h += '<div class="musculo"><span>' + GRUPOS[g] + '</span><div class="bar' + (v[g] < obj * 0.6 ? " fire" : "") + '"><i style="width:' + pct + '%"></i></div><span class="num muted" style="text-align:right">' + Math.round(v[g]) + '</span></div>';
  }
  h += '<p class="muted small" style="margin-top:6px">Los músculos secundarios cuentan como media serie. Duración estimada: 45 s por serie + descanso + 1,5 min de cambio entre ejercicios + 5 min de calentamiento + 3 min de aproximación por compuesto.</p></div>' +
    (estado.rutina && confirmar === "usar-propuesta" ? '<p class="small" style="color:var(--warn)"><b>Tu rutina actual «' + esc(estado.rutina.nombre) + '» se sustituirá.</b> Tus entrenos guardados no se borran.</p>' : "") +
    '<button class="btn" data-act="usar-propuesta">' + (estado.rutina ? (confirmar === "usar-propuesta" ? "Sí, sustituir mi rutina" : "Usar esta rutina") : "Usar esta rutina") + '</button>' +
    (r.famosa ? '<button class="btn-sec full" data-act="abrir-famosas">← Ver otras rutinas famosas</button></div>' : '<button class="btn-sec full" data-act="abrir-generador">← Cambiar respuestas</button></div>');
  abrirHoja(h);
}

// ---------- Rutinas famosas ----------
function hojaFamosas() {
  let h = cabeceraHoja("Rutinas famosas", "Listas para usar") + '<div class="stack"><p class="muted small">Rutinas clásicas que usa muchísima gente. Si falta alguna máquina en tu gimnasio, se cambia sola por una parecida.</p>';
  for (const k in RUTINAS_FAMOSAS) {
    const r = RUTINAS_FAMOSAS[k];
    h += '<button class="card famosa" data-act="ver-famosa" data-a="' + k + '"><div class="row between"><h3>' + esc(r.nombre) + '</h3><span class="pill ' + (r.nivel === "principiante" ? "up" : (r.nivel === "avanzado" ? "pr" : "keep")) + '">' + r.nivel + '</span></div>' +
      '<p class="small">' + esc(r.desc) + '</p><p class="muted small">' + r.dias + ' días · ~' + r.duracion + ' min · ' + r.plantilla.map(function (dd) { return esc(dd.nombre); }).join(" / ") + '</p></button>';
  }
  abrirHoja(h + '</div>');
}

// ---------- Editor de un día ----------
function hojaEditarDia(i) {
  const d = estado.rutina.dias[i];
  let h = cabeceraHoja("Editar día", esc(estado.rutina.nombre)) + '<div class="stack">' +
    '<label class="f">Nombre del día<input data-in="nombre-dia" data-e="' + i + '" value="' + esc(d.nombre) + '" maxlength="40"></label>' +
    '<p class="muted small">Los cambios se guardan solos. ~' + duracionDia(d, factorDuracion()) + ' min con ' + d.ejercicios.length + ' ejercicios.</p>';
  if (!d.ejercicios.length) h += '<div class="card" style="text-align:center"><p class="muted">Este día no tiene ejercicios.</p></div>';
  d.ejercicios.forEach(function (o, k) {
    const ej = buscarEj(o.id);
    const fotos = fotosDe(o.id);
    const resaltar = cambioEditor === i + "-" + k ? " recien" : "";
    h += '<div class="card editar-ej' + resaltar + '"><div class="row" style="gap:10px">' +
      '<span class="orden num">' + (k + 1) + '</span>' + (fotos ? '<img class="foto-mini" src="' + fotos[0] + '" alt="" style="width:44px;height:44px">' : "") +
      '<div class="grow"><b class="small">' + esc(ej.nombre) + '</b><p class="muted small">' + GRUPOS[ej.grupo] + ' · ' + EQUIPOS[ej.equipo] + '</p></div>' +
      '<div class="stack tight" style="gap:4px"><button class="icon-btn sm" data-act="dia-mover" data-a="' + i + '" data-b="' + k + '" data-c="-1" aria-label="Subir"' + (k ? "" : " disabled") + '>' + I.arriba + '</button>' +
      '<button class="icon-btn sm" data-act="dia-mover" data-a="' + i + '" data-b="' + k + '" data-c="1" aria-label="Bajar"' + (k < d.ejercicios.length - 1 ? "" : " disabled") + '>' + I.abajo + '</button></div></div>' +
      '<div class="steppers">' + [["series", "Series", 1], ["repMin", "Reps mín.", 1], ["repMax", "Reps máx.", 1], ["descanso", "Desc. (s)", 15]].map(function (c) {
        return '<div class="stepper"><span class="muted small">' + c[1] + '</span><div class="row"><button data-act="dia-paso" data-a="' + i + '" data-b="' + k + '" data-c="' + c[0] + ':-' + c[2] + '" aria-label="Menos">−</button>' +
          '<b class="num">' + o[c[0]] + '</b><button data-act="dia-paso" data-a="' + i + '" data-b="' + k + '" data-c="' + c[0] + ':' + c[2] + '" aria-label="Más">+</button></div></div>';
      }).join("") + '</div>' +
      '<div class="grid2"><button class="btn-sec small" data-act="dia-sustituir" data-a="' + i + '" data-b="' + k + '">' + I.cambiar + ' Cambiar</button>' +
      '<button class="btn-sec small btn-danger" data-act="dia-quitar" data-a="' + i + '" data-b="' + k + '">' + I.borrar + ' Quitar</button></div></div>';
  });
  cambioEditor = "";
  h += '<button class="btn-sec full" data-act="dia-anadir" data-a="' + i + '">+ Añadir ejercicio</button>' +
    '<div class="grid2"><button class="btn-sec" data-act="dia-duplicar" data-a="' + i + '">Duplicar día</button>' +
    '<button class="btn-sec btn-danger" data-act="dia-eliminar" data-a="' + i + '">' + (confirmar === "dia-eliminar" ? "¿Seguro? Pulsa otra vez" : "Eliminar día") + '</button></div>' +
    '<button class="btn" data-act="dia-listo">Listo</button></div>';
  abrirHoja(h);
}

// ---------- Biblioteca de ejercicios ----------
// modo: "ver", "sesion", "dia:i", "sust-sesion:k", "sust-dia:i:k"
let bibBase = null;
function hojaBiblioteca(modo, soloVariantesDe) {
  modoBib = modo;
  bibBase = soloVariantesDe || null;
  let titulo = modo === "ver" ? "Academia" : (modo.startsWith("sust") ? "Sustituir ejercicio" : "Añadir ejercicio");
  let h = cabeceraHoja(titulo, EJERCICIOS.length + " ejercicios");
  if (soloVariantesDe) {
    const e = buscarEj(soloVariantesDe);
    h += '<p class="label" style="margin-bottom:6px">Equivalentes a ' + esc(e.nombre) + '</p><div class="list" style="margin-bottom:14px">' +
      e.variantes.map(function (id) { return filaEj(buscarEj(id)); }).join("") + '</div><p class="label">O elige cualquier otro</p>';
  }
  h += '<div class="stack tight" style="margin-top:8px"><div class="search">' + I.buscar + '<input id="bibTexto" placeholder="Buscar ejercicio" value="' + esc(filtroBib.texto) + '" aria-label="Buscar ejercicio"></div>' +
    '<div class="chips"><button class="chip' + (filtroBib.favoritos ? " on" : "") + '" data-act="bib-fav">★ Favoritos</button>' +
    '<button class="chip' + (!filtroBib.grupo ? " on" : "") + '" data-act="bib-grupo" data-a="">Todos</button>' +
    Object.keys(GRUPOS).map(function (g) { return '<button class="chip' + (filtroBib.grupo === g ? " on" : "") + '" data-act="bib-grupo" data-a="' + g + '">' + GRUPOS[g] + '</button>'; }).join("") + '</div>' +
    '<div class="chips"><button class="chip' + (!filtroBib.equipo ? " on" : "") + '" data-act="bib-equipo" data-a="">Todo el material</button>' +
    Object.keys(EQUIPOS).map(function (k) { return '<button class="chip' + (filtroBib.equipo === k ? " on" : "") + '" data-act="bib-equipo" data-a="' + k + '">' + EQUIPOS[k] + '</button>'; }).join("") + '</div></div>' +
    '<div class="list" id="bibLista" style="margin-top:8px"></div>';
  abrirHoja(h);
  pintarListaBib();
}

function filaEj(e) {
  const fav = estado.favoritos.includes(e.id);
  const accion = modoBib === "ver" ? "info-ej" : "elegir-ej";
  return '<button class="item" data-act="' + accion + '" data-a="' + e.id + '">' + (fotosDe(e.id) ? '<img class="gico foto" src="' + fotosDe(e.id)[0] + '" alt="" loading="lazy" decoding="async">' : '<span class="gico">' + GRUPOS[e.grupo].slice(0, 3).toUpperCase() + '</span>') +
    '<span class="grow"><span class="name">' + esc(e.nombre) + (fav ? ' <span style="color:var(--warn)">★</span>' : "") + ((estado.noDisponibles || []).includes(e.id) ? ' <span class="muted small">· no hay en tu gimnasio</span>' : "") + '</span><span class="muted small">' + GRUPOS[e.grupo] + ' · ' + EQUIPOS[e.equipo] + ' · ' + ["", "Básico", "Medio", "Avanzado"][e.nivel] + '</span></span></button>';
}

// Quita tildes y mayúsculas: "Pájaros" y "pajaros" se buscan igual
function normalizar(texto) {
  return String(texto).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
// Palabras que no importan al buscar
const PALABRAS_VACIAS = ["de", "del", "con", "en", "la", "el", "los", "las", "a", "al", "y"];

// ¿El ejercicio encaja con lo que se ha escrito? Tiene que contener todas las palabras importantes,
// en español o en el idioma de la app (por ejemplo "bench press").
function encajaBusqueda(e, texto) {
  const palabras = normalizar(texto).split(/\s+/).filter(function (p) { return p && PALABRAS_VACIAS.indexOf(p) < 0; });
  const nombre = normalizar(e.nombre + " " + tr(e.nombre) + " " + e.id.replace(/-/g, " "));
  return palabras.every(function (p) { return nombre.includes(p); });
}

function pintarListaBib() {
  const lista = EJERCICIOS.filter(function (e) {
    return (!filtroBib.grupo || e.grupo === filtroBib.grupo) && (!filtroBib.equipo || e.equipo === filtroBib.equipo) &&
      (!filtroBib.favoritos || estado.favoritos.includes(e.id)) && encajaBusqueda(e, filtroBib.texto);
  });
  $("bibLista").innerHTML = lista.length ? lista.map(filaEj).join("") : '<p class="muted" style="padding:14px 0">No hay ejercicios con esos filtros.</p>';
}

// ---------- Ficha de la Academia ----------
// ---------- Ajustes fijos de cada máquina ("asiento 4, respaldo 2") ----------
const EQUIPO_CON_AJUSTES = ["maquina", "polea", "multipower"];
function ajusteMaquina(id) { return (estado.ajustesMaquina || {})[id] || ""; }

// Línea corta en la tarjeta del entreno: tu nota, o un enlace para apuntarla
function lineaAjusteMaquina(id) {
  const nota = ajusteMaquina(id);
  if (nota) return '<button class="link-nombre small banco-linea" data-act="editar-ajuste" data-a="' + id + '">⚙️ <span>' + esc(nota) + '</span></button>';
  const ej = buscarEj(id);
  if (ej && EQUIPO_CON_AJUSTES.indexOf(ej.equipo) >= 0) return '<button class="btn-txt small banco-linea" data-act="editar-ajuste" data-a="' + id + '">⚙️ Apuntar ajustes de la máquina</button>';
  return "";
}

function hojaAjusteMaquina(id) {
  const ej = buscarEj(id);
  abrirHoja(cabeceraHoja("Ajustes de la máquina", esc(ej.nombre)) + '<div class="stack">' +
    '<p class="muted small">Apunta cómo dejas la máquina para no tener que acordarte: te saldrá cada vez que hagas este ejercicio.</p>' +
    '<label class="f">Tus ajustes<input id="ajusteTxt" maxlength="80" placeholder="Ej.: asiento 4, respaldo 2, agarre medio" value="' + esc(ajusteMaquina(id)) + '"></label>' +
    '<div class="grid2"><button class="btn-sec" data-act="borrar-ajuste" data-a="' + id + '">Borrar</button><button class="btn" data-act="guardar-ajuste" data-a="' + id + '">Guardar</button></div></div>');
  setTimeout(function () { const i = $("ajusteTxt"); if (i) i.focus(); }, 50);
}

function hojaEjercicio(id) {
  const e = buscarEj(id);
  const f = fichaEjercicio(id);
  const fav = estado.favoritos.includes(id);
  const p = puntosEjercicio(id);
  const rm = mejor1RM(id);
  const maquina = e.equipo === "maquina" || e.equipo === "polea";
  const noHay = (estado.noDisponibles || []).includes(id);
  function lista(items) { return '<ul class="pasos">' + items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ul>'; }
  function bloque(num, titulo, color, cuerpo) {
    return '<div class="card stack tight"><div class="row"><span class="num-paso" style="background:' + color + '">' + num + '</span><h3>' + titulo + '</h3></div>' + cuerpo + '</div>';
  }

  let h = cabeceraHoja(esc(e.nombre), "Academia · " + GRUPOS[e.grupo]) + '<div class="stack">';

  // Fotos reales (dominio público), si hay una que muestre este mismo ejercicio
  const fotos = fotosDe(id);
  if (fotos) {
    h += '<div class="fotos">' + fotos.map(function (src, i) {
      return '<figure><img src="' + src + '" alt="' + esc(e.nombre) + ', posición ' + (i + 1) + ' de 2" loading="lazy" decoding="async"><figcaption>Posición ' + (i + 1) + '</figcaption></figure>';
    }).join("") + '</div><p class="muted small" style="margin-top:-6px">' + (FOTOS[id] === "IA" ? "Imágenes generadas por IA." : "Fotos: Free Exercise DB · dominio público.") + '</p>' +
      (FOTO_REFERENCIA[id] ? '<p class="small aviso-foto">ⓘ ' + FOTO_REFERENCIA[id] + '</p>' : "");
  }

  // Animación propia del patrón de movimiento
  const anim = animacionSVG(id, e.nombre);
  if (anim) {
    if (fotos) h += '<p class="label">Animación del movimiento</p>';
    h += '<div class="anim-caja">' + anim +
      '<div class="row between" style="padding:8px 12px 10px"><span class="muted small">Animación del patrón: ' + esc(e.patron.toLowerCase()) + '</span>' +
      '<button class="btn-txt small" data-act="pausar-anim">' + (animPausada ? "▶ Reproducir" : "❚❚ Pausar") + '</button></div></div>';
  }

  // Datos clave
  h += '<div class="card" style="padding:12px"><p class="label">Cómo apuntar el peso</p><p class="small">' + comoApuntar(e).largo + '</p></div>';
  h += '<div class="row wrap" style="gap:6px"><span class="pill keep">' + EQUIPOS[e.equipo] + '</span><span class="pill keep">Nivel: ' + ["", "básico", "medio", "avanzado"][e.nivel] + '</span><span class="pill keep">' + e.reps[0] + '-' + e.reps[1] + ' reps</span>' +
    (e.asistido ? '<span class="pill up">Asistido</span>' : "") + '</div>' +
    '<p class="small"><b>Músculo principal:</b> ' + GRUPOS[e.grupo] + (e.sec.length ? ' · <b>Secundarios:</b> ' + e.sec.map(function (g) { return GRUPOS[g]; }).join(", ") : "") + '</p>';
  if (e.asistido) h += '<p class="small" style="color:var(--warn)">En esta máquina los kg que escribes son <b>ayuda</b>: cuantos menos, más difícil.</p>';
  // Banco y su inclinación (cambia qué parte del músculo trabaja)
  if (BANCO[id]) h += '<div class="card" style="padding:12px"><p class="label">🪑 Banco</p><p class="small"><b>' + BANCO[id][0] + '</b></p>' +
    (BANCO[id][1] ? '<p class="small muted">' + BANCO[id][1] + '</p>' : "") + '</div>';

  // Tus ajustes de la máquina
  if (ajusteMaquina(id) || EQUIPO_CON_AJUSTES.indexOf(e.equipo) >= 0)
    h += '<div class="card row between" style="padding:12px;gap:10px"><div class="grow"><p class="label">⚙️ Mis ajustes</p><p class="small">' + (ajusteMaquina(id) ? "<b>" + esc(ajusteMaquina(id)) + "</b>" : '<span class="muted">Aún no has apuntado cómo dejas la máquina.</span>') + '</p></div>' +
      '<button class="btn-sec small" data-act="editar-ajuste" data-a="' + id + '">' + (ajusteMaquina(id) ? "Cambiar" : "Apuntar") + '</button></div>';
  // Agarre (dibujo de frente: cambia qué músculo trabaja más)
  if (AGARRE[id]) { const ag = TIPOS_AGARRE[AGARRE[id]];
    h += '<div class="card" style="padding:12px"><p class="label">✋ Agarre</p><p class="small"><b>' + ag.nombre + '</b></p>' +
      (FOTO_AGARRE[id] ? '<img src="fotos/' + id + '-agarre.jpg" alt="Detalle de las manos" loading="lazy" style="width:100%;border-radius:12px;margin:6px 0">' : "") + agarreSVG(id) + '<p class="small muted">' + ag.texto + '</p></div>'; }
  // Las cuatro partes de la ficha
  h += bloque("01", maquina ? "Preparación y ajuste de la máquina" : "Preparación", "var(--accent)", lista(f.preparacion));
  h += bloque("02", "Ejecución", "var(--accent)", '<ol class="pasos">' + f.ejecucion.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join("") + '</ol><p class="small" style="color:var(--good)"><b>Consejo:</b> ' + esc(f.consejo) + '</p>');
  h += bloque("03", "Errores que debes evitar", "var(--danger)", lista(f.errores));
  h += bloque("04", "Seguridad", "var(--warn)", lista(f.seguridad));

  if (f.alternativa) {
    h += '<div class="card row"><div class="grow"><p class="label">Alternativa para principiantes</p><p class="small">' + esc(f.alternativa.nombre) + '</p></div><button class="btn-sec small" data-act="info-ej" data-a="' + f.alternativa.id + '">Ver ficha</button></div>';
  }
  if (rm) {
    h += '<div class="card row">' + insignia(rangoDePuntos(p), "sm") + '<div class="grow"><p class="label">Tu marca</p><p><b class="num">' + kg(rm) + '</b> <span class="muted small">1RM estimada · ' + RANGOS[rangoDePuntos(p)].nombre + '</span></p></div></div>';
  }
  if (e.variantes.length) {
    h += '<div class="stack tight"><p class="label">Variantes equivalentes</p><div class="row wrap" style="gap:6px">' +
      e.variantes.map(function (v) { return '<button class="chip" data-act="info-ej" data-a="' + v + '">' + esc(buscarEj(v).nombre) + '</button>'; }).join("") + '</div></div>';
  }

  h += '<div class="grid2"><button class="btn-sec" data-act="fav" data-a="' + id + '">' + (fav ? "★ Quitar favorito" : "☆ Favorito") + '</button>' +
    '<button class="btn-sec" data-act="no-puedo" data-a="' + id + '">' + (estado.evitados.includes(id) ? "Sí puedo hacerlo" : "No puedo hacerlo") + '</button></div>';
  if (maquina) h += '<button class="btn-sec full" data-act="no-hay" data-a="' + id + '">' + (noHay ? "✓ Sí hay en mi gimnasio" : "No hay en mi gimnasio") + '</button>';
  if (estado.evitados.includes(id) || noHay) h += '<p class="muted small">Este ejercicio no aparecerá en las rutinas que generes.</p>';
  abrirHoja(h + '</div>');
  aplicarPausaAnim();
}

// Pausa las animaciones si el usuario lo pidió o si su sistema pide reducir el movimiento
let animPausada = false;
try { animPausada = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { }
function aplicarPausaAnim() {
  for (const s of document.querySelectorAll("svg.anim")) {
    try { if (animPausada) s.pauseAnimations(); else s.unpauseAnimations(); } catch (e) { }
  }
}

// ---------- Mi gimnasio: qué máquinas hay ----------
function hojaMiGimnasio() {
  const maquinas = EJERCICIOS.filter(function (e) { return e.equipo === "maquina" || e.equipo === "polea"; });
  let h = cabeceraHoja("Mi gimnasio", "Máquinas disponibles") + '<div class="stack">' +
    '<p class="muted small">Desmarca las máquinas que no hay en tu gimnasio. Las rutinas y las sugerencias solo usarán las que tengas.</p>' +
    '<div class="grid2"><button class="btn-sec" data-act="gim-todas" data-a="1">Marcar todas</button><button class="btn-sec" data-act="gim-todas" data-a="0">Desmarcar todas</button></div>';
  for (const g in GRUPOS) {
    const delGrupo = maquinas.filter(function (e) { return e.grupo === g; });
    if (!delGrupo.length) continue;
    h += '<div class="stack tight"><p class="label">' + GRUPOS[g] + '</p>';
    for (const e of delGrupo) {
      const hay = !estado.noDisponibles.includes(e.id);
      h += '<label class="check"><input type="checkbox" data-in="gim" data-e="' + e.id + '"' + (hay ? " checked" : "") + '>' + esc(e.nombre) + '<span class="muted small" style="margin-left:auto">' + EQUIPOS[e.equipo] + '</span></label>';
    }
    h += '</div>';
  }
  h += '<p class="muted small"><b>' + (maquinas.length - estado.noDisponibles.length) + ' de ' + maquinas.length + '</b> máquinas disponibles.</p>' +
    '<button class="btn" data-act="cerrar-hoja">Listo</button></div>';
  abrirHoja(h);
}

// ---------- Detalle de sesión ----------
function hojaSesion(id) {
  const s = estado.sesiones.find(function (x) { return x.id === id; });
  if (!s) return;
  let h = cabeceraHoja(esc(s.diaNombre), fechaBonita(s.fecha)) + '<div class="stack"><div class="grid3">' +
    '<div class="card"><p class="label">Duración</p><div class="big-num num">' + s.duracion + '</div><p class="muted small">min</p></div>' +
    '<div class="card"><p class="label">Series efectivas</p><div class="big-num num">' + s.seriesEfectivas + '</div>' + (s.enRevision ? '<p class="muted small">+' + s.enRevision + ' en revisión</p>' : "") + '</div>' +
    '<div class="card"><p class="label">Tonelaje externo</p><div class="big-num num">' + miles(pesoVista(s.volumen)) + '</div><p class="muted small">' + unidadPeso() + ' (sin peso corporal)</p></div></div>';
  for (const e of s.ejercicios) {
    h += '<div class="card stack tight"><div class="row between"><h3>' + esc(buscarEj(e.id).nombre) + '</h3>' + (s.prs.includes(e.id) ? '<span class="pill pr">Récord</span>' : "") + '</div>';
    e.series.forEach(function (x, i) {
      h += '<div class="row between small' + (x.hecha ? "" : " muted") + '"><span>Serie ' + (i + 1) + (x.hecha ? "" : " (no hecha)") + '</span><span class="num">' + x.peso + ' kg × ' + x.reps + (x.rpe ? ' · RPE ' + String(x.rpe).replace(".", ",") : "") + '</span></div>';
      if (x.hecha && !serieValida(x)) h += '<div class="row small" style="color:var(--warn)"><span class="grow">⚠ En revisión: ' + esc(x.aviso || "") + '</span><button class="btn-txt small" data-act="confirmar-historial" data-a="' + s.id + '" data-b="' + e.id + '" data-c="' + i + '">Es correcto</button></div>';
    });
    if (e.nota) h += '<p class="muted small">Nota: ' + esc(e.nota) + '</p>';
    h += '</div>';
  }
  h += '<button class="btn full" data-act="compartir-imagen" data-a="' + s.id + '">📸 Compartir imagen del entreno</button>';
  h += '<button class="btn-sec full" data-act="editar-sesion" data-a="' + s.id + '">Corregir este entreno</button>';
  h += '<button class="btn-txt btn-danger" data-act="borrar-sesion" data-a="' + s.id + '">' + (confirmar === "borrar-sesion" ? "Pulsa otra vez para eliminar" : "Eliminar esta sesión") + '</button></div>';
  abrirHoja(h);
}

// ---------- Corregir un entreno guardado ----------
function hojaEditarSesion(id) {
  const s = estado.sesiones.find(function (x) { return x.id === id; });
  let h = cabeceraHoja("Corregir entreno", esc(s.diaNombre) + " · " + fechaBonita(s.fecha)) + '<div class="stack"><p class="muted small">Al guardar se recalculan el volumen, los récords y los rangos.</p>';
  s.ejercicios.forEach(function (e, ei) {
    h += '<div class="card stack tight"><h3>' + esc(buscarEj(e.id).nombre) + '</h3>';
    e.series.forEach(function (x, si) {
      h += '<div class="row small"><span style="width:56px">Serie ' + (si + 1) + '</span>' +
        '<input type="number" step="0.5" min="0" value="' + pesoVista(x.peso) + '" id="ed-p-' + ei + '-' + si + '" aria-label="Kilos" style="padding:8px">' +
        '<span>kg ×</span><input type="number" min="0" value="' + x.reps + '" id="ed-r-' + ei + '-' + si + '" aria-label="Repeticiones" style="padding:8px">' +
        '<label class="row small" style="gap:4px"><input type="checkbox" id="ed-h-' + ei + '-' + si + '"' + (x.hecha ? " checked" : "") + ' style="width:18px;height:18px">hecha</label></div>';
    });
    h += '</div>';
  });
  h += '<p class="err" id="edError"></p><button class="btn" data-act="guardar-edicion" data-a="' + id + '">Guardar cambios</button><button class="btn-sec full" data-act="ver-sesion" data-a="' + id + '">Cancelar</button></div>';
  abrirHoja(h);
}

// ---------- Importar ----------
function hojaImportar() {
  abrirHoja(cabeceraHoja("Restaurar copia", "Tus datos") + '<div class="stack"><p class="muted">Elige el archivo de copia (.json) o pega su texto. Sustituirá todos los datos de este móvil.</p>' +
    '<label class="btn-sec full" style="text-align:center;cursor:pointer">📂 Elegir archivo de copia<input type="file" id="importArchivo" accept=".json,application/json,text/plain" hidden></label>' +
    '<textarea id="importTxt" style="min-height:200px;font-family:ui-monospace,monospace;font-size:.75rem" placeholder="{ ... }"></textarea>' +
    '<p class="err" id="importError"></p><button class="btn" data-act="importar">' + (confirmar === "importar" ? "Pulsa otra vez para sustituir tus datos" : "Importar") + '</button></div>');
}

// ---------- Denunciar una publicación ----------
function hojaDenunciaNube(postId) {
  let ops = "";
  for (const k in MOTIVOS_DENUNCIA) ops += '<label class="check"><input type="radio" name="motivo" value="' + k + '">' + MOTIVOS_DENUNCIA[k] + '</label>';
  abrirHoja(cabeceraHoja("Denunciar publicación", "Moderación") + '<div class="stack"><div class="stack tight">' + ops + '</div>' +
    '<label class="f">Detalles (opcional)<textarea id="denDetalle" maxlength="250"></textarea></label>' +
    '<p class="muted small">La publicación se ocultará para ti y la denuncia llegará al equipo de Apix Gym para revisarla.</p>' +
    '<p class="err" id="denError"></p><button class="btn" data-act="social-enviar-denuncia" data-a="' + postId + '">Denunciar</button></div>');
}

function hojaDenuncia(postId) {
  let ops = "";
  for (const k in MOTIVOS_DENUNCIA) ops += '<label class="check"><input type="radio" name="motivo" value="' + k + '">' + MOTIVOS_DENUNCIA[k] + '</label>';
  abrirHoja(cabeceraHoja("Denunciar publicación", "Moderación") + '<div class="stack"><div class="stack tight">' + ops + '</div>' +
    '<label class="f">Detalles (opcional)<textarea id="denDetalle" maxlength="300"></textarea></label>' +
    '<p class="muted small">La publicación se ocultará para ti. La denuncia queda guardada con su motivo y fecha, y se enviará al equipo de moderación cuando la app tenga servidor.</p>' +
    '<p class="err" id="denError"></p><button class="btn" data-act="enviar-denuncia" data-a="' + postId + '">Denunciar</button></div>');
}

// ---------- Prueba piloto: métricas e informes de problemas ----------
const MODO_DESARROLLO = location.search.indexOf("dev") >= 0;
const CORREO_SOPORTE = "apixgymsoporte@gmail.com";

function hojaPiloto() {
  const m = estado.metricas;
  const tasa = m.propuestas ? Math.round(m.aceptadas / m.propuestas * 100) + " %" : "—";
  const pendientes = estado.denuncias.filter(function (d) { return d.estado === "pendiente-envio"; }).length;
  let h = cabeceraHoja("Prueba piloto", "Datos para evaluar la app") + '<div class="stack">' +
    '<p class="muted small">Estos datos se quedan en tu dispositivo. Si participas en la prueba piloto, exporta tus datos y entrégalos: incluyen estas métricas.</p>' +
    '<div class="card"><div class="list">' +
      '<div class="item"><span class="grow">Entrenos válidos</span><b class="num">' + sesionesValidas().length + '</b></div>' +
      '<div class="item"><span class="grow">Cambios de peso propuestos</span><b class="num">' + m.propuestas + '</b></div>' +
      '<div class="item"><span class="grow">Propuestas aceptadas</span><b class="num">' + m.aceptadas + ' (' + tasa + ')</b></div>' +
      '<div class="item"><span class="grow">Avisos de datos raros</span><b class="num">' + m.avisos + '</b></div>' +
      '<div class="item"><span class="grow">Avisos confirmados como correctos</span><b class="num">' + m.avisosConfirmados + '</b></div>' +
      '<div class="item"><span class="grow">Series corregidas después de guardar</span><b class="num">' + m.correcciones + '</b></div>' +
      '<div class="item"><span class="grow">Denuncias pendientes de envío</span><b class="num">' + pendientes + '</b></div>' +
    '</div></div>' +
    '<div class="card stack tight"><h3>Informar de un problema</h3><p class="muted small">Una recomendación incorrecta, un rango injusto, algo difícil de usar…</p>' +
    '<select id="probTipo" aria-label="Tipo de problema"><option value="recomendacion">Recomendación incorrecta</option><option value="rango">Rango injusto</option><option value="uso">Difícil de usar</option><option value="error">Error o fallo</option><option value="otro">Otro</option></select>' +
    '<textarea id="probTexto" maxlength="500" placeholder="¿Qué ha pasado?"></textarea><p class="err" id="probError"></p>' +
    '<button class="btn" data-act="informar-problema">Guardar informe</button></div>';
  if (m.problemas.length) {
    h += '<div class="card"><h3>Tus informes (' + m.problemas.length + ')</h3><div class="list">';
    for (const p of m.problemas.slice().reverse().slice(0, 10)) h += '<div class="item"><div class="grow"><span class="small" style="font-weight:700">' + esc(p.tipo) + ' · ' + fechaBonita(p.fecha.slice(0, 10)) + '</span><span class="muted small" style="display:block">' + esc(p.texto) + '</span></div></div>';
    h += '</div></div>';
  }
  abrirHoja(h + '</div>');
}

// ---------- Resumen al terminar ----------
// Apix al terminar: amarillo (campeón) solo si hiciste todas las series
function humorResumen(s) {
  if (sesionCompleta(s)) return "campeon";
  if (s.prs.length) return "celebra";
  return "orgulloso";
}
function textoResumenApix(s, totalSeries) {
  let texto = "";
  if (s.prs.length) texto = s.prs.length + (s.prs.length > 1 ? " récords nuevos." : " récord nuevo.") + " ";
  if (sesionCompleta(s)) return texto + "Has hecho todas las series: ¡mira qué color me has puesto!";
  if (s.prs.length) return texto + "¡Eres una máquina!";
  return totalSeries + " series hechas. Si la próxima vez acabas todas, me pondré amarillo.";
}
function hojaResumen(r) {
  const s = r.sesion;
  const totalSeries = s.seriesEfectivas;
  let h = cabeceraHoja("Entreno completado", esc(s.diaNombre)) + '<div class="stack">' +
    (estado.ajustes.mascota !== false ? '<div class="apix-resumen">' + apixSVG(humorResumen(s)) + '<div class="confeti" aria-hidden="true">' + "<i></i>".repeat(14) + '</div>' +
      '<p><b>¡Entreno completado!</b> ' + textoResumenApix(s, totalSeries) + '</p></div>' : "") +
    '<div class="grid2">' +
    '<div class="card"><p class="label">Duración</p><div class="big-num num">' + s.duracion + ' min</div></div>' +
    '<div class="card"><p class="label">Ejercicios</p><div class="big-num num">' + s.ejercicios.filter(function (e) { return e.series.some(function (x) { return x.hecha; }); }).length + '</div></div>' +
    '<div class="card"><p class="label">Series efectivas</p><div class="big-num num">' + s.seriesEfectivas + '</div></div>' +
    '<div class="card"><p class="label">Tonelaje externo</p><div class="big-num num">' + miles(pesoVista(s.volumen)) + '</div><p class="muted small">' + unidadPeso() + ' (sin peso corporal)</p></div></div>';
  if (r.anterior) {
    const ds = s.seriesEfectivas - r.anterior.seriesEfectivas;
    h += '<div class="card"><p class="label">Frente a la última vez (' + fechaBonita(r.anterior.fecha) + ')</p><p class="num"><b style="color:' + (ds >= 0 ? "var(--good)" : "var(--danger)") + '">' + (ds >= 0 ? "+" : "") + ds + '</b> series efectivas</p>' +
      '<p class="muted small">El tonelaje solo se compara ejercicio a ejercicio (en Progreso), porque un kilo en prensa no equivale a un kilo en curl.</p></div>';
  }
  if (r.logros && r.logros.length) {
    h += '<div class="card logros-nuevos"><h3>🏅 Logro conseguido</h3><div class="list">' + r.logros.map(function (l) {
      return '<div class="item"><span class="logro-ico" aria-hidden="true">' + l.icono + '</span><span class="grow"><b>' + l.nombre + '</b><span class="muted small" style="display:block">' + l.texto + '</span></span></div>'; }).join("") + '</div></div>';
  }
  if (s.enRevision) h += '<div class="card" style="border-color:var(--warn)"><p class="small"><b>' + s.enRevision + ' serie(s) en revisión.</b> No cuentan para los rangos hasta que las confirmes en el historial.</p></div>';
  if (s.prs.length) {
    h += '<div class="card"><h3>Récords</h3><div class="list">' + s.prs.map(function (id) { return '<div class="item"><span class="grow">' + esc(buscarEj(id).nombre) + '</span><span class="pill pr">Nuevo</span></div>'; }).join("") + '</div></div>';
  }
  if (r.ascensos.length) {
    h += '<div class="card"><h3>Ascensos</h3><div class="list">' + r.ascensos.map(function (a) { return '<div class="item">' + insignia(a.rango, "sm") + '<span class="grow">' + esc(a.nombre) + ' → <b>' + RANGOS[a.rango].nombre + '</b></span></div>'; }).join("") + '</div></div>';
  }
  h += '<div class="card stack tight"><h3>Compartir</h3><div class="grid2">' +
    (s.compartida ? '<button class="btn-sec" disabled>✓ En tu diario</button>' : '<button class="btn-sec" data-act="compartir-sesion" data-a="' + s.id + '">Guardar en mi diario</button>') +
    '<button class="btn" data-act="compartir-fuera" data-a="' + s.id + '">Enviar a amigos</button></div>' +
    '<button class="btn full" data-act="compartir-imagen" data-a="' + s.id + '">📸 Compartir imagen del entreno</button>' +
    '<p class="muted small">Crea una imagen con tu entreno, tu rango y Apix para subirla a Instagram, TikTok o WhatsApp.</p></div>' +
    '<button class="btn-sec full" data-act="cerrar-hoja">Cerrar</button></div>';
  abrirHoja(h);
}

// ---------- Grupo muscular ----------
function hojaGrupo(g) {
  const p = puntosGrupo(g);
  const ri = p === null ? null : rangoDePuntos(p);
  const ids = ejerciciosHechos().filter(function (id) { return buscarEj(id).grupo === g; });
  let h = cabeceraHoja(GRUPOS[g], "Grupo muscular") + '<div class="stack"><div class="row">' + insignia(ri, "lg") +
    '<div class="grow stack tight"><h2>' + nombreRango(ri) + '</h2>' + (p !== null ? '<p class="muted num">' + p.toFixed(1) + ' puntos</p><div class="bar"><i style="width:' + progresoRango(p) + '%"></i></div>' : '<p class="muted">Aún no has registrado ejercicios de este grupo.</p>') + '</div></div>';
  if (ids.length) {
    h += '<div class="card"><h3>Ejercicios registrados</h3><div class="list">';
    for (const id of ids) {
      const pe = puntosEjercicio(id);
      h += '<button class="item" data-act="ver-rango-ej" data-a="' + id + '">' + insignia(rangoDePuntos(pe), "sm") + '<div class="grow"><span class="name">' + esc(buscarEj(id).nombre) + '</span><span class="muted small">' + RANGOS[rangoDePuntos(pe)].nombre + ' · ' + kg(mejor1RM(id)) + ' 1RM</span></div></button>';
    }
    h += '</div></div>';
  }
  const sugeridos = EJERCICIOS.filter(function (e) { return e.grupo === g && !ids.includes(e.id) && estado.perfil.equipo.includes(e.equipo); }).slice(0, 3);
  if (sugeridos.length) h += '<p class="muted small">Para tener más datos en este grupo puedes añadir: ' + sugeridos.map(function (e) { return esc(e.nombre); }).join(", ") + '.</p>';
  abrirHoja(h + '<p class="muted small">El rango refleja lo que registras al entrenar, no tu genética.</p></div>');
}

// ---------- Rango de un ejercicio ----------
function hojaRangoEj(id) {
  const e = buscarEj(id);
  const p = puntosEjercicio(id);
  // Sin series registradas (o ejercicio sin rango) todavía no hay puntos que enseñar
  if (p === null || p === undefined) {
    abrirHoja(cabeceraHoja(esc(e.nombre), "Rango por ejercicio") + '<div class="stack"><p>Aún no tienes series registradas de este ejercicio. Haz al menos una sesión para ver tu rango.</p><button class="btn-sec" data-act="info-ej" data-a="' + e.id + '">Ver ficha del ejercicio</button></div>');
    return;
  }
  const ri = rangoDePuntos(p);
  const n = sesionesCon(id);
  let falta = "";
  if (ri < RANGOS.length - 1) {
    const sig = RANGOS[ri + 1];
    if (sig.min > topePorSesiones(n)) {
      falta = "Necesitas " + sesionesParaDesbloquear(n) + " sesión(es) más con este ejercicio para poder subir a " + sig.nombre + ". El tope evita subir de rango con un solo día bueno.";
    } else {
      const rmN = rmParaPuntos(id, sig.min);
      const reps = e.reps[0] + 2;
      const peso = redondearA(pesoParaRM(id, rmN, reps), 0.5);
      falta = "Para " + sig.nombre + " necesitas una 1RM estimada de " + kg(rmN) + ". Por ejemplo: " + (e.asistido ? kg(peso) + " de ayuda × " + reps : (peso > 0 ? kg(peso) + (e.cuerpo ? " de lastre" : "") + " × " + reps : reps + " reps")) + ".";
    }
  }
  const fechas = [];
  for (const s of seriesDe(id)) if (!fechas.includes(s.fecha)) fechas.push(s.fecha);
  fechas.sort();
  const valores = fechas.map(function (f) { return puntosEjercicio(id, f); });
  abrirHoja(cabeceraHoja(esc(e.nombre), "Rango por ejercicio") + '<div class="stack"><div class="row">' + insignia(ri, "lg") +
    '<div class="grow stack tight"><h2>' + RANGOS[ri].nombre + '</h2><p class="muted num">' + p.toFixed(1).replace(".", ",") + ' puntos · ' + n + ' sesiones</p><div class="bar"><i style="width:' + progresoRango(p) + '%"></i></div></div></div>' +
    (falta ? '<div class="card"><p class="label">Qué te falta</p><p>' + falta + '</p></div>' : "") +
    '<div class="card stack tight"><h3>Tu evolución (puntos)</h3>' + graficaLinea(fechas.map(fechaBonita), valores, "pts", null, true) + '</div>' +
    '<p class="muted small">Cada ejercicio tiene su propia escala (factor ' + String(Math.round(factorEj(e) * 100) / 100).replace(".", ",") + ', ajustado a tu perfil), así que dos máquinas distintas nunca se mezclan.</p></div>');
}

function hojaComoRangos() {
  let filas = "";
  RANGOS.forEach(function (r, i) { filas += '<div class="item">' + insignia(i, "sm") + '<span class="grow" style="font-weight:700">' + r.nombre + '</span><span class="muted num small">desde ' + r.min + ' pts</span></div>'; });
  const e = buscarEj("press-banca");
  const bw = pesoCorporalActual();
  const ref = referenciaCorporal(bw);
  const rm = unaRM(60, 8);
  const pts = Math.min(100, 75 * rm / (factorEj(e) * ref));
  function f(n) { return (Math.round(n * 10) / 10).toLocaleString(localeApp()); }
  function paso(t, txt) { return '<div class="card stack tight"><h3>' + t + '</h3>' + txt + '</div>'; }
  abrirHoja(cabeceraHoja("Reglas de los rangos", "Algoritmo público · v2") + '<div class="stack">' +
    paso("1. Fuerza estimada", '<p class="small"><b>1RM = peso × (1 + reps ÷ 30)</b>. Cada repetición extra suma un 3,3 %, hasta 12 repeticiones.</p>') +
    paso("2. Peso corporal justo", '<p class="small">Referencia = <b>75 × (peso ÷ 75)<sup>0,67</sup></b>. Una persona de 90 kg necesita un 31 % más que una de 60 kg, no un 50 %. Se usa tu peso del día de cada serie.</p>') +
    paso("3. Puntos de una serie", '<p class="small"><b>75 × 1RM ÷ (factor × referencia)</b>, máximo 100.</p><p class="small">El factor se ajusta a tu sexo: para mujeres, tren superior × 0,6 y tren inferior × 0,75; con «Prefiero no decirlo», un punto intermedio. Así, cada persona se compara con un nivel justo para ella.</p><p class="small muted">Ejemplo con tu peso (' + f(bw) + ' kg): press banca 60 kg × 8 → ' + f(pts) + ' puntos.</p>') +
    paso("4. Rendimiento habitual, no un día suelto", '<p class="small">La nota de un ejercicio es la <b>media de tus 3 mejores sesiones</b> en las 12 semanas anteriores a tu último registro. Un día excepcional no te sube de rango por sí solo.</p>') +
    paso("5. Fiabilidad", '<p class="small">Tope según sesiones con el ejercicio: 1 → ' + RANGOS[rangoDePuntos(35)].nombre + ', 2-3 → ' + RANGOS[rangoDePuntos(57)].nombre + ', 4-5 → ' + RANGOS[rangoDePuntos(77)].nombre + ', 6 o más → sin tope. Un grupo con un solo ejercicio distinto tiene tope de ' + RANGOS[rangoDePuntos(77)].nombre + '.</p>') +
    paso("6. Cuerpo completo", '<p class="small">El global es la media de los <b>8 músculos principales</b>; los que no tienen datos cuentan 0. Antebrazos, abdominales y gemelos tienen rango propio pero no cuentan en el global. Tope: menos de 5 entrenos válidos → ' + RANGOS[rangoDePuntos(35)].nombre + '; menos de 15 → ' + RANGOS[rangoDePuntos(67)].nombre + '.</p>') +
    paso("7. Datos fiables", '<p class="small">Un entreno solo cuenta si tiene al menos una serie válida. Los pesos imposibles se bloquean y los raros quedan en revisión hasta que los confirmas.</p>') +
    '<div class="card"><div class="list">' + filas + '</div></div>' +
    '<p class="muted small">Factores de dificultad: ' + FACTORES_VERSION + '. Mismos registros = mismo rango, siempre.</p></div>');
}

// ---------- Crear reto ----------
function hojaReto() {
  const hechos = ejerciciosHechos();
  abrirHoja(cabeceraHoja("Nuevo reto", "Reto personal") + '<div class="stack">' +
    '<label class="f">Tipo de reto<select id="rTipo">' + Object.keys(TIPOS_RETO).map(function (k) { return '<option value="' + k + '">' + TIPOS_RETO[k].nombre + ' (' + TIPOS_RETO[k].unidad + ')</option>'; }).join("") + '</select></label>' +
    '<label class="f">Meta<input id="rMeta" type="number" inputmode="decimal" min="1" step="1" value="8"></label>' +
    '<label class="f">Ejercicio (solo para "Mejora en un ejercicio")<select id="rEj">' + (hechos.length ? hechos.map(function (id) { return '<option value="' + id + '">' + esc(buscarEj(id).nombre) + '</option>'; }).join("") : '<option value="">Sin ejercicios registrados</option>') + '</select></label>' +
    '<div class="grid2"><label class="f">Empieza<input id="rInicio" type="date" value="' + hoy() + '"></label><label class="f">Termina<input id="rFin" type="date" value="' + fechaTexto(-27) + '"></label></div>' +
    '<p class="muted small">El progreso se calcula solo con tus sesiones válidas dentro de esas fechas.</p>' +
    '<p class="err" id="rError"></p><button class="btn" data-act="crear-reto">Crear reto</button></div>');
}

// ---------- Ajustes ----------
function hojaAjustes() {
  const a = estado.ajustes;
  const n = a.notif;
  function chk(id, valor, texto) { return '<label class="check"><input type="checkbox" id="' + id + '"' + (valor ? " checked" : "") + '>' + texto + '</label>'; }
  const diasCopia = a.ultimaCopia ? diasEntre(a.ultimaCopia, hoy()) : null;
  abrirHoja(cabeceraHoja("Perfil y ajustes", estado.modo === "demo" ? "Modo demo" : "Cuenta en este dispositivo") + '<div class="stack">' +
    '<div class="chips indice-ajustes">' + [["aj-idioma", "🌐"], ["aj-nube", "☁️ Cuenta"], ["aj-copia", "💾 Copia"], ["aj-perfil", "Perfil"], ["aj-entreno", "Entreno"], ["aj-sonido", "Sonido"], ["aj-avisos", "Avisos"], ["aj-datos", "Datos"]].map(function (x) {
      return '<button class="chip" data-act="ir-seccion" data-a="' + x[0] + '">' + x[1] + '</button>'; }).join("") + '</div>' +
    '<div class="card stack tight" id="aj-idioma"><h3>🌐 Idioma · Language · Langue</h3>' + selectorIdioma() + '</div>' +
    tarjetaNube() +
    // Copia de seguridad: arriba, para que se encuentre fácil
    '<div class="card stack tight copia-ajustes" id="aj-copia"><h3>💾 Copia de seguridad</h3>' +
      '<p class="small">' + (diasCopia === null ? "<b>Aún no tienes ninguna copia.</b>" : "Última copia: <b>" + fechaBonita(a.ultimaCopia) + "</b> (hace " + diasCopia + " día" + (diasCopia === 1 ? "" : "s") + ").") + (conectado() ? ' Tus entrenos ya se guardan en la nube; esta copia es un extra por si acaso.' : ' Tus entrenos solo están en este móvil: si borras la app, se pierden.') + '</p>' +
      '<button class="btn full" data-act="hacer-copia">Hacer copia ahora</button>' +
      '<p class="muted small">Se crea un archivo. En el iPhone, elige «Guardar en Archivos», Drive o mándatelo por correo.</p>' +
      '<button class="btn-sec full" data-act="abrir-importar">Restaurar una copia</button>' +
      '<label class="f">Recordarme hacer copia<select id="aCopiaDias">' + opciones([[7, "Cada semana"], [14, "Cada 2 semanas"], [30, "Cada mes"], [0, "Nunca"]], a.copiaDias === undefined ? 14 : a.copiaDias) + '</select></label></div>' +
    '<div class="card stack" id="aj-perfil">' + formPerfil(estado.perfil) + '</div>' +
    '<div class="card stack" id="aj-entreno"><h3>Entrenamiento</h3>' +
      '<div class="grid2"><label class="f">Descanso en compuestos<select id="aDescComp">' + opciones([[90, "90 s"], [120, "2 min"], [150, "2:30"], [180, "3 min"], [240, "4 min"]], a.descansoCompuesto || 120) + '</select></label>' +
      '<label class="f">Descanso en aislamiento<select id="aDescanso">' + opciones([[45, "45 s"], [60, "60 s"], [75, "75 s"], [90, "90 s"], [120, "2 min"]], a.descansoAislamiento || 75) + '</select></label></div>' +
      '<p class="muted small" style="margin-top:-4px">Para ejercicios añadidos a mano. En la rutina, cada ejercicio guarda su propio descanso.</p>' +
      '<div class="grid2"><label class="f">Incremento barra y máquina<select id="aIncremento">' + opciones([[1, "1 kg"], [1.25, "1,25 kg"], [2.5, "2,5 kg"], [5, "5 kg"]], a.incremento) + '</select></label>' +
      '<label class="f">Incremento de mancuernas<select id="aIncMancuernas">' + opciones([[1, "1 kg"], [2, "2 kg"], [2.5, "2,5 kg"]], a.incrementoMancuernas) + '</select></label></div>' +
      '<label class="f">Fórmula del 1RM estimado<select id="aFormula">' + opciones(Object.keys(FORMULAS_1RM).map(function (k) { return [k, FORMULAS_1RM[k].nombre]; }), a.formula1RM || "epley") + '</select></label>' +
      '<p class="muted small" style="margin-top:-4px">Cambia el 1RM que ves en Progreso. Los rangos usan siempre Epley, para que sean justos para todos.</p>' +
      '<label class="f">Unidades<select id="aUnidad">' + opciones([["kg", "Kilogramos (kg)"], ["lb", "Libras (lb)"]], a.unidad || "kg") + '</select></label>' +
      '<p class="muted small">Tus datos se guardan siempre igual: cambiar de unidad no pierde nada.</p></div>' +
    '<div class="card stack"><h3>Apariencia</h3><div class="seg">' + [["oscuro", "Oscuro"], ["claro", "Claro"], ["sistema", "Sistema"]].map(function (o) { return '<button data-act="tema" data-a="' + o[0] + '" class="' + (a.tema === o[0] ? "on" : "") + '">' + o[1] + '</button>'; }).join("") + '</div></div>' +
    '<div class="card stack"><h3>Privacidad</h3><label class="f">Quién ve tu perfil<select id="aPrivacidad">' + opciones([["publico", "Todo el mundo"], ["amigos", "Solo amigos"], ["privado", "Solo yo"]], a.privacidad) + '</select></label>' +
      chk("aCompartir", a.compartir, "Mostrar mis entrenos a mis amigos") + '</div>' +
    '<div class="card stack tight"><h3>Instalar en el móvil</h3>' + textoInstalar() + '</div>' +
    '<div class="card stack tight"><h3>Calentamiento</h3>' + chk("aCalentamiento", a.calentamiento !== false, "Proponer series de calentamiento") +
      '<p class="muted small">En los ejercicios grandes con peso (sentadilla, press banca, peso muerto…). No cuentan para récords ni rangos.</p></div>' +
    '<div class="card stack tight" id="aj-sonido"><h3>Sonido y vibración</h3>' + chk("aSonido", a.sonido !== false, "Efectos de sonido") + chk("aVibracion", a.vibracion !== false, "Vibración") +
      (("wakeLock" in navigator) ? chk("aPantalla", a.pantallaEncendida !== false, "No apagar la pantalla mientras entreno") : "") +
      '<p class="muted small">Prueba los sonidos:</p><div class="chips" style="flex-wrap:wrap">' + [["serie", "Serie"], ["descanso", "Descanso"], ["record", "Récord"], ["rango", "Rango"], ["fin", "Fin"], ["racha", "Racha"], ["enfadado", "Apix enfadado"]].map(function (x) { return '<button class="chip" data-act="probar-sonido" data-a="' + x[0] + '">' + x[1] + '</button>'; }).join("") + '</div></div>' +
    '<div class="card stack tight"><h3>Apix, la mascota</h3>' + chk("aMascota", a.mascota !== false, "Mostrar a Apix en Inicio") +
      '<button class="btn-sec" data-act="ver-tutorial">Ver el tutorial otra vez</button>' +
      '<p class="muted small">Te anima los días de entreno, se enfada si pierdes la racha y celebra tus récords. Tócalo en Inicio y te contestará.</p></div>' +
    '<div class="card stack tight" id="aj-avisos"><h3>Notificaciones</h3>' +
      chk("nRec", n.recordatorios, "Recordatorio los días de entreno") + chk("nRacha", n.racha !== false, "Aviso si tu racha está en peligro") + chk("nReto", n.retos !== false, "Aviso del último día de un reto") +
      '<label class="f">Hora del recordatorio<select id="nHora">' + opciones([[8, "8:00"], [10, "10:00"], [12, "12:00"], [16, "16:00"], [17, "17:00"], [18, "18:00"], [19, "19:00"], [20, "20:00"]], n.hora || 18) + '</select></label>' +
      '<button class="btn-sec" data-act="activar-avisos">' + (permisoAvisos() === "granted" ? "✓ Avisos activados en este móvil · Probar" : "Activar avisos en este móvil") + '</button>' +
      '<p class="muted small">' + (permisoAvisos() === "denied" ? "Has bloqueado los avisos. Actívalos en los ajustes del navegador." : (permisoAvisos() === "no" ? "Este navegador no permite avisos. En iPhone, instala la app en la pantalla de inicio." : (pushActivo() ? "Te llegan a esa hora aunque tengas la app cerrada. Máximo 1 al día." : "Llegan si abres la app ese día o la tienes en segundo plano. Máximo 1 al día."))) + '</p>' +
      chk("nRecords", n.records, "Récords personales") + chk("nRangos", n.rangos, "Ascensos de rango") + chk("nSemanal", n.semanal, "Resumen semanal") +
      '</div>' +
    '<button class="btn" data-act="guardar-ajustes">Guardar cambios</button><p class="muted small" id="aOk"></p>' +
    '<div class="card stack tight" id="aj-datos"><h3>Tus datos</h3>' +
      '<button class="btn-sec full" data-act="abrir-gimnasio">Mi gimnasio (máquinas disponibles)</button>' +
      '<button class="btn-sec full" data-act="abrir-privacidad">Privacidad y condiciones de uso</button>' +
      '<button class="btn-sec full" data-act="informar-problema">Informar de un problema</button>' +
      // Herramientas para revisar la app: solo se ven abriendo la app con ?dev al final de la dirección
      (MODO_DESARROLLO ? '<button class="btn-sec full" data-act="exportar">Ver los datos como texto</button>' +
        '<button class="btn-sec full" data-act="pruebas">Ejecutar pruebas de calidad</button>' +
        '<button class="btn-sec full" data-act="abrir-piloto">Prueba piloto</button>' : "") +
      '<button class="btn-sec full" data-act="cerrar-sesion">Cerrar sesión</button>' +
      '<button class="btn-sec full btn-danger" data-act="borrar-todo">' + (confirmar === "borrar-todo" ? "Pulsa otra vez: se borrará todo" : "Eliminar cuenta y datos") + '</button></div></div>');
}

// ---------- Cuenta en la nube (la parte de internet está en nube.js) ----------
function tarjetaNube() {
  let h = '<div class="card stack tight copia-ajustes" id="aj-nube"><h3>☁️ Cuenta en la nube</h3>';
  if (estado.modo === "demo") return h + '<p class="muted small">No disponible en el modo demo. Crea tu perfil para usarla.</p></div>';
  if (!conectado()) {
    return h + '<p class="small">Crea una cuenta gratis y tus entrenos se guardarán solos en la nube. Si cambias de móvil, inicias sesión y lo recuperas todo.</p>' +
      (nube && nube.ultimoError ? '<p class="err small">' + esc(nube.ultimoError) + '</p>' : "") +
      '<button class="btn full" data-act="abrir-cuenta" data-a="crear">Crear cuenta</button>' +
      '<button class="btn-sec full" data-act="abrir-cuenta" data-a="entrar">Ya tengo cuenta: iniciar sesión</button></div>';
  }
  return h + '<p class="small">Conectado como <b>' + esc(nube.email) + '</b></p>' +
    '<p class="muted small" id="nubeEstado">' + esc(textoEstadoNube()) + '</p>' +
    '<button class="btn-sec full" data-act="nube-sync">Sincronizar ahora</button>' +
    '<button class="btn-txt" data-act="nube-salir">Cerrar sesión de la nube</button></div>';
}

// modo: "crear", "entrar", "olvido" o "nueva" (poner contraseña nueva al volver del correo)
function hojaCuenta(modo, aviso) {
  const titulos = { crear: "Crear cuenta", entrar: "Iniciar sesión", olvido: "Recuperar contraseña", nueva: "Nueva contraseña" };
  let h = cabeceraHoja(titulos[modo], "Cuenta en la nube") + '<div class="stack">';
  if (aviso) h += '<p class="small">' + esc(aviso) + '</p>';
  if (modo === "crear") h += '<label class="f">Nombre de usuario (único, lo verán tus amigos)<input id="cUsuario" autocapitalize="off" autocomplete="username" maxlength="20" placeholder="p. ej. abde.fit" value="' + esc(estado && estado.perfil ? estado.perfil.usuario : "") + '"></label>';
  if (modo !== "nueva") h += '<label class="f">Correo electrónico<input id="cEmail" type="email" inputmode="email" autocomplete="email" autocapitalize="off" placeholder="tucorreo@gmail.com"></label>';
  if (modo !== "olvido") h += '<label class="f">' + (modo === "entrar" ? "Contraseña" : "Contraseña (mínimo 8 caracteres)") +
    '<input id="cPass" type="password" autocomplete="' + (modo === "entrar" ? "current-password" : "new-password") + '"></label>';
  if (modo === "crear") h += '<label class="check priv-ok"><input type="checkbox" id="cAcepto"><span>Acepto que mis datos de Apix Gym (perfil, entrenos, medidas y, si las apunto, lesiones o molestias) se guarden en la nube, según la <a href="privacidad.html" target="_blank" rel="noopener">política de privacidad</a>.</span></label>';
  h += '<p class="err" id="cError"></p>';
  const botones = { crear: ["cuenta-crear", "Crear cuenta"], entrar: ["cuenta-entrar", "Iniciar sesión"], olvido: ["cuenta-olvido", "Enviarme un correo"], nueva: ["cuenta-nueva", "Guardar contraseña"] };
  h += '<button class="btn" id="cBoton" data-act="' + botones[modo][0] + '">' + botones[modo][1] + '</button>';
  if (modo === "entrar") h += '<button class="btn-txt" data-act="abrir-cuenta" data-a="olvido">¿Has olvidado la contraseña?</button>' +
    (estado ? '<button class="btn-txt" data-act="abrir-cuenta" data-a="crear">No tengo cuenta: crear una</button>' : "");
  if (modo === "crear") h += '<button class="btn-txt" data-act="abrir-cuenta" data-a="entrar">Ya tengo cuenta: iniciar sesión</button>';
  abrirHoja(h + '</div>');
}

// Después de crear la cuenta: hay que pulsar el enlace del correo y volver
function hojaConfirmarCorreo(email) {
  abrirHoja(cabeceraHoja("Confirma tu correo", "Cuenta en la nube") + '<div class="stack">' +
    '<p class="small">Te hemos enviado un email a <b>' + esc(email) + '</b> (mira también en «Spam»).</p>' +
    '<div class="card stack tight"><p class="small"><b>1.</b> Abre el correo y pulsa <b>«Confirm your mail»</b>. Se abrirá una página del navegador que dice «Correo confirmado»: ciérrala.</p>' +
    '<p class="small"><b>2.</b> Vuelve aquí y pulsa este botón:</p></div>' +
    '<p class="err" id="cError"></p>' +
    '<button class="btn" id="cBoton" data-act="cuenta-ya-confirmada">Ya lo he confirmado</button>' +
    '<button class="btn-txt" data-act="cuenta-reenviar">No me ha llegado: enviar otra vez</button></div>');
}

function hojaElegirUsuario() {
  abrirHoja(cabeceraHoja("Elige tu nombre de usuario", "Cuenta en la nube") + '<div class="stack">' +
    '<p class="small">Tu cuenta aún no tiene nombre de usuario. Es único: nadie más podrá usarlo.</p>' +
    '<label class="f">Nombre de usuario<input id="cUsuario" autocapitalize="off" maxlength="20" value="' + esc(estado && estado.perfil ? estado.perfil.usuario : "") + '"></label>' +
    '<p class="muted small">De 3 a 20 letras minúsculas, números, puntos o guiones bajos.</p>' +
    '<p class="err" id="cError"></p><button class="btn" id="cBoton" data-act="cuenta-usuario">Guardar usuario</button></div>');
}

// Página sencilla cuando el enlace del correo se abre en el navegador y no en la app
function pantallaVueltaCorreo(titulo, texto) {
  cerrarHoja();
  $("tabs").hidden = true;
  $("app").innerHTML = '<div class="welcome">' + insignia(8, "logo") + '<h1>' + esc(titulo) + '</h1><p class="muted">' + esc(texto) + '</p></div>';
}

// Los datos han cambiado en la nube Y en este móvil: el usuario elige cuáles se quedan
let copiaEnEspera = null;
// ---------- Aviso de política de privacidad actualizada ----------
// Si el usuario aceptó una versión anterior de la política, se le avisa una vez al abrir la app.
function versionPrivacidadAceptada() {
  const texto = (estado && estado.ajustes && estado.ajustes.privacidadAceptada) || "";
  const m = texto.match(/ v(\d+)/);
  return m ? Number(m[1]) : 0;
}
function hayPoliticaNueva() {
  if (!estado || !estado.perfil || estado.modo === "demo" || estado.activa) return false;
  return versionPrivacidadAceptada() < VERSION_PRIVACIDAD;
}
function hojaPoliticaNueva() {
  abrirHoja(cabeceraHoja("Política de privacidad actualizada", "Aviso") + '<div class="stack">' +
    '<p>Hemos actualizado la política de privacidad. Lo más importante:</p>' +
    '<ul class="small" style="padding-left:20px;margin:0">' +
      '<li>Ahora contamos cuánta gente abre la app cada día. Es anónimo: no se envía tu nombre, tu correo ni tus entrenos.</li>' +
    '</ul>' +
    '<p class="muted small">Tus datos se siguen usando igual: solo para que la app funcione.</p>' +
    '<button class="btn-sec full" data-act="abrir-privacidad">Leer la política</button>' +
    '<button class="btn full" data-act="privacidad-vista">Entendido</button></div>');
}

function hojaConflictoNube(copia) {
  copiaEnEspera = copia;
  const enNube = (copia.datos && copia.datos.sesiones ? copia.datos.sesiones.length : 0);
  const fecha = new Date(copia.actualizado).toLocaleString(localeApp(), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  abrirHoja(cabeceraHoja("¿Qué datos usamos?", "Cuenta en la nube") + '<div class="stack">' +
    '<p class="small">Hay datos distintos en la nube y en este móvil. Elige cuáles quieres conservar: <b>los otros se sustituyen</b>.</p>' +
    '<div class="card stack tight"><h3>☁️ En la nube</h3><p class="small">' + enNube + ' entrenos · guardado el ' + esc(fecha) + '</p>' +
      '<button class="btn full" data-act="nube-usar-nube">Usar los de la nube</button></div>' +
    '<div class="card stack tight"><h3>📱 En este móvil</h3><p class="small">' + estado.sesiones.length + ' entrenos</p>' +
      '<button class="btn-sec full" data-act="nube-usar-movil">Usar los de este móvil</button></div>' +
    '<p class="muted small">Consejo: si no estás seguro, antes haz una copia en Ajustes → «Hacer copia ahora».</p></div>');
}

function hojaPruebas() {
  const r = ejecutarPruebas();
  const ok = r.filter(function (x) { return x.ok; }).length;
  let h = cabeceraHoja("Pruebas de calidad", ok + " de " + r.length + " superadas") + '<div class="stack"><p class="muted small">Se ejecutan sobre datos de ejemplo. Tus datos no se modifican.</p><div class="card"><div class="list">';
  let grupoActual = "";
  for (const x of r) {
    if (x.grupo !== grupoActual) { grupoActual = x.grupo; h += '<p class="label" style="padding-top:10px">' + esc(grupoActual) + '</p>'; }
    h += '<div class="item"><span style="width:22px;flex:none;color:' + (x.ok ? "var(--good)" : "var(--danger)") + '">' + (x.ok ? I.check : I.cerrar) + '</span><div class="grow"><span class="small" style="font-weight:700">' + esc(x.nombre) + '</span>' + (x.detalle ? '<span class="err small" style="display:block">' + esc(x.detalle) + '</span>' : "") + '</div></div>';
  }
  abrirHoja(h + '</div></div><p class="muted small">Pendientes de la versión con servidor: acceso a datos de otros usuarios, sincronización entre dispositivos y uso sin conexión con sincronización.</p></div>');
}

function hojaExportar() {
  abrirHoja(cabeceraHoja("Exportar datos", "Copia de seguridad") + '<div class="stack"><p class="muted">Copia este texto y guárdalo en un archivo. Contiene todo tu historial en formato JSON, con la versión del formato para poder importarlo en versiones futuras.</p>' +
    '<textarea id="exportTxt" aria-label="Tus datos en texto" readonly style="min-height:220px;font-family:ui-monospace,monospace;font-size:.75rem">' + esc(exportarDatos()) + '</textarea>' +
    '<button class="btn" data-act="copiar-export">Copiar</button><p class="muted small" id="copiaOk"></p></div>');
}

// =====================================================
// CELEBRACIÓN (récord o ascenso)
// =====================================================

function celebrar(resultado) {
  const asc = resultado.ascensos[0];
  const s = resultado.sesion;
  const rango = asc ? asc.rango : (puntosGlobal() !== null ? rangoDePuntos(puntosGlobal()) : 0);
  const conApix = estado.ajustes.mascota !== false && s.prs.length;
  $("celebraMsg").innerHTML = '<div class="insignia-ascenso' + (asc ? " sube" : "") + '" style="--c:' + RANGOS[rango].color + '"><span class="rayos" aria-hidden="true"></span>' + insignia(rango, "xl") + '</div>' +
    (conApix ? '<div class="row" style="gap:8px;text-align:left">' + apixSVG("celebra", "sm") + '<p class="small"><b>Apix:</b> ¡Eso antes no lo levantabas! Estoy orgulloso de ti.</p></div>' : "") +
    '<p class="label" style="color:var(--accent)">' + (asc ? "Subes de rango" : "Entreno completado") + '</p>' +
    '<h1>' + (asc ? esc(asc.nombre) + ' · ' + RANGOS[asc.rango].nombre : s.prs.length + " récord" + (s.prs.length > 1 ? "s" : "") + " nuevo" + (s.prs.length > 1 ? "s" : "")) + '</h1>' +
    '<p class="muted">' + (s.prs.length ? s.prs.map(function (id) { return esc(buscarEj(id).nombre); }).join(" · ") : "") + '</p>' +
    '<button class="btn" data-act="ver-resumen" style="margin-top:8px">Ver resumen</button>';
  $("celebra").hidden = false;
  window._resumen = resultado;
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) destello(RANGOS[rango].color);
}

// Anillos de luz y chispas dibujados en un canvas
function destello(color) {
  const c = $("destello"), ctx = c.getContext("2d");
  c.width = innerWidth; c.height = innerHeight;
  const cx = c.width / 2, cy = c.height / 2 - 90;
  const chispas = [];
  for (let i = 0; i < 60; i++) chispas.push({ a: Math.random() * Math.PI * 2, v: Math.random() * 6 + 3, d: 0, l: Math.random() * 14 + 6 });
  let f = 0;
  (function paso() {
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.shadowBlur = 16; ctx.shadowColor = color; ctx.strokeStyle = color;
    for (let k = 0; k < 3; k++) {
      const t = f - k * 12;
      if (t > 0 && t < 70) { ctx.globalAlpha = 1 - t / 70; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, 70 + t * 5, 0, Math.PI * 2); ctx.stroke(); }
    }
    ctx.lineWidth = 2;
    for (const s of chispas) {
      s.d += s.v; s.v *= 0.96;
      ctx.globalAlpha = Math.max(0, 1 - f / 90);
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(s.a) * s.d, cy + Math.sin(s.a) * s.d); ctx.lineTo(cx + Math.cos(s.a) * (s.d + s.l), cy + Math.sin(s.a) * (s.d + s.l)); ctx.stroke();
    }
    ctx.globalAlpha = 1; f++;
    if (f < 100 && !$("celebra").hidden) requestAnimationFrame(paso); else ctx.clearRect(0, 0, c.width, c.height);
  })();
}

// =====================================================
// TEMPORIZADOR DE DESCANSO
// =====================================================

// Para que suene el final del descanso con la app cerrada hacen falta notificaciones.
// Si ya hay permiso, se apunta el móvil en el servidor; si no, se enseña un botón para pedirlo.
function prepararAvisoDescanso() {
  const boton = $("timerAviso");
  boton.hidden = true;
  if (typeof pushDisponible !== "function" || !pushDisponible() || estado.modo === "demo") return;
  if (Notification.permission === "granted") { if (!pushActivo()) sincronizarAvisosPush(); }
  else if (Notification.permission === "default") boton.hidden = false;
}

// La hora de fin se guarda en la sesión: sobrevive a bloquear el móvil y a recargar la página
let tRest = 0, tTotal = 0, tFin = 0, tIntervalo = null;
function empezarDescanso(seg, finGuardado) {
  tTotal = seg; tFin = finGuardado || Date.now() + seg * 1000; $("timer").hidden = false; document.body.classList.add("con-timer");
  $("timer").classList.toggle("grande", !!(estado && estado.ajustes.timerGrande));
  prepararAvisoDescanso();
  if (estado.activa && !finGuardado) { estado.activa.descanso = { fin: tFin, total: tTotal }; guardar(); }
  clearInterval(tIntervalo);
  let ultimoTic = null;
  tIntervalo = setInterval(function () {
    tRest = Math.ceil((tFin - Date.now()) / 1000);
    if (tRest <= 0) { pararDescanso(); avisoFinDescanso(); return; }
    if (tRest <= 3 && tRest !== ultimoTic) { ultimoTic = tRest; sonar("tic"); }     // 3, 2, 1…
    pintarTimer();
  }, 250);
  tRest = Math.max(1, Math.ceil((tFin - Date.now()) / 1000)); pintarTimer();
}
// Al abrir la app con un descanso en marcha, lo retoma donde iba
function reanudarDescanso() {
  if (estado && estado.activa && descansoRestante(estado.activa) > 0) empezarDescanso(estado.activa.descanso.total, estado.activa.descanso.fin);
}
function ajustarDescanso(seg) {
  tFin = Math.max(Date.now() + 1000, tFin + seg * 1000);
  tRest = Math.ceil((tFin - Date.now()) / 1000);
  tTotal = Math.max(tTotal, tRest);
  if (estado.activa) { estado.activa.descanso = { fin: tFin, total: tTotal }; guardar(); }
  pintarTimer();
}
function pintarTimer() {
  $("timerTxt").textContent = Math.floor(tRest / 60) + ":" + String(tRest % 60).padStart(2, "0");
  $("timerBar").style.width = (tRest / tTotal * 100) + "%";
  $("timerAnillo").style.strokeDashoffset = (276.5 * (1 - tRest / tTotal)).toFixed(1);
  const sig = textoSiguiente();
  if ($("timerSig").textContent !== sig) $("timerSig").textContent = sig;
}
// Pitido corto y vibración (si el dispositivo lo permite)
function avisoFinDescanso() {
  sonar("descanso");                                    // timbre de campana
  apixDice("anima", "¡Descanso terminado! A por ella." + (textoSiguiente() ? "|Siguiente: " + textoSiguiente() : ""), 3500);
  document.body.classList.remove("destello-fin"); void document.body.offsetWidth; document.body.classList.add("destello-fin");
  // Si la app está en segundo plano y tienes los avisos activados, llega también una notificación
  // (si ya lo va a mandar el servidor por push, no se repite aquí)
  if (document.visibilityState === "hidden" && !descansoEnServidor && typeof mostrarAviso === "function") mostrarAviso("⏰ Descanso terminado", textoSiguiente() || "A por la siguiente serie.");
}
function pararDescanso() {
  clearInterval(tIntervalo); $("timer").hidden = true; document.body.classList.remove("con-timer");
  if (estado && estado.activa && estado.activa.descanso) { estado.activa.descanso = null; guardar(); }
}

// =====================================================
// NAVEGACIÓN Y PINTADO GENERAL
// =====================================================

function aplicarTema() {
  const t = estado ? estado.ajustes.tema : "oscuro";
  if (t === "oscuro") document.documentElement.dataset.theme = "dark";
  else if (t === "claro") document.documentElement.dataset.theme = "light";
  else delete document.documentElement.dataset.theme;
}

function avisoGuardado() {
  const el = document.getElementById("avisoGuardado");
  if (el) el.hidden = !errorGuardado;
}

// Apix aparece un momento con una frase (al completar series, récords, fin del descanso…)
let tApix = null, fraseN = 0;
const FRASES_SERIE = ["¡Una menos! 💪", "¡Bien hecho!", "¡Buena serie!", "Así se hace.", "¡Sigue así!", "¡Eso es constancia!", "Respira y a por la siguiente.",
  "Una serie más cerca de tu objetivo.", "Ni una repetición regalada.", "Así se construye el cuerpo que quieres.",
  "Una menos. Las pesas ya te tienen miedo."];
function apixDice(humor, texto, ms) {
  if (!estado || estado.ajustes.mascota === false) return;
  const el = $("apixPop");
  if (!el) return;
  const partes = String(texto).split("|");          // "Frase principal|detalle opcional"
  el.innerHTML = apixSVG(humor, "pop") + '<p>' + esc(partes[0]) + (partes[1] ? '<span>' + esc(partes[1]) + '</span>' : "") + '</p>';
  el.className = "";
  el.hidden = false;
  void el.offsetWidth;                       // reinicia la animación si ya estaba en pantalla
  el.className = "entra humor-" + humor;
  clearTimeout(tApix);
  tApix = setTimeout(function () { el.hidden = true; }, ms || 2200);
}
function fraseSerie() { fraseN = (fraseN + 1) % FRASES_SERIE.length; return FRASES_SERIE[fraseN]; }

// Aviso breve que aparece abajo y se va solo. Sirve para confirmar que algo ha funcionado.
let tToast = null;
function toast(texto, tipo) {
  const t = $("toast");
  if (!t) return;
  t.textContent = texto;
  t.className = tipo || "";
  t.hidden = false;
  clearTimeout(tToast);
  tToast = setTimeout(function () { t.hidden = true; }, 2600);
}

// Compartir con otras apps del móvil (WhatsApp, Instagram…). Si no se puede, copia el texto.
function compartirTexto(titulo, texto, url) {
  titulo = tr(titulo); texto = tr(texto);
  const completo = texto + (url ? "\n" + url : "");
  if (navigator.share) {
    navigator.share({ title: titulo, text: texto, url: url || undefined }).then(function () { toast("✓ Enviado", "ok"); }).catch(function (e) {
      if (e && e.name === "AbortError") return;           // el usuario cerró el menú: no es un error
      copiarTexto(completo);
    });
  } else copiarTexto(completo);
}
function copiarTexto(texto) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(texto).then(function () { toast("✓ Copiado. Pégalo en WhatsApp o donde quieras.", "ok"); }, function () { hojaCopiar(texto); });
  } else hojaCopiar(texto);
}
function hojaCopiar(texto) {
  abrirHoja(cabeceraHoja("Copia este texto", "Compartir") + '<textarea id="textoCopiar" readonly style="min-height:120px">' + esc(texto) + '</textarea><p class="muted small">Mantén pulsado el texto para copiarlo y pégalo en WhatsApp.</p>');
  const ta = $("textoCopiar"); if (ta) { ta.focus(); ta.select(); }
}

function mensaje(titulo, texto) {
  abrirHoja(cabeceraHoja(esc(titulo), "") + '<div class="stack"><p>' + esc(texto) + '</p><button class="btn" data-act="cerrar-hoja">Entendido</button></div>');
}

// =====================================================
// TUTORIAL DE BIENVENIDA: Apix enseña la app en 6 pasos la primera vez
// =====================================================
const PASOS_TUTORIAL = [
  { tab: "inicio", humor: "contento", titulo: "¡Hola! Soy Apix 👋", texto: "Estaré aquí para que cumplas tus objetivos. Te enseño la app en 30 segundos." },
  { tab: "inicio", humor: "anima", titulo: "Tu entreno de hoy", texto: "En Inicio ves qué te toca hoy. Pulsa «Empezar» y la app te guía ejercicio a ejercicio." },
  { tab: "entrenar", humor: "anima", titulo: "Apunta cada serie", texto: "Escribe los kg y las repeticiones y pulsa ✓. El descanso empieza solo y te aviso cuando acabe." },
  { tab: "rangos", humor: "contento", titulo: "Sube de rango", texto: "Cada músculo tiene su rango, de Hierro a Apex. Entrena equilibrado para subir tu rango global." },
  { tab: "progreso", humor: "contento", titulo: "Mira cómo mejoras", texto: "Aquí tienes tus récords, tus entrenos por semanas y las gráficas de cada ejercicio." },
  { tab: "social", humor: "anima", titulo: "Entrena con amigos", texto: "Si quieres, añade amigos, mira sus entrenos y reaccionad con 💪🔥. ¡A por ello!" }
];
let pasoTutorial = -1;

function mostrarTutorial(paso) {
  pasoTutorial = paso;
  const p = PASOS_TUTORIAL[paso];
  tab = p.tab; pintar(); window.scrollTo(0, 0);
  // Resaltar la pestaña de abajo de la que habla este paso
  for (const b of document.querySelectorAll("nav.tabs button")) b.classList.toggle("tuto-on", b.dataset.tab === p.tab);
  $("tutoApix").innerHTML = apixSVG(p.humor);
  $("tutoPaso").textContent = "Paso " + (paso + 1) + " de " + PASOS_TUTORIAL.length;
  $("tutoTitulo").textContent = p.titulo;
  $("tutoTexto").textContent = p.texto;
  $("tutoBoton").textContent = paso === PASOS_TUTORIAL.length - 1 ? "¡Vamos!" : "Siguiente";
  $("tutorial").hidden = false;
}

function cerrarTutorial() {
  pasoTutorial = -1;
  $("tutorial").hidden = true;
  for (const b of document.querySelectorAll("nav.tabs button")) b.classList.remove("tuto-on");
  estado.ajustes.tutorialVisto = true;
  guardar(); tab = "inicio"; pintar();
}

function pintar() {
  aplicarTema();
  avisoGuardado();
  pantallaEncendida();
  if (!estado) { pintarBienvenida(); return; }
  $("tabs").hidden = false;
  for (const b of document.querySelectorAll("nav.tabs button")) b.classList.toggle("on", b.dataset.tab === tab);
  if (tab === "inicio") pintarInicio();
  if (tab === "entrenar") pintarEntrenar();
  if (tab === "rangos") pintarRangos();
  if (tab === "progreso") pintarProgreso();
  if (tab === "social") pintarSocial();
}

function irA(nuevo) {
  const cambia = nuevo !== tab;
  tab = nuevo; confirmar = ""; window.scrollTo(0, 0); pintar();
  if (cambia) entradaSuave();
}

// Al cambiar de pestaña, el contenido entra con un fundido corto y las cifras grandes cuentan desde 0
function entradaSuave() {
  if (animacionesPausadas()) return;
  const app = $("app");
  app.classList.remove("entra-tab"); void app.offsetWidth; app.classList.add("entra-tab");
  contarNumeros(app);
}
function animacionesPausadas() {
  return !!(estado && estado.ajustes.animaciones === false) || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}
// Hace que los números grandes suban desde 0 hasta su valor en medio segundo.
// Solo toca números sencillos (como 24, +7,5 o 74): los demás se dejan tal cual.
function contarNumeros(zona) {
  const lista = zona.querySelectorAll(".big-num, .cifra b, .anillo-num b");
  for (const el of lista) {
    if (el.children.length) continue;
    const texto = el.textContent.trim();
    const m = texto.match(/^([+−-]?)(\d{1,4})(?:([.,])(\d))?$/);
    if (!m) continue;
    const fin = parseFloat(m[2] + "." + (m[4] || "0"));
    if (!(fin > 0)) continue;
    const empieza = performance.now(), dura = 550;
    (function paso(ahora) {
      if (!el.isConnected) return;
      const t = Math.min(1, (ahora - empieza) / dura);
      const v = fin * (1 - Math.pow(1 - t, 3));                 // frena al final
      el.textContent = t >= 1 ? texto : m[1] + (m[4] ? v.toFixed(1).replace(".", m[3]) : String(Math.round(v)));
      if (t < 1) requestAnimationFrame(paso);
    })(empieza);
  }
}

// Para los botones de "pulsa otra vez": el primer toque solo avisa
function pideConfirmar(clave, repintar) {
  if (confirmar === clave) { confirmar = ""; return true; }
  confirmar = clave; repintar(); return false;
}

function textoSesion(s) {
  return "Completó " + s.diaNombre + " · " + s.seriesEfectivas + " series efectivas" + (s.prs.length ? " · " + s.prs.length + " récord(s)" : "");
}

// ---------- Avisos locales (recordatorios) ----------
function permisoAvisos() {
  if (typeof Notification === "undefined") return "no";
  return Notification.permission;          // "default", "granted" o "denied"
}
function mostrarAviso(titulo, texto) {
  if (permisoAvisos() !== "granted") return false;
  titulo = tr(titulo); texto = tr(texto);          // los avisos no pasan por la pantalla: se traducen aquí
  const op = { body: texto, icon: "iconos/icono-192.png", badge: "iconos/icono-192.png", tag: "apex-recordatorio" };
  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then(function (reg) { reg.showNotification(titulo, op); });
  } else {
    try { new Notification(titulo, op); } catch (e) { return false; }
  }
  return true;
}
// Se llama al abrir la app, al volver a ella y cada 5 minutos mientras está abierta
function comprobarRecordatorios() {
  if (!estado || !estado.perfil || estado.modo === "demo") return;
  if (pushActivo()) return;                         // ya llegan por push (aunque la app esté cerrada)
  const aviso = recordatorioPendiente(new Date());
  if (!aviso) return;
  if (mostrarAviso(aviso.titulo, aviso.texto)) { estado.ajustes.notif.ultimoAviso = hoy(); guardar(); }
}

// ---------- Instalar la app (PWA) ----------
// Texto y botón de la tarjeta "Instalar en el móvil" de Ajustes
function textoInstalar() {
  if (appInstalada()) return '<p class="small">✓ Ya estás usando Apix Gym como app instalada.</p>';
  if (avisoInstalar) return '<button class="btn" data-act="instalar-app">Instalar Apix Gym</button><p class="muted small">Tendrás su icono en el móvil y funcionará sin internet.</p>';
  return '<p class="muted small">En Android (Chrome): menú ⋮ → «Instalar aplicación». En iPhone (Safari): botón Compartir → «Añadir a pantalla de inicio».</p>';
}
function appInstalada() {
  return window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;
}
