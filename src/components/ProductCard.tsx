import React from 'react';
import { MenuItem } from '../types';
import { Plus, Flame, Clock, Users, Sparkles, Check } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface ProductCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
  countInCart?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  item,
  onSelect,
  countInCart = 0
}) => {
  const hasDiscount = item.originalPrice && item.originalPrice > item.price;
  const discountPercent = hasDiscount
    ? Math.round(((item.originalPrice! - item.price) / item.originalPrice!) * 100)
    : 0;

  return (
    <div
      id={`product-card-${item.id}`}
      className={`group bg-zinc-800/90 border border-zinc-700/70 hover:border-amber-500/60 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between relative ${
        !item.available ? 'opacity-60 grayscale' : ''
      }`}
    >
      {/* Image Container */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-zinc-900">
        <img
          src={item.image}
          alt={item.name}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-80" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          {item.badge && (
            <span className="bg-amber-500 text-zinc-950 font-black text-[11px] px-2.5 py-1 rounded-lg shadow-md uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3 h-3 fill-current" />
              {item.badge}
            </span>
          )}

          {hasDiscount && (
            <span className="bg-red-600 text-white font-black text-[11px] px-2.5 py-1 rounded-lg shadow-md">
              -{discountPercent}% OFF
            </span>
          )}

          {item.isVegetarian && (
            <span className="bg-emerald-600 text-white font-bold text-[11px] px-2 py-1 rounded-lg shadow-md">
              🌱 Veggie
            </span>
          )}
        </div>

        {/* Quantity indicator in cart badge */}
        {countInCart > 0 && (
          <div className="absolute top-2.5 right-2.5 bg-amber-500 text-zinc-950 font-black text-xs px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 z-10 animate-scale-in">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>{countInCart} no carrinho</span>
          </div>
        )}

        {/* Bottom image overlay specs */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-zinc-300 font-medium">
          {item.serves ? (
            <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1 text-zinc-200">
              <Users className="w-3 h-3 text-amber-400" />
              {item.serves}
            </span>
          ) : (
            <span />
          )}

          {item.preparationTime && (
            <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1 text-zinc-300">
              <Clock className="w-3 h-3 text-amber-400" />
              {item.preparationTime}
            </span>
          )}
        </div>
      </div>

      {/* Details Body */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-amber-400 transition-colors leading-snug line-clamp-1">
            {item.name}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 leading-relaxed line-clamp-2">
            {item.description}
          </p>
        </div>

        {/* Footer Price & Action */}
        <div className="pt-3 border-t border-zinc-700/60 flex items-center justify-between gap-2 mt-auto">
          <div>
            {hasDiscount && (
              <span className="text-[11px] text-zinc-500 line-through block -mb-0.5">
                {formatCurrency(item.originalPrice!)}
              </span>
            )}
            <div className="text-amber-400 font-black text-lg sm:text-xl tracking-tight">
              {formatCurrency(item.price)}
            </div>
          </div>

          <button
            onClick={() => onSelect(item)}
            id={`btn-add-${item.id}`}
            disabled={!item.available}
            className={`flex items-center gap-1.5 font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition shadow-md active:scale-95 cursor-pointer whitespace-nowrap ${
              item.available
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-orange-950/40'
                : 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>
              {item.allowedDoneness || (item.flavorsAvailable && item.flavorsAvailable.length > 0) || item.sizes
                ? 'Personalizar'
                : 'Adicionar'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
