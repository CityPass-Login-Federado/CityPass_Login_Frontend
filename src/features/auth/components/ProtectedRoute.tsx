import { Navigate, Outlet } from 'react-router-dom';

import {
  selectCanAccessPanel,
  useAuthStore,
} from '../store/useAuthStore';

export const ProtectedRoute = () => {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const session = useAuthStore((state) => state.session);
  const canAccessPanel = useAuthStore(selectCanAccessPanel);

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Cargando sesión…
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;
  if (!canAccessPanel) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
};
