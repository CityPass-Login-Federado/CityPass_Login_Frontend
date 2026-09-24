import { CircleCheckBig, LoaderCircle, LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useLogout } from '../hooks/useLogout';
import { useAuthStore } from '../store/useAuthStore';

export const UserHomePage = () => {
  const username = useAuthStore((state) => state.session?.username);
  const logoutMutation = useLogout();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <section className="w-full max-w-lg rounded-lg border bg-card p-8 text-center shadow-sm sm:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CircleCheckBig className="h-9 w-9" aria-hidden="true" />
        </span>

        <h1 className="mt-6 font-heading text-3xl font-bold tracking-tight">
          Inicio de sesión exitoso
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          {username ? `Hola, ${username}. ` : ''}
          Tu identidad fue validada correctamente.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Ya podés continuar en el módulo correspondiente de CityPass+.
        </p>

        <Button
          type="button"
          variant="outline"
          className="mt-8"
          disabled={logoutMutation.isPending}
          onClick={() => logoutMutation.mutate()}
        >
          {logoutMutation.isPending ? (
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          )}
          {logoutMutation.isPending ? 'Cerrando sesión…' : 'Cerrar sesión'}
        </Button>
      </section>
    </main>
  );
};
