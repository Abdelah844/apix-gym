// =====================================================
// APIX GYM · APIX, LA MASCOTA (personaje propio: una bolita morada)
// - estadoMascota() decide su humor y su mensaje a partir de tus datos reales.
// - apixSVG() lo dibuja según el humor.
// Los mensajes se eligen según la fecha (no al azar), así se pueden probar.
// =====================================================

const FRASE_DISCIPLINA = "Hay que tener disciplina para el cuerpo que deseas.";

const MENSAJES_APIX = {
  anima: [
    FRASE_DISCIPLINA,
    "Hoy toca. Tu yo del futuro te lo agradecerá.",
    "No hacen falta ganas, hace falta empezar.",
    "Un entreno más, un paso más cerca.",
    "Las pesas no se levantan solas.",
    "El sofá te echará de menos. 😏"
  ],
  animaFuerte: [
    "Llevas {dias} días sin entrenar. " + FRASE_DISCIPLINA,
    "Las mancuernas preguntan por ti. Les he dicho que estabas en el sofá.",
    "¿Vas a estar todo el día en casa? 👀"
  ],
  enfadado: [
    "¡¿Cómo que has perdido la racha?! {racha} semanas seguidas… Esta semana la recuperamos, ¿vale?",
    "Grrr… {racha} semanas de racha a la basura. Venga, levanta y empezamos otra hoy."
  ],
  celebra: [
    "¡{peso} en {ejercicio}! Eso antes no lo levantabas. ¡Estoy orgulloso!",
    "¡Nuevo récord en {ejercicio}: {peso}! El trabajo de estas semanas se nota."
  ],
  orgulloso: [
    "Bien por entrenar hoy. Si la próxima vez acabas todas las series, me pondré amarillo.",
    "Hoy has entrenado, ¡bien! Termina el entreno completo y verás cómo me pongo."
  ],
  campeon: [
    "¡Entreno completo! Mira qué color me has puesto. Ahora toca comer bien y dormir.",
    "Todas las series hechas. Así se construye la constancia: ¡estoy que brillo!"
  ],
  descanso: [
    "Hoy toca descanso. Recuperar también es entrenar.",
    "Día libre. El músculo crece mientras descansas.",
    "Descansa bien hoy: mañana vuelves más fuerte.",
    "Hoy toca sofá, pero con permiso. 😴"
  ],
  cuida: [
    "La última vez marcaste molestias. Hoy, con calma: si duele, para y consulta a un profesional.",
  ],
  reto: [
    "Te faltan {falta} {unidad} para tu reto «{reto}» y quedan {dias} días. " + FRASE_DISCIPLINA,
    "Tu reto «{reto}» te espera: faltan {falta} {unidad}. ¡No lo sueltes ahora!"
  ],
  retoUltimo: [
    "¡Último día para tu reto «{reto}»! Te faltan {falta} {unidad}. Hoy es el día."
  ],
  retoConseguido: [
    "¡Reto «{reto}» conseguido! Sabía que podías. ¿Te pones otro más difícil?"
  ],
  sinReto: [
    "¿Y si te pones un reto? Una meta clara ayuda a no faltar. Créalo en Social → Retos."
  ],
  contento: [
    "¡Hola! Soy Apix. Cuando quieras, empezamos.",
    "Cada serie cuenta. ¿Entrenamos?"
  ]
};

// Elige un mensaje según el día del año (siempre el mismo durante el día)
function mensajeDelDia(lista, fecha) {
  const d = new Date((fecha || hoy()) + "T12:00:00");
  const inicioAnio = new Date(d.getFullYear() + "-01-01T12:00:00");
  const dia = Math.round((d - inicioAnio) / 86400000);
  return lista[dia % lista.length];
}

function rellenar(texto, datos) {
  return texto.replace(/\{(\w+)\}/g, function (m, k) { return datos[k] !== undefined ? datos[k] : m; });
}

// Racha que tenías justo antes de perderla (0 si no la has perdido esta semana)
function rachaPerdida() {
  const mapa = sesionesPorSemana();
  const min = minimoSemanal();
  const esta = lunesDe(hoy());
  if ((mapa[esta] || 0) >= min) return 0;                 // esta semana ya cumpliste: racha viva
  const pasada = sumarDias(esta, -7);
  if ((mapa[pasada] || 0) >= min) return 0;               // la semana pasada cumpliste: racha viva
  let lunes = sumarDias(esta, -14), n = 0;
  while ((mapa[lunes] || 0) >= min && n < 520) { n++; lunes = sumarDias(lunes, -7); }
  return n;                                               // semanas seguidas que tenías antes de fallar
}

function diasSinEntrenar() {
  const v = sesionesValidas();
  if (v.length === 0) return null;
  return diasEntre(v[v.length - 1].fecha, hoy());
}

// Reto activo más urgente que aún no has conseguido (el que acaba antes)
function retoUrgente() {
  const hoyF = hoy();
  const activos = (estado.social.retos || []).filter(function (r) {
    return TIPOS_RETO[r.tipo] && r.meta && r.inicio <= hoyF && r.fin >= hoyF && progresoReto(r) < r.meta;
  });
  activos.sort(function (a, b) { return a.fin < b.fin ? -1 : 1; });
  return activos[0] || null;
}
// Reto conseguido en los últimos 2 días (para felicitar)
function retoRecienConseguido() {
  const hoyF = hoy();
  return (estado.social.retos || []).find(function (r) {
    return TIPOS_RETO[r.tipo] && r.meta && progresoReto(r) >= r.meta && r.fin >= sumarDias(hoyF, -2) && r.inicio <= hoyF;
  }) || null;
}
function datosReto(r) {
  const falta = Math.max(0, Math.round((r.meta - progresoReto(r)) * 10) / 10);
  return { reto: TIPOS_RETO[r.tipo].nombre.toLowerCase(), falta: String(falta).replace(".", ","), unidad: TIPOS_RETO[r.tipo].unidad, dias: diasEntre(hoy(), r.fin) + 1 };
}

// Un entreno está completo si se hicieron TODAS sus series (al menos una)
function sesionCompleta(s) {
  let total = 0;
  for (const e of s.ejercicios) {
    for (const x of e.series) {
      total++;
      if (!x.hecha) return false;
    }
  }
  return total > 0;
}

// Humor y mensaje de Apix. Devuelve null si el usuario lo ha desactivado.
// Orden de prioridad: molestias → récord → racha perdida → hoy ya entrenaste → día de entreno → descanso → normal
function estadoMascota() {
  if (estado.ajustes.mascota === false) return null;
  const hoyF = hoy();
  const validas = sesionesValidas();
  const ultima = validas[validas.length - 1];

  // 0. Bienvenida: solo el día que creas el perfil y mientras no hayas entrenado
  if (estado.bienvenidaApix === hoyF && validas.length === 0) {
    return { humor: "contento", mensaje: "¡Hola! Soy Apix y estaré aquí para que cumplas tus objetivos." };
  }
  // 0b. Ha vuelto a Aprendiz por perder la racha (lo dice 2 días)
  etapaApix();
  if (estado.apixBajada && diasEntre(estado.apixBajada, hoyF) <= 1) {
    return { humor: "enfadado", mensaje: "Has perdido la racha y he vuelto a ser Aprendiz. 😤 Hay que recuperar la constancia para volver a crecer." };
  }
  // 1. Molestias recientes: nunca presionar
  if (ultima && diasEntre(ultima.fecha, hoyF) <= 3 && ultima.ejercicios.some(function (e) { return e.molestias; })) {
    return { humor: "cuida", mensaje: mensajeDelDia(MENSAJES_APIX.cuida, hoyF) };
  }
  // 1b. Hoy has acabado el entreno completo: Apix se pone amarillo (es el premio)
  if (ultima && ultima.fecha === hoyF && sesionCompleta(ultima)) {
    return { humor: "campeon", mensaje: mensajeDelDia(MENSAJES_APIX.campeon, hoyF) };
  }
  // ¿Hoy es día de descanso? (no está en «Mi semana» y no has entrenado hoy)
  const cal = diasDeEntreno();
  const hoyN = (new Date(hoyF + "T12:00:00").getDay() + 6) % 7;
  const esDescanso = cal.length > 0 && !cal.includes(hoyN) && !(ultima && ultima.fecha === hoyF);
  // 2. Récord en los últimos 2 días: felicitar con el ejercicio y el peso
  //    (en día de descanso solo si el récord es de hoy: ese día Apix descansa)
  // Solo el mismo día del entreno: al día siguiente Apix ya piensa en el próximo
  if (ultima && ultima.fecha === hoyF && ultima.prs.length) {
    const id = ultima.prs[0];
    const e = ultima.ejercicios.find(function (x) { return x.id === id; });
    const ej = buscarEj(id);
    let mejor = null;
    for (const s of e.series) if (serieValida(s) && (!mejor || unaRM(cargaSerie(ej, s.peso, ultima.fecha), s.reps) > unaRM(cargaSerie(ej, mejor.peso, ultima.fecha), mejor.reps))) mejor = s;
    const peso = ej.asistido ? mejor.reps + " reps con " + String(mejor.peso).replace(".", ",") + " kg de ayuda" : String(mejor.peso).replace(".", ",") + " kg × " + mejor.reps;
    return { humor: "celebra", mensaje: rellenar(mensajeDelDia(MENSAJES_APIX.celebra, hoyF), { peso: peso, ejercicio: ej.nombre.toLowerCase() }) };
  }
  // 2b. Reto conseguido: felicitar
  const conseguido = retoRecienConseguido();
  if (conseguido && !(retoUrgente()) && !esDescanso) {
    return { humor: "celebra", mensaje: rellenar(mensajeDelDia(MENSAJES_APIX.retoConseguido, hoyF), datosReto(conseguido)), accion: "ver-retos" };
  }
  // 3. Racha perdida esta semana
  const perdida = rachaPerdida();
  if (perdida >= 1 && !(ultima && ultima.fecha === hoyF)) {
    return { humor: "enfadado", mensaje: rellenar(mensajeDelDia(MENSAJES_APIX.enfadado, hoyF), { racha: perdida }) };
  }
  // 3b. Reto personal en marcha: te recuerda lo que falta (si hoy no has entrenado todavía)
  //     En día de descanso solo si el reto acaba hoy o mañana
  const reto = retoUrgente();
  if (reto && !(ultima && ultima.fecha === hoyF) && (!esDescanso || datosReto(reto).dias <= 1)) {
    const d = datosReto(reto);
    return { humor: "anima", mensaje: rellenar(mensajeDelDia(d.dias <= 1 ? MENSAJES_APIX.retoUltimo : MENSAJES_APIX.reto, hoyF), d), accion: "ver-retos" };
  }
  // 3c. Día de descanso: Apix descansa contigo
  if (esDescanso) return { humor: "descanso", mensaje: mensajeDelDia(MENSAJES_APIX.descanso, hoyF) };
  // 4. Hoy ya has entrenado
  if (ultima && ultima.fecha === hoyF) return { humor: "orgulloso", mensaje: mensajeDelDia(MENSAJES_APIX.orgulloso, hoyF) };
  // 5. Hoy toca entrenar (según tu calendario) y aún no lo has hecho
  // 4b. Recuerdo (fecha especial o mejora en tu ejercicio favorito)
  const recuerdo = recuerdoApix(hoyF);
  if (recuerdo) return { humor: "orgulloso", mensaje: recuerdo };
  if (cal.includes(hoyN)) {
    const dias = diasSinEntrenar();
    if (dias !== null && dias >= 3) return { humor: "anima", mensaje: rellenar(mensajeDelDia(MENSAJES_APIX.animaFuerte, hoyF), { dias: dias }) };
    return { humor: "anima", mensaje: mensajeDelDia(MENSAJES_APIX.anima, hoyF) };
  }
  // 6. Día de descanso (si llevas unos entrenos y no tienes retos, te propone uno de vez en cuando)
  if (!(estado.social.retos || []).length && validas.length >= 3 && (new Date(hoyF + "T12:00:00").getDate() % 3 === 0)) {
    return { humor: "contento", mensaje: mensajeDelDia(MENSAJES_APIX.sinReto, hoyF), accion: "nuevo-reto" };
  }
  if (cal.length) return { humor: "descanso", mensaje: mensajeDelDia(MENSAJES_APIX.descanso, hoyF) };
  return { humor: "contento", mensaje: mensajeDelDia(MENSAJES_APIX.contento, hoyF) };
}

// ---------- Etapas de Apix: crece contigo, pero cuesta ----------
// Para pasar de etapa hay que cumplir TODO: entrenos, racha y rango global.
// Aprendiz se consigue con tu mejor racha y ya no se pierde.
// Fuerte, Bestia y Leyenda piden la racha ACTUAL: si pierdes la racha, Apix vuelve a Aprendiz.
const ETAPAS_APIX = [
  { nombre: "Novato", entrenos: 0, racha: 0, rango: 0 },
  { nombre: "Aprendiz", entrenos: 30, racha: 4, rango: 0 },
  { nombre: "Fuerte", entrenos: 80, racha: 8, rango: 3 },        // rango 3 = Oro
  { nombre: "Bestia", entrenos: 160, racha: 16, rango: 6 },      // rango 6 = Diamante
  { nombre: "Leyenda", entrenos: 300, racha: 26, rango: 7 }      // rango 7 = Titán
];

// La racha más larga que has tenido nunca (en semanas)
function mejorRacha() {
  const mapa = sesionesPorSemana();
  const validas = sesionesValidas();
  if (!validas.length) return 0;
  let lunes = lunesDe(validas[0].fecha), fin = lunesDe(hoy()), seguidas = 0, mejor = 0;
  while (lunes <= fin) {
    if ((mapa[lunes] || 0) >= minimoSemanal()) { seguidas++; if (seguidas > mejor) mejor = seguidas; }
    else if (lunes !== fin) seguidas = 0;                 // la semana actual aún no ha acabado: no rompe la racha
    lunes = sumarDias(lunes, 7);
  }
  return mejor;
}

// Lo que llevas de cada requisito
function datosEtapa() {
  const pg = puntosGlobal();
  return { entrenos: sesionesValidas().length, racha: mejorRacha(), rachaActual: rachaSemanas(), rango: pg === null ? -1 : rangoDePuntos(pg) };
}
// ¿Cumples todo lo que pide esa etapa? (de Fuerte en adelante cuenta la racha actual)
function cumpleEtapa(e, d) {
  const x = ETAPAS_APIX[e];
  const racha = e >= 2 ? (d.rachaActual !== undefined ? d.rachaActual : d.racha) : d.racha;
  return d.entrenos >= x.entrenos && racha >= x.racha && (x.rango === 0 || d.rango >= x.rango);
}
// ¿Se ha roto la racha desde que conseguiste la etapa? Mira cada semana ya terminada desde esa fecha.
function rachaRotaDesde(fecha) {
  const mapa = sesionesPorSemana();
  let lunes = lunesDe(fecha);
  const actual = lunesDe(hoy());
  while (lunes < actual) {
    if ((mapa[lunes] || 0) < minimoSemanal()) return true;
    lunes = sumarDias(lunes, 7);
  }
  return false;
}
// Tu etapa (0 a 4). Se guarda la más alta conseguida para que nunca baje.
let cacheEtapa = { clave: "", e: 0 };
function etapaApix() {
  if (typeof estado === "undefined" || !estado || !estado.sesiones) return 0;
  // Calcular el rango cuesta: se guarda el resultado mientras no cambien los entrenos ni el día
  const clave = estado.sesiones.length + "|" + hoy() + "|" + (estado.apixEtapa || 0) + "|" + estado.modo + "|" + (estado.perfil.peso || 0);
  if (cacheEtapa.clave === clave) return cacheEtapa.e;
  const d = datosEtapa();
  let e = 0;
  for (let i = 1; i < ETAPAS_APIX.length; i++) { if (cumpleEtapa(i, d)) e = i; else break; }
  if (estado.modo !== "demo") {
    let guardada = estado.apixEtapa || 0;
    // Perdiste la racha después de conseguir Fuerte o más: vuelve a Aprendiz
    if (guardada >= 2 && estado.apixEtapaFecha && rachaRotaDesde(estado.apixEtapaFecha)) {
      estado.apixEtapa = guardada = 1;
      estado.apixBajada = hoy();
      estado.apixEtapaFecha = hoy();
    }
    if (e > guardada) { estado.apixEtapa = e; estado.apixEtapaFecha = hoy(); }
    e = Math.max(e, estado.apixEtapa || 0);
  }
  cacheEtapa = { clave: estado.sesiones.length + "|" + hoy() + "|" + (estado.apixEtapa || 0) + "|" + estado.modo + "|" + (estado.perfil.peso || 0), e: e };
  return e;
}
// La etapa del Apix de un amigo (la publica su app)
function etapaAmigo(p) {
  const e = p && p.apix;
  return Number.isInteger(e) && e >= 0 && e <= 4 ? e : 0;
}

// ---------- Dibujo de Apix ----------
// Bolita suave morada con brillo, bracitos y patitas.
// Según el humor cambian los ojos, las cejas, la boca y algún complemento.
function apixSVG(humor, tam, etapa) {
  const h = humor || "contento";
  if (etapa === undefined) etapa = etapaApix();       // sin decir etapa, tu Apix
  const enfadado = h === "enfadado";
  const feliz = h === "campeon" || h === "celebra";   // amarillo: entreno completo, récord o reto conseguido
  // Colores del cuerpo: morado normal, rojo si se enfada y amarillo si está feliz
  let claro = "#C9B2FF";                              // color de arriba
  let medio = "#8A5CFF";                              // color del centro
  let borde = "#5B2BE0";                              // color de abajo, brazos y patas
  if (enfadado) { claro = "#FF9A9A"; medio = "#FF4D4D"; borde = "#C81E2E"; }
  if (feliz) { claro = "#FFF4B8"; medio = "#FFD23F"; borde = "#E0A100"; }
  const tinta = "#1F2B2B";                            // ojos, cejas y boca
  const id = "kg-" + h + "-" + etapa;                 // id del degradado (uno por humor y etapa)
  // Las primeras etapas se dibujan más pequeñas: así se nota que crece
  const escala = [0.8, 0.88, 0.95, 1, 1][etapa] || 1;

  let s = '<svg class="apix apix-' + h + ' ' + (tam || "") + '" viewBox="-14 -20 148 144" role="img" aria-label="Apix, la mascota de Apix Gym">';
  s += '<defs><radialGradient id="' + id + '" cx="40%" cy="30%" r="80%">' +
       '<stop offset="0" stop-color="' + claro + '"/><stop offset=".6" stop-color="' + medio + '"/><stop offset="1" stop-color="' + borde + '"/></radialGradient></defs>';
  s += '<g transform="translate(60 110) scale(' + escala + ') translate(-60 -110)">';
  // Leyenda: brillo dorado y capa roja (van detrás del cuerpo)
  if (etapa >= 4) s += '<circle cx="60" cy="62" r="70" fill="#FFD25A" opacity=".10"/><circle cx="60" cy="62" r="56" fill="#FFD25A" opacity=".10"/>' +
    '<path d="M24,58 C4,84 0,104 -8,116 C18,112 40,116 60,110 C80,116 102,112 128,116 C120,104 116,84 96,58 Z" fill="#D7263D"/><path d="M24,58 C10,84 8,100 4,112 C22,110 40,113 60,108 Z" fill="#A81B2E"/>';
  // Sombra, patas y brazos
  s += '<ellipse cx="60" cy="110" rx="34" ry="4" fill="#000" opacity=".15"/>' +
       '<ellipse cx="43" cy="104" rx="9" ry="6" fill="' + borde + '"/><ellipse cx="77" cy="104" rx="9" ry="6" fill="' + borde + '"/>' +
       '<ellipse cx="16" cy="80" rx="6" ry="8" fill="' + borde + '"/><ellipse cx="104" cy="80" rx="6" ry="8" fill="' + borde + '"/>';
  // Cuerpo (cúpula redondeada) y brillo
  s += '<path d="M16,82 C14,44 38,22 60,22 C82,22 106,44 104,82 C103,98 86,104 60,104 C34,104 17,98 16,82 Z" fill="url(#' + id + ')"/>' +
       '<ellipse cx="42" cy="36" rx="12" ry="6" fill="#fff" opacity=".75" transform="rotate(-22 42 36)"/>';
  // Fuego encima de la cabeza cuando se enfada (3 llamas: roja, naranja y amarilla)
  if (enfadado) s += '<g class="apix-fuego">' +
    '<path d="M60,-14 C66,-4 78,0 76,14 C75,22 68,27 60,27 C52,27 45,22 44,14 C43,4 52,2 52,-6 C55,-2 57,0 58,4 C60,-2 58,-8 60,-14 Z" fill="#FF3B1F"/>' +
    '<path d="M60,-2 C64,5 71,8 70,16 C69,22 65,26 60,26 C55,26 51,22 50,16 C50,10 55,8 56,3 C58,6 59,8 60,10 C61,6 60,2 60,-2 Z" fill="#FF8A00"/>' +
    '<path d="M60,9 C63,13 66,16 65,20 C64,24 62,26 60,26 C58,26 56,24 55,20 C55,16 58,14 60,9 Z" fill="#FFD84A"/></g>';
  // Complementos
  if (h === "anima") s += '<path d="M22,46 Q60,34 98,46 L97,54 Q60,42 23,54 Z" fill="#FF8A3D"/><path d="M96,48 l13,-5 l-4,11 z" fill="#FF8A3D"/>';   // cinta de deporte
  if (h === "celebra" || h === "campeon") s += '<path d="M47,24 L50,12 L56,19 L60,8 L64,19 L70,12 L73,24 Z" fill="#FFD25A" stroke="#C9971A" stroke-width="1.5" stroke-linejoin="round"/>' +
                            '<circle cx="18" cy="34" r="2.5" fill="#FFD25A"/><circle cx="104" cy="30" r="2.5" fill="#FF8FB1"/><circle cx="108" cy="50" r="2" fill="#7FB8FF"/>';   // corona y confeti
  // Ojos
  if (h === "descanso") {
    s += '<path d="M39,64 q7,5 14,0 M67,64 q7,5 14,0" fill="none" stroke="' + tinta + '" stroke-width="3" stroke-linecap="round"/>' +
         '<text x="90" y="30" font-family="sans-serif" font-weight="800" font-size="13" fill="#7A4DFF">z</text><text x="100" y="18" font-family="sans-serif" font-weight="800" font-size="10" fill="#7A4DFF">z</text>';
  } else if (h === "celebra" || h === "orgulloso" || h === "campeon") {
    s += '<path d="M39,66 q7,-8 14,0 M67,66 q7,-8 14,0" fill="none" stroke="' + tinta + '" stroke-width="3.5" stroke-linecap="round"/>';   // ojos felices ^ ^
  } else {
    const baja = h === "cuida" ? 2 : 0;
    s += '<circle cx="46" cy="' + (63 + baja) + '" r="8" fill="' + tinta + '"/><circle cx="74" cy="' + (63 + baja) + '" r="8" fill="' + tinta + '"/>' +
         '<circle cx="49" cy="' + (60 + baja) + '" r="2.8" fill="#fff"/><circle cx="77" cy="' + (60 + baja) + '" r="2.8" fill="#fff"/>' +
         '<circle cx="43.5" cy="' + (66 + baja) + '" r="1.3" fill="#fff"/><circle cx="71.5" cy="' + (66 + baja) + '" r="1.3" fill="#fff"/>';
  }
  // Cejas
  if (enfadado) s += '<path d="M37,48 L53,54 M83,48 L67,54" stroke="' + tinta + '" stroke-width="3.5" stroke-linecap="round"/>';
  else if (h === "anima") s += '<path d="M39,49 L52,53 M81,49 L68,53" stroke="' + tinta + '" stroke-width="3.5" stroke-linecap="round"/>';   // cejas decididas
  else if (h === "cuida") s += '<path d="M40,52 L50,48 M80,52 L70,48" stroke="#3A1A99" stroke-width="3" stroke-linecap="round"/>';
  else if (h !== "descanso") s += '<path d="M41,49 L48,51 M79,49 L72,51" stroke="#3A1A99" stroke-width="3" stroke-linecap="round"/>';
  // Mofletes
  if (!enfadado) s += '<ellipse cx="33" cy="76" rx="8" ry="5" fill="#FF9C9C" opacity=".75"/><ellipse cx="87" cy="76" rx="8" ry="5" fill="#FF9C9C" opacity=".75"/>';
  // Boca
  if (enfadado) s += '<path d="M52,82 Q60,76 68,82" fill="none" stroke="' + tinta + '" stroke-width="3" stroke-linecap="round"/>' +
                     '<path d="M8,40 q4,-7 0,-13 M112,40 q-4,-7 0,-13" fill="none" stroke="#E02B3C" stroke-width="3" stroke-linecap="round"/>';   // vapor
  else if (h === "celebra" || h === "campeon") s += '<path d="M52,76 Q60,88 68,76 Z" fill="' + tinta + '"/><path d="M56,81 Q60,85 64,81" fill="#FF7A8F"/>';
  else if (h === "anima") s += '<path d="M50,76 Q60,87 70,76 Z" fill="' + tinta + '"/>';   // sonrisa con ganas
  else if (h === "cuida") s += '<path d="M54,80 Q60,78 66,80" fill="none" stroke="' + tinta + '" stroke-width="2.5" stroke-linecap="round"/>';
  else if (h === "descanso") s += '<ellipse cx="60" cy="79" rx="3" ry="2.5" fill="' + tinta + '"/>';
  else s += '<path d="M54,77 Q60,82 66,77" fill="none" stroke="' + tinta + '" stroke-width="2.5" stroke-linecap="round"/>';
  s += piezasEtapa(etapa, h, borde, medio);
  return s + '</g></svg>';
}

// Lo que Apix lleva puesto en cada etapa (va delante del cuerpo)
function piezasEtapa(etapa, h, borde, medio) {
  let s = "";
  const conCorona = h === "celebra" || h === "campeon";
  // Aprendiz en adelante: cinta naranja (si ya la lleva por su humor, no se repite; con corona no cabe)
  if (etapa >= 1 && etapa < 4 && h !== "anima" && h !== "enfadado" && !conCorona) s += '<path d="M22,46 Q60,34 98,46 L97,54 Q60,42 23,54 Z" fill="#FF8A3D"/><path d="M96,48 l13,-5 l-4,11 z" fill="#FF8A3D"/><path d="M98,50 l11,3 l-7,7 z" fill="#E86F22"/>';
  // Fuerte en adelante: brazos con bíceps (tapan los bracitos)
  if (etapa >= 2) {
    const brazo = function (x, d) {
      return '<g transform="translate(' + x + ',0) scale(' + d + ',1)"><path d="M0,84 C-10,84 -20,76 -18,62 C-17,52 -8,50 -4,56 C-1,48 8,50 8,60 C8,72 6,84 0,84 Z" fill="' + borde + '"/>' +
        '<ellipse cx="-7" cy="63" rx="7" ry="6" fill="' + medio + '" opacity=".9"/><ellipse cx="-9" cy="60" rx="2.6" ry="1.8" fill="#fff" opacity=".6"/></g>';
    };
    s += brazo(14, 1) + brazo(106, -1);
  }
  // Bestia en adelante: cinturón de fuerza y mancuerna
  if (etapa >= 3) {
    s += '<path d="M19,88 Q60,99 101,88 L100,97 Q60,107 20,97 Z" fill="#3A2A1C"/><rect x="53" y="89" width="14" height="12" rx="2.5" fill="#FFD25A" stroke="#C9971A" stroke-width="1.5"/>' +
      '<g transform="translate(-6,48) rotate(-18)"><rect x="-10" y="-3" width="20" height="6" rx="2" fill="#B9C4D2"/><rect x="-16" y="-9" width="7" height="18" rx="2.5" fill="#2A2733" stroke="#5F6B7C" stroke-width="1.5"/><rect x="9" y="-9" width="7" height="18" rx="2.5" fill="#2A2733" stroke="#5F6B7C" stroke-width="1.5"/></g>';
  }
  // Leyenda: corona con joyas y destellos (si ya lleva corona o fuego por su humor, no se pone)
  if (etapa >= 4) {
    if (!conCorona && h !== "enfadado") s += '<path d="M41,27 L45,6 L54,18 L60,0 L66,18 L75,6 L79,27 Z" fill="#FFD25A" stroke="#C9971A" stroke-width="2" stroke-linejoin="round"/><circle cx="60" cy="19" r="3" fill="#FF4D8D"/><circle cx="48" cy="21" r="2" fill="#4A9DFF"/><circle cx="72" cy="21" r="2" fill="#4A9DFF"/>';
    s += '<path d="M-6,20 l2.5,6 6,2.5 -6,2.5 -2.5,6 -2.5,-6 -6,-2.5 6,-2.5z" fill="#FFE9A8"/><path d="M124,40 l2,5 5,2 -5,2 -2,5 -2,-5 -5,-2 5,-2z" fill="#FFE9A8"/>';
  }
  return s;
}

// ---------- Recuerdos de Apix ----------
// Fechas especiales desde tu primer entreno y cuánto has mejorado en tu ejercicio favorito
function recuerdoApix(hoyF) {
  const validas = sesionesValidas();
  if (validas.length < 4) return null;
  const primera = validas[0].fecha;
  const dias = diasEntre(primera, hoyF);
  const hitos = { 7: "una semana", 30: "un mes", 91: "3 meses", 182: "medio año", 365: "un año", 730: "dos años" };
  if (hitos[dias]) return "Hoy hace " + hitos[dias] + " de tu primer entreno conmigo. ¡Mira todo lo que has hecho desde entonces!";
  // Una vez por semana (los miércoles): «hace un mes levantabas X; hoy, Y»
  if (new Date(hoyF + "T12:00:00").getDay() !== 3) return null;
  const veces = {};
  for (const s of validas) for (const e of s.ejercicios) if (!buscarEj(e.id).corporal) veces[e.id] = (veces[e.id] || 0) + 1;
  const fav = Object.keys(veces).sort(function (a, b) { return veces[b] - veces[a]; })[0];
  if (!fav) return null;
  function mejorPeso(lista) {
    let m = 0;
    for (const s of lista) for (const e of s.ejercicios) if (e.id === fav) for (const x of e.series) if (serieValida(x) && x.peso > m) m = x.peso;
    return m;
  }
  const antes = mejorPeso(validas.filter(function (s) { const d = diasEntre(s.fecha, hoyF); return d >= 28 && d <= 45; }));
  const ahora = mejorPeso(validas.filter(function (s) { return diasEntre(s.fecha, hoyF) < 14; }));
  if (!antes || ahora <= antes) return null;
  return "Hace un mes tu mejor serie de " + buscarEj(fav).nombre.toLowerCase() + " era con " + String(antes).replace(".", ",") + " kg. Hoy, con " + String(ahora).replace(".", ",") + " kg. ¡Así se crece!";
}
