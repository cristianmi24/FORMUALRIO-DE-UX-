import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc,
  getDocs, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  SurveySubmission, 
  calculateDimensionScores,
  getAllQuestionsForRole,
  generateUserCode
} from '../data/questionnaireData';

const COLLECTION_NAME = 'survey_responses';

export async function submitSurvey(submission: SurveySubmission): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, submission.id);
    await setDoc(docRef, {
      ...submission,
      firestoreTimestamp: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${submission.id}`);
  }
}

export async function deleteSurveyResponse(submissionId: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, submissionId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${submissionId}`);
  }
}

export function subscribeToSurveys(
  onData: (submissions: SurveySubmission[]) => void,
  onError?: (error: Error) => void
): () => void {
  try {
    const q = query(collection(db, COLLECTION_NAME));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const results: SurveySubmission[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as SurveySubmission;
          results.push(data);
        });
        // Sort descending by submittedAt
        results.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        onData(results);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
        } catch (wrapped) {
          if (onError && wrapped instanceof Error) onError(wrapped);
        }
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
  }
}

export async function getAllSurveys(): Promise<SurveySubmission[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    const results: SurveySubmission[] = [];
    snap.forEach((d) => {
      results.push(d.data() as SurveySubmission);
    });
    results.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
  }
}

// Generates academic seed dataset across roles to demonstrate real-time analytics
export async function seedDemoResponses(): Promise<number> {
  const sampleData: Array<Partial<SurveySubmission>> = [
    {
      role: 'estudiante',
      frequency: 'Todos los días',
      device: 'Teléfono celular',
      techExperience: 'Alta',
      accessibilityNeeds: ['No'],
      npsScore: 8,
      qualitative: {
        loQueMasGusta: 'Poder consultar las notas y el horario desde el móvil sin tener que preguntar en coordinación.',
        loQueDebeMejorar: 'La vista de exámenes activos a veces tarda unos segundos en cargar cuando hay mala señal.',
        dificultadConcreta: 'Al descargar el boletín en PDF desde el navegador del celular me costó encontrar dónde se guardó.',
        funcionDeseada: 'Notificaciones push cuando el profesor suba una nueva nota.',
      },
    },
    {
      role: 'estudiante',
      frequency: 'Varias veces por semana',
      device: 'Computador portátil',
      techExperience: 'Media',
      accessibilityNeeds: ['Dificultad visual'],
      npsScore: 9,
      qualitative: {
        loQueMasGusta: 'Los colores y el contraste son claros, puedo leer bien las observaciones del docente.',
        loQueDebeMejorar: 'Aumentar aún más el tamaño de los botones de confirmación.',
        dificultadConcreta: 'Ninguna crítica grave, solo que la sesión caduca algo rápido.',
        funcionDeseada: 'Modo oscuro configurable y recordatorios de entregas.',
      },
    },
    {
      role: 'docente',
      frequency: 'Todos los días',
      device: 'Computador portátil',
      techExperience: 'Media',
      accessibilityNeeds: ['No'],
      npsScore: 8,
      qualitative: {
        loQueMasGusta: 'El registro de calificaciones por períodos y el cálculo automático de promedios ahorra mucho tiempo.',
        loQueDebeMejorar: 'Agilizar el llamado de asistencia cuando son grupos numerosos de más de 35 estudiantes.',
        dificultadConcreta: 'Al corregir una nota me pidió doble confirmación, lo cual es seguro pero un poco lento.',
        funcionDeseada: 'Exportación rápida de planillas de asistencia en formato Excel oficial.',
      },
    },
    {
      role: 'docente',
      frequency: 'Todos los días',
      device: 'Computador de escritorio',
      techExperience: 'Alta',
      accessibilityNeeds: ['No'],
      npsScore: 9,
      qualitative: {
        loQueMasGusta: 'El módulo de generación de exámenes y asignación de porcentajes por actividad es muy intuitivo.',
        loQueDebeMejorar: 'Permitir clonar actividades de un período al siguiente.',
        dificultadConcreta: 'Encontrar el historial de inasistencias acumuladas de un estudiante específico.',
        funcionDeseada: 'Chat directo o canal de comunicados con directores de grupo.',
      },
    },
    {
      role: 'directivo',
      frequency: 'Todos los días',
      device: 'Computador de escritorio',
      techExperience: 'Media',
      accessibilityNeeds: ['No'],
      npsScore: 9,
      qualitative: {
        loQueMasGusta: 'El resumen ejecutivo de matrícula, alertas tempranas de deserción y cierre de períodos.',
        loQueDebeMejorar: 'La importación masiva de estudiantes debería tener una plantilla con previsualización de errores.',
        dificultadConcreta: 'Desbloquear notas fuera de fecha para un docente requirió varios clics en permisos.',
        funcionDeseada: 'Generación masiva de boletines consolidados por grado en un solo archivo comprimido.',
      },
    },
    {
      role: 'directivo',
      frequency: 'Varias veces por semana',
      device: 'Tablet',
      techExperience: 'Alta',
      accessibilityNeeds: ['No'],
      npsScore: 10,
      qualitative: {
        loQueMasGusta: 'Excelente control de roles, auditoría de cambios y confiabilidad en la base de datos.',
        loQueDebeMejorar: 'Agregar filtros avanzados en la tabla de docentes por área académica.',
        dificultadConcreta: 'Adaptación en pantallas táctiles de 10 pulgadas en la asignación de horarios.',
        funcionDeseada: 'Firma digital integrada en los certificados y constancias de estudio.',
      },
    },
  ];

  let addedCount = 0;
  for (let i = 0; i < sampleData.length; i++) {
    const item = sampleData[i];
    const role = item.role as 'estudiante' | 'docente' | 'directivo';
    const id = `resp_demo_${Date.now()}_${i}`;
    const participantCode = generateUserCode(i + 1);

    // Generate balanced realistic Likert ratings for all category questions
    const answers: Record<string, number> = {};
    const allQ = getAllQuestionsForRole(role);

    allQ.forEach((q, idx) => {
      // Simulate realistic variance
      const variation = (idx + i) % 7 === 0 ? 3 : (idx % 3 === 0 ? 5 : 4);
      answers[q.code] = variation;
    });

      const participantName = `Participante de demostración ${String(i + 1).padStart(2, '0')}`;
      const { dimensionScores, globalScore } = calculateDimensionScores(answers, role);

      const submission: SurveySubmission = {
        id,
        participantCode,
        participantName,
        submittedAt: new Date(Date.now() - (sampleData.length - i) * 3600000 * 4).toISOString(),
      role,
      frequency: item.frequency || 'Todos los días',
      device: item.device || 'Computador portátil',
      techExperience: item.techExperience || 'Alta',
      accessibilityNeeds: item.accessibilityNeeds || ['No'],
      answers,
      npsScore: item.npsScore || 9,
      qualitative: item.qualitative || {
        loQueMasGusta: 'Interfaz clara y navegación ordenada.',
        loQueDebeMejorar: 'Tiempos de carga en informes pesados.',
        dificultadConcreta: 'Ninguna.',
        funcionDeseada: 'Recordatorios móviles.',
      },
      dimensionScores,
      globalScore,
    };

    await submitSurvey(submission);
    addedCount++;
  }

  return addedCount;
}

// Export to CSV format for ISO / statistical analysis
export function exportToCSV(submissions: SurveySubmission[]): void {
  if (submissions.length === 0) return;

  const headers = [
    'ID',
    'Codigo_Participante',
    'Nombre_Evaluado',
    'Fecha',
    'Rol',
    'Frecuencia',
    'Dispositivo',
    'Exp_Tecnologica',
    'Accesibilidad',
    'Puntuacion_Global',
    'NPS_0_10',
    'UX_General',
    'UI_Visual',
    'Rol_Especifico',
    'Accesibilidad',
    'Satisfaccion',
    'Lo_Que_Mas_Gusta',
    'Lo_Que_Debe_Mejorar',
    'Dificultad_Concreta',
    'Funcion_Deseada'
  ];

  const rows = submissions.map((s) => [
    `"${s.id}"`,
    `"${s.participantCode}"`,
    `"${s.participantName || 'Anónimo'}"`,
    `"${s.submittedAt}"`,
    `"${s.role}"`,
    `"${s.frequency}"`,
    `"${s.device}"`,
    `"${s.techExperience}"`,
    `"${s.accessibilityNeeds.join('; ')}"`,
    s.globalScore,
    s.npsScore,
    s.dimensionScores['ux_general'] || 0,
    s.dimensionScores['ui_visual'] || 0,
    s.dimensionScores['rol_especifico'] || 0,
    s.dimensionScores['accesibilidad'] || 0,
    s.dimensionScores['satisfaccion'] || 0,
    `"${(s.qualitative?.loQueMasGusta || '').replace(/"/g, '""')}"`,
    `"${(s.qualitative?.loQueDebeMejorar || '').replace(/"/g, '""')}"`,
    `"${(s.qualitative?.dificultadConcreta || '').replace(/"/g, '""')}"`,
    `"${(s.qualitative?.funcionDeseada || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `evaluacion_ux_ui_sistema_escolar_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
