#!/usr/bin/env node

import { Router } from 'express';
import AppController from '../controllers/AppController';

const router = Router();

router.get('/status', async (req, res) => AppController.getStatus(req, res));
router.get('/stats', async (req, res) => AppController.getStats(req, res));

export default router;
