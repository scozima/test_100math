// src/context/AuthProvider.js
import React, { createContext, useState, useEffect } from "react";
import { auth } from "../firebase"; // firebase.jsからインポート
import { onAuthStateChanged } from "firebase/auth";

// Contextの作成
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Firebase Authentication のユーザーの状態を監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // console.log("Firebase Auth State Changed:", user); // ここでユーザー情報がどう変わっているかをログ
      setUser(user); // ユーザーがログインしていればuserが設定され、いなければnullが設定される
    });
    return unsubscribe; // クリーンアップ
  }, []);

  return (
    // Contextで user を提供する
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};
