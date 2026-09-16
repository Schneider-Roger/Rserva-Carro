import { listAvailableVehicles } from '../services/vehicle.service.js';
import { parseAvailabilityQuery } from '../validators/availability.validator.js';

export async function getAvailableVehicles(req, res) {
  const period = parseAvailabilityQuery(req.query);
  const data = await listAvailableVehicles(period);

  return res.status(200).json({
    success: true,
    data,
    message: null,
    meta: {
      inicio: period.inicioIso,
      fim: period.fimIso,
      total: data.length,
    },
  });
}
