import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Preferences {
  hoursPerDay: number;
  preferredStudyTime: 'MORNING' | 'AFTERNOON' | 'EVENING';
}

/**
 * Componente para configurar las preferencias de estudio:
 * - Horas disponibles por día (1–12)
 * - Franja horaria preferida: MORNING / AFTERNOON / EVENING
 */
@Component({
  selector: 'app-preferences-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <div class="card-header">
        <span class="card-icon">⚙️</span>
        <h2 class="card-title">Preferencias</h2>
      </div>

      <div class="form-grid">
        <!-- Horas por día -->
        <div class="input-group">
          <label class="input-label" for="hours">Horas de estudio por día</label>
          <div class="hours-control">
            <button class="stepper-btn" (click)="decrement()" [disabled]="preferences.hoursPerDay <= 1">−</button>
            <input
              id="hours"
              type="number"
              [(ngModel)]="preferences.hoursPerDay"
              (ngModelChange)="onPreferencesChange()"
              min="1"
              max="12"
              class="hours-input"
            />
            <button class="stepper-btn" (click)="increment()" [disabled]="preferences.hoursPerDay >= 12">+</button>
          </div>
          <p *ngIf="preferences.hoursPerDay < 1 || preferences.hoursPerDay > 12" class="form-error">
            ⚠ Debe ser entre 1 y 12 horas.
          </p>
        </div>

        <!-- Franja horaria -->
        <div class="input-group">
          <label class="input-label">Franja horaria preferida</label>
          <div class="time-slots">
            <button
              *ngFor="let slot of timeSlots"
              class="slot-btn"
              [class.slot-btn--active]="preferences.preferredStudyTime === slot.value"
              (click)="selectSlot(slot.value)"
            >
              <span class="slot-icon">{{ slot.icon }}</span>
              <span class="slot-label">{{ slot.label }}</span>
              <span class="slot-hours">{{ slot.hours }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; }
    .card-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.25rem; }
    .card-icon { font-size: 1.3rem; }
    .card-title { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin: 0; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    @media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }
    .input-group {}
    .input-label { display: block; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.5rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    .hours-control { display: flex; align-items: center; gap: 0.5rem; }
    .stepper-btn {
      width: 36px; height: 36px; border: 1.5px solid var(--border); background: var(--bg);
      color: var(--text-primary); border-radius: 8px; font-size: 1.1rem; cursor: pointer;
      display: flex; align-items: center; justify-content: center; transition: all 0.2s;
    }
    .stepper-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
    .stepper-btn:disabled { opacity: 0.35; cursor: not-allowed; }
    .hours-input {
      width: 72px; text-align: center; padding: 0.5rem; border: 1.5px solid var(--border);
      border-radius: 8px; background: var(--bg); color: var(--text-primary);
      font-size: 1.1rem; font-weight: 700;
    }
    .hours-input:focus { outline: none; border-color: var(--accent); }
    .form-error { color: var(--danger); font-size: 0.82rem; margin-top: 0.4rem; }
    .time-slots { display: flex; gap: 0.6rem; }
    .slot-btn {
      flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;
      padding: 0.75rem 0.5rem; border: 1.5px solid var(--border); border-radius: 10px;
      background: var(--bg); cursor: pointer; transition: all 0.2s;
    }
    .slot-btn:hover { border-color: var(--accent); }
    .slot-btn--active { border-color: var(--accent); background: var(--accent-soft); }
    .slot-icon { font-size: 1.3rem; }
    .slot-label { font-size: 0.78rem; font-weight: 700; color: var(--text-primary); }
    .slot-hours { font-size: 0.7rem; color: var(--text-secondary); }
  `]
})
export class PreferencesFormComponent implements OnInit {

  @Output() preferencesChange = new EventEmitter<Preferences>();

  preferences: Preferences = {
    hoursPerDay: 3,
    preferredStudyTime: 'EVENING'
  };

  /** Configuración visual de las franjas horarias */
  readonly timeSlots = [
    { value: 'MORNING'   as const, label: 'Mañana',  icon: '🌅', hours: '06:00 – 12:00' },
    { value: 'AFTERNOON' as const, label: 'Tarde',   icon: '☀️', hours: '12:00 – 18:00' },
    { value: 'EVENING'   as const, label: 'Noche',   icon: '🌙', hours: '18:00 – 24:00' },
  ];

  ngOnInit(): void {
    this.onPreferencesChange();
  }

  selectSlot(value: Preferences['preferredStudyTime']): void {
    this.preferences.preferredStudyTime = value;
    this.onPreferencesChange();
  }

  increment(): void {
    if (this.preferences.hoursPerDay < 12) {
      this.preferences.hoursPerDay++;
      this.onPreferencesChange();
    }
  }

  decrement(): void {
    if (this.preferences.hoursPerDay > 1) {
      this.preferences.hoursPerDay--;
      this.onPreferencesChange();
    }
  }

  onPreferencesChange(): void {
    this.preferencesChange.emit({ ...this.preferences });
  }
}
