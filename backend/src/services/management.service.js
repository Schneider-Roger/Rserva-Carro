import { getManagementSummary } from '../repositories/management.repository.js';

export async function getExecutiveSummary(empresaId) {
  return getManagementSummary(empresaId);
}
