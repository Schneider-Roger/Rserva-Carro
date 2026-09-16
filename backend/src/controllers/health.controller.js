import { checkLiveness, checkReadiness } from '../services/health.service.js';

export function getHealth(_req, res) {
  return res.status(200).json({ success: true, data: checkLiveness(), message: null });
}

export async function getReady(_req, res) {
  const data = await checkReadiness();
  return res.status(200).json({ success: true, data, message: null });
}
