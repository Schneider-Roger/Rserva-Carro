const labels = {
  CONFIRMADA: 'Confirmada',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
  EM_ANDAMENTO: 'Em andamento',
};

export function StatusBadge({ status }) {
  const normalized = status || 'CONFIRMADA';
  return <span className={`status-badge status-${normalized.toLowerCase()}`}>{labels[normalized] || normalized}</span>;
}
