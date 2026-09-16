import { Router } from 'express';
import { getCities, getStates } from '../controllers/location.controller.js';

export const locationRouter = Router();
locationRouter.get('/estados', getStates);
locationRouter.get('/estados/:estadoId/cidades', getCities);
