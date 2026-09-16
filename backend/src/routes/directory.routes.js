import { Router } from 'express';
import { getDrivers, getUsers } from '../controllers/directory.controller.js';
import { requirePermission } from '../middlewares/authz.middleware.js';

export const directoryRouter = Router();

directoryRouter.get('/usuarios', requirePermission('USUARIO_VISUALIZAR', 'USUARIO_GERENCIAR', 'ABASTECIMENTO_GERENCIAR', 'DOCUMENTO_GERENCIAR', 'MULTA_GERENCIAR'), getUsers);
directoryRouter.get('/motoristas', requirePermission('RESERVA_CRIAR', 'RESERVA_CRIAR_PARA_OUTRO', 'ABASTECIMENTO_GERENCIAR', 'MULTA_GERENCIAR'), getDrivers);
