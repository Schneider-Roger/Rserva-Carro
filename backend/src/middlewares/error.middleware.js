import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export function errorMiddleware(error, req, res, next) {
  void next;
  const requestId = req.requestId || null;

  if (error instanceof ApiError) {
    const payload = { success: false, error: { code: error.code, message: error.message, requestId } };
    if (error.details !== null) payload.error.details = error.details;
    return res.status(error.statusCode).json(payload);
  }

  if (env.nodeEnv !== 'test') console.error({ requestId, error });
  return res.status(500).json({ success: false, error: { code: 'ERRO_INTERNO', message: 'Ocorreu um erro interno. Tente novamente mais tarde.', requestId } });
}
