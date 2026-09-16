import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Bell, CalendarDays, CarFront, ClipboardCheck, Home, LayoutDashboard, Menu, PlusCircle, ShieldCheck, X } from 'lucide-react';
import { currentUser } from '../data/mockData.js';
import { isMockMode } from '../services/api.js';

const navItems = [
  { to: '/', label: 'Início', icon: Home, end: true },
  { to: '/reservas/nova', label: 'Nova reserva', icon: PlusCircle },
  { to: '/reservas', label: 'Minhas reservas', icon: CalendarDays },
  { to: '/operacao', label: 'Retirada / devolução', icon: ClipboardCheck },
  { to: '/agenda', label: 'Agenda da frota', icon: CarFront },
  { to: '/politica', label: 'Política de uso', icon: ShieldCheck },
];

export function AppShell() {
  const [open, setOpen] = useState(false);
  const isAdmin = currentUser.roles.some((role) => ['ADMIN', 'FROTA'].includes(role));

  return (
    <div className="app-shell">
      {open && <button className="sidebar-backdrop" aria-label="Fechar menu" onClick={() => setOpen(false)} />}
      <aside className={`sidebar ${open ? 'is-open' : ''}`}>
        <div className="brand-row">
          <div className="brand-mark">FL</div>
          <div><strong>Frota Leve</strong><span>Plataforma corporativa</span></div>
          <button className="icon-button mobile-only" aria-label="Fechar menu" onClick={() => setOpen(false)}><X size={20} /></button>
        </div>
        <nav className="sidebar-nav" aria-label="Navegação principal">
          <span className="nav-section-label">Operação</span>
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={19} strokeWidth={1.9} /><span>{label}</span>
            </NavLink>
          ))}
          {isAdmin && <><span className="nav-section-label admin-label">Administração</span><NavLink to="/admin" onClick={() => setOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><LayoutDashboard size={19} strokeWidth={1.9}/><span>Dashboard</span></NavLink></>}
        </nav>
        <div className="sidebar-footer">Versão 0.2 · Produto SaaS</div>
      </aside>
      <div className="app-column">
        <header className="topbar">
          <button className="icon-button mobile-only" aria-label="Abrir menu" onClick={() => setOpen(true)}><Menu size={22}/></button>
          <div className="topbar-spacer"/>
          {isMockMode && <span className="prototype-pill">Dados de demonstração</span>}
          <button className="icon-button" aria-label="Notificações"><Bell size={20}/></button>
          <div className="user-chip"><div className="avatar">RS</div><div><strong>{currentUser.name}</strong><span>{currentUser.unit}</span></div></div>
        </header>
        <main className="main-content"><Outlet/></main>
      </div>
    </div>
  );
}
