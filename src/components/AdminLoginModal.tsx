import React, { useState } from 'react';
import { getIdTokenResult, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { AlertCircle, KeyRound, Lock, Mail, ShieldCheck, X } from 'lucide-react';
import { auth } from '../firebase';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { email: string; name: string; role: string }) => void;
  onDemoAccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onDemoAccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setPassword('');
    setError(null);
    onClose();
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const token = await getIdTokenResult(credential.user, true);

      if (token.claims.admin !== true) {
        await signOut(auth);
        throw new Error('Admin access is not enabled for this account.');
      }

      onLoginSuccess({
        email: credential.user.email ?? email.trim(),
        name: credential.user.displayName || 'Administrador',
        role: 'Administrador',
      });
      setPassword('');
    } catch {
      setError('No fue posible iniciar sesión con permisos administrativos. Verifica los datos o solicita acceso al administrador.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overscroll-contain bg-slate-950/70 p-3 backdrop-blur-sm sm:p-4">
      <div
        className="my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:max-h-[calc(100dvh-2rem)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
      >
        <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 px-5 py-5 text-white sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10">
              <Lock className="h-5 w-5 text-blue-200" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 id="login-modal-title" className="text-base font-bold tracking-tight">
                Acceso al panel institucional
              </h2>
              <p className="mt-1 text-xs text-blue-100">Autenticación segura con Firebase</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-white"
            aria-label="Cerrar ventana de inicio de sesión"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            El panel requiere una cuenta autenticada con permisos administrativos asignados por la institución.
          </p>

          {error && (
            <div id="login-error" role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm leading-relaxed text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" aria-describedby={error ? 'login-error' : undefined}>
            <div className="space-y-1.5">
              <label htmlFor="admin-email" className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                Correo institucional
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  inputMode="email"
                  placeholder="nombre@institucion.edu"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="min-h-12 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-base text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  aria-describedby={error ? 'login-error' : undefined}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="admin-password" className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                Contraseña
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  id="admin-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="min-h-12 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-base text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  aria-describedby={error ? 'login-error' : undefined}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 focus-visible:outline-blue-700 disabled:cursor-wait disabled:opacity-60"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              {isLoading ? 'Verificando acceso…' : 'Iniciar sesión'}
            </button>
          </form>

          {import.meta.env.DEV && (
            <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={onDemoAccess}
                className="flex min-h-12 w-full items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 px-4 text-sm font-semibold text-indigo-900 transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-100 dark:hover:bg-indigo-900/40"
              >
                Acceso rápido a demostración
              </button>
              <p className="mt-2 text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Solo muestra la interfaz en desarrollo; no autentica ni habilita acceso a respuestas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
