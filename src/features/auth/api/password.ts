import { axiosInstance } from '@/lib/axios';

import {
  type ChangePasswordRequest,
  type ForgotPasswordRequest,
  type ResetPasswordRequest,
} from '../types';

export const requestPasswordReset = async (
  data: ForgotPasswordRequest,
): Promise<void> => {
  await axiosInstance.post('/auth/forgot-password', data);
};

export const resetPassword = async (
  data: ResetPasswordRequest,
): Promise<void> => {
  await axiosInstance.post('/auth/reset-password', data);
};

export const changePassword = async (
  data: ChangePasswordRequest,
): Promise<void> => {
  await axiosInstance.post('/me/change-password', data);
};
