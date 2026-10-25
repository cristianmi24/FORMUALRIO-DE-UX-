/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { getIdTokenResult, onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  ClipboardList, 
  BarChart3, 
  Sun, 
  Moon, 
  CheckCircle2, 
  Eye, 
  School,
  Lock,
  Keyboard,
  FileCheck,
  LogOut,
  WifiOff
} from 'lucide-react';
import { auth, testConnection } from './firebase';
import { subscribeToSurveys } from './services/surveyService';
import { SurveySubmission } from './data/questionnaireData';
import { SurveyForm } from './components/SurveyForm';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { ChecklistViewer } from './components/ChecklistViewer';

export default function App() {
  const [currentView, setCurrentView] = useState<'survey' | 'dashboard' | 'checklist'>('survey');
  const [submissions, setSubmissions] = useState<SurveySubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseConnected, setFirebaseConnected] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Authentication for Admin Dashboard (Protected Access)
  const [authenticatedUser, setAuthenticatedUser] = useState<{ email: string; name: string; role: string } | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Shortcuts modal
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Accessibility & Theme
  const [darkMode, setDarkMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // Online / Offline listener (Pressman MOB-04)
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Global key listener for shortcuts modal ('?')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && e.target instanceof HTMLElement && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsLoginModalOpen(false);
        setIsShortcutsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Restore only Firebase users with a trusted administrator claim.
  useEffect(() => {
    let active = true;
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (active) {
          setAuthenticatedUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const token = await getIdTokenResult(user);
        if (token.claims.admin !== true) {
          await signOut(auth);
          if (active) setAuthenticatedUser(null);
          return;
        }

        if (active) {
          setAuthenticatedUser({
            email: user.email ?? '',
            name: user.displayName || 'Administrador',
            role: 'Administrador',
          });
        }
      } catch (error) {
        console.warn('No se pudo validar el rol administrativo.', error);
        await signOut(auth).catch(() => undefined);
        if (active) {
          setAuthenticatedUser(null);
          setIsLoading(false);
        }
      }
    });

    void testConnection().then((connected) => {
      if (active) setFirebaseConnected(connected);
    });

    return () => {
      active = false;
      unsubscribeAuth();
    };
  }, []);

  // Subscribe to confidential responses only while an admin session is active.
  useEffect(() => {
    if (!authenticatedUser || authenticatedUser.role === 'Demostración') {
      setSubmissions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    return subscribeToSurveys(
      (data) => {
        setSubmissions(data);
        setIsLoading(false);
        setFirebaseConnected(true);
      },
      (error) => {
        console.warn('No fue posible cargar las respuestas del panel.', error);
        setIsLoading(false);
        setFirebaseConnected(false);
      }
    );
  }, [authenticatedUser]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const cycleFontSize = () => {
    if (fontSize === 'normal') setFontSize('large');
    else if (fontSize === 'large') setFontSize('xlarge');
    else setFontSize('normal');
  };

  const handleDashboardClick = () => {
    if (authenticatedUser) {
      setCurrentView('dashboard');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = (user: { email: string; name: string; role: string }) => {
    setAuthenticatedUser(user);
    setIsLoginModalOpen(false);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setAuthenticatedUser(null);
    setSubmissions([]);
    setCurrentView('survey');
    void signOut(auth).catch((error) => console.warn('No se pudo cerrar la sesión.', error));
  };

  return (
    <div className={`min-h-screen transition-colors ${
      darkMode ? 'dark bg-[#090d16] text-slate-100' : 'bg-[#f8fafc] text-slate-800'
    } ${highContrast ? 'contrast-125' : ''}`}>
      
      {/* Offline Alert Bar (MOB-04) */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-bold text-center flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Modo sin conexión detectado. Sus respuestas se guardarán localmente y se sincronizarán al reconectar.</span>
        </div>
      )}

      {/* Top Bar Contract: 3 zones (Brand wordmark - Nav Links - Actions) */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 min-h-16 py-2 flex items-center justify-between gap-2 sm:gap-6">
          
          {/* Zone 1: Brand wordmark responsive */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-sm shrink-0">
              <School className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); setCurrentView('survey'); }}
              className="text-sm sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap hover:text-blue-700 transition-colors"
            >
              <span className="sm:hidden min-[361px]:hidden">Gestión</span>
              <span className="hidden sm:inline">Sistema de Gestión Escolar</span>
              <span className="hidden min-[361px]:inline sm:hidden">Gestión Escolar</span>
            </a>
          </div>

          {/* Zone 2: Clean single-line navigation links (Desktop) */}
          <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={() => setCurrentView('survey')}
              className={`py-1 transition-colors whitespace-nowrap ${
                currentView === 'survey'
                  ? 'text-blue-700 dark:text-blue-400 border-b-2 border-blue-700 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Cuestionario
            </button>

            <button
              type="button"
              onClick={handleDashboardClick}
              className={`py-1 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                currentView === 'dashboard'
                  ? 'text-blue-700 dark:text-blue-400 border-b-2 border-blue-700 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Panel Institucional</span>
              {!authenticatedUser && <Lock className="w-3 h-3 text-slate-400" />}
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('checklist')}
              className={`py-1 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                currentView === 'checklist'
                  ? 'text-blue-700 dark:text-blue-400 border-b-2 border-blue-700 font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Lista Pressman & Maxim</span>
            </button>
          </nav>

          {/* Zone 3: Primary action & accessibility toggles */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
            {/* Keyboard shortcuts trigger */}
            <button
              type="button"
              onClick={() => setIsShortcutsOpen(true)}
              className="hidden sm:flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-mono text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              title="Ver atajos de teclado (?)"
              aria-label="Ver atajos de teclado"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px]">Atajos [?]</span>
            </button>

            {/* Font size toggle */}
            <button
              type="button"
              onClick={cycleFontSize}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-slate-200 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              title={`Tamaño tipográfico: ${fontSize}`}
              aria-label={`Cambiar tamaño tipográfico; actual: ${fontSize}`}
            >
              A<span className="text-[10px]">{fontSize === 'normal' ? '' : fontSize === 'large' ? '+' : '++'}</span>
            </button>

            {/* Contrast toggle */}
            <button
              type="button"
              onClick={() => setHighContrast(!highContrast)}
              className={`flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 ${
                highContrast ? 'text-amber-500 font-bold' : ''
              }`}
              title="Alternar alto contraste"
              aria-label="Alternar alto contraste"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>

            {/* Dark mode */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              title="Alternar tema claro/oscuro"
              aria-label="Alternar tema claro u oscuro"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Auth status or login button */}
            {authenticatedUser ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-xl bg-blue-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-blue-800 sm:w-auto"
                aria-label="Acceso al panel institucional"
              >
                <Lock className="w-3 h-3" />
                <span className="hidden sm:inline">Acceso Docente</span>
              </button>
            )}

          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 pb-28 md:pb-8">
        
        {currentView === 'survey' && (
          <SurveyForm
            onSuccess={() => {}}
            onGoToDashboard={handleDashboardClick}
            highContrast={highContrast}
            fontSize={fontSize}
          />
        )}

        {currentView === 'dashboard' && (
          <AnalyticsDashboard
            submissions={submissions}
            isLoading={isLoading}
            onRefresh={() => {}}
            onGoToForm={() => setCurrentView('survey')}
            authenticatedUser={authenticatedUser}
            onLogout={handleLogout}
          />
        )}

        {currentView === 'checklist' && (
          <ChecklistViewer />
        )}

      </main>

      {/* Mobile Bottom Navigation Bar (Pressman MOB-01 & MOB-02) */}
      <nav aria-label="Navegación móvil" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] shadow-lg">
        <button
          type="button"
          onClick={() => {
            setCurrentView('survey');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex min-h-12 min-w-[56px] flex-col items-center justify-center rounded-xl px-2 py-1.5 transition-all ${
            currentView === 'survey'
              ? 'text-blue-700 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <ClipboardList className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Cuestionario</span>
        </button>

        <button
          type="button"
          onClick={() => {
            handleDashboardClick();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`relative flex min-h-12 min-w-[56px] flex-col items-center justify-center rounded-xl px-2 py-1.5 transition-all ${
            currentView === 'dashboard'
              ? 'text-blue-700 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-5 h-5 mb-0.5" />
          <div className="flex items-center gap-0.5">
            <span className="text-[10px]">Panel</span>
            {!authenticatedUser && <Lock className="w-2.5 h-2.5 text-slate-400" />}
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setCurrentView('checklist');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex min-h-12 min-w-[56px] flex-col items-center justify-center rounded-xl px-2 py-1.5 transition-all ${
            currentView === 'checklist'
              ? 'text-blue-700 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
          }`}
        >
          <FileCheck className="w-5 h-5 mb-0.5 text-blue-600 dark:text-blue-400" />
          <span className="text-[10px]">Checklist</span>
        </button>

        <button
          type="button"
          onClick={() => setIsShortcutsOpen(true)}
          className="flex min-h-12 min-w-[56px] flex-col items-center justify-center rounded-xl px-2 py-1.5 text-slate-500 transition-all hover:text-slate-800 dark:text-slate-400"
        >
          <Keyboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Atajos</span>
        </button>
      </nav>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1 mb-14 md:mb-0">
        <p className="font-semibold text-slate-700 dark:text-slate-300">
          Universidad de Córdoba • Departamento de Informática Educativa
        </p>
        <p className="text-[11px] text-slate-400">
          Diseño de Interfaces de Usuario • Lista de Chequeo según Roger S. Pressman & Bruce R. Maxim (9ª Edición)
        </p>
      </footer>

      {/* Institutional Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onDemoAccess={() => handleLoginSuccess({ email: '', name: 'Vista de demostración', role: 'Demostración' })}
      />

      {/* Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

    </div>
  );
}
