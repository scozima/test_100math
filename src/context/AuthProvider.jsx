// src/context/AuthProvider.js
import React, { createContext, useState, useEffect } from "react";
import { auth, db } from "../firebase"; // firebase.jsからインポート
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Contextの作成と初期値の設定
export const AuthContext = createContext({
  user: null,
  loading: true,
  isAuthenticated: false
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ユーザー情報をFirestoreに保存する関数
  const saveUserToFirestore = async (user) => {
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // ユーザーが存在しない場合のみ新規作成
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        console.log('New user document created in Firestore');
      } else {
        // 既存のユーザー情報を更新
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
        console.log('User document updated in Firestore');
      }
    } catch (error) {
      console.error('Error saving user to Firestore:', error);
    }
  };

  // Firebase Authentication のユーザーの状態を監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await saveUserToFirestore(user);
      }
      setLoading(false);
    });

    return () => unsubscribe();
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
