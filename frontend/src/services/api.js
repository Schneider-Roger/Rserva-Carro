import { mockReservations, mockVehicles } from '../data/mockData.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
export const isMockMode = String(import.meta.env.VITE_USE_MOCKS ?? 'true').toLowerCase() === 'true';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: 'include',
    ...options,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Não foi possível concluir a operação.');
  }
  return payload?.data ?? payload;
}

export async function getAvailableVehicles({ date, start, end }) {
  if (isMockMode) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    return mockVehicles;
  }

  const inicio = `${date}T${start}:00`;
  const fim = `${date}T${end}:00`;
  const params = new URLSearchParams({ inicio, fim });
  return request(`/veiculos/disponiveis?${params}`);
}

export async function createReservation(data) {
  if (isMockMode) {
    await new Promise((resolve) => setTimeout(resolve, 450));
    return { id: 145, status: 'CONFIRMADA', ...data };
  }
  return request('/reservas', { method: 'POST', body: JSON.stringify(data) });
}

export async function getMyReservations() {
  if (isMockMode) return mockReservations;
  return request('/reservas/minhas');
}
