# Stripe Webhook設定ガイド

## 現在の問題
決済完了後にWebhookイベントがローカルサーバーに届かないため、プランの自動更新が行われていません。

## 解決方法

### 1. 開発環境での設定（ngrokを使用）

1. **ngrokのインストール**
   ```bash
   # Homebrewの場合
   brew install ngrok
   
   # 他の方法はhttps://ngrok.com/downloadから
   ```

2. **ngrokでローカルサーバーを公開**
   ```bash
   # Webhookサーバーが起動している状態で別ターミナルで実行
   ngrok http 4242
   ```

3. **Stripe DashboardでWebhook URLを設定**
   - https://dashboard.stripe.com/webhooks
   - 「Add endpoint」をクリック
   - Endpoint URL: `https://xxxx-xxx-xxx-xxx-xxx.ngrok.io/webhook` (ngrokが表示するHTTPS URL)
   - Events to send: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

4. **環境変数を更新**
   - Stripe DashboardからWebhook Signing Secretをコピー
   - `.env`ファイルの`VITE_STRIPE_WEBHOOK_SECRET`を更新

### 2. 本番環境での設定

本番環境では実際のドメインを使用：
```
https://yourdomain.com/api/webhook
```

## 手動でのプラン更新

緊急時は以下のスクリプトで手動更新可能：
```bash
cd src/server
node manual-update-plan.js
```

## 検証方法

1. **Webhookのテスト**
   ```bash
   # Stripeからテストイベントを送信
   stripe trigger checkout.session.completed
   ```

2. **ユーザープランの確認**
   ```bash
   # Firestoreでユーザードキュメントを確認
   # plan: "premium"
   # subscription.status: "active"
   ```

## 注意点

- 開発環境では`ngrok`のURLが変わるたびにStripe DashboardのWebhook URLを更新する必要があります
- Webhook Signing Secretは環境ごとに異なります
- テスト環境と本番環境で異なるWebhookエンドポイントを設定してください 