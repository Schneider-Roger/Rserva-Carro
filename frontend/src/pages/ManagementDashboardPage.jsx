import { AlertTriangle, CarFront, FileWarning, Fuel, Gauge, ReceiptText, ShieldAlert, Wrench } from 'lucide-react';
import { mockVehicles } from '../data/mockData.js';

const money = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function ManagementDashboardPage() {
  const summary = {
    fleet: { total: mockVehicles.length, available: 3, maintenance: 1, blocked: 0 },
    month: { trips: 86, km: 12840, fuel: 6840.55, maintenance: 2100, other: 987.4 },
    alerts: { maintenance: 2, documents: 2, fines: 1 },
  };
  const total = summary.month.fuel + summary.month.maintenance + summary.month.other;
  const costKm = total / summary.month.km;

  return (
    <div className="page-stack">
      <div className="page-heading">
        <span className="eyebrow">Gestão executiva</span>
        <h1>Visão da frota</h1>
        <p>Indicadores de uso, custos e vencimentos para tomada de decisão sem depender de hardware instalado.</p>
      </div>

      <div className="admin-metrics">
        <article className="admin-metric"><span><CarFront size={21}/></span><div><strong>{summary.fleet.total}</strong><small>Veículos</small></div></article>
        <article className="admin-metric"><span><Gauge size={21}/></span><div><strong>{summary.month.km.toLocaleString('pt-BR')}</strong><small>KM no mês</small></div></article>
        <article className="admin-metric"><span><ReceiptText size={21}/></span><div><strong>{money(total)}</strong><small>Custo no mês</small></div></article>
        <article className="admin-metric"><span><Fuel size={21}/></span><div><strong>{money(costKm)}</strong><small>Custo por KM</small></div></article>
      </div>

      <div className="dashboard-grid">
        <section className="section-card">
          <div className="section-heading"><div><span className="eyebrow">Custos</span><h2>Composição mensal</h2></div></div>
          <div className="movement-list">
            <div className="movement-row"><div className="movement-time reservation"><Fuel size={16}/></div><div><strong>Combustível</strong><span>Abastecimentos registrados</span></div><small>{money(summary.month.fuel)}</small></div>
            <div className="movement-row"><div className="movement-time blocked"><Wrench size={16}/></div><div><strong>Manutenção</strong><span>Serviços e peças</span></div><small>{money(summary.month.maintenance)}</small></div>
            <div className="movement-row"><div className="movement-time"><ReceiptText size={16}/></div><div><strong>Outros custos</strong><span>Pedágio, lavagem, seguro e demais despesas</span></div><small>{money(summary.month.other)}</small></div>
          </div>
        </section>

        <section className="section-card">
          <div className="section-heading"><div><span className="eyebrow">Alertas</span><h2>Atenção necessária</h2></div></div>
          <div className="movement-list">
            <div className="movement-row"><div className="movement-time blocked"><Wrench size={16}/></div><div><strong>Manutenções próximas</strong><span>Por data ou quilometragem</span></div><small>{summary.alerts.maintenance}</small></div>
            <div className="movement-row"><div className="movement-time blocked"><FileWarning size={16}/></div><div><strong>Documentos a vencer</strong><span>Veículos e motoristas</span></div><small>{summary.alerts.documents}</small></div>
            <div className="movement-row"><div className="movement-time blocked"><ShieldAlert size={16}/></div><div><strong>Multas pendentes</strong><span>Responsabilidade e vencimento</span></div><small>{summary.alerts.fines}</small></div>
          </div>
        </section>
      </div>

      <section className="section-card">
        <div className="section-heading"><div><span className="eyebrow">Módulos V2</span><h2>Gestão financeira e preventiva</h2></div></div>
        <div className="quick-grid">
          <div className="quick-card"><span className="quick-icon"><Fuel/></span><div><strong>Abastecimentos</strong><p>Litros, valor, KM, motorista e centro de custo.</p></div></div>
          <div className="quick-card"><span className="quick-icon"><Wrench/></span><div><strong>Manutenção preventiva</strong><p>Alertas por KM e por data.</p></div></div>
          <div className="quick-card"><span className="quick-icon"><AlertTriangle/></span><div><strong>Documentos e multas</strong><p>Vencimentos, responsabilidade e histórico.</p></div></div>
        </div>
      </section>
    </div>
  );
}
