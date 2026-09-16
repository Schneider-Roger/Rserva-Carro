import { findAvailableVehicles } from '../repositories/vehicle.repository.js';

export async function listAvailableVehicles(period) {
  const rows = await findAvailableVehicles(period);

  return rows.map((row) => ({
    id: row.id,
    codigoInterno: row.codigo_interno,
    placa: row.placa,
    marca: row.marca,
    modelo: row.modelo,
    capacidade: row.capacidade,
    cor: row.cor,
    ano: row.ano,
    categoria: {
      id: row.categoria_id,
      nome: row.categoria_nome,
    },
    unidade: row.unidade_id
      ? {
          id: row.unidade_id,
          nome: row.unidade_nome,
        }
      : null,
  }));
}
