import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Link2Off } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { useAuthStore } from '../store/useAuthStore';
import { AuthLayout } from './AuthLayout';
import { PasswordForm } from './PasswordForm';

export const PasswordResetPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [{ token, cameFromRecoveryLink }] = useState(() => ({
    token: searchParams.get('token')?.trim() ?? '',
    cameFromRecoveryLink: searchParams.has('token'),
  }));
  const session = useAuthStore((state) => state.session);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    if (!cameFromRecoveryLink || !searchParams.has('token')) return;

    const sanitizedParams = new URLSearchParams(searchParams);
    sanitizedParams.delete('token');
    setSearchParams(sanitizedParams, { replace: true });
  }, [cameFromRecoveryLink, searchParams, setSearchParams]);

  if (token) {
    return <PasswordForm mode="recovery" token={token} />;
  }

  if (!cameFromRecoveryLink && !isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Cargando sesión…
      </div>
    );
  }

  if (!cameFromRecoveryLink && session) {
    return <PasswordForm mode="change" />;
  }

  return (
    <AuthLayout>
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <Link2Off className="h-7 w-7" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Enlace no válido
          </h1>
          <p role="alert" className="text-sm leading-6 text-muted-foreground">
            El enlace para restablecer la contraseña no contiene un token
            válido. Solicitá uno nuevo para continuar.
          </p>
        </div>
        <div className="space-y-3">
          <Button asChild className="w-full" size="lg">
            <Link to="/forgot-password">Solicitar un nuevo enlace</Link>
          </Button>
          <Button asChild className="w-full" variant="link">
            <Link to="/login">Volver al inicio de sesión</Link>
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
};
