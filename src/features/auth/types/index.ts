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

export interface JwtClaims {
  sub: string;
  exp: number;
  preferred_username?: string;
  module?: string;
  groups?: string[];
  roles?: string[];
  role?: string;
  admin_scope?: string;
  token_use?: string;
  ver?: number;
  aud?: string | string[];
}

export type AdminScope = 'GENERAL' | 'MODULE';

export interface AuthSession {
  userId: string;
  username: string;
  module?: string;
  groups: string[];
  roles: string[];
  adminScope: AdminScope;
  expiresAt: number;
}
