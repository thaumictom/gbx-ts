import { GBX } from '../src/index';

import { test } from 'uvu';
import * as assert from 'uvu/assert';

process.env.DEVEL = 'true';

test('TM2020 Map', async () => {
	new GBX({
		// Alive by Keissla
		path: './tests/files/Alive.Map.Gbx',
	}).parse();
});

// test('TMUF Replay', () => {
// 	new GBX({
// 		// Lavender Town Replay by thaumictom
// 		path: './tests/files/Lavender Town.Replay.Gbx',
// 	}).parse();
// });

test.run();
