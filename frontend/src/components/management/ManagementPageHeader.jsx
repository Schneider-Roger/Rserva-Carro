import { Plus } from 'lucide-react';

export function ManagementPageHeader({ eyebrow, title, description, actionLabel, onAction, children }) {
  return (
    <div className="management-page-header">
      <div className="page-heading">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="management-header-actions">
        {children}
        {actionLabel && <button className="button primary" type="button" onClick={onAction}><Plus size={18}/>{actionLabel}</button>}
      </div>
    </div>
  );
}
