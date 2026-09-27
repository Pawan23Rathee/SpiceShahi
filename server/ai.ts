import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';

// Initialize server-side Gemini SDK with required telemetry header
export const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export const SYSTEM_INSTRUCTION = `You are "Shahi Sommelier", the Royal Master Spice Blender and Executive Culinary Advisor for "SpiceShahi Spices & Masalas" (SRS Global Enterprises, Bahadurgarh, Haryana).

Your expertise encompasses:
1. The three flagship SpiceShahi treasures:
   - Desi Khushboo Coriander Powder (Dhaniya): 100% pure whole seeds, traditionally slow-ground at cool temperatures, retaining cooling volatile aromatic oils (linalool), mellow olive-khaki color.
   - Desi Khushboo Turmeric Powder (Haldi): 100% pure dried turmeric roots, rich natural curcumin, sacred golden luster, zero metanil yellow or polish, warm earthy aroma.
   - Desi Khushboo Red Chili Powder (Lal Mirch / Kashmiri): vibrant natural crimson color without artificial dyes, rich capsaicin flavor, balanced heat and deep aroma.
2. Authentic Indian culinary techniques: Tadka timing, oil temperature (sub-160°C to avoid scorching coriander/turmeric), bhunao methods, masala pairing, Garam Masala formulation.
3. Ayurvedic and digestive wisdom: Curcumin bioavailability with black pepper, cooling qualities of coriander seed water, digestion tonics, Golden Milk (Haldi Doodh).
4. Traditional regional recipes: North Indian curries, dals, kachoris, biryanis, sambar, seasonal vegetable gravies.

Guidelines:
- Maintain a warm, hospitable, authoritative, and royal tone (using respectful terms like "Namaste", "Swagatam", "Annapurna").
- Always highlight the difference between mass industrial heat-ground powders (which lose volatile oils) vs. SpiceShahi's slow cold-ground, stone-milled purity.
- When suggesting recipes or pairings, recommend which SpiceShahi spice and pack size to use.
- Be precise with proportions (e.g., "1/2 tsp Haldi", "1.5 tsp Dhaniya").
- If the user writes in Hindi, respond in fluent Hindi or Hinglish. If in English, respond in English.`;

// Curated offline knowledge engine for when GEMINI_API_KEY is not configured
export function getFallbackResponse(prompt: string, history: Array<{ role: string; content: string }>): { text: string; sources?: Array<{ title: string; uri: string }> } {
  const p = prompt.toLowerCase();

  if (p.includes('haldi') || p.includes('turmeric') || p.includes('golden milk') || p.includes('curcumin')) {
    return {
      text: `Namaste! For our **SpiceShahi Desi Khushboo Turmeric Powder (Haldi)**, here is the royal secret:

### 🌟 Sacred Golden Milk (Haldi Doodh) Recipe:
1. **Ingredients:**
   - 250ml full-cream milk (or oat/almond milk)
   - 1/2 tsp **SpiceShahi Turmeric Powder** (rich in natural Curcumin)
   - 1/4 tsp crushed green cardamom
   - A pinch of freshly cracked black pepper (essential for Curcumin absorption by 2000%)
   - 1 tsp raw honey or organic jaggery
2. **Method:** Simmer the milk with turmeric and spices on low flame for 4–5 minutes. Never boil at harsh heat. Stir in honey once slightly cooled.
3. **The SpiceShahi Difference:** Unlike commercial powders loaded with metanil yellow dye or chalk fillers, our turmeric is ground from 100% whole dried fingers without heat machine degradation, yielding a sacred golden luster and warm therapeutic aroma.`,
      sources: [
        { title: 'SpiceShahi Purity Standards', uri: 'https://spiceshahi.in/#/product/turmeric-powder' },
        { title: 'Ayurvedic Curcumin Research', uri: 'https://spiceshahi.in/#/about' }
      ]
    };
  }

  if (p.includes('dhaniya') || p.includes('coriander') || p.includes('tadka') || p.includes('dal')) {
    return {
      text: `Swagatam! Coriander is the soul and aromatic foundation of Indian cooking.

### 🌿 Master Tadka Secret for Dal & Gravies:
- **Tadka Rule #1:** Always add **SpiceShahi Desi Khushboo Coriander Powder** *after* your onions, tomatoes, and ginger have reduced, or whisk it into 2 tbsp of water before adding to hot ghee. This prevents the delicate volatile linalool oils from burning!
- **Why SpiceShahi Dhaniya is Special:** Because we slowly grind 100% whole coriander seeds at low temperatures rather than industrial high-speed heat mills, the temperature stays cool. You get that authentic mellow olive-khaki color and sweet, citrusy fragrance rather than the dull brownish filler of commercial brands.
- **Pairing Tip:** Use in a 2:1 ratio with turmeric for balanced, velvety North Indian gravy bases.`,
      sources: [
        { title: 'SpiceShahi Coriander Heritage', uri: 'https://spiceshahi.in/#/product/coriander-powder' }
      ]
    };
  }

  if (p.includes('mirch') || p.includes('chili') || p.includes('red chili') || p.includes('kashmiri')) {
    return {
      text: `Aadab! For vibrant culinary warmth without bitter burning:

### 🌶️ SpiceShahi Desi Khushboo Red Chili Powder:
- **Natural Luster:** Our red chili provides an alluring natural crimson color without any harmful synthetic dyes (like Sudan red or artificial gloss).
- **The Bloom Technique:** For a stunning restaurant-grade Rogan (red gravy oil), take 1/2 tsp of SpiceShahi Red Chili Powder in warm ghee off the flame for just 5 seconds, then pour over your finished dish.
- **Flavor Profile:** Moderate fiery heat (Level 3/5) paired with a deep roasted capsicum sweetness.`,
      sources: [
        { title: 'SpiceShahi Red Chili Powder', uri: 'https://spiceshahi.in/#/product/kashmiri-red-chili' }
      ]
    };
  }

  // General culinary response
  return {
    text: `Swagatam! I am your **SpiceShahi Shahi Sommelier**. 

Whether you are preparing a foundational homestyle Dal Tadka, a slow-cooked Biryani, or looking for the medicinal benefits of pure cold-ground spices, I am here to guide your culinary creations.

### Quick Suggestions:
- 🌿 **Coriander Powder (Dhaniya):** Foundation for curries & digestive cooling
- 🌟 **Turmeric Powder (Haldi):** Sacred golden hue & immunity-boosting Curcumin
- 🌶️ **Red Chili Powder (Lal Mirch):** Vibrant color and balanced aromatic heat

Feel free to ask for authentic Indian recipes, spice preservation techniques, or state-wise dispatch details from our Bahadurgarh mill!`,
    sources: [
      { title: 'SpiceShahi Official Catalog', uri: 'https://spiceshahi.in/#/products' }
    ]
  };
}
