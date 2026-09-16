import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeReservationPayload } from '../src/validators/reservation.validator.js';

const base = { veiculoId: 1, motoristaId: 2, dataHoraInicio: '2026-09-18T11:30:00.000Z', dataHoraFim: '2026-09-18T15:00:00.000Z', motivo: 'Visita técnica', destinos: [{ codigoIbge: 3543402 }] };

test('normaliza payload válido para UTC SQL', () => {
  const result = normalizeReservationPayload(base, { max_destinos: 10 });
  assert.equal(result.inicioSql, '2026-09-18 11:30:00');
  assert.equal(result.destinos[0].codigoIbge, 3543402);
});
test('rejeita fim anterior ao início', () => {
  assert.throws(() => normalizeReservationPayload({ ...base, dataHoraFim: '2026-09-18T10:00:00.000Z' }, {}), /retorno deve ser posterior/i);
});
test('rejeita timestamp sem timezone', () => {
  assert.throws(() => normalizeReservationPayload({ ...base, dataHoraInicio: '2026-09-18T08:30:00' }, {}), /timezone/i);
});
test('rejeita mais destinos que configuração', () => {
  const destinos = Array.from({ length: 3 }, (_, index) => ({ codigoIbge: 3500000 + index }));
  assert.throws(() => normalizeReservationPayload({ ...base, destinos }, { max_destinos: 2 }), /entre 1 e 2 destinos/i);
});
