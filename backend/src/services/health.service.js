import { pingDatabase } from '../repositories/health.repository.js';

export function checkLiveness() {
  return { status: 'ok' };
}

export async function checkReadiness() {
  await pingDatabase();
  return { status: 'ready', database: 'ok' };
}
