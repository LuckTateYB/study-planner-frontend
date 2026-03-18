import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

/**
 * Rutas de la aplicación Study Planner.
 * La ruta raíz carga el dashboard principal.
 */
export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: '**', redirectTo: '' }
];
