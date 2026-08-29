import React, { useState } from 'react';
import { StoreSettings, Order, OrderStatus, MenuItem, CategoryId } from '../types';
import { NeighborhoodFee, Coupon } from '../data/neighborhoods';
import {
  X,
  Settings,
  ClipboardList,
  UtensilsCrossed,
  TrendingUp,
  Truck,
  Tag,
  Printer,
  Sparkles,
  Power
} from 'lucide-react';
import { AdminOrdersManager } from './admin/AdminOrdersManager';
import { AdminMenuManager } from './admin/AdminMenuManager';
import { AdminFinancialDashboard } from './admin/AdminFinancialDashboard';
import { AdminDeliveryManager } from './admin/AdminDeliveryManager';
import { AdminCouponsManager } from './admin/AdminCouponsManager';
import { AdminSettingsManager } from './admin/AdminSettingsManager';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeSettings: StoreSettings;
  onUpdateStoreSettings: (newSettings: StoreSettings) => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onClearOrders?: () => void;
  onOpenReceiptModal?: (order: Order) => void;
  menuItems: MenuItem[];
  onAddItem: (item: MenuItem) => void;
  onUpdateItem: (item: MenuItem) => void;
  onDeleteItem: (itemId: string) => void;
  onToggleItemAvailable: (itemId: string) => void;
  onResetMenu: () => void;
  onApplyMassPriceAdjustment: (percentage: number, categoryId?: CategoryId) => void;
  neighborhoods: NeighborhoodFee[];
  onUpdateNeighborhoods: (newNeighborhoods: NeighborhoodFee[]) => void;
  coupons: Coupon[];
  onUpdateCoupons: (newCoupons: Coupon[]) => void;
}

export type AdminTab = 'orders' | 'menu' | 'financial' | 'delivery' | 'coupons' | 'settings';

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  storeSettings,
  onUpdateStoreSettings,
  orders,
  onUpdateOrderStatus,
  onClearOrders,
  onOpenReceiptModal,
  menuItems,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onToggleItemAvailable,
  onResetMenu,
  onApplyMassPriceAdjustment,
  neighborhoods,
  onUpdateNeighborhoods,
  coupons,
  onUpdateCoupons
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('orders');

  if (!isOpen) return null;

  const pendingOrdersCount = orders.filter((o) => o.status === 'recebido' || o.status === 'preparando').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in no-print">
      <div
        className="bg-zinc-900 border border-zinc-700/80 rounded-3xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden shadow-2xl relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-950/40">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base sm:text-lg text-white">
                  Painel de Gestão do Restaurante
                </h2>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    storeSettings.isOpen
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}
                >
                  {storeSettings.isOpen ? 'Loja Aberta' : 'Loja Fechada'}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {storeSettings.name} • Gestão completa de cardápio, estoque, pedidos e caixa
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-xl text-zinc-300 hover:text-white transition cursor-pointer"
            title="Fechar painel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/70 px-3 sm:px-6 pt-2 gap-1 sm:gap-2 overflow-x-auto scrollbar-thin shrink-0">
          {/* Tab 1: Pedidos */}
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'orders'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Pedidos & KDS</span>
            {pendingOrdersCount > 0 && (
              <span className="bg-amber-500 text-zinc-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          {/* Tab 2: Cardápio */}
          <button
            onClick={() => setActiveTab('menu')}
            className={`py-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'menu'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Cardápio & Estoque ({menuItems.length})</span>
          </button>

          {/* Tab 3: Relatórios / Financeiro */}
          <button
            onClick={() => setActiveTab('financial')}
            className={`py-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'financial'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Financeiro & Vendas</span>
          </button>

          {/* Tab 4: Bairros & Entrega */}
          <button
            onClick={() => setActiveTab('delivery')}
            className={`py-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'delivery'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Bairros & Frete</span>
          </button>

          {/* Tab 5: Cupons */}
          <button
            onClick={() => setActiveTab('coupons')}
            className={`py-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'coupons'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Cupons ({coupons.length})</span>
          </button>

          {/* Tab 6: Configurações & Impressora */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'settings'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Configurações & 80mm</span>
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-zinc-200">
          {activeTab === 'orders' && (
            <AdminOrdersManager
              orders={orders}
              onUpdateOrderStatus={onUpdateOrderStatus}
              onClearOrders={onClearOrders}
              storeSettings={storeSettings}
              onOpenReceiptModal={onOpenReceiptModal}
            />
          )}

          {activeTab === 'menu' && (
            <AdminMenuManager
              items={menuItems}
              onAddItem={onAddItem}
              onUpdateItem={onUpdateItem}
              onDeleteItem={onDeleteItem}
              onToggleItemAvailable={onToggleItemAvailable}
              onResetMenu={onResetMenu}
              onApplyMassPriceAdjustment={onApplyMassPriceAdjustment}
            />
          )}

          {activeTab === 'financial' && (
            <AdminFinancialDashboard orders={orders} menuItems={menuItems} />
          )}

          {activeTab === 'delivery' && (
            <AdminDeliveryManager
              storeSettings={storeSettings}
              onUpdateStoreSettings={onUpdateStoreSettings}
              neighborhoods={neighborhoods}
              onUpdateNeighborhoods={onUpdateNeighborhoods}
            />
          )}

          {activeTab === 'coupons' && (
            <AdminCouponsManager coupons={coupons} onUpdateCoupons={onUpdateCoupons} />
          )}

          {activeTab === 'settings' && (
            <AdminSettingsManager
              storeSettings={storeSettings}
              onUpdateStoreSettings={onUpdateStoreSettings}
              recentOrders={orders}
            />
          )}
        </div>
      </div>
    </div>
  );
};
