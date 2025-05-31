import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { doc, onSnapshot, collection, getDocs } from 'firebase/firestore';

export function usePlanRestrictions() {
  const { user } = useAuth();
  const [userPlan, setUserPlan] = useState('free');
  const [customProblemCount, setCustomProblemCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setUserPlan('free');
      setLoading(false);
      return;
    }

    // ユーザーのプラン情報を取得
    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, async (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        setUserPlan(userData.plan || 'standard');
        
        // カスタム問題の数を取得（正しいコレクションパスを使用）
        try {
          const userQuestionsRef = collection(db, 'users', user.uid, 'questions');
          const snapshot = await getDocs(userQuestionsRef);
          setCustomProblemCount(snapshot.size);
        } catch (error) {
          console.error('Error fetching custom problems count:', error);
          setCustomProblemCount(0);
        }
        setLoading(false);
      } else {
        setUserPlan('standard');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // 各機能の利用可否を判定する関数
  const canCreateCustomProblem = () => {
    if (userPlan === 'premium') return true;
    if (userPlan === 'standard') return customProblemCount < 1;
    return false;
  };

  const canAccessAnalytics = () => {
    return userPlan === 'premium';
  };

  return {
    userPlan,
    loading,
    canCreateCustomProblem,
    canAccessAnalytics,
    customProblemCount
  };
} 