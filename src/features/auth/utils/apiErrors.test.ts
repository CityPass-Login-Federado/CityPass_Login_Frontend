import { AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { type ApiError } from '../types';
import { getApiErrorMessage, getLoginErrorMessage } from './apiErrors';

const createApiError = (
  status: number,
  message: string,
): AxiosError<ApiError> =>
  new AxiosError('Request failed', undefined, undefined, undefined, {
    data: {
      timestamp: '2026-11-13T12:00:00Z',
      status,
      error: 'Request failed',
      message,
    },
    status,
    statusText: 'Request failed',
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  });

describe('apiErrors', () => {
  test.each([
    [401, 'Usuario o contraseña inválidos'],
    [403, 'Acceso bloqueado por actividad inusual'],
    [503, 'Servicio de validación temporalmente no disponible'],
  ])(
    'prioriza el mensaje definido para el estado HTTP %i',
    (status, expectedMessage) => {
      const error = createApiError(status, 'Mensaje distinto del backend');

      expect(getLoginErrorMessage(error)).toBe(expectedMessage);
    },
  );

  test('conserva el mensaje del backend para otros estados HTTP', () => {
    const error = createApiError(422, 'Revise los campos enviados');

    expect(getLoginErrorMessage(error)).toBe('Revise los campos enviados');
  });

  test('usa el fallback de login cuando no hay respuesta HTTP', () => {
    const error = new AxiosError<ApiError>('Network Error');

    expect(getLoginErrorMessage(error)).toBe(
      'Error al iniciar sesión. Intente nuevamente.',
    );
  });

  test('mantiene el comportamiento genérico para otros flujos de autenticación', () => {
    const error = createApiError(400, 'Solicitud inválida');

    expect(getApiErrorMessage(error, 'Fallback')).toBe('Solicitud inválida');
    expect(getApiErrorMessage(null, 'Fallback')).toBe('Fallback');
  });
});
