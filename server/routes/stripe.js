import express from 'express';
import Stripe from 'stripe';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyIdToken } from '../services/firebaseAdmin.js';

// PlanType定数（TypeScriptから移植）
const PlanType = {
  FREE: 'お試し',
  LIGHT: 'ライト',
  STANDARD: 'スタンダード',
  PRO: 'プロ',
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Stripe初期化（環境変数がない場合はnull）
let stripe = null;
try {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (stripeSecretKey) {
    stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
    });
    console.log('Stripe initialized');
  } else {
    console.warn('⚠️  Stripe: STRIPE_SECRET_KEY環境変数が設定されていません。決済機能は使用できません。');
  }
} catch (error) {
  console.error('Error initializing Stripe:', error);
  console.warn('⚠️  Stripeの初期化に失敗しましたが、サーバーは起動を続けます。');
}

// Price Lookup Keys
const PRICE_LOOKUP_KEYS = {
  [PlanType.LIGHT]: 'light-plan',
  [PlanType.STANDARD]: 'standard-plan',
  [PlanType.PRO]: 'pro-plan',
};

// ユーザーデータの読み込み/書き込み（auth.jsと同じパターン）
const STORAGE_FILE = path.join(__dirname, '../storage/users.json');

async function readUsers() {
  try {
    const data = await fs.readFile(STORAGE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeUsers(users) {
  await fs.writeFile(STORAGE_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

async function getUserById(userId) {
  const users = await readUsers();
  return users.find(u => u.userId === userId);
}

async function findUserByStripeCustomerId(stripeCustomerId) {
  const users = await readUsers();
  return users.find(u => u.stripeCustomerId === stripeCustomerId);
}

// Stripe Price IDからプランタイプを取得
async function getPlanTypeFromStripePriceId(priceId) {
  if (!stripe || !priceId) {
    return PlanType.FREE;
  }
  
  try {
    // Priceオブジェクトを取得
    const price = await stripe.prices.retrieve(priceId);
    
    // lookup_keyからプランタイプを判定
    if (price.lookup_key === PRICE_LOOKUP_KEYS[PlanType.LIGHT]) {
      return PlanType.LIGHT;
    } else if (price.lookup_key === PRICE_LOOKUP_KEYS[PlanType.STANDARD]) {
      return PlanType.STANDARD;
    } else if (price.lookup_key === PRICE_LOOKUP_KEYS[PlanType.PRO]) {
      return PlanType.PRO;
    }
    
    // lookup_keyが一致しない場合はFREEを返す
    return PlanType.FREE;
  } catch (error) {
    console.error('Error retrieving price from Stripe:', error);
    return PlanType.FREE;
  }
}

async function updateUser(userId, updates) {
  const users = await readUsers();
  const userIndex = users.findIndex(u => u.userId === userId);
  
  if (userIndex === -1) {
    throw new Error('ユーザーが見つかりません');
  }
  
  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  await writeUsers(users);
  return users[userIndex];
}

// 認証ミドルウェア
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: '認証トークンが提供されていません' });
  }
  
  try {
    const decodedToken = await verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ error: '無効なトークンです' });
  }
}

// POST /api/stripe/create-checkout-session - Checkout Sessionを作成
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Stripeが初期化されていません。環境変数STRIPE_SECRET_KEYを設定してください。' });
  }
  
  try {
    const { planType } = req.body;
    const userId = req.user.uid;
    const userEmail = req.user.email;
    
    if (!planType || !PRICE_LOOKUP_KEYS[planType]) {
      return res.status(400).json({ error: '無効なプランです' });
    }
    
    const lookupKey = PRICE_LOOKUP_KEYS[planType];
    
    // Priceを取得
    const prices = await stripe.prices.list({
      lookup_keys: [lookupKey],
      expand: ['data.product'],
    });
    
    if (prices.data.length === 0) {
      return res.status(400).json({ error: 'プランの価格が見つかりません。Stripe DashboardでPriceを作成してください。' });
    }
    
    const price = prices.data[0];
    
    // ユーザー情報を取得
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }
    
    // 成功/キャンセルURLを構築
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/checkout/cancel`;
    
    // Checkout Sessionを作成
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: userEmail,
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId,
        planType: planType,
      },
    });
    
    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message || 'Checkout Sessionの作成に失敗しました' });
  }
});

// POST /api/stripe/webhook - Webhook処理
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Stripeが初期化されていません。環境変数STRIPE_SECRET_KEYを設定してください。' });
  }
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // テスト環境: 署名検証をスキップ（本番環境では必須）
      console.warn('⚠️  Webhook secret not set, skipping signature verification');
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  try {
    // イベントタイプに応じて処理
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const planType = session.metadata?.planType;
        
        if (userId && planType) {
          // ユーザーのプラン情報を更新
          await updateUser(userId, {
            plan: planType,
            stripeCustomerId: session.customer,
            subscriptionId: session.subscription,
            creditsUsed: 0, // プラン変更時にクレジットをリセット
          });
          
          console.log(`Subscription created for user ${userId}: ${planType}`);
        }
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        try {
          // 顧客IDからユーザーを取得
          const user = await findUserByStripeCustomerId(customerId);
          
          if (user && subscription.items && subscription.items.data.length > 0) {
            // サブスクリプションのPrice IDからプランタイプを取得
            const priceId = subscription.items.data[0].price.id;
            const newPlanType = await getPlanTypeFromStripePriceId(priceId);
            
            // ユーザーのプランを更新
            await updateUser(user.userId, {
              plan: newPlanType,
              subscriptionId: subscription.id,
            });
            
            console.log(`User ${user.userId} subscription updated to ${newPlanType} plan.`);
          }
        } catch (error) {
          console.error('Error processing subscription update:', error);
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        // サブスクリプションのキャンセルを処理
        // ユーザーをFREEプランに戻す
        try {
          const users = await readUsers();
          const user = users.find(u => u.subscriptionId === subscription.id);
          if (user) {
            await updateUser(user.userId, {
              plan: PlanType.FREE,
              subscriptionId: null,
            });
            console.log(`Subscription canceled for user ${user.userId}`);
          }
        } catch (error) {
          console.error('Error processing subscription deletion:', error);
        }
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook処理に失敗しました' });
  }
});

// POST /api/stripe/create-portal-session - 顧客ポータルセッションを作成
router.post('/create-portal-session', authenticateToken, async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Stripeが初期化されていません。環境変数STRIPE_SECRET_KEYを設定してください。' });
  }
  try {
    const userId = req.user.uid;
    const user = await getUserById(userId);
    
    if (!user || !user.stripeCustomerId) {
      return res.status(400).json({ error: 'Stripe顧客情報が見つかりません' });
    }
    
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const returnUrl = `${baseUrl}/dashboard`;
    
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });
    
    res.json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ error: error.message || 'ポータルセッションの作成に失敗しました' });
  }
});

export default router;

