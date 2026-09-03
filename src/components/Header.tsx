import React from 'react';
import { ShoppingBag, Flame, Search, Clock, Sparkles, ShieldCheck, HelpCircle, Lock } from 'lucide-react';
import { StoreSettings } from '../types';
import { formatCurrency } from '../utils/formatters';
import { BARRANCO_LOGO_URL } from '../assets/logo';
import { getStoreScheduleStatus, StoreScheduleStatus } from '../utils/storeSchedule';

interface HeaderProps {
  storeSettings: StoreSettings;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenFlavorCatalog: () => void;
  onOpenTracker: () => void;
  onOpenAdmin: () => void;
  activeOrdersCount: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isFirebaseConnected?: boolean;
  scheduleStatus?: StoreScheduleStatus;
}

export const Header: React.FC<HeaderProps> = ({
  storeSettings,
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenFlavorCatalog,
  onOpenTracker,
  onOpenAdmin,
  activeOrdersCount,
  searchTerm,
  setSearchTerm,
  isFirebaseConnected = true,
  scheduleStatus
}) => {
  const currentStatus = scheduleStatus || getStoreScheduleStatus(storeSettings);
  const isOpen = currentStatus.isOpen;

  return (
    <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800 text-white shadow-xl">
      {/* Top micro bar with status and alerts */}
      <div
        className={`px-4 py-1.5 text-xs text-white font-medium flex items-center justify-between transition-colors ${
          isOpen
            ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-red-600'
            : 'bg-gradient-to-r from-zinc-950 via-zinc-900 to-red-950 border-b border-red-900/40'
        }`}
      >
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="flex h-2 w-2 relative">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isOpen ? 'bg-emerald-400' : 'bg-red-400'
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isOpen ? 'bg-emerald-400' : 'bg-red-500'
                }`}
              ></span>
            </span>
            <span className="font-semibold">
              {isOpen ? 'Atendimento Aberto' : 'Atendimento Fechado'}
            </span>
            <span
              className={`hidden sm:inline ${
                isOpen ? 'text-amber-100' : 'text-zinc-300'
              }`}
            >
              | {isOpen ? 'Entrega rápida em 30-45 min' : currentStatus.nextOpenTimeMessage}
            </span>
            {isFirebaseConnected && (
              <span className="hidden md:inline-flex items-center gap-1 bg-black/25 text-[10px] text-amber-200 px-2 py-0.5 rounded-full font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>Firebase Sync</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-amber-100">
              🛵 Frete Grátis acima de {formatCurrency(storeSettings.freeDeliveryAbove)}
            </span>
            <button
              onClick={onOpenAdmin}
              className="text-[11px] bg-black/35 hover:bg-black/55 text-amber-200 border border-amber-500/30 hover:border-amber-400 px-2.5 py-0.5 rounded-full transition flex items-center gap-1.5 font-medium cursor-pointer shadow-sm"
              title="Painel de controle do restaurante (Acesso protegido por senha do dono)"
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Painel do Dono</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer select-none">
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center shrink-0 group">
              <img
                src={storeSettings.logoUrl || BARRANCO_LOGO_URL}
                alt={storeSettings.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = BARRANCO_LOGO_URL;
                }}
                className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] transform group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-lg sm:text-2xl tracking-tight text-white flex items-center gap-1.5 leading-none">
                  <span>{storeSettings.name}</span>
                </h1>
                <span
                  className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block border ${
                    isOpen
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}
                >
                  {isOpen ? 'Aberto' : 'Fechado'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block truncate max-w-xs md:max-w-md mt-1">
                {storeSettings.tagline}
              </p>
            </div>
          </div>


          {/* Search bar on desktop */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar lanches, porções, bebidas, combos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-800/80 border border-zinc-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white px-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Flavor Catalog Button */}
            <button
              onClick={onOpenFlavorCatalog}
              id="btn-sabores-header"
              className="flex items-center gap-1.5 bg-zinc-800/90 hover:bg-zinc-700/90 text-amber-400 hover:text-amber-300 border border-amber-500/30 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shadow-sm cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Catálogo de</span> Sabores
            </button>

            {/* Orders Tracker Button */}
            <button
              onClick={onOpenTracker}
              id="btn-tracker-header"
              className="relative flex items-center gap-1.5 bg-zinc-800/90 hover:bg-zinc-700/90 text-zinc-200 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-zinc-700 transition"
              title="Acompanhar Meus Pedidos"
            >
              <Clock className="w-4 h-4 text-orange-400" />
              <span className="hidden lg:inline">Pedidos</span>
              {activeOrdersCount > 0 && (
                <span className="w-5 h-5 bg-orange-500 text-white font-bold text-xs rounded-full flex items-center justify-center animate-bounce">
                  {activeOrdersCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              id="btn-cart-header"
              className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-bold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-lg shadow-orange-950/50 hover:shadow-orange-900/60 transition active:scale-95 group cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 group-hover:rotate-6 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-red-600 font-extrabold text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="text-left leading-tight hidden xs:block">
                <span className="block text-[10px] text-amber-100 uppercase tracking-wider font-semibold">
                  Carrinho
                </span>
                <span className="text-xs sm:text-sm font-black">
                  {cartCount === 0 ? 'Vazio' : formatCurrency(cartTotal)}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="mt-3 md:hidden relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar lanches, porções, bebidas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
