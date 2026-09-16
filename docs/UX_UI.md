# Frota Leve — UX/UI v1

## Princípio central

O produto deve seguir a tarefa do colaborador, não a estrutura do banco. A jornada principal é:

`Período → Veículo → Viagem → Confirmação`.

## Arquitetura de informação

### Colaborador
- Início
- Nova reserva
- Minhas reservas
- Agenda da frota
- Política de uso

### Frota/Admin
- Dashboard administrativo
- Reservas
- Veículos
- Bloqueios
- Manutenções
- Usuários
- Auditoria

## Design System inicial

### Cores
- Verde institucional/ação principal: `#0B6B3A`
- Verde escuro: `#075C34`
- Fundo: `#F5F7F5`
- Texto principal: `#17211B`
- Texto secundário: `#68736D`
- Borda: `#DFE5E1`
- Erro: `#B42318`

A cor nunca deve ser a única forma de comunicar um estado.

### Espaçamento
Escala preferencial: `4, 8, 12, 16, 24, 32, 40, 48, 64`.

### Controles
- altura confortável para inputs e botões;
- botão primário reservado à ação principal da tela;
- ações destrutivas não usam o mesmo destaque da ação primária;
- modais somente para confirmações curtas e ações destrutivas.

## Tela inicial

Prioriza uma única CTA: `Nova reserva`. Exibe próxima reserva e resumo da frota sem banner decorativo dominante.

## Nova reserva

Quatro etapas curtas:
1. Período;
2. Veículo;
3. Viagem;
4. Confirmar.

O usuário informa o período antes de ver os veículos. Isso reduz escolhas inválidas.

## Destinos

Cada destino tem Estado e Cidade. O primeiro destino sempre existe; destinos adicionais são incluídos pelo botão `+ Adicionar destino` e podem ser removidos. Máximo inicial: 10.

## Minhas reservas

Usa cards e filtros em vez de tabela larga. Cada viagem ocupa um único card, independentemente da duração.

## Agenda

Visão temporal por veículo. Uma reserva ocupa um bloco proporcional ao seu intervalo, evitando 24 linhas por veículo ou uma linha por hora.

## Responsividade

- sidebar fixa em desktop;
- menu recolhível no mobile;
- grids convertem para uma coluna;
- ações principais permanecem acessíveis sem scroll horizontal.

## Acessibilidade

- foco visível em inputs e selects;
- labels explícitos;
- ícones acompanhados por texto quando comunicam estado;
- mensagens de erro descritivas;
- controles com alvos adequados para toque;
- contraste de texto e ações prioritárias preservado.

## Modo de demonstração

O frontend pode executar com `VITE_USE_MOCKS=true`, permitindo homologação de UX antes de conectar MySQL e autenticação.
