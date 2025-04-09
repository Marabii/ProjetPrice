export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
}

export interface ApiResponse<T> {
  message: string;
  status: 'SUCCESS' | 'FAILURE';
  errors: string[] | null;
  data: T | null;
}
