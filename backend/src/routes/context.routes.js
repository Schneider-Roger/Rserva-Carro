import { Router } from 'express';
import { getAppContext } from '../controllers/context.controller.js';

export const contextRouter = Router();
contextRouter.get('/', getAppContext);
