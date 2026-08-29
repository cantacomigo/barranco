import React, { useState } from 'react';
import { Order, StoreSettings } from '../types';
import {
  X,
  Printer,
  Copy,
  Check,
  FileText,
  Settings,
  Volume2,
  Sparkles,
  ArrowRight,
  Flame
} from 'lucide-react';
import { generateMonospaceReceipt, triggerThermalPrint, ReceiptVia } from '../utils/thermalPrinter';
import { ThermalReceiptPrintArea } from './ThermalReceiptPrintArea';
import { formatCurrency } from '../utils/formatters';

interface ThermalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  storeSettings: StoreSettings;
  onUpdateSettings?: (settings: StoreSettings) => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
  storeSettings,
  onUpdateSettings
}) => {
  if (!isOpen || !order) return null;

  const [selectedVia, setSelectedVia] = useState<ReceiptVia>('completa');
  const [copiedText, setCopiedText] = useState(false);
  const [viewMode, setViewMode] = useState<'visual' | 'raw_text'>('visual');

  const handlePrint = () => {
    triggerThermalPrint(order, storeSettings, selectedVia);
  };

  const handleCopyRaw = () => {
    const rawText = generateMonospaceReceipt(order, storeSettings, selectedVia);
    navigator.clipboard.writeText(rawText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const toggleAutoPrint = () => {
    if (onUpdateSettings) {
      onUpdateSettings({
        ...storeSettings,
        autoPrintOrder: !storeSettings.autoPrintOrder
      });
    }
  };

  const toggleCopies = (copies: number) => {
    if (onUpdateSettings) {
      onUpdateSettings({
        ...storeSettings,
        printCopies: copies
      });
    }
  };

  const togglePaperSize = (size: '80mm' | '58mm') => {
    if (onUpdateSettings) {
      onUpdateSettings({
        ...storeSettings,
        printerPaperSize: size
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in no-print">
      <div
        className="bg-zinc-900 border border-zinc-700/80 rounded-3xl w-full max-w-2xl max-h-[94vh] flex flex-col overflow-hidden shadow-2xl relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base sm:text-lg text-white">
                  Impressão Térmica 80mm - Pedido #{order.id}
                </h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded">
                  {storeSettings.printerPaperSize || '80mm'}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Formato padrão para impressoras térmicas ESC/POS (Epson, Elgin, Bematech, POS-80)
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

        {/* Action Toolbar */}
        <div className="p-3 sm:px-5 bg-zinc-950/80 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2.5 shrink-0 text-xs">
          {/* Paper / Via options */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedVia('completa')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                selectedVia === 'completa'
                  ? 'bg-amber-500 text-zinc-950 shadow'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Via Completa
            </button>
            <button
              onClick={() => setSelectedVia('cozinha')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                selectedVia === 'cozinha'
                  ? 'bg-amber-500 text-zinc-950 shadow'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Via Cozinha
            </button>
            <button
              onClick={() => setSelectedVia('entrega')}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                selectedVia === 'entrega'
                  ? 'bg-amber-500 text-zinc-950 shadow'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Via Entrega
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1.5 bg-zinc-800/80 p-1 rounded-xl border border-zinc-700">
            <button
              onClick={() => setViewMode('visual')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                viewMode === 'visual'
                  ? 'bg-zinc-900 text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Cupom Gráfico
            </button>
            <button
              onClick={() => setViewMode('raw_text')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                viewMode === 'raw_text'
                  ? 'bg-zinc-900 text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Texto Puro ESC/POS
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-zinc-200 flex-1">
          {/* Quick Config Banner */}
          <div className="bg-zinc-800/60 border border-zinc-700/80 rounded-2xl p-3 sm:p-4 text-xs space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-amber-400" />
                Configurações da Impressora Térmica:
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleAutoPrint}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] border transition ${
                    storeSettings.autoPrintOrder
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                  }`}
                >
                  {storeSettings.autoPrintOrder ? '⚡ Auto-Impressão: ATIVADA' : 'Auto-Impressão: Desativada'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-zinc-300">
              <div className="flex items-center gap-2 bg-zinc-900/60 p-2 rounded-xl border border-zinc-800">
                <span className="text-zinc-400">Largura:</span>
                <button
                  onClick={() => togglePaperSize('80mm')}
                  className={`px-2 py-0.5 rounded font-bold ${
                    storeSettings.printerPaperSize === '80mm'
                      ? 'bg-amber-500 text-zinc-950'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  80mm (Padrão)
                </button>
                <button
                  onClick={() => togglePaperSize('58mm')}
                  className={`px-2 py-0.5 rounded font-bold ${
                    storeSettings.printerPaperSize === '58mm'
                      ? 'bg-amber-500 text-zinc-950'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  58mm
                </button>
              </div>

              <div className="flex items-center gap-2 bg-zinc-900/60 p-2 rounded-xl border border-zinc-800">
                <span className="text-zinc-400">Vias:</span>
                <button
                  onClick={() => toggleCopies(1)}
                  className={`px-2 py-0.5 rounded font-bold ${
                    storeSettings.printCopies === 1
                      ? 'bg-amber-500 text-zinc-950'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  1 Via
                </button>
                <button
                  onClick={() => toggleCopies(2)}
                  className={`px-2 py-0.5 rounded font-bold ${
                    storeSettings.printCopies === 2
                      ? 'bg-amber-500 text-zinc-950'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  2 Vias (Cozinha + Entrega)
                </button>
              </div>

              <div className="flex items-center justify-between bg-zinc-900/60 p-2 rounded-xl border border-zinc-800">
                <span className="text-zinc-400">Alerta Sonoro:</span>
                <span className="font-bold text-emerald-400">🔊 Ativo (Beep POS)</span>
              </div>
            </div>
          </div>

          {/* Receipt Preview Canvas */}
          {viewMode === 'visual' ? (
            <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-4 sm:p-6 flex justify-center shadow-inner overflow-x-auto">
              <div className="bg-white rounded-lg shadow-2xl p-4 border border-zinc-300 text-black">
                <ThermalReceiptPrintArea
                  order={order}
                  storeSettings={storeSettings}
                  via={selectedVia}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-zinc-400">
                <span>Visualização do texto formatado em 48 colunas mono:</span>
                <button
                  onClick={handleCopyRaw}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copiado para o Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Texto ESC/POS</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-emerald-400 font-mono text-xs overflow-x-auto max-h-96 whitespace-pre leading-relaxed shadow-inner">
                {generateMonospaceReceipt(order, storeSettings, selectedVia)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-950 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            onClick={handleCopyRaw}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition"
          >
            <Copy className="w-4 h-4" />
            <span>{copiedText ? 'Copiado!' : 'Copiar Texto Puro'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2.5 rounded-xl text-xs font-semibold transition"
            >
              Fechar
            </button>

            <button
              onClick={handlePrint}
              id="btn-trigger-print-modal"
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black px-6 py-2.5 rounded-xl shadow-lg shadow-orange-950/60 flex items-center gap-2 text-xs sm:text-sm transition active:scale-[0.98] cursor-pointer"
            >
              <Printer className="w-4.5 h-4.5" />
              <span>Imprimir Agora (80mm)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
