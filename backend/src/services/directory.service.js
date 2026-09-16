import { findUsers } from '../repositories/directory.repository.js';

function mapDirectoryUser(row, { limited = false } = {}) {
  const base = {
    id: row.id,
    employeeCode: row.codigo_funcionario,
    name: row.nome,
    unit: row.unidade_id ? { id: row.unidade_id, name: row.unidade_nome } : null,
    department: row.departamento_id ? { id: row.departamento_id, name: row.departamento_nome } : null,
  };
  if (!limited) {
    base.email = row.email;
    base.phone = row.telefone;
  }
  return base;
}

export async function listUsers(empresaId, query = {}) {
  return (await findUsers(empresaId, { q: String(query.q || '').trim(), limit: query.limit })).map((row) => mapDirectoryUser(row));
}

export async function listDrivers(empresaId, query = {}) {
  return (await findUsers(empresaId, { q: String(query.q || '').trim(), limit: query.limit || 100 })).map((row) => mapDirectoryUser(row, { limited: true }));
}
