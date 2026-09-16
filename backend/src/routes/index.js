import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { vehicleRouter } from './vehicle.routes.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/veiculos', vehicleRouter);
