import { axiosInstance } from '@/lib/axios';
import { type LoginRequest, type LoginResponse } from '../types';

export const loginUser = async (
  data: LoginRequest,
): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>(
    '/auth/login',
    data,
  );
  return response.data;
};
