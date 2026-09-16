export const managementCostCenters = [
  { id: 1, code: 'TI', name: 'Tecnologia da Informação', responsible: 'Roger Schneider', active: true, trips: 31, monthCost: 4870.40 },
  { id: 2, code: 'ADM', name: 'Administrativo', responsible: 'Mariana Souza', active: true, trips: 24, monthCost: 3540.10 },
  { id: 3, code: 'COM', name: 'Comercial', responsible: 'Carlos Silva', active: true, trips: 19, monthCost: 4210.55 },
  { id: 4, code: 'MAN', name: 'Manutenção', responsible: 'Leandro Guimarães', active: false, trips: 4, monthCost: 715.20 },
];

export const managementFuelings = [
  { id: 101, date: '2026-09-12', vehicle: 'Fiat Strada', code: 'DIS401', plate: 'ABC1D23', driver: 'Roger Schneider', costCenter: 'TI', fuel: 'Etanol', liters: 42.3, total: 169.20, km: 45190, station: 'Posto Central' },
  { id: 102, date: '2026-09-09', vehicle: 'Fiat Mobi', code: 'MOB203', plate: 'TJO8J81', driver: 'Carlos Silva', costCenter: 'ADM', fuel: 'Gasolina', liters: 35.8, total: 215.16, km: 28620, station: 'Posto Avenida' },
  { id: 103, date: '2026-09-06', vehicle: 'Fiat Toro', code: 'TOR078', plate: 'KLM7N89', driver: 'Roger Schneider', costCenter: 'TI', fuel: 'Diesel', liters: 55, total: 341, km: 51310, station: 'Posto Central' },
  { id: 104, date: '2026-09-02', vehicle: 'Fiat Argo', code: 'ARG112', plate: 'FGH4J56', driver: 'Mariana Souza', costCenter: 'COM', fuel: 'Gasolina', liters: 38.4, total: 230.02, km: 18840, station: 'Posto Norte' },
];

export const managementMaintenancePlans = [
  { id: 201, vehicle: 'Fiat Strada', code: 'DIS401', name: 'Revisão periódica', currentKm: 45382, nextKm: 50000, nextDate: '2026-11-15', status: 'EM_DIA' },
  { id: 202, vehicle: 'Fiat Toro', code: 'TOR078', name: 'Troca de óleo', currentKm: 51640, nextKm: 60000, nextDate: '2026-09-26', status: 'PROXIMO' },
  { id: 203, vehicle: 'Fiat Mobi', code: 'MOB203', name: 'Revisão e filtros', currentKm: 28810, nextKm: 30000, nextDate: '2026-10-05', status: 'PROXIMO' },
  { id: 204, vehicle: 'Fiat Argo', code: 'ARG112', name: 'Alinhamento e balanceamento', currentKm: 19120, nextKm: 20000, nextDate: '2026-09-10', status: 'ATRASADA' },
];

export const managementVehicleDocuments = [
  { id: 301, owner: 'Fiat Strada · DIS401', type: 'Seguro', number: 'SEG-2026-001', expiresAt: '2026-10-08', status: 'A_VENCER' },
  { id: 302, owner: 'Fiat Mobi · MOB203', type: 'Licenciamento', number: 'LIC-2026-203', expiresAt: '2026-11-30', status: 'EM_DIA' },
  { id: 303, owner: 'Fiat Toro · TOR078', type: 'Seguro', number: 'SEG-2026-078', expiresAt: '2027-01-12', status: 'EM_DIA' },
];

export const managementDriverDocuments = [
  { id: 311, owner: 'Roger Schneider', type: 'CNH AB', number: '00000000000', expiresAt: '2026-10-31', status: 'A_VENCER' },
  { id: 312, owner: 'Carlos Silva', type: 'CNH B', number: '11111111111', expiresAt: '2027-04-19', status: 'EM_DIA' },
  { id: 313, owner: 'Mariana Souza', type: 'CNH B', number: '22222222222', expiresAt: '2027-08-07', status: 'EM_DIA' },
];

export const managementFines = [
  { id: 401, notice: 'AI-2026-001', date: '2026-09-04', vehicle: 'Fiat Mobi · MOB203', driver: 'Carlos Silva', description: 'Infração de trânsito registrada', value: 195.23, points: 5, dueAt: '2026-10-04', status: 'PENDENTE' },
  { id: 402, notice: 'AI-2026-002', date: '2026-08-18', vehicle: 'Fiat Strada · DIS401', driver: 'Roger Schneider', description: 'Infração de trânsito registrada', value: 130.16, points: 4, dueAt: '2026-09-28', status: 'EM_TRATAMENTO' },
  { id: 403, notice: 'AI-2026-003', date: '2026-07-11', vehicle: 'Fiat Toro · TOR078', driver: 'Mariana Souza', description: 'Infração de trânsito registrada', value: 293.47, points: 7, dueAt: '2026-08-20', status: 'PAGA' },
];
