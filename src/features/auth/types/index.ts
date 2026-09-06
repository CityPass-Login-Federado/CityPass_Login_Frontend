export interface LoginRequest {
  username: string;
  password: string;
  clientId: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LoginFormValues {
  username: string;
  password: string;
  rememberMe: boolean;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
}
