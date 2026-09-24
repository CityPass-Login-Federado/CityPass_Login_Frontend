import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppErrorBoundary } from '@/components/AppErrorBoundary';
import { Toaster } from '@/components/ui/sonner';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { PasswordResetPage } from '@/features/auth/pages/PasswordResetPage';
import { AuthenticatedRoute } from '@/features/auth/routing/AuthenticatedRoute';
import { ProtectedRoute } from '@/features/auth/routing/ProtectedRoute';
import { UnauthorizedPage } from '@/features/auth/pages/UnauthorizedPage';
import { UserHomePage } from '@/features/auth/pages/UserHomePage';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { SystemManagementPage } from '@/features/systemManagement/pages/SystemManagementPage';
import { GroupsManagementPage } from '@/features/systemManagement/pages/GroupsManagementPage';
import { UsersManagementPage } from '@/features/systemManagement/pages/UsersManagementPage';
import { queryClient } from '@/lib/queryClient';

export const App = () => {
  const initializeSession = useAuthStore((state) => state.initializeSession);

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<PasswordResetPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route element={<AuthenticatedRoute />}>
            <Route path="/home" element={<UserHomePage />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route
              path="/panel"
              element={
                <AppErrorBoundary>
                  <SystemManagementPage />
                </AppErrorBoundary>
              }
            />
            <Route
              path="/panel/groups"
              element={
                <AppErrorBoundary>
                  <GroupsManagementPage />
                </AppErrorBoundary>
              }
            />
            <Route
              path="/panel/users"
              element={
                <AppErrorBoundary>
                  <UsersManagementPage />
                </AppErrorBoundary>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster position="top-right" richColors closeButton />
      </BrowserRouter>
    </QueryClientProvider>
  );
};
