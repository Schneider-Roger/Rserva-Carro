import { ApiError } from './ApiError.js';

function minuteInTimeZone(date, timeZone) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      minute: '2-digit',
      second: '2-digit',
      hour: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(date);
    return {
      minute: Number(parts.find((part) => part.type === 'minute')?.value || 0),
      second: Number(parts.find((part) => part.type === 'second')?.value || 0),
    };
  } catch {
    throw new ApiError(500, 'TIMEZONE_INVALIDO', 'O timezone configurado para a empresa é inválido.');
  }
}

export function parseInstant(value, fieldName, { intervalMinutes = null, timeZone = 'UTC' } = {}) {
  if (typeof value !== 'string' || !value.trim()) throw new ApiError(422, 'PERIODO_INVALIDO', `${fieldName} é obrigatório.`);
  const text = value.trim();
  if (!/(Z|[+-]\d{2}:\d{2})$/.test(text)) throw new ApiError(422, 'PERIODO_INVALIDO', `${fieldName} deve ser ISO 8601 com timezone.`);
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) throw new ApiError(422, 'PERIODO_INVALIDO', `${fieldName} contém data inválida.`);

  if (intervalMinutes) {
    const interval = Number(intervalMinutes);
    const { minute, second } = minuteInTimeZone(date, timeZone);
    if (!Number.isInteger(interval) || interval <= 0 || minute % interval !== 0 || second !== 0 || date.getUTCMilliseconds() !== 0) {
      throw new ApiError(422, 'PERIODO_INVALIDO', `${fieldName} deve respeitar intervalos de ${intervalMinutes} minutos no timezone da empresa.`);
    }
  }

  const iso = date.toISOString();
  return { iso, sql: iso.slice(0, 19).replace('T', ' '), ms: date.getTime() };
}
