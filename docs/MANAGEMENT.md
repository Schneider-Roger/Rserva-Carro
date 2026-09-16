# Frota Leve — Gestão Financeira e Preventiva

## Objetivo

A V2 transforma o produto de uma agenda de veículos em uma camada de gestão da frota compartilhada, sem exigir rastreador ou câmera para gerar valor.

## Centros de custo

Reservas, abastecimentos, manutenções, multas e outros custos podem ser vinculados a um centro de custo. Isso permite relatórios por departamento/projeto sem duplicar dados.

## Abastecimentos

Campos principais:

- veículo;
- motorista;
- operação relacionada, quando existir;
- centro de custo;
- data/hora;
- quilometragem;
- combustível;
- litros;
- valor;
- posto;
- comprovante.

O cadastro deve atualizar `veiculos.km_atual` somente quando a quilometragem informada for maior que a atual.

## Custos

`custos_veiculo` registra despesas que não pertencem aos módulos especializados, por exemplo pedágio, estacionamento, lavagem, seguro, IPVA, licenciamento e locação.

Combustível, manutenção e multas permanecem em tabelas próprias para preservar semântica e relatórios.

## Manutenção preventiva

`planos_manutencao` permite regras por KM, por data ou por ambos. Exemplos:

- troca de óleo a cada 10.000 km;
- revisão a cada 180 dias;
- alerta 1.000 km ou 30 dias antes do vencimento.

Quando uma manutenção é executada, o plano deverá recalcular próximo KM/data em service transacional.

## Documentos

Há documentos de veículo e de usuário/motorista. A arquitetura cobre licenciamento, seguro, CNH e outros documentos configurados pela operação.

Alertas são calculados por `validade_em` e antecedência configurada no documento.

## Multas

A multa pode ser relacionada ao veículo, motorista, reserva e operação que estavam vigentes no momento da infração. Isso reduz trabalho manual para identificar responsabilidade.

## Dashboard executivo

O primeiro endpoint é:

```http
GET /api/gestao/resumo
```

Resposta esperada:

```json
{
  "frota": {
    "total": 38,
    "disponiveis": 27,
    "manutencao": 4,
    "bloqueados": 2
  },
  "mes": {
    "viagens": 124,
    "km": 42830,
    "custoCombustivel": 18450.20,
    "custoManutencao": 5200.00,
    "outrosCustos": 1840.50,
    "custoTotal": 25490.70,
    "custoKm": 0.60
  },
  "alertas": {
    "manutencoes": 3,
    "documentos": 2,
    "multas": 4
  }
}
```

Todas as consultas são obrigatoriamente filtradas por `empresa_id` obtido do tenant autenticado.

## Próximas APIs

```text
GET/POST /api/centros-custo
GET/POST /api/abastecimentos
GET/POST /api/custos
GET/POST /api/manutencoes/planos
GET/POST /api/documentos/veiculos
GET/POST /api/documentos/usuarios
GET/POST /api/multas
```

CRUDs mutáveis só devem ser liberados em produção depois da autenticação e autorização RBAC estarem ativas.
