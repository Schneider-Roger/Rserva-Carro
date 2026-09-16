# Frota Leve — Frontend

Interface React + Vite do novo Frota Leve.

## Execução

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Acesse `http://localhost:5173`.

## Modo de demonstração sem MySQL

O arquivo `.env.example` inicia com:

```env
VITE_USE_MOCKS=true
```

Nesse modo as telas funcionam com dados locais e a jornada completa de reserva pode ser validada sem banco ou backend.

Quando o backend e o MySQL estiverem disponíveis, altere para:

```env
VITE_USE_MOCKS=false
VITE_API_URL=http://localhost:3001/api
```

## Telas implementadas

- Início
- Nova reserva em quatro etapas
- seleção de veículos disponíveis
- motorista
- múltiplos destinos com botão `+`
- revisão e confirmação
- Minhas reservas
- Agenda da frota
- Política de uso
- Dashboard administrativo inicial

## Diretrizes UX

- tarefa antes da estrutura do banco;
- período antes da escolha do veículo;
- sem IDs técnicos na interface;
- uma viagem aparece como um único intervalo;
- formulários com no máximo duas colunas na maior parte do fluxo;
- navegação persistente em desktop e menu responsivo no mobile;
- estados semânticos com texto e cor;
- ações administrativas separadas do fluxo do colaborador.
