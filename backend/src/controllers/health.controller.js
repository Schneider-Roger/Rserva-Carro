import { checkHealth } from '../services/health.service.js';

export async function getHealth(req, res) {
  const data = await checkHealth();

  return res.status(200).json({
    success: true,
    data,
    message: null,
  });
}
