# Ambiente local — Frota Leve

## Banco

Para criar um banco novo no MySQL 8:

1. execute `database/schema.sql`;
2. execute `database/migrations/002_operations.sql`;
3. execute `database/migrations/003_management.sql`;
4. execute `database/migrations/004_api_safety.sql`;
5. execute `database/seed-development.sql` somente em desenvolvimento;
6. carregue os municípios do IBGE quando o importador estiver disponível.

## Backend

Copie `backend/.env.example` para `.env`.

Em desenvolvimento local:

```env
DEV_EMPRESA_ID=1
DEV_USER_ID=1
```

O fallback injeta uma identidade ADMIN somente quando `NODE_ENV=development`. Em produção, sem autenticação real, a API falha fechada com `401`.

## Frontend

Com `VITE_USE_MOCKS=true`, o sistema funciona sem MySQL.

Depois do banco e backend estarem ativos, use:

```env
VITE_USE_MOCKS=false
VITE_API_URL=http://localhost:3001/api
```
