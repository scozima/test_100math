import { auth, db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { stripePromise } from './stripe';

// 顧客ポータルセッションを作成する関数
export async function createPortalSession(userId) {
  try {
    // ユーザー情報を取得
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error('ユーザーが見つかりません');
    }
    
    const userData = userSnap.data();
    
    if (!userData.stripeCustomerId) {
      throw new Error('Stripe顧客IDが見つかりません');
    }
    
    // 顧客ポータルセッションを作成
    const response = await fetch('http://localhost:4242/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'ポータルセッションの作成に失敗しました');
    }

    const { url } = await response.json();
    return { url };
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw new Error(error.message || '予期せぬエラーが発生しました');
  }
}

// サブスクリプションを開始する関数
export async function startSubscription() {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('ユーザーが認証されていません');
    }

    console.log('Starting subscription for user:', user.uid);

    const response = await fetch('http://localhost:4242/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ userId: user.uid }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server error:', errorData);
      throw new Error(errorData.error || 'チェックアウトの開始に失敗しました');
    }

    const { id } = await response.json();
    if (!id) {
      throw new Error('セッションIDが取得できませんでした');
    }
    
    // Stripeのチェックアウトページにリダイレクト
    const stripe = await stripePromise;
    const { error } = await stripe.redirectToCheckout({
      sessionId: id
    });
    
    if (error) {
      console.error('Redirect error:', error);
      throw new Error(error.message || 'チェックアウトページへのリダイレクトに失敗しました');
    }
    
    return id;
  } catch (error) {
    console.error('チェックアウトの開始に失敗しました:', error);
    throw error;
  }
}

// サブスクリプションを管理する関数
export async function manageSubscription() {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('ログインが必要です');
    }
    
    const { url } = await createPortalSession(user.uid);
    
    // 顧客ポータルにリダイレクト
    window.location.href = url;
  } catch (error) {
    console.error('Error managing subscription:', error);
    throw new Error(error.message || '予期せぬエラーが発生しました');
  }
}

export async function openCustomerPortal() {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('ユーザーが認証されていません');
    }

    console.log('Opening customer portal for user:', user.uid);

    const response = await fetch('http://localhost:4242/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ userId: user.uid }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server error:', errorData);
      throw new Error(errorData.error || '顧客ポータルの開始に失敗しました');
    }

    const { url } = await response.json();
    window.location.href = url;
  } catch (error) {
    console.error('顧客ポータルの開始に失敗しました:', error);
    throw error;
  }
} 