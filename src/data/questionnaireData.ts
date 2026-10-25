export interface QuestionItem {
  code: string;
  category: 'ux' | 'ui' | 'rol' | 'accesibilidad' | 'satisfaccion';
  title: string;
  text: string;
  dimension: string;
  role?: 'all' | 'estudiante' | 'docente' | 'directivo';
}

export interface DimensionConfig {
  id: string;
  name: string;
  category: 'UX' | 'UI' | 'ROL' | 'ACC' | 'SAT';
  description: string;
}

export const CATEGORIES_CONFIG = [
  { id: 'ux', name: '1. Experiencia de Usuario (UX)', description: 'Utilidad, facilidad, navegación y prevención de errores', count: 10 },
  { id: 'ui', name: '2. Interfaz Visual (UI)', description: 'Organización, colores, tipografía y diseño adaptable móvil', count: 9 },
  { id: 'rol', name: '3. Funciones según Rol', description: 'Tareas académicas y operativas clave para tu rol escolar', count: 8 },
  { id: 'accesibilidad', name: '4. Accesibilidad e Inclusión', description: 'Inclusión WCAG 2.2, contraste, ampliación y facilidad de uso', count: 6 },
  { id: 'satisfaccion', name: '5. Satisfacción Global', description: 'Grado de agrado, cumplimiento y recomendación (NPS)', count: 5 },
];

export const DIMENSIONS: Record<string, DimensionConfig> = {
  ux_general: {
    id: 'ux_general',
    name: 'Experiencia de Usuario (UX)',
    category: 'UX',
    description: 'Utilidad, facilidad de aprendizaje, navegación, control y formularios.',
  },
  ui_visual: {
    id: 'ui_visual',
    name: 'Interfaz Visual y Móvil (UI)',
    category: 'UI',
    description: 'Organización visual, tipografía, contraste, legibilidad y diseño responsive.',
  },
  rol_especifico: {
    id: 'rol_especifico',
    name: 'Módulo Específico de Rol',
    category: 'ROL',
    description: 'Herramientas específicas del rol (estudiante, docente o directivo).',
  },
  accesibilidad: {
    id: 'accesibilidad',
    name: 'Accesibilidad e Inclusión',
    category: 'ACC',
    description: 'Cumplimiento WCAG 2.2 y acceso igualitario según la Convención ONU.',
  },
  satisfaccion: {
    id: 'satisfaccion',
    name: 'Satisfacción Global',
    category: 'SAT',
    description: 'Nivel global de satisfacción, cumplimiento de expectativas y lealtad.',
  },
};

// 1. CATEGORÍA UX (Máximo 10 preguntas)
export const UX_QUESTIONS: QuestionItem[] = [
  {
    code: 'UX01',
    category: 'ux',
    title: 'Utilidad y Tareas',
    text: 'El sistema me permite realizar las actividades académicas o administrativas de mi rol de forma eficiente.',
    dimension: 'ux_general',
  },
  {
    code: 'UX02',
    category: 'ux',
    title: 'Ahorro de Tiempo',
    text: 'El sistema ayuda a ahorrar tiempo frente a procesos manuales en papel o consultas presenciales.',
    dimension: 'ux_general',
  },
  {
    code: 'UX03',
    category: 'ux',
    title: 'Facilidad de Aprendizaje',
    text: 'Aprendí a utilizar la plataforma rápidamente; las opciones del menú e instrucciones son claras.',
    dimension: 'ux_general',
  },
  {
    code: 'UX04',
    category: 'ux',
    title: 'Consistencia',
    text: 'El sistema funciona de manera similar y coherente en todos sus diferentes módulos y pantallas.',
    dimension: 'ux_general',
  },
  {
    code: 'UX05',
    category: 'ux',
    title: 'Navegación y Orientación',
    text: 'Sé en qué sección me encuentro en todo momento y el sistema muestra claramente qué acción se está ejecutando.',
    dimension: 'ux_general',
  },
  {
    code: 'UX06',
    category: 'ux',
    title: 'Control y Corrección',
    text: 'Puedo cancelar una acción antes de confirmarla y corregir fácilmente un dato ingresado por error.',
    dimension: 'ux_general',
  },
  {
    code: 'UX07',
    category: 'ux',
    title: 'Formularios y Errores',
    text: 'Los formularios piden solo los datos necesarios y avisan claramente cuando introduzco un dato incorrecto.',
    dimension: 'ux_general',
  },
  {
    code: 'UX08',
    category: 'ux',
    title: 'Conservación de Información',
    text: 'El sistema conserva la información ingresada cuando ocurre un error temporal o falla de conexión.',
    dimension: 'ux_general',
  },
  {
    code: 'UX09',
    category: 'ux',
    title: 'Privacidad y Seguridad',
    text: 'Me siento seguro utilizando el sistema y considero que la privacidad de mis datos escolares está protegida.',
    dimension: 'ux_general',
  },
  {
    code: 'UX10',
    category: 'ux',
    title: 'Confianza en los Datos',
    text: 'Confío en la información y resultados de calificaciones, asistencias y boletines que muestra el sistema.',
    dimension: 'ux_general',
  },
];

// 2. CATEGORÍA UI (Máximo 9 preguntas)
export const UI_QUESTIONS: QuestionItem[] = [
  {
    code: 'UI01',
    category: 'ui',
    title: 'Organización Visual',
    text: 'La distribución de los elementos en pantalla es ordenada y la información más importante se identifica rápidamente.',
    dimension: 'ui_visual',
  },
  {
    code: 'UI02',
    category: 'ui',
    title: 'Tablas y Paneles',
    text: 'Las tablas de calificaciones, tarjetas y paneles informativos son fáciles de leer e interpretar.',
    dimension: 'ui_visual',
  },
  {
    code: 'UI03',
    category: 'ui',
    title: 'Botones e Íconos',
    text: 'Los botones de guardar, editar, cancelar y eliminar son fáciles de distinguir y tienen un tamaño adecuado.',
    dimension: 'ui_visual',
  },
  {
    code: 'UI04',
    category: 'ui',
    title: 'Tipografía y Letra',
    text: 'El tamaño de la tipografía y los títulos permiten una lectura cómoda desde cualquier pantalla.',
    dimension: 'ui_visual',
  },
  {
    code: 'UI05',
    category: 'ui',
    title: 'Contraste y Colores',
    text: 'El contraste entre el texto y el fondo facilita la lectura sin cansar la vista.',
    dimension: 'ui_visual',
  },
  {
    code: 'UI06',
    category: 'ui',
    title: 'Diferenciación de Estados',
    text: 'Los colores utilizados ayudan a diferenciar estados (aprobado, reprobado, inasistencia) sin depender solo del color.',
    dimension: 'ui_visual',
  },
  {
    code: 'UI07',
    category: 'ui',
    title: 'Diseño Responsive',
    text: 'El sistema se adapta correctamente al tamaño de mi pantalla (computador de escritorio, portátil o tablet).',
    dimension: 'ui_visual',
  },
  {
    code: 'UI08',
    category: 'ui',
    title: 'Experiencia Móvil',
    text: 'Puedo utilizar el sistema cómodamente desde un teléfono celular sin necesidad de desplazamientos excesivos.',
    dimension: 'ui_visual',
  },
  {
    code: 'UI09',
    category: 'ui',
    title: 'Alertas Visuales',
    text: 'Las alertas visuales y mensajes del sistema llaman la atención oportunamente sin resultar confusas o excesivas.',
    dimension: 'ui_visual',
  },
];

// 3. CATEGORÍA ROL ESPECÍFICO (Máximo 8 preguntas por rol)
export const ROLE_QUESTIONS_MAP: Record<'estudiante' | 'docente' | 'directivo', QuestionItem[]> = {
  estudiante: [
    {
      code: 'EST01',
      category: 'rol',
      title: 'Consulta de Calificaciones',
      text: 'Puedo consultar mis calificaciones y comprender cómo se presentan mis resultados académicos sin dificultad.',
      dimension: 'rol_especifico',
      role: 'estudiante',
    },
    {
      code: 'EST02',
      category: 'rol',
      title: 'Control de Asistencia',
      text: 'Puedo revisar mi asistencia e inasistencias por materia y fecha con total claridad.',
      dimension: 'rol_especifico',
      role: 'estudiante',
    },
    {
      code: 'EST03',
      category: 'rol',
      title: 'Horario Escolar',
      text: 'Puedo consultar mi horario de clases rápidamente desde mi dispositivo.',
      dimension: 'rol_especifico',
      role: 'estudiante',
    },
    {
      code: 'EST04',
      category: 'rol',
      title: 'Boletines de Calificaciones',
      text: 'Puedo visualizar o descargar mi boletín académico sin dificultad técnica.',
      dimension: 'rol_especifico',
      role: 'estudiante',
    },
    {
      code: 'EST05',
      category: 'rol',
      title: 'Exámenes Activos',
      text: 'Puedo identificar fácilmente los exámenes programados y el proceso para presentarlos es claro.',
      dimension: 'rol_especifico',
      role: 'estudiante',
    },
    {
      code: 'EST06',
      category: 'rol',
      title: 'Avance en Evaluaciones',
      text: 'El sistema muestra mi avance y preguntas restantes durante la realización de un examen.',
      dimension: 'rol_especifico',
      role: 'estudiante',
    },
    {
      code: 'EST07',
      category: 'rol',
      title: 'Alertas Académicas',
      text: 'Las alertas académicas son claras y sé cómo marcar una alerta como leída.',
      dimension: 'rol_especifico',
      role: 'estudiante',
    },
    {
      code: 'EST08',
      category: 'rol',
      title: 'Comunicación',
      text: 'Sé cómo comunicarme con un docente o director de grupo a través de la plataforma.',
      dimension: 'rol_especifico',
      role: 'estudiante',
    },
  ],
  docente: [
    {
      code: 'DOC01',
      category: 'rol',
      title: 'Cursos Asignados',
      text: 'Puedo encontrar rápidamente mis cursos y grupos asignados en el período académico activo.',
      dimension: 'rol_especifico',
      role: 'docente',
    },
    {
      code: 'DOC02',
      category: 'rol',
      title: 'Registro de Notas',
      text: 'El registro y corrección de calificaciones es ágil, claro y evita errores de digitación.',
      dimension: 'rol_especifico',
      role: 'docente',
    },
    {
      code: 'DOC03',
      category: 'rol',
      title: 'Control de Asistencia',
      text: 'El registro de asistencia es rápido y diferencia asistencias, inasistencias, tardanzas o justificaciones.',
      dimension: 'rol_especifico',
      role: 'docente',
    },
    {
      code: 'DOC04',
      category: 'rol',
      title: 'Actividades y Porcentajes',
      text: 'Puedo crear actividades escolares y asignarles porcentajes ponderados correctamente.',
      dimension: 'rol_especifico',
      role: 'docente',
    },
    {
      code: 'DOC05',
      category: 'rol',
      title: 'Creación de Exámenes',
      text: 'El proceso para crear, configurar o generar preguntas de examen es intuitivo.',
      dimension: 'rol_especifico',
      role: 'docente',
    },
    {
      code: 'DOC06',
      category: 'rol',
      title: 'Resultados de Estudiantes',
      text: 'Puedo consultar las respuestas y calificaciones de mis estudiantes de forma organizada.',
      dimension: 'rol_especifico',
      role: 'docente',
    },
    {
      code: 'DOC07',
      category: 'rol',
      title: 'Horario y Solicitudes',
      text: 'Puedo consultar mi horario y enviar mensajes o solicitudes a la administración educativa.',
      dimension: 'rol_especifico',
      role: 'docente',
    },
    {
      code: 'DOC08',
      category: 'rol',
      title: 'Dirección de Grupo',
      text: 'Si soy director de grupo, puedo consultar y registrar observaciones del grupo adecuadamente.',
      dimension: 'rol_especifico',
      role: 'docente',
    },
  ],
  directivo: [
    {
      code: 'ADM01',
      category: 'rol',
      title: 'Panel Administrativo',
      text: 'El panel presenta un resumen institucional útil y claro para la toma de decisiones.',
      dimension: 'rol_especifico',
      role: 'directivo',
    },
    {
      code: 'ADM02',
      category: 'rol',
      title: 'Gestión de Usuarios y Matrícula',
      text: 'Puedo crear usuarios, matricular estudiantes y asignar docentes sin complicaciones.',
      dimension: 'rol_especifico',
      role: 'directivo',
    },
    {
      code: 'ADM03',
      category: 'rol',
      title: 'Cursos y Asignaciones',
      text: 'Puedo crear cursos, materias y asignar directores de grupo correctamente.',
      dimension: 'rol_especifico',
      role: 'directivo',
    },
    {
      code: 'ADM04',
      category: 'rol',
      title: 'Organización de Horarios',
      text: 'Puedo crear, modificar y organizar horarios escolares de forma eficiente.',
      dimension: 'rol_especifico',
      role: 'directivo',
    },
    {
      code: 'ADM05',
      category: 'rol',
      title: 'Generación de Boletines',
      text: 'Puedo consultar y generar boletines consolidados por período sin dificultad.',
      dimension: 'rol_especifico',
      role: 'directivo',
    },
    {
      code: 'ADM06',
      category: 'rol',
      title: 'Alertas Institucionales',
      text: 'Puedo enviar comunicados o alertas masivas y verificar su estado de envío y lectura.',
      dimension: 'rol_especifico',
      role: 'directivo',
    },
    {
      code: 'ADM07',
      category: 'rol',
      title: 'Configuración de Períodos',
      text: 'La apertura, cierre y bloqueo de notas y asistencia es fácil de configurar.',
      dimension: 'rol_especifico',
      role: 'directivo',
    },
    {
      code: 'ADM08',
      category: 'rol',
      title: 'Prevención de Errores Críticos',
      text: 'El sistema solicita confirmación en acciones delicadas y reduce el trabajo administrativo manual.',
      dimension: 'rol_especifico',
      role: 'directivo',
    },
  ],
};

// 4. CATEGORÍA ACCESIBILIDAD (Máximo 6 preguntas)
export const ACCESSIBILITY_QUESTIONS: QuestionItem[] = [
  {
    code: 'ACC01',
    category: 'accesibilidad',
    title: 'Inclusión General',
    text: 'Puedo utilizar el sistema aunque tenga dificultades visuales, auditivas, motoras o de concentración.',
    dimension: 'accesibilidad',
  },
  {
    code: 'ACC02',
    category: 'accesibilidad',
    title: 'Claridad en el Lenguaje',
    text: 'Los textos utilizan un lenguaje claro, directo y fácil de comprender para toda la comunidad.',
    dimension: 'accesibilidad',
  },
  {
    code: 'ACC03',
    category: 'accesibilidad',
    title: 'Operabilidad sin Depender del Mouse',
    text: 'Los formularios y menús pueden utilizarse con teclado o facilidades táctiles sin depender solo del mouse.',
    dimension: 'accesibilidad',
  },
  {
    code: 'ACC04',
    category: 'accesibilidad',
    title: 'Ampliación de Contenido',
    text: 'Puedo ampliar el tamaño de la pantalla o texto sin perder funcionalidad ni desconfigurar la vista.',
    dimension: 'accesibilidad',
  },
  {
    code: 'ACC05',
    category: 'accesibilidad',
    title: 'Comodidad Visual',
    text: 'La interfaz evita movimientos bruscos o parpadeos que puedan causar molestias o fatiga visual.',
    dimension: 'accesibilidad',
  },
  {
    code: 'ACC06',
    category: 'accesibilidad',
    title: 'Igualdad de Oportunidades',
    text: 'Considero que el sistema escolar promueve el acceso a la información en igualdad de condiciones.',
    dimension: 'accesibilidad',
  },
];

// 5. CATEGORÍA SATISFACCIÓN (Máximo 5 preguntas)
export const SATISFACTION_QUESTIONS: QuestionItem[] = [
  {
    code: 'SAT01',
    category: 'satisfaccion',
    title: 'Satisfacción Global',
    text: 'En general, estoy satisfecho con el funcionamiento y servicio del Sistema de Gestión Escolar.',
    dimension: 'satisfaccion',
  },
  {
    code: 'SAT02',
    category: 'satisfaccion',
    title: 'Agrado de Uso',
    text: 'Considero que la plataforma es agradable, cómoda y confiable para realizar mis tareas.',
    dimension: 'satisfaccion',
  },
  {
    code: 'SAT03',
    category: 'satisfaccion',
    title: 'Recomendación Institucional',
    text: 'Recomendaría el uso de este sistema a otros integrantes de la comunidad escolar.',
    dimension: 'satisfaccion',
  },
  {
    code: 'SAT04',
    category: 'satisfaccion',
    title: 'Cumplimiento de Expectativas',
    text: 'El sistema cumple satisfactoriamente con las necesidades que tengo para mi rol.',
    dimension: 'satisfaccion',
  },
  {
    code: 'SAT05',
    category: 'satisfaccion',
    title: 'Continuidad de Uso',
    text: 'Prefiero continuar utilizando este sistema frente a métodos tradicionales o manuales.',
    dimension: 'satisfaccion',
  },
];

export const LIKERT_OPTIONS = [
  { value: 1, label: '1 - Totalmente en desacuerdo', shortLabel: '1: Muy en desacuerdo' },
  { value: 2, label: '2 - En desacuerdo', shortLabel: '2: En desacuerdo' },
  { value: 3, label: '3 - Ni de acuerdo ni en desacuerdo', shortLabel: '3: Neutro' },
  { value: 4, label: '4 - De acuerdo', shortLabel: '4: De acuerdo' },
  { value: 5, label: '5 - Totalmente de acuerdo', shortLabel: '5: Muy de acuerdo' },
  { value: 0, label: 'N/A - No aplica o no he utilizado esta función', shortLabel: 'N/A' },
];

export interface SurveySubmission {
  id: string;
  participantCode: string;
  participantName: string;
  submittedAt: string;
  role: 'estudiante' | 'docente' | 'directivo';
  frequency: string;
  device: string;
  techExperience: string;
  accessibilityNeeds: string[];
  answers: Record<string, number>; // code -> 1-5 (0 is N/A)
  npsScore: number; // 0 to 10
  qualitative: {
    loQueMasGusta: string;
    loQueDebeMejorar: string;
    dificultadConcreta?: string;
    funcionDeseada?: string;
  };
  dimensionScores: Record<string, number>; // dimension_id -> 0-100 score
  globalScore: number;
}

// Helper to get all questions for a given role (at most 38 total questions, categorized into max 10 per category)
export function getAllQuestionsForRole(role: 'estudiante' | 'docente' | 'directivo'): QuestionItem[] {
  return [
    ...UX_QUESTIONS,
    ...UI_QUESTIONS,
    ...(ROLE_QUESTIONS_MAP[role] || []),
    ...ACCESSIBILITY_QUESTIONS,
    ...SATISFACTION_QUESTIONS,
  ];
}

// Computes score by dimension using: (suma de respuestas válidas / número de respuestas válidas) * 20
export function calculateDimensionScores(
  answers: Record<string, number>,
  role: 'estudiante' | 'docente' | 'directivo'
): { dimensionScores: Record<string, number>; globalScore: number } {
  const allQ = getAllQuestionsForRole(role);
  const dimensionGroups: Record<string, number[]> = {};

  allQ.forEach((q) => {
    const val = answers[q.code];
    if (val && val >= 1 && val <= 5) {
      if (!dimensionGroups[q.dimension]) {
        dimensionGroups[q.dimension] = [];
      }
      dimensionGroups[q.dimension].push(val);
    }
  });

  const dimensionScores: Record<string, number> = {};
  let totalSum = 0;
  let totalCount = 0;

  Object.keys(DIMENSIONS).forEach((dimKey) => {
    const list = dimensionGroups[dimKey] || [];
    if (list.length > 0) {
      const avg = list.reduce((a, b) => a + b, 0) / list.length;
      dimensionScores[dimKey] = Math.round(avg * 20 * 10) / 10;
      totalSum += list.reduce((a, b) => a + b, 0);
      totalCount += list.length;
    } else {
      dimensionScores[dimKey] = 0;
    }
  });

  const globalScore = totalCount > 0 ? Math.round((totalSum / totalCount) * 20 * 10) / 10 : 0;

  return { dimensionScores, globalScore };
}

export function getScoreInterpretation(score: number): {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  badgeClass: string;
} {
  if (score >= 90) {
    return {
      label: 'Excelente',
      color: '#10b981',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-700 dark:text-emerald-400',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800',
    };
  }
  if (score >= 75) {
    return {
      label: 'Buena',
      color: '#22c55e',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-700 dark:text-green-400',
      badgeClass: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-950/70 dark:text-green-300 dark:border-green-800',
    };
  }
  if (score >= 60) {
    return {
      label: 'Aceptable con mejoras',
      color: '#eab308',
      bgColor: 'bg-yellow-500/10',
      textColor: 'text-yellow-700 dark:text-yellow-400',
      badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950/70 dark:text-yellow-300 dark:border-yellow-800',
    };
  }
  if (score >= 40) {
    return {
      label: 'Deficiente',
      color: '#f97316',
      bgColor: 'bg-orange-500/10',
      textColor: 'text-orange-700 dark:text-orange-400',
      badgeClass: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/70 dark:text-orange-300 dark:border-orange-800',
    };
  }
  return {
    label: 'Muy deficiente',
    color: '#ef4444',
    bgColor: 'bg-red-500/10',
    textColor: 'text-red-700 dark:text-red-400',
    badgeClass: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/70 dark:text-red-300 dark:border-red-800',
  };
}

// Generates random user code in standard format e.g. user001, user042, user189
export function generateUserCode(customNum?: number): string {
  const num = customNum !== undefined ? customNum : Math.floor(Math.random() * 900) + 1;
  return `user${String(num).padStart(3, '0')}`;
}
