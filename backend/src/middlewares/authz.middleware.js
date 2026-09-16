import { ApiError } from '../utils/ApiError.js';

export function requireIdentity(req, _res, next) {
  if (!req.user?.id || !req.user?.empresaId) {
    return next(new ApiError(401, 'NAO_AUTENTICADO', 'Autenticação necessária.'));
  }
  return next();
}

export function requirePermission(...requiredPermissions) {
  return (req, _res, next) => {
    if (!req.user?.id) {
      return next(new ApiError(401, 'NAO_AUTENTICADO', 'Autenticação necessária.'));
    }

    const permissions = new Set(req.user.permissions || []);
    if (permissions.has('*') || requiredPermissions.some((permission) => permissions.has(permission))) {
      return next();
    }

    return next(new ApiError(403, 'SEM_PERMISSAO', 'Você não possui permissão para executar esta operação.'));
  };
}
