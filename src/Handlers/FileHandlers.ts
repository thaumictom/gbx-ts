import { promises } from 'fs';
import { readFileSync } from 'fs';

export class FileHandlers {
	static async getBufferFromPath(path: string): Promise<Buffer> {
		return await promises.readFile(path);
	}

	static getBufferFromPathSync(path: string): Buffer {
		return readFileSync(path);
	}
}
