export default class LZOHandler {
	/**
	 * Compresses data using LZO.
	 * @param data The data to compress.
	 * @returns The compressed data as Buffer.
	 */
	static async compress(data: Array<number>): Promise<number[]> {
		try {
			const module =
				typeof window === 'undefined' ? await import('lzo-ts') : (window as any)['lzoTs'];

			return module.LZO.compress(data);
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
	static async decompress(data: Array<number>): Promise<number[]> {
		try {
			const module =
				typeof window === 'undefined' ? await import('lzo-ts') : (window as any)['lzoTs'];

			return module.LZO.decompress(data);
		} catch (error) {
			console.error(error);
			throw new Error('Failed to decompress data, is the lzo-ts package installed?');
		}
	}
}
