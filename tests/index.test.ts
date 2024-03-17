import { GBX, CGameCtnChallenge } from '../src/index';
import { Logger } from '../src/Handlers';

import { performance } from 'perf_hooks';
import { inspect } from 'util';
import { promises } from 'fs';

import { test } from 'uvu';

process.env.DEVEL = 'true';

test('TM2020 Map', async () => {
	const file1 = await promises.readFile('./tests/files/Alive.Map.Gbx');

	const t0 = performance.now();

	const result = await new GBX<CGameCtnChallenge>(file1).parse();

	const t1 = performance.now();

	Logger.log(`Time taken: ${t1 - t0}ms`);
	Logger.log(
		`Result:\n${inspect(result, {
			maxStringLength: 200,
			maxArrayLength: 10,
			colors: true,
			depth: 2,
		})}`
	);
});

test.run();
