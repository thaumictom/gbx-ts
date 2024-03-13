import * as Chunk from '..';

type ChunkType = Exclude<(typeof Chunk)[keyof typeof Chunk], typeof Chunk.GBX>;

export default function getNodeType(classId: number): ChunkType {
	const chunkMap: { [key: number]: ChunkType } = {
		0x0301b000: Chunk.CGameCtnCollectorList,
		0x03043000: Chunk.CGameCtnChallenge,
		0x03059000: Chunk.CGameCtnBlockSkin,
		0x0305b000: Chunk.CGameCtnChallengeParameters,
		0x03078000: Chunk.CGameCtnMediaTrack,
		0x03079000: Chunk.CGameCtnMediaClip,
		0x03092000: Chunk.CGameCtnGhost,
		0x03093000: Chunk.CGameCtnReplayRecord,
		0x0911f000: Chunk.CPlugEntRecordData,
		0x2e009000: Chunk.CGameWaypointSpecialProperty,
	};

	return chunkMap[classId];
}
