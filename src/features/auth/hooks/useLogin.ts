import { useMutation } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import { loginUser } from '../api/login';
import { type ApiError, type LoginRequest, type LoginResponse } from '../types';

export const useLogin = () => {
  return useMutation<LoginResponse, AxiosError<ApiError>, LoginRequest>({
    mutationFn: loginUser,
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
    },
  });
};
