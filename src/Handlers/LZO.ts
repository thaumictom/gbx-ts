import Logger from './Logger';

/**
 * Handles LZO compression and decompression, using the lzo library.
 */
export default class LZO {
	/**
	 * Compresses data using LZO.
	 * @param data The data to compress.
	 * @returns The compressed data as Buffer.
	 */
	static compress(data: Buffer | number[]): Buffer {
		try {
			return require('lzo').compress(data);
		} catch (error) {
			throw Logger.error('LZO compression failed, is the library installed?');
		}
	}

	/**
	 * Decompresses data using LZO.
	 * @param data The data to decompress.
	 * @returns The decompressed data as Buffer.
	 */
	static decompress(data: Buffer | number[]): Buffer {
		try {
			return require('lzo').decompress(data);
		} catch (error) {
			throw Logger.error('LZO decompression failed, is the library installed?');
		}
	}
}
