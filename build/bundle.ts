import { build } from 'esbuild';

const options: Parameters<typeof build>[0] = {
	bundle: true,
	entryPoints: ['src/index.ts'],
	external: ['lzo-ts'],
	minify: true,
	keepNames: true,
	mangleProps: /^\d+$|^read.+$|^getObjectKeysAsNumbers$/,
};

// Platform neutral
await build({
	...options,
	platform: 'neutral',
	inject: ['build/platform_node.ts'],
	outfile: 'dist/index.mjs',
});

// Platform node
await build({
	...options,
	platform: 'node',
	inject: ['build/platform_node.ts'],
	outfile: 'dist/index.js',
});

// Platform browser
await build({
	...options,
	globalName: 'gbx',
	platform: 'browser',
	inject: ['build/platform_browser.ts'],
	outfile: 'dist/gbx.js',
});
