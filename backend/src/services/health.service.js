import { pingDatabase } from '../repositories/health.repository.js';

export async function checkHealth() {
  await pingDatabase();

  return {
    status: 'ok',
  };
}
