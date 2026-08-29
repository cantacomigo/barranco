import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Sim, Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-scale-up text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                variant === 'danger'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : variant === 'warning'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
              }`}
            >
              {variant === 'danger' ? (
                <Trash2 className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white leading-tight">{title}</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{message}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition shadow-lg cursor-pointer flex items-center gap-1.5 ${
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-950/50'
                : variant === 'warning'
                ? 'bg-amber-500 hover:bg-amber-600 text-zinc-950 shadow-amber-950/50'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {variant === 'danger' && <Trash2 className="w-3.5 h-3.5" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
