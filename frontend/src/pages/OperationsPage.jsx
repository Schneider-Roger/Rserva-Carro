import { useMemo, useState } from 'react';
import { CarFront, CheckCircle2, Fuel, Gauge, KeyRound, QrCode, ShieldCheck, TriangleAlert } from 'lucide-react';
import { mockReservations } from '../data/mockData.js';

const checklistItems = [
  'Pneus em condição aparente normal',
  'Iluminação sem anormalidade aparente',
  'Documentos presentes',
  'Sem nova avaria aparente',
];

export function OperationsPage() {
  const reservation = mockReservations.find((item) => item.status === 'CONFIRMADA');
  const [mode, setMode] = useState('retirada');
  const [kmStart, setKmStart] = useState('45382');
  const [kmEnd, setKmEnd] = useState('45468');
  const [fuelStart, setFuelStart] = useState('75');
  const [fuelEnd, setFuelEnd] = useState('50');
  const [checks, setChecks] = useState(() => checklistItems.map(() => true));
  const [damage, setDamage] = useState(false);
  const [notes, setNotes] = useState('');
  const [completed, setCompleted] = useState(false);

  const distance = useMemo(() => Math.max(0, Number(kmEnd || 0) - Number(kmStart || 0)), [kmEnd, kmStart]);

  if (!reservation) {
    return <div className="page-stack"><div className="page-heading"><span className="eyebrow">Operação</span><h1>Retirada e devolução</h1></div><section className="section-card empty-state"><CarFront size={30}/><strong>Nenhuma reserva disponível</strong><p>Uma reserva confirmada aparecerá aqui para retirada.</p></section></div>;
  }

  if (completed) {
    return <div className="success-screen"><div className="success-icon"><CheckCircle2 size={30}/></div><span className="eyebrow">Operação registrada</span><h1>{mode === 'retirada' ? 'Veículo retirado' : 'Veículo devolvido'}</h1><p>O histórico operacional foi registrado para a reserva #{reservation.id}.</p><div className="success-actions"><button className="button secondary" onClick={() => setCompleted(false)}>Voltar</button></div></div>;
  }

  return (
    <div className="page-stack narrow-page">
      <div className="page-heading"><span className="eyebrow">Operação da frota</span><h1>Retirada e devolução</h1><p>Registre o estado do veículo antes da saída e no retorno.</p></div>

      <div className="segmented operation-tabs" role="tablist">
        <button className={mode === 'retirada' ? 'active' : ''} onClick={() => setMode('retirada')}>Retirada</button>
        <button className={mode === 'devolucao' ? 'active' : ''} onClick={() => setMode('devolucao')}>Devolução</button>
      </div>

      <section className="form-card">
        <div className="form-card-title"><QrCode/><div><h2>Reserva #{reservation.id}</h2><p>{reservation.vehicle.brand} {reservation.vehicle.model} · {reservation.vehicle.internalCode}</p></div></div>
        <div className="review-grid">
          <div className="review-item"><span>Motorista</span><strong>{reservation.driver}</strong></div>
          <div className="review-item"><span>Período</span><strong>{reservation.start} — {reservation.end}</strong></div>
          <div className="review-item"><span>Destino</span><strong>{reservation.destinations.join(' → ')}</strong></div>
        </div>
        <div className="info-note"><QrCode size={16}/> QR Code do veículo será usado para localizar automaticamente a reserva em produção.</div>
      </section>

      <section className="form-card">
        <div className="form-card-title"><Gauge/><div><h2>Hodômetro e combustível</h2><p>Dados simples, sem exigir hardware instalado.</p></div></div>
        {mode === 'retirada' ? (
          <div className="form-grid two"><label>KM inicial<input type="number" min="0" value={kmStart} onChange={(e)=>setKmStart(e.target.value)}/></label><label>Nível de combustível (%)<input type="number" min="0" max="100" value={fuelStart} onChange={(e)=>setFuelStart(e.target.value)}/></label></div>
        ) : (
          <><div className="form-grid two"><label>KM final<input type="number" min={kmStart} value={kmEnd} onChange={(e)=>setKmEnd(e.target.value)}/></label><label>Nível de combustível (%)<input type="number" min="0" max="100" value={fuelEnd} onChange={(e)=>setFuelEnd(e.target.value)}/></label></div><div className="metric-row operation-metrics"><div className="metric"><strong>{distance}</strong><span>km percorridos</span></div><div className="metric"><strong>{fuelStart}%</strong><span>combustível na saída</span></div><div className="metric"><strong>{fuelEnd}%</strong><span>combustível no retorno</span></div></div></>
        )}
      </section>

      <section className="form-card">
        <div className="form-card-title"><ShieldCheck/><div><h2>Checklist rápido</h2><p>Confirme as condições visuais antes de concluir.</p></div></div>
        <div className="checklist-grid">
          {checklistItems.map((item,index)=><label className="check-item" key={item}><input type="checkbox" checked={checks[index]} onChange={(e)=>setChecks((current)=>current.map((v,i)=>i===index?e.target.checked:v))}/><span>{checks[index]?<CheckCircle2 size={18}/>:<TriangleAlert size={18}/>}</span><strong>{item}</strong></label>)}
        </div>
        <div className="form-divider"/>
        <label className="damage-toggle"><input type="checkbox" checked={damage} onChange={(e)=>setDamage(e.target.checked)}/><span><TriangleAlert size={18}/></span><div><strong>Registrar avaria/ocorrência</strong><small>Marque caso tenha encontrado uma condição que precise de acompanhamento.</small></div></label>
        {damage && <label className="block-label">Descrição da ocorrência<textarea rows="3" value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Descreva a avaria, local e condição encontrada"/></label>}
      </section>

      <section className="form-card operation-summary">
        <div className="operation-summary-row"><KeyRound/><div><strong>Custódia da chave</strong><span>{mode === 'retirada' ? 'A chave será vinculada ao motorista no momento da retirada.' : 'A chave será marcada como devolvida ao concluir.'}</span></div></div>
        <div className="operation-summary-row"><Fuel/><div><strong>Sem hardware obrigatório</strong><span>GPS e telemetria poderão ser integrados futuramente, sem bloquear o uso atual.</span></div></div>
        <div className="form-actions end"><button className="button primary" disabled={checks.some((item)=>!item) && !damage} onClick={()=>setCompleted(true)}>{mode === 'retirada' ? 'Confirmar retirada' : 'Confirmar devolução'}</button></div>
      </section>
    </div>
  );
}
