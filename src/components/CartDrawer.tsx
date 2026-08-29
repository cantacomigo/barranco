import React, { useState } from 'react';
import { CartItem, OrderType, StoreSettings } from '../types';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, Truck, Store, MapPin, Check, AlertCircle } from 'lucide-react';
import { formatCurrency, formatItemOptionsText } from '../utils/formatters';
import { NEIGHBORHOODS, VALID_COUPONS, Coupon, NeighborhoodFee } from '../data/neighborhoods';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  selectedNeighborhood: string;
  setSelectedNeighborhood: (neighborhood: string) => void;
  appliedCoupon: Coupon | null;
  setAppliedCoupon: (coupon: Coupon | null) => void;
  storeSettings: StoreSettings;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  neighborhoods?: NeighborhoodFee[];
  coupons?: Coupon[];
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  orderType,
  setOrderType,
  selectedNeighborhood,
  setSelectedNeighborhood,
  appliedCoupon,
  setAppliedCoupon,
  storeSettings,
  subtotal,
  deliveryFee,
  discount,
  total,
  neighborhoods = NEIGHBORHOODS,
  coupons = VALID_COUPONS
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  if (!isOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    const clean = couponInput.trim().toUpperCase();
    if (!clean) return;

    const found = VALID_COUPONS.find((c) => c.code === clean);
    if (!found) {
      setCouponError('Cupom inválido ou expirado.');
      return;
    }

    if (subtotal < found.minOrder) {
      setCouponError(`Pedido mínimo de ${formatCurrency(found.minOrder)} para este cupom.`);
      return;
    }

    setAppliedCoupon(found);
    setCouponSuccess(`Cupom ${found.code} aplicado com sucesso!`);
    setCouponInput('');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
    setCouponSuccess('');
  };

  const isMinOrderMet = subtotal >= storeSettings.minOrderValue;
  const missingForFreeDelivery = Math.max(0, storeSettings.freeDeliveryAbove - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-900 border-l border-zinc-800 text-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-black text-lg text-white">Seu Pedido</h2>
                <p className="text-xs text-zinc-400">
                  {items.length} {items.length === 1 ? 'item selecionado' : 'itens selecionados'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={onClearCart}
                  className="text-xs text-zinc-400 hover:text-red-400 px-2 py-1 transition"
                  title="Limpar todos os itens"
                >
                  Limpar
                </button>
              )}
              <button
                onClick={onClose}
                className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-xl text-zinc-300 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Delivery vs Pickup Selector */}
          <div className="p-3 sm:px-5 bg-zinc-950/40 border-b border-zinc-800/80 shrink-0">
            <div className="grid grid-cols-2 gap-2 bg-zinc-800/80 p-1 rounded-xl border border-zinc-700/60">
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
                  orderType === 'delivery'
                    ? 'bg-amber-500 text-zinc-950 shadow'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>Receber em Casa</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('retirada')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
                  orderType === 'retirada'
                    ? 'bg-amber-500 text-zinc-950 shadow'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Retirar no Balcão</span>
              </button>
            </div>

            {/* Delivery Progress or Neighborhood selector */}
            {orderType === 'delivery' && (
              <div className="mt-3 space-y-2">
                {/* Free delivery tracker */}
                {missingForFreeDelivery > 0 ? (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 text-xs text-amber-200">
                    <div className="flex justify-between font-semibold mb-1">
                      <span>Falta pouco para Frete Grátis!</span>
                      <span className="font-mono text-amber-300">{formatCurrency(missingForFreeDelivery)}</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (subtotal / storeSettings.freeDeliveryAbove) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-500/15 border border-emerald-500/40 rounded-xl p-2 text-xs text-emerald-300 font-bold flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Parabéns! Você ganhou Frete Grátis para entrega!</span>
                  </div>
                )}

                {/* Neighborhood select */}
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <select
                    value={selectedNeighborhood}
                    onChange={(e) => setSelectedNeighborhood(e.target.value)}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {neighborhoods.map((nh) => (
                      <option key={nh.name} value={nh.name}>
                        {nh.name} (Taxa: {formatCurrency(nh.fee)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 divide-y divide-zinc-800/80">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-zinc-400">
                <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-200">Seu carrinho está vazio</h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                    Explore nosso cardápio de lanches artesanais, porções e bebidas geladas para adicionar itens.
                  </p>
                </div>
              </div>
            ) : (
              items.map((cartItem) => {
                const optionsTexts = formatItemOptionsText(cartItem);
                return (
                  <div key={cartItem.cartItemId} className="pt-3 first:pt-0 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3">
                        <img
                          src={cartItem.item.image}
                          alt={cartItem.item.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-xl object-cover border border-zinc-700 shrink-0 bg-zinc-950"
                        />
                        <div>
                          <h4 className="font-bold text-sm text-white leading-snug">
                            {cartItem.item.name}
                          </h4>
                          <span className="text-xs font-black text-amber-400">
                            {formatCurrency(cartItem.unitPrice)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onRemoveItem(cartItem.cartItemId)}
                        className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-800 transition"
                        title="Remover item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Customization pills summary */}
                    {optionsTexts.length > 0 && (
                      <div className="bg-zinc-800/60 rounded-lg p-2 text-[11px] text-zinc-300 space-y-0.5 border border-zinc-700/40">
                        {optionsTexts.map((opt, i) => (
                          <div key={i} className="text-zinc-300 leading-tight">
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quantity controls and item total */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5 bg-zinc-800 border border-zinc-700 rounded-lg p-0.5">
                        <button
                          onClick={() => onUpdateQuantity(cartItem.cartItemId, cartItem.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-200"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-bold text-xs text-white">
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(cartItem.cartItemId, cartItem.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center rounded bg-zinc-700 hover:bg-zinc-600 text-zinc-200"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-extrabold text-sm text-white">
                        {formatCurrency(cartItem.totalPrice)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Summary & Actions */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 bg-zinc-950 border-t border-zinc-800 space-y-3.5 shrink-0">
              
              {/* Coupon Form */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-950/60 border border-emerald-500/40 rounded-xl px-3 py-2 text-xs text-emerald-300">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>
                        Cupom <strong>{appliedCoupon.code}</strong> (-{formatCurrency(discount)})
                      </span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-red-400 hover:text-red-300 text-xs font-semibold"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Cupom de Desconto"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 uppercase font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition"
                    >
                      Aplicar
                    </button>
                  </form>
                )}

                {couponError && (
                  <div className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{couponError}</span>
                  </div>
                )}
                {couponSuccess && (
                  <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>{couponSuccess}</span>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-zinc-300 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal dos itens:</span>
                  <span className="font-semibold text-white">{formatCurrency(subtotal)}</span>
                </div>

                {orderType === 'delivery' && (
                  <div className="flex justify-between">
                    <span>Taxa de entrega ({selectedNeighborhood}):</span>
                    <span className="font-semibold text-white">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-400 font-bold uppercase">Grátis</span>
                      ) : (
                        formatCurrency(deliveryFee)
                      )}
                    </span>
                  </div>
                )}

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Desconto do Cupom:</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-base font-black text-white pt-2 border-t border-zinc-800">
                  <span>Total Final:</span>
                  <span className="text-amber-400 text-lg">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Min Order Warning */}
              {!isMinOrderMet && (
                <div className="bg-red-950/70 border border-red-500/50 rounded-xl p-2.5 text-xs text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>
                    Pedido mínimo de <strong>{formatCurrency(storeSettings.minOrderValue)}</strong>. Adicione mais itens para continuar.
                  </span>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={onProceedToCheckout}
                disabled={!isMinOrderMet}
                id="btn-proceed-checkout"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 text-white font-black py-3.5 px-4 rounded-xl shadow-lg shadow-orange-950/50 flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer"
              >
                <span>Avançar para Pagamento</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
