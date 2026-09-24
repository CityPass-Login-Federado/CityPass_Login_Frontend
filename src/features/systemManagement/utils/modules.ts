import { type ModuleSummary } from '../types';

const MODULE_NAMES: Record<string, string> = {
  movilidad: 'Movilidad',
  residuos: 'Gestión de Residuos',
  reclamos: 'Reclamos',
  emergencias: 'Emergencias y Seguridad',
  espacios: 'Espacios Públicos',
  analitica: 'Analítica Urbana',
  eda: 'EDA',
};

export const getModuleName = (moduleId?: string) => {
  if (!moduleId) return '—';
  return MODULE_NAMES[moduleId.toLowerCase()] ?? moduleId;
};

export const toModuleSummaries = (moduleIds: string[]): ModuleSummary[] => {
  const uniqueModuleIds = new Set(
    moduleIds.map((moduleId) => moduleId.trim().toLowerCase()).filter(Boolean),
  );

  return Array.from(uniqueModuleIds, (id) => ({
    id,
    name: getModuleName(id),
  }));
};
