/* =========================================================
   Panel de staff — requiere iniciar sesión (Firebase Auth)
   ========================================================= */

const TOTAL_SELLOS = 7;
let unsubscribeCliente = null;
let telefonoActual = null;

const loginBox = document.getElementById("login-box");
const panelBox = document.getElementById("panel-box");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const logoutBtn = document.getElementById("logout-btn");

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const clienteCard = document.getElementById("cliente-card");
const clienteNoExiste = document.getElementById("cliente-no-existe");
const crearForm = document.getElementById("crear-form");
const nombreNuevoInput = document.getElementById("nombre-nuevo");

const dataSellos = document.getElementById("data-sellos");
const dataPremios = document.getElementById("data-premios");
const dataNombre = document.getElementById("data-nombre");
const dataTelefono = document.getElementById("data-telefono");

const btnAgregarSello = document.getElementById("btn-agregar-sello");
const btnCanjear = document.getElementById("btn-canjear");

const toast = document.getElementById("toast");

function soloDigitos(valor) {
  return valor.replace(/\D/g, "");
}

function mostrarToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2800);
}

/* ---------- auth ---------- */

auth.onAuthStateChanged((user) => {
  if (user) {
    loginBox.style.display = "none";
    panelBox.style.display = "block";
  } else {
    loginBox.style.display = "block";
    panelBox.style.display = "none";
    if (unsubscribeCliente) { unsubscribeCliente(); unsubscribeCliente = null; }
  }
});

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  loginError.classList.remove("show");
  const email = document.getElementById("login-email").value.trim();
  const pass = document.getElementById("login-pass").value;

  auth.signInWithEmailAndPassword(email, pass).catch((err) => {
    loginError.textContent = "Correo o contraseña incorrectos.";
    loginError.classList.add("show");
    console.error(err);
  });
});

logoutBtn.addEventListener("click", () => auth.signOut());

/* ---------- búsqueda de cliente ---------- */

function pintarCliente(data, telefono) {
  clienteNoExiste.classList.remove("show");
  clienteCard.classList.add("show");

  dataNombre.textContent = data.nombre || "(sin nombre)";
  dataTelefono.textContent = telefono;
  dataSellos.textContent = `${data.sellos || 0} de ${TOTAL_SELLOS}`;
  dataPremios.textContent = data.premios || 0;

  btnCanjear.disabled = !(data.premios > 0);
}

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const telefono = soloDigitos(searchInput.value);
  if (telefono.length < 6) {
    mostrarToast("Ingresa un número válido.");
    return;
  }

  telefonoActual = telefono;
  clienteCard.classList.remove("show");
  clienteNoExiste.classList.remove("show");

  if (unsubscribeCliente) { unsubscribeCliente(); unsubscribeCliente = null; }

  unsubscribeCliente = db.collection("clientes").doc(telefono).onSnapshot(
    (snap) => {
      if (!snap.exists) {
        clienteCard.classList.remove("show");
        clienteNoExiste.classList.add("show");
        return;
      }
      pintarCliente(snap.data(), telefono);
    },
    (err) => {
      mostrarToast("Error al buscar cliente.");
      console.error(err);
    }
  );
});

/* ---------- crear cliente nuevo ---------- */

crearForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!telefonoActual) return;

  db.collection("clientes").doc(telefonoActual).set({
    nombre: nombreNuevoInput.value.trim(),
    sellos: 0,
    premios: 0,
    creado: firebase.firestore.FieldValue.serverTimestamp(),
    ultimaVisita: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    mostrarToast("Cliente creado ✅");
    nombreNuevoInput.value = "";
  }).catch((err) => {
    mostrarToast("Error al crear cliente.");
    console.error(err);
  });
});

/* ---------- agregar sello ---------- */

btnAgregarSello.addEventListener("click", () => {
  if (!telefonoActual) return;
  const ref = db.collection("clientes").doc(telefonoActual);

  db.runTransaction(async (t) => {
    const snap = await t.get(ref);
    if (!snap.exists) throw new Error("El cliente ya no existe.");

    const data = snap.data();
    let sellos = (data.sellos || 0) + 1;
    let premios = data.premios || 0;
    let desbloqueado = false;

    if (sellos >= TOTAL_SELLOS) {
      sellos = 0;
      premios += 1;
      desbloqueado = true;
    }

    t.update(ref, {
      sellos,
      premios,
      ultimaVisita: firebase.firestore.FieldValue.serverTimestamp()
    });

    return desbloqueado;
  }).then((desbloqueado) => {
    mostrarToast(desbloqueado ? "🎉 ¡Sello completado! Premio desbloqueado" : "Sello agregado ✅");
  }).catch((err) => {
    mostrarToast(err.message || "Error al agregar sello.");
    console.error(err);
  });
});

/* ---------- canjear premio ---------- */

btnCanjear.addEventListener("click", () => {
  if (!telefonoActual) return;
  const ref = db.collection("clientes").doc(telefonoActual);

  db.runTransaction(async (t) => {
    const snap = await t.get(ref);
    if (!snap.exists) throw new Error("El cliente ya no existe.");
    const premios = snap.data().premios || 0;
    if (premios <= 0) throw new Error("No hay premios disponibles.");
    t.update(ref, { premios: premios - 1 });
  }).then(() => {
    mostrarToast("Premio canjeado 🥤🍵");
  }).catch((err) => {
    mostrarToast(err.message || "Error al canjear premio.");
    console.error(err);
  });
});
