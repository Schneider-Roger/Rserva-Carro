export const currentUser = {
  id: 25,
  name: 'Roger Schneider',
  firstName: 'Roger',
  email: 'roger@copercana.com.br',
  employeeCode: '13967',
  phone: '(16) 99999-9999',
  unit: 'Matriz',
  department: 'Tecnologia da Informação',
  roles: ['ADMIN'],
};

export const mockVehicles = [
  { id: 12, internalCode: 'DIS401', plate: 'ABC1D23', brand: 'Fiat', model: 'Strada', category: 'Utilitário', capacity: 2, unit: 'Matriz', year: 2025 },
  { id: 14, internalCode: 'MOB203', plate: 'TJO8J81', brand: 'Fiat', model: 'Mobi', category: 'Passeio', capacity: 5, unit: 'Matriz', year: 2024 },
  { id: 18, internalCode: 'ARG112', plate: 'FGH4J56', brand: 'Fiat', model: 'Argo', category: 'Passeio', capacity: 5, unit: 'Biocoop', year: 2025 },
  { id: 21, internalCode: 'TOR078', plate: 'KLM7N89', brand: 'Fiat', model: 'Toro', category: 'Pickup', capacity: 5, unit: 'Matriz', year: 2024 },
];

export const mockUsers = [
  currentUser,
  { id: 31, name: 'Carlos Silva', employeeCode: '14221', unit: 'Matriz' },
  { id: 42, name: 'Mariana Souza', employeeCode: '15190', unit: 'Matriz' },
  { id: 57, name: 'Leandro Guimarães', employeeCode: '13967A', unit: 'Biocoop' },
];

export const states = [
  { id: 35, uf: 'SP', name: 'São Paulo' },
  { id: 31, uf: 'MG', name: 'Minas Gerais' },
  { id: 41, uf: 'PR', name: 'Paraná' },
];

export const cities = {
  35: [
    { id: 3551702, name: 'Sertãozinho' },
    { id: 3543402, name: 'Ribeirão Preto' },
    { id: 3516200, name: 'Franca' },
    { id: 3503208, name: 'Araraquara' },
  ],
  31: [
    { id: 3170107, name: 'Uberaba' },
    { id: 3170206, name: 'Uberlândia' },
  ],
  41: [
    { id: 4106902, name: 'Curitiba' },
    { id: 4113700, name: 'Londrina' },
  ],
};

export const mockReservations = [
  {
    id: 143,
    vehicle: mockVehicles[0],
    date: '2026-09-18',
    start: '08:30',
    end: '12:00',
    destinations: ['Ribeirão Preto - SP'],
    driver: 'Roger Schneider',
    reason: 'Visita técnica à unidade',
    status: 'CONFIRMADA',
  },
  {
    id: 144,
    vehicle: mockVehicles[1],
    date: '2026-09-21',
    start: '14:00',
    end: '17:00',
    destinations: ['Franca - SP', 'Ribeirão Preto - SP'],
    driver: 'Roger Schneider',
    reason: 'Reunião operacional',
    status: 'CONFIRMADA',
  },
  {
    id: 132,
    vehicle: mockVehicles[2],
    date: '2026-09-10',
    start: '09:00',
    end: '16:30',
    destinations: ['Sertãozinho - SP'],
    driver: 'Roger Schneider',
    reason: 'Acompanhamento de projeto',
    status: 'CONCLUIDA',
  },
];

export const agendaRows = [
  { vehicle: mockVehicles[0], blocks: [{ start: '08:30', end: '12:00', label: 'Roger · Ribeirão Preto', type: 'reservation' }, { start: '15:00', end: '17:00', label: 'Carlos · Sertãozinho', type: 'reservation' }] },
  { vehicle: mockVehicles[1], blocks: [{ start: '10:00', end: '13:00', label: 'Mariana · Franca', type: 'reservation' }] },
  { vehicle: mockVehicles[2], blocks: [{ start: '08:00', end: '11:00', label: 'Manutenção preventiva', type: 'blocked' }] },
  { vehicle: mockVehicles[3], blocks: [{ start: '13:30', end: '18:00', label: 'Leandro · Uberaba', type: 'reservation' }] },
];
