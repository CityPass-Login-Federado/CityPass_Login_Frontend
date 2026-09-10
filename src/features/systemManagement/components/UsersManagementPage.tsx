import { toast } from 'sonner';

import {
  selectIsGeneralAdmin,
  useAuthStore,
} from '@/features/auth/store/useAuthStore';

import { type NoticeHandler } from '../types';
import { getModuleName } from '../utils/modules';
import { ManagementPageLayout } from './ManagementPageLayout';
import { UsersSection } from './UsersSection';

export const UsersManagementPage = () => {
  const session = useAuthStore((state) => state.session);
  const isGeneralAdmin = useAuthStore(selectIsGeneralAdmin);
  const handleNotice: NoticeHandler = (kind, message) => toast[kind](message);
  const description = isGeneralAdmin
    ? 'Gestiona todos los usuarios del sistema y filtra el listado por módulo.'
    : `Gestiona los usuarios disponibles en ${getModuleName(session?.module)}.`;

  return (
    <ManagementPageLayout
      title="Panel de Gestión de Usuarios"
      description={description}
    >
      <UsersSection
        isGeneralAdmin={isGeneralAdmin}
        onNotice={handleNotice}
      />
    </ManagementPageLayout>
  );
};
