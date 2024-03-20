const { LZO } = window['lzoTs'];

let LZOBrowser = {
	compress: (buffer: Uint8Array | number[]): number[] => {
		return LZO.compress(buffer);
	},
	decompress: (buffer: Uint8Array | number[]): number[] => {
		return LZO.decompress(buffer);
	},
};

export { LZOBrowser as LZO };
