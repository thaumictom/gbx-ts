interface IOptions {
	path?: string;
	stream?: number[] | Buffer;
}

interface IHeaderChunks {
	chunkId: number;
	chunkSize: number;
	chunkData?: number[];
	isHeavy: boolean;
}

interface ICollectionList {
	[key: number]: string;
}

interface IMeta {
	id: string;
	collection: string;
	author: string;
}

interface Chunk {
	r: import('./Handlers').DataStream;
	fullChunkId: number;
	isHeaderChunk: boolean;
	length: number;
}

interface ChunkFunctions {
	readVersion<T>(version: T): T;
	readUnknown<T>(unknown: T): T;
}

type Chunks = { [x: number]: boolean };
type Unknowns = { [x: number]: any[] };
type Versions = { [x: number]: number };

declare enum MapKind {
	EndMarker,
	Campaign,
	Puzzle,
	Retro,
	TimeAttack,
	Rounds,
	InProgress,
	Campaign_7,
	Multi,
	Solo,
	Site,
	SoloNadeo,
	MultiNadeo,
}

declare enum PlayMode {
	Race,
	Platform,
	Puzzle,
	Crazy,
	Shortcut,
	Stunts,
	Script,
}

declare enum EditorMode {
	Advanced,
	Simple,
	HasGhostBlocks,
	Gamepad = 4,
}

interface Int2 {
	x: number;
	y: number;
}

interface Int3 {
	x: number;
	y: number;
	z: number;
}

interface Vector2 {
	x: number;
	y: number;
}

interface Vector3 {
	x: number;
	y: number;
	z: number;
}

interface Byte3 {
	x: number;
	y: number;
	z: number;
}

declare enum Direction {
	North, // +X
	East, // -X
	South, // -Z
	West, // +X
}
