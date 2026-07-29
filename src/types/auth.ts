export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'customer';
}
export interface AuthResponse {
  token: string;
  user?: User;
}