import { Navigate, Outlet } from 'react-router-dom';

import {
  selectCanAccessAnalytics,
  useAuthStore,
} from '../store/useAuthStore';

export const GlobalAdminRoute = () => {
  const canAccessAnalytics = useAuthStore(selectCanAccessAnalytics);

  return canAccessAnalytics ? <Outlet /> : <Navigate to="/unauthorized" replace />;
};
