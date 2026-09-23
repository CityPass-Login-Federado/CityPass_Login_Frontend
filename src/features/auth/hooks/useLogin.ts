import { useMutation } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/login';
import { establishSession } from '../session/sessionManager';
import { type ApiError, type LoginRequest, type LoginResponse } from '../types';

export const useLogin = () => {
  const navigate = useNavigate();

  return useMutation<LoginResponse, AxiosError<ApiError>, LoginRequest>({
    mutationFn: async (request) => {
      const response = await loginUser(request);
      establishSession(response);
      return response;
    },
    onSuccess: () => {
      navigate('/panel', { replace: true });
    },
  });
};
