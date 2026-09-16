# API de Gestão — Frota Leve

Todas as rotas abaixo são tenant-aware. `empresa_id` nunca é recebido do frontend como fonte de autorização.

## Identidade e RBAC

Em produção, `req.user` deverá vir do mecanismo real de autenticação/SSO. Sem identidade, a API responde `401`.

Somente em `NODE_ENV=development`, o middleware local cria uma identidade administrativa usando:

```env
DEV_EMPRESA_ID=1
DEV_USER_ID=1
```

Esse fallback não funciona em produção.

## Centros de custo

```text
GET    /api/centros-custo
POST   /api/centros-custo
PUT    /api/centros-custo/:id
DELETE /api/centros-custo/:id      # inativa, não remove
```

## Abastecimentos

```text
GET    /api/abastecimentos
POST   /api/abastecimentos
DELETE /api/abastecimentos/:id      # cancelamento lógico; exige motivo
```

A criação atualiza `veiculos.km_atual` somente se a quilometragem informada for maior.

## Planos de manutenção preventiva

```text
GET    /api/manutencoes/planos
POST   /api/manutencoes/planos
PUT    /api/manutencoes/planos/:id
DELETE /api/manutencoes/planos/:id # inativa
```

## Documentos

```text
GET    /api/documentos?tipo=VEICULO
GET    /api/documentos?tipo=USUARIO
POST   /api/documentos
DELETE /api/documentos/:id
```

No `POST` e `DELETE`, `entidadeTipo` deve ser `VEICULO` ou `USUARIO`.

## Multas

```text
GET   /api/multas
POST  /api/multas
PATCH /api/multas/:id/status
```

Status: `PENDENTE`, `EM_TRATAMENTO`, `RECURSO`, `PAGA`, `CANCELADA`.

## Tenant isolation

Todos os repositories filtram por `empresa_id`. Antes de criar relacionamentos, services validam que veículo, usuário, centro de custo, reserva e operação pertencem ao tenant atual.

## Segurança

Operações de leitura/escrita passam por `requirePermission()`. O modo de desenvolvimento recebe `permissions: ['*']`; em produção isso deve ser preenchido pelo módulo de autenticação/RBAC.
