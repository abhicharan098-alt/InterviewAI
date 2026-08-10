export type HairConcernType = 
  | 'dry'
  | 'damaged'
  | 'hairfall'
  | 'frizz'
  | 'color'
  | 'scalp'
  | 'smoothing'
  | 'dandruff'
  | 'curl'
  | 'thinning'
  | 'straightening';

export interface Ingredient {
  name: string;
  purity: string;
  source: string;
  benefit: string;
  icon: string;
}

export interface ProductVariant {
  id: string;
  volume: string;
  price: number;
  inStock: boolean;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  price: number; // In USD base
  priceFormatted: string;
  rating: number;
  reviewCount: number;
  concern: HairConcernType;
  category: 'neoplex' | 'neoplastia' | 'botox' | 'keratin' | 'marula' | 'argan' | 'quinoa' | 'scalp' | 'damage' | 'curl' | 'styling' | 'fibers' | 'silver' | 'ampoule' | 'tools';
  badge?: string;
  description: string;
  volume: string;
  bottleColor: string;
  capColor: string;
  seriesColor: string;
  ingredients: Ingredient[];
  benefits: string[];
  howToUse: string;
  clinicalResults: { metric: string; value: string }[];
  image: string;
  isBestseller?: boolean;
  inStock: boolean;
  variants?: ProductVariant[];
  reviewsList?: ProductReview[];
  badgesList?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface HairDiagnosticAnswer {
  texture: 'fine' | 'medium' | 'coarse' | 'wavy' | 'curly';
  damageLevel: 'virgin' | 'mild' | 'severe' | 'bleached';
  scalpState: 'normal' | 'oily' | 'dry' | 'sensitive';
  primaryGoal: 'shine' | 'growth' | 'repair' | 'volume' | 'color_lock' | 'smoothing';
}

export interface SalonPartner {
  name: string;
  city: string;
  country: string;
  rating: number;
  verified: boolean;
  image: string;
}
