import { X } from 'lucide-react';

export function SlideOver({ open, title, description, onClose, footer, children }) {
  if (!open) return null;
  return <div className="drawer-layer" role="presentation"><button className="drawer-backdrop" aria-label="Fechar painel" onClick={onClose}/><aside className="drawer" role="dialog" aria-modal="true" aria-label={title}><header className="drawer-header"><div><h2>{title}</h2>{description && <p>{description}</p>}</div><button className="icon-button" aria-label="Fechar" onClick={onClose}><X size={20}/></button></header><div className="drawer-content">{children}</div>{footer && <footer className="drawer-footer">{footer}</footer>}</aside></div>;
}
