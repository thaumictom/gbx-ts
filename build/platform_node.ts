let LZONode = {
	compress: async (buffer: Uint8Array | number[]): Promise<number[]> => {
		const { LZO } = await import('lzo-ts');
		return LZO.compress(buffer);
	},
	decompress: async (buffer: Uint8Array | number[]): Promise<number[]> => {
		const { LZO } = await import('lzo-ts');
		return LZO.decompress(buffer);
	},
};

export { LZONode as LZO };
