# Frota Leve — Arquitetura do Backend

## Objetivo

Manter regras de negócio fora dos controllers, centralizar autorização, garantir consistência transacional e facilitar testes.

## Estrutura proposta

```text
backend/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── database.js
│   │   └── env.js
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── middlewares/
│   ├── validators/
│   ├── utils/
│   └── errors/
├── tests/
└── package.json
```

## Responsabilidades

### Routes

Ligam método HTTP, caminho, autenticação, autorização e controller.

Não contêm regra de negócio.

### Controllers

Responsáveis por:

- ler `req.params`, `req.query`, `req.body` e `req.user`;
- chamar service;
- retornar HTTP apropriado.

Não executam SQL diretamente.

### Services

Onde vivem as regras de negócio.

Exemplos:

- `ReservaService.criar()`
- `ReservaService.alterar()`
- `ReservaService.cancelar()`
- `DisponibilidadeService.buscar()`
- `BloqueioService.criar()`

### Repositories

Única camada autorizada a executar SQL da entidade correspondente.

Exemplos:

- `ReservaRepository`
- `VeiculoRepository`
- `UsuarioRepository`
- `BloqueioRepository`
- `CidadeRepository`

### Validators

Validam formato e semântica de entrada antes da execução da regra principal.

### Middlewares

Principais:

- autenticação;
- autorização por permissão;
- tratamento centralizado de erros;
- correlação/request-id;
- rate limiting onde aplicável;
- logging de requisição sem dados sensíveis.

---

# Regra crítica — criação de reserva

A criação não pode confiar na consulta anterior de disponibilidade feita pela tela.

Fluxo obrigatório:

```text
BEGIN
  ↓
SELECT veículo FOR UPDATE
  ↓
validar veículo ativo/status
  ↓
consultar reserva confirmada conflitante
  ↓
consultar bloqueio ativo conflitante
  ↓
validar solicitante/motorista/destinos
  ↓
INSERT reserva
  ↓
INSERT reserva_destinos
  ↓
INSERT auditoria
  ↓
COMMIT
```

Em qualquer falha:

```text
ROLLBACK
```

## Consulta de conflito de reserva

```sql
SELECT id
FROM reservas
WHERE veiculo_id = ?
  AND status = 'CONFIRMADA'
  AND ? < data_hora_fim
  AND ? > data_hora_inicio
LIMIT 1;
```

Parâmetros:

1. `veiculo_id`
2. `nova_data_hora_inicio`
3. `nova_data_hora_fim`

## Consulta de conflito de bloqueio

```sql
SELECT id
FROM bloqueios_veiculo
WHERE veiculo_id = ?
  AND ativo = TRUE
  AND ? < data_hora_fim
  AND ? > data_hora_inicio
LIMIT 1;
```

## Lock de concorrência

Antes das consultas de conflito:

```sql
SELECT id, ativo, status_operacional
FROM veiculos
WHERE id = ?
FOR UPDATE;
```

Isso serializa tentativas concorrentes de confirmação para o mesmo veículo dentro da transação.

---

# Alteração de reserva

Ao alterar período ou veículo:

1. abrir transação;
2. bloquear veículo atual e, quando necessário, novo veículo;
3. revalidar conflito ignorando a própria reserva;
4. atualizar reserva;
5. atualizar destinos quando necessário;
6. registrar auditoria;
7. commit.

Consulta de conflito durante edição:

```sql
SELECT id
FROM reservas
WHERE veiculo_id = ?
  AND status = 'CONFIRMADA'
  AND id <> ?
  AND ? < data_hora_fim
  AND ? > data_hora_inicio
LIMIT 1;
```

---

# Consulta de veículos disponíveis

A listagem deve excluir:

- veículo inativo;
- status operacional diferente de `DISPONIVEL`;
- veículo com reserva confirmada sobreposta;
- veículo com bloqueio ativo sobreposto.

A consulta de disponibilidade é informativa. A confirmação sempre revalida tudo em transação.

---

# Status derivado da reserva

O banco persiste:

- `CONFIRMADA`
- `CANCELADA`

A API deriva:

```text
CANCELADA
  se status persistido = CANCELADA

CONFIRMADA
  se agora < início

EM_ANDAMENTO
  se início <= agora < fim

CONCLUIDA
  se agora >= fim
```

Não criar cron apenas para trocar esses estados.

---

# Timezone

Timezone de negócio:

```text
America/Sao_Paulo
```

Regra de implementação:

- entrada da API deve possuir formato ISO consistente;
- backend valida e normaliza datas;
- comparações devem usar a mesma referência temporal;
- não misturar horários locais implícitos com UTC sem conversão explícita.

A decisão final de persistência UTC vs horário local deverá ser aplicada de forma única em todo o backend antes da implementação.

---

# Autorização

Nunca confiar em elementos escondidos no frontend.

Exemplo:

```text
POST /api/veiculos
```

exige no backend:

```text
VEICULO_CRIAR
```

A autorização deve ocorrer antes do controller executar a operação.

---

# Escopo de dados

`RESERVA_VISUALIZAR_PROPRIA`:

```text
solicitante_id = usuário autenticado
```

`RESERVA_VISUALIZAR_EQUIPE`:

Escopo será derivado da relação organizacional aprovada para o gestor.

`RESERVA_VISUALIZAR_TODAS`:

Sem restrição organizacional, respeitando filtros da rota.

---

# Auditoria

A auditoria não substitui logs técnicos.

Auditoria registra evento de negócio, por exemplo:

```text
RESERVA_CRIADA
RESERVA_ALTERADA
RESERVA_CANCELADA
VEICULO_CADASTRADO
VEICULO_ALTERADO
VEICULO_BLOQUEADO
MANUTENCAO_CRIADA
USUARIO_ALTERADO
PERMISSAO_ALTERADA
```

Mudanças relevantes devem registrar snapshot anterior e posterior em JSON.

Nunca registrar:

- senha;
- token de autenticação;
- segredo;
- cookie de sessão;
- credencial de banco.

---

# Tratamento de erros

Criar erros de domínio, por exemplo:

```text
ValidationError
AuthenticationError
AuthorizationError
NotFoundError
ConflictError
BusinessRuleError
```

Mapeamento típico:

```text
ValidationError     -> 400/422
AuthenticationError -> 401
AuthorizationError  -> 403
NotFoundError       -> 404
ConflictError       -> 409
BusinessRuleError   -> 422
```

Resposta externa não deve expor stack trace, SQL ou caminhos internos.

---

# Segurança mínima desde o início

- `.env` fora do Git;
- segredo nunca hardcoded;
- queries parametrizadas;
- validação de body/query/params;
- CORS restrito ao frontend autorizado;
- Helmet;
- limite de tamanho de payload;
- rate limiting em autenticação e rotas sensíveis;
- logs sem credenciais;
- princípio de menor privilégio para usuário MySQL;
- tratamento centralizado de erros;
- dependências atualizadas;
- testes de autorização por perfil/permissão.

---

# Testes obrigatórios da regra de agenda

Pelo menos os seguintes cenários devem existir como testes automatizados:

```text
existente: 08:00-12:00
```

- 07:00-08:00 -> permitido
- 07:00-09:00 -> conflito
- 08:00-12:00 -> conflito
- 09:00-10:00 -> conflito
- 10:00-14:00 -> conflito
- 12:00-14:00 -> permitido

Também testar:

- reserva cancelada não bloqueia horário;
- bloqueio ativo bloqueia horário;
- bloqueio cancelado não bloqueia horário;
- veículo inativo nunca aparece disponível;
- veículo em manutenção nunca aparece disponível;
- duas confirmações concorrentes para o mesmo veículo/período resultam em apenas uma reserva confirmada.
