import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Database, 
  Users, 
  Sparkles, 
  Search, 
  Filter, 
  HelpCircle, 
  TrendingUp, 
  CheckCircle2, 
  FileText, 
  Layers, 
  BookOpen, 
  Lock, 
  LogOut, 
  ShieldCheck, 
  FileCheck,
  User,
  Trash2,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';
import { 
  SurveySubmission, 
  DIMENSIONS, 
  getScoreInterpretation 
} from '../data/questionnaireData';
import { seedDemoResponses, exportToCSV, deleteSurveyResponse } from '../services/surveyService';
import { ChecklistViewer } from './ChecklistViewer';

interface AnalyticsDashboardProps {
  submissions: SurveySubmission[];
  isLoading: boolean;
  onRefresh: () => void;
  onGoToForm: () => void;
  authenticatedUser?: { email: string; name: string; role: string } | null;
  onLogout?: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  submissions,
  isLoading,
  onRefresh,
  onGoToForm,
  authenticatedUser,
  onLogout,
}) => {
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'todos' | 'estudiante' | 'docente' | 'directivo'>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'resumen' | 'comparativa' | 'respuestas' | 'cualitativo' | 'check_pressman'>('resumen');
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccessMsg, setSeedSuccessMsg] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<SurveySubmission | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Filtered submissions
  const filteredSubmissions = submissions.filter((s) => {
    const matchesRole = selectedRoleFilter === 'todos' || s.role === selectedRoleFilter;
    const matchesSearch = 
      searchQuery === '' ||
      (s.participantName && s.participantName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.participantCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.frequency.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.qualitative?.loQueMasGusta && s.qualitative.loQueMasGusta.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.qualitative?.loQueDebeMejorar && s.qualitative.loQueDebeMejorar.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  // Calculate aggregates
  const totalCount = submissions.length;
  const studentCount = submissions.filter((s) => s.role === 'estudiante').length;
  const teacherCount = submissions.filter((s) => s.role === 'docente').length;
  const adminCount = submissions.filter((s) => s.role === 'directivo').length;

  const averageGlobal = totalCount > 0 
    ? Math.round((submissions.reduce((acc, s) => acc + s.globalScore, 0) / totalCount) * 10) / 10 
    : 0;

  // NPS Calculation (0-6 Detractors, 7-8 Passives, 9-10 Promoters)
  const promoters = submissions.filter((s) => s.npsScore >= 9).length;
  const detractors = submissions.filter((s) => s.npsScore <= 6).length;
  const npsScore = totalCount > 0 ? Math.round(((promoters - detractors) / totalCount) * 100) : 0;

  // Calculate dimension averages across roles
  const getDimensionAverage = (dimKey: string, roleFilter?: 'estudiante' | 'docente' | 'directivo'): number => {
    const subset = roleFilter ? submissions.filter((s) => s.role === roleFilter) : submissions;
    if (subset.length === 0) return 0;
    const validScores = subset
      .map((s) => s.dimensionScores[dimKey])
      .filter((v) => v !== undefined && v > 0);
    if (validScores.length === 0) return 0;
    const avg = validScores.reduce((a, b) => a + b, 0) / validScores.length;
    return Math.round(avg * 10) / 10;
  };

  const handleSeed = async () => {
    if (authenticatedUser?.role === 'Demostración') return;

    setIsSeeding(true);
    setSeedSuccessMsg(null);
    try {
      const count = await seedDemoResponses();
      setSeedSuccessMsg(`¡Se han cargado ${count} respuestas simuladas a Firebase exitosamente!`);
      setTimeout(() => setSeedSuccessMsg(null), 4000);
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(submissions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `evaluacion_ux_ui_firebase_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await deleteSurveyResponse(itemToDelete.id);
      const name = itemToDelete.participantName || itemToDelete.participantCode;
      setItemToDelete(null);
      setActionSuccessMsg(`Respuesta de "${name}" (${itemToDelete.participantCode}) eliminada exitosamente.`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
      onRefresh();
    } catch (err) {
      console.error('Error al eliminar de Firestore:', err);
      setActionSuccessMsg('Ocurrió un error al intentar eliminar la respuesta de Firebase.');
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } finally {
      setIsDeleting(false);
    }
  };

  const globalInterpretation = getScoreInterpretation(averageGlobal);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner & Institutional Authentication Status */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Firebase Firestore Conectado
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs text-slate-500">
                Colección: <code className="font-mono text-slate-700 dark:text-slate-300 font-bold">survey_responses</code>
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Panel Institucional de Evaluación y Resultados
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Auditoría y análisis de usabilidad según la Lista de Chequeo de Pressman & Maxim (Cap. 12, 13 y 14).
            </p>
          </div>

          {/* User profile & actions */}
          <div className="flex flex-wrap items-center gap-2">
            {authenticatedUser && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <div className="text-left">
                  <span className="font-bold block leading-none">{authenticatedUser.name}</span>
                  <span className="text-[10px] text-slate-400">{authenticatedUser.role}</span>
                </div>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="ml-2 p-1 text-slate-400 hover:text-red-500 transition-colors"
                    title="Cerrar sesión institucional"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {authenticatedUser?.role !== 'Demostración' && (
              <button
                type="button"
                onClick={handleSeed}
                disabled={isSeeding}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                {isSeeding ? 'Generando...' : 'Cargar Simulación'}
              </button>
            )}

            <button
              type="button"
              onClick={() => exportToCSV(submissions)}
              disabled={submissions.length === 0}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>

            <button
              type="button"
              onClick={handleExportJSON}
              disabled={submissions.length === 0}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5" />
              JSON
            </button>

            <button
              type="button"
              onClick={onGoToForm}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white transition-colors flex items-center gap-1.5 shadow-sm"
            >
              + Nueva Respuesta
            </button>
          </div>
        </div>

        {seedSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{seedSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* KPI Unified Summary Strip (Clean & Less Card Clutter) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Total Registros</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{totalCount}</span>
            <span className="text-xs text-slate-400">respuestas</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Est: {studentCount} · Doc: {teacherCount} · Dir: {adminCount}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Puntuación Global</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{averageGlobal}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="mt-1">
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${globalInterpretation.badgeClass}`}>
              {globalInterpretation.label}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Recomendación NPS</span>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-extrabold font-mono ${npsScore >= 50 ? 'text-emerald-600' : npsScore >= 0 ? 'text-amber-600' : 'text-red-600'}`}>
              {npsScore > 0 ? `+${npsScore}` : npsScore}
            </span>
            <span className="text-xs text-slate-400">pts</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            {promoters} promotores ({totalCount > 0 ? Math.round((promoters / totalCount) * 100) : 0}%)
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-400 block mb-1">Índice Accesibilidad</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {getDimensionAverage('accesibilidad')}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Cumple WCAG 2.2 y ONU
          </span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex gap-2 overflow-x-auto text-xs font-bold scrollbar-none">
        {[
          { id: 'resumen', label: '1. Categorías Evaluadas', icon: Layers },
          { id: 'comparativa', label: '2. Comparativa por Rol (Sec. 13.3)', icon: Users },
          { id: 'cualitativo', label: '3. Hallazgos Cualitativos', icon: Sparkles },
          { id: 'respuestas', label: `4. Registros Firestore (${filteredSubmissions.length})`, icon: Database },
          { id: 'check_pressman', label: '5. Verificación Pressman & Maxim (Rubric)', icon: FileCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-700 text-blue-700 dark:text-blue-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: CATEGORY SCORES */}
      {activeTab === 'resumen' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
            {Object.values(DIMENSIONS).map((dim) => {
              const score = getDimensionAverage(dim.id);
              const interp = getScoreInterpretation(score);
              return (
                <div key={dim.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {dim.category}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {dim.name}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {dim.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 sm:text-right shrink-0">
                    <div className="w-32 sm:w-40 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.max(0, score))}%`,
                          backgroundColor: interp.color,
                        }}
                      />
                    </div>
                    <div className="min-w-[4.5rem]">
                      <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                        {score}
                      </span>
                      <span className="text-xs text-slate-400">/100</span>
                      <div>
                        <span className={`inline-block px-2 py-0.2 rounded text-[10px] font-bold border ${interp.badgeClass}`}>
                          {interp.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ROLE COMPARISON (SECTION 13.3) */}
      {activeTab === 'comparativa' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
            <strong>Fundamento Teórico Pressman & Maxim (Cap. 12.4):</strong> "No deben promediarse inicialmente los resultados de los tres roles, ya que cada uno realiza tareas especializadas. Un sistema puede resultar amigable para un estudiante, pero requerir ajustes para el registro de notas o asignación de cursos."
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                  <th className="p-3.5">Categoría Evaluada</th>
                  <th className="p-3.5 text-center">Estudiantes ({studentCount})</th>
                  <th className="p-3.5 text-center">Docentes ({teacherCount})</th>
                  <th className="p-3.5 text-center">Directivos ({adminCount})</th>
                  <th className="p-3.5 text-center font-bold">Consolidado General</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {Object.values(DIMENSIONS).map((dim) => {
                  const estScore = getDimensionAverage(dim.id, 'estudiante');
                  const docScore = getDimensionAverage(dim.id, 'docente');
                  const admScore = getDimensionAverage(dim.id, 'directivo');
                  const genScore = getDimensionAverage(dim.id);

                  return (
                    <tr key={dim.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-medium text-slate-900 dark:text-white">
                        {dim.name}
                      </td>
                      <td className="p-3.5 text-center font-mono">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${getScoreInterpretation(estScore).badgeClass}`}>
                          {estScore > 0 ? estScore : '—'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-mono">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${getScoreInterpretation(docScore).badgeClass}`}>
                          {docScore > 0 ? docScore : '—'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-mono">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${getScoreInterpretation(admScore).badgeClass}`}>
                          {admScore > 0 ? admScore : '—'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-bold font-mono">
                        <span className={`px-2.5 py-1 rounded text-xs font-extrabold ${getScoreInterpretation(genScore).badgeClass}`}>
                          {genScore > 0 ? genScore : '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: QUALITATIVE FEEDBACK */}
      {activeTab === 'cualitativo' && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Aspectos Más Valorados por la Comunidad
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {submissions.filter((s) => s.qualitative?.loQueMasGusta).map((s) => (
                <div key={s.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold uppercase text-blue-600">{s.role}</span>
                      {s.participantName && (
                        <span className="text-slate-700 dark:text-slate-300 font-medium">· {s.participantName}</span>
                      )}
                    </div>
                    <span className="font-mono">{s.participantCode}</span>
                  </div>
                  <p className="italic">"{s.qualitative.loQueMasGusta}"</p>
                </div>
              ))}
              {submissions.filter((s) => s.qualitative?.loQueMasGusta).length === 0 && (
                <p className="text-xs text-slate-400 italic">No hay comentarios registrados.</p>
              )}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              Oportunidades de Mejora Detectadas
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {submissions.filter((s) => s.qualitative?.loQueDebeMejorar).map((s) => (
                <div key={s.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold uppercase text-amber-600">{s.role}</span>
                      {s.participantName && (
                        <span className="text-slate-700 dark:text-slate-300 font-medium">· {s.participantName}</span>
                      )}
                    </div>
                    <span className="font-mono">{s.participantCode}</span>
                  </div>
                  <p className="italic">"{s.qualitative.loQueDebeMejorar}"</p>
                </div>
              ))}
              {submissions.filter((s) => s.qualitative?.loQueDebeMejorar).length === 0 && (
                <p className="text-xs text-slate-400 italic">No hay sugerencias registradas.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FIRESTORE RESPONSES TABLE */}
      {activeTab === 'respuestas' && (
        <div className="space-y-4">
          {actionSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{actionSuccessMsg}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setActionSuccessMsg(null)} 
                className="text-emerald-600 hover:text-emerald-800 text-sm font-bold ml-2"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              {(['todos', 'estudiante', 'docente', 'directivo'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                    selectedRoleFilter === r
                      ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre o código de participante"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Desktop & Tablet Table (md:block) */}
          <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                  <th className="p-3">Nombre del Encuestado</th>
                  <th className="p-3">Código</th>
                  <th className="p-3">Rol</th>
                  <th className="p-3">Fecha y Hora</th>
                  <th className="p-3">Dispositivo</th>
                  <th className="p-3">Frecuencia</th>
                  <th className="p-3 text-center">NPS</th>
                  <th className="p-3 text-center">Puntaje</th>
                  <th className="p-3 text-center">Diagnóstico</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredSubmissions.map((s) => {
                  const interp = getScoreInterpretation(s.globalScore);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center text-[11px] font-extrabold shrink-0">
                            {(s.participantName || 'A').charAt(0).toUpperCase()}
                          </div>
                          <span className="truncate max-w-[200px]">{s.participantName || 'Sin registrar'}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {s.participantCode}
                      </td>
                      <td className="p-3 capitalize font-semibold">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          s.role === 'estudiante' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300' :
                          s.role === 'docente' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                        }`}>
                          {s.role}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">
                        {new Date(s.submittedAt).toLocaleDateString()} {new Date(s.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-3">{s.device}</td>
                      <td className="p-3">{s.frequency}</td>
                      <td className="p-3 text-center font-bold font-mono">{s.npsScore}/10</td>
                      <td className="p-3 text-center font-extrabold text-sm text-slate-900 dark:text-white font-mono">
                        {s.globalScore}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${interp.badgeClass}`}>
                          {interp.label}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => setItemToDelete(s)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                          title={`Eliminar evaluación de ${s.participantName || s.participantCode}`}
                          aria-label={`Eliminar evaluación de ${s.participantName || s.participantCode}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredSubmissions.length === 0 && (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400">
                      No se encontraron respuestas registradas en Firebase Firestore.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Responsive Cards (md:hidden) */}
          <div className="block md:hidden space-y-3">
            {filteredSubmissions.map((s) => {
              const interp = getScoreInterpretation(s.globalScore);
              return (
                <div 
                  key={s.id} 
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold shrink-0">
                        {(s.participantName || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          {s.participantName || 'Sin registrar'}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                            {s.participantCode}
                          </span>
                          <span className={`px-2 py-0.2 rounded text-[10px] font-semibold capitalize ${
                            s.role === 'estudiante' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300' :
                            s.role === 'docente' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300' :
                            'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                          }`}>
                            {s.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setItemToDelete(s)}
                      className="p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                      title="Eliminar registro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Puntaje Global:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {s.globalScore}/100 ({interp.label})
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">NPS y Dispositivo:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {s.npsScore}/10 • {s.device}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                    <span>{new Date(s.submittedAt).toLocaleDateString()} {new Date(s.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span>{s.frequency}</span>
                  </div>
                </div>
              );
            })}

            {filteredSubmissions.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                No se encontraron respuestas registradas en Firebase Firestore.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: RUBRIC LISTA DE CHEQUEO PRESSMAN & MAXIM */}
      {activeTab === 'check_pressman' && (
        <ChecklistViewer />
      )}

      {/* CONFIRM DELETE MODAL (Mandel Rule 1: User in control, prevent accidental data loss) */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div 
            className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-delete-title"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/70 border border-red-200 dark:border-red-800 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 id="modal-delete-title" className="text-sm font-bold text-slate-900 dark:text-white">
                  ¿Eliminar evaluación de Firebase?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Nombre del encuestado:</span>
                <span className="font-bold text-slate-900 dark:text-white">{itemToDelete.participantName || 'Sin registrar'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Código de usuario:</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{itemToDelete.participantCode}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Rol:</span>
                <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">{itemToDelete.role}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Puntaje global:</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">{itemToDelete.globalScore} / 100</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-xs font-bold text-white transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isDeleting ? 'Eliminando...' : 'Sí, eliminar registro'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
