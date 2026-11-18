import { type ReactNode } from 'react';

import { UserMenu } from '@/features/auth/layout/UserMenu';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

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

  return (
    <div
      id="top"
      className="flex h-dvh flex-col overflow-hidden bg-background md:flex-row"
    >
      <ManagementSidebar />
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        <header className="flex h-16 items-center border-b bg-white px-4 sm:px-6 lg:px-8">
          <div>
            <p className="font-heading text-sm font-semibold">
              Bienvenido, {session?.username ?? 'Admin'}
            </p>
            <p className="text-xs text-muted-foreground md:hidden">
              CityPass+ · Administración
            </p>
          </div>
          <UserMenu />
        </header>

        <main className="mx-auto w-full max-w-[1440px] space-y-5 px-4 py-7 sm:px-6 lg:px-8">
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
