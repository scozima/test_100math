import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAnVrfyfnYQ3T7c6usMDFyXWzktf3stTwM",
  authDomain: "mathapp-5fc91.firebaseapp.com",
  projectId: "mathapp-5fc91",
  storageBucket: "mathapp-5fc91.firebasestorage.app",
  messagingSenderId: "199556206031",
  appId: "1:199556206031:web:dd4d3f530c3eaaf2e8d6ba"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;