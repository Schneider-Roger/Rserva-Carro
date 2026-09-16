const statusClass = {
  ATIVO: 'good',
  EM_DIA: 'good',
  PAGA: 'good',
  CONCLUIDA: 'good',
  PROXIMO: 'warning',
  A_VENCER: 'warning',
  PENDENTE: 'warning',
  EM_TRATAMENTO: 'warning',
  RECURSO: 'info',
  VENCIDO: 'danger',
  ATRASADA: 'danger',
  CANCELADA: 'neutral',
  INATIVO: 'neutral',
};

const labels = {
  EM_DIA: 'Em dia',
  PROXIMO: 'Próxima',
  A_VENCER: 'A vencer',
  EM_TRATAMENTO: 'Em tratamento',
};

export function ModuleStatusPill({ status }) {
  return <span className={`module-status ${statusClass[status] || 'neutral'}`}>{labels[status] || status?.replaceAll('_', ' ')}</span>;
}
