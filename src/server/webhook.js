import express from 'express';
import bodyParser from 'body-parser';
import { stripe } from './stripe-server.js';
import { createCheckoutSession } from './create-checkout-session.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import process from 'process';
import { doc, getDoc, db } from './firebase-admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 環境変数を読み込む
dotenv.config({ path: join(__dirname, '../../.env') });

const app = express();

// CORSを有効化（bodyParserの前に配置）
app.use((req, res, next) => {
  // 開発環境のオリジン
  const allowedOrigins = ['http://localhost:5173'];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  }

  // OPTIONSリクエストの処理
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// bodyParserの設定
app.use(bodyParser.json());

// ルートパスを追加
app.get('/', (req, res) => {
  res.send('Webhookサーバーが動作中です');
});

// チェックアウトセッションを作成するエンドポイント
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { userId } = req.body;
    console.log('Received request for user:', userId);
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);

    const session = await createCheckoutSession(userId);
    console.log('Checkout session created:', session.id);
    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: error.message || 'チェックアウトセッションの作成に失敗しました',
      details: error.stack
    });
  }
});

// 顧客ポータルセッション作成エンドポイント
app.post('/create-portal-session', async (req, res) => {
  try {
    const { userId } = req.body;
    
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
    const session = await stripe.billingPortal.sessions.create({
      customer: userData.stripeCustomerId,
      return_url: `http://localhost:5173/dashboard`,
    });
    
    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.VITE_STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('=== Webhook Event Received ===');
  console.log('Event Type:', event.type);
  console.log('Event ID:', event.id);

  // イベントの処理
  let eventData;
  switch (event.type) {
    case 'checkout.session.completed':
      eventData = event.data.object;
      console.log('支払い完了:', eventData);
      
      try {
        // サブスクリプション情報を取得
        const subscription = await stripe.subscriptions.retrieve(eventData.subscription);
        console.log('Subscription retrieved:', subscription.id);
        
        // ユーザーのFirebaseUIDを取得
        const firebaseUID = eventData.metadata.firebaseUID;
        console.log('Firebase UID from metadata:', firebaseUID);
        
        if (firebaseUID) {
          // Firestoreのユーザードキュメントを更新
          const userRef = doc(db, 'users', firebaseUID);
          
          const updateData = {
            plan: 'premium',
            stripeCustomerId: eventData.customer,
            subscription: {
              id: subscription.id,
              status: subscription.status,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              createdAt: new Date(),
            },
            updatedAt: new Date(),
          };
          
          console.log('Updating user document with:', updateData);
          
          // Firebase Admin SDKでは .set() を使用して更新
          await userRef.set(updateData, { merge: true });
          
          console.log(`✅ ユーザー ${firebaseUID} のプランをプレミアムに更新しました`);
        } else {
          console.error('❌ Firebase UIDがメタデータに見つかりません');
          console.log('Available metadata:', eventData.metadata);
        }
      } catch (error) {
        console.error('❌ プラン更新エラー:', error);
        console.error('Error details:', error.message);
      }
      break;
      
    case 'customer.subscription.updated':
      eventData = event.data.object;
      console.log('サブスクリプション更新:', eventData);
      
      try {
        // 顧客IDからFirebaseのユーザーを検索
        const usersSnapshot = await db.collection('users')
          .where('stripeCustomerId', '==', eventData.customer)
          .get();
        
        if (!usersSnapshot.empty) {
          const userDoc = usersSnapshot.docs[0];
          const plan = eventData.status === 'active' ? 'premium' : 'standard';
          
          await userDoc.ref.set({
            plan,
            subscription: {
              id: eventData.id,
              status: eventData.status,
              currentPeriodEnd: new Date(eventData.current_period_end * 1000),
              updatedAt: new Date(),
            },
            updatedAt: new Date(),
          }, { merge: true });
          
          console.log(`✅ ユーザー ${userDoc.id} のプランを ${plan} に更新しました`);
        } else {
          console.log('❌ 顧客IDに対応するユーザーが見つかりません:', eventData.customer);
        }
      } catch (error) {
        console.error('❌ サブスクリプション更新エラー:', error);
      }
      break;
      
    case 'customer.subscription.deleted':
      eventData = event.data.object;
      console.log('サブスクリプション削除:', eventData);
      
      try {
        // 顧客IDからFirebaseのユーザーを検索
        const usersSnapshot = await db.collection('users')
          .where('stripeCustomerId', '==', eventData.customer)
          .get();
        
        if (!usersSnapshot.empty) {
          const userDoc = usersSnapshot.docs[0];
          
          await userDoc.ref.set({
            plan: 'standard',
            subscription: {
              status: 'canceled',
              canceledAt: new Date(),
            },
            updatedAt: new Date(),
          }, { merge: true });
          
          console.log(`✅ ユーザー ${userDoc.id} のプランをスタンダードに戻しました`);
        }
      } catch (error) {
        console.error('❌ サブスクリプション削除エラー:', error);
      }
      break;
      
    default:
      console.log(`未処理のイベントタイプ: ${event.type}`);
  }

  res.json({ received: true });
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
  console.log(`Webhookサーバーが起動しました: http://localhost:${PORT}`);
}); 