import { ApiError } from '../utils/ApiError.js';
import { parseInstant } from '../utils/dateTime.js';

export function parseAvailabilityQuery(query) {
  const inicio = parseInstant(query.inicio, 'inicio', { enforceHalfHour: true });
  const fim = parseInstant(query.fim, 'fim', { enforceHalfHour: true });
  if (fim.ms <= inicio.ms) throw new ApiError(422, 'PERIODO_INVALIDO', 'O horário final deve ser posterior ao horário inicial.');
  return { inicio: inicio.sql, fim: fim.sql, inicioIso: inicio.iso, fimIso: fim.iso };
}
