# Ambiente local — Frota Leve

## Banco

Para criar um banco novo no MySQL 8:

1. execute `database/schema.sql`;
2. execute `database/migrations/002_operations.sql`;
3. execute `database/migrations/003_management.sql`;
4. execute `database/seed-development.sql` somente em desenvolvimento;
5. carregue os municípios do IBGE quando o importador estiver disponível.

O seed local cria a empresa `empresa-demo` com `id = 1`, usuários, veículos, centros de custo e dados de gestão para demonstração.

## Backend

Copie `backend/.env.example` para `.env`.

Enquanto autenticação/SSO ainda não estiver implementada, `DEV_EMPRESA_ID=1` resolve o tenant apenas quando `NODE_ENV=development`.

Essa variável nunca deve ser usada como mecanismo de tenant em produção.

## Frontend

Com `VITE_USE_MOCKS=true`, reserva, agenda, retirada/devolução e as telas executivas funcionam sem MySQL.
