import { getExecutiveSummary } from '../services/management.service.js';

export async function getManagementSummary(req, res) {
  const data = await getExecutiveSummary(req.tenant.empresaId);
  return res.status(200).json({ success: true, data, message: null });
}
