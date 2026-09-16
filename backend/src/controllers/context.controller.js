import { getContext } from '../services/context.service.js';

export async function getAppContext(req, res) {
  const data = await getContext(req);
  res.json({ success: true, data, message: null });
}
