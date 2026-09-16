import { pool } from '../config/db.js';

export async function findUsers(empresaId, { q = '', limit = 50 } = {}) {
  const like = `%${q}%`;
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
  const [rows] = await pool.execute(`
    SELECT u.id, u.codigo_funcionario, u.nome, u.email, u.telefone, u.ativo,
           un.id AS unidade_id, un.nome AS unidade_nome,
           d.id AS departamento_id, d.nome AS departamento_nome
      FROM usuarios u
      LEFT JOIN unidades un ON un.empresa_id = u.empresa_id AND un.id = u.unidade_id
      LEFT JOIN departamentos d ON d.empresa_id = u.empresa_id AND d.id = u.departamento_id
     WHERE u.empresa_id = ?
       AND u.ativo = TRUE
       AND (? = '' OR u.nome LIKE ? OR u.email LIKE ? OR u.codigo_funcionario LIKE ?)
     ORDER BY u.nome ASC
     LIMIT ${safeLimit}
  `, [empresaId, q, like, like, like]);
  return rows;
}
