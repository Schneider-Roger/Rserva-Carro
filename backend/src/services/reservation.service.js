import { pool } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { canRegularUserChange, deriveReservationStatus } from '../domain/reservationRules.js';
import { normalizeReservationPayload } from '../validators/reservation.validator.js';
import * as repo from '../repositories/reservation.repository.js';

const hasPermission = (user, permission) => user.permissions?.includes('*') || user.permissions?.includes(permission);

async function transaction(work) {
  const connection = await pool.getConnection();
  try { await connection.beginTransaction(); const result = await work(connection); await connection.commit(); return result; }
  catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
}

function requestContext(req) { return { requestId: req.requestId, ip: req.ip, userAgent: req.get('user-agent') }; }

async function validateReferences(connection, empresaId, data, requesterId, settings) {
  const vehicle = await repo.lockVehicle(connection, empresaId, data.veiculoId);
  if (!vehicle || !vehicle.ativo || vehicle.status_operacional !== 'DISPONIVEL') throw new ApiError(409, 'VEICULO_INDISPONIVEL', 'O veículo não está disponível para reserva.');
  if (!await repo.findActiveUser(connection, empresaId, requesterId)) throw new ApiError(422, 'SOLICITANTE_INVALIDO', 'Solicitante inválido.');
  if (!await repo.findActiveUser(connection, empresaId, data.motoristaId)) throw new ApiError(422, 'MOTORISTA_INVALIDO', 'Motorista inválido.');
  if (!settings.permite_motorista_diferente && requesterId !== data.motoristaId) throw new ApiError(422, 'MOTORISTA_NAO_PERMITIDO', 'A empresa não permite motorista diferente do solicitante.');
  if (settings.exige_centro_custo && !data.centroCustoId) throw new ApiError(422, 'CENTRO_CUSTO_OBRIGATORIO', 'Informe o centro de custo.');
  if (data.centroCustoId && !await repo.findActiveCostCenter(connection, empresaId, data.centroCustoId)) throw new ApiError(422, 'CENTRO_CUSTO_INVALIDO', 'Centro de custo inválido.');
  const cityRows = await repo.resolveCities(connection, data.destinos.map((item) => item.codigoIbge));
  const cityMap = new Map(cityRows.map((row) => [Number(row.codigo_ibge), row.id]));
  if (cityMap.size !== new Set(data.destinos.map((item) => item.codigoIbge)).size) throw new ApiError(422, 'DESTINO_INVALIDO', 'Um ou mais municípios não foram encontrados.');
  return { vehicle, cityMap };
}

async function assertNoConflict(connection, empresaId, data, excludeId = null) {
  if (await repo.hasReservationConflict(connection, empresaId, data.veiculoId, data.inicioSql, data.fimSql, excludeId) || await repo.hasBlockConflict(connection, empresaId, data.veiculoId, data.inicioSql, data.fimSql)) {
    throw new ApiError(409, 'VEHICLE_NOT_AVAILABLE', 'Este veículo acabou de ser reservado nesse período. Escolha outro veículo.');
  }
}

export async function createReservation(req) {
  const empresaId = req.tenant.empresaId; const actorId = req.user.id;
  const settings = await repo.getTenantSettings(empresaId);
  const data = normalizeReservationPayload(req.body, settings);
  const requesterId = data.solicitanteId && hasPermission(req.user, 'RESERVA_CRIAR_PARA_OUTRO') ? data.solicitanteId : actorId;
  if (data.solicitanteId && requesterId !== data.solicitanteId) throw new ApiError(403, 'SEM_PERMISSAO', 'Você não pode criar reserva para outro colaborador.');
  if (!hasPermission(req.user, 'RESERVA_CRIAR_PARA_OUTRO') && data.inicioMs < Date.now()) throw new ApiError(422, 'PERIODO_PASSADO', 'Não é permitido criar reserva com início no passado.');
  if (settings.exige_numero_chamado && !data.numeroChamado) throw new ApiError(422, 'CHAMADO_OBRIGATORIO', 'Informe o número do chamado.');

  return transaction(async (connection) => {
    const { cityMap } = await validateReferences(connection, empresaId, data, requesterId, settings);
    await assertNoConflict(connection, empresaId, data);
    const id = await repo.insertReservation(connection, empresaId, actorId, requesterId, data);
    await repo.replaceDestinations(connection, empresaId, id, data.destinos, cityMap);
    await repo.insertAudit(connection, empresaId, actorId, 'RESERVA_CRIADA', id, null, { ...data, solicitanteId: requesterId }, requestContext(req));
    return { id, status: 'CONFIRMADA' };
  });
}

export async function updateReservation(req, id) {
  const empresaId = req.tenant.empresaId; const actorId = req.user.id;
  const settings = await repo.getTenantSettings(empresaId);
  if (!settings.permite_edicao_reserva && !hasPermission(req.user, 'RESERVA_EDITAR_TODAS')) throw new ApiError(403, 'EDICAO_DESABILITADA', 'A edição de reservas está desabilitada.');
  const data = normalizeReservationPayload(req.body, settings);

  return transaction(async (connection) => {
    const current = await repo.lockReservation(connection, empresaId, id);
    if (!current) throw new ApiError(404, 'RESERVA_NAO_ENCONTRADA', 'Reserva não encontrada.');
    if (current.status === 'CANCELADA') throw new ApiError(409, 'RESERVA_CANCELADA', 'Uma reserva cancelada não pode ser alterada.');
    const isOwner = Number(current.solicitante_id) === actorId;
    if (!hasPermission(req.user, 'RESERVA_EDITAR_TODAS') && (!isOwner || !canRegularUserChange(new Date(`${current.data_hora_inicio}Z`).getTime()))) throw new ApiError(403, 'SEM_PERMISSAO', 'Esta reserva não pode mais ser alterada por você.');
    const { cityMap } = await validateReferences(connection, empresaId, data, current.solicitante_id, settings);
    await assertNoConflict(connection, empresaId, data, id);
    const affected = await repo.updateReservation(connection, empresaId, id, data);
    if (!affected) throw new ApiError(409, 'RESERVA_NAO_ATUALIZADA', 'A reserva não pôde ser atualizada.');
    await repo.replaceDestinations(connection, empresaId, id, data.destinos, cityMap);
    await repo.insertAudit(connection, empresaId, actorId, 'RESERVA_EDITADA', id, current, data, requestContext(req));
    return { id };
  });
}

export async function cancelReservation(req, id) {
  const empresaId = req.tenant.empresaId; const actorId = req.user.id;
  const settings = await repo.getTenantSettings(empresaId);
  return transaction(async (connection) => {
    const current = await repo.lockReservation(connection, empresaId, id);
    if (!current) throw new ApiError(404, 'RESERVA_NAO_ENCONTRADA', 'Reserva não encontrada.');
    if (current.status === 'CANCELADA') throw new ApiError(409, 'RESERVA_CANCELADA', 'A reserva já está cancelada.');
    const isOwner = Number(current.solicitante_id) === actorId;
    const canCancelAll = hasPermission(req.user, 'RESERVA_CANCELAR_TODAS');
    if (!canCancelAll && (!isOwner || !settings.permite_cancelamento || !canRegularUserChange(new Date(`${current.data_hora_inicio}Z`).getTime()))) throw new ApiError(403, 'SEM_PERMISSAO', 'Esta reserva não pode ser cancelada por você.');
    const reason = String(req.body?.motivo || '').trim();
    if (canCancelAll && !isOwner && reason.length < 3) throw new ApiError(422, 'MOTIVO_CANCELAMENTO_OBRIGATORIO', 'Informe o motivo do cancelamento.');
    await repo.cancelReservation(connection, empresaId, id, actorId, reason || null);
    await repo.insertAudit(connection, empresaId, actorId, 'RESERVA_CANCELADA', id, current, { motivo: reason || null }, requestContext(req));
    return { id, status: 'CANCELADA' };
  });
}

function mapReservation(row) {
  const startMs = new Date(`${row.data_hora_inicio.replace(' ', 'T')}Z`).getTime();
  const endMs = new Date(`${row.data_hora_fim.replace(' ', 'T')}Z`).getTime();
  return {
    id: row.id,
    status: deriveReservationStatus(row.status, startMs, endMs),
    dataHoraInicio: new Date(startMs).toISOString(), dataHoraFim: new Date(endMs).toISOString(),
    motivo: row.motivo, numeroChamado: row.numero_chamado, observacao: row.observacao,
    solicitante: { id: row.solicitante_id, nome: row.solicitante_nome }, motorista: { id: row.motorista_id, nome: row.motorista_nome },
    veiculo: { id: row.veiculo_id, codigoInterno: row.codigo_interno, placa: row.placa, marca: row.marca, modelo: row.modelo },
    centroCusto: row.centro_custo_id ? { id: row.centro_custo_id, codigo: row.centro_custo_codigo, nome: row.centro_custo_nome } : null,
    destinos: (row.destinos || []).map((d) => ({ ordem: d.ordem, codigoIbge: d.codigo_ibge, cidade: d.cidade, uf: d.uf })),
  };
}

export async function getMyReservations(req) { return (await repo.listReservations(req.tenant.empresaId, { requesterId: req.user.id })).map(mapReservation); }
export async function getAllReservations(req) { return (await repo.listReservations(req.tenant.empresaId, { limit: req.query.limit })).map(mapReservation); }
export async function getReservation(req, id) {
  const row = await repo.findReservationById(req.tenant.empresaId, id);
  if (!row) throw new ApiError(404, 'RESERVA_NAO_ENCONTRADA', 'Reserva não encontrada.');
  if (Number(row.solicitante_id) !== req.user.id && !hasPermission(req.user, 'RESERVA_VISUALIZAR_TODAS') && !hasPermission(req.user, 'RESERVA_VISUALIZAR_EQUIPE')) throw new ApiError(403, 'SEM_PERMISSAO', 'Você não possui acesso a esta reserva.');
  return mapReservation(row);
}
