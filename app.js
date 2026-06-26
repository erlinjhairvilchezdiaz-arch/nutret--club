/* =========================================================
   Lógica de la tarjeta de fidelidad (vista del cliente)
   Solo LEE datos de Firestore. Quien suma sellos es el staff
   desde admin.html (con su cuenta de Firebase Auth).
   ========================================================= */

const TOTAL_SELLOS = 7;
let unsubscribe = null;

const form = document.getElementById("lookup-form");
const input = document.getElementById("phone-input");
const errorText = document.getElementById("error-text");
const cardPanel = document.getElementById("card-panel");
const notFound = document.getElementById("not-found");
const nombreEl = document.getElementById("cliente-nombre");
const progressText = document.getElementById("progress-text");
const rewardBanner = document.getElementById("reward-banner");
const medal = document.getElementById("medal");

function soloDigitos(valor) {
  return valor.replace(/\D/g, "");
}

function pintarTarjeta(data) {
  const sellos = Math.min(data.sellos || 0, TOTAL_SELLOS - 1);
  const premios = data.premios || 0;

  for (let i = 1; i <= TOTAL_SELLOS; i++) {
    const stamp = document.querySelector(`.stamp[data-i="${i}"]`);
    stamp.classList.toggle("filled", i <= sellos);
  }

  medal.classList.toggle("unlocked", premios > 0);

  if (premios > 0) {
    rewardBanner.classList.add("show");
    rewardBanner.textContent = premios === 1
      ? "🎉 ¡Tienes 1 premio listo! Muestra esta pantalla a nuestro staff para canjear tu batido + té gratis."
      : `🎉 ¡Tienes ${premios} premios listos! Muéstralos a nuestro staff para canjearlos.`;
  } else {
    rewardBanner.classList.remove("show");
  }

  const faltan = TOTAL_SELLOS - sellos;
  progressText.innerHTML = `Llevas <strong>${sellos} de ${TOTAL_SELLOS}</strong> sellos · te faltan <strong>${faltan}</strong> para tu batido + té gratis`;

  if (nombreEl) {
    nombreEl.textContent = data.nombre ? `Hola, ${data.nombre} 👋` : "Tu tarjeta";
  }
}

function mostrarNoEncontrado() {
  cardPanel.classList.remove("show");
  notFound.classList.add("show");
}

function buscarCliente(telefono) {
  if (unsubscribe) { unsubscribe(); unsubscribe = null; }
  notFound.classList.remove("show");

  unsubscribe = db.collection("clientes").doc(telefono).onSnapshot(
    (snap) => {
      if (!snap.exists) {
        cardPanel.classList.remove("show");
        mostrarNoEncontrado();
        return;
      }
      notFound.classList.remove("show");
      cardPanel.classList.add("show");
      pintarTarjeta(snap.data());
    },
    (err) => {
      errorText.textContent = "No se pudo cargar tu tarjeta. Intenta de nuevo.";
      errorText.classList.add("show");
      console.error(err);
    }
  );
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  errorText.classList.remove("show");
  const telefono = soloDigitos(input.value);

  if (telefono.length < 6) {
    errorText.textContent = "Ingresa un número de celular válido.";
    errorText.classList.add("show");
    return;
  }

  buscarCliente(telefono);
});
