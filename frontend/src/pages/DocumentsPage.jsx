import { useMemo, useState } from 'react';
import { FileText, Search } from 'lucide-react';
import { managementDriverDocuments, managementVehicleDocuments } from '../data/managementMockData.js';
import { ManagementPageHeader } from '../components/management/ManagementPageHeader.jsx';
import { SlideOver } from '../components/management/SlideOver.jsx';
import { ModuleStatusPill } from '../components/management/ModuleStatusPill.jsx';

const date = (value) => new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}T12:00:00`));

export function DocumentsPage() {
  const [vehicleDocs, setVehicleDocs] = useState(managementVehicleDocuments);
  const [driverDocs, setDriverDocs] = useState(managementDriverDocuments);
  const [tab, setTab] = useState('vehicles');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ owner: '', type: 'Seguro', number: '', expiresAt: '' });
  const source = tab === 'vehicles' ? vehicleDocs : driverDocs;
  const filtered = useMemo(() => source.filter((item) => `${item.owner} ${item.type} ${item.number}`.toLowerCase().includes(search.toLowerCase())), [source, search]);
  const expiring = [...vehicleDocs, ...driverDocs].filter((item) => item.status === 'A_VENCER').length;

  function save(event) {
    event.preventDefault();
    const record = { id: Date.now(), owner: form.owner.trim(), type: form.type, number: form.number.trim(), expiresAt: form.expiresAt, status: 'EM_DIA' };
    if (tab === 'vehicles') setVehicleDocs((current) => [...current, record]); else setDriverDocs((current) => [...current, record]);
    setOpen(false);
  }

  return <div className="page-stack management-page">
    <ManagementPageHeader eyebrow="Conformidade" title="Documentos e vencimentos" description="Centralize documentos de veículos e motoristas e antecipe vencimentos críticos." actionLabel="Cadastrar documento" onAction={() => setOpen(true)} />
    <div className="management-kpis"><article><span>Documentos</span><strong>{vehicleDocs.length + driverDocs.length}</strong><small>em acompanhamento</small></article><article><span>Veículos</span><strong>{vehicleDocs.length}</strong><small>documentos cadastrados</small></article><article className={expiring ? 'kpi-warning' : ''}><span>A vencer</span><strong>{expiring}</strong><small>dentro da janela de alerta</small></article></div>
    <section className="section-card management-table-card"><div className="management-toolbar wrap"><div className="segmented"><button className={tab === 'vehicles' ? 'active' : ''} onClick={() => setTab('vehicles')}>Veículos</button><button className={tab === 'drivers' ? 'active' : ''} onClick={() => setTab('drivers')}>Motoristas</button></div><div className="search-field"><Search size={17}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar documento..."/></div></div><div className="management-table-scroll"><table className="management-table"><thead><tr><th>{tab === 'vehicles' ? 'Veículo' : 'Motorista'}</th><th>Documento</th><th>Número</th><th>Validade</th><th>Status</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td><strong>{item.owner}</strong></td><td>{item.type}</td><td>{item.number}</td><td>{date(item.expiresAt)}</td><td><ModuleStatusPill status={item.status}/></td></tr>)}</tbody></table></div></section>
    <SlideOver open={open} title="Cadastrar documento" description={tab === 'vehicles' ? 'Documento vinculado a um veículo.' : 'Documento vinculado a um motorista.'} onClose={() => setOpen(false)} footer={<><button className="button secondary" onClick={() => setOpen(false)}>Cancelar</button><button className="button primary" type="submit" form="document-form">Salvar documento</button></>}><form id="document-form" className="drawer-form" onSubmit={save}><label>{tab === 'vehicles' ? 'Veículo' : 'Motorista'}<input required value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} placeholder={tab === 'vehicles' ? 'Ex.: Fiat Strada · DIS401' : 'Nome do motorista'}/></label><label>Tipo<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{tab === 'vehicles' ? <><option>Seguro</option><option>Licenciamento</option><option>CRLV</option><option>Outro</option></> : <><option>CNH B</option><option>CNH AB</option><option>CNH D</option><option>Outro</option></>}</select></label><label>Número<input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })}/></label><label>Validade<input required type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}/></label><div className="drawer-note"><FileText size={17}/><span>Na versão integrada, o sistema gerará alertas automáticos antes do vencimento.</span></div></form></SlideOver>
  </div>;
}
