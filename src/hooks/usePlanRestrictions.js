import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';

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
    const unsubscribe = db.collection('users').doc(user.uid)
      .onSnapshot((doc) => {
        if (doc.exists) {
          const userData = doc.data();
          setUserPlan(userData.plan || 'standard');
          
          // カスタム問題の数を取得
          db.collection('customProblems')
            .where('createdBy', '==', user.uid)
            .get()
            .then((snapshot) => {
              setCustomProblemCount(snapshot.size);
              setLoading(false);
            });
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