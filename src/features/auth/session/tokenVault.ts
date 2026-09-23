interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

let tokens: AuthTokens | null = null;

export const setAuthTokens = (
  accessToken: string,
  refreshToken: string,
): void => {
  if (!accessToken.trim() || !refreshToken.trim()) {
    throw new Error('La respuesta de autenticación no contiene ambos tokens');
  }

  tokens = { accessToken, refreshToken };
};

export const getAccessToken = (): string | null =>
  tokens?.accessToken ?? null;

export const getRefreshToken = (): string | null =>
  tokens?.refreshToken ?? null;

export const clearAuthTokens = (): void => {
  tokens = null;
};
