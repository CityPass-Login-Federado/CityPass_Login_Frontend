import { toast } from 'sonner';

import {
  selectIsGeneralAdmin,
  useAuthStore,
} from '@/features/auth/store/useAuthStore';

import { type NoticeHandler } from '../types';
import { AssignUserToGroupCard } from './AssignUserToGroupCard';
import { GroupsSection } from './GroupsSection';
import { ManagementPageLayout } from './ManagementPageLayout';
import { UsersSection } from './UsersSection';

export const SystemManagementPage = () => {
  const isGeneralAdmin = useAuthStore(selectIsGeneralAdmin);
  const handleNotice: NoticeHandler = (kind, message) =>
    toast[kind](message);

  return (
    <ManagementPageLayout
      title="Panel de Gestión del Sistema"
      description="Gestiona usuarios y grupos, controla sus accesos y administra las membresías disponibles dentro de tu alcance."
    >
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
    </ManagementPageLayout>
  );
};
