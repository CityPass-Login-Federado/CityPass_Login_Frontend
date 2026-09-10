import { type ReactNode } from 'react';

import {
  selectIsGeneralAdmin,
  useAuthStore,
} from '@/features/auth/store/useAuthStore';

import { ManagementSidebar } from './ManagementSidebar';

interface ManagementPageLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export const ManagementPageLayout = ({
  title,
  description,
  children,
}: ManagementPageLayoutProps) => {
  const session = useAuthStore((state) => state.session);
  const isGeneralAdmin = useAuthStore(selectIsGeneralAdmin);

  return (
    <div
      id="top"
      className="flex min-h-screen flex-col bg-background md:flex-row"
    >
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
              {title}
            </h1>
            <p className="max-w-4xl text-sm text-muted-foreground">
              {description}
            </p>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
};
