import * as Game from '../Classes/Game';
import * as Plug from '../Classes/Plug';

type ChunkType = (typeof Game)[keyof typeof Game] | (typeof Plug)[keyof typeof Plug];

export default function getNodeType(classId: number): ChunkType {
	const chunkMap: { [key: number]: ChunkType } = {
		0x0301b000: Game.CGameCtnCollectorList,
		0x03043000: Game.CGameCtnChallenge,
		0x03059000: Game.CGameCtnBlockSkin,
		0x0305b000: Game.CGameCtnChallengeParameters,
		0x03078000: Game.CGameCtnMediaTrack,
		0x03079000: Game.CGameCtnMediaClip,
		0x03092000: Game.CGameCtnGhost,
		0x03093000: Game.CGameCtnReplayRecord,
		0x0911f000: Plug.CPlugEntRecordData,
		0x2e009000: Game.CGameWaypointSpecialProperty,
	};

	return chunkMap[classId];
}
