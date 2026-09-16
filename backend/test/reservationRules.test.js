import test from 'node:test';
import assert from 'node:assert/strict';
import { periodsOverlap, deriveReservationStatus, canRegularUserChange, validateDestinationCount } from '../src/domain/reservationRules.js';

test('intervalos adjacentes não conflitam', () => { assert.equal(periodsOverlap(8, 12, 12, 14), false); });
test('sobreposição parcial conflita', () => { assert.equal(periodsOverlap(8, 12, 11.5, 13), true); });
test('intervalo contido conflita', () => { assert.equal(periodsOverlap(8, 18, 10, 11), true); });
test('status temporal é derivado sem mutar banco', () => {
  assert.equal(deriveReservationStatus('CONFIRMADA', 200, 300, 100), 'CONFIRMADA');
  assert.equal(deriveReservationStatus('CONFIRMADA', 200, 300, 250), 'EM_ANDAMENTO');
  assert.equal(deriveReservationStatus('CONFIRMADA', 200, 300, 350), 'CONCLUIDA');
  assert.equal(deriveReservationStatus('CANCELADA', 200, 300, 250), 'CANCELADA');
});
test('usuário comum só altera antes do início', () => {
  assert.equal(canRegularUserChange(200, 100), true);
  assert.equal(canRegularUserChange(200, 200), false);
});
test('destinos respeitam limite do tenant', () => {
  assert.equal(validateDestinationCount([], 10), false);
  assert.equal(validateDestinationCount([{ id: 1 }], 10), true);
  assert.equal(validateDestinationCount(Array.from({ length: 11 }, (_, id) => ({ id })), 10), false);
});
