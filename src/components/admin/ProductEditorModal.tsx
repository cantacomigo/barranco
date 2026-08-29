import React, { useState, useEffect } from 'react';
import { MenuItem, CategoryId } from '../../types';
import { X, Image as ImageIcon, Flame, Sparkles, Check, DollarSign, Clock, Users } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface ProductEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit: MenuItem | null;
  onSave: (item: MenuItem) => void;
  categories: { id: CategoryId; name: string }[];
}

const PRESET_IMAGES = [
  { name: 'Burger Clássico', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80' },
  { name: 'Burger Duplo Cheddar', url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80' },
  { name: 'Burger Bacon Salada', url: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=800&q=80' },
  { name: 'Burger Artesanal Especial', url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80' },
  { name: 'Frango Grelhado', url: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=800&q=80' },
  { name: 'Calabresa / Lombo', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80' },
  { name: 'Hot Dog Especial', url: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=800&q=80' },
  { name: 'Misto / Bauru', url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80' },
  { name: 'Picanha / Filé', url: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80' },
  { name: 'Batata Cheddar & Bacon', url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80' },
  { name: 'Frango a Passarinho / Iscas', url: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80' },
  { name: 'Pastéis Crocantes', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80' },
  { name: 'Refrigerante Gelado', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80' },
  { name: 'Suco Natural', url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80' },
  { name: 'Cerveja Gelada', url: 'https://images.unsplash.com/photo-1608270199042-45218d6e326c?auto=format&fit=crop&w=800&q=80' },
  { name: 'Petit Gâteau / Sobremesa', url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80' }
];

export const ProductEditorModal: React.FC<ProductEditorModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
  onSave,
  categories
}) => {
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    category: 'hamburguer',
    description: '',
    price: 25.00,
    originalPrice: undefined,
    image: PRESET_IMAGES[0].url,
    badge: '',
    isPopular: false,
    isVegetarian: false,
    available: true,
    allowedDoneness: true,
    preparationTime: '15-20 min',
    serves: '1 pessoa'
  });

  useEffect(() => {
    if (itemToEdit) {
      setFormData({ ...itemToEdit });
    } else {
      setFormData({
        id: `item-${Date.now()}`,
        name: '',
        category: 'hamburguer',
        description: '',
        price: 25.00,
        originalPrice: undefined,
        image: PRESET_IMAGES[0].url,
        badge: '',
        isPopular: false,
        isVegetarian: false,
        available: true,
        allowedDoneness: true,
        preparationTime: '15-20 min',
        serves: '1 pessoa'
      });
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.price || formData.price <= 0) {
      alert('Por favor, preencha o nome e um preço válido para o produto.');
      return;
    }

    const finalItem: MenuItem = {
      id: formData.id || `item-${Date.now()}`,
      name: formData.name.trim(),
      category: formData.category || 'hamburguer',
      description: formData.description?.trim() || '',
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      image: formData.image?.trim() || PRESET_IMAGES[0].url,
      badge: formData.badge?.trim() || undefined,
      isPopular: !!formData.isPopular,
      isVegetarian: !!formData.isVegetarian,
      available: formData.available !== false,
      allowedDoneness: !!formData.allowedDoneness,
      preparationTime: formData.preparationTime?.trim() || '15-20 min',
      serves: formData.serves?.trim() || undefined,
      availableExtras: formData.availableExtras,
      availableExclusions: formData.availableExclusions
    };

    onSave(finalItem);
    onClose();
  };

  const hasDiscount = formData.originalPrice && formData.originalPrice > (formData.price || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in no-print">
      <div
        className="bg-zinc-900 border border-zinc-700/80 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-lg text-white">
                {itemToEdit ? 'Editar Produto do Cardápio' : 'Cadastrar Novo Produto'}
              </h2>
              <p className="text-xs text-zinc-400">
                Preencha os dados e fotos do item para disponibilizar aos clientes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-xl text-zinc-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 text-zinc-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Nome do Produto *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: X Tudo Especial Brasa"
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Categoria */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Categoria do Cardápio *</label>
              <select
                value={formData.category || 'hamburguer'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as CategoryId })}
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                {categories
                  .filter((c) => c.id !== 'todos')
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Selo / Badge */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Selo Promocional (Badge)</label>
              <input
                type="text"
                value={formData.badge || ''}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="Ex: Mais Vendido, Top 1, Especial"
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Preço de Venda */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Preço de Venda (R$) *</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400">
                  R$
                </span>
                <input
                  type="number"
                  step="0.10"
                  min="0.50"
                  required
                  value={formData.price ?? ''}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Preço Original (De/Por) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Preço Original De (Opcional - R$)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                  R$
                </span>
                <input
                  type="number"
                  step="0.10"
                  min="0"
                  value={formData.originalPrice ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      originalPrice: e.target.value ? parseFloat(e.target.value) : undefined
                    })
                  }
                  placeholder="Ex: 35.00 (mostra desconto)"
                  className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Descrição */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Descrição e Ingredientes</label>
              <textarea
                rows={2}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Pão brioche selado na chapa, hambúrguer 150g suculento, queijo duplo, bacon crocante..."
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* URL da Imagem */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                <span>URL da Imagem do Produto</span>
                <span className="text-[11px] text-amber-400 font-normal">Ou clique em uma foto abaixo</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={formData.image || ''}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 bg-zinc-800/80 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
                {formData.image && (
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-zinc-700 shrink-0 bg-zinc-950">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Galeria de Fotos Rápidas */}
              <div className="pt-2">
                <span className="text-[11px] text-zinc-400 block mb-1.5 font-medium">Fotos Rápidas Prontas:</span>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {PRESET_IMAGES.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, image: img.url })}
                      className={`relative w-16 h-12 rounded-lg overflow-hidden border shrink-0 transition group cursor-pointer ${
                        formData.image === img.url
                          ? 'border-amber-500 ring-2 ring-amber-500/50'
                          : 'border-zinc-700 hover:border-zinc-500'
                      }`}
                      title={img.name}
                    >
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <span className="text-[9px] text-white font-bold text-center leading-none px-0.5">
                          {img.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tempo de preparo & Porção */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Tempo Médio de Preparo</label>
              <input
                type="text"
                value={formData.preparationTime || ''}
                onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                placeholder="Ex: 15-20 min"
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">Porção / Serve (Opcional)</label>
              <input
                type="text"
                value={formData.serves || ''}
                onChange={(e) => setFormData({ ...formData, serves: e.target.value })}
                placeholder="Ex: Serve 1 pessoa, Serve 2-3 pessoas"
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Opções Booleanas */}
            <div className="md:col-span-2 bg-zinc-950/70 border border-zinc-800 rounded-2xl p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2.5 text-xs text-zinc-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.available !== false}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 accent-amber-500"
                />
                <div>
                  <span className="font-bold block">Produto Disponível no Cardápio</span>
                  <span className="text-[11px] text-zinc-400">Se desmarcado, fica pausado/esgotado</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-zinc-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!!formData.allowedDoneness}
                  onChange={(e) => setFormData({ ...formData, allowedDoneness: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 accent-amber-500"
                />
                <div>
                  <span className="font-bold block">Permitir Escolha do Ponto</span>
                  <span className="text-[11px] text-zinc-400">Ao ponto, bem passado, etc.</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-zinc-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!!formData.isPopular}
                  onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 accent-amber-500"
                />
                <div>
                  <span className="font-bold block">Destacar como Popular</span>
                  <span className="text-[11px] text-zinc-400">Aparece no filtro de destaques</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-zinc-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!!formData.isVegetarian}
                  onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 accent-emerald-500"
                />
                <div>
                  <span className="font-bold block">Opção Vegetariana (Veggie)</span>
                  <span className="text-[11px] text-zinc-400">Recebe selo de planta 🌱</span>
                </div>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-orange-950/40 transition active:scale-95 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{itemToEdit ? 'Salvar Alterações' : 'Cadastrar no Cardápio'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
