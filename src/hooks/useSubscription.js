import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    // ユーザードキュメントを監視
    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          
          setSubscription({
            plan: userData?.plan || 'standard',
            status: userData?.subscription?.status,
            currentPeriodEnd: userData?.subscription?.currentPeriodEnd?.toDate?.(),
            isActive: userData?.plan === 'premium' && userData?.subscription?.status === 'active',
            isTrialing: userData?.subscription?.status === 'trialing',
            isCanceled: userData?.subscription?.status === 'canceled',
          });
        } else {
          // ユーザードキュメントが存在しない場合はデフォルト値を設定
          setSubscription({
            plan: 'standard',
            isActive: false,
          });
        }
        
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching subscription:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { subscription, loading };
} 