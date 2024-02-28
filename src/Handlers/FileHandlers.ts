import { promises as fs } from 'fs';

export class FileHandlers {
	static async getBufferFromPath(path: string): Promise<Buffer> {
		return await fs.readFile(path);
	}
}
