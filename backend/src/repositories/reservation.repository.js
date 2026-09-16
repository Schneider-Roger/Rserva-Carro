import { pool } from '../config/db.js';

export async function lockVehicle(connection, empresaId, vehicleId) {
  const [rows] = await connection.execute('SELECT id, ativo, status_operacional, unidade_id FROM veiculos WHERE empresa_id = ? AND id = ? FOR UPDATE', [empresaId, vehicleId]);
  return rows[0] || null;
}

export async function lockReservation(connection, empresaId, id) {
  const [rows] = await connection.execute('SELECT * FROM reservas WHERE empresa_id = ? AND id = ? FOR UPDATE', [empresaId, id]);
  return rows[0] || null;
}

export async function findActiveUser(connection, empresaId, id) {
  const [rows] = await connection.execute('SELECT id, unidade_id, departamento_id FROM usuarios WHERE empresa_id = ? AND id = ? AND ativo = TRUE LIMIT 1', [empresaId, id]);
  return rows[0] || null;
}

export async function findActiveCostCenter(connection, empresaId, id) {
  if (!id) return null;
  const [rows] = await connection.execute('SELECT id FROM centros_custo WHERE empresa_id = ? AND id = ? AND ativo = TRUE LIMIT 1', [empresaId, id]);
  return rows[0] || null;
}

export async function hasReservationConflict(connection, empresaId, vehicleId, start, end, excludeId = null) {
  const [rows] = await connection.execute(`SELECT id FROM reservas WHERE empresa_id = ? AND veiculo_id = ? AND status = 'CONFIRMADA' AND data_hora_inicio < ? AND data_hora_fim > ? AND (? IS NULL OR id <> ?) LIMIT 1`, [empresaId, vehicleId, end, start, excludeId, excludeId]);
  return rows.length > 0;
}

export async function hasBlockConflict(connection, empresaId, vehicleId, start, end) {
  const [rows] = await connection.execute(`SELECT id FROM bloqueios_veiculo WHERE empresa_id = ? AND veiculo_id = ? AND ativo = TRUE AND data_hora_inicio < ? AND data_hora_fim > ? LIMIT 1`, [empresaId, vehicleId, end, start]);
  return rows.length > 0;
}

export async function resolveCities(connection, codes) {
  const uniqueCodes = [...new Set(codes)];
  const placeholders = uniqueCodes.map(() => '?').join(',');
  const [rows] = await connection.execute(`SELECT id, codigo_ibge, nome FROM cidades WHERE codigo_ibge IN (${placeholders})`, uniqueCodes);
  return rows;
}

export async function insertReservation(connection, empresaId, actorId, requesterId, data) {
  const [result] = await connection.execute(`INSERT INTO reservas (empresa_id, solicitante_id, motorista_id, veiculo_id, criado_por_id, centro_custo_id, data_hora_inicio, data_hora_fim, motivo, numero_chamado, observacao, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMADA')`, [empresaId, requesterId, data.motoristaId, data.veiculoId, actorId, data.centroCustoId, data.inicioSql, data.fimSql, data.motivo, data.numeroChamado, data.observacao]);
  return result.insertId;
}

export async function updateReservation(connection, empresaId, id, data) {
  const [result] = await connection.execute(`UPDATE reservas SET motorista_id=?, veiculo_id=?, centro_custo_id=?, data_hora_inicio=?, data_hora_fim=?, motivo=?, numero_chamado=?, observacao=? WHERE empresa_id=? AND id=? AND status='CONFIRMADA'`, [data.motoristaId, data.veiculoId, data.centroCustoId, data.inicioSql, data.fimSql, data.motivo, data.numeroChamado, data.observacao, empresaId, id]);
  return result.affectedRows;
}

export async function replaceDestinations(connection, empresaId, reservationId, destinations, cityMap) {
  await connection.execute('DELETE FROM reserva_destinos WHERE empresa_id = ? AND reserva_id = ?', [empresaId, reservationId]);
  for (const item of destinations) {
    const cityId = cityMap.get(item.codigoIbge);
    await connection.execute('INSERT INTO reserva_destinos (empresa_id, reserva_id, cidade_id, ordem) VALUES (?, ?, ?, ?)', [empresaId, reservationId, cityId, item.ordem]);
  }
}

export async function cancelReservation(connection, empresaId, id, actorId, reason) {
  const [result] = await connection.execute(`UPDATE reservas SET status='CANCELADA', cancelado_em=UTC_TIMESTAMP(), cancelado_por_id=?, motivo_cancelamento=? WHERE empresa_id=? AND id=? AND status='CONFIRMADA'`, [actorId, reason, empresaId, id]);
  return result.affectedRows;
}

export async function insertAudit(connection, empresaId, actorId, action, entityId, before, after, requestContext = {}) {
  await connection.execute(`INSERT INTO auditoria (empresa_id, usuario_id, acao, entidade, entidade_id, dados_anteriores, dados_novos, ip, user_agent, request_id) VALUES (?, ?, ?, 'RESERVA', ?, ?, ?, ?, ?, ?)`, [empresaId, actorId, action, String(entityId), before ? JSON.stringify(before) : null, after ? JSON.stringify(after) : null, requestContext.ip || null, requestContext.userAgent || null, requestContext.requestId || null]);
}

const reservationSelect = `SELECT r.*, v.codigo_interno, v.placa, v.marca, v.modelo,
  s.nome AS solicitante_nome, s.unidade_id AS solicitante_unidade_id, s.departamento_id AS solicitante_departamento_id,
  m.nome AS motorista_nome, cc.codigo AS centro_custo_codigo, cc.nome AS centro_custo_nome
  FROM reservas r
  JOIN veiculos v ON v.empresa_id=r.empresa_id AND v.id=r.veiculo_id
  JOIN usuarios s ON s.empresa_id=r.empresa_id AND s.id=r.solicitante_id
  JOIN usuarios m ON m.empresa_id=r.empresa_id AND m.id=r.motorista_id
  LEFT JOIN centros_custo cc ON cc.empresa_id=r.empresa_id AND cc.id=r.centro_custo_id`;

export async function findReservationById(empresaId, id) {
  const [rows] = await pool.execute(`${reservationSelect} WHERE r.empresa_id=? AND r.id=? LIMIT 1`, [empresaId, id]);
  if (!rows[0]) return null;
  return attachDestinations(empresaId, rows[0]);
}

export async function canUserViewTeamReservation(empresaId, actorId, reservationId) {
  const [rows] = await pool.execute(`
    SELECT 1
      FROM reservas r
      JOIN usuarios actor ON actor.empresa_id = r.empresa_id AND actor.id = ? AND actor.ativo = TRUE
      JOIN usuarios owner ON owner.empresa_id = r.empresa_id AND owner.id = r.solicitante_id
     WHERE r.empresa_id = ? AND r.id = ?
       AND (
         (actor.departamento_id IS NOT NULL AND owner.departamento_id = actor.departamento_id)
         OR
         (actor.departamento_id IS NULL AND actor.unidade_id IS NOT NULL AND owner.unidade_id = actor.unidade_id)
       )
     LIMIT 1
  `, [actorId, empresaId, reservationId]);
  return rows.length > 0;
}

export async function listReservations(empresaId, { requesterId = null, teamActorId = null, limit = 200 } = {}) {
  const safeLimit = Math.min(Math.max(Number(limit) || 200, 1), 500);
  const params = [];
  let teamJoin = '';
  let scopeClause = '';
  if (teamActorId) {
    teamJoin = ' JOIN usuarios actor ON actor.empresa_id=r.empresa_id AND actor.id=? AND actor.ativo=TRUE';
    params.push(teamActorId);
    scopeClause = ` AND ((actor.departamento_id IS NOT NULL AND s.departamento_id=actor.departamento_id) OR (actor.departamento_id IS NULL AND actor.unidade_id IS NOT NULL AND s.unidade_id=actor.unidade_id))`;
  }
  params.push(empresaId);
  if (requesterId) { scopeClause += ' AND r.solicitante_id = ?'; params.push(requesterId); }

  const [rows] = await pool.execute(`${reservationSelect}${teamJoin} WHERE r.empresa_id=?${scopeClause} ORDER BY r.data_hora_inicio DESC LIMIT ${safeLimit}`, params);
  if (!rows.length) return [];
  const ids = rows.map((row) => row.id);
  const placeholders = ids.map(() => '?').join(',');
  const [destinations] = await pool.execute(`SELECT rd.reserva_id, rd.ordem, c.codigo_ibge, c.nome AS cidade, e.uf FROM reserva_destinos rd JOIN cidades c ON c.id=rd.cidade_id JOIN estados e ON e.id=c.estado_id WHERE rd.empresa_id=? AND rd.reserva_id IN (${placeholders}) ORDER BY rd.reserva_id, rd.ordem`, [empresaId, ...ids]);
  const grouped = new Map();
  for (const item of destinations) { if (!grouped.has(item.reserva_id)) grouped.set(item.reserva_id, []); grouped.get(item.reserva_id).push(item); }
  return rows.map((row) => ({ ...row, destinos: grouped.get(row.id) || [] }));
}

async function attachDestinations(empresaId, row) {
  const [destinos] = await pool.execute(`SELECT rd.ordem, c.codigo_ibge, c.nome AS cidade, e.uf FROM reserva_destinos rd JOIN cidades c ON c.id=rd.cidade_id JOIN estados e ON e.id=c.estado_id WHERE rd.empresa_id=? AND rd.reserva_id=? ORDER BY rd.ordem`, [empresaId, row.id]);
  return { ...row, destinos };
}
