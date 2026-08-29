import React, { useState } from 'react';
import { StoreSettings } from '../../types';
import { NeighborhoodFee } from '../../data/neighborhoods';
import { Truck, Plus, Trash2, Edit2, DollarSign, Clock, MapPin, Check, Save } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface AdminDeliveryManagerProps {
  storeSettings: StoreSettings;
  onUpdateStoreSettings: (newSettings: StoreSettings) => void;
  neighborhoods: NeighborhoodFee[];
  onUpdateNeighborhoods: (newNeighborhoods: NeighborhoodFee[]) => void;
}

export const AdminDeliveryManager: React.FC<AdminDeliveryManagerProps> = ({
  storeSettings,
  onUpdateStoreSettings,
  neighborhoods,
  onUpdateNeighborhoods
}) => {
  const [settingsForm, setSettingsForm] = useState({
    minOrderValue: storeSettings.minOrderValue,
    freeDeliveryAbove: storeSettings.freeDeliveryAbove,
    defaultDeliveryFee: storeSettings.defaultDeliveryFee
  });

  const [newNeighborhood, setNewNeighborhood] = useState<NeighborhoodFee>({
    name: '',
    fee: 7.00,
    estimatedMinutes: '30-45 min'
  });

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<NeighborhoodFee | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveGeneralSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStoreSettings({
      ...storeSettings,
      minOrderValue: Number(settingsForm.minOrderValue),
      freeDeliveryAbove: Number(settingsForm.freeDeliveryAbove),
      defaultDeliveryFee: Number(settingsForm.defaultDeliveryFee)
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAddNeighborhood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNeighborhood.name.trim()) return;
    onUpdateNeighborhoods([...neighborhoods, { ...newNeighborhood, name: newNeighborhood.name.trim() }]);
    setNewNeighborhood({ name: '', fee: 7.00, estimatedMinutes: '30-45 min' });
  };

  const handleDeleteNeighborhood = (index: number) => {
    if (window.confirm(`Excluir bairro "${neighborhoods[index].name}"?`)) {
      const updated = neighborhoods.filter((_, i) => i !== index);
      onUpdateNeighborhoods(updated);
    }
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditingItem({ ...neighborhoods[index] });
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editingItem) {
      const updated = [...neighborhoods];
      updated[editingIndex] = editingItem;
      onUpdateNeighborhoods(updated);
      setEditingIndex(null);
      setEditingItem(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* General Delivery Rules */}
      <form
        onSubmit={handleSaveGeneralSettings}
        className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-400" />
            <span>Regras Gerais de Entrega & Frete</span>
          </h3>
          {savedSuccess && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-4 h-4" /> Salvo com sucesso!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300">Pedido Mínimo (R$)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400">R$</span>
              <input
                type="number"
                step="1"
                min="0"
                value={settingsForm.minOrderValue}
                onChange={(e) => setSettingsForm({ ...settingsForm, minOrderValue: parseFloat(e.target.value) || 0 })}
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
            <p className="text-[11px] text-zinc-500">Valor mínimo para checkout</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300">Frete Grátis Acima De (R$)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400">R$</span>
              <input
                type="number"
                step="1"
                min="0"
                value={settingsForm.freeDeliveryAbove}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, freeDeliveryAbove: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
            <p className="text-[11px] text-zinc-500">Zera o frete automaticamente</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300">Taxa Padrão de Entrega (R$)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">R$</span>
              <input
                type="number"
                step="0.50"
                min="0"
                value={settingsForm.defaultDeliveryFee}
                onChange={(e) =>
                  setSettingsForm({ ...settingsForm, defaultDeliveryFee: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
            <p className="text-[11px] text-zinc-500">Para bairros não listados</p>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar Regras de Frete</span>
          </button>
        </div>
      </form>

      {/* Neighborhoods List & Management */}
      <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-red-400" />
          <span>Tabela de Bairros & Taxas de Entrega</span>
        </h3>

        {/* Add New Neighborhood Form */}
        <form
          onSubmit={handleAddNeighborhood}
          className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end"
        >
          <div className="sm:col-span-5 space-y-1">
            <label className="text-[11px] font-bold text-zinc-400">Nome da Região / Bairro</label>
            <input
              type="text"
              required
              placeholder="Ex: Santana / Zona Norte"
              value={newNeighborhood.name}
              onChange={(e) => setNewNeighborhood({ ...newNeighborhood, name: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-3 space-y-1">
            <label className="text-[11px] font-bold text-zinc-400">Taxa (R$)</label>
            <input
              type="number"
              step="0.50"
              min="0"
              required
              value={newNeighborhood.fee}
              onChange={(e) => setNewNeighborhood({ ...newNeighborhood, fee: parseFloat(e.target.value) || 0 })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="text-[11px] font-bold text-zinc-400">Tempo Estimado</label>
            <input
              type="text"
              value={newNeighborhood.estimatedMinutes}
              onChange={(e) => setNewNeighborhood({ ...newNeighborhood, estimatedMinutes: e.target.value })}
              placeholder="30-45 min"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar</span>
            </button>
          </div>
        </form>

        {/* Neighborhoods Table */}
        <div className="divide-y divide-zinc-800 border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/50">
          {neighborhoods.map((n, idx) => (
            <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
              {editingIndex === idx && editingItem ? (
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="sm:col-span-5 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white"
                  />
                  <input
                    type="number"
                    step="0.50"
                    value={editingItem.fee}
                    onChange={(e) => setEditingItem({ ...editingItem, fee: parseFloat(e.target.value) || 0 })}
                    className="sm:col-span-3 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white font-bold"
                  />
                  <input
                    type="text"
                    value={editingItem.estimatedMinutes}
                    onChange={(e) => setEditingItem({ ...editingItem, estimatedMinutes: e.target.value })}
                    className="sm:col-span-2 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white"
                  />
                  <div className="sm:col-span-2 flex gap-1">
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded font-bold"
                    >
                      ✓
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingIndex(null)}
                      className="bg-zinc-700 text-zinc-300 px-2 py-1 rounded"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="font-bold text-white truncate">{n.name}</span>
                    <span className="text-[11px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
                      {n.estimatedMinutes}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-black text-amber-400 text-sm">
                      {formatCurrency(n.fee)}
                    </span>

                    <button
                      onClick={() => handleStartEdit(idx)}
                      className="p-1 text-zinc-400 hover:text-white transition"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteNeighborhood(idx)}
                      className="p-1 text-zinc-400 hover:text-red-400 transition"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
