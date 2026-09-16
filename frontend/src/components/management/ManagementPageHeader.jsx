export function ManagementPageHeader({ eyebrow, title, description, actionLabel, onAction }) {
  return <div className="management-page-header"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{actionLabel && <button className="button primary" onClick={onAction}>{actionLabel}</button>}</div>;
}
