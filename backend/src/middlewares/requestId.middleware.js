import { randomUUID } from 'node:crypto';

export function requestIdMiddleware(req, res, next) {
  const incoming = String(req.get('x-request-id') || '').trim();
  const requestId = incoming && incoming.length <= 100 ? incoming : randomUUID();
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
}
