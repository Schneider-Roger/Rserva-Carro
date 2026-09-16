import { CarFront, CheckCircle2, MapPin, Users } from 'lucide-react';

export function VehicleCard({ vehicle, selected, onSelect }) {
  return (
    <button type="button" className={`vehicle-card ${selected ? 'selected' : ''}`} onClick={() => onSelect(vehicle)} aria-pressed={selected}>
      <div className="vehicle-icon"><CarFront size={25} /></div>
      <div className="vehicle-main">
        <div className="vehicle-title-row"><strong>{vehicle.brand} {vehicle.model}</strong><span>{vehicle.internalCode || vehicle.codigoInterno}</span></div>
        <div className="vehicle-meta">
          <span><Users size={15} /> {vehicle.capacity || vehicle.capacidade} lugares</span>
          <span><MapPin size={15} /> {vehicle.unit || vehicle.unidade?.nome}</span>
        </div>
        <div className="vehicle-foot"><span className="available-label"><CheckCircle2 size={16} /> Disponível no período</span><span className="plate">{vehicle.plate || vehicle.placa}</span></div>
      </div>
    </button>
  );
}
