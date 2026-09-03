import React, { useState } from 'react';
import { StoreSettings } from '../types';
import { Coupon } from '../data/neighborhoods';
import { MapPin, Clock, MessageSquare, Truck, ShieldCheck, Sparkles, Tag, ChevronRight, Copy, Check } from 'lucide-react';
import { formatCurrency, getWhatsappUrl } from '../utils/formatters';
import { BARRANCO_LOGO_URL } from '../assets/logo';
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
  onOpenCouponInfo,
  onOpenFlavorCatalog,
  isStoreOpen,
  coupons = []
}) => {
  const [copied, setCopied] = useState(false);
  const isOpen = isStoreOpen !== undefined ? isStoreOpen : getStoreScheduleStatus(storeSettings).isOpen;
  const whatsappHelpUrl = getWhatsappUrl(
    storeSettings.whatsapp,
    `Olá! Gostaria de tirar uma dúvida sobre o cardápio do ${storeSettings.name}.`
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
    <div className="relative overflow-hidden bg-zinc-900 border-b border-zinc-800">
      {/* Background Graphic Accents */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-950/40 via-zinc-900 to-red-950/30 pointer-events-none" />
      <div className="absolute -right-24 -top-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-24 -bottom-24 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 py-6 sm:py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center shrink-0">
                <img
                  src={storeSettings.logoUrl || BARRANCO_LOGO_URL}
                  alt={storeSettings.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = BARRANCO_LOGO_URL;
                  }}
                  className="w-full h-full object-contain filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)]"
                />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cardápio Oficial & Delivery</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {storeSettings.name}
                </h2>
              </div>
            </div>


            <p className="text-zinc-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Hambúrgueres artesanais suculentos, lanches prensados tradicionais e bebidas bem geladas. Monte seu pedido e receba quentinho no conforto da sua casa!
            </p>

            {/* Info Pills */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-zinc-300 pt-1">
              <div className="flex items-center gap-1.5 bg-zinc-800/80 px-3 py-1.5 rounded-lg border border-zinc-700/60">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{storeSettings.openingHours}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ml-1 border ${
                    isOpen
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}
                >
                  {isOpen ? 'Aberto Agora' : 'Fechado Agora'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-zinc-800/80 px-3 py-1.5 rounded-lg border border-zinc-700/60">
                <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                <span className="truncate max-w-[220px] sm:max-w-none">{storeSettings.address}</span>
              </div>

              <a
                href={whatsappHelpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-lg transition"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Atendimento WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Promo Card Highlight on the right */}
          <div className="lg:col-span-4 bg-gradient-to-br from-zinc-800/90 to-zinc-900/90 border border-zinc-700/80 rounded-2xl p-4 sm:p-5 shadow-xl relative backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
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
              <div className="bg-zinc-950/80 border border-dashed border-amber-500/50 rounded-xl p-3 text-center my-2">
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
                  <span className="text-[10px] text-zinc-400 block mt-1">
                    Acima de {formatCurrency(featuredCoupon.minOrder)}
                  </span>
                )}
              </div>
            ) : (
              <div className="bg-zinc-950/80 border border-dashed border-zinc-700 rounded-xl p-3 text-center my-2">
                <span className="text-xs text-zinc-400 block">Peça direto pelo cardápio</span>
              </div>
            )}

            <div className="space-y-2 text-xs text-zinc-300 mt-3 pt-2 border-t border-zinc-700/50">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Frete grátis em compras acima de {formatCurrency(storeSettings.freeDeliveryAbove)}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Pagamento seguro via PIX Automático ou Cartão</span>
              </div>
            </div>

            <button
              onClick={onOpenFlavorCatalog}
              className="mt-3.5 w-full bg-zinc-700/60 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition border border-zinc-600/50"
            >
              <span>Conhecer nossos 8 Molhos e Sabores</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
