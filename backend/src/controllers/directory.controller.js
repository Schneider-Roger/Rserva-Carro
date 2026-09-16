import { listUsers } from '../services/directory.service.js';

export async function getUsers(req, res) {
  const data = await listUsers(req.tenant.empresaId, req.query);
  res.json({ data, meta: { total: data.length } });
}
