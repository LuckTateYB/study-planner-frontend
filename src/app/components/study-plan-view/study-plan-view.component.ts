import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DayPlan, StudyTableRow } from '../../models/study-session';
import { Course } from '../../models/course';
import { StudyPlanService } from '../../services/study-plan.service';

interface CalendarCell {
  date?: string;
  sessions: StudyTableRow[];
}

/**
 * Componente de visualización del cronograma de estudio.
 * Muestra una tabla filtrable con columnas: Fecha, Hora Inicio, Curso, Duración.
 * Incluye colores diferenciados por dificultad del curso.
 */
@Component({
  selector: 'app-study-plan-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="view-wrapper">

      <!-- Estado: sin datos -->
      <div *ngIf="!studyPlan || studyPlan.length === 0" class="empty-state">
        <div class="empty-icon">📖</div>
        <p>Completa los formularios y presiona <strong>Generar Plan</strong> para ver tu cronograma.</p>
      </div>

      <!-- Panel de resultados -->
      <ng-container *ngIf="studyPlan && studyPlan.length > 0">

        <!-- Resumen -->
        <div class="summary-bar">
          <div class="summary-stat">
            <span class="stat-value">{{ totalDays }}</span>
            <span class="stat-label">Días</span>
          </div>
          <div class="summary-stat">
            <span class="stat-value">{{ totalSessions }}</span>
            <span class="stat-label">Sesiones</span>
          </div>
          <div class="summary-stat">
            <span class="stat-value">{{ totalHours }}h</span>
            <span class="stat-label">Horas totales</span>
          </div>
          <div class="summary-stat">
            <span class="stat-value">{{ uniqueCourses }}</span>
            <span class="stat-label">Cursos</span>
          </div>
        </div>

        <!-- Selección de vista -->
        <div class="view-toggle">
          <button (click)="viewMode = 'agenda'" [class.active]="viewMode === 'agenda'">Agenda</button>
          <button (click)="viewMode = 'calendar'" [class.active]="viewMode === 'calendar'">Calendario</button>
        </div>

        <!-- Filtros -->
        <div class="filters-bar">
          <div class="filter-group">
            <label class="filter-label">Filtrar por curso</label>
            <select [(ngModel)]="filterCourse" (ngModelChange)="applyFilters()" class="filter-select">
              <option value="">Todos</option>
              <option *ngFor="let c of courseNames" [value]="c">{{ c }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Filtrar por fecha</label>
            <select [(ngModel)]="filterDate" (ngModelChange)="applyFilters()" class="filter-select">
              <option value="">Todas</option>
              <option *ngFor="let d of availableDates" [value]="d">{{ formatDate(d) }}</option>
            </select>
          </div>
          <button class="btn-clear" (click)="clearFilters()" *ngIf="filterCourse || filterDate">
            ✕ Limpiar filtros
          </button>
          <span class="filter-info">{{ filteredRows.length }} sesión(es)</span>
        </div>

        <!-- Vista Agenda -->
        <div *ngIf="viewMode === 'agenda'">
          <div class="table-container">
            <table class="schedule-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora Inicio</th>
                  <th>Curso</th>
                  <th>Duración</th>
                  <th>Dificultad</th>
                </tr>
              </thead>
              <tbody>
                <ng-container *ngFor="let row of filteredRows; let i = index">
                  <tr *ngIf="i === 0 || filteredRows[i-1].date !== row.date" class="day-separator">
                    <td colspan="5">
                      <span class="day-label">📅 {{ formatDate(row.date) }}</span>
                    </td>
                  </tr>
                  <tr class="session-row" [class]="getDiffClass(row.difficulty)">
                    <td class="td-date">{{ formatDate(row.date) }}</td>
                    <td class="td-time"><span class="time-chip">{{ row.startTime }}</span></td>
                    <td class="td-course">
                      <span class="course-dot" [class]="getDiffClass(row.difficulty)"></span>
                      {{ row.course }}
                    </td>
                    <td class="td-duration">{{ row.duration }}h</td>
                    <td class="td-diff">
                      <span class="diff-badge" [class]="getDiffClass(row.difficulty)" *ngIf="row.difficulty">
                        {{ getDiffLabel(row.difficulty) }}
                      </span>
                      <span *ngIf="!row.difficulty" class="text-muted">—</span>
                    </td>
                  </tr>
                </ng-container>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Vista Calendario -->
        <div *ngIf="viewMode === 'calendar'" class="calendar-wrapper">
          <p *ngIf="calendarMonths.length === 0" class="empty-hint">
            No hay sesiones en el rango de fecha seleccionado.
          </p>
          <ng-container *ngFor="let month of calendarMonths">
            <div class="month-grid">
              <div class="month-title">📆 {{ month.monthLabel }}</div>
              <div class="calendar-grid">
                <div class="weekday">Lun</div>
                <div class="weekday">Mar</div>
                <div class="weekday">Mié</div>
                <div class="weekday">Jue</div>
                <div class="weekday">Vie</div>
                <div class="weekday">Sáb</div>
                <div class="weekday">Dom</div>

                <ng-container *ngFor="let cell of month.cells">
                  <div class="calendar-cell" [class.empty]="!cell.date">
                    <div *ngIf="cell.date" class="cell-inner">
                      <div class="cell-date">{{ formatDate(cell.date) }}</div>
                      <div *ngIf="cell.sessions.length === 0" class="no-sessions">sin sesiones</div>
                      <div *ngFor="let s of cell.sessions" class="cell-session" [class]="getDiffClass(s.difficulty)">
                        <strong>{{ s.startTime }}</strong> {{ s.course }} ({{ s.duration }}h)
                        <button *ngIf="s.id" type="button" class="session-edit-btn" (click)="startEditing(s)" title="Editar sesión">✏️</button>
                      </div>
                    </div>
                  </div>
                </ng-container>
              </div>
            </div>
          </ng-container>

          <div *ngIf="editingRow" class="edit-panel">
            <div class="edit-panel-header">
              <div>
                <strong>Editar sesión</strong>
                <div class="edit-panel-meta">{{ editingRow.course }} · {{ formatDate(editingRow.date) }} · {{ editingRow.startTime }}</div>
              </div>
              <button type="button" class="btn-clear" (click)="cancelEditing()">✕ Cerrar</button>
            </div>
            <div class="edit-panel-body">
              <div class="edit-field">
                <label>Fecha</label>
                <input type="date" [(ngModel)]="editDate" />
              </div>
              <div class="edit-field">
                <label>Hora inicio</label>
                <input type="time" [(ngModel)]="editTime" />
              </div>
              <div class="edit-field">
                <label>Duración (h)</label>
                <input type="number" min="1" [(ngModel)]="editDuration" />
              </div>
            </div>
            <div class="edit-panel-actions">
              <button type="button" class="btn-clear" (click)="cancelEditing()">Cancelar</button>
              <button type="button" class="btn-save" (click)="saveEditing()" [disabled]="isSaving">
                {{ isSaving ? 'Guardando...' : 'Guardar cambios' }}
              </button>
            </div>
            <p *ngIf="editError" class="edit-error">{{ editError }}</p>
            <p *ngIf="editSuccess" class="edit-success">{{ editSuccess }}</p>
          </div>
        </div>

        <!-- Sin resultados tras filtro -->
        <p *ngIf="filteredRows.length === 0" class="empty-hint">
          No hay sesiones que coincidan con los filtros seleccionados.
        </p>
      </ng-container>
    </div>
  `,
  styles: [`
    .view-wrapper { display: flex; flex-direction: column; gap: 1rem; }
    .empty-state {
      text-align: center; padding: 3rem 2rem;
      border: 2px dashed var(--border); border-radius: 12px;
      color: var(--text-secondary);
    }
    .empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
    /* Resumen */
    .summary-bar {
      display: flex; gap: 1rem; flex-wrap: wrap;
      background: var(--accent-soft); border-radius: 10px; padding: 1rem 1.25rem;
    }
    .summary-stat { display: flex; flex-direction: column; align-items: center; flex: 1; min-width: 80px; }
    .stat-value { font-size: 1.5rem; font-weight: 800; color: var(--accent); }
    .stat-label { font-size: 0.72rem; color: var(--text-secondary); text-transform: uppercase; }
    /* Filtros */
    .filters-bar {
      display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: flex-end;
      padding: 0.75rem; background: var(--surface); border: 1px solid var(--border);
      border-radius: 10px;
    }
    .filter-group { display: flex; flex-direction: column; gap: 4px; }
    .filter-label { font-size: 0.72rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 600; }
    .filter-select {
      padding: 0.45rem 0.75rem; border: 1.5px solid var(--border); border-radius: 8px;
      background: var(--bg); color: var(--text-primary); font-size: 0.88rem;
    }
    .filter-select:focus { outline: none; border-color: var(--accent); }
    .btn-clear {
      padding: 0.45rem 0.9rem; border: 1.5px solid var(--border); border-radius: 8px;
      background: none; color: var(--danger); cursor: pointer; font-size: 0.85rem;
      align-self: flex-end; transition: all 0.2s;
    }
    .btn-clear:hover { background: rgba(239,68,68,0.1); }
    .filter-info { align-self: flex-end; margin-left: auto; font-size: 0.82rem; color: var(--text-secondary); }

    .view-toggle {
      display: flex; gap: 0.5rem; margin-bottom: 0.75rem;
    }
    .view-toggle button {
      padding: 0.4rem 0.8rem; border-radius: 8px; border: 1px solid var(--border);
      background: var(--surface); color: var(--text-primary); cursor: pointer;
    }
    .view-toggle button.active {
      background: var(--accent); color: white; border-color: var(--accent);
    }

    .calendar-wrapper { display: flex; flex-direction: column; gap: 1rem; }
    .month-grid { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
    .month-title { background: var(--surface); padding: 0.5rem 0.75rem; font-weight: 700; }
    .calendar-grid {
      display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px;
      border-top: 1px solid var(--border); background: var(--border);
    }
    .weekday, .calendar-cell { padding: 0.35rem 0.5rem; font-size: 0.72rem; text-align: center; }
    .weekday { background: var(--surface); font-weight: 700; color: var(--text-secondary); }
    .calendar-cell { min-height: 70px; background: var(--bg); }
    .calendar-cell.empty { background: var(--surface); }
    .cell-inner { display: flex; flex-direction: column; gap: 0.2rem; max-height: 100%; overflow: hidden; text-align: left; }
    .cell-date { font-size: 0.73rem; font-weight: 700; color: var(--text-secondary); }
    .cell-session { font-size: 0.7rem; margin-top: 0.1rem; border-radius: 8px; padding: 2px 5px; color: #1f2937; }
    .cell-session.diff-1 { background: rgba(16,185,129,0.2); }
    .cell-session.diff-2 { background: rgba(234,179,8,0.2); }
    .cell-session.diff-3 { background: rgba(249,115,22,0.2); }
    .cell-session.diff-4 { background: rgba(239,68,68,0.2); }
    .cell-session.diff-5 { background: rgba(168,85,247,0.2); }
    .no-sessions { color: var(--text-secondary); font-size: 0.72rem; }
    .session-edit-btn {
      margin-left: 0.25rem;
      background: transparent;
      border: none;
      color: var(--text-primary);
      cursor: pointer;
      font-size: 0.82rem;
      padding: 0 2px;
    }
    .session-edit-btn:hover { text-decoration: underline; }
    .edit-panel {
      border: 1px solid var(--border);
      background: var(--surface);
      border-radius: 12px;
      padding: 1rem;
      display: grid;
      gap: 1rem;
    }
    .edit-panel-header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
    .edit-panel-meta { font-size: 0.82rem; color: var(--text-secondary); margin-top: 0.15rem; }
    .edit-panel-body { display: grid; gap: 0.9rem; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }
    .edit-field { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.82rem; }
    .edit-field input {
      padding: 0.55rem 0.75rem; border: 1px solid var(--border); border-radius: 10px; background: var(--bg); color: var(--text-primary);
    }
    .edit-panel-actions { display: flex; justify-content: flex-end; gap: 0.75rem; flex-wrap: wrap; }
    .btn-save {
      padding: 0.55rem 1rem; border: none; border-radius: 10px;
      background: var(--accent); color: white; cursor: pointer;
    }
    .btn-save:disabled { opacity: 0.55; cursor: not-allowed; }
    .edit-error { color: var(--danger); margin: 0; }
    .edit-success { color: var(--success); margin: 0; }

    /* Tabla */
    .table-container { overflow-x: auto; border-radius: 10px; border: 1px solid var(--border); }
    .schedule-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    .schedule-table thead tr {
      background: var(--surface);
    }
    .schedule-table th {
      padding: 0.75rem 1rem; text-align: left;
      font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;
      color: var(--text-secondary); font-weight: 700;
      border-bottom: 2px solid var(--border);
    }
    .day-separator td {
      background: var(--surface); padding: 0.4rem 1rem;
      border-top: 2px solid var(--border);
    }
    .day-label { font-size: 0.82rem; font-weight: 700; color: var(--text-secondary); }
    .session-row td {
      padding: 0.65rem 1rem; border-bottom: 1px solid var(--border);
      vertical-align: middle;
    }
    .session-row:hover td { background: var(--hover); }
    .td-date { color: var(--text-secondary); white-space: nowrap; }
    .time-chip {
      background: var(--accent-soft); color: var(--accent);
      padding: 2px 10px; border-radius: 99px; font-weight: 700; font-size: 0.85rem;
    }
    .td-course { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; }
    .course-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    /* Dificultad */
    .diff-badge {
      display: inline-block; padding: 2px 10px; border-radius: 99px;
      font-size: 0.75rem; font-weight: 700;
    }
    .text-muted { color: var(--text-secondary); }
    /* Clases de dificultad */
    .diff-1, .course-dot.diff-1 { background: #d1fae5 !important; color: #065f46 !important; }
    .diff-2, .course-dot.diff-2 { background: #fef9c3 !important; color: #854d0e !important; }
    .diff-3, .course-dot.diff-3 { background: #fed7aa !important; color: #9a3412 !important; }
    .diff-4, .course-dot.diff-4 { background: #fecaca !important; color: #991b1b !important; }
    .diff-5, .course-dot.diff-5 { background: #f3e8ff !important; color: #6b21a8 !important; }
    /* Row tinting por dificultad */
    .session-row.diff-1 td { background: rgba(209,250,229,0.12); }
    .session-row.diff-2 td { background: rgba(254,249,195,0.12); }
    .session-row.diff-3 td { background: rgba(254,215,170,0.12); }
    .session-row.diff-4 td { background: rgba(254,202,202,0.12); }
    .session-row.diff-5 td { background: rgba(243,232,255,0.12); }
    .empty-hint { color: var(--text-secondary); font-size: 0.85rem; font-style: italic; }
  `]
})
export class StudyPlanViewComponent implements OnChanges {

  /** Plan recibido desde el padre después de llamar al backend */
  @Input() studyPlan: DayPlan[] = [];

  /** Mapa de dificultades: { "Mathematics": 4, "Programming": 2 } */
  @Input() difficultyMap: Record<string, number> = {};

  /** Filas aplanadas para la tabla */
  allRows: StudyTableRow[] = [];
  filteredRows: StudyTableRow[] = [];

  /** Vista: agenda o calendario */
  viewMode: 'agenda' | 'calendar' = 'agenda';
  calendarMonths: Array<{ monthLabel: string; cells: CalendarCell[] }> = [];

  /** Opciones de filtro */
  courseNames: string[] = [];
  availableDates: string[] = [];
  filterCourse = '';
  filterDate = '';

  /** Estadísticas de resumen */
  totalDays = 0;
  totalSessions = 0;
  totalHours = 0;
  uniqueCourses = 0;

  /** Edición de sesión */
  editingRow?: StudyTableRow;
  editDate = '';
  editTime = '';
  editDuration = 1;
  editError = '';
  editSuccess = '';
  isSaving = false;

  constructor(private studyPlanService: StudyPlanService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['studyPlan'] || changes['difficultyMap']) {
      this.buildRows();
    }
  }

  /** Convierte el DayPlan[] en filas planas para la tabla */
  private buildRows(): void {
    this.allRows = [];

    for (const day of this.studyPlan) {
      for (const session of day.sessions) {
        this.allRows.push({
          id: session.id,
          date: day.date,
          startTime: session.startTime,
          course: session.course,
          duration: session.duration,
          difficulty: this.difficultyMap[session.course]
        });
      }
    }

    // Opciones de filtro
    this.courseNames = [...new Set(this.allRows.map(r => r.course))];
    this.availableDates = [...new Set(this.allRows.map(r => r.date))];

    // Estadísticas
    this.totalDays = this.studyPlan.length;
    this.totalSessions = this.allRows.length;
    this.totalHours = this.allRows.reduce((sum, r) => sum + r.duration, 0);
    this.uniqueCourses = this.courseNames.length;

    this.applyFilters();
  }

  /** Aplica los filtros activos */
  applyFilters(): void {
    this.filteredRows = this.allRows.filter(row => {
      const matchCourse = !this.filterCourse || row.course === this.filterCourse;
      const matchDate   = !this.filterDate   || row.date === this.filterDate;
      return matchCourse && matchDate;
    });
    this.buildCalendar();
  }

  /** Construye la vista de calendario por mes */
  private buildCalendar(): void {
    if (this.filteredRows.length === 0) {
      this.calendarMonths = [];
      return;
    }

    const sessionsByDate: Record<string, StudyTableRow[]> = {};
    for (const row of this.filteredRows) {
      sessionsByDate[row.date] = sessionsByDate[row.date] || [];
      sessionsByDate[row.date].push(row);
    }

    const dates = Object.keys(sessionsByDate).sort();
    const firstDate = new Date(dates[0]);
    const lastDate = new Date(dates[dates.length - 1]);

    const months = [] as Array<{ monthLabel: string; cells: CalendarCell[] }>;
    const iterator = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);

    while (iterator <= lastDate) {
      const year = iterator.getFullYear();
      const month = iterator.getMonth();
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);
      const firstWeekday = (monthStart.getDay() + 6) % 7; // Lunes=0

      const cells: CalendarCell[] = [];
      for (let i = 0; i < firstWeekday; i++) {
        cells.push({ sessions: [] });
      }

      for (let day = 1; day <= monthEnd.getDate(); day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        cells.push({ date: dateStr, sessions: sessionsByDate[dateStr] || [] });
      }

      const monthLabel = monthStart.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      months.push({ monthLabel, cells });
      iterator.setMonth(iterator.getMonth() + 1);
    }

    this.calendarMonths = months;
  }

  /** Limpia todos los filtros */
  clearFilters(): void {
    this.filterCourse = '';
    this.filterDate = '';
    this.applyFilters();
  }

  startEditing(row: StudyTableRow): void {
    this.editingRow = { ...row };
    this.editDate = row.date;
    this.editTime = row.startTime;
    this.editDuration = row.duration;
    this.editError = '';
    this.editSuccess = '';
  }

  cancelEditing(): void {
    this.editingRow = undefined;
    this.editError = '';
    this.editSuccess = '';
  }

  saveEditing(): void {
    if (!this.editingRow?.id) {
      this.editError = 'No se puede editar esta sesión porque no tiene ID.';
      return;
    }

    if (!this.editDate || !this.editTime || this.editDuration < 1) {
      this.editError = 'Completa fecha, hora y duración válidas.';
      return;
    }

    this.isSaving = true;
    this.editError = '';
    this.editSuccess = '';

    const payload = {
      date: this.editDate,
      startTime: this.editTime,
      duration: this.editDuration
    };

    this.studyPlanService.updateSession(this.editingRow.id, payload).subscribe({
      next: () => {
        this.editSuccess = 'Sesión actualizada correctamente.';
        this.isSaving = false;
        this.updateLocalSession();
      },
      error: (err: Error) => {
        this.editError = err.message;
        this.isSaving = false;
      }
    });
  }

  private updateLocalSession(): void {
    if (!this.editingRow?.id) return;

    const row = this.allRows.find(r => r.id === this.editingRow?.id);
    if (!row) return;

    row.date = this.editDate;
    row.startTime = this.editTime;
    row.duration = this.editDuration;
    this.applyFilters();
  }

  /** Formatea YYYY-MM-DD → DD/MM/YYYY */
  formatDate(iso: string): string {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  /** Retorna la clase CSS de dificultad */
  getDiffClass(diff?: number): string {
    return diff ? `diff-${diff}` : '';
  }

  /** Etiqueta textual de dificultad */
  getDiffLabel(diff: number): string {
    return ['', 'Fácil', 'Básico', 'Medio', 'Difícil', 'Experto'][diff] || '';
  }
}
