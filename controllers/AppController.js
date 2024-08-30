/**
 * AppController class representing the controller for the application.
 */
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

export default AppController;
