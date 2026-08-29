import React from 'react';
import { CategoryId } from '../types';
import { Utensils, Flame, Sparkles, Percent, Leaf, Award } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: CategoryId;
  onSelectCategory: (category: CategoryId) => void;
  activeFilter: 'all' | 'popular' | 'promos' | 'veggie';
  onSelectFilter: (filter: 'all' | 'popular' | 'promos' | 'veggie') => void;
  counts: Record<CategoryId, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  activeFilter,
  onSelectFilter,
  counts
}) => {
  const categories: { id: CategoryId; label: string; icon: string; badgeText?: string }[] = [
    { id: 'todos', label: 'Todos os Itens', icon: '🍽️' },
    { id: 'hamburguer', label: 'Hambúrguer', icon: '🍔' },
    { id: 'hamburguer_caseiro', label: 'Caseiro 150g', icon: '🥩' },
    { id: 'frango', label: 'Frango', icon: '🍗' },
    { id: 'calabresa', label: 'Calabresa', icon: '🥓' },
    { id: 'lombo', label: 'Lombo', icon: '🍖' },
    { id: 'file', label: 'Filé', icon: '🥩' },
    { id: 'hot_dog', label: 'Hot Dog', icon: '🌭' },
    { id: 'diversos', label: 'Diversos', icon: '🥪' },
    { id: 'bebidas', label: 'Bebidas', icon: '🥤' },
    { id: 'porcoes', label: 'Porções', icon: '🍟' },
    { id: 'sobremesas', label: 'Sobremesas', icon: '🍰' },
    { id: 'combos', label: 'Combos & Ofertas', icon: '⚡' }
  ];

  return (
    <div className="bg-zinc-900/90 border-b border-zinc-800 sticky top-[95px] sm:top-[105px] z-30 backdrop-blur-md shadow-md py-3">
      <div className="container mx-auto px-4 space-y-3">
        
        {/* Main Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none scroll-smooth">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = counts[cat.id] || 0;

            return (
              <button
                key={cat.id}
                id={`cat-btn-${cat.id}`}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-950/50 scale-[1.02]'
                    : 'bg-zinc-800/90 text-zinc-300 hover:bg-zinc-700/90 hover:text-white border border-zinc-700/50'
                }`}
              >
                <span className="text-base sm:text-lg">{cat.icon}</span>
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    isSelected ? 'bg-black/30 text-white' : 'bg-zinc-700 text-zinc-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Filter Badges (Popular, Promos, Veggie) */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs text-zinc-300 pt-0.5">
          <span className="text-zinc-500 text-[11px] font-medium uppercase tracking-wider pl-1 hidden sm:inline">
            Filtros:
          </span>

          <button
            onClick={() => onSelectFilter('all')}
            className={`px-3 py-1 rounded-lg border transition ${
              activeFilter === 'all'
                ? 'bg-zinc-700 border-zinc-500 text-white font-semibold'
                : 'border-zinc-800 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400'
            }`}
          >
            Todos
          </button>

          <button
            onClick={() => onSelectFilter('popular')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition ${
              activeFilter === 'popular'
                ? 'bg-amber-950/70 border-amber-500/80 text-amber-300 font-semibold'
                : 'border-zinc-800 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Mais Pedidos</span>
          </button>

          <button
            onClick={() => onSelectFilter('promos')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition ${
              activeFilter === 'promos'
                ? 'bg-red-950/70 border-red-500/80 text-red-300 font-semibold'
                : 'border-zinc-800 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400'
            }`}
          >
            <Percent className="w-3.5 h-3.5 text-red-400" />
            <span>Ofertas com Desconto</span>
          </button>

          <button
            onClick={() => onSelectFilter('veggie')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition ${
              activeFilter === 'veggie'
                ? 'bg-emerald-950/70 border-emerald-500/80 text-emerald-300 font-semibold'
                : 'border-zinc-800 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400'
            }`}
          >
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            <span>Vegetarianos</span>
          </button>
        </div>

      </div>
    </div>
  );
};
