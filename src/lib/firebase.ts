// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getStripePayments } from "@stripe/firestore-stripe-payments";

// Your Firebase project configuration.
const firebaseConfig = {
  apiKey: "AIzaSyDFprvj82lzHI-037mpqW51SyLrs6MC85E",
  authDomain: "mirrornetv2.firebaseapp.com",
  projectId: "mirrornetv2",
  storageBucket: "mirrornetv2.appspot.com",
  messagingSenderId: "715585417729",
  appId: "1:715585417729:web:19a5b571a86bc181a98600",
  measurementId: "G-LJW6HK1XBP"
};

// A more robust way to initialize Firebase, especially for server-side code.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();


const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();
const payments = getStripePayments(app, {
  productsCollection: "products",
  customersCollection: "users",
});


export { app, auth, db, storage, googleProvider, payments };
