/**
 * AppController class representing the controller for the application.
 */
import { hashPassword } from '../utils/auth';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

/**
 * AppController class to handle application status and statistics.
 */
class AppController {
  /**
   * Get the status of Redis and the database.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Object} JSON response with the status of Redis and the database.
   */
  static getStatus(req, res) {
    try {
      return res.status(200).json({ redis: redisClient.isAlive(), db: dbClient.isAlive() });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Get the number of users and files in the database.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Promise<Object>} JSON response with the number of users and files.
   */
  static async getStats(req, res) {
    try {
      return res
        .status(200)
        .json({ users: await dbClient.nbUsers(), files: await dbClient.nbFiles() });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

class UsersController {
  static async postNew(req, res) {
    const { email } = req.body;
    const { password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const dbUser = await dbClient.db.collection('users').findOne({ email });
    if (dbUser) {
      return res.status(400).json({ error: 'Already exist' });
    }

    try {
      const hashedPassword = hashPassword(password);
      const newUser = await dbClient.db
        .collection('users')
        .insertOne({ email, password: hashedPassword });
      return res.status(201).json({ id: newUser.insertedId, email });
    } catch (error) {
      return res.status(500).json({ error: 'An error occurred while creating new user' });
    }
  }
}

export { AppController, UsersController };
