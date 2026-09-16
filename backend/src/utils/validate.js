import { ApiError } from './ApiError.js';

export function assertPositiveId(value, fieldName = 'id') {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ApiError(400, 'PARAMETRO_INVALIDO', `${fieldName} inválido.`);
  }
  return parsed;
}

export function requireString(value, fieldName, { min = 1, max = 255 } = {}) {
  const normalized = String(value ?? '').trim();
  if (normalized.length < min || normalized.length > max) {
    throw new ApiError(400, 'VALIDACAO', `${fieldName} deve ter entre ${min} e ${max} caracteres.`);
  }
  return normalized;
}

export function optionalString(value, fieldName, { max = 500 } = {}) {
  if (value === undefined || value === null || String(value).trim() === '') return null;
  const normalized = String(value).trim();
  if (normalized.length > max) throw new ApiError(400, 'VALIDACAO', `${fieldName} deve ter no máximo ${max} caracteres.`);
  return normalized;
}

export function requireNumber(value, fieldName, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new ApiError(400, 'VALIDACAO', `${fieldName} inválido.`);
  }
  return parsed;
}

export function optionalPositiveId(value, fieldName) {
  if (value === undefined || value === null || value === '') return null;
  return assertPositiveId(value, fieldName);
}

export function requireDate(value, fieldName) {
  const normalized = requireString(value, fieldName, { min: 10, max: 25 });
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) throw new ApiError(400, 'VALIDACAO', `${fieldName} inválido.`);
  return normalized;
}

export function requireEnum(value, fieldName, allowed) {
  const normalized = requireString(value, fieldName, { min: 1, max: 80 }).toUpperCase();
  if (!allowed.includes(normalized)) throw new ApiError(400, 'VALIDACAO', `${fieldName} inválido.`);
  return normalized;
}
