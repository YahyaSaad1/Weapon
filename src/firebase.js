import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCuskdlit-Jla1pEu87m4YbATtgVj96e7g",
  authDomain: "weapons-management-system.firebaseapp.com",
  projectId: "weapons-management-system",
  storageBucket: "weapons-management-system.firebasestorage.app",
  messagingSenderId: "486079604449",
  appId: "1:486079604449:web:d7785944b80298f29e39a0",
  measurementId: "G-MJW03W18QK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore & Export Database Instance
export const db = getFirestore(app);