import { useMutation } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/login';
import { useAuthStore } from '../store/useAuthStore';
import { type ApiError, type LoginRequest, type LoginResponse } from '../types';

export const useLogin = () => {
  const navigate = useNavigate();
  const setSessionFromToken = useAuthStore(
    (state) => state.setSessionFromToken,
  );

  return useMutation<LoginResponse, AxiosError<ApiError>, LoginRequest>({
    mutationFn: loginUser,
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      setSessionFromToken(data.access_token);
      navigate('/panel', { replace: true });
    },
  });
};
