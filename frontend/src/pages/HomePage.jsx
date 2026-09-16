import { ArrowRight, CalendarDays, CarFront, Plus, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { currentUser, mockReservations, mockVehicles } from '../data/mockData.js';
import { ReservationCard } from '../components/ReservationCard.jsx';

export function HomePage() {
  const nextReservation = mockReservations.find((item) => item.status === 'CONFIRMADA');

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div>
          <span className="eyebrow">Frota corporativa</span>
          <h1>Olá, {currentUser.firstName}.</h1>
          <p>Reserve um veículo informando primeiro quando você precisa viajar. O sistema mostra somente as opções disponíveis.</p>
        </div>
        <Link className="button primary hero-action" to="/reservas/nova"><Plus size={19} /> Nova reserva</Link>
      </section>

      <section className="quick-grid" aria-label="Ações rápidas">
        <Link className="quick-card" to="/reservas/nova"><span className="quick-icon"><CarFront /></span><div><strong>Reservar veículo</strong><p>Escolha período, veículo e destino.</p></div><ArrowRight size={19} /></Link>
        <Link className="quick-card" to="/reservas"><span className="quick-icon"><CalendarDays /></span><div><strong>Minhas reservas</strong><p>Consulte próximas viagens e histórico.</p></div><ArrowRight size={19} /></Link>
        <Link className="quick-card" to="/politica"><span className="quick-icon"><ShieldCheck /></span><div><strong>Política de uso</strong><p>Veja orientações para utilização da frota.</p></div><ArrowRight size={19} /></Link>
      </section>

      <div className="dashboard-grid">
        <section className="section-card">
          <div className="section-heading"><div><span className="eyebrow">Sua agenda</span><h2>Próxima reserva</h2></div><Link to="/reservas">Ver todas</Link></div>
          {nextReservation ? <ReservationCard reservation={nextReservation} compact /> : <div className="empty-state"><CalendarDays size={28} /><strong>Nenhuma reserva próxima</strong><p>Quando você reservar um veículo, a próxima viagem aparecerá aqui.</p></div>}
        </section>

        <section className="section-card fleet-summary">
          <div className="section-heading"><div><span className="eyebrow">Resumo</span><h2>Frota agora</h2></div><Link to="/agenda">Abrir agenda</Link></div>
          <div className="metric-row"><div className="metric"><strong>{mockVehicles.length}</strong><span>veículos cadastrados</span></div><div className="metric"><strong>{mockVehicles.length - 1}</strong><span>disponíveis</span></div><div className="metric"><strong>1</strong><span>indisponível</span></div></div>
          <p className="helper-text">Disponibilidade real será calculada pelo backend considerando reservas, bloqueios e manutenção.</p>
        </section>
      </div>
    </div>
  );
}
