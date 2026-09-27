import React, { useState, useEffect } from 'react';
import { Product, PackSize } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { platformService } from '../services';
import { X, Plus, Minus, ShoppingBag, Sparkles, Check, Flame } from 'lucide-react';

interface ProductVariantModalProps {
  product: Product | null;
  initialPackIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: any, slugOrId?: string) => void;
}

export const getFriendlyToastText = (product: Product, pack: PackSize): string => {
  let weightStr = pack.weightInGrams ? `${pack.weightInGrams}g` : pack.size;
  if (!pack.weightInGrams && pack.size) {
    const match = pack.size.match(/\d+\s*(?:g|kg|gm)/i);
    weightStr = match ? match[0].replace(/\s+/g, '') : pack.size;
  }

  let spiceName = '';
  const searchStr = `${product.name} ${product.id} ${product.slug} ${product.hindiName}`.toLowerCase();
  if (searchStr.includes('haldi') || searchStr.includes('turmeric')) {
    spiceName = 'Haldi';
  } else if (searchStr.includes('dhaniya') || searchStr.includes('coriander')) {
    spiceName = 'Dhaniya';
  } else if (searchStr.includes('chili') || searchStr.includes('mirch')) {
    spiceName = 'Mirch';
  } else {
    spiceName = product.name;
  }

  return `${weightStr} ${spiceName} added to cart`;
};

export const ProductVariantModal: React.FC<ProductVariantModalProps> = ({
  product,
  initialPackIndex = 0,
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { addToCart } = useCart();
  const { isAuthenticated, customer } = useAuth();
  const [selectedPackIndex, setSelectedPackIndex] = useState<number>(initialPackIndex);
  const [quantity, setQuantity] = useState<number>(1);

  // Sync state whenever the opened product or initial pack index changes
  useEffect(() => {
    if (product) {
      const validIndex =
        initialPackIndex >= 0 && initialPackIndex < product.packSizes.length
          ? initialPackIndex
          : 0;
      setSelectedPackIndex(validIndex);
      setQuantity(1);
    }
  }, [product, initialPackIndex, isOpen]);

  // Lock body scroll while modal is active & listen to Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) {
    return null;
  }

  const currentPack: PackSize = product.packSizes[selectedPackIndex] || product.packSizes[0];
  const totalPrice = currentPack.price * quantity;
  const packSavings = currentPack.originalPrice
    ? (currentPack.originalPrice - currentPack.price) * quantity
    : 0;

  const handleAddToCartClick = () => {
    if (!isAuthenticated || !customer) {
      if (onNavigate) {
        onNavigate('login');
      } else {
        platformService.navigateToHash('/login');
      }
      onClose();
      return;
    }

    const toastMsg = getFriendlyToastText(product, currentPack);
    addToCart(product, currentPack, quantity, { openDrawer: false, customToast: toastMsg });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      {/* Modal / Bottom Sheet Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-md bg-[#FCFAF2] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#E8E4D5] overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
      >
        {/* Mobile Pull Indicator */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[#2C3E50]/20 rounded-full" />
        </div>

        {/* Header with Close Button */}
        <div className="flex items-center justify-between px-5 pt-3 sm:pt-5 pb-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#96281B]/10 text-[#96281B] text-[10px] font-bold uppercase tracking-widest rounded-full border border-[#96281B]/20">
              {product.categoryLabel || 'Pure Spice'}
            </span>
            {product.hindiName && (
              <span className="text-xs font-serif italic text-[#5D6D7E]">
                {product.hindiName}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#E8E4D5] text-[#2C3E50] hover:bg-[#96281B] hover:text-white hover:border-[#96281B] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto px-5 pb-6 space-y-4">
          {/* 1. Product Image Showcase */}
          <div className="relative aspect-16/10 rounded-2xl bg-[#F7F3E8] border border-[#E8E4D5] flex items-center justify-center p-3 overflow-hidden group">
            <img
              src={currentPack.imageUrl || product.imageUrl}
              alt={`${product.name} ${currentPack.size}`}
              className="w-full h-full object-contain drop-shadow-md transition-all duration-300 group-hover:scale-105"
            />
            {product.badge && (
              <div className="absolute top-2.5 left-2.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#96281B] text-white shadow-xs">
                  <Sparkles className="w-3 h-3 text-[#F1C40F]" />
                  {product.badge}
                </span>
              </div>
            )}
            {product.heatLevel && product.heatLevel > 1 && (
              <div className="absolute top-2.5 right-2.5 bg-[#FCFAF2]/95 backdrop-blur-xs px-2 py-0.5 rounded-md border border-[#E8E4D5] text-[10px] font-bold text-[#96281B] flex items-center gap-1 shadow-xs">
                <Flame className="w-3 h-3 fill-current" />
                <span>Heat: {product.heatLevel}/5</span>
              </div>
            )}
          </div>

          {/* 2. Product Name & Short Description */}
          <div>
            <h3 className="font-serif italic font-bold text-xl sm:text-2xl text-[#2C3E50] leading-snug">
              {product.name}
            </h3>
            <p className="text-xs text-[#5D6D7E] mt-1.5 leading-relaxed">
              {product.shortDesc}
            </p>
          </div>

          {/* 3. Pack Size Selection */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-[#2C3E50]">
                Choose Pack Size
              </span>
              <span className="text-[11px] text-[#5D6D7E]">
                Selected: <strong className="text-[#96281B]">{currentPack.size}</strong>
              </span>
            </div>

            {/* Pack Size Cards Grid */}
            <div
              className={`grid gap-2.5 ${
                product.packSizes.length === 2
                  ? 'grid-cols-2'
                  : 'grid-cols-3'
              }`}
            >
              {product.packSizes.map((pack, idx) => {
                const isSelected = selectedPackIndex === idx;
                const discount = pack.originalPrice
                  ? pack.originalPrice - pack.price
                  : 0;
                const discountPercent = pack.originalPrice
                  ? Math.round(((pack.originalPrice - pack.price) / pack.originalPrice) * 100)
                  : 0;

                // Format clean size label, e.g. "100 g", "250 g", "500 g"
                const cleanSize = pack.weightInGrams ? `${pack.weightInGrams} g` : pack.size;

                return (
                  <button
                    key={pack.size}
                    type="button"
                    onClick={() => setSelectedPackIndex(idx)}
                    className={`relative p-3 rounded-xl border text-center transition-all flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-2 border-[#96281B] bg-[#96281B]/5 ring-2 ring-[#96281B]/15 shadow-sm'
                        : 'border-[#E8E4D5] bg-white hover:border-[#96281B]/40 hover:bg-[#FCFAF2]'
                    }`}
                  >
                    {/* Selected Badge */}
                    {isSelected && (
                      <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#96281B] rounded-full text-white flex items-center justify-center shadow-xs">
                        <Check className="w-2.5 h-2.5 stroke-3" />
                      </div>
                    )}

                    {/* Pack Size Label */}
                    <div className="font-bold text-xs sm:text-sm text-[#2C3E50]">
                      {cleanSize}
                    </div>

                    {/* Price & MRP */}
                    <div className="mt-2 space-y-0.5">
                      <div className="font-serif font-bold text-base sm:text-lg text-[#96281B] leading-none">
                        ₹{pack.price}
                      </div>
                      {pack.originalPrice && (
                        <div className="text-[10px] text-[#5D6D7E] line-through leading-none">
                          MRP ₹{pack.originalPrice}
                        </div>
                      )}
                    </div>

                    {/* Discount Pill if available */}
                    {discount > 0 && (
                      <div className="mt-1.5">
                        <span className="inline-block px-1.5 py-0.5 bg-[#2D5A27]/10 text-[#2D5A27] text-[9px] font-bold rounded">
                          {discountPercent > 0 ? `${discountPercent}% OFF` : `Save ₹${discount}`}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Quantity Stepper */}
          <div className="pt-2 border-t border-[#E8E4D5] flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-[#2C3E50]">
              Quantity
            </span>

            <div className="flex items-center border border-[#E8E4D5] rounded-xl bg-white shadow-xs">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 flex items-center justify-center hover:bg-[#FCFAF2] text-[#2C3E50] rounded-l-xl transition-colors cursor-pointer"
                title="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <span className="w-10 text-center text-sm font-bold text-[#2C3E50]">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-9 h-9 flex items-center justify-center hover:bg-[#FCFAF2] text-[#2C3E50] rounded-r-xl transition-colors cursor-pointer"
                title="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 5. Add To Cart Button */}
          <div className="pt-2 space-y-2">
            <button
              id="variant-add-to-cart-btn"
              type="button"
              onClick={handleAddToCartClick}
              className="w-full py-3.5 px-6 rounded-xl bg-[#96281B] hover:bg-[#7D2116] text-white font-bold text-xs uppercase tracking-widest flex items-center justify-between shadow-lg shadow-[#96281B]/25 transition-all cursor-pointer active:scale-[0.99]"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>ADD TO CART</span>
              </span>
              <span className="text-sm font-serif font-bold text-amber-200">
                ₹{totalPrice}
              </span>
            </button>

            {/* Savings hint if any */}
            {packSavings > 0 && (
              <p className="text-center text-[11px] text-[#2D5A27] font-semibold">
                🎉 You are saving ₹{packSavings} on this selection!
              </p>
            )}

            {!isAuthenticated && (
              <p className="text-center text-[10px] text-[#5D6D7E]">
                * Sign-in required at checkout. Your spice selection will be saved to your account.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
