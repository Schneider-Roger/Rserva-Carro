import { findUsers } from '../repositories/directory.repository.js';

export async function listUsers(empresaId, query = {}) {
  const rows = await findUsers(empresaId, { q: String(query.q || '').trim(), limit: query.limit });
  return rows.map((row) => ({
    id: row.id,
    codigoFuncionario: row.codigo_funcionario,
    nome: row.nome,
    email: row.email,
    telefone: row.telefone,
    unidade: row.unidade_id ? { id: row.unidade_id, nome: row.unidade_nome } : null,
    departamento: row.departamento_id ? { id: row.departamento_id, nome: row.departamento_nome } : null,
  }));
}
