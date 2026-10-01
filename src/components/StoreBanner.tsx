import React, { useState } from 'react';
import { StoreSettings } from '../types';
import { Coupon } from '../data/neighborhoods';
import { MapPin, Clock, MessageSquare, Truck, ShieldCheck, Sparkles, Tag, ChevronRight, Copy, Check, Utensils } from 'lucide-react';
import { formatCurrency, getWhatsappUrl } from '../utils/formatters';
import { BARRANCO_LOGO_URL, DEFAULT_BANNER_URL } from '../assets/logo';
import { getStoreScheduleStatus } from '../utils/storeSchedule';

interface StoreBannerProps {
  storeSettings: StoreSettings;
  onOpenCouponInfo: () => void;
  onOpenFlavorCatalog: () => void;
  isStoreOpen?: boolean;
  coupons?: Coupon[];
}

export const StoreBanner: React.FC<StoreBannerProps> = ({
  storeSettings,
  onOpenFlavorCatalog,
  isStoreOpen,
  coupons = []
}) => {
  const [copied, setCopied] = useState(false);
  const isOpen = isStoreOpen !== undefined ? isStoreOpen : getStoreScheduleStatus(storeSettings).isOpen;
  const activeBannerUrl = storeSettings.bannerUrl || DEFAULT_BANNER_URL;
  const activeLogoUrl = storeSettings.logoUrl || BARRANCO_LOGO_URL;

  const whatsappHelpUrl = getWhatsappUrl(
    storeSettings.whatsapp,
    `Olá! Gostaria de fazer um pedido ou tirar uma dúvida sobre o cardápio do ${storeSettings.name}.`
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const featuredCoupon = coupons.find(
    (c) => c.active !== false && (!c.expiresAt || c.expiresAt >= todayStr)
  ) || coupons[0];

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden bg-zinc-950 border-b border-zinc-800">
      {/* Blurred Ambient Background Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img
          src={activeBannerUrl}
          alt=""
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-25 blur-xl scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/75 via-zinc-950/85 to-zinc-950" />
      </div>

      <div className="container mx-auto px-4 pt-4 pb-6 sm:pt-6 sm:pb-8 relative z-10 space-y-5">
        {/* Full Unobstructed Official Visual Banner */}
        <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl bg-zinc-900">
          <img
            src={activeBannerUrl}
            alt={`Banner ${storeSettings.name} - Deliciosa Comida Caseira`}
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = DEFAULT_BANNER_URL;
            }}
            className="w-full h-auto object-contain object-center block mx-auto"
          />

          {/* Top Status Badge */}
          <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-extrabold px-3 py-1 sm:py-1.5 rounded-full backdrop-blur-md shadow-lg border ${
                isOpen
                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-400/50'
                  : 'bg-red-950/90 text-red-300 border-red-400/50'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                }`}
              />
              {isOpen ? 'Aberto Agora' : 'Fechado no Momento'}
            </span>
          </div>
        </div>

        {/* Store Details & Active Coupon Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Main Info */}
          <div className="lg:col-span-8 bg-zinc-900/75 border border-zinc-800/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 backdrop-blur-sm">
            <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0">
                <img
                  src={activeLogoUrl}
                  alt={storeSettings.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = BARRANCO_LOGO_URL;
                  }}
                  className="w-full h-full object-contain filter drop-shadow-[0_6px_16px_rgba(0,0,0,0.7)]"
                />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Utensils className="w-3.5 h-3.5" />
                  <span>{storeSettings.tagline || 'Marmitaria / Comida Caseira'}</span>
                </div>
                <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                  {storeSettings.name}
                </h2>
                <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                  {storeSettings.bannerSubtitle ||
                    'Sabor de comida feita em casa, preparada todos os dias com ingredientes fresquinhos e aquele tempero especial da Larissa. Monte seu pedido e receba quentinho!'}
                </p>
              </div>
            </div>

            {/* Info Pills */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs sm:text-sm text-zinc-200 pt-1">
              <div className="flex items-center gap-1.5 bg-zinc-800/90 px-3 py-2 rounded-xl border border-zinc-700/70">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{storeSettings.openingHours}</span>
              </div>

              <div className="flex items-center gap-1.5 bg-zinc-800/90 px-3 py-2 rounded-xl border border-zinc-700/70">
                <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                <span className="truncate max-w-[240px] sm:max-w-none">{storeSettings.address}</span>
              </div>

              <a
                href={whatsappHelpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-500/40 px-3.5 py-2 rounded-xl transition font-semibold"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Atendimento WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Promo Card Highlight on the right */}
          <div className="lg:col-span-4 bg-gradient-to-br from-zinc-800/90 to-zinc-900/90 border border-zinc-700/80 rounded-2xl p-4 sm:p-5 shadow-xl relative backdrop-blur-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  Cupom Ativo Hoje
                </span>
                {featuredCoupon && (
                  <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-[11px] font-bold px-2 py-0.5 rounded-md">
                    {featuredCoupon.type === 'percentage' ? `${featuredCoupon.value}% OFF` : `R$ ${featuredCoupon.value} OFF`}
                  </span>
                )}
              </div>

              {featuredCoupon ? (
                <div className="bg-zinc-950/80 border border-dashed border-amber-500/50 rounded-xl p-2.5 text-center my-1.5">
                  <span className="text-xs text-zinc-400 block mb-0.5">Use o cupom no carrinho:</span>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-mono font-black text-amber-400 text-lg tracking-widest">
                      {featuredCoupon.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCoupon(featuredCoupon.code)}
                      className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
                      title="Copiar código do cupom"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  {featuredCoupon.minOrder > 0 && (
                    <span className="text-[10px] text-zinc-400 block mt-0.5">
                      Acima de {formatCurrency(featuredCoupon.minOrder)}
                    </span>
                  )}
                </div>
              ) : (
                <div className="bg-zinc-950/80 border border-dashed border-zinc-700 rounded-xl p-3 text-center my-2">
                  <span className="text-xs text-zinc-400 block">Peça direto pelo cardápio</span>
                </div>
              )}

              <div className="space-y-1.5 text-xs text-zinc-300 mt-2.5 pt-2 border-t border-zinc-700/50">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Frete grátis em compras acima de {formatCurrency(storeSettings.freeDeliveryAbove)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Pagamento seguro via PIX Automático ou Cartão</span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenFlavorCatalog}
              className="mt-3 w-full bg-zinc-700/60 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition border border-zinc-600/50 cursor-pointer"
            >
              <span>Conhecer nossos Acompanhamentos & Molhos</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

