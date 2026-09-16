# Ambiente local — Frota Leve

## Banco

Para um banco novo:

1. execute `database/schema.sql`;
2. execute `database/migrations/002_operations.sql`;
3. execute `database/seed-development.sql`;
4. carregue os municípios do IBGE quando o importador estiver disponível.

## Backend

Copie `backend/.env.example` para `.env`.

Enquanto a autenticação ainda não estiver implementada, `DEV_EMPRESA_ID=1` resolve o tenant apenas em `NODE_ENV=development`.

Essa variável nunca deve ser usada como mecanismo de tenant em produção.

## Frontend

Com `VITE_USE_MOCKS=true`, é possível validar reserva, agenda e a nova tela de retirada/devolução sem MySQL.
