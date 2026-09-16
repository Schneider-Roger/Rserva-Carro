# Frota Leve — Modelo de Dados SaaS

## Banco

MySQL 8+, database `frota_leve`.

## Isolamento multiempresa

O sistema é multi-tenant. Toda tabela operacional contém `empresa_id` e os relacionamentos críticos usam foreign keys compostas `(empresa_id, id)`. Isso reduz o risco de uma reserva, operação ou custo apontar para um recurso pertencente a outro cliente.

O backend nunca usa `empresa_id` enviado pelo frontend como fonte de autorização; o tenant é resolvido a partir da identidade autenticada.

## Control plane

- `empresas`
- `empresa_configuracoes`
- `empresa_branding`
- `planos`
- `assinaturas`
- `usuarios_plataforma`
- `auditoria_plataforma`

## Núcleo operacional

- `unidades`
- `departamentos`
- `usuarios`
- `perfis`
- `permissoes`
- `usuario_perfis`
- `perfil_permissoes`
- `categorias_veiculo`
- `veiculos`
- `reservas`
- `reserva_destinos`
- `manutencoes`
- `bloqueios_veiculo`
- `auditoria`

## V1.5 — retirada/devolução

Criada em `database/migrations/002_operations.sql`:

- `chaves_veiculo`
- `operacoes_veiculo`
- `checklist_modelos`
- `checklist_itens`
- `operacao_checklist_respostas`
- `avarias`
- `custodia_chaves`

## V2 — gestão financeira/preventiva

Criada em `database/migrations/003_management.sql`:

- `centros_custo`
- `planos_manutencao`
- `abastecimentos`
- `custos_veiculo`
- `documentos_veiculo`
- `documentos_usuario`
- `multas`

A migration também adiciona centro de custo à reserva, KM atual ao veículo e custo/plano preventivo à manutenção.

## Índices críticos

```text
reservas(empresa_id, veiculo_id, data_hora_inicio, data_hora_fim)
bloqueios_veiculo(empresa_id, veiculo_id, data_hora_inicio, data_hora_fim, ativo)
operacoes_veiculo(empresa_id, veiculo_id, status)
abastecimentos(empresa_id, veiculo_id, data_hora)
planos_manutencao(empresa_id, ativo, proxima_data, proximo_km)
documentos_veiculo(empresa_id, status, validade_em)
multas(empresa_id, status, vencimento_em)
```

## Ordem de instalação local

1. `database/schema.sql`
2. `database/migrations/002_operations.sql`
3. `database/migrations/003_management.sql`
4. `database/seed-development.sql`
5. carga oficial de municípios do IBGE, quando o importador estiver pronto.
