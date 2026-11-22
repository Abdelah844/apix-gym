// =====================================================
// APIX GYM · EFECTOS DE SONIDO
// Todos los sonidos se crean con código: no hay archivos de audio ni licencias de terceros.
// Cada sonido es una lista de notas. Con esas notas se fabrica un pequeño archivo de audio (WAV)
// que se reproduce con un elemento <audio>. Así suena también con el iPhone en modo silencio
// (el otro sistema, Web Audio, se calla con el interruptor de silencio del iPhone).
// =====================================================

// Cada nota: f = frecuencia (Hz, más alto = más agudo), t = cuándo empieza (s), d = cuánto dura (s),
// tipo = forma de la onda ("sine" suave, "triangle" redondo, "square" de videojuego, "sawtooth" áspero),
// v = volumen (0 a 0,3), f2 = frecuencia final si la nota sube o baja (opcional),
// e = rapidez con la que se apaga (opcional; cuanto más alto, más seco). "ruido" es un golpe sin tono.
const SONIDOS = {
  // Completar una serie: un "clic" corto
  serie: [{ f: 1250, t: 0, d: 0.06, tipo: "triangle", v: 0.25 }],
  // Fin del descanso: CAMPANA DE RING DE BOXEO, tres golpes rápidos ("¡ding, ding, ding!").
  // Cada golpe mezcla el tono principal con armónicos metálicos que se apagan antes, y un "clac" del martillo.
  descanso: [
    { f: 1180, t: 0, d: 1.1, tipo: "sine", v: 0.3, e: 3.2 }, { f: 1187, t: 0, d: 1.1, tipo: "sine", v: 0.14, e: 3.4 }, { f: 2738, t: 0, d: 0.8, tipo: "sine", v: 0.16, e: 6 }, { f: 4401, t: 0, d: 0.5, tipo: "sine", v: 0.1, e: 9 }, { f: 6042, t: 0, d: 0.3, tipo: "sine", v: 0.06, e: 14 }, { f: 590, t: 0, d: 1.1, tipo: "sine", v: 0.07, e: 2.5 }, { f: 3000, t: 0, d: 0.025, tipo: "ruido", v: 0.12, e: 80 },
    { f: 1180, t: 0.26, d: 1.1, tipo: "sine", v: 0.3, e: 3.2 }, { f: 1187, t: 0.26, d: 1.1, tipo: "sine", v: 0.14, e: 3.4 }, { f: 2738, t: 0.26, d: 0.8, tipo: "sine", v: 0.16, e: 6 }, { f: 4401, t: 0.26, d: 0.5, tipo: "sine", v: 0.1, e: 9 }, { f: 6042, t: 0.26, d: 0.3, tipo: "sine", v: 0.06, e: 14 }, { f: 590, t: 0.26, d: 1.1, tipo: "sine", v: 0.07, e: 2.5 }, { f: 3000, t: 0.26, d: 0.025, tipo: "ruido", v: 0.12, e: 80 },
    { f: 1180, t: 0.52, d: 1.1, tipo: "sine", v: 0.3, e: 3.2 }, { f: 1187, t: 0.52, d: 1.1, tipo: "sine", v: 0.14, e: 3.4 }, { f: 2738, t: 0.52, d: 0.8, tipo: "sine", v: 0.16, e: 6 }, { f: 4401, t: 0.52, d: 0.5, tipo: "sine", v: 0.1, e: 9 }, { f: 6042, t: 0.52, d: 0.3, tipo: "sine", v: 0.06, e: 14 }, { f: 590, t: 0.52, d: 1.1, tipo: "sine", v: 0.07, e: 2.5 }, { f: 3000, t: 0.52, d: 0.025, tipo: "ruido", v: 0.12, e: 80 }
  ],
  // Cuenta atrás de los últimos 3 segundos: "tic"
  tic: [{ f: 1600, t: 0, d: 0.05, tipo: "sine", v: 0.2 }],
  // Nuevo récord: golpe grave ("bum"), fanfarria (do, mi, sol, do agudo) y un brillo al final
  record: [
    { f: 150, f2: 45, t: 0, d: 0.4, tipo: "sine", v: 0.3, e: 6 }, { f: 2000, t: 0, d: 0.04, tipo: "ruido", v: 0.12, e: 60 },
    { f: 523, t: 0.1, d: 0.12, tipo: "square", v: 0.12 },
    { f: 659, t: 0.22, d: 0.12, tipo: "square", v: 0.12 },
    { f: 784, t: 0.34, d: 0.12, tipo: "square", v: 0.12 },
    { f: 1047, t: 0.46, d: 0.45, tipo: "square", v: 0.12 },
    { f: 2093, t: 0.62, d: 0.35, tipo: "sine", v: 0.06, e: 7 }, { f: 2637, t: 0.68, d: 0.35, tipo: "sine", v: 0.06, e: 7 },
    { f: 3136, t: 0.74, d: 0.35, tipo: "sine", v: 0.06, e: 7 }, { f: 4186, t: 0.8, d: 0.35, tipo: "sine", v: 0.06, e: 7 }
  ],
  // Quedan 10 segundos de descanso: dos toques suaves para ir cogiendo la barra
  aviso10: [{ f: 660, t: 0, d: 0.12, tipo: "sine", v: 0.2 }, { f: 660, t: 0.2, d: 0.12, tipo: "sine", v: 0.2 }],
  // Subir de rango: más largo y épico, termina con un acorde
  rango: [
    { f: 392, t: 0, d: 0.15, tipo: "sawtooth", v: 0.08 },
    { f: 523, t: 0.15, d: 0.15, tipo: "sawtooth", v: 0.08 },
    { f: 659, t: 0.3, d: 0.15, tipo: "sawtooth", v: 0.08 },
    { f: 784, t: 0.45, d: 0.25, tipo: "sawtooth", v: 0.08 },
    { f: 523, t: 0.75, d: 0.9, tipo: "triangle", v: 0.18 },
    { f: 659, t: 0.75, d: 0.9, tipo: "triangle", v: 0.18 },
    { f: 784, t: 0.75, d: 0.9, tipo: "triangle", v: 0.18 },
    { f: 1047, t: 0.75, d: 0.9, tipo: "triangle", v: 0.14 }
  ],
  // Terminar el entreno: acorde de victoria corto
  fin: [
    { f: 523, t: 0, d: 0.5, tipo: "triangle", v: 0.2 },
    { f: 659, t: 0.05, d: 0.45, tipo: "triangle", v: 0.2 },
    { f: 784, t: 0.1, d: 0.4, tipo: "triangle", v: 0.2 }
  ],
  // Apix enfadado: "grrr" grave y áspero
  enfadado: [
    { f: 110, t: 0, d: 0.12, tipo: "sawtooth", v: 0.2, f2: 90 },
    { f: 105, t: 0.13, d: 0.12, tipo: "sawtooth", v: 0.2, f2: 85 },
    { f: 100, t: 0.26, d: 0.25, tipo: "sawtooth", v: 0.2, f2: 70 }
  ],
  // Racha mantenida: chispazo que sube
  racha: [
    { f: 600, t: 0, d: 0.15, tipo: "triangle", v: 0.25, f2: 1800 },
    { f: 2400, t: 0.15, d: 0.08, tipo: "sine", v: 0.15 },
    { f: 3000, t: 0.25, d: 0.08, tipo: "sine", v: 0.12 }
  ]
};

// ---------- Estilo «Metal de gimnasio» (se elige en Ajustes) ----------
// Solo cambia la serie, el fin del descanso y el récord; los demás sonidos son los de siempre.
// «Clinc» de disco: armónicos que no encajan entre sí (por eso suena a metal) y se apagan rápido
function clincMetal(f, t, v) {
  return [
    { f: f, t: t, d: 0.5, tipo: "sine", v: 0.25 * v, e: 14 }, { f: f * 1.51, t: t, d: 0.4, tipo: "sine", v: 0.16 * v, e: 18 },
    { f: f * 2.27, t: t, d: 0.3, tipo: "sine", v: 0.12 * v, e: 24 }, { f: f * 2.95, t: t, d: 0.2, tipo: "sine", v: 0.08 * v, e: 32 },
    { f: 4000, t: t, d: 0.015, tipo: "ruido", v: 0.15 * v, e: 150 }
  ];
}
// Gong grave de metal (tono + armónicos + golpe)
function gongMetal(t) {
  const f = 220, v = 1;
  return [
    { f: f, t: t, d: 1.1, tipo: "sine", v: 0.3 * v, e: 3.2 }, { f: f * 1.006, t: t, d: 1.1, tipo: "sine", v: 0.14 * v, e: 3.4 },
    { f: f * 2.32, t: t, d: 0.8, tipo: "sine", v: 0.16 * v, e: 6 }, { f: f * 3.73, t: t, d: 0.5, tipo: "sine", v: 0.1 * v, e: 9 },
    { f: 3000, t: t, d: 0.025, tipo: "ruido", v: 0.12 * v, e: 80 }
  ];
}
const SONIDOS_METAL = {
  serie: clincMetal(1900, 0, 1),
  descanso: [].concat(gongMetal(0), gongMetal(0.35), gongMetal(0.7), clincMetal(900, 0, 0.5), clincMetal(900, 0.35, 0.5), clincMetal(900, 0.7, 0.5)),
  record: [].concat(
    [{ f: 150, f2: 45, t: 0, d: 0.4, tipo: "sine", v: 0.3, e: 6 }, { f: 2000, t: 0, d: 0.04, tipo: "ruido", v: 0.12, e: 60 }],
    clincMetal(1400, 0.08, 1), clincMetal(1760, 0.22, 1), clincMetal(2100, 0.36, 1.2),
    [{ f: 2093, t: 0.5, d: 0.35, tipo: "sine", v: 0.06, e: 7 }, { f: 2637, t: 0.56, d: 0.35, tipo: "sine", v: 0.06, e: 7 },
     { f: 3136, t: 0.62, d: 0.35, tipo: "sine", v: 0.06, e: 7 }, { f: 4186, t: 0.68, d: 0.35, tipo: "sine", v: 0.06, e: 7 }]
  )
};

// Sonidos que deben oírse más bajos que el resto (1 = normal)
const VOLUMEN_SONIDO = { aviso10: 0.45 };

// Vibración que acompaña a cada sonido (milisegundos: vibra, pausa, vibra…). En iPhone no hay vibración web.
const VIBRACIONES = {
  serie: [30], descanso: [120, 140, 120, 140, 300], tic: [20], record: [80, 60, 80, 60, 200], rango: [100, 60, 100, 60, 400],
  fin: [150], enfadado: [300], racha: [60, 40, 120], aviso10: [40, 80, 40]
};

// ---------- Fabricar el audio ----------
const FRECUENCIA_MUESTREO = 22050;      // muestras por segundo (suficiente para estos sonidos)

// Valor de la onda en un punto (fase entre 0 y 1)
function onda(tipo, fase) {
  const x = fase - Math.floor(fase);
  if (tipo === "ruido") return Math.random() * 2 - 1;
  if (tipo === "square") return x < 0.5 ? 1 : -1;
  if (tipo === "sawtooth") return 2 * x - 1;
  if (tipo === "triangle") return 1 - 4 * Math.abs(x - 0.5);
  return Math.sin(2 * Math.PI * x);
}

// Convierte las notas en muestras de audio (números entre -1 y 1)
function muestrasDe(notas, volumen) {
  const total = Math.ceil((duracionSonido2(notas) + 0.05) * FRECUENCIA_MUESTREO);
  const m = new Float32Array(total);
  for (const n of notas) {
    const ini = Math.floor(n.t * FRECUENCIA_MUESTREO), largo = Math.floor(n.d * FRECUENCIA_MUESTREO);
    let fase = 0;
    for (let i = 0; i < largo && ini + i < total; i++) {
      const p = i / largo;
      const f = n.f2 ? n.f + (n.f2 - n.f) * p : n.f;
      fase += f / FRECUENCIA_MUESTREO;
      // Sube en 5 ms y se apaga poco a poco (como una campana), sin "clics"
      const ataque = Math.min(1, i / (0.005 * FRECUENCIA_MUESTREO));
      // Caída: exponencial si la nota tiene "e" (como un metal golpeado); si no, suave
      const caida = n.e ? Math.exp(-n.e * i / FRECUENCIA_MUESTREO) * Math.min(1, (1 - p) * 8) : Math.pow(1 - p, 2);
      m[ini + i] += onda(n.tipo, fase) * n.v * ataque * caida;
    }
  }
  // Ajusta el volumen para que el sonido más fuerte no se distorsione
  let pico = 0;
  for (let i = 0; i < total; i++) pico = Math.max(pico, Math.abs(m[i]));
  const k = pico > 0 ? 0.9 * (volumen || 1) / pico : 1;     // al 90 % del volumen máximo (se oyen bien en el gimnasio), salvo los marcados como suaves
  for (let i = 0; i < total; i++) m[i] *= k;
  return m;
}

// Empaqueta las muestras como archivo WAV (cabecera de 44 bytes + datos de 16 bits)
function wavDe(muestras) {
  const datos = muestras.length * 2;
  const b = new DataView(new ArrayBuffer(44 + datos));
  const texto = function (pos, t) { for (let i = 0; i < t.length; i++) b.setUint8(pos + i, t.charCodeAt(i)); };
  texto(0, "RIFF"); b.setUint32(4, 36 + datos, true); texto(8, "WAVE");
  texto(12, "fmt "); b.setUint32(16, 16, true); b.setUint16(20, 1, true); b.setUint16(22, 1, true);
  b.setUint32(24, FRECUENCIA_MUESTREO, true); b.setUint32(28, FRECUENCIA_MUESTREO * 2, true); b.setUint16(32, 2, true); b.setUint16(34, 16, true);
  texto(36, "data"); b.setUint32(40, datos, true);
  for (let i = 0; i < muestras.length; i++) b.setInt16(44 + i * 2, Math.max(-1, Math.min(1, muestras[i])) * 32767, true);
  return b.buffer;
}

// ---------- Reproducir ----------
let reproductor = null;           // elemento <audio> "desbloqueado" con el primer toque
const urlsSonido = {};            // cada sonido se fabrica una sola vez

// Le dice al móvil que son sonidos CORTOS de aviso: suenan por encima de tu música
// (como mucho la bajan un momento) en vez de pararla. Funciona en iPhone con iOS 17 o más.
function sesionAudioCorta() {
  try {
    if (typeof navigator !== "undefined" && navigator.audioSession) navigator.audioSession.type = "transient";
  } catch (e) { }
}

// Los navegadores solo dejan sonar después de un toque. En el primer toque se reproduce
// un silencio cortito para que el reproductor quede permitido para siempre.
function prepararAudio() {
  if (typeof window === "undefined" || typeof Audio === "undefined" || reproductor) return reproductor;
  const aj = (typeof estado !== "undefined" && estado && estado.ajustes) ? estado.ajustes : {};
  if (aj.sonido === false) return null;             // sin sonidos: no se toca el audio del móvil
  sesionAudioCorta();
  try {
    reproductor = new Audio();
    // Al acabar cada sonido se suelta el audio, para que el móvil no lo trate como música
    reproductor.addEventListener("ended", function () { reproductor.pause(); });
    reproductor.setAttribute("playsinline", "");
    reproductor.src = urlDe([{ f: 440, t: 0, d: 0.02, tipo: "sine", v: 0.0001 }]);
    const p = reproductor.play(); if (p && p.catch) p.catch(function () { });
  } catch (e) { reproductor = null; }
  return reproductor;
}
function urlDe(notas, volumen) {
  return URL.createObjectURL(new Blob([wavDe(muestrasDe(notas, volumen))], { type: "audio/wav" }));
}

// Reproduce un sonido por su nombre. Devuelve true si estaba permitido sonar.
function sonar(nombre) {
  const aj = (typeof estado !== "undefined" && estado && estado.ajustes) ? estado.ajustes : {};
  // Con el estilo «Metal de gimnasio», los sonidos que tiene se cambian por los suyos
  const metal = aj.estiloSonido === "metal" && SONIDOS_METAL[nombre];
  const notas = metal ? SONIDOS_METAL[nombre] : SONIDOS[nombre];
  if (!notas) return false;
  const clave = (metal ? "metal-" : "") + nombre;     // cada versión se fabrica una sola vez
  if (aj.vibracion !== false && typeof navigator !== "undefined" && navigator.vibrate) {
    try { navigator.vibrate(VIBRACIONES[nombre] || [50]); } catch (e) { }
  }
  if (aj.sonido === false) return false;
  sesionAudioCorta();
  const r = prepararAudio();
  if (!r) return true;
  try {
    if (!urlsSonido[clave]) urlsSonido[clave] = urlDe(notas, VOLUMEN_SONIDO[nombre]);
    r.pause(); r.src = urlsSonido[clave]; r.currentTime = 0;
    const p = r.play(); if (p && p.catch) p.catch(function () { });
  } catch (e) { }
  return true;
}

// Duración total de un sonido en segundos
function duracionSonido(nombre) { return duracionSonido2(SONIDOS[nombre] || []); }
function duracionSonido2(notas) {
  let fin = 0;
  for (const n of notas) fin = Math.max(fin, n.t + n.d);
  return fin;
}
