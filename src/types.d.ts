interface IOptions {
	path?: string;
	stream?: number[] | Buffer;
	type?: any;
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

declare type Chunk = {
	r: import('./Handlers').DataStream;
	fullChunkId?: number;
	isHeaderChunk?: boolean;
};
