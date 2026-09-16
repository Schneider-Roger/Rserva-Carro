import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export function tenantMiddleware(req, res, next) {
  // Temporário para desenvolvimento. Quando autenticação/SSO entrar,
  // req.user.empresaId será a única fonte válida do tenant.
  const empresaId = req.user?.empresaId ?? (env.nodeEnv === 'development' ? env.devEmpresaId : null);

  if (!empresaId) {
    return next(new ApiError(401, 'TENANT_NAO_RESOLVIDO', 'Não foi possível identificar a empresa do usuário autenticado.'));
  }

  req.tenant = Object.freeze({ empresaId: Number(empresaId) });
  return next();
}
