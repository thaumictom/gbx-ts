export class LZO {
	static compress(data: Buffer | number[]): Buffer {
		try {
			return require('lzo').compress(data);
		} catch (error) {
			console.error(error);
			throw new Error('LZO compression failed, is the library installed?');
		}
	}

	static decompress(data: Buffer | number[]): Buffer {
		try {
			return require('lzo').decompress(data);
		} catch (error) {
			console.error(error);
			throw new Error('LZO decompression failed, is the library installed?');
		}
	}
}
