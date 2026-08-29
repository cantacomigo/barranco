import React, { useState } from 'react';
import { COMMON_FLAVORS } from '../data/menu';
import { FlavorOption } from '../types';
import { X, Sparkles, Flame, Droplet, ChefHat, Check, Search } from 'lucide-react';

interface FlavorCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FlavorCatalogModal: React.FC<FlavorCatalogModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');

  if (!isOpen) return null;

  const filteredFlavors = COMMON_FLAVORS.filter((flavor) => {
    const matchesSearch =
      flavor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flavor.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterTag === 'all') return matchesSearch;
    if (filterTag === 'picante') return matchesSearch && (flavor.spiceLevel || 0) > 0;
    if (filterTag === 'cremoso') return matchesSearch && flavor.description.toLowerCase().includes('crem');
    return matchesSearch;
  });

  const getSpiceBadge = (level?: number) => {
    if (!level || level === 0) return null;
    return (
      <span className="inline-flex items-center gap-0.5 bg-red-500/20 border border-red-500/30 text-red-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
        <Flame className="w-3 h-3 text-red-400" />
        {level === 1 && 'Levemente Picante'}
        {level === 2 && 'Picante Moderado'}
        {level === 3 && 'Super Picante'}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div
        className="bg-zinc-900 border border-zinc-700/80 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-lg sm:text-xl text-white flex items-center gap-2">
                <span>Catálogo de Sabores & Molhos da Casa</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-xs text-zinc-400">
                Conheça nossos molhos artesanais autorais feitos diariamente com receitas exclusivas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-xl text-zinc-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters & Search */}
        <div className="p-4 bg-zinc-950/40 border-b border-zinc-800/80 flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar sabor ou ingrediente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto text-xs">
            <button
              onClick={() => setFilterTag('all')}
              className={`px-3 py-1.5 rounded-lg border transition ${
                filterTag === 'all'
                  ? 'bg-amber-500 text-zinc-950 font-bold border-amber-500'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300'
              }`}
            >
              Todos ({COMMON_FLAVORS.length})
            </button>
            <button
              onClick={() => setFilterTag('picante')}
              className={`px-3 py-1.5 rounded-lg border transition ${
                filterTag === 'picante'
                  ? 'bg-red-500 text-white font-bold border-red-500'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300'
              }`}
            >
              🌶️ Picantes
            </button>
            <button
              onClick={() => setFilterTag('cremoso')}
              className={`px-3 py-1.5 rounded-lg border transition ${
                filterTag === 'cremoso'
                  ? 'bg-amber-500 text-zinc-950 font-bold border-amber-500'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300'
              }`}
            >
              🧀 Cremosos
            </button>
          </div>
        </div>

        {/* Flavors Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredFlavors.map((flavor, index) => (
            <div
              key={flavor.id}
              className="bg-zinc-800/80 border border-zinc-700/80 hover:border-amber-500/60 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between space-y-3 shadow-md"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 text-xs flex items-center justify-center font-mono font-bold">
                      0{index + 1}
                    </span>
                    <span>{flavor.name}</span>
                  </h3>
                  {flavor.tag && (
                    <span className="bg-zinc-700/80 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                      {flavor.tag}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {flavor.description}
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-700/50 flex items-center justify-between text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  {getSpiceBadge(flavor.spiceLevel)}
                  {!flavor.spiceLevel && (
                    <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                      <Droplet className="w-3 h-3 text-sky-400" /> Suave & Equilibrado
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-amber-400/90 font-medium">
                  Incluso nos Lanches & Porções
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer info note */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 text-center text-xs text-zinc-400 shrink-0">
          💡 <em>Dica:</em> Você pode selecionar seus molhos preferidos gratuitamente ao personalizar qualquer lanche ou porção no cardápio!
        </div>
      </div>
    </div>
  );
};
