// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebaseの設定情報
const firebaseConfig = {
  apiKey: "AIzaSyAnVrfyfnYQ3T7c6usMDFyXWzktf3stTwM",
  authDomain: "mathapp-5fc91.firebaseapp.com",
  projectId: "mathapp-5fc91",
  storageBucket: "mathapp-5fc91.appspot.com", // 修正: storageBucket の末尾
  messagingSenderId: "199556206031",
  appId: "1:199556206031:web:dd4d3f530c3eaaf2e8d6ba"
};

// Firebaseの初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);  // Firestoreの初期化
const auth = getAuth(app);  // 認証機能の初期化
const provider = new GoogleAuthProvider();  // Google認証プロバイダの初期化

// Firestore（db）、認証（auth）、Googleプロバイダ（provider）をエクスポート
export { db, auth, provider };
