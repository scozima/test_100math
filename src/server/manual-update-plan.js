import { stripe } from './stripe-server.js';
import { doc, getDoc, db } from './firebase-admin.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 環境変数を読み込む
dotenv.config({ path: join(__dirname, '../../.env') });

async function updateUserPlan() {
  try {
    const firebaseUID = 'qd3UwhWJHdcEHxkifMyc7vTfN572';
    const subscriptionId = 'sub_1RUrXcJe9NviaIV71X0Hhaa0';
    
    console.log('=== Manual Plan Update ===');
    console.log('Firebase UID:', firebaseUID);
    console.log('Subscription ID:', subscriptionId);
    
    // サブスクリプション情報を取得
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    console.log('Subscription Status:', subscription.status);
    console.log('Current Period End:', new Date(subscription.current_period_end * 1000));
    
    // Firestoreのユーザードキュメントを更新
    const userRef = doc(db, 'users', firebaseUID);
    
    const updateData = {
      plan: 'premium',
      stripeCustomerId: subscription.customer,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        createdAt: new Date(),
      },
      updatedAt: new Date(),
    };
    
    console.log('Updating user document with:', updateData);
    
    // Firebase Admin SDKでドキュメントを更新（merge: true相当）
    await userRef.set(updateData, { merge: true });
    
    console.log(`✅ ユーザー ${firebaseUID} のプランをプレミアムに更新しました`);
    
    // 更新後のドキュメントを確認
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      console.log('更新後のユーザードキュメント:', JSON.stringify(userSnap.data(), null, 2));
    }
    
  } catch (error) {
    console.error('❌ プラン更新エラー:', error);
    console.error('Error details:', error.message);
  }
}

// スクリプトを実行
updateUserPlan(); 