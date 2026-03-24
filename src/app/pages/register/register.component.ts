// src/app/pages/register/register.component.ts

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Crear cuenta</h2>
        <p class="subtitle">Study Planner</p>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="field">
            <label>Nombre</label>
            <input type="text" formControlName="name" placeholder="Tu nombre" />
            <small *ngIf="form.get('name')?.invalid && form.get('name')?.touched">
              El nombre es obligatorio.
            </small>
          </div>

          <div class="field">
            <label>Email</label>
            <input type="email" formControlName="email" placeholder="tu@email.com" />
            <small *ngIf="form.get('email')?.invalid && form.get('email')?.touched">
              Email inválido.
            </small>
          </div>

          <div class="field">
            <label>Contraseña</label>
            <input type="password" formControlName="password" placeholder="••••••" />
            <small *ngIf="form.get('password')?.invalid && form.get('password')?.touched">
              Mínimo 6 caracteres.
            </small>
          </div>

          <p *ngIf="errorMessage" class="error">{{ errorMessage }}</p>

          <button type="submit" [disabled]="form.invalid || loading">
            {{ loading ? 'Registrando...' : 'Crear cuenta' }}
          </button>
        </form>

        <p class="link">¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .auth-card { background: white; padding: 2rem; border-radius: 8px; width: 100%; max-width: 400px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h2 { margin: 0 0 0.25rem; }
    .subtitle { color: #666; margin: 0 0 1.5rem; }
    .field { display: flex; flex-direction: column; gap: 0.375rem; margin-bottom: 1rem; }
    label { font-size: 0.875rem; font-weight: 500; }
    input { padding: 0.5rem 0.75rem; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 0.9rem; }
    button { width: 100%; padding: 0.625rem; background: #4f46e5; color: white; border: none; border-radius: 6px; font-size: 0.9rem; cursor: pointer; margin-top: 0.5rem; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    small, .error { color: #ef4444; font-size: 0.8rem; }
    .link { text-align: center; margin-top: 1rem; font-size: 0.875rem; }
    a { color: #4f46e5; }
  `]
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      name:     ['', [Validators.required]],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMessage = '';

    this.authService.register(this.form.value).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.message ?? 'Error al crear la cuenta.';
      }
    });
  }
}