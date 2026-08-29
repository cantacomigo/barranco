import React from 'react';
import { Order, OrderStatus, StoreSettings } from '../types';
import { X, Clock, CheckCircle2, Flame, Bike, PackageCheck, MessageCircle, AlertCircle, Phone, Printer } from 'lucide-react';
import { formatCurrency, formatPhone, generateWhatsappOrderMessage, getWhatsappUrl } from '../utils/formatters';
import { triggerThermalPrint } from '../utils/thermalPrinter';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onUpdateOrderStatus?: (orderId: string, newStatus: OrderStatus) => void;
  storeSettings: StoreSettings;
  onOpenReceiptModal?: (order: Order) => void;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  isOpen,
  onClose,
  orders,
  storeSettings,
  onOpenReceiptModal
}) => {
  if (!isOpen) return null;

  const STATUS_STEPS: { key: OrderStatus; label: string; desc: string; icon: any }[] = [
    { key: 'recebido', label: 'Pedido Recebido', desc: 'Registrado no sistema da cozinha', icon: CheckCircle2 },
    { key: 'preparando', label: 'Na Brasa & Cozinha', desc: 'Sendo preparado com capricho', icon: Flame },
    { key: 'em_entrega', label: 'Saiu para Entrega', desc: 'Motoboy a caminho do seu endereço', icon: Bike },
    { key: 'concluido', label: 'Pedido Entregue', desc: 'Bom apetite!', icon: PackageCheck }
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'recebido': return 0;
      case 'preparando': return 1;
      case 'em_entrega': return 2;
      case 'concluido': return 3;
      default: return 0;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div
        className="bg-zinc-900 border border-zinc-700/80 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-lg text-white">Acompanhar Meus Pedidos</h2>
              <p className="text-xs text-zinc-400">Status em tempo real do preparo e entrega</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-xl text-zinc-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Orders list */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-zinc-200">
          {orders.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 mx-auto">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-zinc-200">Nenhum pedido recente</h3>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Assim que você finalizar uma compra pelo cardápio, ela aparecerá aqui para você acompanhar passo a passo.
              </p>
            </div>
          ) : (
            orders.map((order) => {
              const currentStepIdx = getStepIndex(order.status);
              const isDelivery = order.customer.orderType === 'delivery';
              const whatsappUrl = getWhatsappUrl(
                storeSettings.whatsapp,
                `Olá! Gostaria de saber o status do meu Pedido #${order.id} (${order.customer.name}).`
              );

              return (
                <div
                  key={order.id}
                  className="bg-zinc-800/80 border border-zinc-700/80 rounded-2xl p-4 sm:p-5 space-y-5 shadow-lg"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-700/60 pb-3">
                    <div>
                      <span className="font-mono text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-md font-bold">
                        #{order.id}
                      </span>
                      <span className="text-xs text-zinc-400 ml-2">
                        {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-zinc-400 mr-2">
                        {isDelivery ? '🛵 Entrega' : '🏬 Retirada'}
                      </span>
                      <span className="font-black text-amber-400 text-sm">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Timeline Tracker */}
                  <div className="relative pt-2">
                    <div className="grid grid-cols-4 gap-1 sm:gap-2">
                      {STATUS_STEPS.map((step, idx) => {
                        const Icon = step.icon;
                        const isCompleted = idx <= currentStepIdx;
                        const isCurrent = idx === currentStepIdx;

                        return (
                          <div key={step.key} className="flex flex-col items-center text-center">
                            <div
                              className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition-all ${
                                isCurrent
                                  ? 'bg-amber-500 text-zinc-950 ring-4 ring-amber-500/20 shadow-lg scale-105'
                                  : isCompleted
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                              }`}
                            >
                              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>

                            <span
                              className={`text-[11px] sm:text-xs font-bold mt-2 leading-tight ${
                                isCurrent
                                  ? 'text-amber-400'
                                  : isCompleted
                                  ? 'text-emerald-400'
                                  : 'text-zinc-500'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="bg-zinc-950/60 rounded-xl p-3 text-xs space-y-1.5 border border-zinc-800">
                    <span className="text-zinc-400 font-bold uppercase tracking-wider text-[10px] block mb-1">
                      Itens do Pedido ({order.items.length}):
                    </span>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-zinc-200">
                        <span>
                          {item.quantity}x {item.item.name}
                        </span>
                        <span className="font-semibold">{formatCurrency(item.totalPrice)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Customer & Delivery address */}
                  <div className="text-xs text-zinc-300 space-y-1">
                    <div>
                      <strong>Cliente:</strong> {order.customer.name} ({formatPhone(order.customer.phone)})
                    </div>
                    {isDelivery && (
                      <div>
                        <strong>Entrega em:</strong> {order.customer.address.street}, {order.customer.address.number} - {order.customer.address.neighborhood}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="pt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => triggerThermalPrint(order, storeSettings, 'completa')}
                      className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow"
                      title="Imprimir comprovante térmico 80mm"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Imprimir Cupom 80mm</span>
                    </button>

                    {onOpenReceiptModal && (
                      <button
                        type="button"
                        onClick={() => onOpenReceiptModal(order)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold py-2 px-3 rounded-xl text-xs transition cursor-pointer border border-zinc-700"
                      >
                        Visualizar Cupom
                      </button>
                    )}

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Falar com o Restaurante</span>
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
