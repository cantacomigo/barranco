import React, { useState } from 'react';
import { FlavorOption } from '../../types';
import { COMMON_FLAVORS } from '../../data/menu';
import {
  ChefHat,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Flame,
  Droplet,
  RotateCcw,
  Search,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  Info
} from 'lucide-react';
import { ConfirmModal } from '../ConfirmModal';

interface AdminSaucesManagerProps {
  flavors: FlavorOption[];
  onUpdateFlavors: (newFlavors: FlavorOption[]) => void;
}

const PRESET_TAGS = [
  'Mais Pedido',
  'Clássico',
  'Defumado',
  'Agridoce',
  'Cremoso',
  'Gourmet',
  'Especial',
  'Refrescante',
  'Picante',
  'Artesanal'
];

export const AdminSaucesManager: React.FC<AdminSaucesManagerProps> = ({
  flavors,
  onUpdateFlavors
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpice, setFilterSpice] = useState<string>('all');

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    tag: string;
    spiceLevel: 0 | 1 | 2 | 3;
  }>({
    name: '',
    description: '',
    tag: 'Artesanal',
    spiceLevel: 0
  });

  // Modal States
  const [sauceToDelete, setSauceToDelete] = useState<FlavorOption | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleStartEdit = (flavor: FlavorOption) => {
    setEditingId(flavor.id);
    setFormData({
      name: flavor.name,
      description: flavor.description,
      tag: flavor.tag || '',
      spiceLevel: (flavor.spiceLevel ?? 0) as 0 | 1 | 2 | 3
    });
    // Scroll to form smoothly
    const formElement = document.getElementById('sauce-form-section');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      tag: 'Artesanal',
      spiceLevel: 0
    });
  };

  const handleSaveSauce = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showFeedback('Por favor, informe o nome do molho/sabor.', 'error');
      return;
    }
    if (!formData.description.trim()) {
      showFeedback('Por favor, descreva os ingredientes ou sabor do molho.', 'error');
      return;
    }

    if (editingId) {
      // Update existing sauce
      const updated = flavors.map((f) =>
        f.id === editingId
          ? {
              ...f,
              name: formData.name.trim(),
              description: formData.description.trim(),
              tag: formData.tag.trim() || undefined,
              spiceLevel: formData.spiceLevel
            }
          : f
      );
      onUpdateFlavors(updated);
      showFeedback(`Molho "${formData.name}" atualizado com sucesso!`);
      handleCancelEdit();
    } else {
      // Create new sauce
      const newId = `molho_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newFlavor: FlavorOption = {
        id: newId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        tag: formData.tag.trim() || undefined,
        spiceLevel: formData.spiceLevel
      };
      onUpdateFlavors([...flavors, newFlavor]);
      showFeedback(`Novo molho "${formData.name}" adicionado ao cardápio!`);
      setFormData({
        name: '',
        description: '',
        tag: 'Artesanal',
        spiceLevel: 0
      });
    }
  };

  const handleConfirmDelete = () => {
    if (sauceToDelete) {
      const filtered = flavors.filter((f) => f.id !== sauceToDelete.id);
      onUpdateFlavors(filtered);
      showFeedback(`Molho "${sauceToDelete.name}" foi excluído.`);
      if (editingId === sauceToDelete.id) {
        handleCancelEdit();
      }
      setSauceToDelete(null);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= flavors.length) return;

    const newArr = [...flavors];
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;
    onUpdateFlavors(newArr);
  };

  const handleResetToDefaults = () => {
    onUpdateFlavors([...COMMON_FLAVORS]);
    showFeedback('Molhos e sabores restaurados para a lista original de fábrica!');
    setIsResetModalOpen(false);
  };

  const filteredFlavors = flavors.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.tag && f.tag.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterSpice === 'all') return matchesSearch;
    if (filterSpice === 'mild') return matchesSearch && (!f.spiceLevel || f.spiceLevel === 0);
    if (filterSpice === 'spicy') return matchesSearch && (f.spiceLevel || 0) > 0;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-amber-400" />
              <span>Gerenciador de Molhos & Sabores da Casa</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
              Adicione, edite, reorganize e <strong>exclua</strong> os molhos artesanais disponibilizados no Catálogo de Molhos e nas opções de personalização dos lanches.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-300 border border-zinc-700/80 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer self-start sm:self-auto shrink-0"
            title="Restaurar lista de molhos original de fábrica"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Originais</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedbackMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between animate-fade-in ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/15 border border-red-500/30 text-red-300'
            }`}
          >
            <span>{feedbackMessage.text}</span>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="text-zinc-400 hover:text-white font-bold ml-2"
            >
              ×
            </button>
          </div>
        )}

        {/* Add / Edit Sauce Form */}
        <form
          id="sauce-form-section"
          onSubmit={handleSaveSauce}
          className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            editingId
              ? 'bg-amber-500/5 border-amber-500/40 shadow-lg shadow-amber-950/20'
              : 'bg-zinc-900/90 border-zinc-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              {editingId ? (
                <>
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editando Molho: {formData.name}</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Cadastrar Novo Molho Artesanal</span>
                </>
              )}
            </div>

            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer bg-zinc-800 px-2.5 py-1 rounded-lg"
              >
                <X className="w-3 h-3" />
                <span>Cancelar Edição</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
            {/* Nome */}
            <div className="sm:col-span-5 space-y-1">
              <label className="text-[11px] font-bold text-zinc-300">
                Nome do Molho / Sabor *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Molho Especial de Alho Negro"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Tag / Selo */}
            <div className="sm:col-span-4 space-y-1">
              <label className="text-[11px] font-bold text-zinc-300">
                Selo / Tag de Destaque
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ex: Mais Pedido, Clássico..."
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              {/* Quick tags pills */}
              <div className="flex flex-wrap gap-1 pt-1">
                {PRESET_TAGS.slice(0, 5).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData({ ...formData, tag: t })}
                    className="text-[9px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-amber-300 px-1.5 py-0.5 rounded border border-zinc-700/60 cursor-pointer"
                  >
                    +{t}
                  </button>
                ))}
              </div>
            </div>

            {/* Nível de Pimenta */}
            <div className="sm:col-span-3 space-y-1">
              <label className="text-[11px] font-bold text-zinc-300">
                Nível de Picância
              </label>
              <select
                value={formData.spiceLevel}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    spiceLevel: Number(e.target.value) as 0 | 1 | 2 | 3
                  })
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
              >
                <option value={0}>Suave / Sem Pimenta 💧</option>
                <option value={1}>Levemente Picante 🌶️ (Nível 1)</option>
                <option value={2}>Picante Moderado 🌶️🌶️ (Nível 2)</option>
                <option value={3}>Super Picante 🔥 (Nível 3)</option>
              </select>
            </div>

            {/* Descrição */}
            <div className="sm:col-span-9 space-y-1">
              <label className="text-[11px] font-bold text-zinc-300">
                Descrição dos Ingredientes & Receita *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: À base de maionese artesanal defumada com especiarias secretas e toque de limão siciliano."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Submit Button */}
            <div className="sm:col-span-3 flex items-end">
              <button
                type="submit"
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition shadow cursor-pointer ${
                  editingId
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-zinc-950 shadow-emerald-950/40'
                    : 'bg-amber-500 hover:bg-amber-600 text-zinc-950 shadow-amber-950/40'
                }`}
              >
                {editingId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{editingId ? 'Salvar Alterações' : 'Adicionar Molho'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Search, Filter & List Header */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center justify-between border-t border-zinc-800/80">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar molho por nome ou sabor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setFilterSpice('all')}
              className={`px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                filterSpice === 'all'
                  ? 'bg-amber-500 text-zinc-950 font-bold border-amber-500'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400'
              }`}
            >
              Todos ({flavors.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterSpice('mild')}
              className={`px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                filterSpice === 'mild'
                  ? 'bg-amber-500 text-zinc-950 font-bold border-amber-500'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400'
              }`}
            >
              Suaves
            </button>
            <button
              type="button"
              onClick={() => setFilterSpice('spicy')}
              className={`px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                filterSpice === 'spicy'
                  ? 'bg-red-500 text-white font-bold border-red-500'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400'
              }`}
            >
              🌶️ Picantes
            </button>
          </div>
        </div>

        {/* Sauces Cards Grid */}
        <div className="space-y-3 pt-1">
          {filteredFlavors.length === 0 ? (
            <div className="p-8 text-center bg-zinc-900/50 rounded-2xl border border-zinc-800/80 text-zinc-500 space-y-2">
              <ChefHat className="w-8 h-8 mx-auto text-zinc-600" />
              <p className="text-sm font-bold text-zinc-400">Nenhum molho encontrado</p>
              <p className="text-xs">Cadastre um novo molho utilizando o formulário acima.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredFlavors.map((flavor, index) => {
                const originalIndex = flavors.findIndex((f) => f.id === flavor.id);
                return (
                  <div
                    key={flavor.id}
                    className={`bg-zinc-900/90 border rounded-2xl p-4 transition-all flex flex-col justify-between space-y-3 relative group ${
                      editingId === flavor.id
                        ? 'border-amber-500 bg-amber-500/5 shadow-md'
                        : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {/* Top Row: Index, Name, Tag & Action Buttons */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 text-xs flex items-center justify-center font-mono font-bold shrink-0">
                            {String(originalIndex + 1).padStart(2, '0')}
                          </span>
                          <h4 className="font-bold text-white text-sm truncate">
                            {flavor.name}
                          </h4>
                        </div>

                        {flavor.tag && (
                          <span className="bg-zinc-800 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase shrink-0">
                            {flavor.tag}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed">
                        {flavor.description}
                      </p>
                    </div>

                    {/* Bottom Row: Spice badge & Management Controls */}
                    <div className="pt-2.5 border-t border-zinc-800 flex items-center justify-between gap-2 text-xs">
                      <div>
                        {(flavor.spiceLevel ?? 0) > 0 ? (
                          <span className="inline-flex items-center gap-1 bg-red-500/15 border border-red-500/30 text-red-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <Flame className="w-3 h-3 text-red-400" />
                            {flavor.spiceLevel === 1 && 'Levemente Picante'}
                            {flavor.spiceLevel === 2 && 'Picante Moderado'}
                            {flavor.spiceLevel === 3 && 'Super Picante 🔥'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <Droplet className="w-3 h-3 text-sky-400" />
                            <span>Suave & Equilibrado</span>
                          </span>
                        )}
                      </div>

                      {/* Action buttons (Edit, Reorder, Delete) */}
                      <div className="flex items-center gap-1">
                        {/* Order buttons */}
                        <button
                          type="button"
                          disabled={originalIndex === 0}
                          onClick={() => handleMove(originalIndex, 'up')}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                          title="Mover para cima"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={originalIndex === flavors.length - 1}
                          onClick={() => handleMove(originalIndex, 'down')}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                          title="Mover para baixo"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>

                        {/* Edit button */}
                        <button
                          type="button"
                          onClick={() => handleStartEdit(flavor)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-amber-500/20 text-zinc-400 hover:text-amber-300 border border-zinc-700 transition cursor-pointer flex items-center gap-1 text-[11px] font-bold px-2"
                          title="Editar molho"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span className="hidden sm:inline">Editar</span>
                        </button>

                        {/* Delete button (Excluir molho) */}
                        <button
                          type="button"
                          onClick={() => setSauceToDelete(flavor)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-950/80 text-zinc-400 hover:text-red-400 border border-zinc-700 hover:border-red-500/40 transition cursor-pointer flex items-center gap-1 text-[11px] font-bold px-2"
                          title="Excluir molho do cardápio"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span className="hidden sm:inline">Excluir</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!sauceToDelete}
        title="Excluir Molho / Sabor"
        message={
          sauceToDelete
            ? `Tem certeza que deseja excluir o molho "${sauceToDelete.name}"? Ele será removido imediatamente do Catálogo de Molhos e das opções de personalização de lanches.`
            : ''
        }
        confirmLabel="Sim, Excluir Molho"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onClose={() => setSauceToDelete(null)}
      />

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetModalOpen}
        title="Restaurar Opções Originais"
        message="Deseja restaurar a lista de acompanhamentos e molhos para os sabores originais do Caseiros da Larissa? Quaisquer itens adicionados manualmente serão redefinidos."
        confirmLabel="Sim, Restaurar"
        cancelLabel="Cancelar"
        variant="warning"
        onConfirm={handleResetToDefaults}
        onClose={() => setIsResetModalOpen(false)}
      />
    </div>
  );
};
