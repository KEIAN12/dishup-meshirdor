
export enum PlanType {
  FREE = 'お試し',
  LIGHT = 'ライト',
  STANDARD = 'スタンダード',
  PRO = 'プロ'
}

export enum GenerationMode {
  MENU = 'MENU',
  SNS = 'SNS'
}

export interface PlanConfig {
  id: PlanType;
  name: string;
  price: string;
  priceValue: number;
  limit: number;
  description: string;
  badge?: string;
  stripeLink?: string; // Add Stripe Link
  features: string[];
}

export interface UserState {
  plan: PlanType;
  creditsUsed: number;
}

export interface User {
  userId: string;
  email: string;
  stripeCustomerId?: string;
  plan: PlanType;
  creditsUsed: number;
  subscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export enum AspectRatio {
  FOUR_THREE = '4:3',    // メニュー表用
  ONE_ONE = '1:1',       // インスタ投稿用
  NINE_SIXTEEN = '9:16'  // ストーリーズ用
}

export interface GalleryItem {
  id: string;
  originalImageUrl: string;
  generatedImageUrl: string;
  mode: GenerationMode;
  aspectRatio: AspectRatio;
  createdAt: string;
}

export interface AssetItem {
  id: string;
  name: string; // "店舗写真" or "テーブル写真"
  imageUrl: string;
  type: 'store' | 'table';
  createdAt: string;
}
