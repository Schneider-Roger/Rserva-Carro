import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { NewReservationPage } from './pages/NewReservationPage.jsx';
import { MyReservationsPage } from './pages/MyReservationsPage.jsx';
import { FleetAgendaPage } from './pages/FleetAgendaPage.jsx';
import { PolicyPage } from './pages/PolicyPage.jsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.jsx';
import { OperationsPage } from './pages/OperationsPage.jsx';
import { ManagementDashboardPage } from './pages/ManagementDashboardPage.jsx';
import { FuelingPage } from './pages/FuelingPage.jsx';
import { CostCentersPage } from './pages/CostCentersPage.jsx';
import { PreventiveMaintenancePage } from './pages/PreventiveMaintenancePage.jsx';
import { DocumentsPage } from './pages/DocumentsPage.jsx';
import { FinesPage } from './pages/FinesPage.jsx';

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="reservas/nova" element={<NewReservationPage />} />
        <Route path="reservas" element={<MyReservationsPage />} />
        <Route path="operacao" element={<OperationsPage />} />
        <Route path="agenda" element={<FleetAgendaPage />} />
        <Route path="politica" element={<PolicyPage />} />
        <Route path="admin" element={<AdminDashboardPage />} />
        <Route path="gestao" element={<ManagementDashboardPage />} />
        <Route path="gestao/abastecimentos" element={<FuelingPage />} />
        <Route path="gestao/centros-custo" element={<CostCentersPage />} />
        <Route path="gestao/manutencoes" element={<PreventiveMaintenancePage />} />
        <Route path="gestao/documentos" element={<DocumentsPage />} />
        <Route path="gestao/multas" element={<FinesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
