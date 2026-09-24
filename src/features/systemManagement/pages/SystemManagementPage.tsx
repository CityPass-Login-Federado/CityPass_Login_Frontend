import { toast } from 'sonner';

import {
  selectIsGeneralAdmin,
  useAuthStore,
} from '@/features/auth/store/useAuthStore';

import { type NoticeHandler } from '../types';
import { AssignUserToGroupCard } from '../components/groups/AssignUserToGroupCard';
import { GroupsSection } from '../components/groups/GroupsSection';
import { ManagementPageLayout } from '../components/layout/ManagementPageLayout';
import { UsersSection } from '../components/users/UsersSection';

export const SystemManagementPage = () => {
  const isGeneralAdmin = useAuthStore(selectIsGeneralAdmin);
  const handleNotice: NoticeHandler = (kind, message) =>
    toast[kind](message);

  return (
    <ManagementPageLayout
      title="Panel de Gestión del Sistema"
      description="Gestiona usuarios y grupos, controla sus accesos y administra las membresías disponibles."
    >
      <UsersSection
        isGeneralAdmin={isGeneralAdmin}
        onNotice={handleNotice}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(380px,1fr)]">
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
