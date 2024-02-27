import { promises as fs } from 'fs';

export const getBufferFromPath = async (path: string): Promise<Buffer> => {
	return await fs.readFile(path);
};
