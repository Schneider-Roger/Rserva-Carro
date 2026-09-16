import { pool } from '../config/db.js';

const tenantWhere = 'empresa_id = ?';

export async function listCostCenters(empresaId, { q = '' } = {}) {
  const like = `%${q}%`;
  const [rows] = await pool.execute(`
    SELECT id, codigo, nome, descricao, ativo, criado_em, atualizado_em
    FROM centros_custo
    WHERE ${tenantWhere}
      AND (? = '' OR codigo LIKE ? OR nome LIKE ?)
    ORDER BY ativo DESC, nome ASC
  `, [empresaId, q, like, like]);
  return rows;
}

export async function insertCostCenter(connection, empresaId, data) {
  const [result] = await connection.execute(`
    INSERT INTO centros_custo (empresa_id, codigo, nome, descricao, ativo)
    VALUES (?, ?, ?, ?, TRUE)
  `, [empresaId, data.codigo, data.nome, data.descricao]);
  return result.insertId;
}

export async function updateCostCenter(connection, empresaId, id, data) {
  const [result] = await connection.execute(`
    UPDATE centros_custo
       SET codigo = ?, nome = ?, descricao = ?
     WHERE empresa_id = ? AND id = ?
  `, [data.codigo, data.nome, data.descricao, empresaId, id]);
  return result.affectedRows;
}

export async function setCostCenterActive(connection, empresaId, id, active) {
  const [result] = await connection.execute(`UPDATE centros_custo SET ativo = ? WHERE empresa_id = ? AND id = ?`, [active, empresaId, id]);
  return result.affectedRows;
}

export async function listFuelings(empresaId, { q = '' } = {}) {
  const like = `%${q}%`;
  const [rows] = await pool.execute(`
    SELECT a.id, a.data_hora, a.quilometragem, a.tipo_combustivel, a.litros, a.valor_total,
           a.posto, a.observacao, a.status,
           v.id AS veiculo_id, v.codigo_interno, v.placa, v.marca, v.modelo,
           u.id AS motorista_id, u.nome AS motorista_nome,
           cc.id AS centro_custo_id, cc.codigo AS centro_custo_codigo, cc.nome AS centro_custo_nome
      FROM abastecimentos a
      JOIN veiculos v ON v.empresa_id = a.empresa_id AND v.id = a.veiculo_id
      LEFT JOIN usuarios u ON u.empresa_id = a.empresa_id AND u.id = a.motorista_id
      LEFT JOIN centros_custo cc ON cc.empresa_id = a.empresa_id AND cc.id = a.centro_custo_id
     WHERE a.empresa_id = ?
       AND a.status = 'ATIVO'
       AND (? = '' OR v.placa LIKE ? OR v.modelo LIKE ? OR v.codigo_interno LIKE ? OR u.nome LIKE ?)
     ORDER BY a.data_hora DESC, a.id DESC
     LIMIT 500
  `, [empresaId, q, like, like, like, like]);
  return rows;
}

export async function insertFueling(connection, empresaId, userId, data) {
  const [result] = await connection.execute(`
    INSERT INTO abastecimentos (
      empresa_id, veiculo_id, motorista_id, operacao_id, centro_custo_id, data_hora,
      quilometragem, tipo_combustivel, litros, valor_total, posto, comprovante_url,
      observacao, registrado_por_id, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ATIVO')
  `, [empresaId, data.veiculoId, data.motoristaId, data.operacaoId, data.centroCustoId, data.dataHora,
      data.quilometragem, data.tipoCombustivel, data.litros, data.valorTotal, data.posto,
      data.comprovanteUrl, data.observacao, userId]);
  return result.insertId;
}

export async function updateVehicleKmIfHigher(connection, empresaId, vehicleId, km) {
  await connection.execute(`
    UPDATE veiculos
       SET km_atual = GREATEST(km_atual, ?)
     WHERE empresa_id = ? AND id = ?
  `, [km, empresaId, vehicleId]);
}

export async function cancelFueling(connection, empresaId, id, userId, reason) {
  const [result] = await connection.execute(`
    UPDATE abastecimentos
       SET status = 'CANCELADO', cancelado_em = NOW(), cancelado_por_id = ?, motivo_cancelamento = ?
     WHERE empresa_id = ? AND id = ? AND status = 'ATIVO'
  `, [userId, reason, empresaId, id]);
  return result.affectedRows;
}

export async function listMaintenancePlans(empresaId, { q = '' } = {}) {
  const like = `%${q}%`;
  const [rows] = await pool.execute(`
    SELECT p.id, p.nome, p.descricao, p.intervalo_km, p.intervalo_dias, p.ultimo_km, p.ultima_data,
           p.proximo_km, p.proxima_data, p.antecedencia_alerta_km, p.antecedencia_alerta_dias, p.ativo,
           v.id AS veiculo_id, v.codigo_interno, v.placa, v.marca, v.modelo, v.km_atual
      FROM planos_manutencao p
      JOIN veiculos v ON v.empresa_id = p.empresa_id AND v.id = p.veiculo_id
     WHERE p.empresa_id = ?
       AND (? = '' OR v.placa LIKE ? OR v.modelo LIKE ? OR v.codigo_interno LIKE ? OR p.nome LIKE ?)
     ORDER BY p.ativo DESC, p.proxima_data ASC, p.proximo_km ASC
  `, [empresaId, q, like, like, like, like]);
  return rows;
}

export async function insertMaintenancePlan(connection, empresaId, data) {
  const [result] = await connection.execute(`
    INSERT INTO planos_manutencao (
      empresa_id, veiculo_id, nome, descricao, intervalo_km, intervalo_dias,
      ultimo_km, ultima_data, proximo_km, proxima_data,
      antecedencia_alerta_km, antecedencia_alerta_dias, ativo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)
  `, [empresaId, data.veiculoId, data.nome, data.descricao, data.intervaloKm, data.intervaloDias,
      data.ultimoKm, data.ultimaData, data.proximoKm, data.proximaData,
      data.antecedenciaAlertaKm, data.antecedenciaAlertaDias]);
  return result.insertId;
}

export async function updateMaintenancePlan(connection, empresaId, id, data) {
  const [result] = await connection.execute(`
    UPDATE planos_manutencao
       SET veiculo_id = ?, nome = ?, descricao = ?, intervalo_km = ?, intervalo_dias = ?,
           ultimo_km = ?, ultima_data = ?, proximo_km = ?, proxima_data = ?,
           antecedencia_alerta_km = ?, antecedencia_alerta_dias = ?
     WHERE empresa_id = ? AND id = ?
  `, [data.veiculoId, data.nome, data.descricao, data.intervaloKm, data.intervaloDias,
      data.ultimoKm, data.ultimaData, data.proximoKm, data.proximaData,
      data.antecedenciaAlertaKm, data.antecedenciaAlertaDias, empresaId, id]);
  return result.affectedRows;
}

export async function setMaintenancePlanActive(connection, empresaId, id, active) {
  const [result] = await connection.execute(`UPDATE planos_manutencao SET ativo = ? WHERE empresa_id = ? AND id = ?`, [active, empresaId, id]);
  return result.affectedRows;
}

export async function listDocuments(empresaId, type = 'VEICULO') {
  const table = type === 'USUARIO' ? 'documentos_usuario' : 'documentos_veiculo';
  const ownerJoin = type === 'USUARIO'
    ? `JOIN usuarios o ON o.empresa_id = d.empresa_id AND o.id = d.usuario_id`
    : `JOIN veiculos o ON o.empresa_id = d.empresa_id AND o.id = d.veiculo_id`;
  const ownerSelect = type === 'USUARIO'
    ? `o.id AS owner_id, o.nome AS owner_nome`
    : `o.id AS owner_id, CONCAT(o.marca, ' ', o.modelo) AS owner_nome, o.codigo_interno, o.placa`;

  const [rows] = await pool.execute(`
    SELECT d.id, d.tipo, d.numero, d.categoria, d.emissao_em, d.validade_em, d.alerta_dias,
           d.arquivo_url, d.status, ${ownerSelect}
      FROM ${table} d
      ${ownerJoin}
     WHERE d.empresa_id = ? AND d.status <> 'CANCELADO'
     ORDER BY d.validade_em IS NULL, d.validade_em ASC
  `, [empresaId]);
  return rows;
}

export async function insertDocument(connection, empresaId, userId, type, data) {
  if (type === 'USUARIO') {
    const [result] = await connection.execute(`
      INSERT INTO documentos_usuario (empresa_id, usuario_id, tipo, numero, categoria, emissao_em, validade_em, alerta_dias, arquivo_url, status, criado_por_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ATIVO', ?)
    `, [empresaId, data.ownerId, data.tipo, data.numero, data.categoria, data.emissaoEm, data.validadeEm, data.alertaDias, data.arquivoUrl, userId]);
    return result.insertId;
  }

  const [result] = await connection.execute(`
    INSERT INTO documentos_veiculo (empresa_id, veiculo_id, tipo, numero, emissao_em, validade_em, alerta_dias, arquivo_url, observacao, status, criado_por_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ATIVO', ?)
  `, [empresaId, data.ownerId, data.tipo, data.numero, data.emissaoEm, data.validadeEm, data.alertaDias, data.arquivoUrl, data.observacao, userId]);
  return result.insertId;
}

export async function cancelDocument(connection, empresaId, id, type) {
  const table = type === 'USUARIO' ? 'documentos_usuario' : 'documentos_veiculo';
  const [result] = await connection.execute(`UPDATE ${table} SET status = 'CANCELADO' WHERE empresa_id = ? AND id = ? AND status <> 'CANCELADO'`, [empresaId, id]);
  return result.affectedRows;
}

export async function listFines(empresaId, { status = null } = {}) {
  const [rows] = await pool.execute(`
    SELECT m.id, m.auto_infracao, m.data_hora_infracao, m.descricao, m.local_infracao, m.valor, m.pontos,
           m.vencimento_em, m.status, m.observacao,
           v.id AS veiculo_id, CONCAT(v.marca, ' ', v.modelo) AS veiculo_nome, v.codigo_interno, v.placa,
           u.id AS motorista_id, u.nome AS motorista_nome
      FROM multas m
      JOIN veiculos v ON v.empresa_id = m.empresa_id AND v.id = m.veiculo_id
      LEFT JOIN usuarios u ON u.empresa_id = m.empresa_id AND u.id = m.motorista_id
     WHERE m.empresa_id = ?
       AND (? IS NULL OR m.status = ?)
     ORDER BY m.data_hora_infracao DESC, m.id DESC
  `, [empresaId, status, status]);
  return rows;
}

export async function insertFine(connection, empresaId, userId, data) {
  const [result] = await connection.execute(`
    INSERT INTO multas (
      empresa_id, veiculo_id, motorista_id, reserva_id, operacao_id, centro_custo_id,
      auto_infracao, data_hora_infracao, descricao, local_infracao, valor, pontos,
      vencimento_em, status, documento_url, observacao, registrado_por_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDENTE', ?, ?, ?)
  `, [empresaId, data.veiculoId, data.motoristaId, data.reservaId, data.operacaoId, data.centroCustoId,
      data.autoInfracao, data.dataHoraInfracao, data.descricao, data.localInfracao, data.valor, data.pontos,
      data.vencimentoEm, data.documentoUrl, data.observacao, userId]);
  return result.insertId;
}

export async function updateFineStatus(connection, empresaId, id, status, paidAt = null) {
  const [result] = await connection.execute(`UPDATE multas SET status = ?, pago_em = ? WHERE empresa_id = ? AND id = ?`, [status, paidAt, empresaId, id]);
  return result.affectedRows;
}

export async function existsTenantResource(connection, table, empresaId, id) {
  const allowed = new Set(['veiculos', 'usuarios', 'centros_custo', 'operacoes_veiculo', 'reservas']);
  if (!allowed.has(table) || id == null) return id == null;
  const [rows] = await connection.execute(`SELECT id FROM ${table} WHERE empresa_id = ? AND id = ? LIMIT 1`, [empresaId, id]);
  return rows.length > 0;
}
