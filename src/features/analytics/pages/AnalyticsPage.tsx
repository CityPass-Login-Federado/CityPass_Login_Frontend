import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { AlertTriangle, BarChart3, LoaderCircle, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ManagementPageLayout } from '@/features/systemManagement/components/layout/ManagementPageLayout';

import { fetchAnalyticsHtml } from '../api/analyticsApi';

const getAnalyticsErrorMessage = (error: unknown): string => {
  if (!axios.isAxiosError(error)) {
    return 'No pudimos cargar el tablero. Intentá nuevamente.';
  }

  if (error.code === 'ECONNABORTED') {
    return 'El tablero tardó demasiado en responder. Intentá nuevamente.';
  }

  switch (error.response?.status) {
    case 401:
      return 'Analítica no pudo validar el token de este entorno. Tu sesión sigue activa; verificá la configuración de firma e issuer del backend.';
    case 403:
      return 'El tablero está disponible únicamente para administradores globales.';
    case 502:
      return 'Analítica devolvió contenido inválido y no pudimos mostrar el tablero.';
    case 503:
      return 'El servicio de Analítica no está disponible temporalmente.';
    default:
      return 'No pudimos cargar el tablero. Intentá nuevamente.';
  }
};

export const AnalyticsPage = () => {
  const analyticsQuery = useQuery({
    queryKey: ['analytics', 'identity-dashboard'],
    queryFn: fetchAnalyticsHtml,
    retry: false,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });

  return (
    <ManagementPageLayout
      title="Analítica de Identidad"
      description="Consultá el tablero consolidado de autenticación y administración de identidades."
    >
      {analyticsQuery.isPending && (
        <div
          role="status"
          aria-live="polite"
          className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-lg border bg-card p-8 text-center shadow-sm"
        >
          <LoaderCircle
            className="h-9 w-9 animate-spin text-primary motion-reduce:animate-none"
            aria-hidden="true"
          />
          <div>
            <p className="font-semibold">Cargando tablero de Analítica…</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Estamos recuperando la información más reciente.
            </p>
          </div>
        </div>
      )}

      {analyticsQuery.isError && (
        <div
          role="alert"
          className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-lg border bg-card p-8 text-center shadow-sm"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-7 w-7" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-heading text-xl font-bold">
              No se pudo mostrar el tablero
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              {getAnalyticsErrorMessage(analyticsQuery.error)}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={analyticsQuery.isFetching}
            onClick={() => void analyticsQuery.refetch()}
          >
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            Reintentar
          </Button>
        </div>
      )}

      {analyticsQuery.data !== undefined && (
        <section className="overflow-hidden rounded-lg border bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-3 text-sm font-medium">
            <BarChart3 className="h-4 w-4 text-primary" aria-hidden="true" />
            Tablero actualizado de Analítica
          </div>
          <iframe
            srcDoc={analyticsQuery.data}
            title="Tablero de Analítica de Identidad"
            sandbox="allow-scripts"
            className="block h-[1200px] w-full border-0"
          />
        </section>
      )}
    </ManagementPageLayout>
  );
};
