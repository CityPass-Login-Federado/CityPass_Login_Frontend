import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
  changePassword,
  requestPasswordReset,
  resetPassword,
} from '../api/password';
import { useAuthStore } from '../store/useAuthStore';
import {
  type ApiError,
  type ChangePasswordRequest,
  type ForgotPasswordRequest,
  type ResetPasswordRequest,
} from '../types';

export const useForgotPassword = () =>
  useMutation<void, AxiosError<ApiError>, ForgotPasswordRequest>({
    mutationFn: requestPasswordReset,
  });

const useReturnToLoginAfterPasswordChange = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((state) => state.clearSession);

  return () => {
    queryClient.clear();
    clearSession();
    toast.success('Contraseña actualizada. Iniciá sesión nuevamente.');
    navigate('/login', { replace: true });
  };
};

export const useResetPassword = () => {
  const returnToLogin = useReturnToLoginAfterPasswordChange();

  return useMutation<void, AxiosError<ApiError>, ResetPasswordRequest>({
    mutationFn: resetPassword,
    onSuccess: returnToLogin,
  });
};

export const useChangePassword = () => {
  const returnToLogin = useReturnToLoginAfterPasswordChange();

  return useMutation<void, AxiosError<ApiError>, ChangePasswordRequest>({
    mutationFn: changePassword,
    onSuccess: returnToLogin,
  });
};
