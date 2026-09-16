import { Router } from 'express';
import { getManagementSummary } from '../controllers/management.controller.js';

export const managementRouter = Router();
managementRouter.get('/resumo', getManagementSummary);
