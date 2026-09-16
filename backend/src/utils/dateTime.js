import { ApiError } from './ApiError.js';

export function parseInstant(value, fieldName, { enforceHalfHour = false } = {}) {
  if (typeof value !== 'string' || !value.trim()) throw new ApiError(422, 'PERIODO_INVALIDO', `${fieldName} é obrigatório.`);
  const text = value.trim();
  if (!/(Z|[+-]\d{2}:\d{2})$/.test(text)) throw new ApiError(422, 'PERIODO_INVALIDO', `${fieldName} deve ser ISO 8601 com timezone.`);
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) throw new ApiError(422, 'PERIODO_INVALIDO', `${fieldName} contém data inválida.`);
  if (enforceHalfHour && ![0, 30].includes(date.getUTCMinutes())) throw new ApiError(422, 'PERIODO_INVALIDO', `${fieldName} deve respeitar intervalos de 30 minutos.`);
  const iso = date.toISOString();
  return { iso, sql: iso.slice(0, 19).replace('T', ' '), ms: date.getTime() };
}
