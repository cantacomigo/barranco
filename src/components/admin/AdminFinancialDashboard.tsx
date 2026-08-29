import React, { useMemo, useState } from 'react';
import { Order, MenuItem } from '../../types';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  CreditCard,
  QrCode,
  Banknote,
  Bike,
  PackageCheck,
  Calendar,
  Award,
  Search
} from 'lucide-react';
import { formatCurrency, formatPhone } from '../../utils/formatters';

interface AdminFinancialDashboardProps {
  orders: Order[];
  menuItems: MenuItem[];
}

export const AdminFinancialDashboard: React.FC<AdminFinancialDashboardProps> = ({
  orders,
  menuItems
}) => {
  const [periodFilter, setPeriodFilter] = useState<'all' | 'today'>('all');
  const [historySearch, setHistorySearch] = useState('');

  const filteredOrders = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return orders.filter((order) => {
      if (periodFilter === 'today') {
        const orderDateStr = order.createdAt.split('T')[0];
        if (orderDateStr !== todayStr) return false;
      }
      return true;
    });
  }, [orders, periodFilter]);

  // General Metrics
  const metrics = useMemo(() => {
    const validOrders = filteredOrders.filter((o) => o.status !== 'cancelado');
    const totalRevenue = validOrders.reduce((acc, o) => acc + o.total, 0);
    const totalOrdersCount = validOrders.length;
    const averageTicket = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
    const completedCount = orders.filter((o) => o.status === 'concluido').length;
    const cancelledCount = orders.filter((o) => o.status === 'cancelado').length;

    // By Payment Method
    const pixRevenue = validOrders
      .filter((o) => o.payment.method === 'pix')
      .reduce((acc, o) => acc + o.total, 0);
    const cardRevenue = validOrders
      .filter((o) => o.payment.method === 'cartao_online' || o.payment.method === 'cartao_entrega')
      .reduce((acc, o) => acc + o.total, 0);
    const cashRevenue = validOrders
      .filter((o) => o.payment.method === 'dinheiro_entrega')
      .reduce((acc, o) => acc + o.total, 0);

    // Delivery vs Retirada
    const deliveryOrders = validOrders.filter((o) => o.customer.orderType === 'delivery').length;
    const pickupOrders = validOrders.filter((o) => o.customer.orderType === 'retirada').length;

    // Best Selling Items
    const itemSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
    validOrders.forEach((order) => {
      order.items.forEach((item) => {
        const key = item.item.name;
        if (!itemSalesMap[key]) {
          itemSalesMap[key] = { name: key, quantity: 0, revenue: 0 };
        }
        itemSalesMap[key].quantity += item.quantity;
        itemSalesMap[key].revenue += item.totalPrice;
      });
    });

    const topSellingItems = Object.values(itemSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return {
      totalRevenue,
      totalOrdersCount,
      averageTicket,
      completedCount,
      cancelledCount,
      pixRevenue,
      cardRevenue,
      cashRevenue,
      deliveryOrders,
      pickupOrders,
      topSellingItems
    };
  }, [filteredOrders, orders]);

  return (
    <div className="space-y-6">
      {/* Top Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950/70 p-4 rounded-2xl border border-zinc-800">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>Dashboard Financeiro & Estatísticas</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Acompanhe o faturamento, ticket médio e produtos mais vendidos da sua hamburgueria
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setPeriodFilter('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              periodFilter === 'all'
                ? 'bg-amber-500 text-zinc-950 shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Todo Histórico
          </button>
          <button
            onClick={() => setPeriodFilter('today')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
              periodFilter === 'today'
                ? 'bg-amber-500 text-zinc-950 shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Apenas Hoje
          </button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Faturado */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 p-4 rounded-2xl border border-emerald-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Faturamento Total</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2">
            {formatCurrency(metrics.totalRevenue)}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <span>● {metrics.totalOrdersCount} pedidos faturados</span>
          </div>
        </div>

        {/* Ticket Médio */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 p-4 rounded-2xl border border-amber-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Ticket Médio</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-2">
            {formatCurrency(metrics.averageTicket)}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">Média por pedido</div>
        </div>

        {/* Pedidos Concluídos */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 p-4 rounded-2xl border border-blue-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Pedidos Concluídos</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-400 mt-2">
            {metrics.completedCount}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            {metrics.cancelledCount > 0 ? `${metrics.cancelledCount} cancelados` : 'Nenhum cancelamento'}
          </div>
        </div>

        {/* Delivery vs Retirada */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 p-4 rounded-2xl border border-purple-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Tipo de Entrega</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Bike className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base font-bold text-white mt-2 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">🛵 Delivery:</span>
              <strong className="text-amber-400">{metrics.deliveryOrders}</strong>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">🛍️ Retirada:</span>
              <strong className="text-purple-400">{metrics.pickupOrders}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Breakdown & Top Selling items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Formas de Pagamento */}
        <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-amber-400" />
            <span>Faturamento por Forma de Pagamento</span>
          </h4>

          <div className="space-y-2.5 pt-2">
            {/* PIX */}
            <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs sm:text-sm">PIX Automático</div>
                  <div className="text-[11px] text-zinc-400">Chave Instantânea</div>
                </div>
              </div>
              <span className="font-mono font-black text-emerald-400 text-sm">
                {formatCurrency(metrics.pixRevenue)}
              </span>
            </div>

            {/* Cartão */}
            <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs sm:text-sm">Cartão (Débito / Crédito)</div>
                  <div className="text-[11px] text-zinc-400">Máquina na entrega / online</div>
                </div>
              </div>
              <span className="font-mono font-black text-sky-400 text-sm">
                {formatCurrency(metrics.cardRevenue)}
              </span>
            </div>

            {/* Dinheiro */}
            <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs sm:text-sm">Dinheiro em Espécie</div>
                  <div className="text-[11px] text-zinc-400">Com troco na entrega</div>
                </div>
              </div>
              <span className="font-mono font-black text-amber-400 text-sm">
                {formatCurrency(metrics.cashRevenue)}
              </span>
            </div>
          </div>
        </div>

        {/* Top 5 Produtos Mais Vendidos */}
        <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Top Produtos Mais Vendidos</span>
          </h4>

          <div className="space-y-2 pt-2">
            {metrics.topSellingItems.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 text-xs">
                Nenhuma venda registrada ainda no período selecionado.
              </div>
            ) : (
              metrics.topSellingItems.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-[10px] shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-zinc-200 truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-zinc-400 font-semibold">{item.quantity} un</span>
                    <span className="font-mono font-black text-amber-400">{formatCurrency(item.revenue)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
