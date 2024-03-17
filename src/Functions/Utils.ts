import { CGameCtnChallenge, CGameCtnGhost } from '../Classes/Game';

export namespace Utils {
	/**
	 * Gets amount of checkpoints of a map.
	 * @param gbx GBX of a CGameCtnChallenge.
	 * @returns
	 */
	export function getCheckpointCount(gbx: CGameCtnChallenge | CGameCtnGhost): number | undefined {
		if (gbx instanceof CGameCtnGhost) return gbx.checkpoints?.length || undefined;

		const blocksVersion = gbx.chunks?.[0x0304301f]?.version;

		const linkedCheckpoints = new Set();

		let nbCheckpoints = 0;

		if (blocksVersion >= 6) {
			gbx.blocks?.forEach((block) => {
				const waypoint = block.waypointSpecialProperty;

				if (waypoint?.order === undefined) return;

				if (waypoint?.tag == 'Checkpoint') nbCheckpoints++;

				if (waypoint?.tag == 'LinkedCheckpoint') {
					if (linkedCheckpoints.has(waypoint.order)) return;

					nbCheckpoints++;

					linkedCheckpoints.add(waypoint.order);
				}
			});
		} else return gbx.checkpoints?.length || undefined;

		if (gbx.blocks === undefined) return undefined;

		return nbCheckpoints;
	}

	function getRespawns(
		ghost: CGameCtnGhost
	): { name: string; time: number; value: number; analog: boolean }[] | undefined {
		return ghost.controlEntries?.filter((input) => input?.name == 'Respawn' && input?.value == 1);
	}

	/**
	 * Gets amount of respawns of a ghost.
	 * @param ghost GBX of a CGameCtnGhost.
	 * @returns the amount of respawns.
	 */
	export function getRespawnsCount(ghost: CGameCtnGhost): number | undefined {
		return getRespawns(ghost)?.length;
	}

	/**
	 * Gets the splits of each checkpoint of a ghost.
	 * @param ghost GBX of a CGameCtnGhost.
	 * @returns the splits of each checkpoint.
	 */
	export function getCheckpointTimes(ghost: CGameCtnGhost): number[] | undefined {
		return ghost.checkpoints?.map((checkpoint) => checkpoint.time);
	}

	/**
	 * Gets the amount of respawns per checkpoint of a ghost.
	 * @param ghost GBX of a CGameCtnGhost.
	 * @returns the amount of respawns per checkpoint.
	 */
	export function getRespawnsByCheckpoint(ghost: CGameCtnGhost): number[] | undefined {
		const checkpoints = getCheckpointTimes(ghost);
		const respawns = getRespawns(ghost);

		if (checkpoints === undefined || respawns === undefined) return undefined;

		const respawnsPerCP = checkpoints.map(() => 0);

		let currentCheckpoint = 0;

		for (const respawn of respawns) {
			const cpTime = checkpoints[currentCheckpoint];

			if (respawn.time >= cpTime) {
				currentCheckpoint++;
			}

			respawnsPerCP[currentCheckpoint]++;
		}

		return respawnsPerCP;
	}

	/**
	 * Gets the sector times of a ghost.
	 * @param ghost GBX of a CGameCtnGhost.
	 * @returns the sector times.
	 */
	export function getSectorTimes(ghost: CGameCtnGhost): number[] | undefined {
		const checkpoints = getCheckpointTimes(ghost);

		if (checkpoints === undefined) return undefined;

		return checkpoints.map((checkpoint, index, array) => {
			const lastCheckpoint = array[index - 1] || 0;
			return checkpoint - lastCheckpoint;
		});
	}
}
