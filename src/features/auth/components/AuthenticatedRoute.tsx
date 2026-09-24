import { Navigate, Outlet } from 'react-router-dom';

import { useAuthStore } from '../store/useAuthStore';

export const AuthenticatedRoute = () => {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const session = useAuthStore((state) => state.session);

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Cargando sesión…
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  return <Outlet />;
};
