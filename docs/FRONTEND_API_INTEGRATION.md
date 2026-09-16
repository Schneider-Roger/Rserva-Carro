# Integração Frontend ↔ API de Gestão

A camada `frontend/src/services/managementApi.js` centraliza o acesso aos endpoints de gestão.

## Modo demo

Com `VITE_USE_MOCKS=true`, as telas continuam usando dados locais.

## Modo integrado

```env
VITE_USE_MOCKS=false
VITE_API_URL=http://localhost:3001/api
```

As telas passam a consultar o backend real.

## Módulos integrados

- Centros de custo: listagem e criação.
- Abastecimentos: listagem e criação, com veículo, motorista e centro de custo vindos da API.
- Manutenção preventiva: listagem e criação.
- Documentos: listagem e criação para veículos/motoristas.
- Multas: listagem e criação.
- Diretório auxiliar: veículos e usuários tenant-aware.

## Estados de interface

Todas as telas integradas possuem:

- loading;
- erro com mensagem da API;
- botão de retry;
- bloqueio do botão durante gravação;
- reload após sucesso.

## Segurança

O frontend não envia `empresa_id`. A resolução do tenant continua sendo responsabilidade exclusiva do backend autenticado.
