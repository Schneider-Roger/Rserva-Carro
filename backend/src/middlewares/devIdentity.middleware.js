import { env } from '../config/env.js';

export function devIdentityMiddleware(req, _res, next) {
  if (env.nodeEnv === 'development' && !req.user) {
    req.user = Object.freeze({
      id: env.devUserId,
      empresaId: env.devEmpresaId,
      roles: ['ADMIN'],
      permissions: ['*'],
      source: 'development-fallback',
    });
  }

  next();
}
