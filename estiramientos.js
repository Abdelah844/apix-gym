// =====================================================
// ESTIRAMIENTOS DE POSTURA (unos 5 minutos)
// Sesión guiada: cada estiramiento con su foto y una cuenta atrás.
// No cuenta como entreno (no cambia la racha ni los rangos).
// =====================================================

// seg = segundos que se mantiene; lados = se hace con un lado y luego con el otro
// fotos: 1 = posición de inicio, 2 = estirando. "alterna" = se va cambiando de una a otra (movimiento)
const ESTIRAMIENTOS = [
  { id: "codos-atras", nombre: "Pecho: codos atrás", zona: "Pecho y hombros", seg: 30, lados: false,
    pasos: ["De pie, pon las manos en la parte baja de la espalda.", "Lleva los codos hacia atrás, como si quisieras juntarlos.", "Saca pecho y respira tranquilo."] },
  { id: "cuello-lateral", nombre: "Cuello lateral", zona: "Cuello", seg: 20, lados: true,
    pasos: ["Con la mano, lleva la cabeza hacia un hombro sin forzar.", "El otro hombro, relajado y hacia abajo.", "Nota el estiramiento en el lateral del cuello."] },
  { id: "gato-camello", nombre: "Gato y camello", zona: "Espalda", seg: 40, lados: false, alterna: true,
    pasos: ["A cuatro patas, manos debajo de los hombros.", "Redondea la espalda hacia arriba mirando al ombligo.", "Luego húndela mirando al frente. Cambia despacio."] },
  { id: "postura-nino", nombre: "Postura del niño", zona: "Espalda y dorsales", seg: 40, lados: false,
    pasos: ["De rodillas, siéntate sobre los talones.", "Estira los brazos hacia delante y apoya la frente.", "Deja caer el pecho hacia el suelo y respira hondo."] },
  { id: "flexor-cadera", nombre: "Flexor de cadera", zona: "Cadera", seg: 30, lados: true,
    pasos: ["Rodilla en el suelo y la otra pierna delante, en zancada.", "Aprieta el glúteo y lleva la cadera un poco hacia delante.", "Mantén el tronco recto. Al estar sentado mucho, esta zona se acorta."] },
  { id: "giro-sentado", nombre: "Giro de espalda sentado", zona: "Espalda alta", seg: 20, lados: true,
    pasos: ["Sentado, con las manos detrás de la cabeza.", "Gira el tronco hacia un lado sin mover la cadera.", "Crece hacia arriba mientras giras."] }
];

const PREPARA_EST = 5;   // segundos para colocarse antes de cada estiramiento

// Lista de pasos de la sesión: cada estiramiento (y cada lado) es un paso
function pasosEstiramientos() {
  const lista = [];
  for (const e of ESTIRAMIENTOS) {
    if (e.lados) {
      lista.push({ est: e, lado: "Lado izquierdo" });
      lista.push({ est: e, lado: "Lado derecho" });
    } else {
      lista.push({ est: e, lado: "" });
    }
  }
  return lista;
}

// Duración total en segundos (con el tiempo para colocarse)
function duracionEstiramientos() {
  return pasosEstiramientos().reduce(function (t, p) { return t + p.est.seg + PREPARA_EST; }, 0);
}
