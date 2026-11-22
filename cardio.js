// =====================================================
// CARDIO
// Se guarda dentro de la sesión, en "cardio": [{ id, min, km, nivel, inc }].
// Puede ir al final de un entreno de pesas o en un entreno solo de cardio.
// Cuenta para la racha y para Apix, pero no para los rangos de fuerza.
// =====================================================

// Qué se puede apuntar en cada actividad: km (distancia), nivel (resistencia) e inc (inclinación)
const CARDIO = [
  { id: "cinta-correr", nombre: "Correr en cinta", icono: "🏃", km: true, inc: true },
  { id: "cinta-andar", nombre: "Andar en cinta", icono: "🚶", km: true, inc: true },
  { id: "bici", nombre: "Bici estática", icono: "🚴", km: true, nivel: true },
  { id: "eliptica", nombre: "Elíptica", icono: "🌀", km: true, nivel: true },
  { id: "remo", nombre: "Remo (máquina)", icono: "🚣", km: true, nivel: true },
  { id: "escaladora", nombre: "Escaladora", icono: "🪜", nivel: true },
  { id: "comba", nombre: "Comba", icono: "🪢" },
  { id: "correr", nombre: "Correr fuera", icono: "🌳", km: true },
  { id: "caminar", nombre: "Caminar", icono: "👟", km: true },
  { id: "nadar", nombre: "Nadar", icono: "🏊", km: true },
  { id: "hiit", nombre: "HIIT / circuito", icono: "🔥" }
];

function buscarCardio(id) {
  return CARDIO.find(function (c) { return c.id === id; }) || null;
}

// Devuelve un texto con el error, o "" si está bien
function errorCardio(c) {
  const tipo = buscarCardio(c.id);
  if (!tipo) return "Elige una actividad.";
  if (!(c.min >= 1 && c.min <= 300)) return "Pon los minutos (de 1 a 300).";
  if (c.km !== null && !(c.km > 0 && c.km <= 100)) return usaMillas() ? "Las millas tienen que estar entre 0 y 62." : "Los km tienen que estar entre 0 y 100.";
  if (c.nivel !== null && !(c.nivel >= 1 && c.nivel <= 30)) return "El nivel tiene que estar entre 1 y 30.";
  if (c.inc !== null && !(c.inc >= 0 && c.inc <= 30)) return "La inclinación tiene que estar entre 0 y 30 %.";
  return "";
}

function cardioValido(c) {
  return !!c && errorCardio(c) === "";
}

// Lo que el usuario escribe → un cardio limpio. Los campos vacíos o que no usa esa actividad quedan en null
function crearCardio(id, min, km, nivel, inc) {
  const tipo = buscarCardio(id) || {};
  const num = function (t) { const n = parseFloat(String(t === undefined || t === null ? "" : t).replace(",", ".")); return isNaN(n) ? null : n; };
  return {
    id: id,
    min: Math.round(num(min) || 0),
    km: tipo.km ? distDesdeVista(num(km)) : null,      // se guarda siempre en km
    nivel: tipo.nivel ? num(nivel) : null,
    inc: tipo.inc ? num(inc) : null
  };
}

// "Correr en cinta · 20 min · 3,1 km · 8 %"
function textoCardio(c) {
  const tipo = buscarCardio(c.id);
  const partes = [tipo ? tipo.nombre : c.id, c.min + " min"];
  if (c.km) partes.push(distTexto(c.km));
  if (c.nivel) partes.push("nivel " + c.nivel);
  if (c.inc) partes.push(String(c.inc).replace(".", ",") + " %");
  return partes.join(" · ");
}

// Lo mismo, pero cada trozo en su <span> para que el traductor lo entienda
function cardioHtml(c) {
  const tipo = buscarCardio(c.id);
  const partes = ['<span>' + (tipo ? tipo.nombre : c.id) + '</span>', '<span>' + c.min + ' min</span>'];
  if (c.km) partes.push('<span>' + distTexto(c.km) + '</span>');
  if (c.nivel) partes.push('<span>nivel ' + c.nivel + '</span>');
  if (c.inc) partes.push('<span>' + String(c.inc).replace(".", ",") + ' %</span>');
  return partes.join(" · ");
}

// Total de minutos y km de cardio de una sesión
function totalCardio(s) {
  let min = 0, km = 0;
  for (const c of (s.cardio || [])) {
    if (!cardioValido(c)) continue;
    min += c.min;
    km += c.km || 0;
  }
  return { min: min, km: Math.round(km * 10) / 10 };
}

// ¿Es un entreno solo de cardio (sin pesas)?
function soloCardio(s) {
  return s.ejercicios.length === 0 && totalCardio(s).min > 0;
}

// Cardio de varias sesiones juntas (para Progreso)
function cardioDeSesiones(lista) {
  let min = 0, km = 0, veces = 0;
  for (const s of lista) {
    const t = totalCardio(s);
    if (!t.min) continue;
    min += t.min; km += t.km; veces++;
  }
  return { min: min, km: Math.round(km * 10) / 10, veces: veces };
}

// Guarda un entreno solo de cardio hecho hoy.
// Si hoy ya hay uno, el nuevo cardio se añade a ese (para no tener tres entrenos de cardio en un día).
function guardarCardioSuelto(c) {
  const fecha = hoy();
  let s = estado.sesiones.find(function (x) { return x.fecha === fecha && soloCardio(x); });
  if (s) {
    s.cardio.push(c);
    s.duracion = Math.min(300, totalCardio(s).min);
  } else {
    s = { id: "c" + Date.now(), fecha: fecha, diaIndex: null, diaNombre: "Cardio", duracion: c.min, ejercicios: [], cardio: [c], prs: [] };
    estado.sesiones.push(s);
  }
  const id = s.id;
  recalcularHistorial();
  guardar();
  return estado.sesiones.find(function (x) { return x.id === id; });
}
