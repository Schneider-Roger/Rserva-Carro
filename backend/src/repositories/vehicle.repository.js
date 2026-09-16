import { pool } from '../config/db.js';

export async function findAvailableVehicles({ inicio, fim }) {
  const sql = `
    SELECT
      v.id,
      v.codigo_interno,
      v.placa,
      v.marca,
      v.modelo,
      v.capacidade,
      v.cor,
      v.ano,
      cv.id AS categoria_id,
      cv.nome AS categoria_nome,
      u.id AS unidade_id,
      u.nome AS unidade_nome
    FROM veiculos v
    INNER JOIN categorias_veiculo cv
      ON cv.id = v.categoria_id
    LEFT JOIN unidades u
      ON u.id = v.unidade_id
    WHERE
      v.ativo = TRUE
      AND v.status_operacional = 'DISPONIVEL'
      AND NOT EXISTS (
        SELECT 1
        FROM reservas r
        WHERE
          r.veiculo_id = v.id
          AND r.status = 'CONFIRMADA'
          AND ? < r.data_hora_fim
          AND ? > r.data_hora_inicio
      )
      AND NOT EXISTS (
        SELECT 1
        FROM bloqueios_veiculo b
        WHERE
          b.veiculo_id = v.id
          AND b.ativo = TRUE
          AND ? < b.data_hora_fim
          AND ? > b.data_hora_inicio
      )
    ORDER BY
      v.modelo ASC,
      v.placa ASC
  `;

  const [rows] = await pool.execute(sql, [inicio, fim, inicio, fim]);
  return rows;
}
