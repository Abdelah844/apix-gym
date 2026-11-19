// Ejecuta las pruebas de Apix Gym sin navegador.
// Uso (desde la carpeta del proyecto):  node test/correr.js
// Devuelve código de salida 1 si alguna prueba falla (útil para integración continua).

const fs = require("fs");
const path = require("path");
const vm = require("vm");

// Almacenamiento falso que se comporta como localStorage
class AlmacenFalso {
  constructor() { this._datos = {}; }
  getItem(k) { return Object.prototype.hasOwnProperty.call(this._datos, k) ? this._datos[k] : null; }
  setItem(k, v) { this._datos[k] = String(v); }
  removeItem(k) { delete this._datos[k]; }
}

const contexto = { console: console, localStorage: new AlmacenFalso(), Math: Math, Date: Date, JSON: JSON };
vm.createContext(contexto);

const raiz = path.join(__dirname, "..");
for (const archivo of ["idiomas.js", "traductor.js", "datos.js", "logica.js", "importar.js", "academia.js", "mascota.js", "sonidos.js", "nube.js", "pruebas.js"]) {
  vm.runInContext(fs.readFileSync(path.join(raiz, archivo), "utf8"), contexto, { filename: archivo });
}

const inicio = Date.now();
const resultados = vm.runInContext("ejecutarPruebas()", contexto);
let fallos = 0, grupo = "";
for (const r of resultados) {
  if (r.grupo !== grupo) { grupo = r.grupo; console.log("\n" + grupo); }
  console.log((r.ok ? "  ✓ " : "  ✗ ") + r.nombre + (r.ok ? "" : "\n      → " + r.detalle));
  if (!r.ok) fallos++;
}
// Comprobación que solo se puede hacer con acceso a disco: cada foto declarada existe
const faltan = vm.runInContext("Object.keys(FOTOS).map(fotosDe)", contexto).flat().filter(function (f) { return !fs.existsSync(path.join(raiz, f)); });
console.log("\nFotos");
console.log((faltan.length ? "  ✗ " : "  ✓ ") + "Todas las fotos declaradas existen en la carpeta fotos/" + (faltan.length ? "\n      → faltan " + faltan.length + ", p. ej. " + faltan[0] : ""));
if (faltan.length) fallos++;
resultados.push({ ok: !faltan.length });

// App instalable (PWA): el manifest es correcto y todo lo que guarda sw.js existe
console.log("\nApp instalable");
function comprobar(nombre, ok, detalle) {
  console.log((ok ? "  ✓ " : "  ✗ ") + nombre + (ok ? "" : "\n      → " + detalle));
  if (!ok) fallos++;
  resultados.push({ ok: ok });
}
let manifest = null;
try { manifest = JSON.parse(fs.readFileSync(path.join(raiz, "manifest.json"), "utf8")); } catch (e) { /* se informa abajo */ }
comprobar("manifest.json se puede leer", manifest !== null, "el archivo falta o no es JSON válido");
if (manifest) {
  const tamanos = manifest.icons.map(function (i) { return i.sizes; });
  comprobar("El manifest tiene nombre, inicio y modo app", !!(manifest.name && manifest.start_url && manifest.display === "standalone"), "faltan name, start_url o display");
  comprobar("Hay iconos de 192 y 512 px (y uno maskable) y existen", tamanos.includes("192x192") && tamanos.includes("512x512") && manifest.icons.some(function (i) { return i.purpose === "maskable"; }) && manifest.icons.every(function (i) { return fs.existsSync(path.join(raiz, i.src)); }), "revisa la lista icons");
}
const sw = fs.readFileSync(path.join(raiz, "sw.js"), "utf8");
const lista = JSON.parse(sw.match(/const ARCHIVOS = (\[[\s\S]*?\]);/)[1].replace(/\s+/g, " "));
const noExisten = lista.filter(function (f) { return f !== "./" && !fs.existsSync(path.join(raiz, f)); });
comprobar("Todos los archivos que guarda sw.js existen", noExisten.length === 0, "faltan: " + noExisten.join(", "));
const scripts = (fs.readFileSync(path.join(raiz, "index.html"), "utf8").match(/src="([^"]+\.js)"/g) || []).map(function (t) { return "./" + t.slice(5, -1); });
comprobar("sw.js guarda todos los scripts de index.html", scripts.every(function (f) { return lista.includes(f); }), "añade a ARCHIVOS: " + scripts.filter(function (f) { return !lista.includes(f); }).join(", "));

console.log("\n" + (resultados.length - fallos) + " de " + resultados.length + " pruebas superadas en " + (Date.now() - inicio) + " ms");
process.exit(fallos ? 1 : 0);
