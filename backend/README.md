# Frota Leve — Backend

API REST do novo Frota Leve.

## Requisitos

- Node.js 24+
- MySQL 8+
- banco `frota_leve` criado a partir de `../database/schema.sql`

## Primeira execução

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

No Windows PowerShell, caso prefira:

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

A API inicia por padrão em `http://localhost:3001`.

## Endpoints implementados nesta etapa

### Health

```http
GET /api/health
```

### Veículos disponíveis

```http
GET /api/veiculos/disponiveis?inicio=2026-09-18T08:30:00&fim=2026-09-18T12:00:00
```

O período usa horário local de negócio (`America/Sao_Paulo`) e intervalos de 30 minutos.

A consulta retorna somente veículos:

- ativos;
- com `status_operacional = DISPONIVEL`;
- sem reserva `CONFIRMADA` sobreposta;
- sem bloqueio ativo sobreposto.

A regra de sobreposição utilizada é:

```text
novo_inicio < existente_fim
AND
novo_fim > existente_inicio
```

A consulta de disponibilidade não substitui a revalidação transacional na criação da reserva. Essa proteção será implementada no endpoint de confirmação da reserva.
