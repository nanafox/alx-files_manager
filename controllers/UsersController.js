import { ObjectId } from 'mongodb';
import { hashPassword } from '../utils/auth';

import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
  /**
   * Create a new user.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @returns {Object} JSON response with the new user's ID and email.
   */
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

  /**
   * Retrieve the current user data based on the token.
   * @param {Object} req - The request object.
   * @returns {Object} The user data.
   */
  static async getUserData(req) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const user = await dbClient.db.collection('users').findOne({ _id: ObjectId(userId) });
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Get the current user based on the token and send the response.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   */
  static async getMe(req, res) {
    try {
      const user = await UsersController.getUserData(req);
      return res.status(200).json({ id: user._id, email: user.email });
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  }
}

export default UsersController;
