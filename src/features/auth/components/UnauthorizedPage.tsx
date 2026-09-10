import { ShieldX } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';

export const UnauthorizedPage = () => (
  <main className="flex min-h-screen items-center justify-center bg-background p-6">
    <div className="max-w-md space-y-4 text-center">
      <ShieldX className="mx-auto h-12 w-12 text-destructive" />
      <h1 className="font-heading text-2xl font-bold">Acceso no autorizado</h1>
      <p className="text-sm text-muted-foreground">
        Su sesión no cuenta con permisos para ingresar al panel administrativo.
      </p>
      <Button asChild>
        <Link to="/login">Volver al inicio</Link>
      </Button>
    </div>
  </main>
);
