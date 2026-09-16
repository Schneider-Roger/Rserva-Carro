import { Router } from 'express';
import { managementCrudController as c } from '../controllers/managementCrud.controller.js';
import { requirePermission } from '../middlewares/authz.middleware.js';

export const managementCrudRouter = Router();

managementCrudRouter.get('/centros-custo', requirePermission('CENTRO_CUSTO_VISUALIZAR', 'CENTRO_CUSTO_GERENCIAR', 'GESTAO_DASHBOARD'), c.listCostCenters);
managementCrudRouter.post('/centros-custo', requirePermission('CENTRO_CUSTO_GERENCIAR'), c.createCostCenter);
managementCrudRouter.put('/centros-custo/:id', requirePermission('CENTRO_CUSTO_GERENCIAR'), c.updateCostCenter);
managementCrudRouter.delete('/centros-custo/:id', requirePermission('CENTRO_CUSTO_GERENCIAR'), c.deactivateCostCenter);
managementCrudRouter.get('/abastecimentos', requirePermission('ABASTECIMENTO_VISUALIZAR', 'ABASTECIMENTO_GERENCIAR'), c.listFuelings);
managementCrudRouter.post('/abastecimentos', requirePermission('ABASTECIMENTO_GERENCIAR'), c.createFueling);
managementCrudRouter.delete('/abastecimentos/:id', requirePermission('ABASTECIMENTO_GERENCIAR'), c.cancelFueling);
managementCrudRouter.get('/manutencoes/planos', requirePermission('MANUTENCAO_VISUALIZAR', 'MANUTENCAO_GERENCIAR'), c.listMaintenancePlans);
managementCrudRouter.post('/manutencoes/planos', requirePermission('MANUTENCAO_GERENCIAR'), c.createMaintenancePlan);
managementCrudRouter.put('/manutencoes/planos/:id', requirePermission('MANUTENCAO_GERENCIAR'), c.updateMaintenancePlan);
managementCrudRouter.delete('/manutencoes/planos/:id', requirePermission('MANUTENCAO_GERENCIAR'), c.deactivateMaintenancePlan);
managementCrudRouter.get('/documentos', requirePermission('DOCUMENTO_VISUALIZAR', 'DOCUMENTO_GERENCIAR'), c.listDocuments);
managementCrudRouter.post('/documentos', requirePermission('DOCUMENTO_GERENCIAR'), c.createDocument);
managementCrudRouter.delete('/documentos/:id', requirePermission('DOCUMENTO_GERENCIAR'), c.cancelDocument);
managementCrudRouter.get('/multas', requirePermission('MULTA_VISUALIZAR', 'MULTA_GERENCIAR'), c.listFines);
managementCrudRouter.post('/multas', requirePermission('MULTA_GERENCIAR'), c.createFine);
managementCrudRouter.patch('/multas/:id/status', requirePermission('MULTA_GERENCIAR'), c.updateFineStatus);
