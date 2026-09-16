import { useMemo, useState } from 'react';
import { AlertTriangle, Search } from 'lucide-react';
import { managementFines } from '../data/managementMockData.js';
import { ManagementPageHeader } from '../components/management/ManagementPageHeader.jsx';
import { SlideOver } from '../components/management/SlideOver.jsx';
import { ModuleStatusPill } from '../components/management/ModuleStatusPill.jsx';

const money = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const date = (value) => new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}T12:00:00`));

export function FinesPage() {
  const [items, setItems] = useState(managementFines);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('TODAS');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ notice: '', vehicle: '', driver: '', description: '', value: '', points: '', dueAt: '' });
  const filtered = useMemo(() => items.filter((item) => (status === 'TODAS' || item.status === status) && `${item.notice} ${item.vehicle} ${item.driver} ${item.description}`.toLowerCase().includes(search.toLowerCase())), [items, search, status]);
  const pending = items.filter((item) => !['PAGA', 'CANCELADA'].includes(item.status));
  const pendingValue = pending.reduce((sum, item) => sum + item.value, 0);
  const pendingPoints = pending.reduce((sum, item) => sum + item.points, 0);

  function save(event) {
    event.preventDefault();
    setItems((current) => [{ id: Date.now(), notice: form.notice.trim(), date: new Date().toISOString().slice(0, 10), vehicle: form.vehicle.trim(), driver: form.driver.trim(), description: form.description.trim(), value: Number(form.value || 0), points: Number(form.points || 0), dueAt: form.dueAt, status: 'PENDENTE' }, ...current]);
    setOpen(false);
  }

  return <div className="page-stack management-page">
    <ManagementPageHeader eyebrow="Responsabilidade" title="Multas" description="Relacione infrações ao veículo, motorista e viagem para reduzir investigação manual e atrasos." actionLabel="Registrar multa" onAction={() => setOpen(true)} />
    <div className="management-kpis"><article><span>Pendentes</span><strong>{pending.length}</strong><small>inclui tratamento e recurso</small></article><article><span>Valor pendente</span><strong>{money(pendingValue)}</strong><small>antes de descontos/recursos</small></article><article><span>Pontos vinculados</span><strong>{pendingPoints}</strong><small>nos registros abertos</small></article></div>
    <section className="section-card management-table-card"><div className="management-toolbar wrap"><div className="search-field"><Search size={17}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar auto, veículo ou motorista..."/></div><select className="compact-select" value={status} onChange={(e) => setStatus(e.target.value)}><option value="TODAS">Todos os status</option><option value="PENDENTE">Pendentes</option><option value="EM_TRATAMENTO">Em tratamento</option><option value="RECURSO">Recurso</option><option value="PAGA">Pagas</option></select></div><div className="management-table-scroll"><table className="management-table"><thead><tr><th>Auto</th><th>Data</th><th>Veículo / motorista</th><th>Descrição</th><th>Vencimento</th><th>Pontos</th><th>Valor</th><th>Status</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td><strong>{item.notice}</strong></td><td>{date(item.date)}</td><td><strong>{item.vehicle}</strong><small>{item.driver}</small></td><td>{item.description}</td><td>{date(item.dueAt)}</td><td>{item.points}</td><td>{money(item.value)}</td><td><ModuleStatusPill status={item.status}/></td></tr>)}</tbody></table></div></section>
    <SlideOver open={open} title="Registrar multa" description="Associe a infração aos responsáveis conhecidos." onClose={() => setOpen(false)} footer={<><button className="button secondary" onClick={() => setOpen(false)}>Cancelar</button><button className="button primary" type="submit" form="fine-form">Salvar multa</button></>}><form id="fine-form" className="drawer-form" onSubmit={save}><label>Auto de infração<input required value={form.notice} onChange={(e) => setForm({ ...form, notice: e.target.value })}/></label><label>Veículo<input required value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} placeholder="Ex.: Fiat Mobi · MOB203"/></label><label>Motorista<input value={form.driver} onChange={(e) => setForm({ ...form, driver: e.target.value })}/></label><label>Descrição<textarea required rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}/></label><div className="form-grid two"><label>Valor<input required type="number" min="0" step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })}/></label><label>Pontos<input type="number" min="0" max="20" value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })}/></label></div><label>Vencimento<input required type="date" value={form.dueAt} onChange={(e) => setForm({ ...form, dueAt: e.target.value })}/></label><div className="drawer-note warning"><AlertTriangle size={17}/><span>Em produção, a API tentará localizar automaticamente a reserva ativa no horário da infração.</span></div></form></SlideOver>
  </div>;
}
