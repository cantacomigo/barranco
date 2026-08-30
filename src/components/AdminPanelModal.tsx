import React, { useState, useEffect } from 'react';
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
  Power,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  LogOut,
  ArrowRight,
  Delete,
  AlertCircle
} from 'lucide-react';
import { AdminOrdersManager } from './admin/AdminOrdersManager';
import { AdminMenuManager } from './admin/AdminMenuManager';
import { AdminFinancialDashboard } from './admin/AdminFinancialDashboard';
import { AdminDeliveryManager } from './admin/AdminDeliveryManager';
import { AdminCouponsManager } from './admin/AdminCouponsManager';
import { AdminSettingsManager } from './admin/AdminSettingsManager';
import { BARRANCO_LOGO_URL } from '../assets/logo';

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
  isFirebaseConnected?: boolean;
  onSyncAllToFirebase?: () => void;
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
  onUpdateCoupons,
  isFirebaseConnected = true,
  onSyncAllToFirebase
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('barranco_admin_auth') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [enteredPin, setEnteredPin] = useState('');
  const [showPinText, setShowPinText] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('orders');
  const [syncSuccess, setSyncSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Check session
      try {
        const isAuth = sessionStorage.getItem('barranco_admin_auth') === 'true';
        setIsAuthenticated(isAuth);
      } catch (e) {
        setIsAuthenticated(false);
      }
      setEnteredPin('');
      setAuthError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const correctPin = (storeSettings.adminPin || '1234').trim();

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!enteredPin.trim()) {
      setAuthError('Por favor, informe a senha de administrador.');
      return;
    }

    if (enteredPin.trim() === correctPin) {
      try {
        sessionStorage.setItem('barranco_admin_auth', 'true');
      } catch (e) {}
      setIsAuthenticated(true);
      setAuthError('');
      setEnteredPin('');
    } else {
      setAuthError('Senha incorreta! Verifique e tente novamente.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
    }
  };

  const handleKeypadPress = (val: string) => {
    if (val === 'clear') {
      setEnteredPin('');
      setAuthError('');
    } else if (val === 'back') {
      setEnteredPin((prev) => prev.slice(0, -1));
      setAuthError('');
    } else {
      setEnteredPin((prev) => (prev.length < 20 ? prev + val : prev));
      setAuthError('');
    }
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('barranco_admin_auth');
    } catch (e) {}
    setIsAuthenticated(false);
    setEnteredPin('');
    setAuthError('');
  };

  const handleManualSync = async () => {
    if (onSyncAllToFirebase) {
      await onSyncAllToFirebase();
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    }
  };

  const pendingOrdersCount = orders.filter((o) => o.status === 'recebido' || o.status === 'preparando').length;

  // ================= RENDER LOCK / AUTHENTICATION SCREEN =================
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in no-print">
        <div
          className={`bg-zinc-900 border border-amber-500/30 rounded-3xl w-full max-w-md flex flex-col overflow-hidden shadow-2xl relative my-auto transition-transform ${
            isShaking ? 'animate-bounce' : ''
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Lock Header */}
          <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Acesso Restrito ao Dono</span>
            </div>
            <button
              onClick={onClose}
              className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-xl text-zinc-400 hover:text-white transition cursor-pointer"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Lock Body */}
          <div className="p-6 sm:p-7 space-y-6">
            {/* Visual Icon / Logo */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-amber-500/40 p-2 flex items-center justify-center shadow-xl shadow-amber-950/30">
                  <img
                    src={storeSettings.logoUrl || BARRANCO_LOGO_URL}
                    alt={storeSettings.name}
                    className="w-full h-full object-contain filter drop-shadow"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = BARRANCO_LOGO_URL;
                    }}
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center shadow-md">
                  <Lock className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-white">
                  Painel de Gestão da Loja
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs leading-relaxed">
                  Digite a senha de administrador para gerenciar pedidos, cardápio, estoque e financeiro.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="bg-red-500/15 border border-red-500/40 text-red-300 text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Password Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-zinc-300">Senha / PIN do Dono</label>
                  <button
                    type="button"
                    onClick={() => setShowPinText(!showPinText)}
                    className="text-zinc-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
                  >
                    {showPinText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPinText ? 'Ocultar' : 'Mostrar'}</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPinText ? 'text' : 'password'}
                    value={enteredPin}
                    onChange={(e) => {
                      setEnteredPin(e.target.value);
                      setAuthError('');
                    }}
                    placeholder="Digite sua senha..."
                    autoFocus
                    className="w-full bg-zinc-800/90 border border-zinc-700 focus:border-amber-500 rounded-xl px-4 py-3 text-center text-lg sm:text-xl font-mono tracking-widest text-white focus:outline-none shadow-inner"
                  />
                </div>
              </div>

              {/* Numeric Keypad for fast touchscreen input */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back'].map((key) => {
                  if (key === 'clear') {
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleKeypadPress('clear')}
                        className="py-2.5 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer border border-zinc-800"
                      >
                        Limpar
                      </button>
                    );
                  }
                  if (key === 'back') {
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleKeypadPress('back')}
                        className="py-2.5 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer border border-zinc-800 flex items-center justify-center"
                        title="Apagar último"
                      >
                        <Delete className="w-4 h-4" />
                      </button>
                    );
                  }
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleKeypadPress(key)}
                      className="py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-base font-bold font-mono transition active:scale-95 cursor-pointer border border-zinc-700/50 shadow-sm"
                    >
                      {key}
                    </button>
                  );
                })}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold py-3 rounded-xl text-sm transition shadow-lg shadow-orange-950/40 flex items-center justify-center gap-2 active:scale-98 cursor-pointer mt-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Desbloquear e Entrar no Painel</span>
              </button>
            </form>

            {/* Security Hint */}
            <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3 text-[11px] text-zinc-400 text-center leading-relaxed">
              <span>💡 Senha padrão inicial: </span>
              <strong className="text-amber-400 font-mono">1234</strong>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                (Você pode alterar esta senha nas Configurações da Loja após entrar)
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= RENDER AUTHENTICATED ADMIN PANEL =================
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
              <div className="flex items-center gap-2 flex-wrap">
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
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    isFirebaseConnected
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                  title="Conectado ao Firebase Firestore"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>🔥 Firebase Firestore Conectado</span>
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {storeSettings.name} • Acesso do Dono Autenticado 🔒
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onSyncAllToFirebase && (
              <button
                type="button"
                onClick={handleManualSync}
                className="hidden sm:flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-zinc-700 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                title="Sincronizar dados locais com o Firebase Firestore"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{syncSuccess ? 'Sincronizado!' : 'Forçar Sync'}</span>
              </button>
            )}

            {/* Logout / Lock Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
              title="Bloquear painel e sair da sessão"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bloquear</span>
            </button>

            <button
              onClick={onClose}
              className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-xl text-zinc-300 hover:text-white transition cursor-pointer"
              title="Fechar painel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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
