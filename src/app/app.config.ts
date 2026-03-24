// src/app/app.config.ts

import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    // withInterceptors registra el interceptor funcional que adjunta el token JWT
    // en cada request saliente automáticamente
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};