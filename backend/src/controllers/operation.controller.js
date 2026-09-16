import { assertPositiveId } from '../utils/validate.js';import * as service from '../services/operation.service.js';
export async function available(req,res){res.json({data:await service.listAvailable(req)})}
export async function withdraw(req,res){res.status(201).json({data:await service.withdraw(req)})}
export async function returnVehicle(req,res){res.json({data:await service.returnOperation(req,assertPositiveId(req.params.id))})}
