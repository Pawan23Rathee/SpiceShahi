import { Product, InstagramReel } from '../types';

export const BUSINESS_WHATSAPP_NUMBER = '918307215421';
export const DISPLAY_WHATSAPP = '+91 83072 15421';
export const DISPLAY_EMAIL = 'Contact@spiceshahi.in';
export const DISPLAY_INSTAGRAM = '@SpiceShahi';
export const DISPLAY_INSTAGRAM_URL = 'https://instagram.com/SpiceShahi';
export const DISPLAY_ADDRESS = 'Gali no 6, ward no 13, Arya nagar, Bahadurgarh, Haryana - 124507';
export const DISPLAY_COMPANY = 'BS GLOBAL ENTERPRISES';
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
      'FSSAI Certified: 20826007001593 • BS Global Enterprises'
    ],
    packSizes: [
      { size: '100g Pouch', weightInGrams: 100, price: 40, originalPrice: 50 },
      { size: '250g Pouch', weightInGrams: 250, price: 95, originalPrice: 120 },
      { size: '500g Value Pack', weightInGrams: 500, price: 180, originalPrice: 230 }
    ],
    heatLevel: 1,
    aromaIntensity: 5,
    badge: 'Flagship • Desi Khushboo',
    imageUrl: '/images/coriander-pouch.jpg',
    origin: 'Bahadurgarh, Haryana (BS Global Enterprises)',
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
      'FSSAI Certified: 20826007001593 • BS Global Enterprises'
    ],
    packSizes: [
      { size: '100g Pouch', weightInGrams: 100, price: 45, originalPrice: 55 },
      { size: '250g Pouch', weightInGrams: 250, price: 105, originalPrice: 130 },
      { size: '500g Value Pack', weightInGrams: 500, price: 200, originalPrice: 250 }
    ],
    heatLevel: 1,
    aromaIntensity: 5,
    badge: 'Bestseller • High Curcumin',
    imageUrl: '/images/turmeric-pouch.jpg',
    origin: 'Bahadurgarh, Haryana (BS Global Enterprises)',
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
      'FSSAI Certified: 20826007001593 • BS Global Enterprises'
    ],
    packSizes: [
      { size: '100g Pouch', weightInGrams: 100, price: 50, originalPrice: 65 },
      { size: '250g Pouch', weightInGrams: 250, price: 115, originalPrice: 145 },
      { size: '500g Value Pack', weightInGrams: 500, price: 220, originalPrice: 280 }
    ],
    heatLevel: 3,
    aromaIntensity: 4,
    badge: 'Popular • Vibrant Red & Rich Flavor',
    imageUrl: '/images/chili-pouch.jpg',
    origin: 'Bahadurgarh, Haryana (BS Global Enterprises)',
    inStock: true,
    featured: true,
    curcuminOrOilContent: '100% Pure Dried Red Chillies'
  },
  {
    id: 'shahi-garam-masala',
    slug: 'shahi-garam-masala',
    name: 'Royal Shahi Garam Masala (16 Spices)',
    hindiName: 'शाही गरम मसाला (16 साबुत मसाले)',
    category: 'blend',
    categoryLabel: 'Signature Masala Blend',
    tagline: 'Artisanal secret ratio roasted over slow wood flame before milling',
    shortDesc: 'Handcrafted with green cardamom, black cardamom, cinnamon, mace, cloves, star anise, nutmeg, and stone flowers.',
    fullDesc: 'A pinch transforms any ordinary meal into a royal banquet. SpiceShahi Shahi Garam Masala is our master blender’s signature recipe made with 16 royal whole spices. Each spice is individually toasted at precise temperatures to awaken its dormant oils before being gently blended. You only need half a teaspoon at the end of cooking to unleash a hypnotic, lingering aroma that fills your entire home.',
    colorProfile: 'Deep toasted brown with glistening specks of whole spice oils.',
    aromaNotes: 'Intoxicating, warm cinnamon, heady nutmeg, pungent cloves, and cooling green cardamom.',
    culinaryUses: [
      'Finishing touch on royal gravies: Shahi Paneer, Biryani, Dal Makhani',
      'Sprinkled over hot pulao, khichdi, and curries right before serving',
      'Rich vegetable kormas and slow-simmered stews',
      'Stuffing for aloo parathas and festive snacks'
    ],
    qualityFeatures: [
      'Crafted with 16 unadulterated whole spices — no salt or filler',
      'Whole green cardamom pods and royal Ceylon cinnamon bark',
      'Slow toasted to bring essential oils to the surface',
      'Airtight foil seal prevents evaporation of delicate floral notes'
    ],
    packSizes: [
      { size: '100g Tin Box', weightInGrams: 100, price: 140, originalPrice: 170 },
      { size: '200g Gift Tin', weightInGrams: 200, price: 260, originalPrice: 320 },
      { size: '500g Chef Pack', weightInGrams: 500, price: 590, originalPrice: 720 }
    ],
    heatLevel: 3,
    aromaIntensity: 5,
    badge: 'Master Blend • 16 Spices',
    imageUrl: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?q=80&w=1000&auto=format&fit=crop',
    origin: 'Hand-blended by SpiceShahi',
    inStock: true,
    featured: true,
    curcuminOrOilContent: 'Zero Salt • 100% Spices'
  },
  {
    id: 'roasted-jeera-powder',
    slug: 'roasted-cumin-powder',
    name: 'Bhuna Jeera Powder (Roasted Cumin)',
    hindiName: 'भुना जीरा पाउडर (Roasted Jeera)',
    category: 'single',
    categoryLabel: 'Single Pure Spice',
    tagline: 'Slow roasted on iron tawa for deep nutty crunch and digestive warmth',
    shortDesc: 'Unjha whole cumin seeds slow dry-roasted until fragrant and coarsely ground for authentic crunch.',
    fullDesc: 'Commercial cumin powder is often raw and bitter. SpiceShahi Bhuna Jeera is gently dry-roasted on thick iron griddles until each plump seed crackles, turns a golden cocoa brown, and releases its nuttiest aromatic oils. Ground into a rich, aromatic semi-coarse powder, it instantly elevates everyday yogurt, salads, buttermilk, and chaats.',
    colorProfile: 'Rich toasted hickory brown with visible cracked roasted seed flecks.',
    aromaNotes: 'Nutty, smoky, toasty, and deeply comforting savory fragrance.',
    culinaryUses: [
      'Dahi Vada, Boondi Raita, Cucumber Pachadi, and Chaats',
      'Chilled Masala Chaas (buttermilk) and Jaljeera drinks',
      'Tossed over roasted potatoes, salads, and seasonal fruits',
      'Flavor enhancer for dals and stuffed breads'
    ],
    qualityFeatures: [
      'Premium bold seeds from Unjha, Gujarat',
      'Traditional slow tawa-roasting — ready to sprinkle instantly',
      'Natural digestive carminative properties',
      'Free from sand, husk, and synthetic preservatives'
    ],
    packSizes: [
      { size: '100g Glass Jar', weightInGrams: 100, price: 90, originalPrice: 110 },
      { size: '250g Jar Pack', weightInGrams: 250, price: 210, originalPrice: 250 },
      { size: '500g Value Pack', weightInGrams: 500, price: 390, originalPrice: 470 }
    ],
    heatLevel: 1,
    aromaIntensity: 5,
    badge: 'Tawa Roasted • Digestive',
    imageUrl: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?q=80&w=1000&auto=format&fit=crop',
    origin: 'Unjha Mandi, Gujarat',
    inStock: true,
    featured: false,
    curcuminOrOilContent: '100% Roasted Unjha Cumin'
  },
  {
    id: 'tellicherry-black-pepper',
    slug: 'black-pepper-powder',
    name: 'Tellicherry Black Pepper Powder (Kali Mirch)',
    hindiName: 'काली मिर्च पाउडर (Tellicherry)',
    category: 'single',
    categoryLabel: 'Single Pure Spice',
    tagline: 'King of spices — bold berry pungency with sharp citrus bite',
    shortDesc: 'Hand-picked extra bold Tellicherry peppercorns from Wayanad with high piperine content.',
    fullDesc: 'Known globally as the finest peppercorn in existence, Tellicherry Black Pepper is harvested only when the berries are fully mature on the vine in Kerala’s rainforest ridges. SpiceShahi freshly pulverizes these high-piperine berries into a coarse black-sand grind that releases an intense spicy floral punch without muddy bitterness.',
    colorProfile: 'Dark charcoal with dark gray flecks from whole pericarp berry skins.',
    aromaNotes: 'Sharp, piney, fiery citrus and crushed resin bouquet.',
    culinaryUses: [
      'Seasoning eggs, grilled meats, mushrooms, and pastas',
      'South Indian rasam, pongal, and herbal kada drinks',
      'Soups, broths, and winter warming teas',
      'Synergistic booster for turmeric curcumin absorption'
    ],
    qualityFeatures: [
      'Wayanad Extra Bold Grade (TGSEB)',
      'High natural Piperine content for optimal health benefits',
      'Freshly ground in micro-batches to avoid oil oxidation',
      'Unadulterated — zero papaya seed fillers'
    ],
    packSizes: [
      { size: '100g Tin Shaker', weightInGrams: 100, price: 130, originalPrice: 160 },
      { size: '250g Jar Pack', weightInGrams: 250, price: 310, originalPrice: 380 },
      { size: '500g Value Pack', weightInGrams: 500, price: 590, originalPrice: 720 }
    ],
    heatLevel: 4,
    aromaIntensity: 5,
    badge: 'Tellicherry Bold • High Piperine',
    imageUrl: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?q=80&w=1000&auto=format&fit=crop',
    origin: 'Wayanad, Kerala',
    inStock: true,
    featured: false,
    curcuminOrOilContent: '5.2% Natural Piperine'
  },
  {
    id: 'special-chaat-masala',
    slug: 'special-chaat-masala',
    name: 'SpiceShahi Chatpata Chaat Masala',
    hindiName: 'चटपटा चाट मसाला',
    category: 'blend',
    categoryLabel: 'Signature Masala Blend',
    tagline: 'Tangy amchur, black salt, and roasted spices for irresistible street-style zing',
    shortDesc: 'A lip-smacking blend of sun-dried wild green mango, rock salt, asafoetida, mint, and toasted spices.',
    fullDesc: 'Nothing compares to the mouthwatering tang of true Indian chaat. Our Chatpata Chaat Masala combines sun-dried unpasteurized amchur (green mango), mineral-rich Himalayan black salt (kala namak), crisp roasted cumin, ginger, and digestive hing. Sprinkled on fruits, bhel, or fried snacks, it creates an unforgettable sweet, sour, savory explosion.',
    colorProfile: 'Warm buff tan with hints of pinkish Himalayan salt.',
    aromaNotes: 'Tangy, sulfurous-savory, refreshing dried mint and roasted cumin.',
    culinaryUses: [
      'Sprinkled on fresh guava, watermelon, papaya, and fruit platters',
      'Pani puri, sev puri, samosa chaat, and dahi bhalla',
      'French fries, pakoras, paneer tikka, and roasted nuts',
      'Lemonades, sodas, and mocktails'
    ],
    qualityFeatures: [
      'Natural wild mango powder (Amchur) — not citric acid crystals',
      'Real rock salt and black salt for genuine mineral punch',
      'Zero MSG, synthetic colors, or chemical souring agents',
      'Hygienically blended and moisture-proof packed'
    ],
    packSizes: [
      { size: '100g Shaker Bottle', weightInGrams: 100, price: 85, originalPrice: 105 },
      { size: '200g Jar Pack', weightInGrams: 200, price: 160, originalPrice: 195 },
      { size: '500g Foodie Pack', weightInGrams: 500, price: 360, originalPrice: 430 }
    ],
    heatLevel: 2,
    aromaIntensity: 4,
    badge: 'Street-Food Magic • Tangy & Bold',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop',
    origin: 'Crafted in Delhi',
    inStock: true,
    featured: false,
    curcuminOrOilContent: 'Real Amchur & Rock Salt'
  },
  {
    id: 'royal-kasuri-methi',
    slug: 'nagaur-kasuri-methi',
    name: 'Nagauri Hand-Crushed Kasuri Methi',
    hindiName: 'नागौरी कस्तूरी मेथी (Nagauri Kasuri Methi)',
    category: 'whole',
    categoryLabel: 'Whole & Hand-Crushed',
    tagline: 'World-renowned Nagaur fenugreek leaves with enchanting herbal fragrance',
    shortDesc: 'Crisp, shade-dried whole green fenugreek leaves from Nagaur, Rajasthan. Just rub between your palms for intoxicating aroma.',
    fullDesc: 'Nagaur in Rajasthan is blessed with the ideal soil and dry desert winds that produce the sweetest, most aromatic fenugreek on Earth. SpiceShahi Kasuri Methi is carefully picked before flowering, washed in pure water, and dried in covered shaded aerators to preserve its chlorophyll green color and sweet-bitter maple-like aroma without harsh bitterness.',
    colorProfile: 'Crisp emerald green leaves, completely free of brown stems and mud.',
    aromaNotes: 'Enchanting maple-caramel sweetness, warm toasted herb perfume.',
    culinaryUses: [
      'Crushed over Butter Chicken, Paneer Tikka Masala, and Dal Makhani',
      'Kneaded into Methi Thepla, Paratha, and Naan doughs',
      'Tossed into dry aloo sabzi and bhindi preparations',
      'Gravy garnishing for five-star aroma'
    ],
    qualityFeatures: [
      'Genuine Nagaur GI crop — world benchmark for Kasuri Methi',
      'Triple-cleaned to remove dirt, mud, and hard fibrous stalks',
      'Shade-dried to keep natural green hue and essential oils',
      'Ready to crush between palms directly into your hot dish'
    ],
    packSizes: [
      { size: '50g Box', weightInGrams: 50, price: 65, originalPrice: 80 },
      { size: '100g Airtight Jar', weightInGrams: 100, price: 120, originalPrice: 150 },
      { size: '250g Kitchen Pack', weightInGrams: 250, price: 270, originalPrice: 330 }
    ],
    heatLevel: 1,
    aromaIntensity: 5,
    badge: 'GI Protected • Sweet Aroma',
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=1000&auto=format&fit=crop',
    origin: 'Nagaur, Rajasthan',
    inStock: true,
    featured: false,
    curcuminOrOilContent: '100% Shade-Dried Leaf'
  }
];

export const INSTAGRAM_REELS: InstagramReel[] = [
  {
    id: 'reel-1',
    title: 'The Golden Harvest: Hand-Beaten Turmeric',
    caption: 'Discover how 100% pure dried turmeric roots are traditionally hand-beaten without heat machines to preserve healing curcumin and rich khushboo.',
    category: 'farm',
    categoryLabel: 'Purity Heritage',
    thumbnailUrl: '/images/turmeric-pouch.jpg',
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
    thumbnailUrl: '/images/coriander-pouch.jpg',
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
    thumbnailUrl: '/images/chili-pouch.jpg',
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
    title: '16 Spices Roasting for Royal Shahi Garam Masala',
    caption: 'Listen to the crackle of green cardamom, star anise, and whole mace as they gently toast over slow embers.',
    category: 'process',
    categoryLabel: 'Aroma Atelier',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?q=80&w=800&auto=format&fit=crop',
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
