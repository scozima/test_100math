import express from 'express';
import bodyParser from 'body-parser';
import { stripe } from './stripe-server.js';
import { createCheckoutSession } from './create-checkout-session.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
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
      return_url: `${process.env.APP_URL}/dashboard`,
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

  // イベントの処理
  let eventData;
  switch (event.type) {
    case 'checkout.session.completed':
      eventData = event.data.object;
      console.log('支払い完了:', eventData);
      // ここでユーザーのサブスクリプション状態を更新
      break;
    case 'customer.subscription.updated':
      eventData = event.data.object;
      console.log('サブスクリプション更新:', eventData);
      break;
    case 'customer.subscription.deleted':
      eventData = event.data.object;
      console.log('サブスクリプション削除:', eventData);
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