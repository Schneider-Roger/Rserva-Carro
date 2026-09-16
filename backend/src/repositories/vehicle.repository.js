import { pool } from '../config/db.js';

export async function findVehicles({ empresaId, q = '' }) {
  const like = `%${q}%`;
  const [rows] = await pool.execute(`
    SELECT
      v.id, v.codigo_interno, v.placa, v.marca, v.modelo, v.capacidade, v.cor, v.ano,
      v.km_atual, v.status_operacional, v.ativo,
      cv.id AS categoria_id, cv.nome AS categoria_nome,
      u.id AS unidade_id, u.nome AS unidade_nome
    FROM veiculos v
    INNER JOIN categorias_veiculo cv
      ON cv.empresa_id = v.empresa_id AND cv.id = v.categoria_id
    LEFT JOIN unidades u
      ON u.empresa_id = v.empresa_id AND u.id = v.unidade_id
    WHERE v.empresa_id = ?
      AND v.ativo = TRUE
      AND (? = '' OR v.codigo_interno LIKE ? OR v.placa LIKE ? OR v.marca LIKE ? OR v.modelo LIKE ?)
    ORDER BY v.modelo ASC, v.placa ASC
  `, [empresaId, q, like, like, like, like]);
  return rows;
}

export async function findAvailableVehicles({ empresaId, inicio, fim }) {
  const sql = `
    SELECT
      v.id, v.codigo_interno, v.placa, v.marca, v.modelo, v.capacidade, v.cor, v.ano, v.km_atual,
      cv.id AS categoria_id, cv.nome AS categoria_nome,
      u.id AS unidade_id, u.nome AS unidade_nome
    FROM veiculos v
    INNER JOIN categorias_veiculo cv
      ON cv.empresa_id = v.empresa_id AND cv.id = v.categoria_id
    LEFT JOIN unidades u
      ON u.empresa_id = v.empresa_id AND u.id = v.unidade_id
    WHERE
      v.empresa_id = ?
      AND v.ativo = TRUE
      AND v.status_operacional = 'DISPONIVEL'
      AND NOT EXISTS (
        SELECT 1 FROM reservas r
        WHERE r.empresa_id = v.empresa_id
          AND r.veiculo_id = v.id
          AND r.status = 'CONFIRMADA'
          AND ? < r.data_hora_fim
          AND ? > r.data_hora_inicio
      )
      AND NOT EXISTS (
        SELECT 1 FROM bloqueios_veiculo b
        WHERE b.empresa_id = v.empresa_id
          AND b.veiculo_id = v.id
          AND b.ativo = TRUE
          AND ? < b.data_hora_fim
          AND ? > b.data_hora_inicio
      )
    ORDER BY v.modelo ASC, v.placa ASC
  `;

  const [rows] = await pool.execute(sql, [empresaId, inicio, fim, inicio, fim]);
  return rows;
}
