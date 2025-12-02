// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyANJqNP6uEcVlsSVi23Hm2JfrGxh4M9EwU",
  authDomain: "cyc-90818.firebaseapp.com",
  projectId: "cyc-90818",
  storageBucket: "cyc-90818.firebasestorage.app",
  messagingSenderId: "585016924965",
  appId: "1:585016924965:web:66e82b50b88d09d9fe98cc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

