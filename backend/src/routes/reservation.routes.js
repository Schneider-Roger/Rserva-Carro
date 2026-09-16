import { Router } from 'express';
import * as c from '../controllers/reservation.controller.js';
import { requirePermission } from '../middlewares/authz.middleware.js';

export const reservationRouter = Router();
reservationRouter.post('/', requirePermission('RESERVA_CRIAR', 'RESERVA_CRIAR_PARA_OUTRO'), c.create);
reservationRouter.get('/minhas', requirePermission('RESERVA_VISUALIZAR_PROPRIA', 'RESERVA_VISUALIZAR_TODAS'), c.mine);
reservationRouter.get('/equipe', requirePermission('RESERVA_VISUALIZAR_EQUIPE', 'RESERVA_VISUALIZAR_TODAS'), c.team);
reservationRouter.get('/', requirePermission('RESERVA_VISUALIZAR_TODAS'), c.all);
reservationRouter.get('/:id', requirePermission('RESERVA_VISUALIZAR_PROPRIA', 'RESERVA_VISUALIZAR_EQUIPE', 'RESERVA_VISUALIZAR_TODAS'), c.getOne);
reservationRouter.put('/:id', requirePermission('RESERVA_EDITAR_PROPRIA', 'RESERVA_EDITAR_TODAS'), c.update);
reservationRouter.post('/:id/cancelamento', requirePermission('RESERVA_CANCELAR_PROPRIA', 'RESERVA_CANCELAR_TODAS'), c.cancel);
