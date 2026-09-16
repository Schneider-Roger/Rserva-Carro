import { useMemo, useState } from 'react';
import { Building2, Search } from 'lucide-react';
import { managementCostCenters } from '../data/managementMockData.js';
import { ManagementPageHeader } from '../components/management/ManagementPageHeader.jsx';
import { SlideOver } from '../components/management/SlideOver.jsx';
import { ModuleStatusPill } from '../components/management/ModuleStatusPill.jsx';

const money = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function CostCentersPage() {
  const [items, setItems] = useState(managementCostCenters);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', responsible: '' });
  const filtered = useMemo(() => items.filter((item) => `${item.code} ${item.name} ${item.responsible}`.toLowerCase().includes(search.toLowerCase())), [items, search]);
  const active = items.filter((item) => item.active).length;
  const totalCost = items.reduce((sum, item) => sum + item.monthCost, 0);
  const totalTrips = items.reduce((sum, item) => sum + item.trips, 0);

  function save(event) {
    event.preventDefault();
    setItems((current) => [...current, { id: Date.now(), code: form.code.trim().toUpperCase(), name: form.name.trim(), responsible: form.responsible.trim() || 'Não definido', active: true, trips: 0, monthCost: 0 }]);
    setForm({ code: '', name: '', responsible: '' });
    setOpen(false);
  }

  return <div className="page-stack management-page">
    <ManagementPageHeader eyebrow="Estrutura financeira" title="Centros de custo" description="Associe viagens e despesas às áreas responsáveis para entender onde a frota está sendo consumida." actionLabel="Novo centro de custo" onAction={() => setOpen(true)} />
    <div className="management-kpis"><article><span>Ativos</span><strong>{active}</strong><small>de {items.length} cadastrados</small></article><article><span>Viagens no mês</span><strong>{totalTrips}</strong><small>com rateio identificado</small></article><article><span>Custo acumulado</span><strong>{money(totalCost)}</strong><small>dados demonstrativos</small></article></div>
    <section className="section-card management-table-card"><div className="management-toolbar"><div className="search-field"><Search size={17}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar código, nome ou responsável..."/></div><span className="result-count">{filtered.length} centros</span></div><div className="management-table-scroll"><table className="management-table"><thead><tr><th>Código</th><th>Centro de custo</th><th>Responsável</th><th>Viagens</th><th>Custo do mês</th><th>Status</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td><span className="code-chip">{item.code}</span></td><td><strong>{item.name}</strong></td><td>{item.responsible}</td><td>{item.trips}</td><td>{money(item.monthCost)}</td><td><ModuleStatusPill status={item.active ? 'ATIVO' : 'INATIVO'}/></td></tr>)}</tbody></table></div></section>
    <SlideOver open={open} title="Novo centro de custo" description="O código será usado em filtros, reservas e relatórios." onClose={() => setOpen(false)} footer={<><button className="button secondary" onClick={() => setOpen(false)}>Cancelar</button><button className="button primary" type="submit" form="cost-center-form">Criar centro</button></>}><form id="cost-center-form" className="drawer-form" onSubmit={save}><label>Código<input required maxLength="50" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="Ex.: COM"/></label><label>Nome<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex.: Comercial"/></label><label>Responsável<input value={form.responsible} onChange={(e) => setForm({ ...form, responsible: e.target.value })} placeholder="Nome do gestor responsável"/></label><div className="drawer-note"><Building2 size={17}/><span>Depois, este centro poderá ser obrigatório nas reservas conforme a configuração da empresa.</span></div></form></SlideOver>
  </div>;
}
