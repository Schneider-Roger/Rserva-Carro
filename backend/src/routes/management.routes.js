import { Router } from 'express';
import { getManagementSummary } from '../controllers/management.controller.js';
import { requirePermission } from '../middlewares/authz.middleware.js';

export const managementRouter = Router();
managementRouter.get('/resumo', requirePermission('GESTAO_DASHBOARD'), getManagementSummary);
