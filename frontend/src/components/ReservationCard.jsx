import { CalendarDays, Clock3, MapPin } from 'lucide-react';
import { StatusBadge } from './StatusBadge.jsx';

const formatDate = (value) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`));

export function ReservationCard({ reservation, compact = false }) {
  return (
    <article className={`reservation-card ${compact ? 'compact' : ''}`}>
      <div className="reservation-card-head">
        <div><strong>{reservation.vehicle.brand} {reservation.vehicle.model}</strong><span>{reservation.vehicle.internalCode} · {reservation.vehicle.plate}</span></div>
        <StatusBadge status={reservation.status} />
      </div>
      <div className="reservation-details">
        <span><CalendarDays size={17} /> {formatDate(reservation.date)}</span>
        <span><Clock3 size={17} /> {reservation.start} — {reservation.end}</span>
        <span><MapPin size={17} /> {reservation.destinations.join(' · ')}</span>
      </div>
      {!compact && <div className="reservation-card-actions"><button className="button secondary small">Ver detalhes</button>{reservation.status === 'CONFIRMADA' && <button className="button ghost-danger small">Cancelar</button>}</div>}
    </article>
  );
}
