import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Remplacez ces valeurs par celles de votre console Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyDummyKeyForPreviewMode",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "before-the-drop.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "before-the-drop",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "before-the-drop.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);