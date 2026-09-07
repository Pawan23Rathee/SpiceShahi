export type Page = 'home' | 'about' | 'products' | 'product-detail' | 'gallery' | 'contact';

export interface PackSize {
  size: string;
  weightInGrams: number;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  hindiName: string;
  category: 'single' | 'blend' | 'whole';
  categoryLabel: string;
  tagline: string;
  shortDesc: string;
  fullDesc: string;
  colorProfile: string;
  aromaNotes: string;
  culinaryUses: string[];
  qualityFeatures: string[];
  packSizes: PackSize[];
  heatLevel?: 1 | 2 | 3 | 4 | 5; // 1 = mild, 5 = fiery
  aromaIntensity: 1 | 2 | 3 | 4 | 5;
  badge?: string;
  imageUrl: string;
  origin: string;
  inStock: boolean;
  featured?: boolean;
  curcuminOrOilContent?: string;
}

export interface InstagramReel {
  id: string;
  title: string;
  caption: string;
  category: 'farm' | 'recipe' | 'process' | 'packaging';
  categoryLabel: string;
  thumbnailUrl: string;
  views: string;
  likes: string;
  instagramUrl: string;
  duration: string;
  tag: string;
}

export interface TrustBadge {
  icon: string;
  title: string;
  description: string;
}
