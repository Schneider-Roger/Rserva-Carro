import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export function errorMiddleware(error, req, res, next) {
  void next;

  if (error instanceof ApiError) {
    const payload = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    };

    if (error.details !== null) {
      payload.error.details = error.details;
    }

    return res.status(error.statusCode).json(payload);
  }

  if (env.nodeEnv !== 'test') {
    console.error(error);
  }

  return res.status(500).json({
    success: false,
    error: {
      code: 'ERRO_INTERNO',
      message: 'Ocorreu um erro interno. Tente novamente mais tarde.',
    },
  });
}
