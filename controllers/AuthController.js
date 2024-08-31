import { v4 as uuidv4 } from 'uuid';
// noinspection ES6PreferShortImport
import { verifyPassword } from '../utils/auth';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import UsersController from './UsersController';

class AuthController {
  /**
   * Authenticate a user and generate a token.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Object} JSON response with the authentication token.
   */
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization || '';
    const authCredentials = authHeader.split(' ')[1] || '';

    // Decode the credentials
    const [email, password] = Buffer.from(authCredentials, 'base64').toString().split(':');
    const dbUser = await dbClient.db.collection('users').findOne({ email });
    if (!dbUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!verifyPassword(password, dbUser.password)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = uuidv4();
    await redisClient.set(`auth_${token}`, dbUser._id.toString(), 86400); // cache for 24 hours

    return res.status(200).json({ token });
  }

  /**
   * Disconnect a user by invalidating the token.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Object} JSON response with a message.
   */
  static async getDisconnect(req, res) {
    try {
      await UsersController.getUserData(req);

      const apiKey = `auth_${req.headers['x-token']}`;

      return redisClient
        .del(apiKey)
        .then(() => res.status(204).send())
        .catch(() => res.status(500)
          .json({ error: 'An error occurred while invalidating API key' }));
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  }
}

export default AuthController;
