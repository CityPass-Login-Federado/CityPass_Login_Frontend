import { toast } from 'sonner';

import {
  selectIsGeneralAdmin,
  useAuthStore,
} from '@/features/auth/store/useAuthStore';

import { type NoticeHandler } from '../types';
import { AssignUserToGroupCard } from './AssignUserToGroupCard';
import { GroupsSection } from './GroupsSection';
import { ManagementPageLayout } from './ManagementPageLayout';

export const GroupsManagementPage = () => {
  const isGeneralAdmin = useAuthStore(selectIsGeneralAdmin);
  const handleNotice: NoticeHandler = (kind, message) => toast[kind](message);

  return (
    <ManagementPageLayout
      title="Panel de Gestión de Grupos"
      description="Gestiona todos los grupos desde un único lugar."
    >
      <GroupsSection
        isGeneralAdmin={isGeneralAdmin}
        onNotice={handleNotice}
      />
      <div className="max-w-2xl">
        <AssignUserToGroupCard
          isGeneralAdmin={isGeneralAdmin}
          onNotice={handleNotice}
        />
      </div>
    </ManagementPageLayout>
  );
};
