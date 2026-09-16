# Frota Leve — Interface administrativa de gestão

## Rotas implementadas no frontend

```text
/gestao
/gestao/abastecimentos
/gestao/centros-custo
/gestao/manutencoes
/gestao/documentos
/gestao/multas
```

As telas funcionam em modo demonstrativo com `VITE_USE_MOCKS=true` e ainda não persistem alterações no backend.

## Padrão de UX

Cada módulo usa a mesma estrutura:

- cabeçalho com contexto e ação principal;
- indicadores resumidos;
- filtros/pesquisa;
- tabela ou cards operacionais;
- formulário em painel lateral (`SlideOver`) para criação;
- estados semânticos consistentes;
- responsividade para desktop e mobile.

## Abastecimentos

Mostra gasto, litros, preço médio, histórico, KM, motorista e centro de custo. O formulário já representa os campos da migration `003_management.sql`.

## Centros de custo

Exibe viagens e custo mensal por área, prepara cadastro e permite futura configuração de obrigatoriedade na reserva.

## Manutenção preventiva

Exibe progresso por KM, próxima data e classificação `EM_DIA`, `PROXIMO` ou `ATRASADA`. A API futura deve recalcular os próximos limites em transação quando a manutenção for concluída.

## Documentos

Separação entre documentos de veículos e motoristas. Vencimentos serão calculados no backend a partir da data de validade e janela de alerta.

## Multas

Exibe veículo, motorista, valor, pontos, vencimento e workflow de tratamento. Na integração real, o backend poderá procurar automaticamente a reserva/operação correspondente ao horário da infração.

## Próxima etapa

Conectar os formulários e listagens aos endpoints REST tenant-aware e aplicar RBAC no backend antes de liberar operações mutáveis em produção.
