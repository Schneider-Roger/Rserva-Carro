import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarClock, Check, MapPin, Plus, Trash2, UserRound } from 'lucide-react';
import { currentUser, mockUsers, states, cities } from '../data/mockData.js';
import { VehicleCard } from '../components/VehicleCard.jsx';
import { createReservation, getAvailableVehicles } from '../services/api.js';

const steps = ['Período', 'Veículo', 'Viagem', 'Confirmar'];
const emptyDestination = () => ({ stateId: '35', cityId: '' });

export function NewReservationPage() {
  const [step, setStep] = useState(0);
  const [period, setPeriod] = useState({ date: '2026-09-18', start: '08:30', end: '12:00' });
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [driverId, setDriverId] = useState(String(currentUser.id));
  const [destinations, setDestinations] = useState([emptyDestination()]);
  const [reason, setReason] = useState('');
  const [ticket, setTicket] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdId, setCreatedId] = useState(null);

  const selectedDriver = mockUsers.find((user) => String(user.id) === driverId) || currentUser;
  const destinationLabels = useMemo(() => destinations.map((item) => {
    const state = states.find((entry) => String(entry.id) === item.stateId);
    const city = (cities[item.stateId] || []).find((entry) => String(entry.id) === item.cityId);
    return city && state ? `${city.name} - ${state.uf}` : 'Destino não informado';
  }), [destinations]);

  async function searchVehicles() {
    setError('');
    if (!period.date || !period.start || !period.end || period.end <= period.start) {
      setError('Informe um período válido. O retorno deve ser posterior à saída.');
      return;
    }
    setLoading(true);
    try {
      const data = await getAvailableVehicles(period);
      setVehicles(data);
      setSelectedVehicle(null);
      setStep(1);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function updateDestination(index, field, value) {
    setDestinations((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value, ...(field === 'stateId' ? { cityId: '' } : {}) } : item));
  }

  function validateTrip() {
    if (destinations.some((item) => !item.stateId || !item.cityId)) {
      setError('Selecione Estado e Cidade em todos os destinos.');
      return false;
    }
    if (reason.trim().length < 5) {
      setError('Informe o motivo da viagem com pelo menos 5 caracteres.');
      return false;
    }
    setError('');
    return true;
  }

  async function confirmReservation() {
    setLoading(true);
    setError('');
    try {
      const result = await createReservation({
        veiculoId: selectedVehicle.id,
        motoristaId: Number(driverId),
        dataHoraInicio: `${period.date}T${period.start}:00`,
        dataHoraFim: `${period.date}T${period.end}:00`,
        motivo: reason.trim(),
        numeroChamado: ticket.trim() || null,
        observacao: notes.trim() || null,
        destinos: destinations.map((item) => ({ cidadeId: Number(item.cityId) })),
      });
      setCreatedId(result.id);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  if (createdId) {
    return <div className="success-screen"><div className="success-icon"><Check size={30} /></div><span className="eyebrow">Reserva #{createdId}</span><h1>Reserva confirmada</h1><p>{selectedVehicle.brand || selectedVehicle.marca} {selectedVehicle.model || selectedVehicle.modelo} · {period.date.split('-').reverse().join('/')} · {period.start} às {period.end}</p><div className="success-actions"><a className="button primary" href="/reservas">Ver minhas reservas</a><a className="button secondary" href="/reservas/nova">Fazer outra reserva</a></div></div>;
  }

  return (
    <div className="page-stack narrow-page">
      <div className="page-heading"><span className="eyebrow">Reserva de veículo</span><h1>Nova reserva</h1><p>Quatro etapas curtas para concluir sua solicitação.</p></div>
      <ol className="stepper" aria-label="Etapas da reserva">{steps.map((label, index) => <li key={label} className={`${index === step ? 'current' : ''} ${index < step ? 'done' : ''}`}><span>{index < step ? <Check size={16} /> : index + 1}</span><b>{label}</b></li>)}</ol>
      {error && <div className="alert error" role="alert">{error}</div>}

      {step === 0 && <section className="form-card"><div className="form-card-title"><CalendarClock /><div><h2>Quando você precisa do veículo?</h2><p>Use intervalos de 30 minutos.</p></div></div><div className="form-grid three"><label>Data<input type="date" value={period.date} onChange={(e) => setPeriod({ ...period, date: e.target.value })} /></label><label>Saída<input type="time" step="1800" value={period.start} onChange={(e) => setPeriod({ ...period, start: e.target.value })} /></label><label>Retorno<input type="time" step="1800" value={period.end} onChange={(e) => setPeriod({ ...period, end: e.target.value })} /></label></div><div className="form-actions end"><button className="button primary" onClick={searchVehicles} disabled={loading}>{loading ? 'Buscando...' : 'Buscar veículos disponíveis'} <ArrowRight size={18} /></button></div></section>}

      {step === 1 && <section className="form-card"><div className="form-card-title"><div><h2>Escolha um veículo</h2><p>{period.date.split('-').reverse().join('/')} · {period.start} às {period.end}</p></div></div><div className="vehicle-grid">{vehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} selected={selectedVehicle?.id === vehicle.id} onSelect={setSelectedVehicle} />)}</div>{vehicles.length === 0 && <div className="empty-state"><strong>Nenhum veículo disponível</strong><p>Altere o período para consultar outras opções.</p></div>}<div className="form-actions between"><button className="button secondary" onClick={() => setStep(0)}><ArrowLeft size={18} /> Alterar período</button><button className="button primary" disabled={!selectedVehicle} onClick={() => setStep(2)}>Continuar <ArrowRight size={18} /></button></div></section>}

      {step === 2 && <section className="form-card"><div className="form-card-title"><UserRound /><div><h2>Dados da viagem</h2><p>Informe quem dirige, destino(s) e o motivo.</p></div></div><div className="form-grid two"><label>Motorista<select value={driverId} onChange={(e) => setDriverId(e.target.value)}>{mockUsers.map((user) => <option value={user.id} key={user.id}>{user.name} · {user.employeeCode}</option>)}</select><small>Por padrão, o motorista é o solicitante.</small></label><div className="readonly-box"><span>Solicitante</span><strong>{currentUser.name}</strong><small>{currentUser.department} · {currentUser.unit}</small></div></div><div className="form-divider" /><div className="form-card-title compact-title"><MapPin /><div><h3>Destino(s)</h3><p>Adicione até 10 cidades, na ordem da viagem.</p></div></div><div className="destination-stack">{destinations.map((destination, index) => <div className="destination-row" key={index}><div className="destination-index">{index + 1}</div><label>Estado<select value={destination.stateId} onChange={(e) => updateDestination(index, 'stateId', e.target.value)}>{states.map((state) => <option key={state.id} value={state.id}>{state.name}</option>)}</select></label><label>Cidade<select value={destination.cityId} onChange={(e) => updateDestination(index, 'cityId', e.target.value)}><option value="">Selecione...</option>{(cities[destination.stateId] || []).map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}</select></label>{index > 0 && <button className="icon-button danger" aria-label={`Remover destino ${index + 1}`} onClick={() => setDestinations((current) => current.filter((_, i) => i !== index))}><Trash2 size={18} /></button>}</div>)}</div>{destinations.length < 10 && <button className="add-destination" type="button" onClick={() => setDestinations((current) => [...current, emptyDestination()])}><Plus size={18} /> Adicionar destino</button>}<div className="form-grid one"><label>Motivo da viagem *<textarea rows="3" placeholder="Ex.: Visita técnica à unidade" value={reason} onChange={(e) => setReason(e.target.value)} /></label></div><div className="form-grid two"><label>Nº do chamado <span className="optional">opcional</span><input value={ticket} onChange={(e) => setTicket(e.target.value)} placeholder="Ex.: INC-12345" /></label><label>Observação <span className="optional">opcional</span><input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Informação complementar" /></label></div><div className="form-actions between"><button className="button secondary" onClick={() => setStep(1)}><ArrowLeft size={18} /> Voltar</button><button className="button primary" onClick={() => validateTrip() && setStep(3)}>Revisar reserva <ArrowRight size={18} /></button></div></section>}

      {step === 3 && <section className="form-card"><div className="form-card-title"><Check /><div><h2>Confirme sua reserva</h2><p>Confira os dados antes de concluir.</p></div></div><div className="review-grid"><div className="review-item"><span>Veículo</span><strong>{selectedVehicle.brand || selectedVehicle.marca} {selectedVehicle.model || selectedVehicle.modelo}</strong><small>{selectedVehicle.internalCode || selectedVehicle.codigoInterno} · {selectedVehicle.plate || selectedVehicle.placa}</small></div><div className="review-item"><span>Período</span><strong>{period.date.split('-').reverse().join('/')}</strong><small>{period.start} às {period.end}</small></div><div className="review-item"><span>Motorista</span><strong>{selectedDriver.name}</strong><small>Crachá {selectedDriver.employeeCode}</small></div><div className="review-item wide"><span>Destinos</span><strong>{destinationLabels.join(' → ')}</strong></div><div className="review-item wide"><span>Motivo</span><strong>{reason}</strong>{ticket && <small>Chamado: {ticket}</small>}</div></div><div className="info-note">A disponibilidade será revalidada no momento da confirmação para evitar reserva simultânea por outro usuário.</div><div className="form-actions between"><button className="button secondary" onClick={() => setStep(2)}><ArrowLeft size={18} /> Voltar</button><button className="button primary" disabled={loading} onClick={confirmReservation}>{loading ? 'Confirmando...' : 'Confirmar reserva'} <Check size={18} /></button></div></section>}
    </div>
  );
}
