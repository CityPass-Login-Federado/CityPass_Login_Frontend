import { axiosInstance } from '@/lib/axios';

import { type RefreshRequest } from '../types';

export const logoutUser = async ({
  refreshToken,
}: RefreshRequest): Promise<void> => {
  await axiosInstance.post('/auth/logout', { refreshToken });
};
