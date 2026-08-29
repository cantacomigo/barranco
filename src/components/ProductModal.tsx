import React, { useState, useEffect } from 'react';
import { MenuItem, SelectedItemOption, FlavorOption, ExtraOption } from '../types';
import { X, Plus, Minus, Check, Flame, Sparkles, AlertCircle, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface ProductModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (item: MenuItem, quantity: number, options: SelectedItemOption) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  item,
  onClose,
  onAddToCart
}) => {
  if (!item) return null;

  const [quantity, setQuantity] = useState(1);
  const [selectedDoneness, setSelectedDoneness] = useState<string>(
    item.allowedDoneness ? 'Ao Ponto (Mais Suculento)' : ''
  );
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<{ id: string; name: string; price: number }[]>([]);
  const [selectedExclusions, setSelectedExclusions] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>(
    item.sizes && item.sizes.length > 0 ? item.sizes[0].name : ''
  );
  const [notes, setNotes] = useState('');

  // Reset or set defaults when item opens
  useEffect(() => {
    setQuantity(1);
    setSelectedDoneness(item.allowedDoneness ? 'Ao Ponto (Mais Suculento)' : '');
    setSelectedFlavors(
      item.flavorsAvailable && item.flavorsAvailable.length > 0
        ? [item.flavorsAvailable[0].name]
        : []
    );
    setSelectedExtras([]);
    setSelectedExclusions([]);
    setSelectedSize(item.sizes && item.sizes.length > 0 ? item.sizes[0].name : '');
    setNotes('');
  }, [item]);

  // Calculate Unit Price based on sizes & extras
  let basePrice = item.price;
  if (item.sizes && selectedSize) {
    const sizeObj = item.sizes.find((s) => s.name === selectedSize);
    if (sizeObj) {
      basePrice = item.price * sizeObj.priceMultiplier;
    }
  }

  const extrasSum = selectedExtras.reduce((acc, curr) => acc + curr.price, 0);
  const unitPrice = basePrice + extrasSum;
  const totalPrice = unitPrice * quantity;

  const maxFlavors = item.maxFreeFlavors || 1;

  const toggleFlavor = (flavorName: string) => {
    if (selectedFlavors.includes(flavorName)) {
      setSelectedFlavors(selectedFlavors.filter((f) => f !== flavorName));
    } else {
      if (selectedFlavors.length >= maxFlavors) {
        // If single selection limit, replace; otherwise add up to limit
        if (maxFlavors === 1) {
          setSelectedFlavors([flavorName]);
        }
      } else {
        setSelectedFlavors([...selectedFlavors, flavorName]);
      }
    }
  };

  const toggleExtra = (extra: ExtraOption) => {
    const exists = selectedExtras.some((e) => e.id === extra.id);
    if (exists) {
      setSelectedExtras(selectedExtras.filter((e) => e.id !== extra.id));
    } else {
      setSelectedExtras([...selectedExtras, { id: extra.id, name: extra.name, price: extra.price }]);
    }
  };

  const toggleExclusion = (excl: string) => {
    if (selectedExclusions.includes(excl)) {
      setSelectedExclusions(selectedExclusions.filter((e) => e !== excl));
    } else {
      setSelectedExclusions([...selectedExclusions, excl]);
    }
  };

  const handleConfirm = () => {
    const options: SelectedItemOption = {
      doneness: selectedDoneness || undefined,
      selectedFlavors,
      selectedExtras,
      selectedExclusions,
      selectedSize: selectedSize || undefined,
      notes: notes.trim() || undefined
    };

    onAddToCart(item, quantity, options);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div
        className="bg-zinc-900 border border-zinc-700/80 rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header & Hero Image */}
        <div className="relative h-48 sm:h-56 w-full bg-zinc-950 shrink-0">
          <img
            src={item.image}
            alt={item.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-black/60" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/70 hover:bg-black text-white p-2 rounded-full backdrop-blur-md transition cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge & Title in Image */}
          <div className="absolute bottom-3 left-4 right-4">
            {item.badge && (
              <span className="inline-flex items-center gap-1 bg-amber-500 text-zinc-950 font-black text-xs px-2.5 py-0.5 rounded-md mb-1.5 uppercase">
                <Flame className="w-3 h-3 fill-current" />
                {item.badge}
              </span>
            )}
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
              {item.name}
            </h2>
          </div>
        </div>

        {/* Scrollable Customization Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 divide-y divide-zinc-800 text-zinc-200">
          {/* Description */}
          <div>
            <p className="text-sm text-zinc-300 leading-relaxed">{item.description}</p>
          </div>

          {/* Tamanhos (Se disponível) */}
          {item.sizes && item.sizes.length > 0 && (
            <div className="pt-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Escolha o Tamanho da Porção</span>
                  <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">
                    Obrigatório
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {item.sizes.map((sz) => {
                  const isSelected = selectedSize === sz.name;
                  const calculatedPrice = item.price * sz.priceMultiplier;
                  return (
                    <button
                      key={sz.name}
                      type="button"
                      onClick={() => setSelectedSize(sz.name)}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-amber-200 ring-1 ring-amber-500'
                          : 'bg-zinc-800/80 border-zinc-700 hover:border-zinc-600 text-zinc-300'
                      }`}
                    >
                      <div className="font-bold text-xs sm:text-sm">{sz.name}</div>
                      {sz.description && (
                        <div className="text-[11px] text-zinc-400 mt-0.5">{sz.description}</div>
                      )}
                      <div className="text-xs font-black text-amber-400 mt-2">
                        {formatCurrency(calculatedPrice)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ponto da Carne (Para Hamburgueres) */}
          {item.allowedDoneness && (
            <div className="pt-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Ponto da Carne na Brasa</span>
                  <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">
                    Obrigatório
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { label: 'Ao Ponto', sub: 'Rosada no centro e bem suculenta (Recomendado)' },
                  { label: 'Bem Passada', sub: 'Totalmente cozida e selada na chapa' },
                  { label: 'Ao Ponto p/ Mal', sub: 'Centro avermelhado ultra macio' }
                ].map((don) => {
                  const isSelected = selectedDoneness.includes(don.label);
                  return (
                    <button
                      key={don.label}
                      type="button"
                      onClick={() => setSelectedDoneness(don.label)}
                      className={`p-2.5 rounded-xl border text-left transition ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-amber-200 ring-1 ring-amber-500'
                          : 'bg-zinc-800/80 border-zinc-700 hover:border-zinc-600 text-zinc-300'
                      }`}
                    >
                      <div className="font-bold text-xs">{don.label}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5 line-clamp-2">{don.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Molhos e Sabores Inclusos para Escolha */}
          {item.flavorsAvailable && item.flavorsAvailable.length > 0 && (
            <div className="pt-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Escolha seu Molho / Sabor Especial</span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                    Grátis (Até {maxFlavors})
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {item.flavorsAvailable.map((flavor) => {
                  const isSelected = selectedFlavors.includes(flavor.name);
                  return (
                    <button
                      key={flavor.id}
                      type="button"
                      onClick={() => toggleFlavor(flavor.name)}
                      className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-amber-200'
                          : 'bg-zinc-800/80 border-zinc-700 hover:border-zinc-600 text-zinc-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-md mt-0.5 flex items-center justify-center text-xs shrink-0 ${
                          isSelected ? 'bg-amber-500 text-zinc-950' : 'border border-zinc-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-100 flex items-center gap-1.5">
                          <span>{flavor.name}</span>
                          {flavor.tag && (
                            <span className="text-[10px] bg-zinc-700 text-amber-300 px-1.5 py-0.2 rounded">
                              {flavor.tag}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2">
                          {flavor.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Adicionais Pagos (Extras) */}
          {item.availableExtras && item.availableExtras.length > 0 && (
            <div className="pt-4 space-y-2.5">
              <label className="text-sm font-bold text-white block">
                Deseja Turbinar seu Pedido? (Opcional)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {item.availableExtras.map((extra) => {
                  const isSelected = selectedExtras.some((e) => e.id === extra.id);
                  return (
                    <button
                      key={extra.id}
                      type="button"
                      onClick={() => toggleExtra(extra)}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-amber-200'
                          : 'bg-zinc-800/80 border-zinc-700 hover:border-zinc-600 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center text-xs ${
                            isSelected ? 'bg-amber-500 text-zinc-950' : 'border border-zinc-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-medium text-zinc-200">{extra.name}</span>
                      </div>
                      <span className="text-xs font-black text-amber-400 ml-2 whitespace-nowrap">
                        +{formatCurrency(extra.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Remover Ingredientes (Exclusões) */}
          {item.availableExclusions && item.availableExclusions.length > 0 && (
            <div className="pt-4 space-y-2.5">
              <label className="text-sm font-bold text-white block">
                Remover Algum Ingrediente?
              </label>

              <div className="flex flex-wrap gap-2">
                {item.availableExclusions.map((excl) => {
                  const isSelected = selectedExclusions.includes(excl);
                  return (
                    <button
                      key={excl}
                      type="button"
                      onClick={() => toggleExclusion(excl)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-red-950/80 border-red-500 text-red-300 line-through'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600'
                      }`}
                    >
                      <span>Sem {excl}</span>
                      {isSelected && <X className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Observações Gerais */}
          <div className="pt-4 space-y-2">
            <label className="text-sm font-bold text-white block">
              Observações Especiais para a Cozinha:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Pão bem quentinho, cortar ao meio, caprichar no guardanapo..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>
        </div>

        {/* Bottom Bar: Quantity & Add Button */}
        <div className="p-4 sm:p-5 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between gap-3 shrink-0">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-xl p-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 disabled:opacity-40 transition"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-7 text-center font-black text-sm text-white">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Submit Button */}
          <button
            onClick={handleConfirm}
            id="btn-confirm-add-cart"
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black py-3 px-4 rounded-xl shadow-lg shadow-orange-950/50 flex items-center justify-between gap-2 transition active:scale-[0.98] cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span className="text-xs sm:text-sm">Adicionar ao Pedido</span>
            </div>
            <span className="text-sm sm:text-base font-black bg-black/25 px-2.5 py-1 rounded-lg">
              {formatCurrency(totalPrice)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
