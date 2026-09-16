import { useMemo, useState } from 'react';
import { CalendarDays, Search } from 'lucide-react';
import { mockReservations } from '../data/mockData.js';
import { ReservationCard } from '../components/ReservationCard.jsx';

const filters = [{ id: 'proximas', label: 'Próximas' }, { id: 'concluidas', label: 'Concluídas' }, { id: 'canceladas', label: 'Canceladas' }, { id: 'todas', label: 'Todas' }];

export function MyReservationsPage() {
  const [filter, setFilter] = useState('proximas');
  const [search, setSearch] = useState('');
  const reservations = useMemo(() => mockReservations.filter((reservation) => {
    const statusOk = filter === 'todas' || (filter === 'proximas' && reservation.status === 'CONFIRMADA') || (filter === 'concluidas' && reservation.status === 'CONCLUIDA') || (filter === 'canceladas' && reservation.status === 'CANCELADA');
    const haystack = `${reservation.vehicle.model} ${reservation.vehicle.plate} ${reservation.destinations.join(' ')} ${reservation.reason}`.toLowerCase();
    return statusOk && haystack.includes(search.toLowerCase());
  }), [filter, search]);

  return <div className="page-stack"><div className="page-heading"><span className="eyebrow">Sua agenda</span><h1>Minhas reservas</h1><p>Consulte viagens futuras, concluídas e canceladas sem navegar por uma tabela extensa.</p></div><div className="toolbar"><div className="segmented">{filters.map((item) => <button key={item.id} className={filter === item.id ? 'active' : ''} onClick={() => setFilter(item.id)}>{item.label}</button>)}</div><label className="search-field"><Search size={18} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar veículo, placa ou destino" /></label></div><div className="reservation-list">{reservations.map((reservation) => <ReservationCard key={reservation.id} reservation={reservation} />)}{reservations.length === 0 && <div className="empty-state section-card"><CalendarDays size={30} /><strong>Nenhuma reserva encontrada</strong><p>Altere o filtro ou a busca para consultar outros registros.</p></div>}</div></div>;
}
