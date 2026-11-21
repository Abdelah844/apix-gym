// =====================================================
// PRUEBAS DE LAS REGLAS DEL SERVIDOR (NO EJECUTADAS TODAVÍA)
// Requisitos: Node 18+, Java 11+ y Firebase CLI.
//   npm install --save-dev @firebase/rules-unit-testing firebase
//   firebase emulators:exec --only firestore "node servidor/reglas.test.js"
// Cada prueba corresponde a un punto de la auditoría 2.1 (apartado 6).
// =====================================================

const fs = require("fs");
const path = require("path");
const { initializeTestEnvironment, assertFails, assertSucceeds } = require("@firebase/rules-unit-testing");
const { doc, getDoc, setDoc, updateDoc, serverTimestamp } = require("firebase/firestore");

async function main() {
  const env = await initializeTestEnvironment({
    projectId: "apex-gym-pruebas",
    firestore: { rules: fs.readFileSync(path.join(__dirname, "firestore.rules"), "utf8") }
  });

  // Datos iniciales escritos como "servidor" (sin reglas)
  await env.withSecurityRulesDisabled(async function (ctx) {
    const db = ctx.firestore();
    await setDoc(doc(db, "perfiles/ana"), { usuario: "ana", visibilidad: "privado", amigos: [], compartirEntrenos: true, rango: 3 });
    await setDoc(doc(db, "perfiles/beto"), { usuario: "beto", visibilidad: "publico", amigos: [], compartirEntrenos: false, rango: 2 });
    await setDoc(doc(db, "perfiles/carla"), { usuario: "carla", visibilidad: "publico", amigos: [], compartirEntrenos: true, rango: 4 });
    await setDoc(doc(db, "verificaciones/carla"), { mayor16: true });
    await setDoc(doc(db, "verificaciones/beto"), { mayor16: true });
    await setDoc(doc(db, "posts/privado1"), { autorId: "ana", tipo: "entreno", texto: "solo yo", fecha: new Date() });
    await setDoc(doc(db, "posts/privado1/comentarios/c1"), { autorId: "ana", texto: "secreto", fecha: new Date() });
    await setDoc(doc(db, "usuarios/dani"), { perfil: { edad: 30 } });
  });

  const resultados = [];
  async function prueba(nombre, fn) {
    try { await fn(); resultados.push("✓ " + nombre); }
    catch (e) { resultados.push("✗ " + nombre + " → " + e.message); }
  }
  const como = function (uid) { return env.authenticatedContext(uid).firestore(); };

  await prueba("6.1 No se leen comentarios de una publicación privada ajena", function () {
    return assertFails(getDoc(doc(como("carla"), "posts/privado1/comentarios/c1")));
  });
  await prueba("6.1 La autora sí lee sus comentarios", function () {
    return assertSucceeds(getDoc(doc(como("ana"), "posts/privado1/comentarios/c1")));
  });
  await prueba("6.2 Nadie puede cambiarse su rango público", function () {
    return assertFails(updateDoc(doc(como("carla"), "perfiles/carla"), { rango: 8 }));
  });
  await prueba("6.2 Sí puede cambiar su visibilidad", function () {
    return assertSucceeds(updateDoc(doc(como("carla"), "perfiles/carla"), { visibilidad: "amigos" }));
  });
  await prueba("6.3 Escribir edad en el perfil no permite publicar sin verificación", async function () {
    await setDoc(doc(como("dani"), "perfiles/dani"), { usuario: "dani", visibilidad: "publico", amigos: [], compartirEntrenos: true });
    return assertFails(setDoc(doc(como("dani"), "posts/d1"), { autorId: "dani", tipo: "entreno", texto: "hola", fecha: serverTimestamp() }));
  });
  await prueba("6.3 Nadie puede escribirse su propia verificación", function () {
    return assertFails(setDoc(doc(como("dani"), "verificaciones/dani"), { mayor16: true }));
  });
  await prueba("6.4 Sin «compartir entrenos» no se publica", function () {
    return assertFails(setDoc(doc(como("beto"), "posts/b1"), { autorId: "beto", tipo: "entreno", texto: "hola", fecha: serverTimestamp() }));
  });
  await prueba("6.4 Con todo correcto sí se publica", function () {
    return assertSucceeds(setDoc(doc(como("carla"), "posts/c1"), { autorId: "carla", tipo: "entreno", texto: "hola", fecha: serverTimestamp() }));
  });
  await prueba("No se puede publicar en nombre de otro", function () {
    return assertFails(setDoc(doc(como("carla"), "posts/c2"), { autorId: "beto", tipo: "entreno", texto: "hola", fecha: serverTimestamp() }));
  });
  await prueba("6.5 Se puede denunciar con motivo válido", function () {
    return assertSucceeds(setDoc(doc(como("carla"), "denuncias/x1"), { postId: "privado1", autorId: "ana", denuncianteId: "carla", motivo: "spam", detalle: "", estado: "pendiente", fecha: serverTimestamp() }));
  });
  await prueba("6.5 Un usuario normal no puede leer denuncias", function () {
    return assertFails(getDoc(doc(como("carla"), "denuncias/x1")));
  });
  await prueba("6.5 Un moderador sí puede leerlas", function () {
    return assertSucceeds(getDoc(doc(env.authenticatedContext("mod", { moderador: true }).firestore(), "denuncias/x1")));
  });

  // ---------- Auditoría 2.1.1 (puntos A, B y C) ----------
  await prueba("A. No se pueden añadir campos inventados al perfil", function () {
    return assertFails(updateDoc(doc(como("carla"), "perfiles/carla"), { verificado: true }));
  });
  await prueba("A. No se puede poner un nombre de usuario con caracteres raros", function () {
    return assertFails(updateDoc(doc(como("carla"), "perfiles/carla"), { usuario: "<script>" }));
  });
  await prueba("B. Si yo bloqueo a alguien, tampoco veo sus publicaciones", async function () {
    await env.withSecurityRulesDisabled(async function (ctx) {
      await setDoc(doc(ctx.firestore(), "posts/publico1"), { autorId: "carla", tipo: "entreno", texto: "hola", fecha: new Date() });
    });
    await setDoc(doc(como("beto"), "usuarios/beto/bloqueados/carla"), { fecha: new Date() });
    return assertFails(getDoc(doc(como("beto"), "posts/publico1")));
  });
  await prueba("C. No se puede denunciar una publicación que no existe", function () {
    return assertFails(setDoc(doc(como("carla"), "denuncias/x2"), { postId: "no-existe", autorId: "ana", denuncianteId: "carla", motivo: "spam", detalle: "", estado: "pendiente", fecha: serverTimestamp() }));
  });
  await prueba("C. No se puede atribuir la publicación a otro autor", function () {
    return assertFails(setDoc(doc(como("carla"), "denuncias/x3"), { postId: "privado1", autorId: "beto", denuncianteId: "carla", motivo: "spam", detalle: "", estado: "pendiente", fecha: serverTimestamp() }));
  });

  console.log(resultados.join("\n"));
  await env.cleanup();
  process.exit(resultados.some(function (r) { return r[0] === "✗"; }) ? 1 : 0);
}

main();
