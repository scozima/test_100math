import { stripe } from '@/lib/stripe-server';
import { db } from '@/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

// Viteでは通常APIルートは使用できないため、Firebase Functionsなどのサーバーレス関数として実装する必要があります
// この例では、実際のウェブフック処理の内容を示します

// ウェブフックイベントを処理する関数
export async function handleWebhookEvent(event) {
  try {
    // イベントタイプに基づいて処理
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // サブスクリプション情報を取得
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        
        // ユーザーのプランを更新
        const userRef = doc(db, 'users', session.metadata.firebaseUID);
        await updateDoc(userRef, {
          plan: 'premium',
          subscription: {
            id: subscription.id,
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            createdAt: new Date(),
          },
        });
        
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        
        // サブスクリプションの更新
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
          
          // ユーザーを検索
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('stripeCustomerId', '==', invoice.customer));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            
            // サブスクリプション情報を更新
            await updateDoc(doc(db, 'users', userDoc.id), {
              plan: 'premium',
              subscription: {
                ...userData.subscription,
                id: subscription.id,
                status: subscription.status,
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                updatedAt: new Date(),
              },
            });
          }
        }
        
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        // ユーザーを検索
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('stripeCustomerId', '==', subscription.customer));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          
          // プランをスタンダードに戻す
          await updateDoc(doc(db, 'users', userDoc.id), {
            plan: 'standard',
            'subscription.status': 'canceled',
            'subscription.canceledAt': new Date(),
          });
        }
        
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        
        // ユーザーを検索
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('stripeCustomerId', '==', subscription.customer));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          
          // ステータスに応じてプランを更新
          const plan = subscription.status === 'active' ? 'premium' : 'standard';
          
          await updateDoc(doc(db, 'users', userDoc.id), {
            plan,
            subscription: {
              ...userData.subscription,
              status: subscription.status,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              updatedAt: new Date(),
            },
          });
        }
        
        break;
      }
    }

    return { success: true };
  } catch (error) {
    console.error(`Webhook handler error: ${error.message}`);
    throw new Error(error.message);
  }
} 