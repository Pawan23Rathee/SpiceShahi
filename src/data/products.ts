import { Product, InstagramReel } from '../types';

export const BUSINESS_WHATSAPP_NUMBER = '918307215421';
export const DISPLAY_WHATSAPP = '+91 83072 15421';
export const DISPLAY_EMAIL = 'Contact@spiceshahi.in';
export const DISPLAY_INSTAGRAM = '@SpiceShahi';
export const DISPLAY_INSTAGRAM_URL = 'https://instagram.com/SpiceShahi';
export const DISPLAY_ADDRESS = 'Gali no 6, ward no 13, Arya nagar, Bahadurgarh, Haryana - 124507';
export const DISPLAY_COMPANY = 'SRS Global Enterprises';
export const DISPLAY_FSSAI = '20826007001593';
export const DISPLAY_PHONE = '+91 83072 15421';
export const DISPLAY_ALT_PHONE = '+91 99964 77484';

export function getWhatsAppGeneralUrl(text = 'Hi! I want to know more about SpiceShahi pure spices.'): string {
  return `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function getWhatsAppBuyUrl(productName: string, packSize: string, price: number): string {
  const text = `Hi SpiceShahi Team! I would like to order:
*Product:* ${productName}
*Pack Size:* ${packSize}
*Price:* ₹${price}

Please share payment options and delivery details.`;
  return `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function getWhatsAppContactUrl(name: string, phone: string, inquiry: string, message: string): string {
  const text = `Hi SpiceShahi Team! Inquiry from website:
*Name:* ${name}
*Phone:* ${phone}
*Interested in:* ${inquiry}
*Message:* ${message}`;
  return `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export const PRODUCTS: Product[] = [
  {
    id: 'coriander-powder',
    slug: 'coriander-powder',
    name: 'SpiceShahi Desi Khushboo Coriander Powder (Dhaniya)',
    hindiName: 'देसी खुशबू धनिया पाउडर (Dhaniya)',
    category: 'single',
    categoryLabel: 'Pure Flagship Spice',
    tagline: 'Pure, Authentic & Aromatic — 100% Pure Coriander Seeds (Dhaniya)',
    shortDesc: 'Handcrafted using time-honored traditions. 100% Pure whole coriander seeds hand-beaten to preserve natural taste, deep aroma, and vital essential oils.',
    fullDesc: 'Our masalas are a tribute to time-honored culinary traditions, crafted using age-old techniques that honor purity and preserve. Each blend is hand-beaten, never processed with heat machines or essential oils. This gentle, manual method helps retain the natural taste, deep aroma, nutrition and true essence of every spice. No shortcuts. No additives. Just authentic, handcrafted flavor — the way it was always meant to be. 100% Pure Coriander Seeds (Dhaniya), rich in cooling volatile aromas and digestive freshness.',
    colorProfile: 'Naturally mellow olive-khaki, evidence of pure whole seeds without bleaching or fillers.',
    aromaNotes: 'Vibrant, citrusy, sweet herbal freshness with authentic Desi Khushboo.',
    culinaryUses: [
      'Foundational thickener for everyday curries, dals, and gravies',
      'Essential partner in Garam Masala and seasonal tadkas',
      'Kachoris, samosa fillings, parathas, and spiced flatbreads',
      'Fresh cooling coriander-cumin digestive waters'
    ],
    qualityFeatures: [
      '100% Pure Coriander Seeds (Dhaniya)',
      'Hand-Beaten — Never processed with heat machines',
      'Zero Additives, Preservatives or Synthetic Fillers',
      'FSSAI Certified: 20826007001593 • SRS Global Enterprises'
    ],
    packSizes: [
      { size: '100g Pouch', weightInGrams: 100, price: 50, originalPrice: 55, imageUrl: '/images/100g-coriander.png' },
      { size: '250g Pouch', weightInGrams: 250, price: 120, originalPrice: 130, imageUrl: '/images/250g-coriander.png' },
      { size: '500g Value Pack', weightInGrams: 500, price: 170, originalPrice: 190, imageUrl: '/images/250g-coriander.png' }
    ],
    heatLevel: 1,
    aromaIntensity: 5,
    badge: 'Flagship • Desi Khushboo',
    imageUrl: '/images/100g-coriander.png',
    origin: 'Bahadurgarh, Haryana (SRS Global Enterprises)',
    inStock: true,
    featured: true,
    curcuminOrOilContent: '100% Pure Coriander Seeds'
  },
  {
    id: 'turmeric-powder',
    slug: 'turmeric-powder',
    name: 'SpiceShahi Desi Khushboo Turmeric Powder (Haldi)',
    hindiName: 'देसी खुशबू हल्दी पाउडर (Haldi)',
    category: 'single',
    categoryLabel: 'Pure Flagship Spice',
    tagline: 'Pure, Authentic & Aromatic — 100% Pure Dried Turmeric Roots (Haldi)',
    shortDesc: '100% Pure dried turmeric roots hand-beaten without heat degradation. Imparts a sacred golden hue and warm earthy therapeutic aroma.',
    fullDesc: 'SpiceShahi Desi Khushboo Turmeric Powder is crafted from 100% pure dried turmeric roots (Haldi). Our masalas are a tribute to time-honored culinary traditions, crafted using age-old techniques that honor purity and preserve. Each blend is hand-beaten, never processed with heat machines or essential oils. This gentle, manual method helps retain the natural taste, deep golden color, medicinal curcumin, and true essence of every root. No shortcuts, no artificial color, no metanil yellow.',
    colorProfile: 'Intense golden saffron with bright natural luster, zero synthetic polishes or metanil yellow.',
    aromaNotes: 'Deep, earthy, warm woody aroma with authentic ginger-turmeric undertones.',
    culinaryUses: [
      'Authentic everyday Indian tadka, dals, and vegetable gravies',
      'Ayurvedic Golden Milk (Haldi Doodh) for daily immunity',
      'Marinades for paneer, vegetables, and savory dishes',
      'Soothing herbal herbal infusions and immunity tonics'
    ],
    qualityFeatures: [
      '100% Pure Dried Turmeric Roots (Haldi)',
      'Hand-Beaten — Retains natural healing Curcumin and essential oils',
      'No Additives, Artificial Color or Polish',
      'FSSAI Certified: 20826007001593 • SRS Global Enterprises'
    ],
    packSizes: [
      { size: '100g Pouch', weightInGrams: 100, price: 50, originalPrice: 55, imageUrl: '/images/100g-haldi.png' },
      { size: '250g Pouch', weightInGrams: 250, price: 120, originalPrice: 130, imageUrl: '/images/250g-haldi.png' },
      { size: '500g Value Pack', weightInGrams: 500, price: 180, originalPrice: 190, imageUrl: '/images/250g-haldi.png' }
    ],
    heatLevel: 1,
    aromaIntensity: 5,
    badge: 'Bestseller • High Curcumin',
    imageUrl: '/images/100g-haldi.png',
    origin: 'Bahadurgarh, Haryana (SRS Global Enterprises)',
    inStock: true,
    featured: true,
    curcuminOrOilContent: '100% Pure Dried Turmeric Roots'
  },
  {
    id: 'kashmiri-red-chili',
    slug: 'kashmiri-red-chili-powder',
    name: 'SpiceShahi Desi Khushboo Red Chili Powder (Lal Mirch)',
    hindiName: 'देसी खुशबू लाल मिर्च पाउडर (Lal Mirch)',
    category: 'single',
    categoryLabel: 'Pure Flagship Spice',
    tagline: 'Pure, Authentic & Aromatic — 100% Pure Dried Red Chillies (Lal Mirch)',
    shortDesc: '100% Pure dried red chillies hand-beaten to release deep crimson color and robust aromatic pungency without chemical dyes.',
    fullDesc: 'SpiceShahi Desi Khushboo Red Chili Powder (Lal Mirch) is ground exclusively from 100% pure dried red chillies. Our masalas are a tribute to time-honored culinary traditions, crafted using age-old techniques that honor purity and preserve. Each blend is hand-beaten, never processed with heat machines or essential oils. This gentle method retains the vibrant natural red color, balanced warmth, and mouthwatering khushboo. Free from artificial colors, Sudan dyes, or brick dust.',
    colorProfile: 'Rich deep crimson & ruby red that blooms instantly in hot mustard oil or ghee.',
    aromaNotes: 'Mildly smoky, sweet sun-cured capsicum bouquet with appetizing savory warmth.',
    culinaryUses: [
      'Everyday Indian gravies, paneer curries, and vegetable subzis',
      'Tandoori marinades, tikkas, and roasted vegetables',
      'Traditional curries and dals needing radiant color and balanced heat',
      'Sprinkled on raitas, chaats, and roasted snacks'
    ],
    qualityFeatures: [
      '100% Pure Dried Red Chillies (Lal Mirch)',
      'Hand-Beaten — Preserves natural capsanthin red pigment & oils',
      'Zero Artificial Colors, Brick Dust, or Chemical Dyes',
      'FSSAI Certified: 20826007001593 • SRS Global Enterprises'
    ],
    packSizes: [
      { size: '100g Pouch', weightInGrams: 100, price: 55, originalPrice: 65, imageUrl: '/images/100g-mirch.png' },
      { size: '250g Pouch', weightInGrams: 250, price: 150, originalPrice: 160, imageUrl: '/images/250g-mirch.png' },
      { size: '500g Value Pack', weightInGrams: 500, price: 210, originalPrice: 220, imageUrl: '/images/250g-mirch.png' }
    ],
    heatLevel: 3,
    aromaIntensity: 4,
    badge: 'Popular • Vibrant Red & Rich Flavor',
    imageUrl: '/images/100g-mirch.png',
    origin: 'Bahadurgarh, Haryana (SRS Global Enterprises)',
    inStock: true,
    featured: true,
    curcuminOrOilContent: '100% Pure Dried Red Chillies'
  }
];

export const INSTAGRAM_REELS: InstagramReel[] = [
  {
    id: 'reel-1',
    title: 'The Golden Harvest: Hand-Beaten Turmeric',
    caption: 'Discover how 100% pure dried turmeric roots are traditionally hand-beaten without heat machines to preserve healing curcumin and rich khushboo.',
    category: 'farm',
    categoryLabel: 'Purity Heritage',
    thumbnailUrl: '/images/100g-haldi.png',
    views: '124K',
    likes: '14.2K',
    instagramUrl: 'https://instagram.com/SpiceShahi',
    duration: '0:42',
    tag: '#SpiceShahi'
  },
  {
    id: 'reel-2',
    title: 'Why Hand-Beaten Spices Have Superior Khushboo',
    caption: 'Watch the aroma release! High-speed commercial mills heat past 90°C and vaporize essential oils. SpiceShahi stays cool and retains 100% natural aroma.',
    category: 'process',
    categoryLabel: 'Hand-Beaten',
    thumbnailUrl: '/images/100g-coriander.png',
    views: '98K',
    likes: '11.8K',
    instagramUrl: 'https://instagram.com/SpiceShahi',
    duration: '0:35',
    tag: '#DesiKhushboo'
  },
  {
    id: 'reel-3',
    title: 'The Real Difference: Natural Red vs Dyed Chili',
    caption: 'A simple test showing why SpiceShahi Red Chili Powder yields pure natural crimson brilliance without artificial dyes or brick dust.',
    category: 'recipe',
    categoryLabel: 'Purity Test',
    thumbnailUrl: '/images/100g-mirch.png',
    views: '245K',
    likes: '32.1K',
    instagramUrl: 'https://instagram.com/SpiceShahi',
    duration: '0:58',
    tag: '#ZeroAdulteration'
  },
  {
    id: 'reel-4',
    title: 'Packaging Day: Resealable Freshness Zipper',
    caption: 'Every SpiceShahi pouch comes with an airtight resealable zipper so your spices stay as fresh as the day they were packed.',
    category: 'packaging',
    categoryLabel: 'Packaging',
    thumbnailUrl: '/images/spiceshahi-hero.jpg',
    views: '76K',
    likes: '8.4K',
    instagramUrl: 'https://instagram.com/SpiceShahi',
    duration: '0:28',
    tag: '#FreshPack'
  },
  {
    id: 'reel-5',
    title: 'Secret Tadka for Authentic Dal & Sabzi',
    caption: 'Chef shows how a pinch of SpiceShahi Coriander and Red Chili in hot ghee creates the unforgettable aroma of true home cooking.',
    category: 'recipe',
    categoryLabel: 'Recipe Inspiration',
    thumbnailUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=800&auto=format&fit=crop',
    views: '310K',
    likes: '45.7K',
    instagramUrl: 'https://instagram.com/SpiceShahi',
    duration: '0:48',
    tag: '#SpiceShahiKitchen'
  },
  {
    id: 'reel-6',
    title: 'Desi Khushboo Trio: Haldi, Dhaniya & Lal Mirch',
    caption: 'See how SpiceShahi’s three flagship powders — turmeric, coriander, and red chili — stay pure, aromatic, and free from fillers.',
    category: 'process',
    categoryLabel: 'Aroma Atelier',
    thumbnailUrl: '/images/250g-haldi.png',
    views: '188K',
    likes: '22.3K',
    instagramUrl: 'https://instagram.com/SpiceShahi',
    duration: '0:39',
    tag: '#ShahiMasala'
  }
];

export const TRUST_BADGES = [
  {
    id: 'natural',
    title: '100% Natural Purity',
    description: 'Zero chemical dyes, metanil yellow, preservatives, or artificial enhancers.'
  },
  {
    id: 'aroma',
    title: 'Cold-Stone Ground',
    description: 'Slow-milled below 35°C to preserve volatile essential oils & authentic khushboo.'
  },
  {
    id: 'farm',
    title: 'Direct Farm Sourcing',
    description: 'Traceable single-origin crops from Meghalaya, Rajasthan, Gujarat, and Kerala.'
  },
  {
    id: 'lab',
    title: 'Rigorous Lab Tested',
    description: 'Every batch tested for heavy metals, moisture, curcumin, and zero pesticides.'
  }
];
