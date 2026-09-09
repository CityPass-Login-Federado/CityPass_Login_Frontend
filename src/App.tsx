import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppErrorBoundary } from '@/components/AppErrorBoundary';
import { LoginPage } from '@/features/auth/components/LoginPage';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { UnauthorizedPage } from '@/features/auth/components/UnauthorizedPage';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { SystemManagementPage } from '@/features/systemManagement/components/SystemManagementPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const App = () => {
  const hydrateSession = useAuthStore((state) => state.hydrateSession);

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route element={<ProtectedRoute />}>
            <Route
              path="/panel"
              element={
                <AppErrorBoundary>
                  <SystemManagementPage />
                </AppErrorBoundary>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
