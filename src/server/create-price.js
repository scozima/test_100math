import { stripe } from './stripe-server.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 環境変数を読み込む
dotenv.config({ path: join(__dirname, '../../.env') });

async function createPrice() {
  try {
    // まず製品を作成
    const product = await stripe.products.create({
      name: 'プレミアムプラン',
      description: '100マス計算アプリのプレミアム機能',
    });

    console.log('Product created:', product.id);

    // 製品に対して価格を作成
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 500, // 500円
      currency: 'jpy',
      recurring: {
        interval: 'month'
      },
    });

    console.log('Price created:', price.id);
    console.log('Please add this price ID to your .env file as STRIPE_PRICE_ID');
    
    return price;
  } catch (error) {
    console.error('Error creating price:', error);
  }
}

createPrice(); 