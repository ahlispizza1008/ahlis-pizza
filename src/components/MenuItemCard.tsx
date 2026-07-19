import { useState, useEffect } from 'react';
import { MenuItem, MenuSize } from '../types';
import { Pizza, Sparkles, ShoppingBag, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

interface MenuItemCardProps {
  key?: any;
  item: MenuItem;
  sizes: MenuSize[];
  onAddToCart?: (item: any, selectedSize: any) => void;
  categoryName?: string;
}

export function MenuItemCard({ item, sizes, onAddToCart, categoryName }: MenuItemCardProps) {
  const { user } = useAuth();
  // Sort sizes by price ascending
  const sortedSizes = [...sizes].sort((a, b) => a.price - b.price);
  
  // Set default selected size
  const [selectedSize, setSelectedSize] = useState<MenuSize | null>(null);
  const [added, setAdded] = useState(false);

  const formatSizeName = (sizeName: string): string => {
    if (!sizeName) return '';
    const normalized = sizeName.trim().toLowerCase();
    
    if (normalized.includes('personal') || normalized.includes('small') || normalized.includes('regular')) {
      return 'Regular';
    }
    if (normalized.includes('medium')) {
      return 'Medium';
    }
    if (normalized.includes('large')) {
      return 'Large';
    }
    if (normalized.includes('6 knots') || normalized.includes('6-inch') || normalized.includes('6 inch') || normalized.includes('6inch')) {
      return '6 inch';
    }
    if (normalized.includes('12 knots') || normalized.includes('12-inch') || normalized.includes('12 inch') || normalized.includes('12inch')) {
      return '12 inch';
    }
    
    return sizeName
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  useEffect(() => {
    if (sortedSizes.length > 0) {
      setSelectedSize(sortedSizes[0]);
    } else {
      setSelectedSize(null);
    }
  }, [sizes]);

  // Determine which price to show
  const displayPrice = selectedSize ? selectedSize.price : (item.price || 0);

  const isAvailable = item.is_available !== false;

  const handleAddToCartClick = () => {
    if (onAddToCart) {
      onAddToCart(item, selectedSize);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 800);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      id={`menu-item-card-${item.id}`}
      className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl hover:border-gray-200/60 hover:translate-y-[-4px] transition-all duration-300 ease-in-out overflow-hidden flex flex-col h-full group"
    >
      {/* Food Image Header */}
      <div className="relative h-44 sm:h-48 w-full bg-stone-100 overflow-hidden">
        <img
          src={item.image_url}
          alt={item.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Premium dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none group-hover:from-black/60 transition-all duration-300" />

        {/* Availability / Sold out Badge */}
        {!isAvailable ? (
          <div className="absolute top-3 right-3 bg-stone-900/95 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-full font-bold tracking-wide shadow-md">
            Sold Out
          </div>
        ) : (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-[#e63946] text-[8px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full font-black shadow-xs border border-red-500/10 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-[#e63946] animate-pulse" /> Fresh
          </div>
        )}
      </div>

      {/* Card Content body */}
      <div className="p-4 flex flex-col flex-grow text-left justify-between">
        <div className="mb-3">
          <h3 id={`item-title-${item.id}`} className="font-sans text-base text-stone-900 font-extrabold tracking-tight group-hover:text-[#e63946] transition-colors duration-200 leading-snug">
            {item.name}
          </h3>

          {item.description && (
            <p id={`item-desc-${item.id}`} className="text-stone-500 text-xs line-clamp-2 mt-1 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        <div className="space-y-3 pt-3 border-t border-gray-100/80">
          {/* Sizes Selector */}
          {sortedSizes.length > 0 && (
            <div>
              <span className="text-[9px] font-mono tracking-wider uppercase text-stone-400 block mb-1.5 font-bold">
                Select Size
              </span>
              <div className="flex flex-wrap gap-2" id={`sizes-container-${item.id}`}>
                {sortedSizes.map((size) => {
                  const isSelected = selectedSize?.id === size.id;
                  const rawSizeName = size.size_name || size.size || '';
                  const displayName = formatSizeName(rawSizeName);
                  return (
                    <button
                      key={size.id}
                      id={`btn-size-${size.id}`}
                      disabled={!isAvailable}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1 rounded-full border text-xs font-semibold transition cursor-pointer
                        ${
                          isSelected
                            ? "bg-[#e63946] text-white border-[#e63946] shadow-xs"
                            : "bg-white text-stone-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                        } ${!isAvailable ? 'opacity-40 cursor-not-allowed border-stone-100 bg-stone-50 text-stone-400' : ''}`}
                    >
                      {displayName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pricing Row */}
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono tracking-wider text-stone-400 font-bold uppercase">
              Price
            </span>
            <div className="overflow-hidden h-8 flex items-center">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={displayPrice}
                  initial={{ y: 12, opacity: 0, scale: 0.8 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -12, opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 24 }}
                  id={`price-${item.id}`}
                  className="text-xl md:text-2xl font-black text-[#e63946] block font-sans"
                >
                  ₹{Math.round(Number(displayPrice))}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Full-width Add To Cart button */}
          <button
            id={`add-to-cart-${item.id}`}
            disabled={!isAvailable || !user}
            onClick={handleAddToCartClick}
            className={`w-full py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
              added 
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95' 
                : 'bg-[#e63946] hover:bg-[#d62839] text-white hover:shadow-md hover:shadow-red-500/10 active:scale-98'
            } ${!isAvailable ? 'opacity-40 cursor-not-allowed shadow-none hover:translate-y-0' : ''} ${
              !user ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {added ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-bounce" /> Added!
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
