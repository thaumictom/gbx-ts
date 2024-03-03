import { promises } from 'fs';
import { readFileSync } from 'fs';

/**
 * Handles file operations.
 */
export default class FileHandlers {
	/**
	 * Reads a file and returns its content as a string.
	 * @param path The path to the file to read.
	 * @returns The file content as string.
	 */
	static async getBufferFromPath(path: string): Promise<Buffer> {
		return await promises.readFile(path);
	}

	/**
	 * Reads a file and returns its content as a string.
	 * @param path The path to the file to read.
	 * @returns The file content as string.
	 */
	static getBufferFromPathSync(path: string): Buffer {
		return readFileSync(path);
	}
}
