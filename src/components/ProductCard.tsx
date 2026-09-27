import React, { useState } from 'react';
import { Product, PackSize } from '../types';
import { useCart } from '../context/CartContext';
import {
  Eye,
  Flame,
  Sparkles,
  Check,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (slug: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectProduct }) => {
  const { addToCart } = useCart();
  const [selectedPackIndex, setSelectedPackIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [justAdded, setJustAdded] = useState(false);

  const currentPack: PackSize = product.packSizes[selectedPackIndex] || product.packSizes[0];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, currentPack, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <div className="group bg-[#FCFAF2] rounded-2xl border border-[#E8E4D5] overflow-hidden shadow-xs hover:shadow-xl hover:border-[#96281B]/40 transition-all duration-300 flex flex-col h-full relative">
      {/* Product Image Box */}
      <div
        onClick={() => onSelectProduct(product.slug)}
        className="relative aspect-4/3 overflow-hidden bg-[#F7F3E8] cursor-pointer"
      >
        <img
          src={currentPack.imageUrl || product.imageUrl}
          alt={`${product.name} ${currentPack.size}`}
          className="w-full h-full object-contain p-4 group-hover:scale-108 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Hover overlay with quick view */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
          <span className="text-xs font-semibold text-white bg-[#2C3E50]/90 backdrop-blur-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
            <Eye className="w-3.5 h-3.5 text-[#F1C40F]" />
            View Aroma Details
          </span>
          <span className="text-[10px] text-white/90 font-medium bg-black/40 px-2 py-1 rounded">
            Click to explore
          </span>
        </div>

        {/* Badge - Artistic Flair */}
        {product.badge && (
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#96281B] text-white shadow-md">
              <Sparkles className="w-3 h-3 text-[#F1C40F]" />
              {product.badge}
            </span>
          </div>
        )}

        {/* Heat Indicator */}
        {product.heatLevel && product.heatLevel > 1 && (
          <div className="absolute top-3 right-3 z-10 bg-[#FCFAF2]/95 backdrop-blur-xs px-2.5 py-1 rounded-md border border-[#E8E4D5] text-[10px] font-bold text-[#96281B] flex items-center gap-1 shadow-xs">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>Heat: {product.heatLevel}/5</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Category & Hindi Name */}
          <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
            <span className="text-[#D35400] font-bold uppercase tracking-widest text-[10px] bg-[#F39C12]/15 px-2 py-0.5 rounded">
              {product.categoryLabel}
            </span>
            <span className="text-[#5D6D7E] font-serif italic text-xs font-medium">
              {product.hindiName}
            </span>
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

          {/* Pack Size Pills */}
          <div className="mt-3.5">
            <span className="text-[10px] uppercase tracking-wider text-[#5D6D7E] font-bold block mb-1.5">
              Available Packs:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {product.packSizes.map((pack, idx) => {
                const isSelected = selectedPackIndex === idx;
                return (
                  <button
                    key={pack.size}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPackIndex(idx);
                    }}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#96281B] text-white border-[#96281B] shadow-xs'
                        : 'bg-white text-[#2C3E50] border-[#E8E4D5] hover:border-[#96281B]/40'
                    }`}
                  >
                    {pack.size}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pricing & Actions */}
        <div className="pt-3 border-t border-[#E8E4D5] space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-serif font-bold text-2xl text-[#96281B]">
                  ₹{currentPack.price}
                </span>
                {currentPack.originalPrice && (
                  <span className="text-xs text-[#5D6D7E] line-through">
                    ₹{currentPack.originalPrice}
                  </span>
                )}
                <span className="text-[11px] text-[#5D6D7E] font-medium">
                  ({currentPack.size})
                </span>
              </div>
            </div>

            <div className="flex items-center text-[11px] text-[#2D5A27] font-bold gap-1 bg-[#2D5A27]/10 px-2 py-0.5 rounded">
              <Check className="w-3.5 h-3.5" />
              <span>In Stock</span>
            </div>
          </div>

          {/* Quantity selector & Add to Cart button */}
          <div className="flex items-center gap-2">
            {/* Quantity Stepper */}
            <div className="flex items-center border border-[#E8E4D5] rounded-xl bg-white shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuantity((q) => Math.max(1, q - 1));
                }}
                className="p-2 hover:bg-[#FCFAF2] text-[#2C3E50] rounded-l-xl transition-colors"
                title="Decrease"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2.5 text-xs font-bold text-[#2C3E50] min-w-[20px] text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setQuantity((q) => q + 1);
                }}
                className="p-2 hover:bg-[#FCFAF2] text-[#2C3E50] rounded-r-xl transition-colors"
                title="Increase"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              id={`add-to-cart-${product.slug}`}
              type="button"
              onClick={handleAddToCart}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                justAdded
                  ? 'bg-[#2D5A27] text-white'
                  : 'bg-[#96281B] hover:bg-[#7D2116] text-white shadow-[#96281B]/20'
              }`}
            >
              {justAdded ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>

          {/* Secondary Action: View Product Details */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => onSelectProduct(product.slug)}
              className="w-full py-2 text-xs font-bold text-[#2C3E50] hover:text-[#96281B] bg-[#E8E4D5]/60 hover:bg-[#E8E4D5] rounded-lg transition-colors text-center cursor-pointer uppercase tracking-wider flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Product Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
