// =====================================================
// APIX GYM · ACADEMIA (fichas de aprendizaje y animaciones propias)
// - Cada ejercicio tiene: preparación, errores extra, seguridad y animación.
// - Las animaciones son dibujos propios hechos con código (sin licencias de terceros).
//   Muestran el PATRÓN de movimiento, no la máquina exacta de cada gimnasio.
// - Los vídeos reales están pendientes de producción propia.
// =====================================================

// ---------- Seguridad común según el material ----------
const SEGURIDAD_GENERAL = [
  "Empieza con una carga que puedas mover con buena técnica.",
  "Para si notas dolor (el esfuerzo muscular es normal; el dolor articular o punzante, no)."
];
const SEGURIDAD_EQUIPO = {
  barra: "Usa los topes de seguridad o pide a alguien que te ayude cuando vayas pesado.",
  maquina: "Comprueba que el pasador del peso está bien metido antes de empezar.",
  polea: "Revisa que el cable y el agarre están bien enganchados.",
  mancuernas: "Coge y deja las mancuernas en el suelo con la espalda recta.",
  corporal: "Progresa poco a poco: primero más repeticiones y después lastre."
};

// ---------- Ficha de cada ejercicio ----------
// anim: animación del patrón · inv: la animación va al revés
// prep: preparación y ajustes · err: errores además del principal · seg: seguridad específica
const TUTORIALES = {
  "press-banca": { anim: "press-horizontal", prep: ["Túmbate con los ojos justo debajo de la barra.", "Agarre algo más abierto que los hombros."], err: ["Levantar la cadera del banco."], seg: ["Con pesos altos, entrena con alguien que te ayude o con topes."] },
  "press-inclinado-mancuernas": { anim: "press-inclinado", prep: ["Banco a unos 30 grados.", "Sube las mancuernas apoyándolas en los muslos."], err: ["Chocar las mancuernas arriba."], seg: [] },
  "press-maquina": { anim: "press-sentado", prep: ["Ajusta el asiento: asas a la altura del pecho."], err: ["Despegar los hombros del respaldo."], seg: [] },
  "contractora": { anim: "aperturas-sentado", prep: ["Ajusta el asiento para que los codos queden a la altura de los hombros."], err: ["Doblar mucho los codos y empujar con los brazos."], seg: [] },
  "aperturas-polea": { anim: "aperturas", prep: ["Poleas a la altura de los hombros.", "Un pie adelantado para estar estable."], err: ["Encoger los hombros."], seg: [] },
  "fondos": { anim: "fondos", prep: ["Sujétate con los brazos estirados y los hombros bajos."], err: ["Encoger los hombros hacia las orejas."], seg: ["Si te molesta el hombro, empieza con fondos asistidos."] },
  "flexiones": { anim: "flexion", prep: ["Manos algo más abiertas que los hombros.", "Cuerpo recto de cabeza a talones."], err: ["Abrir los codos a 90 grados del cuerpo."], seg: [] },
  "dominadas": { anim: "dominada-frente-abierto", prep: ["Agarre algo más abierto que los hombros."], err: ["No estirar los brazos abajo (medio recorrido)."], seg: ["Si aún no haces 5, usa las dominadas asistidas."] },
  "jalon": { anim: "jalon-frente-abierto", prep: ["Ajusta el rodillo para que sujete bien los muslos."], err: ["Llevar la barra por detrás de la nuca."], seg: [] },
  "remo-barra": { anim: "remo-inclinado", prep: ["Rodillas algo dobladas y espalda recta.", "Tronco inclinado unos 45 grados."], err: ["Levantar el tronco para subir la barra."], seg: ["Si te molesta la espalda baja, usa el remo en barra T."] },
  "remo-polea": { anim: "remo-frente-triangulo", prep: ["Pies en los apoyos y rodillas un poco dobladas."], err: ["Encoger los hombros al tirar."], seg: [] },
  "remo-mancuerna": { anim: "remo-inclinado", prep: ["Apoya rodilla y mano del mismo lado en el banco."], err: ["Tirar con el bíceps en vez de llevar el codo atrás."], seg: [] },
  "remo-maquina": { anim: "remo-frente-neutro", prep: ["Ajusta el asiento para que las asas queden a la altura del pecho."], err: ["Echar el tronco hacia atrás."], seg: [] },
  "peso-muerto": { anim: "bisagra", prep: ["Pies a la anchura de la cadera, barra sobre el medio del pie.", "Hombros algo por delante de la barra."], err: ["Tirar con los brazos doblados."], seg: ["Aprende la técnica con poco peso; es el ejercicio con más carga de la biblioteca."] },
  "press-militar": { anim: "press-vertical-pie", prep: ["Barra a la altura de las clavículas.", "Pies a la anchura de la cadera."], err: ["Empujar la barra hacia delante en vez de hacia arriba."], seg: [] },
  "press-hombro-mancuernas": { anim: "press-vertical", prep: ["Respaldo casi vertical."], err: ["Arquear la espalda."], seg: [] },
  "press-hombro-maquina": { anim: "press-vertical", prep: ["Ajusta el asiento: asas a la altura de los hombros."], err: ["Bloquear los codos de golpe arriba."], seg: [] },
  "elevaciones-laterales": { anim: "elevacion-lateral", prep: ["Codos un poco doblados.", "Peso ligero."], err: ["Encoger los hombros."], seg: [] },
  "elevaciones-polea": { anim: "elevacion-lateral-sentado", prep: ["Polea en la posición más baja, de lado a la máquina."], err: ["Girar el tronco para subir."], seg: [] },
  "pajaros-maquina": { anim: "aperturas-sentado", inv: true, prep: ["Siéntate mirando a la máquina con el pecho apoyado."], err: ["Juntar las escápulas con fuerza en vez de abrir los brazos."], seg: [] },
  "face-pull": { anim: "face-pull", prep: ["Polea a la altura de la cara con cuerda."], err: ["Tirar hacia el cuello en vez de hacia la frente."], seg: [] },
  "curl-barra": { anim: "curl", prep: ["Agarre a la anchura de los hombros."], err: ["Subir los codos hacia delante."], seg: [] },
  "curl-mancuernas": { anim: "curl", prep: ["Brazos estirados a los lados, palmas hacia dentro."], err: ["Bajar sin control."], seg: [] },
  "curl-martillo": { anim: "curl", prep: ["Palmas mirándose durante todo el movimiento."], err: ["Balancear el cuerpo."], seg: [] },
  "curl-polea": { anim: "curl", prep: ["Polea baja y un paso atrás para tener tensión."], err: ["Inclinarse hacia atrás."], seg: [] },
  "curl-maquina": { anim: "curl-predicador", prep: ["Ajusta el asiento: axilas sobre el borde del apoyo."], err: ["No estirar los brazos abajo."], seg: [] },
  "extension-polea": { anim: "ext-frente-recta", prep: ["Polea alta y tronco un poco inclinado."], err: ["Usar el peso del cuerpo para empujar."], seg: [] },
  "extension-polea-v": { anim: "ext-frente-v", prep: ["Engancha la barra en V a la polea alta.", "Tronco un poco inclinado hacia delante."], err: ["Usar el peso del cuerpo para empujar."], seg: [] },
  "extension-una-mano-polea": { anim: "ext-frente-una-mano", prep: ["Engancha un asa a la polea alta.", "Ponte de lado o de frente, como te sea más cómodo."], err: ["Mover el hombro en vez del codo."], seg: [] },
  "press-frances": { anim: "press-frances", prep: ["Barra Z si te molestan las muñecas."], err: ["Bajar la barra hacia la nariz con los codos abiertos."], seg: ["Baja despacio: la barra pasa cerca de la cara."] },
  "extension-nuca": { anim: "extension-nuca-pie", prep: ["Sujeta la mancuerna por un extremo con las dos manos."], err: ["Abrir los codos hacia los lados."], seg: ["Usa un respaldo para no arquear la espalda."] },
  "triceps-maquina": { anim: "extension-nuca", prep: ["Ajusta el asiento: codos alineados con el eje de la máquina."], err: ["Levantar los codos del apoyo."], seg: [] },
  "curl-muneca": { anim: "muneca", prep: ["Antebrazo apoyado en el banco, muñeca fuera."], err: ["Usar demasiado peso y mover el codo."], seg: [] },
  "curl-inverso": { anim: "curl", prep: ["Agarre con las palmas hacia abajo."], err: ["Dejar caer las muñecas."], seg: [] },
  "crunch-polea": { anim: "crunch", prep: ["De rodillas, cuerda junto a la cabeza."], err: ["Sentarse sobre los talones en vez de enrollar el tronco."], seg: [] },
  "elevacion-piernas": { anim: "elevacion-piernas", prep: ["Cuélgate con agarre firme y hombros activos."], err: ["Subir las piernas con impulso."], seg: ["Empieza con las rodillas dobladas."] },
  "rueda-abdominal": { anim: "rueda", prep: ["De rodillas sobre una esterilla."], err: ["Llegar tan lejos que se hunde la cadera."], seg: ["Empieza con recorridos cortos."] },
  "sentadilla": { anim: "sentadilla", prep: ["Barra sobre la parte alta de la espalda, no sobre el cuello.", "Pies a la anchura de los hombros, puntas un poco hacia fuera."], err: ["Juntar las rodillas al subir."], seg: ["Coloca los topes del rack a la altura más baja que vayas a bajar."] },
  "prensa": { anim: "prensa", prep: ["Ajusta el respaldo.", "Pies a una anchura cómoda en el centro de la plataforma.", "Comprueba los seguros antes de desbloquear."], err: ["Bajar más de lo que permite tu movilidad.", "Rebotar abajo."], seg: ["No bloquees las rodillas de golpe al estirar."] },
  "hack": { anim: "sentadilla", prep: ["Hombros bajo los soportes y espalda contra el respaldo."], err: ["Levantar los talones."], seg: ["Pon los seguros antes de bajar."] },
  "extension-cuadriceps": { anim: "extension-rodilla", prep: ["Rodilla alineada con el eje de la máquina.", "Rodillo sobre los tobillos."], err: ["Levantar la cadera del asiento."], seg: [] },
  "zancadas": { anim: "zancada", prep: ["Espacio libre delante para dar el paso."], err: ["Dar un paso demasiado corto."], seg: [] },
  "sentadilla-bulgara": { anim: "zancada", prep: ["Banco detrás a la altura de la rodilla."], err: ["Apoyar el peso en la pierna de atrás."], seg: [] },
  "sentadilla-goblet": { anim: "sentadilla", prep: ["Mancuerna vertical pegada al pecho."], err: ["Redondear la espalda abajo."], seg: [] },
  "peso-muerto-rumano": { anim: "bisagra", prep: ["Rodillas un poco dobladas y fijas."], err: ["Doblar las rodillas como en una sentadilla."], seg: [] },
  "curl-femoral-tumbado": { anim: "curl-femoral", prep: ["Rodilla justo fuera del banco, rodillo en los tobillos."], err: ["Levantar la cadera."], seg: [] },
  "curl-femoral-sentado": { anim: "extension-rodilla", inv: true, prep: ["Rodilla alineada con el eje y almohadilla sobre los muslos."], err: ["Soltar el peso de golpe al subir."], seg: [] },
  "hip-thrust": { anim: "puente", prep: ["Espalda alta apoyada en el banco.", "Almohadilla en la barra para la cadera."], err: ["Empujar con las puntas de los pies."], seg: [] },
  "patada-gluteo": { anim: "patada", prep: ["Tobillera en la polea baja, agárrate a la máquina."], err: ["Girar la cadera hacia fuera."], seg: [] },
  "abductores": { anim: "abduccion", prep: ["Espalda apoyada y piernas juntas contra las almohadillas."], err: ["Usar impulso."], seg: [] },
  "gemelos-maquina": { anim: "gemelo", prep: ["Puntas en el borde y hombros bajo los apoyos."], err: ["Doblar las rodillas para subir."], seg: [] },
  "gemelos-mancuerna": { anim: "gemelo", prep: ["Escalón estable y una mano apoyada en la pared."], err: ["Recorrido corto."], seg: [] },
  // Ampliación 2.2
  "aductores": { anim: "abduccion", inv: true, prep: ["Ajusta la apertura inicial a tu flexibilidad.", "Espalda apoyada en el respaldo."], err: ["Juntar las piernas de golpe."], seg: ["Si notas tirón en la ingle, reduce el recorrido."] },
  "gemelo-sentado": { anim: "gemelo-sentado", prep: ["Almohadilla justo encima de las rodillas.", "Puntas de los pies en el borde."], err: ["Recorrido corto."], seg: [] },
  "remo-pecho-apoyado": { anim: "remo-inclinado", prep: ["Ajusta el banco para llegar a las asas con los brazos estirados.", "Elige el agarre: abierto o cerrado."], err: ["Encoger los hombros al tirar."], seg: [] },
  "dominadas-asistidas": { anim: "dominada-frente-asistida", prep: ["Elige la ayuda en la columna de peso.", "Sube a la plataforma con cuidado, sujetándote a las asas."], err: ["Usar tanta ayuda que no cuesta."], seg: ["Baja de la plataforma despacio al terminar."] },
  "fondos-asistidos": { anim: "fondos", prep: ["Elige la ayuda en la columna de peso.", "Apoya las rodillas en la plataforma."], err: ["Encoger los hombros."], seg: ["Baja de la plataforma despacio al terminar."] },
  "hip-thrust-maquina": { anim: "puente", prep: ["Ajusta el respaldo a la altura de las escápulas.", "Coloca el cinturón o la almohadilla sobre la cadera."], err: ["Mirar al techo y arquear el cuello."], seg: [] },
  "sentadilla-multipower": { anim: "sentadilla", prep: ["Pies un poco por delante de la barra.", "Ajusta los topes de seguridad."], err: ["Dejar caer la barra abajo."], seg: ["Bloquea siempre la barra girándola al terminar."] },
  "press-inclinado-multipower": { anim: "press-inclinado", prep: ["Banco a 30 grados centrado bajo la barra.", "Topes por encima del pecho."], err: ["Rebotar la barra en el pecho."], seg: ["Bloquea siempre la barra girándola al terminar."] },
  "hiperextensiones": { anim: "lumbar", prep: ["Apoyo justo por debajo de la cadera.", "Talones bien sujetos."], err: ["Hacerlo rápido y con impulso."], seg: ["Si tienes molestias lumbares, consulta antes con un profesional."] },
  // Ampliación 2.5
  "press-banca-multipower": { anim: "press-horizontal", prep: ["Centra el banco: la barra baja a la parte baja del pecho.", "Pon los topes por encima del pecho."], err: ["Rebotar la barra en el pecho."], seg: ["Bloquea siempre la barra girándola al terminar."] },
  "press-inclinado-maquina": { anim: "press-sentado-inclinado", prep: ["Ajusta el asiento: asas a la altura de la parte alta del pecho."], err: ["Despegar los hombros del respaldo."], seg: [] },
  "press-declinado-maquina": { anim: "press-sentado-declinado", prep: ["Ajusta el asiento: asas a la altura de la parte baja del pecho."], err: ["Bloquear los codos de golpe."], seg: [] },
  "press-inclinado-barra": { anim: "press-inclinado", prep: ["Banco a unos 30 grados.", "Agarre algo más abierto que los hombros."], err: ["Levantar la cadera del banco."], seg: ["Con pesos altos, entrena con alguien que te ayude o con topes."] },
  "aperturas-mancuernas": { anim: "aperturas-banco", prep: ["Banco plano y mancuernas ligeras.", "Codos un poco doblados y fijos."], err: ["Bajar los brazos por debajo del banco."], seg: ["Si notas tirón en el hombro, reduce el recorrido."] },
  "aperturas-polea-baja": { anim: "aperturas", prep: ["Poleas en la posición más baja.", "Un pie adelantado para estar estable."], err: ["Encoger los hombros."], seg: [] },
  "press-pecho-polea": { anim: "press-de-pie", prep: ["Poleas a la altura del pecho.", "Espalda apoyada si hay banco."], err: ["Arquear la espalda."], seg: [] },
  "jalon-estrecho": { anim: "jalon-frente-triangulo", prep: ["Engancha el triángulo (asa en V) a la polea.", "Ajusta el rodillo sobre los muslos."], err: ["Echarse muy atrás."], seg: [] },
  "jalon-cerrado": { anim: "jalon-frente-cerrado", prep: ["Usa la barra recta larga.", "Ajusta el rodillo sobre los muslos."], err: ["Abrir las manos más que los hombros."], seg: [] },
  "jalon-supino": { anim: "jalon-frente-supino", prep: ["Palmas hacia ti, manos a la anchura de los hombros."], err: ["Tirar solo con los brazos."], seg: [] },
  "sentadilla-frontal": { anim: "sentadilla-frontal", prep: ["Apoya la barra sobre la parte delantera de los hombros, cerca del cuello.", "Codos altos, apuntando hacia delante."], err: ["Dejar caer los codos y que la barra se vaya hacia delante."], seg: ["Usa las barras de seguridad del rack a la altura de tu sentadilla."] },
  "peso-muerto-sumo": { anim: "peso-muerto-sumo", prep: ["Pies muy abiertos y puntas hacia fuera.", "Agarra la barra con las manos por dentro de las rodillas."], err: ["Dejar que las rodillas se cierren hacia dentro."], seg: [] },
  "encogimientos-barra": { anim: "encogimiento-barra", prep: ["Coge la barra por encima, a la anchura de los hombros.", "Brazos estirados y espalda recta."], err: ["Doblar los codos para ayudarte."], seg: [] },
  "remo-menton-barra": { anim: "remo-menton-barra", prep: ["Coge la barra por encima, a la anchura de los hombros o algo más."], err: ["Subir la barra por encima del pecho."], seg: ["Si notas pinchazo en el hombro, para y cambia a elevaciones laterales."] },
  "lenador-polea": { anim: "lenador", prep: ["Polea alta con un asa o cuerda, de lado a la máquina.", "Pies separados y rodillas un poco dobladas."], err: ["Mover solo los brazos sin girar el tronco."], seg: [] },
  "pallof-press": { anim: "pallof", prep: ["Polea a la altura del pecho, de lado a la máquina.", "Sujeta el asa con las dos manos pegada al pecho."], err: ["Dejar que el cable te gire el cuerpo."], seg: [] },
  "remo-invertido": { anim: "remo-invertido", prep: ["Barra del multipower o del rack a la altura de la cadera.", "Cuélgate debajo con el cuerpo recto y los talones en el suelo."], err: ["Dejar caer la cadera."], seg: [] },
  "jalon-neutro-ancho": { anim: "jalon-frente-neutro-ancho", prep: ["Engancha la barra con asas paralelas (las de agarre neutro) a la polea alta.", "Ajusta el rodillo sobre los muslos."], err: ["Encoger los hombros hacia las orejas al tirar."], seg: [] },
  "jalon-cuerda": { anim: "jalon-frente-cuerda", prep: ["Engancha la cuerda a la polea alta.", "Ajusta el rodillo sobre los muslos."], err: ["Juntar las manos abajo en vez de separarlas."], seg: [] },
  "jalon-una-mano": { anim: "jalon-frente-una-mano", prep: ["Engancha un asa (estribo) a la polea alta.", "Ajusta el rodillo sobre los muslos."], err: ["Encoger el hombro del brazo que tira."], seg: [] },
  "pullover-polea": { anim: "pullover", prep: ["Polea alta con barra recta o cuerda.", "Da un paso atrás e inclina un poco el tronco."], err: ["Doblar los codos."], seg: [] },
  "remo-alto-maquina": { anim: "jalon", prep: ["Ajusta el asiento y el apoyo de los muslos."], err: ["Encoger los hombros."], seg: [] },
  "remo-polea-una-mano": { anim: "remo-frente-una-mano", prep: ["Asa individual en la polea.", "Rodillas un poco dobladas."], err: ["Girar el tronco."], seg: [] },
  "remo-multipower": { anim: "remo-inclinado", prep: ["Tronco inclinado unos 45 grados y rodillas un poco dobladas."], err: ["Redondear la espalda."], seg: ["Si te molesta la espalda baja, usa el remo en barra T."] },
  "dominadas-neutras": { anim: "dominada-frente-neutro", prep: ["Asas paralelas, palmas mirándose."], err: ["No estirar los brazos abajo."], seg: ["Si aún no haces 5, usa las dominadas asistidas."] },
  "remo-barra-supino": { anim: "remo-inclinado", prep: ["Palmas hacia arriba, manos a la anchura de los hombros.", "Tronco inclinado unos 45 grados."], err: ["Levantar el tronco para subir la barra."], seg: ["Si te molesta la espalda baja, usa el remo en barra T."] },
  "remo-polea-barra-ancha": { anim: "remo-frente-barra-ancha", prep: ["Barra larga, manos más abiertas que los hombros."], err: ["Encoger los hombros al tirar."], seg: [] },
  "remo-maquina-abierto": { anim: "remo-frente-abierto", prep: ["Asas horizontales y codos abiertos."], err: ["Echar el tronco hacia atrás."], seg: [] },
  "press-banca-cerrado": { anim: "press-horizontal", prep: ["Manos a la anchura de los hombros.", "Codos pegados al cuerpo."], err: ["Abrir los codos al bajar."], seg: ["Con pesos altos, entrena con alguien que te ayude o con topes."] },
  "dominadas-supinas": { anim: "dominada-frente-supino", prep: ["Palmas hacia ti, manos a la anchura de los hombros."], err: ["No estirar los brazos abajo."], seg: ["Si aún no haces 5, usa las dominadas asistidas."] },
  "encogimientos-mancuernas": { anim: "encogimiento", prep: ["Mancuernas a los lados del cuerpo."], err: ["Girar los hombros."], seg: [] },
  "encogimientos-maquina": { anim: "encogimiento", prep: ["Ajusta la altura de las asas: brazos estirados."], err: ["Doblar los codos."], seg: [] },
  "press-hombro-multipower": { anim: "press-vertical", prep: ["Banco casi vertical y centrado bajo la barra."], err: ["Arquear la espalda."], seg: ["Bloquea siempre la barra girándola al terminar."] },
  "press-arnold": { anim: "press-vertical", prep: ["Respaldo casi vertical.", "Mancuernas delante de la cara, palmas hacia ti."], err: ["Hacer el giro demasiado rápido."], seg: [] },
  "elevaciones-frontales-polea": { anim: "elevacion-frontal", prep: ["Polea baja con barra o cuerda."], err: ["Subir por encima de los ojos."], seg: [] },
  "pajaros-polea": { anim: "aperturas", inv: true, prep: ["Las dos poleas en lo más alto, cables cruzados."], err: ["Mover el tronco."], seg: [] },
  "pajaros-mancuernas": { anim: "pajaros-inclinado", prep: ["Pecho apoyado en un banco inclinado si te cuesta mantener la espalda recta."], err: ["Encoger los hombros."], seg: [] },
  "remo-menton-polea": { anim: "remo-menton", prep: ["Polea baja con barra recta.", "Agarre a la anchura de los hombros."], err: ["Subir las manos por encima del pecho."], seg: ["Si notas pinchazos en el hombro, para y cambia de ejercicio."] },
  "curl-barra-z": { anim: "curl", prep: ["Agarre en la parte inclinada de la barra."], err: ["Subir los codos hacia delante."], seg: [] },
  "curl-predicador": { anim: "curl-predicador", prep: ["Ajusta el asiento: axilas sobre el borde del apoyo."], err: ["Estirar del todo de golpe abajo."], seg: [] },
  "press-plano-mancuernas": { anim: "press-horizontal", prep: ["Siéntate con las mancuernas sobre los muslos y túmbate llevándolas al pecho."], err: ["Chocar las mancuernas arriba."], seg: ["Al terminar, baja las mancuernas al pecho y siéntate con ellas."] },
  "press-declinado-barra": { anim: "press-declinado", prep: ["Pies bien sujetos en los rodillos.", "Agarre algo más abierto que los hombros."], err: ["Levantar la cadera del banco."], seg: ["Con pesos altos, entrena con alguien que te ayude."] },
  "press-declinado-mancuernas": { anim: "press-declinado", prep: ["Pies sujetos en los rodillos antes de tumbarte."], err: ["Dejar caer las mancuernas al final."], seg: ["Pide ayuda para colocar las mancuernas si pesan mucho."] },
  "press-declinado-multipower": { anim: "press-declinado", prep: ["Banco declinado centrado bajo la barra.", "Topes por encima del pecho."], err: ["Barra bajando hacia el cuello."], seg: ["Bloquea siempre la barra girándola al terminar."] },
  "aperturas-inclinadas": { anim: "aperturas-inclinado", prep: ["Banco inclinado y mancuernas ligeras.", "Codos un poco doblados y fijos."], err: ["Bajar los brazos por debajo del banco."], seg: ["Si notas tirón en el hombro, reduce el recorrido."] },
  "aperturas-declinadas": { anim: "aperturas-declinado", prep: ["Pies sujetos en los rodillos.", "Mancuernas ligeras."], err: ["Bajar demasiado."], seg: ["Si notas tirón en el hombro, reduce el recorrido."] },
  "pullover-mancuerna": { anim: "pullover-banco", prep: ["Cruzado sobre el banco, solo la parte alta de la espalda apoyada.", "Sujeta la mancuerna por un disco con las dos manos."], err: ["Doblar mucho los codos."], seg: ["Empieza con poco peso: la mancuerna pasa sobre tu cara."] },
  "elevaciones-frontales": { anim: "elevacion-frontal", prep: ["Palmas hacia los muslos y codos casi rectos."], err: ["Balancearse."], seg: [] },
  "elevaciones-maquina": { anim: "elevacion-lateral-sentado", prep: ["Ajusta el asiento: los hombros a la altura del eje de la máquina.", "Codos apoyados en los cojines."], err: ["Encoger los hombros."], seg: [] },
  "elevaciones-laterales-sentado": { anim: "elevacion-lateral-sentado", prep: ["Sentado en el extremo del banco, espalda recta."], err: ["Encoger los hombros."], seg: [] },
  "elevacion-lateral-inclinada": { anim: "lateral-tumbado", prep: ["Túmbate de lado sobre el respaldo inclinado."], err: ["Subir más allá de la vertical."], seg: [] },
  "pajaros-banco-inclinado": { anim: "pajaros-inclinado", prep: ["Pecho apoyado en el banco inclinado, brazos colgando."], err: ["Encoger los hombros."], seg: [] },
  "patada-triceps": { anim: "patada-triceps", prep: ["Tronco casi horizontal y brazo pegado al cuerpo."], err: ["Balancear la mancuerna."], seg: [] },
  "press-frances-mancuernas": { anim: "press-frances", prep: ["Palmas mirándose y brazos verticales."], err: ["Mover los codos hacia la cabeza."], seg: ["Baja despacio: las mancuernas pasan cerca de la cabeza."] },
  "press-frances-inclinado": { anim: "press-frances-inclinado", prep: ["Banco inclinado, brazos apuntando hacia arriba."], err: ["Abrir los codos."], seg: ["Empieza con poco peso: la barra pasa por detrás de la cabeza."] },
  "remo-mancuernas-inclinado": { anim: "remo-pecho-banco", prep: ["Pecho apoyado en el banco inclinado y pies firmes."], err: ["Despegar el pecho del banco."], seg: [] },
  "crunch-declinado": { anim: "crunch-declinado", prep: ["Pies sujetos en los rodillos.", "Manos en el pecho o junto a las orejas."], err: ["Tirar del cuello."], seg: ["Si te molesta la espalda, baja la inclinación."] },
  "crunch-inverso-declinado": { anim: "crunch-inverso-banco", prep: ["Cabeza en la parte alta del banco y manos en los rodillos."], err: ["Dejar caer las piernas."], seg: ["Empieza con las rodillas dobladas."] },
  "elevacion-piernas-banco": { anim: "elevacion-piernas-tumbado", prep: ["Agárrate a los bordes del banco por detrás de la cabeza."], err: ["Despegar la espalda baja del banco."], seg: ["Si te molesta la espalda, dobla un poco las rodillas."] },
  "curl-inclinado": { anim: "curl-inclinado", prep: ["Banco inclinado a unos 45 grados.", "Brazos colgando por detrás del cuerpo."], err: ["Adelantar los codos."], seg: [] },
  "curl-martillo-inclinado": { anim: "curl-inclinado", prep: ["Banco inclinado y palmas mirándose."], err: ["Despegar la espalda del respaldo."], seg: [] },
  "curl-arana": { anim: "curl-arana", prep: ["Pecho apoyado en un banco inclinado.", "Brazos colgando en vertical."], err: ["Balancear los brazos."], seg: [] },
  "curl-predicador-mancuerna": { anim: "curl-predicador", prep: ["Axila sobre el borde del banco Scott."], err: ["Estirar del todo de golpe abajo."], seg: [] },
  "curl-predicador-maquina": { anim: "curl-predicador", prep: ["Ajusta el asiento: axilas sobre el borde del apoyo."], err: ["Estirar del todo de golpe abajo."], seg: [] },
  "curl-predicador-polea": { anim: "curl-predicador", prep: ["Banco Scott delante de la polea baja."], err: ["Levantar los codos del apoyo."], seg: [] },
  "curl-sentado-mancuernas": { anim: "curl-sentado", prep: ["Sentado en el extremo de un banco plano, espalda recta."], err: ["Echar el tronco atrás."], seg: [] },
  "curl-zottman": { anim: "curl", prep: ["Gira las palmas arriba del todo y abajo del todo."], err: ["Bajar demasiado rápido."], seg: [] },
  "curl-tumbado-polea": { anim: "curl-tumbado", prep: ["Banco plano bajo la polea alta, barra recta."], err: ["Mover los brazos."], seg: [] },
  "curl-martillo-cruzado": { anim: "curl", prep: ["Palmas hacia el cuerpo durante todo el movimiento."], err: ["Girar el tronco."], seg: [] },
  "curl-concentrado": { anim: "curl-concentrado", prep: ["Siéntate en un banco con las piernas abiertas."], err: ["Balancear el tronco."], seg: [] },
  "curl-martillo-cuerda": { anim: "curl", prep: ["Polea baja con cuerda."], err: ["Separar los codos del cuerpo."], seg: [] },
  "extension-cuerda": { anim: "ext-frente-cuerda", prep: ["Polea alta con cuerda y tronco un poco inclinado."], err: ["Mover los codos."], seg: [] },
  "extension-cuerda-nuca": { anim: "extension-nuca-pie", prep: ["Polea a media altura o baja, de espaldas a la máquina.", "Un pie adelantado."], err: ["Abrir los codos."], seg: [] },
  "extension-inversa-polea": { anim: "ext-frente-inversa", prep: ["Polea alta con barra recta, palmas hacia arriba."], err: ["Doblar las muñecas."], seg: [] },
  "press-cerrado-multipower": { anim: "press-horizontal", prep: ["Manos a la anchura de los hombros.", "Topes por encima del pecho."], err: ["Abrir los codos."], seg: ["Bloquea siempre la barra girándola al terminar."] },
  "fondos-banco": { anim: "fondos-banco", prep: ["Banco estable que no se mueva.", "Piernas dobladas para empezar."], err: ["Bajar demasiado."], seg: ["Si te molesta el hombro, reduce el recorrido."] },
  "curl-muneca-polea": { anim: "muneca", prep: ["Polea baja con barra corta.", "Antebrazos apoyados en los muslos."], err: ["Mover los codos."], seg: [] },
  "crunch-maquina": { anim: "crunch-sentado", prep: ["Ajusta el asiento y los apoyos de los pies."], err: ["Tirar con los brazos."], seg: [] },
  "crunch-polea-pie": { anim: "crunch-de-pie", prep: ["Polea alta con cuerda.", "Pies a la anchura de la cadera y rodillas un poco dobladas."], err: ["Bajar con los brazos."], seg: [] },
  "crunch": { anim: "crunch-suelo", prep: ["Túmbate en una esterilla.", "Manos en el pecho o junto a las orejas."], err: ["Tirar del cuello."], seg: [] },
  "extension-una-pierna": { anim: "extension-rodilla", prep: ["Rodilla alineada con el eje de la máquina."], err: ["Levantar la cadera."], seg: [] },
  "zancadas-caminando": { anim: "zancada", prep: ["Espacio libre delante.", "Barra bien colocada en la espalda."], err: ["Dar pasos cortos."], seg: ["Empieza con poco peso hasta controlar el equilibrio."] },
  "step-up": { anim: "zancada", prep: ["Banco estable a la altura de la rodilla o algo menos."], err: ["Impulsarte con la pierna de abajo."], seg: ["Usa un banco que no se mueva."] },
  "zancada-multipower": { anim: "zancada", prep: ["Un pie adelantado y otro atrasado, separados a la anchura de la cadera."], err: ["Poner los pies en línea."], seg: ["Bloquea siempre la barra girándola al terminar."] },
  "curl-femoral-de-pie": { anim: "curl-femoral-pie", prep: ["Rodilla alineada con el eje y rodillo detrás del tobillo."], err: ["Mover la cadera."], seg: [] },
  "peso-muerto-rigidas-multipower": { anim: "bisagra", prep: ["Pies a la anchura de la cadera.", "Rodillas un poco dobladas y fijas."], err: ["Redondear la espalda."], seg: ["Pon los topes a la altura más baja que vayas a bajar."] },
  "buenos-dias": { anim: "bisagra", prep: ["Barra en la parte alta de la espalda, no en el cuello."], err: ["Redondear la espalda."], seg: ["Si tienes molestias lumbares, cambia a hiperextensiones."] },
  "pull-through": { anim: "bisagra", prep: ["Polea baja con cuerda.", "Da dos pasos hacia delante para tener tensión."], err: ["Tirar con los brazos."], seg: [] },
  "puente-gluteo": { anim: "puente", prep: ["Almohadilla en la barra.", "Pies cerca de los glúteos."], err: ["Empujar con las puntas."], seg: [] },
  "gemelos-prensa": { anim: "gemelos-prensa", prep: ["Puntas en el borde inferior de la plataforma.", "Seguros puestos."], err: ["Doblar las rodillas."], seg: ["Nunca quites los seguros mientras haces gemelos."] },
  "gemelos-multipower": { anim: "gemelo", prep: ["Disco o escalón bajo las puntas."], err: ["Recorrido corto."], seg: ["Bloquea siempre la barra girándola al terminar."] },
  "aductor-polea": { anim: "aductor-pie", prep: ["Tobillera en la polea baja."], err: ["Girar la cadera."], seg: [] }
};

// ---------- Animaciones (dibujos propios) ----------
// Vista "lado" (mira a la derecha) o "frente". a = posición inicial, b = posición final.
// Articulaciones de lado: H cabeza, S hombro, E codo, W mano, M dedos, Hp cadera, K rodilla, A tobillo, T punta del pie
// (K2, A2, T2: la otra pierna; si no se indica, es igual que la primera).
// De frente: S1/S2 hombros, E1/E2 codos, W1/W2 manos, Hp1/Hp2 caderas, K1/K2 rodillas, A1/A2 tobillos.
const PIE = { A: [100, 150], T: [112, 150] };
const ANIMACIONES = {
  "sentadilla": { vista: "lado", carga: "S",
    a: { H: [100, 16], S: [100, 29], E: [88, 44], W: [98, 30], Hp: [100, 74], K: [100, 112], A: [100, 150], T: [112, 150] },
    b: { H: [113, 66], S: [107, 79], E: [96, 92], W: [105, 80], Hp: [78, 112], K: [113, 118], A: [100, 150], T: [112, 150] } },
  "zancada": { vista: "lado", carga: "W",
    a: { H: [100, 16], S: [100, 29], E: [100, 56], W: [100, 82], Hp: [100, 74], K: [100, 112], A: [100, 150], T: [112, 150], K2: [100, 112], A2: [100, 150], T2: [112, 150] },
    b: { H: [100, 42], S: [100, 55], E: [100, 82], W: [100, 108], Hp: [100, 100], K: [132, 108], A: [132, 150], T: [144, 150], K2: [86, 138], A2: [60, 146], T2: [52, 150] } },
  "bisagra": { vista: "lado", carga: "W",
    a: { H: [100, 16], S: [100, 29], E: [102, 56], W: [104, 82], Hp: [100, 74], K: [100, 112], A: [100, 150], T: [112, 150] },
    b: { H: [134, 46], S: [122, 52], E: [122, 79], W: [122, 105], Hp: [82, 76], K: [92, 112], A: [100, 150], T: [112, 150] } },
  "puente": { vista: "lado", carga: "Hp", props: [[30, 106, 70, 106], [36, 106, 36, 150], [64, 106, 64, 150]],
    a: { H: [46, 96], S: [62, 102], E: [80, 118], W: [96, 124], Hp: [98, 128], K: [126, 108], A: [130, 148], T: [142, 150] },
    b: { H: [46, 96], S: [62, 102], E: [80, 106], W: [96, 100], Hp: [96, 100], K: [126, 100], A: [130, 148], T: [142, 150] } },
  "press-horizontal": { vista: "lado", carga: "W", props: [[36, 104, 120, 104], [44, 104, 44, 150], [110, 104, 110, 150]],
    a: { H: [48, 94], S: [62, 100], E: [62, 72], W: [62, 46], Hp: [108, 100], K: [132, 108], A: [136, 150], T: [148, 150] },
    b: { H: [48, 94], S: [62, 100], E: [50, 104], W: [64, 86], Hp: [108, 100], K: [132, 108], A: [136, 150], T: [148, 150] } },
  // Banco inclinado (unos 35°): el respaldo sube hacia la cabeza y la barra sube en vertical sobre el pecho alto
  "press-inclinado": { vista: "lado", carga: "W", props: [[44, 74, 100, 114], [96, 114, 124, 114], [60, 86, 60, 150], [110, 114, 110, 150]],
    a: { H: [50, 70], S: [62, 78], E: [65, 52], W: [68, 26], Hp: [100, 108], K: [138, 112], A: [140, 150], T: [152, 150] },
    b: { H: [50, 70], S: [62, 78], E: [42, 94], W: [58, 74], Hp: [100, 108], K: [138, 112], A: [140, 150], T: [152, 150] } },
  // Banco declinado: la cabeza queda más baja que la cadera y los pies sujetos en los rodillos
  "press-declinado": { vista: "lado", carga: "W", props: [[54, 121, 116, 99], [64, 118, 64, 150], [110, 101, 110, 150], [146, 118, 156, 118]],
    a: { H: [57, 117], S: [70, 112], E: [70, 86], W: [70, 60], Hp: [112, 92], K: [146, 76], A: [150, 113], T: [160, 116] },
    b: { H: [57, 117], S: [70, 112], E: [54, 131], W: [66, 108], Hp: [112, 92], K: [146, 76], A: [150, 113], T: [160, 116] } },
  // Máquina de pecho sentado: espalda en el respaldo y empuje hacia delante a la altura del pecho
  "press-sentado": { vista: "lado", carga: "W", props: [[80, 106, 112, 106], [96, 106, 96, 150], [86, 106, 86, 46]],
    a: { H: [96, 46], S: [96, 59], E: [122, 62], W: [148, 64], Hp: [96, 104], K: [128, 106], A: [130, 150], T: [142, 150] },
    b: { H: [96, 46], S: [96, 59], E: [76, 76], W: [100, 68], Hp: [96, 104], K: [128, 106], A: [130, 150], T: [142, 150] } },
  // Máquina inclinada: sentado un poco echado hacia atrás y empuje hacia delante y arriba
  "press-sentado-inclinado": { vista: "lado", carga: "W", props: [[80, 106, 112, 106], [96, 106, 96, 150], [87, 108, 74, 50]],
    a: { H: [82, 49], S: [86, 62], E: [108, 48], W: [130, 34], Hp: [98, 104], K: [130, 106], A: [132, 150], T: [144, 150] },
    b: { H: [82, 49], S: [86, 62], E: [66, 76], W: [90, 66], Hp: [98, 104], K: [130, 106], A: [132, 150], T: [144, 150] } },
  // Máquina declinada: sentado y empuje hacia delante y abajo
  "press-sentado-declinado": { vista: "lado", carga: "W", props: [[80, 106, 112, 106], [96, 106, 96, 150], [86, 106, 86, 46]],
    a: { H: [96, 46], S: [96, 59], E: [119, 72], W: [142, 85], Hp: [96, 104], K: [128, 106], A: [130, 150], T: [142, 150] },
    b: { H: [96, 46], S: [96, 59], E: [76, 76], W: [100, 76], Hp: [96, 104], K: [128, 106], A: [130, 150], T: [142, 150] } },
  // Press en polea de pie: un pie delante y empuje hacia delante (el cable viene de atrás)
  "press-de-pie": { vista: "lado", carga: "W", cable: [30, 44],
    a: { H: [100, 16], S: [100, 29], E: [126, 32], W: [152, 34], Hp: [100, 74], K: [112, 112], A: [118, 150], T: [130, 150], K2: [92, 112], A2: [82, 150], T2: [94, 150] },
    b: { H: [100, 16], S: [100, 29], E: [80, 46], W: [104, 40], Hp: [100, 74], K: [112, 112], A: [118, 150], T: [130, 150], K2: [92, 112], A2: [82, 150], T2: [94, 150] } },
  // ---- Revisión de posturas (2.23): cada ejercicio con su postura real (sentado, tumbado, de pie...) ----
  // Aperturas tumbado en banco plano: los brazos bajan abiertos hasta la altura del pecho
  "aperturas-banco": { vista: "lado", carga: "W", props: [[36, 104, 120, 104], [44, 104, 44, 150], [110, 104, 110, 150]],
    a: { H: [48, 94], S: [62, 100], Hp: [108, 100], K: [132, 108], A: [136, 150], T: [148, 150], E: [63, 74], W: [64, 48] },
    b: { H: [48, 94], S: [62, 100], Hp: [108, 100], K: [132, 108], A: [136, 150], T: [148, 150], E: [62, 92], W: [64, 104] } },
  // Aperturas en banco inclinado
  "aperturas-inclinado": { vista: "lado", carga: "W", props: [[44, 74, 100, 114], [96, 114, 124, 114], [60, 86, 60, 150], [110, 114, 110, 150]],
    a: { H: [50, 70], S: [62, 78], Hp: [100, 108], K: [138, 112], A: [140, 150], T: [152, 150], E: [65, 52], W: [68, 26] },
    b: { H: [50, 70], S: [62, 78], Hp: [100, 108], K: [138, 112], A: [140, 150], T: [152, 150], E: [60, 90], W: [60, 102] } },
  // Aperturas en banco declinado
  "aperturas-declinado": { vista: "lado", carga: "W", props: [[54, 121, 116, 99], [64, 118, 64, 150], [110, 101, 110, 150], [146, 118, 156, 118]],
    a: { H: [57, 117], S: [70, 112], Hp: [112, 92], K: [146, 76], A: [150, 113], T: [160, 116], E: [70, 86], W: [70, 60] },
    b: { H: [57, 117], S: [70, 112], Hp: [112, 92], K: [146, 76], A: [150, 113], T: [160, 116], E: [68, 122], W: [68, 134] } },
  // Pullover tumbado: los brazos casi rectos bajan por detrás de la cabeza
  "pullover-banco": { vista: "lado", carga: "W", props: [[36, 104, 120, 104], [44, 104, 44, 150], [110, 104, 110, 150]],
    a: { H: [48, 94], S: [62, 100], Hp: [108, 100], K: [132, 108], A: [136, 150], T: [148, 150], E: [62, 74], W: [62, 48] },
    b: { H: [48, 94], S: [62, 100], Hp: [108, 100], K: [132, 108], A: [136, 150], T: [148, 150], E: [37, 96], W: [12, 94] } },
  // Sentado de frente (contractora): los brazos se cierran delante del pecho
  "aperturas-sentado": { vista: "frente", carga: "W", props: [[70, 104, 130, 104]],
    a: { H: [100, 30], S1: [84, 52], S2: [116, 52], Hp1: [90, 100], Hp2: [110, 100], K1: [94, 118], K2: [106, 118], A1: [94, 150], A2: [106, 150], E1: [60, 54], W1: [38, 58], E2: [140, 54], W2: [162, 58] },
    b: { E1: [78, 60], W1: [94, 66], E2: [122, 60], W2: [106, 66] } },
  // Elevaciones laterales sentado
  "elevacion-lateral-sentado": { vista: "frente", carga: "W", props: [[70, 104, 130, 104]],
    a: { H: [100, 30], S1: [84, 52], S2: [116, 52], Hp1: [90, 100], Hp2: [110, 100], K1: [94, 118], K2: [106, 118], A1: [94, 150], A2: [106, 150], E1: [80, 78], W1: [82, 102], E2: [120, 78], W2: [118, 102] },
    b: { E1: [58, 52], W1: [34, 54], E2: [142, 52], W2: [166, 54] } },
  // Pájaros con el tronco inclinado hacia delante (visto de frente)
  "pajaros-inclinado": { vista: "frente", carga: "W",
    a: { H: [100, 52], S1: [88, 62], S2: [112, 62], Hp1: [92, 96], Hp2: [108, 96], K1: [88, 122], K2: [112, 122], A1: [88, 150], A2: [112, 150], E1: [86, 84], W1: [92, 104], E2: [114, 84], W2: [108, 104] },
    b: { E1: [66, 64], W1: [42, 66], E2: [134, 64], W2: [158, 66] } },
  // Tumbado de lado en banco inclinado: el brazo de arriba sube
  "lateral-tumbado": { vista: "lado", carga: "W", props: [[56, 146, 130, 80], [70, 134, 70, 150]],
    a: { H: [122, 82], S: [112, 92], Hp: [80, 124], K: [60, 138], A: [40, 148], T: [34, 150], E: [108, 116], W: [104, 140] },
    b: { E: [114, 66], W: [116, 40] } },
  // Face pull de pie: la cuerda viene hacia la cara con los codos altos
  "face-pull": { vista: "lado", carga: "W", cable: [180, 30],
    a: { H: [100, 16], S: [100, 29], Hp: [100, 74], K: [100, 112], A: [100, 150], T: [112, 150], E: [126, 30], W: [152, 30] },
    b: { E: [80, 26], W: [104, 16] } },
  // Curl en banco predicador: el brazo apoyado en el cojín
  "curl-predicador": { vista: "lado", carga: "W", props: [[80, 106, 112, 106], [96, 106, 96, 150], [102, 64, 126, 86]],
    a: { H: [96, 46], S: [96, 59], Hp: [96, 104], K: [128, 106], A: [130, 150], T: [142, 150], E: [118, 80], W: [138, 98] },
    b: { W: [110, 56] } },
  // Curl sentado
  "curl-sentado": { vista: "lado", carga: "W", props: [[80, 106, 112, 106], [96, 106, 96, 150]],
    a: { H: [96, 46], S: [96, 59], Hp: [96, 104], K: [128, 106], A: [130, 150], T: [142, 150], E: [98, 84], W: [100, 108] },
    b: { W: [114, 62] } },
  // Curl concentrado: sentado, codo apoyado en el muslo
  "curl-concentrado": { vista: "lado", carga: "W", props: [[80, 106, 112, 106], [96, 106, 96, 150]],
    a: { H: [118, 52], S: [112, 64], Hp: [96, 104], K: [128, 106], A: [130, 150], T: [142, 150], E: [118, 89], W: [120, 114] },
    b: { W: [108, 68] } },
  // Curl tumbado en banco inclinado: los brazos cuelgan por detrás del cuerpo
  "curl-inclinado": { vista: "lado", carga: "W", props: [[44, 74, 100, 114], [96, 114, 124, 114], [60, 86, 60, 150], [110, 114, 110, 150]],
    a: { H: [50, 70], S: [62, 78], Hp: [100, 108], K: [138, 112], A: [140, 150], T: [152, 150], E: [60, 104], W: [58, 130] },
    b: { W: [72, 82] } },
  // Curl araña: pecho apoyado en el banco inclinado y brazos colgando
  "curl-arana": { vista: "lado", carga: "W", props: [[86, 120, 134, 80], [110, 104, 110, 150], [92, 118, 92, 150]],
    a: { H: [134, 62], S: [126, 72], Hp: [90, 110], K: [66, 128], A: [44, 148], T: [36, 150], E: [126, 98], W: [126, 124] },
    b: { W: [144, 80] } },
  // Remo con el pecho apoyado en el banco inclinado
  "remo-pecho-banco": { vista: "lado", carga: "W", props: [[86, 120, 134, 80], [110, 104, 110, 150], [92, 118, 92, 150]],
    a: { H: [134, 62], S: [126, 72], Hp: [90, 110], K: [66, 128], A: [44, 148], T: [36, 150], E: [126, 98], W: [126, 124] },
    b: { E: [104, 80], W: [112, 104] } },
  // Curl tumbado con polea alta: los codos miran al techo
  "curl-tumbado": { vista: "lado", carga: "W", cable: [62, 0], props: [[36, 104, 120, 104], [44, 104, 44, 150], [110, 104, 110, 150]],
    a: { H: [48, 94], S: [62, 100], Hp: [108, 100], K: [132, 108], A: [136, 150], T: [148, 150], E: [62, 74], W: [62, 48] },
    b: { W: [44, 88] } },
  // Press militar de pie
  "press-vertical-pie": { vista: "lado", carga: "W",
    a: { H: [100, 40], S: [100, 52], Hp: [100, 92], K: [100, 122], A: [100, 150], T: [110, 150], E: [106, 76], W: [106, 52] },
    b: { E: [101, 28], W: [102, 4] } },
  // Extensión tras nuca de pie
  "extension-nuca-pie": { vista: "lado", carga: "W",
    a: { H: [100, 40], S: [100, 52], Hp: [100, 92], K: [100, 122], A: [100, 150], T: [110, 150], E: [101, 28], W: [102, 4] },
    b: { W: [84, 46] } },
  // Tríceps en máquina sentado: los brazos empujan hacia abajo
  "triceps-sentado": { vista: "lado", carga: "W", props: [[80, 106, 112, 106], [96, 106, 96, 150], [86, 106, 86, 46]],
    a: { H: [96, 46], S: [96, 59], Hp: [96, 104], K: [128, 106], A: [130, 150], T: [142, 150], E: [90, 84], W: [112, 72] },
    b: { W: [92, 110] } },
  // Patada de tríceps: tronco inclinado y el antebrazo se estira hacia atrás
  "patada-triceps": { vista: "lado", carga: "W",
    a: { H: [134, 46], S: [122, 52], Hp: [82, 76], K: [92, 112], A: [100, 150], T: [112, 150], E: [98, 62], W: [98, 88] },
    b: { W: [72, 72] } },
  // Press francés en banco inclinado
  "press-frances-inclinado": { vista: "lado", carga: "W", props: [[44, 74, 100, 114], [96, 114, 124, 114], [60, 86, 60, 150], [110, 114, 110, 150]],
    a: { H: [50, 70], S: [62, 78], Hp: [100, 108], K: [138, 112], A: [140, 150], T: [152, 150], E: [64, 52], W: [66, 26] },
    b: { W: [44, 60] } },
  // Fondos en banco: manos en el banco de atrás y pies en el de delante
  "fondos-banco": { vista: "lado", props: [[30, 106, 70, 106], [38, 106, 38, 150], [64, 106, 64, 150], [130, 96, 160, 96], [150, 96, 150, 150]],
    a: { H: [64, 40], S: [62, 52], E: [60, 78], W: [58, 104], Hp: [66, 98], K: [104, 96], A: [140, 92], T: [146, 84] },
    b: { H: [66, 66], S: [64, 78], E: [38, 86], Hp: [68, 124], K: [104, 106] } },
  // Crunch en máquina sentado
  "crunch-sentado": { vista: "lado", props: [[80, 106, 112, 106], [96, 106, 96, 150], [86, 106, 86, 46]],
    a: { H: [96, 46], S: [96, 59], Hp: [96, 104], K: [128, 106], A: [130, 150], T: [142, 150], E: [106, 72], W: [100, 58] },
    b: { H: [120, 70], S: [112, 74], E: [124, 88], W: [118, 74] } },
  // Crunch en polea de pie
  "crunch-de-pie": { vista: "lado", cable: [110, 0],
    a: { H: [100, 16], S: [100, 29], Hp: [100, 74], K: [100, 112], A: [100, 150], T: [112, 150], E: [108, 44], W: [104, 22] },
    b: { H: [148, 62], S: [139, 52], E: [146, 72], W: [140, 58] } },
  // Crunch tumbado en el suelo con las rodillas dobladas
  "crunch-suelo": { vista: "lado",
    a: { H: [40, 138], S: [54, 142], E: [46, 126], W: [38, 132], Hp: [98, 146], K: [120, 122], A: [140, 148], T: [150, 150] },
    b: { H: [56, 112], S: [64, 124], E: [58, 108], W: [50, 114] } },
  // Crunch en banco declinado: el tronco sube desde el banco
  "crunch-declinado": { vista: "lado", props: [[54, 121, 116, 99], [64, 118, 64, 150], [110, 101, 110, 150], [146, 118, 156, 118]],
    a: { H: [57, 117], S: [70, 112], Hp: [112, 92], K: [146, 76], A: [150, 113], T: [160, 116], E: [80, 104], W: [76, 112] },
    b: { H: [78, 44], S: [84, 56], E: [94, 66], W: [88, 62] } },
  // Crunch inverso tumbado: las rodillas van hacia el pecho
  "crunch-inverso-banco": { vista: "lado", props: [[36, 104, 120, 104], [44, 104, 44, 150], [110, 104, 110, 150]],
    a: { H: [48, 94], S: [62, 100], Hp: [108, 100], K: [126, 84], A: [146, 94], T: [156, 92], E: [48, 104], W: [40, 100] },
    b: { Hp: [104, 92], K: [88, 66], A: [104, 48], T: [112, 44] } },
  // Elevación de piernas tumbado en banco
  "elevacion-piernas-tumbado": { vista: "lado", props: [[36, 104, 120, 104], [44, 104, 44, 150], [110, 104, 110, 150]],
    a: { H: [48, 94], S: [62, 100], Hp: [108, 100], K: [146, 98], A: [182, 96], T: [190, 90], E: [48, 104], W: [40, 100] },
    b: { K: [110, 62], A: [112, 24], T: [120, 20] } },
  // Prensa de piernas: recostado y empujando la plataforma
  "prensa": { vista: "lado", props: [[64, 84, 104, 116], [104, 120, 124, 120], [130, 118, 190, 58]],
    a: { H: [70, 86], S: [80, 94], Hp: [110, 118], E: [92, 114], W: [104, 122], K: [140, 96], A: [166, 70], T: [174, 62] },
    b: { K: [118, 82], A: [152, 70], T: [160, 62] } },
  // Gemelos en prensa: piernas estiradas y solo se mueven los tobillos
  "gemelos-prensa": { vista: "lado", props: [[64, 84, 104, 116], [104, 120, 124, 120], [130, 118, 190, 58]],
    a: { H: [70, 86], S: [80, 94], Hp: [110, 118], E: [92, 114], W: [104, 122], K: [140, 96], A: [166, 70], T: [176, 62] },
    b: { T: [170, 54] } },
  // Curl femoral de pie: una pierna se dobla hacia atrás
  "curl-femoral-pie": { vista: "lado", props: [[124, 60, 124, 150]],
    a: { H: [100, 16], S: [100, 29], Hp: [100, 74], K: [100, 112], A: [100, 150], T: [112, 150], E: [112, 52], W: [124, 62], K2: [100, 112], A2: [100, 148], T2: [110, 150] },
    b: { K2: [102, 114], A2: [66, 124], T2: [60, 116] } },
  // Aductor en polea de pie: la pierna cruza por delante
  "aductor-pie": { vista: "frente",
    a: { H: [100, 22], S1: [86, 40], S2: [114, 40], Hp1: [92, 86], Hp2: [108, 86], K1: [92, 118], K2: [124, 114], A1: [92, 150], A2: [140, 142], E1: [82, 64], W1: [82, 88], E2: [118, 64], W2: [118, 88] },
    b: { K2: [104, 118], A2: [96, 148] } },
  "press-vertical": { vista: "lado", carga: "W", props: [[80, 106, 112, 106], [96, 106, 96, 150], [84, 106, 84, 48]],
    a: { H: [96, 46], S: [96, 59], E: [104, 84], W: [104, 58], Hp: [96, 104], K: [128, 106], A: [130, 150], T: [142, 150] },
    b: { H: [96, 46], S: [96, 59], E: [98, 31], W: [100, 5], Hp: [96, 104], K: [128, 106], A: [130, 150], T: [142, 150] } },
  // Dominadas vistas de frente: cada agarre con su anchura de manos
  "dominada-frente-abierto": { vista: "frente", barra: true, props: [[30, 12, 170, 12]],
    a: { H: [100, 44], S1: [86, 62], S2: [114, 62], Hp1: [92, 106], Hp2: [108, 106], K1: [92, 134], K2: [108, 134], A1: [92, 160], A2: [108, 160], E1: [66, 36], W1: [52, 12], E2: [134, 36], W2: [148, 12] },
    b: { H: [100, 14], S1: [86, 32], S2: [114, 32], Hp1: [92, 76], Hp2: [108, 76], K1: [92, 104], K2: [108, 104], A1: [92, 130], A2: [108, 130], E1: [58, 42], E2: [142, 42] } },
  "dominada-frente-supino": { vista: "frente", barra: true, props: [[30, 12, 170, 12]],
    a: { H: [100, 44], S1: [86, 62], S2: [114, 62], Hp1: [92, 106], Hp2: [108, 106], K1: [92, 134], K2: [108, 134], A1: [92, 160], A2: [108, 160], E1: [84, 36], W1: [86, 12], E2: [116, 36], W2: [114, 12] },
    b: { H: [100, 14], S1: [86, 32], S2: [114, 32], Hp1: [92, 76], Hp2: [108, 76], K1: [92, 104], K2: [108, 104], A1: [92, 130], A2: [108, 130], E1: [70, 46], E2: [130, 46] } },
  "dominada-frente-neutro": { vista: "frente", barra: true, props: [[30, 12, 170, 12], [76, 6, 76, 18], [124, 6, 124, 18]],
    a: { H: [100, 44], S1: [86, 62], S2: [114, 62], Hp1: [92, 106], Hp2: [108, 106], K1: [92, 134], K2: [108, 134], A1: [92, 160], A2: [108, 160], E1: [78, 36], W1: [76, 12], E2: [122, 36], W2: [124, 12] },
    b: { H: [100, 14], S1: [86, 32], S2: [114, 32], Hp1: [92, 76], Hp2: [108, 76], K1: [92, 104], K2: [108, 104], A1: [92, 130], A2: [108, 130], E1: [66, 44], E2: [134, 44] } },
  "dominada-frente-asistida": { vista: "frente", barra: true, props: [[30, 12, 170, 12], [80, 148, 120, 148]],
    a: { H: [100, 44], S1: [86, 62], S2: [114, 62], Hp1: [92, 106], Hp2: [108, 106], K1: [92, 134], K2: [108, 134], A1: [92, 148], A2: [108, 148], E1: [72, 36], W1: [64, 12], E2: [128, 36], W2: [136, 12] },
    b: { H: [100, 14], S1: [86, 32], S2: [114, 32], Hp1: [92, 76], Hp2: [108, 76], K1: [92, 104], K2: [108, 104], A1: [92, 118], A2: [108, 118], E1: [62, 44], E2: [138, 44] } },
  // Sentadilla frontal: barra delante, tronco más vertical y codos altos
  "sentadilla-frontal": { vista: "lado", carga: "W",
    a: { H: [100, 16], S: [100, 29], E: [118, 32], W: [106, 26], Hp: [100, 74], K: [100, 112], A: [100, 150], T: [112, 150] },
    b: { H: [106, 62], S: [104, 75], E: [122, 78], W: [110, 72], Hp: [84, 110], K: [118, 116], A: [100, 150], T: [112, 150] } },
  // Peso muerto sumo (de frente): piernas muy abiertas, manos por dentro de las rodillas
  "peso-muerto-sumo": { vista: "frente", carga: "W", barra: true,
    a: { H: [100, 58], S1: [86, 74], S2: [114, 74], Hp1: [90, 104], Hp2: [110, 104], K1: [70, 120], K2: [130, 120], A1: [70, 150], A2: [130, 150], E1: [88, 98], W1: [92, 122], E2: [112, 98], W2: [108, 122] },
    b: { H: [100, 22], S1: [86, 40], S2: [114, 40], Hp1: [92, 86], Hp2: [108, 86], K1: [80, 118], K2: [120, 118], A1: [70, 150], A2: [130, 150], E1: [88, 64], W1: [92, 90], E2: [112, 64], W2: [108, 90] } },
  // Encogimientos con barra (de frente, con la barra entre las manos)
  "encogimiento-barra": { vista: "frente", carga: "W", barra: true,
    a: { H: [100, 22], S1: [86, 40], S2: [114, 40], E1: [82, 64], W1: [80, 90], E2: [118, 64], W2: [120, 90], Hp1: [92, 86], Hp2: [108, 86], K1: [92, 118], K2: [108, 118], A1: [92, 150], A2: [108, 150] },
    b: { S1: [86, 32], S2: [114, 32], E1: [82, 56], W1: [80, 82], E2: [118, 56], W2: [120, 82] } },
  // Remo al mentón con barra (de frente, sin cable)
  "remo-menton-barra": { vista: "frente", carga: "W", barra: true,
    a: { H: [100, 22], S1: [86, 40], S2: [114, 40], E1: [86, 64], W1: [92, 88], E2: [114, 64], W2: [108, 88], Hp1: [92, 86], Hp2: [108, 86], K1: [92, 118], K2: [108, 118], A1: [92, 150], A2: [108, 150] },
    b: { E1: [64, 38], W1: [92, 46], E2: [136, 38], W2: [108, 46] } },
  // Leñador en polea (de frente): de arriba a un lado hasta abajo al otro, girando el tronco
  "lenador": { vista: "frente", carga: "W", cable: [196, 4], unaMano: true,
    a: { H: [102, 22], S1: [88, 40], S2: [116, 40], E1: [122, 30], W1: [146, 18], E2: [128, 34], W2: [148, 22], Hp1: [92, 86], Hp2: [108, 86], K1: [86, 118], K2: [114, 118], A1: [80, 150], A2: [120, 150] },
    b: { H: [96, 26], S1: [82, 44], S2: [110, 40], E1: [80, 70], W1: [62, 94], E2: [88, 72], W2: [64, 98], K1: [84, 120], K2: [112, 116] } },
  // Press Pallof (de lado): empujas hacia delante sin dejar que el cable te gire
  "pallof": { vista: "lado", carga: "W",
    a: { H: [100, 16], S: [100, 29], E: [104, 52], W: [112, 46], Hp: [100, 74], K: [102, 112], A: [100, 150], T: [112, 150], K2: [96, 112], A2: [90, 150], T2: [102, 150] },
    b: { E: [126, 40], W: [150, 40] } },
  // Remo invertido: cuerpo recto bajo una barra, tiras del pecho hacia ella
  "remo-invertido": { vista: "lado", props: [[110, 70, 172, 70], [168, 70, 168, 150]],
    a: { H: [154, 112], S: [140, 108], E: [140, 88], W: [140, 70], Hp: [100, 124], K: [64, 136], A: [30, 148], T: [24, 140] },
    b: { H: [150, 80], S: [136, 82], E: [116, 80], W: [140, 70], Hp: [98, 110], K: [62, 128], A: [30, 148], T: [24, 140] } },
  // Remos sentados vistos de frente: anchura de manos y apertura de codos según el agarre
  "remo-frente-triangulo": { vista: "frente", carga: "W", barra: true, props: [[70, 108, 130, 108]],
    a: { H: [100, 40], S1: [84, 60], S2: [116, 60], Hp1: [90, 104], Hp2: [110, 104], K1: [86, 124], K2: [114, 124], A1: [86, 150], A2: [114, 150], E1: [90, 70], W1: [97, 74], E2: [110, 70], W2: [103, 74] },
    b: { E1: [72, 86], W1: [96, 84], E2: [128, 86], W2: [104, 84] } },
  "remo-frente-barra-ancha": { vista: "frente", carga: "W", barra: true, props: [[70, 108, 130, 108]],
    a: { H: [100, 40], S1: [84, 60], S2: [116, 60], Hp1: [90, 104], Hp2: [110, 104], K1: [86, 124], K2: [114, 124], A1: [86, 150], A2: [114, 150], E1: [76, 70], W1: [66, 74], E2: [124, 70], W2: [134, 74] },
    b: { E1: [54, 74], W1: [64, 80], E2: [146, 74], W2: [136, 80] } },
  "remo-frente-neutro": { vista: "frente", carga: "W", props: [[70, 108, 130, 108]],
    a: { H: [100, 40], S1: [84, 60], S2: [116, 60], Hp1: [90, 104], Hp2: [110, 104], K1: [86, 124], K2: [114, 124], A1: [86, 150], A2: [114, 150], E1: [86, 70], W1: [84, 74], E2: [114, 70], W2: [116, 74] },
    b: { E1: [70, 88], W1: [84, 84], E2: [130, 88], W2: [116, 84] } },
  "remo-frente-abierto": { vista: "frente", carga: "W", props: [[70, 108, 130, 108]],
    a: { H: [100, 40], S1: [84, 60], S2: [116, 60], Hp1: [90, 104], Hp2: [110, 104], K1: [86, 124], K2: [114, 124], A1: [86, 150], A2: [114, 150], E1: [78, 68], W1: [70, 72], E2: [122, 68], W2: [130, 72] },
    b: { E1: [54, 72], W1: [68, 76], E2: [146, 72], W2: [132, 76] } },
  "remo-frente-una-mano": { vista: "frente", carga: "W", unaMano: true, props: [[70, 108, 130, 108]],
    a: { H: [100, 40], S1: [84, 60], S2: [116, 60], Hp1: [90, 104], Hp2: [110, 104], K1: [86, 124], K2: [114, 124], A1: [86, 150], A2: [114, 150], E1: [88, 70], W1: [92, 74], E2: [122, 84], W2: [118, 104] },
    b: { E1: [70, 86], W1: [88, 84] } },
  // Extensiones de tríceps en polea vistas de frente: codos pegados, cambia la anchura y el accesorio
  "ext-frente-recta": { vista: "frente", carga: "W", barra: true, cable: [100, 0], props: [],
    a: { H: [100, 22], S1: [86, 40], S2: [114, 40], Hp1: [92, 86], Hp2: [108, 86], K1: [92, 118], K2: [108, 118], A1: [92, 150], A2: [108, 150], E1: [84, 64], W1: [88, 50], E2: [116, 64], W2: [112, 50] },
    b: { W1: [86, 90], W2: [114, 90] } },
  "ext-frente-v": { vista: "frente", carga: "W", barra: true, cable: [100, 0], props: [],
    a: { H: [100, 22], S1: [86, 40], S2: [114, 40], Hp1: [92, 86], Hp2: [108, 86], K1: [92, 118], K2: [108, 118], A1: [92, 150], A2: [108, 150], E1: [84, 64], W1: [93, 50], E2: [116, 64], W2: [107, 50] },
    b: { W1: [91, 90], W2: [109, 90] } },
  "ext-frente-cuerda": { vista: "frente", carga: "W", cuerda: true, cable: [100, 0], props: [],
    a: { H: [100, 22], S1: [86, 40], S2: [114, 40], Hp1: [92, 86], Hp2: [108, 86], K1: [92, 118], K2: [108, 118], A1: [92, 150], A2: [108, 150], E1: [84, 64], W1: [96, 50], E2: [116, 64], W2: [104, 50] },
    b: { W1: [78, 92], W2: [122, 92] } },
  "ext-frente-una-mano": { vista: "frente", carga: "W", unaMano: true, cable: [100, 0], props: [],
    a: { H: [100, 22], S1: [86, 40], S2: [114, 40], Hp1: [92, 86], Hp2: [108, 86], K1: [92, 118], K2: [108, 118], A1: [92, 150], A2: [108, 150], E1: [84, 64], W1: [90, 50], E2: [118, 64], W2: [118, 88] },
    b: { W1: [86, 90] } },
  "ext-frente-inversa": { vista: "frente", carga: "W", barra: true, cable: [100, 0], props: [],
    a: { H: [100, 22], S1: [86, 40], S2: [114, 40], Hp1: [92, 86], Hp2: [108, 86], K1: [92, 118], K2: [108, 118], A1: [92, 150], A2: [108, 150], E1: [84, 64], W1: [86, 54], E2: [116, 64], W2: [114, 54] },
    b: { W1: [85, 90], W2: [115, 90] } },
  // Jalones vistos de frente: cada agarre con su anchura de manos
  "jalon-frente-abierto": { vista: "frente", carga: "W", cable: [100, 0], barra: true, props: [[70, 108, 130, 108], [74, 114, 126, 114]],
    a: { H: [100, 40], S1: [84, 60], S2: [116, 60], Hp1: [90, 104], Hp2: [110, 104], K1: [86, 124], K2: [114, 124], A1: [86, 150], A2: [114, 150], E1: [62, 34], W1: [48, 8], E2: [138, 34], W2: [152, 8] },
    b: { E1: [60, 84], W1: [54, 58], E2: [140, 84], W2: [146, 58] } },
  "jalon-frente-cerrado": { vista: "frente", carga: "W", cable: [100, 0], barra: true, props: [[70, 108, 130, 108], [74, 114, 126, 114]],
    a: { H: [100, 40], S1: [84, 60], S2: [116, 60], Hp1: [90, 104], Hp2: [110, 104], K1: [86, 124], K2: [114, 124], A1: [86, 150], A2: [114, 150], E1: [80, 32], W1: [84, 6], E2: [120, 32], W2: [116, 6] },
    b: { E1: [70, 86], W1: [84, 62], E2: [130, 86], W2: [116, 62] } },
  "jalon-frente-supino": { vista: "frente", carga: "W", cable: [100, 0], barra: true, props: [[70, 108, 130, 108], [74, 114, 126, 114]],
    a: { H: [100, 40], S1: [84, 60], S2: [116, 60], Hp1: [90, 104], Hp2: [110, 104], K1: [86, 124], K2: [114, 124], A1: [86, 150], A2: [114, 150], E1: [82, 32], W1: [88, 6], E2: [118, 32], W2: [112, 6] },
    b: { E1: [74, 88], W1: [88, 66], E2: [126, 88], W2: [112, 66] } },
  "jalon-frente-triangulo": { vista: "frente", carga: "W", cable: [100, 0], barra: true, props: [[70, 108, 130, 108], [74, 114, 126, 114]],
    a: { H: [100, 40], S1: [84, 60], S2: [116, 60], Hp1: [90, 104], Hp2: [110, 104], K1: [86, 124], K2: [114, 124], A1: [86, 150], A2: [114, 150], E1: [86, 32], W1: [96, 6], E2: [114, 32], W2: [104, 6] },
    b: { E1: [76, 88], W1: [96, 64], E2: [124, 88], W2: [104, 64] } },
  "jalon-frente-neutro-ancho": { vista: "frente", carga: "W", cable: [100, 0], barra: true, props: [[70, 108, 130, 108], [74, 114, 126, 114]],
    a: { H: [100, 40], S1: [84, 60], S2: [116, 60], Hp1: [90, 104], Hp2: [110, 104], K1: [86, 124], K2: [114, 124], A1: [86, 150], A2: [114, 150], E1: [70, 34], W1: [64, 8], E2: [130, 34], W2: [136, 8] },
    b: { E1: [64, 86], W1: [66, 60], E2: [136, 86], W2: [134, 60] } },
  "jalon-frente-cuerda": { vista: "frente", carga: "W", cable: [100, 0], cuerda: true, props: [[70, 108, 130, 108], [74, 114, 126, 114]],
    a: { H: [100, 40], S1: [84, 60], S2: [116, 60], Hp1: [90, 104], Hp2: [110, 104], K1: [86, 124], K2: [114, 124], A1: [86, 150], A2: [114, 150], E1: [86, 32], W1: [96, 8], E2: [114, 32], W2: [104, 8] },
    b: { E1: [66, 86], W1: [78, 64], E2: [134, 86], W2: [122, 64] } },
  "jalon-frente-una-mano": { vista: "frente", carga: "W", cable: [100, 0], unaMano: true, props: [[70, 108, 130, 108], [74, 114, 126, 114]],
    a: { H: [100, 40], S1: [84, 60], S2: [116, 60], Hp1: [90, 104], Hp2: [110, 104], K1: [86, 124], K2: [114, 124], A1: [86, 150], A2: [114, 150], E1: [80, 32], W1: [90, 6], E2: [122, 82], W2: [118, 104] },
    b: { E1: [72, 88], W1: [86, 62] } },
  "jalon": { vista: "lado", carga: "W", cable: [100, 0], props: [[80, 106, 112, 106], [96, 106, 96, 150]],
    a: { H: [96, 46], S: [96, 59], E: [98, 31], W: [100, 6], Hp: [96, 104], K: [128, 106], A: [130, 150], T: [142, 150] },
    b: { H: [94, 46], S: [96, 59], E: [84, 80], W: [100, 60], Hp: [96, 104], K: [128, 106], A: [130, 150], T: [142, 150] } },
  "remo": { vista: "lado", carga: "W", cable: [170, 66], props: [[70, 106, 110, 106], [90, 106, 90, 150]],
    a: { H: [98, 47], S: [94, 60], E: [118, 62], W: [144, 64], Hp: [90, 104], K: [122, 92], A: [152, 104], T: [156, 94] },
    b: { H: [90, 46], S: [92, 59], E: [70, 72], W: [92, 76], Hp: [90, 104], K: [122, 92], A: [152, 104], T: [156, 94] } },
  "remo-inclinado": { vista: "lado", carga: "W",
    a: { H: [134, 46], S: [122, 52], E: [122, 78], W: [122, 104], Hp: [82, 76], K: [92, 112], A: [100, 150], T: [112, 150] },
    b: { H: [134, 46], S: [122, 52], E: [100, 58], W: [104, 84], Hp: [82, 76], K: [92, 112], A: [100, 150], T: [112, 150] } },
  "curl": { vista: "lado", carga: "W",
    a: { H: [100, 16], S: [100, 29], E: [100, 57], W: [102, 83], Hp: [100, 74], K: [100, 112], A: [100, 150], T: [112, 150] },
    b: { H: [100, 16], S: [100, 29], E: [100, 57], W: [118, 38], Hp: [100, 74], K: [100, 112], A: [100, 150], T: [112, 150] } },
  "extension-triceps": { vista: "lado", carga: "W", cable: [126, 0],
    a: { H: [104, 17], S: [102, 30], E: [102, 58], W: [124, 44], Hp: [98, 75], K: [100, 112], A: [100, 150], T: [112, 150] },
    b: { H: [104, 17], S: [102, 30], E: [102, 58], W: [106, 84], Hp: [98, 75], K: [100, 112], A: [100, 150], T: [112, 150] } },
  "press-frances": { vista: "lado", carga: "W", props: [[36, 104, 120, 104], [44, 104, 44, 150], [110, 104, 110, 150]],
    a: { H: [48, 94], S: [62, 100], E: [66, 74], W: [66, 48], Hp: [108, 100], K: [132, 108], A: [136, 150], T: [148, 150] },
    b: { H: [48, 94], S: [62, 100], E: [66, 74], W: [44, 84], Hp: [108, 100], K: [132, 108], A: [136, 150], T: [148, 150] } },
  "extension-nuca": { vista: "lado", carga: "W", props: [[80, 106, 112, 106], [96, 106, 96, 150]],
    a: { H: [98, 46], S: [96, 59], E: [96, 31], W: [96, 5], Hp: [96, 104], K: [128, 106], A: [130, 150], T: [142, 150] },
    b: { H: [100, 46], S: [96, 59], E: [96, 31], W: [80, 52], Hp: [96, 104], K: [128, 106], A: [130, 150], T: [142, 150] } },
  "muneca": { vista: "lado", carga: "M", props: [[60, 104, 130, 104], [70, 104, 70, 150], [120, 104, 120, 150]],
    a: { H: [62, 52], S: [64, 66], E: [90, 98], W: [118, 98], M: [128, 106], Hp: [60, 104], K: [40, 110], A: [40, 150], T: [52, 150] },
    b: { H: [62, 52], S: [64, 66], E: [90, 98], W: [118, 98], M: [126, 88], Hp: [60, 104], K: [40, 110], A: [40, 150], T: [52, 150] } },
  "extension-rodilla": { vista: "lado", props: [[76, 106, 114, 106], [92, 106, 92, 150], [80, 106, 80, 52]],
    a: { H: [92, 46], S: [92, 59], E: [98, 84], W: [106, 104], Hp: [92, 104], K: [124, 104], A: [126, 142], T: [136, 148] },
    b: { H: [92, 46], S: [92, 59], E: [98, 84], W: [106, 104], Hp: [92, 104], K: [124, 104], A: [160, 98], T: [166, 88] } },
  "curl-femoral": { vista: "lado", props: [[40, 104, 170, 104], [50, 104, 50, 150], [160, 104, 160, 150]],
    a: { H: [158, 94], S: [144, 98], E: [158, 114], W: [168, 104], Hp: [98, 100], K: [62, 100], A: [26, 100], T: [20, 92] },
    b: { H: [158, 94], S: [144, 98], E: [158, 114], W: [168, 104], Hp: [98, 100], K: [62, 100], A: [56, 64], T: [66, 58] } },
  "gemelo": { vista: "lado", carga: "S",
    a: { H: [100, 16], S: [100, 29], E: [100, 57], W: [100, 83], Hp: [100, 74], K: [100, 112], A: [100, 146], T: [114, 150] },
    b: { H: [100, 4], S: [100, 17], E: [100, 45], W: [100, 71], Hp: [100, 62], K: [100, 100], A: [101, 134], T: [114, 150] } },
  "gemelo-sentado": { vista: "lado", props: [[60, 106, 92, 106], [76, 106, 76, 150]],
    a: { H: [80, 46], S: [80, 59], E: [96, 80], W: [112, 98], Hp: [80, 104], K: [114, 104], A: [114, 142], T: [128, 146] },
    b: { H: [80, 44], S: [80, 57], E: [96, 74], W: [112, 88], Hp: [80, 102], K: [114, 94], A: [114, 132], T: [128, 146] } },
  "crunch": { vista: "lado", cable: [100, 0],
    a: { H: [100, 52], S: [100, 65], E: [112, 52], W: [104, 46], Hp: [100, 110], K: [100, 148], A: [70, 148], T: [62, 150] },
    b: { H: [150, 108], S: [140, 96], E: [150, 80], W: [146, 94], Hp: [100, 110], K: [100, 148], A: [70, 148], T: [62, 150] } },
  "dominada": { vista: "lado", props: [[60, 12, 140, 12]],
    a: { H: [104, 52], S: [100, 64], E: [100, 38], W: [100, 12], Hp: [100, 108], K: [100, 138], A: [90, 158], T: [96, 160] },
    b: { H: [104, 22], S: [100, 34], E: [86, 24], W: [100, 12], Hp: [100, 78], K: [100, 108], A: [90, 128], T: [96, 130] } },
  "fondos": { vista: "lado", props: [[70, 84, 130, 84], [76, 84, 76, 150], [124, 84, 124, 150]],
    a: { H: [102, 18], S: [100, 30], E: [100, 56], W: [100, 82], Hp: [96, 76], K: [92, 110], A: [108, 128], T: [112, 120] },
    b: { H: [104, 48], S: [98, 62], E: [78, 74], W: [100, 82], Hp: [92, 104], K: [88, 138], A: [104, 152], T: [108, 144] } },
  "flexion": { vista: "lado",
    a: { H: [156, 100], S: [142, 106], E: [142, 128], W: [142, 150], Hp: [98, 122], K: [64, 134], A: [30, 146], T: [24, 150] },
    b: { H: [156, 130], S: [142, 134], E: [124, 142], W: [142, 150], Hp: [98, 140], K: [64, 144], A: [30, 148], T: [24, 150] } },
  "elevacion-piernas": { vista: "lado", props: [[60, 12, 140, 12]],
    a: { H: [104, 48], S: [100, 60], E: [100, 36], W: [100, 12], Hp: [100, 104], K: [100, 132], A: [100, 158], T: [108, 158] },
    b: { H: [104, 48], S: [100, 60], E: [100, 36], W: [100, 12], Hp: [100, 104], K: [132, 100], A: [150, 126], T: [158, 120] } },
  "rueda": { vista: "lado", carga: "W",
    a: { H: [122, 94], S: [112, 104], E: [114, 125], W: [116, 146], Hp: [74, 114], K: [60, 146], A: [34, 148], T: [28, 150] },
    b: { H: [152, 124], S: [140, 128], E: [158, 138], W: [176, 146], Hp: [94, 128], K: [60, 146], A: [34, 148], T: [28, 150] } },
  "patada": { vista: "lado", cable: [40, 150], cableJ: "A2",
    a: { H: [108, 20], S: [104, 32], E: [120, 52], W: [134, 60], Hp: [98, 76], K: [100, 112], A: [100, 150], T: [112, 150], K2: [100, 112], A2: [98, 148], T2: [110, 150] },
    b: { H: [110, 24], S: [106, 36], E: [122, 56], W: [134, 60], Hp: [98, 78], K: [100, 112], A: [100, 150], T: [112, 150], K2: [66, 96], A2: [40, 108], T2: [34, 98] } },
  "lumbar": { vista: "lado", props: [[90, 106, 110, 96], [100, 101, 100, 150]],
    a: { H: [120, 152], S: [114, 142], E: [108, 128], W: [116, 122], Hp: [100, 100], K: [66, 118], A: [36, 134], T: [30, 146] },
    b: { H: [150, 74], S: [138, 80], E: [128, 92], W: [136, 86], Hp: [100, 100], K: [66, 118], A: [36, 134], T: [30, 146] } },
  "elevacion-lateral": { vista: "frente", carga: "W",
    a: { H: [100, 22], S1: [86, 40], S2: [114, 40], E1: [82, 64], W1: [82, 88], E2: [118, 64], W2: [118, 88], Hp1: [92, 86], Hp2: [108, 86], K1: [92, 118], K2: [108, 118], A1: [92, 150], A2: [108, 150] },
    b: { E1: [60, 42], W1: [36, 44], E2: [140, 42], W2: [164, 44] } },
  "aperturas": { vista: "frente", carga: "W",
    a: { H: [100, 22], S1: [86, 40], S2: [114, 40], E1: [62, 46], W1: [40, 52], E2: [138, 46], W2: [160, 52], Hp1: [92, 86], Hp2: [108, 86], K1: [92, 118], K2: [108, 118], A1: [92, 150], A2: [108, 150] },
    b: { E1: [80, 52], W1: [96, 58], E2: [120, 52], W2: [104, 58] } },
  "abduccion": { vista: "frente", props: [[70, 104, 130, 104]],
    a: { H: [100, 30], S1: [84, 52], S2: [116, 52], E1: [80, 78], W1: [84, 100], E2: [120, 78], W2: [116, 100], Hp1: [90, 100], Hp2: [110, 100], K1: [94, 118], K2: [106, 118], A1: [94, 150], A2: [106, 150] },
    b: { K1: [74, 116], K2: [126, 116], A1: [80, 150], A2: [120, 150] } },
  // Ampliación 2.5
  "encogimiento": { vista: "frente", carga: "W",
    a: { H: [100, 22], S1: [86, 40], S2: [114, 40], E1: [84, 64], W1: [84, 90], E2: [116, 64], W2: [116, 90], Hp1: [92, 86], Hp2: [108, 86], K1: [92, 118], K2: [108, 118], A1: [92, 150], A2: [108, 150] },
    b: { S1: [86, 32], S2: [114, 32], E1: [84, 56], W1: [84, 82], E2: [116, 56], W2: [116, 82] } },
  "remo-menton": { vista: "frente", carga: "W", cable: [100, 150],
    a: { H: [100, 22], S1: [86, 40], S2: [114, 40], E1: [86, 64], W1: [97, 88], E2: [114, 64], W2: [103, 88], Hp1: [92, 86], Hp2: [108, 86], K1: [92, 118], K2: [108, 118], A1: [92, 150], A2: [108, 150] },
    b: { E1: [64, 38], W1: [95, 46], E2: [136, 38], W2: [105, 46] } },
  "elevacion-frontal": { vista: "lado", carga: "W", cable: [80, 150],
    a: { H: [100, 16], S: [100, 29], E: [102, 56], W: [104, 82], Hp: [100, 74], K: [100, 112], A: [100, 150], T: [112, 150] },
    b: { E: [126, 30], W: [152, 26] } },
  "pullover": { vista: "lado", carga: "W", cable: [168, 0],
    a: { H: [102, 18], S: [98, 31], E: [120, 18], W: [142, 8], Hp: [92, 76], K: [96, 112], A: [94, 150], T: [106, 150] },
    b: { E: [108, 58], W: [112, 84] } }
};

// ---------- Fotos reales (dominio público) ----------
// Origen: Free Exercise DB (github.com/yuhonas/free-exercise-db), licencia Unlicense = dominio público.
// Solo se incluyen fotos que muestran el mismo ejercicio y la misma máquina. El resto usa la animación.
// Clave: id del ejercicio en Apix Gym · valor: nombre del ejercicio en Free Exercise DB (para poder rastrear el origen).
const FOTOS = {
  "abductores": "Thigh_Abductor",
  "aductores": "Thigh_Adductor",
  "aperturas-polea": "Cable_Crossover",
  "contractora": "Butterfly",
  "crunch-polea": "Cable_Crunch",
  "curl-barra": "Barbell_Curl",
  "curl-femoral-sentado": "Seated_Leg_Curl",
  "curl-femoral-tumbado": "Lying_Leg_Curls",
  "curl-inverso": "Reverse_Barbell_Curl",
  "curl-mancuernas": "Dumbbell_Bicep_Curl",
  "curl-martillo": "Hammer_Curls",
  "curl-muneca": "Palms-Up_Dumbbell_Wrist_Curl_Over_A_Bench",
  "curl-polea": "Standing_Biceps_Cable_Curl",
  "dominadas": "Pullups",
  "elevacion-piernas": "Hanging_Leg_Raise",
  "elevaciones-laterales": "Side_Lateral_Raise",
  "elevaciones-polea": "Standing_Low-Pulley_Deltoid_Raise",
  "extension-cuadriceps": "Leg_Extensions",
  "extension-nuca": "Standing_Dumbbell_Triceps_Extension",
  "extension-polea": "Triceps_Pushdown",
  "extension-polea-v": "Triceps_Pushdown_-_V-Bar_Attachment",
  "extension-una-mano-polea": "Cable_One_Arm_Tricep_Extension",
  "face-pull": "Face_Pull",
  "flexiones": "Pushups",
  "fondos": "Dips_-_Chest_Version",
  "gemelo-sentado": "Seated_Calf_Raise",
  "gemelos-mancuerna": "Standing_Dumbbell_Calf_Raise",
  "gemelos-maquina": "Standing_Calf_Raises",
  "hack": "Hack_Squat",
  "hip-thrust": "Barbell_Hip_Thrust",
  "hiperextensiones": "Hyperextensions_Back_Extensions",
  "jalon": "Wide-Grip_Lat_Pulldown",
  "pajaros-maquina": "Reverse_Machine_Flyes",
  "peso-muerto": "Barbell_Deadlift",
  "peso-muerto-rumano": "Romanian_Deadlift",
  "prensa": "Leg_Press",
  "press-banca": "Barbell_Bench_Press_-_Medium_Grip",
  "press-frances": "EZ-Bar_Skullcrusher",
  "press-hombro-mancuernas": "Seated_Dumbbell_Press",
  "press-hombro-maquina": "Leverage_Shoulder_Press",
  "press-inclinado-mancuernas": "Incline_Dumbbell_Press",
  "press-inclinado-multipower": "Smith_Machine_Incline_Bench_Press",
  "press-maquina": "Machine_Bench_Press",
  "press-militar": "Standing_Military_Press",
  "remo-barra": "Bent_Over_Barbell_Row",
  "remo-mancuerna": "One-Arm_Dumbbell_Row",
  "remo-pecho-apoyado": "Lying_T-Bar_Row",
  "remo-polea": "Seated_Cable_Rows",
  "rueda-abdominal": "Ab_Roller",
  "sentadilla": "Barbell_Full_Squat",
  "sentadilla-goblet": "Goblet_Squat",
  "sentadilla-multipower": "Smith_Machine_Squat",
  "triceps-maquina": "Machine_Triceps_Extension",
  "zancadas": "Dumbbell_Lunges",
  // Ampliación 2.5
  "patada-gluteo": "One-Legged_Cable_Kickback",
  "remo-maquina": "Leverage_Iso_Row",
  "curl-maquina": "Machine_Bicep_Curl",
  "sentadilla-bulgara": "Split_Squat_with_Dumbbells",
  "dominadas-asistidas": "IA",   // imágenes generadas por IA
  "fondos-asistidos": "IA",   // imágenes generadas por IA
  "hip-thrust-maquina": "IA",   // imágenes generadas por IA
  "press-banca-multipower": "Smith_Machine_Bench_Press",
  "press-inclinado-maquina": "Leverage_Incline_Chest_Press",
  "press-declinado-maquina": "Leverage_Decline_Chest_Press",
  "press-inclinado-barra": "Barbell_Incline_Bench_Press_-_Medium_Grip",
  "aperturas-mancuernas": "Dumbbell_Flyes",
  "aperturas-polea-baja": "Low_Cable_Crossover",
  "press-pecho-polea": "Cable_Chest_Press",
  "jalon-estrecho": "V-Bar_Pulldown",
  "jalon-cerrado": "Close-Grip_Front_Lat_Pulldown",
  "jalon-supino": "Underhand_Cable_Pulldowns",
  "jalon-una-mano": "One_Arm_Lat_Pulldown",
  "jalon-neutro-ancho": "IA",   // imágenes generadas por IA
  "jalon-cuerda": "IA",   // imágenes generadas por IA
  "sentadilla-frontal": "Front_Barbell_Squat",
  "peso-muerto-sumo": "Sumo_Deadlift",
  "encogimientos-barra": "Barbell_Shrug",
  "remo-menton-barra": "Upright_Barbell_Row",
  "lenador-polea": "Standing_Cable_Wood_Chop",
  "pallof-press": "Pallof_Press",
  "remo-invertido": "Inverted_Row",
  "pullover-polea": "Straight-Arm_Pulldown",
  "remo-alto-maquina": "Leverage_High_Row",
  "remo-polea-una-mano": "Seated_One-arm_Cable_Pulley_Rows",
  "remo-multipower": "Smith_Machine_Bent_Over_Row",
  "dominadas-supinas": "Chin-Up",
  "dominadas-neutras": "V-Bar_Pullup",
  "remo-barra-supino": "IA",   // imágenes generadas por IA (la foto del agarre es de Free Exercise DB)
  "remo-polea-barra-ancha": "IA",   // imágenes generadas por IA
  "remo-maquina-abierto": "IA",   // imágenes generadas por IA
  "press-banca-cerrado": "Close-Grip_Barbell_Bench_Press",
  "encogimientos-mancuernas": "Dumbbell_Shrug",
  "encogimientos-maquina": "Leverage_Shrug",
  "press-hombro-multipower": "Smith_Machine_Overhead_Shoulder_Press",
  "press-arnold": "Arnold_Dumbbell_Press",
  "elevaciones-frontales-polea": "Front_Cable_Raise",
  "pajaros-polea": "Cable_Rear_Delt_Fly",
  "pajaros-mancuernas": "Seated_Bent-Over_Rear_Delt_Raise",
  "remo-menton-polea": "Upright_Cable_Row",
  "curl-barra-z": "EZ-Bar_Curl",
  "curl-predicador": "Preacher_Curl",
  "curl-concentrado": "Concentration_Curls",
  "press-plano-mancuernas": "Dumbbell_Bench_Press",
  "press-declinado-barra": "Decline_Barbell_Bench_Press",
  "press-declinado-mancuernas": "Decline_Dumbbell_Bench_Press",
  "press-declinado-multipower": "Smith_Machine_Decline_Press",
  "aperturas-inclinadas": "Incline_Dumbbell_Flyes",
  "aperturas-declinadas": "Decline_Dumbbell_Flyes",
  "pullover-mancuerna": "Straight-Arm_Dumbbell_Pullover",
  "elevaciones-frontales": "Front_Dumbbell_Raise",
  "elevaciones-laterales-sentado": "Seated_Side_Lateral_Raise",
  "elevaciones-maquina": "IA",   // imágenes generadas por IA (no son de Free Exercise DB)
  "elevacion-lateral-inclinada": "One-Arm_Incline_Lateral_Raise",
  "pajaros-banco-inclinado": "Dumbbell_Lying_Rear_Lateral_Raise",
  "patada-triceps": "Tricep_Dumbbell_Kickback",
  "press-frances-mancuernas": "Lying_Dumbbell_Tricep_Extension",
  "press-frances-inclinado": "Incline_Barbell_Triceps_Extension",
  "remo-mancuernas-inclinado": "Dumbbell_Incline_Row",
  "crunch-declinado": "Decline_Crunch",
  "crunch-inverso-declinado": "Decline_Reverse_Crunch",
  "elevacion-piernas-banco": "Flat_Bench_Lying_Leg_Raise",
  "curl-inclinado": "Incline_Dumbbell_Curl",
  "curl-martillo-inclinado": "Incline_Hammer_Curls",
  "curl-arana": "Dumbbell_Prone_Incline_Curl",
  "curl-predicador-mancuerna": "One_Arm_Dumbbell_Preacher_Curl",
  "curl-predicador-maquina": "Machine_Preacher_Curls",
  "curl-predicador-polea": "Cable_Preacher_Curl",
  "curl-sentado-mancuernas": "Seated_Dumbbell_Curl",
  "curl-zottman": "Zottman_Curl",
  "curl-tumbado-polea": "Lying_Close-Grip_Bar_Curl_On_High_Pulley",
  "curl-martillo-cruzado": "Cross_Body_Hammer_Curl",
  "curl-martillo-cuerda": "Cable_Hammer_Curls_-_Rope_Attachment",
  "extension-cuerda": "Triceps_Pushdown_-_Rope_Attachment",
  "extension-cuerda-nuca": "Cable_Rope_Overhead_Triceps_Extension",
  "extension-inversa-polea": "Reverse_Grip_Triceps_Pushdown",
  "press-cerrado-multipower": "Smith_Machine_Close-Grip_Bench_Press",
  "fondos-banco": "Bench_Dips",
  "curl-muneca-polea": "Cable_Wrist_Curl",
  "crunch-maquina": "Ab_Crunch_Machine",
  "crunch": "Crunches",
  "crunch-polea-pie": "Standing_Rope_Crunch",
  "extension-una-pierna": "Single-Leg_Leg_Extension",
  "zancadas-caminando": "Barbell_Walking_Lunge",
  "step-up": "Dumbbell_Step_Ups",
  "zancada-multipower": "Smith_Single-Leg_Split_Squat",
  "curl-femoral-de-pie": "Standing_Leg_Curl",
  "peso-muerto-rigidas-multipower": "Smith_Machine_Stiff-Legged_Deadlift",
  "buenos-dias": "Good_Morning",
  "pull-through": "Pull_Through",
  "puente-gluteo": "Barbell_Glute_Bridge",
  "gemelos-prensa": "Calf_Press_On_The_Leg_Press_Machine",
  "gemelos-multipower": "Smith_Machine_Calf_Raise",
  "aductor-polea": "Cable_Hip_Adduction"
};

// Ejercicios sin foto y por qué (se muestra solo la animación)
const SIN_FOTO = {};

// Fotos de referencia: muestran el MISMO movimiento hecho con otro material.
// Se avisa debajo de la foto para que nadie se confunda de máquina.
const FOTO_REFERENCIA = {};

// Banco que usa cada ejercicio y su inclinación (cambia mucho qué parte del músculo trabaja).
// [lo que se muestra, explicación corta]
const BANCO = {
  "press-banca": ["Banco plano", ""],
  "press-banca-multipower": ["Banco plano", ""],
  "press-banca-cerrado": ["Banco plano", ""],
  "press-plano-mancuernas": ["Banco plano", ""],
  "aperturas-mancuernas": ["Banco plano", ""],
  "press-inclinado-mancuernas": ["Banco inclinado a 30°", "A 30° trabajas más el pecho alto. Si lo subes a 45° o más, trabaja más el hombro."],
  "press-inclinado-barra": ["Banco inclinado a 30°", "A 30° trabajas más el pecho alto. Si lo subes a 45° o más, trabaja más el hombro."],
  "press-inclinado-multipower": ["Banco inclinado a 30°", "A 30° trabajas más el pecho alto. Si lo subes a 45° o más, trabaja más el hombro."],
  "aperturas-inclinadas": ["Banco inclinado a 30°", "A 30° trabajas más el pecho alto sin cargar tanto el hombro."],
  "press-declinado-barra": ["Banco declinado a 15-30°", "El declinado trabaja más el pecho bajo. Sujeta bien los pies en los rodillos."],
  "press-declinado-mancuernas": ["Banco declinado a 15-30°", "El declinado trabaja más el pecho bajo. Sujeta bien los pies en los rodillos."],
  "press-declinado-multipower": ["Banco declinado a 15-30°", "El declinado trabaja más el pecho bajo. Sujeta bien los pies en los rodillos."],
  "aperturas-declinadas": ["Banco declinado a 15-30°", "El declinado trabaja más el pecho bajo. Sujeta bien los pies en los rodillos."],
  "pullover-mancuerna": ["Banco plano, tumbado de través", "Apoya solo la parte alta de la espalda y deja la cadera baja."],
  "press-hombro-mancuernas": ["Banco con respaldo casi vertical (75-90°)", "Con el respaldo vertical trabajas el hombro delantero. Un poco inclinado (75°) es más cómodo para la espalda."],
  "press-arnold": ["Banco con respaldo casi vertical (75-90°)", "Con el respaldo vertical trabajas el hombro delantero. Un poco inclinado (75°) es más cómodo para la espalda."],
  "elevaciones-laterales-sentado": ["Banco plano o con respaldo vertical", ""],
  "elevacion-lateral-inclinada": ["Banco inclinado a 30-45°, tumbado de lado", "Así el hombro trabaja también en la parte baja del movimiento."],
  "pajaros-banco-inclinado": ["Banco inclinado a 30-45°, boca abajo", "Con menos inclinación el recorrido es mayor y trabajas más la espalda alta."],
  "remo-mancuernas-inclinado": ["Banco inclinado a 30-45°, boca abajo", "Con menos inclinación el recorrido es mayor y trabajas más la espalda alta."],
  "curl-arana": ["Banco inclinado a 30-45°, boca abajo", "Los brazos cuelgan en vertical: el bíceps trabaja más arriba del todo."],
  "curl-inclinado": ["Banco inclinado a 45-60°", "Cuanto más tumbado, más estiras el bíceps. Si te molesta el hombro, súbelo un poco."],
  "curl-martillo-inclinado": ["Banco inclinado a 45-60°", "Cuanto más tumbado, más estiras el bíceps. Si te molesta el hombro, súbelo un poco."],
  "curl-sentado-mancuernas": ["Banco plano", ""],
  "curl-concentrado": ["Banco plano", ""],
  "curl-tumbado-polea": ["Banco plano", ""],
  "curl-predicador": ["Banco Scott (predicador)", "Las axilas, justo sobre el borde del apoyo."],
  "curl-predicador-mancuerna": ["Banco Scott (predicador)", "Las axilas, justo sobre el borde del apoyo."],
  "curl-predicador-polea": ["Banco Scott (predicador)", "Las axilas, justo sobre el borde del apoyo."],
  "press-frances": ["Banco plano", ""],
  "press-frances-mancuernas": ["Banco plano", ""],
  "press-frances-inclinado": ["Banco inclinado a 30-45°", "Inclinado estira más la cabeza larga del tríceps que en plano."],
  "extension-nuca": ["De pie o en banco con respaldo vertical", "Sentado con respaldo te cuesta menos no arquear la espalda."],
  "patada-triceps": ["Banco plano (para apoyarte)", ""],
  "remo-mancuerna": ["Banco plano (para apoyarte)", ""],
  "fondos-banco": ["Banco plano", ""],
  "crunch-declinado": ["Banco declinado", "Cuanto más declinado, más difícil. Empieza con poca inclinación."],
  "crunch-inverso-declinado": ["Banco declinado", "Cuanto más declinado, más difícil. Empieza con poca inclinación."],
  "elevacion-piernas-banco": ["Banco plano", ""],
  "hip-thrust": ["Banco plano (apoyo de espalda)", "El borde del banco, a la altura de las escápulas."],
  "sentadilla-bulgara": ["Banco plano (pie de atrás)", "Mejor un banco a la altura de la rodilla."],
  "step-up": ["Banco a la altura de la rodilla", "Más alto trabaja más el glúteo; más bajo es más fácil."],
  "hiperextensiones": ["Banco de hiperextensiones a 45°", ""]
};

// Agarre de cada ejercicio, dibujado de frente (desde los ojos de quien entrena).
// Las líneas discontinuas marcan la anchura de los hombros.
const TIPOS_AGARRE = {
  "abierto":   { nombre: "Agarre abierto", texto: "Coges la barra por encima (ves tus nudillos), con las manos bastante más abiertas que los hombros.", forma: "barra", manos: 118, palma: false },
  "prono":     { nombre: "Agarre prono", texto: "Coges la barra por encima (ves tus nudillos), con las manos un poco más abiertas que los hombros.", forma: "barra", manos: 84, palma: false },
  "cerrado":   { nombre: "Agarre cerrado", texto: "Coges la barra por encima (ves tus nudillos), con las manos a la anchura de los hombros o algo menos.", forma: "barra", manos: 52, palma: false },
  "supino":    { nombre: "Agarre supino", texto: "Coges la barra por debajo (ves tus palmas), con las manos a la anchura de los hombros.", forma: "barra", manos: 68, palma: true },
  "barra-z":   { nombre: "Barra Z", texto: "Coges la barra por debajo, en la parte inclinada: la muñeca queda más cómoda.", forma: "z", manos: 60, palma: true },
  "neutro":    { nombre: "Agarre neutro", texto: "Las palmas se miran entre sí, a la anchura de los hombros.", forma: "asas", manos: 68, palma: null },
  "triangulo": { nombre: "Triángulo", texto: "Las palmas se miran entre sí y las manos van casi juntas.", forma: "triangulo", manos: 16, palma: null },
  "barra-v":   { nombre: "Barra en V", texto: "Coges la barra en V por encima, con las manos juntas y las palmas mirando un poco hacia abajo.", forma: "v", manos: 34, palma: false },
  "neutro-ancho": { nombre: "Agarre neutro ancho", texto: "Coges las asas paralelas de una barra ancha: las palmas se miran entre sí y las manos van más abiertas que los hombros.", forma: "asas", manos: 104, palma: null },
  "cuerda":    { nombre: "Cuerda", texto: "Las palmas se miran entre sí, una mano a cada lado de la cuerda.", forma: "cuerda", manos: 22, palma: null }
};
const AGARRE = {
  "jalon": "abierto", "jalon-estrecho": "triangulo", "jalon-cerrado": "cerrado", "jalon-supino": "supino",
  "jalon-neutro-ancho": "neutro-ancho", "jalon-cuerda": "cuerda",
  "encogimientos-barra": "prono", "remo-menton-barra": "cerrado", "remo-invertido": "prono",
  "dominadas": "abierto", "dominadas-supinas": "supino", "dominadas-neutras": "neutro", "dominadas-asistidas": "prono",
  "remo-barra": "prono", "remo-barra-supino": "supino", "remo-multipower": "prono",
  "remo-polea": "triangulo", "remo-polea-barra-ancha": "abierto",
  "remo-maquina": "neutro", "remo-maquina-abierto": "abierto", "remo-pecho-apoyado": "neutro",
  "press-banca": "prono", "press-banca-multipower": "prono", "press-inclinado-barra": "prono", "press-inclinado-multipower": "prono",
  "press-declinado-barra": "prono", "press-declinado-multipower": "prono",
  "press-banca-cerrado": "cerrado", "press-cerrado-multipower": "cerrado", "press-militar": "prono",
  "curl-barra": "supino", "curl-predicador": "supino", "curl-inverso": "cerrado", "curl-barra-z": "barra-z",
  "curl-martillo": "neutro", "curl-martillo-inclinado": "neutro", "curl-martillo-cruzado": "neutro", "curl-martillo-cuerda": "cuerda",
  "extension-polea": "cerrado", "extension-polea-v": "barra-v", "extension-cuerda": "cuerda", "extension-cuerda-nuca": "cuerda", "extension-inversa-polea": "supino",
  "remo-menton-polea": "cerrado", "press-frances": "cerrado"
};

// Dibujo SVG del agarre (texto). Mano por encima = se ven los nudillos; por debajo = se ve la palma.
function agarreSVG(id) {
  const t = TIPOS_AGARRE[AGARRE[id]];
  if (!t) return "";
  const cx = 160, y = 46, d = t.manos;
  let s = '<svg viewBox="0 0 320 100" width="100%" role="img" aria-label="' + t.nombre + '" style="max-width:340px;display:block;margin:4px auto">';
  // Anchura de los hombros
  s += '<line x1="' + (cx - 66) + '" y1="8" x2="' + (cx - 66) + '" y2="84" stroke="currentColor" stroke-opacity=".35" stroke-dasharray="4 4"/>' +
       '<line x1="' + (cx + 66) + '" y1="8" x2="' + (cx + 66) + '" y2="84" stroke="currentColor" stroke-opacity=".35" stroke-dasharray="4 4"/>';
  // La barra o el asa
  const gris = 'stroke="#9aa0b4" stroke-linecap="round"';
  if (t.forma === "barra") s += '<line x1="20" y1="' + y + '" x2="300" y2="' + y + '" ' + gris + ' stroke-width="7"/>';
  if (t.forma === "z") s += '<polyline points="40,' + y + ' ' + (cx - d - 28) + ',' + y + ' ' + (cx - d) + ',' + (y - 18) + ' ' + (cx - d + 28) + ',' + y + ' ' + (cx + d - 28) + ',' + y + ' ' + (cx + d) + ',' + (y - 18) + ' ' + (cx + d + 28) + ',' + y + ' 280,' + y + '" fill="none" ' + gris + ' stroke-width="7" stroke-linejoin="round"/>';
  if (t.forma === "asas") s += '<line x1="' + (cx - d) + '" y1="' + (y - 26) + '" x2="' + (cx - d) + '" y2="' + (y + 26) + '" ' + gris + ' stroke-width="7"/>' +
       '<line x1="' + (cx + d) + '" y1="' + (y - 26) + '" x2="' + (cx + d) + '" y2="' + (y + 26) + '" ' + gris + ' stroke-width="7"/>';
  if (t.forma === "triangulo") s += '<polygon points="' + cx + ',6 ' + (cx - 30) + ',' + (y + 26) + ' ' + (cx + 30) + ',' + (y + 26) + '" fill="none" ' + gris + ' stroke-width="6" stroke-linejoin="round"/>';
  if (t.forma === "v") s += '<polyline points="' + (cx - 70) + ',' + (y + 18) + ' ' + cx + ',' + (y - 16) + ' ' + (cx + 70) + ',' + (y + 18) + '" fill="none" ' + gris + ' stroke-width="7" stroke-linejoin="round"/>';
  if (t.forma === "cuerda") s += '<path d="M' + cx + ' 6 L' + (cx - d) + ' ' + (y + 30) + ' M' + cx + ' 6 L' + (cx + d) + ' ' + (y + 30) + '" stroke="#c8a46a" stroke-width="7" stroke-linecap="round" fill="none"/>';
  // Las dos manos
  [-1, 1].forEach(function (lado) {
    const x = cx + lado * d;
    if (t.palma === null) {
      // Palmas mirándose: la mano se ve de canto, con el pulgar arriba
      s += '<rect x="' + (x - 9 - lado * 8) + '" y="' + (y - 18) + '" width="18" height="36" rx="8" fill="#e8b48f" stroke="#a8704b" stroke-width="2"/>' +
           '<rect x="' + (x - 4 - lado * 8) + '" y="' + (y - 27) + '" width="8" height="14" rx="4" fill="#e8b48f" stroke="#a8704b" stroke-width="2"/>';
    } else {
      s += '<rect x="' + (x - 17) + '" y="' + (y - 15) + '" width="34" height="30" rx="9" fill="' + (t.palma ? "#f3c9a6" : "#d99a72") + '" stroke="#a8704b" stroke-width="2"/>';
      if (t.palma) s += '<path d="M' + (x - 10) + ' ' + (y + 2) + ' q10 6 20 0" stroke="#a8704b" stroke-width="1.5" fill="none"/>';
      else for (let k = 0; k < 4; k++) s += '<circle cx="' + (x - 11 + k * 7.3) + '" cy="' + (y - 6) + '" r="2.2" fill="#a8704b"/>';
    }
  });
  s += '<text x="' + cx + '" y="97" text-anchor="middle" font-size="10" fill="currentColor" fill-opacity=".6">- - anchura de tus hombros - -</text>';
  return s + '</svg>';
}

// Foto ampliada de las manos (fotos/<id>-agarre.jpg) para ver bien la diferencia entre agarres
const FOTO_AGARRE = { "jalon": true, "jalon-estrecho": true, "jalon-cerrado": true, "jalon-supino": true,
  "extension-polea": true, "extension-polea-v": true, "extension-cuerda": true, "extension-inversa-polea": true,
  "remo-barra-supino": true };

// Foto pequeña de las listas: si hay foto de las manos, se usa esa (así se distingue el agarre)
function miniaturaDe(id) {
  if (FOTO_AGARRE[id]) return "fotos/" + id + "-agarre.jpg";
  const f = fotosDe(id);
  return f ? f[0] : null;
}

// "✋ Agarre abierto" para poner debajo del nombre
function textoAgarre(id) {
  const t = TIPOS_AGARRE[AGARRE[id]];
  return t ? '<span class="chip-agarre">✋ <span>' + t.nombre + '</span></span>' : "";
}

function fotosDe(id) {
  if (!FOTOS[id]) return null;
  return ["fotos/" + id + "-inicio.jpg", "fotos/" + id + "-final.jpg"];
}

// Ficha completa de un ejercicio (datos del ejercicio + tutorial + seguridad común)
function fichaEjercicio(id) {
  const e = buscarEj(id);
  const t = TUTORIALES[id] || { anim: null, prep: [], err: [], seg: [] };
  const alternativa = e.nivel > 1 ? e.variantes.map(buscarEj).filter(function (v) { return v && v.nivel === 1; })[0] : null;
  return {
    ejercicio: e,
    preparacion: t.prep,
    ejecucion: e.pasos,
    errores: [e.error].concat(t.err),
    seguridad: t.seg.concat([SEGURIDAD_EQUIPO[e.equipo]]).concat(SEGURIDAD_GENERAL),
    consejo: e.consejo,
    anim: t.anim, inv: !!t.inv,
    alternativa: alternativa
  };
}

// Dibuja la animación como SVG (texto). Usa animación SVG nativa: no necesita librerías.
function animacionSVG(id, titulo) {
  const t = TUTORIALES[id];
  if (!t || !ANIMACIONES[t.anim]) return "";
  const def = ANIMACIONES[t.anim];
  let a = def.a, b = Object.assign({}, def.a, def.b);
  if (t.inv) { const x = a; a = b; b = x; }

  function valores(p, q) { return p + ";" + q + ";" + p; }
  const tiempos = 'dur="2.8s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"';
  function linea(j1, j2, color, grosor) {
    if (!a[j1] || !a[j2]) return "";
    const p1 = a[j1], p2 = a[j2], q1 = b[j1], q2 = b[j2];
    return '<line x1="' + p1[0] + '" y1="' + p1[1] + '" x2="' + p2[0] + '" y2="' + p2[1] + '" stroke="' + color + '" stroke-width="' + grosor + '" stroke-linecap="round">' +
      '<animate attributeName="x1" values="' + valores(p1[0], q1[0]) + '" ' + tiempos + '/><animate attributeName="y1" values="' + valores(p1[1], q1[1]) + '" ' + tiempos + '/>' +
      '<animate attributeName="x2" values="' + valores(p2[0], q2[0]) + '" ' + tiempos + '/><animate attributeName="y2" values="' + valores(p2[1], q2[1]) + '" ' + tiempos + '/></line>';
  }
  function punto(j, r, color) {
    if (!a[j]) return "";
    return '<circle cx="' + a[j][0] + '" cy="' + a[j][1] + '" r="' + r + '" fill="' + color + '">' +
      '<animate attributeName="cx" values="' + valores(a[j][0], b[j][0]) + '" ' + tiempos + '/><animate attributeName="cy" values="' + valores(a[j][1], b[j][1]) + '" ' + tiempos + '/></circle>';
  }
  function cable(anclaje, j) {
    const p = a[j], q = b[j];
    return '<line x1="' + anclaje[0] + '" y1="' + anclaje[1] + '" x2="' + p[0] + '" y2="' + p[1] + '" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="3 3">' +
      '<animate attributeName="x2" values="' + valores(p[0], q[0]) + '" ' + tiempos + '/><animate attributeName="y2" values="' + valores(p[1], q[1]) + '" ' + tiempos + '/></line>';
  }

  // Cable que baja hasta el centro de la barra (entre las dos manos)
  function cableAlCentro(anclaje) {
    const mx = (a.W1[0] + a.W2[0]) / 2, my = (a.W1[1] + a.W2[1]) / 2, nx = (b.W1[0] + b.W2[0]) / 2, ny = (b.W1[1] + b.W2[1]) / 2;
    return '<line x1="' + anclaje[0] + '" y1="' + anclaje[1] + '" x2="' + mx + '" y2="' + my + '" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="3 3">' +
      '<animate attributeName="x2" values="' + valores(mx, nx) + '" ' + tiempos + '/><animate attributeName="y2" values="' + valores(my, ny) + '" ' + tiempos + '/></line>';
  }

  const cuerpo = "var(--fg)", suave = "var(--muted)", acento = "var(--accent)";
  let s = '<svg class="anim" viewBox="0 0 200 165" role="img" aria-label="Animación del movimiento: ' + String(titulo || "").replace(/[<>"&]/g, "") + '">' +
    '<line x1="0" y1="151" x2="200" y2="151" stroke="var(--line)" stroke-width="2"/>';
  for (const p of def.props || []) s += '<line x1="' + p[0] + '" y1="' + p[1] + '" x2="' + p[2] + '" y2="' + p[3] + '" stroke="var(--surface3)" stroke-width="5" stroke-linecap="round"/>';
  if (def.vista === "lado") {
    if (a.K2) { s += linea("Hp", "K2", suave, 6) + linea("K2", "A2", suave, 6) + linea("A2", "T2", suave, 5); }
    if (def.cable) s += cable(def.cable, def.cableJ || "W");
    s += linea("S", "Hp", cuerpo, 8) + linea("Hp", "K", cuerpo, 7) + linea("K", "A", cuerpo, 6) + linea("A", "T", cuerpo, 5) +
      linea("S", "E", cuerpo, 6) + linea("E", "W", cuerpo, 5) + linea("W", "M", cuerpo, 4) + punto("H", 9, cuerpo);
    if (def.carga) s += punto(def.carga, def.carga === "S" ? 5 : 4.5, acento);
  } else {
    s += linea("S1", "S2", cuerpo, 7) + linea("S1", "Hp1", cuerpo, 7) + linea("S2", "Hp2", cuerpo, 7) + linea("Hp1", "Hp2", cuerpo, 7) +
      linea("Hp1", "K1", cuerpo, 6) + linea("K1", "A1", cuerpo, 6) + linea("Hp2", "K2", cuerpo, 6) + linea("K2", "A2", cuerpo, 6) +
      linea("S1", "E1", cuerpo, 5) + linea("E1", "W1", cuerpo, 5) + linea("S2", "E2", cuerpo, 5) + linea("E2", "W2", cuerpo, 5) + punto("H", 9, cuerpo);
    if (def.carga) s += punto("W1", 4.5, acento) + punto("W2", 4.5, acento);
    if (def.barra) s += linea("W1", "W2", acento, 4);                     // barra o asa que une las dos manos
    if (def.cuerda && def.cable) s += cable(def.cable, "W1") + cable(def.cable, "W2");   // cuerda: un cabo a cada mano
    else if (def.unaMano && def.cable) s += cable(def.cable, "W1");        // a una mano: el cable solo va a una
    else if (def.barra && def.cable) s += cableAlCentro(def.cable);       // barra: el cable va al centro
  }
  return s + '</svg>';
}

// Comprueba que todas las fichas y animaciones están completas y bien formadas (lo usan las pruebas)
function revisarAcademia() {
  const problemas = [];
  for (const e of EJERCICIOS) {
    const t = TUTORIALES[e.id];
    if (!t) { problemas.push(e.id + ": sin ficha"); continue; }
    if (!ANIMACIONES[t.anim]) problemas.push(e.id + ": animación inexistente (" + t.anim + ")");
    if (!t.prep || t.prep.length === 0) problemas.push(e.id + ": sin preparación");
    if (!e.pasos || e.pasos.length < 2) problemas.push(e.id + ": sin pasos de ejecución");
    if (!SEGURIDAD_EQUIPO[e.equipo]) problemas.push(e.id + ": sin seguridad para su material");
  }
  for (const k in ANIMACIONES) {
    const def = ANIMACIONES[k];
    const b = Object.assign({}, def.a, def.b);
    for (const j in b) {
      const p = b[j];
      if (!def.a[j]) problemas.push(k + ": la articulación " + j + " no tiene posición inicial");
      if (!Array.isArray(p) || p.length !== 2 || p[0] < 0 || p[0] > 200 || p[1] < 0 || p[1] > 165) problemas.push(k + ": " + j + " fuera del dibujo");
    }
  }
  for (const id in TUTORIALES) if (!buscarEj(id)) problemas.push(id + ": ficha de un ejercicio que no existe");
  for (const id in FOTOS) if (!buscarEj(id)) problemas.push(id + ": fotos de un ejercicio que no existe");
  for (const id in FOTOS) if (SIN_FOTO[id]) problemas.push(id + ": está a la vez con foto y sin foto");
  for (const e of EJERCICIOS) if (!FOTOS[e.id] && !SIN_FOTO[e.id]) problemas.push(e.id + ": no consta si tiene foto o por qué no");
  return problemas;
}
