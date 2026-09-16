import { pool } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import * as repo from '../repositories/managementCrud.repository.js';
import { optionalPositiveId, optionalString, requireDate, requireEnum, requireNumber, requireString } from '../utils/validate.js';

const fuelTypes = ['GASOLINA', 'ETANOL', 'DIESEL', 'GNV', 'ELETRICO', 'OUTRO'];
const fineStatuses = ['PENDENTE', 'EM_TRATAMENTO', 'RECURSO', 'PAGA', 'CANCELADA'];

async function transaction(work) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

function affectedOr404(affected) {
  if (!affected) throw new ApiError(404, 'RECURSO_NAO_ENCONTRADO', 'Registro não encontrado.');
}

async function assertSameTenant(connection, empresaId, references) {
  for (const [table, id] of references) {
    if (id == null) continue;
    if (!(await repo.existsTenantResource(connection, table, empresaId, id))) {
      throw new ApiError(400, 'REFERENCIA_INVALIDA', 'Um recurso relacionado não pertence à empresa atual ou não existe.');
    }
  }
}

export const managementCrudService = {
  listCostCenters(empresaId, query) { return repo.listCostCenters(empresaId, { q: String(query.q || '').trim() }); },

  createCostCenter(empresaId, body) {
    const data = {
      codigo: requireString(body.codigo, 'codigo', { min: 1, max: 50 }).toUpperCase(),
      nome: requireString(body.nome, 'nome', { min: 2, max: 120 }),
      descricao: optionalString(body.descricao, 'descricao', { max: 255 }),
    };
    return transaction(async (connection) => ({ id: await repo.insertCostCenter(connection, empresaId, data) }));
  },

  updateCostCenter(empresaId, id, body) {
    const data = {
      codigo: requireString(body.codigo, 'codigo', { min: 1, max: 50 }).toUpperCase(),
      nome: requireString(body.nome, 'nome', { min: 2, max: 120 }),
      descricao: optionalString(body.descricao, 'descricao', { max: 255 }),
    };
    return transaction(async (connection) => { affectedOr404(await repo.updateCostCenter(connection, empresaId, id, data)); return { id }; });
  },

  setCostCenterActive(empresaId, id, active) {
    return transaction(async (connection) => { affectedOr404(await repo.setCostCenterActive(connection, empresaId, id, active)); return { id, ativo: active }; });
  },

  listFuelings(empresaId, query) { return repo.listFuelings(empresaId, { q: String(query.q || '').trim() }); },

  createFueling(empresaId, userId, body) {
    const data = {
      veiculoId: Number(body.veiculoId),
      motoristaId: optionalPositiveId(body.motoristaId, 'motoristaId'),
      operacaoId: optionalPositiveId(body.operacaoId, 'operacaoId'),
      centroCustoId: optionalPositiveId(body.centroCustoId, 'centroCustoId'),
      dataHora: requireDate(body.dataHora, 'dataHora'),
      quilometragem: requireNumber(body.quilometragem, 'quilometragem', { min: 0 }),
      tipoCombustivel: requireEnum(body.tipoCombustivel, 'tipoCombustivel', fuelTypes),
      litros: requireNumber(body.litros, 'litros', { min: 0.001 }),
      valorTotal: requireNumber(body.valorTotal, 'valorTotal', { min: 0 }),
      posto: optionalString(body.posto, 'posto', { max: 180 }),
      comprovanteUrl: optionalString(body.comprovanteUrl, 'comprovanteUrl', { max: 500 }),
      observacao: optionalString(body.observacao, 'observacao', { max: 500 }),
    };
    if (!Number.isInteger(data.veiculoId) || data.veiculoId <= 0) throw new ApiError(400, 'VALIDACAO', 'veiculoId inválido.');
    return transaction(async (connection) => {
      await assertSameTenant(connection, empresaId, [['veiculos', data.veiculoId], ['usuarios', data.motoristaId], ['operacoes_veiculo', data.operacaoId], ['centros_custo', data.centroCustoId]]);
      const id = await repo.insertFueling(connection, empresaId, userId, data);
      await repo.updateVehicleKmIfHigher(connection, empresaId, data.veiculoId, data.quilometragem);
      return { id };
    });
  },

  cancelFueling(empresaId, userId, id, body) {
    const reason = requireString(body.motivo, 'motivo', { min: 3, max: 500 });
    return transaction(async (connection) => { affectedOr404(await repo.cancelFueling(connection, empresaId, id, userId, reason)); return { id, status: 'CANCELADO' }; });
  },

  listMaintenancePlans(empresaId, query) { return repo.listMaintenancePlans(empresaId, { q: String(query.q || '').trim() }); },

  createMaintenancePlan(empresaId, body) {
    const data = normalizeMaintenance(body);
    return transaction(async (connection) => {
      await assertSameTenant(connection, empresaId, [['veiculos', data.veiculoId]]);
      return { id: await repo.insertMaintenancePlan(connection, empresaId, data) };
    });
  },

  updateMaintenancePlan(empresaId, id, body) {
    const data = normalizeMaintenance(body);
    return transaction(async (connection) => {
      await assertSameTenant(connection, empresaId, [['veiculos', data.veiculoId]]);
      affectedOr404(await repo.updateMaintenancePlan(connection, empresaId, id, data));
      return { id };
    });
  },

  setMaintenancePlanActive(empresaId, id, active) {
    return transaction(async (connection) => { affectedOr404(await repo.setMaintenancePlanActive(connection, empresaId, id, active)); return { id, ativo: active }; });
  },

  listDocuments(empresaId, query) {
    const type = String(query.tipo || 'VEICULO').toUpperCase();
    if (!['VEICULO', 'USUARIO'].includes(type)) throw new ApiError(400, 'VALIDACAO', 'tipo deve ser VEICULO ou USUARIO.');
    return repo.listDocuments(empresaId, type);
  },

  createDocument(empresaId, userId, body) {
    const type = requireEnum(body.entidadeTipo, 'entidadeTipo', ['VEICULO', 'USUARIO']);
    const data = {
      ownerId: Number(body.entidadeId),
      tipo: requireString(body.tipo, 'tipo', { min: 2, max: 50 }),
      numero: optionalString(body.numero, 'numero', { max: 100 }),
      categoria: optionalString(body.categoria, 'categoria', { max: 50 }),
      emissaoEm: body.emissaoEm || null,
      validadeEm: body.validadeEm || null,
      alertaDias: body.alertaDias == null ? 30 : requireNumber(body.alertaDias, 'alertaDias', { min: 0, max: 3650 }),
      arquivoUrl: optionalString(body.arquivoUrl, 'arquivoUrl', { max: 500 }),
      observacao: optionalString(body.observacao, 'observacao', { max: 500 }),
    };
    if (!Number.isInteger(data.ownerId) || data.ownerId <= 0) throw new ApiError(400, 'VALIDACAO', 'entidadeId inválido.');
    return transaction(async (connection) => {
      await assertSameTenant(connection, empresaId, [[type === 'USUARIO' ? 'usuarios' : 'veiculos', data.ownerId]]);
      return { id: await repo.insertDocument(connection, empresaId, userId, type, data), entidadeTipo: type };
    });
  },

  cancelDocument(empresaId, id, body) {
    const type = requireEnum(body.entidadeTipo, 'entidadeTipo', ['VEICULO', 'USUARIO']);
    return transaction(async (connection) => { affectedOr404(await repo.cancelDocument(connection, empresaId, id, type)); return { id, status: 'CANCELADO' }; });
  },

  listFines(empresaId, query) {
    const status = query.status ? requireEnum(query.status, 'status', fineStatuses) : null;
    return repo.listFines(empresaId, { status });
  },

  createFine(empresaId, userId, body) {
    const data = {
      veiculoId: Number(body.veiculoId),
      motoristaId: optionalPositiveId(body.motoristaId, 'motoristaId'),
      reservaId: optionalPositiveId(body.reservaId, 'reservaId'),
      operacaoId: optionalPositiveId(body.operacaoId, 'operacaoId'),
      centroCustoId: optionalPositiveId(body.centroCustoId, 'centroCustoId'),
      autoInfracao: optionalString(body.autoInfracao, 'autoInfracao', { max: 100 }),
      dataHoraInfracao: requireDate(body.dataHoraInfracao, 'dataHoraInfracao'),
      descricao: requireString(body.descricao, 'descricao', { min: 3, max: 500 }),
      localInfracao: optionalString(body.localInfracao, 'localInfracao', { max: 255 }),
      valor: requireNumber(body.valor, 'valor', { min: 0 }),
      pontos: body.pontos == null ? null : requireNumber(body.pontos, 'pontos', { min: 0, max: 20 }),
      vencimentoEm: body.vencimentoEm || null,
      documentoUrl: optionalString(body.documentoUrl, 'documentoUrl', { max: 500 }),
      observacao: optionalString(body.observacao, 'observacao', { max: 500 }),
    };
    if (!Number.isInteger(data.veiculoId) || data.veiculoId <= 0) throw new ApiError(400, 'VALIDACAO', 'veiculoId inválido.');
    return transaction(async (connection) => {
      await assertSameTenant(connection, empresaId, [['veiculos', data.veiculoId], ['usuarios', data.motoristaId], ['reservas', data.reservaId], ['operacoes_veiculo', data.operacaoId], ['centros_custo', data.centroCustoId]]);
      return { id: await repo.insertFine(connection, empresaId, userId, data) };
    });
  },

  updateFineStatus(empresaId, id, body) {
    const status = requireEnum(body.status, 'status', fineStatuses);
    const pagoEm = status === 'PAGA' ? (body.pagoEm || new Date().toISOString().slice(0, 10)) : null;
    return transaction(async (connection) => { affectedOr404(await repo.updateFineStatus(connection, empresaId, id, status, pagoEm)); return { id, status }; });
  },
};

function normalizeMaintenance(body) {
  const intervaloKm = body.intervaloKm == null || body.intervaloKm === '' ? null : requireNumber(body.intervaloKm, 'intervaloKm', { min: 1 });
  const intervaloDias = body.intervaloDias == null || body.intervaloDias === '' ? null : requireNumber(body.intervaloDias, 'intervaloDias', { min: 1 });
  if (!intervaloKm && !intervaloDias) throw new ApiError(400, 'VALIDACAO', 'Informe intervaloKm ou intervaloDias.');
  return {
    veiculoId: Number(body.veiculoId),
    nome: requireString(body.nome, 'nome', { min: 2, max: 120 }),
    descricao: optionalString(body.descricao, 'descricao', { max: 500 }),
    intervaloKm,
    intervaloDias,
    ultimoKm: body.ultimoKm == null || body.ultimoKm === '' ? null : requireNumber(body.ultimoKm, 'ultimoKm', { min: 0 }),
    ultimaData: body.ultimaData || null,
    proximoKm: body.proximoKm == null || body.proximoKm === '' ? null : requireNumber(body.proximoKm, 'proximoKm', { min: 0 }),
    proximaData: body.proximaData || null,
    antecedenciaAlertaKm: body.antecedenciaAlertaKm == null ? 1000 : requireNumber(body.antecedenciaAlertaKm, 'antecedenciaAlertaKm', { min: 0 }),
    antecedenciaAlertaDias: body.antecedenciaAlertaDias == null ? 30 : requireNumber(body.antecedenciaAlertaDias, 'antecedenciaAlertaDias', { min: 0 }),
  };
}
