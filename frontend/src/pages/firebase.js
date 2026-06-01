import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD2jB377QPtN7fFnC-7PMEHg7s85Lp4kRc",
  authDomain: "hospital-management-syst-bbc73.firebaseapp.com",
  projectId: "hospital-management-syst-bbc73",
  storageBucket: "hospital-management-syst-bbc73.firebasestorage.app",
  messagingSenderId: "577793947838",
  appId: "1:577793947838:web:83f55b606b80f4e8aa86ef",
  measurementId: "G-H1D7GLXX5X",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);