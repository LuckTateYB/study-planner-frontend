import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CourseFormComponent }       from '../../components/course-form/course-form.component';
import { ExamFormComponent }         from '../../components/exam-form/exam-form.component';
import { PreferencesFormComponent, Preferences } from '../../components/preferences-form/preferences-form.component';
import { StudyPlanViewComponent }    from '../../components/study-plan-view/study-plan-view.component';
import { StudyPlanService }          from '../../services/study-plan.service';
import { Course }                    from '../../models/course';
import { Exam }                      from '../../models/exam';
import { DayPlan, PlanRequest }      from '../../models/study-session';

/**
 * Página principal del Study Planner.
 * Orquesta los formularios de cursos, exámenes y preferencias,
 * llama al backend y muestra el cronograma generado.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CourseFormComponent,
    ExamFormComponent,
    PreferencesFormComponent,
    StudyPlanViewComponent
  ],
  template: `
    <div class="page">

      <!-- ── Header ── -->
      <header class="page-header">
        <div class="header-inner">
          <div class="logo">
            <span class="logo-icon">🎓</span>
            <span class="logo-text">Study<strong>Planner</strong></span>
          </div>
          <p class="header-sub">Organiza tu estudio. Llegua a tus exámenes preparado.</p>
        </div>
      </header>

      <!-- ── Main content ── -->
      <main class="main-content">

        <!-- Columna izquierda: formularios -->
        <section class="forms-panel">

          <!-- Paso 1: Cursos -->
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-body">
              <app-course-form (coursesChange)="onCoursesChange($event)"></app-course-form>
            </div>
          </div>

          <!-- Paso 2: Exámenes -->
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-body">
              <app-exam-form
                [availableCourses]="courses"
                (examsChange)="onExamsChange($event)"
              ></app-exam-form>
            </div>
          </div>

          <!-- Paso 3: Preferencias -->
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-body">
              <app-preferences-form (preferencesChange)="onPreferencesChange($event)"></app-preferences-form>
            </div>
          </div>

          <!-- Botón generar -->
          <button
            class="btn-generate"
            (click)="generatePlan()"
            [disabled]="isLoading || !canGenerate"
          >
            <span *ngIf="!isLoading">🚀 Generar Plan de Estudio</span>
            <span *ngIf="isLoading" class="spinner-wrap">
              <span class="spinner"></span> Generando...
            </span>
          </button>

          <!-- Validación -->
          <p *ngIf="!canGenerate && triedSubmit" class="form-error form-error--block">
            ⚠ Agrega al menos un curso, un examen y verifica las preferencias antes de continuar.
          </p>

          <!-- Error del backend -->
          <div *ngIf="errorMessage" class="alert alert--error">
            <span>❌</span>
            <div>
              <strong>Error al generar el plan</strong>
              <p>{{ errorMessage }}</p>
            </div>
            <button class="alert-close" (click)="errorMessage = ''">✕</button>
          </div>

          <!-- Éxito -->
          <div *ngIf="successMessage" class="alert alert--success">
            <span>✅</span>
            <p>{{ successMessage }}</p>
            <button class="alert-close" (click)="successMessage = ''">✕</button>
          </div>

        </section>

        <!-- Columna derecha: cronograma -->
        <section class="plan-panel">
          <div class="panel-header">
            <h2 class="panel-title">📋 Cronograma de Estudio</h2>
          </div>
          <app-study-plan-view
            [studyPlan]="studyPlan"
            [difficultyMap]="difficultyMap"
          ></app-study-plan-view>
        </section>

      </main>
    </div>
  `,
  styles: [`
    /* ── Layout ── */
    .page { min-height: 100vh; display: flex; flex-direction: column; }
    .page-header {
      background: var(--surface); border-bottom: 1px solid var(--border);
      padding: 1.25rem 2rem;
    }
    .header-inner { max-width: 1400px; margin: 0 auto; }
    .logo { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.2rem; }
    .logo-icon { font-size: 1.6rem; }
    .logo-text { font-size: 1.4rem; color: var(--text-primary); letter-spacing: -0.02em; }
    .logo-text strong { color: var(--accent); }
    .header-sub { font-size: 0.85rem; color: var(--text-secondary); margin: 0; }
    .main-content {
      flex: 1; max-width: 1400px; width: 100%; margin: 0 auto;
      padding: 2rem; display: grid;
      grid-template-columns: 420px 1fr;
      gap: 2rem; align-items: start;
    }
    @media (max-width: 900px) {
      .main-content { grid-template-columns: 1fr; }
    }
    /* ── Steps ── */
    .forms-panel { display: flex; flex-direction: column; gap: 1.25rem; }
    .step { display: flex; gap: 1rem; align-items: flex-start; }
    .step-number {
      width: 32px; height: 32px; flex-shrink: 0; border-radius: 50%;
      background: var(--accent); color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.85rem; font-weight: 800; margin-top: 4px;
    }
    .step-body { flex: 1; }
    /* ── Botón generar ── */
    .btn-generate {
      width: 100%; padding: 0.85rem 1.5rem; border: none; border-radius: 10px;
      background: var(--accent); color: white; font-size: 1rem; font-weight: 700;
      cursor: pointer; transition: opacity 0.2s, transform 0.1s;
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
    }
    .btn-generate:not(:disabled):hover { opacity: 0.87; transform: translateY(-1px); }
    .btn-generate:disabled { opacity: 0.4; cursor: not-allowed; }
    .spinner-wrap { display: flex; align-items: center; gap: 0.5rem; }
    .spinner {
      width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    /* ── Alertas ── */
    .form-error { color: var(--danger); font-size: 0.85rem; }
    .form-error--block { padding: 0.75rem; background: rgba(239,68,68,0.08); border-radius: 8px; }
    .alert {
      display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.9rem 1rem;
      border-radius: 10px; font-size: 0.9rem;
    }
    .alert--error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: var(--text-primary); }
    .alert--success { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); color: var(--text-primary); }
    .alert strong { display: block; margin-bottom: 2px; }
    .alert p { margin: 0; font-size: 0.85rem; color: var(--text-secondary); }
    .alert-close {
      margin-left: auto; background: none; border: none; cursor: pointer;
      color: var(--text-secondary); font-size: 0.9rem; padding: 0 4px;
    }
    /* ── Panel del plan ── */
    .plan-panel { display: flex; flex-direction: column; gap: 1rem; }
    .panel-header { border-bottom: 2px solid var(--border); padding-bottom: 0.75rem; }
    .panel-title { font-size: 1.2rem; font-weight: 700; color: var(--text-primary); margin: 0; }
  `]
})
export class DashboardComponent {

  courses: Course[]    = [];
  exams: Exam[]        = [];
  preferences: Preferences = { hoursPerDay: 3, preferredStudyTime: 'EVENING' };

  studyPlan: DayPlan[] = [];

  /** Mapa de dificultad por curso para colorear la tabla */
  difficultyMap: Record<string, number> = {};

  isLoading    = false;
  errorMessage = '';
  successMessage = '';
  triedSubmit  = false;

  constructor(private studyPlanService: StudyPlanService) {}

  /** El plan se puede generar si hay al menos 1 curso y 1 examen */
  get canGenerate(): boolean {
    return this.courses.length > 0 && this.exams.length > 0;
  }

  onCoursesChange(courses: Course[]): void {
    this.courses = courses;
    // Reconstruir el mapa de dificultades
    this.difficultyMap = {};
    courses.forEach(c => {
      if (c.difficulty) this.difficultyMap[c.name] = c.difficulty;
    });
  }

  onExamsChange(exams: Exam[]): void {
    this.exams = exams;
  }

  onPreferencesChange(pref: Preferences): void {
    this.preferences = pref;
  }

  /** Construye el request y llama al backend */
  generatePlan(): void {
    this.triedSubmit = true;
    if (!this.canGenerate) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request: PlanRequest = {
      courses: this.courses.map(c => ({ name: c.name })),
      exams:   this.exams,
      hoursPerDay: this.preferences.hoursPerDay,
      preferredStudyTime: this.preferences.preferredStudyTime
    };

    this.studyPlanService.generatePlan(request).subscribe({
      next: (response) => {
        this.studyPlan = response.studyPlan;
        this.isLoading = false;
        const totalSessions = response.studyPlan.reduce((sum, d) => sum + d.sessions.length, 0);
        this.successMessage = `Plan generado exitosamente: ${response.studyPlan.length} días, ${totalSessions} sesiones de estudio.`;
      },
      error: (err: Error) => {
        this.errorMessage = err.message;
        this.isLoading = false;
      }
    });
  }
}
