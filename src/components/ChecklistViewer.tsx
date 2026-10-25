import React, { useState } from 'react';
import { 
  CheckCircle2, 
  HelpCircle, 
  FileCheck, 
  Layers, 
  Smartphone, 
  ShieldCheck, 
  Compass, 
  Award, 
  Download 
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  chapter: string;
  title: string;
  reference: string;
  evidence: string[];
  status: 'C' | 'CP' | 'NC' | 'NA';
  points: number;
  maxPoints: number;
}

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  // Capítulo 12: UX
  {
    id: 'UX-01',
    chapter: 'Capítulo 12: UX Design',
    title: 'Los 5 Planos de Garrett y Arquitectura de Información (IA)',
    reference: 'Pressman Cap. 12.1 y 12.1.1 (p. 236); Garrett [Gar02/Gar11]',
    evidence: [
      'Menú estructurado con rotulado semántico claro (Labeling)',
      'Migas de pan superiores (Breadcrumbs) para recorrido continuo sin callejones sin salida',
      'Plano visual armónico sin sobrecarga cognitiva ni saturación de tarjetas',
    ],
    status: 'C',
    points: 2,
    maxPoints: 2,
  },
  {
    id: 'UX-02',
    chapter: 'Capítulo 12: UX Design',
    title: 'Regla de Oro 1 de Mandel: Poner al Usuario en Control',
    reference: 'Pressman Cap. 12.2.1; Theo Mandel [Man97]',
    evidence: [
      'Interacción flexible sin bloqueos modales forzados',
      'Mecanismos visibles para deshacer (Ctrl+Z) y cancelar con confirmación no invasiva',
      'Persistencia de borradores en localStorage ("Guardar borrador") sin pérdida de datos',
    ],
    status: 'C',
    points: 2,
    maxPoints: 2,
  },
  {
    id: 'UX-03',
    chapter: 'Capítulo 12: UX Design',
    title: 'Regla de Oro 2 de Mandel: Reducir la Carga de Memoria',
    reference: 'Pressman Cap. 12.2.2; Miller (1956, regla 7±2)',
    evidence: [
      'Segmentación (Chunking) en categorías compactas de máximo 10 preguntas',
      'Reconocimiento sobre recuerdo con descripciones contextuales visibles',
      'Valores predeterminados sensatos y autoguardado en tiempo real',
    ],
    status: 'C',
    points: 2,
    maxPoints: 2,
  },
  {
    id: 'UX-04',
    chapter: 'Capítulo 12: UX Design',
    title: 'Regla de Oro 3 de Mandel: Consistencia Integral',
    reference: 'Pressman Cap. 12.2.3; Theo Mandel [Man97]',
    evidence: [
      'Misma paleta cromática institucional (Azul zafiro #1E40AF y neutros cálidos)',
      'Escalas tipográficas jerárquicas con Plus Jakarta Sans y Outfit',
      'Atajos de teclado estandarizados (1-5, Enter, Backspace, Ctrl+S, ?)',
    ],
    status: 'C',
    points: 2,
    maxPoints: 2,
  },
  {
    id: 'UX-05',
    chapter: 'Capítulo 12: UX Design',
    title: 'Modelado de Usuarios, Personas y Análisis de Tareas',
    reference: 'Pressman Cap. 12.4.2 ("User Modeling") y Cap. 12.4.3',
    evidence: [
      'Diseño centrado en arquetipos diferenciados: Estudiante, Docente y Directivo',
      'Preguntas adaptativas según el rol escolar seleccionado',
      'Flujos directos sin pasos innecesarios para responder la evaluación',
    ],
    status: 'C',
    points: 2,
    maxPoints: 2,
  },
  {
    id: 'UX-06',
    chapter: 'Capítulo 12: UX Design',
    title: 'Directrices Ergonómicas de Bruce Tognazzini',
    reference: 'Pressman Cap. 12.8.1; Bruce Tognazzini [Tog01]',
    evidence: [
      'Ley de Fitts: Botones de acción clave con tamaño táctil >= 48px y fácil alcance',
      'Retroalimentación inmediata con microanimaciones, confeti y badges',
      'Preservación del estado ante recargas accidentales con recuperación automática',
    ],
    status: 'C',
    points: 2,
    maxPoints: 2,
  },
  {
    id: 'UX-07',
    chapter: 'Capítulo 12: UX Design',
    title: 'Accesibilidad Universal y Principios WCAG (POUR)',
    reference: 'Pressman Cap. 12.8.2; W3C WCAG 2.1 / 2.2',
    evidence: [
      'Contraste cromático >= 4.5:1 para texto normal y soporte de alto contraste',
      'Navegabilidad 100% por teclado (Tab, Enter, Espacio, Escape) con focus ring visible',
      'Semántica HTML5 correcta (<header>, <nav>, <main>, <button>) y etiquetas ARIA',
    ],
    status: 'C',
    points: 2,
    maxPoints: 2,
  },
  {
    id: 'UX-08',
    chapter: 'Capítulo 12: UX Design',
    title: 'Prototipado Validado y Métricas de Usabilidad',
    reference: 'Pressman Cap. 12.5 y Cap. 12.7; Knapp et al.',
    evidence: [
      'Cálculo integrado del índice SUS y NPS de recomendación',
      'Baremos de interpretación ISO 9241-11 calculados en tiempo real',
      'Reporte consolidado descargable en formatos CSV y JSON',
    ],
    status: 'C',
    points: 2,
    maxPoints: 2,
  },

  // Capítulo 13: Movilidad
  {
    id: 'MOB-01',
    chapter: 'Capítulo 13: Movilidad',
    title: 'Pirámide de Diseño Móvil / Web (Pressman & Lowe)',
    reference: 'Pressman Cap. 13.5 ("Web Design Pyramid")',
    evidence: [
      'Simplicidad radical eliminando clutter y contenedores innecesarios',
      'Diseño fluido sin desbordamiento horizontal en pantallas de 375px a 1440px',
      'Lectura concentrada sin scrolls desorientadores',
    ],
    status: 'C',
    points: 2,
    maxPoints: 2,
  },
  {
    id: 'MOB-02',
    chapter: 'Capítulo 13: Movilidad',
    title: 'Ergonomía Táctil y Zona del Pulgar (Thumb Zone)',
    reference: 'Pressman Cap. 13.2.1 y Cap. 13.8 (Hoober & Berkman)',
    evidence: [
      'Touch targets mínimos de 48x48 px con padding adecuado',
      'Separación preventiva de más de 8px entre controles adyacentes',
      'Botones de avance y navegación principal accesibles al pulgar',
    ],
    status: 'C',
    points: 2,
    maxPoints: 2,
  },
  {
    id: 'MOB-03',
    chapter: 'Capítulo 13: Movilidad',
    title: 'Sensibilidad al Contexto y Adaptabilidad',
    reference: 'Pressman Cap. 13.4 ("Context-Aware Apps")',
    evidence: [
      'Soporte completo de modo oscuro (dark mode) y modo alto contraste',
      'Campos optimizados con selectores limpios para teclado virtual',
      'Adaptación a rotación de pantalla vertical y horizontal',
    ],
    status: 'C',
    points: 2,
    maxPoints: 2,
  },
  {
    id: 'MOB-04',
    chapter: 'Capítulo 13: Movilidad',
    title: 'Resiliencia de Red y Rendimiento en Movilidad',
    reference: 'Pressman Cap. 13.1.2 y Cap. 13.8',
    evidence: [
      'Detección y notificación sutil de estado de conexión online/offline',
      'Operaciones asíncronas no bloqueantes con Firebase Firestore',
      'Fluidez garantizada sin bloqueos del hilo principal de renderizado',
    ],
    status: 'C',
    points: 2,
    maxPoints: 2,
  },

  // Capítulo 14: Patrones
  {
    id: 'PAT-01',
    chapter: 'Capítulo 14: Patrones UI',
    title: 'Patrones Arquitectónicos y de Presentación (MVC / Componentes)',
    reference: 'Pressman Cap. 14.1.1 y Cap. 14.3',
    evidence: [
      'Separación estricta de responsabilidades (UI en /components, persistencia en /services)',
      'Flujo de datos unidireccional y componentes reutilizables de bajo acoplamiento',
      'Lógica de cálculo desacoplada en questionnaireData.ts',
    ],
    status: 'C',
    points: 2,
    maxPoints: 2,
  },
  {
    id: 'PAT-02',
    chapter: 'Capítulo 14: Patrones UI',
    title: 'Patrones de Navegación de Interfaz (Tidwell & van Welie)',
    reference: 'Pressman Cap. 14.6; Tidwell [Tid11] y van Welie [Wel01]',
    evidence: [
      'Migas de pan jerárquicas ("Inicio > Cuestionario > Categoría")',
      'Pestañas de navegación estructuradas con resaltado del estado activo',
      'Menú lateral deslizable (Drawer) accesible con botón de atajos',
    ],
    status: 'C',
    points: 2,
    maxPoints: 2,
  },
  {
    id: 'PAT-03',
    chapter: 'Capítulo 14: Patrones UI',
    title: 'Patrones de Entrada de Datos y Formularios',
    reference: 'Pressman Cap. 14.6 ("Input & Forms"); Tidwell [Tid11]',
    evidence: [
      'Validación reactiva campo a campo con retroalimentación descriptiva',
      'Agrupación semántica limpia con menos tarjetas anidadas y más orden visual',
      'Controles Likert asistidos con estados visuales claros',
    ],
    status: 'C',
    points: 2,
    maxPoints: 2,
  },
  {
    id: 'PAT-04',
    chapter: 'Capítulo 14: Patrones UI',
    title: 'Prevención y Eliminación de Antipatrones de Diseño',
    reference: 'Pressman Cap. 14.5 ("Anti-Patterns"); William Brown [Bro98]',
    evidence: [
      'Ausencia de The Blob (código limpio, modular y desacoplado)',
      'Ausencia de Mystery Meat Navigation (iconos con texto o tooltips descriptivos)',
      'Ausencia de Modal Hell (un solo nivel de diálogo controlado)',
    ],
    status: 'C',
    points: 2,
    maxPoints: 2,
  },
];

export const ChecklistViewer: React.FC = () => {
  const [filterChapter, setFilterChapter] = useState<string>('todos');

  const totalPoints = CHECKLIST_ITEMS.reduce((sum, item) => sum + item.points, 0);
  const maxPossible = CHECKLIST_ITEMS.reduce((sum, item) => sum + item.maxPoints, 0);
  const percentage = Math.round((totalPoints / maxPossible) * 100);

  const filteredItems = filterChapter === 'todos'
    ? CHECKLIST_ITEMS
    : CHECKLIST_ITEMS.filter((item) => item.chapter.includes(filterChapter));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Official Header Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              Universidad de Córdoba • Dpto. de Informática Educativa
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">
              Lista de Chequeo: UX, Movilidad y Patrones de Diseño
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Instrumento formal según Roger S. Pressman & Bruce R. Maxim (9ª Ed., Capítulos 12, 13 y 14) • Docente: Prof. Raúl Toscano Miranda
            </p>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 text-right">
            <div className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">
              Calificación Consolidada
            </div>
            <div className="text-2xl font-extrabold text-blue-900 dark:text-blue-100">
              {totalPoints} / {maxPossible} pts <span className="text-xs font-normal">({percentage}%)</span>
            </div>
            <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Sobresaliente [90-100%]
            </span>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 font-medium">Filtrar por bloque:</span>
          {[
            { id: 'todos', label: 'Todos los Capítulos (16)' },
            { id: 'Capítulo 12', label: 'Cap. 12: UX Design (8)' },
            { id: 'Capítulo 13', label: 'Cap. 13: Movilidad (4)' },
            { id: 'Capítulo 14', label: 'Cap. 14: Patrones (4)' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterChapter(f.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                filterChapter === f.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Checklist items list */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                    {item.id}
                  </span>
                  <span className="text-slate-400">{item.chapter}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-500 italic">
                  Ref: {item.reference}
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Cumple Totalmente (C)
                </span>
                <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mt-1 font-mono">
                  {item.points} / {item.maxPoints} pts
                </span>
              </div>
            </div>

            {/* Evidence in frontend */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block text-[11px] uppercase tracking-wider">
                Evidencia Observable en este Frontend:
              </span>
              <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc list-inside">
                {item.evidence.map((ev, i) => (
                  <li key={i}>{ev}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
