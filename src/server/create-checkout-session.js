import { stripe } from './stripe-server.js';
import { doc, getDoc, db } from './firebase-admin.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import process from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 環境変数を読み込む
dotenv.config({ path: join(__dirname, '../../.env') });

export async function createCheckoutSession(userId) {
  try {
    console.log('=== Checkout Session Creation Debug ===');
    console.log('User ID:', userId);
    console.log('Stripe API Key Mode:', process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ? 'test' : 'live');
    console.log('Price ID being used:', process.env.STRIPE_PRICE_ID);
    console.log('Stripe API Version:', stripe.getApiField('version'));
    
    // ユーザー情報を取得
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      console.error('User document not found');
      throw new Error('ユーザーが見つかりません');
    }
    
    const userData = userSnap.data();
    console.log('User data:', {
      email: userData.email,
      hasStripeCustomerId: !!userData.stripeCustomerId
    });
    
    // 古いカスタマーIDをクリア
    if (userData.stripeCustomerId) {
      console.log('Clearing old customer ID:', userData.stripeCustomerId);
      await userRef.update({
        stripeCustomerId: null
      });
    }
    
    // 新しい顧客を作成
    console.log('Creating new Stripe customer...');
    const customer = await stripe.customers.create({
      email: userData.email,
      metadata: {
        firebaseUID: userId
      }
    });
    console.log('New customer created:', customer.id);
    
    // Firestoreに新しい顧客IDを保存
    await userRef.update({
      stripeCustomerId: customer.id
    });
    
    // 価格の存在確認
    try {
      const price = await stripe.prices.retrieve(process.env.STRIPE_PRICE_ID);
      console.log('Price details:', {
        id: price.id,
        amount: price.unit_amount,
        currency: price.currency,
        type: price.type
      });
    } catch (error) {
      console.error('Error retrieving price:', error.message);
      throw error;
    }
    
    // チェックアウトセッションを作成
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/canceled`,
      metadata: {
        firebaseUID: userId
      }
    });
    
    console.log('Checkout session created successfully:', session.id);
    console.log('Session details:', {
      id: session.id,
      success_url: session.success_url,
      cancel_url: session.cancel_url,
      url: session.url
    });
    return session;
  } catch (error) {
    console.error('Error in createCheckoutSession:', error);
    console.error('Full error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      param: error.param,
      detail: error.detail
    });
    throw error;
  }
} 