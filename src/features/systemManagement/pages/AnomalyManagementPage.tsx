import { toast } from 'sonner';

import {
  selectIsGeneralAdmin,
  useAuthStore,
} from '@/features/auth/store/useAuthStore';

import { AnomalySection } from '../components/anomalies/AnomalySection';
import { ManagementPageLayout } from '../components/layout/ManagementPageLayout';
import { type NoticeHandler } from '../types';

export const AnomalyManagementPage = () => {
  const isGeneralAdmin = useAuthStore(selectIsGeneralAdmin);
  const handleNotice: NoticeHandler = (kind, message) => toast[kind](message);

  return (
    <ManagementPageLayout
      title="Eventos de anomalía"
      description="Revisá los intentos de acceso bloqueados por riesgo y aprobá excepciones de un solo uso."
    >
      <AnomalySection
        isGeneralAdmin={isGeneralAdmin}
        onNotice={handleNotice}
      />
    </ManagementPageLayout>
  );
};
