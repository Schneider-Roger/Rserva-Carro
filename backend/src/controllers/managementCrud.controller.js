import { managementCrudService as service } from '../services/managementCrud.service.js';
import { assertPositiveId } from '../utils/validate.js';

const tenant = (req) => req.tenant.empresaId;
const user = (req) => req.user.id;

export const managementCrudController = {
  async listCostCenters(req, res) { res.json({ data: await service.listCostCenters(tenant(req), req.query) }); },
  async createCostCenter(req, res) { res.status(201).json({ data: await service.createCostCenter(tenant(req), req.body) }); },
  async updateCostCenter(req, res) { const id = assertPositiveId(req.params.id); res.json({ data: await service.updateCostCenter(tenant(req), id, req.body) }); },
  async deactivateCostCenter(req, res) { const id = assertPositiveId(req.params.id); res.json({ data: await service.setCostCenterActive(tenant(req), id, false) }); },

  async listFuelings(req, res) { res.json({ data: await service.listFuelings(tenant(req), req.query) }); },
  async createFueling(req, res) { res.status(201).json({ data: await service.createFueling(tenant(req), user(req), req.body) }); },
  async cancelFueling(req, res) { const id = assertPositiveId(req.params.id); res.json({ data: await service.cancelFueling(tenant(req), user(req), id, req.body) }); },

  async listMaintenancePlans(req, res) { res.json({ data: await service.listMaintenancePlans(tenant(req), req.query) }); },
  async createMaintenancePlan(req, res) { res.status(201).json({ data: await service.createMaintenancePlan(tenant(req), req.body) }); },
  async updateMaintenancePlan(req, res) { const id = assertPositiveId(req.params.id); res.json({ data: await service.updateMaintenancePlan(tenant(req), id, req.body) }); },
  async deactivateMaintenancePlan(req, res) { const id = assertPositiveId(req.params.id); res.json({ data: await service.setMaintenancePlanActive(tenant(req), id, false) }); },

  async listDocuments(req, res) { res.json({ data: await service.listDocuments(tenant(req), req.query) }); },
  async createDocument(req, res) { res.status(201).json({ data: await service.createDocument(tenant(req), user(req), req.body) }); },
  async cancelDocument(req, res) { const id = assertPositiveId(req.params.id); res.json({ data: await service.cancelDocument(tenant(req), id, req.body) }); },

  async listFines(req, res) { res.json({ data: await service.listFines(tenant(req), req.query) }); },
  async createFine(req, res) { res.status(201).json({ data: await service.createFine(tenant(req), user(req), req.body) }); },
  async updateFineStatus(req, res) { const id = assertPositiveId(req.params.id); res.json({ data: await service.updateFineStatus(tenant(req), id, req.body) }); },
};
