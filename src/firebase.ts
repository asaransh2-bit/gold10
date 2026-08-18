import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAK9XDxcMliZdEuQhKi717DhptCK3Lrk",
  authDomain: "gold10-6d330.firebaseapp.com",
  projectId: "gold10-6d330",
  storageBucket: "gold10-6d330.firebasestorage.app",
  messagingSenderId: "393737360882",
  appId: "1:393737360882:web:1ef8b7241ab11dc6b6476b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
