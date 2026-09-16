import { findAvailableVehicles, findVehicles } from '../repositories/vehicle.repository.js';

function mapVehicle(row) {
  return {
    id: row.id,
    codigoInterno: row.codigo_interno,
    placa: row.placa,
    marca: row.marca,
    modelo: row.modelo,
    capacidade: row.capacidade,
    cor: row.cor,
    ano: row.ano,
    kmAtual: row.km_atual ?? null,
    statusOperacional: row.status_operacional ?? 'DISPONIVEL',
    ativo: row.ativo ?? true,
    categoria: { id: row.categoria_id, nome: row.categoria_nome },
    unidade: row.unidade_id ? { id: row.unidade_id, nome: row.unidade_nome } : null,
  };
}

export async function listVehicles(empresaId, query = {}) {
  const rows = await findVehicles({ empresaId, q: String(query.q || '').trim() });
  return rows.map(mapVehicle);
}

export async function listAvailableVehicles(empresaId, period) {
  const rows = await findAvailableVehicles({ empresaId, ...period });
  return rows.map(mapVehicle);
}
