// AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import { auth } from "../firebase"; // firebase.jsからインポート
import { onAuthStateChanged, signOut } from "firebase/auth"; // signOutをインポート

// Contextの作成
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);  // ローディング状態を追加

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);  // ユーザー情報が取得できたらローディングを解除
    });
    return unsubscribe;
  }, []);

  // ログアウト機能を追加
  const logout = async () => {
    await signOut(auth);
    setUser(null); // ログアウト後にuserをnullに設定
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
