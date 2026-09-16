# Frota Leve — Contrato da API atual

Base: `/api`. Todas as rotas, exceto liveness/readiness, exigem identidade e tenant resolvidos no backend. O frontend nunca escolhe `empresa_id`.

## Saúde

```text
GET /api/health        # liveness, não depende do banco
GET /api/health/ready  # readiness, consulta o MySQL
```

## Contexto e localidades

```text
GET /api/contexto
GET /api/localidades/estados
GET /api/localidades/estados/:estadoId/cidades?search=
GET /api/motoristas?q=
```

`/contexto` devolve usuário, branding e configurações efetivas do tenant.

## Reservas

```text
POST /api/reservas
GET  /api/reservas/minhas
GET  /api/reservas/equipe
GET  /api/reservas
GET  /api/reservas/:id
PUT  /api/reservas/:id
POST /api/reservas/:id/cancelamento
```

Timestamps de criação/consulta devem ser ISO 8601 com timezone, por exemplo `2026-09-18T08:30:00-03:00` ou `2026-09-18T11:30:00Z`. O backend converte para UTC. A granularidade é lida de `empresa_configuracoes.intervalo_reserva_minutos` e pode ser 15, 30 ou 60 minutos.

Criação:

```json
{
  "veiculoId": 12,
  "motoristaId": 1,
  "centroCustoId": 1,
  "dataHoraInicio": "2026-09-18T08:30:00-03:00",
  "dataHoraFim": "2026-09-19T12:00:00-03:00",
  "motivo": "Visita técnica",
  "numeroChamado": null,
  "observacao": null,
  "destinos": [{ "codigoIbge": 3543402 }]
}
```

A criação/edição bloqueia a linha do veículo e revalida reservas e bloqueios antes do commit. `RESERVA_VISUALIZAR_EQUIPE` é escopada por departamento; quando o gestor não possui departamento, usa a unidade.

## Gestão

```text
GET /api/gestao/resumo                  # GESTAO_DASHBOARD
GET/POST/PUT/DELETE /api/centros-custo
GET/POST/DELETE     /api/abastecimentos
GET/POST/PUT/DELETE /api/manutencoes/planos
GET/POST/DELETE     /api/documentos
GET/POST/PATCH      /api/multas
```

Abastecimentos cancelados não entram no dashboard e não alteram `veiculos.km_atual`.

## Retirada e devolução

```text
GET  /api/operacoes/reservas-disponiveis
POST /api/operacoes/retirada
POST /api/operacoes/:id/devolucao
```

Retirada registra motorista, hodômetro, combustível e custódia da chave. Devolução fecha a custódia e atualiza o hodômetro do veículo dentro da transação.

## Erros

Erros seguem `{ success:false, error:{ code, message, requestId } }`. O mesmo `requestId` é retornado em `X-Request-Id`.
