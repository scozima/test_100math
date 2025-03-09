// src/context/AuthProvider.js
import React, { createContext, useState, useEffect } from "react";
import { auth } from "../firebase"; // firebase.jsからインポート
import { onAuthStateChanged } from "firebase/auth";

// Contextの作成と初期値の設定
export const AuthContext = createContext({
  user: null,
  loading: true,
  isAuthenticated: false
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // loading状態を追加

  // Firebase Authentication のユーザーの状態を監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // console.log("Firebase Auth State Changed:", user); // ここでユーザー情報がどう変わっているかをログ
      setUser(user); // ユーザーがログインしていればuserが設定され、いなければnullが設定される
      setLoading(false); // 認証状態の確認が完了したらloadingをfalseに
    });

    return () => unsubscribe(); // クリーンアップ
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
  };

  return (
    // Contextで user を提供する
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
