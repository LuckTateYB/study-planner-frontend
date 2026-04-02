import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PlanRequest, PlanResponse } from '../models/study-session';

@Injectable({
  providedIn: 'root'
})
export class StudyPlanService {

  /** URL base del backend */
  private readonly baseUrl = 'http://localhost:8080/plan';

  constructor(private http: HttpClient) {}

  /**
   * Envía la solicitud al backend y devuelve el plan de estudio generado.
   * @param request - Payload con cursos, exámenes, horas/día y franja horaria
   */
  generatePlan(request: PlanRequest): Observable<PlanResponse> {
    // userId eliminado del payload — viene del token en el header Authorization
    return this.http.post<PlanResponse>(`${this.baseUrl}/generate`, request).pipe(
      catchError(this.handleError)
    );
  }

  updateSession(id: number, data: Partial<{ date: string; startTime: string; duration: number; courseId: number }>): Observable<unknown> {
    return this.http.put(`${this.baseUrl}/sessions/${id}`, data).pipe(
      catchError(this.handleError)
    );
  }
 
  private handleError(error: HttpErrorResponse): Observable<never> {
    let message: string;
 
    if (error.status === 0) {
      message = 'No se pudo conectar al servidor. Verifica que el backend esté activo en http://localhost:8080';
    } else if (error.status === 401) {
      // 401 significa token inválido o expirado — AuthService maneja el logout
      message = 'Sesión expirada. Por favor inicia sesión nuevamente.';
    } else {
      message = `Error del servidor (${error.status}): ${error.error?.message || error.message}`;
    }
 
    return throwError(() => new Error(message));
  }
}
