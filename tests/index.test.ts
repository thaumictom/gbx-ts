import GBX from '../src/index';
import { Logger } from '../src/Handlers';

import { performance } from 'perf_hooks';
import util from 'util';

import * as assert from 'uvu/assert';
import { test } from 'uvu';

process.env.DEVEL = 'true';

test('TM2020 Map', async () => {
	const t0 = performance.now();

	const file1 = await new GBX({
		// Alive by Keissla
		path: './tests/files/Alive.Map.Gbx',
	}).parse();

	const t1 = performance.now();

	Logger.log(`Time taken: ${t1 - t0}ms`);
	Logger.log(`Result:\n${util.inspect(file1, false, 1, true)}`);
});

// test('TMUF Replay', () => {
// 	new GBX({
// 		// Lavender Town Replay by thaumictom
// 		path: './tests/files/Lavender Town.Replay.Gbx',
// 	}).parse();
// });

test.run();
