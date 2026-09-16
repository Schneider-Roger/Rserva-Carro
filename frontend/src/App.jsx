import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { NewReservationPage } from './pages/NewReservationPage.jsx';
import { MyReservationsPage } from './pages/MyReservationsPage.jsx';
import { FleetAgendaPage } from './pages/FleetAgendaPage.jsx';
import { PolicyPage } from './pages/PolicyPage.jsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.jsx';

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="reservas/nova" element={<NewReservationPage />} />
        <Route path="reservas" element={<MyReservationsPage />} />
        <Route path="agenda" element={<FleetAgendaPage />} />
        <Route path="politica" element={<PolicyPage />} />
        <Route path="admin" element={<AdminDashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
