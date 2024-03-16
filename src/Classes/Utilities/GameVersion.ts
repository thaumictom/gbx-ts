import Node from '../Node';

/**
 * Class to determine the game version of a node.
 *
 * Rewritten from the [GameVersion class of GBXToolAPI](https://github.com/bigbang1112-cz/gbx-tool-api/blob/ab15dab71310d6458745d9615b8bfcd52567c7aa/Src/GbxToolAPI/GameVersion.cs), originally made by BigBang1112.
 */
export default class GameVersion extends Node {
	private getObjectKeysAsNumbers(obj: any): number[] {
		return Object.keys(obj).map((key) => parseInt(key, 10));
	}

	/**
	 * Checks if node is TM2020. Supports maps, ghosts, and replays.
	 * @returns true or false.
	 */
	public isTM2020(): boolean {
		const chunkList = this.getObjectKeysAsNumbers(this.chunks);

		const map = chunkList.some((chunk) => chunk > 0x03043059 && chunk <= 0x03043fff);
		const ghost = chunkList.some((chunk) => chunk > 0x03092028 && chunk <= 0x03092fff);
		const replay = chunkList.some((chunk) => chunk > 0x03093026 && chunk <= 0x03093fff);

		return map || ghost || replay;
	}

	/**
	 * Checks if node is ManiaPlanet (includes TM2020). Supports maps, ghosts, and replays.
	 * @returns true or false.
	 */
	public isManiaPlanet(): boolean {
		const chunkList = this.getObjectKeysAsNumbers(this.chunks);

		const map = chunkList.some((chunk) => chunk > 0x0304302a && chunk <= 0x03043fff);
		const ghost = chunkList.some((chunk) => chunk > 0x03092019 && chunk <= 0x03092fff);
		const replay = chunkList.some((chunk) => chunk > 0x03093015 && chunk <= 0x03093fff);

		return map || ghost || replay;
	}

	/**
	 * Checks if node is Trackmania Turbo. Supports maps, ghosts, and replays.
	 * @returns true or false.
	 */
	public isTurbo(): boolean {
		const chunkList = this.getObjectKeysAsNumbers(this.chunks);

		const map =
			this.chunks[0x03043040]?.version > 2 &&
			!chunkList.some((chunk) => chunk > 0x03043055 && chunk <= 0x03043fff);
		const ghost =
			chunkList.some((chunk) => chunk == 0x03092000) &&
			!chunkList.some((chunk) => chunk > 0x03092027 && chunk <= 0x03092fff);
		const replay =
			chunkList.some((chunk) => chunk > 0x03093021) &&
			!chunkList.some((chunk) => chunk > 0x03093023 && chunk <= 0x03093fff);

		return map || ghost || replay;
	}

	/**
	 * Checks if node is Trackmania Nations Forever. Supports maps, ghosts, and replays.
	 * @returns true or false.
	 */
	public isTMF(): boolean {
		const chunkList = this.getObjectKeysAsNumbers(this.chunks);

		const map =
			chunkList.some((chunk) => chunk >= 0x03043000) &&
			!chunkList.some((chunk) => chunk > 0x0304302a && chunk <= 0x03043fff);
		const ghost =
			chunkList.some((chunk) => chunk >= 0x03092000) &&
			!chunkList.some((chunk) => chunk > 0x03092019);
		const replay =
			chunkList.some((chunk) => chunk >= 0x03093000) &&
			!chunkList.some((chunk) => chunk > 0x03093015);

		return map || ghost || replay;
	}
}
