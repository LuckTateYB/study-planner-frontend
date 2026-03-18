/**
 * Modelo de Examen: vincula un curso con su fecha de examen
 */
export interface Exam {
  course: string;
  date: string; // ISO 8601: "YYYY-MM-DD"
}
