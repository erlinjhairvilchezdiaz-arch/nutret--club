/* =========================================================
   CONFIGURACIÓN DE FIREBASE
   =========================================================
   Reemplaza los valores de abajo con los de TU proyecto.
   Los encuentras en:
   Firebase Console > ⚙️ Configuración del proyecto > Tus apps > Web
   (Instrucciones completas en README.md, Paso 2)
   ========================================================= */

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
