# Frota Leve — Regras de Negócio v1.0

## Objetivo

Permitir reserva corporativa de veículos com fluxo simples, rastreável e sem exposição de detalhes técnicos ao usuário final.

## Perfis

- `COLABORADOR`: cria, consulta, edita e cancela suas próprias reservas.
- `GESTOR`: possui as permissões do colaborador e consulta reservas da equipe.
- `FROTA`: administra reservas, veículos, bloqueios e manutenções.
- `ADMIN`: possui todas as permissões e administra usuários, perfis, permissões e auditoria.

## Reserva

Cada reserva possui:

- solicitante;
- motorista;
- veículo;
- usuário que criou a reserva;
- data/hora de início;
- data/hora de fim;
- um ou mais destinos;
- motivo obrigatório;
- número do chamado opcional;
- observação opcional;
- status.

Uma reserva representa um único intervalo de tempo. Não são criados registros separados para cada hora.

## Fluxo principal

1. usuário informa período;
2. sistema lista veículos disponíveis;
3. usuário seleciona veículo;
4. confirma ou altera motorista;
5. informa destino(s);
6. informa motivo;
7. revisa;
8. confirma.

## Horários

- Granularidade inicial da interface: 30 minutos.
- `data_hora_fim` deve ser maior que `data_hora_inicio`.
- Reservas retroativas não são permitidas para colaborador.

## Conflito de agenda

Existe conflito quando:

```text
nova_inicio < reserva_existente_fim
AND
nova_fim > reserva_existente_inicio
```

Uma reserva que termina exatamente no horário em que outra começa não conflita.

A verificação de conflito deve acontecer novamente dentro de transação no momento da confirmação.

## Destinos

- Toda reserva precisa de pelo menos um destino.
- Máximo inicial na interface: 10 destinos.
- Cada destino é definido por Estado + Cidade.
- Estados e cidades vêm de base oficial de municípios brasileiros.
- O usuário pode adicionar destinos por botão `+`.
- A ordem dos destinos é preservada.
- O motivo é único para toda a viagem.

## Solicitante e motorista

Solicitante e motorista são conceitos diferentes.

Por padrão, o motorista é o próprio solicitante, mas pode ser outro colaborador cadastrado.

Frota/Admin podem criar reserva para outra pessoa.

## Status da reserva

Persistidos no banco:

- `CONFIRMADA`
- `CANCELADA`

Derivados em tempo de execução:

- `EM_ANDAMENTO`: início <= agora < fim
- `CONCLUIDA`: agora >= fim

## Cancelamento

- Colaborador pode cancelar a própria reserva antes do início.
- Frota/Admin podem cancelar qualquer reserva, inclusive após o início.
- Cancelamento não apaga o registro.
- Devem ser registrados usuário, data/hora e motivo quando aplicável.

## Alteração

Antes do início, o usuário pode alterar dados da própria reserva conforme permissão.

Se houver mudança de período ou veículo, a disponibilidade deve ser validada novamente com proteção de concorrência.

## Veículos

Status operacional persistido:

- `DISPONIVEL`
- `MANUTENCAO`
- `BLOQUEADO`

`RESERVADO` não é status persistente do veículo. A indisponibilidade por reserva é calculada por período.

Veículos inativos usam `ativo = false`.

## Bloqueios

A Frota pode indisponibilizar um veículo por intervalo.

Tipos iniciais:

- `MANUAL`
- `MANUTENCAO`
- `OUTRO`

Bloqueios participam do mesmo cálculo de disponibilidade das reservas.

## Manutenção

Manutenções podem ser:

- `AGENDADA`
- `EM_ANDAMENTO`
- `CONCLUIDA`
- `CANCELADA`

Uma manutenção pode gerar um bloqueio de veículo.

## Auditoria

Ações críticas devem registrar:

- usuário;
- ação;
- entidade;
- identificador da entidade;
- dados anteriores;
- dados novos;
- IP;
- user-agent;
- data/hora.

## Exclusão lógica

Registros operacionais importantes não devem ser apagados fisicamente em operações normais.

- usuário: `ativo = false`
- veículo: `ativo = false`
- reserva: `status = CANCELADA`
- bloqueio: `ativo = false`

## Fora do MVP inicial

- aprovação de reservas;
- reservas recorrentes;
- notificações por Teams/WhatsApp/push;
- múltiplos motivos por destino.
