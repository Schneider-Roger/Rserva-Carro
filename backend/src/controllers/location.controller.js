import { assertPositiveId } from '../utils/validate.js';
import { listCities, listStates } from '../repositories/location.repository.js';

export async function getStates(_req, res) {
  const rows = await listStates();
  res.json({ data: rows.map((row) => ({ id: row.id, ibgeCode: row.codigo_ibge, uf: row.uf, name: row.nome })) });
}

export async function getCities(req, res) {
  const stateId = assertPositiveId(req.params.estadoId, 'estadoId');
  const search = String(req.query.search || '').trim().slice(0, 120);
  const rows = await listCities(stateId, search);
  res.json({ data: rows.map((row) => ({ id: row.id, ibgeCode: row.codigo_ibge, name: row.nome })) });
}
