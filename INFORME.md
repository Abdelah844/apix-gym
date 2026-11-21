# Apix Gym 2.1 · Informe de entrega

> **Nota de revisión (21 de noviembre de 2026):** algunos archivos que cita este informe **no están en el repositorio**: `.github/workflows/pruebas.yml` (integración continua), `test/nube.py` y `test/social.py`. Las pruebas que sí se pueden ejecutar desde el repositorio son las de `node test/correr.js` (159 de 159 superadas en esta fecha). Si esos archivos existen en otro sitio, hay que subirlos; si no, las cifras de esas secciones no se pueden comprobar.
>
> **Nota (21 de noviembre de 2026, tarde):** la app ya no usa Firebase, usa **Supabase**. Se han borrado `firebase.json`, `servidor/firestore.rules`, `servidor/reglas.test.js` y las dependencias de Firebase de `package.json`. Las reglas de seguridad actuales están en `servidor/supabase-rls.sql`.

Fecha: 1 de noviembre de 2026 · Respuesta a la revisión «Nuevos fallos encontrados en Apix Gym 2.0».

## 1. Defectos de la auditoría: estado

| # | Requisito | Estado | Cómo se ha resuelto | Prueba |
|---|---|---|---|---|
| 1 | Añadir exactamente una serie | ✅ Hecho | La sugerencia elige un único ejercicio (el directo con menos series que quepa en el tiempo), lo nombra en el botón y muestra el cambio aplicado | Unitaria + navegador |
| 2 | Carga muscular indirecta en la recuperación | ✅ Hecho | `cargaDia()`: directas × 1 + secundarias × 0,5. La usan tanto el volumen semanal como la recuperación | Unitaria |
| 3 | Estancamiento solo con sesiones comparables | ✅ Hecho | Se excluyen sesiones con molestias, de semanas con fatiga alta, con peso corporal a más de un 3 % y anteriores a un cambio de máquina. Exige 5 sesiones y 14 días | 5 unitarias |
| 4 | Separar tonelaje y series efectivas | ✅ Hecho | Métrica principal: series efectivas (por músculo con secundarios a 0,5). El tonelaje externo solo se muestra por ejercicio y se indica que no incluye el peso corporal | Unitaria + navegador |
| 5 | Calendario semanal real | ✅ Hecho | El generador pide los días de la semana. La recuperación se comprueba solo entre días realmente seguidos, también con 2 y 3 días (el domingo y el lunes cuentan como seguidos) | 2 unitarias + navegador |
| 6.1 | Comentarios privados | ✅ Escrito | Los comentarios heredan el permiso de la publicación (`puedoVerA`) | `servidor/reglas.test.js` (sin ejecutar) |
| 6.2 | Rango público falseable | ✅ Escrito | El cliente no puede escribir `rango` ni `puntos`; solo el servidor (Cloud Function) | Ídem |
| 6.3 | Edad editable | ✅ Escrito | Las reglas usan `verificaciones/{uid}`, que solo escribe el servidor. La edad del perfil no da permisos | Ídem |
| 6.4 | Preferencias de privacidad en servidor | ✅ Escrito | Publicar exige perfil no privado, `compartirEntrenos` y verificación de edad; es la misma política que `puedePublicar()` | Ídem |
| 6.5 | Denuncias reales | 🟡 Parcial | En la app: motivo, detalle, fecha, id y estado, en una cola pendiente de envío. En el servidor: colección de denuncias que solo leen y gestionan moderadores. Falta conectar la cola con el servidor | Unitaria + navegador |
| 8.1 | Series con 0 repeticiones | ✅ Hecho | `validarValores()` es la única regla para registrar, corregir e importar | Unitaria |
| 8.2 | Perfiles incompletos | ✅ Hecho | `validarEsquema()` comprueba todos los campos, tipos y valores permitidos | Unitaria (8 casos) |
| 7 | Temporizador al recargar | ✅ Hecho | La hora de fin se guarda con la sesión y se retoma al abrir | Unitaria + navegador |
| 7 | Exportación sin versión | ✅ Hecho | Formato `{ formato, version, exportado, datos }` y migraciones paso a paso (v1 → v2 → v3). Se rechazan versiones futuras | 2 unitarias + navegador |
| 7 | Semanas sin entrenos en la gráfica | ✅ Hecho | Aparecen a 0 | Unitaria |
| 7 | Duración fija de 45 s | ✅ Mejorado | Se calibra con lo que tardas de verdad (mediana de tus sesiones) y se muestra la duración real de cada día | Unitaria |
| — | Identificadores permanentes | ✅ Hecho | Cada usuario tiene un `uid`. Publicaciones, comentarios, «me gusta», amigos y bloqueos usan el `uid`; cambiar el nombre no rompe nada | Unitaria |
| 15 | Pruebas para todos los defectos | ✅ Hecho | 22 pruebas nuevas | — |

## 2. Qué se ha probado

- **Pruebas unitarias:** `node test/correr.js` → **71 de 71 superadas** (antes 49).
- **Navegador real (Chrome) a 360, 768 y 1280 px:** registro, rutina con calendario, entreno, temporizador tras recargar, sugerencia de una serie, progreso con series efectivas, denuncia con motivo, informe de problema, exportar e importar, privacidad y fallo de guardado. 0 errores de JavaScript.
- **Reglas del servidor:** no ejecutadas. Requieren Java, Firebase CLI y el emulador. El archivo `servidor/reglas.test.js` contiene 12 pruebas listas para ejecutar.

## 3. Errores encontrados durante este trabajo

1. Los tres defectos de la auditoría que se pudieron reproducir (0 repeticiones, perfil sin equipo, «Añadir 1 serie» añadía 2).
2. **Riesgo introducido y corregido:** con la validación estricta, unos datos guardados con un valor incorrecto se habrían descartado al abrir la app. Ahora se cargan igualmente y se avisa.
3. Los datos de ejemplo tenían semanas planas por el redondeo de pesos y generaban avisos de estancamiento falsos en la demo.
4. La herramienta de pruebas no puede teclear un texto de 71.000 caracteres; no es un fallo de la app (un usuario pega el texto).

## 4. Qué sigue siendo simulado

| Elemento | Estado |
|---|---|
| Otros usuarios, amigos y sus publicaciones | Solo en modo demo, marcados como ficticios |
| Envío de denuncias a moderación | En cola local; falta el servidor |
| Reglas del servidor | Escritas, no ejecutadas |
| Factores de dificultad y ajuste por sexo | Estimados (v1), sin calibrar |
| Notificaciones | Solo preferencias |

## 5. Limitaciones conocidas

- Sin servidor: no hay cuentas reales, sincronización ni moderación real. «Cerrar sesión» solo oculta la pantalla.
- Datos sin cifrar en el navegador.
- Los límites diarios de publicaciones y comentarios son locales; en el servidor necesitan una Cloud Function.
- Con 2-3 días y poco tiempo no cabe el volumen recomendado: la app lo avisa.
- **Nadie real ha usado la app todavía.** Ver `PILOTO.md`.

## 6. Siguiente fase

1. Ejecutar la prueba piloto (`PILOTO.md`) con 8-12 personas durante 3 semanas.
2. Crear el proyecto de Firebase y pasar `servidor/reglas.test.js` en el emulador.
3. Cloud Functions: cálculo del rango, verificación de edad, límites diarios, envío de denuncias y retos entre amigos.
4. Recalibrar factores con los datos del piloto.

---

## Anexo 2.1.1 · Respuesta a la auditoría empresarial

**Corregido (reglas del servidor, sin ejecutar):**

| Punto | Cambio | Pruebas añadidas en `servidor/reglas.test.js` |
|---|---|---|
| A. Campos del perfil | Lista cerrada con `affectedKeys().hasOnly(...)`: solo `usuario`, `visibilidad`, `amigos` y `compartirEntrenos`, con formato comprobado | 2 |
| B. Bloqueos | `hayBloqueo()`: si cualquiera de los dos bloquea al otro, no se ven en publicaciones, comentarios, likes ni perfiles | 1 |
| C. Denuncias | La publicación denunciada debe existir, el autor indicado debe ser su autor real y no se puede denunciar lo propio | 2 |

**Añadido:** `package.json` (dependencias y comandos `npm test` y `npm run test:reglas`), `firebase.json` (configuración del emulador) y `.github/workflows/pruebas.yml` (integración continua en GitHub). Los tres están escritos pero no ejecutados aquí.

**Fuera de lo que se puede programar desde aquí:**

| Requisito | Por qué | Quién |
|---|---|---|
| Autenticación, servidor, sincronización y copias de seguridad | Necesitan un proyecto de Firebase con la cuenta del propietario | Propietario, con guía paso a paso |
| Ejecutar las 17 pruebas de reglas | Necesitan Java, Firebase CLI y el emulador instalados | Propietario (o GitHub Actions al subir el código) |
| RGPD, datos de salud, menores, contratos con proveedores | Requiere asesoramiento jurídico profesional | Abogado o delegado de protección de datos |
| Prueba piloto | Requiere personas reales | Propietario (ver `PILOTO.md`) |
| Pruebas de penetración | Requieren la infraestructura desplegada | Especialista en seguridad |

---

## Anexo 2.2 · Biblioteca, Academia y Mi gimnasio

**Implementado y probado**

| Pilar | Qué se ha hecho |
|---|---|
| Biblioteca | 9 ejercicios nuevos (de 50 a 59), cada uno cubre un hueco: aductores, gemelo sentado (sóleo), remo con pecho apoyado, dominadas y fondos asistidos, hip thrust en máquina, sentadilla y press inclinado en multipower, hiperextensiones. Nuevo grupo «Aductores» |
| Máquinas asistidas | Los kg son ayuda: la carga real es peso corporal − ayuda. Progresar es quitar ayuda; si no llegas a las repeticiones, se propone más. La ayuda nunca puede igualar el peso corporal. No cuenta como tonelaje |
| Academia | Ficha de los 59 ejercicios: preparación y ajuste de la máquina, ejecución, errores, seguridad (específica + según material + general), músculos, nivel, alternativa para principiantes y animación propia del patrón de movimiento (29 animaciones, con botón de pausa y pausa automática si el sistema pide reducir el movimiento) |
| Mi gimnasio | Lista de máquinas disponibles. El generador y las sugerencias solo usan lo que hay. Sin ninguna máquina, la rutina se hace con pesos libres. Migración de datos v3 → v4 |

**Pruebas:** **86 de 86** (15 nuevas) en Node y en la app. Navegador real: ficha completa con animación, pausa, «No hay en mi gimnasio», propuesta sin las máquinas quitadas y entreno con máquina asistida. 0 errores de JavaScript.

**Errores encontrados y corregidos en esta versión**
1. Una ficha apuntaba a un ejercicio inexistente (lo detectó la comprobación automática de la Academia).
2. En la animación de la patada de glúteo, el cable iba a la mano en vez de al tobillo (revisión visual).
3. Los datos de ejemplo trataban la ayuda de las máquinas asistidas como peso cargado (70 kg de «ayuda» para alguien de 74 kg). Detectado en la prueba de navegador; añadida su prueba.

**Pendiente**
- **Vídeos reales (20-45 s):** la ficha tiene su sitio marcado como «pendiente de grabación propia». Deben ser propios o con licencia comercial verificable.
- Subtítulos: se cubrirán con los vídeos; ahora los pasos escritos cumplen esa función.
- Las animaciones muestran el patrón de movimiento, no la máquina exacta de cada marca.

---

## Anexo 2.2.1 · Fotos reales en las fichas

- **52 de 59 ejercicios** tienen 2 fotos reales (posición 1 y 2) de Free Exercise DB, con licencia **Unlicense (dominio público)**. Origen, licencia y correspondencia exacta en `CREDITOS.md`.
- **7 ejercicios sin foto**, porque la foto disponible mostraba otra máquina u otra variante: dominadas y fondos asistidos, hip thrust en máquina, patada de glúteo en polea, sentadilla búlgara, remo en máquina y curl en máquina. Se quedan con la animación.
- Las 108 fotos candidatas se revisaron una a una antes de incluirlas. Se descartaron 2 tras la revisión visual (remo en máquina y curl en máquina).
- Las fotos se rotulan «Posición 1» y «Posición 2», y no «inicio» y «final», porque en algunos ejercicios el orden de la base de datos no coincide con el inicio real del movimiento.
- **Pruebas:** 87 de 87 en Node (incluye que todos los archivos de foto existen). En navegador: las 104 fotos cargan, sin desplazamiento lateral a 360 y 1280 px, sin errores.

---

## Anexo 2.2.2 · Insignias de los 9 rangos

- Nuevos nombres, de principiante a élite: **Hierro, Bronce, Plata, Oro, Platino, Esmeralda, Diamante, Titán y Apex**. Los umbrales de puntos no cambian (0, 12, 24, 36, 48, 58, 68, 78 y 88), así que nadie cambia de nivel; solo cambia el nombre y el dibujo.
- Los metales y gemas son nombres genéricos usados por muchos juegos. Los dos rangos más altos (Titán y Apex) y el diseño de las insignias son propios: no se copian nombres, iconos ni el orden completo de Symmetry, como pedía la auditoría.
- Insignias de diseño propio, dibujadas con código: gema hexagonal con relieve, y más adornos a medida que se sube (galones → estrella con puntos → gema con alas → corona y brillo en Apex).
- Pantalla Rangos: nueva tarjeta «Los 9 rangos» con todas las insignias, tu rango resaltado y los que aún no tienes atenuados.
- Textos de topes y reglas calculados desde la lista de rangos, para que no vuelvan a quedarse con nombres antiguos.
- Pruebas: 87 de 87. Navegador: sin errores.

---

## Anexo 2.3 · Apix (antes Kilo), la mascota

- **Personaje propio:** una bolita morada con cara (dibujada con código, sin licencias de terceros), con 7 humores: normal, anima, enfadado, celebra, orgulloso, descanso y cuida.
- **Cuándo aparece cada humor** (orden de prioridad, con tus datos reales):
  1. **Cuida:** marcaste molestias en los últimos 3 días → nunca presiona; pide calma.
  2. **Celebra:** récord en los últimos 2 días → dice el ejercicio y el peso. También aparece en la pantalla de récord.
  3. **Enfadado:** acabas de perder la racha → dice cuántas semanas tenías y propone recuperarla esa semana.
  4. **Orgulloso:** ya has entrenado hoy.
  5. **Anima:** hoy toca entrenar según tu calendario y no lo has hecho → «Hay que tener disciplina para conseguir aquello que deseas». Si llevas 3 días o más sin entrenar, lo dice.
  6. **Descanso:** hoy no toca → no insiste.
- Botón «Vamos a entrenar» cuando anima o se enfada. Se puede ocultar en Ajustes. Las animaciones se paran si el móvil tiene activado «reducir movimiento».
- **Pruebas:** 94 de 94 (7 nuevas, una por cada comportamiento). Navegador: sin errores.

## Anexo 2.4 · App instalable (PWA)

- **manifest.json:** nombre, colores, modo app (sin barra del navegador) e iconos de 192 y 512 px, más uno «maskable» para Android. Los iconos llevan a Kilo.
- **sw.js (service worker):** guarda la app en el móvil para que funcione **sin internet**. Las fotos se guardan cuando las ves. Para publicar cambios hay que subir el número `VERSION`.
- **Ajustes → Instalar en el móvil:** botón «Instalar Apix Gym» cuando Chrome lo permite y, si no, instrucciones para Android y iPhone.
- **Requisito:** solo funciona en una web con https (por ejemplo, GitHub Pages). Dentro del enlace de Claude se ve la app, pero no se instala.
- **Pruebas:** 99 de 99 (5 nuevas). En el navegador: se registra el service worker, se lee el manifest y la app abre con el modo sin conexión.

## Anexo 2.5 · Más máquinas, fotos completas, Apix y sonidos

- **Ejercicios:** de 59 a **106** (47 nuevos). Sobre todo máquinas y poleas: multipower (press banca, inclinado, hombro, cerrado, remo, zancada, gemelos, peso muerto), press inclinado y declinado en máquina, remo alto, jalones (estrecho y supino), pullover en polea, encogimientos, pájaros, curl predicador, extensiones con cuerda, crunch en máquina, curl femoral de pie, aductor en polea, etc. Cada uno con ficha, pasos, errores, seguridad, animación y fotos.
- **Cada grupo muscular** tiene al menos 3 opciones de máquina o polea (aductores, 2).
- **Fotos:** las 106 tienen foto (Free Exercise DB, dominio público). Tres son fotos de referencia con aviso.
- **4 animaciones nuevas:** encogimiento, remo al mentón, elevación frontal y pullover.
- **Generador:** en brazos se prefieren ejercicios de aislamiento, para que el press cerrado o los fondos no sumen volumen de más a pecho y hombro.
- **La mascota se llama Apix.** Si la tocas en Inicio, contesta con un sonido.
- **Sonidos (sonidos.js):** 7 efectos creados con código (serie, fin del descanso, récord, subir de rango, fin del entreno, racha salvada y Apix enfadado). Todos duran menos de 2 segundos. En Ajustes se pueden desactivar el sonido y la vibración y probar cada efecto.
- **Pruebas:** 108 de 108 (9 nuevas). Navegador: las 212 fotos cargan, los sonidos suenan, sin errores.

## Anexo 2.6 · Entreno guiado, amigos, progreso y recordatorios

- **Social:** al compartir, ahora hay aviso inmediato («✓ Guardado en tu diario») y la publicación se resalta. Nuevo botón «Enviar a amigos» (WhatsApp, Instagram… con el menú de compartir del móvil; si no hay, copia el texto).
- **Amigos sin servidor:** cada usuario tiene una tarjeta de amigo (rango, racha, entrenos y 3 mejores marcas) que se envía como enlace. Al abrirlo o pegar el código, se añade. Los datos que llegan se validan uno a uno.
- **Entreno en curso:** un ejercicio a la vez, barra de progreso, salto rápido a cualquier ejercicio, anterior/siguiente y deslizar con el dedo. Panel grande con −/+ kg (según el material) y −/+ reps, esfuerzo opcional y botón «Completar serie». Tras completar, pasa solo a la siguiente serie o al siguiente ejercicio.
- **Récord en directo:** aviso «🏆 ¡Récord personal!» con sonido al superar tu mejor marca. Animación al completar cada serie. Apix aparece con frases cortas en momentos clave (última serie, último ejercicio, récord).
- **Historial rápido:** las 3 últimas veces de ese ejercicio debajo de las series.
- **Superseries, drop sets y rest-pause:** la superserie pasa al segundo ejercicio sin descanso; el drop set baja un 20 % sin descanso; el rest-pause pone 15 s. El tipo de serie se guarda.
- **Descanso:** temporizador grande con anillo y el «siguiente» bien visible, ±15 s, tiempos rápidos (1:00–3:00) y «Usar siempre en este ejercicio» (se guarda también en la rutina). En Ajustes, descanso distinto para compuestos y aislamiento.
- **Rutinas:** generador guiado en 3 pasos; resumen claro de la propuesta y confirmación antes de sustituir la rutina; editor con botones −/+, cambiar, quitar (con deshacer), reordenar y avisos de «guardado». «Nueva rutina» y «Entreno libre» destacados en Entrenar.
- **Progreso:** tabla comparando con el periodo anterior, carga semanal o mensual (tonelaje), índice de fatiga (últimos 7 días frente a la media de 4 semanas) y 1RM con 5 fórmulas a elegir (los rangos siguen con Epley).
- **Rangos:** «Tu ranking por músculo» ordenado y destacado justo después del rango global.
- **Apix y retos:** te recuerda cuánto te falta para tu reto, el último día y te felicita al conseguirlo. Si no tienes retos, a veces te propone uno.
- **Recordatorios locales:** día de entreno a la hora elegida, racha en peligro el fin de semana y último día de reto. Máximo 1 al día, nunca con molestias recientes. Funcionan al abrir la app o con ella en segundo plano; los avisos con la app cerrada del todo necesitan servidor.
- **Pruebas:** 123 de 123 (15 nuevas). Navegador: sin errores.

## Anexo 2.6.2 · Correcciones tras probarla en el gimnasio

- **Timbre al acabar el descanso:** campana de dos toques y «tic» en los 3 últimos segundos. Los sonidos se fabrican como audio WAV y suenan con un elemento de audio, para que también se oigan con el iPhone en modo silencio. Destello en pantalla y Apix avisando del siguiente ejercicio. Con la app en segundo plano y los avisos activados, llega una notificación (si el iPhone la deja ejecutarse).
- **Apix animado:** aparece al completar cada serie, al terminar un ejercicio, al batir un récord, al acabar el descanso y al terminar el entreno (resumen con Apix saltando y confeti).
- **Compartir tras el entreno:** el botón del resumen solo cambiaba su texto y parecía colgado. Ahora avisa «✓ Guardado en tu diario» y tiene «Enviar a amigos».
- **+ Serie / − Serie** otra vez a la vista debajo de las series.
- **Nombres en español:** «Serie descendente» y «Descanso-pausa», con explicación corta. No se pueden añadir varias seguidas sin completar la anterior.
- **Pruebas:** 125 de 125.

## Anexo 2.6.4 · Tabla de series, favoritos y confirmar al terminar

- **Cronómetro del entreno** grande y fijo arriba (minutos y segundos).
- **Tabla de series:** Serie · Previa · Kg · Reps · ✓, editable fila a fila. La fila actual se resalta y debajo tiene botones −/+ kg y −/+ rep. Tocar «Previa» copia la marca anterior. Lo que escribes se guarda aunque pulses ✓ sin salir del campo. Botón grande «+ Añadir serie».
- **Favoritos** (☆/★) en la cabecera del ejercicio durante el entreno.
- **Terminar** pide confirmación y avisa de las series que faltan.

## Anexo 2.7 · Calentamiento, copia de seguridad, medidas y rutinas famosas

- **Series de calentamiento:** en los compuestos con carga, antes de la primera serie. Barra: barra sola × 10, 50 % × 5, 70 % × 3 (y 85 % × 1 si pasa de 100 kg). Máquina y mancuernas: 50 % × 8 y 75 % × 4. No cuentan para récords, rangos ni volumen. Se pueden ocultar o desactivar en Ajustes.
- **Copia de seguridad:** aviso en Inicio cada 14 días («¿Guardamos una copia?»). Crea un archivo .json y abre el menú de compartir del móvil (Archivos, Drive, correo…) o lo descarga. Restaurar acepta el archivo directamente.
- **Medidas corporales:** brazo, pecho, cintura y muslo, con gráfica y cambio desde la primera medida.
- **Rutinas famosas:** Fuerza 5×5, PPL, Torso y pierna, Split clásico y Cuerpo completo para empezar. Se adaptan solas si falta una máquina en tu gimnasio.
- **Arreglos:** los kilos y las medidas aceptan coma («52,5»), como el teclado del iPhone en español. Una copia con un descanso de 75 s ya no da error al restaurarla.
- **Guía «Cómo registrar»:** la primera vez que entrenas, 7 pasos que resaltan cada parte de la tabla (Kg, Reps, Previa, ajuste rápido, ✓ y añadir serie). Se puede repetir con «¿Cómo se apunta?». Encima de la tabla, una línea dice qué peso apuntar según el material (barra + discos, UNA mancuerna, placa de la máquina, lastre, ayuda…), y la Academia lo explica en cada ejercicio.
- **Pruebas:** 135 de 135.

## Anexo 2.7.2 · Copia en Ajustes y auditoría

- **Copia de seguridad en Ajustes:** es lo primero que se ve, con la fecha de la última copia, «Hacer copia ahora», «Restaurar» y cada cuánto recordarla (semana, 2 semanas, mes o nunca). Índice de secciones arriba en Ajustes y engranaje ⚙ en el botón de perfil para que se encuentre.
- **Auditoría (iPhone 360 y 390 px):** 30 pantallas y las 106 fichas recorridas sin errores de JavaScript ni desbordes; 0 fallos de seguridad al meter HTML en notas, nombres, comentarios y tarjetas de amigo; con 400 entrenos (2 años) cada pantalla se pinta en menos de 70 ms y el guardado ocupa unos 530 KB.
- **Arreglos de la auditoría:** zonas táctiles de al menos 40 px (Previa, me gusta, denunciar, botones −/+ del editor); colores verde, naranja y rosa del tema claro más oscuros para cumplir el contraste mínimo (4,5:1); etiqueta accesible en el texto de exportar; ✓ legible en el tema claro.

## Anexo 2.7.3 · Privacidad y condiciones de uso

- **Página nueva `privacidad.html`:** qué datos usa la app, dónde se guardan (solo en el dispositivo), servicios de terceros (GitHub Pages), qué se comparte, derechos (ver, corregir, borrar, reclamar ante la AEPD), edad mínima de 14 años y condiciones de uso (no es un servicio médico).
- **Registro:** casilla obligatoria «He leído y acepto…». Se guarda la fecha y la versión aceptada en `ajustes.privacidadAceptada` (`VERSION_PRIVACIDAD = 1`).
- **Acceso:** enlace en la bienvenida y botón en Ajustes → Tus datos.
- **Letras dentro de la app (archivos `.woff` en la raíz, junto a index.html):** ya no se piden a Google Fonts, así la app no envía la IP del usuario a Google y las letras funcionan sin internet. Licencia OFL incluida.
- **Pendiente:** cuando se añada Supabase, actualizar la política (servidor, datos de salud, consentimiento) y subir `VERSION_PRIVACIDAD` para volver a pedir la aceptación.
- **Pruebas:** 136 de 136; v2 comprueba que sin la casilla no se crea el perfil.

## Anexo 2.8 · Cuenta en la nube (Supabase)

- **Proyecto Supabase** `apex-gym`, región West EU (Irlanda), plan gratuito.
- **Base de datos:** tabla `copias` (una fila por usuario con todos sus datos en JSON). Seguridad por filas (RLS): cada usuario solo ve, cambia y borra su fila; los visitantes sin sesión no tienen permisos. Límite de 3 MB por copia. Función `borrar_mi_cuenta()` para el derecho de supresión.
- **nube.js:** habla con Supabase con `fetch` (sin librerías): crear cuenta, iniciar sesión, recuperar contraseña, renovar el token, subir/bajar la copia y borrar la cuenta. La sesión se guarda aparte (`apex-nube`), nunca dentro de las copias de seguridad.
- **Sincronización:** local primero. Cada `guardar()` sube la copia 4 s después. Al abrir la app, al volver a ella o al recuperar internet, se comprueba la nube: si cambió en otro móvil y aquí no, se baja; si cambiaron los dos, se pregunta cuáles conservar. Nunca se cambian los datos en mitad de un entreno.
- **Pantallas:** «Ya tengo cuenta» en la bienvenida, tarjeta «☁️ Cuenta en la nube» en Ajustes, hoja de conflicto, nueva contraseña al volver del correo. Con cuenta, ya no se pide hacer copias manuales.
- **Privacidad v2:** Supabase como encargado, servidor en la UE, consentimiento explícito (también para lesiones y molestias) al crear la cuenta; «Eliminar cuenta y datos» borra también la nube.
- **Pendiente:** el correo de confirmación usa el servidor de Supabase, que solo permite unos pocos correos por hora; antes del lanzamiento conviene configurar un SMTP propio.
- **Pruebas:** 141 de 141 en Node; `test/nube.py` simula Supabase y comprueba 18 casos (entrar, error de contraseña, recuperar datos, subida automática, conflicto, borrar cuenta, crear cuenta, nueva contraseña, sin internet).

## Anexo 2.8.1 · Arreglos tras probar la cuenta en el iPhone

- **Confirmar el correo:** en el iPhone, la app instalada y el navegador guardan las sesiones por separado, así que el enlace del correo dejaba la sesión en el navegador. Ahora el enlace solo confirma el correo (la página dice «Correo confirmado, vuelve a la app») y en la app se pulsa «Ya lo he confirmado» para entrar. La contraseña solo se guarda en memoria mientras tanto. Lo mismo al cambiar la contraseña: se cambia en el navegador y se entra en la app con la nueva.
- **Códigos de 6 cifras:** Supabase solo deja cambiar los correos (para poner un código) con un servidor de correo propio (SMTP). Queda pendiente.
- **Nombre de usuario único:** tabla `perfiles` con `nombre_usuario` único (3-20 caracteres: a-z, 0-9, punto y guion bajo), función `usuario_libre()` y disparador que lo guarda al crear la cuenta. Las cuentas antiguas sin usuario lo eligen al iniciar sesión. Cambiarlo en Ajustes se comprueba en la nube.
- **Sin zoom:** `touch-action: manipulation` (sin zoom al tocar dos veces; con dos dedos sigue funcionando) y campos de texto a 16 px (el iPhone acercaba la pantalla al escribir).
- **Google y Apple:** Google necesita crear un proyecto en Google Cloud (gratis). Apple necesita la cuenta de desarrollador de Apple (99 $/año): pospuesto.
- **Pruebas:** `test/nube.py` pasa 29 casos (usuario repetido, confirmación de correo, enlace abierto en el navegador, cuenta antigua sin usuario…).

## Anexo 2.9 · Idiomas: inglés y francés

- **Cómo funciona:** la app sigue escrita en español. `traductor.js` vigila la pantalla (MutationObserver) y cambia cada texto por su traducción de `idiomas.js`. Los números se tratan aparte («Serie 3» se busca como «Serie {n}»), los textos con nombres usan patrones («Hola, {x}») y las listas con « · » se traducen por partes. Lo que escribe el usuario (cuadros de texto) no se toca.
- **Traducciones:** 2.131 textos en inglés y francés, revisados uno a uno. Fuentes en `i18n/` (`lista.json` con el español y `tr_*.tsv` con inglés y francés); `i18n/construir.py` genera `idiomas.js` y comprueba que cada traducción tenga los mismos números.
- **Idioma por defecto:** el del móvil (español también para catalán, gallego y euskera; francés; el resto, inglés). Se cambia con los botones de la bienvenida o en Ajustes → 🌐. Fechas y números usan el formato del idioma.
- **Fuera de la pantalla:** los avisos y los textos para compartir se traducen con `tr()` antes de enviarse.
- **Privacidad:** la página tiene las tres versiones completas; manda la española.
- **Arreglos:** la ficha de rango de un ejercicio sin series ya no da error; los botones de ejercicios del entreno muestran el nombre completo (con «…» si no cabe); las iniciales de los días cambian según el idioma.
- **Comprobado:** recorrido de más de 250 pantallas y fichas en inglés y francés sin textos en español sin traducir (salvo nombres propios como Apex, Apix o Hip thrust), auditoría sin errores ni desbordes en los dos idiomas, 143 pruebas en Node.
- **Pendiente:** si se añade un texto nuevo a la app, hay que añadir su traducción en `i18n/` (si no, sale en español).

## Anexo 2.9.2 · Mensajes de Apix y frases con variables

- **Problema:** los mensajes de Apix y otras frases que la app monta con variables («Llevas 4 días sin entrenar…», «¡62,5 kg en press banca!», avisos de peso, rangos…) seguían en español.
- **Solución:** `traductor.js` tiene ahora unas 130 plantillas con huecos ({x}) que se rellenan con el valor traducido, traduce frase a frase los textos con varias frases y prueba con mayúscula los nombres que van en minúscula dentro de una frase.
- **Revisión a fondo:** `i18n/analizar.js` lee todo el código con un analizador de JavaScript (acorn) y saca cada texto y cada frase montada con «+»; `i18n/comprobar.js` lista lo que aún no se traduce. Se añadieron unos 200 textos que el primer recorrido no había encontrado (`i18n/extra_*.tsv`). Lo que queda son identificadores internos y trozos de frases que ya cubren las plantillas.

## Anexo 2.10 · Parte social real (Supabase)

- **Base de datos:** `perfiles` guarda ahora los datos que ven tus amigos (rango, puntos, racha, entrenos, 3 mejores marcas y privacidad). Tablas nuevas: `amistades` (solicitud → aceptada), `publicaciones` (máx. 20 al día, 280 caracteres), `me_gusta` y `denuncias` (solo se pueden crear; se revisan desde el panel). Funciones: `solicitar_amistad`, `buscar_usuario`, `son_amigos`, `publicaciones_hoy`.
- **Seguridad (comprobada con 3 usuarios de prueba temporales, ya borrados):** sin ser amigos no se ve nada del otro; quien te envía una solicitud deja ver su perfil para que decidas; al aceptar, se ven las publicaciones; un desconocido no puede ver, borrar ni tocar nada; nadie puede aceptar su propia solicitud. La prueba encontró una regla recursiva en el límite de publicaciones y se corrigió.
- **App:** Social → Amigos (añadir por usuario, invitar con enlace `#u=usuario`, solicitudes recibidas y enviadas, ranking de amigos, quitar) y Social → Actividad (tus entrenos y los de tus amigos, me gusta, borrar, denunciar). Al terminar un entreno se comparte solo con tus amigos si «Mostrar mis entrenos» está activado. Sin cuenta, Social invita a crearla. La demo sigue con usuarios ficticios. Menores de 16: Social desactivado y perfil siempre privado.
- **Privacidad v3:** explica qué ven tus amigos, el perfil privado y las denuncias (en los tres idiomas).
- **Pruebas:** `test/social.py` (13 casos con Supabase simulado), además de las de la nube y la auditoría en español e inglés.
