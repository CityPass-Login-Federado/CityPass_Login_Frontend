import { type ModuleSummary } from '../types';

export const CITYPASS_MODULES: ModuleSummary[] = [
  { id: 'movilidad', name: 'Movilidad' },
  { id: 'residuos', name: 'Gestión de Residuos' },
  { id: 'reclamos', name: 'Reclamos' },
  { id: 'emergencias', name: 'Emergencias y Seguridad' },
  { id: 'espacios', name: 'Espacios Públicos' },
  { id: 'analitica', name: 'Analítica Urbana' },
];

export const getModuleName = (moduleId?: string) => {
  if (!moduleId) return '—';
  return (
    CITYPASS_MODULES.find((module) => module.id === moduleId.toLowerCase())
      ?.name ?? moduleId
  );
};
