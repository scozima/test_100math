// AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import { auth } from "../firebase"; // firebase.jsからインポート
import { onAuthStateChanged, signOut } from "firebase/auth"; // signOutをインポート

// Contextの作成
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);  // userをnullに初期化
  const [loading, setLoading] = useState(true);  // ローディング状態を追加

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // console.log("User authenticated:", user); // デバッグ: ユーザー情報が来るか確認
        setUser(user);
      } else {
        // console.log("No user authenticated");
        setUser(null);
      }
      setLoading(false);  // ユーザー情報が取得できたらローディングを解除
    });

    return unsubscribe; // コンポーネントがアンマウントされるときにリスナーをクリーンアップ
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
