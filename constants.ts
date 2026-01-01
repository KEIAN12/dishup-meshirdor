
import { PlanType, GenerationMode, PlanConfig } from './types';

// Using example.com for Stripe links as placeholders. In production, these would be real Stripe Payment Links.
export const STRIPE_LINK_LIGHT = "https://buy.stripe.com/test_light";
export const STRIPE_LINK_STANDARD = "https://buy.stripe.com/test_standard";
export const STRIPE_LINK_PRO = "https://buy.stripe.com/test_pro";

export const PLANS: Record<PlanType, PlanConfig> = {
  [PlanType.FREE]: {
    id: PlanType.FREE,
    name: 'お試し',
    price: '¥0',
    priceValue: 0,
    limit: 3,
    description: '画質確認・リード獲得',
    badge: '🔰',
    features: ['月3枚まで生成', '最高画質(2K)', '商用利用不可(透かし有)', '毎月リセット'],
    stripeLink: undefined
  },
  [PlanType.LIGHT]: {
    id: PlanType.LIGHT,
    name: 'ライト',
    price: '¥980',
    priceValue: 980,
    limit: 10,
    description: '個人・趣味',
    badge: undefined,
    features: ['月10枚まで生成', '最高画質(2K)', '商用利用完全OK', '1枚あたり98円'],
    stripeLink: STRIPE_LINK_LIGHT
  },
  [PlanType.STANDARD]: {
    id: PlanType.STANDARD,
    name: 'スタンダード',
    price: '¥2,980',
    priceValue: 2980,
    limit: 50,
    description: '個人飲食店 (主力)',
    badge: 'Popular',
    features: ['月50枚まで生成', '最高画質(2K)', '商用利用完全OK', '1枚あたり約60円'],
    stripeLink: STRIPE_LINK_STANDARD
  },
  [PlanType.PRO]: {
    id: PlanType.PRO,
    name: 'プロ',
    price: '¥9,800',
    priceValue: 9800,
    limit: 200,
    description: '業者・代行',
    badge: 'Enterprise',
    features: ['月200枚まで生成', '最高画質(2K)', '商用利用完全OK', '1枚あたり49円'],
    stripeLink: STRIPE_LINK_PRO
  }
};

export const PROMPTS = {
  BASE: "Input is a food image. Output a high-quality food photography based on the original food shape and color. Do not change the ingredients. Output resolution: 2K standard.",
  [GenerationMode.MENU]: "Style: Commercial Food Photography with strong sizzle appeal (shizuru-kan). Lighting: Semi-backlight or backlight from window-side natural light, avoid front lighting. Create appetizing visual appeal that makes viewers want to eat immediately. Composition: 45-degree angle from above (matching natural eating perspective) or top-down flat lay, optimized for menu display. Emphasize food details by getting close-up, showing texture, gloss, and surface sheen. For hot dishes: show bubbling on hot plates or in pots. If steam is present, make it extremely subtle, barely visible, and natural - almost imperceptible, like a very light, thin wisp that doesn't distract from the food. For cold dishes: show water droplets on surface (like morning dew), use glassware to enhance freshness and moisture. Use black tableware for warm white foods (rice, noodles, soup) to enhance shine and contrast. Use glass tableware for cold dishes to show clarity and freshness. Focus on one main dish as the subject, use center composition or rule of thirds. Shot with 85mm lens equivalent, Studio-quality lighting with natural light enhancement, Clean bokeh background, High Resolution, Michelin Star Restaurant Quality. Make the food look irresistibly delicious with perfect sizzle appeal.",
  [GenerationMode.SNS]: "Style: Shot on iPhone 15 Pro or smartphone camera, authentic casual food photography for social media. Lighting: Natural window light (backlight or side-backlight preferred), bright location near window, avoid front lighting and fluorescent lighting. Composition: 45-degree angle from above (matching natural eating perspective), avoid center placement - position food to left or right side of frame, leave space for props. Use close-up or macro photography to capture food details and texture, shallow depth of field with blurred background. Props: Add small complementary items (side dishes, utensils, drinks) to enhance atmosphere but keep focus on main dish. Sizzle appeal: For hot dishes - show sizzling on hot plates, add warmth and juiciness. If steam is present, make it extremely subtle, barely visible, and natural - almost imperceptible, like a very light, thin wisp that doesn't distract from the food. For cold dishes - show water droplets like morning dew, use glassware to show freshness and moisture. Emphasize food texture, gloss, and surface sheen. Natural realistic colors, avoid over-processing. Instagram aesthetic, influencer style, authentic casual vibe, trendy but natural color grading. Make it look like a real smartphone photo taken at a cafe or restaurant, not overly professional."
};

export const STRIPE_LINK = "https://stripe.com";

// Stripe Price Lookup Keys
export const STRIPE_PRICE_LOOKUP_KEYS: Record<PlanType, string | undefined> = {
  [PlanType.FREE]: undefined,
  [PlanType.LIGHT]: 'light-plan',
  [PlanType.STANDARD]: 'standard-plan',
  [PlanType.PRO]: 'pro-plan',
}; 
