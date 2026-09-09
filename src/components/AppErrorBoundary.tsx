import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error inesperado en la interfaz', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-background p-6">
          <div
            role="alert"
            className="max-w-md space-y-4 rounded-xl border bg-card p-8 text-center shadow-sm"
          >
            <AlertTriangle className="mx-auto h-10 w-10 text-destructive" />
            <h1 className="font-heading text-xl font-bold">
              No pudimos mostrar el panel
            </h1>
            <p className="text-sm text-muted-foreground">
              Ocurrió un error inesperado al procesar los datos. Recargue la
              pantalla para volver a intentarlo.
            </p>
            <Button type="button" onClick={() => window.location.reload()}>
              Recargar pantalla
            </Button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
