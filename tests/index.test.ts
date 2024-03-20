import { GBX, CGameCtnChallenge } from '../dist';

import { performance } from 'perf_hooks';
import { inspect } from 'util';
import { promises } from 'fs';

import { test } from 'uvu';

test('TM2020 Map', async () => {
	const file1 = await promises.readFile('./tests/files/Alive.Map.Gbx');

	const t0 = performance.now();

	const result = await new GBX<CGameCtnChallenge>(file1, 3).parse();

	const t1 = performance.now();

	console.log(`Time taken: ${t1 - t0}ms`);
	console.log(
		`Result:\n${inspect(result, {
			maxStringLength: 200,
			maxArrayLength: 10,
			colors: true,
			depth: 2,
		})}`
	);
});

test.run();
