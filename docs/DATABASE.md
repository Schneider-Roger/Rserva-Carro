# Frota Leve — Modelo de Dados v1

## Banco

MySQL 8+

Database sugerido:

```text
frota_leve
```

## Tabelas

1. `estados`
2. `cidades`
3. `unidades`
4. `departamentos`
5. `usuarios`
6. `perfis`
7. `permissoes`
8. `usuario_perfis`
9. `perfil_permissoes`
10. `categorias_veiculo`
11. `veiculos`
12. `reservas`
13. `reserva_destinos`
14. `manutencoes`
15. `bloqueios_veiculo`
16. `auditoria`

## Relacionamentos principais

```text
ESTADOS
  └── CIDADES
       ├── UNIDADES
       │    ├── DEPARTAMENTOS
       │    └── VEICULOS
       └── RESERVA_DESTINOS

USUARIOS
  ├── USUARIO_PERFIS ── PERFIS ── PERFIL_PERMISSOES ── PERMISSOES
  ├── RESERVAS (solicitante)
  ├── RESERVAS (motorista)
  ├── RESERVAS (criado_por)
  └── AUDITORIA

VEICULOS
  ├── RESERVAS
  ├── BLOQUEIOS_VEICULO
  └── MANUTENCOES

RESERVAS
  └── RESERVA_DESTINOS
```

## Decisões importantes

### Reserva por intervalo

Uma viagem corresponde a um único registro em `reservas`, com:

```text
data_hora_inicio
data_hora_fim
```

Não existem slots horários persistidos por hora.

### Múltiplos destinos

Cada destino é um registro em `reserva_destinos`.

A coluna `ordem` mantém a sequência da viagem.

### Status derivado

O banco persiste `CONFIRMADA` e `CANCELADA`. `EM_ANDAMENTO` e `CONCLUIDA` são derivados em tempo de execução.

### Exclusão lógica

Usuários e veículos são inativados, não apagados. Reservas são canceladas, não removidas.

### Concorrência

O MySQL não fornece uma exclusion constraint de intervalo equivalente ao PostgreSQL. A prevenção de dupla reserva é responsabilidade da transação do backend com lock no veículo e nova checagem de sobreposição antes do `INSERT`/`UPDATE`.

## Índices críticos

```text
reservas(veiculo_id, data_hora_inicio, data_hora_fim)
bloqueios_veiculo(veiculo_id, data_hora_inicio, data_hora_fim, ativo)
reservas(solicitante_id, data_hora_inicio)
reservas(motorista_id, data_hora_inicio)
cidades(estado_id, nome)
```

## Municípios

A tabela `cidades` deve ser carregada a partir de base oficial com código IBGE. Estados são seed inicial; municípios serão importados por script/migration separado para evitar manter milhares de linhas manualmente no schema principal.
