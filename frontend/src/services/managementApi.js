import { isMockMode } from './api.js';
import { mockVehicles, mockUsers } from '../data/mockData.js';
import { managementCostCenters, managementDriverDocuments, managementFines, managementFuelings, managementMaintenancePlans, managementVehicleDocuments } from '../data/managementMockData.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const delay = () => new Promise((resolve) => setTimeout(resolve, 220));

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(payload?.error?.message || 'Não foi possível concluir a operação.');
    error.code = payload?.error?.code || 'API_ERROR';
    error.status = response.status;
    throw error;
  }
  return payload?.data ?? payload;
}

export async function getVehicles() {
  if (isMockMode) { await delay(); return mockVehicles; }
  return request('/veiculos');
}

export async function getUsers() {
  if (isMockMode) { await delay(); return mockUsers; }
  return request('/usuarios');
}

export async function getCostCenters() {
  if (isMockMode) { await delay(); return managementCostCenters.map((x) => ({ id: x.id, code: x.code, name: x.name, active: x.active })); }
  const rows = await request('/centros-custo');
  return rows.map((x) => ({ id: x.id, code: x.codigo, name: x.nome, description: x.descricao, active: Boolean(x.ativo) }));
}

export async function createCostCenter(data) {
  if (isMockMode) { await delay(); return { id: Date.now(), ...data, active: true }; }
  return request('/centros-custo', { method: 'POST', body: JSON.stringify({ codigo: data.code, nome: data.name, descricao: data.description || null }) });
}

export async function getFuelings() {
  if (isMockMode) { await delay(); return managementFuelings; }
  const rows = await request('/abastecimentos');
  return rows.map((x) => ({ id: x.id, date: String(x.data_hora).slice(0, 10), vehicle: `${x.marca} ${x.modelo}`, code: x.codigo_interno, plate: x.placa, driver: x.motorista_nome || 'Não informado', costCenter: x.centro_custo_codigo || '—', fuel: x.tipo_combustivel, liters: Number(x.litros), total: Number(x.valor_total), km: Number(x.quilometragem), station: x.posto || 'Não informado' }));
}

export async function createFueling(data) {
  if (isMockMode) { await delay(); return { id: Date.now() }; }
  return request('/abastecimentos', { method: 'POST', body: JSON.stringify(data) });
}

export async function getMaintenancePlans() {
  if (isMockMode) { await delay(); return managementMaintenancePlans; }
  const rows = await request('/manutencoes/planos');
  const today = new Date();
  return rows.map((x) => {
    const currentKm = Number(x.km_atual || 0);
    const nextKm = Number(x.proximo_km || 0);
    const nextDate = x.proxima_data ? String(x.proxima_data).slice(0, 10) : null;
    const kmNear = nextKm > 0 && nextKm - currentKm <= Number(x.antecedencia_alerta_km || 1000);
    const dateNear = nextDate && ((new Date(`${nextDate}T12:00:00`) - today) / 86400000) <= Number(x.antecedencia_alerta_dias || 30);
    const overdue = (nextKm > 0 && currentKm >= nextKm) || (nextDate && new Date(`${nextDate}T23:59:59`) < today);
    return { id: x.id, vehicle: `${x.marca} ${x.modelo}`, code: x.codigo_interno, vehicleId: x.veiculo_id, name: x.nome, currentKm, nextKm, nextDate, status: overdue ? 'ATRASADA' : (kmNear || dateNear ? 'PROXIMO' : 'EM_DIA') };
  });
}

export async function createMaintenancePlan(data) {
  if (isMockMode) { await delay(); return { id: Date.now() }; }
  return request('/manutencoes/planos', { method: 'POST', body: JSON.stringify(data) });
}

export async function getDocuments(type) {
  if (isMockMode) { await delay(); return type === 'USUARIO' ? managementDriverDocuments : managementVehicleDocuments; }
  const rows = await request(`/documentos?tipo=${type}`);
  return rows.map((x) => ({ id: x.id, ownerId: x.owner_id, owner: x.placa ? `${x.owner_nome} · ${x.codigo_interno}` : x.owner_nome, type: x.categoria ? `${x.tipo} ${x.categoria}` : x.tipo, number: x.numero || '—', expiresAt: x.validade_em ? String(x.validade_em).slice(0, 10) : null, status: documentStatus(x.validade_em) }));
}

export async function createDocument(data) {
  if (isMockMode) { await delay(); return { id: Date.now() }; }
  return request('/documentos', { method: 'POST', body: JSON.stringify(data) });
}

export async function getFines(status = null) {
  if (isMockMode) { await delay(); return status ? managementFines.filter((x) => x.status === status) : managementFines; }
  const suffix = status ? `?status=${status}` : '';
  const rows = await request(`/multas${suffix}`);
  return rows.map((x) => ({ id: x.id, notice: x.auto_infracao || `#${x.id}`, date: String(x.data_hora_infracao).slice(0, 10), vehicle: `${x.veiculo_nome} · ${x.codigo_interno}`, vehicleId: x.veiculo_id, driver: x.motorista_nome || 'Não identificado', driverId: x.motorista_id, description: x.descricao, value: Number(x.valor), points: Number(x.pontos || 0), dueAt: x.vencimento_em ? String(x.vencimento_em).slice(0, 10) : null, status: x.status }));
}

export async function createFine(data) {
  if (isMockMode) { await delay(); return { id: Date.now() }; }
  return request('/multas', { method: 'POST', body: JSON.stringify(data) });
}

function documentStatus(value) {
  if (!value) return 'EM_DIA';
  const days = (new Date(`${String(value).slice(0, 10)}T23:59:59`) - new Date()) / 86400000;
  if (days < 0) return 'VENCIDO';
  if (days <= 30) return 'A_VENCER';
  return 'EM_DIA';
}
