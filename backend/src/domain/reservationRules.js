export function periodsOverlap(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

export function deriveReservationStatus(status, startMs, endMs, nowMs = Date.now()) {
  if (status === 'CANCELADA') return 'CANCELADA';
  if (nowMs < startMs) return 'CONFIRMADA';
  if (nowMs < endMs) return 'EM_ANDAMENTO';
  return 'CONCLUIDA';
}

export function canRegularUserChange(startMs, nowMs = Date.now()) {
  return nowMs < startMs;
}

export function validateDestinationCount(destinations, maxDestinations = 10) {
  return Array.isArray(destinations) && destinations.length >= 1 && destinations.length <= maxDestinations;
}
