import React from 'react';
import { Product } from '../types';
import { getWhatsAppBuyUrl } from '../data/products';
import { MessageCircle, Eye, Flame, Sparkles, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (slug: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectProduct }) => {
  const primaryPack = product.packSizes[0];
  const buyWhatsAppUrl = getWhatsAppBuyUrl(product.name, primaryPack.size, primaryPack.price);

  return (
    <div className="group bg-[#FCFAF2] rounded-xl border border-[#E8E4D5] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col h-full">
      {/* Product Image Box */}
      <div
        onClick={() => onSelectProduct(product.slug)}
        className="relative aspect-4/3 overflow-hidden bg-[#F7F3E8] cursor-pointer"
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <span className="text-xs font-semibold text-white bg-[#2C3E50]/80 backdrop-blur-xs px-3 py-1 rounded-full flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            View Aroma Details
          </span>
        </div>

        {/* Badge - Artistic Flair */}
        {product.badge && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm bg-[#96281B] text-white shadow-xs">
              <Sparkles className="w-3 h-3 text-[#F1C40F]" />
              {product.badge}
            </span>
          </div>
        )}

        {/* Heat or Curcumin Indicator */}
        {product.heatLevel && product.heatLevel > 1 && (
          <div className="absolute top-3 right-3 bg-[#FCFAF2]/95 backdrop-blur-xs px-2 py-0.5 rounded-sm border border-[#E8E4D5] text-[10px] font-bold text-[#96281B] flex items-center gap-0.5">
            <Flame className="w-3 h-3 fill-current" />
            <span>Heat: {product.heatLevel}/5</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Hindi Name */}
          <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
            <span className="text-[#D35400] font-bold uppercase tracking-widest text-[10px]">
              {product.categoryLabel}
            </span>
            <span className="text-[#5D6D7E] font-serif italic text-xs">{product.hindiName}</span>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => onSelectProduct(product.slug)}
            className="font-serif italic font-bold text-lg text-[#2C3E50] group-hover:text-[#96281B] transition-colors cursor-pointer line-clamp-1"
          >
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-[#5D6D7E] line-clamp-2 mt-1.5 leading-relaxed">
            {product.shortDesc}
          </p>

          {/* Aroma Notes Feature */}
          <div className="mt-3 p-2.5 rounded-lg bg-white border border-[#E8E4D5] text-[11px] text-[#2C3E50] flex items-start gap-1.5">
            <span className="text-[#D35400] font-bold shrink-0">Khushboo:</span>
            <span className="line-clamp-1 italic text-[#5D6D7E]">{product.aromaNotes}</span>
          </div>
        </div>

        {/* Pricing & Actions */}
        <div className="pt-4 mt-4 border-t border-[#E8E4D5]">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-[11px] text-[#5D6D7E] uppercase tracking-wider">Starting from</span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif font-bold text-xl text-[#96281B]">
                  ₹{primaryPack.price}
                </span>
                {primaryPack.originalPrice && (
                  <span className="text-xs text-[#5D6D7E] line-through">
                    ₹{primaryPack.originalPrice}
                  </span>
                )}
                <span className="text-[11px] text-[#5D6D7E]">({primaryPack.size})</span>
              </div>
            </div>

            <div className="flex items-center text-[11px] text-[#2D5A27] font-bold gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>In Stock</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSelectProduct(product.slug)}
              className="px-3 py-2 text-xs font-bold text-[#2C3E50] bg-[#E8E4D5]/60 hover:bg-[#E8E4D5] rounded-lg transition-colors text-center cursor-pointer uppercase tracking-wider"
            >
              Details
            </button>

            <a
              id={`buy-whatsapp-${product.slug}`}
              href={buyWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-xs font-bold text-white bg-[#2D5A27] hover:bg-[#1E3E1A] rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer uppercase tracking-wider"
              title="Order on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
