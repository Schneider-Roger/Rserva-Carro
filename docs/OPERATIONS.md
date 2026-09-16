# Frota Leve — Operação de Retirada e Devolução

## Objetivo

Transformar o sistema de uma agenda de veículos em uma plataforma operacional de frota compartilhada.

## Retirada

Fluxo:

`Reserva → Identificar veículo/QR → Confirmar motorista → KM inicial → combustível → checklist → fotos/observações → retirar`

A retirada cria um registro operacional vinculado à reserva e não altera o histórico original da reserva.

## Devolução

Fluxo:

`Reserva em andamento → KM final → combustível → checklist → nova avaria? → fotos/observações → devolver`

Ao devolver:

- KM final deve ser >= KM inicial;
- distância é derivada;
- ocorrência/avaria pode ser criada;
- custódia da chave é encerrada;
- o registro operacional é fechado.

## Checklist

Itens iniciais sugeridos:

- pneus;
- iluminação;
- documentos;
- limpeza;
- nível de combustível;
- avarias aparentes.

No futuro o checklist deve ser configurável por empresa e categoria de veículo.

## Chaves

Estados operacionais:

- DISPONIVEL;
- RETIRADA;
- INDISPONIVEL.

A custódia registra quem retirou, quando retirou e quando devolveu.

## Avarias

Uma avaria possui:

- veículo;
- reserva/operação vinculada quando aplicável;
- descrição;
- severidade;
- momento do registro;
- usuário responsável pelo registro;
- fotos em etapa posterior de storage.

## Combustível e quilometragem

A primeira versão registra nível percentual aproximado e hodômetro. Abastecimentos detalhados entram na V2.
