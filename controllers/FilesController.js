/* eslint-disable */

import fs from 'fs';
import { ObjectId } from "mongodb";
import dbClient from '../utils/db';
import HTTPError from '../utils/httpErrors';
// noinspection ES6PreferShortImport
import { cipherTextToPlaintext, generateUuid, saveToLocalFileSystem } from '../utils/misc';
import UsersController from './UsersController';

/**
 * Controller for handling file-related operations.
 */
export default class FilesController {
  constructor() {
    this.folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    this.acceptedFileTypes = ['folder', 'file', 'image'];

    // Create the folder if it does not exist
    if (!fs.existsSync(this.folderPath)) {
      fs.mkdirSync(this.folderPath, { recursive: true });
    }
  }

  /**
   * Handles the file upload request.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Promise<Object>} - HTTP response.
   */
  static async postUpload(req, res) {
    try {
      const dbUser = await UsersController.getUserData(req);
      const instance = new FilesController();

      // eslint-disable no-underscore-dangle
      const validationError = await instance.#validateRequest(req, res);
      if (validationError) {
        return validationError;
      }

      const {
        name, type, parentId, isPublic, data,
      } = req.body;

      if (type === 'folder') {
        return instance.#createFolder(dbUser, name, type, isPublic, parentId, res);
      }

      return instance.#processAndSaveFile(dbUser, name, type, isPublic, parentId, data, res);
    } catch (error) {
      return HTTPError.unauthorized(res);
    }
  }

  /**
   * Validates the upload request.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Promise<Object|null>} - HTTP error response or null if valid.
   */
  async #validateRequest(req, res) {
    if (!req.body.name) {
      return HTTPError.badRequest(res, 'Missing name');
    }

    const { type, parentId, data } = req.body;

    if (!type || !this.acceptedFileTypes.includes(type)) {
      return HTTPError.badRequest(res, 'Missing type');
    }

    if (parentId) {
      const dbParent = await dbClient.db.collection('files').findOne({ _id: ObjectId(parentId) });
      if (!dbParent) {
        return HTTPError.badRequest(res, 'Parent not found');
      }

      if (dbParent.type !== 'folder') {
        return HTTPError.badRequest(res, 'Parent is not a folder');
      }
    } else {
      req.body.parentId = 0; // parentId defaults to 0 if not set in the request body
    }

    if (type !== 'folder' && !data) { // data must be provided for images and files
      return HTTPError.badRequest(res, 'Missing data');
    }

    return null;
  }

  /**
   * Creates a new folder in the database.
   * @param {Object} dbUser - User data from the database.
   * @param {string} name - Name of the folder.
   * @param {string} type - Type of the file (should be 'folder').
   * @param {boolean} isPublic - Whether the folder is public.
   * @param {number} parentId - ID of the parent folder.
   * @param {Object} res - Express response object.
   * @returns {Promise<Object>} - HTTP response.
   */
  async #createFolder(dbUser, name, type, isPublic, parentId, res) {
    try {
      const dbDir = await dbClient.db.collection('files').insertOne({
        userId: dbUser._id,
        name,
        type,
        isPublic,
        parentId,
      });

      return res.status(201).json({
        id: dbDir.insertedId,
        userId: dbUser._id,
        name,
        type,
        isPublic,
        parentId,
      });
    } catch (error) {
      return HTTPError.internalServerError(res);
    }
  }

  /**
   * Processes and saves a file to the local file system.
   * @param {Object} dbUser - User data from the database.
   * @param {string} name - Name of the file.
   * @param {string} type - Type of the file.
   * @param {boolean} isPublic - Whether the file is public.
   * @param {number} parentId - ID of the parent folder.
   * @param {string} data - File data.
   * @param {Object} res - Express response object.
   * @returns {Promise<Object>} - HTTP response.
   */
  async #processAndSaveFile(dbUser, name, type, isPublic, parentId, data, res) {
    const fileData = cipherTextToPlaintext(data);
    const filePath = `${this.folderPath}/${generateUuid()}`;

    if (!await saveToLocalFileSystem(`${filePath}`, fileData)) {
      return HTTPError.internalServerError(res);
    }

    return this.#insertFileRecord(dbUser, name, type, isPublic, parentId, filePath, res);
  }

  /**
   * Inserts a file record into the database.
   * @param {Object} dbUser - User data from the database.
   * @param {string} name - Name of the file.
   * @param {string} type - Type of the file.
   * @param {boolean} isPublic - Whether the file is public.
   * @param {number} parentId - ID of the parent folder.
   * @param {string} filePath - Path to the file on the local file system.
   * @param {Object} res - Express response object.
   * @returns {Promise<Object>} - HTTP response.
   */
  async #insertFileRecord(dbUser, name, type, isPublic, parentId, filePath, res) {
    try {
      const dbFile = await dbClient.db.collection('files').insertOne({
        userId: dbUser._id,
        name,
        type,
        isPublic: isPublic || false,
        parentId,
        localPath: filePath,
      });

      return res.status(201).json({
        id: dbFile.insertedId,
        userId: dbUser._id,
        name,
        type,
        isPublic,
        parentId,
      });
    } catch (error) {
      console.error(`Error: ${error.message}`);
      return HTTPError.internalServerError(res);
    }
  }
}
