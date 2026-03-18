import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Course } from '../../models/course';

/**
 * Componente para agregar cursos al plan de estudio.
 * Emite el listado actualizado de cursos al componente padre.
 */
@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <div class="card-header">
        <span class="card-icon">📚</span>
        <h2 class="card-title">Cursos</h2>
        <span class="badge">{{ courses.length }}</span>
      </div>

      <!-- Formulario para agregar un nuevo curso -->
      <div class="form-row">
        <div class="input-group">
          <input
            type="text"
            [(ngModel)]="newCourseName"
            placeholder="Nombre del curso"
            maxlength="60"
            class="form-input"
            (keyup.enter)="addCourse()"
            required
          />
        </div>

        <div class="input-group input-group--sm">
          <label class="input-label">Dificultad</label>
          <select [(ngModel)]="newDifficulty" class="form-select">
            <option [value]="1">1 – Muy fácil</option>
            <option [value]="2">2 – Fácil</option>
            <option [value]="3">3 – Medio</option>
            <option [value]="4">4 – Difícil</option>
            <option [value]="5">5 – Muy difícil</option>
          </select>
        </div>

        <button class="btn btn--primary" (click)="addCourse()" [disabled]="!newCourseName.trim()">
          + Agregar
        </button>
      </div>

      <!-- Error de validación -->
      <p *ngIf="showError" class="form-error">⚠ Ingresa un nombre válido para el curso.</p>

      <!-- Lista de cursos agregados -->
      <ul class="item-list" *ngIf="courses.length > 0">
        <li *ngFor="let course of courses; let i = index" class="item-row">
          <span class="diff-badge" [class]="'diff-' + course.difficulty">
            {{ course.difficulty }}
          </span>
          <span class="item-name">{{ course.name }}</span>
          <button class="btn-remove" (click)="removeCourse(i)" title="Eliminar">✕</button>
        </li>
      </ul>

      <p *ngIf="courses.length === 0" class="empty-hint">
        Aún no hay cursos. Agrega al menos uno para continuar.
      </p>
    </div>
  `,
  styles: [`
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; }
    .card-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.25rem; }
    .card-icon { font-size: 1.3rem; }
    .card-title { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin: 0; flex: 1; }
    .badge { background: var(--accent); color: white; border-radius: 99px; padding: 2px 10px; font-size: 0.78rem; font-weight: 700; }
    .form-row { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: flex-end; }
    .input-group { flex: 1; min-width: 160px; }
    .input-group--sm { flex: 0 0 150px; }
    .input-label { display: block; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 4px; }
    .form-input, .form-select {
      width: 100%; padding: 0.55rem 0.75rem; border: 1.5px solid var(--border);
      border-radius: 8px; background: var(--bg); color: var(--text-primary);
      font-size: 0.9rem; transition: border-color 0.2s;
    }
    .form-input:focus, .form-select:focus { outline: none; border-color: var(--accent); }
    .btn--primary {
      padding: 0.55rem 1.2rem; background: var(--accent); color: white;
      border: none; border-radius: 8px; font-weight: 600; cursor: pointer;
      transition: opacity 0.2s; white-space: nowrap;
    }
    .btn--primary:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn--primary:not(:disabled):hover { opacity: 0.85; }
    .form-error { color: var(--danger); font-size: 0.82rem; margin-top: 0.5rem; }
    .item-list { list-style: none; padding: 0; margin: 1rem 0 0; display: flex; flex-direction: column; gap: 0.5rem; }
    .item-row {
      display: flex; align-items: center; gap: 0.75rem;
      background: var(--bg); border: 1px solid var(--border);
      border-radius: 8px; padding: 0.5rem 0.75rem;
    }
    .item-name { flex: 1; font-size: 0.9rem; color: var(--text-primary); }
    .btn-remove {
      background: none; border: none; color: var(--text-secondary);
      cursor: pointer; font-size: 0.85rem; padding: 2px 6px;
      border-radius: 4px; transition: color 0.2s, background 0.2s;
    }
    .btn-remove:hover { color: var(--danger); background: rgba(239,68,68,0.1); }
    .empty-hint { color: var(--text-secondary); font-size: 0.85rem; font-style: italic; margin-top: 1rem; }
    /* Colores de dificultad */
    .diff-badge {
      min-width: 24px; height: 24px; display: inline-flex; align-items: center;
      justify-content: center; border-radius: 6px; font-size: 0.78rem; font-weight: 700;
    }
    .diff-1 { background: #d1fae5; color: #065f46; }
    .diff-2 { background: #fef9c3; color: #854d0e; }
    .diff-3 { background: #fed7aa; color: #9a3412; }
    .diff-4 { background: #fecaca; color: #991b1b; }
    .diff-5 { background: #f3e8ff; color: #6b21a8; }
  `]
})
export class CourseFormComponent {

  /** Emite el listado de cursos hacia el componente padre */
  @Output() coursesChange = new EventEmitter<Course[]>();

  /** Lista de cursos agregados */
  courses: Course[] = [];

  /** Campos del formulario */
  newCourseName = '';
  newDifficulty = 3;
  showError = false;

  /** Agrega un nuevo curso a la lista si el nombre es válido */
  addCourse(): void {
    const name = this.newCourseName.trim();
    if (!name) {
      this.showError = true;
      return;
    }
    this.showError = false;

    // Evitar duplicados
    if (this.courses.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      return;
    }

    this.courses = [...this.courses, { name, difficulty: this.newDifficulty }];
    this.newCourseName = '';
    this.newDifficulty = 3;
    this.coursesChange.emit(this.courses);
  }

  /** Elimina un curso por índice */
  removeCourse(index: number): void {
    this.courses = this.courses.filter((_, i) => i !== index);
    this.coursesChange.emit(this.courses);
  }
}
