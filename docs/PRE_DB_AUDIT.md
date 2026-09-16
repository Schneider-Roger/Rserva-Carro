# Frota Leve — Auditoria pré-banco

Data: 2026-09-16

## Objetivo

Revisar o código, o contrato das migrations e os pontos críticos antes da primeira criação do MySQL. Como ainda não há banco de produção, este é o melhor momento para corrigir inconsistências sem migração de dados.

## Achados corrigidos nesta etapa

### 1. Consulta de documentos

A query que unificava documentos de veículo e de usuário montava aliases de colunas de forma incompatível entre as duas tabelas. A consulta foi normalizada para não referenciar `categoria` em `documentos_veiculo` nem `observacao` em `documentos_usuario`.

### 2. Rastreabilidade de requisições

Toda requisição passa a receber `requestId`, enviado também no header `X-Request-Id`. Erros retornam o mesmo identificador para permitir correlação entre interface, API e logs.

### 3. Timezone de conexão

O cliente MySQL passa a usar UTC (`timezone: 'Z'`). A interface continua trabalhando com o timezone configurado pela empresa, inicialmente `America/Sao_Paulo`.

## Itens validados

- tabelas operacionais principais carregam `empresa_id`;
- FKs compostas reduzem referências acidentais entre tenants;
- disponibilidade usa intervalo semiaberto: `novo_inicio < existente_fim AND novo_fim > existente_inicio`;
- abastecimentos, multas, documentos e planos de manutenção são filtrados por tenant;
- exclusões operacionais são tratadas preferencialmente como cancelamento/inativação;
- migrations seguem a ordem `schema -> 002 -> 003 -> 004` antes do seed.

## Pontos que ainda precisam de teste com MySQL real

A revisão estática não substitui a execução do DDL. Quando o MySQL estiver disponível, devem ser executados em banco vazio:

1. `database/schema.sql`;
2. `database/migrations/002_operations.sql`;
3. `database/migrations/003_management.sql`;
4. `database/migrations/004_api_safety.sql`;
5. `database/seed-development.sql`.

Depois disso, executar consultas de integridade, todos os endpoints e os testes de concorrência.

## Decisões antes de produção comercial

Não bloqueiam o desenvolvimento local, mas devem ser concluídas antes de uma versão vendável:

- substituir identidade de desenvolvimento por autenticação real/SSO;
- usar identificadores públicos não sequenciais nas APIs externas;
- importar municípios da fonte oficial do IBGE;
- definir política definitiva de armazenamento UTC para todos os campos temporais legados;
- implementar backup, restauração testada e observabilidade;
- executar teste de isolamento entre dois tenants reais no mesmo banco;
- executar teste concorrente de duas reservas simultâneas para o mesmo veículo.

## Critério de liberação do banco

O banco será considerado pronto para desenvolvimento integrado somente quando o DDL completo executar do zero sem erro e o seed terminar integralmente. Não corrigir manualmente tabelas no Workbench; qualquer correção deve voltar para `schema.sql` ou para uma migration versionada.
