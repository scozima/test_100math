import { stripe } from '@/lib/stripe-server';
import { auth, db } from '@/firebase';
import { getDoc, setDoc, doc, updateDoc } from 'firebase/firestore';

// Viteでは通常APIルートは使用できないため、サーバーレス関数として実装する必要があります
// この例ではクライアントサイドから呼び出せるように関数をエクスポートします
export async function createCheckoutSession(userId) {
  try {
    // ユーザー情報を取得
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};
    
    // すでにプレミアムユーザーの場合は顧客ポータルにリダイレクト
    if (userData.plan === 'premium' && userData.subscription?.status === 'active') {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: userData.stripeCustomerId,
        return_url: `${window.location.origin}/dashboard`,
      });
      
      return { url: portalSession.url };
    }
    
    // Stripeの顧客IDを取得または作成
    let customerId = userData.stripeCustomerId;
    
    if (!customerId) {
      // ユーザー情報を取得
      const user = auth.currentUser;
      
      // 新しい顧客を作成
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.displayName || user.email,
        metadata: {
          firebaseUID: userId,
        },
      });
      
      customerId = customer.id;
      
      // ユーザードキュメントを更新
      await updateDoc(userRef, {
        stripeCustomerId: customerId,
      });
    }
    
    // 価格IDを設定（実際の価格IDに置き換える必要があります）
    const priceId = 'price_xxxxxxxxxxxxx'; // Stripeダッシュボードで作成した価格ID
    
    // チェックアウトセッションを作成
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${window.location.origin}/dashboard?subscription=success`,
      cancel_url: `${window.location.origin}/dashboard?subscription=canceled`,
      allow_promotion_codes: true,
      metadata: {
        firebaseUID: userId,
      },
    });
    
    return { url: session.url };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error(error.message);
  }
} 