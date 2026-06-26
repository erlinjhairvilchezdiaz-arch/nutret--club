/* =========================================================
   CONFIGURACIÓN DE FIREBASE
   =========================================================
   Reemplaza los valores de abajo con los de TU proyecto.
   Los encuentras en:
   Firebase Console > ⚙️ Configuración del proyecto > Tus apps > Web
   (Instrucciones completas en README.md, Paso 2)
   ========================================================= */

const firebaseConfig = {
  apiKey: "AIzaSyBKvi144N5PUILNrBMUhJNiTvhF0qAobcM",
  authDomain: "nutrete-club.firebaseapp.com",
  projectId: "nutrete-club",
  storageBucket: "nutrete-club.firebasestorage.app",
  messagingSenderId: "252240040705",
  appId: "1:252240040705:web:916895a6b5367070b38100",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
