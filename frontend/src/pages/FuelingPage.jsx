import { useMemo, useState } from 'react';
import { Fuel, Search } from 'lucide-react';
import { mockVehicles } from '../data/mockData.js';
import { managementCostCenters, managementFuelings } from '../data/managementMockData.js';
import { ManagementPageHeader } from '../components/management/ManagementPageHeader.jsx';
import { SlideOver } from '../components/management/SlideOver.jsx';

const money = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const date = (value) => new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}T12:00:00`));

export function FuelingPage() {
  const [items, setItems] = useState(managementFuelings);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ vehicleId: String(mockVehicles[0].id), costCenter: 'TI', fuel: 'Etanol', liters: '', total: '', km: '', station: '' });

  const filtered = useMemo(() => items.filter((item) => `${item.vehicle} ${item.code} ${item.plate} ${item.driver} ${item.costCenter}`.toLowerCase().includes(search.toLowerCase())), [items, search]);
  const total = items.reduce((sum, item) => sum + item.total, 0);
  const liters = items.reduce((sum, item) => sum + item.liters, 0);
  const average = liters > 0 ? total / liters : 0;

  function save(event) {
    event.preventDefault();
    const vehicle = mockVehicles.find((item) => String(item.id) === form.vehicleId) || mockVehicles[0];
    setItems((current) => [{ id: Date.now(), date: new Date().toISOString().slice(0, 10), vehicle: `${vehicle.brand} ${vehicle.model}`, code: vehicle.internalCode, plate: vehicle.plate, driver: 'Roger Schneider', costCenter: form.costCenter, fuel: form.fuel, liters: Number(form.liters || 0), total: Number(form.total || 0), km: Number(form.km || 0), station: form.station || 'Não informado' }, ...current]);
    setOpen(false);
  }

  return <div className="page-stack management-page">
    <ManagementPageHeader eyebrow="Gestão da frota" title="Abastecimentos" description="Controle combustível, quilometragem, motorista e centro de custo em um único histórico." actionLabel="Registrar abastecimento" onAction={() => setOpen(true)} />

    <div className="management-kpis">
      <article><span>Gasto registrado</span><strong>{money(total)}</strong><small>No período demonstrado</small></article>
      <article><span>Volume abastecido</span><strong>{liters.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} L</strong><small>{items.length} abastecimentos</small></article>
      <article><span>Preço médio</span><strong>{money(average)}/L</strong><small>Média ponderada</small></article>
    </div>

    <section className="section-card management-table-card">
      <div className="management-toolbar"><div className="search-field"><Search size={17}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar veículo, placa, motorista..."/></div><span className="result-count">{filtered.length} registros</span></div>
      <div className="management-table-scroll"><table className="management-table"><thead><tr><th>Data</th><th>Veículo</th><th>Motorista</th><th>Centro de custo</th><th>Combustível</th><th>Litros</th><th>KM</th><th>Valor</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td>{date(item.date)}</td><td><strong>{item.vehicle}</strong><small>{item.code} · {item.plate}</small></td><td>{item.driver}</td><td>{item.costCenter}</td><td>{item.fuel}</td><td>{item.liters.toLocaleString('pt-BR')} L</td><td>{item.km.toLocaleString('pt-BR')}</td><td><strong>{money(item.total)}</strong></td></tr>)}</tbody></table></div>
    </section>

    <SlideOver open={open} title="Registrar abastecimento" description="Informe os dados do comprovante e do hodômetro." onClose={() => setOpen(false)} footer={<><button className="button secondary" onClick={() => setOpen(false)}>Cancelar</button><button className="button primary" form="fueling-form" type="submit">Salvar abastecimento</button></>}>
      <form id="fueling-form" className="drawer-form" onSubmit={save}>
        <label>Veículo<select value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>{mockVehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.brand} {vehicle.model} · {vehicle.internalCode}</option>)}</select></label>
        <div className="form-grid two"><label>Centro de custo<select value={form.costCenter} onChange={(e) => setForm({ ...form, costCenter: e.target.value })}>{managementCostCenters.filter((item) => item.active).map((item) => <option key={item.id} value={item.code}>{item.code} · {item.name}</option>)}</select></label><label>Combustível<select value={form.fuel} onChange={(e) => setForm({ ...form, fuel: e.target.value })}><option>Etanol</option><option>Gasolina</option><option>Diesel</option></select></label></div>
        <div className="form-grid two"><label>Litros<input required type="number" step="0.001" min="0.001" value={form.liters} onChange={(e) => setForm({ ...form, liters: e.target.value })}/></label><label>Valor total<input required type="number" step="0.01" min="0" value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })}/></label></div>
        <label>Quilometragem<input required type="number" min="0" value={form.km} onChange={(e) => setForm({ ...form, km: e.target.value })}/></label>
        <label>Posto<input value={form.station} onChange={(e) => setForm({ ...form, station: e.target.value })} placeholder="Nome do posto"/></label>
        <div className="drawer-note"><Fuel size={17}/><span>Na API real, um KM maior que o atual poderá atualizar automaticamente o hodômetro do veículo.</span></div>
      </form>
    </SlideOver>
  </div>;
}
