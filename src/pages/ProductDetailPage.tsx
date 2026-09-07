import React, { useState, useEffect } from 'react';
import { Page, Product } from '../types';
import { PRODUCTS, getWhatsAppBuyUrl, getWhatsAppGeneralUrl } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import {
  MessageCircle,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Flame,
  ShieldCheck,
  Truck,
  Heart,
  Share2,
  Check,
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
  const [selectedPackIndex, setSelectedPackIndex] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Reset pack selection when product changes
  useEffect(() => {
    setSelectedPackIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productSlug]);

  const currentPack = product.packSizes[selectedPackIndex] || product.packSizes[0];
  const buyWhatsAppUrl = getWhatsAppBuyUrl(product.name, currentPack.size, currentPack.price);

  const relatedProducts = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="space-y-16 pb-16 pt-6">
      {/* Breadcrumb & Back Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Large Product Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-4/3 sm:aspect-1/1 rounded-2xl overflow-hidden bg-[#FCFAF2] border border-[#E8E4D5] shadow-md group">
              <img
                src={currentPack.imageUrl || product.imageUrl}
                alt={`${product.name} — ${currentPack.size}`}
                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-700"
              />

              {/* Badges on image */}
              {product.badge && (
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-serif italic font-bold px-3 py-1.5 rounded-sm bg-[#96281B] text-white shadow-md">
                    <Sparkles className="w-3.5 h-3.5 text-[#F1C40F]" />
                    {product.badge}
                  </span>
                </div>
              )}

              {product.curcuminOrOilContent && (
                <div className="absolute bottom-4 left-4 bg-[#2C3E50]/90 backdrop-blur-xs text-[#FCFAF2] px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/10">
                  {product.curcuminOrOilContent}
                </div>
              )}
            </div>

            {/* Farm Origin Strip */}
            <div className="p-4 rounded-xl bg-white border border-[#E8E4D5] flex items-center justify-between text-xs text-[#5D6D7E]">
              <span className="font-medium">Origin: <strong className="text-[#2C3E50]">{product.origin}</strong></span>
              <span className="text-[#2D5A27] font-bold">100% Traceable Single Origin</span>
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
              <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#2C3E50] block">
                Select Pack Size:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {product.packSizes.map((pack, idx) => {
                  const isSelected = selectedPackIndex === idx;
                  return (
                    <button
                      key={pack.size}
                      id={`pack-size-btn-${idx}`}
                      onClick={() => setSelectedPackIndex(idx)}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#96281B] bg-[#96281B]/5 ring-1 ring-[#96281B]'
                          : 'border-[#E8E4D5] bg-white hover:border-[#96281B]/40'
                      }`}
                    >
                      <p className="text-xs font-bold text-[#2C3E50]">{pack.size}</p>
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

            {/* Price Display & Buy on WhatsApp Action */}
            <div className="bg-white p-5 rounded-xl border border-[#E8E4D5] space-y-4 shadow-xs">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-[#5D6D7E]">Total Price for {currentPack.size}</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="font-serif italic font-bold text-3xl text-[#2C3E50]">
                      ₹{currentPack.price}
                    </span>
                    {currentPack.originalPrice && (
                      <span className="text-sm text-[#5D6D7E] line-through">
                        ₹{currentPack.originalPrice}
                      </span>
                    )}
                    <span className="text-xs font-bold text-[#2D5A27] bg-[#2D5A27]/10 px-2 py-0.5 rounded-sm border border-[#2D5A27]/20">
                      Save ₹{(currentPack.originalPrice || currentPack.price) - currentPack.price}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-[#2D5A27] flex items-center gap-1 justify-end">
                    <Check className="w-3.5 h-3.5" />
                    In Stock
                  </span>
                  <span className="text-[11px] text-[#5D6D7E]">Ships in 24 Hours</span>
                </div>
              </div>

              {/* Main CTA Button: Buy Now via WhatsApp */}
              <a
                id="product-detail-whatsapp-buy-btn"
                href={buyWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-lg bg-[#2D5A27] hover:bg-[#1E3E1A] text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md shadow-[#2D5A27]/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Buy Now via WhatsApp</span>
              </a>

              <p className="text-[11px] text-center text-[#5D6D7E]">
                Opens WhatsApp with pre-filled message: "Order {product.name} ({currentPack.size})". Fast checkout!
              </p>
            </div>

            {/* Assurances */}
            <div className="grid grid-cols-2 gap-2 text-xs text-[#5D6D7E] pt-2">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#D35400]" />
                <span>Doorstep Delivery Across India</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2D5A27]" />
                <span>100% Purity Replacement Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Information Tabs / Specifications */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-[#E8E4D5] p-6 sm:p-10 shadow-xs space-y-8">
          <div>
            <h2 className="font-serif italic font-bold text-2xl text-[#2C3E50] mb-3">
              About This Pure Spice
            </h2>
            <p className="text-sm sm:text-base text-[#5D6D7E] leading-relaxed">
              {product.fullDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-[#E8E4D5]">
            {/* Color & Aroma Profile */}
            <div className="space-y-4">
              <h3 className="font-serif italic font-bold text-lg text-[#2C3E50] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#F1C40F]" />
                <span>Color & Aroma Profile</span>
              </h3>
              <div className="space-y-2 text-sm text-[#2C3E50]">
                <div className="p-3.5 rounded-lg bg-[#FCFAF2] border border-[#E8E4D5]">
                  <p className="font-bold text-[10px] uppercase text-[#D35400] tracking-widest mb-1">
                    Visual Color
                  </p>
                  <p className="text-xs text-[#5D6D7E]">{product.colorProfile}</p>
                </div>
                <div className="p-3.5 rounded-lg bg-[#FCFAF2] border border-[#E8E4D5]">
                  <p className="font-bold text-[10px] uppercase text-[#F1C40F] tracking-widest mb-1">
                    Khushboo & Aroma
                  </p>
                  <p className="text-xs text-[#5D6D7E]">{product.aromaNotes}</p>
                </div>
              </div>
            </div>

            {/* Culinary Uses */}
            <div className="space-y-4">
              <h3 className="font-serif italic font-bold text-lg text-[#2C3E50] flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#96281B]" />
                <span>Recommended Culinary Uses</span>
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-[#5D6D7E]">
                {product.culinaryUses.map((use, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2D5A27] shrink-0 mt-0.5" />
                    <span>{use}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quality Features List */}
          <div className="pt-6 border-t border-[#E8E4D5]">
            <h3 className="font-serif italic font-bold text-lg text-[#2C3E50] mb-4">
              Quality & Lab Benchmarks
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {product.qualityFeatures.map((feat, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg bg-[#FCFAF2] border border-[#E8E4D5] text-xs text-[#2C3E50] font-medium flex items-center gap-2.5"
                >
                  <span className="w-2 h-2 rounded-full bg-[#96281B] shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif italic font-bold text-2xl text-[#2C3E50]">
            More Pure Spices to Pair With
          </h2>
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
