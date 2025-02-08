// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebaseの設定情報
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebaseの初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);  // Firestoreの初期化
const auth = getAuth(app);  // 認証機能の初期化
const provider = new GoogleAuthProvider();  // Google認証プロバイダの初期化

// Firestore（db）、認証（auth）、Googleプロバイダ（provider）をエクスポート
export { db, auth, provider };