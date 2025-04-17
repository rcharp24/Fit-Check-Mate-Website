import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBxJoWj3alk1DsOalfSKBri2H8xVbtwP_o",
    authDomain: "fitcheckmate-1d925.firebaseapp.com",
    projectId: "fitcheckmate-1d925",
    storageBucket: "fitcheckmate-1d925.firebasestorage.app",
    messagingSenderId: "1049387259052",
    appId: "1:1049387259052:web:301e32d84460aa05c3fb09"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
