import { toast } from 'sonner';

import { type NoticeHandler } from '../types';
import { AssignUserToGroupCard } from './AssignUserToGroupCard';
import { GroupsSection } from './GroupsSection';
import { ManagementPageLayout } from './ManagementPageLayout';

export const GroupsManagementPage = () => {
  const handleNotice: NoticeHandler = (kind, message) => toast[kind](message);

  return (
    <ManagementPageLayout
      title="Panel de Gestión de Grupos"
      description="Gestiona todos los grupos desde un único lugar."
    >
      <GroupsSection onNotice={handleNotice} />
      <div className="max-w-2xl">
        <AssignUserToGroupCard onNotice={handleNotice} />
      </div>
    </ManagementPageLayout>
  );
};
