import type { UserRole } from "./salon";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  role: UserRole
}
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user?: User;
}