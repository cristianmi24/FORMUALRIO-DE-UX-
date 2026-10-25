import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  HelpCircle, 
  ShieldCheck, 
  User, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  BarChart3,
  RotateCcw,
  Clock,
  Layers,
  Palette,
  Eye,
  Heart,
  Save,
  Undo2,
  ChevronRight,
  Info
} from 'lucide-react';
import { 
  CATEGORIES_CONFIG,
  UX_QUESTIONS,
  UI_QUESTIONS,
  ROLE_QUESTIONS_MAP,
  ACCESSIBILITY_QUESTIONS,
  SATISFACTION_QUESTIONS,
  LIKERT_OPTIONS,
  QuestionItem,
  calculateDimensionScores,
  getScoreInterpretation,
  getAllQuestionsForRole,
  SurveySubmission,
  generateUserCode
} from '../data/questionnaireData';
import { submitSurvey } from '../services/surveyService';

interface SurveyFormProps {
  onSuccess: (submission: SurveySubmission) => void;
  onGoToDashboard: () => void;
  highContrast?: boolean;
  fontSize?: 'normal' | 'large' | 'xlarge';
}

const DRAFT_STORAGE_KEY = 'school_ux_survey_draft';

export const SurveyForm: React.FC<SurveyFormProps> = ({ 
  onSuccess, 
  onGoToDashboard,
  highContrast = false,
  fontSize = 'normal'
}) => {
  // Steps:
  // 0: Welcome & Profile
  // 1: UX Category (10 questions)
  // 2: UI Category (9 questions)
  // 3: Role Category (8 questions)
  // 4: Accessibility Category (6 questions)
  // 5: Satisfaction & NPS Category (5 questions + NPS + feedback)
  // 6: Success Confirmation
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Consent
  const [consentAccepted, setConsentAccepted] = useState<boolean | null>(null);

  // Participant profile
  const [participantName, setParticipantName] = useState<string>('');
  const [role, setRole] = useState<'estudiante' | 'docente' | 'directivo'>('estudiante');
  const [frequency, setFrequency] = useState<string>('Todos los días');
  const [device, setDevice] = useState<string>('Teléfono celular');
  const [techExperience, setTechExperience] = useState<string>('Media');

  // Answers map: code -> number (1-5, 0 = N/A)
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [answerHistory, setAnswerHistory] = useState<Array<{ code: string; prevVal?: number }>>([]);

  // NPS & Open qualitative
  const [npsScore, setNpsScore] = useState<number>(9);
  const [qualitative, setQualitative] = useState({
    loQueMasGusta: '',
    loQueDebeMejorar: '',
    dificultadConcreta: '',
    funcionDeseada: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [completedSubmission, setCompletedSubmission] = useState<SurveySubmission | null>(null);

  // Participant code (standard format: user001, user042, user189)
  const [participantCode, setParticipantCode] = useState<string>(() => generateUserCode());

  // Draft auto-restore (Mandel UX-02 & Tognazzini UX-06)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.answers && Object.keys(parsed.answers).length > 0) {
          setAnswers(parsed.answers);
          if (parsed.participantCode) setParticipantCode(parsed.participantCode);
          if (parsed.participantName) setParticipantName(parsed.participantName);
          if (parsed.role) setRole(parsed.role);
          if (parsed.device) setDevice(parsed.device);
          if (parsed.frequency) setFrequency(parsed.frequency);
          if (parsed.npsScore) setNpsScore(parsed.npsScore);
          if (parsed.qualitative) setQualitative(parsed.qualitative);
          setConsentAccepted(true);
          showToast('Progreso previo restaurado automáticamente.');
        }
      }
    } catch (e) {
      console.warn('Error reading draft from localStorage', e);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const saveDraft = () => {
    try {
      const data = {
        participantCode,
        participantName,
        role,
        device,
        frequency,
        answers,
        npsScore,
        qualitative,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
      showToast('Borrador guardado exitosamente en este navegador.');
    } catch (e) {
      console.error(e);
    }
  };

  const handleLikertSelect = (code: string, value: number) => {
    setAnswerHistory((prev) => [...prev, { code, prevVal: answers[code] }]);
    setAnswers((prev) => ({
      ...prev,
      [code]: value,
    }));
  };

  // Undo (Ctrl+Z) - Mandel Rule 1
  const handleUndo = () => {
    if (answerHistory.length === 0) {
      showToast('No hay acciones previas para deshacer.');
      return;
    }
    const last = answerHistory[answerHistory.length - 1];
    setAnswerHistory((prev) => prev.slice(0, prev.length - 1));
    setAnswers((prev) => {
      const next = { ...prev };
      if (last.prevVal !== undefined) {
        next[last.code] = last.prevVal;
      } else {
        delete next[last.code];
      }
      return next;
    });
    showToast(`Se deshizo la respuesta de la pregunta ${last.code}`);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S: Save Draft
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveDraft();
      }
      // Ctrl+Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [answers, answerHistory, role, device, frequency, npsScore, qualitative]);

  // Questions for active category step
  const getQuestionsForStep = (step: number): QuestionItem[] => {
    switch (step) {
      case 1:
        return UX_QUESTIONS;
      case 2:
        return UI_QUESTIONS;
      case 3:
        return ROLE_QUESTIONS_MAP[role] || [];
      case 4:
        return ACCESSIBILITY_QUESTIONS;
      case 5:
        return SATISFACTION_QUESTIONS;
      default:
        return [];
    }
  };

  const allRoleQuestions = getAllQuestionsForRole(role);
  const totalQuestionsCount = allRoleQuestions.length;
  const answeredCount = Object.keys(answers).filter((k) => answers[k] !== undefined).length;
  const globalProgress = Math.round((answeredCount / totalQuestionsCount) * 100);

  const validateStep = (step: number): boolean => {
    setErrorMessage(null);
    if (step === 0) {
      if (consentAccepted === null) {
        setErrorMessage('Por favor indique si acepta participar voluntariamente en la evaluación.');
        return false;
      }
      if (consentAccepted === false) {
        setErrorMessage('Ha seleccionado que no desea participar.');
        return false;
      }
      if (!participantName.trim()) {
        setErrorMessage('Por favor ingrese el nombre completo de la persona evaluada para identificar la respuesta.');
        return false;
      }
      return true;
    }

    const currentQuestions = getQuestionsForStep(step);
    const unAnswered = currentQuestions.filter((q) => answers[q.code] === undefined);
    if (unAnswered.length > 0) {
      setErrorMessage(`Hay ${unAnswered.length} pregunta(s) pendientes en esta categoría. Responda todas para asegurar la confiabilidad del informe.`);
      return false;
    }

    return true;
  };

  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrevStep = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(0, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit to Firebase
  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const { dimensionScores, globalScore } = calculateDimensionScores(answers, role);
      const submissionId = `resp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      const newSubmission: SurveySubmission = {
        id: submissionId,
        participantCode,
        participantName: participantName.trim(),
        submittedAt: new Date().toISOString(),
        role,
        frequency,
        device,
        techExperience,
        accessibilityNeeds: ['Estándar'],
        answers,
        npsScore,
        qualitative,
        dimensionScores,
        globalScore,
      };

      await submitSurvey(newSubmission);
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setCompletedSubmission(newSubmission);
      setCurrentStep(6);
      onSuccess(newSubmission);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error('Error submitting survey to Firebase:', err);
      setErrorMessage(
        'Hubo un problema al guardar su respuesta en Firebase. Por favor verifique su conexión e intente nuevamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const textScale = fontSize === 'xlarge' ? 'text-lg' : fontSize === 'large' ? 'text-base' : 'text-sm';
  const headingScale = fontSize === 'xlarge' ? 'text-2xl' : fontSize === 'large' ? 'text-xl' : 'text-lg';

  // Current category name for breadcrumbs
  const getCategoryBreadcrumb = () => {
    switch (currentStep) {
      case 0: return 'Consentimiento y Perfil';
      case 1: return '1. Experiencia de Usuario (UX)';
      case 2: return '2. Interfaz Visual (UI)';
      case 3: return `3. Funciones de ${role}`;
      case 4: return '4. Accesibilidad e Inclusión';
      case 5: return '5. Satisfacción y Recomendación';
      case 6: return 'Finalizado';
      default: return '';
    }
  };

  return (
    <div className={`w-full rounded-2xl border ${
      highContrast 
        ? 'bg-black text-white border-yellow-400' 
        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-sm'
    }`}>
      
      {/* Toast Notification for Draft/Undo */}
      {toastMessage && (
        <div role="status" aria-live="polite" className="fixed bottom-20 left-4 right-4 z-50 mx-auto flex max-w-md items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-2xl animate-slideUp sm:bottom-6 sm:left-auto sm:right-6">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumbs & Utility Bar (Pressman UX-01 & PAT-02) */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex flex-wrap items-center justify-between gap-3 text-xs sm:px-6">
        
        {/* Breadcrumb Trail */}
        <nav aria-label="Migas de pan" className="flex min-w-0 flex-wrap items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <button 
            type="button" 
            onClick={() => setCurrentStep(0)} 
            className="hover:text-blue-600 transition-colors font-medium"
          >
            Inicio
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Cuestionario</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-800 dark:text-white">
            {getCategoryBreadcrumb()}
          </span>
        </nav>

        {/* Action Controls: Guardar borrador & Deshacer */}
        {currentStep > 0 && currentStep < 6 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUndo}
              disabled={answerHistory.length === 0}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors flex items-center gap-1 disabled:opacity-40"
              title="Deshacer última selección (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Deshacer</span>
            </button>

            <button
              type="button"
              onClick={saveDraft}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors flex items-center gap-1"
              title="Guardar borrador localmente (Ctrl+S)"
            >
              <Save className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Guardar borrador</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Header */}
      <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 sm:px-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
              Evaluación Institucional de Usabilidad
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs text-slate-500 font-mono">ID: {participantCode}</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            Sistema de Gestión Escolar • Lista Pressman & Maxim
          </h1>
        </div>

        {currentStep > 0 && currentStep < 6 && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                {answeredCount} / {totalQuestionsCount}
              </span>
              <span className="text-[10px] text-slate-400 block">{globalProgress}% respondido</span>
            </div>
            <div role="progressbar" aria-label="Progreso del cuestionario" aria-valuemin={0} aria-valuemax={100} aria-valuenow={globalProgress} className="w-28 sm:w-36 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${globalProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Horizontal Category Stepper Tabs (Chunking Miller 7±2, UX-03) */}
      {currentStep > 0 && currentStep < 6 && (
        <div role="navigation" aria-label="Pasos del cuestionario" className="px-4 py-2 bg-slate-50/60 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex overflow-x-auto gap-1.5 text-xs scrollbar-none sm:px-6">
          {[
            { step: 1, label: '1. UX General (10)' },
            { step: 2, label: '2. UI Visual (9)' },
            { step: 3, label: `3. Rol: ${role} (8)` },
            { step: 4, label: '4. Accesibilidad (6)' },
            { step: 5, label: '5. Satisfacción (5)' },
          ].map((cat) => (
            <button
              key={cat.step}
              type="button"
              aria-current={currentStep === cat.step ? 'step' : undefined}
              onClick={() => {
                if (currentStep > cat.step || validateStep(currentStep)) {
                  setCurrentStep(cat.step);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                currentStep === cat.step
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : currentStep > cat.step
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Body Content */}
      <div className="p-4 sm:p-6">
        {errorMessage && (
          <div role="alert" aria-live="assertive" className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
            <div>
              <span className="font-bold block">Por favor verifique:</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* STEP 0: WELCOME & PARTICIPANT ARTIFACT PROFILE */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                Universidad de Córdoba • Facultad de Educación
              </span>
              <h2 className={`font-bold text-slate-900 dark:text-white ${headingScale} mt-1`}>
                Evaluación de Usabilidad del Sistema de Gestión Escolar
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Instrumento estructurado con <strong>máximo 10 preguntas por categoría</strong> para verificar la experiencia de usuario (UX), la interfaz visual (UI) y la satisfacción según los estándares de Pressman & Maxim.
              </p>
            </div>

            {/* Consent Block (RGPD Art. 25) */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                  Consentimiento Voluntario y Privacidad
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                "Su participación es voluntaria. Se solicitará el nombre de la persona evaluada para identificar la respuesta; no incluya contraseñas ni información sensible. Las respuestas se almacenarán en Firebase para fines académicos y de mejora continua."
              </p>

              <div className="grid sm:grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  aria-pressed={consentAccepted === true}
                  onClick={() => setConsentAccepted(true)}
                  className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    consentAccepted === true
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    consentAccepted === true ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-400'
                  }`}>
                    {consentAccepted === true && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">
                      Sí, acepto participar
                    </span>
                    <span className="text-[11px] text-slate-500">Continuar a las preguntas</span>
                  </div>
                </button>

                <button
                  type="button"
                  aria-pressed={consentAccepted === false}
                  onClick={() => setConsentAccepted(false)}
                  className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    consentAccepted === false
                      ? 'border-red-600 bg-red-50 dark:bg-red-950/40 ring-2 ring-red-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    consentAccepted === false ? 'border-red-600 bg-red-600 text-white' : 'border-slate-400'
                  }`}>
                    {consentAccepted === false && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">
                      No deseo participar
                    </span>
                    <span className="text-[11px] text-slate-500">Cerrar cuestionario</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Participant Name Input (Evaluated Person Identification) */}
            <div className="p-4 sm:p-5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <label 
                  htmlFor="participant-name-input" 
                  className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5"
                >
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Nombre Completo del Evaluado <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-blue-700 dark:text-blue-300 font-semibold bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded-md">
                  Obligatorio
                </span>
              </div>
              <input
                id="participant-name-input"
                type="text"
                autoComplete="name"
                maxLength={120}
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="Escriba el nombre de la persona evaluada"
                className="w-full px-3.5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-xs"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-blue-100 dark:border-blue-900/40 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">Código aleatorio asignado:</span>
                  <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/70 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                    {participantCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newCode = generateUserCode();
                    setParticipantCode(newCode);
                    showToast(`Nuevo código generado: ${newCode}`);
                  }}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium flex items-center gap-1 hover:underline"
                  title="Generar nuevo código aleatorio (user001, user042, etc.)"
                >
                  <RotateCcw className="w-3 h-3" />
                  Generar otro código
                </button>
              </div>
            </div>

            {/* Role Selection (UX-05 Persona modeling) */}
            <div className="space-y-3">
              <p id="role-selection-label" className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Seleccione su Rol en la Institución:
              </p>
              <div role="group" aria-labelledby="role-selection-label" className="grid sm:grid-cols-3 gap-3">
                {[
                  { id: 'estudiante', title: 'Estudiante', desc: 'Consulta notas, horarios, boletines y exámenes' },
                  { id: 'docente', title: 'Docente', desc: 'Registra calificaciones, asistencia y crea exámenes' },
                  { id: 'directivo', title: 'Directivo o Administrador', desc: 'Gestiona matrículas, cursos y reportes' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={role === item.id}
                    onClick={() => setRole(item.id as any)}
                    className={`min-h-12 p-3.5 rounded-xl border text-left transition-all ${
                      role === item.id
                        ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-500/20 font-bold'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">{item.title}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal block mt-1">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Device & Frequency */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="primary-device" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dispositivo Principal Utilizado:
                </label>
                <select
                  id="primary-device"
                  value={device}
                  onChange={(e) => setDevice(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Teléfono celular">Teléfono celular</option>
                  <option value="Computador portátil">Computador portátil</option>
                  <option value="Computador de escritorio">Computador de escritorio</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Aplicación Android">Aplicación Android</option>
                </select>
              </div>

              <div>
                <label htmlFor="usage-frequency" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Frecuencia de Uso del Sistema:
                </label>
                <select
                  id="usage-frequency"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Todos los días">Todos los días</option>
                  <option value="Varias veces por semana">Varias veces por semana</option>
                  <option value="Una vez por semana">Una vez por semana</option>
                  <option value="Algunas veces al mes">Algunas veces al mes</option>
                  <option value="Es mi primera experiencia">Es mi primera experiencia</option>
                </select>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col-reverse items-stretch gap-3 border-t border-slate-200 pt-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={onGoToDashboard}
                className="flex min-h-12 w-full items-center justify-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold transition-colors hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 sm:w-auto"
              >
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Acceso al Panel Institucional
              </button>

              <button
                type="button"
                onClick={goToNextStep}
                disabled={consentAccepted !== true}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-800 sm:w-auto"
              >
                Comenzar Categoría 1 (UX)
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 1 TO 5: CATEGORY QUESTIONS (MAX 10 PER CATEGORY) */}
        {currentStep >= 1 && currentStep <= 5 && (
          <div className="space-y-6">
            
            {/* Category Header */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                  Categoría {currentStep} de 5 • Máx. 10 preguntas
                </span>
                <h2 className={`font-bold text-slate-900 dark:text-white ${headingScale} mt-0.5`}>
                  {currentStep === 1 && '1. Experiencia de Usuario General (UX)'}
                  {currentStep === 2 && '2. Interfaz Visual y Diseño (UI)'}
                  {currentStep === 3 && `3. Funciones Específicas de ${role.toUpperCase()}`}
                  {currentStep === 4 && '4. Accesibilidad e Inclusión'}
                  {currentStep === 5 && '5. Satisfacción Global y Recomendación'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Escala Likert: 1 = Totalmente en desacuerdo, 5 = Totalmente de acuerdo, N/A = No aplica.
                </p>
              </div>

              <div className="text-right text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                  {getQuestionsForStep(currentStep).filter((q) => answers[q.code] !== undefined).length} / {getQuestionsForStep(currentStep).length}
                </span>
                <span className="text-[10px] text-slate-400 block">en esta sección</span>
              </div>
            </div>

            {/* Questions Layout: Clean tabular/rows instead of cluttered cards within cards */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {getQuestionsForStep(currentStep).map((q, idx) => {
                const selectedValue = answers[q.code];
                return (
                  <div key={q.code} className="py-4.5 first:pt-0 last:pb-0 space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <span className="font-mono text-xs font-bold text-slate-400 mt-0.5 w-6 shrink-0">
                        {String(idx + 1).padStart(2, '0')}.
                      </span>
                      <div className="flex-1">
                        <span className="text-xs font-bold text-blue-700 dark:text-blue-400 mr-2">
                          {q.title}:
                        </span>
                        <span className={`text-slate-800 dark:text-slate-200 font-medium ${textScale}`}>
                          {q.text}
                        </span>
                      </div>
                    </div>

                    {/* Likert Control Group - Touch target optimized for mobile screens */}
                    <div className="pl-0 sm:pl-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                      {LIKERT_OPTIONS.map((opt) => {
                        const isChecked = selectedValue === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            aria-pressed={isChecked}
                            onClick={() => handleLikertSelect(q.code, opt.value)}
                            className={`min-h-[48px] py-2 px-2 rounded-xl text-xs font-medium text-center border transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95 ${
                              isChecked
                                ? 'bg-blue-700 text-white border-blue-700 shadow-sm ring-2 ring-blue-500/30 font-bold'
                                : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            <span className="font-extrabold text-sm font-mono">{opt.value === 0 ? 'N/A' : opt.value}</span>
                            <span className="text-[10px] opacity-90 truncate max-w-full">
                              {opt.value === 0 ? 'No aplica' : opt.value === 1 ? 'Desacuerdo' : opt.value === 5 ? 'Muy de acuerdo' : opt.value === 3 ? 'Neutro' : opt.value === 2 ? 'En desacuerdo' : 'De acuerdo'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* In step 5, add NPS & Qualitative */}
            {currentStep === 5 && (
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
                {/* NPS Question */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
                  <p id="nps-question-label" className="block text-sm font-bold text-slate-800 dark:text-white">
                    En una escala de 0 a 10, ¿qué tan probable es que recomiende el Sistema de Gestión Escolar? (NPS)
                  </p>
                  <div className="flex justify-between text-[11px] text-slate-400 font-medium px-1">
                    <span>0 = Nada probable</span>
                    <span>10 = Muy probable</span>
                  </div>
                  <div role="group" aria-labelledby="nps-question-label" className="flex flex-wrap justify-center gap-1.5 sm:grid sm:grid-cols-11 sm:justify-start">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                      <button
                        key={score}
                        type="button"
                        aria-pressed={npsScore === score}
                        onClick={() => setNpsScore(score)}
                        className={`h-11 min-w-[44px] rounded-lg border text-sm font-bold font-mono transition-all active:scale-95 flex items-center justify-center sm:w-auto ${
                          npsScore === score
                            ? score >= 9
                              ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-500/30'
                              : score >= 7
                              ? 'bg-amber-500 text-white border-amber-500 ring-2 ring-amber-500/30'
                              : 'bg-red-500 text-white border-red-500 ring-2 ring-red-500/30'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Qualitative open feedback */}
                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label htmlFor="positive-feedback" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      ¿Qué es lo que más le gusta del sistema?
                    </label>
                    <textarea
                      id="positive-feedback"
                      rows={2}
                      value={qualitative.loQueMasGusta}
                      onChange={(e) => setQualitative({ ...qualitative, loQueMasGusta: e.target.value })}
                      placeholder="Aspectos positivos o funciones útiles..."
                      className="w-full min-h-24 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-base outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label htmlFor="improvement-feedback" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      ¿Qué es lo que más debería mejorarse?
                    </label>
                    <textarea
                      id="improvement-feedback"
                      rows={2}
                      value={qualitative.loQueDebeMejorar}
                      onChange={(e) => setQualitative({ ...qualitative, loQueDebeMejorar: e.target.value })}
                      placeholder="Dificultades o funciones a corregir..."
                      className="w-full min-h-24 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-base outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Navigation (Mobile responsive with comfortable touch targets) */}
            <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={goToPrevStep}
                className="flex min-h-12 w-full items-center justify-center gap-1.5 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold transition-colors hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 sm:w-auto sm:py-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </button>

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  Continuar a Categoría {currentStep + 1}
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-7 py-3 sm:py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      Guardando en Firebase...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Finalizar y Enviar Evaluación
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 6: COMPLETION SUMMARY */}
        {currentStep === 6 && completedSubmission && (
          <div className="py-8 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-1">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                ¡Evaluación Guardada con Éxito!
              </h2>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                <User className="w-3.5 h-3.5" />
                <span>Evaluado: <strong>{completedSubmission.participantName}</strong> ({completedSubmission.role})</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sus respuestas han sido almacenadas en Firebase Firestore y sincronizadas en tiempo real con el panel analítico.
              </p>
            </div>

            {/* Score summary badge */}
            {(() => {
              const interp = getScoreInterpretation(completedSubmission.globalScore);
              return (
                <div className="max-w-xs mx-auto p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-2 shadow-xs">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Puntuación Global (0-100)
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                      {completedSubmission.globalScore}
                    </span>
                    <span className="text-xs text-slate-400">/ 100</span>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${interp.badgeClass}`}>
                    {interp.label}
                  </span>
                </div>
              );
            })()}

            <div className="text-xs text-slate-400 font-mono">
              Código de confirmación: <strong>{completedSubmission.participantCode}</strong>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => {
                  setAnswers({});
                  setCurrentStep(0);
                  setConsentAccepted(null);
                  setQualitative({ loQueMasGusta: '', loQueDebeMejorar: '', dificultadConcreta: '', funcionDeseada: '' });
                }}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Llenar otra respuesta
              </button>

              <button
                type="button"
                onClick={onGoToDashboard}
                className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-sm"
              >
                <BarChart3 className="w-4 h-4" />
                Acceder al Panel de Resultados
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
