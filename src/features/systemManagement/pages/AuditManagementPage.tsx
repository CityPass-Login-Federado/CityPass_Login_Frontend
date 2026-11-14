import {
  selectIsGeneralAdmin,
  useAuthStore,
} from '@/features/auth/store/useAuthStore';

import { AuditSection } from '../components/audit/AuditSection';
import { ManagementPageLayout } from '../components/layout/ManagementPageLayout';

export const AuditManagementPage = () => {
  const isGeneralAdmin = useAuthStore(selectIsGeneralAdmin);

  return (
    <ManagementPageLayout
      title="Panel de Auditoría"
      description="Consultá el historial de acciones administrativas, sus responsables y los recursos afectados."
    >
      <AuditSection isGeneralAdmin={isGeneralAdmin} />
    </ManagementPageLayout>
  );
};
