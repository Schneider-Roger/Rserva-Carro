import { useEffect, useMemo, useState } from 'react';
import { Building2, Search } from 'lucide-react';
import { ManagementPageHeader } from '../components/management/ManagementPageHeader.jsx';
import { SlideOver } from '../components/management/SlideOver.jsx';
import { ModuleStatusPill } from '../components/management/ModuleStatusPill.jsx';
import { AsyncState } from '../components/management/AsyncState.jsx';
import { createCostCenter, getCostCenters } from '../services/managementApi.js';

export function CostCentersPage() {
  const [items, setItems] = useState([]); const [search, setSearch] = useState(''); const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true); const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', description: '' });
  const filtered = useMemo(() => items.filter((x) => `${x.code} ${x.name}`.toLowerCase().includes(search.toLowerCase())), [items, search]);
  async function load() { try { setLoading(true); setError(''); setItems(await getCostCenters()); } catch (e) { setError(e.message); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);
  async function save(e) { e.preventDefault(); try { setSaving(true); await createCostCenter(form); setOpen(false); setForm({ code: '', name: '', description: '' }); await load(); } catch (err) { setError(err.message); } finally { setSaving(false); } }
  return <div className="page-stack management-page"><ManagementPageHeader eyebrow="Estrutura financeira" title="Centros de custo" description="Associe viagens e despesas às áreas responsáveis." actionLabel="Novo centro de custo" onAction={() => setOpen(true)}/><AsyncState loading={loading} error={error} onRetry={load}><section className="section-card management-table-card"><div className="management-toolbar"><div className="search-field"><Search size={17}/><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Buscar código ou nome..."/></div><span className="result-count">{filtered.length} centros</span></div><div className="management-table-scroll"><table className="management-table"><thead><tr><th>Código</th><th>Centro de custo</th><th>Descrição</th><th>Status</th></tr></thead><tbody>{filtered.map((x)=><tr key={x.id}><td><span className="code-chip">{x.code}</span></td><td><strong>{x.name}</strong></td><td>{x.description || '—'}</td><td><ModuleStatusPill status={x.active ? 'ATIVO':'INATIVO'}/></td></tr>)}</tbody></table></div></section></AsyncState><SlideOver open={open} title="Novo centro de custo" description="O cadastro ficará disponível para reservas, abastecimentos e relatórios." onClose={()=>setOpen(false)} footer={<><button className="button secondary" onClick={()=>setOpen(false)}>Cancelar</button><button disabled={saving} className="button primary" form="cc-form" type="submit">{saving?'Salvando...':'Criar centro'}</button></>}><form id="cc-form" className="drawer-form" onSubmit={save}><label>Código<input required value={form.code} onChange={(e)=>setForm({...form,code:e.target.value})}/></label><label>Nome<input required value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/></label><label>Descrição<textarea rows="3" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})}/></label><div className="drawer-note"><Building2 size={17}/><span>O backend valida o tenant e não aceita referências de outra empresa.</span></div></form></SlideOver></div>;
}
