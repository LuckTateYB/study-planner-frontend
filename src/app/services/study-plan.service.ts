import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PlanRequest, PlanResponse } from '../models/study-session';

/**
 * Servicio principal para comunicarse con el backend Spring Boot.
 * Consume el endpoint POST http://localhost:8080/plan/generate
 */
@Injectable({
  providedIn: 'root'
})
export class StudyPlanService {

  /** URL base del backend */
  private readonly apiUrl = 'http://localhost:8080/plan/generate';

  constructor(private http: HttpClient) {}

  /**
   * Envía la solicitud al backend y devuelve el plan de estudio generado.
   * @param request - Payload con cursos, exámenes, horas/día y franja horaria
   */
  generatePlan(request: PlanRequest): Observable<PlanResponse> {
    return this.http.post<PlanResponse>(this.apiUrl, request).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Maneja errores HTTP de forma centralizada.
   * Distingue entre errores de red y errores del servidor.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let message: string;

    if (error.status === 0) {
      // Error de red o el backend no está disponible
      message = 'No se pudo conectar al servidor. Verifica que el backend esté activo en http://localhost:8080';
    } else {
      // Error devuelto por el backend (4xx / 5xx)
      message = `Error del servidor (${error.status}): ${error.error?.message || error.message}`;
    }

    return throwError(() => new Error(message));
  }
}
