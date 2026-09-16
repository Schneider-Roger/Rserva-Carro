# Frota Leve — Auditoria pré-banco

Data: 2026-09-16

## Situação após correção

Os achados funcionais e estruturais encontrados na revisão estática foram tratados na branch `feature/saas-operacao-frota`: rotas/componentes administrativos restaurados, reservas conectadas a usuários/centros/localidades reais, período multi-dia, timezone/configuração por tenant, escopo de gestor, RBAC do dashboard, perfis de seed, cidades mínimas de desenvolvimento, retirada/devolução real, auditoria de gestão e separação liveness/readiness.

## O que ainda depende de ambiente externo

Isto não é correção de código pendente; precisa ser validado quando o ambiente existir:

- executar todo o DDL no MySQL 8 em banco vazio;
- executar testes concorrentes com duas conexões reais;
- carregar a base oficial completa de municípios do IBGE para produção;
- conectar o provedor real de autenticação/SSO e carregar roles/permissões a partir do banco;
- executar e observar o GitHub Actions no próximo push/PR com runners disponíveis.

## Critério de liberação

Não ajustar tabelas manualmente no Workbench. Qualquer falha da instalação limpa deve voltar ao arquivo versionado correspondente. O banco só é considerado liberado quando `schema + 002 + 003 + 004 + 005 + seed` executarem integralmente do zero.
