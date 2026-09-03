import React, { useState, useEffect } from 'react';
import {
  CartItem,
  CustomerInfo,
  Order,
  OrderType,
  PaymentDetails,
  PaymentMethodType,
  StoreSettings
} from '../types';
import {
  X,
  QrCode,
  CreditCard,
  Banknote,
  Truck,
  Store,
  CheckCircle2,
  Copy,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  Clock,
  Sparkles,
  AlertCircle,
  Lock,
  Printer
} from 'lucide-react';
import QRCodeLib from 'qrcode';
import confetti from 'canvas-confetti';
import { formatCurrency, formatPhone, generateWhatsappOrderMessage, getWhatsappUrl } from '../utils/formatters';
import { generatePixPayload } from '../utils/pix';
import { NEIGHBORHOODS, Coupon, NeighborhoodFee } from '../data/neighborhoods';
import { triggerThermalPrint } from '../utils/thermalPrinter';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  orderType: OrderType;
  selectedNeighborhood: string;
  appliedCoupon: Coupon | null;
  storeSettings: StoreSettings;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  onOrderCompleted: (order: Order) => void;
  onOpenReceiptModal?: (order: Order) => void;
  neighborhoods?: NeighborhoodFee[];
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  orderType,
  selectedNeighborhood,
  appliedCoupon,
  storeSettings,
  subtotal,
  deliveryFee,
  discount,
  total,
  onOrderCompleted,
  onOpenReceiptModal,
  neighborhoods = NEIGHBORHOODS
}) => {
  if (!isOpen) return null;

  // Step: 'form' | 'payment_process' | 'success'
  const [step, setStep] = useState<'form' | 'payment_process' | 'success'>('form');

  // Customer state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState(selectedNeighborhood);
  const [complement, setComplement] = useState('');
  const [reference, setReference] = useState('');
  const [city, setCity] = useState('Olímpia - SP');

  // Payment Selection state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('pix');
  const [changeFor, setChangeFor] = useState('');
  const [deliveryCardType, setDeliveryCardType] = useState<'credito' | 'debito' | 'vr'>('debito');

  // Card Online fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [installments, setInstallments] = useState(1);

  // PIX Generated Data
  const [pixPayload, setPixPayload] = useState('');
  const [pixQrDataUrl, setPixQrDataUrl] = useState('');
  const [pixCopied, setPixCopied] = useState(false);
  const [pixConfirmed, setPixConfirmed] = useState(false);

  // Card processing state
  const [isProcessingCard, setIsProcessingCard] = useState(false);
  const [cardSuccess, setCardSuccess] = useState(false);
  const [cardErrorMessage, setCardErrorMessage] = useState<string | null>(null);


  // Final Created Order
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setNeighborhood(selectedNeighborhood);
  }, [selectedNeighborhood]);

  // Generate PIX QR Code when transitioning to payment processing or when total changes
  useEffect(() => {
    if (paymentMethod === 'pix') {
      const payload = generatePixPayload({
        pixKey: storeSettings.pixKey,
        receiverName: storeSettings.pixReceiverName,
        city: storeSettings.pixCity,
        amount: total
      });
      setPixPayload(payload);

      QRCodeLib.toDataURL(payload, {
        width: 256,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
        .then((url) => setPixQrDataUrl(url))
        .catch((err) => console.error('Erro ao gerar QR Code PIX:', err));
    }
  }, [paymentMethod, total, storeSettings]);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixPayload);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 3000);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Informe seu nome completo';
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      errors.phone = 'Informe um telefone/WhatsApp válido com DDD';
    }

    if (orderType === 'delivery') {
      if (!street.trim()) errors.street = 'Informe a rua / avenida';
      if (!number.trim()) errors.number = 'Informe o número';
      if (!neighborhood.trim()) errors.neighborhood = 'Informe o bairro';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Build the order object
    const newOrderId = Math.floor(100000 + Math.random() * 900000).toString();
    const customerInfo: CustomerInfo = {
      name,
      phone,
      orderType,
      address: {
        street,
        number,
        neighborhood,
        complement,
        reference,
        city
      }
    };

    const paymentDetails: PaymentDetails = {
      method: paymentMethod,
      changeFor: paymentMethod === 'dinheiro_entrega' && changeFor ? parseFloat(changeFor) : undefined,
      deliveryCardType: paymentMethod === 'cartao_entrega' ? deliveryCardType : undefined,
      installments: paymentMethod === 'cartao_online' ? installments : 1
    };

    const orderObj: Order = {
      id: newOrderId,
      createdAt: new Date().toISOString(),
      items,
      customer: customerInfo,
      payment: paymentDetails,
      subtotal,
      deliveryFee: orderType === 'delivery' ? deliveryFee : 0,
      discount,
      couponCode: appliedCoupon?.code,
      total,
      status: 'recebido',
      estimatedMinutes: orderType === 'delivery' ? 35 : 20,
      whatsappSent: false
    };

    setCreatedOrder(orderObj);

    // If PIX or Cartão Online, show the dedicated payment verification step
    if (paymentMethod === 'pix' || paymentMethod === 'cartao_online') {
      setStep('payment_process');
    } else {
      // Dinheiro or Cartão na Entrega skips direct to confirmation
      finalizeOrder(orderObj);
    }
  };

  const handleProcessCardPayment = () => {
    if (!cardNumber || !cardHolder || !cardExpiry || !cardCvv) {
      setCardErrorMessage('Preencha todos os dados do cartão de crédito.');
      return;
    }
    setCardErrorMessage(null);

    setIsProcessingCard(true);
    setTimeout(() => {
      setIsProcessingCard(false);
      setCardSuccess(true);
      if (createdOrder) {
        const updated = {
          ...createdOrder,
          payment: {
            ...createdOrder.payment,
            cardBrand: 'Mastercard / Visa',
            cardLast4: cardNumber.slice(-4)
          }
        };
        setCreatedOrder(updated);
        setTimeout(() => {
          finalizeOrder(updated);
        }, 1200);
      }
    }, 1800);
  };


  const handleConfirmPixPayment = () => {
    setPixConfirmed(true);
    if (createdOrder) {
      const updated = {
        ...createdOrder,
        payment: {
          ...createdOrder.payment,
          pixPaid: true,
          pixTxId: 'E' + Math.floor(10000000 + Math.random() * 90000000)
        }
      };
      setCreatedOrder(updated);
      setTimeout(() => {
        finalizeOrder(updated);
      }, 1000);
    }
  };

  const finalizeOrder = (finalOrder: Order) => {
    setStep('success');
    onOrderCompleted(finalOrder);

    // Confetti effect celebration!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Automatically trigger 80mm thermal receipt print if enabled in settings
    if (storeSettings.autoPrintOrder !== false) {
      setTimeout(() => {
        triggerThermalPrint(finalOrder, storeSettings, 'completa');
      }, 400);
    }
  };

  const handleOpenWhatsApp = () => {
    if (!createdOrder) return;
    const msg = generateWhatsappOrderMessage(createdOrder, storeSettings.name);
    const url = getWhatsappUrl(storeSettings.whatsapp, msg);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div
        className="bg-zinc-900 border border-zinc-700/80 rounded-3xl w-full max-w-2xl max-h-[94vh] flex flex-col overflow-hidden shadow-2xl relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-base sm:text-lg text-white">
                {step === 'form' && 'Finalizar e Pagar Pedido'}
                {step === 'payment_process' && 'Pagamento Online Seguro'}
                {step === 'success' && 'Pedido Realizado com Sucesso!'}
              </h2>
              <p className="text-xs text-zinc-400">
                {step === 'form' && 'Informe seus dados de entrega e forma de pagamento'}
                {step === 'payment_process' && 'Conclua a transação para enviar ao WhatsApp'}
                {step === 'success' && 'Acompanhe o preparo e envie a mensagem no WhatsApp'}
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

        {/* Modal Body Container */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-zinc-200">
          {/* ================= STEP 1: FORM & SELECTION ================= */}
          {step === 'form' && (
            <form onSubmit={handleProceedToPayment} className="space-y-6">
              
              {/* Order Summary Mini Banner */}
              <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="text-xs space-y-0.5">
                  <span className="text-zinc-400 block">Total a pagar:</span>
                  <span className="text-lg font-black text-amber-400">{formatCurrency(total)}</span>
                </div>
                <div className="text-right text-xs text-zinc-400">
                  <span>{items.length} {items.length === 1 ? 'item' : 'itens'}</span>
                  <span className="block text-zinc-300 font-semibold">
                    {orderType === 'delivery' ? `🛵 Entrega (${neighborhood})` : '🏬 Retirada no Balcão'}
                  </span>
                </div>
              </div>

              {/* 1. Customer Personal Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-zinc-950 font-black text-xs flex items-center justify-center">
                    1
                  </span>
                  <span>Seus Dados de Contato</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-300 block mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: João da Silva"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full bg-zinc-800 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        formErrors.name ? 'border-red-500' : 'border-zinc-700'
                      }`}
                    />
                    {formErrors.name && (
                      <span className="text-[11px] text-red-400 mt-0.5 block">{formErrors.name}</span>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-zinc-300 block mb-1">WhatsApp / Telefone com DDD *</label>
                    <input
                      type="tel"
                      required
                      placeholder="(11) 99999-9999"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full bg-zinc-800 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        formErrors.phone ? 'border-red-500' : 'border-zinc-700'
                      }`}
                    />
                    {formErrors.phone && (
                      <span className="text-[11px] text-red-400 mt-0.5 block">{formErrors.phone}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Address (If Delivery) */}
              {orderType === 'delivery' && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-zinc-950 font-black text-xs flex items-center justify-center">
                      2
                    </span>
                    <span>Endereço de Entrega</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-xs text-zinc-300 block mb-1">Rua / Avenida *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Rua das Flores"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className={`w-full bg-zinc-800 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                          formErrors.street ? 'border-red-500' : 'border-zinc-700'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-xs text-zinc-300 block mb-1">Número *</label>
                      <input
                        type="text"
                        required
                        placeholder="123"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        className={`w-full bg-zinc-800 border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                          formErrors.number ? 'border-red-500' : 'border-zinc-700'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-xs text-zinc-300 block mb-1">Bairro *</label>
                      <select
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        {neighborhoods.map((nh) => (
                          <option key={nh.name} value={nh.name}>
                            {nh.name} (Taxa: {formatCurrency(nh.fee)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-zinc-300 block mb-1">Complemento</label>
                      <input
                        type="text"
                        placeholder="Apto 42, Bloco B"
                        value={complement}
                        onChange={(e) => setComplement(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-zinc-300 block mb-1">Ponto de Referência</label>
                      <input
                        type="text"
                        placeholder="Próximo à padaria"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Payment Method Choice */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-zinc-950 font-black text-xs flex items-center justify-center">
                    {orderType === 'delivery' ? '3' : '2'}
                  </span>
                  <span>Forma de Pagamento</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* PIX Option */}
                  <label
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                      paymentMethod === 'pix'
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500'
                        : 'bg-zinc-800/80 border-zinc-700 hover:border-zinc-600 text-zinc-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="pix"
                      checked={paymentMethod === 'pix'}
                      onChange={() => setPaymentMethod('pix')}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-bold text-xs sm:text-sm flex items-center gap-1.5 text-white">
                        <QrCode className="w-4 h-4 text-emerald-400" />
                        <span>PIX Online Automático</span>
                        <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                          Rápido
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Gera QR Code e Copia-e-Cola na hora para pagamento instantâneo.
                      </p>
                    </div>
                  </label>

                  {/* Cartão de Crédito Online */}
                  <label
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                      paymentMethod === 'cartao_online'
                        ? 'bg-sky-950/40 border-sky-500 text-sky-200 ring-1 ring-sky-500'
                        : 'bg-zinc-800/80 border-zinc-700 hover:border-zinc-600 text-zinc-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cartao_online"
                      checked={paymentMethod === 'cartao_online'}
                      onChange={() => setPaymentMethod('cartao_online')}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-bold text-xs sm:text-sm flex items-center gap-1.5 text-white">
                        <CreditCard className="w-4 h-4 text-sky-400" />
                        <span>Cartão de Crédito Online</span>
                        <span className="text-[10px] bg-sky-500/30 text-sky-300 px-1.5 py-0.2 rounded font-bold">
                          Até 3x
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Pague online com total segurança (Visa, Mastercard, Elo, Hipercard).
                      </p>
                    </div>
                  </label>

                  {/* Cartão na Entrega */}
                  <label
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                      paymentMethod === 'cartao_entrega'
                        ? 'bg-amber-950/40 border-amber-500 text-amber-200 ring-1 ring-amber-500'
                        : 'bg-zinc-800/80 border-zinc-700 hover:border-zinc-600 text-zinc-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cartao_entrega"
                      checked={paymentMethod === 'cartao_entrega'}
                      onChange={() => setPaymentMethod('cartao_entrega')}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-bold text-xs sm:text-sm flex items-center gap-1.5 text-white">
                        <CreditCard className="w-4 h-4 text-amber-400" />
                        <span>Cartão na Entrega / Balcão</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        O entregador levará a maquininha até você.
                      </p>
                    </div>
                  </label>

                  {/* Dinheiro na Entrega */}
                  <label
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                      paymentMethod === 'dinheiro_entrega'
                        ? 'bg-amber-950/40 border-amber-500 text-amber-200 ring-1 ring-amber-500'
                        : 'bg-zinc-800/80 border-zinc-700 hover:border-zinc-600 text-zinc-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="dinheiro_entrega"
                      checked={paymentMethod === 'dinheiro_entrega'}
                      onChange={() => setPaymentMethod('dinheiro_entrega')}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-bold text-xs sm:text-sm flex items-center gap-1.5 text-white">
                        <Banknote className="w-4 h-4 text-emerald-400" />
                        <span>Dinheiro na Entrega</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Pague em espécie ao receber. Pode solicitar troco.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Sub-options for Card on delivery */}
                {paymentMethod === 'cartao_entrega' && (
                  <div className="bg-zinc-800/60 p-3 rounded-xl border border-zinc-700/60 flex items-center gap-4 text-xs">
                    <span className="text-zinc-300 font-semibold">Tipo de Cartão:</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="delcard"
                        checked={deliveryCardType === 'debito'}
                        onChange={() => setDeliveryCardType('debito')}
                      />
                      <span>Débito</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="delcard"
                        checked={deliveryCardType === 'credito'}
                        onChange={() => setDeliveryCardType('credito')}
                      />
                      <span>Crédito</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="delcard"
                        checked={deliveryCardType === 'vr'}
                        onChange={() => setDeliveryCardType('vr')}
                      />
                      <span>Vale Refeição (VR/VA)</span>
                    </label>
                  </div>
                )}

                {/* Sub-options for Cash change */}
                {paymentMethod === 'dinheiro_entrega' && (
                  <div className="bg-zinc-800/60 p-3 rounded-xl border border-zinc-700/60 space-y-1.5">
                    <label className="text-xs text-zinc-300 block">Precisa de troco para quanto?</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder={`Ex: 50 ou 100 (Total é ${formatCurrency(total)})`}
                        value={changeFor}
                        onChange={(e) => setChangeFor(e.target.value)}
                        className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-zinc-100 focus:ring-2 focus:ring-amber-500 focus:outline-none w-full max-w-xs"
                      />
                      <span className="text-[11px] text-zinc-400">Deixe em branco se tiver valor exato</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="btn-submit-order-form"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-orange-950/50 flex items-center justify-between transition active:scale-[0.98] cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-200" />
                  <span className="text-sm sm:text-base">
                    {paymentMethod === 'pix' || paymentMethod === 'cartao_online'
                      ? 'Prosseguir para Pagamento Online'
                      : 'Confirmar e Enviar para WhatsApp'}
                  </span>
                </div>
                <span className="text-base sm:text-lg font-black bg-black/25 px-3 py-1 rounded-xl">
                  {formatCurrency(total)}
                </span>
              </button>

            </form>
          )}

          {/* ================= STEP 2: PAYMENT ONLINE PROCESSING (PIX OR CARD) ================= */}
          {step === 'payment_process' && (
            <div className="space-y-6">
              {/* PIX Flow */}
              {paymentMethod === 'pix' && (
                <div className="space-y-5 text-center">
                  <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 text-emerald-200 space-y-1">
                    <h3 className="font-black text-lg flex items-center justify-center gap-2 text-emerald-300">
                      <QrCode className="w-5 h-5" />
                      <span>Pague via PIX - {formatCurrency(total)}</span>
                    </h3>
                    <p className="text-xs text-emerald-400">
                      Abra o app do seu banco, escaneie o QR Code ou copie o código PIX abaixo.
                    </p>
                  </div>

                  {/* QR Code display */}
                  <div className="bg-white p-4 rounded-2xl inline-block shadow-xl border-4 border-emerald-500/30">
                    {pixQrDataUrl ? (
                      <img
                        src={pixQrDataUrl}
                        alt="QR Code PIX"
                        className="w-48 h-48 sm:w-56 sm:h-56 object-contain mx-auto"
                      />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center text-zinc-500 text-xs">
                        Gerando QR Code...
                      </div>
                    )}
                  </div>

                  {/* Copia e Cola Code */}
                  <div className="space-y-2 max-w-lg mx-auto text-left">
                    <label className="text-xs text-zinc-400 block font-semibold">
                      PIX Copia e Cola (Código EMV):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={pixPayload}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-300 select-all"
                      />
                      <button
                        onClick={handleCopyPix}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                          pixCopied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                        }`}
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{pixCopied ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-zinc-800/80 rounded-xl p-3 text-xs text-zinc-300 max-w-lg mx-auto border border-zinc-700 text-left space-y-1">
                    <div><strong>Favorecido:</strong> {storeSettings.pixReceiverName}</div>
                    <div><strong>Chave:</strong> {storeSettings.pixKey} ({storeSettings.pixKeyType.toUpperCase()})</div>
                    <div><strong>Cidade:</strong> {storeSettings.pixCity}</div>
                  </div>

                  {/* Confirmation Action */}
                  <button
                    onClick={handleConfirmPixPayment}
                    className="w-full max-w-lg mx-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3.5 px-6 rounded-2xl shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Já realizei o pagamento no meu Banco</span>
                  </button>
                </div>
              )}

              {/* Credit Card Online Flow */}
              {paymentMethod === 'cartao_online' && (
                <div className="space-y-4">
                  <div className="bg-sky-950/40 border border-sky-500/40 rounded-2xl p-3.5 text-sky-200 text-xs">
                    <span className="font-bold block text-sm text-sky-300">
                      💳 Checkout Seguro com Cartão de Crédito
                    </span>
                    Ambiente protegido por criptografia de ponta a ponta. Valor: <strong>{formatCurrency(total)}</strong>
                  </div>

                  {cardErrorMessage && (
                    <div className="bg-red-500/15 border border-red-500/40 text-red-300 text-xs p-3 rounded-xl flex items-center justify-between">
                      <span>{cardErrorMessage}</span>
                      <button
                        type="button"
                        onClick={() => setCardErrorMessage(null)}
                        className="text-red-400 hover:text-white font-bold ml-2 text-base leading-none"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  {/* Card Visual Graphic */}

                  <div className="max-w-sm mx-auto bg-gradient-to-tr from-zinc-900 via-zinc-800 to-amber-950/60 p-5 rounded-2xl border border-zinc-700 shadow-2xl text-white space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs uppercase tracking-widest text-amber-400">
                        {storeSettings.name}
                      </span>
                      <CreditCard className="w-6 h-6 text-zinc-400" />
                    </div>

                    <div className="font-mono text-lg tracking-widest text-zinc-100">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>

                    <div className="flex justify-between items-end text-xs">
                      <div>
                        <span className="text-[10px] text-zinc-400 block uppercase">Titular</span>
                        <span className="font-semibold uppercase tracking-wider">
                          {cardHolder || 'SEU NOME NO CARTÃO'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-400 block uppercase">Validade</span>
                        <span className="font-semibold">{cardExpiry || 'MM/AA'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Inputs */}
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="text-xs text-zinc-300 block mb-1">Número do Cartão *</label>
                      <input
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-zinc-300 block mb-1">Nome Impresso no Cartão *</label>
                      <input
                        type="text"
                        placeholder="Como está gravado no cartão"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 uppercase focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-zinc-300 block mb-1">Validade (MM/AA) *</label>
                        <input
                          type="text"
                          placeholder="12/28"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-zinc-300 block mb-1">CVV / Cód. Segurança *</label>
                        <input
                          type="password"
                          placeholder="123"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        />
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <label className="text-xs text-zinc-300 block mb-1">Parcelamento</label>
                        <select
                          value={installments}
                          onChange={(e) => setInstallments(parseInt(e.target.value))}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-2.5 py-2.5 text-xs sm:text-sm text-zinc-100 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        >
                          <option value={1}>1x de {formatCurrency(total)} (Sem juros)</option>
                          <option value={2}>2x de {formatCurrency(total / 2)} (Sem juros)</option>
                          <option value={3}>3x de {formatCurrency(total / 3)} (Sem juros)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleProcessCardPayment}
                    disabled={isProcessingCard || cardSuccess}
                    className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 disabled:opacity-50 text-white font-black py-4 px-6 rounded-2xl shadow-xl shadow-sky-950/60 flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer"
                  >
                    {isProcessingCard ? (
                      <span>Processando autorização segura...</span>
                    ) : cardSuccess ? (
                      <span className="flex items-center gap-2 text-white">
                        <CheckCircle2 className="w-5 h-5" /> Pagamento Aprovado com Sucesso!
                      </span>
                    ) : (
                      <span>Pagar {formatCurrency(total)} com Cartão</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= STEP 3: ORDER SUCCESS & WHATSAPP SEND ================= */}
          {step === 'success' && createdOrder && (
            <div className="space-y-6 text-center py-2">
              <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
                  Pedido #{createdOrder.id} Confirmado
                </span>
                <h3 className="text-2xl font-black text-white mt-2">
                  Recebemos o seu pedido!
                </h3>
                <p className="text-sm text-zinc-300 mt-1 max-w-md mx-auto">
                  Para agilizar a produção na brasa e acompanhar a entrega em tempo real, envie a confirmação no WhatsApp da loja clicando no botão abaixo:
                </p>
              </div>

              {/* Big WhatsApp CTA Button */}
              <div className="p-4 bg-emerald-950/50 border border-emerald-500/40 rounded-2xl space-y-3">
                <button
                  onClick={handleOpenWhatsApp}
                  id="btn-send-order-whatsapp"
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-zinc-950 font-black py-4 px-6 rounded-xl shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-3 text-base sm:text-lg transition active:scale-[0.98] cursor-pointer"
                >
                  <MessageCircle className="w-6 h-6 fill-current" />
                  <span>Enviar Pedido pelo WhatsApp Agora</span>
                </button>
                <p className="text-[11px] text-emerald-300">
                  📱 A mensagem com todos os itens, ponto da carne, molhos e endereço já foi formatada automaticamente!
                </p>
              </div>

              {/* Thermal Printer 80mm Box */}
              <div className="bg-zinc-800/90 border border-zinc-700/90 rounded-2xl p-4 text-left space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <Printer className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-white block">
                        Impressão Térmica 80mm
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        {storeSettings.autoPrintOrder
                          ? '⚡ Impressão automática enviada para a impressora'
                          : 'Clique para imprimir o cupom não-fiscal'}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded font-mono">
                    80mm ESC/POS
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => triggerThermalPrint(createdOrder, storeSettings, 'completa')}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir Cupom Novamente</span>
                  </button>

                  {onOpenReceiptModal && (
                    <button
                      type="button"
                      onClick={() => onOpenReceiptModal(createdOrder)}
                      className="bg-zinc-700 hover:bg-zinc-600 text-zinc-200 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <span>Visualizar Cupom</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Order Quick Summary */}
              <div className="bg-zinc-800/80 rounded-2xl p-4 text-left text-xs space-y-2 border border-zinc-700">
                <div className="flex justify-between border-b border-zinc-700 pb-2">
                  <span className="text-zinc-400">Cliente:</span>
                  <span className="font-bold text-white">{createdOrder.customer.name}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-700 pb-2">
                  <span className="text-zinc-400">Modalidade:</span>
                  <span className="font-bold text-amber-400">
                    {createdOrder.customer.orderType === 'delivery'
                      ? `Entrega em Domicílio (~${createdOrder.estimatedMinutes} min)`
                      : 'Retirada no Restaurante (~20 min)'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-zinc-700 pb-2">
                  <span className="text-zinc-400">Forma de Pagamento:</span>
                  <span className="font-bold text-white uppercase">
                    {createdOrder.payment.method.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between pt-1 text-sm font-bold">
                  <span className="text-zinc-300">Valor Total:</span>
                  <span className="text-amber-400">{formatCurrency(createdOrder.total)}</span>
                </div>
              </div>

              {/* Close / Return button */}
              <button
                onClick={onClose}
                className="text-xs text-zinc-400 hover:text-white underline underline-offset-4 transition"
              >
                Fechar e voltar ao Cardápio
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
