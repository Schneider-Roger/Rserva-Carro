import { pool } from '../config/db.js';

export async function listStates() {
  const [rows] = await pool.execute('SELECT id, codigo_ibge, uf, nome FROM estados ORDER BY nome ASC');
  return rows;
}

export async function listCities(estadoId, search = '') {
  const like = `%${search}%`;
  const [rows] = await pool.execute(`
    SELECT id, codigo_ibge, nome
      FROM cidades
     WHERE estado_id = ?
       AND (? = '' OR nome LIKE ?)
     ORDER BY nome ASC
     LIMIT 500
  `, [estadoId, search, like]);
  return rows;
}
