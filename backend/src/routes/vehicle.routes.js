import { Router } from 'express';
import { getAvailableVehicles, getVehicles } from '../controllers/vehicle.controller.js';
import { requirePermission } from '../middlewares/authz.middleware.js';

export const vehicleRouter = Router();

vehicleRouter.get('/', requirePermission('VEICULO_VISUALIZAR', 'VEICULO_EDITAR', 'VEICULO_CRIAR'), getVehicles);
vehicleRouter.get('/disponiveis', getAvailableVehicles);
