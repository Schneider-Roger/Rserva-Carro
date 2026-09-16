import { Router } from 'express';
import { getAvailableVehicles } from '../controllers/vehicle.controller.js';

export const vehicleRouter = Router();

vehicleRouter.get('/disponiveis', getAvailableVehicles);
