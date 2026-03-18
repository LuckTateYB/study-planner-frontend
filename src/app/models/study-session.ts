/**
 * Sesión individual de estudio retornada por el backend
 */
export interface SessionInfo {
  course: string;
  startTime: string;  // "HH:mm"
  duration: number;   // horas
}

/**
 * Plan de estudio para un día específico
 */
export interface DayPlan {
  date: string;         // "YYYY-MM-DD"
  sessions: SessionInfo[];
}

/**
 * Respuesta completa del endpoint POST /plan/generate
 */
export interface PlanResponse {
  studyPlan: DayPlan[];
}

/**
 * Payload que se envía al backend para generar el plan
 */
export interface PlanRequest {
  courses: { name: string }[];
  exams: { course: string; date: string }[];
  hoursPerDay: number;
  preferredStudyTime: 'MORNING' | 'AFTERNOON' | 'EVENING';
}

/**
 * Fila aplanada para mostrar en la tabla del cronograma
 */
export interface StudyTableRow {
  date: string;
  startTime: string;
  course: string;
  duration: number;
  difficulty?: number; // 1–5
}
