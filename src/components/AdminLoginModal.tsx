import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, AlertCircle, X, KeyRound, School } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { email: string; name: string; role: string }) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      // Valid credentials or demo evaluator
      if (
        (email.trim().toLowerCase() === 'admin@unicordoba.edu.co' && password === 'Admin2026*') ||
        (email.trim().toLowerCase() === 'evaluador@unicordoba.edu.co' && password === 'evaluador')
      ) {
        onLoginSuccess({
          email: email.trim().toLowerCase(),
          name: email.includes('evaluador') ? 'Prof. Raúl Toscano Miranda' : 'Administrador del Sistema',
          role: 'Docente Evaluador / Directivo',
        });
        setIsLoading(false);
      } else {
        setError('Credenciales incorrectas. Verifique su correo institucional y contraseña.');
        setIsLoading(false);
      }
    }, 400);
  };

  const handleDemoEvaluator = () => {
    setEmail('evaluador@unicordoba.edu.co');
    setPassword('evaluador');
    setError(null);
    onLoginSuccess({
      email: 'evaluador@unicordoba.edu.co',
      name: 'Prof. Raúl Toscano Miranda',
      role: 'Docente Evaluador (Depto. Informática Educativa)',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Lock className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h3 id="login-modal-title" className="text-base font-bold text-white tracking-tight">
                Acceso al Panel Institucional
              </h3>
              <p className="text-[11px] text-blue-200">
                Universidad de Córdoba • Informática Educativa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            El acceso a las métricas agregadas, datos confidenciales y exportación de informes está protegido para uso exclusivo del cuerpo directivo y docente evaluador.
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Correo Institucional:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="ej. rtoscano@unicordoba.edu.co"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contraseña de Acceso:
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              {isLoading ? 'Verificando...' : 'Iniciar Sesión Institucional'}
            </button>
          </form>

          {/* Quick Evaluator Access button for testing */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={handleDemoEvaluator}
              className="w-full py-2 px-3 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-200 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors flex items-center justify-center gap-2"
            >
              <School className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Acceso Rápido: Prof. Raúl Toscano Miranda (Evaluador)
            </button>
            <div className="text-[10px] text-center text-slate-400 mt-1.5 font-mono">
              Credenciales: admin@unicordoba.edu.co / Admin2026*
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
