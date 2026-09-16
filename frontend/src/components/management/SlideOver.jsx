import { X } from 'lucide-react';

export function SlideOver({ open, title, description, onClose, children, footer }) {
  if (!open) return null;

  return (
    <div className="slide-over-layer" role="presentation">
      <button className="slide-over-backdrop" aria-label="Fechar painel" onClick={onClose}/>
      <aside className="slide-over" role="dialog" aria-modal="true" aria-label={title}>
        <div className="slide-over-header">
          <div><h2>{title}</h2>{description && <p>{description}</p>}</div>
          <button type="button" className="icon-button" aria-label="Fechar" onClick={onClose}><X size={19}/></button>
        </div>
        <div className="slide-over-body">{children}</div>
        {footer && <div className="slide-over-footer">{footer}</div>}
      </aside>
    </div>
  );
}
