# Frota Leve — Modelo de Dados SaaS

MySQL 8+, database `frota_leve`. O produto usa schema compartilhado multi-tenant: tabelas operacionais carregam `empresa_id`, e FKs compostas impedem referências cruzadas entre clientes.

## Instalação limpa

Execute exatamente nesta ordem, sem correções manuais no Workbench:

```text
1. database/schema.sql
2. database/migrations/002_operations.sql
3. database/migrations/003_management.sql
4. database/migrations/004_api_safety.sql
5. database/migrations/005_integrity_hardening.sql
6. database/seed-development.sql   # somente desenvolvimento
7. carga oficial completa de municípios do IBGE # produção
```

A migration `005` fecha as inconsistências encontradas na auditoria: departamento precisa pertencer à unidade do usuário, destinos operacionais deixam de usar cascade, manutenção passa a exigir previsão de fim, bloqueio de manutenção fica amarrado ao mesmo veículo e entram permissões de operação/centro de custo.

## Tempo

Datetimes operacionais são tratados em UTC pela API e pela conexão MySQL. `empresa_configuracoes.timezone` define a interpretação e exibição de horários para cada tenant.

## Hodômetro

`veiculos.km_atual` é atualizado na devolução da operação do veículo. Abastecimento não altera automaticamente o hodômetro, evitando que um lançamento digitado incorretamente contamine alertas de manutenção preventiva.

## Auditoria

Reservas, retirada/devolução e mutações dos módulos de gestão gravam `auditoria` com tenant, ator, ação, entidade, request ID, IP e user-agent.
