import { ApiError } from '../utils/ApiError.js';
import { parseInstant } from '../utils/dateTime.js';

export function parseAvailabilityQuery(query, settings = {}) {
  const options = {
    intervalMinutes: Number(settings.intervalo_reserva_minutos || 30),
    timeZone: settings.timezone || 'UTC',
  };
  const inicio = parseInstant(query.inicio, 'inicio', options);
  const fim = parseInstant(query.fim, 'fim', options);
  if (fim.ms <= inicio.ms) throw new ApiError(422, 'PERIODO_INVALIDO', 'O horário final deve ser posterior ao horário inicial.');
  return { inicio: inicio.sql, fim: fim.sql, inicioIso: inicio.iso, fimIso: fim.iso };
}
