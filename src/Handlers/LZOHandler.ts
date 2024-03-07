export default class LZOHandler {
	/**
	 * Compresses data using LZO.
	 * @param data The data to compress.
	 * @returns The compressed data as Buffer.
	 */
	static async compress(data: Array<number>): Promise<Buffer> {
		try {
			// @ts-ignore
			const { LZO } = await import('lzo-ts');
			return LZO.compress(data) as Buffer;
		} catch (error) {
			console.error(error);
			throw new Error('Failed to compress data, is the lzo-ts package installed?');
		}
	}

	/**
	 * Decompresses data using LZO.
	 * @param data The data to decompress.
	 * @returns The decompressed data as Buffer.
	 */
	static async decompress(data: Array<number>): Promise<Buffer> {
		try {
			// @ts-ignore
			const { LZO } = await import('lzo-ts');
			return LZO.decompress(data) as Buffer;
		} catch (error) {
			console.error(error);
			throw new Error('Failed to decompress data, is the lzo-ts package installed?');
		}
	}
}
