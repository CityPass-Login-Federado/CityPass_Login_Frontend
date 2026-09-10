import { toast } from 'sonner';

import {
  selectIsGeneralAdmin,
  useAuthStore,
} from '@/features/auth/store/useAuthStore';

import { type NoticeHandler } from '../types';
import { AssignUserToGroupCard } from './AssignUserToGroupCard';
import { GroupsSection } from './GroupsSection';
import { ManagementSidebar } from './ManagementSidebar';
import { UsersSection } from './UsersSection';

export const SystemManagementPage = () => {
  const session = useAuthStore((state) => state.session);
  const isGeneralAdmin = useAuthStore(selectIsGeneralAdmin);
  const handleNotice: NoticeHandler = (kind, message) =>
    toast[kind](message);

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

          <UsersSection
            isGeneralAdmin={isGeneralAdmin}
            onNotice={handleNotice}
          />

          <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(300px,0.8fr)]">
            <GroupsSection
              isGeneralAdmin={isGeneralAdmin}
              onNotice={handleNotice}
            />
            <AssignUserToGroupCard
              isGeneralAdmin={isGeneralAdmin}
              onNotice={handleNotice}
            />
          </div>
        </main>
      </div>
    </div>
  );
};
