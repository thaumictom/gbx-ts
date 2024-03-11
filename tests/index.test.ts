import { GBX, CGameCtnChallenge } from '../src/index';
import { Logger } from '../src/Handlers';

import { performance } from 'perf_hooks';
import { inspect } from 'util';

import * as assert from 'uvu/assert';
import { test } from 'uvu';

process.env.DEVEL = 'true';

test('TM2020 Map', async () => {
	const t0 = performance.now();

	const file1 = await new GBX<CGameCtnChallenge>({
		// Alive by Keissla
		path: './tests/files/Alive.Map.Gbx',
	}).parse();

	const t1 = performance.now();

	Logger.log(`Time taken: ${t1 - t0}ms`);
	Logger.log(`Result:\n${inspect(file1, { maxStringLength: 200, colors: true, depth: 2 })}`);
});

// test('TMUF Replay', () => {
// 	new GBX({
// 		// Lavender Town Replay by thaumictom
// 		path: './tests/files/Lavender Town.Replay.Gbx',
// 	}).parse();
// });

test.run();
