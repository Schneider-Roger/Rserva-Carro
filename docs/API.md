# Frota Leve — Contrato da API v1

Base URL inicial:

```text
/api
```

Formato padrão:

```json
{
  "success": true,
  "data": {},
  "message": null
}
```

Erro padrão:

```json
{
  "success": false,
  "error": {
    "code": "RESERVA_CONFLITO",
    "message": "O veículo não está mais disponível neste período."
  }
}
```

## Códigos HTTP

- `200` consulta/alteração bem-sucedida
- `201` criação bem-sucedida
- `204` operação sem corpo de resposta
- `400` requisição inválida
- `401` não autenticado
- `403` sem permissão
- `404` recurso inexistente
- `409` conflito de negócio/concorrência
- `422` validação semântica
- `500` erro interno

---

# Autenticação

A implementação de autenticação será definida separadamente. A API já deve ser preparada para receber um usuário autenticado em `req.user` com, no mínimo:

```json
{
  "id": 25,
  "codigoFuncionario": "13967",
  "nome": "Usuário",
  "perfis": ["COLABORADOR"],
  "permissoes": ["RESERVA_CRIAR"]
}
```

Autorização é sempre validada no backend.

---

# Usuário atual

## GET `/api/me`

Retorna o usuário autenticado.

Resposta `200`:

```json
{
  "success": true,
  "data": {
    "id": 25,
    "codigoFuncionario": "13967",
    "nome": "Usuário",
    "email": "usuario@empresa.com.br",
    "telefone": "(16) 99999-9999",
    "unidade": {
      "id": 1,
      "nome": "Matriz"
    },
    "departamento": {
      "id": 8,
      "nome": "TI"
    },
    "perfis": ["COLABORADOR"],
    "permissoes": [
      "RESERVA_CRIAR",
      "RESERVA_VISUALIZAR_PROPRIA"
    ]
  }
}
```

---

# Localidades

## GET `/api/localidades/estados`

Resposta:

```json
{
  "success": true,
  "data": [
    { "id": 26, "uf": "SP", "nome": "São Paulo" }
  ]
}
```

## GET `/api/localidades/estados/:estadoId/cidades?search=`

Lista cidades do estado selecionado.

Parâmetros:

- `search`: opcional, pesquisa pelo nome

Resposta:

```json
{
  "success": true,
  "data": [
    {
      "id": 3543402,
      "codigoIbge": 3543402,
      "nome": "Ribeirão Preto"
    }
  ]
}
```

---

# Veículos

## GET `/api/veiculos`

Permissão: `VEICULO_VISUALIZAR`

Filtros opcionais:

```text
?ativo=true
&status=DISPONIVEL
&categoriaId=1
&unidadeId=1
&search=strada
```

## GET `/api/veiculos/:id`

Permissão: `VEICULO_VISUALIZAR`

## GET `/api/veiculos/disponiveis`

Permissão: `AGENDA_VISUALIZAR`

Query obrigatória:

```text
inicio=2026-09-18T08:30:00
fim=2026-09-18T12:00:00
```

Filtros opcionais:

```text
categoriaId
unidadeId
capacidadeMinima
```

A resposta contém apenas veículos:

- ativos;
- operacionalmente disponíveis;
- sem reserva confirmada sobreposta;
- sem bloqueio ativo sobreposto.

Resposta:

```json
{
  "success": true,
  "data": [
    {
      "id": 12,
      "codigoInterno": "DIS401",
      "placa": "ABC1D23",
      "marca": "Fiat",
      "modelo": "Strada",
      "categoria": {
        "id": 2,
        "nome": "Utilitário"
      },
      "capacidade": 2,
      "unidade": {
        "id": 1,
        "nome": "Matriz"
      }
    }
  ]
}
```

## POST `/api/veiculos`

Permissão: `VEICULO_CRIAR`

Body:

```json
{
  "codigoInterno": "DIS401",
  "placa": "ABC1D23",
  "marca": "Fiat",
  "modelo": "Strada",
  "categoriaId": 2,
  "unidadeId": 1,
  "capacidade": 2,
  "cor": "Branca",
  "ano": 2025
}
```

## PUT `/api/veiculos/:id`

Permissão: `VEICULO_EDITAR`

## POST `/api/veiculos/:id/inativar`

Permissão: `VEICULO_INATIVAR`

Não apaga fisicamente o veículo.

---

# Reservas

## POST `/api/reservas`

Permissão: `RESERVA_CRIAR`

Body:

```json
{
  "veiculoId": 12,
  "motoristaId": 25,
  "dataHoraInicio": "2026-09-18T08:30:00",
  "dataHoraFim": "2026-09-18T12:00:00",
  "motivo": "Visita técnica à unidade",
  "numeroChamado": "INC-12345",
  "observacao": "Retirar material antes da saída",
  "destinos": [
    { "cidadeId": 3543402 },
    { "cidadeId": 3516200 }
  ]
}
```

Regras:

- solicitante é o usuário autenticado;
- `criado_por_id` é o usuário autenticado;
- motorista deve ser usuário ativo;
- mínimo de 1 e máximo de 10 destinos;
- início não pode estar no passado para colaborador;
- fim deve ser maior que início;
- veículo precisa estar ativo e operacionalmente disponível;
- não pode existir reserva ou bloqueio sobreposto;
- disponibilidade deve ser revalidada dentro da transação.

Resposta `201`:

```json
{
  "success": true,
  "data": {
    "id": 143,
    "status": "CONFIRMADA"
  },
  "message": "Reserva confirmada com sucesso."
}
```

Conflito `409`:

```json
{
  "success": false,
  "error": {
    "code": "RESERVA_CONFLITO",
    "message": "O veículo não está mais disponível neste período."
  }
}
```

## POST `/api/reservas/para-outro`

Permissão: `RESERVA_CRIAR_PARA_OUTRO`

Body igual ao anterior, acrescido de:

```json
{
  "solicitanteId": 31
}
```

## GET `/api/reservas/minhas`

Permissão: `RESERVA_VISUALIZAR_PROPRIA`

Filtros:

```text
?status=proximas
&page=1
&limit=20
&search=
```

`status` de consulta pode aceitar:

- `proximas`
- `andamento`
- `concluidas`
- `canceladas`
- `todas`

## GET `/api/reservas/:id`

Retorna detalhes da reserva respeitando escopo de permissão.

## PUT `/api/reservas/:id`

Permissões possíveis:

- `RESERVA_EDITAR_PROPRIA`
- `RESERVA_EDITAR_TODAS`

Ao alterar veículo ou período, a mesma proteção transacional contra conflito deve ser usada.

## POST `/api/reservas/:id/cancelar`

Permissões possíveis:

- `RESERVA_CANCELAR_PROPRIA`
- `RESERVA_CANCELAR_TODAS`

Body:

```json
{
  "motivo": "Viagem não será mais necessária"
}
```

Não executa `DELETE`.

## GET `/api/reservas`

Permissões:

- `RESERVA_VISUALIZAR_EQUIPE`
- `RESERVA_VISUALIZAR_TODAS`

Filtros:

```text
inicio
fim
veiculoId
motoristaId
solicitanteId
unidadeId
status
search
page
limit
```

---

# Agenda

## GET `/api/agenda`

Permissão: `AGENDA_GERAL_VISUALIZAR`

Query:

```text
inicio=2026-09-16T00:00:00
fim=2026-09-22T23:59:59
```

Retorna reservas e bloqueios agrupados por veículo para visão diária/semanal/mensal.

---

# Bloqueios

## POST `/api/veiculos/:id/bloqueios`

Permissão: `VEICULO_BLOQUEAR`

Body:

```json
{
  "dataHoraInicio": "2026-09-20T08:00:00",
  "dataHoraFim": "2026-09-20T18:00:00",
  "tipo": "MANUAL",
  "motivo": "Veículo indisponível para vistoria"
}
```

Antes da criação, o backend deve verificar reservas confirmadas conflitantes e devolver `409` quando aplicável.

## POST `/api/bloqueios/:id/cancelar`

Permissão: `VEICULO_BLOQUEAR`

Não apaga fisicamente.

---

# Manutenções

## GET `/api/manutencoes`

Permissão: `MANUTENCAO_VISUALIZAR`

## POST `/api/manutencoes`

Permissão: `MANUTENCAO_GERENCIAR`

## PUT `/api/manutencoes/:id`

Permissão: `MANUTENCAO_GERENCIAR`

## POST `/api/manutencoes/:id/concluir`

Permissão: `MANUTENCAO_GERENCIAR`

Manutenção que indisponibiliza veículo deverá criar ou manter bloqueio vinculado.

---

# Usuários

## GET `/api/usuarios?search=`

Permissão: `USUARIO_VISUALIZAR`

Usado também para seleção de motorista.

## GET `/api/usuarios/:id`

## POST `/api/usuarios`

Permissão: `USUARIO_GERENCIAR`

## PUT `/api/usuarios/:id`

Permissão: `USUARIO_GERENCIAR`

## POST `/api/usuarios/:id/inativar`

Permissão: `USUARIO_GERENCIAR`

---

# Auditoria

## GET `/api/auditoria`

Permissão: `AUDITORIA_VISUALIZAR`

Filtros:

```text
usuarioId
acao
entidade
entidadeId
inicio
fim
page
limit
```

---

# Health check

## GET `/api/health`

Resposta:

```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

Este endpoint não deve expor credenciais, versão do banco ou informações sensíveis.
