import { useEffect, useState } from 'react';
import { CheckCircle2, X, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  selectIsGeneralAdmin,
  useAuthStore,
} from '@/features/auth/store/useAuthStore';
import { cn } from '@/lib/utils';

import { type NoticeKind } from '../types';
import { AssignUserToGroupCard } from './AssignUserToGroupCard';
import { GroupsSection } from './GroupsSection';
import { ManagementSidebar } from './ManagementSidebar';
import { UsersSection } from './UsersSection';

interface Notice {
  kind: NoticeKind;
  message: string;
}

export const SystemManagementPage = () => {
  const session = useAuthStore((state) => state.session);
  const isGeneralAdmin = useAuthStore(selectIsGeneralAdmin);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timeoutId = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  return (
    <div id="top" className="flex min-h-screen bg-background">
      <ManagementSidebar />
      <div className="min-w-0 flex-1">
        <header className="flex h-16 items-center border-b bg-white px-4 sm:px-6 lg:px-8">
          <div>
            <p className="font-heading text-sm font-semibold">
              Bienvenido, {session?.username ?? 'Admin'}
            </p>
            <p className="text-xs text-muted-foreground md:hidden">
              CityPass+ · Administración
            </p>
          </div>
          <div className="ml-auto rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {isGeneralAdmin
              ? 'Admin General'
              : `Admin · ${session?.module ?? 'Módulo'}`}
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] space-y-5 px-4 py-7 sm:px-6 lg:px-8">
          <div className="space-y-1">
            <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              Panel de Gestión del Sistema
            </h1>
            <p className="max-w-4xl text-sm text-muted-foreground">
              Gestiona usuarios y grupos, controla sus accesos y administra las
              membresías disponibles dentro de tu alcance.
            </p>
          </div>

          {notice && (
            <div
              role={notice.kind === 'error' ? 'alert' : 'status'}
              aria-live="polite"
              className={cn(
                'flex items-start gap-3 rounded-lg border px-4 py-3 text-sm',
                notice.kind === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-destructive/30 bg-destructive/5 text-destructive',
              )}
            >
              {notice.kind === 'success' ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <p className="flex-1">{notice.message}</p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="-mr-2 -mt-2 h-8 w-8"
                onClick={() => setNotice(null)}
                aria-label="Cerrar notificación"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <UsersSection
            isGeneralAdmin={isGeneralAdmin}
            onNotice={(kind, message) => setNotice({ kind, message })}
          />

          <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(300px,0.8fr)]">
            <GroupsSection
              isGeneralAdmin={isGeneralAdmin}
              onNotice={(kind, message) => setNotice({ kind, message })}
            />
            <AssignUserToGroupCard
              isGeneralAdmin={isGeneralAdmin}
              onNotice={(kind, message) => setNotice({ kind, message })}
            />
          </div>
        </main>
      </div>
    </div>
  );
};
