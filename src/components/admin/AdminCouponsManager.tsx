import React, { useState, useMemo } from 'react';
import { Coupon, VALID_COUPONS } from '../../data/neighborhoods';
import {
  Tag,
  Plus,
  Trash2,
  Check,
  Sparkles,
  Edit2,
  Copy,
  Search,
  Calendar,
  Percent,
  DollarSign,
  Power,
  RotateCcw,
  CopyCheck,
  AlertCircle,
  Hash,
  X,
  Clock,
  ArrowRight
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { ConfirmModal } from '../ConfirmModal';

interface AdminCouponsManagerProps {
  coupons: Coupon[];
  onUpdateCoupons: (newCoupons: Coupon[]) => void;
}

export const AdminCouponsManager: React.FC<AdminCouponsManagerProps> = ({
  coupons,
  onUpdateCoupons
}) => {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');

  // Form State (New or Editing)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);

  const [formData, setFormData] = useState<Coupon>({
    code: '',
    type: 'percentage',
    value: 10,
    minOrder: 30,
    description: '',
    active: true,
    expiresAt: '',
    maxUses: undefined,
    timesUsed: 0
  });

  // UI Feedback & Modals
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Compute Stats
  const stats = useMemo(() => {
    let active = 0;
    let inactive = 0;
    let expired = 0;
    let totalUses = 0;

    coupons.forEach((c) => {
      totalUses += c.timesUsed || 0;
      const isExpired = c.expiresAt ? c.expiresAt < todayStr : false;
      if (isExpired) {
        expired++;
      } else if (c.active !== false) {
        active++;
      } else {
        inactive++;
      }
    });

    return { total: coupons.length, active, inactive, expired, totalUses };
  }, [coupons, todayStr]);

  // Filtered List
  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      // Search
      const matchesSearch =
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Status
      const isExpired = c.expiresAt ? c.expiresAt < todayStr : false;
      if (statusFilter === 'active') return c.active !== false && !isExpired;
      if (statusFilter === 'inactive') return c.active === false && !isExpired;
      if (statusFilter === 'expired') return isExpired;

      return true;
    });
  }, [coupons, searchQuery, statusFilter, todayStr]);

  // Auto-generate Promo Code
  const handleGenerateRandomCode = () => {
    const prefixes = ['BARRANCO', 'PROMO', 'BURGER', 'LANCHE', 'VIP', 'ESPECIAL', 'COMBO', 'DELIVERY'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = [10, 15, 20, 25, 30][Math.floor(Math.random() * 5)];
    setFormData((prev) => ({
      ...prev,
      code: `${prefix}${num}`
    }));
  };

  // Auto-generate Description based on current form inputs
  const handleAutoDescription = () => {
    const typeText = formData.type === 'percentage' ? `${formData.value}% de desconto` : `${formatCurrency(formData.value)} de desconto`;
    const minText = formData.minOrder > 0 ? ` em pedidos acima de ${formatCurrency(formData.minOrder)}` : ' em qualquer pedido';
    setFormData((prev) => ({
      ...prev,
      description: `${typeText}${minText}`
    }));
  };

  // Open Form for New Coupon
  const handleOpenCreate = () => {
    setEditingCode(null);
    setFormData({
      code: '',
      type: 'percentage',
      value: 10,
      minOrder: 30,
      description: '10% de desconto em pedidos acima de R$ 30,00',
      active: true,
      expiresAt: '',
      maxUses: undefined,
      timesUsed: 0
    });
    setIsFormOpen(true);
  };

  // Open Form for Editing
  const handleOpenEdit = (coupon: Coupon) => {
    setEditingCode(coupon.code);
    setFormData({
      ...coupon,
      active: coupon.active !== false
    });
    setIsFormOpen(true);
  };

  // Close Form
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCode(null);
  };

  // Save Coupon (Create or Update)
  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = formData.code.trim().toUpperCase().replace(/\s+/g, '');

    if (!cleanCode) {
      showFeedback('error', 'O código do cupom é obrigatório.');
      return;
    }

    // Check code duplication
    const duplicate = coupons.some(
      (c) => c.code.toUpperCase() === cleanCode && c.code.toUpperCase() !== editingCode?.toUpperCase()
    );

    if (duplicate) {
      showFeedback('error', `Já existe outro cupom com o código "${cleanCode}".`);
      return;
    }

    if (formData.value <= 0) {
      showFeedback('error', 'O valor do desconto deve ser maior que zero.');
      return;
    }

    if (formData.type === 'percentage' && formData.value > 100) {
      showFeedback('error', 'O desconto percentual não pode ultrapassar 100%.');
      return;
    }

    const payload: Coupon = {
      code: cleanCode,
      type: formData.type,
      value: Number(formData.value),
      minOrder: Math.max(0, Number(formData.minOrder) || 0),
      description: formData.description.trim() || `${formData.type === 'percentage' ? `${formData.value}% OFF` : `R$ ${formData.value} OFF`}`,
      active: formData.active !== false,
      expiresAt: formData.expiresAt || undefined,
      maxUses: formData.maxUses ? Number(formData.maxUses) : undefined,
      timesUsed: formData.timesUsed || 0,
      createdAt: formData.createdAt || new Date().toISOString()
    };

    if (editingCode) {
      // Update
      const updatedList = coupons.map((c) => (c.code === editingCode ? payload : c));
      onUpdateCoupons(updatedList);
      showFeedback('success', `Cupom "${cleanCode}" atualizado com sucesso!`);
    } else {
      // Create
      onUpdateCoupons([payload, ...coupons]);
      showFeedback('success', `Cupom "${cleanCode}" criado com sucesso!`);
    }

    handleCloseForm();
  };

  // Toggle Active State with 1 click
  const handleToggleActive = (code: string) => {
    const updatedList = coupons.map((c) => {
      if (c.code === code) {
        const nextState = c.active !== false ? false : true;
        return { ...c, active: nextState };
      }
      return c;
    });

    onUpdateCoupons(updatedList);
    const target = coupons.find((c) => c.code === code);
    const newState = target?.active !== false ? 'desativado' : 'ativado';
    showFeedback('success', `Cupom "${code}" ${newState}!`);
  };

  // Duplicate Coupon
  const handleDuplicate = (c: Coupon) => {
    let newCode = `${c.code}_PROMO`;
    let count = 2;
    while (coupons.some((item) => item.code === newCode)) {
      newCode = `${c.code}_${count}`;
      count++;
    }

    const duplicated: Coupon = {
      ...c,
      code: newCode,
      description: `${c.description} (Cópia)`,
      timesUsed: 0,
      createdAt: new Date().toISOString()
    };

    onUpdateCoupons([duplicated, ...coupons]);
    showFeedback('success', `Cupom duplicado com sucesso como "${newCode}"!`);
  };

  // Copy Code to Clipboard
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  // Delete Coupon
  const handleConfirmDelete = () => {
    if (couponToDelete) {
      const updatedList = coupons.filter((c) => c.code !== couponToDelete);
      onUpdateCoupons(updatedList);
      showFeedback('success', `Cupom "${couponToDelete}" excluído com sucesso.`);
      setCouponToDelete(null);
    }
  };

  // Restore Default Coupons
  const handleRestoreDefaults = () => {
    onUpdateCoupons(VALID_COUPONS);
    showFeedback('success', 'Cupons padrão restaurados com sucesso!');
  };

  // Preview simulation
  const simulatedSubtotal = 50;
  const simulatedDiscount =
    formData.type === 'percentage'
      ? (simulatedSubtotal * (formData.value || 0)) / 100
      : Math.min(simulatedSubtotal, formData.value || 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>Gestão de Cupons Promocionais</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {coupons.length} {coupons.length === 1 ? 'cupom' : 'cupons'}
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Crie, edite, pause ou ative códigos de desconto em porcentagem ou valor fixo para seus clientes
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isFormOpen && (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Novo Cupom</span>
              </button>
            )}

            {coupons.length === 0 && (
              <button
                type="button"
                onClick={handleRestoreDefaults}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition border border-zinc-700 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Padrões</span>
              </button>
            )}
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all animate-fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span className="font-semibold">{feedback.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-zinc-400 hover:text-white font-bold ml-2 cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-xl p-3">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Total de Cupons</span>
            <div className="text-lg sm:text-xl font-black text-white mt-0.5">{stats.total}</div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-xl p-3">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Ativos no Cardápio
            </span>
            <div className="text-lg sm:text-xl font-black text-emerald-400 mt-0.5">{stats.active}</div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-xl p-3">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Pausados / Inativos</span>
            <div className="text-lg sm:text-xl font-black text-zinc-300 mt-0.5">{stats.inactive}</div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-xl p-3">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Usos em Pedidos</span>
            <div className="text-lg sm:text-xl font-black text-amber-400 mt-0.5">{stats.totalUses}</div>
          </div>
        </div>
      </div>

      {/* Add / Edit Coupon Form (Expandable) */}
      {isFormOpen && (
        <form
          onSubmit={handleSaveCoupon}
          className="bg-zinc-950/90 border-2 border-amber-500/40 rounded-2xl p-4 sm:p-6 space-y-5 shadow-2xl relative"
        >
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-zinc-950 flex items-center justify-center font-black">
                {editingCode ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black text-white">
                  {editingCode ? `Editar Cupom: ${editingCode}` : 'Cadastrar Novo Cupom'}
                </h4>
                <p className="text-[11px] text-zinc-400">
                  {editingCode
                    ? 'Altere as regras ou valores do cupom selecionado'
                    : 'Defina as regras, valor de desconto e pedido mínimo'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCloseForm}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            {/* Coupon Code */}
            <div className="sm:col-span-6 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-amber-400" />
                  <span>Código do Cupom *</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateRandomCode}
                  className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Sugerir Código</span>
                </button>
              </div>
              <input
                type="text"
                required
                placeholder="Ex: PROMO15"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                className="w-full bg-zinc-800/90 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono font-black uppercase tracking-wider focus:outline-none focus:border-amber-500"
              />
              <p className="text-[11px] text-zinc-500">O cliente digitará exatamente este código no carrinho.</p>
            </div>

            {/* Discount Type */}
            <div className="sm:col-span-6 space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Tipo de Desconto *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'percentage' })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                    formData.type === 'percentage'
                      ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md shadow-amber-500/20'
                      : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                  }`}
                >
                  <Percent className="w-3.5 h-3.5" />
                  <span>Porcentagem (%)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'fixed' })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                    formData.type === 'fixed'
                      ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md shadow-amber-500/20'
                      : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Valor Fixo (R$)</span>
                </button>
              </div>
              <p className="text-[11px] text-zinc-500">
                {formData.type === 'percentage'
                  ? 'Aplica uma porcentagem de desconto sobre o subtotal do pedido.'
                  : 'Desconta um valor monetário fixo do total do pedido.'}
              </p>
            </div>

            {/* Discount Value */}
            <div className="sm:col-span-4 space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">
                Valor do Desconto {formData.type === 'percentage' ? '(%) *' : '(R$) *'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step={formData.type === 'percentage' ? '1' : '0.50'}
                  min="1"
                  max={formData.type === 'percentage' ? 100 : 500}
                  required
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-zinc-800/90 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-amber-500 pr-12 font-mono"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-amber-400">
                  {formData.type === 'percentage' ? '%' : 'R$'}
                </span>
              </div>
            </div>

            {/* Minimum Order */}
            <div className="sm:col-span-4 space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Pedido Mínimo (R$)</label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={formData.minOrder}
                  onChange={(e) => setFormData({ ...formData, minOrder: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-zinc-800/90 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-amber-500 pr-10 font-mono"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400">R$</span>
              </div>
              <p className="text-[11px] text-zinc-500">Deixe 0 para permitir em qualquer valor de pedido.</p>
            </div>

            {/* Status Active Toggle */}
            <div className="sm:col-span-4 space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Status do Cupom</label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, active: !formData.active })}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 border cursor-pointer ${
                  formData.active
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>{formData.active ? 'Ativo (Disponível)' : 'Pausado (Inativo)'}</span>
              </button>
              <p className="text-[11px] text-zinc-500">Cupons pausados não podem ser ativados por clientes.</p>
            </div>

            {/* Expiration Date (Optional) */}
            <div className="sm:col-span-6 space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Validade / Expiração (Opcional)</span>
              </label>
              <input
                type="date"
                value={formData.expiresAt || ''}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className="w-full bg-zinc-800/90 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
              <p className="text-[11px] text-zinc-500">Deixe em branco para um cupom sem data de expiração.</p>
            </div>

            {/* Max Usage Limit (Optional) */}
            <div className="sm:col-span-6 space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Limite Máximo de Usos (Opcional)</span>
              </label>
              <input
                type="number"
                min="1"
                placeholder="Ex: 50 (Ilimitado se vazio)"
                value={formData.maxUses !== undefined ? formData.maxUses : ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxUses: e.target.value ? parseInt(e.target.value) : undefined
                  })
                }
                className="w-full bg-zinc-800/90 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
              <p className="text-[11px] text-zinc-500">Ex: limite para os primeiros 50 clientes utilizarem.</p>
            </div>

            {/* Description */}
            <div className="sm:col-span-12 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300">Descrição Exibida ao Cliente</label>
                <button
                  type="button"
                  onClick={handleAutoDescription}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer transition"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Gerar Descrição Automática</span>
                </button>
              </div>
              <input
                type="text"
                placeholder="Ex: 10% de desconto especial na primeira compra"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-zinc-800/90 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Simulation Preview Box */}
            <div className="sm:col-span-12 bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-zinc-300">
                  <strong>Simulação:</strong> Em um pedido de{' '}
                  <span className="text-white font-bold">{formatCurrency(simulatedSubtotal)}</span>, este cupom dará{' '}
                  <strong className="text-emerald-400 font-bold">{formatCurrency(simulatedDiscount)} de desconto</strong> (Total:{' '}
                  <span className="text-amber-300 font-bold">{formatCurrency(simulatedSubtotal - simulatedDiscount)}</span>).
                </span>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center gap-1.5 transition shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingCode ? 'Salvar Alterações' : 'Criar Cupom'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código ou descrição..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs"
            >
              ×
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 p-1 rounded-xl self-start sm:self-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-amber-500 text-zinc-950 shadow'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Todos ({coupons.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              statusFilter === 'active'
                ? 'bg-emerald-500 text-zinc-950 shadow'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Ativos ({stats.active})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              statusFilter === 'inactive'
                ? 'bg-zinc-700 text-white shadow'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Pausados ({stats.inactive})
          </button>

          {stats.expired > 0 && (
            <button
              type="button"
              onClick={() => setStatusFilter('expired')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                statusFilter === 'expired'
                  ? 'bg-red-500 text-white shadow'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              Expirados ({stats.expired})
            </button>
          )}
        </div>
      </div>

      {/* Coupons List / Cards */}
      {filteredCoupons.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-zinc-800 text-zinc-500 flex items-center justify-center mx-auto">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Nenhum cupom encontrado</h4>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-0.5">
              {searchQuery
                ? 'Nenhum cupom coincide com sua busca. Tente outro termo.'
                : statusFilter !== 'all'
                ? `Nenhum cupom com o filtro selecionado (${statusFilter}).`
                : 'Você ainda não cadastrou nenhum cupom promocional.'}
            </p>
          </div>
          {!isFormOpen && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black px-4 py-2 rounded-xl text-xs inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Primeiro Cupom</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredCoupons.map((c) => {
            const isExpired = c.expiresAt ? c.expiresAt < todayStr : false;
            const isActive = c.active !== false && !isExpired;
            const isPaused = c.active === false && !isExpired;

            return (
              <div
                key={c.code}
                className={`border rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between gap-3 shadow-lg ${
                  isActive
                    ? 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700'
                    : isExpired
                    ? 'bg-red-950/20 border-red-900/40 opacity-75'
                    : 'bg-zinc-950/80 border-zinc-800/60 opacity-80'
                }`}
              >
                {/* Header of the Card */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Code Badge */}
                      <div className="flex items-center gap-1 bg-zinc-950 px-2.5 py-1 rounded-lg border border-amber-500/40 font-mono font-black text-amber-400 text-sm tracking-wider">
                        <span>{c.code}</span>
                      </div>

                      {/* Copy Code Quick Button */}
                      <button
                        type="button"
                        onClick={() => handleCopyCode(c.code)}
                        className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition cursor-pointer"
                        title="Copiar código para enviar a clientes"
                      >
                        {copiedCode === c.code ? (
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 px-1">
                            <CopyCheck className="w-3 h-3" />
                            Copiado
                          </span>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Status Tag */}
                      {isActive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          Ativo
                        </span>
                      )}
                      {isPaused && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                          Pausado
                        </span>
                      )}
                      {isExpired && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                          Expirado
                        </span>
                      )}
                    </div>

                    {/* Discount Value Badge */}
                    <div className="text-right shrink-0">
                      <span className="font-black text-emerald-400 text-base">
                        {c.type === 'percentage' ? `${c.value}% OFF` : `R$ ${c.value} OFF`}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-zinc-300 font-medium leading-snug">
                    {c.description || (c.type === 'percentage' ? `${c.value}% de desconto` : `${formatCurrency(c.value)} de desconto`)}
                  </p>

                  {/* Conditions & Details */}
                  <div className="flex items-center gap-3 flex-wrap text-[11px] text-zinc-400 pt-1">
                    <span className="bg-zinc-800/80 px-2 py-0.5 rounded text-zinc-300 border border-zinc-700/60">
                      {c.minOrder > 0 ? `Mínimo: ${formatCurrency(c.minOrder)}` : 'Sem valor mínimo'}
                    </span>

                    {c.expiresAt && (
                      <span className="flex items-center gap-1 text-zinc-400">
                        <Calendar className="w-3 h-3 text-amber-400" />
                        <span>Válido até: {c.expiresAt.split('-').reverse().join('/')}</span>
                      </span>
                    )}

                    {c.timesUsed !== undefined && c.timesUsed > 0 && (
                      <span className="text-zinc-400">
                        {c.timesUsed} {c.timesUsed === 1 ? 'uso' : 'usos'}
                        {c.maxUses ? ` / ${c.maxUses}` : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Controls & Quick Actions */}
                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  {/* Status Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(c.code)}
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition cursor-pointer border ${
                      c.active !== false
                        ? 'bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border-emerald-500/30'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-500 border-zinc-800'
                    }`}
                    title={c.active !== false ? 'Pausar cupom' : 'Ativar cupom'}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{c.active !== false ? 'Pausar' : 'Ativar'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Duplicate */}
                    <button
                      type="button"
                      onClick={() => handleDuplicate(c)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition cursor-pointer border border-zinc-700/60"
                      title="Duplicar cupom"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-amber-500/20 text-zinc-400 hover:text-amber-400 transition cursor-pointer border border-zinc-700/60"
                      title="Editar cupom"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => setCouponToDelete(c.code)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition cursor-pointer border border-zinc-700/60"
                      title="Excluir cupom"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!couponToDelete}
        title="Excluir Cupom Promocional"
        message={
          couponToDelete
            ? `Tem certeza que deseja excluir permanentemente o cupom "${couponToDelete}"? Esta ação não pode ser desfeita.`
            : ''
        }
        confirmLabel="Sim, Excluir Cupom"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onClose={() => setCouponToDelete(null)}
      />
    </div>
  );
};
