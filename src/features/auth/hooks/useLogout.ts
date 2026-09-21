import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { logoutUser } from '../api/logout';
import { useAuthStore } from '../store/useAuthStore';
import { type ApiError } from '../types';

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((state) => state.clearSession);

  return useMutation<void, AxiosError<ApiError>, void>({
    mutationFn: async () => {
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        await logoutUser({ refreshToken });
      }
    },
    onError: () => {
      toast.warning(
        'La sesión se cerró en este dispositivo, pero no se pudo confirmar la revocación en el servidor.',
      );
    },
    onSettled: () => {
      queryClient.clear();
      clearSession();
      navigate('/login', { replace: true });
    },
  });
};
