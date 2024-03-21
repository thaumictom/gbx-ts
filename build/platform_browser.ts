let LZOBrowser = {
	compress: (buffer: Uint8Array | number[]): number[] => {
		return window['lzoTs'].LZO.compress(buffer);
	},
	decompress: (buffer: Uint8Array | number[]): number[] => {
		return window['lzoTs'].LZO.decompress(buffer);
	},
};

export { LZOBrowser as LZO };
