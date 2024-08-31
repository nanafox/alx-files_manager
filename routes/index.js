/**
 * Defines the routes for the application.
 */

import { Router } from 'express';
import AppController from '../controllers/AppController';
import AuthController from '../controllers/AuthController';
import UsersController from '../controllers/UsersController';

const router = Router();

/**
 * Route to get the status of the application.
 * @name GET /status
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
router.get('/status', async (req, res) => AppController.getStatus(req, res));

/**
 * Route to get the statistics of the application.
 * @name GET /stats
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
router.get('/stats', async (req, res) => AppController.getStats(req, res));

/**
 * Route to create a new user.
 * @name POST /users
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
router.post('/users', async (req, res) => UsersController.postNew(req, res));

/**
 * Route to authenticate a user.
 * @name GET /users
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
router.get('/users', async (req, res) => AuthController.getConnect(req, res));

/**
 * Route to invalidate user token and log them out.
 * @name GET /disconnect
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
router.get('/disconnect', async (req, res) => AuthController.getDisconnect(req, res));

/**
 * Route to retrieve the current authenticated user's information.
 *
 * @name GET /users/me
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
router.get('/users/me', async (req, res) => UsersController.getMe(req, res));

export default router;
