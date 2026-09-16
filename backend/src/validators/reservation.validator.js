import { ApiError } from '../utils/ApiError.js';
import { parseInstant } from '../utils/dateTime.js';
import { optionalPositiveId, optionalString, requireString } from '../utils/validate.js';
import { validateDestinationCount } from '../domain/reservationRules.js';

function positiveId(value, name) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) throw new ApiError(422, 'VALIDACAO', `${name} inválido.`);
  return parsed;
}

export function normalizeReservationPayload(body, settings = {}) {
  const options = {
    intervalMinutes: Number(settings.intervalo_reserva_minutos || 30),
    timeZone: settings.timezone || 'UTC',
  };
  const inicio = parseInstant(body.dataHoraInicio, 'dataHoraInicio', options);
  const fim = parseInstant(body.dataHoraFim, 'dataHoraFim', options);
  if (fim.ms <= inicio.ms) throw new ApiError(422, 'PERIODO_INVALIDO', 'O retorno deve ser posterior à saída.');

  const maxDestinations = Math.min(Math.max(Number(settings.max_destinos || 10), 1), 10);
  if (!validateDestinationCount(body.destinos, maxDestinations)) throw new ApiError(422, 'DESTINOS_INVALIDOS', `Informe entre 1 e ${maxDestinations} destinos.`);

  const destinos = body.destinos.map((item, index) => ({
    codigoIbge: positiveId(item.codigoIbge, `destinos[${index}].codigoIbge`),
    ordem: index + 1,
  }));

  return {
    veiculoId: positiveId(body.veiculoId, 'veiculoId'),
    motoristaId: positiveId(body.motoristaId, 'motoristaId'),
    solicitanteId: body.solicitanteId ? positiveId(body.solicitanteId, 'solicitanteId') : null,
    centroCustoId: optionalPositiveId(body.centroCustoId, 'centroCustoId'),
    inicioSql: inicio.sql,
    fimSql: fim.sql,
    inicioIso: inicio.iso,
    fimIso: fim.iso,
    inicioMs: inicio.ms,
    fimMs: fim.ms,
    motivo: requireString(body.motivo, 'motivo', { min: 5, max: 1000 }),
    numeroChamado: optionalString(body.numeroChamado, 'numeroChamado', { max: 100 }),
    observacao: optionalString(body.observacao, 'observacao', { max: 5000 }),
    destinos,
  };
}
