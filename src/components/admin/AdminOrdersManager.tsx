import React, { useState } from 'react';
import { Order, OrderStatus, StoreSettings } from '../../types';
import {
  Search,
  Printer,
  Phone,
  MessageSquare,
  Clock,
  CheckCircle2,
  Flame,
  Bike,
  PackageCheck,
  XCircle,
  AlertCircle,
  Volume2,
  Trash2
} from 'lucide-react';
import { formatCurrency, formatPhone, getWhatsappUrl } from '../../utils/formatters';
import { triggerThermalPrint } from '../../utils/thermalPrinter';
import { ConfirmModal } from '../ConfirmModal';

interface AdminOrdersManagerProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onClearOrders?: () => void;
  storeSettings: StoreSettings;
  onOpenReceiptModal?: (order: Order) => void;
}

export const AdminOrdersManager: React.FC<AdminOrdersManagerProps> = ({
  orders,
  onUpdateOrderStatus,
  onClearOrders,
  storeSettings,
  onOpenReceiptModal
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isClearOrdersConfirmOpen, setIsClearOrdersConfirmOpen] = useState(false);

  const filteredOrders = orders.filter((o) => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchSearch =
      o.id.includes(searchTerm) ||
      o.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.phone.includes(searchTerm);
    return matchStatus && matchSearch;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'recebido':
        return (
          <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3" /> Recebido (Novo)
          </span>
        );
      case 'preparando':
        return (
          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3 h-3 animate-pulse" /> Em Preparo
          </span>
        );
      case 'em_entrega':
        return (
          <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
            <Bike className="w-3 h-3" /> Em Rota de Entrega
          </span>
        );
      case 'concluido':
        return (
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Concluído
          </span>
        );
      case 'cancelado':
        return (
          <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Cancelado
          </span>
        );
    }
  };

  const sendStatusWhatsapp = (order: Order, newStatus: OrderStatus) => {
    let msg = '';
    if (newStatus === 'preparando') {
      msg = `Olá, *${order.customer.name}*! 🔥 Seu pedido *#${order.id}* no *${storeSettings.name}* já está sendo preparado com muito capricho na chapa! Tempo estimado: ${order.estimatedMinutes} min.`;
    } else if (newStatus === 'em_entrega') {
      msg = `Olá, *${order.customer.name}*! 🛵 Seu pedido *#${order.id}* saiu para entrega e logo estará na sua porta quentinho!`;
    } else if (newStatus === 'concluido') {
      msg = `Olá, *${order.customer.name}*! ✨ Seu pedido *#${order.id}* foi entregue! Esperamos que aproveite. Bom apetite!`;
    } else {
      msg = `Olá, *${order.customer.name}*! Atualização do pedido *#${order.id}*: ${newStatus}.`;
    }

    const cleanPhone = order.customer.phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const url = `https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950/70 p-3.5 rounded-2xl border border-zinc-800">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por ID #, nome ou tel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
              statusFilter === 'all' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Todos ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter('recebido')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
              statusFilter === 'recebido' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Novos ({orders.filter((o) => o.status === 'recebido').length})
          </button>
          <button
            onClick={() => setStatusFilter('preparando')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
              statusFilter === 'preparando' ? 'bg-amber-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Cozinha ({orders.filter((o) => o.status === 'preparando').length})
          </button>
          <button
            onClick={() => setStatusFilter('em_entrega')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
              statusFilter === 'em_entrega' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Em Rota ({orders.filter((o) => o.status === 'em_entrega').length})
          </button>
          <button
            onClick={() => setStatusFilter('concluido')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
              statusFilter === 'concluido' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Concluídos ({orders.filter((o) => o.status === 'concluido').length})
          </button>
        </div>

        {onClearOrders && orders.length > 0 && (
          <button
            onClick={() => setIsClearOrdersConfirmOpen(true)}
            className="text-xs text-zinc-500 hover:text-red-400 p-1.5 transition flex items-center gap-1 cursor-pointer"
            title="Limpar pedidos"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Limpar</span>
          </button>
        )}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-zinc-950/40 rounded-2xl border border-dashed border-zinc-800 text-zinc-500 text-sm space-y-2">
          <div className="text-4xl">📋</div>
          <div className="font-bold text-zinc-400">Nenhum pedido encontrado</div>
          <p className="text-xs max-w-sm mx-auto text-zinc-500">
            Quando clientes realizarem pedidos pelo cardápio, eles aparecerão aqui instantaneamente com alerta sonoro e impressão térmica.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className={`bg-zinc-800/90 border rounded-2xl p-4 space-y-3 shadow-lg transition ${
                order.status === 'recebido'
                  ? 'border-blue-500/60 ring-1 ring-blue-500/30 bg-zinc-800'
                  : order.status === 'preparando'
                  ? 'border-amber-500/60'
                  : order.status === 'em_entrega'
                  ? 'border-purple-500/60'
                  : order.status === 'cancelado'
                  ? 'border-red-500/40 opacity-70'
                  : 'border-zinc-700/80'
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-700/70 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-amber-400 text-base">#{order.id}</span>
                  <span className="font-bold text-white text-sm">{order.customer.name}</span>
                  <a
                    href={`tel:${order.customer.phone}`}
                    className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3 text-zinc-500" />
                    <span>{formatPhone(order.customer.phone)}</span>
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(order.status)}
                  <span className="font-mono font-black text-amber-400 text-base">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>

              {/* Delivery / Pickup address info */}
              <div className="text-xs text-zinc-300 bg-zinc-900/70 p-2.5 rounded-xl border border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px] mr-1.5">
                    {order.customer.orderType === 'delivery' ? '🛵 ENTREGA:' : '🛍️ RETIRADA NO BALCÃO'}
                  </span>
                  {order.customer.orderType === 'delivery' ? (
                    <span>
                      {order.customer.address.street}, nº {order.customer.address.number} -{' '}
                      {order.customer.address.neighborhood} ({order.customer.address.city})
                      {order.customer.address.reference && ` [Ref: ${order.customer.address.reference}]`}
                    </span>
                  ) : (
                    <span>Retirada pelo cliente na lanchonete</span>
                  )}
                </div>

                <div className="text-[11px] text-zinc-400">
                  Pagamento:{' '}
                  <strong className="text-zinc-200 uppercase">{order.payment.method.replace('_', ' ')}</strong>
                  {order.payment.changeFor && ` (Troco p/ R$ ${order.payment.changeFor.toFixed(2)})`}
                </div>
              </div>

              {/* Items List */}
              <div className="text-xs text-zinc-200 space-y-1.5 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
                {order.items.map((item, idx) => (
                  <div key={idx} className="border-b border-zinc-800/50 pb-1.5 last:border-0 last:pb-0">
                    <div className="flex justify-between font-bold">
                      <span className="text-white">
                        {item.quantity}x {item.item.name}
                        {item.options.doneness && (
                          <span className="text-amber-400 font-medium ml-1">({item.options.doneness})</span>
                        )}
                        {item.options.selectedSize && (
                          <span className="text-sky-400 font-medium ml-1">({item.options.selectedSize})</span>
                        )}
                      </span>
                      <span className="font-mono text-amber-400">{formatCurrency(item.totalPrice)}</span>
                    </div>

                    {item.options.selectedFlavors && item.options.selectedFlavors.length > 0 && (
                      <div className="text-[11px] text-zinc-400 ml-4">
                        Molhos: {item.options.selectedFlavors.join(', ')}
                      </div>
                    )}

                    {item.options.selectedExtras && item.options.selectedExtras.length > 0 && (
                      <div className="text-[11px] text-emerald-400 ml-4">
                        + {item.options.selectedExtras.map((e) => `${e.name} (+${formatCurrency(e.price)})`).join(', ')}
                      </div>
                    )}

                    {item.options.selectedExclusions && item.options.selectedExclusions.length > 0 && (
                      <div className="text-[11px] text-red-400 ml-4">
                        SEM: {item.options.selectedExclusions.join(', ')}
                      </div>
                    )}

                    {item.options.notes && (
                      <div className="text-[11px] text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded mt-0.5 ml-4 border border-amber-500/20">
                        OBS: {item.options.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Actions: Thermal 80mm Print, WhatsApp and Status Pipeline */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-700/60">
                {/* Print Buttons */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => triggerThermalPrint(order, storeSettings, 'completa')}
                    className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow"
                    title="Imprimir cupom completo 80mm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir 80mm</span>
                  </button>

                  <button
                    onClick={() => triggerThermalPrint(order, storeSettings, 'cozinha')}
                    className="bg-zinc-700 hover:bg-zinc-600 text-zinc-200 font-bold px-2 py-1.5 rounded-xl text-xs flex items-center gap-1 transition"
                    title="Imprimir via reduzida para cozinha"
                  >
                    <Flame className="w-3 h-3 text-amber-400" />
                    <span>Cozinha</span>
                  </button>

                  {onOpenReceiptModal && (
                    <button
                      onClick={() => onOpenReceiptModal(order)}
                      className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1.5 rounded-xl text-xs transition"
                      title="Visualizar cupom na tela"
                    >
                      Ver Cupom
                    </button>
                  )}
                </div>

                {/* Status Pipeline Buttons */}
                <div className="flex flex-wrap items-center gap-1">
                  <button
                    onClick={() => {
                      onUpdateOrderStatus(order.id, 'recebido');
                    }}
                    className={`text-[11px] px-2 py-1 rounded-lg border font-bold transition ${
                      order.status === 'recebido'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                    }`}
                  >
                    1. Recebido
                  </button>

                  <button
                    onClick={() => {
                      onUpdateOrderStatus(order.id, 'preparando');
                      sendStatusWhatsapp(order, 'preparando');
                    }}
                    className={`text-[11px] px-2 py-1 rounded-lg border font-bold transition ${
                      order.status === 'preparando'
                        ? 'bg-amber-600 border-amber-500 text-white'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                    }`}
                    title="Muda status e notifica cliente via WhatsApp"
                  >
                    2. Cozinha 🔥
                  </button>

                  <button
                    onClick={() => {
                      onUpdateOrderStatus(order.id, 'em_entrega');
                      sendStatusWhatsapp(order, 'em_entrega');
                    }}
                    className={`text-[11px] px-2 py-1 rounded-lg border font-bold transition ${
                      order.status === 'em_entrega'
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                    }`}
                    title="Muda status e avisa motoboy a caminho"
                  >
                    3. Saiu 🛵
                  </button>

                  <button
                    onClick={() => {
                      onUpdateOrderStatus(order.id, 'concluido');
                      sendStatusWhatsapp(order, 'concluido');
                    }}
                    className={`text-[11px] px-2 py-1 rounded-lg border font-bold transition ${
                      order.status === 'concluido'
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'
                    }`}
                  >
                    4. Entregue ✓
                  </button>

                  <button
                    onClick={() => onUpdateOrderStatus(order.id, 'cancelado')}
                    className={`text-[11px] px-1.5 py-1 rounded-lg border font-bold transition ${
                      order.status === 'cancelado'
                        ? 'bg-red-900 border-red-700 text-red-300'
                        : 'bg-zinc-850 border-zinc-800 text-zinc-500 hover:text-red-400'
                    }`}
                    title="Cancelar pedido"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clear Orders Modal */}
      <ConfirmModal
        isOpen={isClearOrdersConfirmOpen}
        title="Limpar Histórico de Pedidos"
        message="Tem certeza que deseja limpar todos os pedidos registrados nesta sessão? Esta ação não pode ser desfeita."
        confirmLabel="Sim, Limpar Histórico"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={() => {
          if (onClearOrders) onClearOrders();
          setIsClearOrdersConfirmOpen(false);
        }}
        onClose={() => setIsClearOrdersConfirmOpen(false)}
      />
    </div>
  );
};
