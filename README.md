# Frota Leve

Novo sistema corporativo de reserva de veículos, reconstruído do zero com foco em usabilidade, segurança, rastreabilidade e prevenção de conflitos de agenda.

## Fluxo principal

1. informar período da viagem;
2. consultar veículos disponíveis;
3. selecionar o veículo;
4. definir motorista;
5. informar um ou mais destinos por Estado/Cidade;
6. informar o motivo;
7. revisar e confirmar.

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Banco: MySQL 8+
- API: REST
- Autorização planejada: RBAC (`COLABORADOR`, `GESTOR`, `FROTA`, `ADMIN`)
- Timezone de negócio: `America/Sao_Paulo`

## Estrutura

```text
Rserva-Carro/
├── backend/
├── frontend/
├── database/
│   └── schema.sql
├── docs/
│   ├── API.md
│   ├── BACKEND_ARCHITECTURE.md
│   ├── BUSINESS_RULES.md
│   ├── DATABASE.md
│   └── UX_UI.md
└── README.md
```

## Frontend sem banco

A interface possui modo de demonstração para validar a experiência antes da configuração do MySQL:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Com `VITE_USE_MOCKS=true`, a jornada completa roda com dados locais.

## Status

- Fase 1 — Regras de negócio: aprovada
- Fase 2 — Modelo do banco: aprovada
- Fase 3 — Contrato da API e arquitetura do backend: documentada
- Fase 4 — Bootstrap do backend e disponibilidade: implementada
- Fase 5 — Frontend UX/UI navegável: implementada em modo de demonstração
- Pendente — autenticação, endpoints restantes, carga oficial de municípios, testes e integração completa

## Regra crítica de concorrência

A disponibilidade exibida na tela nunca é garantia de reserva. No momento da confirmação, o backend deve abrir transação, bloquear a linha do veículo com `SELECT ... FOR UPDATE`, verificar novamente reservas e bloqueios sobrepostos, gravar a reserva e só então executar `COMMIT`.
