import { useMemo, useState } from 'react';
import { CalendarDays, Gauge, Search, Wrench } from 'lucide-react';
import { mockVehicles } from '../data/mockData.js';
import { managementMaintenancePlans } from '../data/managementMockData.js';
import { ManagementPageHeader } from '../components/management/ManagementPageHeader.jsx';
import { SlideOver } from '../components/management/SlideOver.jsx';
import { ModuleStatusPill } from '../components/management/ModuleStatusPill.jsx';

const date = (value) => new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}T12:00:00`));
const progress = (current, next) => Math.min(100, Math.round((current / next) * 100));

export function PreventiveMaintenancePage() {
  const [items, setItems] = useState(managementMaintenancePlans);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ vehicleId: String(mockVehicles[0].id), name: 'Revisão periódica', intervalKm: '10000', intervalDays: '180', nextKm: '', nextDate: '' });
  const filtered = useMemo(() => items.filter((item) => `${item.vehicle} ${item.code} ${item.name}`.toLowerCase().includes(search.toLowerCase())), [items, search]);
  const urgent = items.filter((item) => item.status === 'ATRASADA').length;
  const near = items.filter((item) => item.status === 'PROXIMO').length;

  function save(event) {
    event.preventDefault();
    const vehicle = mockVehicles.find((item) => String(item.id) === form.vehicleId) || mockVehicles[0];
    setItems((current) => [...current, { id: Date.now(), vehicle: `${vehicle.brand} ${vehicle.model}`, code: vehicle.internalCode, name: form.name.trim(), currentKm: vehicle.km || 0, nextKm: Number(form.nextKm || form.intervalKm || 0), nextDate: form.nextDate || new Date().toISOString().slice(0, 10), status: 'EM_DIA' }]);
    setOpen(false);
  }

  return <div className="page-stack management-page">
    <ManagementPageHeader eyebrow="Manutenção" title="Manutenção preventiva" description="Planeje revisões por quilometragem, data ou pelos dois critérios antes que o veículo pare." actionLabel="Novo plano preventivo" onAction={() => setOpen(true)} />
    <div className="management-kpis"><article><span>Planos ativos</span><strong>{items.length}</strong><small>veículos monitorados</small></article><article><span>Próximos</span><strong>{near}</strong><small>exigem programação</small></article><article className={urgent ? 'kpi-danger' : ''}><span>Atrasados</span><strong>{urgent}</strong><small>ação imediata</small></article></div>
    <section className="section-card management-table-card"><div className="management-toolbar"><div className="search-field"><Search size={17}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar veículo ou plano..."/></div><span className="result-count">{filtered.length} planos</span></div><div className="maintenance-list">{filtered.map((item) => <article className="maintenance-card" key={item.id}><div className="maintenance-card-head"><div><strong>{item.vehicle}</strong><span>{item.code} · {item.name}</span></div><ModuleStatusPill status={item.status}/></div><div className="maintenance-progress"><div className="maintenance-progress-label"><span><Gauge size={15}/> {item.currentKm.toLocaleString('pt-BR')} km atuais</span><span>{item.nextKm.toLocaleString('pt-BR')} km alvo</span></div><div className="progress-track"><span style={{ width: `${progress(item.currentKm, item.nextKm)}%` }}/></div></div><div className="maintenance-meta"><span><CalendarDays size={15}/> Próxima data: {date(item.nextDate)}</span><span><Wrench size={15}/> Faltam {Math.max(0, item.nextKm - item.currentKm).toLocaleString('pt-BR')} km</span></div></article>)}</div></section>
    <SlideOver open={open} title="Novo plano preventivo" description="Crie um gatilho por KM, data ou ambos." onClose={() => setOpen(false)} footer={<><button className="button secondary" onClick={() => setOpen(false)}>Cancelar</button><button className="button primary" type="submit" form="maintenance-form">Salvar plano</button></>}><form id="maintenance-form" className="drawer-form" onSubmit={save}><label>Veículo<select value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>{mockVehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.brand} {vehicle.model} · {vehicle.internalCode}</option>)}</select></label><label>Nome do plano<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}/></label><div className="form-grid two"><label>Intervalo em KM<input type="number" min="1" value={form.intervalKm} onChange={(e) => setForm({ ...form, intervalKm: e.target.value })}/></label><label>Intervalo em dias<input type="number" min="1" value={form.intervalDays} onChange={(e) => setForm({ ...form, intervalDays: e.target.value })}/></label></div><div className="form-grid two"><label>Próximo KM<input type="number" min="0" value={form.nextKm} onChange={(e) => setForm({ ...form, nextKm: e.target.value })}/></label><label>Próxima data<input type="date" value={form.nextDate} onChange={(e) => setForm({ ...form, nextDate: e.target.value })}/></label></div></form></SlideOver>
  </div>;
}
