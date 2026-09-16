import { listAvailableVehicles, listVehicles } from '../services/vehicle.service.js';
import { parseAvailabilityQuery } from '../validators/availability.validator.js';
import { getTenantSettings } from '../repositories/tenant.repository.js';

export async function getVehicles(req, res) {
  const data = await listVehicles(req.tenant.empresaId, req.query);
  return res.status(200).json({ success: true, data, message: null, meta: { total: data.length } });
}

export async function getAvailableVehicles(req, res) {
  const settings = await getTenantSettings(req.tenant.empresaId);
  const period = parseAvailabilityQuery(req.query, settings);
  const data = await listAvailableVehicles(req.tenant.empresaId, period);
  return res.status(200).json({ success: true, data, message: null, meta: { inicio: period.inicioIso, fim: period.fimIso, total: data.length } });
}
