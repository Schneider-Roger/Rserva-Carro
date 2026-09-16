import { ApiError } from '../utils/ApiError.js';

const DATE_TIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(00|30)(?::00)?$/;

function parseDateTime(value, fieldName) {
  if (typeof value !== 'string') {
    throw new ApiError(
      422,
      'PERIODO_INVALIDO',
      `${fieldName} é obrigatório e deve estar no formato YYYY-MM-DDTHH:mm:ss.`,
    );
  }

  const match = DATE_TIME_PATTERN.exec(value.trim());

  if (!match) {
    throw new ApiError(
      422,
      'PERIODO_INVALIDO',
      `${fieldName} deve usar intervalos de 30 minutos no formato YYYY-MM-DDTHH:mm:ss.`,
    );
  }

  const [, yearText, monthText, dayText, hourText, minuteText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (hour > 23) {
    throw new ApiError(422, 'PERIODO_INVALIDO', `${fieldName} contém horário inválido.`);
  }

  const comparable = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));

  const isValid =
    comparable.getUTCFullYear() === year &&
    comparable.getUTCMonth() === month - 1 &&
    comparable.getUTCDate() === day &&
    comparable.getUTCHours() === hour &&
    comparable.getUTCMinutes() === minute;

  if (!isValid) {
    throw new ApiError(422, 'PERIODO_INVALIDO', `${fieldName} contém data inválida.`);
  }

  const normalized = `${yearText}-${monthText}-${dayText}T${hourText}:${minuteText}:00`;

  return {
    iso: normalized,
    sql: normalized.replace('T', ' '),
    comparable: comparable.getTime(),
  };
}

export function parseAvailabilityQuery(query) {
  const inicio = parseDateTime(query.inicio, 'inicio');
  const fim = parseDateTime(query.fim, 'fim');

  if (fim.comparable <= inicio.comparable) {
    throw new ApiError(
      422,
      'PERIODO_INVALIDO',
      'O horário final deve ser posterior ao horário inicial.',
    );
  }

  return {
    inicio: inicio.sql,
    fim: fim.sql,
    inicioIso: inicio.iso,
    fimIso: fim.iso,
  };
}
