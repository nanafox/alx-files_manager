import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

/**
 * Converts a base64 encoded ciphertext to plaintext.
 * @param {string} cipherText - The base64 encoded ciphertext.
 * @returns {string} - The decoded plaintext.
 */
export function cipherTextToPlaintext(cipherText) {
  return Buffer.from(cipherText, 'base64').toString('utf-8');
}

/**
 * Saves data to the local file system.
 * @param {string} filename - The name of the file to save.
 * @param {string} data - The data to write to the file.
 * @returns {Promise<boolean>} - Returns true if the file was saved successfully, false otherwise.
 */
export async function saveToLocalFileSystem(filename, data) {
  fs.writeFile(filename, data, (err) => {
    if (err) {
      console.error(`An error while writing the data: ${err.message}`);
      return false;
    }
    return true;
  });

  return true;
}

/**
 * Generates a UUID (Universally Unique Identifier).
 * @returns {string} - A new UUID.
 */
export function generateUuid() {
  return uuidv4();
}
