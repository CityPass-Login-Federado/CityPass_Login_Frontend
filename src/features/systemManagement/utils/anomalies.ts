import { type AnomalyEventStatus } from '../types';

export const ANOMALY_STATUS_OPTIONS: Array<{
  value: AnomalyEventStatus;
  label: string;
}> = [
  { value: 'BLOCKED', label: 'Bloqueados' },
  { value: 'APPROVED', label: 'Aprobados' },
  { value: 'CONSUMED', label: 'Consumidos' },
];

const anomalyStatusLabels = new Map<AnomalyEventStatus, string>([
  ['BLOCKED', 'Bloqueado'],
  ['APPROVED', 'Aprobado'],
  ['CONSUMED', 'Consumido'],
]);

export const getAnomalyStatusLabel = (status: AnomalyEventStatus) =>
  anomalyStatusLabels.get(status) ?? status;

export const formatRiskScore = (riskScore: number) =>
  `${Math.round(riskScore * 100)} %`;
