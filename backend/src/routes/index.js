import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { vehicleRouter } from './vehicle.routes.js';
import { managementRouter } from './management.routes.js';
import { managementCrudRouter } from './managementCrud.routes.js';
import { directoryRouter } from './directory.routes.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/veiculos', vehicleRouter);
apiRouter.use('/gestao', managementRouter);
apiRouter.use('/', directoryRouter);
apiRouter.use('/', managementCrudRouter);
