import React, { useState, useEffect } from 'react';
import { Page, Product, PackSize } from '../types';
import { PRODUCTS } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { getFriendlyToastText } from '../components/ProductVariantModal';
import { useCart } from '../context/CartContext';
import { platformService } from '../services';
import {
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Flame,
  ShieldCheck,
  Truck,
  Heart,
  Share2,
  Check,
  ShoppingBag,
  Plus,
  Minus,
  ArrowRight,
} from 'lucide-react';

interface ProductDetailPageProps {
  productSlug: string;
  onNavigate: (page: Page, slug?: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productSlug,
  onNavigate,
}) => {
  const product = PRODUCTS.find((p) => p.slug === productSlug) || PRODUCTS[0];
  const { addToCart } = useCart();
  const [selectedPackIndex, setSelectedPackIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Reset pack selection when product changes
  useEffect(() => {
    setSelectedPackIndex(0);
    setQuantity(1);
    platformService.scrollTo(0);
  }, [productSlug]);

  const currentPack: PackSize = product.packSizes[selectedPackIndex] || product.packSizes[0];

  const relatedProducts = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : 'https://spiceshahi.in';
    const success = await platformService.copyToClipboard(url);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleAddToCart = () => {
    const toastMsg = getFriendlyToastText(product, currentPack);
    addToCart(product, currentPack, quantity, { customToast: toastMsg });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, currentPack, quantity);
    onNavigate('checkout');
  };

  return (
    <div className="space-y-10 sm:space-y-16 pb-12 sm:pb-16 pt-4 sm:pt-6">
      {/* Breadcrumb & Back Navigation */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('products')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#2C3E50] hover:text-[#96281B] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Spices</span>
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs text-[#5D6D7E] hover:text-[#2C3E50] transition-colors p-2 rounded-lg hover:bg-black/5 cursor-pointer"
            title="Share this spice"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Main Product Showcase Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
          {/* Left: Large Product Image Gallery */}
          <div className="lg:col-span-6 space-y-4 w-full min-w-0">
            <div className="relative aspect-4/3 sm:aspect-1/1 rounded-3xl overflow-hidden bg-[#FCFAF2] border border-[#E8E4D5] shadow-lg group">
              <img
                src={currentPack.imageUrl || product.imageUrl}
                alt={`${product.name} — ${currentPack.size}`}
                className="w-full h-full object-contain p-4 sm:p-6 group-hover:scale-105 transition-transform duration-700"
              />

              {/* Badges on image */}
              {product.badge && (
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-serif italic font-bold px-3 py-1.5 rounded-md bg-[#96281B] text-white shadow-md">
                    <Sparkles className="w-3.5 h-3.5 text-[#F1C40F]" />
                    {product.badge}
                  </span>
                </div>
              )}

              {product.curcuminOrOilContent && (
                <div className="absolute bottom-4 left-4 bg-[#2C3E50]/90 backdrop-blur-xs text-[#FCFAF2] px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-white/10 shadow-sm max-w-[80%] truncate">
                  {product.curcuminOrOilContent}
                </div>
              )}
            </div>

            {/* Farm Origin Strip */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E8E4D5] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#5D6D7E] shadow-xs gap-1.5">
              <span className="font-medium">Origin: <strong className="text-[#2C3E50]">{product.origin}</strong></span>
              <span className="text-[#2D5A27] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                100% Traceable Single Origin
              </span>
            </div>
          </div>

          {/* Right: Product Details & Purchase Box */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#D35400] bg-[#F39C12]/20 px-2.5 py-0.5 rounded">
                  {product.categoryLabel}
                </span>
                <span className="text-stone-300">•</span>
                <span className="text-sm font-serif italic text-[#5D6D7E]">{product.hindiName}</span>
              </div>

              <h1 className="font-serif italic font-bold text-3xl sm:text-4xl text-[#2C3E50] tracking-tight">
                {product.name}
              </h1>

              <p className="text-sm text-[#5D6D7E] mt-2 italic font-medium leading-relaxed">
                "{product.tagline}"
              </p>
            </div>

            {/* Aroma & Heat Intensity meters */}
            <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#E8E4D5]">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest text-[#5D6D7E] font-bold">
                  Aroma (Khushboo)
                </span>
                <div className="flex items-center gap-1 text-[#F1C40F]">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <span
                      key={level}
                      className={`h-2 rounded-full transition-all ${
                        level <= product.aromaIntensity
                          ? 'w-6 bg-[#D35400]'
                          : 'w-2 bg-[#E8E4D5]'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-bold ml-1 text-[#2C3E50]">
                    {product.aromaIntensity}/5
                  </span>
                </div>
              </div>

              {product.heatLevel ? (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-[#5D6D7E] font-bold">
                    Heat Rating
                  </span>
                  <div className="flex items-center gap-1 text-[#96281B]">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <Flame
                        key={level}
                        className={`w-4 h-4 ${
                          level <= (product.heatLevel || 1)
                            ? 'fill-current text-[#96281B]'
                            : 'text-[#E8E4D5]'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold ml-1 text-[#2C3E50]">
                      {product.heatLevel}/5
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-[#5D6D7E] font-bold">
                    Purity Rating
                  </span>
                  <p className="text-xs font-bold text-[#2D5A27]">100% Unblended Whole</p>
                </div>
              )}
            </div>

            {/* Pack Size Selector */}
            <div className="space-y-3">
              <label className="text-[11px] uppercase font-bold tracking-[0.18em] text-[#2C3E50] block">
                Select Pack Size:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {product.packSizes.map((pack, idx) => {
                  const isSelected = selectedPackIndex === idx;
                  return (
                    <button
                      key={pack.size}
                      id={`pack-size-btn-${idx}`}
                      onClick={() => setSelectedPackIndex(idx)}
                      className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer min-w-0 ${
                        isSelected
                          ? 'border-[#96281B] bg-[#96281B]/5 ring-2 ring-[#96281B] shadow-sm'
                          : 'border-[#E8E4D5] bg-white hover:border-[#96281B]/40'
                      }`}
                    >
                      <p className="text-xs font-bold text-[#2C3E50] truncate">{pack.size}</p>
                      <p className="text-sm font-serif italic font-bold text-[#96281B] mt-0.5">
                        ₹{pack.price}
                      </p>
                      {pack.originalPrice && (
                        <p className="text-[10px] text-[#5D6D7E] line-through">
                          ₹{pack.originalPrice}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Display & E-commerce Checkout Action */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#E8E4D5] space-y-4 sm:space-y-5 shadow-xs">
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <div>
                  <span className="text-xs text-[#5D6D7E]">Price for {currentPack.size}</span>
                  <div className="flex items-baseline gap-2 mt-0.5 flex-wrap">
                    <span className="font-serif italic font-bold text-2xl sm:text-3xl text-[#2C3E50]">
                      ₹{currentPack.price * quantity}
                    </span>
                    {currentPack.originalPrice && (
                      <span className="text-sm text-[#5D6D7E] line-through">
                        ₹{currentPack.originalPrice * quantity}
                      </span>
                    )}
                    {currentPack.originalPrice && (
                      <span className="text-xs font-bold text-[#2D5A27] bg-[#2D5A27]/10 px-2 py-0.5 rounded border border-[#2D5A27]/20">
                        Save ₹{((currentPack.originalPrice - currentPack.price) * quantity)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-[#2D5A27] flex items-center gap-1 justify-end">
                    <Check className="w-3.5 h-3.5" />
                    In Stock
                  </span>
                  <span className="text-[11px] text-[#5D6D7E]">Dispatches in 24 hrs</span>
                </div>
              </div>

              {/* Quantity Stepper & Buttons */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-bold text-[#2C3E50] uppercase tracking-wider">
                    Quantity:
                  </span>
                  <div className="flex items-center border border-[#E8E4D5] rounded-xl bg-[#FCFAF2]">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="p-2 sm:p-2.5 hover:bg-[#E8E4D5]/60 text-[#2C3E50] rounded-l-xl transition-colors cursor-pointer"
                      title="Decrease"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-3 sm:px-4 text-sm font-bold text-[#2C3E50]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="p-2 sm:p-2.5 hover:bg-[#E8E4D5]/60 text-[#2C3E50] rounded-r-xl transition-colors cursor-pointer"
                      title="Increase"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Primary Actions: Add to Cart & Buy Now */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    id="detail-add-to-cart-btn"
                    onClick={handleAddToCart}
                    className={`py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                      justAdded
                        ? 'bg-[#2D5A27] text-white'
                        : 'bg-[#96281B] hover:bg-[#7D2116] text-white shadow-[#96281B]/20'
                    }`}
                  >
                    {justAdded ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>

                  <button
                    id="detail-buy-now-btn"
                    onClick={handleBuyNow}
                    className="py-3.5 px-6 rounded-xl bg-[#2C3E50] hover:bg-[#1a252f] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    <span>Buy Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Delivery info snippet */}
              <div className="p-3 bg-[#FCFAF2] rounded-xl border border-[#E8E4D5] text-xs text-[#5D6D7E] flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="flex items-center gap-1.5 font-medium text-[#2C3E50]">
                  <Truck className="w-4 h-4 text-[#D35400]" />
                  State Delivery:
                </span>
                <span>Haryana ₹50 • Rest of India ₹100</span>
              </div>
            </div>

            {/* Quality Features List */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs uppercase tracking-wider text-[#2C3E50] font-bold">
                Purity Hallmarks:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.qualityFeatures.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-[#5D6D7E]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A27] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Culinary Uses Tabbed Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-[#E8E4D5] shadow-xs space-y-6 sm:space-y-8">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#D35400] font-bold block mb-1">
              Heritage Method
            </span>
            <h2 className="font-serif italic font-bold text-2xl text-[#2C3E50]">
              The Story of {product.name}
            </h2>
            <p className="text-sm text-[#5D6D7E] leading-relaxed mt-3">
              {product.fullDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[#E8E4D5]">
            <div className="space-y-3">
              <h3 className="font-serif font-bold text-lg text-[#2C3E50]">
                Culinary Uses & Pairings
              </h3>
              <ul className="space-y-2 text-xs text-[#5D6D7E]">
                {product.culinaryUses.map((use, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#96281B] mt-1.5 shrink-0" />
                    <span>{use}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-serif font-bold text-lg text-[#2C3E50]">
                Color & Sensory Profile
              </h3>
              <div className="p-4 rounded-xl bg-[#FCFAF2] border border-[#E8E4D5] space-y-2 text-xs">
                <p>
                  <strong className="text-[#2C3E50]">Color Profile:</strong>{' '}
                  <span className="text-[#5D6D7E]">{product.colorProfile}</span>
                </p>
                <p>
                  <strong className="text-[#2C3E50]">Aroma Bouquet:</strong>{' '}
                  <span className="text-[#5D6D7E]">{product.aromaNotes}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Spices */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#D35400] font-bold">
              Pair Together
            </span>
            <h2 className="font-serif italic font-bold text-2xl text-[#2C3E50]">
              Complete Your Shahi Spice Rack
            </h2>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-bold text-[#96281B] hover:underline uppercase tracking-wider"
          >
            View All Spices →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onSelectProduct={(slug) => onNavigate('product-detail', slug)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
