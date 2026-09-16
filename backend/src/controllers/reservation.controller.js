import * as service from '../services/reservation.service.js';
import { assertPositiveId } from '../utils/validate.js';

export async function create(req, res) { res.status(201).json({ data: await service.createReservation(req) }); }
export async function mine(req, res) { res.json({ data: await service.getMyReservations(req) }); }
export async function team(req, res) { res.json({ data: await service.getTeamReservations(req) }); }
export async function all(req, res) { res.json({ data: await service.getAllReservations(req) }); }
export async function getOne(req, res) { res.json({ data: await service.getReservation(req, assertPositiveId(req.params.id)) }); }
export async function update(req, res) { res.json({ data: await service.updateReservation(req, assertPositiveId(req.params.id)) }); }
export async function cancel(req, res) { res.json({ data: await service.cancelReservation(req, assertPositiveId(req.params.id)) }); }
