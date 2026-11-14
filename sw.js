// =====================================================
// APIX GYM · SERVICE WORKER
// Es un pequeño programa que el navegador ejecuta aparte de la página.
// Guarda una copia de la app en el móvil (la "caché") para que funcione SIN internet.
// Si cambias algún archivo, sube el número de VERSION para que los móviles descarguen la nueva.
// =====================================================

const VERSION = "apex-gym-2.40.3";

// Archivos que se guardan nada más instalar la app
const ARCHIVOS = [
  "./", "./index.html", "./manifest.json", "./privacidad.html", "./borrar-cuenta.html",
  "./idiomas.js", "./traductor.js", "./datos.js", "./logica.js", "./academia.js", "./mascota.js", "./imagen.js", "./fotos.js", "./sonidos.js", "./app.js", "./nube.js", "./pruebas.js", "./eventos.js",
  "./iconos/icono-192.png", "./iconos/icono-512.png",
  "./manrope.woff", "./chakra-petch-medium.woff", "./chakra-petch-semibold.woff", "./chakra-petch-bold.woff"
];

// 1. Instalar: descarga los archivos básicos SIEMPRE del servidor ("reload"),
//    nunca de la memoria del navegador, para no guardar una versión vieja.
self.addEventListener("install", function (evento) {
  evento.waitUntil(caches.open(VERSION).then(function (cache) {
    return cache.addAll(ARCHIVOS.map(function (url) { return new Request(url, { cache: "reload" }); }));
  }));
  self.skipWaiting();
});

// Las fotos de los ejercicios van en una caché aparte que NO se borra al actualizar la app:
// así no hay que volver a descargarlas en cada versión y siguen viéndose sin internet.
const FOTOS_CACHE = "apix-fotos-1";

// 2. Activar: borra las copias de versiones antiguas y toma el control enseguida
self.addEventListener("activate", function (evento) {
  evento.waitUntil(caches.keys().then(function (nombres) {
    return Promise.all(nombres.filter(function (n) { return n !== VERSION && n !== FOTOS_CACHE; }).map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});

// Pide un archivo a internet, pero si tarda más de "ms" se rinde (cobertura mala del gimnasio)
function pedirConLimite(peticion, ms) {
  return new Promise(function (resolver, rechazar) {
    const reloj = setTimeout(function () { rechazar(new Error("lento")); }, ms);
    fetch(peticion, { cache: "no-cache" }).then(function (r) {
      clearTimeout(reloj);
      guardarCopia(peticion, r, VERSION);      // aunque llegue tarde, se guarda para la próxima vez
      resolver(r);
    }, function (e) { clearTimeout(reloj); rechazar(e); });
  });
}

// 3. Cada vez que la app pide un archivo:
//    - Fotos, iconos y letras (no cambian): primero la copia guardada, así cargan al instante.
//    - Todo lo demás (código y página): primero internet, para tener siempre la última versión.
//      Si no hay internet o va muy lento (más de 4 segundos), se usa la copia guardada.
self.addEventListener("fetch", function (evento) {
  if (evento.request.method !== "GET") return;
  const url = new URL(evento.request.url);
  if (url.origin !== self.location.origin) return;
  const esImagen = /\.(jpg|png|woff)$/.test(url.pathname);   // fotos, iconos y letras
  if (esImagen) {
    const esFoto = url.pathname.indexOf("/fotos/") >= 0;
    evento.respondWith(caches.match(evento.request).then(function (guardado) {
      return guardado || fetch(evento.request).then(function (r) { guardarCopia(evento.request, r, esFoto ? FOTOS_CACHE : VERSION); return r; });
    }));
    return;
  }
  evento.respondWith(pedirConLimite(evento.request, 4000).catch(function () {
    return caches.match(evento.request, { ignoreSearch: true }).then(function (g) {
      return g || fetch(evento.request).catch(function () { return caches.match("./index.html"); });   // sin copia: se espera a internet lo que haga falta
    });
  }));
});

function guardarCopia(peticion, respuesta, donde) {
  if (!respuesta || !respuesta.ok) return;
  const copia = respuesta.clone();
  caches.open(donde).then(function (cache) { cache.put(peticion, copia); });
}

// 4. Llega un aviso push (aunque la app esté cerrada): se muestra la notificación
self.addEventListener("push", function (evento) {
  let datos = {};
  try { datos = evento.data ? evento.data.json() : {}; } catch (e) { datos = { texto: evento.data ? evento.data.text() : "" }; }
  evento.waitUntil(self.registration.showNotification(datos.titulo || "Apix Gym", {
    body: datos.texto || "", icon: "iconos/icono-192.png", badge: "iconos/icono-192.png", tag: "apex-recordatorio",
    renotify: true, vibrate: [300, 150, 300, 150, 300]   // vuelve a sonar y vibra aunque ya hubiera otro aviso
  }));
});

// 5. Al tocar un aviso, abre la app (o la trae al frente si ya estaba abierta)
self.addEventListener("notificationclick", function (evento) {
  evento.notification.close();
  evento.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (ventanas) {
    for (const v of ventanas) if ("focus" in v) return v.focus();
    return self.clients.openWindow("./index.html");
  }));
});
