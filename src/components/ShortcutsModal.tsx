import React from 'react';
import { Command, X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '1, 2, 3, 4, 5', description: 'Selecciona la calificación Likert (1 = Desacuerdo, 5 = Acuerdo)' },
    { key: '0', description: 'Marca la opción N/A (No aplica / no he utilizado)' },
    { key: 'Enter ↵', description: 'Avanza a la siguiente categoría o envía formulario' },
    { key: 'Alt + ←', description: 'Regresa a la categoría anterior' },
    { key: 'Ctrl + S', description: 'Guarda un borrador localmente en el navegador (Mandel UX-02)' },
    { key: 'Ctrl + Z', description: 'Deshace la última calificación seleccionada (Mandel UX-02)' },
    { key: '?', description: 'Abre o cierra esta ventana de atajos de teclado' },
    { key: 'Esc', description: 'Cierra ventanas modales abiertas' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-modal-title"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Keyboard className="w-5 h-5 text-blue-400" />
            <h3 id="shortcuts-modal-title" className="text-sm font-bold text-white">
              Atajos de Teclado del Sistema
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="p-6 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between gap-4">
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                {s.description}
              </span>
              <kbd className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap shadow-xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 text-center">
          Cumple con la Regla de Oro 3 de Mandel (Consistencia Operativa y Accesibilidad por Teclado).
        </div>
      </div>
    </div>
  );
};
