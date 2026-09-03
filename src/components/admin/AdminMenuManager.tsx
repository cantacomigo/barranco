import React, { useState, useMemo } from 'react';
import { MenuItem, CategoryId } from '../../types';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Flame,
  Percent,
  RotateCcw,
  Sparkles,
  Check,
  AlertCircle
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { ProductEditorModal } from './ProductEditorModal';
import { ConfirmModal } from '../ConfirmModal';

interface AdminMenuManagerProps {
  items: MenuItem[];
  onAddItem: (item: MenuItem) => void;
  onUpdateItem: (item: MenuItem) => void;
  onDeleteItem: (itemId: string) => void;
  onToggleItemAvailable: (itemId: string) => void;
  onResetMenu: () => void;
  onApplyMassPriceAdjustment: (percentage: number, categoryId?: CategoryId) => void;
}

export const CATEGORIES_LIST: { id: CategoryId; name: string }[] = [
  { id: 'hamburguer', name: 'Hambúrguer (Tradicional)' },
  { id: 'hamburguer_caseiro', name: 'Hambúrguer Caseiro 150g' },
  { id: 'frango', name: 'Frango' },
  { id: 'calabresa', name: 'Calabresa' },
  { id: 'lombo', name: 'Lombo' },
  { id: 'file', name: 'Filé Mignon' },
  { id: 'hot_dog', name: 'Hot Dog' },
  { id: 'diversos', name: 'Diversos & Especiais' },
  { id: 'porcoes', name: 'Porções & Petiscos' },
  { id: 'bebidas', name: 'Bebidas' },
  { id: 'sobremesas', name: 'Sobremesas' },
  { id: 'combos', name: 'Combos & Promoções' },
  { id: 'todos', name: 'Todos os Itens' }
];

export const AdminMenuManager: React.FC<AdminMenuManagerProps> = ({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onToggleItemAvailable,
  onResetMenu,
  onApplyMassPriceAdjustment
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('todos');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'paused'>('all');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<MenuItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isMassAdjustOpen, setIsMassAdjustOpen] = useState(false);
  const [isMassAdjustConfirmOpen, setIsMassAdjustConfirmOpen] = useState(false);
  const [adjustPercent, setAdjustPercent] = useState<number>(5);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCategory = selectedCategory === 'todos' || item.category === selectedCategory;
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'available'
          ? item.available
          : !item.available;

      return matchCategory && matchSearch && matchStatus;
    });
  }, [items, selectedCategory, searchTerm, statusFilter]);

  const handleOpenAdd = () => {
    setItemToEdit(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setItemToEdit(item);
    setIsEditorOpen(true);
  };

  const handleDeleteClick = (item: MenuItem) => {
    setItemToDelete(item);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      onDeleteItem(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const handleResetClick = () => {
    setIsResetConfirmOpen(true);
  };

  const handleConfirmReset = () => {
    onResetMenu();
    setIsResetConfirmOpen(false);
  };

  const handleMassAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustPercent) return;
    setIsMassAdjustConfirmOpen(true);
  };

  const handleConfirmMassAdjust = () => {
    onApplyMassPriceAdjustment(adjustPercent, selectedCategory === 'todos' ? undefined : selectedCategory);
    setIsMassAdjustConfirmOpen(false);
    setIsMassAdjustOpen(false);
  };

  const totalAvailable = items.filter((i) => i.available).length;
  const totalPaused = items.filter((i) => !i.available).length;

  return (
    <div className="space-y-5">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950/70 p-4 rounded-2xl border border-zinc-800">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span>Cardápio & Produtos</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {items.length} itens cadastrados
              </span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {totalAvailable} disponíveis • {totalPaused} pausados / esgotados
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsMassAdjustOpen(!isMassAdjustOpen)}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition border border-zinc-700"
            title="Reajustar preços em massa"
          >
            <Percent className="w-3.5 h-3.5 text-amber-400" />
            <span>Reajuste Rápido</span>
          </button>

          <button
            onClick={handleResetClick}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-red-400 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition border border-zinc-700 cursor-pointer"
            title="Restaurar cardápio original padrão"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrão</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-orange-950/40 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Novo Produto</span>
          </button>
        </div>
      </div>

      {/* Mass Price Adjustment Banner Form */}
      {isMassAdjustOpen && (
        <form
          onSubmit={handleMassAdjustSubmit}
          className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl space-y-3 animate-fade-in"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Percent className="w-4 h-4" />
              Reajustar Preços em Porcentagem
            </span>
            <button
              type="button"
              onClick={() => setIsMassAdjustOpen(false)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              ✕ Fechar
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-300">Ajuste:</label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  value={adjustPercent}
                  onChange={(e) => setAdjustPercent(parseFloat(e.target.value) || 0)}
                  className="w-24 bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold text-center"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-400">%</span>
              </div>
            </div>

            <div className="text-xs text-zinc-400">
              Aplicar em:{' '}
              <strong className="text-amber-400">
                {selectedCategory === 'todos'
                  ? 'Todos os itens do cardápio'
                  : CATEGORIES_LIST.find((c) => c.id === selectedCategory)?.name}
              </strong>
            </div>

            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black text-xs px-3 py-1.5 rounded-lg transition"
            >
              Aplicar Reajuste
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome ou ingrediente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Category Select */}
        <div className="sm:col-span-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as CategoryId)}
            className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
          >
            {CATEGORIES_LIST.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-2 flex gap-1 bg-zinc-800/80 p-1 rounded-xl border border-zinc-700">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition ${
              statusFilter === 'all' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('available')}
            className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition ${
              statusFilter === 'available' ? 'bg-emerald-500 text-white' : 'text-zinc-400 hover:text-white'
            }`}
            title="Apenas disponíveis"
          >
            Ativos
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('paused')}
            className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition ${
              statusFilter === 'paused' ? 'bg-red-500 text-white' : 'text-zinc-400 hover:text-white'
            }`}
            title="Apenas pausados"
          >
            Pausados
          </button>
        </div>
      </div>

      {/* Items List Table / Cards */}
      <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-800">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-sm">
            Nenhum produto encontrado com os filtros selecionados.
          </div>
        ) : (
          filteredItems.map((item) => {
            const hasDiscount = item.originalPrice && item.originalPrice > item.price;
            return (
              <div
                key={item.id}
                className={`p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-zinc-800/40 transition ${
                  !item.available ? 'opacity-65 bg-zinc-900/30' : ''
                }`}
              >
                {/* Product Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0 relative">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    {!item.available && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <span className="text-[9px] font-black text-red-400 uppercase tracking-tighter text-center">
                          Pausado
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-white text-sm truncate">{item.name}</span>
                      {item.badge && (
                        <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-1.5 py-0.2 rounded">
                          {item.badge}
                        </span>
                      )}
                      {item.isVegetarian && (
                        <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.2 rounded">
                          🌱 Veggie
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-400 truncate max-w-md mt-0.5">{item.description}</p>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-black text-amber-400">{formatCurrency(item.price)}</span>
                      {hasDiscount && (
                        <span className="text-[11px] text-zinc-500 line-through">
                          {formatCurrency(item.originalPrice!)}
                        </span>
                      )}
                      <span className="text-[10px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
                        {CATEGORIES_LIST.find((c) => c.id === item.category)?.name || item.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {/* Quick toggle availability button */}
                  <button
                    onClick={() => onToggleItemAvailable(item.id)}
                    className={`text-xs px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
                      item.available
                        ? 'bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-600/40'
                        : 'bg-red-950/70 hover:bg-red-900 text-red-300 border border-red-600/40'
                    }`}
                    title={item.available ? 'Clique para pausar / esgotar item' : 'Clique para ativar item'}
                  >
                    {item.available ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Disponível</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-red-400" />
                        <span>Esgotado</span>
                      </>
                    )}
                  </button>

                  {/* Edit button */}
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition cursor-pointer"
                    title="Editar produto"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteClick(item)}
                    className="p-1.5 rounded-xl bg-zinc-800 hover:bg-red-950/80 text-zinc-400 hover:text-red-400 border border-zinc-700 transition cursor-pointer"
                    title="Excluir produto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Editor Modal */}
      <ProductEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        itemToEdit={itemToEdit}
        onSave={(savedItem) => {
          if (itemToEdit) {
            onUpdateItem(savedItem);
          } else {
            onAddItem(savedItem);
          }
        }}
        categories={CATEGORIES_LIST}
      />

      {/* Item Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        title="Excluir Produto"
        message={
          itemToDelete
            ? `Tem certeza que deseja excluir "${itemToDelete.name}" (${formatCurrency(itemToDelete.price)}) do cardápio? Esta ação não pode ser desfeita.`
            : ''
        }
        confirmLabel="Sim, Excluir Produto"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onClose={() => setItemToDelete(null)}
      />

      {/* Reset Menu Confirm Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Restaurar Cardápio Padrão"
        message="Tem certeza que deseja restaurar o cardápio original completo? Quaisquer alterações de itens locais serão reinicializadas para a lista padrão de fábrica."
        confirmLabel="Sim, Restaurar Padrão"
        cancelLabel="Cancelar"
        variant="warning"
        onConfirm={handleConfirmReset}
        onClose={() => setIsResetConfirmOpen(false)}
      />

      {/* Mass Price Adjust Confirm Modal */}
      <ConfirmModal
        isOpen={isMassAdjustConfirmOpen}
        title="Reajuste de Preços"
        message={`Deseja realmente aplicar um reajuste de ${adjustPercent > 0 ? `+${adjustPercent}%` : `${adjustPercent}%`} para ${
          selectedCategory === 'todos'
            ? 'todos os itens do cardápio'
            : `a categoria "${CATEGORIES_LIST.find((c) => c.id === selectedCategory)?.name}"`
        }?`}
        confirmLabel="Confirmar Reajuste"
        cancelLabel="Cancelar"
        variant="warning"
        onConfirm={handleConfirmMassAdjust}
        onClose={() => setIsMassAdjustConfirmOpen(false)}
      />
    </div>
  );
};
