// src/app/models/auth.ts

export interface AuthRequest {
  email: string;
  password: string;
  name?: string; // solo requerido en register
}

export interface AuthResponse {
  token: string;
  email: string;
  name: string;
  userId: number;
}