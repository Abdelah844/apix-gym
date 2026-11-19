// =====================================================
// IMPORTAR ENTRENOS DE OTRAS APPS (Hevy y Strong)
// Las dos apps exportan un archivo .csv: una fila por serie.
// Aquí se lee ese archivo, se agrupan las filas en entrenos y
// se traducen los nombres de ejercicio (en inglés) a los de Apix.
// =====================================================

// Nombres en inglés de Hevy/Strong → id del ejercicio en Apix.
// Las claves se comparan "normalizadas" (minúsculas, sin acentos ni signos).
const NOMBRES_OTRAS_APPS = {
  // Pecho
  "bench press (barbell)": "press-banca", "bench press (dumbbell)": "press-plano-mancuernas", "bench press (smith machine)": "press-banca-multipower",
  "incline bench press (barbell)": "press-inclinado-barra", "incline bench press (dumbbell)": "press-inclinado-mancuernas", "incline bench press (smith machine)": "press-inclinado-multipower",
  "decline bench press (barbell)": "press-declinado-barra", "decline bench press (dumbbell)": "press-declinado-mancuernas", "decline bench press (smith machine)": "press-declinado-multipower",
  "chest press (machine)": "press-maquina", "incline chest press (machine)": "press-inclinado-maquina", "decline chest press (machine)": "press-declinado-maquina",
  "chest press (cable)": "press-pecho-polea", "chest fly (dumbbell)": "aperturas-mancuernas", "incline chest fly (dumbbell)": "aperturas-inclinadas",
  "decline chest fly (dumbbell)": "aperturas-declinadas", "butterfly (pec deck)": "contractora", "chest fly (machine)": "contractora", "pec deck (machine)": "contractora",
  "cable fly crossovers": "aperturas-polea", "cable crossover": "aperturas-polea", "chest fly (cable)": "aperturas-polea", "low cable fly crossovers": "aperturas-polea-baja",
  "pullover (dumbbell)": "pullover-mancuerna", "chest dip": "fondos", "triceps dip": "fondos", "dip": "fondos", "chest dip (assisted)": "fondos-asistidos",
  "triceps dip (assisted)": "fondos-asistidos", "bench dip": "fondos-banco", "push up": "flexiones",
  // Espalda
  "pull up": "dominadas", "pull up (assisted)": "dominadas-asistidas", "chin up": "dominadas-supinas", "neutral grip pull up": "dominadas-neutras",
  "lat pulldown (cable)": "jalon", "lat pulldown (machine)": "jalon", "lat pulldown close grip (cable)": "jalon-cerrado", "reverse grip lat pulldown (cable)": "jalon-supino",
  "single arm lat pulldown": "jalon-una-mano", "straight arm lat pulldown (cable)": "pullover-polea", "bent over row (barbell)": "remo-barra", "pendlay row (barbell)": "remo-barra",
  "reverse grip bent over row (barbell)": "remo-barra-supino", "bent over row (dumbbell)": "remo-mancuerna", "dumbbell row": "remo-mancuerna", "bent over row (smith machine)": "remo-multipower",
  "seated cable row v grip (cable)": "remo-polea", "seated row (cable)": "remo-polea", "seated cable row bar wide grip": "remo-polea-barra-ancha", "seated row (machine)": "remo-maquina",
  "single arm cable row": "remo-polea-una-mano", "t bar row": "remo-pecho-apoyado", "inverted row": "remo-invertido", "chest supported incline row (dumbbell)": "remo-mancuernas-inclinado",
  "deadlift (barbell)": "peso-muerto", "sumo deadlift (barbell)": "peso-muerto-sumo", "back extension": "hiperextensiones", "back extension (hyperextension)": "hiperextensiones",
  "shrug (barbell)": "encogimientos-barra", "shrug (dumbbell)": "encogimientos-mancuernas", "shrug (machine)": "encogimientos-maquina",
  // Hombros
  "overhead press (barbell)": "press-militar", "seated overhead press (barbell)": "press-militar", "military press": "press-militar",
  "shoulder press (dumbbell)": "press-hombro-mancuernas", "seated shoulder press (dumbbell)": "press-hombro-mancuernas", "overhead press (dumbbell)": "press-hombro-mancuernas",
  "shoulder press (machine)": "press-hombro-maquina", "overhead press (smith machine)": "press-hombro-multipower", "arnold press (dumbbell)": "press-arnold",
  "lateral raise (dumbbell)": "elevaciones-laterales", "lateral raise (cable)": "elevaciones-polea", "lateral raise (machine)": "elevaciones-maquina", "seated lateral raise (dumbbell)": "elevaciones-laterales-sentado",
  "front raise (dumbbell)": "elevaciones-frontales", "front raise (cable)": "elevaciones-frontales-polea", "rear delt reverse fly (machine)": "pajaros-maquina", "reverse fly (machine)": "pajaros-maquina",
  "rear delt reverse fly (dumbbell)": "pajaros-mancuernas", "reverse fly (dumbbell)": "pajaros-mancuernas", "rear delt reverse fly (cable)": "pajaros-polea", "face pull (cable)": "face-pull", "face pull": "face-pull",
  "upright row (barbell)": "remo-menton-barra", "upright row (cable)": "remo-menton-polea",
  // Bíceps y antebrazo
  "bicep curl (barbell)": "curl-barra", "barbell curl": "curl-barra", "bicep curl (dumbbell)": "curl-mancuernas", "bicep curl (cable)": "curl-polea", "bicep curl (machine)": "curl-maquina",
  "ez bar biceps curl": "curl-barra-z", "bicep curl (ez bar)": "curl-barra-z", "hammer curl (dumbbell)": "curl-martillo", "hammer curl (cable)": "curl-martillo-cuerda", "rope cable curl": "curl-martillo-cuerda",
  "preacher curl (barbell)": "curl-predicador", "preacher curl (ez bar)": "curl-predicador", "preacher curl (dumbbell)": "curl-predicador-mancuerna", "preacher curl (machine)": "curl-predicador-maquina",
  "concentration curl": "curl-concentrado", "incline curl (dumbbell)": "curl-inclinado", "seated incline curl (dumbbell)": "curl-inclinado", "spider curl (dumbbell)": "curl-arana",
  "zottman curl (dumbbell)": "curl-zottman", "reverse curl (barbell)": "curl-inverso", "wrist curl (dumbbell)": "curl-muneca", "wrist curl (barbell)": "curl-muneca",
  // Tríceps
  "triceps pushdown": "extension-polea", "triceps pushdown (cable straight bar)": "extension-polea", "triceps extension (cable)": "extension-polea", "triceps rope pushdown": "extension-cuerda",
  "triceps pushdown (rope)": "extension-cuerda", "overhead triceps extension (cable)": "extension-cuerda-nuca", "triceps extension (dumbbell)": "extension-nuca", "overhead triceps extension (dumbbell)": "extension-nuca",
  "skullcrusher (barbell)": "press-frances", "skullcrusher (ez bar)": "press-frances", "lying triceps extension (barbell)": "press-frances", "skullcrusher (dumbbell)": "press-frances-mancuernas",
  "triceps kickback (dumbbell)": "patada-triceps", "close grip bench press (barbell)": "press-banca-cerrado", "bench press close grip (barbell)": "press-banca-cerrado",
  "triceps extension (machine)": "triceps-maquina", "single arm triceps pushdown (cable)": "extension-una-mano-polea", "reverse grip triceps pushdown (cable)": "extension-inversa-polea",
  // Abdominales
  "crunch": "crunch", "cable crunch": "crunch-polea", "crunch (machine)": "crunch-maquina", "decline crunch": "crunch-declinado", "hanging leg raise": "elevacion-piernas",
  "leg raise": "elevacion-piernas-banco", "lying leg raise": "elevacion-piernas-banco", "ab wheel": "rueda-abdominal", "reverse crunch": "crunch-inverso-declinado", "pallof press": "pallof-press",
  "cable wood chop": "lenador-polea",
  // Piernas
  "squat (barbell)": "sentadilla", "full squat": "sentadilla", "front squat (barbell)": "sentadilla-frontal", "squat (smith machine)": "sentadilla-multipower",
  "goblet squat": "sentadilla-goblet", "goblet squat (dumbbell)": "sentadilla-goblet", "goblet squat (kettlebell)": "sentadilla-goblet", "hack squat": "hack", "hack squat (machine)": "hack",
  "leg press": "prensa", "leg press (machine)": "prensa", "leg extension (machine)": "extension-cuadriceps", "single leg extension (machine)": "extension-una-pierna",
  "lunge (dumbbell)": "zancadas", "walking lunge (dumbbell)": "zancadas", "walking lunge (barbell)": "zancadas-caminando", "lunge (smith machine)": "zancada-multipower",
  "bulgarian split squat": "sentadilla-bulgara", "step up": "step-up", "lying leg curl (machine)": "curl-femoral-tumbado", "seated leg curl (machine)": "curl-femoral-sentado",
  "standing leg curl (machine)": "curl-femoral-de-pie", "romanian deadlift (barbell)": "peso-muerto-rumano", "romanian deadlift (dumbbell)": "peso-muerto-rumano",
  "stiff leg deadlift (barbell)": "peso-muerto-rumano", "good morning (barbell)": "buenos-dias", "hip thrust (barbell)": "hip-thrust", "hip thrust (machine)": "hip-thrust-maquina",
  "glute bridge": "puente-gluteo", "cable pull through": "pull-through", "glute kickback (cable)": "patada-gluteo", "hip abduction (machine)": "abductores", "hip adduction (machine)": "aductores",
  "standing calf raise (machine)": "gemelos-maquina", "standing calf raise": "gemelos-maquina", "seated calf raise": "gemelo-sentado", "seated calf raise (machine)": "gemelo-sentado",
  "calf press (machine)": "gemelos-prensa", "standing calf raise (smith machine)": "gemelos-multipower", "single leg standing calf raise (dumbbell)": "gemelos-mancuerna"
};

const MESES_INGLES = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };

// "Push-Up (Barbell)" → "push up (barbell)": así no fallan mayúsculas, guiones o acentos
function normalizarNombre(t) {
  return String(t).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[-_–]/g, " ").replace(/[^a-z0-9() ]/g, "").replace(/\s+/g, " ").trim();
}

// Busca el ejercicio de Apix que corresponde a un nombre de otra app. Si no lo encuentra, ""
function ejercicioDeOtraApp(nombre) {
  const n = normalizarNombre(nombre);
  for (const clave in NOMBRES_OTRAS_APPS) {
    if (normalizarNombre(clave) === n) return NOMBRES_OTRAS_APPS[clave];
  }
  // Por si el nombre ya está en español (igual que en Apix)
  const mismo = EJERCICIOS.find(function (e) { return normalizarNombre(e.nombre) === n; });
  return mismo ? mismo.id : "";
}

// Lee un CSV y devuelve una lista de filas (cada fila, una lista de textos).
// Detecta si separa con comas o con punto y coma, y respeta las comillas.
function leerCSV(texto) {
  texto = String(texto).replace(/^﻿/, "");
  const primera = texto.split("\n")[0];
  const sep = primera.split(";").length > primera.split(",").length ? ";" : ",";
  const filas = [];
  let fila = [], campo = "", comillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (comillas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') comillas = false;
      else campo += c;
    } else if (c === '"') comillas = true;
    else if (c === sep) { fila.push(campo); campo = ""; }
    else if (c === "\n") { fila.push(campo.replace(/\r$/, "")); filas.push(fila); fila = []; campo = ""; }
    else campo += c;
  }
  if (campo !== "" || fila.length) { fila.push(campo.replace(/\r$/, "")); filas.push(fila); }
  return filas.filter(function (f) { return f.join("").trim() !== ""; });
}

// "2024-01-15 10:30:00", "2024-01-15T10:30" o "15 Jan 2024, 10:30" → { fecha: "2024-01-15", min: minutos del día }
function leerFechaOtraApp(t) {
  t = String(t || "").trim();
  let m = t.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2}))?/);
  if (m) return { fecha: m[1] + "-" + m[2] + "-" + m[3], min: m[4] ? Number(m[4]) * 60 + Number(m[5]) : null };
  m = t.match(/^(\d{1,2}) ([A-Za-z]{3})[a-z]* (\d{4})(?:,? (\d{1,2}):(\d{2}))?/);
  if (m && MESES_INGLES[m[2].toLowerCase()]) {
    return { fecha: m[3] + "-" + String(MESES_INGLES[m[2].toLowerCase()]).padStart(2, "0") + "-" + m[1].padStart(2, "0"),
             min: m[4] ? Number(m[4]) * 60 + Number(m[5]) : null };
  }
  return null;
}

// Duración de Strong: "1h 5m", "45m" o segundos → minutos
function leerDuracion(t) {
  t = String(t || "").trim();
  if (/^\d+$/.test(t)) return Math.round(Number(t) / 60);
  const h = t.match(/(\d+)\s*h/), m = t.match(/(\d+)\s*m/);
  return (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0);
}

function numeroCSV(t) {
  const n = parseFloat(String(t || "").replace(",", "."));
  return isNaN(n) ? 0 : n;
}

// Lee el archivo de Hevy o de Strong.
// Devuelve { ok, msg, app, unidad, entrenos: [{ fecha, nombre, duracion, ejercicios: [{ nombre, series }] }], nombres }
function leerOtraApp(texto) {
  const filas = leerCSV(texto);
  if (filas.length < 2) return { ok: false, msg: "El archivo está vacío o no es un CSV." };
  const cab = filas[0].map(function (c) { return c.trim().toLowerCase(); });
  const col = function (nombres) {
    for (const n of nombres) { const i = cab.indexOf(n); if (i >= 0) return i; }
    return -1;
  };

  let app = "";
  if (col(["exercise_title"]) >= 0) app = "Hevy";
  else if (col(["exercise name"]) >= 0) app = "Strong";
  else return { ok: false, msg: "No reconozco el archivo. Tiene que ser el CSV que exportan Hevy o Strong." };

  const c = {
    titulo: col(["title", "workout name"]),
    inicio: col(["start_time", "date"]),
    fin: col(["end_time"]),
    duracion: col(["duration (sec)", "duration"]),
    ejercicio: col(["exercise_title", "exercise name"]),
    tipo: col(["set_type", "set order"]),
    kg: col(["weight_kg", "weight (kg)"]),
    lb: col(["weight_lbs", "weight (lbs)"]),
    peso: col(["weight"]),
    reps: col(["reps"]),
    rpe: col(["rpe"])
  };
  // Si la columna dice "lbs", los pesos están en libras. Si solo dice "Weight", no se sabe: se pregunta
  const unidad = c.kg >= 0 ? "kg" : (c.lb >= 0 ? "lb" : "?");
  const colPeso = c.kg >= 0 ? c.kg : (c.lb >= 0 ? c.lb : c.peso);

  const entrenos = [], porClave = {}, nombres = [];
  for (let i = 1; i < filas.length; i++) {
    const f = filas[i];
    const cuando = leerFechaOtraApp(f[c.inicio]);
    const nombreEj = (f[c.ejercicio] || "").trim();
    if (!cuando || !nombreEj) continue;
    const tipo = String(f[c.tipo] || "").trim().toLowerCase();
    // Calentamientos y temporizadores de descanso no son series de trabajo
    if (tipo === "warmup" || tipo === "w" || tipo.indexOf("rest") === 0) continue;

    const clave = f[c.inicio] + "|" + (f[c.titulo] || "");
    let e = porClave[clave];
    if (!e) {
      let duracion = 0;
      if (c.fin >= 0) {
        const fin = leerFechaOtraApp(f[c.fin]);
        if (fin && fin.min !== null && cuando.min !== null) duracion = (fin.min - cuando.min + 1440) % 1440;
      } else if (c.duracion >= 0) duracion = leerDuracion(f[c.duracion]);
      e = { fecha: cuando.fecha, nombre: (f[c.titulo] || "Entreno importado").trim().slice(0, 40), duracion: duracion, ejercicios: [] };
      porClave[clave] = e; entrenos.push(e);
    }
    let ej = e.ejercicios.find(function (x) { return x.nombre === nombreEj; });
    if (!ej) { ej = { nombre: nombreEj, series: [] }; e.ejercicios.push(ej); }
    if (nombres.indexOf(nombreEj) < 0) nombres.push(nombreEj);
    ej.series.push({ peso: numeroCSV(f[colPeso]), reps: Math.round(numeroCSV(f[c.reps])), rpe: numeroCSV(f[c.rpe]), drop: tipo === "dropset" });
  }
  if (!entrenos.length) return { ok: false, msg: "No he encontrado ningún entreno en el archivo." };
  entrenos.sort(function (a, b) { return a.fecha < b.fecha ? -1 : 1; });
  return { ok: true, app: app, unidad: unidad, entrenos: entrenos, nombres: nombres };
}

// Convierte lo leído en sesiones de Apix.
// mapa: { "Bench Press (Barbell)": "press-banca", ... } (los que estén vacíos no se importan)
// enLibras: true si los pesos del archivo están en libras.
// Devuelve { sesiones, saltados } — saltados = entrenos que ya tenías ese día.
function sesionesDeOtraApp(leido, mapa, enLibras) {
  const sesiones = [];
  let saltados = 0;
  leido.entrenos.forEach(function (e, n) {
    // Si ese día ya tienes un entreno con el mismo nombre, no se duplica (por si importas dos veces)
    if (estado.sesiones.some(function (s) { return s.fecha === e.fecha && s.diaNombre === e.nombre; })) { saltados++; return; }
    const ejercicios = [];
    for (const ej of e.ejercicios) {
      const id = mapa[ej.nombre];
      if (!id || !buscarEj(id)) continue;
      const series = [];
      for (const s of ej.series) {
        let peso = enLibras ? s.peso / 2.2046 : s.peso;
        peso = Math.round(peso * 4) / 4;                       // a cuartos de kilo
        if (buscarEj(id).asistido) peso = Math.abs(peso);      // en Hevy la ayuda puede venir en negativo
        if (validarValores(peso, s.reps, true)) continue;      // fuera de rango: no se importa esa serie
        const x = { peso: peso, reps: s.reps, rpe: RPE_VALIDOS.includes(s.rpe) ? s.rpe : null, hecha: true, sospechosa: false, confirmada: false, aviso: "" };
        if (s.drop) x.tipo = "drop";
        series.push(x);
      }
      if (series.length) {
        const ya = ejercicios.find(function (x) { return x.id === id; });   // dos nombres → mismo ejercicio
        if (ya) ya.series = ya.series.concat(series);
        else ejercicios.push({ id: id, series: series, nota: "", molestias: false, cambio: false });
      }
    }
    if (!ejercicios.length) return;
    const duracion = e.duracion >= 5 && e.duracion <= 300 ? e.duracion : 60;
    sesiones.push({ id: "imp" + e.fecha.replace(/-/g, "") + "-" + n, fecha: e.fecha, diaIndex: null, diaNombre: e.nombre,
      duracion: duracion, ejercicios: ejercicios, prs: [], importada: leido.app });
  });
  return { sesiones: sesiones, saltados: saltados };
}
