# Frota Leve

Novo sistema corporativo de reserva de veículos, reconstruído do zero com foco em usabilidade, segurança, rastreabilidade e prevenção de conflitos de agenda.

## Objetivo

O fluxo principal é simples:

1. informar período da viagem;
2. consultar veículos disponíveis;
3. selecionar o veículo;
4. definir motorista;
5. informar um ou mais destinos por Estado/Cidade;
6. informar o motivo;
7. revisar e confirmar.

A interface não expõe slots horários, IDs internos ou detalhes técnicos do banco.

## Stack planejada

- Frontend: React + Vite
- Backend: Node.js + Express
- Banco: MySQL 8+
- API: REST
- Autorização: RBAC (`COLABORADOR`, `GESTOR`, `FROTA`, `ADMIN`)
- Timezone de negócio: `America/Sao_Paulo`

## Estrutura inicial

```text
Rserva-Carro/
├── database/
│   └── schema.sql
├── docs/
│   ├── API.md
│   ├── BACKEND_ARCHITECTURE.md
│   ├── BUSINESS_RULES.md
│   └── DATABASE.md
└── README.md
```

## Status

- Fase 1 — Regras de negócio: aprovada
- Fase 2 — Modelo do banco: aprovada
- Fase 3 — Contrato da API e arquitetura do backend: documentada
- Próxima fase — wireframes, Design System e estrutura inicial do frontend/backend

## Regra crítica de concorrência

A disponibilidade exibida na tela nunca é considerada garantia de reserva. No momento da confirmação, o backend abre transação, bloqueia a linha do veículo com `SELECT ... FOR UPDATE`, verifica novamente reservas e bloqueios sobrepostos, grava a reserva e só então faz `COMMIT`.

Isso evita dupla reserva quando dois usuários tentam confirmar o mesmo veículo simultaneamente.
