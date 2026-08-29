import React, { useState } from 'react';
import { Coupon } from '../../data/neighborhoods';
import { Tag, Plus, Trash2, Check, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface AdminCouponsManagerProps {
  coupons: Coupon[];
  onUpdateCoupons: (newCoupons: Coupon[]) => void;
}

export const AdminCouponsManager: React.FC<AdminCouponsManagerProps> = ({
  coupons,
  onUpdateCoupons
}) => {
  const [newCoupon, setNewCoupon] = useState<Coupon>({
    code: '',
    type: 'percentage',
    value: 10,
    minOrder: 30,
    description: ''
  });

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code.trim()) return;

    const formattedCode = newCoupon.code.trim().toUpperCase().replace(/\s+/g, '');
    if (coupons.some((c) => c.code === formattedCode)) {
      alert('Já existe um cupom cadastrado com este código!');
      return;
    }

    const created: Coupon = {
      code: formattedCode,
      type: newCoupon.type,
      value: Number(newCoupon.value),
      minOrder: Number(newCoupon.minOrder) || 0,
      description: newCoupon.description.trim() || `${newCoupon.type === 'percentage' ? `${newCoupon.value}% OFF` : `R$ ${newCoupon.value} OFF`} em pedidos acima de ${formatCurrency(newCoupon.minOrder)}`
    };

    onUpdateCoupons([...coupons, created]);
    setNewCoupon({
      code: '',
      type: 'percentage',
      value: 10,
      minOrder: 30,
      description: ''
    });
  };

  const handleDeleteCoupon = (code: string) => {
    if (window.confirm(`Excluir cupom "${code}"?`)) {
      onUpdateCoupons(coupons.filter((c) => c.code !== code));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-400" />
            <span>Gerenciar Cupons de Desconto</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Crie cupons promocionais em porcentagem ou valor fixo em reais para incentivar vendas
          </p>
        </div>

        {/* Add Coupon Form */}
        <form
          onSubmit={handleAddCoupon}
          className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl space-y-3"
        >
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" />
            <span>Cadastrar Novo Cupom</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-4 space-y-1">
              <label className="text-[11px] font-bold text-zinc-300">Código do Cupom *</label>
              <input
                type="text"
                required
                placeholder="Ex: PROMO20"
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-mono uppercase font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-3 space-y-1">
              <label className="text-[11px] font-bold text-zinc-300">Tipo de Desconto</label>
              <select
                value={newCoupon.type}
                onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value as 'percentage' | 'fixed' })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="percentage">Porcentagem (%)</option>
                <option value="fixed">Valor Fixo (R$)</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-zinc-300">
                Valor {newCoupon.type === 'percentage' ? '(%)' : '(R$)'}
              </label>
              <input
                type="number"
                step={newCoupon.type === 'percentage' ? '1' : '0.50'}
                min="1"
                required
                value={newCoupon.value}
                onChange={(e) => setNewCoupon({ ...newCoupon, value: parseFloat(e.target.value) || 0 })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-3 space-y-1">
              <label className="text-[11px] font-bold text-zinc-300">Pedido Mínimo (R$)</label>
              <input
                type="number"
                step="1"
                min="0"
                value={newCoupon.minOrder}
                onChange={(e) => setNewCoupon({ ...newCoupon, minOrder: parseFloat(e.target.value) || 0 })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-9 space-y-1">
              <label className="text-[11px] font-bold text-zinc-300">Descrição Exibida ao Cliente (Opcional)</label>
              <input
                type="text"
                placeholder="Ex: 20% de desconto especial em pedidos acima de R$ 50"
                value={newCoupon.description}
                onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-3 flex items-end">
              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1 transition shadow cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Cupom</span>
              </button>
            </div>
          </div>
        </form>

        {/* Coupons List */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-zinc-400">Cupons Disponíveis ({coupons.length})</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {coupons.map((c) => (
              <div
                key={c.code}
                className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-xl flex items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-amber-400 text-sm tracking-wider bg-zinc-950 px-2 py-0.5 rounded border border-amber-500/30">
                      {c.code}
                    </span>
                    <span className="text-xs font-black text-emerald-400">
                      {c.type === 'percentage' ? `${c.value}% OFF` : `R$ ${c.value} OFF`}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-tight">{c.description}</p>
                  {c.minOrder > 0 && (
                    <span className="text-[10px] text-zinc-500 block">
                      Válido para pedidos acima de {formatCurrency(c.minOrder)}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteCoupon(c.code)}
                  className="p-2 rounded-lg bg-zinc-800 hover:bg-red-950/80 text-zinc-400 hover:text-red-400 border border-zinc-700 transition"
                  title="Excluir cupom"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
