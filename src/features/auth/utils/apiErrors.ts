import { type AxiosError } from 'axios';

import { type ApiError } from '../types';

const LOGIN_ERROR_MESSAGES: Readonly<Partial<Record<number, string>>> = {
  401: 'Usuario o contraseña inválidos',
  403: 'Acceso bloqueado por actividad inusual',
  503: 'Servicio de validación temporalmente no disponible',
};

const LOGIN_ERROR_FALLBACK = 'Error al iniciar sesión. Intente nuevamente.';

export const getApiErrorMessage = (
  error: AxiosError<ApiError> | null,
  fallback: string,
) => error?.response?.data?.message ?? fallback;

export const getLoginErrorMessage = (
  error: AxiosError<ApiError> | null,
): string => {
  const status = error?.response?.status;
  const statusMessage =
    status === undefined ? undefined : LOGIN_ERROR_MESSAGES[status];

  return statusMessage ?? getApiErrorMessage(error, LOGIN_ERROR_FALLBACK);
};
